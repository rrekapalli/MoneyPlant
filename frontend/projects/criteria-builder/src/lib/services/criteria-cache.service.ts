import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, timer, EMPTY } from 'rxjs';
import { 
  map, 
  tap, 
  catchError, 
  shareReplay, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap,
  filter,
  take
} from 'rxjs/operators';

import { 
  FieldMetaResp,
  OperatorMetaResp,
  FunctionMetaResp,
  FunctionSignatureResp,
  FieldSuggestionResp
} from '../interfaces/field-metadata.interface';

import {
  ValidationResult,
  SqlGenerationResult,
  CriteriaPreviewResult
} from '../interfaces/validation.interface';

import { CriteriaDSL } from '../interfaces/criteria-dsl.interface';

/**
 * LRU Cache implementation for efficient data storage
 */
class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; accessCount: number }>();
  private accessOrder: string[] = [];

  constructor(
    private maxSize: number = 100,
    private ttlMs: number = 5 * 60 * 1000 // 5 minutes default TTL
  ) {}

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.delete(key);
      return null;
    }

    // Update access order
    this.updateAccessOrder(key);
    item.accessCount++;
    
    return item.value;
  }

  set(key: string, value: T): void {
    // Remove existing item if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Ensure cache doesn't exceed max size
    while (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    // Add new item
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    });
    this.accessOrder.push(key);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    const totalAccess = Array.from(this.cache.values()).reduce((sum, item) => sum + item.accessCount, 0);
    const hitRate = totalAccess > 0 ? (this.cache.size / totalAccess) : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate
    };
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
  }

  private evictLeastRecentlyUsed(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.shift()!;
      this.cache.delete(lruKey);
    }
  }
}

/**
 * Debounced validation request manager
 */
interface ValidationRequest {
  criteria: CriteriaDSL | Partial<CriteriaDSL>;
  isPartial: boolean;
  timestamp: number;
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Maximum number of items in each cache */
  maxCacheSize?: number;
  
  /** Time-to-live for cached items in milliseconds */
  ttlMs?: number;
  
  /** Debounce time for validation requests in milliseconds */
  validationDebounceMs?: number;
  
  /** Whether to enable cache statistics */
  enableStats?: boolean;
  
  /** Whether to enable automatic cache cleanup */
  enableAutoCleanup?: boolean;
  
  /** Cleanup interval in milliseconds */
  cleanupIntervalMs?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  fields: { size: number; maxSize: number; hitRate: number };
  functions: { size: number; maxSize: number; hitRate: number };
  operators: { size: number; maxSize: number; hitRate: number };
  signatures: { size: number; maxSize: number; hitRate: number };
  suggestions: { size: number; maxSize: number; hitRate: number };
  validation: { size: number; maxSize: number; hitRate: number };
  sql: { size: number; maxSize: number; hitRate: number };
  preview: { size: number; maxSize: number; hitRate: number };
}

