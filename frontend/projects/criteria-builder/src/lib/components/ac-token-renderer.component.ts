import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryToken, TokenType, TOKEN_STYLES, TokenStyle } from '../models/token-system.interface';

/**
 * Component for rendering individual tokens with appropriate styling and interaction handlers
 */
@Component({
  selector: 'ac-token-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ac-token-renderer.component.html',
  styleUrls: ['./ac-token-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcTokenRendererComponent {
  @Input() token!: QueryToken;
  @Input() isSelected: boolean = false;
  @Input() hasError: boolean = false;
  @Input() isDisabled: boolean = false;

  @Output() tokenClick = new EventEmitter<void>();
  @Output() tokenDoubleClick = new EventEmitter<void>();
  @Output() tokenRightClick = new EventEmitter<MouseEvent>();
  @Output() tokenDelete = new EventEmitter<void>();
  @Output() tokenHover = new EventEmitter<boolean>();
  @Output() tokenFocus = new EventEmitter<boolean>();

  isHovered = false;
  isFocused = false;

  /**
   * Get CSS classes for the token based on its state
   */
  getTokenClasses(): string {
    const classes = ['token', `token-${this.token.type}`];
    
    if (this.isSelected) {
      classes.push('token-selected');
    }
    
    if (this.hasError) {
      classes.push('token-error');
    }
    
    if (this.isHovered) {
      classes.push('token-hovered');
    }
    
    if (this.isFocused) {
      classes.push('token-focused');
    }
    
    if (this.isDisabled) {
      classes.push('token-disabled');
    }
    
    if (this.token.isEditable) {
      classes.push('token-editable');
    }
    
    if (this.token.isDeletable) {
      classes.push('token-deletable');
    }
    
    return classes.join(' ');
  }

  /**
   * Get inline styles for the token based on its type and state
   */
  getTokenStyles(): Record<string, string> {
    const tokenStyle = TOKEN_STYLES[this.token.type];
    const styles: Record<string, string> = {};

    if (this.hasError) {
      styles['background-color'] = tokenStyle.errorColor + '20'; // 20% opacity
      styles['border-color'] = tokenStyle.errorColor;
      styles['color'] = tokenStyle.errorColor;
    } else if (this.isSelected || this.isFocused) {
      styles['background-color'] = tokenStyle.focusColor + '30'; // 30% opacity
      styles['border-color'] = tokenStyle.focusColor;
      styles['color'] = tokenStyle.focusColor;
    } else if (this.isHovered) {
      styles['background-color'] = tokenStyle.hoverColor;
      styles['border-color'] = tokenStyle.borderColor;
      styles['color'] = tokenStyle.textColor;
    } else {
      styles['background-color'] = tokenStyle.backgroundColor;
      styles['border-color'] = tokenStyle.borderColor;
      styles['color'] = tokenStyle.textColor;
    }

    if (this.isDisabled) {
      styles['opacity'] = '0.6';
      styles['cursor'] = 'not-allowed';
    }

    return styles;
  }

  /**
   * Get the icon class for the token
   */
  getIconClass(): string {
    if (this.token.icon) {
      return this.token.icon;
    }

    // Default icons based on token type
    const defaultIcons: Record<TokenType, string> = {
      field: 'pi pi-tag',
      operator: 'pi pi-filter',
      value: 'pi pi-circle',
      function: 'pi pi-cog',
      group: 'pi pi-folder',
      logic: 'pi pi-sitemap',
      parenthesis: 'pi pi-circle'
    };

    return defaultIcons[this.token.type] || 'pi pi-circle';
  }

  /**
   * Get display text for the token
   */
  getDisplayText(): string {
    return this.token.displayText || this.token.value?.toString() || '';
  }

  /**
   * Get ARIA label for accessibility
   */
  getAriaLabel(): string {
    const typeLabel = this.token.type.charAt(0).toUpperCase() + this.token.type.slice(1);
    const text = this.getDisplayText();
    let label = `${typeLabel}: ${text}`;

    if (this.hasError) {
      label += '. Has error: ' + (this.token.errorMessage || 'Invalid value');
    }

    if (this.token.tooltip) {
      label += '. ' + this.token.tooltip;
    }

    if (this.token.isEditable) {
      label += '. Press Enter or Space to edit';
    }

    if (this.token.isDeletable) {
      label += '. Press Delete to remove';
    }

    return label;
  }

  /**
   * Handle token click
   */
  onTokenClick(): void {
    if (this.isDisabled) {
      return;
    }
    this.tokenClick.emit();
  }

  /**
   * Handle token double click
   */
  onTokenDoubleClick(): void {
    if (this.isDisabled) {
      return;
    }
    this.tokenDoubleClick.emit();
  }

  /**
   * Handle token right click
   */
  onTokenRightClick(event: MouseEvent): void {
    if (this.isDisabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.tokenRightClick.emit(event);
  }

  /**
   * Handle token hover
   */
  onTokenHover(): void {
    if (this.isDisabled) {
      return;
    }
    this.isHovered = true;
    this.tokenHover.emit(true);
  }

  /**
   * Handle token hover leave
   */
  onTokenHoverLeave(): void {
    this.isHovered = false;
    this.tokenHover.emit(false);
  }

  /**
   * Handle token focus
   */
  onTokenFocus(): void {
    if (this.isDisabled) {
      return;
    }
    this.isFocused = true;
    this.tokenFocus.emit(true);
  }

  /**
   * Handle token blur
   */
  onTokenBlur(): void {
    this.isFocused = false;
    this.tokenFocus.emit(false);
  }

  /**
   * Handle keyboard events
   */
  onTokenKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled) {
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onTokenClick();
        break;
      case 'Delete':
      case 'Backspace':
        if (this.token.isDeletable) {
          event.preventDefault();
          this.onDeleteClick(event);
        }
        break;
      case 'F2':
        if (this.token.isEditable) {
          event.preventDefault();
          this.onTokenDoubleClick();
        }
        break;
      case 'Escape':
        event.preventDefault();
        (event.target as HTMLElement).blur();
        break;
    }
  }

  /**
   * Handle delete button click
   */
  onDeleteClick(event: Event): void {
    if (this.isDisabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.tokenDelete.emit();
  }

  /**
   * Check if delete button should be shown
   */
  shouldShowDeleteButton(): boolean {
    return this.token.isDeletable && (this.isSelected || this.isHovered) && !this.isDisabled;
  }

  /**
   * Check if dropdown indicator should be shown
   */
  shouldShowDropdownIndicator(): boolean {
    return this.token.hasDropdown && !this.isDisabled;
  }

  /**
   * Check if dialog indicator should be shown
   */
  shouldShowDialogIndicator(): boolean {
    return this.token.hasDialog && !this.isDisabled;
  }

  /**
   * Check if error indicator should be shown
   */
  shouldShowErrorIndicator(): boolean {
    return this.hasError && !!this.token.errorMessage;
  }
}