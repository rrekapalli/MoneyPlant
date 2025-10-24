import { 
  Directive, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  TemplateRef, 
  ViewContainerRef,
  EmbeddedViewRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { ResponsiveDesignService } from '../services/responsive-design.service';

/**
 * Breakpoint condition for showing/hiding content
 */
export interface BreakpointCondition {
  /** Show content at this breakpoint and up */
  up?: string;
  
  /** Show content at this breakpoint and down */
  down?: string;
  
  /** Show content only at this specific breakpoint */
  only?: string;
  
  /** Show content between these breakpoints (inclusive) */
  between?: [string, string];
  
  /** Hide content at these breakpoints */
  except?: string | string[];
}

/**
 * Context provided to the template when using structural directive
 */
export interface BreakpointContext {
  /** Current breakpoint */
  $implicit: string;
  
  /** Current screen width */
  width: number;
  
  /** Current screen height */
  height: number;
  
  /** Whether the screen is mobile size */
  isMobile: boolean;
  
  /** Whether the screen is tablet size */
  isTablet: boolean;
  
  /** Whether the screen is desktop size */
  isDesktop: boolean;
  
  /** Current orientation */
  orientation: 'portrait' | 'landscape';
}

/**
 * Breakpoint observer directive that conditionally shows/hides content
 * based on screen size breakpoints
 * 
 * Usage:
 * - Structural: *mpBreakpointObserver="{ up: 'md' }"
 * - Attribute: [mpBreakpointObserver]="{ down: 'sm' }" (breakpointMatch)="onMatch($event)"
 */
@Directive({
  selector: '[mpBreakpointObserver]',
  standalone: true
})
export class BreakpointObserverDirective implements OnInit, OnDestroy {
  @Input() mpBreakpointObserver: BreakpointCondition = {};
  
  @Output() breakpointMatch = new EventEmitter<boolean>();
  @Output() breakpointChange = new EventEmitter<string>();
  @Output() contextChange = new EventEmitter<BreakpointContext>();

  private destroy$ = new Subject<void>();
  private embeddedViewRef: EmbeddedViewRef<BreakpointContext> | null = null;
  private currentBreakpoint = '';
  private isMatching = false;

  constructor(
    private templateRef: TemplateRef<BreakpointContext>,
    private viewContainer: ViewContainerRef,
    private responsiveService: ResponsiveDesignService
  ) {}

  ngOnInit(): void {
    this.setupBreakpointObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.embeddedViewRef) {
      this.embeddedViewRef.destroy();
    }
  }

  /**
   * Setup breakpoint observer
   */
  private setupBreakpointObserver(): void {
    this.responsiveService.getScreenSize()
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => 
          prev.breakpoint === curr.breakpoint && 
          prev.width === curr.width && 
          prev.height === curr.height
        )
      )
      .subscribe(screenSize => {
        const previousBreakpoint = this.currentBreakpoint;
        this.currentBreakpoint = screenSize.breakpoint;
        
        // Check if condition matches
        const matches = this.evaluateCondition(screenSize);
        const wasMatching = this.isMatching;
        this.isMatching = matches;
        
        // Create context
        const context = this.createContext(screenSize);
        
        // Update view based on match
        this.updateView(matches, context);
        
        // Emit events
        if (matches !== wasMatching) {
          this.breakpointMatch.emit(matches);
        }
        
        if (previousBreakpoint !== this.currentBreakpoint) {
          this.breakpointChange.emit(this.currentBreakpoint);
        }
        
        this.contextChange.emit(context);
      });
  }

  /**
   * Evaluate breakpoint condition
   */
  private evaluateCondition(screenSize: any): boolean {
    const condition = this.mpBreakpointObserver;
    
    if (!condition || Object.keys(condition).length === 0) {
      return true; // No condition means always show
    }

    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(screenSize.breakpoint);
    
    if (currentIndex === -1) {
      return false;
    }

    // Check 'up' condition
    if (condition.up) {
      const upIndex = breakpoints.indexOf(condition.up);
      if (upIndex !== -1 && currentIndex < upIndex) {
        return false;
      }
    }

    // Check 'down' condition
    if (condition.down) {
      const downIndex = breakpoints.indexOf(condition.down);
      if (downIndex !== -1 && currentIndex > downIndex) {
        return false;
      }
    }

    // Check 'only' condition
    if (condition.only) {
      if (screenSize.breakpoint !== condition.only) {
        return false;
      }
    }

    // Check 'between' condition
    if (condition.between && condition.between.length === 2) {
      const [start, end] = condition.between;
      const startIndex = breakpoints.indexOf(start);
      const endIndex = breakpoints.indexOf(end);
      
      if (startIndex !== -1 && endIndex !== -1) {
        if (currentIndex < startIndex || currentIndex > endIndex) {
          return false;
        }
      }
    }

    // Check 'except' condition
    if (condition.except) {
      const exceptBreakpoints = Array.isArray(condition.except) 
        ? condition.except 
        : [condition.except];
      
      if (exceptBreakpoints.includes(screenSize.breakpoint)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create template context
   */
  private createContext(screenSize: any): BreakpointContext {
    return {
      $implicit: screenSize.breakpoint,
      width: screenSize.width,
      height: screenSize.height,
      isMobile: screenSize.width < 768,
      isTablet: screenSize.width >= 768 && screenSize.width < 992,
      isDesktop: screenSize.width >= 992,
      orientation: screenSize.orientation
    };
  }

  /**
   * Update view based on condition match
   */
  private updateView(matches: boolean, context: BreakpointContext): void {
    if (matches && !this.embeddedViewRef) {
      // Create view
      this.embeddedViewRef = this.viewContainer.createEmbeddedView(
        this.templateRef,
        context
      );
    } else if (!matches && this.embeddedViewRef) {
      // Destroy view
      this.viewContainer.clear();
      this.embeddedViewRef = null;
    } else if (matches && this.embeddedViewRef) {
      // Update existing view context
      Object.assign(this.embeddedViewRef.context, context);
      this.embeddedViewRef.markForCheck();
    }
  }

  /**
   * Check if current breakpoint matches condition
   */
  isCurrentBreakpointMatching(): boolean {
    return this.isMatching;
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint(): string {
    return this.currentBreakpoint;
  }

  /**
   * Update condition and re-evaluate
   */
  updateCondition(condition: BreakpointCondition): void {
    this.mpBreakpointObserver = condition;
    
    // Re-evaluate with current screen size
    this.responsiveService.getScreenSize().pipe(
      takeUntil(this.destroy$)
    ).subscribe(screenSize => {
      const matches = this.evaluateCondition(screenSize);
      const context = this.createContext(screenSize);
      this.updateView(matches, context);
    }).unsubscribe();
  }
}

/**
 * Static helper methods for breakpoint conditions
 */
export class BreakpointConditions {
  /**
   * Show content on mobile devices only
   */
  static mobileOnly(): BreakpointCondition {
    return { down: 'sm' };
  }

  /**
   * Show content on tablet and up
   */
  static tabletUp(): BreakpointCondition {
    return { up: 'md' };
  }

  /**
   * Show content on desktop only
   */
  static desktopOnly(): BreakpointCondition {
    return { up: 'lg' };
  }

  /**
   * Show content on tablet only
   */
  static tabletOnly(): BreakpointCondition {
    return { between: ['md', 'lg'] };
  }

  /**
   * Hide content on mobile
   */
  static hideMobile(): BreakpointCondition {
    return { up: 'md' };
  }

  /**
   * Hide content on desktop
   */
  static hideDesktop(): BreakpointCondition {
    return { down: 'md' };
  }

  /**
   * Show content between specific breakpoints
   */
  static between(start: string, end: string): BreakpointCondition {
    return { between: [start, end] };
  }

  /**
   * Show content except at specific breakpoints
   */
  static except(breakpoints: string | string[]): BreakpointCondition {
    return { except: breakpoints };
  }
}