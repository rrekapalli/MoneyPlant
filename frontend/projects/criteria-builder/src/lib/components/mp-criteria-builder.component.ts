import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Import interfaces and types
import { CriteriaDSL, FieldMeta, FunctionMeta, ValidationResult, Condition, FieldRef, Literal } from '../models/criteria.models';
import { CriteriaConfig, CriteriaBuilderState } from '../models/config.models';
import { CriteriaChangeEvent, BadgeActionEvent } from '../models/event.models';
import { DEFAULT_CONFIG, OPERATORS_BY_FIELD_TYPE } from '../utils/constants';
import { CriteriaSerializerService } from '../services/criteria-serializer.service';
import { CriteriaValidationService } from '../services/criteria-validation.service';

@Component({
  selector: 'mp-criteria-builder',
  templateUrl: './mp-criteria-builder.component.html',
  styleUrls: ['./mp-criteria-builder.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MpCriteriaBuilderComponent),
      multi: true
    }
  ]
})
export class MpCriteriaBuilderComponent implements ControlValueAccessor, OnInit, OnDestroy {
  
  // Input properties (all data from parent)
  @Input() fields: FieldMeta[] = [];
  @Input() functions: FunctionMeta[] = [];
  @Input() validationResult?: ValidationResult;
  @Input() sqlPreview?: string;
  @Input() config: CriteriaConfig = DEFAULT_CONFIG;
  @Input() initialValue?: CriteriaDSL;
  @Input() disabled = false;
  @Input() readonly = false;

  // Output events
  @Output() dslChange = new EventEmitter<CriteriaDSL>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() validationRequest = new EventEmitter<CriteriaDSL>();
  @Output() sqlRequest = new EventEmitter<CriteriaDSL>();
  @Output() badgeAction = new EventEmitter<BadgeActionEvent>();

  // Component state
  state: CriteriaBuilderState = {
    dsl: null,
    isValid: false,
    sqlPreview: '',
    paramCount: 0,
    selectedBadgeId: undefined,
    editingBadgeId: undefined,
    undoStack: [],
    redoStack: []
  };

  // ControlValueAccessor properties
  private onChange = (value: CriteriaDSL | null) => {};
  private onTouched = () => {};
  private isDisabled = false;

  // Lifecycle management
  private destroy$ = new Subject<void>();

  // Current selection state
  selectedField: FieldMeta | null = null;
  selectedOperator: string | null = null;
  inputValue: any = null;
  availableOperators: string[] = [];

  constructor(
    private criteriaSerializer: CriteriaSerializerService,
    private criteriaValidator: CriteriaValidationService
  ) {}

