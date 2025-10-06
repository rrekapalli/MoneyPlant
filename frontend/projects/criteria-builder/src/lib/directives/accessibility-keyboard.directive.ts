import { 
  Directive, 
  ElementRef, 
  HostListener, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy 
} from '@angular/core';
import { AccessibilityService } from '../services/accessibility.service';
import { QueryToken } from '../models/token-system.interface';

/**
 * Directive for handling keyboard shortcuts and accessibility features
 */
@Directive({
  selector: '[acAccessibilityKeyboard]',
  standalone: true
})
export class AccessibilityKeyboardDirective implements OnInit, OnDestroy {
  
  @Input() token?: QueryToken;
  @Input() enableGlobalShortcuts = false;
  @Input() enableTokenNavigation = false;
  @Input() enableFocusTrap = false;
  
  @Output() addCondition = new EventEmitter<void>();
  @Output() addGroup = new EventEmitter<void>();
  @Output() deleteToken = new EventEmitter<QueryToken>();
  @Output() editToken = new EventEmitter<QueryToken>();
  @Output() duplicateToken = new EventEmitter<QueryToken>();
  @Output() moveTokenUp = new EventEmitter<QueryToken>();
  @Output() moveTokenDown = new EventEmitter<QueryToken>();
  @Output() toggleGroup = new EventEmitter<QueryToken>();
  @Output() focusNext = new EventEmitter<void>();
  @Output() focusPrevious = new EventEmitter<void>();
  @Output() focusFirst = new EventEmitter<void>();
  @Output() focusLast = new EventEmitter<void>();
  @Output() escape = new EventEmitter<void>();
  
  private shortcuts: Array<{ key: string; callback: () => void }> = [];
  
  constructor(
    private elementRef: ElementRef,
    private accessibilityService: AccessibilityService
  ) {}
  
  ngOnInit(): void {
    this.setupKeyboardShortcuts();
  }
  
  ngOnDestroy(): void {
    this.cleanupKeyboardShortcuts();
  }
  
  private setupKeyboardShortcuts(): void {
    if (this.enableGlobalShortcuts) {
      this.registerGlobalShortcuts();
    }
  }
  
  private registerGlobalShortcuts(): void {
    // Global shortcuts for criteria builder
    this.registerShortcut('Ctrl+Enter', () => {
      this.addCondition.emit();
      this.accessibilityService.announceToScreenReader('Added new condition');
    });
    
    this.registerShortcut('Ctrl+Shift+Enter', () => {
      this.addGroup.emit();
      this.accessibilityService.announceToScreenReader('Added new group');
    });
    
    this.registerShortcut('Ctrl+d', () => {
      if (this.token) {
        this.duplicateToken.emit(this.token);
        this.accessibilityService.announceToScreenReader(`Duplicated ${this.token.type} token`);
      }
    });
    
    this.registerShortcut('Ctrl+ArrowUp', () => {
      if (this.token) {
        this.moveTokenUp.emit(this.token);
        this.accessibilityService.announceToScreenReader(`Moved ${this.token.type} token up`);
      }
    });
    
    this.registerShortcut('Ctrl+ArrowDown', () => {
      if (this.token) {
        this.moveTokenDown.emit(this.token);
        this.accessibilityService.announceToScreenReader(`Moved ${this.token.type} token down`);
      }
    });
    
    this.registerShortcut('Ctrl+g', () => {
      if (this.token) {
        this.toggleGroup.emit(this.token);
        this.accessibilityService.announceToScreenReader(`Toggled grouping for ${this.token.type} token`);
      }
    });
    
    // Navigation shortcuts
    this.registerShortcut('ArrowRight', () => {
      this.focusNext.emit();
    });
    
    this.registerShortcut('ArrowLeft', () => {
      this.focusPrevious.emit();
    });
    
    this.registerShortcut('Home', () => {
      this.focusFirst.emit();
    });
    
    this.registerShortcut('End', () => {
      this.focusLast.emit();
    });
  }
  
  private registerShortcut(key: string, callback: () => void): void {
    this.shortcuts.push({ key, callback });
    this.accessibilityService.registerKeyboardShortcut(key, callback);
  }
  
  private cleanupKeyboardShortcuts(): void {
    this.shortcuts.forEach(shortcut => {
      this.accessibilityService.unregisterKeyboardShortcut(shortcut.key);
    });
    this.shortcuts = [];
  }
  
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Handle global shortcuts
    if (this.enableGlobalShortcuts) {
      const handled = this.accessibilityService.handleGlobalKeyboardEvent(event);
      if (handled) {
        return;
      }
    }
    
    // Handle token-specific shortcuts
    if (this.token) {
      this.handleTokenKeyboard(event);
    }
    
    // Handle focus trap
    if (this.enableFocusTrap) {
      this.accessibilityService.trapFocus(this.elementRef, event);
    }
    
    // Handle navigation
    if (this.enableTokenNavigation) {
      this.handleNavigationKeyboard(event);
    }
  }
  
  private handleTokenKeyboard(event: KeyboardEvent): void {
    if (!this.token) {
      return;
    }
    
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        if (this.token.isDeletable && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.deleteToken.emit(this.token);
          this.accessibilityService.announceToScreenReader(`Deleted ${this.token.type} token`);
        }
        break;
        
      case 'F2':
        if (this.token.isEditable) {
          event.preventDefault();
          this.editToken.emit(this.token);
          this.accessibilityService.announceToScreenReader(`Editing ${this.token.type} token`);
        }
        break;
        
      case 'Enter':
      case ' ':
        if (this.token.isEditable && !event.ctrlKey) {
          event.preventDefault();
          this.editToken.emit(this.token);
          this.accessibilityService.announceToScreenReader(`Editing ${this.token.type} token`);
        }
        break;
        
      case 'ArrowDown':
        if (this.token.hasDropdown && !event.ctrlKey) {
          event.preventDefault();
          this.editToken.emit(this.token);
          this.accessibilityService.announceToScreenReader(`Opening options for ${this.token.type} token`);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.escape.emit();
        (event.target as HTMLElement).blur();
        this.accessibilityService.announceToScreenReader('Cancelled');
        break;
    }
  }
  
  private handleNavigationKeyboard(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
      case 'Tab':
        if (!event.shiftKey && !event.ctrlKey) {
          event.preventDefault();
          this.focusNext.emit();
        }
        break;
        
      case 'ArrowLeft':
        if (!event.ctrlKey) {
          event.preventDefault();
          this.focusPrevious.emit();
        }
        break;
        
      case 'Home':
        if (!event.ctrlKey) {
          event.preventDefault();
          this.focusFirst.emit();
        }
        break;
        
      case 'End':
        if (!event.ctrlKey) {
          event.preventDefault();
          this.focusLast.emit();
        }
        break;
    }
  }
  
  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    if (this.token) {
      this.accessibilityService.setFocusedToken(this.token.id);
    }
  }
  
  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    // Only clear focus if not moving to a related element
    if (!this.elementRef.nativeElement.contains(event.relatedTarget as Node)) {
      this.accessibilityService.setFocusedToken(null);
    }
  }
}