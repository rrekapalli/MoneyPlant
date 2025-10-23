import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FieldMeta } from '../../models/criteria.models';
import { BadgeActionEvent } from '../../models/event.models';

@Component({
  selector: 'mp-field-badge',
  template: `
    <div class="badge field-badge"
         [class.selected]="isSelected"
         [class.editing]="isEditing"
         [class.disabled]="disabled"
         (click)="onClick()"
         (dblclick)="onDoubleClick()">
      
      <span class="badge-content">
        <i class="badge-icon" *ngIf="field.category">📊</i>
        <span class="badge-label">{{ field.label }}</span>
        <span class="badge-type">({{ field.dataType }})</span>
      </span>
      
      <button class="badge-remove" 
              *ngIf="!disabled && !readonly"
              (click)="onRemove($event)"
              type="button"
              aria-label="Remove field">
        ×
      </button>
    </div>
  `,
  styleUrls: ['./badge.component.scss']
})
export class FieldBadgeComponent {
  @Input() field!: FieldMeta;
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
      badgeId: this.field.id,
      badgeType: 'field-badge',
      data: this.field
    });
  }

  onDoubleClick(): void {
    if (this.disabled || this.readonly) return;
    
    this.badgeAction.emit({
      action: 'edit',
      badgeId: this.field.id,
      badgeType: 'field-badge',
      data: this.field
    });
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'delete',
      badgeId: this.field.id,
      badgeType: 'field-badge',
      data: this.field
    });
  }
}
