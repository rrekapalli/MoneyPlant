import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';

// Import echarts core module and components
import * as echarts from 'echarts/core';
// Import bar, line, pie, and other chart components
import {
  BarChart,
  PieChart,
  ScatterChart,
  MapChart
} from 'echarts/charts';
// Import tooltip, title, legend, and other components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent
} from 'echarts/components';
// Import renderer
import {
  CanvasRenderer
} from 'echarts/renderers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  BarChart,
  PieChart,
  ScatterChart,
  MapChart,
  CanvasRenderer
]);

// Register built-in maps and custom maps
import { DensityMapBuilder } from '@dashboards/public-api';

// Register the world map with ECharts
// We'll use a dynamic import to load the world map data
import('echarts-map-collection/custom/world.json').then((worldMapData) => {
  DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
}).catch((error) => {
  // Handle world map loading error silently
});

// Import dashboard modules and chart builders
import { 
  IWidget,
  IFilterValues,
  DashboardContainerComponent,
  DashboardHeaderComponent,
  // Fluent API
  StandardDashboardBuilder,
  ExcelExportService,
  FilterService,
  // Enhanced Chart Builders
  ApacheEchartBuilder,
  PieChartBuilder,
  BarChartBuilder,
  ScatterChartBuilder
} from '@dashboards/public-api';

// Import only essential widget creation functions and data
import {
  createFilterWidget,
  createMetricTiles,
  // Dashboard data
  INITIAL_DASHBOARD_DATA
} from './widgets';

// Import base dashboard component
import { BaseDashboardComponent } from '@dashboards/public-api';

// Define the specific data structure for this dashboard
export interface DashboardDataRow {
  id: string;
  assetCategory: string;
  month: string;
  market: string;
  totalValue: number;
  riskValue?: number;
  returnValue?: number;
  description?: string;
}

