import { Injectable, ElementRef, Renderer2, RendererFactory2, Inject, DOCUMENT } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Configuration for accessibility features
 */
export interface AccessibilityConfig {
  /** Enable keyboard navigation */
  enableKeyboardNavigation: boolean;
  
  /** Enable screen reader announcements */
  enableScreenReaderAnnouncements: boolean;
  
  /** Enable high contrast mode detection */
  enableHighContrastMode: boolean;
  
  /** Enable reduced motion detection */
  enableReducedMotion: boolean;
  
  /** Enable focus management */
  enableFocusManagement: boolean;
  
  /** Announcement delay in milliseconds */
  announcementDelay: number;
  
  /** Focus trap enabled */
  enableFocusTrap: boolean;
  
  /** Skip links enabled */
  enableSkipLinks: boolean;
}

/**
 * Accessibility announcement types
 */
export type AnnouncementType = 'polite' | 'assertive' | 'off';

/**
 * Focus management options
 */
export interface FocusOptions {
  /** Prevent scroll when focusing */
  preventScroll?: boolean;
  
  /** Focus visible indicator */
  focusVisible?: boolean;
  
  /** Restore focus after action */
  restoreFocus?: boolean;
}

/**
 * Keyboard navigation configuration
 */
export interface KeyboardNavConfig {
  /** Enable arrow key navigation */
  enableArrowKeys: boolean;
  
  /** Enable tab navigation */
  enableTabNavigation: boolean;
  
  /** Enable enter/space activation */
  enableActivationKeys: boolean;
  
  /** Enable escape key handling */
  enableEscapeKey: boolean;
  
  /** Custom key bindings */
  customKeyBindings: Map<string, () => void>;
}

/**
 * Screen reader announcement data
 */
export interface AnnouncementData {
  message: string;
  type: AnnouncementType;
  priority: 'low' | 'medium' | 'high';
  context?: string;
  timestamp: number;
}

/**
 * Accessibility service for WCAG 2.1 AA compliance
 * Provides comprehensive accessibility features including keyboard navigation,
 * screen reader support, focus management, and user preference detection
 */
