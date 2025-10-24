import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef,
  Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
  NgControl
} from '@angular/forms';
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
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CriteriaBuilderComponent),
      multi: true
    }
  ],
  templateUrl: './criteria-builder.component.html',
  styleUrls: ['./criteria-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriteriaBuilderComponent implements ControlValueAccessor, Validator, OnInit, AfterViewInit, OnDestroy {
  @Input() config: Partial<MainCriteriaBuilderConfig> = {};
  @Input() disabled: boolean = false;
  @Input() placeholder: string = 'Click to add criteria...';

  // Core events
  @Output() criteriaChange = new EventEmitter<CriteriaDSL | null>();
  @Output() validationChange = new EventEmitter<ValidationResult>();
  @Output() sqlGenerated = new EventEmitter<SqlGenerationResult>();
  @Output() previewGenerated = new EventEmitter<CriteriaPreviewResult>();
  
  // Form integration events
  @Output() touched = new EventEmitter<boolean>();
  @Output() dirty = new EventEmitter<boolean>();
  @Output() statusChange = new EventEmitter<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>();
  
  // User interaction events
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();
  @Output() chipAdded = new EventEmitter<{chipId: string, type: string}>();
  @Output() chipRemoved = new EventEmitter<{chipId: string, type: string}>();
  @Output() chipModified = new EventEmitter<{chipId: string, type: string, changes: any}>();
  
  // Error and loading events
  @Output() errorOccurred = new EventEmitter<{error: string, context?: any}>();
  @Output() loadingStateChange = new EventEmitter<boolean>();

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

  // Component state and subscriptions
  private destroy$ = new Subject<void>();
  private criteriaSubject = new BehaviorSubject<CriteriaDSL | null>(null);
  private touchedSubject = new BehaviorSubject<boolean>(false);
  private dirtySubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private statusSubject = new BehaviorSubject<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>('VALID');
  
  // Form control integration
  private onChange = (value: CriteriaDSL | null) => {};
  private onTouched = () => {};
  private onValidatorChange = () => {};
  
  // Form control state
  private _disabled = false;
  private _touched = false;
  private _dirty = false;
  public ngControl: NgControl | null = null;
  
  // Current state
  mergedConfig!: MainCriteriaBuilderConfig;
  currentCriteria: CriteriaDSL | null = null;
  currentValidation: ValidationResult | null = null;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  // Validation state
  private validationErrors: ValidationErrors | null = null;

  constructor(
    private validationService: CriteriaValidationService,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {}
  
  ngAfterViewInit(): void {
    // Get reference to NgControl for form integration
    this.ngControl = this.injector.get(NgControl, null);
  }

  ngOnInit(): void {
    this.mergedConfig = { ...this.defaultConfig, ...this.config };
    this.setupValidationService();
    this.setupCriteriaWatcher();
    this.setupStateWatchers();
    this.setupChangeDetectionOptimization();
  }

  ngOnDestroy(): void {
    // Complete all subjects
    this.destroy$.next();
    this.destroy$.complete();
    this.criteriaSubject.complete();
    this.touchedSubject.complete();
    this.dirtySubject.complete();
    this.loadingSubject.complete();
    this.statusSubject.complete();
  }

  // ControlValueAccessor implementation

  writeValue(value: CriteriaDSL | null): void {
    if (value !== this.currentCriteria) {
      this.currentCriteria = value;
      this.criteriaSubject.next(value);
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: (value: CriteriaDSL | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // Validator implementation

  validate(control: AbstractControl): ValidationErrors | null {
    // If no value, check if required
    if (!control.value) {
      return null; // Let required validator handle this
    }

    // Use current validation result if available
    if (this.currentValidation) {
      if (!this.currentValidation.isValid && this.currentValidation.errors.length > 0) {
        const errors: ValidationErrors = {};
        
        // Convert validation errors to Angular form errors
        this.currentValidation.errors.forEach(error => {
          errors[error.code] = {
            message: error.message,
            path: error.path,
            chipId: error.chipId,
            suggestion: error.suggestion
          };
        });
        
        return errors;
      }
    }

    // Perform basic structural validation
    const structuralErrors = this.validateStructure(control.value);
    if (structuralErrors) {
      return structuralErrors;
    }

    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // Public methods

  /**
   * Update criteria programmatically
   */
  updateCriteria(criteria: CriteriaDSL | null): void {
    const hasChanged = JSON.stringify(this.currentCriteria) !== JSON.stringify(criteria);
    
    this.currentCriteria = criteria;
    this.criteriaSubject.next(criteria);
    
    if (hasChanged) {
      this.markAsDirty();
      this.onChange(criteria);
      this.criteriaChange.emit(criteria);
    }
    
    this.markAsTouched();
  }

  /**
   * Mark the control as dirty
   */
  markAsDirty(): void {
    if (!this._dirty) {
      this._dirty = true;
      this.dirtySubject.next(true);
      this.dirty.emit(true);
      this.updateStatus();
    }
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
      this.setLoading(true);
      this.validationService.validateCriteria(this.currentCriteria);
    }
  }

  /**
   * Generate SQL from current criteria
   */
  generateSql(): void {
    if (this.currentCriteria) {
      this.setLoading(true);
      this.validationService.generateSql(this.currentCriteria);
    }
  }

  /**
   * Generate preview from current criteria
   */
  generatePreview(): void {
    if (this.currentCriteria) {
      this.setLoading(true);
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

  /**
   * Get form validation errors for display
   */
  getFormErrors(): Array<{code: string, message: string}> {
    if (!this.ngControl?.control?.errors) {
      return [];
    }

    const errors = this.ngControl.control.errors;
    const formErrors: Array<{code: string, message: string}> = [];

    Object.keys(errors).forEach(key => {
      const error = errors[key];
      
      if (typeof error === 'object' && error.message) {
        formErrors.push({
          code: key,
          message: error.message
        });
      } else {
        // Handle standard Angular validators
        switch (key) {
          case 'required':
            formErrors.push({
              code: 'required',
              message: 'Criteria is required'
            });
            break;
          case 'minlength':
            formErrors.push({
              code: 'minlength',
              message: `Minimum length is ${error.requiredLength}`
            });
            break;
          case 'maxlength':
            formErrors.push({
              code: 'maxlength',
              message: `Maximum length is ${error.requiredLength}`
            });
            break;
          default:
            formErrors.push({
              code: key,
              message: `Validation error: ${key}`
            });
        }
      }
    });

    return formErrors;
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
    
    // Trigger form validation update
    this.onValidatorChange();
    
    // Update status and loading state
    this.setLoading(false);
    this.updateStatus();
    
    this.cdr.markForCheck();
  }

  /**
   * Handle SQL generation results
   */
  onSqlGenerated(result: SqlGenerationResult): void {
    this.sqlGenerated.emit(result);
    this.setLoading(false);
  }

  /**
   * Handle preview generation results
   */
  onPreviewGenerated(result: CriteriaPreviewResult): void {
    this.previewGenerated.emit(result);
    this.setLoading(false);
  }

  /**
   * Handle errors
   */
  onError(error: string): void {
    this.emitError(error);
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
    
    // Note: Subscriptions are handled in setupChangeDetectionOptimization()
    // to avoid duplicate subscriptions and optimize change detection
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
      
      // Trigger form validation update
      this.onValidatorChange();
    });
  }

  // Form state management methods

  /**
   * Mark the control as touched
   */
  markAsTouched(): void {
    if (!this._touched) {
      this._touched = true;
      this.touchedSubject.next(true);
      this.onTouched();
      this.touched.emit(true);
      this.updateStatus();
    }
  }

  /**
   * Check if the control is touched
   */
  get isTouched(): boolean {
    return this._touched;
  }

  /**
   * Check if the control is dirty
   */
  get isDirty(): boolean {
    return this._dirty;
  }

  /**
   * Check if the control is disabled
   */
  get isDisabled(): boolean {
    return this._disabled;
  }

  /**
   * Get form control status classes
   */
  get formControlClasses(): Record<string, boolean> {
    return {
      'ng-touched': this._touched,
      'ng-untouched': !this._touched,
      'ng-dirty': this._dirty,
      'ng-pristine': !this._dirty,
      'ng-valid': this.isValid(),
      'ng-invalid': !this.isValid(),
      'ng-disabled': this._disabled
    };
  }

  // Validation helper methods

  /**
   * Validate the basic structure of criteria
   */
  private validateStructure(criteria: CriteriaDSL | null): ValidationErrors | null {
    if (!criteria) {
      return null;
    }

    const errors: ValidationErrors = {};

    // Check if root exists
    if (!criteria.root) {
      errors['missingRoot'] = {
        message: 'Criteria must have a root group',
        code: 'MISSING_ROOT'
      };
    }

    // Check version
    if (!criteria.version) {
      errors['missingVersion'] = {
        message: 'Criteria must have a version',
        code: 'MISSING_VERSION'
      };
    }

    // Validate root group structure
    if (criteria.root) {
      const rootErrors = this.validateGroup(criteria.root, 'root', 0);
      if (rootErrors) {
        Object.assign(errors, rootErrors);
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Validate a group structure
   */
  private validateGroup(group: any, path: string, depth: number): ValidationErrors | null {
    const errors: ValidationErrors = {};

    // Check maximum depth
    if (depth > this.mergedConfig.maxDepth) {
      errors['maxDepthExceeded'] = {
        message: `Maximum nesting depth of ${this.mergedConfig.maxDepth} exceeded`,
        code: 'MAX_DEPTH_EXCEEDED',
        path
      };
    }

    // Check if operator is valid
    if (!group.operator || !['AND', 'OR', 'NOT'].includes(group.operator)) {
      errors['invalidOperator'] = {
        message: 'Group must have a valid logical operator (AND, OR, NOT)',
        code: 'INVALID_OPERATOR',
        path
      };
    }

    // Check children array
    if (!Array.isArray(group.children)) {
      errors['invalidChildren'] = {
        message: 'Group must have a children array',
        code: 'INVALID_CHILDREN',
        path
      };
    } else {
      // Validate each child
      group.children.forEach((child: any, index: number) => {
        const childPath = `${path}.children[${index}]`;
        
        if (child.operator) {
          // It's a group
          const childErrors = this.validateGroup(child, childPath, depth + 1);
          if (childErrors) {
            Object.assign(errors, childErrors);
          }
        } else {
          // It's a condition
          const conditionErrors = this.validateCondition(child, childPath);
          if (conditionErrors) {
            Object.assign(errors, conditionErrors);
          }
        }
      });

      // Check maximum elements
      const totalElements = this.countElements(group);
      if (totalElements > this.mergedConfig.maxElements) {
        errors['maxElementsExceeded'] = {
          message: `Maximum number of elements (${this.mergedConfig.maxElements}) exceeded`,
          code: 'MAX_ELEMENTS_EXCEEDED',
          path
        };
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Validate a condition structure
   */
  private validateCondition(condition: any, path: string): ValidationErrors | null {
    const errors: ValidationErrors = {};

    // Check if left operand exists
    if (!condition.left) {
      errors['missingLeftOperand'] = {
        message: 'Condition must have a left operand',
        code: 'MISSING_LEFT_OPERAND',
        path
      };
    }

    // Check if operator exists
    if (!condition.operator) {
      errors['missingOperator'] = {
        message: 'Condition must have an operator',
        code: 'MISSING_OPERATOR',
        path
      };
    }

    // Check right operand for binary operators
    if (condition.operator && !this.isUnaryOperator(condition.operator) && !condition.right) {
      errors['missingRightOperand'] = {
        message: 'Binary operator requires a right operand',
        code: 'MISSING_RIGHT_OPERAND',
        path
      };
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Check if an operator is unary
   */
  private isUnaryOperator(operator: string): boolean {
    return ['IS NULL', 'IS NOT NULL'].includes(operator);
  }

  /**
   * Count total elements in criteria structure
   */
  private countElements(group: any): number {
    let count = 1; // Count the group itself
    
    if (Array.isArray(group.children)) {
      group.children.forEach((child: any) => {
        if (child.operator) {
          // It's a group
          count += this.countElements(child);
        } else {
          // It's a condition
          count += 1;
        }
      });
    }
    
    return count;
  }

  // Enhanced setup methods for change detection and state management

  /**
   * Setup state watchers for reactive updates
   */
  private setupStateWatchers(): void {
    // Watch loading state changes
    this.loadingSubject.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
      this.loadingStateChange.emit(loading);
      this.cdr.markForCheck();
    });

    // Watch touched state changes
    this.touchedSubject.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(touched => {
      this._touched = touched;
      this.cdr.markForCheck();
    });

    // Watch dirty state changes
    this.dirtySubject.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(dirty => {
      this._dirty = dirty;
      this.cdr.markForCheck();
    });

    // Watch status changes
    this.statusSubject.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.statusChange.emit(status);
      this.cdr.markForCheck();
    });
  }

  /**
   * Setup change detection optimization
   */
  private setupChangeDetectionOptimization(): void {
    // Optimize validation updates
    this.validationService.getCurrentValidation().pipe(
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        return prev.isValid === curr.isValid && 
               prev.errors.length === curr.errors.length &&
               prev.warnings.length === curr.warnings.length;
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.onValidationCompleted(result);
      }
    });

    // Optimize SQL generation updates
    this.validationService.getCurrentSql().pipe(
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        return prev.sql === curr.sql && prev.success === curr.success;
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.onSqlGenerated(result);
      }
    });

    // Optimize preview generation updates
    this.validationService.getCurrentPreview().pipe(
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        return prev.description === curr.description && prev.success === curr.success;
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.onPreviewGenerated(result);
      }
    });
  }

  /**
   * Update component status based on current state
   */
  private updateStatus(): void {
    let status: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
    
    if (this._disabled) {
      status = 'DISABLED';
    } else if (this.isLoading) {
      status = 'PENDING';
    } else if (this.isValid()) {
      status = 'VALID';
    } else {
      status = 'INVALID';
    }
    
    this.statusSubject.next(status);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.updateStatus();
  }

  /**
   * Handle focus events
   */
  onFocus(): void {
    this.focus.emit();
    this.markAsTouched();
  }

  /**
   * Handle blur events
   */
  onBlur(): void {
    this.blur.emit();
    this.markAsTouched();
  }

  /**
   * Emit chip added event
   */
  emitChipAdded(chipId: string, type: string): void {
    this.chipAdded.emit({ chipId, type });
    this.markAsDirty();
  }

  /**
   * Emit chip removed event
   */
  emitChipRemoved(chipId: string, type: string): void {
    this.chipRemoved.emit({ chipId, type });
    this.markAsDirty();
  }

  /**
   * Emit chip modified event
   */
  emitChipModified(chipId: string, type: string, changes: any): void {
    this.chipModified.emit({ chipId, type, changes });
    this.markAsDirty();
  }

  /**
   * Emit error event
   */
  emitError(error: string, context?: any): void {
    this.errorOccurred.emit({ error, context });
    this.hasError = true;
    this.errorMessage = error;
    this.cdr.markForCheck();
  }
}