@Component({
  selector: 'app-overall',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule,
    MessageModule,
    ScrollPanelModule,
    // Dashboard components
    DashboardContainerComponent,
    DashboardHeaderComponent
  ],
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverallComponent extends BaseDashboardComponent<DashboardDataRow> {
  // Header content variables
  headerTitle = 'Overall Portfolio Performance';
  headerDescription = 'Complete overview of your financial portfolio across all time periods';

  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: DashboardDataRow[] = [...INITIAL_DASHBOARD_DATA];
  protected readonly initialDashboardData: DashboardDataRow[] = INITIAL_DASHBOARD_DATA;

  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService
  ) {
    super(cdr, excelExportService, filterService);
  }

  // Implement abstract methods from BaseDashboardComponent
  protected onChildInit(): void {
    // Register world map for density map charts
    import('echarts-map-collection/custom/world.json').then((worldMapData) => {
      DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
    }).catch((error) => {
      // Handle world map loading error silently
    });
  }

  protected onChildDestroy(): void {
    // Child-specific cleanup if needed
  }

  /**
   * Create metric tiles with filtered data
   */
  protected createMetricTiles(data: DashboardDataRow[]): IWidget[] {
    return createMetricTiles(data);
  }

  /**
   * Initialize dashboard config using the Enhanced Chart Builders
   */
  protected initializeDashboardConfig(): void {
    // Create only the 4 specified widgets using enhanced chart builders
    
    // Asset Allocation Pie Chart with financial display
    const pieAssetAllocation = PieChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Asset Allocation')
      .setPosition({ x: 0, y: 3, cols: 6, rows: 8 })
      .setDonutStyle('40%', '70%')
      .setFinancialDisplay('USD', 'en-US')
      .setPredefinedPalette('finance')
      .setFilterColumn('assetCategory')
      .build();

    // Monthly Income vs Expenses Bar Chart
    const barMonthlyIncomeVsExpenses = BarChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Monthly Income vs Expenses')
      .setPosition({ x: 6, y: 3, cols: 6, rows: 8 })
      .setCurrencyFormatter('USD', 'en-US')
      .setPredefinedPalette('business')
      .setTooltip('axis', '{b}: {c}')
      .setFilterColumn('month')
      .build();

    // Risk vs Return Scatter Chart
    const scatterRiskVsReturn = ScatterChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Risk vs Return Analysis')
      .setPosition({ x: 0, y: 11, cols: 6, rows: 8 })
      .setTooltip('item', '{b}: Risk {c[0]}%, Return {c[1]}%')
      .setPredefinedPalette('modern')
      .setFilterColumn('assetCategory')
      .build();

    // Investment Distribution Map (using density map builder)
    const densityMapInvestment = DensityMapBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Investment Distribution by Region')
      .setPosition({ x: 6, y: 11, cols: 6, rows: 8 })
      .setCurrencyFormatter('USD', 'en-US')
      .setFilterColumn('market')
      .build();

    const filterWidget = createFilterWidget();
    const metricTiles = createMetricTiles(INITIAL_DASHBOARD_DATA);

    // Position metric tiles at row 0 (top of dashboard)
    // Metric tiles are already positioned at y: 0 in the createMetricTiles function

    // Position filter widget at row 1 (below metric tiles)
    filterWidget.position = { x: 0, y: 2, cols: 12, rows: 1 };

    // Use the Fluent API to build the dashboard config with filter highlighting enabled
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('overall-dashboard')
      // Enable filter highlighting mode with custom styling
      .enableFilterHighlighting(true, {
        filteredOpacity: 0.25,
        highlightedOpacity: 1.0,
        highlightColor: '#ff6b6b',
        filteredColor: '#e0e0e0'
      })
      .setWidgets([
        // Metric tiles at the top (row 0)
        ...metricTiles,
        // Filter widget below tiles (row 1)
        filterWidget,
        // Core financial widgets (rows 3-18)
        pieAssetAllocation,
        barMonthlyIncomeVsExpenses,
        scatterRiskVsReturn,
        densityMapInvestment
      ])
      .setEditMode(false)
      .build();

    // Populate widgets with initial data
    this.populateWidgetsWithInitialData();
  }

  /**
   * Populate all widgets with initial data from the shared dataset
   */
  protected override populateWidgetsWithInitialData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // First trigger change detection to ensure widgets are rendered
    this.cdr.detectChanges();

    // Wait for charts to be initialized before updating data
    setTimeout(() => {
      // Update each widget using dedicated functions
      this.updateAssetAllocationWidget();
      this.updateMonthlyIncomeExpensesWidget();
      this.updateRiskReturnAnalysisWidget();
      this.updateInvestmentDistributionWidget();

      // Populate metric tiles with initial data
      this.updateMetricTilesWithFilters([]);

      // Trigger change detection to ensure widgets are updated
      this.cdr.detectChanges();
      
      // Add additional delay and retry for any widgets that might not have initialized
      setTimeout(() => {
        this.retryWidgetUpdates();
        this.cdr.detectChanges();
      }, 500);
    }, 200);
  }

  /**
   * Retry widget updates for any widgets that might not have been ready initially
   */
  private retryWidgetUpdates(): void {
    const widgets = this.dashboardConfig?.widgets?.filter(w => w.config?.component === 'echart') || [];
    
    widgets.forEach(widget => {
      const title = widget.config?.header?.title;
      
      if (!widget.chartInstance) {
        switch (title) {
          case 'Monthly Income vs Expenses':
            this.updateMonthlyIncomeExpensesWidget();
            break;
          case 'Risk vs Return Analysis':
            this.updateRiskReturnAnalysisWidget();
            break;
          case 'Investment Distribution by Region':
            this.updateInvestmentDistributionWidget();
            break;
        }
      }
    });
  }

  /**
   * Convert IFilterValues[] to the format expected by applyFiltersToData
   */
  private convertFiltersFormat(filters?: IFilterValues[]): any[] {
    if (!filters || filters.length === 0) {
      return [];
    }
    
    return filters.map(filter => ({
      filterColumn: filter['column'] || 'assetCategory',
      value: filter['value']
    }));
  }

  /**
   * Update Asset Allocation Pie Chart Widget
   */
  private async updateAssetAllocationWidget(filters?: any[] | IFilterValues[]): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Asset Allocation');
      if (!widget) return;

      // Convert filter format if needed
      const convertedFilters = Array.isArray(filters) && filters.length > 0 && 'column' in filters[0] 
        ? this.convertFiltersFormat(filters as IFilterValues[]) 
        : filters as any[];

      // Apply filters to base data
      let sourceData = this.applyFiltersToData(this.dashboardData, convertedFilters);
      
      // Transform data using enhanced chart builder transformation for pie chart
      const transformedData = PieChartBuilder.transformData(sourceData, {
        valueField: 'totalValue',
        nameField: 'assetCategory',
        sortBy: 'value'
      });

      if (transformedData) {
        PieChartBuilder.updateData(widget, transformedData);
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Debug method to inspect chart instances
   */
  private debugChartInstances(): void {
    const widgets = this.dashboardConfig?.widgets?.filter(w => w.config?.component === 'echart') || [];
    
    // Update page title with debug info for visibility
    document.title = `MoneyPlant UI - Charts: ${widgets.filter(w => !!w.chartInstance).length}/${widgets.length} ready`;
  }

  /**
   * Alternative approach: Use the base dashboard component's updateEchartWidget method
   */
  private updateWidgetUsingBaseMethod(widget: IWidget, data: any[]): void {
    try {
      // Use the base dashboard component's updateEchartWidget method
      this.updateEchartWidget(widget, data);
      
      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Update Monthly Income vs Expenses Bar Chart Widget
   */
  private async updateMonthlyIncomeExpensesWidget(filters?: any[] | IFilterValues[]): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Monthly Income vs Expenses');
      if (!widget) {
        return;
      }

      // Convert filter format if needed
      const convertedFilters = Array.isArray(filters) && filters.length > 0 && 'column' in filters[0] 
        ? this.convertFiltersFormat(filters as IFilterValues[]) 
        : filters as any[];

      // Apply filters to base data
      let sourceData = this.applyFiltersToData(this.dashboardData, convertedFilters);
      
      // Group by month and sum totalValue - sorted by month order  
      const aggregatedData = sourceData.reduce((acc, row) => {
        const month = row.month;
        if (!acc[month]) {
          acc[month] = { name: month, value: 0 };
        }
        acc[month].value += row.totalValue;
        return acc;
      }, {} as Record<string, any>);
      
      // Sort by month order
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const transformedData = Object.values(aggregatedData).sort((a: any, b: any) => {
        return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
      });

      if (transformedData && transformedData.length > 0) {
        // Method 1: Try BarChartBuilder.updateData
        BarChartBuilder.updateData(widget, transformedData);
        
        // Method 2: Try base dashboard component method
        setTimeout(() => {
          this.updateEchartWidget(widget, transformedData);
          this.cdr.detectChanges();
        }, 100);
        
        // Method 3: Try direct ECharts update if chart instance exists
        setTimeout(() => {
          if (widget.chartInstance) {
            try {
              const currentOptions = widget.chartInstance.getOption() as any;
              const newOptions = {
                ...currentOptions,
                series: [{
                  ...currentOptions?.series?.[0],
                  data: transformedData,
                  type: 'bar'
                }]
              };
              widget.chartInstance.setOption(newOptions, true);
            } catch (error) {
              // Silently handle errors
            }
          }
          this.cdr.detectChanges();
        }, 200);
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Update Risk vs Return Analysis Scatter Chart Widget
   */
  private async updateRiskReturnAnalysisWidget(filters?: any[] | IFilterValues[]): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Risk vs Return Analysis');
      if (!widget) {
        return;
      }

      // Convert filter format if needed
      const convertedFilters = Array.isArray(filters) && filters.length > 0 && 'column' in filters[0] 
        ? this.convertFiltersFormat(filters as IFilterValues[]) 
        : filters as any[];

      // Apply filters to base data
      let sourceData = this.applyFiltersToData(this.dashboardData, convertedFilters);
      
      // Filter and aggregate data for scatter chart
      const riskReturnData = sourceData.filter(row => 
        row.riskValue !== undefined && row.returnValue !== undefined
      );
      
      // Create aggregated data for scatter chart
      const aggregatedData = riskReturnData.reduce((acc, row) => {
        const category = row.assetCategory;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            riskSum: 0,
            returnSum: 0,
            count: 0
          };
        }
        acc[category].riskSum += row.riskValue!;
        acc[category].returnSum += row.returnValue!;
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, any>);
      
      // Transform to scatter chart format using the EXACT SAME pattern as bar chart
      const transformedData = Object.values(aggregatedData).map((item: any) => ({
        value: [
          Math.round((item.riskSum / item.count) * 100) / 100,
          Math.round((item.returnSum / item.count) * 100) / 100
        ],
        name: item.name
      }));

      if (transformedData && transformedData.length > 0) {
        // Method 1: Try ScatterChartBuilder.updateData (same as bar chart pattern)
        ScatterChartBuilder.updateData(widget, transformedData);
        
        // Method 2: Try base dashboard component method (same as bar chart pattern)
        setTimeout(() => {
          this.updateEchartWidget(widget, transformedData);
          this.cdr.detectChanges();
        }, 100);
        
        // Method 3: Try direct ECharts update if chart instance exists (same as bar chart pattern)
        setTimeout(() => {
          if (widget.chartInstance) {
            try {
              const currentOptions = widget.chartInstance.getOption() as any;
              const newOptions = {
                ...currentOptions,
                series: [{
                  ...currentOptions?.series?.[0],
                  data: transformedData,
                  type: 'scatter'
                }]
              };
              widget.chartInstance.setOption(newOptions, true);
            } catch (error) {
              // Silently handle errors
            }
          }
          this.cdr.detectChanges();
        }, 200);
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Update Investment Distribution Map Widget
   */
  private async updateInvestmentDistributionWidget(filters?: any[] | IFilterValues[]): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Investment Distribution by Region');
      if (!widget) {
        return;
      }

      // Convert filter format if needed
      const convertedFilters = Array.isArray(filters) && filters.length > 0 && 'column' in filters[0] 
        ? this.convertFiltersFormat(filters as IFilterValues[]) 
        : filters as any[];

      // Apply filters to base data
      let sourceData = this.applyFiltersToData(this.dashboardData, convertedFilters);
      
      // Group and aggregate data by market
      const aggregatedData = sourceData.reduce((acc, row) => {
        const market = row.market;
        if (!acc[market]) {
          acc[market] = { name: market, value: 0 };
        }
        acc[market].value += row.totalValue;
        return acc;
      }, {} as Record<string, any>);
      
      // Convert to array format expected by density map
      const mapData = Object.values(aggregatedData).map((item: any) => ({
        name: item.name,
        value: item.value
      }));

      if (mapData && mapData.length > 0) {
        // Method 1: Try DensityMapBuilder.updateData
        DensityMapBuilder.updateData(widget, mapData);
        
        // Method 2: Try base dashboard component method
        setTimeout(() => {
          this.updateEchartWidget(widget, mapData);
          this.cdr.detectChanges();
        }, 100);
        
        // Method 3: Try direct ECharts update if chart instance exists
        setTimeout(() => {
          if (widget.chartInstance) {
            try {
              const currentOptions = widget.chartInstance.getOption() as any;
              const newOptions = {
                ...currentOptions,
                series: [{
                  ...currentOptions?.series?.[0],
                  data: mapData,
                  type: 'map'
                }]
              };
              widget.chartInstance.setOption(newOptions, true);
            } catch (error) {
              // Silently handle errors
            }
          }
          this.cdr.detectChanges();
        }, 200);
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Helper function to apply filters to data
   */
  private applyFiltersToData(data: DashboardDataRow[], filters?: any[]): DashboardDataRow[] {
    if (!filters || filters.length === 0) {
      return data;
    }
    
    return data.filter(row => {
      return filters.every(filter => {
        const filterColumn = filter.filterColumn || 'assetCategory';
        const rowValue = row[filterColumn as keyof DashboardDataRow];
        return rowValue === filter.value;
      });
    });
  }

  /**
   * Helper function to find widget by title
   */
  private findWidgetByTitle(title: string): IWidget | undefined {
    return this.dashboardConfig?.widgets?.find(widget => 
      widget.config?.header?.title === title
    );
  }

  /**
   * @deprecated This method is deprecated. Data retrieval logic has been moved to individual widget update methods.
   * Get data for widget based on chart type detection (simplified)
   */
  protected override getDataByChartType(widget: IWidget): any {
    return null;
  }

  /**
   * Get filtered data for a specific widget using enhanced chart builder transformation methods
   * Temporarily restored for debugging
   */
  protected override getFilteredDataForWidget(widgetTitle: string, data?: DashboardDataRow[]): any {
    const sourceData = data || this.dashboardData;

    switch (widgetTitle) {
      case 'Asset Allocation':
        // Use enhanced data transformation for pie chart
        const assetData = PieChartBuilder.transformData(sourceData, {
          valueField: 'totalValue',
          nameField: 'assetCategory',
          sortBy: 'value'
        });
        return assetData;
        
      case 'Monthly Income vs Expenses':
        // Group by month and sum totalValue
        const monthlyData = this.groupByAndSum(sourceData, 'month', 'totalValue');
        return monthlyData;
        
      case 'Risk vs Return Analysis':
        // Filter rows that have both risk and return values, group by assetCategory
        const riskReturnData = sourceData.filter(row => row.riskValue !== undefined && row.returnValue !== undefined);
        
        // Group by assetCategory and calculate average risk/return
        const aggregatedRiskReturn = riskReturnData.reduce((acc, row) => {
          const category = row.assetCategory;
          if (!acc[category]) {
            acc[category] = {
              name: category,
              riskSum: 0,
              returnSum: 0,
              count: 0
            };
          }
          acc[category].riskSum += row.riskValue!;
          acc[category].returnSum += row.returnValue!;
          acc[category].count += 1;
          return acc;
        }, {} as Record<string, any>);
        
        // Format data for scatter chart - ScatterChartBuilder expects {x, y, name} format
        const scatterData = Object.values(aggregatedRiskReturn).map((item: any) => ({
          x: Math.round((item.riskSum / item.count) * 100) / 100,
          y: Math.round((item.returnSum / item.count) * 100) / 100,
          name: item.name
        }));
        return scatterData;
        
      case 'Investment Distribution by Region':
        // Group by market (country) and sum totalValue for map visualization
        const investmentData = this.groupByAndSum(sourceData, 'market', 'totalValue');
        return investmentData;
        
      default:
        return null;
    }
  }

  /**
   * @deprecated This method is deprecated. Use individual widget update methods instead.
   * Enhanced data update method using dedicated widget functions
   */
  protected updateWidgetWithEnhancedData(widget: IWidget, sourceData: DashboardDataRow[]): void {
    // Deprecated - no longer used
  }

  /**
   * Override the base updateWidgetWithFilters method to use our custom widget update methods
   */
  protected override updateWidgetWithFilters(widget: IWidget, filters: IFilterValues[]): void {
    if (!widget.config || !widget.config.component) {
      return;
    }

    const widgetTitle = widget.config?.header?.title;
    
    // Use our dedicated widget update methods based on widget title
    switch (widgetTitle) {
      case 'Asset Allocation':
        this.updateAssetAllocationWidget(filters);
        break;
      case 'Monthly Income vs Expenses':
        this.updateMonthlyIncomeExpensesWidget(filters);
        break;
      case 'Risk vs Return Analysis':
        this.updateRiskReturnAnalysisWidget(filters);
        break;
      case 'Investment Distribution by Region':
        this.updateInvestmentDistributionWidget(filters);
        break;
      default:
        // For widgets without specific handlers, use the base method
        super.updateWidgetWithFilters(widget, filters);
        break;
    }
  }

  /**
   * Enhanced filtering method that applies filters and updates all widgets
   */
  protected applyEnhancedFilters(filters: any[]): void {
    if (!this.dashboardConfig?.widgets) return;

    // Update all widgets using their dedicated functions with filters
    this.updateAssetAllocationWidget(filters);
    this.updateMonthlyIncomeExpensesWidget(filters);
    this.updateRiskReturnAnalysisWidget(filters);
    this.updateInvestmentDistributionWidget(filters);

    // Update metric tiles
    this.updateMetricTilesWithFilters(filters);

    // Trigger change detection
    setTimeout(() => this.cdr.detectChanges(), 100);
  }
}