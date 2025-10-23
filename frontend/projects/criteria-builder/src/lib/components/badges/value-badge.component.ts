import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Literal, FieldType } from '../../models/criteria.models';
import { BadgeActionEvent } from '../../models/event.models';

@Component({
  selector: 'mp-value-badge',
  template: `
    <div class="badge value-badge"
         [class.selected]="isSelected"
         [class.editing]="isEditing"
         [class.disabled]="disabled"
         (click)="onClick()"
         (dblclick)="onDoubleClick()">
      
      <span class="badge-content">
        <i class="badge-icon">{{ getValueIcon() }}</i>
        <span class="badge-label">{{ getDisplayValue() }}</span>
        <span class="badge-type" *ngIf="showType">({{ literal.type }})</span>
      </span>
      
      <button class="badge-remove" 
              *ngIf="!disabled && !readonly"
              (click)="onRemove($event)"
              type="button"
              aria-label="Remove value">
        ×
      </button>
    </div>
  `,
  styleUrls: ['./badge.component.scss']
})
export class ValueBadgeComponent {
  @Input() literal!: Literal;
  @Input() isSelected = false;
  @Input() isEditing = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() showType = true;

  @Output() badgeAction = new EventEmitter<BadgeActionEvent>();

  onClick(): void {
    if (this.disabled || this.readonly) return;
    
    this.badgeAction.emit({
      action: 'select',
      badgeId: this.literal.id || 'value',
      badgeType: 'value-badge',
      data: this.literal
    });
  }

  onDoubleClick(): void {
    if (this.disabled || this.readonly) return;
    
    this.badgeAction.emit({
      action: 'edit',
      badgeId: this.literal.id || 'value',
      badgeType: 'value-badge',
      data: this.literal
    });
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'delete',
      badgeId: this.literal.id || 'value',
      badgeType: 'value-badge',
      data: this.literal
    });
  }

  getDisplayValue(): string {
    if (this.literal.value === null || this.literal.value === undefined) {
      return 'null';
    }
    
    if (this.literal.type === 'STRING') {
      return `"${this.literal.value}"`;
    }
    
    if (this.literal.type === 'DATE') {
      return new Date(this.literal.value).toLocaleDateString();
    }
    
    if (this.literal.type === 'BOOLEAN') {
      return this.literal.value ? 'true' : 'false';
    }
    
    if (Array.isArray(this.literal.value)) {
      return `[${this.literal.value.join(', ')}]`;
    }
    
    return String(this.literal.value);
  }

  getValueIcon(): string {
    switch (this.literal.type) {
      case 'STRING':
        return '📝';
      case 'NUMBER':
      case 'INTEGER':
        return '🔢';
      case 'DATE':
        return '📅';
      case 'BOOLEAN':
        return this.literal.value ? '✅' : '❌';
      case 'PERCENT':
        return '📊';
      case 'CURRENCY':
        return '💰';
      case 'ENUM':
        return '📋';
      default:
        return '📄';
    }
  }
}
