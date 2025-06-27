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
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent implements OnInit, OnDestroy {
  
  // Signal-based properties
  private widgetsSignal = signal<IWidget[]>([]);
  private filterValuesSignal = signal<IFilterValues[]>([]);
  private dashboardIdSignal = signal<string>('');
  private isEditModeSignal = signal<boolean>(false);
  private chartHeightSignal = signal<number>(300);
  private optionsSignal = signal<GridsterConfig>({});

  // Computed values
  public readonly mergedOptions = computed(() => {
    const defaultConfig = this.getDefaultGridsterConfig();
    return { ...defaultConfig, ...this.optionsSignal() };
  });

  // Legacy Input/Output for backward compatibility
  @Input() set widgets(value: IWidget[]) {
    this.widgetsSignal.set(value || []);
  }
  get widgets(): IWidget[] {
    return this.widgetsSignal();
  }

  @Input() set filterValues(value: IFilterValues[]) {
    this.filterValuesSignal.set(value || []);
  }
  get filterValues(): IFilterValues[] {
    return this.filterValuesSignal();
  }

  @Input() set dashboardId(value: any) {
    this.dashboardIdSignal.set(value || '');
  }
  get dashboardId(): string {
    return this.dashboardIdSignal();
  }

  @Input() set isEditMode(value: boolean) {
    this.isEditModeSignal.set(value || false);
  }
  get isEditMode(): boolean {
    return this.isEditModeSignal();
  }

  @Input() set options(value: GridsterConfig) {
    this.optionsSignal.set(value || {});
  }
  get options(): GridsterConfig {
    return this.optionsSignal();
  }

  public container = DashboardContainerComponent;
  readonly defaultChartHeight: number = 400;

  @Output() containerTouchChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() editModeStringChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() changesMade: EventEmitter<string> = new EventEmitter<string>();
  @Output() filterValuesChanged: EventEmitter<IFilterValues[]> = new EventEmitter<IFilterValues[]>();

  availableDashboards: any[] = [];

  initialWidgetData: any;

  onShowConfirmation: any = false;
  onShowNewDashboardDialog = false;

  static containerTouched: any;
  static editModeString = '';

  newDashboardForm!: FormGroup;

  @ViewChild(GridsterComponent) gridster!: GridsterComponent;
  @ViewChild('dashboardContainer', { static: true }) dashboardContainer!: ElementRef<HTMLElement>;

  // Track view modes for each widget
  private widgetViewModes: Map<string, 'chart' | 'table'> = new Map();

  // Dashboard builder instance
  private dashboardBuilder: StandardDashboardBuilder = StandardDashboardBuilder.createStandard();
  
  // PDF export service
  // private pdfExportService = inject(PdfExportService);

  constructor() {
    // Effects for reactive updates
    effect(() => {
      // Emit legacy events when signals change
      this.filterValuesChanged.emit(this.filterValuesSignal());
    });

    effect(() => {
      // Update dashboard builder when signals change
      this.updateDashboardBuilder();
    });
  }

  ngOnInit() {
    this.initializeDashboard();
  }

  ngOnDestroy() {
    // Cleanup any resources if needed
  }

  /**
   * Get default gridster configuration
   */
  private getDefaultGridsterConfig(): GridsterConfig {
    return {
      gridType: GridType.VerticalFixed,
      displayGrid: DisplayGrid.None,
      outerMargin: true,
      draggable: {
        enabled: this.isEditModeSignal(),
      },
      resizable: {
        enabled: this.isEditModeSignal(),
      },
      maxCols: 12,
      minCols: 1,
      maxRows: 100,
      minRows: 1,
      fixedColWidth: 100,
      fixedRowHeight: 100,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      mobileBreakpoint: 640,
    };
  }

  /**
   * Update dashboard builder with current signal values
   */
  private updateDashboardBuilder(): void {
    this.dashboardBuilder = StandardDashboardBuilder.createStandard()
      .setWidgets(this.widgetsSignal())
      .setFilterValues(this.filterValuesSignal())
      .setDashboardId(this.dashboardIdSignal())
      .setEditMode(this.isEditModeSignal())
      .setChartHeight(this.chartHeightSignal())
      .setDefaultChartHeight(this.defaultChartHeight)
      .setCustomConfig(this.optionsSignal());
  }

  /**
   * Initialize dashboard using the builder pattern
   */
  private initializeDashboard(): void {
    // Build the dashboard configuration
    const dashboardConfig = this.dashboardBuilder
      .setWidgets(this.widgetsSignal() || [])
      .setFilterValues(this.filterValuesSignal() || [])
      .setDashboardId(this.dashboardIdSignal() || '')
      .setEditMode(this.isEditModeSignal())
      .setChartHeight(this.chartHeightSignal())
      .setDefaultChartHeight(this.defaultChartHeight)
      .setCustomConfig(this.optionsSignal())
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
    this.optionsSignal.set({ ...this.optionsSignal(), ...config.config });
    this.widgetsSignal.set(config.widgets);
    this.filterValuesSignal.set(config.filterValues);
    this.dashboardIdSignal.set(config.dashboardId);
    this.isEditModeSignal.set(config.isEditMode);
    this.chartHeightSignal.set(config.chartHeight);
  }

  /**
   * Update dashboard configuration dynamically
   */
  public updateDashboardConfig(updates: Partial<DashboardConfig>): void {
    if (updates.config) {
      this.optionsSignal.update(current => ({ ...current, ...updates.config }));
    }
    
    if (updates.widgets) {
      this.widgetsSignal.set(updates.widgets);
    }
    
    if (updates.filterValues) {
      this.filterValuesSignal.set(updates.filterValues);
    }
    
    if (updates.dashboardId) {
      this.dashboardIdSignal.set(updates.dashboardId);
    }
    
    if (updates.isEditMode !== undefined) {
      this.isEditModeSignal.set(updates.isEditMode);
    }
    
    if (updates.chartHeight) {
      this.chartHeightSignal.set(updates.chartHeight);
    }
    
    // The effect will automatically update the dashboard builder
  }

  /**
   * Enable edit mode using builder
   */
  public enableEditMode(): void {
    this.isEditModeSignal.set(true);
    this.dashboardBuilder.enableEditMode();
    const config = this.dashboardBuilder.build();
    this.applyDashboardConfig(config);
  }

  /**
   * Disable edit mode using builder
   */
  public disableEditMode(): void {
    this.isEditModeSignal.set(false);
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
   * Get the dashboard builder instance
   */
  public getBuilder(): StandardDashboardBuilder {
    return this.dashboardBuilder;
  }

  async onDataLoad(widget: IWidget) {
    // Apply filters to widget if any exist
    if (this.filterValues && this.filterValues.length > 0) {
      this.applyFiltersToWidget(widget);
    }
  }

  /**
   * Apply filters to a specific widget
   */
  private applyFiltersToWidget(widget: IWidget): void {
    // Apply filters to widget data
    // This is handled by the overall component's updateWidgetWithFilters method
  }

  getFilterParams() {
    return this.filterValues;
  }

  onUpdateWidget(widget: IWidget) {
    // Handle widget updates
    // This is handled by the overall component's updateWidgetWithFilters method
  }

  onWidgetResize(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface
  ) {
    // Handle widget resize
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
    const filterWidget = this.widgets.find(w => w.config?.component === 'filter');
    if (!filterWidget) {
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
      // Handle array events (Clear All or Set Filters)
      filterOptions.values = $event;
      this.filterValues = $event;
      
      // If it's an empty array, it means "Clear All" was clicked
      if ($event.length === 0) {
        // Clear the dashboard builder filter values
        this.dashboardBuilder.setFilterValues([]);
        // Clear local filter values array
        this.filterValues = [];
      }
    }
    else if ($event && $event.value && $event.widget) {
      // Handle chart click events
      const clickedData = $event.value;
      const sourceWidget = $event.widget;
      const filterValue = $event.filterValue; // New filter value from echart component
      
      // Use the filter value from echart component if available, otherwise create one
      let finalFilterValue: any = filterValue;
      
      if (!finalFilterValue && clickedData && typeof clickedData === 'object') {
        // Get the filter column from source widget config, fallback to accessor
        const filterColumn = sourceWidget.config?.filterColumn || sourceWidget.config?.accessor || 'unknown';
        
        // Fallback to creating filter value from clicked data
        if (clickedData.name) {
          finalFilterValue = {
            accessor: 'category',
            filterColumn: filterColumn,
            category: clickedData.name,
            value: clickedData.value || clickedData.name
          };
        }
        // For other chart types, try to extract meaningful data
        else if (clickedData.seriesName) {
          finalFilterValue = {
            accessor: 'series',
            filterColumn: filterColumn,
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
            finalFilterValue = {
              accessor: key,
              filterColumn: filterColumn,
              [key]: clickedData[key],
              value: clickedData[key]
            };
          }
        }
        
        // Add widget information
        if (sourceWidget.config?.header?.title) {
          finalFilterValue.widgetTitle = sourceWidget.config.header.title;
        }
        if (sourceWidget.id) {
          finalFilterValue.widgetId = sourceWidget.id;
        }
      }
      
      // Only add the filter if we have valid data
      if (finalFilterValue && finalFilterValue.accessor && finalFilterValue.value) {
        filterOptions.values.push(finalFilterValue);
        this.filterValues.push(finalFilterValue);
      }
    }
    
    // Update the dashboard configuration with new filter values
    this.dashboardBuilder.setFilterValues(this.filterValues);
    
    // Emit filter values change event to trigger widget updates
    this.filterValuesChanged.emit(this.filterValues);
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
  // async exportToPdf(options: PdfExportOptions = {}): Promise<void> {
  //   try {
  //     await this.pdfExportService.exportDashboardToPdf(
  //       this.dashboardContainer,
  //       this.widgets,
  //       options
  //     );
  //   } catch (error) {
  //     // Handle PDF export error silently
  //     throw error;
  //   }
  // }

  /**
   * Export specific widget to PDF
   * @param widgetId - ID of the widget to export
   * @param options - PDF export options
   */
  // async exportWidgetToPdf(widgetId: string, options: PdfExportOptions = {}): Promise<void> {
  //   const widget = this.widgets.find(w => w.id === widgetId);
  //   if (!widget) {
  //     throw new Error(`Widget with ID ${widgetId} not found`);
  //   }

  //   const widgetElement = this.dashboardContainer.nativeElement.querySelector(
  //     `[data-widget-id="${widgetId}"]`
  //   ) as HTMLElement;

  //   if (!widgetElement) {
  //     throw new Error(`Widget element with ID ${widgetId} not found`);
  //   }

  //   try {
  //     await this.pdfExportService.exportWidgetToPdf(
  //       { nativeElement: widgetElement },
  //       widget,
  //       options
  //     );
  //   } catch (error) {
  //     // Handle widget PDF export error silently
  //     throw error;
  //   }
  // }

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
    // Don't trigger change detection here as it might cause loops
    // this.widgets = [...this.widgets]; // Removed
  }
}
