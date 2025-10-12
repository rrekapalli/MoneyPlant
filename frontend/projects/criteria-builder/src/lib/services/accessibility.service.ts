import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { QueryToken, TokenType } from '../models/token-system.interface';
import { CriteriaDSL } from '../models/criteria-dsl.interface';

/**
 * Service for managing accessibility features in the criteria builder
 */
@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  
  // Accessibility mode settings
  private highContrastMode$ = new BehaviorSubject<boolean>(false);
  private colorBlindMode$ = new BehaviorSubject<boolean>(false);
  private screenReaderMode$ = new BehaviorSubject<boolean>(false);
  
  // Announcements for screen readers
  private announcements$ = new Subject<string>();
  
  // Focus management
  private focusedTokenId$ = new BehaviorSubject<string | null>(null);
  private focusHistory: string[] = [];
  
  // Keyboard shortcuts registry
  private keyboardShortcuts = new Map<string, () => void>();
  
  constructor() {
    this.detectAccessibilityPreferences();
  }
  
  // Accessibility mode getters
  get highContrastMode() {
    return this.highContrastMode$.asObservable();
  }
  
  get colorBlindMode() {
    return this.colorBlindMode$.asObservable();
  }
  
  get screenReaderMode() {
    return this.screenReaderMode$.asObservable();
  }
  
  get announcements() {
    return this.announcements$.asObservable();
  }
  
  get focusedTokenId() {
    return this.focusedTokenId$.asObservable();
  }
  
  // Accessibility mode setters
  setHighContrastMode(enabled: boolean): void {
    this.highContrastMode$.next(enabled);
    this.announceToScreenReader(
      enabled ? 'High contrast mode enabled' : 'High contrast mode disabled'
    );
  }
  
  setColorBlindMode(enabled: boolean): void {
    this.colorBlindMode$.next(enabled);
    this.announceToScreenReader(
      enabled ? 'Colorblind-friendly mode enabled' : 'Colorblind-friendly mode disabled'
    );
  }
  
  setScreenReaderMode(enabled: boolean): void {
    this.screenReaderMode$.next(enabled);
  }
  
  // Screen reader announcements
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announcements$.next(message);
    
    // Also create a live region announcement
    this.createLiveRegionAnnouncement(message, priority);
  }
  
  private createLiveRegionAnnouncement(message: string, priority: 'polite' | 'assertive'): void {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }
  
  // ARIA label generation
  generateTokenAriaLabel(token: QueryToken, context?: {
    position?: number;
    total?: number;
    parentType?: string;
    hasError?: boolean;
    errorMessage?: string;
  }): string {
    const typeLabel = this.getTokenTypeLabel(token.type);
    const text = token.displayText || token.value?.toString() || '';
    
    let label = `${typeLabel}: ${text}`;
    
    // Add position information
    if (context?.position !== undefined && context?.total !== undefined) {
      label += `. Position ${context.position + 1} of ${context.total}`;
    }
    
    // Add parent context
    if (context?.parentType) {
      label += `. Inside ${context.parentType}`;
    }
    
    // Add error information
    if (context?.hasError && context?.errorMessage) {
      label += `. Error: ${context.errorMessage}`;
    }
    
    // Add interaction hints
    if (token.isEditable) {
      label += '. Press Enter or Space to edit';
    }
    
    if (token.isDeletable) {
      label += '. Press Delete to remove';
    }
    
    if (token.hasDropdown) {
      label += '. Press Arrow Down to open options';
    }
    
    if (token.hasDialog) {
      label += '. Press F2 to open configuration dialog';
    }
    
    return label;
  }
  
  generateOverlayAriaLabel(overlayType: string, context?: any): string {
    switch (overlayType) {
      case 'dropdown':
        return `${context?.title || 'Options'} dropdown. Use arrow keys to navigate, Enter to select, Escape to close`;
      case 'dialog':
        return `${context?.title || 'Configuration'} dialog. Use Tab to navigate, Enter to confirm, Escape to cancel`;
      case 'contextmenu':
        return 'Context menu. Use arrow keys to navigate, Enter to select, Escape to close';
      case 'valueInput':
        return `${context?.valueType || 'Value'} input. Enter value and press Enter to confirm, Escape to cancel`;
      default:
        return 'Interactive overlay';
    }
  }
  
  // Focus management
  setFocusedToken(tokenId: string | null): void {
    const previousId = this.focusedTokenId$.value;
    
    if (previousId && previousId !== tokenId) {
      this.focusHistory.push(previousId);
      // Keep only last 10 items in history
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }
    
    this.focusedTokenId$.next(tokenId);
  }
  
  focusPreviousToken(): string | null {
    const previousId = this.focusHistory.pop();
    if (previousId) {
      this.focusedTokenId$.next(previousId);
      return previousId;
    }
    return null;
  }
  
  // Keyboard shortcuts
  registerKeyboardShortcut(key: string, callback: () => void): void {
    this.keyboardShortcuts.set(key, callback);
  }
  
  unregisterKeyboardShortcut(key: string): void {
    this.keyboardShortcuts.delete(key);
  }
  
  handleGlobalKeyboardEvent(event: KeyboardEvent): boolean {
    const key = this.getKeyboardShortcutKey(event);
    const callback = this.keyboardShortcuts.get(key);
    
    if (callback) {
      event.preventDefault();
      callback();
      return true;
    }
    
    return false;
  }
  
  private getKeyboardShortcutKey(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    
    modifiers.push(event.key);
    return modifiers.join('+');
  }
  
  // Query structure announcements
  announceQueryStructure(dsl: CriteriaDSL): void {
    const structure = this.describeQueryStructure(dsl);
    this.announceToScreenReader(`Query structure: ${structure}`);
  }
  
  announceTokenChange(action: string, token: QueryToken, context?: any): void {
    const typeLabel = this.getTokenTypeLabel(token.type);
    const text = token.displayText || token.value?.toString() || '';
    
    let message = `${action} ${typeLabel}`;
    if (text) {
      message += `: ${text}`;
    }
    
    if (context?.position !== undefined) {
      message += ` at position ${context.position + 1}`;
    }
    
    this.announceToScreenReader(message);
  }
  
  private describeQueryStructure(dsl: CriteriaDSL): string {
    if (!dsl.root || !dsl.root.children || dsl.root.children.length === 0) {
      return 'Empty query';
    }
    
    const conditionCount = this.countConditions(dsl.root);
    const groupCount = this.countGroups(dsl.root);
    
    let description = `${conditionCount} condition${conditionCount !== 1 ? 's' : ''}`;
    
    if (groupCount > 0) {
      description += ` in ${groupCount} group${groupCount !== 1 ? 's' : ''}`;
    }
    
    return description;
  }
  
  private countConditions(group: any): number {
    let count = 0;
    for (const child of group.children || []) {
      if (child.left && child.op && child.right) {
        count++;
      } else if (child.children) {
        count += this.countConditions(child);
      }
    }
    return count;
  }
  
  private countGroups(group: any): number {
    let count = 0;
    for (const child of group.children || []) {
      if (child.children) {
        count++;
        count += this.countGroups(child);
      }
    }
    return count;
  }
  
  // Token type labels for screen readers
  private getTokenTypeLabel(type: TokenType): string {
    const labels: Record<TokenType, string> = {
      field: 'Field',
      operator: 'Operator',
      value: 'Value',
      function: 'Function',
      group: 'Group',
      logic: 'Logic operator',
      parenthesis: 'Parenthesis'
    };
    
    return labels[type] || type;
  }
  
  // High contrast and colorblind support
  getTokenStylesForAccessibility(token: QueryToken, baseStyles: Record<string, string>): Record<string, string> {
    const styles = { ...baseStyles };
    
    if (this.highContrastMode$.value) {
      styles['border-width'] = '2px';
      styles['font-weight'] = 'bold';
      
      // High contrast colors
      switch (token.type) {
        case 'field':
          styles['background-color'] = '#000080';
          styles['color'] = '#ffffff';
          styles['border-color'] = '#ffffff';
          break;
        case 'operator':
          styles['background-color'] = '#000000';
          styles['color'] = '#ffffff';
          styles['border-color'] = '#ffffff';
          break;
        case 'value':
          styles['background-color'] = '#008000';
          styles['color'] = '#ffffff';
          styles['border-color'] = '#ffffff';
          break;
        case 'function':
          styles['background-color'] = '#800080';
          styles['color'] = '#ffffff';
          styles['border-color'] = '#ffffff';
          break;
        case 'group':
          styles['background-color'] = '#ff8000';
          styles['color'] = '#000000';
          styles['border-color'] = '#000000';
          break;
        case 'logic':
          styles['background-color'] = '#ff0000';
          styles['color'] = '#ffffff';
          styles['border-color'] = '#ffffff';
          break;
        case 'parenthesis':
          styles['background-color'] = '#808080';
          styles['color'] = '#ffffff';
          styles['border-color'] = '#ffffff';
          break;
      }
    }
    
    return styles;
  }
  
  getTokenPatternForColorBlind(type: TokenType): string {
    if (!this.colorBlindMode$.value) {
      return '';
    }
    
    // CSS patterns for colorblind users
    const patterns: Record<TokenType, string> = {
      field: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
      operator: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
      value: 'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
      function: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 40%, transparent 40%)',
      group: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)',
      logic: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px)',
      parenthesis: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)'
    };
    
    return patterns[type] || '';
  }
  
  getTokenShapeIndicator(type: TokenType): string {
    const shapes: Record<TokenType, string> = {
      field: '■', // Square
      operator: '●', // Circle
      value: '▲', // Triangle
      function: '♦', // Diamond
      group: '▬', // Rectangle
      logic: '✦', // Star
      parenthesis: '( )'
    };
    
    return shapes[type] || '';
  }
  
  // Detect user accessibility preferences
  private detectAccessibilityPreferences(): void {
    // Detect high contrast preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      this.setHighContrastMode(true);
    }
    
    // Detect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Could be used to disable animations
    }
    
    // Detect screen reader usage (heuristic)
    if (navigator.userAgent.includes('NVDA') || 
        navigator.userAgent.includes('JAWS') || 
        navigator.userAgent.includes('VoiceOver')) {
      this.setScreenReaderMode(true);
    }
  }
  
  // Focus management utilities
  focusElement(element: ElementRef | HTMLElement): void {
    const el = element instanceof ElementRef ? element.nativeElement : element;
    if (el && typeof el.focus === 'function') {
      el.focus();
    }
  }
  
  focusFirstFocusableElement(container: ElementRef | HTMLElement): void {
    const el = container instanceof ElementRef ? container.nativeElement : container;
    const focusableElements = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }
  
  focusLastFocusableElement(container: ElementRef | HTMLElement): void {
    const el = container instanceof ElementRef ? container.nativeElement : container;
    const focusableElements = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
    }
  }
  
  trapFocus(container: ElementRef | HTMLElement, event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    
    const el = container instanceof ElementRef ? container.nativeElement : container;
    const focusableElements = Array.from(el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];
    
    if (focusableElements.length === 0) {
      return;
    }
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}