  ngOnInit(): void {
    // Initialize with initial value if provided
    if (this.initialValue) {
      this.writeValue(this.initialValue);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: CriteriaDSL | null): void {
    this.state.dsl = value;
    this.updateValidity();
    this.emitChange();
  }

  registerOnChange(fn: (value: CriteriaDSL | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // Component methods
  private updateValidity(): void {
    // Basic validation - check if DSL has a root group
    this.state.isValid = this.state.dsl?.root ? true : false;
    this.validityChange.emit(this.state.isValid);
  }

  private emitChange(): void {
    this.onChange(this.state.dsl);
    this.dslChange.emit(this.state.dsl!);
  }

  // Event handlers
  onFieldSelected(fieldId: string): void {
    if (!fieldId) {
      this.selectedField = null;
      this.selectedOperator = null;
      this.availableOperators = [];
      return;
    }

    this.selectedField = this.fields.find(f => f.id === fieldId) || null;
    if (this.selectedField) {
      this.availableOperators = OPERATORS_BY_FIELD_TYPE[this.selectedField.dataType] || [];
      this.selectedOperator = null; // Reset operator when field changes
    }
  }

  onOperatorSelected(operator: string): void {
    this.selectedOperator = operator || null;
  }

  onValueChanged(value: any): void {
    this.inputValue = value;
  }

  onBadgeAction(event: BadgeActionEvent): void {
    this.badgeAction.emit(event);
  }

  // Action methods
  addCondition(): void {
    if (!this.selectedField || !this.selectedOperator || this.inputValue === null) {
      return;
    }

    const condition: Condition = {
      id: this.generateId(),
      left: {
        field: this.selectedField.id,
        id: this.generateId()
      } as FieldRef,
      operator: this.selectedOperator as any,
      right: this.createLiteralFromValue(this.inputValue, this.selectedField.dataType)
    };

    this.addConditionToDSL(condition);
    this.clearCurrentSelection();
  }

  clearCriteria(): void {
    this.state.dsl = this.criteriaSerializer.generateDSL([]);
    this.updateValidity();
    this.emitChange();
    this.clearCurrentSelection();
  }

  private addConditionToDSL(condition: Condition): void {
    if (!this.state.dsl) {
      this.state.dsl = this.criteriaSerializer.generateDSL([condition]);
    } else {
      // Add condition to existing root group
      if (this.state.dsl.root.children) {
        this.state.dsl.root.children.push(condition);
      } else {
        this.state.dsl.root.children = [condition];
      }
    }

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  private createLiteralFromValue(value: any, fieldType: string): Literal {
    let processedValue = value;
    let type = fieldType as any;

    // Process value based on field type
    switch (fieldType) {
      case 'NUMBER':
      case 'INTEGER':
      case 'PERCENT':
      case 'CURRENCY':
        processedValue = parseFloat(value) || 0;
        break;
      case 'BOOLEAN':
        processedValue = value === 'true' || value === true;
        break;
      case 'DATE':
        processedValue = new Date(value).toISOString();
        break;
      case 'STRING':
      case 'ENUM':
      default:
        processedValue = String(value);
        break;
    }

    return {
      value: processedValue,
      type: type,
      id: this.generateId()
    };
  }

  private clearCurrentSelection(): void {
    this.selectedField = null;
    this.selectedOperator = null;
    this.inputValue = null;
    this.availableOperators = [];
  }

  private requestValidation(): void {
    if (this.state.dsl) {
      this.validationRequest.emit(this.state.dsl);
    }
  }

  private requestSQLPreview(): void {
    if (this.state.dsl) {
      this.sqlRequest.emit(this.state.dsl);
    }
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods
  get isDisabledState(): boolean {
    return this.disabled || this.isDisabled || this.readonly;
  }

  get hasFields(): boolean {
    return this.fields && this.fields.length > 0;
  }

  get hasFunctions(): boolean {
    return this.functions && this.functions.length > 0;
  }

  getOperatorLabel(operator: string): string {
    const operatorLabels: Record<string, string> = {
      '=': 'equals',
      '!=': 'not equals',
      '>': 'greater than',
      '>=': 'greater than or equal',
      '<': 'less than',
      '<=': 'less than or equal',
      'LIKE': 'contains',
      'NOT_LIKE': 'does not contain',
      'IN': 'in list',
      'NOT_IN': 'not in list',
      'BETWEEN': 'between',
      'NOT_BETWEEN': 'not between',
      'IS_NULL': 'is null',
      'IS_NOT_NULL': 'is not null'
    };
    return operatorLabels[operator] || operator;
  }

  getInputType(fieldType: string): string {
    switch (fieldType) {
      case 'NUMBER':
      case 'INTEGER':
      case 'PERCENT':
      case 'CURRENCY':
        return 'number';
      case 'DATE':
        return 'date';
      case 'BOOLEAN':
        return 'checkbox';
      default:
        return 'text';
    }
  }

  getInputPlaceholder(fieldType: string): string {
    switch (fieldType) {
      case 'NUMBER':
      case 'INTEGER':
        return 'Enter number...';
      case 'PERCENT':
        return 'Enter percentage...';
      case 'CURRENCY':
        return 'Enter amount...';
      case 'DATE':
        return 'Select date...';
      case 'BOOLEAN':
        return 'true/false';
      case 'STRING':
        return 'Enter text...';
      case 'ENUM':
        return 'Select option...';
      default:
        return 'Enter value...';
    }
  }
}
