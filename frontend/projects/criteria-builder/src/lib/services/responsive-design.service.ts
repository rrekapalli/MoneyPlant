import { Injectable, Inject, DOCUMENT } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

/**
 * Breakpoint definitions for responsive design
 */
export interface Breakpoints {
  xs: number;    // Extra small devices (phones)
  sm: number;    // Small devices (tablets)
  md: number;    // Medium devices (small laptops)
  lg: number;    // Large devices (desktops)
  xl: number;    // Extra large devices (large desktops)
  xxl: number;   // Extra extra large devices
}

/**
 * Current screen size information
 */
export interface ScreenSize {
  width: number;
  height: number;
  breakpoint: keyof Breakpoints;
  orientation: 'portrait' | 'landscape';
  aspectRatio: number;
  devicePixelRatio: number;
}

/**
 * Display mode configuration
 */
export interface DisplayMode {
  mode: 'compact' | 'expanded' | 'auto';
  showLabels: boolean;
  showTooltips: boolean;
  showIcons: boolean;
  condensedSpacing: boolean;
  singleColumn: boolean;
  collapsibleSections: boolean;
}

/**
 * Layout configuration for different screen sizes
 */
export interface LayoutConfig {
  xs: Partial<DisplayMode>;
  sm: Partial<DisplayMode>;
  md: Partial<DisplayMode>;
  lg: Partial<DisplayMode>;
  xl: Partial<DisplayMode>;
  xxl: Partial<DisplayMode>;
}

/**
 * Container query support information
 */
export interface ContainerInfo {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  isNarrow: boolean;
  isWide: boolean;
  isTall: boolean;
  isShort: boolean;
}

/**
 * Responsive design service for handling different screen sizes and display modes
 * Provides breakpoint detection, container queries, and adaptive layout management
 */
@Injectable({
  providedIn: 'root'
})
export class ResponsiveDesignService {
  // Default breakpoints (in pixels)
  private readonly defaultBreakpoints: Breakpoints = {
    xs: 0,      // 0px and up
    sm: 576,    // 576px and up
    md: 768,    // 768px and up
    lg: 992,    // 992px and up
    xl: 1200,   // 1200px and up
    xxl: 1400   // 1400px and up
  };

  // Default layout configuration
  private readonly defaultLayoutConfig: LayoutConfig = {
    xs: {
      mode: 'compact',
      showLabels: false,
      showTooltips: true,
      showIcons: true,
      condensedSpacing: true,
      singleColumn: true,
      collapsibleSections: true
    },
    sm: {
      mode: 'compact',
      showLabels: true,
      showTooltips: true,
      showIcons: true,
      condensedSpacing: true,
      singleColumn: true,
      collapsibleSections: true
    },
    md: {
      mode: 'auto',
      showLabels: true,
      showTooltips: true,
      showIcons: true,
      condensedSpacing: false,
      singleColumn: false,
      collapsibleSections: false
    },
    lg: {
      mode: 'expanded',
      showLabels: true,
      showTooltips: false,
      showIcons: true,
      condensedSpacing: false,
      singleColumn: false,
      collapsibleSections: false
    },
    xl: {
      mode: 'expanded',
      showLabels: true,
      showTooltips: false,
      showIcons: true,
      condensedSpacing: false,
      singleColumn: false,
      collapsibleSections: false
    },
    xxl: {
      mode: 'expanded',
      showLabels: true,
      showTooltips: false,
      showIcons: true,
      condensedSpacing: false,
      singleColumn: false,
      collapsibleSections: false
    }
  };

  // Configuration
  private breakpoints: Breakpoints;
  private layoutConfig: LayoutConfig;
  private debounceTime = 150;

  // State subjects
  private screenSize$!: BehaviorSubject<ScreenSize>;
  private displayMode$!: BehaviorSubject<DisplayMode>;
  private containerQueries$ = new Map<string, BehaviorSubject<ContainerInfo>>();

  // Resize observer for container queries
  private resizeObserver?: ResizeObserver;
  private observedContainers = new Map<Element, string>();

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Initialize configuration first
    this.breakpoints = { ...this.defaultBreakpoints };
    this.layoutConfig = { ...this.defaultLayoutConfig };
    
    // Initialize state subjects with proper initial values
    const initialScreenSize = this.getCurrentScreenSize();
    const initialDisplayMode = this.getDisplayModeForBreakpoint(initialScreenSize.breakpoint);
    
