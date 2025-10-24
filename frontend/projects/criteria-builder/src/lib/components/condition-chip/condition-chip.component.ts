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
import { ConfirmationService } from 'primeng/api';
import { BaseChipComponent } from '../base-chip/base-chip.component';
import { ChipViewModel } from '../../interfaces';

/**
 * Condition chip component for displaying field, operator, and value elements
 * Extends BaseChipComponent with condition-specific functionality and delete operations
 */
@Component({
  selector: 'mp-condition-chip',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    BadgeModule, 
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
    <div 
      class="condition-chip-container"
      [class.field-chip]="isFieldChip"
      [class.operator-chip]="isOperatorChip"
      [class.value-chip]="isValueChip"
      [class.deletable]="isDeletable && !disabled">
      
      <!-- Main condition chip -->
      <p-button
        #chipButton
        [label]="getDisplayLabel()"
        [disabled]="disabled || !isEditable"
        [severity]="getButtonSeverity()"
        [size]="compactMode ? 'small' : 'normal'"
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
        
        <!-- Field type icon -->
        <i 
          *ngIf="isFieldChip && fieldIcon" 
          [class]="'pi pi-' + fieldIcon"
          class="field-icon">
        </i>
        
        <!-- Operator symbol -->
        <span 
          *ngIf="isOperatorChip" 
          class="operator-symbol"
          [class]="'operator-' + getOperatorType()">
          {{ getOperatorSymbol() }}
        </span>
        
        <!-- Value type indicator -->
        <span 
          *ngIf="isValueChip && valueType" 
          class="value-type-indicator"
          [class]="'type-' + valueType">
          {{ getValueTypeSymbol() }}
        </span>
        
        <!-- Main display text -->
        <span class="chip-text">{{ getDisplayLabel() }}</span>
        
        <!-- Badges display -->
        <ng-container *ngFor="let badge of badges">
          <p-badge 
            [value]="badge.text"
            [severity]="getBadgeSeverity(badge.type)"
            [class]="getBadgeClasses(badge)"
            [pTooltip]="badge.tooltip"
            tooltipPosition="top">
          </p-badge>
        </ng-container>
        
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
        (mouseenter)="onDeleteHover(true)"
        (mouseleave)="onDeleteHover(false)"
        [attr.aria-label]="'Delete ' + chipData.type + ' ' + displayText"
        pTooltip="Delete"
        tooltipPosition="top">
        <i class="pi pi-times"></i>
      </button>
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
  styleUrls: ['./condition-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConditionChipComponent extends BaseChipComponent implements OnInit {
  @Input() fieldIcon?: string;
  @Input() valueType?: 'string' | 'number' | 'boolean' | 'date' | 'array';
  @Input() operatorType?: 'comparison' | 'logical' | 'membership' | 'pattern';
  @Input() showDeleteButton = true;
  @Input() confirmDelete = true;
  @Input() deleteMessage?: string;
  
  @Output() deleteChip = new EventEmitter<ChipViewModel>();
  @Output() deleteConfirmed = new EventEmitter<ChipViewModel>();
  @Output() deleteCancelled = new EventEmitter<ChipViewModel>();
  
  @ViewChild('deleteButton') deleteButton!: ElementRef;
  
  @HostBinding('class.condition-chip') conditionChipClass = true;
  @HostBinding('class.hover-delete') hoverDelete = false;
  
  constructor(private confirmationService: ConfirmationService) {
    super();
  }
  
  get isFieldChip(): boolean {
    return this.chipData?.type === 'field';
  }
  
  get isOperatorChip(): boolean {
    return this.chipData?.type === 'operator';
  }
  
  get isValueChip(): boolean {
    return this.chipData?.type === 'value';
  }
  
  ngOnInit(): void {
    super.ngOnInit();
    this.setDefaultIcons();
  }
  
  /**
   * Get display label with type-specific formatting
   */
  getDisplayLabel(): string {
    if (!this.displayText) return '';
    
    switch (this.chipData?.type) {
      case 'field':
        return this.formatFieldLabel(this.displayText);
      case 'operator':
        return this.formatOperatorLabel(this.displayText);
      case 'value':
        return this.formatValueLabel(this.displayText);
      default:
        return this.displayText;
    }
  }
  
  /**
   * Get tooltip text with additional context
   */
  getTooltipText(): string {
    if (this.tooltip) return this.tooltip;
    
    let tooltipText = '';
    
    switch (this.chipData?.type) {
      case 'field':
        tooltipText = `Field: ${this.displayText}`;
        if (this.chipData.data?.dataType) {
          tooltipText += ` (${this.chipData.data.dataType})`;
        }
        break;
      case 'operator':
        tooltipText = `Operator: ${this.displayText}`;
        if (this.operatorType) {
          tooltipText += ` (${this.operatorType})`;
        }
        break;
      case 'value':
        tooltipText = `Value: ${this.displayText}`;
        if (this.valueType) {
          tooltipText += ` (${this.valueType})`;
        }
        break;
      default:
        tooltipText = this.displayText;
    }
    
    if (!this.isValid && this.validationMessage) {
      tooltipText += ` - Error: ${this.validationMessage}`;
    }
    
    return tooltipText;
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
   * Handle delete button hover
   */
  onDeleteHover(isHovering: boolean): void {
    this.hoverDelete = isHovering;
  }
  
  /**
   * Show delete confirmation dialog
   */
  private showDeleteConfirmation(): void {
    const message = this.deleteMessage || 
      `Are you sure you want to delete this ${this.chipData.type}?`;
    
    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteConfirmed.emit(this.chipData);
        this.performDelete();
      },
      reject: () => {
        this.deleteCancelled.emit(this.chipData);
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
   * Get operator symbol for display
   */
  getOperatorSymbol(): string {
    if (!this.isOperatorChip) return '';
    
    const operatorMap: { [key: string]: string } = {
      'equals': '=',
      'not_equals': '≠',
      'greater_than': '>',
      'greater_than_or_equal': '≥',
      'less_than': '<',
      'less_than_or_equal': '≤',
      'contains': '∋',
      'not_contains': '∌',
      'starts_with': '⌐',
      'ends_with': '⌐⌐',
      'in': '∈',
      'not_in': '∉',
      'between': '↔',
      'and': '∧',
      'or': '∨',
      'not': '¬'
    };
    
    const key = this.displayText.toLowerCase().replace(/\s+/g, '_');
    return operatorMap[key] || this.displayText;
  }
  
  /**
   * Get operator type for styling
   */
  getOperatorType(): string {
    if (!this.operatorType) {
      // Infer type from operator text
      const text = this.displayText.toLowerCase();
      if (['and', 'or', 'not'].includes(text)) return 'logical';
      if (['in', 'not_in', 'contains'].includes(text)) return 'membership';
      if (['like', 'starts_with', 'ends_with'].includes(text)) return 'pattern';
      return 'comparison';
    }
    return this.operatorType;
  }
  
  /**
   * Get value type symbol
   */
  getValueTypeSymbol(): string {
    if (!this.valueType) return '';
    
    const typeSymbols: { [key: string]: string } = {
      'string': '"',
      'number': '#',
      'boolean': '?',
      'date': '📅',
      'array': '[]'
    };
    
    return typeSymbols[this.valueType] || '';
  }
  
  /**
   * Format field label
   */
  private formatFieldLabel(text: string): string {
    // Convert snake_case or camelCase to readable format
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  /**
   * Format operator label
   */
  private formatOperatorLabel(text: string): string {
    return text.replace(/_/g, ' ').toUpperCase();
  }
  
  /**
   * Format value label
   */
  private formatValueLabel(text: string): string {
    if (!text) return 'Empty';
    
    // Truncate long values
    if (text.length > 20) {
      return text.substring(0, 17) + '...';
    }
    
    return text;
  }
  
  /**
   * Set default icons based on chip type
   */
  private setDefaultIcons(): void {
    if (this.isFieldChip && !this.fieldIcon) {
      // Set default field icon based on data type
      const dataType = this.chipData.data?.dataType?.toLowerCase();
      switch (dataType) {
        case 'string':
        case 'text':
          this.fieldIcon = 'font';
          break;
        case 'number':
        case 'integer':
        case 'decimal':
          this.fieldIcon = 'hashtag';
          break;
        case 'date':
        case 'datetime':
          this.fieldIcon = 'calendar';
          break;
        case 'boolean':
          this.fieldIcon = 'check-square';
          break;
        default:
          this.fieldIcon = 'tag';
      }
    }
  }
  
  /**
   * Override base class method for condition-specific classes
   */
  protected override getChipClasses(): string {
    const baseClasses = super.getChipClasses();
    const conditionClasses = ['condition-chip-button'];
    
    if (this.isFieldChip) conditionClasses.push('field-type');
    if (this.isOperatorChip) conditionClasses.push('operator-type', `operator-${this.getOperatorType()}`);
    if (this.isValueChip) conditionClasses.push('value-type', `value-${this.valueType || 'unknown'}`);
    
    if (this.hoverDelete) conditionClasses.push('delete-hover');
    
    return `${baseClasses} ${conditionClasses.join(' ')}`;
  }
  
  /**
   * Override base class method for condition-specific ARIA label
   */
  protected override getAriaLabel(): string {
    let label = '';
    
    switch (this.chipData?.type) {
      case 'field':
        label = `Field chip: ${this.displayText}`;
        if (this.chipData.data?.dataType) {
          label += `, Type: ${this.chipData.data.dataType}`;
        }
        break;
      case 'operator':
        label = `Operator chip: ${this.displayText}`;
        if (this.operatorType) {
          label += `, Category: ${this.operatorType}`;
        }
        break;
      case 'value':
        label = `Value chip: ${this.displayText}`;
        if (this.valueType) {
          label += `, Type: ${this.valueType}`;
        }
        break;
      default:
        label = `${this.chipData?.type} chip: ${this.displayText}`;
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
   * Handle keyboard navigation for condition-specific actions
   */
  override onKeyDown(event: KeyboardEvent): void {
    super.onKeyDown(event);
    
    // Handle delete key for deletion
    if ((event.key === 'Delete' || event.key === 'Backspace') && this.isDeletable) {
      event.preventDefault();
      this.onDeleteClick(event);
    }
  }
  
  /**
   * Focus the delete button
   */
  focusDeleteButton(): void {
    if (this.deleteButton?.nativeElement) {
      this.deleteButton.nativeElement.focus();
    }
  }
}