@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private renderer: Renderer2;
  private liveRegion: HTMLElement | null = null;
  private focusHistory: HTMLElement[] = [];
  private currentFocusIndex = -1;
  
  // Configuration
  private config: AccessibilityConfig = {
    enableKeyboardNavigation: true,
    enableScreenReaderAnnouncements: true,
    enableHighContrastMode: true,
    enableReducedMotion: true,
    enableFocusManagement: true,
    announcementDelay: 100,
    enableFocusTrap: false,
    enableSkipLinks: true
  };
  
  // State subjects
  private highContrastMode$ = new BehaviorSubject<boolean>(false);
  private reducedMotion$ = new BehaviorSubject<boolean>(false);
  private screenReaderActive$ = new BehaviorSubject<boolean>(false);
  private keyboardNavigation$ = new BehaviorSubject<boolean>(false);
  
  // Announcement queue
  private announcementQueue: AnnouncementData[] = [];
  private isProcessingAnnouncements = false;

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeAccessibilityFeatures();
  }

  /**
   * Configure accessibility service
   */
  configure(config: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...config };
    this.updateAccessibilityFeatures();
  }

  /**
   * Get current configuration
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  // User Preference Detection

  /**
   * Check if high contrast mode is enabled
   */
  isHighContrastMode(): Observable<boolean> {
    return this.highContrastMode$.asObservable();
  }

  /**
   * Check if reduced motion is preferred
   */
  isReducedMotionPreferred(): Observable<boolean> {
    return this.reducedMotion$.asObservable();
  }

  /**
   * Check if screen reader is active
   */
  isScreenReaderActive(): Observable<boolean> {
    return this.screenReaderActive$.asObservable();
  }

  /**
   * Check if keyboard navigation is active
   */
  isKeyboardNavigationActive(): Observable<boolean> {
    return this.keyboardNavigation$.asObservable();
  }

  // Screen Reader Support

  /**
   * Announce message to screen readers
   */
  announce(message: string, type: AnnouncementType = 'polite', priority: 'low' | 'medium' | 'high' = 'medium', context?: string): void {
    if (!this.config.enableScreenReaderAnnouncements || !message.trim()) {
      return;
    }

    const announcement: AnnouncementData = {
      message: message.trim(),
      type,
      priority,
      context,
      timestamp: Date.now()
    };

    // Add to queue based on priority
    if (priority === 'high') {
      this.announcementQueue.unshift(announcement);
    } else {
      this.announcementQueue.push(announcement);
    }

    this.processAnnouncementQueue();
  }

  /**
   * Announce validation errors
   */
  announceValidationError(fieldName: string, errorMessage: string): void {
    this.announce(
      `Validation error in ${fieldName}: ${errorMessage}`,
      'assertive',
      'high',
      'validation'
    );
  }

  /**
   * Announce successful actions
   */
  announceSuccess(action: string, details?: string): void {
    const message = details ? `${action}: ${details}` : action;
    this.announce(message, 'polite', 'medium', 'success');
  }

  /**
   * Announce navigation changes
   */
  announceNavigation(from: string, to: string): void {
    this.announce(
      `Navigated from ${from} to ${to}`,
      'polite',
      'low',
      'navigation'
    );
  }

  /**
   * Announce dynamic content changes
   */
  announceContentChange(description: string, changeType: 'added' | 'removed' | 'modified' = 'modified'): void {
    this.announce(
      `Content ${changeType}: ${description}`,
      'polite',
      'medium',
      'content-change'
    );
  }

  // Focus Management

  /**
   * Set focus to element with options
   */
  setFocus(element: HTMLElement | ElementRef, options: FocusOptions = {}): void {
    if (!this.config.enableFocusManagement) {
      return;
    }

    const targetElement = element instanceof ElementRef ? element.nativeElement : element;
    
    if (!targetElement || typeof targetElement.focus !== 'function') {
      console.warn('AccessibilityService: Invalid element for focus');
      return;
    }

    // Store current focus for restoration
    const currentFocus = this.document.activeElement as HTMLElement;
    if (currentFocus && options.restoreFocus) {
      this.focusHistory.push(currentFocus);
    }

    // Apply focus
    try {
      targetElement.focus({
        preventScroll: options.preventScroll || false
      });

      // Add focus-visible class if needed
      if (options.focusVisible) {
        this.renderer.addClass(targetElement, 'focus-visible');
      }

      // Announce focus change
      const label = this.getElementLabel(targetElement);
      if (label) {
        this.announce(`Focused on ${label}`, 'polite', 'low', 'focus');
      }
    } catch (error) {
      console.warn('AccessibilityService: Failed to set focus', error);
    }
  }

  /**
   * Restore previous focus
   */
  restoreFocus(): void {
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop();
      if (previousElement && this.document.contains(previousElement)) {
        this.setFocus(previousElement);
      }
    }
  }

  /**
   * Get next focusable element
   */
  getNextFocusableElement(currentElement: HTMLElement, direction: 'forward' | 'backward' = 'forward'): HTMLElement | null {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) {
      return focusableElements[0] || null;
    }

    const nextIndex = direction === 'forward' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    return focusableElements[nextIndex] || null;
  }

  /**
   * Get all focusable elements in document
   */
  getFocusableElements(container: HTMLElement = this.document.body): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements.filter(element => {
      return this.isElementVisible(element) && !this.isElementDisabled(element);
    });
  }

  // Keyboard Navigation

  /**
   * Setup keyboard navigation for container
   */
  setupKeyboardNavigation(container: HTMLElement, config: Partial<KeyboardNavConfig> = {}): () => void {
    if (!this.config.enableKeyboardNavigation) {
      return () => {};
    }

    const navConfig: KeyboardNavConfig = {
      enableArrowKeys: true,
      enableTabNavigation: true,
      enableActivationKeys: true,
      enableEscapeKey: true,
      customKeyBindings: new Map(),
      ...config
    };

    const keydownHandler = (event: KeyboardEvent) => {
      this.handleKeyboardNavigation(event, container, navConfig);
    };

    this.renderer.listen(container, 'keydown', keydownHandler);

    // Return cleanup function
    return () => {
      // Cleanup is handled by Angular's renderer
    };
  }

  /**
   * Handle keyboard navigation events
   */
  private handleKeyboardNavigation(event: KeyboardEvent, container: HTMLElement, config: KeyboardNavConfig): void {
    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    const target = event.target as HTMLElement;

    // Mark keyboard navigation as active
    this.keyboardNavigation$.next(true);

    // Handle custom key bindings first
    const keyCombo = this.getKeyCombo(event);
    if (config.customKeyBindings.has(keyCombo)) {
      event.preventDefault();
      config.customKeyBindings.get(keyCombo)!();
      return;
    }

    // Handle standard navigation keys
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (config.enableArrowKeys) {
          this.handleArrowKeyNavigation(event, container);
        }
        break;

      case 'Tab':
        if (config.enableTabNavigation) {
          this.handleTabNavigation(event, container);
        }
        break;

      case 'Enter':
      case ' ':
        if (config.enableActivationKeys) {
          this.handleActivationKeys(event, target);
        }
        break;

      case 'Escape':
        if (config.enableEscapeKey) {
          this.handleEscapeKey(event, container);
        }
        break;

      case 'Home':
        if (ctrlKey || metaKey) {
          this.focusFirstElement(container);
          event.preventDefault();
        }
        break;

      case 'End':
        if (ctrlKey || metaKey) {
          this.focusLastElement(container);
          event.preventDefault();
        }
        break;
    }
  }

  // ARIA Support

  /**
   * Set ARIA attributes on element
   */
  setAriaAttributes(element: HTMLElement | ElementRef, attributes: Record<string, string | boolean | number>): void {
    const targetElement = element instanceof ElementRef ? element.nativeElement : element;
    
    Object.entries(attributes).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      this.renderer.setAttribute(targetElement, ariaKey, String(value));
    });
  }

  /**
   * Update ARIA live region
   */
  updateAriaLiveRegion(message: string, type: AnnouncementType = 'polite'): void {
    if (!this.liveRegion) {
      this.createLiveRegion();
    }

    if (this.liveRegion) {
      this.renderer.setAttribute(this.liveRegion, 'aria-live', type);
      this.renderer.setProperty(this.liveRegion, 'textContent', message);
    }
  }

  /**
   * Create describedby relationship
   */
  createDescribedByRelationship(element: HTMLElement, descriptionElement: HTMLElement): void {
    const descriptionId = descriptionElement.id || this.generateUniqueId('description');
    
    if (!descriptionElement.id) {
      this.renderer.setAttribute(descriptionElement, 'id', descriptionId);
    }
    
    const existingDescribedBy = element.getAttribute('aria-describedby');
    const newDescribedBy = existingDescribedBy 
      ? `${existingDescribedBy} ${descriptionId}`
      : descriptionId;
    
    this.renderer.setAttribute(element, 'aria-describedby', newDescribedBy);
  }

  /**
   * Create labelledby relationship
   */
  createLabelledByRelationship(element: HTMLElement, labelElement: HTMLElement): void {
    const labelId = labelElement.id || this.generateUniqueId('label');
    
    if (!labelElement.id) {
      this.renderer.setAttribute(labelElement, 'id', labelId);
    }
    
    this.renderer.setAttribute(element, 'aria-labelledby', labelId);
  }

  // Utility Methods

  /**
   * Generate unique ID
   */
  generateUniqueId(prefix: string = 'a11y'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if element is visible
   */
  private isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  /**
   * Check if element is disabled
   */
  private isElementDisabled(element: HTMLElement): boolean {
    return element.hasAttribute('disabled') || 
           element.getAttribute('aria-disabled') === 'true' ||
           element.closest('[aria-disabled="true"]') !== null;
  }

  /**
   * Get element label for announcements
   */
  private getElementLabel(element: HTMLElement): string {
    // Try aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Try aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = this.document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent?.trim() || '';
    }

    // Try associated label
    if (element.id) {
      const label = this.document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent?.trim() || '';
    }

    // Try text content
    const textContent = element.textContent?.trim();
    if (textContent) return textContent;

    // Try placeholder
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return placeholder;

    // Try title
    const title = element.getAttribute('title');
    if (title) return title;

    // Fallback to tag name
    return element.tagName.toLowerCase();
  }

  /**
   * Initialize accessibility features
   */
  private initializeAccessibilityFeatures(): void {
    this.createLiveRegion();
    this.detectUserPreferences();
    this.setupGlobalKeyboardListeners();
  }

  /**
   * Update accessibility features based on configuration
   */
  private updateAccessibilityFeatures(): void {
    if (this.config.enableScreenReaderAnnouncements && !this.liveRegion) {
      this.createLiveRegion();
    }
  }

  /**
   * Create ARIA live region for announcements
   */
  private createLiveRegion(): void {
    if (this.liveRegion) {
      return;
    }

    this.liveRegion = this.renderer.createElement('div');
    this.renderer.setAttribute(this.liveRegion, 'aria-live', 'polite');
    this.renderer.setAttribute(this.liveRegion, 'aria-atomic', 'true');
    this.renderer.setAttribute(this.liveRegion, 'class', 'sr-only');
    this.renderer.setStyle(this.liveRegion, 'position', 'absolute');
    this.renderer.setStyle(this.liveRegion, 'left', '-10000px');
    this.renderer.setStyle(this.liveRegion, 'width', '1px');
    this.renderer.setStyle(this.liveRegion, 'height', '1px');
    this.renderer.setStyle(this.liveRegion, 'overflow', 'hidden');
    
    this.renderer.appendChild(this.document.body, this.liveRegion);
  }

  /**
   * Detect user accessibility preferences
   */
  private detectUserPreferences(): void {
    // Detect high contrast mode
    if (this.config.enableHighContrastMode) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      this.highContrastMode$.next(highContrastQuery.matches);
      
      highContrastQuery.addEventListener('change', (e) => {
        this.highContrastMode$.next(e.matches);
      });
    }

    // Detect reduced motion preference
    if (this.config.enableReducedMotion) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion$.next(reducedMotionQuery.matches);
      
      reducedMotionQuery.addEventListener('change', (e) => {
        this.reducedMotion$.next(e.matches);
      });
    }

    // Detect screen reader (heuristic)
    this.detectScreenReader();
  }

  /**
   * Detect screen reader usage (heuristic approach)
   */
  private detectScreenReader(): void {
    // Check for common screen reader indicators
    const indicators = [
      () => navigator.userAgent.includes('NVDA'),
      () => navigator.userAgent.includes('JAWS'),
      () => window.speechSynthesis && window.speechSynthesis.getVoices().length > 0,
      () => 'speechSynthesis' in window,
      () => document.querySelector('[aria-live]') !== null
    ];

    const hasScreenReader = indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });

    this.screenReaderActive$.next(hasScreenReader);
  }

  /**
   * Setup global keyboard listeners
   */
  private setupGlobalKeyboardListeners(): void {
    // Detect keyboard usage
    fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(
        debounceTime(100),
        distinctUntilChanged((prev, curr) => prev.key === curr.key)
      )
      .subscribe(() => {
        this.keyboardNavigation$.next(true);
      });

    // Reset keyboard navigation flag on mouse use
    fromEvent<MouseEvent>(this.document, 'mousedown')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.keyboardNavigation$.next(false);
      });
  }

  /**
   * Process announcement queue
   */
  private async processAnnouncementQueue(): Promise<void> {
    if (this.isProcessingAnnouncements || this.announcementQueue.length === 0) {
      return;
    }

    this.isProcessingAnnouncements = true;

    while (this.announcementQueue.length > 0) {
      const announcement = this.announcementQueue.shift()!;
      
      // Update live region
      this.updateAriaLiveRegion(announcement.message, announcement.type);
      
      // Wait for announcement delay
      await new Promise(resolve => setTimeout(resolve, this.config.announcementDelay));
    }

    this.isProcessingAnnouncements = false;
  }

  /**
   * Get key combination string
   */
  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.metaKey) parts.push('Meta');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    
    parts.push(event.key);
    
    return parts.join('+');
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowKeyNavigation(event: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    const currentElement = event.target as HTMLElement;
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) return;

    let nextIndex: number;
    
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.setFocus(focusableElements[nextIndex]);
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const currentElement = event.target as HTMLElement;
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (event.shiftKey) {
      // Shift+Tab - go backward
      if (currentIndex <= 0) {
        event.preventDefault();
        this.setFocus(focusableElements[focusableElements.length - 1]);
      }
    } else {
      // Tab - go forward
      if (currentIndex >= focusableElements.length - 1) {
        event.preventDefault();
        this.setFocus(focusableElements[0]);
      }
    }
  }

  /**
   * Handle activation keys (Enter/Space)
   */
  private handleActivationKeys(event: KeyboardEvent, target: HTMLElement): void {
    const tagName = target.tagName.toLowerCase();
    const role = target.getAttribute('role');
    
    // Only handle activation for button-like elements
    if (tagName === 'button' || role === 'button' || role === 'menuitem') {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        target.click();
      }
    }
  }

  /**
   * Handle escape key
   */
  private handleEscapeKey(event: KeyboardEvent, container: HTMLElement): void {
    // Close any open popovers or dialogs
    const openPopovers = container.querySelectorAll('[aria-expanded="true"]');
    openPopovers.forEach(popover => {
      if (popover instanceof HTMLElement) {
        popover.setAttribute('aria-expanded', 'false');
        this.announce('Popover closed', 'polite', 'low');
      }
    });

    // Restore focus if needed
    this.restoreFocus();
  }

  /**
   * Focus first element in container
   */
  private focusFirstElement(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      this.setFocus(focusableElements[0]);
    }
  }

  /**
   * Focus last element in container
   */
  private focusLastElement(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      this.setFocus(focusableElements[focusableElements.length - 1]);
    }
  }
}