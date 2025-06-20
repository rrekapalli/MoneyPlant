import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  GridType,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridsterItemComponentInterface,
} from 'angular-gridster2';
import * as echarts from 'echarts';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule} from '@angular/forms';
import {IWidget} from '../entities/IWidget';
import {WidgetComponent} from '../widgets/widget/widget.component';
import {WidgetHeaderComponent} from '../widget-header/widget-header.component';
import {IFilterOptions} from '../entities/IFilterOptions';
import {IFilterValues} from '../entities/IFilterValues';
import {NgxPrintModule} from 'ngx-print';
import {Toast} from 'primeng/toast';
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from 'primeng/tooltip';
import {CalculationService} from '../services/calculation.service';
import {FilterService} from '../services/filter.service';
import {EventBusService, EventType} from '../services/event-bus.service';
import {WidgetDataCacheService} from '../services/widget-data-cache.service';
import {VirtualScrollService} from '../services/virtual-scroll.service';
import {UndoRedoService, DashboardState} from '../services/undo-redo.service';
import {Subject, takeUntil, fromEvent} from 'rxjs';
import {TemplateManagerComponent} from '../dashboard-templates/template-manager/template-manager.component';
import {DashboardTemplateService} from '../services/dashboard-template.service';
import {IDashboardTemplate} from '../entities/IDashboardTemplate';

/**
 * A container component for dashboard widgets.
 * 
 * This component provides a grid-based layout for dashboard widgets using angular-gridster2.
 * It handles widget positioning, resizing, data loading, and filtering.
 */
