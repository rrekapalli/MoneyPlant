import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Operator } from '../../types/criteria.types';
import { BadgeActionEvent } from '../../models/event.models';

@Component({
  selector: 'mp-operator-badge',
  template: `
    <div class="badge operator-badge"
         [class.selected]="isSelected"
         [class.editing]="isEditing"
         [class.disabled]="disabled"
         (click)="onClick()"
         (dblclick)="onDoubleClick()">
      
      <span class="badge-content">
        <i class="badge-icon">{{ getOperatorIcon() }}</i>
        <span class="badge-label">{{ getOperatorLabel() }}</span>
      </span>
      
      <button class="badge-remove" 
              *ngIf="!disabled && !readonly"
              (click)="onRemove($event)"
              type="button"
              aria-label="Remove operator">
        ×
      </button>
    </div>
  `,
  styleUrls: ['./badge.component.scss']
})
export class OperatorBadgeComponent {
  @Input() operator!: Operator;
  @Input() isSelected = false;
  @Input() isEditing = false;
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() badgeAction = new EventEmitter<BadgeActionEvent>();

  // Operator display mappings
  private operatorLabels: Record<Operator, string> = {
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

  private operatorIcons: Record<Operator, string> = {
    '=': '=',
    '!=': '≠',
    '>': '>',
    '>=': '≥',
    '<': '<',
    '<=': '≤',
    'LIKE': '~',
    'NOT_LIKE': '≁',
    'IN': '∈',
    'NOT_IN': '∉',
    'BETWEEN': '⋯',
    'NOT_BETWEEN': '≁⋯',
    'IS_NULL': '∅',
    'IS_NOT_NULL': '∅̸'
  };

  onClick(): void {
    if (this.disabled || this.readonly) return;
    
    this.badgeAction.emit({
      action: 'select',
      badgeId: this.operator,
      badgeType: 'operator-badge',
      data: this.operator
    });
  }

  onDoubleClick(): void {
    if (this.disabled || this.readonly) return;
    
    this.badgeAction.emit({
      action: 'edit',
      badgeId: this.operator,
      badgeType: 'operator-badge',
      data: this.operator
    });
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'delete',
      badgeId: this.operator,
      badgeType: 'operator-badge',
      data: this.operator
    });
  }

  getOperatorLabel(): string {
    return this.operatorLabels[this.operator] || this.operator;
  }

  getOperatorIcon(): string {
    return this.operatorIcons[this.operator] || this.operator;
  }
}
