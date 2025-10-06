import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { FunctionMeta } from '../models/function-meta.interface';
import { FieldMeta } from '../models/field-meta.interface';

export interface FunctionParameter {
  name: string;
  type: string;
  required: boolean;
  value: any;
  description?: string;
  validation?: any;
}

export interface FunctionConfiguration {
  functionId: string;
  functionLabel: string;
  parameters: { [key: string]: any };
  isValid: boolean;
}

/**
 * Function dialog content component for configuring database-driven functions
 * Provides function selection, parameter editing, and nested function support
 */
@Component({
  selector: 'ac-function-dialog-content',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './function-dialog-content.component.html',
  styleUrls: ['./function-dialog-content.component.scss']
})
export class FunctionDialogContentComponent implements OnInit, OnDestroy {
  @Input() functions: FunctionMeta[] = [];
  @Input() fields: FieldMeta[] = [];
  @Input() selectedFunction: any = null;
  @Input() allowNestedFunctions: boolean = true;
  
  @Output() functionConfirm = new EventEmitter<FunctionConfiguration>();
  @Output() functionCancel = new EventEmitter<void>();
  
  functionForm: FormGroup;
  selectedFunctionMeta: FunctionMeta | null = null;
  searchTerm = '';
  filteredFunctions: FunctionMeta[] = [];
  categorizedFunctions: { [category: string]: FunctionMeta[] } = {};
  
