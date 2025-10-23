import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Import interfaces and types
import { CriteriaDSL, FieldMeta, FunctionMeta, ValidationResult, Condition, FieldRef, Literal, Group } from '../models/criteria.models';
import { CriteriaConfig, CriteriaBuilderState } from '../models/config.models';
import { CriteriaChangeEvent, BadgeActionEvent } from '../models/event.models';
import { DEFAULT_CONFIG, OPERATORS_BY_FIELD_TYPE } from '../utils/constants';
import { CriteriaSerializerService } from '../services/criteria-serializer.service';
import { CriteriaValidationService } from '../services/criteria-validation.service';
import { LogicalOperator } from '../types/criteria.types';

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
  
  // Function selection state
  selectedFunction: FunctionMeta | null = null;
  functionParameters: (FieldRef | Literal)[] = [];
  isFunctionMode = false;

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

  // Function selection methods
  onFunctionSelected(functionId: string): void {
    if (!functionId) {
      this.selectedFunction = null;
      this.functionParameters = [];
      this.isFunctionMode = false;
      return;
    }

    this.selectedFunction = this.functions.find(f => f.id === functionId) || null;
    if (this.selectedFunction) {
      this.isFunctionMode = true;
      this.initializeFunctionParameters();
      this.clearCurrentSelection();
    }
  }

  onFunctionParameterChanged(index: number, value: any, type: 'field' | 'literal'): void {
    if (!this.selectedFunction || index >= this.selectedFunction.parameters.length) {
      return;
    }

    const param = this.selectedFunction.parameters[index];
    
    if (type === 'field') {
      this.functionParameters[index] = {
        field: value,
        id: this.generateId()
      } as FieldRef;
    } else {
      this.functionParameters[index] = {
        value: this.parseParameterValue(value, param.type),
        type: param.type,
        id: this.generateId()
      } as Literal;
    }
  }

  addFunctionCall(): void {
    if (!this.selectedFunction || !this.isFunctionMode) {
      return;
    }

    // Validate function parameters
    const validation = this.criteriaSerializer.validateFunctionCall(
      { function: this.selectedFunction.id, args: this.functionParameters },
      this.selectedFunction
    );

    if (!validation.isValid) {
      console.error('Function validation failed:', validation.errors);
      return;
    }

    const functionCall = this.criteriaSerializer.createFunctionCall(
      this.selectedFunction.id,
      this.functionParameters
    );

    // Create condition with function call
    const condition: Condition = {
      id: this.generateId(),
      left: functionCall,
      operator: '>', // Default operator for function calls
      right: this.createLiteralFromValue(0, 'NUMBER')
    };

    this.addConditionToDSL(condition);
    this.clearFunctionSelection();
  }

  toggleFunctionMode(): void {
    this.isFunctionMode = !this.isFunctionMode;
    if (!this.isFunctionMode) {
      this.clearFunctionSelection();
    }
  }

  private initializeFunctionParameters(): void {
    if (!this.selectedFunction) return;

    this.functionParameters = this.selectedFunction.parameters.map(param => {
      if (param.default !== undefined) {
        return {
          value: param.default,
          type: param.type,
          id: this.generateId()
        } as Literal;
      } else if (param.type === 'FIELD') {
        return {
          field: '',
          id: this.generateId()
        } as FieldRef;
      } else {
        return {
          value: null,
          type: param.type,
          id: this.generateId()
        } as Literal;
      }
    });
  }

  private clearFunctionSelection(): void {
    this.selectedFunction = null;
    this.functionParameters = [];
    this.isFunctionMode = false;
  }

  private parseParameterValue(value: any, type: string): any {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'NUMBER':
      case 'INTEGER':
        return parseFloat(value) || 0;
      case 'BOOLEAN':
        return value === 'true' || value === true;
      case 'DATE':
        return new Date(value).toISOString();
      default:
        return String(value);
    }
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

  addGroup(operator: LogicalOperator = 'AND'): void {
    const newGroup = this.criteriaSerializer.createGroup(operator);
    
    if (!this.state.dsl) {
      // Create new DSL with the group
      this.state.dsl = this.criteriaSerializer.generateDSLFromGroup(newGroup);
    } else {
      // Add group to existing root
      const updatedRoot = this.criteriaSerializer.addGroupToGroup(this.state.dsl.root, newGroup);
      this.state.dsl = this.criteriaSerializer.generateDSLFromGroup(updatedRoot);
    }

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  clearCriteria(): void {
    this.state.dsl = this.criteriaSerializer.generateDSL([]);
    this.updateValidity();
    this.emitChange();
    this.clearCurrentSelection();
  }

  // Group manipulation methods
  addConditionToGroup(groupId: string): void {
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

    this.addConditionToSpecificGroup(groupId, condition);
    this.clearCurrentSelection();
  }

  addGroupToGroup(parentGroupId: string, operator: LogicalOperator = 'AND'): void {
    const newGroup = this.criteriaSerializer.createGroup(operator);
    this.addGroupToSpecificGroup(parentGroupId, newGroup);
  }

  removeElement(elementId: string): void {
    if (!this.state.dsl) return;

    const updatedRoot = this.removeElementFromGroup(this.state.dsl.root, elementId);
    this.state.dsl = this.criteriaSerializer.generateDSLFromGroup(updatedRoot);

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  toggleGroupCollapse(groupId: string): void {
    // This would be handled by the GroupBadgeComponent directly
    // The component can emit events that the parent can listen to
  }

  private addConditionToSpecificGroup(groupId: string, condition: Condition): void {
    if (!this.state.dsl) return;

    const updatedRoot = this.addConditionToGroupById(this.state.dsl.root, groupId, condition);
    this.state.dsl = this.criteriaSerializer.generateDSLFromGroup(updatedRoot);

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  private addGroupToSpecificGroup(parentGroupId: string, childGroup: Group): void {
    if (!this.state.dsl) return;

    const updatedRoot = this.addGroupToGroupById(this.state.dsl.root, parentGroupId, childGroup);
    this.state.dsl = this.criteriaSerializer.generateDSLFromGroup(updatedRoot);

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  private addConditionToGroupById(group: Group, targetGroupId: string, condition: Condition): Group {
    if (group.id === targetGroupId) {
      return this.criteriaSerializer.addConditionToGroup(group, condition);
    }

    return {
      ...group,
      children: (group.children || []).map(child => {
        if (this.isGroup(child)) {
          return this.addConditionToGroupById(child, targetGroupId, condition);
        }
        return child;
      })
    };
  }

  private addGroupToGroupById(group: Group, targetGroupId: string, childGroup: Group): Group {
    if (group.id === targetGroupId) {
      return this.criteriaSerializer.addGroupToGroup(group, childGroup);
    }

    return {
      ...group,
      children: (group.children || []).map(child => {
        if (this.isGroup(child)) {
          return this.addGroupToGroupById(child, targetGroupId, childGroup);
        }
        return child;
      })
    };
  }

  private removeElementFromGroup(group: Group, elementId: string): Group {
    return {
      ...group,
      children: (group.children || []).map(child => {
        if (child.id === elementId) {
          return null; // Mark for removal
        }
        if (this.isGroup(child)) {
          return this.removeElementFromGroup(child, elementId);
        }
        return child;
      }).filter(child => child !== null) as (Condition | Group)[]
    };
  }

  private isCondition(obj: any): obj is Condition {
    return obj && typeof obj === 'object' && 'left' in obj && 'operator' in obj;
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

  // Template utility methods
  trackByElementId(index: number, element: any): string {
    return element.id || index.toString();
  }

  getElementType(element: any): string {
    if (this.isCondition(element)) {
      return 'condition';
    } else if (this.isGroup(element)) {
      return 'group';
    }
    return 'unknown';
  }

  getFieldFromCondition(condition: Condition): FieldMeta | null {
    if (!condition.left || !this.isFieldRef(condition.left)) {
      return null;
    }
    
    return this.fields.find(f => f.id === condition.left.field) || null;
  }

  getFunctionParameterValue(index: number): any {
    const param = this.functionParameters[index];
    if (!param) return '';

    if (this.isFieldRef(param)) {
      return param.field;
    } else if (this.isLiteral(param)) {
      return param.value;
    }
    return '';
  }

  getParameterPlaceholder(param: any): string {
    if (param.default !== undefined) {
      return `Default: ${param.default}`;
    }
    
    switch (param.type) {
      case 'NUMBER':
      case 'INTEGER':
        return 'Enter number...';
      case 'DATE':
        return 'Select date...';
      case 'BOOLEAN':
        return 'true/false';
      case 'STRING':
        return 'Enter text...';
      default:
        return 'Enter value...';
    }
  }

  trackByParameterName(index: number, param: any): string {
    return param.name;
  }

  onGroupBadgeAction(event: BadgeActionEvent): void {
    switch (event.action) {
      case 'add':
        if (event.data?.type === 'condition') {
          this.addConditionToGroup(event.badgeId);
        } else if (event.data?.type === 'group') {
          this.addGroupToGroup(event.badgeId, 'AND');
        }
        break;
      case 'delete':
        this.removeElement(event.badgeId);
        break;
      case 'toggle':
        // Handle group collapse/expand
        break;
      default:
        this.badgeAction.emit(event);
    }
  }

  private isFieldRef(obj: any): obj is FieldRef {
    return obj && typeof obj === 'object' && 'field' in obj;
  }
}
