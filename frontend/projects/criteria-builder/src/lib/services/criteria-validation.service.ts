import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of, EMPTY } from 'rxjs';
import { 
  switchMap, 
  catchError, 
  tap, 
  debounceTime, 
  distinctUntilChanged, 
  filter,
  takeUntil,
  share
} from 'rxjs/operators';

import { 
  ValidationResult,
  ValidationOptions,
  SqlGenerationResult,
  CriteriaPreviewResult
} from '../interfaces/validation.interface';

import { CriteriaDSL } from '../interfaces/criteria-dsl.interface';

import { CriteriaApiService } from './criteria-api.service';
import { CriteriaCacheService } from './criteria-cache.service';

/**
 * Configuration for validation service
 */
export interface ValidationServiceConfig {
  /** Debounce time for validation requests in milliseconds */
  debounceMs?: number;
  
  /** Whether to enable real-time validation */
  enableRealTime?: boolean;
  
  /** Whether to cache validation results */
  enableCaching?: boolean;
  
  /** Whether to validate partial criteria */
  allowPartial?: boolean;
  
  /** Default validation options */
  defaultOptions?: ValidationOptions;
}

/**
 * Validation request with metadata
 */
interface ValidationRequestInternal {
  criteria: CriteriaDSL | Partial<CriteriaDSL>;
  isPartial: boolean;
  options?: ValidationOptions;
  requestId: string;
  timestamp: number;
}

