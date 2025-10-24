import { 
  Directive, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  Renderer2,
  HostBinding
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { ResponsiveDesignService, DisplayMode } from '../services/responsive-design.service';

/**
 * Display mode configuration
 */
export interface DisplayModeConfig {
  /** Force specific display mode */
  mode?: 'compact' | 'expanded' | 'auto';
  
  /** Override show labels setting */
  showLabels?: boolean;
  
  /** Override show tooltips setting */
  showTooltips?: boolean;
  
  /** Override show icons setting */
  showIcons?: boolean;
  
  /** Override condensed spacing setting */
  condensedSpacing?: boolean;
  
  /** Override single column setting */
  singleColumn?: boolean;
  
  /** Override collapsible sections setting */
  collapsibleSections?: boolean;
  
  /** Enable automatic mode switching based on container size */
  autoMode?: boolean;
  
  /** Threshold for switching to compact mode (in pixels) */
  compactThreshold?: number;
  
  /** Threshold for switching to expanded mode (in pixels) */
  expandedThreshold?: number;
}

/**
 * Display mode directive that manages compact/expanded display modes
 * and applies appropriate CSS classes and behavior
 * 
 * Usage:
 * [mpDisplayMode]="{ mode: 'compact' }"
 * [mpDisplayMode]="{ autoMode: true, compactThreshold: 400 }"
 */
@Directive({
  selector: '[mpDisplayMode]',
  standalone: true
})
export class DisplayModeDirective implements OnInit, OnDestroy {
  @Input() mpDisplayMode: DisplayModeConfig = {};
  
  @Output() displayModeChange = new EventEmitter<DisplayMode>();
  @Output() modeSwitch = new EventEmitter<{ from: string; to: string }>();

  private destroy$ = new Subject<void>();
  private currentMode: DisplayMode | null = null;
  private containerObserver?: ResizeObserver;

  private readonly defaultConfig: DisplayModeConfig = {
    autoMode: false,
    compactThreshold: 400,
    expandedThreshold: 800
  };

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private responsiveService: ResponsiveDesignService
  ) {}

  @HostBinding('class.display-mode-directive') readonly displayModeClass = true;

  ngOnInit(): void {
    this.setupDisplayModeObserver();
    this.setupContainerObserver();
    this.applyInitialConfiguration();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.containerObserver) {
      this.containerObserver.disconnect();
    }
  }

  /**
   * Setup display mode observer
   */
  private setupDisplayModeObserver(): void {
    this.responsiveService.getDisplayMode()
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => 
          prev.mode === curr.mode &&
          prev.showLabels === curr.showLabels &&
          prev.showIcons === curr.showIcons &&
          prev.condensedSpacing === curr.condensedSpacing &&
          prev.singleColumn === curr.singleColumn &&
          prev.collapsibleSections === curr.collapsibleSections
        )
      )
      .subscribe(displayMode => {
        const previousMode = this.currentMode?.mode;
        this.currentMode = displayMode;
        
        this.updateDisplayModeClasses(displayMode);
        this.applyDisplayModeStyles(displayMode);
        
        this.displayModeChange.emit(displayMode);
        
        if (previousMode && previousMode !== displayMode.mode) {
          this.modeSwitch.emit({
            from: previousMode,
            to: displayMode.mode
          });
        }
      });
  }

  /**
   * Setup container observer for auto mode
   */
  private setupContainerObserver(): void {
    const config = { ...this.defaultConfig, ...this.mpDisplayMode };
    
    if (!config.autoMode || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.containerObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        this.handleAutoModeSwitch(width, config);
      }
    });

    this.containerObserver.observe(this.elementRef.nativeElement);
  }

  /**
   * Apply initial configuration
   */
  private applyInitialConfiguration(): void {
    const config = { ...this.defaultConfig, ...this.mpDisplayMode };
    
    // Set forced mode if specified
    if (config.mode && config.mode !== 'auto') {
      this.setDisplayMode({
        mode: config.mode,
        showLabels: config.showLabels,
        showTooltips: config.showTooltips,
        showIcons: config.showIcons,
        condensedSpacing: config.condensedSpacing,
        singleColumn: config.singleColumn,
        collapsibleSections: config.collapsibleSections
      });
    }
  }

  /**
   * Handle automatic mode switching based on container width
   */
  private handleAutoModeSwitch(width: number, config: DisplayModeConfig): void {
    let targetMode: 'compact' | 'expanded' | 'auto' = 'auto';
    
    if (width < (config.compactThreshold || 400)) {
      targetMode = 'compact';
    } else if (width > (config.expandedThreshold || 800)) {
      targetMode = 'expanded';
    }

    // Only switch if mode should change
    if (this.currentMode && this.currentMode.mode !== targetMode) {
      this.setDisplayMode({ mode: targetMode });
    }
  }

  /**
   * Update display mode CSS classes
   */
  private updateDisplayModeClasses(displayMode: DisplayMode): void {
    const element = this.elementRef.nativeElement;
    
    // Remove existing display mode classes
    this.removeClassesWithPrefix('display-');
    element.classList.remove(
      'no-labels', 
      'no-tooltips', 
      'no-icons', 
      'condensed', 
      'single-column', 
      'collapsible'
    );
    
    // Add current display mode classes
    this.renderer.addClass(element, `display-${displayMode.mode}`);
    
    if (!displayMode.showLabels) {
      this.renderer.addClass(element, 'no-labels');
    }
    
    if (!displayMode.showTooltips) {
      this.renderer.addClass(element, 'no-tooltips');
    }
    
    if (!displayMode.showIcons) {
      this.renderer.addClass(element, 'no-icons');
    }
    
    if (displayMode.condensedSpacing) {
      this.renderer.addClass(element, 'condensed');
    }
    
    if (displayMode.singleColumn) {
      this.renderer.addClass(element, 'single-column');
    }
    
    if (displayMode.collapsibleSections) {
      this.renderer.addClass(element, 'collapsible');
    }
  }

  /**
   * Apply display mode specific styles and attributes
   */
  private applyDisplayModeStyles(displayMode: DisplayMode): void {
    const element = this.elementRef.nativeElement;
    
    // Set data attributes for CSS targeting
    this.renderer.setAttribute(element, 'data-display-mode', displayMode.mode);
    this.renderer.setAttribute(element, 'data-show-labels', String(displayMode.showLabels));
    this.renderer.setAttribute(element, 'data-show-icons', String(displayMode.showIcons));
    this.renderer.setAttribute(element, 'data-condensed', String(displayMode.condensedSpacing));
    
    // Apply mode-specific styles
    switch (displayMode.mode) {
      case 'compact':
        this.applyCompactModeStyles();
        break;
      case 'expanded':
        this.applyExpandedModeStyles();
        break;
      case 'auto':
        this.applyAutoModeStyles();
        break;
    }
  }

  /**
   * Apply compact mode specific styles
   */
  private applyCompactModeStyles(): void {
    const element = this.elementRef.nativeElement;
    
    // Reduce padding and margins
    this.renderer.setStyle(element, '--spacing-scale', '0.75');
    this.renderer.setStyle(element, '--font-size-scale', '0.875');
    this.renderer.setStyle(element, '--button-size-scale', '0.875');
    
    // Hide non-essential elements
    const nonEssentialElements = element.querySelectorAll('.non-essential, .optional');
    nonEssentialElements.forEach(el => {
      this.renderer.setStyle(el, 'display', 'none');
    });
  }

  /**
   * Apply expanded mode specific styles
   */
  private applyExpandedModeStyles(): void {
    const element = this.elementRef.nativeElement;
    
    // Increase spacing and sizing
    this.renderer.setStyle(element, '--spacing-scale', '1.25');
    this.renderer.setStyle(element, '--font-size-scale', '1');
    this.renderer.setStyle(element, '--button-size-scale', '1.125');
    
    // Show all elements
    const hiddenElements = element.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach(el => {
      this.renderer.removeStyle(el, 'display');
    });
  }

  /**
   * Apply auto mode specific styles
   */
  private applyAutoModeStyles(): void {
    const element = this.elementRef.nativeElement;
    
    // Reset to default scaling
    this.renderer.removeStyle(element, '--spacing-scale');
    this.renderer.removeStyle(element, '--font-size-scale');
    this.renderer.removeStyle(element, '--button-size-scale');
  }

  /**
   * Remove classes with specific prefix
   */
  private removeClassesWithPrefix(prefix: string): void {
    const element = this.elementRef.nativeElement;
    const classesToRemove: string[] = [];
    
    element.classList.forEach(className => {
      if (className.startsWith(prefix)) {
        classesToRemove.push(className);
      }
    });
    
    classesToRemove.forEach(className => {
      this.renderer.removeClass(element, className);
    });
  }

  /**
   * Set display mode programmatically
   */
  setDisplayMode(mode: Partial<DisplayMode>): void {
    this.responsiveService.setDisplayMode(mode);
  }

  /**
   * Get current display mode
   */
  getCurrentDisplayMode(): DisplayMode | null {
    return this.currentMode;
  }

  /**
   * Toggle between compact and expanded modes
   */
  toggleMode(): void {
    if (this.currentMode) {
      const newMode = this.currentMode.mode === 'compact' ? 'expanded' : 'compact';
      this.setDisplayMode({ mode: newMode });
    }
  }

  /**
   * Reset to automatic mode
   */
  resetToAutoMode(): void {
    this.responsiveService.resetDisplayMode();
  }

  /**
   * Update configuration
   */
  updateConfig(config: DisplayModeConfig): void {
    this.mpDisplayMode = { ...this.mpDisplayMode, ...config };
    this.applyInitialConfiguration();
  }

  /**
   * Check if current mode is compact
   */
  isCompactMode(): boolean {
    return this.currentMode?.mode === 'compact';
  }

  /**
   * Check if current mode is expanded
   */
  isExpandedMode(): boolean {
    return this.currentMode?.mode === 'expanded';
  }

  /**
   * Check if auto mode is enabled
   */
  isAutoMode(): boolean {
    return this.currentMode?.mode === 'auto';
  }
}

