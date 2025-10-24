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
  HostListener,
  HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ChipViewModel, ChipBadge, BadgePosition } from '../../interfaces';
import { Subject } from 'rxjs';

/**
 * Abstract base chip component providing common functionality for all chip types
 * Uses PrimeNG p-button as the foundation with badge system for superscripts/subscripts
 */
@Component({
  selector: 'mp-base-chip',
  standalone: true,
  imports: [CommonModule, ButtonModule, BadgeModule, TooltipModule],
  template: `
    <p-button
      #chipButton
      [label]="displayText"
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
      [attr.aria-expanded]="isSelected"
      [attr.aria-invalid]="!isValid"
      [attr.role]="getAriaRole()"
      [attr.tabindex]="getTabIndex()">
      
      <!-- Left side badges (superscript/left position) -->
      <ng-container *ngFor="let badge of getLeftBadges()">
        <p-badge 
          [value]="badge.text"
          [severity]="getBadgeSeverity(badge.type)"
          [class]="getBadgeClasses(badge)"
          [pTooltip]="badge.tooltip"
          tooltipPosition="top">
        </p-badge>
      </ng-container>
      
      <!-- Chip content with inline badges -->
      <span class="chip-content">
        <ng-container *ngFor="let badge of getInlineBadges(); let i = index">
          <span *ngIf="i === 0" class="chip-text-before">{{ getTextBefore(badge) }}</span>
          <p-badge 
            [value]="badge.text"
            [severity]="getBadgeSeverity(badge.type)"
            [class]="getBadgeClasses(badge)"
            [pTooltip]="badge.tooltip"
            tooltipPosition="top">
          </p-badge>
          <span *ngIf="i === getInlineBadges().length - 1" class="chip-text-after">{{ getTextAfter(badge) }}</span>
        </ng-container>
        
        <!-- Main text when no inline badges -->
        <span *ngIf="getInlineBadges().length === 0" class="chip-main-text">
          {{ displayText }}
        </span>
      </span>
      
      <!-- Right side badges (subscript/right position) -->
      <ng-container *ngFor="let badge of getRightBadges()">
        <p-badge 
          [value]="badge.text"
          [severity]="getBadgeSeverity(badge.type)"
          [class]="getBadgeClasses(badge)"
          [pTooltip]="badge.tooltip"
          tooltipPosition="top">
        </p-badge>
      </ng-container>
    </p-button>
    
    <!-- Validation message for screen readers -->
    <span 
      *ngIf="!isValid && validationMessage"
      [id]="chipId + '-validation'"
      class="sr-only"
      role="alert"
      aria-live="polite">
      {{ validationMessage }}
    </span>
  `,
  styleUrls: ['./base-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class BaseChipComponent implements OnInit, OnDestroy {
  @Input() chipData!: ChipViewModel;
  @Input() disabled = false;
  @Input() compactMode = false;
  @Input() showTooltips = true;
  
  @Output() chipClick = new EventEmitter<ChipViewModel>();
  @Output() chipFocus = new EventEmitter<ChipViewModel>();
  @Output() chipBlur = new EventEmitter<ChipViewModel>();
  @Output() chipKeyDown = new EventEmitter<{chip: ChipViewModel, event: KeyboardEvent}>();
  
  @ViewChild('chipButton', { static: true }) chipButton!: ElementRef;
  
  @HostBinding('class.chip-container') chipContainer = true;
  @HostBinding('class.chip-focused') get isFocused() { return this.hasFocus; }
  @HostBinding('class.chip-invalid') get isInvalid() { return !this.isValid; }
  @HostBinding('class.chip-selected') get isChipSelected() { return this.isSelected; }
  @HostBinding('class.chip-compact') get isCompact() { return this.compactMode; }
  
  protected destroy$ = new Subject<void>();
  protected hasFocus = false;
  
  // Computed properties from chipData
  get chipId(): string { return this.chipData?.id || ''; }
  get displayText(): string { return this.chipData?.displayText || ''; }
  get badges(): ChipBadge[] { return this.chipData?.badges || []; }
  get isEditable(): boolean { return this.chipData?.isEditable ?? true; }
  get isValid(): boolean { return this.chipData?.isValid ?? true; }
  get validationMessage(): string | undefined { return this.chipData?.validationMessage; }
  get isSelected(): boolean { return this.chipData?.isSelected ?? false; }
  get isLoading(): boolean { return this.chipData?.isLoading ?? false; }
  get tooltip(): string | undefined { return this.chipData?.tooltip; }
  get isDeletable(): boolean { return this.chipData?.isDeletable ?? true; }
  get isDraggable(): boolean { return this.chipData?.isDraggable ?? true; }
  
  ngOnInit(): void {
    this.validateChipData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Handle chip click events
   */
  onChipClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled && this.isEditable) {
      this.chipClick.emit(this.chipData);
    }
  }
  
  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    this.chipKeyDown.emit({ chip: this.chipData, event });
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.disabled && this.isEditable) {
          this.chipClick.emit(this.chipData);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (this.isDeletable && !this.disabled) {
          event.preventDefault();
          // Emit delete event - to be handled by parent
          this.chipKeyDown.emit({ chip: this.chipData, event });
        }
        break;
    }
  }
  
  /**
   * Handle focus events
   */
  onFocus(): void {
    this.hasFocus = true;
    this.chipFocus.emit(this.chipData);
  }
  
  /**
   * Handle blur events
   */
  onBlur(): void {
    this.hasFocus = false;
    this.chipBlur.emit(this.chipData);
  }
  
  /**
   * Get PrimeNG button severity based on chip state
   */
  protected getButtonSeverity(): 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' | null {
    if (!this.isValid) return 'danger';
    if (this.isLoading) return 'info';
    if (this.isSelected) return 'primary';
    return 'secondary';
  }
  
  /**
   * Get CSS classes for the chip
   */
  protected getChipClasses(): string {
    const classes = ['criteria-chip', `chip-${this.chipData?.type}`];
    
    if (this.chipData?.cssClasses) {
      classes.push(...this.chipData.cssClasses);
    }
    
    if (this.isLoading) classes.push('chip-loading');
    if (!this.isValid) classes.push('chip-error');
    if (this.isDraggable) classes.push('chip-draggable');
    
    return classes.join(' ');
  }
  
  /**
   * Get badges positioned on the left side
   */
  protected getLeftBadges(): ChipBadge[] {
    return this.badges.filter(badge => 
      badge.position === 'left' || badge.position === 'superscript'
    );
  }
  
  /**
   * Get badges positioned inline with text
   */
  protected getInlineBadges(): ChipBadge[] {
    return this.badges.filter(badge => badge.position === 'inline');
  }
  
  /**
   * Get badges positioned on the right side
   */
  protected getRightBadges(): ChipBadge[] {
    return this.badges.filter(badge => 
      badge.position === 'right' || badge.position === 'subscript'
    );
  }
  
  /**
   * Get PrimeNG badge severity from badge type
   */
  protected getBadgeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (type) {
      case 'success': return 'success';
      case 'info': return 'info';
      case 'warning': return 'warn';
      case 'error': return 'danger';
      case 'primary': return 'info';
      case 'secondary': return 'secondary';
      case 'contrast': return 'contrast';
      default: return null;
    }
  }
  
  /**
   * Get CSS classes for badges
   */
  protected getBadgeClasses(badge: ChipBadge): string {
    const classes = ['chip-badge', `badge-${badge.position}`];
    if (badge.icon) classes.push('badge-with-icon');
    return classes.join(' ');
  }
  
  /**
   * Get text before inline badge
   */
  protected getTextBefore(badge: ChipBadge): string {
    // Override in subclasses for custom text splitting
    return '';
  }
  
  /**
   * Get text after inline badge
   */
  protected getTextAfter(badge: ChipBadge): string {
    // Override in subclasses for custom text splitting
    return this.displayText;
  }
  
  /**
   * Get ARIA label for accessibility
   */
  protected getAriaLabel(): string {
    let label = `${this.chipData?.type} chip: ${this.displayText}`;
    
    if (!this.isValid && this.validationMessage) {
      label += `, Error: ${this.validationMessage}`;
    }
    
    if (this.badges.length > 0) {
      const badgeTexts = this.badges.map(b => b.text).join(', ');
      label += `, Badges: ${badgeTexts}`;
    }
    
    return label;
  }
  
  /**
   * Get ARIA describedby attribute
   */
  protected getAriaDescribedBy(): string | null {
    if (!this.isValid && this.validationMessage) {
      return `${this.chipId}-validation`;
    }
    return null;
  }
  
  /**
   * Get ARIA role for the chip
   */
  protected getAriaRole(): string {
    return this.isEditable ? 'button' : 'text';
  }
  
  /**
   * Get tab index for keyboard navigation
   */
  protected getTabIndex(): number {
    return this.disabled ? -1 : 0;
  }
  
  /**
   * Validate chip data on initialization
   */
  private validateChipData(): void {
    if (!this.chipData) {
      throw new Error('BaseChipComponent: chipData is required');
    }
    
    if (!this.chipData.id) {
      throw new Error('BaseChipComponent: chipData.id is required');
    }
    
    if (!this.chipData.type) {
      throw new Error('BaseChipComponent: chipData.type is required');
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
   * Blur the chip programmatically
   */
  public blur(): void {
    if (this.chipButton?.nativeElement) {
      this.chipButton.nativeElement.blur();
    }
  }
}