  // UI State
  currentStep: 'select' | 'configure' = 'select';
  isValid = false;
  previewText = '';
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.functionForm = this.fb.group({
      functionId: ['', Validators.required],
      parameters: this.fb.array([])
    });
  }
  
  ngOnInit() {
    this.setupSearch();
    this.initializeFunctions();
    this.setupFormValidation();
    
    // If a function is pre-selected, configure it
    if (this.selectedFunction) {
      this.selectFunction(this.selectedFunction);
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Initializes function list and categorization
   */
  private initializeFunctions() {
    this.filteredFunctions = [...this.functions];
    this.categorizeFunctions();
  }
  
  /**
   * Categorizes functions for grouped display
   */
  private categorizeFunctions() {
    this.categorizedFunctions = {};
    
    this.filteredFunctions.forEach(func => {
      const category = func.category || 'General';
      if (!this.categorizedFunctions[category]) {
        this.categorizedFunctions[category] = [];
      }
      this.categorizedFunctions[category].push(func);
    });
    
    // Sort categories and functions within categories
    Object.keys(this.categorizedFunctions).forEach(category => {
      this.categorizedFunctions[category].sort((a, b) => a.label.localeCompare(b.label));
    });
  }
  
  /**
   * Sets up search functionality
   */
  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterFunctions(searchTerm);
    });
  }
  
  /**
   * Filters functions based on search term
   */
  private filterFunctions(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredFunctions = [...this.functions];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredFunctions = this.functions.filter(func =>
        func.label.toLowerCase().includes(term) ||
        (func.description && func.description.toLowerCase().includes(term)) ||
        (func.category && func.category.toLowerCase().includes(term))
      );
    }
    
    this.categorizeFunctions();
    this.cdr.detectChanges();
  }
  
  /**
   * Handles search input changes
   */
  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchSubject.next(this.searchTerm);
  }
  
  /**
   * Selects a function and moves to configuration step
   */
  selectFunction(functionMeta: FunctionMeta) {
    this.selectedFunctionMeta = functionMeta;
    this.functionForm.patchValue({ functionId: functionMeta.id });
    this.buildParameterForm();
    this.currentStep = 'configure';
    this.updatePreview();
  }
  
  /**
   * Goes back to function selection
   */
  goBackToSelection() {
    this.currentStep = 'select';
    this.selectedFunctionMeta = null;
    this.functionForm.reset();
  }
  
  /**
   * Builds parameter form based on selected function
   */
  private buildParameterForm() {
    if (!this.selectedFunctionMeta) return;
    
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    parametersArray.clear();
    
    this.selectedFunctionMeta.params.forEach(param => {
      const validators = param.required ? [Validators.required] : [];
      
      // Add type-specific validators
      if (param.validation) {
        // Add custom validators based on validation rules
        validators.push(this.createCustomValidator(param.validation));
      }
      
      const paramControl = this.fb.group({
        name: [param.name],
        type: [param.type],
        required: [param.required],
        value: [param.defaultValue || '', validators],
        description: [param.description || '']
      });
      
      parametersArray.push(paramControl);
    });
  }
  
  /**
   * Creates custom validator based on validation rules
   */
  private createCustomValidator(validationRules: any) {
    return (control: AbstractControl) => {
      const value = control.value;
      
      if (!value && !validationRules.required) {
        return null; // Optional field, no validation needed
      }
      
      // Type validation
      if (validationRules.type) {
        if (!this.validateType(value, validationRules.type)) {
          return { typeError: { expected: validationRules.type, actual: typeof value } };
        }
      }
      
      // Range validation for numbers
      if (validationRules.min !== undefined && value < validationRules.min) {
        return { minError: { min: validationRules.min, actual: value } };
      }
      
      if (validationRules.max !== undefined && value > validationRules.max) {
        return { maxError: { max: validationRules.max, actual: value } };
      }
      
      // Pattern validation for strings
      if (validationRules.pattern && typeof value === 'string') {
        const regex = new RegExp(validationRules.pattern);
        if (!regex.test(value)) {
          return { patternError: { pattern: validationRules.pattern } };
        }
      }
      
      return null;
    };
  }
  
  /**
   * Validates value type
   */
  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'number':
      case 'integer':
        return !isNaN(Number(value));
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false';
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }
  
  /**
   * Sets up form validation monitoring
   */
  private setupFormValidation() {
    this.functionForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isValid = this.functionForm.valid;
      this.updatePreview();
    });
  }
  
  /**
   * Updates function preview text
   */
  private updatePreview() {
    if (!this.selectedFunctionMeta) {
      this.previewText = '';
      return;
    }
    
    const params = this.getParameterValues();
    const paramTexts = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([name, value]) => `${name}: ${value}`);
    
    this.previewText = `${this.selectedFunctionMeta.label}(${paramTexts.join(', ')})`;
  }
  
  /**
   * Gets current parameter values from form
   */
  private getParameterValues(): { [key: string]: any } {
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    const values: { [key: string]: any } = {};
    
    parametersArray.controls.forEach(control => {
      const paramGroup = control as FormGroup;
      const name = paramGroup.get('name')?.value;
      const value = paramGroup.get('value')?.value;
      const type = paramGroup.get('type')?.value;
      
      if (name) {
        values[name] = this.convertValueToType(value, type);
      }
    });
    
    return values;
  }
  
  /**
   * Converts string value to appropriate type
   */
  private convertValueToType(value: any, type: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    switch (type) {
      case 'number':
        return Number(value);
      case 'integer':
        return parseInt(value, 10);
      case 'boolean':
        return value === true || value === 'true';
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }
  
  /**
   * Gets parameter form controls
   */
  get parameterControls() {
    return (this.functionForm.get('parameters') as FormArray).controls;
  }
  
  /**
   * Gets categories for function display
   */
  getCategories(): string[] {
    return Object.keys(this.categorizedFunctions).sort();
  }
  
  /**
   * Gets functions for a specific category
   */
  getFunctionsForCategory(category: string): FunctionMeta[] {
    return this.categorizedFunctions[category] || [];
  }
  
  /**
   * Checks if parameter has validation error
   */
  hasParameterError(index: number, errorType: string): boolean {
    const paramControl = this.parameterControls[index];
    const valueControl = paramControl.get('value');
    return valueControl?.hasError(errorType) || false;
  }
  
  /**
   * Gets parameter validation error message
   */
  getParameterErrorMessage(index: number): string {
    const paramControl = this.parameterControls[index];
    const valueControl = paramControl.get('value');
    const errors = valueControl?.errors;
    
    if (!errors) return '';
    
    if (errors['required']) return 'This parameter is required';
    if (errors['typeError']) return `Expected ${errors['typeError'].expected} type`;
    if (errors['minError']) return `Minimum value is ${errors['minError'].min}`;
    if (errors['maxError']) return `Maximum value is ${errors['maxError'].max}`;
    if (errors['patternError']) return 'Invalid format';
    
    return 'Invalid value';
  }
  
  /**
   * Confirms function configuration
   */
  onConfirm() {
    if (!this.isValid || !this.selectedFunctionMeta) return;
    
    const configuration: FunctionConfiguration = {
      functionId: this.selectedFunctionMeta.id,
      functionLabel: this.selectedFunctionMeta.label,
      parameters: this.getParameterValues(),
      isValid: this.isValid
    };
    
    this.functionConfirm.emit(configuration);
  }
  
  /**
   * Cancels function configuration
   */
  onCancel() {
    this.functionCancel.emit();
  }
  
  /**
   * Handles nested function selection for parameter
   */
  onSelectNestedFunction(parameterIndex: number) {
    // This would open another function dialog for nested function selection
    // Implementation would depend on how nested functions are handled
    console.log('Select nested function for parameter', parameterIndex);
  }
}