/**
 * Comprehensive caching service for criteria builder operations
 * Implements LRU caching, cache invalidation, and debounced validation
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaCacheService {
  private readonly config: Required<CacheConfig>;
  
  // LRU Caches for different data types
  private fieldsCache!: LRUCache<FieldMetaResp[]>;
  private functionsCache!: LRUCache<FunctionMetaResp[]>;
  private operatorsCache!: LRUCache<OperatorMetaResp[]>;
  private signaturesCache!: LRUCache<FunctionSignatureResp>;
  private suggestionsCache!: LRUCache<FieldSuggestionResp[]>;
  private validationCache!: LRUCache<ValidationResult>;
  private sqlCache!: LRUCache<SqlGenerationResult>;
  private previewCache!: LRUCache<CriteriaPreviewResult>;
  
  // Subjects for reactive caching
  private fieldsSubject = new BehaviorSubject<FieldMetaResp[] | null>(null);
  private functionsSubject = new BehaviorSubject<FunctionMetaResp[] | null>(null);
  
  // Debounced validation subject
  private validationSubject = new BehaviorSubject<ValidationRequest | null>(null);
  
  // Cache invalidation tracking
  private lastFieldsUpdate = 0;
  private lastFunctionsUpdate = 0;
  
  // Cleanup timer
  private cleanupTimer?: any;

  constructor() {
    this.config = {
      maxCacheSize: 100,
      ttlMs: 5 * 60 * 1000, // 5 minutes
      validationDebounceMs: 300, // 300ms debounce
      enableStats: true,
      enableAutoCleanup: true,
      cleanupIntervalMs: 60 * 1000 // 1 minute cleanup interval
    };

    this.initializeCaches();
    this.setupValidationDebouncing();
    this.setupAutoCleanup();
  }

  /**
   * Configure cache settings
   */
  configure(config: Partial<CacheConfig>): void {
    Object.assign(this.config, config);
    this.initializeCaches();
  }

  // Field Caching Operations

  /**
   * Get cached fields or return null if not cached
   */
  getCachedFields(): FieldMetaResp[] | null {
    return this.fieldsCache.get('all');
  }

  /**
   * Cache fields data
   */
  cacheFields(fields: FieldMetaResp[]): void {
    this.fieldsCache.set('all', fields);
    this.fieldsSubject.next(fields);
    this.lastFieldsUpdate = Date.now();
  }

  /**
   * Get fields as observable with caching
   */
  getFieldsObservable(): Observable<FieldMetaResp[] | null> {
    return this.fieldsSubject.asObservable();
  }

  /**
   * Get cached fields by category
   */
  getCachedFieldsByCategory(category: string): FieldMetaResp[] | null {
    return this.fieldsCache.get(`category:${category}`);
  }

  /**
   * Cache fields by category
   */
  cacheFieldsByCategory(category: string, fields: FieldMetaResp[]): void {
    this.fieldsCache.set(`category:${category}`, fields);
  }

  // Function Caching Operations

  /**
   * Get cached functions or return null if not cached
   */
  getCachedFunctions(): FunctionMetaResp[] | null {
    return this.functionsCache.get('all');
  }

  /**
   * Cache functions data
   */
  cacheFunctions(functions: FunctionMetaResp[]): void {
    this.functionsCache.set('all', functions);
    this.functionsSubject.next(functions);
    this.lastFunctionsUpdate = Date.now();
  }

  /**
   * Get functions as observable with caching
   */
  getFunctionsObservable(): Observable<FunctionMetaResp[] | null> {
    return this.functionsSubject.asObservable();
  }

  /**
   * Get cached functions by category
   */
  getCachedFunctionsByCategory(category: string): FunctionMetaResp[] | null {
    return this.functionsCache.get(`category:${category}`);
  }

  /**
   * Cache functions by category
   */
  cacheFunctionsByCategory(category: string, functions: FunctionMetaResp[]): void {
    this.functionsCache.set(`category:${category}`, functions);
  }

  // Operator Caching Operations

  /**
   * Get cached operators for field
   */
  getCachedOperators(fieldId: string): OperatorMetaResp[] | null {
    return this.operatorsCache.get(fieldId);
  }

  /**
   * Cache operators for field
   */
  cacheOperators(fieldId: string, operators: OperatorMetaResp[]): void {
    this.operatorsCache.set(fieldId, operators);
  }

  // Function Signature Caching Operations

  /**
   * Get cached function signature
   */
  getCachedSignature(functionId: string): FunctionSignatureResp | null {
    return this.signaturesCache.get(functionId);
  }

  /**
   * Cache function signature
   */
  cacheSignature(functionId: string, signature: FunctionSignatureResp): void {
    this.signaturesCache.set(functionId, signature);
  }

  // Field Suggestions Caching Operations

  /**
   * Get cached field suggestions
   */
  getCachedSuggestions(fieldId: string, query?: string): FieldSuggestionResp[] | null {
    const key = query ? `${fieldId}:${query}` : fieldId;
    return this.suggestionsCache.get(key);
  }

  /**
   * Cache field suggestions
   */
  cacheSuggestions(fieldId: string, suggestions: FieldSuggestionResp[], query?: string): void {
    const key = query ? `${fieldId}:${query}` : fieldId;
    this.suggestionsCache.set(key, suggestions);
  }

  // Validation Caching Operations

  /**
   * Get cached validation result
   */
  getCachedValidation(criteria: CriteriaDSL | Partial<CriteriaDSL>): ValidationResult | null {
    const key = this.generateCriteriaKey(criteria);
    return this.validationCache.get(key);
  }

  /**
   * Cache validation result
   */
  cacheValidation(criteria: CriteriaDSL | Partial<CriteriaDSL>, result: ValidationResult): void {
    const key = this.generateCriteriaKey(criteria);
    this.validationCache.set(key, result);
  }

  /**
   * Request debounced validation
   */
  requestValidation(criteria: CriteriaDSL | Partial<CriteriaDSL>, isPartial: boolean = false): void {
    this.validationSubject.next({
      criteria,
      isPartial,
      timestamp: Date.now()
    });
  }

  /**
   * Get debounced validation observable
   */
  getDebouncedValidation(): Observable<ValidationRequest> {
    return this.validationSubject.pipe(
      filter(request => request !== null),
      debounceTime(this.config.validationDebounceMs),
      distinctUntilChanged((prev, curr) => 
        this.generateCriteriaKey(prev.criteria) === this.generateCriteriaKey(curr.criteria)
      )
    ) as Observable<ValidationRequest>;
  }

  // SQL Generation Caching Operations

  /**
   * Get cached SQL generation result
   */
  getCachedSql(criteria: CriteriaDSL): SqlGenerationResult | null {
    const key = this.generateCriteriaKey(criteria);
    return this.sqlCache.get(key);
  }

  /**
   * Cache SQL generation result
   */
  cacheSql(criteria: CriteriaDSL, result: SqlGenerationResult): void {
    const key = this.generateCriteriaKey(criteria);
    this.sqlCache.set(key, result);
  }

  // Preview Caching Operations

  /**
   * Get cached criteria preview
   */
  getCachedPreview(criteria: CriteriaDSL): CriteriaPreviewResult | null {
    const key = this.generateCriteriaKey(criteria);
    return this.previewCache.get(key);
  }

  /**
   * Cache criteria preview
   */
  cachePreview(criteria: CriteriaDSL, result: CriteriaPreviewResult): void {
    const key = this.generateCriteriaKey(criteria);
    this.previewCache.set(key, result);
  }

  // Cache Management Operations

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.fieldsCache.clear();
    this.functionsCache.clear();
    this.operatorsCache.clear();
    this.signaturesCache.clear();
    this.suggestionsCache.clear();
    this.validationCache.clear();
    this.sqlCache.clear();
    this.previewCache.clear();
    
    this.fieldsSubject.next(null);
    this.functionsSubject.next(null);
  }

  /**
   * Clear specific cache type
   */
  clearCache(type: 'fields' | 'functions' | 'operators' | 'signatures' | 'suggestions' | 'validation' | 'sql' | 'preview'): void {
    switch (type) {
      case 'fields':
        this.fieldsCache.clear();
        this.fieldsSubject.next(null);
        break;
      case 'functions':
        this.functionsCache.clear();
        this.functionsSubject.next(null);
        break;
      case 'operators':
        this.operatorsCache.clear();
        break;
      case 'signatures':
        this.signaturesCache.clear();
        break;
      case 'suggestions':
        this.suggestionsCache.clear();
        break;
      case 'validation':
        this.validationCache.clear();
        break;
      case 'sql':
        this.sqlCache.clear();
        break;
      case 'preview':
        this.previewCache.clear();
        break;
    }
  }

  /**
   * Invalidate caches based on data freshness
   */
  invalidateStaleData(): void {
    const now = Date.now();
    const staleThreshold = this.config.ttlMs;

    // Check if fields data is stale
    if (now - this.lastFieldsUpdate > staleThreshold) {
      this.clearCache('fields');
      this.clearCache('operators');
      this.clearCache('suggestions');
    }

    // Check if functions data is stale
    if (now - this.lastFunctionsUpdate > staleThreshold) {
      this.clearCache('functions');
      this.clearCache('signatures');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats | null {
    if (!this.config.enableStats) {
      return null;
    }

    return {
      fields: this.fieldsCache.getStats(),
      functions: this.functionsCache.getStats(),
      operators: this.operatorsCache.getStats(),
      signatures: this.signaturesCache.getStats(),
      suggestions: this.suggestionsCache.getStats(),
      validation: this.validationCache.getStats(),
      sql: this.sqlCache.getStats(),
      preview: this.previewCache.getStats()
    };
  }

  /**
   * Check if cache is healthy (not too full, good hit rates)
   */
  isCacheHealthy(): boolean {
    const stats = this.getCacheStats();
    if (!stats) return true;

    const caches = Object.values(stats);
    const avgHitRate = caches.reduce((sum, cache) => sum + cache.hitRate, 0) / caches.length;
    const avgUtilization = caches.reduce((sum, cache) => sum + (cache.size / cache.maxSize), 0) / caches.length;

    return avgHitRate > 0.7 && avgUtilization < 0.9;
  }

  /**
   * Cleanup expired entries from all caches
   */
  cleanup(): void {
    // Force cleanup by accessing a non-existent key, which triggers TTL checks
    this.fieldsCache.get('__cleanup__');
    this.functionsCache.get('__cleanup__');
    this.operatorsCache.get('__cleanup__');
    this.signaturesCache.get('__cleanup__');
    this.suggestionsCache.get('__cleanup__');
    this.validationCache.get('__cleanup__');
    this.sqlCache.get('__cleanup__');
    this.previewCache.get('__cleanup__');
  }

  /**
   * Destroy the service and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clearAllCaches();
  }

  // Private helper methods

  private initializeCaches(): void {
    const { maxCacheSize, ttlMs } = this.config;
    
    this.fieldsCache = new LRUCache<FieldMetaResp[]>(maxCacheSize, ttlMs);
    this.functionsCache = new LRUCache<FunctionMetaResp[]>(maxCacheSize, ttlMs);
    this.operatorsCache = new LRUCache<OperatorMetaResp[]>(maxCacheSize, ttlMs);
    this.signaturesCache = new LRUCache<FunctionSignatureResp>(maxCacheSize, ttlMs);
    this.suggestionsCache = new LRUCache<FieldSuggestionResp[]>(maxCacheSize, ttlMs);
    this.validationCache = new LRUCache<ValidationResult>(maxCacheSize, ttlMs / 2); // Shorter TTL for validation
    this.sqlCache = new LRUCache<SqlGenerationResult>(maxCacheSize, ttlMs);
    this.previewCache = new LRUCache<CriteriaPreviewResult>(maxCacheSize, ttlMs);
  }

  private setupValidationDebouncing(): void {
    // The debounced validation observable is set up in getDebouncedValidation()
    // This method is kept for future enhancements
  }

  private setupAutoCleanup(): void {
    if (this.config.enableAutoCleanup) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
        this.invalidateStaleData();
      }, this.config.cleanupIntervalMs);
    }
  }

  private generateCriteriaKey(criteria: CriteriaDSL | Partial<CriteriaDSL>): string {
    try {
      // Create a stable hash of the criteria object
      const normalized = this.normalizeCriteria(criteria);
      return btoa(JSON.stringify(normalized)).replace(/[+/=]/g, '');
    } catch (error) {
      // Fallback to timestamp-based key if serialization fails
      return `fallback_${Date.now()}_${Math.random()}`;
    }
  }

  private normalizeCriteria(criteria: any): any {
    if (criteria === null || criteria === undefined) {
      return null;
    }

    if (Array.isArray(criteria)) {
      return criteria.map(item => this.normalizeCriteria(item));
    }

    if (typeof criteria === 'object') {
      const normalized: any = {};
      const keys = Object.keys(criteria).sort(); // Sort keys for consistent ordering
      
      for (const key of keys) {
        if (key !== 'id' && key !== 'metadata') { // Exclude non-functional properties
          normalized[key] = this.normalizeCriteria(criteria[key]);
        }
      }
      
      return normalized;
    }

    return criteria;
  }
}