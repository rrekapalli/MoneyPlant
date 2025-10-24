import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { 
  takeUntil, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  catchError, 
  tap,
  filter
} from 'rxjs/operators';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { CriteriaDSL } from '../../interfaces/criteria-dsl.interface';
import { 
  SqlGenerationResult, 
  CriteriaPreviewResult,
  ValidationResult
} from '../../interfaces/validation.interface';
import { CriteriaValidationService } from '../../services/criteria-validation.service';

/**
 * Configuration for SQL preview component
 */
export interface SqlPreviewConfig {
  /** Whether to show SQL tab */
  showSqlTab: boolean;
  
  /** Whether to show human-readable preview tab */
  showPreviewTab: boolean;
  
  /** Whether to show validation tab */
  showValidationTab: boolean;
  
  /** Whether to enable syntax highlighting */
  enableSyntaxHighlighting: boolean;
  
  /** Whether to enable copy to clipboard */
  enableCopyToClipboard: boolean;
  
  /** Whether to enable SQL formatting */
  enableSqlFormatting: boolean;
  
  /** Maximum height for preview panels */
  maxHeight: string;
  
  /** Whether to auto-refresh on criteria changes */
  autoRefresh: boolean;
  
  /** Debounce time for auto-refresh in milliseconds */
  refreshDebounceMs: number;
}

/**
 * SQL Preview component that displays generated SQL, human-readable preview,
 * and validation results for criteria DSL
 */