/**
 * Service for managing criteria validation with caching and debouncing
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaValidationService implements OnDestroy {
  private readonly config: Required<ValidationServiceConfig>;
  private readonly destroy$ = new Subject<void>();
  
  // Validation request streams
  private validationRequest$ = new Subject<ValidationRequestInternal>();
  private sqlGenerationRequest$ = new Subject<CriteriaDSL>();
  private previewRequest$ = new Subject<CriteriaDSL>();
  
  // Current state subjects
  private currentValidation$ = new BehaviorSubject<ValidationResult | null>(null);
  private currentSql$ = new BehaviorSubject<SqlGenerationResult | null>(null);
  private currentPreview$ = new BehaviorSubject<CriteriaPreviewResult | null>(null);
  private isValidating$ = new BehaviorSubject<boolean>(false);
  
  // Processed streams
  private debouncedValidation$!: Observable<ValidationResult>;
  private debouncedSqlGeneration$!: Observable<SqlGenerationResult>;
  private debouncedPreview$!: Observable<CriteriaPreviewResult>;

  constructor(
    private apiService: CriteriaApiService,
    private cacheService: CriteriaCacheService
  ) {
    this.config = {
      debounceMs: 300,
      enableRealTime: true,
      enableCaching: true,
      allowPartial: true,
      defaultOptions: {
        deep: true,
        allowPartial: true,
        includeWarnings: true,
        includeSuggestions: true
      }
    };

    this.setupValidationStreams();
  }

  /**
   * Configure the validation service
   */
  configure(config: Partial<ValidationServiceConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Validate criteria (debounced)
   */
  validateCriteria(criteria: CriteriaDSL | Partial<CriteriaDSL>, options?: ValidationOptions): void {
    if (!this.config.enableRealTime) {
      return;
    }

    const isPartial = this.isPartialCriteria(criteria);
    const requestId = this.generateRequestId();
    
    this.validationRequest$.next({
      criteria,
      isPartial,
      options: { ...this.config.defaultOptions, ...options },
      requestId,
      timestamp: Date.now()
    });
  }

  /**
   * Validate criteria immediately (bypasses debouncing)
   */
  validateCriteriaImmediate(criteria: CriteriaDSL, options?: ValidationOptions): Observable<ValidationResult> {
    const mergedOptions = { ...this.config.defaultOptions, ...options };
    
    if (this.config.enableCaching) {
      const cached = this.cacheService.getCachedValidation(criteria);
      if (cached) {
        return of(cached);
      }
    }

    this.isValidating$.next(true);
    
    return this.apiService.validateCriteria(criteria, mergedOptions).pipe(
      tap(result => {
        if (this.config.enableCaching) {
          this.cacheService.cacheValidation(criteria, result);
        }
        this.currentValidation$.next(result);
        this.isValidating$.next(false);
      }),
      catchError(error => {
        console.error('Error validating criteria:', error);
        this.isValidating$.next(false);
        const errorResult: ValidationResult = {
          isValid: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Failed to validate criteria',
            path: 'root',
            severity: 'error',
            canAutoFix: false
          }],
          warnings: [],
          timestamp: new Date()
        };
        return of(errorResult);
      })
    );
  }

  /**
   * Generate SQL from criteria (debounced)
   */
  generateSql(criteria: CriteriaDSL): void {
    this.sqlGenerationRequest$.next(criteria);
  }

  /**
   * Generate SQL immediately (bypasses debouncing)
   */
  generateSqlImmediate(criteria: CriteriaDSL): Observable<SqlGenerationResult> {
    if (this.config.enableCaching) {
      const cached = this.cacheService.getCachedSql(criteria);
      if (cached) {
        return of(cached);
      }
    }

    return this.apiService.generateSql(criteria).pipe(
      tap(result => {
        if (this.config.enableCaching) {
          this.cacheService.cacheSql(criteria, result);
        }
        this.currentSql$.next(result);
      }),
      catchError(error => {
        console.error('Error generating SQL:', error);
        const errorResult: SqlGenerationResult = {
          sql: '',
          parameters: [],
          success: false,
          error: 'Failed to generate SQL'
        };
        return of(errorResult);
      })
    );
  }

  /**
   * Generate criteria preview (debounced)
   */
  generatePreview(criteria: CriteriaDSL): void {
    this.previewRequest$.next(criteria);
  }

  /**
   * Generate criteria preview immediately (bypasses debouncing)
   */
  generatePreviewImmediate(criteria: CriteriaDSL): Observable<CriteriaPreviewResult> {
    if (this.config.enableCaching) {
      const cached = this.cacheService.getCachedPreview(criteria);
      if (cached) {
        return of(cached);
      }
    }

    return this.apiService.previewCriteria(criteria).pipe(
      tap(result => {
        if (this.config.enableCaching) {
          this.cacheService.cachePreview(criteria, result);
        }
        this.currentPreview$.next(result);
      }),
      catchError(error => {
        console.error('Error generating preview:', error);
        const errorResult: CriteriaPreviewResult = {
          description: 'Failed to generate preview',
          preview: [],
          success: false,
          error: 'Failed to generate criteria preview'
        };
        return of(errorResult);
      })
    );
  }

  /**
   * Get current validation result as observable
   */
  getCurrentValidation(): Observable<ValidationResult | null> {
    return this.currentValidation$.asObservable();
  }

  /**
   * Get current SQL generation result as observable
   */
  getCurrentSql(): Observable<SqlGenerationResult | null> {
    return this.currentSql$.asObservable();
  }

  /**
   * Get current preview result as observable
   */
  getCurrentPreview(): Observable<CriteriaPreviewResult | null> {
    return this.currentPreview$.asObservable();
  }

  /**
   * Get validation loading state
   */
  getValidationLoadingState(): Observable<boolean> {
    return this.isValidating$.asObservable();
  }

  /**
   * Get debounced validation stream
   */
  getDebouncedValidation(): Observable<ValidationResult> {
    return this.debouncedValidation$;
  }

  /**
   * Get debounced SQL generation stream
   */
  getDebouncedSqlGeneration(): Observable<SqlGenerationResult> {
    return this.debouncedSqlGeneration$;
  }

  /**
   * Get debounced preview generation stream
   */
  getDebouncedPreview(): Observable<CriteriaPreviewResult> {
    return this.debouncedPreview$;
  }

  /**
   * Clear current validation state
   */
  clearValidation(): void {
    this.currentValidation$.next(null);
    this.currentSql$.next(null);
    this.currentPreview$.next(null);
    this.isValidating$.next(false);
  }

  /**
   * Check if criteria is valid based on current validation
   */
  isCurrentCriteriaValid(): boolean {
    const current = this.currentValidation$.value;
    return current ? current.isValid : false;
  }

  /**
   * Get current validation errors
   */
  getCurrentErrors() {
    const current = this.currentValidation$.value;
    return current ? current.errors : [];
  }

  /**
   * Get current validation warnings
   */
  getCurrentWarnings() {
    const current = this.currentValidation$.value;
    return current ? current.warnings : [];
  }

  /**
   * Test criteria execution
   */
  testCriteria(criteria: CriteriaDSL, sampleSize?: number): Observable<{ success: boolean; sampleResults?: any[]; error?: string }> {
    return this.apiService.testCriteria(criteria, sampleSize).pipe(
      catchError(error => {
        console.error('Error testing criteria:', error);
        return of({
          success: false,
          error: 'Failed to test criteria execution'
        });
      })
    );
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Private helper methods

  private setupValidationStreams(): void {
    // Setup debounced validation stream
    this.debouncedValidation$ = this.validationRequest$.pipe(
      debounceTime(this.config.debounceMs),
      distinctUntilChanged((prev, curr) => 
        this.generateCriteriaKey(prev.criteria) === this.generateCriteriaKey(curr.criteria)
      ),
      filter(request => this.config.enableRealTime),
      switchMap(request => this.processValidationRequest(request)),
      takeUntil(this.destroy$),
      share()
    );

    // Setup debounced SQL generation stream
    this.debouncedSqlGeneration$ = this.sqlGenerationRequest$.pipe(
      debounceTime(this.config.debounceMs),
      distinctUntilChanged((prev, curr) => 
        this.generateCriteriaKey(prev) === this.generateCriteriaKey(curr)
      ),
      switchMap(criteria => this.generateSqlImmediate(criteria)),
      takeUntil(this.destroy$),
      share()
    );

    // Setup debounced preview generation stream
    this.debouncedPreview$ = this.previewRequest$.pipe(
      debounceTime(this.config.debounceMs),
      distinctUntilChanged((prev, curr) => 
        this.generateCriteriaKey(prev) === this.generateCriteriaKey(curr)
      ),
      switchMap(criteria => this.generatePreviewImmediate(criteria)),
      takeUntil(this.destroy$),
      share()
    );

    // Subscribe to streams to activate them
    this.debouncedValidation$.subscribe();
    this.debouncedSqlGeneration$.subscribe();
    this.debouncedPreview$.subscribe();
  }

  private processValidationRequest(request: ValidationRequestInternal): Observable<ValidationResult> {
    if (this.config.enableCaching) {
      const cached = this.cacheService.getCachedValidation(request.criteria);
      if (cached) {
        this.currentValidation$.next(cached);
        return of(cached);
      }
    }

    this.isValidating$.next(true);

    const apiCall = request.isPartial 
      ? this.apiService.validatePartialCriteria(request.criteria, request.options)
      : this.apiService.validateCriteria(request.criteria as CriteriaDSL, request.options);

    return apiCall.pipe(
      tap(result => {
        if (this.config.enableCaching) {
          this.cacheService.cacheValidation(request.criteria, result);
        }
        this.currentValidation$.next(result);
        this.isValidating$.next(false);
      }),
      catchError(error => {
        console.error('Error in validation request:', error);
        this.isValidating$.next(false);
        const errorResult: ValidationResult = {
          isValid: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Failed to validate criteria',
            path: 'root',
            severity: 'error',
            canAutoFix: false
          }],
          warnings: [],
          timestamp: new Date()
        };
        this.currentValidation$.next(errorResult);
        return of(errorResult);
      })
    );
  }

  private isPartialCriteria(criteria: any): boolean {
    if (!criteria || !criteria.root) {
      return true;
    }

    // Check if the criteria structure is incomplete
    const hasIncompleteElements = this.hasIncompleteElements(criteria.root);
    return hasIncompleteElements;
  }

  private hasIncompleteElements(element: any): boolean {
    if (!element) {
      return true;
    }

    if (element.children && Array.isArray(element.children)) {
      // Check if any child is incomplete
      return element.children.some((child: any) => this.hasIncompleteElements(child));
    }

    if (element.left || element.right || element.operator) {
      // This is a condition - check if it's complete
      return !element.left || !element.operator;
    }

    return false;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCriteriaKey(criteria: any): string {
    try {
      return JSON.stringify(criteria);
    } catch {
      return `fallback_${Date.now()}`;
    }
  }
}