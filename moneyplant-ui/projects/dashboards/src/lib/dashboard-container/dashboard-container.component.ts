import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  inject,
  output,
} from '@angular/core';
import {
  GridType,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridsterItemComponentInterface,
  DisplayGrid,
} from 'angular-gridster2';
import {EChartsOption} from 'echarts';
import buildQuery from 'odata-query';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule} from '@angular/forms';
import {IWidget} from '../entities/IWidget';
import {WidgetComponent} from '../widgets/widget/widget.component';
import {WidgetHeaderComponent} from '../widget-header/widget-header.component';
import {IFilterOptions} from '../entities/IFilterOptions';
import {IFilterValues} from '../entities/IFilterValues';
import {v4 as uuid} from 'uuid';
import {NgxPrintModule} from 'ngx-print';
import {BrowserModule} from '@angular/platform-browser';
import {NgxPrintService, PrintOptions} from 'ngx-print';
import { ToastModule } from 'primeng/toast';
import { StandardDashboardBuilder } from './standard-dashboard-builder';
import { DashboardConfig } from './dashboard-container-builder';
import { PdfExportService, PdfExportOptions } from '../services/pdf-export.service';

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
    ToastModule,
  ],
})
export class DashboardContainerComponent {
  
  @Input() widgets!: IWidget[];
  @Input() filterValues: IFilterValues[] = [];
  public container = DashboardContainerComponent;
  chartHeight: number = 300;
  readonly defaultChartHeight: number = 400;

  @Output() containerTouchChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() editModeStringChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() changesMade: EventEmitter<string> = new EventEmitter<string>();

  availableDashboards: any[] = [];
  //selectedDashboardId: string = '';

  @Input() dashboardId:any;

  initialWidgetData: any;
  @Input() isEditMode: boolean = false;

  onShowConfirmation: any = false;
  onShowNewDashboardDialog = false;

  static containerTouched: any;
  static editModeString = '';

  newDashboardForm!: FormGroup;

  @ViewChild(GridsterComponent) gridster!: GridsterComponent;
  @ViewChild('dashboardContainer', { static: true }) dashboardContainer!: ElementRef<HTMLElement>;

  @Input() options: GridsterConfig = {};
  public mergedOptions: GridsterConfig = {};

  // Track view modes for each widget
  private widgetViewModes: Map<string, 'chart' | 'table'> = new Map();

  // Dashboard builder instance
  private dashboardBuilder: StandardDashboardBuilder = StandardDashboardBuilder.createStandard();
  
  // PDF export service
  private pdfExportService = inject(PdfExportService);

  ngOnInit() {
    this.initializeDashboard();
  }

  /**
   * Initialize dashboard using the builder pattern
   */
  private initializeDashboard(): void {
    // Build the dashboard configuration
    const dashboardConfig = this.dashboardBuilder
      .setWidgets(this.widgets || [])
      .setFilterValues(this.filterValues || [])
      .setDashboardId(this.dashboardId || '')
      .setEditMode(this.isEditMode)
      .setChartHeight(this.chartHeight)
      .setDefaultChartHeight(this.defaultChartHeight)
      .setCustomConfig(this.options)
      .setItemResizeCallback(this.onWidgetResize.bind(this))
      .setItemChangeCallback(this.onWidgetChange.bind(this))
      .build();

    // Apply the configuration
    this.applyDashboardConfig(dashboardConfig);
  }

  /**
   * Apply dashboard configuration to component properties
   */
  private applyDashboardConfig(config: DashboardConfig): void {
    this.mergedOptions = config.config;
    this.widgets = config.widgets;
    this.filterValues = config.filterValues;
    this.dashboardId = config.dashboardId;
    this.isEditMode = config.isEditMode;
    this.chartHeight = config.chartHeight;
    
    // Override the exportToPdf method with the component's implementation
    if (config.exportToPdf) {
      config.exportToPdf = this.exportToPdf.bind(this);
    }
  }

  /**
   * Update dashboard configuration dynamically
   */
  public updateDashboardConfig(updates: Partial<DashboardConfig>): void {
    if (updates.config) {
      this.dashboardBuilder.setCustomConfig(updates.config);
    }
    if (updates.widgets) {
      this.dashboardBuilder.setWidgets(updates.widgets);
    }
    if (updates.filterValues) {
      this.dashboardBuilder.setFilterValues(updates.filterValues);
    }
    if (updates.dashboardId) {
      this.dashboardBuilder.setDashboardId(updates.dashboardId);
    }
    if (updates.isEditMode !== undefined) {
      this.dashboardBuilder.setEditMode(updates.isEditMode);
    }
    if (updates.chartHeight) {
      this.dashboardBuilder.setChartHeight(updates.chartHeight);
    }

    // Rebuild and apply
    const newConfig = this.dashboardBuilder.build();
    this.applyDashboardConfig(newConfig);
  }

