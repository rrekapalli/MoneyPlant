import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  OnChanges, 
  SimpleChanges,
  ChangeDetectorRef 
} from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { CriteriaDSL } from '../models/criteria-dsl.interface';
import { SqlGenerationResult } from '../models/api-responses.interface';
import { CriteriaApiService } from '../services/criteria-api.service';

/**
 * SQL Preview Component with API-driven SQL generation
 * 
 * Features:
 * - Collapsible SQL preview panel using PrimeNG Panel
 * - API integration for server-side SQL generation
 * - Formatted SQL with syntax highlighting
 * - Parameter display in separate section
 * - Copy-to-clipboard functionality
 * - Real-time updates with debounced API calls
 * - Error handling for SQL generation failures
 */
@Component({
  selector: 'ac-sql-preview',
  standalone: false,
  templateUrl: './ac-sql-preview.component.html',
  styleUrls: ['./ac-sql-preview.component.scss']
})
export class AcSqlPreviewComponent implements OnInit, OnDestroy, OnChanges {
  
  @Input() dsl: CriteriaDSL | null = null;
  @Input() isValid: boolean | null = false;
  @Input() collapsed: boolean = false;
  
  // Component state
  isGenerating = false;
  hasError = false;
  errorMessage = '';
  
  // SQL generation results
  sqlResult$ = new BehaviorSubject<SqlGenerationResult | null>(null);
  
  // Internal state for DSL changes
  private dslSubject$ = new BehaviorSubject<CriteriaDSL | null>(null);
  private destroy$ = new Subject<void>();
  
  constructor(
    private criteriaApiService: CriteriaApiService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.setupSqlGeneration();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dsl'] && this.dsl) {
      this.dslSubject$.next(this.dsl);
    }
  }
  
  /**
   * Set up real-time SQL generation with debounced API calls
   */
  private setupSqlGeneration(): void {
    this.dslSubject$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((prev, curr) => {
        // Compare DSL objects for changes
        return JSON.stringify(prev) === JSON.stringify(curr);
      }),
      debounceTime(300), // Debounce API calls by 300ms
      switchMap((dsl) => {
        if (!dsl || !this.isValid) {
          // Clear results if DSL is invalid
          this.sqlResult$.next(null);
          this.hasError = false;
          this.errorMessage = '';
          return [];
        }
        
        this.isGenerating = true;
        this.hasError = false;
        this.cdr.detectChanges();
        
        return this.criteriaApiService.generateSql(dsl);
      })
    ).subscribe({
      next: (result: SqlGenerationResult) => {
        this.sqlResult$.next(result);
        this.isGenerating = false;
        this.hasError = false;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('SQL generation failed:', error);
        this.sqlResult$.next(null);
        this.isGenerating = false;
        this.hasError = true;
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.detectChanges();
      }
    });
  }
  
  /**
   * Get user-friendly error message from API error
   */
  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Failed to generate SQL. Please check your criteria and try again.';
  }
  
  /**
   * Toggle collapsed state of the preview panel
   */
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
  
  /**
   * Copy SQL to clipboard
   */
  async copySqlToClipboard(): Promise<void> {
    const sqlResult = this.sqlResult$.value;
    if (!sqlResult?.sql) {
      return;
    }
    
    try {
      await navigator.clipboard.writeText(sqlResult.sql);
      // Could emit an event or show a toast notification here
      console.log('SQL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy SQL to clipboard:', error);
      // Fallback for older browsers
      this.fallbackCopyToClipboard(sqlResult.sql);
    }
  }
  
  /**
   * Copy parameters to clipboard
   */
  async copyParamsToClipboard(): Promise<void> {
    const sqlResult = this.sqlResult$.value;
    if (!sqlResult?.parameters) {
      return;
    }
    
    try {
      const paramsJson = JSON.stringify(sqlResult.parameters, null, 2);
      await navigator.clipboard.writeText(paramsJson);
      console.log('Parameters copied to clipboard');
    } catch (error) {
      console.error('Failed to copy parameters to clipboard:', error);
      // Fallback for older browsers
      const paramsJson = JSON.stringify(sqlResult.parameters, null, 2);
      this.fallbackCopyToClipboard(paramsJson);
    }
  }
  
  /**
   * Copy both SQL and parameters to clipboard
   */
  async copyAllToClipboard(): Promise<void> {
    const sqlResult = this.sqlResult$.value;
    if (!sqlResult) {
      return;
    }
    
    const content = [
      '-- Generated SQL',
      sqlResult.sql,
      '',
      '-- Parameters',
      JSON.stringify(sqlResult.parameters, null, 2),
      '',
      `-- Generated at: ${sqlResult.generatedAt}`,
      `-- Generated by: ${sqlResult.generatedBy}`
    ].join('\n');
    
    try {
      await navigator.clipboard.writeText(content);
      console.log('SQL and parameters copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.fallbackCopyToClipboard(content);
    }
  }
  
  /**
   * Fallback copy method for older browsers
   */
  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Text copied using fallback method');
    } catch (error) {
      console.error('Fallback copy failed:', error);
    } finally {
      document.body.removeChild(textArea);
    }
  }
  
  /**
   * Get formatted parameters as JSON string
   */
  getFormattedParameters(): string {
    const sqlResult = this.sqlResult$.value;
    if (!sqlResult?.parameters || Object.keys(sqlResult.parameters).length === 0) {
      return '{}';
    }
    return JSON.stringify(sqlResult.parameters, null, 2);
  }
  
  /**
   * Check if there are any parameters to display
   */
  hasParameters(): boolean {
    const sqlResult = this.sqlResult$.value;
    return !!(sqlResult?.parameters && Object.keys(sqlResult.parameters).length > 0);
  }
  
  /**
   * Get current SQL result
   */
  getCurrentSqlResult(): SqlGenerationResult | null {
    return this.sqlResult$.value;
  }
  
  /**
   * Check if SQL generation is available (DSL is valid and not empty)
   */
  canGenerateSql(): boolean {
    return !!(this.dsl && this.isValid && this.dsl.root && this.dsl.root.children.length > 0);
  }
  
  /**
   * Get display text for generation metadata
   */
  getGenerationInfo(): string {
    const sqlResult = this.sqlResult$.value;
    if (!sqlResult) {
      return '';
    }
    
    const date = new Date(sqlResult.generatedAt).toLocaleString();
    return `Generated at ${date} by ${sqlResult.generatedBy}`;
  }
}