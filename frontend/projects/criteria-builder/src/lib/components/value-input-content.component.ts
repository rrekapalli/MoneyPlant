import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { FieldMeta } from '../models/field-meta.interface';

export interface ValueInputConfiguration {
  value: any;
  isValid: boolean;
  formattedValue?: string;
}

/**
 * Value input content component for different value types
 * Provides specialized inputs for numeric, date, enum, multi-select values
 */
@Component({
  selector: 'ac-value-input-content',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './value-input-content.component.html',
  styleUrls: ['./value-input-content.component.scss']
})
export class ValueInputContentComponent implements OnInit, OnDestroy {
  @Input() valueType: string = 'string';
  @Input() currentValue: any = null;
  @Input() operator: string = '=';
  @Input() fieldMeta: FieldMeta | null = null;
  @Input() suggestions: any[] = [];
  @Input() allowMultiple: boolean = false;
  
  @Output() valueConfirm = new EventEmitter<ValueInputConfiguration>();
  @Output() valueCancel = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<any>();
  
  valueForm: FormGroup;
  isValid = false;
  previewText = '';
  
  // Type-specific options
  enumOptions: any[] = [];
  dateFormat = 'yy-mm-dd';
  numberStep = 1;
  minValue: number | null = null;
  maxValue: number | null = null;
  
