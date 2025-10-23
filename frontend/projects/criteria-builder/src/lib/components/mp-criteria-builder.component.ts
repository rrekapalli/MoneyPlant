import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Import interfaces and types
import { CriteriaDSL, FieldMeta, FunctionMeta, ValidationResult } from '../models/criteria.models';
import { CriteriaConfig, CriteriaBuilderState } from '../models/config.models';
import { CriteriaChangeEvent, BadgeActionEvent } from '../models/event.models';
import { DEFAULT_CONFIG } from '../utils/constants';

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

  constructor() {}

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

  // Event handlers (to be implemented in subsequent tasks)
  onFieldSelected(field: FieldMeta): void {
    // TODO: Implement field selection logic
  }

  onOperatorSelected(operator: string): void {
    // TODO: Implement operator selection logic
  }

  onValueChanged(value: any): void {
    // TODO: Implement value change logic
  }

  onBadgeAction(event: BadgeActionEvent): void {
    this.badgeAction.emit(event);
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
}