    this.screenSize$ = new BehaviorSubject<ScreenSize>(initialScreenSize);
    this.displayMode$ = new BehaviorSubject<DisplayMode>(initialDisplayMode);
    
    this.initializeResponsiveFeatures();
  }

  /**
   * Configure responsive design service
   */
  configure(options: {
    breakpoints?: Partial<Breakpoints>;
    layoutConfig?: Partial<LayoutConfig>;
    debounceTime?: number;
  }): void {
    if (options.breakpoints) {
      this.breakpoints = { ...this.breakpoints, ...options.breakpoints };
    }
    
    if (options.layoutConfig) {
      this.layoutConfig = { ...this.layoutConfig, ...options.layoutConfig };
    }
    
    if (options.debounceTime !== undefined) {
      this.debounceTime = options.debounceTime;
    }

    // Update current state
    this.updateScreenSize();
    this.updateDisplayMode();
  }

  // Screen Size and Breakpoint Detection

  /**
   * Get current screen size information
   */
  getScreenSize(): Observable<ScreenSize> {
    return this.screenSize$.asObservable();
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint(): keyof Breakpoints {
    return this.screenSize$.value.breakpoint;
  }

  /**
   * Check if current screen matches breakpoint
   */
  isBreakpoint(breakpoint: keyof Breakpoints): Observable<boolean> {
    return this.screenSize$.pipe(
      map(size => size.breakpoint === breakpoint),
      distinctUntilChanged()
    );
  }

  /**
   * Check if current screen is at or above breakpoint
   */
  isBreakpointUp(breakpoint: keyof Breakpoints): Observable<boolean> {
    return this.screenSize$.pipe(
      map(size => size.width >= this.breakpoints[breakpoint]),
      distinctUntilChanged()
    );
  }

  /**
   * Check if current screen is below breakpoint
   */
  isBreakpointDown(breakpoint: keyof Breakpoints): Observable<boolean> {
    return this.screenSize$.pipe(
      map(size => size.width < this.breakpoints[breakpoint]),
      distinctUntilChanged()
    );
  }

  /**
   * Check if screen is mobile size (xs or sm)
   */
  isMobile(): Observable<boolean> {
    return this.screenSize$.pipe(
      map(size => size.width < this.breakpoints.md),
      distinctUntilChanged()
    );
  }

  /**
   * Check if screen is tablet size (md)
   */
  isTablet(): Observable<boolean> {
    return this.screenSize$.pipe(
      map(size => size.width >= this.breakpoints.md && size.width < this.breakpoints.lg),
      distinctUntilChanged()
    );
  }

  /**
   * Check if screen is desktop size (lg and up)
   */
  isDesktop(): Observable<boolean> {
    return this.screenSize$.pipe(
      map(size => size.width >= this.breakpoints.lg),
      distinctUntilChanged()
    );
  }

  // Display Mode Management

  /**
   * Get current display mode
   */
  getDisplayMode(): Observable<DisplayMode> {
    return this.displayMode$.asObservable();
  }

  /**
   * Set display mode manually
   */
  setDisplayMode(mode: Partial<DisplayMode>): void {
    const currentMode = this.displayMode$.value;
    const newMode = { ...currentMode, ...mode };
    this.displayMode$.next(newMode);
  }

  /**
   * Reset display mode to automatic (based on breakpoint)
   */
  resetDisplayMode(): void {
    const currentBreakpoint = this.getCurrentBreakpoint();
    const autoMode = this.getDisplayModeForBreakpoint(currentBreakpoint);
    this.displayMode$.next(autoMode);
  }

  /**
   * Check if current mode is compact
   */
  isCompactMode(): Observable<boolean> {
    return this.displayMode$.pipe(
      map(mode => mode.mode === 'compact'),
      distinctUntilChanged()
    );
  }

  /**
   * Check if current mode is expanded
   */
  isExpandedMode(): Observable<boolean> {
    return this.displayMode$.pipe(
      map(mode => mode.mode === 'expanded'),
      distinctUntilChanged()
    );
  }

  // Container Queries

  /**
   * Observe container for size changes
   */
  observeContainer(element: Element, containerId: string): Observable<ContainerInfo> {
    if (!this.resizeObserver) {
      this.initializeResizeObserver();
    }

    // Create or get existing subject for this container
    if (!this.containerQueries$.has(containerId)) {
      this.containerQueries$.set(containerId, new BehaviorSubject<ContainerInfo>(
        this.getContainerInfo(element)
      ));
    }

    // Start observing the element
    this.observedContainers.set(element, containerId);
    this.resizeObserver!.observe(element);

    return this.containerQueries$.get(containerId)!.asObservable();
  }

  /**
   * Stop observing container
   */
  unobserveContainer(element: Element): void {
    if (this.resizeObserver && this.observedContainers.has(element)) {
      this.resizeObserver.unobserve(element);
      this.observedContainers.delete(element);
    }
  }

  /**
   * Get container information
   */
  getContainerInfo(element: Element): ContainerInfo {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    
    const availableWidth = rect.width - paddingLeft - paddingRight;
    const availableHeight = rect.height - paddingTop - paddingBottom;

    return {
      width: rect.width,
      height: rect.height,
      availableWidth,
      availableHeight,
      isNarrow: availableWidth < 400,
      isWide: availableWidth > 800,
      isTall: availableHeight > 600,
      isShort: availableHeight < 300
    };
  }

  // Utility Methods

  /**
   * Get CSS classes for current responsive state
   */
  getResponsiveClasses(): Observable<string[]> {
    return this.screenSize$.pipe(
      map(size => {
        const classes = [
          `breakpoint-${size.breakpoint}`,
          `orientation-${size.orientation}`,
          size.width < this.breakpoints.md ? 'mobile' : 'desktop'
        ];

        // Add device pixel ratio class
        if (size.devicePixelRatio > 1) {
          classes.push('high-dpi');
        }

        return classes;
      })
    );
  }

  /**
   * Get CSS classes for current display mode
   */
  getDisplayModeClasses(): Observable<string[]> {
    return this.displayMode$.pipe(
      map(mode => {
        const classes = [`display-${mode.mode}`];
        
        if (!mode.showLabels) classes.push('no-labels');
        if (!mode.showIcons) classes.push('no-icons');
        if (mode.condensedSpacing) classes.push('condensed');
        if (mode.singleColumn) classes.push('single-column');
        if (mode.collapsibleSections) classes.push('collapsible');
        
        return classes;
      })
    );
  }

  /**
   * Get all responsive CSS classes
   */
  getAllResponsiveClasses(): Observable<string[]> {
    return this.getResponsiveClasses().pipe(
      map(responsiveClasses => {
        const displayClasses = this.displayMode$.value;
        const modeClasses = this.getDisplayModeClassesSync(displayClasses);
        return [...responsiveClasses, ...modeClasses];
      })
    );
  }

  /**
   * Check if touch device
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get optimal chip size for current screen
   */
  getOptimalChipSize(): Observable<'small' | 'medium' | 'large'> {
    return this.screenSize$.pipe(
      map(size => {
        if (size.width < this.breakpoints.sm) return 'small' as const;
        if (size.width < this.breakpoints.lg) return 'medium' as const;
        return 'large' as const;
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Get optimal number of columns for current screen
   */
  getOptimalColumns(): Observable<number> {
    return this.screenSize$.pipe(
      map(size => {
        if (size.width < this.breakpoints.sm) return 1;
        if (size.width < this.breakpoints.md) return 2;
        if (size.width < this.breakpoints.lg) return 3;
        if (size.width < this.breakpoints.xl) return 4;
        return 5;
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Get container-based responsive classes
   */
  getContainerClasses(containerInfo: ContainerInfo): string[] {
    const classes: string[] = [];
    
    if (containerInfo.isNarrow) classes.push('container-narrow');
    if (containerInfo.isWide) classes.push('container-wide');
    if (containerInfo.isTall) classes.push('container-tall');
    if (containerInfo.isShort) classes.push('container-short');
    
    // Add width-based classes
    if (containerInfo.availableWidth < 300) classes.push('container-xs');
    else if (containerInfo.availableWidth < 500) classes.push('container-sm');
    else if (containerInfo.availableWidth < 700) classes.push('container-md');
    else if (containerInfo.availableWidth < 900) classes.push('container-lg');
    else classes.push('container-xl');
    
    return classes;
  }

  // Private Methods

  /**
   * Initialize responsive features
   */
  private initializeResponsiveFeatures(): void {
    // Listen for window resize events
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(this.debounceTime),
        startWith(null)
      )
      .subscribe(() => {
        this.updateScreenSize();
        this.updateDisplayMode();
      });

    // Listen for orientation change events
    fromEvent(window, 'orientationchange')
      .pipe(debounceTime(this.debounceTime))
      .subscribe(() => {
        // Small delay to ensure orientation change is complete
        setTimeout(() => {
          this.updateScreenSize();
          this.updateDisplayMode();
        }, 100);
      });

    // Initialize resize observer for container queries
    this.initializeResizeObserver();
  }

  /**
   * Initialize resize observer for container queries
   */
  private initializeResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const containerId = this.observedContainers.get(entry.target);
          if (containerId && this.containerQueries$.has(containerId)) {
            const containerInfo = this.getContainerInfo(entry.target);
            this.containerQueries$.get(containerId)!.next(containerInfo);
          }
        });
      });
    }
  }

  /**
   * Update current screen size
   */
  private updateScreenSize(): void {
    const newScreenSize = this.getCurrentScreenSize();
    const currentScreenSize = this.screenSize$.value;
    
    // Only update if there's a meaningful change
    if (newScreenSize.breakpoint !== currentScreenSize.breakpoint ||
        Math.abs(newScreenSize.width - currentScreenSize.width) > 10 ||
        newScreenSize.orientation !== currentScreenSize.orientation) {
      this.screenSize$.next(newScreenSize);
    }
  }

  /**
   * Update current display mode
   */
  private updateDisplayMode(): void {
    const currentBreakpoint = this.getCurrentBreakpoint();
    const currentMode = this.displayMode$.value;
    
    // Only update if mode is set to 'auto'
    if (currentMode.mode === 'auto') {
      const newMode = this.getDisplayModeForBreakpoint(currentBreakpoint);
      this.displayMode$.next(newMode);
    }
  }

  /**
   * Get current screen size information
   */
  private getCurrentScreenSize(): ScreenSize {
    // Safely get window dimensions with fallbacks
    const width = (typeof window !== 'undefined' && window.innerWidth) || 1024;
    const height = (typeof window !== 'undefined' && window.innerHeight) || 768;
    const breakpoint = this.getBreakpointForWidth(width);
    const orientation = width > height ? 'landscape' : 'portrait';
    const aspectRatio = height > 0 ? width / height : 1;
    const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

    return {
      width,
      height,
      breakpoint,
      orientation,
      aspectRatio,
      devicePixelRatio
    };
  }

  /**
   * Get breakpoint for given width
   */
  private getBreakpointForWidth(width: number): keyof Breakpoints {
    // Ensure breakpoints are available, fallback to defaults if not
    const breakpoints = this.breakpoints || this.defaultBreakpoints;
    
    // Safely get entries and sort them
    const breakpointEntries = Object.entries(breakpoints)
      .sort(([, a], [, b]) => (b as number) - (a as number)); // Sort by value descending

    for (const [breakpoint, minWidth] of breakpointEntries) {
      if (width >= (minWidth as number)) {
        return breakpoint as keyof Breakpoints;
      }
    }

    return 'xs'; // Fallback
  }

  /**
   * Get display mode for breakpoint
   */
  private getDisplayModeForBreakpoint(breakpoint: keyof Breakpoints): DisplayMode {
    const config = this.layoutConfig[breakpoint];
    
    // Default display mode
    const defaultMode: DisplayMode = {
      mode: 'auto',
      showLabels: true,
      showTooltips: true,
      showIcons: true,
      condensedSpacing: false,
      singleColumn: false,
      collapsibleSections: false
    };

    return { ...defaultMode, ...config };
  }

  /**
   * Get display mode classes synchronously
   */
  private getDisplayModeClassesSync(mode: DisplayMode): string[] {
    const classes = [`display-${mode.mode}`];
    
    if (!mode.showLabels) classes.push('no-labels');
    if (!mode.showIcons) classes.push('no-icons');
    if (mode.condensedSpacing) classes.push('condensed');
    if (mode.singleColumn) classes.push('single-column');
    if (mode.collapsibleSections) classes.push('collapsible');
    
    return classes;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.containerQueries$.forEach(subject => subject.complete());
    this.containerQueries$.clear();
    this.observedContainers.clear();
    
    this.screenSize$.complete();
    this.displayMode$.complete();
  }
}