@Component({
  selector: 'mp-sql-preview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PanelModule,
    TabsModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    PopoverModule,
    ScrollPanelModule
  ],
  templateUrl: './sql-preview.component.html',
  styleUrls: ['./sql-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SqlPreviewComponent implements OnInit, OnDestroy {
  @Input() criteria: CriteriaDSL | null = null;
  @Input() config: Partial<SqlPreviewConfig> = {};
  @Input() visible: boolean = true;
  @Input() collapsed: boolean = false;

  @Output() sqlGenerated = new EventEmitter<SqlGenerationResult>();
  @Output() previewGenerated = new EventEmitter<CriteriaPreviewResult>();
  @Output() validationCompleted = new EventEmitter<ValidationResult>();
  @Output() errorOccurred = new EventEmitter<string>();

  @ViewChild('sqlCodeBlock', { static: false }) sqlCodeBlock?: ElementRef<HTMLElement>;
  @ViewChild('previewPanel', { static: false }) previewPanel?: ElementRef<HTMLElement>;

  // Configuration with defaults
  readonly defaultConfig: SqlPreviewConfig = {
    showSqlTab: true,
    showPreviewTab: true,
    showValidationTab: true,
    enableSyntaxHighlighting: true,
    enableCopyToClipboard: true,
    enableSqlFormatting: true,
    maxHeight: '400px',
    autoRefresh: true,
    refreshDebounceMs: 500
  };

  // Component state
  private destroy$ = new Subject<void>();
  private criteriaSubject = new BehaviorSubject<CriteriaDSL | null>(null);
  
  // Data observables
  sqlResult$ = new BehaviorSubject<SqlGenerationResult | null>(null);
  previewResult$ = new BehaviorSubject<CriteriaPreviewResult | null>(null);
  validationResult$ = new BehaviorSubject<ValidationResult | null>(null);
  
  // Loading states
  isLoadingSql$ = new BehaviorSubject<boolean>(false);
  isLoadingPreview$ = new BehaviorSubject<boolean>(false);
  isLoadingValidation$ = new BehaviorSubject<boolean>(false);
  
  // Error states
  sqlError$ = new BehaviorSubject<string | null>(null);
  previewError$ = new BehaviorSubject<string | null>(null);
  validationError$ = new BehaviorSubject<string | null>(null);

  // UI state
  activeTabIndex = 0;
  mergedConfig!: SqlPreviewConfig;

  constructor(
    private validationService: CriteriaValidationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mergedConfig = { ...this.defaultConfig, ...this.config };
    this.setupCriteriaWatcher();
    this.setupValidationSubscriptions();
    
    // Initialize with current criteria if provided
    if (this.criteria) {
      this.criteriaSubject.next(this.criteria);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update criteria and trigger refresh
   */
  updateCriteria(criteria: CriteriaDSL | null): void {
    this.criteria = criteria;
    this.criteriaSubject.next(criteria);
  }

  /**
   * Manually refresh all previews
   */
  refresh(): void {
    if (this.criteria) {
      this.generateSql();
      this.generatePreview();
      this.validateCriteria();
    }
  }

  /**
   * Generate SQL preview
   */
  generateSql(): void {
    if (!this.criteria) {
      this.sqlResult$.next(null);
      return;
    }

    this.isLoadingSql$.next(true);
    this.sqlError$.next(null);

    this.validationService.generateSqlImmediate(this.criteria).pipe(
      takeUntil(this.destroy$),
      tap(result => {
        this.sqlResult$.next(result);
        this.sqlGenerated.emit(result);
        this.isLoadingSql$.next(false);
        
        if (!result.success && result.error) {
          this.sqlError$.next(result.error);
          this.errorOccurred.emit(result.error);
        }
        
        this.cdr.markForCheck();
      }),
      catchError(error => {
        const errorMessage = 'Failed to generate SQL preview';
        this.sqlError$.next(errorMessage);
        this.errorOccurred.emit(errorMessage);
        this.isLoadingSql$.next(false);
        this.cdr.markForCheck();
        throw error;
      })
    ).subscribe();
  }

  /**
   * Generate human-readable preview
   */
  generatePreview(): void {
    if (!this.criteria) {
      this.previewResult$.next(null);
      return;
    }

    this.isLoadingPreview$.next(true);
    this.previewError$.next(null);

    this.validationService.generatePreviewImmediate(this.criteria).pipe(
      takeUntil(this.destroy$),
      tap(result => {
        this.previewResult$.next(result);
        this.previewGenerated.emit(result);
        this.isLoadingPreview$.next(false);
        
        if (!result.success && result.error) {
          this.previewError$.next(result.error);
          this.errorOccurred.emit(result.error);
        }
        
        this.cdr.markForCheck();
      }),
      catchError(error => {
        const errorMessage = 'Failed to generate criteria preview';
        this.previewError$.next(errorMessage);
        this.errorOccurred.emit(errorMessage);
        this.isLoadingPreview$.next(false);
        this.cdr.markForCheck();
        throw error;
      })
    ).subscribe();
  }

  /**
   * Validate criteria
   */
  validateCriteria(): void {
    if (!this.criteria) {
      this.validationResult$.next(null);
      return;
    }

    this.isLoadingValidation$.next(true);
    this.validationError$.next(null);

    this.validationService.validateCriteriaImmediate(this.criteria).pipe(
      takeUntil(this.destroy$),
      tap(result => {
        this.validationResult$.next(result);
        this.validationCompleted.emit(result);
        this.isLoadingValidation$.next(false);
        this.cdr.markForCheck();
      }),
      catchError(error => {
        const errorMessage = 'Failed to validate criteria';
        this.validationError$.next(errorMessage);
        this.errorOccurred.emit(errorMessage);
        this.isLoadingValidation$.next(false);
        this.cdr.markForCheck();
        throw error;
      })
    ).subscribe();
  }

  /**
   * Copy SQL to clipboard
   */
  async copySqlToClipboard(): Promise<void> {
    const sqlResult = this.sqlResult$.value;
    if (!sqlResult || !sqlResult.sql) {
      return;
    }

    try {
      await navigator.clipboard.writeText(sqlResult.sql);
      // Could emit success event or show toast here
    } catch (error) {
      console.error('Failed to copy SQL to clipboard:', error);
      this.errorOccurred.emit('Failed to copy SQL to clipboard');
    }
  }

  /**
   * Copy preview to clipboard
   */
  async copyPreviewToClipboard(): Promise<void> {
    const previewResult = this.previewResult$.value;
    if (!previewResult || !previewResult.description) {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewResult.description);
      // Could emit success event or show toast here
    } catch (error) {
      console.error('Failed to copy preview to clipboard:', error);
      this.errorOccurred.emit('Failed to copy preview to clipboard');
    }
  }

  /**
   * Format SQL for better readability
   */
  formatSql(sql: string): string {
    if (!this.mergedConfig.enableSqlFormatting) {
      return sql;
    }

    // Basic SQL formatting - could be enhanced with a proper SQL formatter library
    return sql
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bAND\b/gi, '\n  AND')
      .replace(/\bOR\b/gi, '\n  OR')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .trim();
  }

  /**
   * Get validation summary text
   */
  getValidationSummary(validation: ValidationResult): string {
    const errorCount = validation.errors.length;
    const warningCount = validation.warnings.length;
    
    if (validation.isValid && errorCount === 0 && warningCount === 0) {
      return 'Criteria is valid with no issues';
    }
    
    const parts: string[] = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
    }
    
    return `Validation completed with ${parts.join(' and ')}`;
  }

  /**
   * Get severity icon for validation items
   */
  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error':
        return 'pi pi-times-circle';
      case 'warning':
        return 'pi pi-exclamation-triangle';
      case 'info':
        return 'pi pi-info-circle';
      default:
        return 'pi pi-info';
    }
  }

  /**
   * Get severity class for styling
   */
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'error':
        return 'severity-error';
      case 'warning':
        return 'severity-warning';
      case 'info':
        return 'severity-info';
      default:
        return 'severity-default';
    }
  }

  /**
   * Check if any tab has content
   */
  hasContent(): boolean {
    return !!(this.sqlResult$.value || this.previewResult$.value || this.validationResult$.value);
  }

  /**
   * Check if any operation is loading
   */
  isLoading(): boolean {
    return this.isLoadingSql$.value || this.isLoadingPreview$.value || this.isLoadingValidation$.value;
  }

  // Private helper methods

  private setupCriteriaWatcher(): void {
    if (!this.mergedConfig.autoRefresh) {
      return;
    }

    this.criteriaSubject.pipe(
      debounceTime(this.mergedConfig.refreshDebounceMs),
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      }),
      filter(criteria => criteria !== null),
      takeUntil(this.destroy$)
    ).subscribe(criteria => {
      if (criteria) {
        this.refresh();
      }
    });
  }

  private setupValidationSubscriptions(): void {
    // Subscribe to validation service streams for real-time updates
    this.validationService.getCurrentValidation().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.validationResult$.next(result);
        this.cdr.markForCheck();
      }
    });

    this.validationService.getCurrentSql().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.sqlResult$.next(result);
        this.cdr.markForCheck();
      }
    });

    this.validationService.getCurrentPreview().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.previewResult$.next(result);
        this.cdr.markForCheck();
      }
    });

    this.validationService.getValidationLoadingState().pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoading => {
      this.isLoadingValidation$.next(isLoading);
      this.cdr.markForCheck();
    });
  }
}