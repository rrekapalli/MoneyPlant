import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostBinding,
  ChangeDetectorRef,
  Inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DragDropModule, CdkDragDrop, CdkDrag, CdkDropList, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { BaseChipComponent } from '../base-chip/base-chip.component';
import { ConditionChipComponent } from '../condition-chip/condition-chip.component';
import { FunctionChipComponent } from '../function-chip/function-chip.component';
import { ChipViewModel } from '../../interfaces';
import { DragDropService, DragDropResult } from '../../services/drag-drop.service';
import { UndoService } from '../../services/undo.service';
import { UserFeedbackService } from '../../services/user-feedback.service';

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
    DragDropModule,
    ConfirmDialogModule,
    ConditionChipComponent,
    FunctionChipComponent
  ],
  providers: [ConfirmationService],
  template: `
    <div 
      class="group-chip-container"
      [class.grouped]="isGrouped"
      [class.has-children]="hasChildren"
      [class.drag-over]="dragDropService.isDragging()"
      [style.margin-left.px]="indentationLevel * 20"
      [attr.data-group-id]="chipId"
      [attr.data-drop-zone]="chipId + '-inside'"
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
          [size]="compactMode ? 'small' : undefined"
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
        <span class="brace-left">{{ '{' }}</span>
        <span class="brace-right">{{ '}' }}</span>
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
            [attr.data-child-id]="child.id"
            [attr.data-child-type]="child.type"
            cdkDrag
            [cdkDragData]="child"
            [cdkDragDisabled]="!enableDragDrop || disabled || !child.isDraggable"
            (cdkDragStarted)="onCdkDragStarted($event)"
            (cdkDragEnded)="onCdkDragEnded($event)"
            [attr.data-drop-zone]="child.id + '-before'">
            
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
              (deleteChild)="onNestedGroupChildDelete($event)">
            </mp-group-chip>
            
            <!-- Other chip types would be handled by their respective components -->
            <mp-condition-chip
              *ngIf="child.type === 'field' || child.type === 'operator' || child.type === 'value'"
              [chipData]="child"
              [disabled]="disabled"
              [compactMode]="compactMode"
              (chipClick)="onChildClick(child)"
              (deleteChip)="onChildDelete(child)">
            </mp-condition-chip>
            
            <mp-function-chip
              *ngIf="child.type === 'function'"
              [chipData]="child"
              [disabled]="disabled"
              [compactMode]="compactMode"
              (chipClick)="onChildClick(child)"
              (deleteChip)="onChildDelete(child)">
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
export class GroupChipComponent extends BaseChipComponent implements OnInit, OnDestroy {
  @Input() children: ChipViewModel[] = [];
  @Input() logicalOperator: 'AND' | 'OR' | 'NOT' = 'AND';
  @Input() isGrouped = false;
  @Input() isExpanded = true;
  @Input() enableDragDrop = true;
  @Input() enableUndo = true;
  @Input() undoTimeout = 5000;
  @Input() indentationLevel = 0;
  @Input() maxDepth = 10;
  @Input() maxElements = 100;
  @Input() allGroups: Map<string, ChipViewModel[]> = new Map();
  
  @Output() childrenChanged = new EventEmitter<{groupId: string, children: ChipViewModel[]}>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() addChild = new EventEmitter<string>();
  @Output() deleteChild = new EventEmitter<{groupId: string, childId: string}>();
  @Output() groupingToggled = new EventEmitter<{groupId: string, isGrouped: boolean}>();
  @Output() operatorChanged = new EventEmitter<{groupId: string, operator: 'AND' | 'OR' | 'NOT'}>();
  @Output() undoRequested = new EventEmitter<any>();
  @Output() dragDropCompleted = new EventEmitter<DragDropResult>();
  
  @ViewChild('groupToggle') groupToggleButton!: ElementRef;
  @ViewChild('addButton') addSiblingButton!: ElementRef;
  
  @HostBinding('class.group-chip') groupChipClass = true;
  @HostBinding('class.nested') get isNested() { return this.indentationLevel > 0; }
  @HostBinding('class.max-depth') get isMaxDepth() { return this.indentationLevel >= this.maxDepth; }
  @HostBinding('class.dragging') get isDraggingClass() { return this.isDragging; }
  
  protected isDragging = false;
  private dragDropSubscription?: Subscription;
  private undoSubscription?: Subscription;
  
  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }
  
  get canAddSibling(): boolean {
    return this.indentationLevel < this.maxDepth;
  }
  
  get canAddChild(): boolean {
    return this.indentationLevel < this.maxDepth - 1 && this.children.length < this.maxElements;
  }

  constructor(
    public dragDropService: DragDropService,
    private undoService: UndoService,
    private confirmationService: ConfirmationService,
    private userFeedbackService: UserFeedbackService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    this.validateGroupData();
    this.setupDragDropSubscription();
    this.setupUndoSubscription();
  }

  override ngOnDestroy(): void {
    if (this.dragDropSubscription) {
      this.dragDropSubscription.unsubscribe();
    }
    if (this.undoSubscription) {
      this.undoSubscription.unsubscribe();
    }
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
   * Handle child deletion with undo support
   */
  onChildDelete(child: ChipViewModel): void {
    if (this.enableUndo) {
      this.deleteChildWithUndo(child);
    } else {
      this.confirmAndDeleteChild(child);
    }
  }

  /**
   * Delete child with undo functionality
   */
  private async deleteChildWithUndo(child: ChipViewModel): Promise<void> {
    const deleteData = {
      groupId: this.chipId,
      childId: child.id,
      childData: child,
      childIndex: this.children.findIndex(c => c.id === child.id)
    };

    const deleted = await this.userFeedbackService.handleDelete(
      child.displayText,
      child.type,
      deleteData,
      () => {
        this.deleteChild.emit({ groupId: this.chipId, childId: child.id });
      },
      false // Don't skip confirmation
    );

    if (deleted) {
      // Additional logic if needed after successful deletion
    }
  }

  /**
   * Confirm and delete child (when undo is disabled)
   */
  private async confirmAndDeleteChild(child: ChipViewModel): Promise<void> {
    const confirmed = await this.userFeedbackService.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${child.type}?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonClass: 'p-button-danger',
      icon: 'pi pi-exclamation-triangle',
      severity: 'warn'
    });

    if (confirmed) {
      this.deleteChild.emit({ groupId: this.chipId, childId: child.id });
      this.userFeedbackService.showSuccess('Deleted', `${child.type} deleted successfully`);
    }
  }

  /**
   * Handle nested group child deletion
   */
  onNestedGroupChildDelete(event: {groupId: string, childId: string}): void {
    this.deleteChild.emit(event);
  }
  
  /**
   * Handle children reordering via drag and drop with enhanced validation
   */
  onChildrenReordered(event: CdkDragDrop<ChipViewModel[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return; // No change
    }

    const movedItem = this.children[event.previousIndex];
    
    // Validate the drop operation
    const dropResult = this.dragDropService.executeDrop(
      this.chipId, // from group
      this.chipId, // to group (same group reordering)
      event.previousIndex,
      event.currentIndex,
      this.allGroups
    );

    if (!dropResult.success) {
      // Show validation errors
      const violations = dropResult.violatedConstraints || [];
      this.userFeedbackService.showError(
        'Invalid Drop',
        `Cannot move item: ${violations.join(', ')}`
      );
      return;
    }

    // Perform the reordering
    const newChildren = [...this.children];
    const movedChild = newChildren.splice(event.previousIndex, 1)[0];
    newChildren.splice(event.currentIndex, 0, movedChild);
    
    this.childrenChanged.emit({ groupId: this.chipId, children: newChildren });
    this.dragDropCompleted.emit(dropResult);

    // Handle move with undo support
    if (this.enableUndo) {
      const moveData = {
        groupId: this.chipId,
        itemId: movedItem.id,
        fromIndex: event.previousIndex,
        toIndex: event.currentIndex
      };

      this.userFeedbackService.handleMove(
        movedItem.displayText,
        `position ${event.previousIndex + 1}`,
        `position ${event.currentIndex + 1}`,
        moveData,
        () => {} // Move already performed above
      );
    } else {
      this.userFeedbackService.showSuccess(
        'Item Moved',
        `${movedItem.displayText} moved successfully`
      );
    }
  }
  
  /**
   * Handle drag start with enhanced feedback
   */
  onDragStarted(child: ChipViewModel): void {
    this.isDragging = true;
    this.dragDropService.startDrag(child, this.chipId);
    this.cdr.markForCheck();
  }
  
  /**
   * Handle drag end with cleanup
   */
  onDragEnded(): void {
    this.isDragging = false;
    this.dragDropService.endDrag();
    this.cdr.markForCheck();
  }

  /**
   * Handle CDK drag start event
   */
  onCdkDragStarted(event: CdkDragStart): void {
    const draggedItem = event.source.data as ChipViewModel;
    this.onDragStarted(draggedItem);
  }

  /**
   * Handle CDK drag end event
   */
  onCdkDragEnded(event: CdkDragEnd): void {
    this.onDragEnded();
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
   * Setup drag-drop service subscription
   */
  private setupDragDropSubscription(): void {
    if (this.enableDragDrop) {
      this.dragDropService.setConstraints({
        maxDepth: this.maxDepth,
        maxElements: this.maxElements,
        allowedTypes: ['group', 'condition', 'function', 'field', 'operator', 'value'],
        preventCircularNesting: true
      });

      this.dragDropSubscription = this.dragDropService.dragDropState$.subscribe(state => {
        // Update visual feedback based on drag state
        if (state.isDragging !== this.isDragging) {
          this.cdr.markForCheck();
        }
      });
    }
  }

  /**
   * Setup undo service subscription
   */
  private setupUndoSubscription(): void {
    if (this.enableUndo) {
      this.undoSubscription = this.undoService.undoState$.subscribe(state => {
        if (state.isActive && state.action) {
          // Handle undo execution if it matches this component's actions
          // This would be implemented based on specific undo requirements
        }
      });
    }
  }

  /**
   * Handle undo execution
   */
  onUndoExecuted(undoData: any): void {
    if (undoData.groupId === this.chipId) {
      switch (undoData.type) {
        case 'delete':
          this.restoreDeletedChild(undoData);
          break;
        case 'move':
          this.restoreMoveOperation(undoData);
          break;
        default:
          console.warn('Unknown undo type:', undoData.type);
      }
    }
    this.undoRequested.emit(undoData);
  }

  /**
   * Restore a deleted child
   */
  private restoreDeletedChild(undoData: any): void {
    const { childData, childIndex } = undoData;
    const newChildren = [...this.children];
    
    // Insert the child back at its original position
    newChildren.splice(childIndex, 0, childData);
    
    this.childrenChanged.emit({ groupId: this.chipId, children: newChildren });
    this.userFeedbackService.showSuccess('Restored', `${childData.displayText} restored successfully`);
  }

  /**
   * Restore a move operation
   */
  private restoreMoveOperation(undoData: any): void {
    const { itemId, fromIndex, toIndex } = undoData;
    const newChildren = [...this.children];
    
    // Find the item and move it back to original position
    const currentIndex = newChildren.findIndex(child => child.id === itemId);
    if (currentIndex !== -1) {
      const movedItem = newChildren.splice(currentIndex, 1)[0];
      newChildren.splice(fromIndex, 0, movedItem);
      
      this.childrenChanged.emit({ groupId: this.chipId, children: newChildren });
      this.userFeedbackService.showSuccess('Move Undone', `${movedItem.displayText} moved back to original position`);
    }
  }

  /**
   * Check if drop is allowed for external drops
   */
  canDropExternal(item: ChipViewModel): boolean {
    if (!this.enableDragDrop || this.disabled) {
      return false;
    }

    const validation = this.dragDropService.validateDrop(
      item,
      this.chipId,
      this.children.length,
      this.allGroups
    );

    return validation.isValid;
  }

  /**
   * Get drop zone data attributes for styling
   */
  getDropZoneAttributes(): { [key: string]: string } {
    return {
      'data-drop-zone': `${this.chipId}-inside`,
      'data-group-id': this.chipId,
      'data-drop-position': 'inside'
    };
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