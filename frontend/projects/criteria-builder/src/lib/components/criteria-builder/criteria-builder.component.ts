import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// PrimeNG imports
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { CriteriaDSL } from '../../interfaces/criteria-dsl.interface';
import { 
  ValidationResult,
  SqlGenerationResult,
  CriteriaPreviewResult
} from '../../interfaces/validation.interface';

import { CriteriaValidationService } from '../../services/criteria-validation.service';
import { SqlPreviewComponent, SqlPreviewConfig } from '../sql-preview/sql-preview.component';
import { ValidationDisplayComponent } from '../validation-display/validation-display.component';

/**
 * Configuration for the main criteria builder component
 */
export interface MainCriteriaBuilderConfig {
  /** Whether to show SQL preview panel */
  showSqlPreview: boolean;
  
  /** Whether to enable real-time validation */
  enableRealTimeValidation: boolean;
  
  /** Whether to show validation badges on chips */
  showValidationBadges: boolean;
  
  /** Maximum nesting depth for groups */
  maxDepth: number;
  
  /** Maximum number of elements */
  maxElements: number;
  
  /** Whether to enable drag and drop */
  enableDragDrop: boolean;
  
  /** Whether to enable undo functionality */
  enableUndo: boolean;
  
  /** Debounce time for validation in milliseconds */
  validationDebounceMs: number;
  
  /** SQL preview configuration */
  sqlPreviewConfig: Partial<SqlPreviewConfig>;
}

/**
 * Main Criteria Builder Component
 * Integrates all criteria builder functionality including chips, validation, and SQL preview
 */
@Component({
  selector: 'mp-criteria-builder',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    ButtonModule,
    MessageModule,
    SqlPreviewComponent,
    ValidationDisplayComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CriteriaBuilderComponent),
      multi: true
    }
  ],
  templateUrl: './criteria-builder.component.html',
  styleUrls: ['./criteria-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriteriaBuilderComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() config: Partial<MainCriteriaBuilderConfig> = {};
  @Input() disabled: boolean = false;
  @Input() placeholder: string = 'Click to add criteria...';

  @Output() criteriaChange = new EventEmitter<CriteriaDSL | null>();
  @Output() validationChange = new EventEmitter<ValidationResult>();
  @Output() sqlGenerated = new EventEmitter<SqlGenerationResult>();
  @Output() previewGenerated = new EventEmitter<CriteriaPreviewResult>();

  // Configuration with defaults
  readonly defaultConfig: MainCriteriaBuilderConfig = {
    showSqlPreview: true,
    enableRealTimeValidation: true,
    showValidationBadges: true,
    maxDepth: 10,
    maxElements: 100,
    enableDragDrop: true,
    enableUndo: true,
    validationDebounceMs: 300,
    sqlPreviewConfig: {
      showSqlTab: true,
      showPreviewTab: true,
      showValidationTab: true,
      enableSyntaxHighlighting: true,
      enableCopyToClipboard: true,
      autoRefresh: true
    }
  };

  // Component state
  private destroy$ = new Subject<void>();
  private criteriaSubject = new BehaviorSubject<CriteriaDSL | null>(null);
  
  // Form control integration
  private onChange = (value: CriteriaDSL | null) => {};
  private onTouched = () => {};
  
  // Current state
  mergedConfig!: MainCriteriaBuilderConfig;
  currentCriteria: CriteriaDSL | null = null;
  currentValidation: ValidationResult | null = null;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  constructor(
    private validationService: CriteriaValidationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mergedConfig = { ...this.defaultConfig, ...this.config };
    this.setupValidationService();
    this.setupCriteriaWatcher();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation

  writeValue(value: CriteriaDSL | null): void {
    this.currentCriteria = value;
    this.criteriaSubject.next(value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: CriteriaDSL | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // Public methods

  /**
   * Update criteria programmatically
   */
  updateCriteria(criteria: CriteriaDSL | null): void {
    this.currentCriteria = criteria;
    this.criteriaSubject.next(criteria);
    this.onChange(criteria);
    this.criteriaChange.emit(criteria);
    this.onTouched();
  }

  /**
   * Clear all criteria
   */
  clearCriteria(): void {
    this.updateCriteria(null);
  }

  /**
   * Validate current criteria
   */
  validateCriteria(): void {
    if (this.currentCriteria) {
      this.validationService.validateCriteria(this.currentCriteria);
    }
  }

  /**
   * Generate SQL from current criteria
   */
  generateSql(): void {
    if (this.currentCriteria) {
      this.validationService.generateSql(this.currentCriteria);
    }
  }

  /**
   * Generate preview from current criteria
   */
  generatePreview(): void {
    if (this.currentCriteria) {
      this.validationService.generatePreview(this.currentCriteria);
    }
  }

  /**
   * Check if criteria is valid
   */
  isValid(): boolean {
    return this.currentValidation ? this.currentValidation.isValid : false;
  }

  /**
   * Get current validation errors
   */
  getErrors(): any[] {
    return this.currentValidation ? this.currentValidation.errors : [];
  }

  /**
   * Get current validation warnings
   */
  getWarnings(): any[] {
    return this.currentValidation ? this.currentValidation.warnings : [];
  }

  // Event handlers

  /**
   * Handle criteria changes from child components
   */
  onCriteriaChanged(criteria: CriteriaDSL | null): void {
    this.updateCriteria(criteria);
  }

  /**
   * Handle validation results
   */
  onValidationCompleted(result: ValidationResult): void {
    this.currentValidation = result;
    this.validationChange.emit(result);
    this.cdr.markForCheck();
  }

  /**
   * Handle SQL generation results
   */
  onSqlGenerated(result: SqlGenerationResult): void {
    this.sqlGenerated.emit(result);
  }

  /**
   * Handle preview generation results
   */
  onPreviewGenerated(result: CriteriaPreviewResult): void {
    this.previewGenerated.emit(result);
  }

  /**
   * Handle errors
   */
  onError(error: string): void {
    this.hasError = true;
    this.errorMessage = error;
    this.cdr.markForCheck();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  /**
   * Handle adding first condition
   */
  onAddFirstCondition(): void {
    // Create a basic criteria structure
    const newCriteria: CriteriaDSL = {
      root: {
        operator: 'AND',
        children: []
      },
      version: '1.0'
    };
    
    this.updateCriteria(newCriteria);
  }

  // Private helper methods

  private setupValidationService(): void {
    // Configure validation service
    this.validationService.configure({
      debounceMs: this.mergedConfig.validationDebounceMs,
      enableRealTime: this.mergedConfig.enableRealTimeValidation,
      enableCaching: true,
      allowPartial: true
    });

    // Subscribe to validation results
    this.validationService.getCurrentValidation().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.onValidationCompleted(result);
      }
    });

    // Subscribe to SQL generation results
    this.validationService.getCurrentSql().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.onSqlGenerated(result);
      }
    });

    // Subscribe to preview generation results
    this.validationService.getCurrentPreview().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.onPreviewGenerated(result);
      }
    });
  }

  private setupCriteriaWatcher(): void {
    this.criteriaSubject.pipe(
      debounceTime(this.mergedConfig.validationDebounceMs),
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      }),
      takeUntil(this.destroy$)
    ).subscribe(criteria => {
      if (criteria && this.mergedConfig.enableRealTimeValidation) {
        this.validationService.validateCriteria(criteria);
        
        if (this.mergedConfig.showSqlPreview) {
          this.validationService.generateSql(criteria);
          this.validationService.generatePreview(criteria);
        }
      }
    });
  }
}