import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { ScreenerCriteria, ScreenerRule } from '../../../services/entities/screener.entities';
import { INDICATOR_FIELDS } from '../../../services/entities/indicators.entities';

interface SimpleRule {
  field: string;
  operator: string;
  value: any;
}

interface SimpleCriteria {
  condition: 'and' | 'or';
  rules: SimpleRule[];
}

@Component({
  selector: 'app-simple-criteria-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    InputNumberModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SimpleCriteriaBuilderComponent),
      multi: true
    }
  ],
  template: `
    <div class="simple-criteria-builder">
      <!-- Logic Operator Selection (only show if multiple rules) -->
      <div *ngIf="criteria.rules.length > 1" class="logic-operator">
        <label>Combine conditions using:</label>
        <p-select 
          [(ngModel)]="criteria.condition"
          [options]="logicOptions"
          (onChange)="onCriteriaChange()"
          class="logic-select">
        </p-select>
      </div>

      <!-- Rules List -->
      <div class="rules-container">
        <div *ngFor="let rule of criteria.rules; let i = index" class="rule-row">
          <!-- Field Selection -->
          <p-select 
            [(ngModel)]="rule.field"
            [options]="fieldOptions"
            placeholder="Select field"
            (onChange)="onRuleChange(i)"
            class="field-select">
          </p-select>

          <!-- Operator Selection -->
          <p-select 
            [(ngModel)]="rule.operator"
            [options]="getOperatorOptions(rule.field)"
            placeholder="Operator"
            (onChange)="onRuleChange(i)"
            class="operator-select">
          </p-select>

          <!-- Value Input -->
          <input 
            *ngIf="getFieldType(rule.field) === 'string'"
            type="text"
            pInputText
            [(ngModel)]="rule.value"
            (ngModelChange)="onRuleChange(i)"
            placeholder="Enter value"
            class="value-input">

          <p-inputNumber 
            *ngIf="getFieldType(rule.field) === 'number'"
            [(ngModel)]="rule.value"
            (onInput)="onRuleChange(i)"
            placeholder="Enter number"
            class="value-input">
          </p-inputNumber>

          <!-- Remove Rule Button -->
          <button 
            pButton 
            icon="pi pi-times" 
            (click)="removeRule(i)"
            class="p-button-text p-button-sm remove-btn"
            [disabled]="criteria.rules.length === 1">
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="criteria.rules.length === 0" class="empty-state">
          <p>No conditions defined. Click "Add Condition" to get started.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <button 
          pButton 
          label="Add Condition" 
          icon="pi pi-plus" 
          (click)="addRule()"
          class="p-button-outlined p-button-sm">
        </button>
        <button 
          *ngIf="criteria.rules.length > 0"
          pButton 
          label="Clear All" 
          icon="pi pi-trash" 
          (click)="clearAll()"
          class="p-button-text p-button-sm p-button-danger">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .simple-criteria-builder {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
    }

    .logic-operator {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logic-operator label {
      font-weight: 500;
      color: #666;
    }

    .logic-select {
      min-width: 100px;
    }

    .rules-container {
      margin-bottom: 1rem;
    }

    .rule-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      padding: 0.75rem;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .field-select {
      flex: 2;
      min-width: 150px;
    }

    .operator-select {
      flex: 1;
      min-width: 100px;
    }

    .value-input {
      flex: 1.5;
      min-width: 120px;
    }

    .remove-btn {
      flex-shrink: 0;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-style: italic;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Clean, minimal styling */
    .rule-row:hover {
      border-color: #ccc;
    }

    .p-select, .p-inputnumber, .value-input {
      height: 36px;
    }
  `]
})
export class SimpleCriteriaBuilderComponent implements ControlValueAccessor {
  
  criteria: SimpleCriteria = {
    condition: 'and',
    rules: []
  };

  fieldOptions = INDICATOR_FIELDS.map(field => ({
    label: field.name,
    value: field.value
  }));

  logicOptions = [
    { label: 'AND (all conditions must be true)', value: 'and' },
    { label: 'OR (any condition can be true)', value: 'or' }
  ];

  private onChange = (value: ScreenerCriteria | undefined) => {};
  private onTouched = () => {};

  // ControlValueAccessor implementation
  writeValue(value: ScreenerCriteria | undefined): void {
    if (value) {
      this.criteria = this.convertFromScreenerCriteria(value);
    } else {
      this.criteria = { condition: 'and', rules: [] };
    }
  }

  registerOnChange(fn: (value: ScreenerCriteria | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Rule management
  addRule(): void {
    this.criteria.rules.push({
      field: '',
      operator: '',
      value: ''
    });
    this.onCriteriaChange();
  }

  removeRule(index: number): void {
    this.criteria.rules.splice(index, 1);
    this.onCriteriaChange();
  }

  clearAll(): void {
    this.criteria.rules = [];
    this.onCriteriaChange();
  }

  onRuleChange(index: number): void {
    // Reset value when field changes
    const rule = this.criteria.rules[index];
    if (rule.field && !rule.operator) {
      rule.operator = '='; // Default operator
    }
    this.onCriteriaChange();
  }

  onCriteriaChange(): void {
    const screenerCriteria = this.convertToScreenerCriteria();
    this.onChange(screenerCriteria);
    this.onTouched();
  }

  // Helper methods
  getFieldType(fieldValue: string): string {
    const field = INDICATOR_FIELDS.find(f => f.value === fieldValue);
    return field?.type || 'string';
  }

  getOperatorOptions(fieldValue: string): any[] {
    const fieldType = this.getFieldType(fieldValue);
    
    if (fieldType === 'number' || fieldType === 'percent' || fieldType === 'currency') {
      return [
        { label: 'equals (=)', value: '=' },
        { label: 'not equals (≠)', value: '!=' },
        { label: 'greater than (>)', value: '>' },
        { label: 'greater than or equal (≥)', value: '>=' },
        { label: 'less than (<)', value: '<' },
        { label: 'less than or equal (≤)', value: '<=' }
      ];
    } else {
      return [
        { label: 'equals (=)', value: '=' },
        { label: 'not equals (≠)', value: '!=' },
        { label: 'contains', value: 'LIKE' },
        { label: 'does not contain', value: 'NOT LIKE' }
      ];
    }
  }

  // Data conversion methods
  private convertFromScreenerCriteria(criteria: ScreenerCriteria): SimpleCriteria {
    return {
      condition: criteria.condition,
      rules: criteria.rules.map((rule: any) => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value
      }))
    };
  }

  private convertToScreenerCriteria(): ScreenerCriteria | undefined {
    if (this.criteria.rules.length === 0) {
      return undefined;
    }

    return {
      condition: this.criteria.condition,
      rules: this.criteria.rules.map(rule => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        entity: 'stock'
      })),
      collapsed: false
    };
  }
}