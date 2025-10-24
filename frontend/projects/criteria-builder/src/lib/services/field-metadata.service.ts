import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, shareReplay, tap, switchMap } from 'rxjs/operators';

import { 
  FieldMetaResp, 
  OperatorMetaResp, 
  FunctionMetaResp, 
  FunctionSignatureResp, 
  FieldSuggestionResp 
} from '../interfaces/field-metadata.interface';

import { CriteriaApiService } from './criteria-api.service';
import { CriteriaCacheService } from './criteria-cache.service';

/**
 * Enhanced service for managing field metadata and API interactions with caching
 */
@Injectable({
  providedIn: 'root'
})
export class FieldMetadataService {
  constructor(
    private http: HttpClient,
    private apiService: CriteriaApiService,
    private cacheService: CriteriaCacheService
  ) {}

  /**
   * Get all available fields with caching
   */
  getFields(): Observable<FieldMetaResp[]> {
    const cached = this.cacheService.getCachedFields();
    if (cached) {
      return of(cached);
    }

    return this.apiService.getFields().pipe(
      tap(fields => this.cacheService.cacheFields(fields)),
      shareReplay(1),
      catchError(error => {
        console.error('Error fetching fields:', error);
        return of([]);
      })
    );
  }

  /**
   * Get fields by category with caching
   */
  getFieldsByCategory(category: string): Observable<FieldMetaResp[]> {
    const cached = this.cacheService.getCachedFieldsByCategory(category);
    if (cached) {
      return of(cached);
    }

    return this.apiService.getFieldsByCategory(category).pipe(
      tap(fields => this.cacheService.cacheFieldsByCategory(category, fields)),
      shareReplay(1),
      catchError(error => {
        console.error(`Error fetching fields for category ${category}:`, error);
        // Fallback to filtering all fields
        return this.getFields().pipe(
          map(fields => fields.filter(field => field.category === category))
        );
      })
    );
  }

