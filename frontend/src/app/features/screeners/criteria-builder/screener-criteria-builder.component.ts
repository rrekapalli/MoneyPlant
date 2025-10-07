import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { ScreenerCriteria } from '../../../services/entities/screener.entities';
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
  selector: 'app-screener-criteria-builder',
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
      useExisting: forwardRef(() => ScreenerCriteriaBuilderComponent),
      multi: true
    }
  ],
  templateUrl: './screener-criteria-builder.component.html',
  styleUrl: './screener-criteria-builder.component.scss'
})
export class ScreenerCriteriaBuilderComponent implements ControlValueAccessor {

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

  private onChange = (value: ScreenerCriteria | undefined) => { };
  private onTouched = () => { };

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