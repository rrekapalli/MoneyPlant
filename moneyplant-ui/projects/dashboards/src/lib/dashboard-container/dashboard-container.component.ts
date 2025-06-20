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
import {EChartsOption} from 'echarts';
import buildQuery from 'odata-query';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule} from '@angular/forms';
import {IWidget} from '../entities/IWidget';
import {WidgetComponent} from '../widgets/widget/widget.component';
import {WidgetHeaderComponent} from '../widget-header/widget-header.component';
import {IFilterOptions} from '../entities/IFilterOptions';
import {IFilterValues} from '../entities/IFilterValues';
import {NgxPrintModule} from 'ngx-print';
import {Toast} from 'primeng/toast';

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

  /** Default chart height in pixels */
  readonly defaultChartHeight: number = 300;

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
    const filterWidget = this.widgets.find(
      (item: IWidget) => item.config.component === 'filter'
    );
    let widgetData: any = (widget.config.options as EChartsOption).series;
    let seriesData: any;
    this.filterValues = (filterWidget?.config?.options as IFilterOptions)?.values;
    if (widgetData) {
      if(widgetData.series) {
        widgetData.map((item: any) => {
          return {
            x: {
              table: {
                id: item.encode?.x?.split('.')[0],
                name: item.encode?.x?.split('.')[1],
              },
              column: {
                id: item.encode?.x?.split('.')[2],
                name: item.encode?.x?.split('.')[3],
              },
            },
            y: {
              table: {
                id: item.encode?.y?.split('.')[0],
                name: item.encode?.y?.split('.')[1],
              },
              column: {
                id: item.encode?.y?.split('.')[2],
                name: item.encode?.y?.split('.')[3],
              },
            },
          };
        });
      } else {
        widgetData.seriesData = {};
      }
    }
    widget.chartInstance?.showLoading();

    if(widget.config.events?.onChartOptions) {
      const filter = widget.config.state?.isOdataQuery === true ? this.getFilterParams() : this.filterValues;
      widget?.config?.events?.onChartOptions(widget, widget.chartInstance ?? undefined, filter);
    }
  }

  /**
   * Builds OData query parameters from the current filter values
   * 
   * @returns A string containing the OData query parameters
   */
  getFilterParams() {
    let params = '';
    if (this.filterValues.length !== 0) {
      const filtersParams: any = [];
      this.filterValues.map((item) => {
        filtersParams.push({
          [item.accessor]: item[item.accessor]
        });
      });
      const filter = {and: filtersParams};
      params = buildQuery({filter});
      params = params.replace('?$', '').replace('=', '') + '/';
    }
    return params;
  }

  /**
   * Updates a widget in the dashboard and reloads data for all widgets
   * 
   * @param widget - The updated widget
   */
  onUpdateWidget(widget: IWidget) {
    const widgetsWithNewOptions = this.widgets.map((item) =>
      item.id === widget.id ? {...widget} : item
    );
    this.widgets = widgetsWithNewOptions;
    this.widgets.forEach(widget => this.onDataLoad(widget))
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
    const filterWidget = this.widgets.find(
      (item: IWidget) => item.config.component === 'filter'
    );
    const newFilterWidget = {...filterWidget};
    if (newFilterWidget) {

      if(Array.isArray( $event)) {
        (newFilterWidget?.config?.options as IFilterOptions).values = $event
      }
      else if ((newFilterWidget?.config?.options as IFilterOptions).values as any) {
        (newFilterWidget?.config?.options as IFilterOptions).values?.push({
          accessor: $event.widget.config.state.accessor,
          // [$event.widget.config.state.accessor]: $event.value,
          ...$event.value
        });
      }


      this.onUpdateWidget(newFilterWidget as IWidget);
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
    this.widgets.splice(this.widgets.indexOf(widget), 1);
  }

  /**
   * Calculates the appropriate chart height based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @param flag - Optional flag to adjust height calculation
   * @param baseHeight - Base height to use for calculation (defaults to defaultChartHeight)
   * @returns The calculated chart height in pixels
   */
  public calculateChartHeight(cols: number, rows: number, flag: boolean = false, baseHeight: number = this.defaultChartHeight): number {
    // Base height for a standard container
    const baseContainerHeight = baseHeight;

    // Calculate aspect ratio
    const aspectRatio = cols / rows;
    const area = cols * rows;

    // Adjust zoom based on area
    // Larger area = more zoom out (smaller zoom number)
    const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling

    // Apply margin reduction (2.5% top and bottom = 5% total)
    const marginReduction = 0.95; // 100% - 5%

    // Adjust height based on an aspect ratio:
    // - Taller containers (rows > cols) get proportionally more height
    // - Wider containers (cols > rows) maintain base height
    let heightAdjustment = aspectRatio < 1 
      ? 1 / aspectRatio
      : 1;

    if(flag) {
      heightAdjustment = heightAdjustment * aspectRatio;
    }

    return Math.round(baseContainerHeight * heightAdjustment * marginReduction);
  }

  /**
   * Calculates the appropriate map center coordinates based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @returns An array of [longitude, latitude] for the map center
   */
  public calculateMapCenter(cols: number, rows: number): number[] {
    // Base center for a USA map
    const baseLongitude = -95;
    const baseLatitude = 38;

    // Adjust center based on an aspect ratio
    const aspectRatio = cols / rows;

    // Adjust longitude more for wider containers
    const longitudeAdjustment = (aspectRatio > 1) ? (aspectRatio - 1) * 5 : 0;

    // Adjust latitude more for taller containers
    const latitudeAdjustment = (aspectRatio < 1) ? ((1 / aspectRatio) - 1) * 2 : 0;

    return [
      baseLongitude + longitudeAdjustment,
      baseLatitude + latitudeAdjustment
    ];
  }

  /**
   * Calculates the appropriate map zoom level based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @returns The calculated zoom level for the map
   */
  public calculateMapZoom(cols: number, rows: number): number {
    // Base zoom level
    const baseZoom = 4.0;

    // Calculate area of grid
    const area = cols * rows;

    // Adjust zoom based on area
    // Larger area = more zoom out (smaller zoom number)
    const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling

    // Calculate aspect ratio adjustment
    const aspectRatio = cols / rows;
    const aspectAdjustment = Math.abs(1 - aspectRatio) * 0.5;

    return baseZoom - (zoomAdjustment * 0.1) - aspectAdjustment;
  }
}