  // Multi-select state
  selectedValues: any[] = [];
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.valueForm = this.fb.group({
      value: ['']
    });
  }
  
  ngOnInit() {
    this.initializeInput();
    this.setupValidation();
    this.setupValueChanges();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Initializes input based on value type and field metadata
   */
  private initializeInput() {
    // Set up type-specific configurations
    this.configureForValueType();
    
    // Set initial value
    this.setInitialValue();
    
    // Set up validators
    this.setupValidators();
  }
  
  /**
   * Configures input based on value type
   */
  private configureForValueType() {
    switch (this.valueType) {
      case 'number':
      case 'integer':
        this.configureNumericInput();
        break;
      case 'date':
        this.configureDateInput();
        break;
      case 'enum':
        this.configureEnumInput();
        break;
      case 'boolean':
        this.configureBooleanInput();
        break;
      case 'percent':
        this.configurePercentInput();
        break;
      case 'currency':
        this.configureCurrencyInput();
        break;
      default:
        this.configureStringInput();
        break;
    }
    
    // Check if multiple values are allowed based on operator
    this.allowMultiple = this.isMultiValueOperator();
  }
  
  /**
   * Configures numeric input
   */
  private configureNumericInput() {
    if (this.fieldMeta?.validation) {
      this.minValue = this.fieldMeta.validation.min || null;
      this.maxValue = this.fieldMeta.validation.max || null;
    }
    
    this.numberStep = this.valueType === 'integer' ? 1 : 0.01;
  }
  
  /**
   * Configures date input
   */
  private configureDateInput() {
    this.dateFormat = 'yy-mm-dd';
    // Could be extended to support different date formats
  }
  
  /**
   * Configures enum input
   */
  private configureEnumInput() {
    // Use suggestions as enum options if available
    if (this.suggestions && this.suggestions.length > 0) {
      this.enumOptions = this.suggestions.map(suggestion => ({
        label: suggestion.label || suggestion.toString(),
        value: suggestion.value || suggestion
      }));
    } else {
      // Default enum options (would typically come from API)
      this.enumOptions = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ];
    }
  }
  
  /**
   * Configures boolean input
   */
  private configureBooleanInput() {
    this.enumOptions = [
      { label: 'True', value: true },
      { label: 'False', value: false }
    ];
  }
  
  /**
   * Configures percent input
   */
  private configurePercentInput() {
    this.numberStep = 0.01;
    this.minValue = 0;
    this.maxValue = 100;
  }
  
  /**
   * Configures currency input
   */
  private configureCurrencyInput() {
    this.numberStep = 0.01;
    this.minValue = 0;
  }
  
  /**
   * Configures string input
   */
  private configureStringInput() {
    // String input is the default, no special configuration needed
  }
  
  /**
   * Sets initial value in form
   */
  private setInitialValue() {
    if (this.currentValue !== null && this.currentValue !== undefined) {
      if (this.allowMultiple && Array.isArray(this.currentValue)) {
        this.selectedValues = [...this.currentValue];
        this.valueForm.patchValue({ value: this.currentValue });
      } else {
        this.valueForm.patchValue({ value: this.currentValue });
      }
    }
  }
  
  /**
   * Sets up form validators based on value type and field metadata
   */
  private setupValidators() {
    const validators = [];
    
    // Required validator (always required for value input)
    validators.push(Validators.required);
    
    // Type-specific validators
    switch (this.valueType) {
      case 'number':
      case 'integer':
        if (this.minValue !== null) {
          validators.push(Validators.min(this.minValue));
        }
        if (this.maxValue !== null) {
          validators.push(Validators.max(this.maxValue));
        }
        break;
      case 'string':
        if (this.fieldMeta?.validation?.pattern) {
          validators.push(Validators.pattern(this.fieldMeta.validation.pattern));
        }
        break;
    }
    
    // Custom validators from field metadata
    if (this.fieldMeta?.validation) {
      validators.push(this.createCustomValidator(this.fieldMeta.validation));
    }
    
    this.valueForm.get('value')?.setValidators(validators);
    this.valueForm.get('value')?.updateValueAndValidity();
  }
  
  /**
   * Creates custom validator from field validation rules
   */
  private createCustomValidator(validationRules: any) {
    return (control: AbstractControl) => {
      const value = control.value;
      
      if (!value) return null; // Let required validator handle empty values
      
      // String length validation
      if (validationRules.minLength && value.length < validationRules.minLength) {
        return { minLength: { requiredLength: validationRules.minLength, actualLength: value.length } };
      }
      
      if (validationRules.maxLength && value.length > validationRules.maxLength) {
        return { maxLength: { requiredLength: validationRules.maxLength, actualLength: value.length } };
      }
      
      return null;
    };
  }
  
  /**
   * Sets up form validation monitoring
   */
  private setupValidation() {
    this.valueForm.statusChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.isValid = status === 'VALID';
      this.updatePreview();
    });
  }
  
  /**
   * Sets up value change monitoring
   */
  private setupValueChanges() {
    this.valueForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(formValue => {
      this.valueChange.emit(formValue.value);
      this.updatePreview();
    });
  }
  
  /**
   * Updates preview text
   */
  private updatePreview() {
    const value = this.valueForm.get('value')?.value;
    
    if (value === null || value === undefined || value === '') {
      this.previewText = '';
      return;
    }
    
    switch (this.valueType) {
      case 'percent':
        this.previewText = `${value}%`;
        break;
      case 'currency':
        this.previewText = `$${value}`;
        break;
      case 'date':
        if (value instanceof Date) {
          this.previewText = value.toLocaleDateString();
        } else {
          this.previewText = value.toString();
        }
        break;
      default:
        if (Array.isArray(value)) {
          this.previewText = value.join(', ');
        } else {
          this.previewText = value.toString();
        }
        break;
    }
  }
  
  /**
   * Checks if operator allows multiple values
   */
  private isMultiValueOperator(): boolean {
    return ['IN', 'NOT_IN', 'BETWEEN'].includes(this.operator);
  }
  
  /**
   * Handles multi-select value changes
   */
  onMultiSelectChange(selectedValues: any[]) {
    this.selectedValues = selectedValues;
    this.valueForm.patchValue({ value: selectedValues });
  }
  
  /**
   * Gets validation error message
   */
  getErrorMessage(): string {
    const control = this.valueForm.get('value');
    const errors = control?.errors;
    
    if (!errors) return '';
    
    if (errors['required']) return 'Value is required';
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['minLength']) return `Minimum length is ${errors['minLength'].requiredLength}`;
    if (errors['maxLength']) return `Maximum length is ${errors['maxLength'].requiredLength}`;
    if (errors['pattern']) return 'Invalid format';
    
    return 'Invalid value';
  }
  
  /**
   * Checks if form has specific error
   */
  hasError(errorType: string): boolean {
    const control = this.valueForm.get('value');
    return control?.hasError(errorType) || false;
  }
  
  /**
   * Gets current form value
   */
  getCurrentValue(): any {
    const value = this.valueForm.get('value')?.value;
    
    // Convert value to appropriate type
    switch (this.valueType) {
      case 'number':
        return Number(value);
      case 'integer':
        return parseInt(value, 10);
      case 'boolean':
        return value === true || value === 'true';
      case 'date':
        return value instanceof Date ? value : new Date(value);
      default:
        return value;
    }
  }
  
  /**
   * Confirms value input
   */
  onConfirm() {
    if (!this.isValid) return;
    
    const configuration: ValueInputConfiguration = {
      value: this.getCurrentValue(),
      isValid: this.isValid,
      formattedValue: this.previewText
    };
    
    this.valueConfirm.emit(configuration);
  }
  
  /**
   * Cancels value input
   */
  onCancel() {
    this.valueCancel.emit();
  }
  
  /**
   * Handles Enter key press
   */
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isValid) {
      event.preventDefault();
      this.onConfirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }
  
  /**
   * Gets formatted value type label
   */
  getValueTypeLabel(): string {
    return this.valueType.charAt(0).toUpperCase() + this.valueType.slice(1);
  }
}