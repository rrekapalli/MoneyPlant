import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  Renderer2,
  Output,
  EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResponsiveDesignService, ContainerInfo, DisplayMode } from '../services/responsive-design.service';

/**
 * Configuration for responsive layout behavior
 */
export interface ResponsiveLayoutConfig {
  /** Enable container queries */
  enableContainerQueries: boolean;
  
  /** Enable breakpoint classes */
  enableBreakpointClasses: boolean;
  
  /** Enable display mode classes */
  enableDisplayModeClasses: boolean;
  
  /** Custom container ID for container queries */
  containerId?: string;
  
  /** Minimum width for compact mode */
  compactModeThreshold: number;
  
  /** Minimum width for expanded mode */
  expandedModeThreshold: number;
  
  /** Enable automatic display mode switching */
  autoDisplayMode: boolean;
}

/**
 * Responsive layout directive that applies responsive classes and behavior
 * to elements based on screen size and container dimensions
 */
@Directive({
  selector: '[mpResponsiveLayout]',
  standalone: true
})
export class ResponsiveLayoutDirective implements OnInit, OnDestroy {
  @Input() mpResponsiveLayout: Partial<ResponsiveLayoutConfig> = {};
  
  @Output() containerSizeChange = new EventEmitter<ContainerInfo>();
  @Output() displayModeChange = new EventEmitter<DisplayMode>();
  @Output() breakpointChange = new EventEmitter<string>();

  private destroy$ = new Subject<void>();
  private containerId: string;
  
  private readonly defaultConfig: ResponsiveLayoutConfig = {
    enableContainerQueries: true,
    enableBreakpointClasses: true,
    enableDisplayModeClasses: true,
    compactModeThreshold: 400,
    expandedModeThreshold: 800,
    autoDisplayMode: true
  };

