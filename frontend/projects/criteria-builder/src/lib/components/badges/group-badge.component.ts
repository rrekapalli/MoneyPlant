import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Group, LogicalOperator } from '../../models/criteria.models';
import { BadgeActionEvent } from '../../models/event.models';

@Component({
  selector: 'mp-group-badge',
  template: `
    <div class="group-container" 
         [class.nested]="isNested"
         [class.collapsed]="isCollapsed"
         [class.selected]="isSelected"
         [class.editing]="isEditing">
      
      <!-- Group opening brace -->
      <div class="group-opening" 
           (click)="onToggleCollapse()"
           [class.clickable]="!disabled && !readonly">
        <span class="brace">{{ isCollapsed ? '[' : '{' }}</span>
        <span class="operator">{{ getOperatorLabel(group.operator) }}</span>
        <span class="brace">{{ isCollapsed ? ']' : '{' }}</span>
      </div>

      <!-- Group content -->
      <div class="group-content" *ngIf="!isCollapsed">
        <div class="group-children">
          <ng-content></ng-content>
        </div>
      </div>

      <!-- Group closing brace -->
      <div class="group-closing" *ngIf="!isCollapsed">
        <span class="brace">}</span>
      </div>

      <!-- Group actions -->
      <div class="group-actions" *ngIf="!disabled && !readonly">
        <button class="action-btn add-condition" 
                (click)="onAddCondition($event)"
                type="button"
                title="Add Condition">
          +
        </button>
        <button class="action-btn add-group" 
                (click)="onAddGroup($event)"
                type="button"
                title="Add Group">
          ⧉
        </button>
        <button class="action-btn remove-group" 
                (click)="onRemoveGroup($event)"
                type="button"
                title="Remove Group">
          ×
        </button>
      </div>

      <!-- Collapsed summary -->
      <div class="collapsed-summary" *ngIf="isCollapsed">
        <span class="summary-text">{{ getCollapsedSummary() }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./group-badge.component.scss']
})
export class GroupBadgeComponent {
  @Input() group!: Group;
  @Input() isSelected = false;
  @Input() isEditing = false;
  @Input() isCollapsed = false;
  @Input() isNested = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() nestingLevel = 0;

  @Output() badgeAction = new EventEmitter<BadgeActionEvent>();

  // Operator display mappings
  private operatorLabels: Record<LogicalOperator, string> = {
    'AND': 'AND',
    'OR': 'OR',
    'NOT': 'NOT'
  };

  private operatorIcons: Record<LogicalOperator, string> = {
    'AND': '∧',
    'OR': '∨',
    'NOT': '¬'
  };

  onToggleCollapse(): void {
    if (this.disabled || this.readonly) return;
    
    this.isCollapsed = !this.isCollapsed;
    
    this.badgeAction.emit({
      action: 'toggle',
      badgeId: this.group.id || 'group',
      badgeType: 'group-badge',
      data: { collapsed: this.isCollapsed }
    });
  }

  onAddCondition(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'add',
      badgeId: this.group.id || 'group',
      badgeType: 'group-badge',
      data: { type: 'condition', groupId: this.group.id }
    });
  }

  onAddGroup(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'add',
      badgeId: this.group.id || 'group',
      badgeType: 'group-badge',
      data: { type: 'group', groupId: this.group.id }
    });
  }

  onRemoveGroup(event: Event): void {
    event.stopPropagation();
    
    this.badgeAction.emit({
      action: 'delete',
      badgeId: this.group.id || 'group',
      badgeType: 'group-badge',
      data: this.group
    });
  }

  getOperatorLabel(operator: LogicalOperator): string {
    return this.operatorLabels[operator] || operator;
  }

  getOperatorIcon(operator: LogicalOperator): string {
    return this.operatorIcons[operator] || operator;
  }

  getCollapsedSummary(): string {
    if (!this.group.children || this.group.children.length === 0) {
      return 'Empty group';
    }

    const childCount = this.group.children.length;
    const operator = this.getOperatorLabel(this.group.operator);
    
    if (childCount === 1) {
      return `1 condition`;
    }
    
    return `${childCount} conditions (${operator})`;
  }

  // Utility methods
  get maxNestingLevel(): number {
    return 10; // From PERFORMANCE_LIMITS.MAX_NESTING_DEPTH
  }

  get canAddGroup(): boolean {
    return this.nestingLevel < this.maxNestingLevel;
  }

  get groupDepth(): number {
    return this.nestingLevel + 1;
  }
}
