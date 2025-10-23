import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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

/**
 * MpCriteriaBuilderComponent - A comprehensive criteria builder for creating complex screening conditions
 * 
 * This component provides a visual interface for building criteria using fields, operators, values,
 * functions, and logical groupings (AND, OR, NOT). It supports both simple field-based conditions
 * and complex technical analysis functions with parameter configuration.
 * 
 * Features:
 * - Field-based condition creation (e.g., "close > 100")
 * - Function-based condition creation (e.g., "SMA(close, 20) > 50")
 * - Logical grouping with AND, OR, NOT operators
 * - Drag and drop functionality for reorganizing criteria
 * - Undo/redo support with keyboard shortcuts
 * - Real-time validation and SQL preview generation
 * - Accessibility support with ARIA labels and keyboard navigation
 * - Performance optimizations with OnPush change detection
 * - Comprehensive error handling and user feedback
 * 
 * @example
 * ```html
 * <mp-criteria-builder
 *   [fields]="availableFields"
 *   [functions]="availableFunctions"
 *   [config]="criteriaConfig"
 *   [initialValue]="existingCriteria"
 *   [disabled]="false"
 *   [readonly]="false"
 *   (dslChange)="onCriteriaChange($event)"
 *   (validityChange)="onValidityChange($event)"
 *   (validationRequest)="onValidationRequest($event)"
 *   (sqlRequest)="onSQLRequest($event)"
 *   (badgeAction)="onBadgeAction($event)">
 * </mp-criteria-builder>
 * ```
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const criteriaConfig: CriteriaConfig = {
 *   enableUndo: true,
 *   maxNestingDepth: 10,
 *   validationTimeout: 300,
 *   sqlTimeout: 500
 * };
 * 
 * const availableFields: FieldMeta[] = [
 *   { id: 'close', label: 'Close Price', dataType: 'NUMBER' },
 *   { id: 'volume', label: 'Volume', dataType: 'NUMBER' }
 * ];
 * 
 * const availableFunctions: FunctionMeta[] = [
 *   { 
 *     id: 'SMA', 
 *     name: 'Simple Moving Average', 
 *     description: 'Calculate SMA',
 *     parameters: [
 *       { name: 'field', type: 'FIELD', optional: false },
 *       { name: 'period', type: 'INTEGER', optional: false, min: 1, max: 200 }
 *     ],
 *     returnType: 'NUMBER'
 *   }
 * ];
 * ```
 * 
 * @author MoneyPlant Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Component({
  selector: 'mp-criteria-builder',
  templateUrl: './mp-criteria-builder.component.html',
  styleUrls: ['./mp-criteria-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  /** Available fields for creating conditions */
  @Input() fields: FieldMeta[] = [];
  
  /** Available functions for creating function-based conditions */
  @Input() functions: FunctionMeta[] = [];
  
  /** Current validation result from parent component */
  @Input() validationResult?: ValidationResult;
  
  /** SQL preview from parent component */
  @Input() sqlPreview?: string;
  
  /** Configuration options for the criteria builder */
  @Input() config: CriteriaConfig = DEFAULT_CONFIG;
  
  /** Initial value to populate the criteria builder */
  @Input() initialValue?: CriteriaDSL;
  
  /** Whether the component is disabled */
  @Input() disabled = false;
  
  /** Whether the component is in readonly mode */
  @Input() readonly = false;

  // Output events
  /** Emitted when the DSL changes */
  @Output() dslChange = new EventEmitter<CriteriaDSL>();
  
  /** Emitted when the validity state changes */
  @Output() validityChange = new EventEmitter<boolean>();
  
  /** Emitted when validation is requested */
  @Output() validationRequest = new EventEmitter<CriteriaDSL>();
  
  /** Emitted when SQL preview is requested */
  @Output() sqlRequest = new EventEmitter<CriteriaDSL>();
  
  /** Emitted when a badge action occurs */
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

  // Undo/Redo configuration
  private readonly MAX_UNDO_STACK_SIZE = 50;

  // Drag and drop state
  private draggedElement: any = null;
  private dropTarget: any = null;

  /**
   * Constructor for MpCriteriaBuilderComponent
   * @param criteriaSerializer - Service for serializing criteria to DSL
   * @param criteriaValidator - Service for validating criteria
   * @param cdr - Change detector reference for performance optimization
   */
  constructor(
    private criteriaSerializer: CriteriaSerializerService,
    private criteriaValidator: CriteriaValidationService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Initialize the component and set up keyboard shortcuts
   */
  ngOnInit(): void {
    // Initialize with initial value if provided
    if (this.initialValue) {
      this.writeValue(this.initialValue);
    }

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Clean up resources when component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Keyboard shortcuts functionality
  /**
   * Set up global keyboard shortcuts for the criteria builder
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => this.handleKeyboardShortcut(event));
  }

  /**
   * Handle keyboard shortcuts for the criteria builder
   * @param event - The keyboard event
   */
  private handleKeyboardShortcut(event: KeyboardEvent): void {
    // Only handle shortcuts when component is focused or when Ctrl/Cmd is pressed
    if (!this.isComponentFocused() && !event.ctrlKey && !event.metaKey) {
      return;
    }

    // Prevent default behavior for our shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          if (!event.shiftKey) {
            event.preventDefault();
            this.undo();
          }
          break;
        case 'y':
          event.preventDefault();
          this.redo();
          break;
        case 's':
          event.preventDefault();
          this.saveCriteria();
          break;
        case 'n':
          event.preventDefault();
          this.clearCriteria();
          break;
        case 'a':
          event.preventDefault();
          this.selectAll();
          break;
        case 'd':
          event.preventDefault();
          this.duplicateSelected();
          break;
        case 'delete':
        case 'backspace':
          event.preventDefault();
          this.deleteSelected();
          break;
      }
    }

    // Handle other keyboard shortcuts
    switch (event.key) {
      case 'Enter':
        if (this.isFunctionMode) {
          event.preventDefault();
          this.addFunctionCall();
        } else if (this.selectedField && this.selectedOperator && this.inputValue !== null) {
          event.preventDefault();
          this.addCondition();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.clearCurrentSelection();
        break;
      case 'Tab':
        if (this.isFunctionMode) {
          event.preventDefault();
          this.toggleFunctionMode();
        }
        break;
    }
  }

  /**
   * Check if the component is currently focused
   * @returns True if the component is focused
   */
  private isComponentFocused(): boolean {
    // Check if any element within the component is focused
    const componentElement = document.querySelector('mp-criteria-builder');
    return componentElement?.contains(document.activeElement) || false;
  }

  /**
   * Save the current criteria (placeholder for future implementation)
   */
  private saveCriteria(): void {
    // Emit save event to parent
    this.dslChange.emit(this.state.dsl!);
  }

  /**
   * Select all criteria elements (placeholder for future implementation)
   */
  private selectAll(): void {
    // Select all criteria elements
    this.state.selectedBadgeId = 'all';
  }

  /**
   * Duplicate the selected criteria element (placeholder for future implementation)
   */
  private duplicateSelected(): void {
    // Duplicate selected criteria
    if (this.state.selectedBadgeId) {
      // Implementation would depend on what's selected
      console.log('Duplicate functionality not yet implemented');
    }
  }

  /**
   * Delete the selected criteria element (placeholder for future implementation)
   */
  private deleteSelected(): void {
    // Delete selected criteria
    if (this.state.selectedBadgeId && this.state.selectedBadgeId !== 'all') {
      this.removeElement(this.state.selectedBadgeId);
    }
  }

  // Performance optimization methods
  /**
   * Mark component for change detection
   */
  private markForCheck(): void {
    this.cdr.markForCheck();
  }

  /**
   * Trigger change detection
   */
  private detectChanges(): void {
    this.cdr.detectChanges();
  }

  /**
   * Mark component as dirty
   */
  private markDirty(): void {
    this.cdr.markForCheck();
  }

  // Lazy loading and memoization
  private fieldCache = new Map<string, FieldMeta>();
  private functionCache = new Map<string, FunctionMeta>();

  /**
   * Get field by ID with memoization
   * @param id - The field ID
   * @returns The field metadata
   */
  getFieldById(id: string): FieldMeta | undefined {
    if (!this.fieldCache.has(id)) {
      const field = this.fields.find(f => f.id === id);
      if (field) {
        this.fieldCache.set(id, field);
      }
    }
    return this.fieldCache.get(id);
  }

  /**
   * Get function by ID with memoization
   * @param id - The function ID
   * @returns The function metadata
   */
  getFunctionById(id: string): FunctionMeta | undefined {
    if (!this.functionCache.has(id)) {
      const func = this.functions.find(f => f.id === id);
      if (func) {
        this.functionCache.set(id, func);
      }
    }
    return this.functionCache.get(id);
  }

  // Debounced validation
  private validationTimeout: any;
  private debouncedValidation(): void {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
    this.validationTimeout = setTimeout(() => {
      this.requestValidation();
    }, 300);
  }

  // Debounced SQL preview
  private sqlTimeout: any;
  private debouncedSQLPreview(): void {
    if (this.sqlTimeout) {
      clearTimeout(this.sqlTimeout);
    }
    this.sqlTimeout = setTimeout(() => {
      this.requestSQLPreview();
    }, 500);
  }

  // Error handling and user feedback
  private errorMessages: string[] = [];
  private warningMessages: string[] = [];
  private successMessages: string[] = [];

  addError(message: string): void {
    this.errorMessages.push(message);
    this.markForCheck();
  }

  addWarning(message: string): void {
    this.warningMessages.push(message);
    this.markForCheck();
  }

  addSuccess(message: string): void {
    this.successMessages.push(message);
    this.markForCheck();
  }

  clearMessages(): void {
    this.errorMessages = [];
    this.warningMessages = [];
    this.successMessages = [];
    this.markForCheck();
  }

  getErrorMessages(): string[] {
    return [...this.errorMessages];
  }

  getWarningMessages(): string[] {
    return [...this.warningMessages];
  }

  getSuccessMessages(): string[] {
    return [...this.successMessages];
  }

  hasErrors(): boolean {
    return this.errorMessages.length > 0;
  }

  hasWarnings(): boolean {
    return this.warningMessages.length > 0;
  }

  hasSuccess(): boolean {
    return this.successMessages.length > 0;
  }

  // Error handling for common operations
  private handleError(error: any, context: string): void {
    console.error(`Error in ${context}:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.addError(`${context}: ${errorMessage}`);
  }

  private handleValidationError(error: any): void {
    if (error?.errors) {
      error.errors.forEach((err: any) => {
        this.addError(err.message || 'Validation error');
      });
    } else {
      this.addError('Validation failed');
    }
  }

  private handleNetworkError(error: any): void {
    this.addError('Network error: Unable to connect to server');
  }

  private handleTimeoutError(error: any): void {
    this.addError('Request timeout: Please try again');
  }

  // ControlValueAccessor implementation
  /**
   * Write value from form control
   * @param value - The criteria DSL value
   */
  writeValue(value: CriteriaDSL | null): void {
    this.state.dsl = value;
    this.updateValidity();
    this.emitChange();
    this.markForCheck();
  }

  /**
   * Register change callback
   * @param fn - The change callback function
   */
  registerOnChange(fn: (value: CriteriaDSL | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Register touched callback
   * @param fn - The touched callback function
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   * @param isDisabled - Whether the component is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.markForCheck();
  }

  // Component methods
  /**
   * Update validity state
   */
  private updateValidity(): void {
    // Basic validation - check if DSL has a root group
    this.state.isValid = this.state.dsl?.root ? true : false;
    this.validityChange.emit(this.state.isValid);
  }

  /**
   * Emit change event
   */
  private emitChange(): void {
    this.onChange(this.state.dsl);
    this.dslChange.emit(this.state.dsl!);
  }

  // Event handlers
  /**
   * Handle field selection
   * @param fieldId - The ID of the selected field
   */
  onFieldSelected(fieldId: string): void {
    if (!fieldId) {
      this.selectedField = null;
      this.selectedOperator = null;
      this.availableOperators = [];
      this.markForCheck();
      return;
    }

    this.selectedField = this.getFieldById(fieldId) || null;
    if (this.selectedField) {
      this.availableOperators = OPERATORS_BY_FIELD_TYPE[this.selectedField.dataType] || [];
      this.selectedOperator = null; // Reset operator when field changes
    }
    this.markForCheck();
  }

  /**
   * Handle operator selection
   * @param operator - The selected operator
   */
  onOperatorSelected(operator: string): void {
    this.selectedOperator = operator || null;
    this.markForCheck();
  }

  /**
   * Handle value change
   * @param value - The new value
   */
  onValueChanged(value: any): void {
    this.inputValue = value;
    this.markForCheck();
  }

  /**
   * Handle badge action events
   * @param event - The badge action event
   */
  onBadgeAction(event: BadgeActionEvent): void {
    this.badgeAction.emit(event);
    this.markForCheck();
  }

  // Function selection methods
  /**
   * Handle function selection
   * @param functionId - The ID of the selected function
   */
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

  /**
   * Handle function parameter change
   * @param index - The index of the parameter
   * @param value - The new value
   * @param type - The type of the parameter
   */
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

  /**
   * Add a function call to the criteria
   */
  addFunctionCall(): void {
    if (!this.selectedFunction || !this.isFunctionMode) {
      return;
    }

    // Save current state to undo stack
    this.saveToUndoStack();

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

  /**
   * Toggle function mode
   */
  toggleFunctionMode(): void {
    this.isFunctionMode = !this.isFunctionMode;
    if (!this.isFunctionMode) {
      this.clearFunctionSelection();
    }
  }

  /**
   * Initialize function parameters
   */
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

  /**
   * Clear function selection
   */
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

  // Undo/Redo functionality
  /**
   * Undo the last action
   */
  undo(): void {
    if (this.state.undoStack.length === 0) {
      return;
    }

    // Save current state to redo stack
    if (this.state.dsl) {
      this.state.redoStack.push(JSON.parse(JSON.stringify(this.state.dsl)));
    }

    // Restore previous state
    const previousState = this.state.undoStack.pop()!;
    this.state.dsl = previousState;

    // Limit redo stack size
    if (this.state.redoStack.length > this.MAX_UNDO_STACK_SIZE) {
      this.state.redoStack.shift();
    }

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  /**
   * Redo the last undone action
   */
  redo(): void {
    if (this.state.redoStack.length === 0) {
      return;
    }

    // Save current state to undo stack
    if (this.state.dsl) {
      this.state.undoStack.push(JSON.parse(JSON.stringify(this.state.dsl)));
    }

    // Restore next state
    const nextState = this.state.redoStack.pop()!;
    this.state.dsl = nextState;

    // Limit undo stack size
    if (this.state.undoStack.length > this.MAX_UNDO_STACK_SIZE) {
      this.state.undoStack.shift();
    }

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  /**
   * Check if undo is available
   * @returns True if undo is available
   */
  canUndo(): boolean {
    return this.state.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   * @returns True if redo is available
   */
  canRedo(): boolean {
    return this.state.redoStack.length > 0;
  }

  /**
   * Save the current state to the undo stack
   */
  private saveToUndoStack(): void {
    if (!this.state.dsl) return;

    // Save current state to undo stack
    this.state.undoStack.push(JSON.parse(JSON.stringify(this.state.dsl)));

    // Clear redo stack when new action is performed
    this.state.redoStack = [];

    // Limit undo stack size
    if (this.state.undoStack.length > this.MAX_UNDO_STACK_SIZE) {
      this.state.undoStack.shift();
    }
  }

  // Drag and drop functionality
  onDragStart(event: DragEvent, element: any): void {
    if (this.disabled || this.readonly) {
      event.preventDefault();
      return;
    }

    this.draggedElement = element;
    event.dataTransfer!.setData('text/plain', element.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled || this.readonly) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDragEnter(event: DragEvent, target: any): void {
    if (this.disabled || this.readonly) return;
    
    event.preventDefault();
    this.dropTarget = target;
  }

  onDragLeave(event: DragEvent): void {
    if (this.disabled || this.readonly) return;
    
    this.dropTarget = null;
  }

  onDrop(event: DragEvent, target: any): void {
    if (this.disabled || this.readonly) return;
    
    event.preventDefault();
    
    if (!this.draggedElement || !this.dropTarget) {
      return;
    }

    // Save current state to undo stack
    this.saveToUndoStack();

    // Perform the move operation
    this.moveElement(this.draggedElement, this.dropTarget);

    // Clear drag state
    this.draggedElement = null;
    this.dropTarget = null;
  }

  private moveElement(element: any, target: any): void {
    if (!this.state.dsl) return;

    // Remove element from current location
    const updatedRoot = this.removeElementFromGroup(this.state.dsl.root, element.id);
    
    // Add element to target location
    if (this.isGroup(target)) {
      // Move to group
      const newRoot = this.addElementToGroup(updatedRoot, target.id, element);
      this.state.dsl = this.criteriaSerializer.generateDSLFromGroup(newRoot);
    } else {
      // Move to root level
      const newRoot = this.addElementToGroup(updatedRoot, this.state.dsl.root.id, element);
      this.state.dsl = this.criteriaSerializer.generateDSLFromGroup(newRoot);
    }

    this.updateValidity();
    this.emitChange();
    this.requestValidation();
    this.requestSQLPreview();
  }

  private addElementToGroup(group: Group, targetGroupId: string, element: any): Group {
    if (group.id === targetGroupId) {
      return this.criteriaSerializer.addConditionToGroup(group, element);
    }

    return {
      ...group,
      children: (group.children || []).map(child => {
        if (this.isGroup(child)) {
          return this.addElementToGroup(child, targetGroupId, element);
        }
        return child;
      })
    };
  }

  // Action methods
  /**
   * Add a new condition to the criteria
   */
  addCondition(): void {
    try {
      if (!this.selectedField || !this.selectedOperator || this.inputValue === null) {
        this.addWarning('Please select a field, operator, and value before adding a condition');
        return;
      }

      // Save current state to undo stack
      this.saveToUndoStack();

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
      this.addSuccess('Condition added successfully');
    } catch (error) {
      this.handleError(error, 'Adding condition');
    }
  }

  /**
   * Add a new group to the criteria
   * @param operator - The logical operator for the group
   */
  addGroup(operator: LogicalOperator = 'AND'): void {
    try {
      // Save current state to undo stack
      this.saveToUndoStack();

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
      this.addSuccess(`${operator} group added successfully`);
    } catch (error) {
      this.handleError(error, 'Adding group');
    }
  }

  /**
   * Clear all criteria
   */
  clearCriteria(): void {
    try {
      // Save current state to undo stack
      this.saveToUndoStack();

      this.state.dsl = this.criteriaSerializer.generateDSL([]);
      this.updateValidity();
      this.emitChange();
      this.clearCurrentSelection();
      this.addSuccess('All criteria cleared');
    } catch (error) {
      this.handleError(error, 'Clearing criteria');
    }
  }

  // Group manipulation methods
  /**
   * Add a condition to a specific group
   * @param groupId - The ID of the group to add the condition to
   */
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

  /**
   * Add a group to a specific group
   * @param parentGroupId - The ID of the parent group
   * @param operator - The logical operator for the new group
   */
  addGroupToGroup(parentGroupId: string, operator: LogicalOperator = 'AND'): void {
    const newGroup = this.criteriaSerializer.createGroup(operator);
    this.addGroupToSpecificGroup(parentGroupId, newGroup);
  }

  /**
   * Remove an element from the criteria
   * @param elementId - The ID of the element to remove
   */
  removeElement(elementId: string): void {
    if (!this.state.dsl) return;

    // Save current state to undo stack
    this.saveToUndoStack();

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

  /**
   * Check if object is a Condition
   * @param obj - The object to check
   * @returns True if object is a Condition
   */
  private isCondition(obj: any): obj is Condition {
    return obj && typeof obj === 'object' && 'left' in obj && 'operator' in obj;
  }

  /**
   * Add condition to DSL
   * @param condition - The condition to add
   */
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

  /**
   * Clear current selection
   */
  private clearCurrentSelection(): void {
    this.selectedField = null;
    this.selectedOperator = null;
    this.inputValue = null;
    this.availableOperators = [];
  }

  /**
   * Request validation with debouncing
   */
  private requestValidation(): void {
    if (this.state.dsl) {
      this.validationRequest.emit(this.state.dsl);
    }
  }

  /**
   * Request SQL preview with debouncing
   */
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

  /**
   * Get function parameter value
   * @param index - The parameter index
   * @returns The parameter value
   */
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

  /**
   * Get parameter placeholder text
   * @param param - The parameter
   * @returns The placeholder text
   */
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

  /**
   * Track by parameter name for ngFor
   * @param index - The index
   * @param param - The parameter
   * @returns The parameter name
   */
  trackByParameterName(index: number, param: any): string {
    return param.name;
  }

  /**
   * Handle group badge action events
   * @param event - The badge action event
   */
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

  /**
   * Check if object is a FieldRef
   * @param obj - The object to check
   * @returns True if object is a FieldRef
   */
  private isFieldRef(obj: any): obj is FieldRef {
    return obj && typeof obj === 'object' && 'field' in obj;
  }
}