/**
 * Static helper methods for display mode configurations
 */
export class DisplayModeConfigs {
  /**
   * Compact mode configuration
   */
  static compact(): DisplayModeConfig {
    return {
      mode: 'compact',
      showLabels: false,
      showTooltips: true,
      showIcons: true,
      condensedSpacing: true,
      singleColumn: true,
      collapsibleSections: true
    };
  }

  /**
   * Expanded mode configuration
   */
  static expanded(): DisplayModeConfig {
    return {
      mode: 'expanded',
      showLabels: true,
      showTooltips: false,
      showIcons: true,
      condensedSpacing: false,
      singleColumn: false,
      collapsibleSections: false
    };
  }

  /**
   * Auto mode configuration with custom thresholds
   */
  static auto(compactThreshold = 400, expandedThreshold = 800): DisplayModeConfig {
    return {
      mode: 'auto',
      autoMode: true,
      compactThreshold,
      expandedThreshold
    };
  }

  /**
   * Mobile-optimized configuration
   */
  static mobile(): DisplayModeConfig {
    return {
      mode: 'compact',
      showLabels: false,
      showTooltips: true,
      showIcons: true,
      condensedSpacing: true,
      singleColumn: true,
      collapsibleSections: true
    };
  }

  /**
   * Desktop-optimized configuration
   */
  static desktop(): DisplayModeConfig {
    return {
      mode: 'expanded',
      showLabels: true,
      showTooltips: false,
      showIcons: true,
      condensedSpacing: false,
      singleColumn: false,
      collapsibleSections: false
    };
  }
}