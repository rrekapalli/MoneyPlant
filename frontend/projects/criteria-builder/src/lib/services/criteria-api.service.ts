import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { 
  ValidationResult,
  ValidationRequest,
  ValidationOptions,
  SqlGenerationResult,
  CriteriaPreviewResult
} from '../interfaces/validation.interface';

import { CriteriaDSL } from '../interfaces/criteria-dsl.interface';

import {
  FieldMetaResp,
  OperatorMetaResp,
  FunctionMetaResp,
  FunctionSignatureResp,
  FieldSuggestionResp
} from '../interfaces/field-metadata.interface';

/**
 * API service for criteria builder operations extending ScreenerApiService functionality
 * Provides methods for field metadata, function metadata, validation, and SQL generation
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaApiService {
  private readonly baseUrl = '/api/screeners';

  constructor(private http: HttpClient) {}

  // Field Metadata Operations

  /**
   * Get all available fields for criteria building
   */
  getFields(): Observable<FieldMetaResp[]> {
    return this.http.get<FieldMetaResp[]>(`${this.baseUrl}/fields`).pipe(
      catchError(error => {
        console.error('Error fetching fields:', error);
        throw error;
      })
    );
  }

  /**
   * Get fields filtered by category
   */
  getFieldsByCategory(category: string): Observable<FieldMetaResp[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<FieldMetaResp[]>(`${this.baseUrl}/fields`, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching fields for category ${category}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get compatible operators for a specific field
   */
  getOperatorsForField(fieldId: string): Observable<OperatorMetaResp[]> {
    return this.http.get<OperatorMetaResp[]>(`${this.baseUrl}/fields/${fieldId}/operators`).pipe(
      catchError(error => {
        console.error(`Error fetching operators for field ${fieldId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get field value suggestions with optional query filtering
   */
  getFieldSuggestions(fieldId: string, query?: string, limit?: number): Observable<FieldSuggestionResp[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('q', query);
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<FieldSuggestionResp[]>(`${this.baseUrl}/fields/${fieldId}/suggestions`, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching suggestions for field ${fieldId}:`, error);
        throw error;
      })
    );
  }

  // Function Metadata Operations

  /**
   * Get all available functions for criteria building
   */
  getFunctions(): Observable<FunctionMetaResp[]> {
    return this.http.get<FunctionMetaResp[]>(`${this.baseUrl}/functions`).pipe(
      catchError(error => {
        console.error('Error fetching functions:', error);
        throw error;
      })
    );
  }

  /**
   * Get functions filtered by category (Math Functions, Indicators, etc.)
   */
  getFunctionsByCategory(category: string): Observable<FunctionMetaResp[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<FunctionMetaResp[]>(`${this.baseUrl}/functions`, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching functions for category ${category}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get function signature including parameters and return type
   */
  getFunctionSignature(functionId: string): Observable<FunctionSignatureResp> {
    return this.http.get<FunctionSignatureResp>(`${this.baseUrl}/functions/${functionId}/signature`).pipe(
      catchError(error => {
        console.error(`Error fetching signature for function ${functionId}:`, error);
        throw error;
      })
    );
  }

  // Validation Operations

  /**
   * Validate complete criteria structure
   */
  validateCriteria(criteria: CriteriaDSL, options?: ValidationOptions): Observable<ValidationResult> {
    const request: ValidationRequest = {
      criteria,
      options: {
        deep: true,
        allowPartial: false,
        includeWarnings: true,
        includeSuggestions: true,
        ...options
      }
    };

    return this.http.post<ValidationResult>(`${this.baseUrl}/validate-criteria`, request).pipe(
      map(result => ({
        ...result,
        timestamp: new Date(result.timestamp || Date.now())
      })),
      catchError(error => {
        console.error('Error validating criteria:', error);
        throw error;
      })
    );
  }

  /**
   * Validate partial/incomplete criteria during construction
   */
  validatePartialCriteria(criteria: Partial<CriteriaDSL>, options?: ValidationOptions): Observable<ValidationResult> {
    const request: ValidationRequest = {
      criteria,
      options: {
        deep: false,
        allowPartial: true,
        includeWarnings: true,
        includeSuggestions: true,
        ...options
      }
    };

    return this.http.post<ValidationResult>(`${this.baseUrl}/validate-partial-criteria`, request).pipe(
      map(result => ({
        ...result,
        timestamp: new Date(result.timestamp || Date.now())
      })),
      catchError(error => {
        console.error('Error validating partial criteria:', error);
        throw error;
      })
    );
  }

  // SQL Generation Operations

  /**
   * Generate SQL from criteria DSL
   */
  generateSql(criteria: CriteriaDSL, options?: { includeParameters?: boolean; format?: boolean }): Observable<SqlGenerationResult> {
    const requestBody = {
      criteria,
      options: {
        includeParameters: true,
        format: true,
        ...options
      }
    };

    return this.http.post<SqlGenerationResult>(`${this.baseUrl}/generate-sql`, requestBody).pipe(
      catchError(error => {
        console.error('Error generating SQL:', error);
        throw error;
      })
    );
  }

  /**
   * Generate human-readable preview of criteria
   */
  previewCriteria(criteria: CriteriaDSL, options?: { includeDetails?: boolean; format?: 'text' | 'html' }): Observable<CriteriaPreviewResult> {
    const requestBody = {
      criteria,
      options: {
        includeDetails: true,
        format: 'text',
        ...options
      }
    };

    return this.http.post<CriteriaPreviewResult>(`${this.baseUrl}/preview-criteria`, requestBody).pipe(
      catchError(error => {
        console.error('Error generating criteria preview:', error);
        throw error;
      })
    );
  }

  // Utility Operations

  /**
   * Check if a field exists and is accessible
   */
  checkFieldAccess(fieldId: string): Observable<boolean> {
    return this.http.head(`${this.baseUrl}/fields/${fieldId}`, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => {
        return [false];
      })
    );
  }

  /**
   * Check if a function exists and is accessible
   */
  checkFunctionAccess(functionId: string): Observable<boolean> {
    return this.http.head(`${this.baseUrl}/functions/${functionId}`, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => {
        return [false];
      })
    );
  }

  /**
   * Get available field categories
   */
  getFieldCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/fields/categories`).pipe(
      catchError(error => {
        console.error('Error fetching field categories:', error);
        throw error;
      })
    );
  }

  /**
   * Get available function categories
   */
  getFunctionCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/functions/categories`).pipe(
      catchError(error => {
        console.error('Error fetching function categories:', error);
        throw error;
      })
    );
  }

  /**
   * Test criteria execution without saving (dry run)
   */
  testCriteria(criteria: CriteriaDSL, sampleSize?: number): Observable<{ success: boolean; sampleResults?: any[]; error?: string }> {
    const requestBody = {
      criteria,
      options: {
        dryRun: true,
        sampleSize: sampleSize || 10
      }
    };

    return this.http.post<{ success: boolean; sampleResults?: any[]; error?: string }>(`${this.baseUrl}/test-criteria`, requestBody).pipe(
      catchError(error => {
        console.error('Error testing criteria:', error);
        throw error;
      })
    );
  }

  /**
   * Get operator compatibility matrix for multiple fields
   */
  getOperatorCompatibility(fieldIds: string[]): Observable<Record<string, OperatorMetaResp[]>> {
    const params = new HttpParams().set('fieldIds', fieldIds.join(','));
    return this.http.get<Record<string, OperatorMetaResp[]>>(`${this.baseUrl}/operators/compatibility`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching operator compatibility:', error);
        throw error;
      })
    );
  }

  /**
   * Get function compatibility for specific return types
   */
  getFunctionCompatibility(returnTypes: string[]): Observable<Record<string, FunctionMetaResp[]>> {
    const params = new HttpParams().set('returnTypes', returnTypes.join(','));
    return this.http.get<Record<string, FunctionMetaResp[]>>(`${this.baseUrl}/functions/compatibility`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching function compatibility:', error);
        throw error;
      })
    );
  }
}