import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnChanges, 
  SimpleChanges, 
  ChangeDetectionStrategy, 
  TrackByFunction,
  ChangeDetectorRef
} from '@angular/core';
import { 
  CdkDragDrop, 
  moveItemInArray, 
  CdkDragStart, 
  CdkDragEnd,
  CdkDragEnter,
  CdkDragExit
} from '@angular/cdk/drag-drop';

import { CriteriaDSL, Group, Condition } from '../../models/criteria-dsl.interface';
import { BuilderConfig } from '../../models/builder-config.interface';
import { FieldMetaResp, OperatorInfo } from '../../models/field-meta.interface';
import { FunctionMetaResp } from '../../models/function-meta.interface';
import { QueryToken, TokenType, OverlayType, OverlayConfig } from '../../models/token-system.interface';
import { CriteriaSerializerService } from '../../services/criteria-serializer.service';

/**
 * Token Query Display Component for visual query representation
 * Implements DSL to token conversion logic with proper depth and positioning
 */
@Component({
  selector: 'ac-token-query-display',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="query-display-container" 
         [class.compact]="config.compactMode"
         [class.disabled]="disabled"
         [class.drop-zone-active]="dropZoneActive"
         cdkDropList 
         [id]="getDropListId()"
         [cdkDropListData]="tokenizedQuery"
         (cdkDropListDropped)="onTokenDrop($event)"
         (cdkDropListEntered)="onDragEnter($event)"
         (cdkDropListExited)="onDragExit($event)">
      
      <!-- Token-based query rendering -->
      <div class="query-tokens" *ngIf="tokenizedQuery.length > 0; else emptyState">
        <div class="token-row" 
             *ngFor="let token of tokenizedQuery; trackBy: trackByToken; let i = index"
             [style.margin-left.px]="token.depth * 20"
             [class.token-group-start]="isGroupStart(token, i)"
             [class.token-group-end]="isGroupEnd(token, i)">
          
          <!-- Token renderer with interaction -->
          <div class="token-wrapper"
               [class.selected]="isTokenSelected(token)"
               [class.has-error]="hasTokenError(token)"
               [class.dragging]="isDragging && draggedToken?.id === token.id"
               [class.drag-disabled]="isDragDisabled(token)"
               cdkDrag
               [cdkDragData]="getDragData(token)"
               [cdkDragDisabled]="isDragDisabled(token)"
               (cdkDragStarted)="onDragStart($event)"
               (cdkDragEnded)="onDragEnd($event)">
            
            <span class="token" 
                  [class]="getTokenClasses(token)"
                  [attr.tabindex]="disabled ? -1 : 0"
                  [attr.role]="'button'"
                  [attr.aria-label]="getTokenAriaLabel(token)"
                  (click)="onTokenClick(token, $event)"
                  (dblclick)="onTokenDoubleClick(token, $event)"
                  (contextmenu)="onTokenRightClick(token, $event)"
                  (keydown)="onTokenKeyDown(token, $event)"
                  (mouseenter)="onTokenHover(token)"
                  (focus)="onTokenFocus(token)">
              
              <!-- Token icon -->
              <i class="token-icon" 
                 [class]="getTokenIcon(token)" 
                 *ngIf="getTokenIcon(token)">
              </i>
              
              <!-- Token text -->
              <span class="token-text">{{ token.displayText }}</span>
              
              <!-- Dropdown indicator -->
              <i class="token-dropdown-indicator pi pi-chevron-down" 
                 *ngIf="token.hasDropdown && !disabled">
              </i>
              
              <!-- Dialog indicator -->
              <i class="token-dialog-indicator pi pi-cog" 
                 *ngIf="token.hasDialog && !disabled">
              </i>
              
              <!-- Error indicator -->
              <i class="token-error-indicator pi pi-exclamation-triangle" 
                 *ngIf="hasTokenError(token)">
              </i>
              
              <!-- Delete button -->
              <span class="token-delete" 
                    *ngIf="token.isDeletable && !disabled && (isTokenSelected(token) || isTokenHovered(token))"
                    (click)="onTokenDelete(token, $event)"
                    [attr.aria-label]="'Delete ' + token.displayText">
                <i class="pi pi-times"></i>
              </span>
            </span>
            
            <!-- Drag handle -->
            <div class="drag-handle" 
                 *ngIf="!isDragDisabled(token)"
                 cdkDragHandle
                 [attr.aria-label]="'Drag to reorder ' + token.displayText"
                 [attr.tabindex]="0"
                 (keydown)="onDragHandleKeyDown(token, $event)">
              <i class="pi pi-bars" 
                 [class.pi-lock]="isDragDisabled(token)"></i>
            </div>
            
            <!-- Drop zone indicator -->
            <div class="drop-zone-indicator" 
                 *ngIf="dropZoneActive && !isDragDisabled(token)"
                 [class.valid-drop]="draggedToken && canReorderTokens(draggedToken, token, i)"
                 [class.invalid-drop]="draggedToken && !canReorderTokens(draggedToken, token, i)">
            </div>
          </div>
          
          <!-- Visual separators and connectors -->
          <span class="token-separator" 
                *ngIf="needsSeparator(token, i)">
          </span>
          
          <!-- Group connectors -->
          <div class="group-connector" 
               *ngIf="showGroupConnector(token, i)">
          </div>
        </div>
        
        <!-- Add condition button -->
        <div class="add-condition-row" *ngIf="!disabled">
          <button type="button" 
                  class="add-condition-btn"
                  (click)="showAddTokenMenu($event)"
                  [attr.aria-label]="'Add new condition'">
            <i class="pi pi-plus"></i>
            <span>Add Condition</span>
          </button>
        </div>
      </div>
      
      <!-- Empty state with interactive add buttons -->
      <ng-template #emptyState>
        <div class="empty-query-state">
          <div class="empty-icon">
            <i class="pi pi-search"></i>
          </div>
          <div class="empty-content">
            <h3>No conditions defined</h3>
            <p>Click to add your first condition and start building your criteria</p>
          </div>
          <div class="empty-actions" *ngIf="!disabled">
            <button type="button" 
                    class="add-first-condition-btn primary"
                    (click)="addFirstCondition()"
                    [attr.aria-label]="'Add first condition'">
              <i class="pi pi-plus"></i>
              <span>Add First Condition</span>
            </button>
            <button type="button" 
                    class="add-group-btn secondary"
                    *ngIf="config.allowGrouping"
                    (click)="addFirstGroup()"
                    [attr.aria-label]="'Add first group'">
              <i class="pi pi-sitemap"></i>
              <span>Add Group</span>
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./ac-token-query-display.component.scss']
})
export class AcTokenQueryDisplayComponent implements OnInit, OnChanges {
  
