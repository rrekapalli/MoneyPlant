import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';

// Import echarts core module and components
import * as echarts from 'echarts/core';
// Import bar, pie, line, and other chart components
import {
  BarChart,
  PieChart,
  LineChart,
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
  LineChart,
  ScatterChart,
  MapChart,
  CanvasRenderer
]);

// Register built-in maps and custom maps
import { DensityMapBuilder, DENSITY_MAP_VARIANTS } from '@dashboards/public-api';

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
  PolarChartBuilder,
  POLAR_VARIANTS,
  BarChartBuilder,
  BAR_VARIANTS,
  ScatterChartBuilder,
  SCATTER_VARIANTS
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

  // Track initialized charts
  private initializedCharts = new Set<string>();
  private pendingChartUpdates = new Map<string, () => void>();

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
    // Create only the 4 specified widgets using enhanced chart builders with simple variants
    // 
    // Alternative variants you can try:
    // - PIE_VARIANTS: STANDARD, DOUGHNUT, NIGHTINGALE, HALF_DOUGHNUT, NESTED
    // - BAR_VARIANTS: VERTICAL, HORIZONTAL, STACKED, WATERFALL  
    // - SCATTER_VARIANTS: BASIC, BUBBLE, LARGE_DATASET
    // - DENSITY_MAP_VARIANTS: BASIC, CHOROPLETH, BUBBLE, HEAT
    
    // Asset Allocation Polar Chart with ROSE variant (proven to work reliably)
    const polarAssetAllocation = PolarChartBuilder.create()
      .setData([
        { name: 'Stocks', value: 150000 },
        { name: 'Bonds', value: 75000 },
        { name: 'Real Estate', value: 200000 },
        { name: 'Cryptocurrency', value: 50000 },
        { name: 'Commodities', value: 80000 }
      ]) // Test data to check if chart renders
      .setVariant(POLAR_VARIANTS.ROSE)  // Use ROSE variant (confirmed working)
      .setHeader('Asset Allocation')
      .setPosition({ x: 0, y: 3, cols: 6, rows: 8 })  // Reduced back to 8 for better fit
      .setCurrencyFormatter('USD', 'en-US')
      .setPredefinedPalette('finance')
      .setFilterColumn('assetCategory')
      .setGrid({
        containLabel: true,
        top: '5%',      // Reduced from 15% to 5%
        left: '5%',     // Reduced from 10% to 5%
        right: '5%',    // Reduced from 10% to 5%
        bottom: '5%'    // Reduced from 15% to 5%
      })
      .build();



    // Monthly Income vs Expenses Bar Chart with vertical variant
    const barTestData = [
      { name: 'Jan', value: 15000 },
      { name: 'Feb', value: 25000 },
      { name: 'Mar', value: 20000 },
      { name: 'Apr', value: 18000 },
      { name: 'May', value: 22000 },
      { name: 'Jun', value: 19000 }
    ];
    const barMonthlyIncomeVsExpenses = BarChartBuilder.create()
      .setData(barTestData) // Test data to check if chart renders
      .setCategories(barTestData.map(item => item.name)) // Extract categories from data
      .setVariant(BAR_VARIANTS.VERTICAL)
      .setHeader('Monthly Income vs Expenses')
      .setPosition({ x: 6, y: 3, cols: 6, rows: 8 })  // Reduced back to 8 for better fit
      .setCurrencyFormatter('USD', 'en-US')
      .setPredefinedPalette('business')
      .setTooltip('axis', '{b}: {c}')
      .setFilterColumn('month')
      .setGrid({
        containLabel: true,
        top: '5%',      // Reduced from 15% to 5%
        left: '5%',     // Reduced from 3% to 5%
        right: '5%',    // Reduced from 4% to 5%
        bottom: '5%'    // Reduced from 15% to 5%
      })
      .build();



    // Risk vs Return Scatter Chart with basic variant
    const scatterRiskVsReturn = ScatterChartBuilder.create()
      .setData([]) // Data will be populated later
      .setVariant(SCATTER_VARIANTS.BASIC)
      .setHeader('Risk vs Return Analysis')
      .setPosition({ x: 0, y: 12, cols: 6, rows: 8 })  // Adjusted position and height
      .setTooltip('item', '{b}: Risk {c[0]}%, Return {c[1]}%')
      .setPredefinedPalette('modern')
      .setFilterColumn('assetCategory')
      .setGrid({
        containLabel: true,
        top: '5%',      // Reduced from 15% to 5%
        left: '5%',     // Reduced from 10% to 5%
        right: '5%',    // Reduced from 10% to 5%
        bottom: '5%'    // Reduced from 15% to 5%
      })
      .build();

    // Investment Distribution Map (using density map builder with BASIC variant)
    const densityMapInvestment = DensityMapBuilder.create()
      .setData([]) // Data will be populated later
      .setVariant(DENSITY_MAP_VARIANTS.BASIC)
      .setHeader('Investment Distribution by Region')
      .setPosition({ x: 6, y: 12, cols: 6, rows: 8 })  // Adjusted position and height
      .setMap('world') // Explicitly set world map
      .setVisualMap(0, 1000000, ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'])
      .setTooltip('item', '{b}: ${c}')
      .setCurrencyFormatter('USD', 'en-US')
      .setFilterColumn('market')
      .setRoam(false) // Disable roaming for better UX in dashboard
      .setGrid({
        containLabel: true,
        top: '2%',      // Minimal top margin for maps
        left: '2%',     // Minimal left margin for maps
        right: '2%',    // Minimal right margin for maps
        bottom: '2%'    // Minimal bottom margin for maps
      })
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
        polarAssetAllocation,
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

    // Update non-chart widgets immediately
    this.updateMetricTilesWithFilters([]);
    
    // Use a longer delay and check for chart initialization before updating
    setTimeout(() => {
      this.waitForChartsAndUpdate();
    }, 2000);
  }

  /**
   * Wait for charts to be initialized and then update them
   */
  private waitForChartsAndUpdate(): void {
    const maxWaitTime = 10000; // 10 seconds max
    const checkInterval = 500; // Check every 500ms
    let elapsed = 0;
    
    const checkAndUpdate = () => {
      const pieWidget = this.findWidgetByTitle('Asset Allocation');
      const barWidget = this.findWidgetByTitle('Monthly Income vs Expenses');
      const scatterWidget = this.findWidgetByTitle('Risk vs Return Analysis');
      const mapWidget = this.findWidgetByTitle('Investment Distribution by Region');
      
      const allChartsReady = [pieWidget, barWidget, scatterWidget, mapWidget]
        .filter(w => w?.config?.component === 'echart')
        .every(w => w?.chartInstance);
      
      if (allChartsReady) {
        this.updateAssetAllocationWidget();
        this.updateMonthlyIncomeExpensesWidget();
        this.updateRiskReturnAnalysisWidget();
        this.updateInvestmentDistributionWidget();
        return;
      }
      
      elapsed += checkInterval;
      if (elapsed < maxWaitTime) {
        setTimeout(checkAndUpdate, checkInterval);
      } else {
        // Timeout reached, proceed anyway
        this.updateAssetAllocationWidget();
        this.updateMonthlyIncomeExpensesWidget();
        this.updateRiskReturnAnalysisWidget();
        this.updateInvestmentDistributionWidget();
      }
    };
    
    checkAndUpdate();
  }

  /**
   * Schedule chart updates to run when charts are initialized
   */
  private scheduleChartUpdates(): void {
    // Asset Allocation Pie Chart
    this.pendingChartUpdates.set('Asset Allocation', () => {
      this.updateAssetAllocationWidget();
    });

    // Monthly Income vs Expenses Bar Chart  
    this.pendingChartUpdates.set('Monthly Income vs Expenses', () => {
      this.updateMonthlyIncomeExpensesWidget();
    });

    // Risk vs Return Scatter Chart
    this.pendingChartUpdates.set('Risk vs Return Analysis', () => {
      this.updateRiskReturnAnalysisWidget();
    });

    // Investment Distribution Map
    this.pendingChartUpdates.set('Investment Distribution by Region', () => {
      this.updateInvestmentDistributionWidget();
    });
  }

  /**
   * Check for initialized charts and trigger their updates
   */
  private checkForInitializedCharts(): void {
    const checkInterval = setInterval(() => {
      let foundNewCharts = false;

      this.dashboardConfig?.widgets?.forEach(widget => {
        const title = widget.config?.header?.title;
        
        if (title && 
            widget.config?.component === 'echart' && 
            widget.chartInstance && 
            !this.initializedCharts.has(title)) {
          
          this.initializedCharts.add(title);
          foundNewCharts = true;

          // Execute pending update for this chart
          const updateFunction = this.pendingChartUpdates.get(title);
          if (updateFunction) {
            setTimeout(() => {
              updateFunction();
              this.pendingChartUpdates.delete(title);
            }, 100);
          }
        }
      });

      // Clean up interval when all charts are initialized
      if (this.pendingChartUpdates.size === 0) {
        clearInterval(checkInterval);
      }

      // Trigger change detection if we found new charts
      if (foundNewCharts) {
        this.cdr.detectChanges();
      }
    }, 1000); // Increased interval for easier debugging

    // Cleanup after 30 seconds to prevent infinite checking
    setTimeout(() => {
      clearInterval(checkInterval);

    }, 30000);
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
      if (!widget) {
        console.error('Asset Allocation widget not found!');
        return;
      }

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
            try {
              // Add delay to avoid conflicts with chart initialization
              setTimeout(() => {
                PolarChartBuilder.updateData(widget, transformedData);
                this.cdr.detectChanges();
              }, 100);
            } catch (error) {
              console.error('Error updating pie chart:', error);
            }
          }

          // Hide loading state
          this.setWidgetLoadingState(widget, false);
        },
        error: (error) => {
          console.error('Failed to fetch asset allocation data:', error);
          
          // Hide loading state
          this.setWidgetLoadingState(widget, false);
          
          // Provide fallback data for pie chart
          const fallbackData = [
            { name: 'Stocks', value: 150000 },
            { name: 'Bonds', value: 75000 },
            { name: 'Real Estate', value: 200000 },
            { name: 'Cryptocurrency', value: 50000 },
            { name: 'Commodities', value: 80000 }
          ];
          

          // Add delay to avoid conflicts with chart initialization
          setTimeout(() => {
            PolarChartBuilder.updateData(widget, fallbackData);
            this.cdr.detectChanges();
          }, 100);
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
          // Transform API data to correct format for bar chart
          // API returns: { month: string, income: number, expenses: number, net: number }
          // We need: { name: string, value: number }[] for simple bar chart
          
          // Show net income (income - expenses) per month
          const transformedData = apiData.map((item: any) => ({
            name: item.month,
            value: item.net || (item.income - item.expenses)
          }));

          if (transformedData && transformedData.length > 0) {
            try {
              BarChartBuilder.updateData(widget, transformedData);
              this.cdr.detectChanges();
            } catch (error) {
              console.error('Error updating bar chart:', error);
            }
          }

          // Hide loading state
          this.setWidgetLoadingState(widget, false);
        },
        error: (error) => {
          console.error('Failed to fetch monthly income expenses data:', error);
          
          // Hide loading state
          this.setWidgetLoadingState(widget, false);
          
          // Provide fallback data for bar chart
          const fallbackData = [
            { name: 'Jan', value: 15000 },
            { name: 'Feb', value: 25000 },
            { name: 'Mar', value: 20000 },
            { name: 'Apr', value: 18000 }
          ];
          

          BarChartBuilder.updateData(widget, fallbackData);
          this.cdr.detectChanges();
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
          // Transform API data for scatter chart
          // API returns: { assetCategory: string, risk: number, return: number, marketCap: number }
          // We need: { value: [number, number], name: string }[]
          const transformedData = apiData.map((item: any) => ({
            value: [item.risk, item.return],
            name: item.assetCategory
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
        // Use enhanced data transformation for polar chart
        const assetData = PolarChartBuilder.transformData(sourceData, {
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




}