  private config!: ResponsiveLayoutConfig;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private responsiveService: ResponsiveDesignService
  ) {
    this.containerId = `responsive-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit(): void {
    this.config = { ...this.defaultConfig, ...this.mpResponsiveLayout };
    
    if (this.config.containerId) {
      this.containerId = this.config.containerId;
    }

    this.setupResponsiveFeatures();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Stop observing container
    this.responsiveService.unobserveContainer(this.elementRef.nativeElement);
  }

  /**
   * Setup responsive features
   */
  private setupResponsiveFeatures(): void {
    // Setup container queries
    if (this.config.enableContainerQueries) {
      this.setupContainerQueries();
    }

    // Setup breakpoint classes
    if (this.config.enableBreakpointClasses) {
      this.setupBreakpointClasses();
    }

    // Setup display mode classes
    if (this.config.enableDisplayModeClasses) {
      this.setupDisplayModeClasses();
    }

    // Add initial responsive classes
    this.addInitialClasses();
  }

  /**
   * Setup container queries
   */
  private setupContainerQueries(): void {
    this.responsiveService.observeContainer(
      this.elementRef.nativeElement,
      this.containerId
    ).pipe(takeUntil(this.destroy$))
    .subscribe(containerInfo => {
      this.handleContainerSizeChange(containerInfo);
      this.containerSizeChange.emit(containerInfo);
    });
  }

  /**
   * Setup breakpoint classes
   */
  private setupBreakpointClasses(): void {
    this.responsiveService.getScreenSize()
      .pipe(takeUntil(this.destroy$))
      .subscribe(screenSize => {
        this.updateBreakpointClasses(screenSize.breakpoint);
        this.breakpointChange.emit(screenSize.breakpoint);
      });
  }

  /**
   * Setup display mode classes
   */
  private setupDisplayModeClasses(): void {
    this.responsiveService.getDisplayMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(displayMode => {
        this.updateDisplayModeClasses(displayMode);
        this.displayModeChange.emit(displayMode);
      });
  }

  /**
   * Add initial responsive classes
   */
  private addInitialClasses(): void {
    const element = this.elementRef.nativeElement;
    
    // Add base responsive class
    this.renderer.addClass(element, 'responsive-layout');
    
    // Add container ID as data attribute
    this.renderer.setAttribute(element, 'data-container-id', this.containerId);
  }

  /**
   * Handle container size changes
   */
  private handleContainerSizeChange(containerInfo: ContainerInfo): void {
    const element = this.elementRef.nativeElement;
    
    // Remove existing container classes
    this.removeClassesWithPrefix('container-');
    
    // Add new container classes
    const containerClasses = this.responsiveService.getContainerClasses(containerInfo);
    containerClasses.forEach(className => {
      this.renderer.addClass(element, className);
    });

    // Handle automatic display mode switching
    if (this.config.autoDisplayMode) {
      this.handleAutoDisplayMode(containerInfo);
    }

    // Add size-specific classes
    this.addSizeSpecificClasses(containerInfo);
  }

  /**
   * Update breakpoint classes
   */
  private updateBreakpointClasses(breakpoint: string): void {
    // Remove existing breakpoint classes
    this.removeClassesWithPrefix('breakpoint-');
    
    // Add current breakpoint class
    this.renderer.addClass(this.elementRef.nativeElement, `breakpoint-${breakpoint}`);
  }

  /**
   * Update display mode classes
   */
  private updateDisplayModeClasses(displayMode: DisplayMode): void {
    const element = this.elementRef.nativeElement;
    
    // Remove existing display mode classes
    this.removeClassesWithPrefix('display-');
    element.classList.remove('no-labels', 'no-icons', 'condensed', 'single-column', 'collapsible');
    
    // Add current display mode classes
    this.renderer.addClass(element, `display-${displayMode.mode}`);
    
    if (!displayMode.showLabels) {
      this.renderer.addClass(element, 'no-labels');
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
   * Handle automatic display mode switching based on container size
   */
  private handleAutoDisplayMode(containerInfo: ContainerInfo): void {
    let newMode: 'compact' | 'expanded' | 'auto' = 'auto';
    
    if (containerInfo.availableWidth < this.config.compactModeThreshold) {
      newMode = 'compact';
    } else if (containerInfo.availableWidth > this.config.expandedModeThreshold) {
      newMode = 'expanded';
    }

    // Only update if mode should change
    const currentMode = this.responsiveService.getDisplayMode();
    currentMode.subscribe(mode => {
      if (mode.mode !== newMode) {
        this.responsiveService.setDisplayMode({ mode: newMode });
      }
    }).unsubscribe();
  }

  /**
   * Add size-specific classes based on container dimensions
   */
  private addSizeSpecificClasses(containerInfo: ContainerInfo): void {
    const element = this.elementRef.nativeElement;
    
    // Width-based classes
    if (containerInfo.availableWidth < 300) {
      this.renderer.addClass(element, 'extra-narrow');
    } else if (containerInfo.availableWidth < 500) {
      this.renderer.addClass(element, 'narrow');
    } else if (containerInfo.availableWidth > 1000) {
      this.renderer.addClass(element, 'extra-wide');
    } else if (containerInfo.availableWidth > 800) {
      this.renderer.addClass(element, 'wide');
    }
    
    // Height-based classes
    if (containerInfo.availableHeight < 200) {
      this.renderer.addClass(element, 'extra-short');
    } else if (containerInfo.availableHeight < 400) {
      this.renderer.addClass(element, 'short');
    } else if (containerInfo.availableHeight > 800) {
      this.renderer.addClass(element, 'extra-tall');
    } else if (containerInfo.availableHeight > 600) {
      this.renderer.addClass(element, 'tall');
    }
    
    // Aspect ratio classes
    const aspectRatio = containerInfo.width / containerInfo.height;
    if (aspectRatio > 2) {
      this.renderer.addClass(element, 'ultra-wide');
    } else if (aspectRatio > 1.5) {
      this.renderer.addClass(element, 'wide-aspect');
    } else if (aspectRatio < 0.5) {
      this.renderer.addClass(element, 'ultra-tall');
    } else if (aspectRatio < 0.75) {
      this.renderer.addClass(element, 'tall-aspect');
    }
  }

  /**
   * Remove classes with a specific prefix
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
   * Get current container information
   */
  getContainerInfo(): ContainerInfo {
    return this.responsiveService.getContainerInfo(this.elementRef.nativeElement);
  }

  /**
   * Force update of responsive classes
   */
  updateResponsiveClasses(): void {
    const containerInfo = this.getContainerInfo();
    this.handleContainerSizeChange(containerInfo);
  }

  /**
   * Set display mode manually
   */
  setDisplayMode(mode: Partial<DisplayMode>): void {
    this.responsiveService.setDisplayMode(mode);
  }

  /**
   * Reset to automatic display mode
   */
  resetDisplayMode(): void {
    this.responsiveService.resetDisplayMode();
  }
}