  /**
   * Search fields by query
   */
  searchFields(query: string): Observable<FieldMetaResp[]> {
    if (!query.trim()) {
      return this.getFields();
    }

    const searchTerm = query.toLowerCase();
    return this.getFields().pipe(
      map(fields => fields.filter(field => 
        field.name.toLowerCase().includes(searchTerm) ||
        field.description?.toLowerCase().includes(searchTerm) ||
        field.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm))
      ))
    );
  }

  /**
   * Get compatible operators for a field with caching
   */
  getOperatorsForField(fieldId: string): Observable<OperatorMetaResp[]> {
    const cached = this.cacheService.getCachedOperators(fieldId);
    if (cached) {
      return of(cached);
    }

    return this.apiService.getOperatorsForField(fieldId).pipe(
      tap(operators => this.cacheService.cacheOperators(fieldId, operators)),
      shareReplay(1),
      catchError(error => {
        console.error(`Error fetching operators for field ${fieldId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get all available functions with caching
   */
  getFunctions(): Observable<FunctionMetaResp[]> {
    const cached = this.cacheService.getCachedFunctions();
    if (cached) {
      return of(cached);
    }

    return this.apiService.getFunctions().pipe(
      tap(functions => this.cacheService.cacheFunctions(functions)),
      shareReplay(1),
      catchError(error => {
        console.error('Error fetching functions:', error);
        return of([]);
      })
    );
  }

  /**
   * Get functions by category with caching
   */
  getFunctionsByCategory(category: string): Observable<FunctionMetaResp[]> {
    const cached = this.cacheService.getCachedFunctionsByCategory(category);
    if (cached) {
      return of(cached);
    }

    return this.apiService.getFunctionsByCategory(category).pipe(
      tap(functions => this.cacheService.cacheFunctionsByCategory(category, functions)),
      shareReplay(1),
      catchError(error => {
        console.error(`Error fetching functions for category ${category}:`, error);
        // Fallback to filtering all functions
        return this.getFunctions().pipe(
          map(functions => functions.filter(func => func.category === category))
        );
      })
    );
  }

  /**
   * Search functions by query
   */
  searchFunctions(query: string): Observable<FunctionMetaResp[]> {
    if (!query.trim()) {
      return this.getFunctions();
    }

    const searchTerm = query.toLowerCase();
    return this.getFunctions().pipe(
      map(functions => functions.filter(func => 
        func.name.toLowerCase().includes(searchTerm) ||
        func.description?.toLowerCase().includes(searchTerm) ||
        func.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm))
      ))
    );
  }

  /**
   * Get function signature with caching
   */
  getFunctionSignature(functionId: string): Observable<FunctionSignatureResp> {
    const cached = this.cacheService.getCachedSignature(functionId);
    if (cached) {
      return of(cached);
    }

    return this.apiService.getFunctionSignature(functionId).pipe(
      tap(signature => this.cacheService.cacheSignature(functionId, signature)),
      shareReplay(1),
      catchError(error => {
        console.error(`Error fetching signature for function ${functionId}:`, error);
        // Return a default signature structure
        const defaultSignature: FunctionSignatureResp = {
          functionId,
          parameters: [],
          returnType: 'number',
          variadic: false,
          minParams: 0
        };
        return of(defaultSignature);
      })
    );
  }

  /**
   * Get field value suggestions with caching
   */
  getFieldSuggestions(fieldId: string, query?: string): Observable<FieldSuggestionResp[]> {
    const cached = this.cacheService.getCachedSuggestions(fieldId, query);
    if (cached) {
      return of(cached);
    }

    return this.apiService.getFieldSuggestions(fieldId, query).pipe(
      tap(suggestions => this.cacheService.cacheSuggestions(fieldId, suggestions, query)),
      shareReplay(1),
      catchError(error => {
        console.error(`Error fetching suggestions for field ${fieldId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get field categories with API fallback
   */
  getFieldCategories(): Observable<string[]> {
    return this.apiService.getFieldCategories().pipe(
      catchError(error => {
        console.warn('Error fetching field categories from API, falling back to client-side calculation:', error);
        // Fallback to calculating from all fields
        return this.getFields().pipe(
          map(fields => {
            const categories = new Set(fields.map(field => field.category));
            return Array.from(categories).sort();
          })
        );
      })
    );
  }

  /**
   * Get function categories with API fallback
   */
  getFunctionCategories(): Observable<string[]> {
    return this.apiService.getFunctionCategories().pipe(
      catchError(error => {
        console.warn('Error fetching function categories from API, falling back to client-side calculation:', error);
        // Fallback to calculating from all functions
        return this.getFunctions().pipe(
          map(functions => {
            const categories = new Set(functions.map(func => func.category));
            return Array.from(categories).sort();
          })
        );
      })
    );
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cacheService.clearAllCaches();
  }

  /**
   * Refresh field metadata
   */
  refreshFields(): Observable<FieldMetaResp[]> {
    this.cacheService.clearCache('fields');
    return this.getFields();
  }

  /**
   * Refresh function metadata
   */
  refreshFunctions(): Observable<FunctionMetaResp[]> {
    this.cacheService.clearCache('functions');
    return this.getFunctions();
  }

  /**
   * Get field by ID
   */
  getFieldById(fieldId: string): Observable<FieldMetaResp | undefined> {
    return this.getFields().pipe(
      map(fields => fields.find(field => field.fieldId === fieldId))
    );
  }

  /**
   * Get function by ID
   */
  getFunctionById(functionId: string): Observable<FunctionMetaResp | undefined> {
    return this.getFunctions().pipe(
      map(functions => functions.find(func => func.functionId === functionId))
    );
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cacheService.getCacheStats();
  }

  /**
   * Check if cache is healthy
   */
  isCacheHealthy(): boolean {
    return this.cacheService.isCacheHealthy();
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): void {
    this.cacheService.cleanup();
  }
}