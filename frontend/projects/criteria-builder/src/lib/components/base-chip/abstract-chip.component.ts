import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { Popover } from 'primeng/popover';
import { Subject } from 'rxjs';

/**
 * Abstract base class for all chip components
 * Provides common functionality for chip interactions, popover management, and accessibility
 */
@Component({
  selector: 'mp-abstract-chip',
  standalone: true,
  imports: [CommonModule, ButtonModule, BadgeModule, TooltipModule, PopoverModule],
  template: `
    <!-- This template will be overridden by concrete implementations -->
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class AbstractChipComponent implements OnInit, OnDestroy {
  @Input() chipId!: string;
  @Input() displayText = '';
  @Input() disabled = false;
  @Input() deletable = true;
  @Input() hasToggle = false;
  @Input() toggleState = false;
  @Input() showPopover = true;
  @Input() tooltip?: string;
  @Input() severity: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' = 'secondary';
  @Input() size: 'small' | 'large' | undefined = undefined;
  @Input() outlined = true;
  
  @Output() chipClick = new EventEmitter<string>();
  @Output() toggleClick = new EventEmitter<{chipId: string, enabled: boolean}>();
  @Output() deleteClick = new EventEmitter<string>();
  @Output() popoverShow = new EventEmitter<{chipId: string, popover: Popover}>();
  @Output() popoverHide = new EventEmitter<string>();
  
  @ViewChild('chipButton', { static: false }) chipButton?: ElementRef;
  @ViewChild('popoverPanel', { static: false }) popoverPanel?: Popover;
  
  @HostBinding('class.chip-container') chipContainer = true;
  @HostBinding('class.chip-disabled') get isDisabled() { return this.disabled; }
  @HostBinding('class.chip-toggle-enabled') get isToggleEnabled() { return this.hasToggle && this.toggleState; }
  
  protected destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.validateInputs();
    this.initializeChip();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Handle main chip button click
   */
  onChipClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      if (this.showPopover && this.popoverPanel) {
        this.popoverPanel.toggle(event);
        this.popoverShow.emit({chipId: this.chipId, popover: this.popoverPanel});
      } else {
        this.chipClick.emit(this.chipId);
      }
    }
  }
  
  /**
   * Handle toggle button click (curly braces)
   */
  onToggleClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled && this.hasToggle) {
      this.toggleState = !this.toggleState;
      this.toggleClick.emit({chipId: this.chipId, enabled: this.toggleState});
    }
  }
  
  /**
   * Handle delete button click (x icon)
   */
  onDeleteClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled && this.deletable) {
      this.deleteClick.emit(this.chipId);
    }
  }
  
  /**
   * Handle popover hide event
   */
  onPopoverHide(): void {
    this.popoverHide.emit(this.chipId);
  }
  
  /**
   * Get CSS classes for the main chip button
   */
  protected getChipClasses(): string {
    const classes = ['criteria-chip'];
    
    if (this.hasToggle && this.toggleState) {
      classes.push('toggle-enabled');
    }
    
    return classes.join(' ');
  }
  
  /**
   * Get ARIA label for the chip
   */
  protected getAriaLabel(): string {
    let label = `${this.getChipType()} chip: ${this.displayText}`;
    
    if (this.hasToggle) {
      label += `, toggle ${this.toggleState ? 'enabled' : 'disabled'}`;
    }
    
    if (this.deletable) {
      label += ', deletable';
    }
    
    return label;
  }
  
  /**
   * Get the chip type for accessibility
   */
  protected abstract getChipType(): string;
  
  /**
   * Initialize chip-specific functionality
   */
  protected abstract initializeChip(): void;
  
  /**
   * Validate required inputs
   */
  private validateInputs(): void {
    if (!this.chipId) {
      throw new Error(`${this.constructor.name}: chipId is required`);
    }
  }
  
  /**
   * Focus the chip programmatically
   */
  public focus(): void {
    if (this.chipButton?.nativeElement) {
      this.chipButton.nativeElement.focus();
    }
  }
  
  /**
   * Show the popover programmatically
   */
  public showPopoverPanel(event?: Event): void {
    if (this.popoverPanel && this.showPopover) {
      this.popoverPanel.show(event || null);
      this.popoverShow.emit({chipId: this.chipId, popover: this.popoverPanel});
    }
  }
  
  /**
   * Hide the popover programmatically
   */
  public hidePopover(): void {
    if (this.popoverPanel) {
      this.popoverPanel.hide();
      this.popoverHide.emit(this.chipId);
    }
  }
}