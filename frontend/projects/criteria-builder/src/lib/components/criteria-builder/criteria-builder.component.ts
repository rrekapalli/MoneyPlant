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
  Injector,
  ElementRef,
  ViewChild,
  HostBinding,
  HostListener
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
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

// PrimeNG imports
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

import { CriteriaDSL } from '../../interfaces/criteria-dsl.interface';
import { 
  ValidationResult,
  SqlGenerationResult,
  CriteriaPreviewResult
} from '../../interfaces/validation.interface';

import { CriteriaValidationService } from '../../services/criteria-validation.service';
import { AccessibilityService } from '../../services/accessibility.service';
import { ResponsiveDesignService, DisplayMode, ScreenSize } from '../../services/responsive-design.service';
import { SqlPreviewComponent, SqlPreviewConfig } from '../sql-preview/sql-preview.component';
import { ValidationDisplayComponent } from '../validation-display/validation-display.component';
import { UndoNotificationComponent } from '../undo-notification/undo-notification.component';
import { CustomGroupChipComponent } from '../group-chip/custom-group-chip.component';

import { ResponsiveLayoutDirective } from '../../directives/responsive-layout.directive';
import { BreakpointObserverDirective } from '../../directives/breakpoint-observer.directive';
import { DisplayModeDirective } from '../../directives/display-mode.directive';

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
  
  /** Accessibility configuration */
  accessibility: {
    /** Enable comprehensive keyboard navigation */
    enableKeyboardNavigation: boolean;
    
    /** Enable screen reader announcements */
    enableScreenReaderSupport: boolean;
    
    /** Enable focus management */
    enableFocusManagement: boolean;
    
    /** Enable high contrast mode support */
    enableHighContrastMode: boolean;
    
    /** Enable reduced motion support */
    enableReducedMotion: boolean;
    
    /** Custom ARIA labels */
    customAriaLabels: Record<string, string>;
  };
  
  /** Responsive design configuration */
  responsive: {
    /** Enable responsive design */
    enableResponsiveDesign: boolean;
    
    /** Enable compact mode on small screens */
    enableCompactMode: boolean;
    
    /** Enable container queries */
    enableContainerQueries: boolean;
    
    /** Custom breakpoints */
    customBreakpoints?: Record<string, number>;
    
    /** Force display mode */
    forceDisplayMode?: 'compact' | 'expanded' | 'auto';
  };
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
    TooltipModule,
    SqlPreviewComponent,
    ValidationDisplayComponent,
    UndoNotificationComponent,
    ResponsiveLayoutDirective,
    BreakpointObserverDirective,
    DisplayModeDirective,
    CustomGroupChipComponent
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
  @Input() ariaLabel: string = 'Criteria builder';
  @Input() ariaDescription: string = 'Build complex filtering criteria using visual chips';
  
  @ViewChild('criteriaContainer', { static: true }) criteriaContainer!: ElementRef<HTMLElement>;
  @ViewChild('mainPanel') mainPanel!: ElementRef<HTMLElement>;

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
  @Output() chipClicked = new EventEmitter<{chipId: string, chipType: string}>();
  @Output() chipFocused = new EventEmitter<{chipId: string, chipType: string}>();
  
  // Drag and drop events
  @Output() dragStarted = new EventEmitter<{chipId: string, chipType: string}>();
  @Output() dragEnded = new EventEmitter<{chipId: string, chipType: string}>();
  @Output() dropAccepted = new EventEmitter<{sourceId: string, targetId: string, position: number}>();
  
  // Group and condition management events
  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<string>();
  
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
    },
    accessibility: {
      enableKeyboardNavigation: true,
      enableScreenReaderSupport: true,
      enableFocusManagement: true,
      enableHighContrastMode: true,
      enableReducedMotion: true,
      customAriaLabels: {}
    },
    responsive: {
      enableResponsiveDesign: true,
      enableCompactMode: true,
      enableContainerQueries: true
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
  
  // Accessibility and responsive state
  currentDisplayMode: DisplayMode | null = null;
  currentScreenSize: ScreenSize | null = null;
  isKeyboardNavigationActive = false;
  isHighContrastMode = false;
  isReducedMotionPreferred = false;
  
  // Validation state
  private validationErrors: ValidationErrors | null = null;
  
  // Cleanup function for keyboard navigation
  private keyboardNavigationCleanup?: () => void;

  constructor(
    private validationService: CriteriaValidationService,
    private accessibilityService: AccessibilityService,
    private responsiveService: ResponsiveDesignService,
    private cdr: ChangeDetectorRef,
    private injector: Injector,
    private elementRef: ElementRef<HTMLElement>
  ) {}
  
  ngAfterViewInit(): void {
    // Get reference to NgControl for form integration
    this.ngControl = this.injector.get(NgControl, null);
  }

  ngOnInit(): void {
    this.mergedConfig = { ...this.defaultConfig, ...this.config };
    
    // Initialize with empty criteria if none provided
    if (!this.currentCriteria) {
      this.initializeEmptyCriteria();
    }
    
    this.setupValidationService();
    this.setupCriteriaWatcher();
    this.setupStateWatchers();
    this.setupChangeDetectionOptimization();
    this.setupAccessibilityFeatures();
    this.setupResponsiveDesign();
  }

  ngOnDestroy(): void {
    // Cleanup keyboard navigation
    if (this.keyboardNavigationCleanup) {
      this.keyboardNavigationCleanup();
    }
    
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
   * Initialize empty criteria structure
   */
  private initializeEmptyCriteria(): void {
    const emptyCriteria: CriteriaDSL = {
      root: {
        operator: 'AND',
        children: [],
        id: `group_${Date.now()}`
      },
      version: '1.0.0',
      metadata: {
        createdAt: new Date().toISOString(),
        elementCount: 1,
        maxDepth: 0
      }
    };
    
    this.currentCriteria = emptyCriteria;
    this.criteriaSubject.next(emptyCriteria);
  }

  /**
   * Handle adding first condition
   */
  onAddFirstCondition(): void {
    // If criteria is null, initialize it first
    if (!this.currentCriteria) {
      this.initializeEmptyCriteria();
    }
    
    // The actual condition adding logic should be handled by child components
    // This method just ensures we have a valid criteria structure
  }

  /**
   * Handle adding condition to root group
   */
  onAddConditionToRoot(): void {
    if (!this.currentCriteria) {
      this.initializeEmptyCriteria();
    }
    
    // Emit event for parent components to handle
    this.criteriaChange.emit(this.currentCriteria);
  }

  /**
   * Handle group operator change
   */
  onGroupOperatorChanged(event: { groupId: string; operator: string }): void {
    if (!this.currentCriteria) return;
    
    // Update the operator in the criteria structure
    const group = this.findGroupById(this.currentCriteria.root, event.groupId);
    if (group) {
      group.operator = event.operator as any;
      this.updateCriteria(this.currentCriteria);
    }
  }

  /**
   * Handle adding child to group
   */
  onAddChildToGroup(groupId: string): void {
    // Emit event for parent components to handle
    this.addChild.emit(groupId);
  }

  /**
   * Handle adding sibling to group
   */
  onAddSiblingToGroup(groupId: string): void {
    // Emit event for parent components to handle
    this.addSibling.emit(groupId);
  }

  /**
   * Handle group deletion
   */
  onDeleteGroup(groupId: string): void {
    // Emit event for parent components to handle
    this.deleteRequested.emit(groupId);
  }

  /**
   * Handle chip click
   */
  onChipClicked(event: { chipId: string; chipType: string }): void {
    this.chipClicked.emit(event);
  }

  /**
   * Handle chip focus
   */
  onChipFocused(event: { chipId: string; chipType: string }): void {
    this.chipFocused.emit(event);
  }

  /**
   * Handle drag start
   */
  onDragStarted(event: { chipId: string; chipType: string }): void {
    this.dragStarted.emit(event);
  }

  /**
   * Handle drag end
   */
  onDragEnded(event: { chipId: string; chipType: string }): void {
    this.dragEnded.emit(event);
  }

  /**
   * Handle drop accepted
   */
  onDropAccepted(event: { sourceId: string; targetId: string; position: number }): void {
    this.dropAccepted.emit(event);
  }

  /**
   * Handle adding group to root
   */
  onAddGroupToRoot(): void {
    if (!this.currentCriteria) {
      this.initializeEmptyCriteria();
    }
    
    // Add a new group to the root
    const newGroup: any = {
      operator: 'AND',
      children: [],
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.currentCriteria!.root.children.push(newGroup);
    this.updateCriteria(this.currentCriteria!);
  }

  /**
   * Handle editing a group
   */
  onEditGroup(groupId: string): void {
    // Emit event for parent components to handle
    this.chipClicked.emit({ chipId: groupId, chipType: 'group' });
  }

  /**
   * Handle editing a condition
   */
  onEditCondition(conditionId: string): void {
    // Emit event for parent components to handle
    this.chipClicked.emit({ chipId: conditionId, chipType: 'condition' });
  }

  /**
   * Handle deleting a condition
   */
  onDeleteCondition(conditionId: string): void {
    // Emit event for parent components to handle
    this.deleteRequested.emit(conditionId);
  }

  /**
   * Handle adding condition to a specific group
   */
  onAddConditionToGroup(groupId: string): void {
    // Emit event for parent components to handle
    this.addChild.emit(groupId);
  }

  /**
   * Handle adding group to a specific group
   */
  onAddGroupToGroup(groupId: string): void {
    // Emit event for parent components to handle
    this.addSibling.emit(groupId);
  }

  /**
   * Check if an item is a group
   */
  isGroup(item: any): boolean {
    return item && typeof item === 'object' && item.hasOwnProperty('children') && item.hasOwnProperty('operator');
  }

  /**
   * Get condition summary for display
   */
  getConditionSummary(condition: any): string {
    if (!condition) return 'Empty condition';
    
    const left = condition.left?.field || condition.left?.name || 'Field';
    const operator = condition.operator || '=';
    const right = condition.right?.value || condition.right?.field || condition.right?.name || 'Value';
    
    return `${left} ${operator} ${right}`;
  }

  /**
   * Get children count for a group
   */
  getChildrenCount(item: any): number {
    return (item && item.children) ? item.children.length : 0;
  }

  /**
   * Check if item has children
   */
  hasChildren(item: any): boolean {
    return item && item.children && item.children.length > 0;
  }

  /**
   * Get children array safely
   */
  getChildren(item: any): any[] {
    return (item && item.children) ? item.children : [];
  }

  /**
   * Find group by ID in criteria structure
   */
  private findGroupById(group: any, id: string): any {
    if (group.id === id) {
      return group;
    }
    
    if (group.children) {
      for (const child of group.children) {
        if (child.children) { // It's a group
          const found = this.findGroupById(child, id);
          if (found) return found;
        }
      }
    }
    
    return null;
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

  /**
   * Handle undo execution
   */
  onUndoExecuted(undoData: any): void {
    // Handle undo based on the type of action
    switch (undoData.type) {
      case 'delete':
        this.handleUndoDelete(undoData);
        break;
      case 'move':
        this.handleUndoMove(undoData);
        break;
      case 'edit':
        this.handleUndoEdit(undoData);
        break;
      default:
        console.warn('Unknown undo type:', undoData.type);
    }
  }

  /**
   * Handle undo dismissal
   */
  onUndoDismissed(): void {
    // Optional: Log or track undo dismissals
    console.log('Undo notification dismissed');
  }

  /**
   * Handle undo delete operation
   */
  private handleUndoDelete(undoData: any): void {
    // This would restore a deleted element
    // Implementation depends on the specific data structure
    console.log('Handling undo delete:', undoData);
    this.markAsDirty();
  }

  /**
   * Handle undo move operation
   */
  private handleUndoMove(undoData: any): void {
    // This would restore the original position of a moved element
    // Implementation depends on the specific data structure
    console.log('Handling undo move:', undoData);
    this.markAsDirty();
  }

  /**
   * Handle undo edit operation
   */
  private handleUndoEdit(undoData: any): void {
    // This would restore the previous value of an edited element
    // Implementation depends on the specific data structure
    console.log('Handling undo edit:', undoData);
    this.markAsDirty();
  }

  // Accessibility Methods

  /**
   * Setup accessibility features
   */
  private setupAccessibilityFeatures(): void {
    if (!this.mergedConfig.accessibility.enableKeyboardNavigation) {
      return;
    }

    // Configure accessibility service
    this.accessibilityService.configure({
      enableKeyboardNavigation: this.mergedConfig.accessibility.enableKeyboardNavigation,
      enableScreenReaderAnnouncements: this.mergedConfig.accessibility.enableScreenReaderSupport,
      enableFocusManagement: this.mergedConfig.accessibility.enableFocusManagement,
      enableHighContrastMode: this.mergedConfig.accessibility.enableHighContrastMode,
      enableReducedMotion: this.mergedConfig.accessibility.enableReducedMotion
    });

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Subscribe to accessibility state changes
    this.subscribeToAccessibilityState();

    // Setup ARIA attributes
    this.setupAriaAttributes();

    // Announce component initialization
    this.accessibilityService.announce(
      'Criteria builder loaded and ready for input',
      'polite',
      'low',
      'initialization'
    );
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    if (!this.criteriaContainer) {
      return;
    }

    this.keyboardNavigationCleanup = this.accessibilityService.setupKeyboardNavigation(
      this.criteriaContainer.nativeElement,
      {
        enableArrowKeys: true,
        enableTabNavigation: true,
        enableActivationKeys: true,
        enableEscapeKey: true,
        customKeyBindings: new Map([
          ['Ctrl+Enter', () => this.validateCriteria()],
          ['Ctrl+Shift+C', () => this.clearCriteria()],
          ['Ctrl+Z', () => this.handleUndo()],
          ['F1', () => this.showKeyboardHelp()]
        ])
      }
    );
  }

  /**
   * Subscribe to accessibility state changes
   */
  private subscribeToAccessibilityState(): void {
    // High contrast mode
    this.accessibilityService.isHighContrastMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isHighContrast => {
        this.isHighContrastMode = isHighContrast;
        this.updateAccessibilityClasses();
        this.cdr.markForCheck();
      });

    // Reduced motion
    this.accessibilityService.isReducedMotionPreferred()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isReducedMotion => {
        this.isReducedMotionPreferred = isReducedMotion;
        this.updateAccessibilityClasses();
        this.cdr.markForCheck();
      });

    // Keyboard navigation
    this.accessibilityService.isKeyboardNavigationActive()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isKeyboardActive => {
        this.isKeyboardNavigationActive = isKeyboardActive;
        this.updateAccessibilityClasses();
        this.cdr.markForCheck();
      });
  }

  /**
   * Setup ARIA attributes
   */
  private setupAriaAttributes(): void {
    const element = this.elementRef.nativeElement;
    
    this.accessibilityService.setAriaAttributes(element, {
      'role': 'group',
      'aria-label': this.ariaLabel,
      'aria-describedby': this.generateDescriptionId(),
      'aria-invalid': !this.isValid(),
      'aria-required': this.ngControl?.control?.hasError('required') || false
    });

    // Create description element
    this.createAriaDescription();
  }

  /**
   * Create ARIA description element
   */
  private createAriaDescription(): void {
    const descriptionId = this.generateDescriptionId();
    let descriptionElement = document.getElementById(descriptionId);
    
    if (!descriptionElement) {
      descriptionElement = document.createElement('div');
      descriptionElement.id = descriptionId;
      descriptionElement.className = 'sr-only';
      descriptionElement.textContent = this.ariaDescription;
      document.body.appendChild(descriptionElement);
    }
  }

  /**
   * Generate description ID
   */
  private generateDescriptionId(): string {
    return `criteria-builder-desc-${this.accessibilityService.generateUniqueId()}`;
  }

  /**
   * Update accessibility CSS classes
   */
  private updateAccessibilityClasses(): void {
    const element = this.elementRef.nativeElement;
    
    // High contrast mode
    element.classList.toggle('high-contrast', this.isHighContrastMode);
    
    // Reduced motion
    element.classList.toggle('reduced-motion', this.isReducedMotionPreferred);
    
    // Keyboard navigation
    element.classList.toggle('keyboard-navigation', this.isKeyboardNavigationActive);
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleUndo(): void {
    // Implement undo functionality
    this.accessibilityService.announce('Undo action triggered', 'polite', 'medium');
  }

  /**
   * Show keyboard help
   */
  showKeyboardHelp(): void {
    const helpText = `
      Keyboard shortcuts:
      - Arrow keys: Navigate between elements
      - Enter/Space: Activate buttons
      - Escape: Close popovers
      - Ctrl+Enter: Validate criteria
      - Ctrl+Shift+C: Clear all criteria
      - Ctrl+Z: Undo last action
      - F1: Show this help
    `;
    
    this.accessibilityService.announce(helpText, 'polite', 'high', 'help');
  }

  /**
   * Announce validation changes
   */
  private announceValidationChanges(result: ValidationResult): void {
    if (!this.mergedConfig.accessibility.enableScreenReaderSupport) {
      return;
    }

    if (result.isValid) {
      this.accessibilityService.announceSuccess('Criteria validation passed');
    } else if (result.errors.length > 0) {
      const errorCount = result.errors.length;
      const errorMessage = `Validation failed with ${errorCount} error${errorCount > 1 ? 's' : ''}`;
      this.accessibilityService.announceValidationError('Criteria', errorMessage);
    }

    if (result.warnings.length > 0) {
      const warningCount = result.warnings.length;
      this.accessibilityService.announce(
        `${warningCount} warning${warningCount > 1 ? 's' : ''} found`,
        'polite',
        'medium',
        'validation'
      );
    }
  }

  /**
   * Announce content changes
   */
  private announceContentChange(changeType: 'added' | 'removed' | 'modified', description: string): void {
    if (this.mergedConfig.accessibility.enableScreenReaderSupport) {
      this.accessibilityService.announceContentChange(description, changeType);
    }
  }

  // Responsive Design Methods

  /**
   * Setup responsive design features
   */
  private setupResponsiveDesign(): void {
    if (!this.mergedConfig.responsive.enableResponsiveDesign) {
      return;
    }

    // Configure responsive service
    this.responsiveService.configure({
      breakpoints: this.mergedConfig.responsive.customBreakpoints,
      debounceTime: 150
    });

    // Subscribe to screen size changes
    this.subscribeToResponsiveState();

    // Setup container queries if enabled
    if (this.mergedConfig.responsive.enableContainerQueries) {
      this.setupContainerQueries();
    }

    // Set initial display mode
    this.setInitialDisplayMode();
  }

  /**
   * Subscribe to responsive state changes
   */
  private subscribeToResponsiveState(): void {
    // Screen size changes
    this.responsiveService.getScreenSize()
      .pipe(takeUntil(this.destroy$))
      .subscribe(screenSize => {
        this.currentScreenSize = screenSize;
        this.updateResponsiveClasses();
        this.handleScreenSizeChange(screenSize);
        this.cdr.markForCheck();
      });

    // Display mode changes
    this.responsiveService.getDisplayMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(displayMode => {
        this.currentDisplayMode = displayMode;
        this.updateDisplayModeClasses();
        this.handleDisplayModeChange(displayMode);
        this.cdr.markForCheck();
      });
  }

  /**
   * Setup container queries
   */
  private setupContainerQueries(): void {
    if (!this.criteriaContainer) {
      return;
    }

    this.responsiveService.observeContainer(
      this.criteriaContainer.nativeElement,
      'criteria-builder-main'
    ).pipe(takeUntil(this.destroy$))
    .subscribe(containerInfo => {
      this.handleContainerSizeChange(containerInfo);
    });
  }

  /**
   * Set initial display mode
   */
  private setInitialDisplayMode(): void {
    if (this.mergedConfig.responsive.forceDisplayMode) {
      this.responsiveService.setDisplayMode({
        mode: this.mergedConfig.responsive.forceDisplayMode
      });
    }
  }

  /**
   * Handle screen size changes
   */
  private handleScreenSizeChange(screenSize: ScreenSize): void {
    // Announce screen size changes for accessibility
    if (this.mergedConfig.accessibility.enableScreenReaderSupport) {
      this.accessibilityService.announce(
        `Screen size changed to ${screenSize.breakpoint}`,
        'polite',
        'low',
        'responsive'
      );
    }

    // Adjust validation debounce time based on screen size
    if (screenSize.width < 768) {
      // Increase debounce time on mobile for better performance
      this.mergedConfig.validationDebounceMs = Math.max(this.mergedConfig.validationDebounceMs, 500);
    }
  }

  /**
   * Handle display mode changes
   */
  handleDisplayModeChange(displayMode: DisplayMode): void {
    // Update component configuration based on display mode
    if (displayMode.mode === 'compact') {
      // Disable some features in compact mode for better performance
      this.mergedConfig.showValidationBadges = false;
      this.mergedConfig.enableDragDrop = false;
    } else {
      // Restore features in expanded mode
      this.mergedConfig.showValidationBadges = true;
      this.mergedConfig.enableDragDrop = true;
    }

    // Announce display mode changes
    if (this.mergedConfig.accessibility.enableScreenReaderSupport) {
      this.accessibilityService.announce(
        `Display mode changed to ${displayMode.mode}`,
        'polite',
        'low',
        'responsive'
      );
    }
  }

  /**
   * Handle container size changes
   */
  handleContainerSizeChange(containerInfo: any): void {
    const element = this.elementRef.nativeElement;
    
    // Add container-based classes
    const containerClasses = this.responsiveService.getContainerClasses(containerInfo);
    
    // Remove existing container classes
    element.classList.forEach(className => {
      if (className.startsWith('container-')) {
        element.classList.remove(className);
      }
    });
    
    // Add new container classes
    containerClasses.forEach(className => {
      element.classList.add(className);
    });
  }

  /**
   * Update responsive CSS classes
   */
  private updateResponsiveClasses(): void {
    if (!this.currentScreenSize) {
      return;
    }

    const element = this.elementRef.nativeElement;
    
    // Remove existing breakpoint classes
    element.classList.forEach(className => {
      if (className.startsWith('breakpoint-') || className.startsWith('orientation-')) {
        element.classList.remove(className);
      }
    });
    
    // Add current breakpoint and orientation classes
    element.classList.add(`breakpoint-${this.currentScreenSize.breakpoint}`);
    element.classList.add(`orientation-${this.currentScreenSize.orientation}`);
    
    // Add mobile/desktop class
    if (this.currentScreenSize.width < 768) {
      element.classList.add('mobile');
      element.classList.remove('desktop');
    } else {
      element.classList.add('desktop');
      element.classList.remove('mobile');
    }
  }

  /**
   * Update display mode CSS classes
   */
  private updateDisplayModeClasses(): void {
    if (!this.currentDisplayMode) {
      return;
    }

    const element = this.elementRef.nativeElement;
    
    // Remove existing display mode classes
    element.classList.remove('display-compact', 'display-expanded', 'display-auto');
    element.classList.remove('no-labels', 'no-icons', 'condensed', 'single-column', 'collapsible');
    
    // Add current display mode classes
    element.classList.add(`display-${this.currentDisplayMode.mode}`);
    
    if (!this.currentDisplayMode.showLabels) element.classList.add('no-labels');
    if (!this.currentDisplayMode.showIcons) element.classList.add('no-icons');
    if (this.currentDisplayMode.condensedSpacing) element.classList.add('condensed');
    if (this.currentDisplayMode.singleColumn) element.classList.add('single-column');
    if (this.currentDisplayMode.collapsibleSections) element.classList.add('collapsible');
  }

  // Host Bindings for Accessibility and Responsive Design

  @HostBinding('class.criteria-builder') readonly criteriaBuilderClass = true;
  
  @HostBinding('attr.role') get role(): string {
    return 'group';
  }
  
  @HostBinding('attr.aria-label') get ariaLabelBinding(): string {
    return this.ariaLabel;
  }
  
  @HostBinding('attr.aria-invalid') get ariaInvalid(): boolean {
    return !this.isValid();
  }
  
  @HostBinding('attr.aria-required') get ariaRequired(): boolean {
    return this.ngControl?.control?.hasError('required') || false;
  }
  
  @HostBinding('attr.tabindex') get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  // Host Listeners for Keyboard Navigation

  @HostListener('keydown', ['$event'])
  onHostKeyDown(event: KeyboardEvent): void {
    // Handle global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          this.validateCriteria();
          break;
        case 'c':
          if (event.shiftKey) {
            event.preventDefault();
            this.clearCriteria();
          }
          break;
        case 'z':
          event.preventDefault();
          this.handleUndo();
          break;
      }
    } else if (event.key === 'F1') {
      event.preventDefault();
      this.showKeyboardHelp();
    }
  }

  @HostListener('focusin', ['$event'])
  onHostFocusIn(event: FocusEvent): void {
    this.onFocus();
  }

  @HostListener('focusout', ['$event'])
  onHostFocusOut(event: FocusEvent): void {
    // Only trigger blur if focus is leaving the component entirely
    if (!this.elementRef.nativeElement.contains(event.relatedTarget as Node)) {
      this.onBlur();
    }
  }

  /**
   * Get current responsive and accessibility classes
   */
  getComponentClasses(): string[] {
    const classes: string[] = ['criteria-builder'];
    
    // Accessibility classes
    if (this.isHighContrastMode) classes.push('high-contrast');
    if (this.isReducedMotionPreferred) classes.push('reduced-motion');
    if (this.isKeyboardNavigationActive) classes.push('keyboard-navigation');
    
    // Responsive classes
    if (this.currentScreenSize) {
      classes.push(`breakpoint-${this.currentScreenSize.breakpoint}`);
      classes.push(`orientation-${this.currentScreenSize.orientation}`);
      classes.push(this.currentScreenSize.width < 768 ? 'mobile' : 'desktop');
    }
    
    // Display mode classes
    if (this.currentDisplayMode) {
      classes.push(`display-${this.currentDisplayMode.mode}`);
      if (!this.currentDisplayMode.showLabels) classes.push('no-labels');
      if (!this.currentDisplayMode.showIcons) classes.push('no-icons');
      if (this.currentDisplayMode.condensedSpacing) classes.push('condensed');
      if (this.currentDisplayMode.singleColumn) classes.push('single-column');
      if (this.currentDisplayMode.collapsibleSections) classes.push('collapsible');
    }
    
    // Form state classes
    Object.entries(this.formControlClasses).forEach(([className, isActive]) => {
      if (isActive) classes.push(className);
    });
    
    return classes;
  }

  /**
   * Enhanced validation completed to include accessibility announcements
   */
  onValidationCompletedWithAccessibility(result: ValidationResult): void {
    this.onValidationCompleted(result);
    this.announceValidationChanges(result);
  }

  /**
   * Enhanced criteria change to include accessibility announcements
   */
  onCriteriaChangedWithAccessibility(criteria: CriteriaDSL | null): void {
    const previousCriteria = this.currentCriteria;
    this.onCriteriaChanged(criteria);
    
    // Announce content changes
    if (criteria && !previousCriteria) {
      this.announceContentChange('added', 'First criteria added');
    } else if (!criteria && previousCriteria) {
      this.announceContentChange('removed', 'All criteria cleared');
    } else if (criteria && previousCriteria) {
      this.announceContentChange('modified', 'Criteria modified');
    }
  }

  /**
   * Focus main content area
   */
  focusMainContent(): void {
    const contentElement = document.getElementById('criteria-content');
    if (contentElement) {
      this.accessibilityService.setFocus(contentElement, { preventScroll: false });
    }
  }

  /**
   * Show mobile actions menu
   */
  showMobileActionsMenu(event: Event): void {
    // Implementation for mobile actions menu
    // This could show a popup menu with additional actions
    console.log('Mobile actions menu triggered', event);
  }

  /**
   * Handle breakpoint changes from directive
   */
  handleBreakpointChange(breakpoint: string): void {
    // Update component state based on breakpoint
    console.log('Breakpoint changed to:', breakpoint);
  }

  // Demo event handling methods
  demoEvents: Array<{type: string, data: any}> = [];

  onDemoChipClick(chipId: string): void {
    this.addDemoEvent('chipClick', { chipId });
  }

  onDemoToggleClick(event: {chipId: string, enabled: boolean}): void {
    this.addDemoEvent('toggleClick', event);
  }

  onDemoDeleteClick(chipId: string): void {
    this.addDemoEvent('deleteClick', { chipId });
  }

  onDemoFieldSelected(event: {chipId: string, field: any}): void {
    this.addDemoEvent('fieldSelected', event);
  }

  onDemoOperatorSelected(event: {chipId: string, operator: any}): void {
    this.addDemoEvent('operatorSelected', event);
  }

  onDemoFunctionSelected(event: {chipId: string, function: any}): void {
    this.addDemoEvent('functionSelected', event);
  }

  onDemoIndicatorSelected(event: {chipId: string, indicator: any}): void {
    this.addDemoEvent('indicatorSelected', event);
  }

  private addDemoEvent(type: string, data: any): void {
    this.demoEvents.unshift({ type, data });
    
    // Keep only last 10 events
    if (this.demoEvents.length > 10) {
      this.demoEvents = this.demoEvents.slice(0, 10);
    }
    
    this.cdr.markForCheck();
  }
}