@Component({
  selector: 'vis-dashboard-container',
  standalone: true,
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    GridsterComponent,
    GridsterItemComponent,
    WidgetComponent,
    WidgetHeaderComponent,
    NgxPrintModule,
    Toast,
    ButtonModule,
    TooltipModule,
    TemplateManagerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardContainerComponent implements OnInit, OnDestroy {

  /** Array of widgets to display in the dashboard */
  @Input() widgets!: IWidget[];

  /** Current filter values applied to the dashboard */
  @Input() filterValues: IFilterValues[] = [];

  /** Current chart height in pixels */
  chartHeight: number = 300;

  // Virtual scrolling properties
  private currentScrollPosition = 0;
  visibleWidgets: IWidget[] = [];
  totalDashboardHeight = 0;

  // Undo/Redo properties
  canUndo: boolean = false;
  canRedo: boolean = false;
  private destroy$ = new Subject<void>();
  private resizeTimeout: any;
  private currentBreakpoint: string = 'lg';
  private stateChangeDebounceTimer: any;

  constructor(
    private calculationService: CalculationService,
    private filterService: FilterService,
    private eventBus: EventBusService,
    private widgetDataCache: WidgetDataCacheService,
    private virtualScrollService: VirtualScrollService,
    private undoRedoService: UndoRedoService,
    private templateService: DashboardTemplateService
  ) {
    // Subscribe to events from the event bus
    this.subscribeToEvents();
  }

  /**
   * Lifecycle hook that is called after the component is initialized
   */
  ngOnInit(): void {
    // Initialize virtual scrolling
    this.initVirtualScrolling();

    // Initialize undo/redo service
    this.initUndoRedo();
  }

  /**
   * Lifecycle hook that is called when the component is destroyed
   */
  ngOnDestroy(): void {
    // Complete the destroy subject to unsubscribe from all observables
    this.destroy$.next();
    this.destroy$.complete();

    // Clear any pending timers
    if (this.stateChangeDebounceTimer) {
      clearTimeout(this.stateChangeDebounceTimer);
    }
  }

  /**
   * Initializes the undo/redo functionality
   */
  private initUndoRedo(): void {
    // Subscribe to undo/redo state changes
    this.undoRedoService.canUndo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(canUndo => {
        this.canUndo = canUndo;
      });

    this.undoRedoService.canRedo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(canRedo => {
        this.canRedo = canRedo;
      });

    // Add initial state to history
    if (this.widgets && this.widgets.length > 0) {
      this.undoRedoService.addState(this.widgets);
    }

    // Add keyboard shortcuts for undo/redo
    this.setupKeyboardShortcuts();
  }

  /**
   * Sets up keyboard shortcuts for accessibility
   */
  private setupKeyboardShortcuts(): void {
    // Use fromEvent to listen for keydown events
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        // Only handle keyboard shortcuts in edit mode
        if (!this.isEditMode) return;

        // Check for Ctrl+Z (Undo)
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          if (this.canUndo) {
            this.undo();
          }
        }

        // Check for Ctrl+Y or Ctrl+Shift+Z (Redo)
        if ((event.ctrlKey && event.key === 'y') || 
            (event.ctrlKey && event.shiftKey && event.key === 'z')) {
          event.preventDefault();
          if (this.canRedo) {
            this.redo();
          }
        }
      });
  }

  /**
   * Tracks state changes in the dashboard
   * Debounces the state tracking to avoid too many history entries
   */
  private trackStateChange(): void {
    // Clear any existing timer
    if (this.stateChangeDebounceTimer) {
      clearTimeout(this.stateChangeDebounceTimer);
    }

    // Set a new timer to add the state after a delay
    this.stateChangeDebounceTimer = setTimeout(() => {
      if (this.widgets && this.widgets.length > 0) {
        this.undoRedoService.addState(this.widgets);
      }
    }, 500); // 500ms debounce time
  }

  /**
   * Undoes the last change
   */
  undo(): void {
    const previousState = this.undoRedoService.undo();
    if (previousState) {
      this.applyState(previousState);
    }
  }

  /**
   * Redoes the last undone change
   */
  redo(): void {
    const nextState = this.undoRedoService.redo();
    if (nextState) {
      this.applyState(nextState);
    }
  }

  /**
   * Applies a dashboard state
   * 
   * @param state - The state to apply
   */
  private applyState(state: DashboardState): void {
    // Update widgets
    this.widgets = state.widgets;

    // Update visible widgets for virtual scrolling
    this.updateVisibleWidgets();

    // Reload data for all widgets
    this.widgets.forEach(widget => {
      if (widget) {
        this.onDataLoad(widget);
      }
    });
  }

  /**
   * Initializes virtual scrolling for the dashboard
   */
  private initVirtualScrolling(): void {
    // Set initial viewport height based on screen size
    const viewportHeight = Math.floor(window.innerHeight / 50); // Approximate row height
    this.virtualScrollService.setViewportHeight(viewportHeight);

    // Update visible widgets whenever widgets array changes
    this.updateVisibleWidgets();
  }

  /**
   * Updates the list of visible widgets based on the current scroll position
   */
  private updateVisibleWidgets(): void {
    if (!this.widgets || this.widgets.length === 0) {
      this.visibleWidgets = [];
      this.totalDashboardHeight = 0;
      return;
    }

    // Calculate total dashboard height
    this.totalDashboardHeight = this.virtualScrollService.getTotalHeight(this.widgets);

    // Get visible widgets
    this.visibleWidgets = this.virtualScrollService.getVisibleWidgets(
      this.widgets,
      this.currentScrollPosition
    );

    console.log(`Rendering ${this.visibleWidgets.length} of ${this.widgets.length} widgets`);
  }

  /**
   * Handles scroll events in the dashboard
   * 
   * @param event - The scroll event
   */
  onDashboardScroll(event: any): void {
    // Calculate current scroll position in rows
    const scrollTop = event.target.scrollTop;
    const rowHeight = 50; // Approximate row height in pixels
    this.currentScrollPosition = Math.floor(scrollTop / rowHeight);

    // Use the VirtualScrollService to update scroll position and visible widgets
    this.virtualScrollService.updateScrollPosition(this.currentScrollPosition, this.widgets);

    // Get the updated visible widgets
    this.visibleWidgets = this.virtualScrollService.getVisibleWidgets(this.widgets, this.currentScrollPosition);
  }

  /**
   * Subscribes to events from the event bus
   */
  private subscribeToEvents(): void {
    // Subscribe to data load events
    this.eventBus.onDataLoad().subscribe(widget => {
      this.onDataLoad(widget);
    });

    // Subscribe to filter update events
    this.eventBus.onFilterUpdate().subscribe(filterData => {
      this.onUpdateFilter(filterData);
    });

    // Subscribe to widget update events
    this.eventBus.onWidgetUpdate().subscribe(widget => {
      this.onUpdateWidget(widget);
    });

    // Subscribe to error events
    this.eventBus.onError().subscribe(error => {
      console.error('Dashboard error:', error);
      // TODO: Add error handling UI
    });
  }

  /** Event emitted when the container is touched/modified */
  @Output() containerTouchChanged: EventEmitter<any> = new EventEmitter<any>();

  /** Event emitted when the edit mode string changes */
  @Output() editModeStringChange: EventEmitter<string> = new EventEmitter<string>();

  /** Event emitted when changes are made to the dashboard */
  @Output() changesMade: EventEmitter<string> = new EventEmitter<string>();

  /** Available dashboards for selection */
  availableDashboards: any[] = [];

  /** ID of the current dashboard */
  @Input() dashboardId: any;

  /** Initial widget data */
  initialWidgetData: any;

  /** Whether the dashboard is in edit mode */
  @Input() isEditMode: boolean = false;

  /** Whether to show confirmation dialog */
  onShowConfirmation: any = false;

  /** Whether to show new dashboard dialog */
  onShowNewDashboardDialog = false;

  /** Whether the container has been touched/modified */
  containerTouched: boolean = false;

  /** String representation of the current edit mode state */
  editModeString: string = '';

  /** Form for creating a new dashboard */
  newDashboardForm!: FormGroup;


  /** 
   * Gridster configuration options for the dashboard layout
   * @see https://github.com/tiberiuzuld/angular-gridster2
   */
  @Input() options: GridsterConfig = {
    gridType: GridType.ScrollVertical,
    draggable: {
      enabled: false,
    },
    pushItems: false,
    margin: 4,
    maxCols: 12,
    minCols: 12,
    rowHeightRatio: 0.15,
    swap: false,
    resizable: {
      enabled: false,
    },
    mobileBreakpoint: 768, // Width threshold for mobile view
    // Responsive configuration for different screen sizes
    responsiveOptions: [
      {
        breakpoint: 'xs', // Extra small devices (phones)
        minCols: 1,
        maxCols: 1,
        margin: 2,
        rowHeightRatio: 0.25,
        fixedRowHeight: 150,
        outerMargin: true,
        outerMarginTop: 10,
        outerMarginBottom: 10
      },
      {
        breakpoint: 'sm', // Small devices (tablets portrait)
        minCols: 2,
        maxCols: 2,
        margin: 2,
        rowHeightRatio: 0.2,
        fixedRowHeight: 120,
        outerMargin: true
      },
      {
        breakpoint: 'md', // Medium devices (tablets landscape)
        minCols: 6,
        maxCols: 6,
        margin: 3,
        rowHeightRatio: 0.15,
        fixedRowHeight: 100
      },
      {
        breakpoint: 'lg', // Large devices (desktops)
        minCols: 12,
        maxCols: 12,
        margin: 4,
        rowHeightRatio: 0.15
      }
    ],
    // Detect screen size changes and apply responsive layout
    initCallback: (gridsterInstance) => {
      // Initialize with the correct responsive layout
      this.applyResponsiveLayout();

      // Listen for orientation changes
      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.applyResponsiveLayout(), 100);
      });

      // Listen for resize events
      window.addEventListener('resize', () => {
        // Debounce resize events
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
          this.applyResponsiveLayout();
        }, 200);
      });
    },
    itemResizeCallback: (item, itemComponent) => this.onWidgetResize(item, itemComponent),
    itemChangeCallback: (item, itemComponent) => this.onWidgetChange(item, itemComponent)
  };


  /**
   * Loads data for a widget and applies any filters
   * 
   * @param widget - The widget to load data for
   */
  async onDataLoad(widget: IWidget) {
    if (!widget) {
      console.error('Cannot load data for undefined widget');
      this.eventBus.publishError(new Error('Cannot load data for undefined widget'), 'dashboard-container');
      return;
    }

    try {
      // Set widget to loading state if possible
      widget.loading = true;
      widget.error = null;

      // Get the filter widget and update filter values
      const filterWidget = this.filterService.findFilterWidget(this.widgets);
      this.filterValues = this.filterService.getFilterValues(this.widgets);

      // Determine which filter format to use
      const filter = widget.config?.state?.isOdataQuery === true 
        ? this.getFilterParams() 
        : this.filterValues;

      // Check if we have cached data for this widget and filter combination
      const cachedData = this.widgetDataCache.getData(widget, filter);
      if (cachedData) {
        console.log(`Using cached data for widget ${widget.id}`);

        // Apply cached data to the widget
        if (widget.chartInstance) {
          widget.chartInstance.setOption(cachedData);
        }

        // Set widget to not loading state
        widget.loading = false;
        return;
      }

      // Process widget data if available
      if (widget.config?.options) {
        let widgetData: any = (widget.config.options as echarts.EChartsOption).series;
        if (widgetData) {
          if (widgetData.series) {
            widgetData.map((item: any) => {
              if (!item || !item.encode) return {};

              return {
                x: {
                  table: {
                    id: item.encode?.x?.split('.')?.[0] ?? '',
                    name: item.encode?.x?.split('.')?.[1] ?? '',
                  },
                  column: {
                    id: item.encode?.x?.split('.')?.[2] ?? '',
                    name: item.encode?.x?.split('.')?.[3] ?? '',
                  },
                },
                y: {
                  table: {
                    id: item.encode?.y?.split('.')?.[0] ?? '',
                    name: item.encode?.y?.split('.')?.[1] ?? '',
                  },
                  column: {
                    id: item.encode?.y?.split('.')?.[2] ?? '',
                    name: item.encode?.y?.split('.')?.[3] ?? '',
                  },
                },
              };
            });
          } else {
            widgetData.seriesData = {};
          }
        }
      }

      // Show loading indicator
      if (widget.chartInstance) {
        widget.chartInstance.showLoading();
      }

      // Call onChartOptions event handler if available
      if (widget.config?.events?.onChartOptions) {
        widget.config.events.onChartOptions(widget, widget.chartInstance ?? undefined, filter);

        // Cache the widget data if available
        if (widget.chartInstance) {
          const chartOptions = widget.chartInstance.getOption();
          this.widgetDataCache.setData(widget, chartOptions, filter);
        }
      }

      // Publish widget update event
      this.eventBus.publishWidgetUpdate(widget, 'dashboard-container');

      // Set widget to not loading state
      widget.loading = false;
    } catch (error) {
      console.error(`Error loading data for widget ${widget.id}:`, error);

      // Set error state on widget
      widget.loading = false;
      widget.error = error;

      // Hide loading indicator if it was shown
      if (widget.chartInstance) {
        widget.chartInstance.hideLoading();
      }

      // Publish error event
      this.eventBus.publishError(error, 'dashboard-container');
    }
  }

  /**
   * Builds OData query parameters from the current filter values
   * 
   * @returns A string containing the OData query parameters
   */
  getFilterParams() {
    return this.filterService.getFilterParams(this.filterValues);
  }

  /**
   * Updates a widget in the dashboard and reloads data for all widgets
   * 
   * @param widget - The updated widget
   */
  onUpdateWidget(widget: IWidget) {
    if (!widget) {
      console.error('Cannot update undefined widget');
      this.eventBus.publishError(new Error('Cannot update undefined widget'), 'dashboard-container');
      return;
    }

    try {
      // Update the widget in the widgets array
      const widgetsWithNewOptions = this.widgets.map((item) =>
        item.id === widget.id ? {...widget} : item
      );
      this.widgets = widgetsWithNewOptions;

      // Update visible widgets for virtual scrolling
      this.updateVisibleWidgets();

      // Reload data for all widgets
      this.widgets.forEach(widget => {
        if (widget) {
          this.onDataLoad(widget);
        }
      });

      // Track state change for undo/redo
      this.trackStateChange();
    } catch (error) {
      console.error(`Error updating widget ${widget.id}:`, error);
      this.eventBus.publishError(error, 'dashboard-container');
    }
  }

  /**
   * Callback when a widget is resized
   * 
   * @param item - The gridster item being resized
   * @param itemComponent - The gridster item component
   */
  onWidgetResize(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface
  ) {
    this.containerTouched = true;
    this.editModeString = '[Edit Mode - Pending Changes]';
    this.editModeStringChange.emit(this.editModeString);
    this.containerTouchChanged.emit(this.containerTouched);

    // Track state change for undo/redo
    this.trackStateChange();
  }

  /**
   * Callback when a widget is moved or changed
   * 
   * @param item - The gridster item being changed
   * @param itemComponent - The gridster item component
   */
  onWidgetChange(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface
  ) {
    this.containerTouched = true;
    this.editModeString = '[Edit Mode - Pending Changes]';
    this.editModeStringChange.emit(this.editModeString);
    this.containerTouchChanged.emit(this.containerTouched);

    // Track state change for undo/redo
    this.trackStateChange();
  }

  /**
   * Updates the edit mode string and emits the change
   * 
   * @param editModeString - The new edit mode string
   */
  updateString(editModeString: string) {
    this.editModeString = editModeString;
    this.editModeStringChange.emit(this.editModeString);
  }

  /**
   * Gets the current edit mode string
   * 
   * @returns The current edit mode string
   */
  getEditModeString(): string {
    return this.editModeString;
  }

  /**
   * Updates the filter widget with new filter values
   * 
   * @param $event - The filter event containing the new filter values
   */
  onUpdateFilter($event: any) {
    try {
      // Find the filter widget
      const filterWidget = this.filterService.findFilterWidget(this.widgets);

      if (filterWidget) {
        // Store the old filter values for comparison
        const oldFilterValues = [...this.filterValues];

        // Update the filter widget with the new values
        const newFilterWidget = this.filterService.updateFilterWidget(filterWidget, $event);

        // Update the widget in the dashboard
        this.updateWidgetWithoutReload(newFilterWidget);

        // Get the new filter values
        this.filterValues = this.filterService.getFilterValues(this.widgets);

        // Only reload widgets that are affected by the filter change
        this.widgets.forEach(widget => {
          if (widget.id !== filterWidget.id && 
              this.widgetDataCache.shouldReloadWidget(widget, oldFilterValues, this.filterValues)) {
            console.log(`Reloading widget ${widget.id} due to filter change`);
            this.onDataLoad(widget);
          }
        });

        // Publish filter update event
        this.eventBus.publishFilterUpdate($event, 'dashboard-container');
      }
    } catch (error) {
      console.error('Error updating filter:', error);
      this.eventBus.publishError(error, 'dashboard-container');
    }
  }

  /**
   * Updates a widget in the dashboard without reloading data
   * 
   * @param widget - The updated widget
   */
  private updateWidgetWithoutReload(widget: IWidget) {
    if (!widget) {
      console.error('Cannot update undefined widget');
      this.eventBus.publishError(new Error('Cannot update undefined widget'), 'dashboard-container');
      return;
    }

    try {
      // Update the widget in the widgets array
      this.widgets = this.widgets.map((item) =>
        item.id === widget.id ? {...widget} : item
      );

      // Publish widget update event
      this.eventBus.publishWidgetUpdate(widget, 'dashboard-container');
    } catch (error) {
      console.error(`Error updating widget ${widget.id}:`, error);
      this.eventBus.publishError(error, 'dashboard-container');
    }
  }

  /**
   * Handles dashboard selection changes
   * 
   * @param $event - The selection change event
   */
  onDashboardSelectionChanged($event: any) {
    return;
  }

  /**
   * Deletes a widget from the dashboard
   * Only available in edit mode
   * 
   * @param widget - The widget to delete
   */
  onDeleteWidget(widget: IWidget) {
    if (!widget) {
      console.error('Cannot delete undefined widget');
      this.eventBus.publishError(new Error('Cannot delete undefined widget'), 'dashboard-container');
      return;
    }

    try {
      const index = this.widgets.indexOf(widget);
      if (index !== -1) {
        this.widgets.splice(index, 1);

        // Update visible widgets for virtual scrolling
        this.updateVisibleWidgets();

        // Clear the widget from cache
        this.widgetDataCache.clearWidgetCache(widget);

        // Track state change for undo/redo
        this.trackStateChange();
      } else {
        console.warn(`Widget with id ${widget.id} not found in dashboard`);
      }
    } catch (error) {
      console.error(`Error deleting widget ${widget.id}:`, error);
      this.eventBus.publishError(error, 'dashboard-container');
    }
  }

  /**
   * Calculates the appropriate chart height based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @param flag - Optional flag to adjust height calculation
   * @param baseHeight - Base height to use for calculation
   * @returns The calculated chart height in pixels
   */
  public calculateChartHeight(cols: number, rows: number, flag: boolean = false, baseHeight?: number): number {
    return this.calculationService.calculateChartHeight(cols, rows, flag, baseHeight);
  }

  /**
   * Calculates the appropriate map center coordinates based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @returns An array of [longitude, latitude] for the map center
   */
  public calculateMapCenter(cols: number, rows: number): number[] {
    return this.calculationService.calculateMapCenter(cols, rows);
  }

  /**
   * Calculates the appropriate map zoom level based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @returns The calculated zoom level for the map
   */
  public calculateMapZoom(cols: number, rows: number): number {
    return this.calculationService.calculateMapZoom(cols, rows);
  }

  /**
   * Applies responsive layout based on screen size
   * 
   * This method detects the current screen size and applies the appropriate
   * responsive layout configuration. It also updates widget positions and sizes
   * to ensure they fit properly on the current screen.
   */
  applyResponsiveLayout(): void {
    const width = window.innerWidth;
    let newBreakpoint = 'lg';

    // Determine the current breakpoint based on screen width
    if (width < 576) {
      newBreakpoint = 'xs';
    } else if (width < 768) {
      newBreakpoint = 'sm';
    } else if (width < 992) {
      newBreakpoint = 'md';
    }

    // Only update if the breakpoint has changed
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      console.log(`Applying responsive layout for breakpoint: ${newBreakpoint}`);

      // Adjust widget positions and sizes for the new breakpoint
      if (this.widgets && this.widgets.length > 0) {
        this.widgets.forEach(widget => {
          // Save original position if not already saved
          if (!widget.originalPosition) {
            widget.originalPosition = { ...widget.position };
          }

          // Apply breakpoint-specific adjustments
          switch (newBreakpoint) {
            case 'xs':
              // For extra small screens, stack widgets vertically
              widget.position.x = 0;
              widget.position.cols = 1;
              // Adjust height based on content type
              widget.position.rows = this.getResponsiveRowHeight(widget);
              break;

            case 'sm':
              // For small screens, use 2 columns layout
              widget.position.x = widget.position.x % 2;
              widget.position.cols = Math.min(2, widget.originalPosition?.cols || 2);
              widget.position.rows = this.getResponsiveRowHeight(widget);
              break;

            case 'md':
              // For medium screens, use 6 columns layout
              widget.position.x = widget.position.x % 6;
              widget.position.cols = Math.min(6, widget.originalPosition?.cols || 3);
              break;

            case 'lg':
              // For large screens, restore original position
              if (widget.originalPosition) {
                widget.position = { ...widget.originalPosition };
              }
              break;
          }
        });

        // Update visible widgets
        this.updateVisibleWidgets();
      }
    }
  }

  /**
   * Gets the responsive row height for a widget based on its type
   * 
   * @param widget - The widget to calculate height for
   * @returns The number of rows the widget should occupy
   */
  private getResponsiveRowHeight(widget: IWidget): number {
    // Default height
    let rows = widget.originalPosition?.rows || 4;

    // Adjust height based on widget type
    if (widget.config?.component === 'echart') {
      // Charts need more height on mobile
      rows = Math.max(rows, 6);
    } else if (widget.config?.component === 'table') {
      // Tables need more height on mobile
      rows = Math.max(rows, 8);
    } else if (widget.config?.component === 'filter') {
      // Filters need less height
      rows = 2;
    }

    return rows;
  }

  /**
   * Gets the current dashboard configuration for saving as a template
   * 
   * @returns The dashboard configuration
   */
  getDashboardConfig(): any {
    return {
      layout: this.options,
      widgets: this.widgets.map(widget => ({
        ...widget,
        chartInstance: null // Remove the chart instance to avoid circular references
      })),
      settings: {
        // Add any dashboard-level settings here
      }
    };
  }

  /**
   * Loads a dashboard template
   * 
   * @param template - The template to load
   */
  loadTemplate(template: IDashboardTemplate): void {
    if (!template || !template.dashboardConfig) {
      console.error('Invalid template or missing configuration');
      return;
    }

    try {
      // Apply the template configuration
      if (template.dashboardConfig.layout) {
        // Merge layout options
        this.options = {
          ...this.options,
          ...template.dashboardConfig.layout
        };
      }

      if (template.dashboardConfig.widgets && Array.isArray(template.dashboardConfig.widgets)) {
        // Replace the current widgets with the template widgets
        this.widgets = template.dashboardConfig.widgets.map(widget => ({
          ...widget,
          chartInstance: null, // Reset chart instance
          loading: false,
          error: null
        }));

        // Update visible widgets
        this.updateVisibleWidgets();

        // Add the new state to the undo/redo history
        this.undoRedoService.addState(this.widgets);
      }

      // Show success message
      this.showToast('success', 'Template Loaded', `Template "${template.name}" has been loaded successfully.`);
    } catch (error) {
      console.error('Error loading template:', error);
      this.showToast('error', 'Error', 'Failed to load the template. Please try again.');
    }
  }

  /**
   * Handles when a template is saved
   * 
   * @param template - The saved template
   */
  onTemplateSaved(template: IDashboardTemplate): void {
    this.showToast('success', 'Template Saved', `Template "${template.name}" has been saved successfully.`);
  }

  /**
   * Shows a toast message
   * 
   * @param severity - The severity of the message (success, info, warn, error)
   * @param summary - The summary of the message
   * @param detail - The detail of the message
   */
  private showToast(severity: string, summary: string, detail: string): void {
    // This assumes you have a toast service or component
    // If not, you'll need to implement this method
    // For PrimeNG Toast:
    // this.messageService.add({ severity, summary, detail });
  }
}
