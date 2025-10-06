import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectorRef,
  forwardRef
} from '@angular/core';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  FormArray, 
  FormGroup, 
  FormBuilder 
} from '@angular/forms';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { CriteriaDSL, ValidationResult } from '../models/criteria-dsl.interface';
import { BuilderConfig } from '../models/builder-config.interface';
import { FieldMetaResp, OperatorInfo } from '../models/field-meta.interface';
import { FunctionMetaResp } from '../models/function-meta.interface';
import { QueryToken } from '../models/token-system.interface';
import { CriteriaApiService } from '../services/criteria-api.service';
import { CriteriaSerializerService } from '../services/criteria-serializer.service';

/**
 * Main container component implementing ControlValueAccessor for the Criteria Builder
 */
@Component({
  selector: 'ac-criteria-builder',
  standalone: false,
  templateUrl: './ac-criteria-builder.component.html',
  styleUrls: ['./ac-criteria-builder.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AcCriteriaBuilderComponent),
      multi: true
    }
  ]
})
export class AcCriteriaBuilderComponent implements ControlValueAccessor, OnInit, OnDestroy {
  
  // Input properties for config and optional override data
  @Input() config: BuilderConfig = {};
  
  // Output events for validityChange and sqlPreviewChange
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() sqlPreviewChange = new EventEmitter<{sql: string, params: Record<string, any>}>();
  
  // ControlValueAccessor implementation
  private onChange = (value: CriteriaDSL | null) => {};
  private onTouched = () => {};
  disabled = false;
  
  // BehaviorSubject streams for reactive state management
  currentDSL$ = new BehaviorSubject<CriteriaDSL | null>(null);
  isValid$ = new BehaviorSubject<boolean>(false);
  mode$ = new BehaviorSubject<'simple' | 'advanced'>('simple');
  validationResult$ = new BehaviorSubject<ValidationResult | null>(null);
  
  // API-driven data streams
  fields$ = new BehaviorSubject<FieldMetaResp[]>([]);
  functions$ = new BehaviorSubject<FunctionMetaResp[]>([]);
  operators$ = new BehaviorSubject<OperatorInfo[]>([]);
  
  // Visual token representation
  tokenizedQuery$ = new BehaviorSubject<QueryToken[]>([]);
  
  // Form structure with FormArray and FormGroup
  criteriaForm!: FormGroup;
  
  // Component state
  isLoading = false;
  hasApiError = false;
  apiErrorMessage = '';
  
  // Cleanup subject
  private destroy$ = new Subject<void>();
  
  constructor(
    private criteriaApiService: CriteriaApiService,
    private criteriaSerializerService: CriteriaSerializerService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }
  
  ngOnInit(): void {
    this.loadMetadata();
    this.setupValidation();
    this.setupChangeDetection();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // ControlValueAccessor implementation
  
  writeValue(value: CriteriaDSL | null): void {
    if (value) {
      this.currentDSL$.next(value);
      this.updateFormFromDSL(value);
      this.updateTokenizedQuery(value);
    } else {
      const emptyDSL = this.criteriaSerializerService.createEmptyDSL();
      this.currentDSL$.next(emptyDSL);
      this.updateFormFromDSL(emptyDSL);
      this.updateTokenizedQuery(emptyDSL);
    }
  }
  
  registerOnChange(fn: (value: CriteriaDSL | null) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.criteriaForm.disable();
    } else {
      this.criteriaForm.enable();
    }
  }
  
  // Form initialization and management
  
  private initializeForm(): void {
    this.criteriaForm = this.formBuilder.group({
      conditions: this.formBuilder.array([])
    });
  }
  
  private updateFormFromDSL(dsl: CriteriaDSL): void {
    // Convert DSL to form structure
    const conditionsArray = this.criteriaForm.get('conditions') as FormArray;
    conditionsArray.clear();
    
    if (dsl.root && dsl.root.children.length > 0) {
      // For now, create a simple form representation
      // This will be expanded when we implement the full token system
      const conditionGroup = this.formBuilder.group({
        type: ['condition'],
        data: [dsl.root]
      });
      conditionsArray.push(conditionGroup);
    }
  }
  
  // API integration and metadata loading
  
