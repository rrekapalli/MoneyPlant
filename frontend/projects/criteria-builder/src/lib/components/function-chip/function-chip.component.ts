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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { ConfirmationService } from 'primeng/api';
import { BaseChipComponent } from '../base-chip/base-chip.component';
import { ChipViewModel } from '../../interfaces';

/**
 * Function parameter interface for type safety
 */
export interface FunctionParameter {
  id: string;
  name: string;
  type: 'field' | 'value' | 'function';
  dataType: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
  value?: any;
  isConfigured: boolean;
}

/**
 * Function chip component for displaying function calls with parameter management
 * Extends BaseChipComponent with function-specific functionality and parameter handling
 */
@Component({
  selector: 'mp-function-chip',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    BadgeModule, 
    TooltipModule,
    ConfirmDialogModule,
    PopoverModule
  ],
  providers: [ConfirmationService],
  template: `
    <div 
      class="function-chip-container"
      [class.expanded]="isExpanded"
      [class.has-parameters]="hasParameters"
      [class.all-configured]="allParametersConfigured"
      [class.deletable]="isDeletable && !disabled">
      
      <!-- Main function chip -->
      <div class="function-chip-header">
        <!-- Expand/collapse button -->
        <button
          #expandButton
          type="button"
          class="expand-btn"
          *ngIf="hasParameters"
          [class.expanded]="isExpanded"
          [disabled]="disabled"
          (click)="toggleExpanded()"
          [attr.aria-label]="isExpanded ? 'Collapse parameters' : 'Expand parameters'"
          [attr.aria-expanded]="isExpanded"
          pTooltip="Toggle parameter view"
          tooltipPosition="top">
          <i class="pi" [class.pi-chevron-down]="!isExpanded" [class.pi-chevron-up]="isExpanded"></i>
        </button>
        
        <!-- Main function button -->
        <p-button
          #chipButton
          [label]="getDisplayLabel()"
          [disabled]="disabled || !isEditable"
          [severity]="getButtonSeverity()"
          [size]="compactMode ? 'small' : undefined"
          [outlined]="!isSelected"
          [text]="isSelected"
          [class]="getChipClasses()"
          [pTooltip]="getTooltipText()"
          tooltipPosition="top"
          (click)="onChipClick($event)"
          (keydown)="onKeyDown($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [attr.aria-label]="getAriaLabel()"
          [attr.aria-describedby]="getAriaDescribedBy()"
          [attr.role]="'button'"
          [attr.tabindex]="getTabIndex()">
          
          <!-- Function category icon -->
          <i 
            *ngIf="functionCategory" 
            [class]="'pi pi-' + getCategoryIcon()"
            class="category-icon">
          </i>
          
          <!-- Function name -->
          <span class="function-name">{{ functionName }}</span>
          
          <!-- Parameter count badge -->
          <p-badge 
            *ngIf="hasParameters"
            [value]="getParameterCountText()"
            [severity]="getParameterBadgeSeverity()"
            class="parameter-count-badge"
            [pTooltip]="getParameterTooltip()"
            tooltipPosition="top">
          </p-badge>
          
          <!-- Validation indicator -->
          <i 
            *ngIf="!isValid" 
            class="pi pi-exclamation-triangle validation-icon"
            [pTooltip]="validationMessage"
            tooltipPosition="top">
          </i>
          
          <!-- Loading indicator -->
          <i 
            *ngIf="isLoading" 
            class="pi pi-spin pi-spinner loading-icon">
          </i>
        </p-button>
        
        <!-- Delete button -->
        <button
          #deleteButton
          type="button"
          class="delete-btn"
          *ngIf="isDeletable && !disabled && showDeleteButton"
          (click)="onDeleteClick($event)"
          [attr.aria-label]="'Delete function ' + functionName"
          pTooltip="Delete function"
          tooltipPosition="top">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <!-- Parameters panel (expandable) -->
      <div 
        class="parameters-panel"
        *ngIf="hasParameters && isExpanded"
        [attr.aria-label]="'Parameters for ' + functionName"
        role="group">
        
        <div class="parameters-header">
          <span class="parameters-title">Parameters</span>
          <button
            type="button"
            class="configure-all-btn"
            [disabled]="disabled || allParametersConfigured"
            (click)="configureAllParameters()"
            pTooltip="Configure all parameters"
            tooltipPosition="top">
            <i class="pi pi-cog"></i>
            Configure All
          </button>
        </div>
        
        <div class="parameters-list">
          <div 
            *ngFor="let param of parameters; trackBy: trackByParameterId"
            class="parameter-item"
            [class.configured]="param.isConfigured"
            [class.required]="param.required"
            [class.invalid]="!isParameterValid(param)">
            
            <!-- Parameter chip -->
            <div class="parameter-chip">
              <!-- Parameter type icon -->
              <i [class]="'pi pi-' + getParameterTypeIcon(param.type)" class="param-type-icon"></i>
              
              <!-- Parameter name -->
              <span class="param-name">{{ param.name }}</span>
              
              <!-- Parameter value display -->
              <span 
                class="param-value"
                [class.placeholder]="!param.isConfigured">
                {{ getParameterValueDisplay(param) }}
              </span>
              
              <!-- Required indicator -->
              <span 
                *ngIf="param.required && !param.isConfigured"
                class="required-indicator"
                pTooltip="Required parameter"
                tooltipPosition="top">
                *
              </span>
              
              <!-- Configured indicator -->
              <i 
                *ngIf="param.isConfigured"
                class="pi pi-check configured-icon"
                pTooltip="Parameter configured"
                tooltipPosition="top">
              </i>
            </div>
            
            <!-- Parameter actions -->
            <div class="parameter-actions">
              <button
                type="button"
                class="configure-param-btn"
                [disabled]="disabled"
                (click)="configureParameter(param)"
                [attr.aria-label]="'Configure parameter ' + param.name"
                pTooltip="Configure parameter"
                tooltipPosition="top">
                <i class="pi pi-pencil"></i>
              </button>
              
              <button
                type="button"
                class="clear-param-btn"
                *ngIf="param.isConfigured && !param.required"
                [disabled]="disabled"
                (click)="clearParameter(param)"
                [attr.aria-label]="'Clear parameter ' + param.name"
                pTooltip="Clear parameter"
                tooltipPosition="top">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Add nested function button -->
        <button
          type="button"
          class="add-nested-function-btn"
          [disabled]="disabled || !canAddNestedFunction"
          (click)="addNestedFunction()"
          pTooltip="Add nested function"
          tooltipPosition="top">
          <i class="pi pi-plus"></i>
          Add Nested Function
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
    
    <!-- Confirmation dialog -->
    <p-confirmDialog 
      [style]="{width: '350px'}"
      [baseZIndex]="10000"
      rejectButtonStyleClass="p-button-text">
    </p-confirmDialog>
  `,
  styleUrls: ['./function-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionChipComponent extends BaseChipComponent implements OnInit {
  @Input() functionName = '';
  @Input() functionCategory?: 'math' | 'indicator' | 'aggregate' | 'string' | 'date' | 'logical';
  @Input() parameters: FunctionParameter[] = [];
  @Input() isExpanded = false;
  @Input() showDeleteButton = true;
  @Input() confirmDelete = true;
  @Input() canAddNestedFunction = true;
  @Input() maxNestingLevel = 5;
  @Input() currentNestingLevel = 0;
  
  @Output() deleteChip = new EventEmitter<ChipViewModel>();
  @Output() parameterConfigured = new EventEmitter<{functionId: string, parameter: FunctionParameter}>();
  @Output() parameterCleared = new EventEmitter<{functionId: string, parameterId: string}>();
  @Output() nestedFunctionAdded = new EventEmitter<{functionId: string, parameterId?: string}>();
  @Output() expandedChanged = new EventEmitter<{functionId: string, expanded: boolean}>();
  
  @ViewChild('expandButton') expandButton!: ElementRef;
  @ViewChild('deleteButton') deleteButton!: ElementRef;
  
  @HostBinding('class.function-chip') functionChipClass = true;
  @HostBinding('class.nested') get isNested() { return this.currentNestingLevel > 0; }
  @HostBinding('class.max-nesting') get isMaxNesting() { return this.currentNestingLevel >= this.maxNestingLevel; }
  
  constructor(private confirmationService: ConfirmationService) {
    super();
  }
  
  get hasParameters(): boolean {
    return this.parameters && this.parameters.length > 0;
  }
  
  get allParametersConfigured(): boolean {
    if (!this.hasParameters) return true;
    return this.parameters.every(p => p.isConfigured || !p.required);
  }
  
  get requiredParametersConfigured(): boolean {
    const requiredParams = this.parameters.filter(p => p.required);
    return requiredParams.every(p => p.isConfigured);
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    this.initializeFunctionData();
  }
  
  /**
   * Toggle expanded state
   */
  toggleExpanded(): void {
    if (this.hasParameters && !this.disabled) {
      this.isExpanded = !this.isExpanded;
      this.expandedChanged.emit({ functionId: this.chipId, expanded: this.isExpanded });
    }
  }
  
  /**
   * Get display label for the function
   */
  getDisplayLabel(): string {
    if (this.functionName) {
      return this.functionName.toUpperCase();
    }
    return this.displayText || 'Function';
  }
  
  /**
   * Get tooltip text with function details
   */
  getTooltipText(): string {
    if (this.tooltip) return this.tooltip;
    
    let tooltipText = `Function: ${this.functionName}`;
    
    if (this.functionCategory) {
      tooltipText += ` (${this.functionCategory})`;
    }
    
    if (this.hasParameters) {
      const configuredCount = this.parameters.filter(p => p.isConfigured).length;
      tooltipText += ` - Parameters: ${configuredCount}/${this.parameters.length} configured`;
    }
    
    if (!this.isValid && this.validationMessage) {
      tooltipText += ` - Error: ${this.validationMessage}`;
    }
    
    return tooltipText;
  }
  
  /**
   * Get parameter count text for badge
   */
  getParameterCountText(): string {
    const configuredCount = this.parameters.filter(p => p.isConfigured).length;
    return `${configuredCount}/${this.parameters.length}`;
  }
  
  /**
   * Get parameter badge severity
   */
  getParameterBadgeSeverity(): 'success' | 'info' | 'warn' | 'danger' {
    if (this.allParametersConfigured) return 'success';
    if (this.requiredParametersConfigured) return 'info';
    return 'warn';
  }
  
  /**
   * Get parameter tooltip
   */
  getParameterTooltip(): string {
    const configuredCount = this.parameters.filter(p => p.isConfigured).length;
    const requiredCount = this.parameters.filter(p => p.required).length;
    return `${configuredCount} of ${this.parameters.length} parameters configured (${requiredCount} required)`;
  }
  
  /**
   * Get category icon
   */
  getCategoryIcon(): string {
    const iconMap: { [key: string]: string } = {
      'math': 'calculator',
      'indicator': 'chart-line',
      'aggregate': 'list',
      'string': 'font',
      'date': 'calendar',
      'logical': 'code'
    };
    
    return iconMap[this.functionCategory || ''] || 'cog';
  }
  
  /**
   * Get parameter type icon
   */
  getParameterTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'field': 'tag',
      'value': 'hashtag',
      'function': 'cog'
    };
    
    return iconMap[type] || 'circle';
  }
  
  /**
   * Get parameter value display
   */
  getParameterValueDisplay(param: FunctionParameter): string {
    if (!param.isConfigured) {
      return param.defaultValue ? `Default: ${param.defaultValue}` : 'Not set';
    }
    
    if (param.value === null || param.value === undefined) {
      return 'Empty';
    }
    
    const valueStr = String(param.value);
    return valueStr.length > 15 ? valueStr.substring(0, 12) + '...' : valueStr;
  }
  
  /**
   * Check if parameter is valid
   */
  isParameterValid(param: FunctionParameter): boolean {
    if (param.required && !param.isConfigured) return false;
    if (param.isConfigured && (param.value === null || param.value === undefined)) return false;
    return true;
  }
  
  /**
   * Configure a specific parameter
   */
  configureParameter(param: FunctionParameter): void {
    if (!this.disabled) {
      this.parameterConfigured.emit({ functionId: this.chipId, parameter: param });
    }
  }
  
  /**
   * Clear a parameter value
   */
  clearParameter(param: FunctionParameter): void {
    if (!this.disabled && !param.required) {
      this.parameterCleared.emit({ functionId: this.chipId, parameterId: param.id });
    }
  }
  
  /**
   * Configure all parameters
   */
  configureAllParameters(): void {
    if (!this.disabled && !this.allParametersConfigured) {
      // Emit event for each unconfigured parameter
      this.parameters
        .filter(p => !p.isConfigured)
        .forEach(param => {
          this.parameterConfigured.emit({ functionId: this.chipId, parameter: param });
        });
    }
  }
  
  /**
   * Add nested function
   */
  addNestedFunction(): void {
    if (this.canAddNestedFunction && !this.disabled && this.currentNestingLevel < this.maxNestingLevel) {
      this.nestedFunctionAdded.emit({ functionId: this.chipId });
    }
  }
  
  /**
   * Handle delete button click
   */
  onDeleteClick(event: Event): void {
    event.stopPropagation();
    
    if (this.confirmDelete) {
      this.showDeleteConfirmation();
    } else {
      this.performDelete();
    }
  }
  
  /**
   * Show delete confirmation dialog
   */
  private showDeleteConfirmation(): void {
    const message = `Are you sure you want to delete the function "${this.functionName}"?`;
    
    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Delete Function',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete();
      }
    });
  }
  
  /**
   * Perform the actual delete operation
   */
  private performDelete(): void {
    this.deleteChip.emit(this.chipData);
  }
  
  /**
   * Track function for ngFor
   */
  trackByParameterId(index: number, param: FunctionParameter): string {
    return param.id;
  }
  
  /**
   * Initialize function data from chipData
   */
  private initializeFunctionData(): void {
    if (this.chipData?.data) {
      this.functionName = this.chipData.data.functionName || this.functionName;
      this.functionCategory = this.chipData.data.category || this.functionCategory;
      this.parameters = this.chipData.data.parameters || this.parameters;
    }
  }
  
  /**
   * Override base class method for function-specific classes
   */
  protected override getChipClasses(): string {
    const baseClasses = super.getChipClasses();
    const functionClasses = ['function-chip-button'];
    
    if (this.functionCategory) functionClasses.push(`category-${this.functionCategory}`);
    if (this.hasParameters) functionClasses.push('has-parameters');
    if (this.allParametersConfigured) functionClasses.push('all-configured');
    if (this.isExpanded) functionClasses.push('expanded');
    if (this.currentNestingLevel > 0) functionClasses.push(`nested-level-${this.currentNestingLevel}`);
    
    return `${baseClasses} ${functionClasses.join(' ')}`;
  }
  
  /**
   * Override base class method for function-specific ARIA label
   */
  protected override getAriaLabel(): string {
    let label = `Function chip: ${this.functionName}`;
    
    if (this.functionCategory) {
      label += `, Category: ${this.functionCategory}`;
    }
    
    if (this.hasParameters) {
      const configuredCount = this.parameters.filter(p => p.isConfigured).length;
      label += `, Parameters: ${configuredCount} of ${this.parameters.length} configured`;
    }
    
    if (this.isExpanded) {
      label += ', Expanded';
    }
    
    if (this.isDeletable) {
      label += ', Deletable';
    }
    
    if (!this.isValid && this.validationMessage) {
      label += `, Error: ${this.validationMessage}`;
    }
    
    return label;
  }
  
  /**
   * Handle keyboard navigation for function-specific actions
   */
  override onKeyDown(event: KeyboardEvent): void {
    super.onKeyDown(event);
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (this.hasParameters && event.target === this.expandButton?.nativeElement) {
          event.preventDefault();
          this.toggleExpanded();
        }
        break;
      case 'ArrowRight':
        if (!this.isExpanded && this.hasParameters) {
          event.preventDefault();
          this.toggleExpanded();
        }
        break;
      case 'ArrowLeft':
        if (this.isExpanded && this.hasParameters) {
          event.preventDefault();
          this.toggleExpanded();
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (this.isDeletable) {
          event.preventDefault();
          this.onDeleteClick(event);
        }
        break;
    }
  }
}