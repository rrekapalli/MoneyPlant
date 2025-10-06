import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryRule, QueryField, QueryBuilderConfig } from '../interfaces/query.interface';
import { QueryBuilderService } from '../services/query-builder.service';

@Component({
  selector: 'app-query-rule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="query-rule">
      <div class="query-rule-content">
        <!-- Field Selection -->
        <div class="form-group">
          <label class="form-label">Field</label>
          <select 
            class="form-select"
            [(ngModel)]="rule.field"
            (ngModelChange)="onFieldChange($event)">
            <option value="">Select a field</option>
            <option 
              *ngFor="let field of config.fields" 
              [value]="field.value">
              {{ field.name }}
            </option>
          </select>
        </div>

        <!-- Operator Selection -->
        <div class="form-group">
          <label class="form-label">Operator</label>
          <select 
            class="form-select"
            [(ngModel)]="rule.operator"
            (ngModelChange)="onOperatorChange($event)">
            <option value="">Select an operator</option>
            <option 
              *ngFor="let op of getOperators()" 
              [value]="op">
              {{ op }}
            </option>
          </select>
        </div>

        <!-- Value Input -->
        <div class="form-group value-input-group">
          <label class="form-label">Value</label>
          <div class="value-input-container">
            <ng-container [ngSwitch]="getValueInputType()">
            
            <!-- String Input -->
            <input 
              *ngSwitchCase="'string'"
              type="text" 
              class="form-control"
              [(ngModel)]="rule.value"
              (ngModelChange)="onValueChange($event)"
              placeholder="Enter value">
            
            <!-- Number Input -->
            <input 
              *ngSwitchCase="'number'"
              type="number" 
              class="form-control"
              [(ngModel)]="rule.value"
              (ngModelChange)="onValueChange($event)"
              placeholder="Enter number">
            
            <!-- Between Operator - Two Number Inputs -->
            <div *ngSwitchCase="'between-number'" class="between-inputs">
              <input 
                type="number" 
                class="form-control"
                [ngModel]="getBetweenValue('min')"
                (ngModelChange)="onBetweenValueChange('min', $event)"
                placeholder="Min value">
              <span class="between-separator">and</span>
              <input 
                type="number" 
                class="form-control"
                [ngModel]="getBetweenValue('max')"
                (ngModelChange)="onBetweenValueChange('max', $event)"
                placeholder="Max value">
            </div>
            
            <!-- Between Operator - Two Date Inputs -->
            <div *ngSwitchCase="'between-date'" class="between-inputs">
              <input 
                type="date" 
                class="form-control"
                [ngModel]="getBetweenValue('min')"
                (ngModelChange)="onBetweenValueChange('min', $event)">
              <span class="between-separator">and</span>
              <input 
                type="date" 
                class="form-control"
                [ngModel]="getBetweenValue('max')"
                (ngModelChange)="onBetweenValueChange('max', $event)">
            </div>
            
            <!-- Date Input -->
            <input 
              *ngSwitchCase="'date'"
              type="date" 
              class="form-control"
              [(ngModel)]="rule.value"
              (ngModelChange)="onValueChange($event)">
            
            <!-- Time Input -->
            <input 
              *ngSwitchCase="'time'"
              type="time" 
              class="form-control"
              [(ngModel)]="rule.value"
              (ngModelChange)="onValueChange($event)">
            
            <!-- Boolean Input -->
            <div *ngSwitchCase="'boolean'" class="form-check">
              <input 
                type="checkbox" 
                class="form-check-input"
                [(ngModel)]="rule.value"
                (ngModelChange)="onValueChange($event)"
                id="boolean-{{rule.field}}">
              <label class="form-check-label" for="boolean-{{rule.field}}">
                {{ rule.value ? 'True' : 'False' }}
              </label>
            </div>
            
            <!-- Category Input -->
            <select 
              *ngSwitchCase="'category'"
              class="form-select"
              [(ngModel)]="rule.value"
              (ngModelChange)="onValueChange($event)">
              <option value="">Select option</option>
              <option 
                *ngFor="let option of getFieldOptions()" 
                [value]="option.value">
                {{ option.name }}
              </option>
            </select>
            
            <!-- Default Input -->
            <input 
              *ngSwitchDefault
              type="text" 
              class="form-control"
              [(ngModel)]="rule.value"
              (ngModelChange)="onValueChange($event)"
              placeholder="Enter value">
            </ng-container>
            
            <!-- Remove Button -->
            <button 
              type="button" 
              class="btn btn-outline-danger btn-sm remove-rule-btn"
              (click)="removeRule()"
              title="Remove rule">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./query-rule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryRuleComponent implements OnInit {
  @Input() rule!: QueryRule;
  @Input() config!: QueryBuilderConfig;
  @Input() ruleIndex!: number;
  @Output() ruleChange = new EventEmitter<QueryRule>();
  @Output() removeRuleEvent = new EventEmitter<number>();

  constructor(private queryBuilderService: QueryBuilderService) {}

  ngOnInit(): void {
    if (!this.rule.value && this.rule.field) {
      this.initializeDefaultValue();
    }
  }

  getOperators(): string[] {
    if (!this.rule.field) return [];
    
    const field = this.config.fields.find(f => f.value === this.rule.field);
    if (field?.getOperators) {
      return field.getOperators();
    }
    
    return this.queryBuilderService.getOperators(field?.type || 'string');
  }

  getFieldType(): string {
    const field = this.config.fields.find(f => f.value === this.rule.field);
    return field?.type || 'string';
  }

  getValueInputType(): string {
    if (!this.rule.field || !this.rule.operator) {
      return 'string'; // Default fallback
    }

    const fieldType = this.getFieldType();
    
    // Handle between operators
    if (this.rule.operator === 'between' || this.rule.operator === 'not between') {
      if (fieldType === 'number') {
        return 'between-number';
      } else if (fieldType === 'date') {
        return 'between-date';
      }
    }
    
    return fieldType;
  }

  getFieldOptions(): any[] {
    const field = this.config.fields.find(f => f.value === this.rule.field);
    if (field?.getOptions) {
      return field.getOptions();
    }
    return field?.options || [];
  }

  onFieldChange(fieldValue: string): void {
    this.rule.field = fieldValue;
    this.rule.operator = '';
    this.rule.value = null;
    this.initializeDefaultValue();
    this.ruleChange.emit(this.rule);
  }

  onOperatorChange(operator: string): void {
    this.rule.operator = operator;
    
    // Initialize value as object for between operators
    if (operator === 'between' || operator === 'not between') {
      if (!this.rule.value || typeof this.rule.value !== 'object') {
        this.rule.value = { min: null, max: null };
      }
    } else {
      // For non-between operators, ensure value is not an object
      if (this.rule.value && typeof this.rule.value === 'object') {
        this.rule.value = null;
      }
    }
    
    this.ruleChange.emit(this.rule);
  }

  onValueChange(value: any): void {
    this.rule.value = value;
    this.ruleChange.emit(this.rule);
  }

  getBetweenValue(type: 'min' | 'max'): any {
    if (!this.rule.value || typeof this.rule.value !== 'object') {
      return null;
    }
    return this.rule.value[type];
  }

  onBetweenValueChange(type: 'min' | 'max', value: any): void {
    if (!this.rule.value || typeof this.rule.value !== 'object') {
      this.rule.value = { min: null, max: null };
    }
    this.rule.value[type] = value;
    this.ruleChange.emit(this.rule);
  }

  removeRule(): void {
    this.removeRuleEvent.emit(this.ruleIndex);
  }

  private initializeDefaultValue(): void {
    const fieldType = this.getFieldType();
    
    // Handle between operators
    if (this.rule.operator === 'between' || this.rule.operator === 'not between') {
      this.rule.value = { min: null, max: null };
      return;
    }
    
    switch (fieldType) {
      case 'boolean':
        this.rule.value = false;
        break;
      case 'number':
        this.rule.value = 0;
        break;
      case 'string':
        this.rule.value = '';
        break;
      case 'date':
        this.rule.value = new Date().toISOString().split('T')[0];
        break;
      case 'time':
        this.rule.value = '00:00';
        break;
      default:
        this.rule.value = '';
    }
  }
}
