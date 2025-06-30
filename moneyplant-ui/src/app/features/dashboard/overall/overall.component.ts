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

// Import dashboard API service
import { DashboardService } from '../../../services/apis/dashboard.api';

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
    filterService: FilterService,
    private dashboardService: DashboardService
  ) {
    super(cdr, excelExportService, filterService);
  }

  // Implement abstract methods from BaseDashboardComponent
  protected onChildInit(): void {
    // Register world map for density map charts with better error handling
    this.registerWorldMap();
  }

  /**
   * Register world map with proper error handling and retries
   */
  private async registerWorldMap(): Promise<void> {
    try {
      const worldMapData = await import('echarts-map-collection/custom/world.json');
      DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
    } catch (error) {
      console.error('Failed to load world map data:', error);
    }
  }

  protected onChildDestroy(): void {
    // Child-specific cleanup if needed
  }

  /**
   * Centralized filter handling - implements abstract method from BaseDashboardComponent
   * This method is called whenever filters change and coordinates all widget updates
   */
  protected onFiltersChanged(filters: IFilterValues[]): void {
    // Update all widgets with new filters
    this.updateAllWidgetsWithFilters();
    
    // Update metric tiles
    this.updateMetricTilesWithFilters(filters);
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Update all widgets using centralized filters
   */
  private updateAllWidgetsWithFilters(): void {
    // Update each widget using the centralized filter system
    this.updateAssetAllocationWidget();
    this.updateMonthlyIncomeExpensesWidget();
    this.updateRiskReturnAnalysisWidget();
    this.updateInvestmentDistributionWidget();
  }

  /**
   * Convert dashboard filters to API format
   */
  private convertFiltersToApiFormat(): any[] {
    const filters = this.getFilters();
    
    const apiFilters = filters.map(filter => ({
      filterColumn: filter.accessor || filter['column'] || 'assetCategory',
      value: filter['value'] || filter.accessor
    }));
    
    return apiFilters;
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
      .setMap('world') // Explicitly set world map
      .setVisualMap(0, 1000000, ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'])
      .setTooltip('item', '{b}: ${c}')
      .setCurrencyFormatter('USD', 'en-US')
      .setFilterColumn('market')
      .setRoam(false) // Disable roaming for better UX in dashboard
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
      console.warn('No dashboard config or widgets found');
      return;
    }

    // First trigger change detection to ensure widgets are rendered
    this.cdr.detectChanges();

    // Wait for charts to be initialized and world map to be registered
    setTimeout(() => {
      // Update widgets with API data
      this.updateAssetAllocationWidget();
      this.updateMonthlyIncomeExpensesWidget();
      this.updateRiskReturnAnalysisWidget();
      
      // Wait a bit longer for map registration before updating investment distribution
      setTimeout(() => {
        this.updateInvestmentDistributionWidget();
      }, 300);

      // Populate metric tiles with initial data
      this.updateMetricTilesWithFilters([]);

      // Trigger change detection to ensure widgets are updated
      this.cdr.detectChanges();
      
      // Add additional delay and retry for any widgets that might not have initialized
      setTimeout(() => {
        this.retryWidgetUpdates();
        this.cdr.detectChanges();
      }, 800);
    }, 500);
  }

  // /**
  //  * Retry widget updates for any widgets that might not have been ready initially
  //  */
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
   * Update Asset Allocation Pie Chart Widget - Using centralized filters
   */
  private async updateAssetAllocationWidget(): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Asset Allocation');
      if (!widget) return;

      // Use centralized filters
      const apiFilters = this.convertFiltersToApiFormat();

      // Show loading state
      this.setWidgetLoadingState(widget, true);

      // Fetch data from API endpoint using centralized filters
      this.dashboardService.getAssetAllocation(apiFilters).subscribe({
        next: (apiData) => {
          // API data is already in the correct format for pie chart
          const transformedData = apiData.map((item: any) => ({
            name: item.name,
            value: item.value
          }));

          if (transformedData && transformedData.length > 0) {
            PieChartBuilder.updateData(widget, transformedData);
            this.cdr.detectChanges();
          }

          // Hide loading state
          this.setWidgetLoadingState(widget, false);
        },
        error: (error) => {
          console.error('Failed to fetch asset allocation data:', error);
          
          // Hide loading state
          this.setWidgetLoadingState(widget, false);
          
          // Show error state
          this.showWidgetErrorState(widget, 'Failed to load asset allocation data');
        }
      });
    } catch (error) {
      console.error('Error in updateAssetAllocationWidget:', error);
    }
  }



  /**
   * Update Monthly Income vs Expenses Bar Chart Widget - Using centralized filters and API calls
   */
  private async updateMonthlyIncomeExpensesWidget(): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Monthly Income vs Expenses');
      if (!widget) {
        return;
      }

      // Use centralized filters
      const apiFilters = this.convertFiltersToApiFormat();

      // Show loading state
      this.setWidgetLoadingState(widget, true);

      // Fetch data from API endpoint using centralized filters
      this.dashboardService.getMonthlyIncomeExpenses(apiFilters).subscribe({
        next: (apiData) => {
          // API data is already in the correct format for bar chart
          const transformedData = apiData.map((item: any) => ({
            name: item.name,
            value: item.value
          }));

          if (transformedData && transformedData.length > 0) {
            // Method 1: Try BarChartBuilder.updateData
            BarChartBuilder.updateData(widget, transformedData);
            
            // Method 2: Try base dashboard component method
            setTimeout(() => {
              this.updateEchartWidget(widget, transformedData);
              this.cdr.detectChanges();
            }, 100);
          }

          // Hide loading state
          this.setWidgetLoadingState(widget, false);
        },
        error: (error) => {
          console.error('Failed to fetch monthly income expenses data:', error);
          
          // Hide loading state
          this.setWidgetLoadingState(widget, false);
          
          // Show error state
          this.showWidgetErrorState(widget, 'Failed to load monthly income expenses data');
        }
      });
    } catch (error) {
      console.error('Error in updateMonthlyIncomeExpensesWidget:', error);
    }
  }

  /**
   * Update Risk vs Return Analysis Scatter Chart Widget - Using centralized filters and API calls
   */
  private async updateRiskReturnAnalysisWidget(): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Risk vs Return Analysis');
      if (!widget) {
        return;
      }

      // Use centralized filters
      const apiFilters = this.convertFiltersToApiFormat();

      // Show loading state
      this.setWidgetLoadingState(widget, true);

      // Fetch data from API endpoint using centralized filters
      this.dashboardService.getRiskReturnAnalysis(apiFilters).subscribe({
        next: (apiData) => {
          // API data is already in the correct format for scatter chart
          const transformedData = apiData.map((item: any) => ({
            value: [item.risk, item.return],
            name: item.category
          }));

          if (transformedData && transformedData.length > 0) {
            // Method 1: Try ScatterChartBuilder.updateData
            ScatterChartBuilder.updateData(widget, transformedData);
            
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

          // Hide loading state
          this.setWidgetLoadingState(widget, false);
        },
        error: (error) => {
          console.error('Failed to fetch risk return analysis data:', error);
          
          // Hide loading state
          this.setWidgetLoadingState(widget, false);
          
          // Show error state
          this.showWidgetErrorState(widget, 'Failed to load risk return analysis data');
        }
      });
    } catch (error) {
      console.error('Error in updateRiskReturnAnalysisWidget:', error);
    }
  }

  /**
   * Update Investment Distribution Map Widget - Using centralized filters
   */
  private async updateInvestmentDistributionWidget(): Promise<void> {
    try {
      const widget = this.findWidgetByTitle('Investment Distribution by Region');
      if (!widget) {
        return;
      }

      // Use centralized filters
      const apiFilters = this.convertFiltersToApiFormat();

      // Show loading state
      this.setWidgetLoadingState(widget, true);

      // Fetch data from API endpoint using centralized filters
      this.dashboardService.getInvestmentDistribution(apiFilters).subscribe({
        next: (apiData) => {
          // Convert API response to format expected by density map
          const mapData = apiData.map((item: any) => ({
            name: item.country,
            value: item.value
          }));

          if (mapData && mapData.length > 0) {
            // Use multiple update strategies for better reliability
            this.updateMapWidget(widget, mapData);
          }

          // Hide loading state
          this.setWidgetLoadingState(widget, false);
        },
        error: (error) => {
          console.error('Failed to fetch investment distribution data:', error);
          
          // Hide loading state
          this.setWidgetLoadingState(widget, false);
          
          // Optionally show error message to user
          this.showWidgetErrorState(widget, 'Failed to load investment distribution data');
        }
      });
    } catch (error) {
      console.error('Error in updateInvestmentDistributionWidget:', error);
    }
  }

  /**
   * Update map widget with multiple strategies for better reliability
   */
  private updateMapWidget(widget: IWidget, mapData: any[]): void {
    // Calculate min/max values for visual map
    const values = mapData.map(item => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Strategy 1: Use DensityMapBuilder.updateData
    try {
      DensityMapBuilder.updateData(widget, mapData);
    } catch (error) {
      console.warn('DensityMapBuilder.updateData failed:', error);
    }

    // Strategy 2: Direct ECharts update with proper configuration
    setTimeout(() => {
      if (widget.chartInstance) {
        try {
          const mapOptions = {
            tooltip: {
              trigger: 'item',
              formatter: '{b}: ${c}'
            },
            visualMap: {
              min: minValue,
              max: maxValue,
              left: 'left',
              top: 'bottom',
              text: ['High', 'Low'],
              calculable: true,
              inRange: {
                color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
              }
            },
            series: [{
              name: 'Investment Distribution',
              type: 'map',
              map: 'world',
              roam: false,
              data: mapData,
              emphasis: {
                label: {
                  show: true
                }
              }
            }]
          };

          widget.chartInstance.setOption(mapOptions, true);
        } catch (error) {
          console.error('Direct ECharts update failed:', error);
        }
      } else {
        console.warn('Chart instance not available');
      }
      this.cdr.detectChanges();
    }, 300);

    // Strategy 3: Use base component method as fallback
    setTimeout(() => {
      try {
        this.updateEchartWidget(widget, mapData);
      } catch (error) {
        console.warn('Base component update failed:', error);
      }
      this.cdr.detectChanges();
    }, 500);
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
   * Override the base updateWidgetWithFilters method to use our centralized filter system
   */
  protected override updateWidgetWithFilters(widget: IWidget, filters: IFilterValues[]): void {
    if (!widget.config || !widget.config.component) {
      return;
    }

    const widgetTitle = widget.config?.header?.title;
    
    // Use our dedicated widget update methods based on widget title (using centralized filters)
    switch (widgetTitle) {
      case 'Asset Allocation':
        this.updateAssetAllocationWidget();
        break;
      case 'Monthly Income vs Expenses':
        this.updateMonthlyIncomeExpensesWidget();
        break;
      case 'Risk vs Return Analysis':
        this.updateRiskReturnAnalysisWidget();
        break;
      case 'Investment Distribution by Region':
        this.updateInvestmentDistributionWidget();
        break;
      default:
        // For widgets without specific handlers, use the base method
        super.updateWidgetWithFilters(widget, filters);
        break;
    }
  }

  /**
   * Enhanced filtering method that applies filters and updates all widgets using centralized filters
   */
  protected applyEnhancedFilters(filters: any[]): void {
    if (!this.dashboardConfig?.widgets) return;

    // Update all widgets using their dedicated functions (using centralized filters)
    this.updateAssetAllocationWidget();
    this.updateMonthlyIncomeExpensesWidget();
    this.updateRiskReturnAnalysisWidget();
    this.updateInvestmentDistributionWidget();

    // Update metric tiles
    this.updateMetricTilesWithFilters(filters);

    // Trigger change detection
    setTimeout(() => this.cdr.detectChanges(), 100);
  }


  // /**
  //  * Force initialize a chart instance for a widget
  //  */
  // private forceInitializeChart(widget: IWidget): void {
  //   try {
  //     console.log('Force initializing chart for widget:', widget.config?.header?.title);
      
  //     // Check if we have a DOM element
  //     if (!widget['element']) {
  //       console.warn('No DOM element found for widget');
  //       return;
  //     }
      
  //     // Initialize ECharts instance using the static echarts import
  //     if (widget['element']) {
  //       console.log('Creating ECharts instance...');
  //       const chartInstance = echarts.init(widget['element'] as HTMLElement);
  //       widget.chartInstance = chartInstance as any; // Type assertion for compatibility
        
  //       // Apply the widget's options if available and if it's an echart widget
  //       if (widget.config?.options && widget.config.component === 'echart') {
  //         const chartOptions = widget.config.options;
  //         if (widget.chartInstance && this.isEChartsOption(chartOptions)) {
  //           try {
  //             widget.chartInstance.setOption(chartOptions as any);
  //             console.log('Applied widget options to chart');
  //           } catch (optionError) {
  //             console.warn('Failed to set chart options:', optionError);
  //           }
  //         }
  //       }
        
  //       // Try to update with data again
  //       setTimeout(() => {
  //         this.updateMonthlyIncomeExpensesWidget();
  //       }, 100);
  //     }
  //   } catch (error) {
  //     console.error('Error in forceInitializeChart:', error);
  //   }
  // }

}