import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  ElementRef,
  HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { DragDropModule, CdkDragDrop, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { BaseChipComponent } from '../base-chip/base-chip.component';
import { ChipViewModel } from '../../interfaces';

/**
 * Group chip component for creating nestable containers with logical operators
 * Extends BaseChipComponent with grouping functionality, nesting support, and drag-and-drop
 */
@Component({
  selector: 'mp-group-chip',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    BadgeModule, 
    TooltipModule, 
    DragDropModule
  ],
  template: `
    <div 
      class="group-chip-container"
      [class.grouped]="isGrouped"
      [class.has-children]="hasChildren"
      [style.margin-left.px]="indentationLevel * 20"
      cdkDropList
      [cdkDropListData]="children"
      [cdkDropListDisabled]="!enableDragDrop || disabled"
      (cdkDropListDropped)="onChildrenReordered($event)">
      
      <!-- Group chip header -->
      <div class="group-chip-header">
        <!-- Grouping toggle button (curly braces) -->
        <button
          #groupToggle
          type="button"
          class="group-toggle-btn"
          [class.active]="isGrouped"
          [disabled]="disabled"
          (click)="toggleGrouping()"
          [attr.aria-label]="getGroupToggleAriaLabel()"
          [attr.aria-pressed]="isGrouped"
          pTooltip="Toggle grouping"
          tooltipPosition="top">
          <i class="pi pi-code" [class.grouped]="isGrouped"></i>
        </button>
        
        <!-- Main chip button -->
        <p-button
          #chipButton
          [label]="getDisplayLabel()"
          [disabled]="disabled || !isEditable"
          [severity]="getButtonSeverity()"
          [size]="compactMode ? 'small' : 'normal'"
          [outlined]="!isSelected"
          [text]="isSelected"
          [class]="getChipClasses()"
          [pTooltip]="tooltip"
          tooltipPosition="top"
          (click)="onChipClick($event)"
          (keydown)="onKeyDown($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [attr.aria-label]="getAriaLabel()"
          [attr.aria-describedby]="getAriaDescribedBy()"
          [attr.aria-expanded]="isExpanded"
          [attr.aria-controls]="hasChildren ? chipId + '-children' : null"
          [attr.role]="'button'"
          [attr.tabindex]="getTabIndex()">
          
          <!-- Operator display -->
          <span class="operator-display" *ngIf="logicalOperator">
            {{ logicalOperator }}
          </span>
          
          <!-- Badge display -->
          <ng-container *ngFor="let badge of badges">
            <p-badge 
              [value]="badge.text"
              [severity]="getBadgeSeverity(badge.type)"
              [class]="getBadgeClasses(badge)"
              [pTooltip]="badge.tooltip"
              tooltipPosition="top">
            </p-badge>
          </ng-container>
        </p-button>
        
        <!-- Add sibling button (encircled plus) -->
        <button
          #addButton
          type="button"
          class="add-sibling-btn"
          [disabled]="disabled || !canAddSibling"
          (click)="onAddSibling()"
          [attr.aria-label]="'Add sibling group'"
          pTooltip="Add sibling group"
          tooltipPosition="top">
          <i class="pi pi-plus-circle"></i>
        </button>
      </div>
      
      <!-- Grouping braces (visual indicator) -->
      <div class="grouping-braces" *ngIf="isGrouped && hasChildren">
        <span class="brace-left">{</span>
        <span class="brace-right">}</span>
      </div>
      
      <!-- Children container -->
      <div 
        class="group-children"
        *ngIf="hasChildren && isExpanded"
        [id]="chipId + '-children'"
        [attr.aria-label]="'Group children'"
        role="group">
        
        <ng-container *ngFor="let child of children; trackBy: trackByChildId; let i = index">
          <div
            class="child-item"
            [class.dragging]="isDragging"
            cdkDrag
            [cdkDragData]="child"
            [cdkDragDisabled]="!enableDragDrop || disabled || !child.isDraggable"
            (cdkDragStarted)="onDragStarted(child)"
            (cdkDragEnded)="onDragEnded()">
            
            <!-- Drag handle -->
            <div class="drag-handle" *ngIf="enableDragDrop && child.isDraggable" cdkDragHandle>
              <i class="pi pi-bars"></i>
            </div>
            
            <!-- Child component (recursive for nested groups) -->
            <mp-group-chip
              *ngIf="child.type === 'group'"
              [chipData]="child"
              [children]="getChildrenForGroup(child.id)"
              [disabled]="disabled"
              [compactMode]="compactMode"
              [enableDragDrop]="enableDragDrop"
              [indentationLevel]="indentationLevel + 1"
              (chipClick)="onChildClick($event)"
              (childrenChanged)="onChildrenChanged($event)"
              (addSibling)="onChildAddSibling($event)"
              (deleteChild)="onChildDelete($event)">
            </mp-group-chip>
            
            <!-- Other chip types would be handled by their respective components -->
            <mp-condition-chip
              *ngIf="child.type === 'field' || child.type === 'operator' || child.type === 'value'"
              [chipData]="child"
              [disabled]="disabled"
              [compactMode]="compactMode"
              (chipClick)="onChildClick($event)"
              (deleteChip)="onChildDelete($event)">
            </mp-condition-chip>
            
            <mp-function-chip
              *ngIf="child.type === 'function'"
              [chipData]="child"
              [disabled]="disabled"
              [compactMode]="compactMode"
              (chipClick)="onChildClick($event)"
              (deleteChip)="onChildDelete($event)">
            </mp-function-chip>
            
            <!-- Delete button for child -->
            <button
              type="button"
              class="delete-child-btn"
              *ngIf="child.isDeletable && !disabled"
              (click)="onChildDelete(child)"
              [attr.aria-label]="'Delete ' + child.type"
              pTooltip="Delete"
              tooltipPosition="top">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </ng-container>
        
        <!-- Add child button -->
        <button
          type="button"
          class="add-child-btn"
          [disabled]="disabled || !canAddChild"
          (click)="onAddChild()"
          [attr.aria-label]="'Add child element'"
          pTooltip="Add child element"
          tooltipPosition="top">
          <i class="pi pi-plus"></i>
          <span>Add Condition</span>
        </button>
      </div>
    </div>
    
    <!-- Validation message -->
    <div 
      *ngIf="!isValid && validationMessage"
      [id]="chipId + '-validation'"
      class="validation-message"
      role="alert"
      aria-live="polite">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationMessage }}
    </div>
  `,
  styleUrls: ['./group-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupChipComponent extends BaseChipComponent implements OnInit {
  @Input() children: ChipViewModel[] = [];
  @Input() logicalOperator: 'AND' | 'OR' | 'NOT' = 'AND';
  @Input() isGrouped = false;
  @Input() isExpanded = true;
  @Input() enableDragDrop = true;
  @Input() indentationLevel = 0;
  @Input() maxDepth = 10;
  @Input() maxElements = 100;
  
  @Output() childrenChanged = new EventEmitter<{groupId: string, children: ChipViewModel[]}>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() addChild = new EventEmitter<string>();
  @Output() deleteChild = new EventEmitter<{groupId: string, childId: string}>();
  @Output() groupingToggled = new EventEmitter<{groupId: string, isGrouped: boolean}>();
  @Output() operatorChanged = new EventEmitter<{groupId: string, operator: 'AND' | 'OR' | 'NOT'}>();
  
  @ViewChild('groupToggle') groupToggleButton!: ElementRef;
  @ViewChild('addButton') addSiblingButton!: ElementRef;
  
  @HostBinding('class.group-chip') groupChipClass = true;
  @HostBinding('class.nested') get isNested() { return this.indentationLevel > 0; }
  @HostBinding('class.max-depth') get isMaxDepth() { return this.indentationLevel >= this.maxDepth; }
  
  protected isDragging = false;
  
  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }
  
  get canAddSibling(): boolean {
    return this.indentationLevel < this.maxDepth;
  }
  
  get canAddChild(): boolean {
    return this.indentationLevel < this.maxDepth - 1 && this.children.length < this.maxElements;
  }
  
  ngOnInit(): void {
    super.ngOnInit();
    this.validateGroupData();
  }
  
  /**
   * Toggle grouping state
   */
  toggleGrouping(): void {
    if (!this.disabled) {
      this.isGrouped = !this.isGrouped;
      this.groupingToggled.emit({ groupId: this.chipId, isGrouped: this.isGrouped });
    }
  }
  
  /**
   * Handle adding sibling group
   */
  onAddSibling(): void {
    if (this.canAddSibling && !this.disabled) {
      this.addSibling.emit(this.chipId);
    }
  }
  
  /**
   * Handle adding child element
   */
  onAddChild(): void {
    if (this.canAddChild && !this.disabled) {
      this.addChild.emit(this.chipId);
    }
  }
  
  /**
   * Handle child click events
   */
  onChildClick(child: ChipViewModel): void {
    this.chipClick.emit(child);
  }
  
  /**
   * Handle child deletion
   */
  onChildDelete(child: ChipViewModel): void {
    this.deleteChild.emit({ groupId: this.chipId, childId: child.id });
  }
  
  /**
   * Handle children reordering via drag and drop
   */
  onChildrenReordered(event: CdkDragDrop<ChipViewModel[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      const newChildren = [...this.children];
      const movedItem = newChildren.splice(event.previousIndex, 1)[0];
      newChildren.splice(event.currentIndex, 0, movedItem);
      
      this.childrenChanged.emit({ groupId: this.chipId, children: newChildren });
    }
  }
  
  /**
   * Handle drag start
   */
  onDragStarted(child: ChipViewModel): void {
    this.isDragging = true;
  }
  
  /**
   * Handle drag end
   */
  onDragEnded(): void {
    this.isDragging = false;
  }
  
  /**
   * Handle nested group children changes
   */
  onChildrenChanged(event: {groupId: string, children: ChipViewModel[]}): void {
    this.childrenChanged.emit(event);
  }
  
  /**
   * Handle nested group add sibling
   */
  onChildAddSibling(childId: string): void {
    this.addSibling.emit(childId);
  }
  
  /**
   * Get display label for the group
   */
  getDisplayLabel(): string {
    if (this.hasChildren) {
      return `Group (${this.children.length})`;
    }
    return this.displayText || 'Empty Group';
  }
  
  /**
   * Get children for a specific group ID
   */
  getChildrenForGroup(groupId: string): ChipViewModel[] {
    // This would be implemented by the parent component
    // For now, return empty array
    return [];
  }
  
  /**
   * Track function for ngFor
   */
  trackByChildId(index: number, child: ChipViewModel): string {
    return child.id;
  }
  
  /**
   * Get ARIA label for group toggle button
   */
  getGroupToggleAriaLabel(): string {
    return this.isGrouped ? 'Ungroup elements' : 'Group elements';
  }
  
  /**
   * Override base class method for group-specific ARIA label
   */
  protected override getAriaLabel(): string {
    let label = `Group chip: ${this.getDisplayLabel()}`;
    
    if (this.logicalOperator) {
      label += `, Operator: ${this.logicalOperator}`;
    }
    
    if (this.isGrouped) {
      label += ', Grouped';
    }
    
    if (this.hasChildren) {
      label += `, ${this.children.length} children`;
    }
    
    if (!this.isValid && this.validationMessage) {
      label += `, Error: ${this.validationMessage}`;
    }
    
    return label;
  }
  
  /**
   * Override base class method for group-specific classes
   */
  protected override getChipClasses(): string {
    const baseClasses = super.getChipClasses();
    const groupClasses = ['group-chip-button'];
    
    if (this.isGrouped) groupClasses.push('grouped');
    if (this.hasChildren) groupClasses.push('has-children');
    if (this.isExpanded) groupClasses.push('expanded');
    if (this.logicalOperator) groupClasses.push(`operator-${this.logicalOperator.toLowerCase()}`);
    
    return `${baseClasses} ${groupClasses.join(' ')}`;
  }
  
  /**
   * Handle keyboard navigation for group-specific actions
   */
  override onKeyDown(event: KeyboardEvent): void {
    super.onKeyDown(event);
    
    switch (event.key) {
      case 'ArrowRight':
        if (!this.isExpanded && this.hasChildren) {
          event.preventDefault();
          this.isExpanded = true;
        }
        break;
      case 'ArrowLeft':
        if (this.isExpanded && this.hasChildren) {
          event.preventDefault();
          this.isExpanded = false;
        }
        break;
      case 'g':
      case 'G':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggleGrouping();
        }
        break;
      case '+':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (event.shiftKey) {
            this.onAddSibling();
          } else {
            this.onAddChild();
          }
        }
        break;
    }
  }
  
  /**
   * Validate group-specific data
   */
  private validateGroupData(): void {
    if (this.indentationLevel < 0) {
      throw new Error('GroupChipComponent: indentationLevel cannot be negative');
    }
    
    if (this.indentationLevel > this.maxDepth) {
      console.warn(`GroupChipComponent: indentationLevel (${this.indentationLevel}) exceeds maxDepth (${this.maxDepth})`);
    }
    
    if (this.children.length > this.maxElements) {
      console.warn(`GroupChipComponent: children count (${this.children.length}) exceeds maxElements (${this.maxElements})`);
    }
  }
}