import {
  Component,
  EventEmitter,
  Input,
  Output
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
import {CalculationService} from '../services/calculation.service';
import {FilterService} from '../services/filter.service';
import {EventBusService, EventType} from '../services/event-bus.service';

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
    Toast
  ],
})
export class DashboardContainerComponent {

  /** Array of widgets to display in the dashboard */
  @Input() widgets!: IWidget[];

  /** Current filter values applied to the dashboard */
  @Input() filterValues: IFilterValues[] = [];

  /** Current chart height in pixels */
  chartHeight: number = 300;

  constructor(
    private calculationService: CalculationService,
    private filterService: FilterService,
    private eventBus: EventBusService
  ) {
    // Subscribe to events from the event bus
    this.subscribeToEvents();
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
        const filter = widget.config.state?.isOdataQuery === true 
          ? this.getFilterParams() 
          : this.filterValues;
        widget.config.events.onChartOptions(widget, widget.chartInstance ?? undefined, filter);
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

      // Reload data for all widgets
      this.widgets.forEach(widget => {
        if (widget) {
          this.onDataLoad(widget);
        }
      });
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
        // Update the filter widget with the new values
        const newFilterWidget = this.filterService.updateFilterWidget(filterWidget, $event);

        // Update the widget in the dashboard
        this.onUpdateWidget(newFilterWidget);

        // Publish filter update event
        this.eventBus.publishFilterUpdate($event, 'dashboard-container');
      }
    } catch (error) {
      console.error('Error updating filter:', error);
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
}