  // Input properties
  @Input() dsl: CriteriaDSL | null = null;
  @Input() fields: FieldMetaResp[] = [];
  @Input() functions: FunctionMetaResp[] = [];
  @Input() operators: OperatorInfo[] = [];
  @Input() config: BuilderConfig = {};
  @Input() mode: 'simple' | 'advanced' = 'simple';
  @Input() disabled: boolean = false;
  
  // Output events
  @Output() dslChange = new EventEmitter<CriteriaDSL>();
  @Output() tokenSelect = new EventEmitter<QueryToken>();
  @Output() tokenEdit = new EventEmitter<QueryToken>();
  @Output() tokenDelete = new EventEmitter<QueryToken>();
  @Output() overlayOpen = new EventEmitter<{token: QueryToken, type: OverlayType, config: OverlayConfig}>();
  
  // Component state
  public tokenizedQuery: QueryToken[] = [];
  public selectedToken: QueryToken | null = null;
  public hoveredToken: QueryToken | null = null;
  public isDragging = false;
  public draggedToken: QueryToken | null = null;
  public dropZoneActive = false;
  
  // Track by function for performance
  trackByToken: TrackByFunction<QueryToken> = (index: number, token: QueryToken) => token.id;
  
  constructor(
    private criteriaSerializerService: CriteriaSerializerService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.updateTokenizedQuery();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dsl']) {
      this.updateTokenizedQuery();
    }
  }
  
  // DSL to token conversion logic with proper depth and positioning
  
  private updateTokenizedQuery(): void {
    if (this.dsl) {
      this.tokenizedQuery = this.criteriaSerializerService.dslToTokens(this.dsl);
      this.updateTokenPositions();
    } else {
      this.tokenizedQuery = [];
    }
    this.cdr.markForCheck();
  }
  
  private updateTokenPositions(): void {
    this.tokenizedQuery.forEach((token, index) => {
      token.position = index;
    });
  }
  
  // Token interaction handlers
  
  onTokenClick(token: QueryToken, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.disabled) return;
    
    this.selectedToken = token;
    this.tokenSelect.emit(token);
    
    // Open appropriate overlay based on token type
    if (token.hasDropdown) {
      this.openDropdownOverlay(token, event);
    } else if (token.hasDialog) {
      this.openDialogOverlay(token, event);
    }
  }
  
  onTokenDoubleClick(token: QueryToken, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.disabled || !token.isEditable) return;
    
    this.tokenEdit.emit(token);
    
    // Always open dialog for double-click if token supports it
    if (token.hasDialog) {
      this.openDialogOverlay(token, event);
    }
  }
  
  onTokenRightClick(token: QueryToken, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.disabled) return;
    
    this.selectedToken = token;
    this.openContextMenuOverlay(token, event);
  }
  
  onTokenKeyDown(token: QueryToken, event: KeyboardEvent): void {
    if (this.disabled) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onTokenClick(token, event as any);
        break;
      case 'Delete':
      case 'Backspace':
        if (token.isDeletable) {
          event.preventDefault();
          this.onTokenDelete(token, event as any);
        }
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        this.navigateTokens(event.key === 'ArrowLeft' ? -1 : 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.selectedToken = null;
        break;
    }
  }
  
  onTokenHover(token: QueryToken): void {
    this.hoveredToken = token;
  }
  
  onTokenFocus(token: QueryToken): void {
    this.selectedToken = token;
  }
  
  onTokenDelete(token: QueryToken, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.disabled || !token.isDeletable) return;
    
    this.tokenDelete.emit(token);
    this.removeTokenFromDSL(token);
  }
  
  // Drag and drop handlers with validation and visual feedback
  
  onDragStart(event: CdkDragStart): void {
    if (this.disabled) return;
    
    this.isDragging = true;
    this.draggedToken = event.source.data as QueryToken;
    this.dropZoneActive = true;
    
    // Add visual feedback class to container
    const container = event.source.element.nativeElement.closest('.query-display-container');
    if (container) {
      container.classList.add('drag-active');
    }
    
    this.cdr.markForCheck();
  }
  
  onDragEnd(event: CdkDragEnd): void {
    this.isDragging = false;
    this.draggedToken = null;
    this.dropZoneActive = false;
    
    // Remove visual feedback class from container
    const container = event.source.element.nativeElement.closest('.query-display-container');
    if (container) {
      container.classList.remove('drag-active');
    }
    
    this.cdr.markForCheck();
  }
  
  onDragEnter(event: CdkDragEnter): void {
    // Add visual feedback for valid drop zones
    const dropElement = event.container.element.nativeElement;
    if (this.isValidDropTarget(event.item.data, event.container.data)) {
      dropElement.classList.add('valid-drop-zone');
    } else {
      dropElement.classList.add('invalid-drop-zone');
    }
  }
  
  onDragExit(event: CdkDragExit): void {
    // Remove visual feedback
    const dropElement = event.container.element.nativeElement;
    dropElement.classList.remove('valid-drop-zone', 'invalid-drop-zone');
  }
  
  onTokenDrop(event: CdkDragDrop<QueryToken[]>): void {
    if (this.disabled) return;
    
    this.isDragging = false;
    this.draggedToken = null;
    this.dropZoneActive = false;
    
    // Validate the drop operation
    if (!this.isValidDropOperation(event)) {
      this.cdr.markForCheck();
      return;
    }
    
    if (event.previousIndex !== event.currentIndex) {
      // Perform the reorder with validation
      const draggedToken = this.tokenizedQuery[event.previousIndex];
      const targetToken = this.tokenizedQuery[event.currentIndex];
      
      if (this.canReorderTokens(draggedToken, targetToken, event.currentIndex)) {
        // Reorder tokens and update DSL
        moveItemInArray(this.tokenizedQuery, event.previousIndex, event.currentIndex);
        this.updateTokenPositions();
        this.updateDSLFromTokens();
        
        // Emit change event
        this.emitDSLChange();
      }
    }
    
    this.cdr.markForCheck();
  }
  
  // Drag and drop validation methods
  
  private isValidDropOperation(event: CdkDragDrop<QueryToken[]>): boolean {
    const draggedToken = event.item.data as QueryToken;
    
    // Check if token is draggable
    if (!draggedToken.isDeletable) {
      return false;
    }
    
    // Check if drop position is valid
    const targetIndex = event.currentIndex;
    if (targetIndex < 0 || targetIndex >= this.tokenizedQuery.length) {
      return false;
    }
    
    return true;
  }
  
  private isValidDropTarget(draggedToken: QueryToken, targetData: any): boolean {
    // Basic validation - can be extended based on business rules
    if (!draggedToken || !draggedToken.isDeletable) {
      return false;
    }
    
    // Don't allow dropping parentheses in invalid positions
    if (draggedToken.type === 'parenthesis') {
      return false;
    }
    
    return true;
  }
  
  public canReorderTokens(draggedToken: QueryToken, targetToken: QueryToken, targetIndex: number): boolean {
    // Prevent reordering that would break syntax
    
    // Don't allow moving operators to invalid positions
    if (draggedToken.type === 'operator') {
      const prevToken = targetIndex > 0 ? this.tokenizedQuery[targetIndex - 1] : null;
      const nextToken = targetIndex < this.tokenizedQuery.length - 1 ? this.tokenizedQuery[targetIndex + 1] : null;
      
      // Operator must be between field/function and value
      if (!prevToken || !nextToken) return false;
      if (!['field', 'function'].includes(prevToken.type)) return false;
      if (!['value', 'field', 'function'].includes(nextToken.type)) return false;
    }
    
    // Don't allow moving values to invalid positions
    if (draggedToken.type === 'value') {
      const prevToken = targetIndex > 0 ? this.tokenizedQuery[targetIndex - 1] : null;
      
      // Value must come after an operator
      if (!prevToken || prevToken.type !== 'operator') return false;
    }
    
    // Don't allow moving fields to positions that would break conditions
    if (draggedToken.type === 'field') {
      const nextToken = targetIndex < this.tokenizedQuery.length - 1 ? this.tokenizedQuery[targetIndex + 1] : null;
      
      // Field should be followed by an operator (in most cases)
      if (nextToken && !['operator', 'logic'].includes(nextToken.type)) return false;
    }
    
    // Check depth constraints for grouping
    if (this.config.maxDepth && targetToken.depth > this.config.maxDepth) {
      return false;
    }
    
    return true;
  }
  
  // Enhanced token interaction methods
  
  isDragDisabled(token: QueryToken): boolean {
    return this.disabled || !token.isDeletable || token.type === 'parenthesis';
  }
  
  getDropListId(): string {
    return 'token-query-list';
  }
  
  getDragData(token: QueryToken): QueryToken {
    return token;
  }
  
  onDragHandleKeyDown(token: QueryToken, event: KeyboardEvent): void {
    if (this.disabled || this.isDragDisabled(token)) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Start keyboard-based drag operation
        this.startKeyboardDrag(token);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveTokenUp(token);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveTokenDown(token);
        break;
    }
  }
  
  private startKeyboardDrag(token: QueryToken): void {
    // Implement keyboard-based drag for accessibility
    this.selectedToken = token;
    this.tokenSelect.emit(token);
    
    // Show visual feedback that token is selected for moving
    const tokenElement = document.querySelector(`[aria-label*="${token.displayText}"]`) as HTMLElement;
    if (tokenElement) {
      tokenElement.classList.add('keyboard-drag-active');
      tokenElement.focus();
    }
  }
  
  private moveTokenUp(token: QueryToken): void {
    const currentIndex = this.tokenizedQuery.findIndex(t => t.id === token.id);
    if (currentIndex > 0) {
      const targetIndex = currentIndex - 1;
      const targetToken = this.tokenizedQuery[targetIndex];
      
      if (this.canReorderTokens(token, targetToken, targetIndex)) {
        moveItemInArray(this.tokenizedQuery, currentIndex, targetIndex);
        this.updateTokenPositions();
        this.updateDSLFromTokens();
        this.emitDSLChange();
        this.cdr.markForCheck();
      }
    }
  }
  
  private moveTokenDown(token: QueryToken): void {
    const currentIndex = this.tokenizedQuery.findIndex(t => t.id === token.id);
    if (currentIndex < this.tokenizedQuery.length - 1) {
      const targetIndex = currentIndex + 1;
      const targetToken = this.tokenizedQuery[targetIndex];
      
      if (this.canReorderTokens(token, targetToken, targetIndex)) {
        moveItemInArray(this.tokenizedQuery, currentIndex, targetIndex);
        this.updateTokenPositions();
        this.updateDSLFromTokens();
        this.emitDSLChange();
        this.cdr.markForCheck();
      }
    }
  }
  
  // Overlay management
  
  private openDropdownOverlay(token: QueryToken, event: MouseEvent): void {
    const overlayConfig: OverlayConfig = {
      type: 'dropdown',
      position: 'below',
      closeOnClickOutside: true,
      dropdownType: this.getDropdownType(token),
      options: this.getDropdownOptions(token),
      selectedValue: token.value
    };
    
    this.overlayOpen.emit({ token, type: 'dropdown', config: overlayConfig });
  }
  
  private openDialogOverlay(token: QueryToken, event: MouseEvent): void {
    const overlayConfig: OverlayConfig = {
      type: 'dialog',
      position: 'center',
      modal: true,
      width: '600px',
      selectedFunction: token.metadata?.['functionId']
    };
    
    this.overlayOpen.emit({ token, type: 'dialog', config: overlayConfig });
  }
  
  private openContextMenuOverlay(token: QueryToken, event: MouseEvent): void {
    const overlayConfig: OverlayConfig = {
      type: 'contextmenu',
      position: 'right',
      closeOnClickOutside: true
    };
    
    this.overlayOpen.emit({ token, type: 'contextmenu', config: overlayConfig });
  }
  
  // Helper methods for token display
  
  getTokenClasses(token: QueryToken): string {
    const classes = [`token-${token.type}`];
    
    if (this.isTokenSelected(token)) classes.push('selected');
    if (this.isTokenHovered(token)) classes.push('hovered');
    if (this.hasTokenError(token)) classes.push('error');
    if (token.isEditable) classes.push('editable');
    if (token.isDeletable) classes.push('deletable');
    
    return classes.join(' ');
  }
  
  getTokenIcon(token: QueryToken): string {
    switch (token.type) {
      case 'field': return 'pi pi-tag';
      case 'operator': return 'pi pi-filter';
      case 'value': return 'pi pi-circle';
      case 'function': return 'pi pi-cog';
      case 'logic': return 'pi pi-link';
      case 'group': return 'pi pi-sitemap';
      case 'parenthesis': return '';
      default: return 'pi pi-circle';
    }
  }
  
  getTokenAriaLabel(token: QueryToken): string {
    const typeLabel = token.type.charAt(0).toUpperCase() + token.type.slice(1);
    let label = `${typeLabel}: ${token.displayText}`;
    
    if (token.hasDropdown) label += ', has dropdown menu';
    if (token.hasDialog) label += ', has configuration dialog';
    if (token.isDeletable) label += ', deletable';
    if (this.hasTokenError(token)) label += ', has error';
    
    return label;
  }
  
  isTokenSelected(token: QueryToken): boolean {
    return this.selectedToken?.id === token.id;
  }
  
  isTokenHovered(token: QueryToken): boolean {
    return this.hoveredToken?.id === token.id;
  }
  
  hasTokenError(token: QueryToken): boolean {
    return !!token.errorMessage;
  }
  
  // Visual layout helpers
  
  isGroupStart(token: QueryToken, index: number): boolean {
    return token.type === 'parenthesis' && token.value === '(';
  }
  
  isGroupEnd(token: QueryToken, index: number): boolean {
    return token.type === 'parenthesis' && token.value === ')';
  }
  
  needsSeparator(token: QueryToken, index: number): boolean {
    if (index >= this.tokenizedQuery.length - 1) return false;
    
    const nextToken = this.tokenizedQuery[index + 1];
    
    // No separator after opening parenthesis or before closing parenthesis
    if (token.type === 'parenthesis' && token.value === '(') return false;
    if (nextToken.type === 'parenthesis' && nextToken.value === ')') return false;
    
    // No separator between logic operators and conditions
    if (token.type === 'logic' || nextToken.type === 'logic') return false;
    
    return true;
  }
  
  showGroupConnector(token: QueryToken, index: number): boolean {
    return token.depth > 0 && (token.type === 'field' || token.type === 'function');
  }
  
  // Dropdown configuration helpers
  
  private getDropdownType(token: QueryToken): 'field' | 'operator' | 'function' | 'value' {
    switch (token.type) {
      case 'field': return 'field';
      case 'operator': return 'operator';
      case 'function': return 'function';
      case 'value': return 'value';
      default: return 'value';
    }
  }
  
  private getDropdownOptions(token: QueryToken): any[] {
    switch (token.type) {
      case 'field':
        return this.fields.map(field => ({
          label: field.label,
          value: field.id,
          description: field.description,
          category: field.category
        }));
      case 'operator':
        return this.operators.map(op => ({
          label: op.label,
          value: op.id,
          description: op.description
        }));
      case 'function':
        return this.functions.map(func => ({
          label: func.label,
          value: func.id,
          description: func.description,
          category: func.category
        }));
      default:
        return [];
    }
  }
  
  // Navigation helpers
  
  private navigateTokens(direction: number): void {
    if (!this.selectedToken || this.tokenizedQuery.length === 0) return;
    
    const currentIndex = this.tokenizedQuery.findIndex(t => t.id === this.selectedToken!.id);
    if (currentIndex === -1) return;
    
    const newIndex = Math.max(0, Math.min(this.tokenizedQuery.length - 1, currentIndex + direction));
    const newToken = this.tokenizedQuery[newIndex];
    
    if (newToken) {
      this.selectedToken = newToken;
      this.tokenSelect.emit(newToken);
      
      // Focus the token element
      const tokenElement = document.querySelector(`[aria-label*="${newToken.displayText}"]`) as HTMLElement;
      if (tokenElement) {
        tokenElement.focus();
      }
    }
  }
  
  // DSL manipulation methods
  
  private removeTokenFromDSL(token: QueryToken): void {
    if (!this.dsl) return;
    
    // Create a new DSL with the token removed
    const updatedDSL = this.createDSLWithoutToken(this.dsl, token);
    this.dslChange.emit(updatedDSL);
  }
  
  private createDSLWithoutToken(dsl: CriteriaDSL, tokenToRemove: QueryToken): CriteriaDSL {
    // This is a simplified implementation
    // A full implementation would need to traverse the DSL tree and remove the specific element
    const newDSL = JSON.parse(JSON.stringify(dsl)); // Deep clone
    
    // For now, just remove the last condition if it's a simple structure
    if (newDSL.root.children.length > 0) {
      newDSL.root.children.pop();
    }
    
    return newDSL;
  }
  
  private updateDSLFromTokens(): void {
    // Convert the reordered tokens back to DSL structure
    if (this.dsl && this.tokenizedQuery.length > 0) {
      const updatedDSL = this.criteriaSerializerService.tokensToDSL(this.tokenizedQuery);
      if (updatedDSL) {
        this.dsl = updatedDSL;
      }
    }
  }
  
  private emitDSLChange(): void {
    if (this.dsl) {
      this.dslChange.emit({ ...this.dsl });
    }
  }
  
  // Public methods for adding conditions and groups
  
  public addFirstCondition(): void {
    this.addCondition();
  }
  
  public addFirstGroup(): void {
    if (!this.config.allowGrouping) return;
    
    const emptyGroup: Group = {
      operator: 'AND',
      children: []
    };
    
    if (this.dsl) {
      const updatedDSL = {
        ...this.dsl,
        root: {
          ...this.dsl.root,
          children: [...this.dsl.root.children, emptyGroup]
        }
      };
      this.dslChange.emit(updatedDSL);
    }
  }
  
  public addCondition(): void {
    const newCondition: Condition = {
      left: { fieldId: '' },
      op: '=',
      right: { type: 'string', value: '' }
    };
    
    if (this.dsl) {
      const updatedDSL = {
        ...this.dsl,
        root: {
          ...this.dsl.root,
          children: [...this.dsl.root.children, newCondition]
        }
      };
      this.dslChange.emit(updatedDSL);
    } else {
      // Create new DSL with first condition
      const newDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [newCondition]
        }
      };
      this.dslChange.emit(newDSL);
    }
  }
  
  public showAddTokenMenu(event: MouseEvent): void {
    // This would show a menu to add different types of tokens
    // For now, just add a simple condition
    this.addCondition();
  }
}