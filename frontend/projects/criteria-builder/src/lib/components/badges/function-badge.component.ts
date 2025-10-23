import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FunctionCall, FunctionMeta, FunctionParameter, FieldRef, Literal } from '../../models/criteria.models';
import { BadgeActionEvent } from '../../models/event.models';

@Component({
  selector: 'mp-function-badge',
  template: `
    <div class="function-container"
         [class.selected]="isSelected"
         [class.editing]="isEditing"
         [class.disabled]="disabled"
         [class.expanded]="isExpanded">
      
      <!-- Function header -->
      <div class="function-header" 
           (click)="onToggleExpanded()"
           [class.clickable]="!disabled && !readonly">
        
        <span class="function-icon">⚙️</span>
        <span class="function-name">{{ functionCall.function }}</span>
        <span class="function-parentheses">(</span>
        
        <!-- Parameter summary -->
        <span class="parameter-summary" *ngIf="!isExpanded">
          {{ getParameterSummary() }}
        </span>
        
        <span class="function-parentheses">)</span>
        
        <!-- Expand/collapse indicator -->
        <span class="expand-indicator" *ngIf="!disabled && !readonly">
          {{ isExpanded ? '▼' : '▶' }}
        </span>
      </div>

      <!-- Function details (expanded) -->
      <div class="function-details" *ngIf="isExpanded">
        
        <!-- Function description -->
        <div class="function-description" *ngIf="functionMeta?.description">
          <p>{{ functionMeta.description }}</p>
        </div>

        <!-- Parameter configuration -->
        <div class="parameter-config" *ngIf="functionMeta">
          <div class="parameter-item" 
               *ngFor="let param of functionMeta.parameters; let i = index; trackBy: trackByParameterName">
            
            <label class="parameter-label">
              {{ param.name }}
              <span class="parameter-type">({{ param.type }})</span>
              <span class="parameter-required" *ngIf="!param.optional">*</span>
            </label>
            
            <!-- Parameter input based on type -->
            <div class="parameter-input">
              
              <!-- Field reference input -->
              <select *ngIf="param.type === 'FIELD'"
                      [value]="getParameterValue(i)"
                      (change)="onParameterChange(i, $event.target.value, 'field')"
                      [disabled]="disabled || readonly">
                <option value="">Select field...</option>
                <option *ngFor="let field of availableFields" 
                        [value]="field.id">
                  {{ field.label }}
                </option>
              </select>
              
              <!-- Literal value input -->
              <input *ngIf="param.type !== 'FIELD'"
                     [type]="getInputType(param.type)"
                     [value]="getParameterValue(i)"
                     (input)="onParameterChange(i, $event.target.value, 'literal')"
                     [placeholder]="getParameterPlaceholder(param)"
                     [disabled]="disabled || readonly">
              
              <!-- Parameter description -->
              <div class="parameter-help" *ngIf="param.description">
                <small>{{ param.description }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Function examples -->
        <div class="function-examples" *ngIf="functionMeta?.examples?.length">
          <h5>Examples:</h5>
          <ul>
            <li *ngFor="let example of functionMeta.examples">{{ example }}</li>
          </ul>
        </div>
      </div>

      <!-- Function actions -->
      <div class="function-actions" *ngIf="!disabled && !readonly">
        <button class="action-btn edit-function" 
                (click)="onEdit($event)"
                type="button"
                title="Edit function">
          ✏️
        </button>
        <button class="action-btn remove-function" 
                (click)="onRemove($event)"
                type="button"
                title="Remove function">
          ×
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./function-badge.component.scss']
})
export class FunctionBadgeComponent implements OnInit {
  @Input() functionCall!: FunctionCall;
  @Input() functionMeta?: FunctionMeta;
  @Input() availableFields: any[] = [];
  @Input() isSelected = false;
  @Input() isEditing = false;
  @Input() isExpanded = false;
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() badgeAction = new EventEmitter<BadgeActionEvent>();

  ngOnInit(): void {
    // Auto-expand if editing
    if (this.isEditing) {
      this.isExpanded = true;
    }
  }

  onToggleExpanded(): void {
    if (this.disabled || this.readonly) return;
    
    this.isExpanded = !this.isExpanded;
    
    this.badgeAction.emit({
      action: 'toggle',
      badgeId: this.functionCall.id || 'function',
      badgeType: 'function-badge',
      data: { expanded: this.isExpanded }
    });
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'edit',
      badgeId: this.functionCall.id || 'function',
      badgeType: 'function-badge',
      data: this.functionCall
    });
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'delete',
      badgeId: this.functionCall.id || 'function',
      badgeType: 'function-badge',
      data: this.functionCall
    });
  }

  onParameterChange(index: number, value: any, type: 'field' | 'literal'): void {
    if (this.disabled || this.readonly) return;

    const newArgs = [...this.functionCall.args];
    
    if (type === 'field') {
      newArgs[index] = {
        field: value,
        id: this.generateId()
      } as FieldRef;
    } else {
      newArgs[index] = {
        value: this.parseValue(value, this.functionMeta?.parameters[index]?.type),
        type: this.functionMeta?.parameters[index]?.type || 'STRING',
        id: this.generateId()
      } as Literal;
    }

    const updatedFunctionCall = {
      ...this.functionCall,
      args: newArgs
    };

    this.badgeAction.emit({
      action: 'modify',
      badgeId: this.functionCall.id || 'function',
      badgeType: 'function-badge',
      data: updatedFunctionCall
    });
  }

  getParameterValue(index: number): any {
    const arg = this.functionCall.args[index];
    if (!arg) return '';

    if (this.isFieldRef(arg)) {
      return arg.field;
    } else if (this.isLiteral(arg)) {
      return arg.value;
    }
    return '';
  }

  getParameterSummary(): string {
    if (!this.functionCall.args || this.functionCall.args.length === 0) {
      return 'no parameters';
    }

    return this.functionCall.args.map(arg => {
      if (this.isFieldRef(arg)) {
        return arg.field;
      } else if (this.isLiteral(arg)) {
        return String(arg.value);
      }
      return '?';
    }).join(', ');
  }

  getInputType(paramType: string): string {
    switch (paramType) {
      case 'NUMBER':
      case 'INTEGER':
        return 'number';
      case 'DATE':
        return 'date';
      case 'BOOLEAN':
        return 'checkbox';
      default:
        return 'text';
    }
  }

  getParameterPlaceholder(param: FunctionParameter): string {
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

  trackByParameterName(index: number, param: FunctionParameter): string {
    return param.name;
  }

  private parseValue(value: any, type?: string): any {
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

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isFieldRef(obj: any): obj is FieldRef {
    return obj && typeof obj === 'object' && 'field' in obj;
  }

  private isLiteral(obj: any): obj is Literal {
    return obj && typeof obj === 'object' && 'value' in obj && 'type' in obj;
  }
}
