import { Component, OnInit, OnDestroy, ElementRef, ChangeDetectionStrategy, AfterViewInit, Input, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ISupersetOptions } from '../../entities/ISupersetOptions';
import { embedDashboard } from '@superset-ui/embedded-sdk';

// Define the IWidget interface directly
export interface IWidget {
  id?: string;
  position: any;
  config: {
    component?: string;
    header?: {
      title: string;
      options?: string[];
    };
    options: any;
  };
  loading?: boolean;
  error?: any;
}

// Define a simplified EventBusService
export class EventBusService {
  onWidgetUpdate(): any {
    return new Subject<IWidget>().asObservable();
  }

  onFilterUpdate(): any {
    return new Subject<any>().asObservable();
  }

  publishError(error: any, source?: string): void {
    console.error(`Error in widget ${source}:`, error);
  }
}

/**
 * Component for displaying Superset dashboards
 */
@Component({
  selector: 'vis-superset',
  standalone: true,
  template: `<div class="superset-container" #supersetContainer></div>`,
  styles: [`
    .superset-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  `],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupersetComponent implements OnInit, OnDestroy, AfterViewInit {
  /** The widget configuration */
  @Input() widget!: IWidget;

  /** Event emitted when data needs to be loaded for the widget */
  @Input() onDataLoad!: EventEmitter<IWidget>;

  /** Event emitted when filter values are updated */
  @Input() onUpdateFilter!: EventEmitter<any>;

  /** Subject for handling component destruction */
  protected destroy$ = new Subject<void>();

  /** Loading state of the widget */
  protected loading = false;

  /** Error state of the widget */
  protected error: any = null;

  /** Event bus service */
  protected eventBus: EventBusService;

  /** Reference to the container element */
  private container: HTMLElement | null = null;

  /** The embedded dashboard instance */
  private embeddedDashboard: any = null;

  constructor(
    private elementRef: ElementRef
  ) {
    this.eventBus = new EventBusService();
  }

  /**
   * Initialize the component
   */
  ngOnInit(): void {
    // Subscribe to relevant events
    this.subscribeToEvents();
  }

  /**
   * After view initialization, get the container element and initialize the dashboard
   */
  ngAfterViewInit(): void {
    this.container = this.elementRef.nativeElement.querySelector('.superset-container');
    this.initializeDashboard();
  }

  /**
   * Clean up resources when the component is destroyed
   */
  ngOnDestroy(): void {
    // Clean up the embedded dashboard if it exists
    if (this.embeddedDashboard) {
      // The SDK might provide a destroy method in the future
      this.embeddedDashboard = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribes to relevant events from the event bus
   */
  protected subscribeToEvents(): void {
    // Subscribe to widget update events for this widget
    this.eventBus.onWidgetUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedWidget: IWidget) => {
        if (updatedWidget.id === this.widget.id) {
          this.widget = updatedWidget;
          this.onWidgetUpdated();
        }
      });

    // Subscribe to filter update events
    this.eventBus.onFilterUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((filterData: any) => {
        this.onFilterUpdated(filterData);
      });
  }

  /**
   * Handles errors that occur during data loading
   * 
   * @param error - The error that occurred
   */
  protected handleError(error: any): void {
    this.error = error;
    this.loading = false;
    this.eventBus.publishError(error, this.widget.id);
    console.error(`Error in widget ${this.widget.id}:`, error);
  }

  /**
   * Called when filters are updated
   * Override in derived classes to handle filter updates
   * 
   * @param filterData - The updated filter data
   */
  protected onFilterUpdated(filterData: any): void {
    // No-op by default
  }

  /**
   * Initialize the Superset dashboard
   */
  private initializeDashboard(): void {
    if (!this.container) {
      console.error('Superset container element not found');
      return;
    }

    const options = this.widget.config.options as ISupersetOptions;

    if (!options.dashboardUrl || !options.dashboardId) {
      console.error('Missing required Superset options: dashboardUrl or dashboardId');
      return;
    }

    this.loading = true;

    try {
      // Embed the dashboard using the Superset SDK
      embedDashboard({
        id: options.dashboardId,
        supersetDomain: options.dashboardUrl,
        mountPoint: this.container,
        fetchGuestToken: () => {
          // If a guest token is provided, use it
          if (options.guestToken) {
            return Promise.resolve(options.guestToken);
          }

          // Otherwise, you would typically fetch it from your backend
          // For now, we'll just return an error
          return Promise.reject('No guest token provided');
        },
        dashboardUiConfig: {
          hideTitle: options.config?.showHeader === false,
          hideChartControls: true,
          hideTab: false,
        }
      })
      .then(dashboard => {
        this.embeddedDashboard = dashboard;
        this.loading = false;
      })
      .catch(error => {
        this.handleError(error);
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Called when the widget is updated
   */
  protected onWidgetUpdated(): void {
    // Reinitialize the dashboard if the widget is updated
    this.initializeDashboard();
  }
}
