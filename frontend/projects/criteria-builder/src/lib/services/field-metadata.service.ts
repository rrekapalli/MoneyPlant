import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';

import { 
  FieldMetaResp, 
  OperatorMetaResp, 
  FunctionMetaResp, 
  FunctionSignatureResp, 
  FieldSuggestionResp 
} from '../interfaces/field-metadata.interface';

/**
 * Service for managing field metadata and API interactions
 */
@Injectable({
  providedIn: 'root'
})
export class FieldMetadataService {
  private readonly baseUrl = '/api/screeners';
  
  // Cache for metadata to reduce API calls
  private fieldsCache$ = new BehaviorSubject<FieldMetaResp[] | null>(null);
  private functionsCache$ = new BehaviorSubject<FunctionMetaResp[] | null>(null);
  private operatorsCache = new Map<string, OperatorMetaResp[]>();
  private signaturesCache = new Map<string, FunctionSignatureResp>();
  
  constructor(private http: HttpClient) {}

  /**
   * Get all available fields
   */
  getFields(): Observable<FieldMetaResp[]> {
    const cached = this.fieldsCache$.value;
    if (cached) {
      return of(cached);
    }

    return this.http.get<FieldMetaResp[]>(`${this.baseUrl}/fields`).pipe(
      tap(fields => this.fieldsCache$.next(fields)),
      shareReplay(1),
      catchError(error => {
        console.error('Error fetching fields:', error);
        return of([]);
      })
    );
  }

  /**
   * Get fields by category
   */
  getFieldsByCategory(category: string): Observable<FieldMetaResp[]> {
    return this.getFields().pipe(
      map(fields => fields.filter(field => field.category === category))
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
   * Get compatible operators for a field
   */
  getOperatorsForField(fieldId: string): Observable<OperatorMetaResp[]> {
    const cached = this.operatorsCache.get(fieldId);
    if (cached) {
      return of(cached);
    }

    return this.http.get<OperatorMetaResp[]>(`${this.baseUrl}/fields/${fieldId}/operators`).pipe(
      tap(operators => this.operatorsCache.set(fieldId, operators)),
      shareReplay(1),
      catchError(error => {
        console.error(`Error fetching operators for field ${fieldId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get all available functions
   */
  getFunctions(): Observable<FunctionMetaResp[]> {
    const cached = this.functionsCache$.value;
    if (cached) {
      return of(cached);
    }

    return this.http.get<FunctionMetaResp[]>(`${this.baseUrl}/functions`).pipe(
      tap(functions => this.functionsCache$.next(functions)),
      shareReplay(1),
      catchError(error => {
        console.error('Error fetching functions:', error);
        return of([]);
      })
    );
  }

  /**
   * Get functions by category
   */
  getFunctionsByCategory(category: string): Observable<FunctionMetaResp[]> {
    return this.getFunctions().pipe(
      map(functions => functions.filter(func => func.category === category))
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
   * Get function signature
   */
  getFunctionSignature(functionId: string): Observable<FunctionSignatureResp> {
    const cached = this.signaturesCache.get(functionId);
    if (cached) {
      return of(cached);
    }

    return this.http.get<FunctionSignatureResp>(`${this.baseUrl}/functions/${functionId}/signature`).pipe(
      tap(signature => this.signaturesCache.set(functionId, signature)),
      shareReplay(1),
      catchError(error => {
        console.error(`Error fetching signature for function ${functionId}:`, error);
        // Return a default signature structure
        return of({
          functionId,
          parameters: [],
          returnType: 'number',
          variadic: false,
          minParams: 0
        } as FunctionSignatureResp);
      })
    );
  }

  /**
   * Get field value suggestions
   */
  getFieldSuggestions(fieldId: string, query?: string): Observable<FieldSuggestionResp[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('q', query);
    }

    return this.http.get<FieldSuggestionResp[]>(`${this.baseUrl}/fields/${fieldId}/suggestions`, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching suggestions for field ${fieldId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get field categories
   */
  getFieldCategories(): Observable<string[]> {
    return this.getFields().pipe(
      map(fields => {
        const categories = new Set(fields.map(field => field.category));
        return Array.from(categories).sort();
      })
    );
  }

  /**
   * Get function categories
   */
  getFunctionCategories(): Observable<string[]> {
    return this.getFunctions().pipe(
      map(functions => {
        const categories = new Set(functions.map(func => func.category));
        return Array.from(categories).sort();
      })
    );
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.fieldsCache$.next(null);
    this.functionsCache$.next(null);
    this.operatorsCache.clear();
    this.signaturesCache.clear();
  }

  /**
   * Refresh field metadata
   */
  refreshFields(): Observable<FieldMetaResp[]> {
    this.fieldsCache$.next(null);
    return this.getFields();
  }

  /**
   * Refresh function metadata
   */
  refreshFunctions(): Observable<FunctionMetaResp[]> {
    this.functionsCache$.next(null);
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
}