  private loadMetadata(): void {
    this.isLoading = true;
    this.hasApiError = false;
    
    // Load fields from API
    this.criteriaApiService.getFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          this.fields$.next(fields);
          console.log('Loaded fields:', fields.length);
        },
        error: (error) => {
          console.error('Failed to load fields:', error);
          this.handleApiError('Failed to load fields');
        }
      });
    
    // Load functions from API
    this.criteriaApiService.getFunctions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (functions) => {
          this.functions$.next(functions);
          console.log('Loaded functions:', functions.length);
        },
        error: (error) => {
          console.error('Failed to load functions:', error);
          this.handleApiError('Failed to load functions');
        }
      });
    
    // Load operators from API
    this.criteriaApiService.getAllOperators()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (operators) => {
          this.operators$.next(operators);
          console.log('Loaded operators:', operators.length);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load operators:', error);
          this.handleApiError('Failed to load operators');
          this.isLoading = false;
        }
      });
  }
  
  private handleApiError(message: string): void {
    this.hasApiError = true;
    this.apiErrorMessage = message;
    // Continue with fallback behavior - the API service provides fallback data
  }
  
  // Validation and change detection setup
  
  private setupValidation(): void {
    // Combine DSL changes with metadata to perform validation
    combineLatest([
      this.currentDSL$,
      this.fields$,
      this.functions$
    ]).pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(([dsl, fields, functions]) => {
      if (dsl) {
        this.validateDSL(dsl, fields, functions);
      }
    });
  }
  
  private setupChangeDetection(): void {
    // Set up debounced change detection (200ms)
    this.currentDSL$.pipe(
      takeUntil(this.destroy$),
      debounceTime(this.config.debounceMs || 200),
      distinctUntilChanged()
    ).subscribe((dsl) => {
      if (dsl) {
        this.onChange(dsl);
        this.onTouched();
        this.updateTokenizedQuery(dsl);
        this.generateSqlPreview(dsl);
      }
    });
    
    // Listen to form changes and update DSL
    this.criteriaForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(this.config.debounceMs || 200)
    ).subscribe(() => {
      this.updateDSLFromForm();
    });
  }
  
  private validateDSL(dsl: CriteriaDSL, fields: FieldMetaResp[], functions: FunctionMetaResp[]): void {
    // Convert API response types to expected types for validation
    const fieldMetas = fields.map(f => ({
      id: f.id,
      label: f.label,
      dbColumn: f.dbColumn,
      dataType: f.dataType,
      allowedOps: f.allowedOps,
      category: f.category,
      description: f.description,
      example: f.example
    }));
    
    const functionMetas = functions.map(f => ({
      id: f.id,
      label: f.label,
      returnType: f.returnType,
      params: [], // Will be loaded separately when needed
      category: f.category,
      description: f.description,
      examples: f.examples
    }));
    
    const validationResult = this.criteriaSerializerService.validateDSL(dsl, fieldMetas, functionMetas);
    this.validationResult$.next(validationResult);
    this.isValid$.next(validationResult.isValid);
    this.validityChange.emit(validationResult.isValid);
  }
  
  private updateDSLFromForm(): void {
    // Convert form data back to DSL
    const formValue = this.criteriaForm.value;
    const currentDSL = this.currentDSL$.value;
    
    if (currentDSL) {
      // For now, keep the current DSL structure
      // This will be expanded when we implement the full token editing system
      this.currentDSL$.next({ ...currentDSL });
    }
  }
  
  private updateTokenizedQuery(dsl: CriteriaDSL): void {
    const tokens = this.criteriaSerializerService.dslToTokens(dsl);
    this.tokenizedQuery$.next(tokens);
  }
  
  private generateSqlPreview(dsl: CriteriaDSL): void {
    // Generate SQL preview using API service
    this.criteriaApiService.generateSql(dsl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.sqlPreviewChange.emit({
            sql: result.sql,
            params: result.parameters
          });
        },
        error: (error) => {
          console.error('Failed to generate SQL preview:', error);
          // Emit empty preview on error
          this.sqlPreviewChange.emit({
            sql: '',
            params: {}
          });
        }
      });
  }
  
  // Public methods for component interaction
  
  /**
   * Add a new condition to the criteria
   */
  addCondition(): void {
    const currentDSL = this.currentDSL$.value;
    if (currentDSL) {
      // Create a new empty condition
      const newCondition = {
        left: { fieldId: '' },
        op: '=' as const,
        right: { type: 'string' as const, value: '' }
      };
      
      currentDSL.root.children.push(newCondition);
      this.currentDSL$.next({ ...currentDSL });
    }
  }
  
  /**
   * Clear all conditions
   */
  clearAll(): void {
    const emptyDSL = this.criteriaSerializerService.createEmptyDSL();
    this.writeValue(emptyDSL);
  }
  
  /**
   * Switch between simple and advanced modes
   */
  setMode(mode: 'simple' | 'advanced'): void {
    this.mode$.next(mode);
  }
  
  /**
   * Get current mode
   */
  getCurrentMode(): 'simple' | 'advanced' {
    return this.mode$.value;
  }
  
  /**
   * Get current validation state
   */
  getValidationResult(): ValidationResult | null {
    return this.validationResult$.value;
  }
  
  /**
   * Get current tokenized query
   */
  getTokenizedQuery(): QueryToken[] {
    return this.tokenizedQuery$.value;
  }
  
  // Event handlers for template
  
  /**
   * Handle DSL changes from child components
   */
  onDslChange(dsl: CriteriaDSL): void {
    this.currentDSL$.next(dsl);
  }
  
  /**
   * Handle token selection from query display
   */
  onTokenSelect(token: QueryToken): void {
    // Token selection logic will be implemented when we build the token display component
    console.log('Token selected:', token);
  }
  
  /**
   * Handle DSL import from toolbar
   */
  onImportDSL(dsl: CriteriaDSL): void {
    this.writeValue(dsl);
  }
  
  /**
   * Handle DSL export from toolbar
   */
  onExportDSL(): void {
    // Export is handled entirely by the toolbar component
    // This event is just for notification/logging if needed
    console.log('DSL exported');
  }
  
  /**
   * Handle SQL preview toggle from toolbar
   */
  onSqlPreviewToggle(show: boolean): void {
    // Update config to reflect SQL preview state
    this.config = { ...this.config, showSqlPreview: show };
  }
}