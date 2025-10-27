import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { Popover } from 'primeng/popover';
import { AbstractChipComponent } from '../base-chip/abstract-chip.component';

/**
 * Custom Group Chip Component
 * A simplified group chip based on PrimeNG p-button with:
 * - Superscripted curly braces '{}' icon at top-left for enable/disable functionality
 * - Main button with click event that opens a popover
 * - Encircled 'x' icon at the end for deletion
 */
@Component({
  selector: 'mp-custom-group-chip',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    BadgeModule, 
    TooltipModule, 
    PopoverModule
  ],
  template: `
    <div class="group-chip-wrapper">
      <!-- Single Group Chip with curly braces badge and internal close button -->
      <p-button
        #chipButton
        [disabled]="disabled"
        [severity]="severity"
        [size]="size"
        [outlined]="true"
        [raised]="false"
        [rounded]="true"
        [class]="getChipClasses()"
        [pTooltip]="tooltip"
        tooltipPosition="top"
        (click)="onChipClick($event)"
        [attr.aria-label]="getAriaLabel()"
        [attr.aria-expanded]="false"
        [attr.aria-haspopup]="showPopover ? 'dialog' : null">
        
        <!-- Curly braces badge on the left -->
        <span class="group-badge" *ngIf="hasToggle">
          <i class="pi pi-code" [class.enabled]="toggleState" (click)="onToggleClick($event)"></i>
        </span>
        
        <!-- Main chip text or selected items -->
        <span class="chip-text" *ngIf="selectedItems.length === 0">{{ displayText || 'Empty Group' }}</span>
        
        <!-- Selected items as mini chips -->
        <div class="selected-items" *ngIf="selectedItems.length > 0">
          <span 
            *ngFor="let item of selectedItems; trackBy: trackByItemId" 
            class="mini-chip"
            [class]="'mini-chip-' + item.type"
            [pTooltip]="getItemTooltip(item)"
            tooltipPosition="top">
            {{ getItemDisplayText(item) }}
            <i class="pi pi-times mini-chip-delete" (click)="removeItem(item.id, $event)"></i>
          </span>
        </div>
        
        <!-- Close button on the right inside the button -->
        <span class="close-btn" *ngIf="deletable" (click)="onDeleteClick($event)">
          <i class="pi pi-times"></i>
        </span>
      </p-button>
      
      <!-- Popover Panel with Simple Content -->
      <p-popover
        *ngIf="showPopover"
        #popoverPanel
        styleClass="criteria-popover"
        (onHide)="onPopoverHide()">
        
        <div class="popover-content">
          <div class="tab-buttons">
            <button 
              class="tab-btn"
              [class.active]="activeTab === 'fields'"
              (click)="activeTab = 'fields'">
              <i class="pi pi-list"></i> Fields
            </button>
            <button 
              class="tab-btn"
              [class.active]="activeTab === 'operators'"
              (click)="activeTab = 'operators'">
              <i class="pi pi-cog"></i> Operators
            </button>
            <button 
              class="tab-btn"
              [class.active]="activeTab === 'functions'"
              (click)="activeTab = 'functions'">
              <i class="pi pi-calculator"></i> Functions
            </button>
            <button 
              class="tab-btn"
              [class.active]="activeTab === 'indicators'"
              (click)="activeTab = 'indicators'">
              <i class="pi pi-chart-line"></i> Indicators
            </button>
          </div>
          
          <div class="tab-content">
            <div *ngIf="activeTab === 'fields'" class="tab-panel">
              <h4>Available Fields</h4>
              <div class="field-list">
                <button 
                  *ngFor="let field of availableFields" 
                  class="field-option"
                  (click)="onFieldSelect(field)">
                  {{ field.name }}
                </button>
              </div>
            </div>
            
            <div *ngIf="activeTab === 'operators'" class="tab-panel">
              <h4>Available Operators</h4>
              <div class="operator-list">
                <button 
                  *ngFor="let operator of availableOperators" 
                  class="operator-option"
                  (click)="onOperatorSelect(operator)">
                  {{ operator.symbol }} - {{ operator.name }}
                </button>
              </div>
            </div>
            
            <div *ngIf="activeTab === 'functions'" class="tab-panel">
              <h4>Math Functions</h4>
              <div class="function-list">
                <button 
                  *ngFor="let func of mathFunctions" 
                  class="function-option"
                  (click)="onFunctionSelect(func)">
                  {{ func.name }}({{ func.parameters.join(', ') }})
                </button>
              </div>
            </div>
            
            <div *ngIf="activeTab === 'indicators'" class="tab-panel">
              <h4>Technical Indicators</h4>
              <div class="indicator-list">
                <button 
                  *ngFor="let indicator of technicalIndicators" 
                  class="indicator-option"
                  (click)="onIndicatorSelect(indicator)">
                  {{ indicator.name }}({{ indicator.parameters.join(', ') }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </p-popover>
    </div>
  `,
  styleUrls: ['./custom-group-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomGroupChipComponent extends AbstractChipComponent {
  @Input() availableFields: any[] = [
    { id: 'price', name: 'Price' },
    { id: 'volume', name: 'Volume' },
    { id: 'marketCap', name: 'Market Cap' },
    { id: 'pe', name: 'P/E Ratio' }
  ];
  
  @Input() availableOperators: any[] = [
    { id: 'eq', symbol: '=', name: 'Equals' },
    { id: 'gt', symbol: '>', name: 'Greater Than' },
    { id: 'lt', symbol: '<', name: 'Less Than' },
    { id: 'gte', symbol: '>=', name: 'Greater Than or Equal' },
    { id: 'lte', symbol: '<=', name: 'Less Than or Equal' },
    { id: 'ne', symbol: '!=', name: 'Not Equal' }
  ];
  
  @Input() mathFunctions: any[] = [
    { id: 'avg', name: 'AVG', parameters: ['field'] },
    { id: 'sum', name: 'SUM', parameters: ['field'] },
    { id: 'min', name: 'MIN', parameters: ['field'] },
    { id: 'max', name: 'MAX', parameters: ['field'] },
    { id: 'count', name: 'COUNT', parameters: ['field'] }
  ];
  
  @Input() technicalIndicators: any[] = [
    { id: 'sma', name: 'SMA', parameters: ['field', 'period'] },
    { id: 'ema', name: 'EMA', parameters: ['field', 'period'] },
    { id: 'rsi', name: 'RSI', parameters: ['field', 'period'] },
    { id: 'macd', name: 'MACD', parameters: ['field', 'fast', 'slow', 'signal'] }
  ];
  
  @Output() fieldSelected = new EventEmitter<{chipId: string, field: any}>();
  @Output() operatorSelected = new EventEmitter<{chipId: string, operator: any}>();
  @Output() functionSelected = new EventEmitter<{chipId: string, function: any}>();
  @Output() indicatorSelected = new EventEmitter<{chipId: string, indicator: any}>();
  
  // Active tab for popover
  activeTab: 'fields' | 'operators' | 'functions' | 'indicators' = 'fields';
  
  // Selected items within this group
  selectedItems: Array<{type: string, data: any, id: string}> = [];
  
  protected getChipType(): string {
    return 'group';
  }
  
  protected initializeChip(): void {
    // Initialize group-specific functionality
    if (!this.displayText) {
      this.displayText = '';
    }
  }
  
  /**
   * Override to return group-specific CSS classes
   */
  protected override getChipClasses(): string {
    const classes = ['group-chip'];
    
    if (this.hasToggle && this.toggleState) {
      classes.push('toggle-enabled');
    }
    
    return classes.join(' ');
  }
  
  /**
   * Get ARIA label for toggle button
   */
  getToggleAriaLabel(): string {
    return this.toggleState ? 'Disable grouping' : 'Enable grouping';
  }
  
  /**
   * Handle field selection from popover
   */
  onFieldSelect(field: any): void {
    const item = {
      type: 'field',
      data: field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.selectedItems.push(item);
    this.fieldSelected.emit({chipId: this.chipId, field});
    this.hidePopover();
  }
  
  /**
   * Handle operator selection from popover
   */
  onOperatorSelect(operator: any): void {
    const item = {
      type: 'operator',
      data: operator,
      id: `operator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.selectedItems.push(item);
    this.operatorSelected.emit({chipId: this.chipId, operator});
    this.hidePopover();
  }
  
  /**
   * Handle function selection from popover
   */
  onFunctionSelect(func: any): void {
    const item = {
      type: 'function',
      data: func,
      id: `function_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.selectedItems.push(item);
    this.functionSelected.emit({chipId: this.chipId, function: func});
    this.hidePopover();
  }
  
  /**
   * Handle indicator selection from popover
   */
  onIndicatorSelect(indicator: any): void {
    const item = {
      type: 'indicator',
      data: indicator,
      id: `indicator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.selectedItems.push(item);
    this.indicatorSelected.emit({chipId: this.chipId, indicator});
    this.hidePopover();
  }
  
  /**
   * Get display text for an item
   */
  getItemDisplayText(item: any): string {
    switch (item.type) {
      case 'field':
        return item.data.name;
      case 'operator':
        return item.data.symbol;
      case 'function':
        return item.data.name;
      case 'indicator':
        return item.data.name;
      default:
        return 'Unknown';
    }
  }
  
  /**
   * Get tooltip for an item
   */
  getItemTooltip(item: any): string {
    switch (item.type) {
      case 'field':
        return `Field: ${item.data.name}`;
      case 'operator':
        return `Operator: ${item.data.name}`;
      case 'function':
        return `Function: ${item.data.name}(${item.data.parameters?.join(', ') || ''})`;
      case 'indicator':
        return `Indicator: ${item.data.name}(${item.data.parameters?.join(', ') || ''})`;
      default:
        return 'Unknown item';
    }
  }
  
  /**
   * Remove an item from the group
   */
  removeItem(itemId: string, event: Event): void {
    event.stopPropagation();
    this.selectedItems = this.selectedItems.filter(item => item.id !== itemId);
  }
  
  /**
   * Track by function for ngFor
   */
  trackByItemId(index: number, item: any): string {
    return item.id;
  }
}