  /**
   * Enable edit mode using builder
   */
  public enableEditMode(): void {
    this.dashboardBuilder.enableEditMode();
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Disable edit mode using builder
   */
  public disableEditMode(): void {
    this.dashboardBuilder.disableEditMode();
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Set responsive configuration
   */
  public setResponsive(breakpoint: number = 640): void {
    this.dashboardBuilder.setResponsive(breakpoint);
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Set compact layout
   */
  public setCompactLayout(): void {
    this.dashboardBuilder.setCompactLayout();
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Set spacious layout
   */
  public setSpaciousLayout(): void {
    this.dashboardBuilder.setSpaciousLayout();
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Set mobile optimized layout
   */
  public setMobileOptimized(): void {
    this.dashboardBuilder.setMobileOptimized();
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Set desktop optimized layout
   */
  public setDesktopOptimized(): void {
    this.dashboardBuilder.setDesktopOptimized();
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Get current dashboard configuration
   */
  public getCurrentConfig(): DashboardConfig {
    return this.dashboardBuilder.build();
  }

  /**
   * Get the dashboard builder instance for advanced configuration
   */
  public getBuilder(): StandardDashboardBuilder {
    return this.dashboardBuilder;
  }

  async onDataLoad(widget: IWidget) {
    const filterWidget = this.widgets.find(
      (item: IWidget) => item.config.component === 'filter'
    );
    let widgetData: any = (widget.config.options as EChartsOption).series;
    let seriesData: any;
    this.filterValues = (filterWidget?.config?.options as IFilterOptions)?.values;

    // Danger Zone: Do NOT Touch the if conditions below
    if (widgetData) {
      if(Array.isArray(widgetData) && widgetData.length > 0) {
        seriesData = widgetData.map((item: any) => {
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
        seriesData = {};
      }
    }
    
    try {
      widget.chartInstance?.showLoading();

      if(widget.config.events?.onChartOptions) {
        const filter = widget.config.state?.isOdataQuery === true ? this.getFilterParams() : this.filterValues 
        widget?.config?.events?.onChartOptions(widget,widget.chartInstance ?? undefined , filter  )
      }
    } catch (error) {
      console.error('Error in onDataLoad for widget:', widget.id, error);
    } finally {
      // Always hide loading regardless of success or error
      widget.chartInstance?.hideLoading();
    }
  }

  getFilterParams() {
    let params = '';
    if (this.filterValues.length !== 0) {
      const filtersParams: any = [];
      this.filterValues.map((item: any) => {
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

  onUpdateWidget(widget: IWidget) {
    this.widgets = this.widgets.map((w: IWidget) => {
      if (w.id === widget.id) {
        return { ...w, ...widget };
      }
      return w;
    });
  }

  onWidgetResize(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface
  ) {
    DashboardContainerComponent.containerTouched = true;
    DashboardContainerComponent.editModeString =
      '[Edit Mode - Pending Changes]';

    const widget = this.widgets.find(w => 
      w.position.x == item.x && w.position.y == item.y 
      && ((w.position.cols == item.cols && w.position.rows == item.rows) 
      || (w['size']?.cols == item.cols && w['size']?.rows == item.rows)));

    if(widget) {
      widget.height = this.calculateChartHeight(item.cols, item.rows);
      if(widget.chartInstance) {
        widget.chartInstance.resize();
      }
      this.widgets = [...this.widgets];
    }
  }

  onWidgetChange(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface
  ) {
    DashboardContainerComponent.containerTouched = true;
    DashboardContainerComponent.editModeString =
      '[Edit Mode - Pending Changes]';
  }

  updateString(editModeString: any) {
    this.editModeStringChange.emit(editModeString)
  }

  getEditModeString(editModeString: any) {
    // this.editModeStringChange.emit(editModeString)
    return DashboardContainerComponent.editModeString;
  }

  onUpdateFilter($event: any) {
    console.log('onUpdateFilter called with event:', $event);
    
    const filterWidget = this.widgets.find((item: IWidget) => item.config.component === 'filter');
    if (!filterWidget) {
      console.warn('Filter widget not found');
      return;
    }
    
    const newFilterWidget = {...filterWidget};
    
    // Ensure the config and options structure exists with proper typing
    if (!newFilterWidget.config) {
      newFilterWidget.config = {
        options: { values: [] } as IFilterOptions
      };
    } else if (!newFilterWidget.config.options) {
      newFilterWidget.config.options = { values: [] } as IFilterOptions;
    }
    
    // Ensure the values array exists
    const filterOptions = newFilterWidget.config.options as IFilterOptions;
    if (!filterOptions.values) {
      filterOptions.values = [];
    }

    if(Array.isArray($event)) {
      filterOptions.values = $event;
    }
    else if ($event && $event.value && $event.widget) {
      // Handle chart click events
      const clickedData = $event.value;
      const sourceWidget = $event.widget;
      
      console.log('Clicked data:', clickedData);
      console.log('Source widget:', sourceWidget);
      
      // Extract filter information from the clicked data
      let filterValue: any = {};
      
      if (clickedData && typeof clickedData === 'object') {
        // For pie charts, use the name as the filter key
        if (clickedData.name) {
          filterValue = {
            accessor: 'category',
            category: clickedData.name,
            value: clickedData.value || clickedData.name
          };
        }
        // For other chart types, try to extract meaningful data
        else if (clickedData.seriesName) {
          filterValue = {
            accessor: 'series',
            series: clickedData.seriesName,
            value: clickedData.value || clickedData.seriesName
          };
        }
        // For scatter plots or other data types
        else {
          // Try to find any meaningful property
          const keys = Object.keys(clickedData);
          if (keys.length > 0) {
            const key = keys[0];
            filterValue = {
              accessor: key,
              [key]: clickedData[key],
              value: clickedData[key]
            };
          }
        }
        
        // Add widget information
        if (sourceWidget.config?.header?.title) {
          filterValue.widgetTitle = sourceWidget.config.header.title;
        }
        
        // Only add the filter if we have valid data
        if (filterValue.accessor && filterValue.value) {
          console.log('Adding filter:', filterValue);
          filterOptions.values.push(filterValue);
        }
      }
    }

    console.log('Updated filter widget:', newFilterWidget);
    this.onUpdateWidget(newFilterWidget as IWidget);
  }

  onDashboardSelectionChanged($event: any) {
    return;
  }

  // Delete an existing widget, only when in Edit Model
  onDeleteWidget(widget: IWidget) {
    this.widgets.splice(this.widgets.indexOf(widget), 1);
  }

  public calculateChartHeight(cols: number, rows: number, flag: boolean = false, baseHeight: number = this.defaultChartHeight): number {
    return StandardDashboardBuilder.calculateChartHeight(cols, rows, flag, baseHeight);
  }

  // Add these helper methods to your class
  public calculateMapCenter(cols: number, rows: number): number[] {
    return StandardDashboardBuilder.calculateMapCenter(cols, rows);
  }

  public calculateMapZoom(cols: number, rows: number): number {
    return StandardDashboardBuilder.calculateMapZoom(cols, rows);
  }

  /**
   * Export dashboard to PDF
   * @param options - PDF export options
   */
  async exportToPdf(options: PdfExportOptions = {}): Promise<void> {
    try {
      await this.pdfExportService.exportDashboardToPdf(
        this.dashboardContainer,
        this.widgets,
        options
      );
    } catch (error) {
      console.error('Error exporting dashboard to PDF:', error);
      throw error;
    }
  }

  /**
   * Export specific widget to PDF
   * @param widgetId - ID of the widget to export
   * @param options - PDF export options
   */
  async exportWidgetToPdf(widgetId: string, options: PdfExportOptions = {}): Promise<void> {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (!widget) {
      throw new Error(`Widget with ID ${widgetId} not found`);
    }

    const widgetElement = this.dashboardContainer.nativeElement.querySelector(
      `[data-widget-id="${widgetId}"]`
    ) as HTMLElement;

    if (!widgetElement) {
      throw new Error(`Widget element with ID ${widgetId} not found`);
    }

    try {
      await this.pdfExportService.exportWidgetToPdf(
        { nativeElement: widgetElement },
        widget,
        options
      );
    } catch (error) {
      console.error(`Error exporting widget ${widgetId} to PDF:`, error);
      throw error;
    }
  }

  /**
   * Get current view mode for a widget
   * @param widgetId - ID of the widget
   * @returns Current view mode (default: 'chart')
   */
  getWidgetViewMode(widgetId: string): 'chart' | 'table' {
    return this.widgetViewModes.get(widgetId) || 'chart';
  }

  /**
   * Handle view mode toggle for a widget
   * @param event - View mode toggle event
   */
  onToggleViewMode(event: {widgetId: string, viewMode: 'chart' | 'table'}) {
    this.widgetViewModes.set(event.widgetId, event.viewMode);
    // Trigger change detection
    this.widgets = [...this.widgets];
  }
}
