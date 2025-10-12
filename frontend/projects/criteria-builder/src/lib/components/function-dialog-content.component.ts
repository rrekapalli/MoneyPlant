import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, debounceTime, switchMap, catchError } from 'rxjs/operators';

import { FunctionMeta, FunctionMetaResp, FunctionSignature, ParameterSignature } from '../models/function-meta.interface';
import { FieldMeta } from '../models/field-meta.interface';
import { CriteriaApiService } from '../services/criteria-api.service';

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
 * Provides function selection, parameter editing, and nested function support with API integration
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
  selectedFunctionSignature: FunctionSignature | null = null;
  searchTerm = '';
  filteredFunctions: FunctionMetaResp[] = [];
  categorizedFunctions: { [category: string]: FunctionMetaResp[] } = {};
  
  // API-driven data
  availableFunctions: FunctionMetaResp[] = [];
  isLoadingFunctions = false;
  isLoadingSignature = false;
  
  // UI State
  currentStep: 'select' | 'configure' = 'select';
  isValid = false;
  previewText = '';
  validationErrors: { [paramName: string]: string } = {};
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private criteriaApiService: CriteriaApiService
  ) {
    this.functionForm = this.fb.group({
      functionId: ['', Validators.required],
      parameters: this.fb.array([])
    });
  }
  
  ngOnInit() {
    this.setupSearch();
    this.loadFunctionsFromApi();
    this.setupFormValidation();
    
    // If a function is pre-selected, configure it
    if (this.selectedFunction) {
      this.selectFunctionById(this.selectedFunction.id || this.selectedFunction);
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Loads functions from API using criteria_functions table
   */
  private loadFunctionsFromApi() {
    this.isLoadingFunctions = true;
    
    this.criteriaApiService.getFunctions().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Failed to load functions from API:', error);
        // Fallback to input functions if API fails
        return [];
      })
    ).subscribe({
      next: (functions) => {
        this.availableFunctions = functions;
        this.initializeFunctions();
        this.isLoadingFunctions = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading functions:', error);
        this.isLoadingFunctions = false;
        // Use input functions as fallback
        this.initializeFunctions();
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Initializes function list and categorization using API data or fallback
   */
  private initializeFunctions() {
    // Use API functions if available, otherwise fallback to input functions
    if (this.availableFunctions.length > 0) {
      this.filteredFunctions = [...this.availableFunctions];
    } else {
      // Convert input FunctionMeta to FunctionMetaResp format for consistency
      this.filteredFunctions = this.functions.map(func => ({
        id: func.id,
        label: func.label,
        returnType: func.returnType,
        category: func.category || 'General',
        description: func.description || '',
        examples: func.examples || [],
        paramCount: func.params.length
      }));
    }
    
    this.categorizeFunctions();
  }
  
  /**
   * Categorizes functions for grouped display using database-stored categories
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
    
    // Sort categories alphabetically and functions within categories by label
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
   * Filters functions based on search term using database-stored fields
   */
  private filterFunctions(searchTerm: string) {
    const sourceFunctions = this.availableFunctions.length > 0 ? this.availableFunctions : 
      this.functions.map(func => ({
        id: func.id,
        label: func.label,
        returnType: func.returnType,
        category: func.category || 'General',
        description: func.description || '',
        examples: func.examples || [],
        paramCount: func.params.length
      }));

    if (!searchTerm.trim()) {
      this.filteredFunctions = [...sourceFunctions];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredFunctions = sourceFunctions.filter(func =>
        func.label.toLowerCase().includes(term) ||
        func.description.toLowerCase().includes(term) ||
        func.category.toLowerCase().includes(term) ||
        func.examples.some(example => example.toLowerCase().includes(term))
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
   * Selects a function and loads its signature from API
   */
  selectFunction(functionResp: FunctionMetaResp) {
    this.isLoadingSignature = true;
    this.selectedFunctionSignature = null;
    
    // Load detailed function signature from API
    this.criteriaApiService.getFunctionSignature(functionResp.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (signature) => {
        this.selectedFunctionSignature = signature;
        this.selectedFunctionMeta = this.convertSignatureToMeta(signature);
        this.functionForm.patchValue({ functionId: signature.id });
        this.buildParameterFormFromSignature(signature);
        this.currentStep = 'configure';
        this.isLoadingSignature = false;
        this.updatePreview();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load function signature:', error);
        this.isLoadingSignature = false;
        // Fallback to basic function info
        this.handleSignatureFallback(functionResp);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Selects a function by ID (for pre-selected functions)
   */
  selectFunctionById(functionId: string) {
    const functionResp = this.filteredFunctions.find(f => f.id === functionId);
    if (functionResp) {
      this.selectFunction(functionResp);
    }
  }

  /**
   * Converts FunctionSignature to FunctionMeta for compatibility
   */
  private convertSignatureToMeta(signature: FunctionSignature): FunctionMeta {
    return {
      id: signature.id,
      label: signature.label,
      returnType: signature.returnType,
      params: signature.parameters.map(param => ({
        name: param.name,
        type: param.type,
        required: param.required,
        defaultValue: param.defaultValue,
        description: param.helpText,
        validation: param.validationRules
      })),
      sqlTemplate: signature.sqlTemplate,
      description: signature.description,
      category: signature.category,
      examples: signature.examples
    };
  }

  /**
   * Handles fallback when signature loading fails
   */
  private handleSignatureFallback(functionResp: FunctionMetaResp) {
    // Create basic function meta from response
    this.selectedFunctionMeta = {
      id: functionResp.id,
      label: functionResp.label,
      returnType: functionResp.returnType,
      params: [], // No parameters available without signature
      description: functionResp.description,
      category: functionResp.category,
      examples: functionResp.examples
    };
    
    this.functionForm.patchValue({ functionId: functionResp.id });
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
   * Builds parameter form from API signature with database constraints
   */
  private buildParameterFormFromSignature(signature: FunctionSignature) {
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    parametersArray.clear();
    
    // Sort parameters by order from database
    const sortedParams = [...signature.parameters].sort((a, b) => a.order - b.order);
    
    sortedParams.forEach(param => {
      const validators = param.required ? [Validators.required] : [];
      
      // Add validation rules from database
      if (param.validationRules) {
        validators.push(this.createCustomValidator(param.validationRules));
      }
      
      const paramControl = this.fb.group({
        name: [param.name],
        type: [param.type],
        required: [param.required],
        order: [param.order],
        value: [param.defaultValue || '', validators],
        description: [param.helpText || ''],
        validationRules: [param.validationRules]
      });
      
      parametersArray.push(paramControl);
    });
  }

  /**
   * Builds parameter form based on selected function (fallback method)
   */
  private buildParameterForm() {
    if (!this.selectedFunctionMeta) return;
    
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    parametersArray.clear();
    
    this.selectedFunctionMeta.params.forEach((param, index) => {
      const validators = param.required ? [Validators.required] : [];
      
      // Add type-specific validators
      if (param.validation) {
        validators.push(this.createCustomValidator(param.validation));
      }
      
      const paramControl = this.fb.group({
        name: [param.name],
        type: [param.type],
        required: [param.required],
        order: [index],
        value: [param.defaultValue || '', validators],
        description: [param.description || ''],
        validationRules: [param.validation]
      });
      
      parametersArray.push(paramControl);
    });
  }
  
  /**
   * Creates custom validator based on database validation rules
   */
  private createCustomValidator(validationRules: Record<string, any>) {
    return (control: AbstractControl) => {
      const value = control.value;
      
      if (!value && !validationRules['required']) {
        return null; // Optional field, no validation needed
      }
      
      // Type validation
      if (validationRules['type']) {
        if (!this.validateType(value, validationRules['type'])) {
          return { typeError: { expected: validationRules['type'], actual: typeof value } };
        }
      }
      
      // Range validation for numbers
      if (validationRules['min'] !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue < validationRules['min']) {
          return { minError: { min: validationRules['min'], actual: numValue } };
        }
      }
      
      if (validationRules['max'] !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > validationRules['max']) {
          return { maxError: { max: validationRules['max'], actual: numValue } };
        }
      }
      
      // Pattern validation for strings
      if (validationRules['pattern'] && typeof value === 'string') {
        const regex = new RegExp(validationRules['pattern']);
        if (!regex.test(value)) {
          return { patternError: { pattern: validationRules['pattern'] } };
        }
      }
      
      // Length validation for strings
      if (validationRules['minLength'] && typeof value === 'string' && value.length < validationRules['minLength']) {
        return { minLengthError: { minLength: validationRules['minLength'], actual: value.length } };
      }
      
      if (validationRules['maxLength'] && typeof value === 'string' && value.length > validationRules['maxLength']) {
        return { maxLengthError: { maxLength: validationRules['maxLength'], actual: value.length } };
      }
      
      // Enum validation
      if (validationRules['allowedValues'] && Array.isArray(validationRules['allowedValues'])) {
        if (!validationRules['allowedValues'].includes(value)) {
          return { enumError: { allowedValues: validationRules['allowedValues'] } };
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
   * Sets up form validation monitoring with database constraint validation
   */
  private setupFormValidation() {
    this.functionForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.validateFormWithDatabaseConstraints();
      this.updatePreview();
      this.updateValidationErrors();
    });
  }

  /**
   * Validates form using database constraints and parameter rules
   */
  private validateFormWithDatabaseConstraints() {
    this.isValid = this.functionForm.valid;
    
    if (!this.selectedFunctionSignature && !this.selectedFunctionMeta) {
      this.isValid = false;
      return;
    }
    
    // Additional validation using database constraints
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    let hasValidationErrors = false;
    
    parametersArray.controls.forEach((control, index) => {
      const paramGroup = control as FormGroup;
      const required = paramGroup.get('required')?.value;
      const value = paramGroup.get('value')?.value;
      const validationRules = paramGroup.get('validationRules')?.value;
      
      // Check required parameters using is_required flag from database
      if (required && (!value || value === '')) {
        hasValidationErrors = true;
      }
      
      // Apply database validation rules
      if (validationRules && value) {
        const validationResult = this.validateParameterValue(value, validationRules);
        if (!validationResult.isValid) {
          hasValidationErrors = true;
        }
      }
    });
    
    this.isValid = this.functionForm.valid && !hasValidationErrors;
  }

  /**
   * Validates parameter value against database validation rules
   */
  private validateParameterValue(value: any, validationRules: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Type validation
    if (validationRules['type'] && !this.validateType(value, validationRules['type'])) {
      errors.push(`Invalid type. Expected ${validationRules['type']}`);
    }
    
    // Range validation for numbers
    if (validationRules['min'] !== undefined) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue < validationRules['min']) {
        errors.push(`Value must be at least ${validationRules['min']}`);
      }
    }
    
    if (validationRules['max'] !== undefined) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > validationRules['max']) {
        errors.push(`Value must be at most ${validationRules['max']}`);
      }
    }
    
    // String length validation
    if (validationRules['minLength'] && typeof value === 'string' && value.length < validationRules['minLength']) {
      errors.push(`Minimum length is ${validationRules['minLength']}`);
    }
    
    if (validationRules['maxLength'] && typeof value === 'string' && value.length > validationRules['maxLength']) {
      errors.push(`Maximum length is ${validationRules['maxLength']}`);
    }
    
    // Pattern validation
    if (validationRules['pattern'] && typeof value === 'string') {
      const regex = new RegExp(validationRules['pattern']);
      if (!regex.test(value)) {
        errors.push(`Value does not match required pattern: ${validationRules['pattern']}`);
      }
    }
    
    // Enum validation
    if (validationRules['allowedValues'] && Array.isArray(validationRules['allowedValues'])) {
      if (!validationRules['allowedValues'].includes(value)) {
        errors.push(`Value must be one of: ${validationRules['allowedValues'].join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Updates validation errors for display
   */
  private updateValidationErrors() {
    this.validationErrors = {};
    
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    parametersArray.controls.forEach((control, index) => {
      const paramGroup = control as FormGroup;
      const paramName = paramGroup.get('name')?.value;
      const value = paramGroup.get('value')?.value;
      const validationRules = paramGroup.get('validationRules')?.value;
      
      if (validationRules && value) {
        const validationResult = this.validateParameterValue(value, validationRules);
        if (!validationResult.isValid) {
          this.validationErrors[paramName] = validationResult.errors.join('; ');
        }
      }
    });
  }
  
  /**
   * Updates function preview using database description and examples
   */
  private updatePreview() {
    if (!this.selectedFunctionMeta && !this.selectedFunctionSignature) {
      this.previewText = '';
      return;
    }
    
    const functionInfo = this.selectedFunctionSignature || this.selectedFunctionMeta;
    const params = this.getParameterValues();
    
    // Create parameter display with types and validation status
    const paramTexts = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([name, value]) => {
        const paramType = this.getParameterType(name);
        const formattedValue = this.formatValueForPreview(value, paramType);
        const hasError = this.validationErrors[name];
        return hasError ? `${name}: ${formattedValue} ⚠` : `${name}: ${formattedValue}`;
      });
    
    // Use function label and format preview
    const functionLabel = functionInfo?.label || 'Unknown Function';
    this.previewText = `${functionLabel}(${paramTexts.join(', ')})`;
    
    // Add expected output format using database description
    if (functionInfo?.returnType) {
      this.previewText += ` → ${functionInfo.returnType}`;
    }
    
    // Add description from database if available
    if (functionInfo?.description) {
      this.previewText += `\n\n${functionInfo.description}`;
    }
  }

  /**
   * Gets parameter type for preview formatting
   */
  private getParameterType(paramName: string): string {
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    const paramControl = parametersArray.controls.find(control => 
      control.get('name')?.value === paramName
    );
    return paramControl?.get('type')?.value || 'string';
  }

  /**
   * Formats value for preview display
   */
  private formatValueForPreview(value: any, type: string): string {
    if (value === null || value === undefined) return 'null';
    
    switch (type) {
      case 'string':
        return `"${value}"`;
      case 'date':
        return new Date(value).toISOString().split('T')[0];
      case 'boolean':
        return value.toString();
      default:
        return value.toString();
    }
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
  getFunctionsForCategory(category: string): FunctionMetaResp[] {
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
   * Gets parameter validation error message using database constraints
   */
  getParameterErrorMessage(index: number): string {
    const paramControl = this.parameterControls[index];
    const valueControl = paramControl.get('value');
    const errors = valueControl?.errors;
    const paramName = paramControl.get('name')?.value;
    
    if (!errors) return '';
    
    if (errors['required']) return `${paramName} is required`;
    if (errors['typeError']) return `Expected ${errors['typeError'].expected} type`;
    if (errors['minError']) return `Minimum value is ${errors['minError'].min}`;
    if (errors['maxError']) return `Maximum value is ${errors['maxError'].max}`;
    if (errors['minLengthError']) return `Minimum length is ${errors['minLengthError'].minLength}`;
    if (errors['maxLengthError']) return `Maximum length is ${errors['maxLengthError'].maxLength}`;
    if (errors['patternError']) return `Invalid format. Pattern: ${errors['patternError'].pattern}`;
    if (errors['enumError']) return `Value must be one of: ${errors['enumError'].allowedValues.join(', ')}`;
    
    return 'Invalid value';
  }

  /**
   * Gets parameter help text from database
   */
  getParameterHelpText(index: number): string {
    const paramControl = this.parameterControls[index];
    return paramControl.get('description')?.value || '';
  }

  /**
   * Checks if parameter has validation rules from database
   */
  hasParameterValidationRules(index: number): boolean {
    const paramControl = this.parameterControls[index];
    const validationRules = paramControl.get('validationRules')?.value;
    return validationRules && Object.keys(validationRules).length > 0;
  }

  /**
   * Gets validation rules summary for display
   */
  getValidationRulesSummary(index: number): string {
    const paramControl = this.parameterControls[index];
    const rules = paramControl.get('validationRules')?.value;
    
    if (!rules) return '';
    
    const summaryParts: string[] = [];
    
    if (rules.min !== undefined) summaryParts.push(`min: ${rules.min}`);
    if (rules.max !== undefined) summaryParts.push(`max: ${rules.max}`);
    if (rules.minLength !== undefined) summaryParts.push(`min length: ${rules.minLength}`);
    if (rules.maxLength !== undefined) summaryParts.push(`max length: ${rules.maxLength}`);
    if (rules.pattern) summaryParts.push(`pattern: ${rules.pattern}`);
    if (rules.allowedValues) summaryParts.push(`allowed: ${rules.allowedValues.join(', ')}`);
    
    return summaryParts.join(', ');
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
   * Handles nested function selection for parameter using same API-driven function list
   */
  onSelectNestedFunction(parameterIndex: number) {
    const paramControl = this.parameterControls[parameterIndex];
    const paramName = paramControl.get('name')?.value;
    const paramType = paramControl.get('type')?.value;
    
    // Filter functions that return compatible types
    const compatibleFunctions = this.availableFunctions.filter(func => 
      func.returnType === paramType || this.isTypeCompatible(func.returnType, paramType)
    );
    
    if (compatibleFunctions.length === 0) {
      console.warn(`No functions available that return ${paramType} type for parameter ${paramName}`);
      return;
    }
    
    // Create nested function configuration
    // This would typically open another instance of this dialog or a simplified version
    // For now, we'll emit an event that the parent can handle
    this.functionConfirm.emit({
      functionId: 'nested_function_request',
      functionLabel: `Select function for ${paramName}`,
      parameters: {
        parameterIndex,
        parameterName: paramName,
        expectedType: paramType,
        compatibleFunctions
      },
      isValid: false
    });
  }

  /**
   * Checks if function return type is compatible with parameter type
   */
  private isTypeCompatible(returnType: string, paramType: string): boolean {
    // Define type compatibility rules
    const compatibilityMap: { [key: string]: string[] } = {
      'number': ['integer', 'percent', 'currency'],
      'integer': ['number'],
      'string': ['enum'],
      'date': ['datetime'],
      'boolean': []
    };
    
    return returnType === paramType || 
           (compatibilityMap[paramType] && compatibilityMap[paramType].includes(returnType));
  }

  /**
   * Gets function output format description using database information
   */
  getFunctionOutputFormat(): string {
    const functionInfo = this.selectedFunctionSignature || this.selectedFunctionMeta;
    if (!functionInfo) return '';
    
    let format = `Returns: ${functionInfo.returnType}`;
    
    // Add description from database if available
    if (functionInfo.description) {
      format += `\n${functionInfo.description}`;
    }
    
    // Add examples from database
    if (functionInfo.examples && functionInfo.examples.length > 0) {
      format += `\n\nExamples:\n${functionInfo.examples.join('\n')}`;
    }
    
    return format;
  }

  /**
   * Gets overall validation status for the function configuration
   */
  getValidationStatus(): { isValid: boolean; errorCount: number; warningCount: number } {
    const errorCount = Object.keys(this.validationErrors).length;
    const warningCount = this.getValidationWarnings().length;
    
    return {
      isValid: this.isValid && errorCount === 0,
      errorCount,
      warningCount
    };
  }

  /**
   * Gets validation warnings based on database constraints
   */
  private getValidationWarnings(): string[] {
    const warnings: string[] = [];
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    
    parametersArray.controls.forEach((control) => {
      const paramGroup = control as FormGroup;
      const paramName = paramGroup.get('name')?.value;
      const value = paramGroup.get('value')?.value;
      const validationRules = paramGroup.get('validationRules')?.value;
      const required = paramGroup.get('required')?.value;
      
      // Warn about optional parameters that might affect performance
      if (!required && !value && validationRules?.performanceImpact) {
        warnings.push(`Optional parameter '${paramName}' not set - may impact performance`);
      }
      
      // Warn about deprecated parameter values
      if (validationRules?.deprecatedValues && Array.isArray(validationRules.deprecatedValues)) {
        if (validationRules.deprecatedValues.includes(value)) {
          warnings.push(`Parameter '${paramName}' uses deprecated value '${value}'`);
        }
      }
    });
    
    return warnings;
  }

  /**
   * Gets parameter validation status for individual parameters
   */
  getParameterValidationStatus(index: number): { isValid: boolean; hasWarnings: boolean; errorMessage?: string } {
    const paramControl = this.parameterControls[index];
    const paramName = paramControl.get('name')?.value;
    const valueControl = paramControl.get('value');
    
    const hasFormErrors = valueControl?.invalid && valueControl?.touched;
    const hasValidationErrors = this.validationErrors[paramName];
    const warnings = this.getValidationWarnings().filter(w => w.includes(paramName));
    
    return {
      isValid: !hasFormErrors && !hasValidationErrors,
      hasWarnings: warnings.length > 0,
      errorMessage: hasValidationErrors || (hasFormErrors ? this.getParameterErrorMessage(index) : undefined)
    };
  }

  /**
   * Checks if the current function configuration is complete and valid
   */
  isConfigurationComplete(): boolean {
    if (!this.selectedFunctionSignature && !this.selectedFunctionMeta) {
      return false;
    }
    
    const parametersArray = this.functionForm.get('parameters') as FormArray;
    
    // Check all required parameters are filled
    for (const control of parametersArray.controls) {
      const paramGroup = control as FormGroup;
      const required = paramGroup.get('required')?.value;
      const value = paramGroup.get('value')?.value;
      
      if (required && (!value || value === '')) {
        return false;
      }
    }
    
    // Check no validation errors exist
    return Object.keys(this.validationErrors).length === 0 && this.functionForm.valid;
  }

  /**
   * Gets examples for display in template
   */
  getFunctionExamples(): string[] {
    const functionInfo = this.selectedFunctionSignature || this.selectedFunctionMeta;
    return functionInfo?.examples || [];
  }

  /**
   * Checks if function has examples
   */
  hasFunctionExamples(): boolean {
    const examples = this.getFunctionExamples();
    return examples.length > 0;
  }
}