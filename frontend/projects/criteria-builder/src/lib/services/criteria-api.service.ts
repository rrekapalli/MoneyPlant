import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { 
  FieldMetaResp, 
  OperatorInfo, 
  ValueSuggestion 
} from '../models/field-meta.interface';
import { 
  FunctionMetaResp, 
  FunctionSignature 
} from '../models/function-meta.interface';
import { 
  ValidationResult, 
  CriteriaDSL 
} from '../models/criteria-dsl.interface';
import { 
  PartialValidationResult, 
  SqlGenerationResult, 
  CriteriaPreview 
} from '../models/api-responses.interface';

/**
 * Service for integrating with backend API for dynamic function and field management
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaApiService {
  
  private readonly baseUrl = '/api/screeners/criteria';
  
  constructor(private http: HttpClient) {}
  
  // Function Management API calls
  
  /**
   * Fetch all available functions from criteria_functions table
   */
  getFunctions(): Observable<FunctionMetaResp[]> {
    return this.http.get<FunctionMetaResp[]>(`${this.baseUrl}/functions`)
      .pipe(
        catchError(error => {
          console.error('Failed to load functions:', error);
          return this.handleFunctionsFallback();
        })
      );
  }
  
  /**
   * Get detailed function signature with parameters from criteria_function_params table
   */
  getFunctionSignature(functionId: string): Observable<FunctionSignature> {
    return this.http.get<FunctionSignature>(`${this.baseUrl}/functions/${functionId}/signature`)
      .pipe(
        catchError(error => {
          console.error(`Failed to load function signature for ${functionId}:`, error);
          return throwError(() => new Error(`Function signature not available for ${functionId}`));
        })
      );
  }
  
  // Field Management API calls
  
  /**
   * Fetch all available fields with metadata
   */
  getFields(): Observable<FieldMetaResp[]> {
    return this.http.get<FieldMetaResp[]>(`${this.baseUrl}/fields`)
      .pipe(
        catchError(error => {
          console.error('Failed to load fields:', error);
          return this.handleFieldsFallback();
        })
      );
  }
  
  /**
   * Get field-specific compatible operators
   */
  getFieldOperators(fieldId: string): Observable<OperatorInfo[]> {
    return this.http.get<OperatorInfo[]>(`${this.baseUrl}/fields/${fieldId}/operators`)
      .pipe(
        catchError(error => {
          console.error(`Failed to load operators for field ${fieldId}:`, error);
          return this.handleOperatorsFallback(fieldId);
        })
      );
  }
  
  /**
   * Get value suggestions for field with optional query filter
   */
  getFieldSuggestions(fieldId: string, query?: string): Observable<ValueSuggestion[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    
    return this.http.get<ValueSuggestion[]>(`${this.baseUrl}/fields/${fieldId}/suggestions`, { params })
      .pipe(
        catchError(error => {
          console.error(`Failed to load suggestions for field ${fieldId}:`, error);
          return of([]); // Return empty suggestions on error
        })
      );
  }
  
  // Validation API calls
  
  /**
   * Validate complete criteria DSL using server-side validation
   */
  validateCriteria(dsl: CriteriaDSL): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.baseUrl}/validate`, { dsl })
      .pipe(
        catchError(error => {
          console.error('Failed to validate criteria:', error);
          return of({
            isValid: false,
            errors: [{
              id: 'api_error',
              type: 'field_not_found' as const,
              message: 'Validation service unavailable',
              path: '$.root',
              severity: 'error' as const
            }],
            warnings: []
          });
        })
      );
  }
  
  /**
   * Validate partial criteria for real-time feedback during query building
   */
  validatePartialCriteria(partialDsl: any): Observable<PartialValidationResult> {
    return this.http.post<PartialValidationResult>(`${this.baseUrl}/validate-partial`, { partialDsl })
      .pipe(
        catchError(error => {
          console.error('Failed to validate partial criteria:', error);
          return of({
            isValid: false,
            errors: [],
            warnings: [],
            suggestions: []
          });
        })
      );
  }
  
  // SQL Generation API calls
  
  /**
   * Generate parameterized SQL using server-side SQL generation
   */
  generateSql(dsl: CriteriaDSL): Observable<SqlGenerationResult> {
    return this.http.post<SqlGenerationResult>(`${this.baseUrl}/sql`, { dsl })
      .pipe(
        catchError(error => {
          console.error('Failed to generate SQL:', error);
          return throwError(() => new Error('SQL generation service unavailable'));
        })
      );
  }
  
  // Preview API calls
  
  /**
   * Get criteria preview with formatted preview and estimation
   */
  previewCriteria(dsl: CriteriaDSL): Observable<CriteriaPreview> {
    return this.http.post<CriteriaPreview>(`${this.baseUrl}/preview`, { dsl })
      .pipe(
        catchError(error => {
          console.error('Failed to preview criteria:', error);
          return of({
            valid: false,
            errors: [{
              id: 'preview_error',
              type: 'field_not_found' as const,
              message: 'Preview service unavailable',
              path: '$.root',
              severity: 'error' as const
            }]
          });
        })
      );
  }
  
  // Utility API calls
  
  /**
   * Get all available operators
   */
  getAllOperators(): Observable<OperatorInfo[]> {
    return this.http.get<OperatorInfo[]>(`${this.baseUrl}/operators`)
      .pipe(
        catchError(error => {
          console.error('Failed to load operators:', error);
          return this.handleAllOperatorsFallback();
        })
      );
  }
  
  // Fallback methods for error handling
  
  private handleFunctionsFallback(): Observable<FunctionMetaResp[]> {
    // Provide basic fallback functions
    const fallbackFunctions: FunctionMetaResp[] = [
      {
        id: 'avg',
        label: 'Average',
        returnType: 'number',
        category: 'Math',
        description: 'Calculate average value',
        examples: ['AVG(price)'],
        paramCount: 1
      },
      {
        id: 'sum',
        label: 'Sum',
        returnType: 'number',
        category: 'Math',
        description: 'Calculate sum of values',
        examples: ['SUM(quantity)'],
        paramCount: 1
      }
    ];
    
    return of(fallbackFunctions);
  }
  
  private handleFieldsFallback(): Observable<FieldMetaResp[]> {
    // Provide basic fallback fields
    const fallbackFields: FieldMetaResp[] = [
      {
        id: 'price',
        label: 'Price',
        dbColumn: 'price',
        dataType: 'number',
        category: 'Financial',
        description: 'Stock price',
        example: '100.50'
      },
      {
        id: 'symbol',
        label: 'Symbol',
        dbColumn: 'symbol',
        dataType: 'string',
        category: 'Basic',
        description: 'Stock symbol',
        example: 'AAPL'
      }
    ];
    
    return of(fallbackFields);
  }
  
  private handleOperatorsFallback(_fieldId: string): Observable<OperatorInfo[]> {
    // Provide basic operators based on common field types
    const basicOperators: OperatorInfo[] = [
      {
        id: '=',
        label: 'Equals',
        description: 'Equal to',
        requiresRightSide: true,
        supportedTypes: ['string', 'number', 'integer', 'date', 'boolean']
      },
      {
        id: '>',
        label: 'Greater Than',
        description: 'Greater than',
        requiresRightSide: true,
        supportedTypes: ['number', 'integer', 'date']
      },
      {
        id: '<',
        label: 'Less Than',
        description: 'Less than',
        requiresRightSide: true,
        supportedTypes: ['number', 'integer', 'date']
      }
    ];
    
    return of(basicOperators);
  }
  
  private handleAllOperatorsFallback(): Observable<OperatorInfo[]> {
    const allOperators: OperatorInfo[] = [
      {
        id: '=',
        label: 'Equals',
        description: 'Equal to',
        requiresRightSide: true,
        supportedTypes: ['string', 'number', 'integer', 'date', 'boolean']
      },
      {
        id: '!=',
        label: 'Not Equals',
        description: 'Not equal to',
        requiresRightSide: true,
        supportedTypes: ['string', 'number', 'integer', 'date', 'boolean']
      },
      {
        id: '>',
        label: 'Greater Than',
        description: 'Greater than',
        requiresRightSide: true,
        supportedTypes: ['number', 'integer', 'date']
      },
      {
        id: '<',
        label: 'Less Than',
        description: 'Less than',
        requiresRightSide: true,
        supportedTypes: ['number', 'integer', 'date']
      },
      {
        id: '>=',
        label: 'Greater Than or Equal',
        description: 'Greater than or equal to',
        requiresRightSide: true,
        supportedTypes: ['number', 'integer', 'date']
      },
      {
        id: '<=',
        label: 'Less Than or Equal',
        description: 'Less than or equal to',
        requiresRightSide: true,
        supportedTypes: ['number', 'integer', 'date']
      },
      {
        id: 'LIKE',
        label: 'Like',
        description: 'Pattern matching',
        requiresRightSide: true,
        supportedTypes: ['string']
      },
      {
        id: 'IN',
        label: 'In',
        description: 'Value in list',
        requiresRightSide: true,
        supportedTypes: ['string', 'number', 'integer']
      },
      {
        id: 'IS NULL',
        label: 'Is Null',
        description: 'Value is null',
        requiresRightSide: false,
        supportedTypes: ['string', 'number', 'integer', 'date', 'boolean']
      }
    ];
    
    return of(allOperators);
  }
}