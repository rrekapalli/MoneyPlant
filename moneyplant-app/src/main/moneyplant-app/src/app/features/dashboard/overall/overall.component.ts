import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Subscription } from 'rxjs';

// Import echarts core module and components
import * as echarts from 'echarts/core';
// Import bar, line, pie, and other chart components
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart
} from 'echarts/charts';
// Import tooltip, title, legend, and other components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent
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
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart,
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
  DashboardContainerComponent,
  DashboardHeaderComponent,
  // Fluent API
  StandardDashboardBuilder,
  ExcelExportService,
  FilterService,
  // Enhanced Chart Builders
  ApacheEchartBuilder,
  PieChartBuilder,
  AreaChartBuilder,
  TreemapChartBuilder,
  SankeyChartBuilder,
  // Other builders and utilities
  BarChartBuilder,
  HorizontalBarChartBuilder,
  ScatterChartBuilder,
  GaugeChartBuilder,
  HeatmapChartBuilder,
  PolarChartBuilder,
  CandlestickChartBuilder,
  SunburstChartBuilder
} from '@dashboards/public-api';

// Import only essential widget creation functions and data
import {
  createFilterWidget,
  // Dashboard data
  INITIAL_DASHBOARD_DATA
} from './widgets';
import { createMetricTiles as createMetricTilesFunction } from './widgets/metric-tiles';

// Import base dashboard component
import { BaseDashboardComponent } from '@dashboards/public-api';

// Import component communication service
import { ComponentCommunicationService, SelectedIndexData } from '../../../services/component-communication.service';

// Import stock ticks service and entities
import { StockTicksService } from '../../../services/apis/stock-ticks.api';
import {StockDataDto, StockTicksDto} from '../../../services/entities/stock-ticks';

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
  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: DashboardDataRow[] = [...INITIAL_DASHBOARD_DATA];
  protected readonly initialDashboardData: DashboardDataRow[] = INITIAL_DASHBOARD_DATA;
  
  // Stock ticks data storage
  protected stockTicksData: StockDataDto[] | null = [];
  
  // Filtered stock data for cross-chart filtering
  protected filteredStockData: StockDataDto[] | null = [];
  
  // Dashboard title - dynamic based on selected index
  public dashboardTitle: string = 'Financial Dashboard';
  
  // Subscription management
  private selectedIndexSubscription: Subscription | null = null;

  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService,
    private componentCommunicationService: ComponentCommunicationService,
    private stockTicksService: StockTicksService
  ) {
    super(cdr, excelExportService, filterService);
  }

  override ngOnInit(): void {
    // Call parent ngOnInit if it exists
    super.ngOnInit?.();
    
    // Load initial stock ticks data - you can modify this to use a default index symbol
    // For now, we'll let the component communication service handle the initial load
    // this.loadStockTicksData('NIFTY50'); // Uncomment and set default symbol if needed
  }

  // Implement abstract methods from BaseDashboardComponent
  protected onChildInit(): void {
    // Register world map for density map charts
    import('echarts-map-collection/custom/world.json').then((worldMapData) => {
      DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
    }).catch((error) => {
      // Handle world map loading error silently
    });

    // Clear any existing subscription to prevent memory leaks
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }

    // Clear existing stock ticks data to prevent showing stale data
    this.stockTicksData = null;
    this.filteredStockData = null;
    
    // Reset dashboard title
    this.dashboardTitle = 'Financial Dashboard';
    
    // Clear any existing selected index data to prevent stale data issues
    this.componentCommunicationService.clearSelectedIndex();

    // Clear pie chart and other widgets data to prevent stale data
    this.clearAllWidgetsData();

    // Subscribe to selected index data changes and store the subscription
    this.selectedIndexSubscription = this.componentCommunicationService.getSelectedIndex().subscribe(selectedIndex => {
      if (selectedIndex) {
        this.updateDashboardWithSelectedIndex(selectedIndex);
      } else {
        // If no selected index, load NIFTY 50 by default
        this.loadDefaultNifty50Data();
      }
    });

    // Load NIFTY 50 data by default on initial load
    setTimeout(() => {
      const currentSelectedIndex = this.componentCommunicationService.getSelectedIndex();
      // Check if there's no current selected index, then load default
      if (!currentSelectedIndex) {
        this.loadDefaultNifty50Data();
      }
    }, 100);
  }

  protected onChildDestroy(): void {
    // Unsubscribe from selected index subscription to prevent memory leaks
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }
    
    // Clear stock ticks data
    this.stockTicksData = null;
    this.filteredStockData = null;
  }

  /**
   * Load default NIFTY 50 data when no index is selected
   */
  private loadDefaultNifty50Data(): void {
    // Set dashboard title for NIFTY 50
    this.dashboardTitle = 'NIFTY 50 - Financial Dashboard';
    
    // Create default NIFTY 50 selected index data
    const defaultNifty50Data: SelectedIndexData = {
      id: 'NIFTY50',
      symbol: 'NIFTY 50',
      name: 'NIFTY-50',
      lastPrice: 0,
      variation: 0,
      percentChange: 0,
      keyCategory: 'Index'
    };
    
    // Update dashboard with NIFTY 50 data
    this.updateDashboardWithSelectedIndex(defaultNifty50Data);
  }

  /**
   * Load stock ticks data for the given index symbol
   * @param indexSymbol The symbol of the index to fetch stock ticks data for
   */
  private loadStockTicksData(indexSymbol: string): void {
    if (indexSymbol && indexSymbol.trim()) {
      this.stockTicksService.getStockTicksByIndex(indexSymbol).subscribe({
        next: (stockTicksData: StockDataDto[]) => {
          // Store the stock ticks data
          this.stockTicksData = stockTicksData;
          
          // Initialize filtered data with original data
          this.filteredStockData = stockTicksData;

          // Update metric tiles with the new stock data
          this.updateMetricTilesWithFilters([]);
          
          // Update all widgets with the new stock data, especially the pie chart
          this.updateAllWidgetsWithStockData();
          
          // Trigger change detection after receiving stock data
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching stock ticks data:', error);
          // Reset stock ticks data on error
          this.stockTicksData = null;
          this.filteredStockData = null;
          this.cdr.detectChanges();
        }
      });
    }
  }

  /**
   * Clear all widgets data to prevent stale data display
   */
  private clearAllWidgetsData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Find all echart widgets and clear their data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      // Clear widget data by setting empty data
      this.updateEchartWidget(widget, []);
    });
  }

  /**
   * Update all widgets with fresh stock data, especially the pie chart
   */
  private updateAllWidgetsWithStockData(): void {
    if (!this.dashboardConfig?.widgets || !this.stockTicksData) {
      return;
    }

    // Find and update the pie chart widget specifically
    const pieChartWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Sector Allocation'
    );

    if (pieChartWidget) {
      const sectorData = this.getFilteredDataForWidget('Sector Allocation');
      if (sectorData && sectorData.length > 0) {
        this.updateEchartWidget(pieChartWidget, sectorData);
      } else {
        console.warn('No sector data available for pie chart update');
      }
    } else {
      console.warn('Pie chart widget not found');
    }

    // Update all other echart widgets
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart' && widget.config?.header?.title !== 'Sector Allocation'
    );

    echartWidgets.forEach(widget => {
      const widgetTitle = widget.config?.header?.title;
      if (widgetTitle) {
        const widgetData = this.getFilteredDataForWidget(widgetTitle);
        if (widgetData) {
          this.updateEchartWidget(widget, widgetData);
        }
      }
    });
  }

  /**
   * Update dashboard data with selected index information
   * @param selectedIndex The selected index data object from indices component
   */
  private updateDashboardWithSelectedIndex(selectedIndex: SelectedIndexData): void {
    // Update dashboard title with selected index name or symbol
    this.dashboardTitle = selectedIndex.name || selectedIndex.symbol || 'Financial Dashboard';

    // Transform the selected index data to dashboard data format
    const dashboardDataRow = this.componentCommunicationService.transformToDashboardData(selectedIndex);
    
    // Add the new data to the existing dashboard data
    // First, remove any existing data for the same symbol to avoid duplicates
    this.dashboardData = this.dashboardData.filter(row => row.id !== dashboardDataRow.id);
    
    // Add the new data row
    this.dashboardData = [dashboardDataRow, ...this.dashboardData];
    
    // Fetch stock ticks data for the selected index
    // Extract symbol from selectedIndex object
    const indexSymbol = selectedIndex.symbol;
    this.loadStockTicksData(indexSymbol);
    
    // Trigger change detection and update widgets
    this.populateWidgetsWithInitialData();
    this.cdr.detectChanges();
  }

  /**
   * Create metric tiles using stock ticks data
   * @param data - Dashboard data (not used, we use stockTicksData instead)
   */
  protected createMetricTiles(data: DashboardDataRow[]): IWidget[] {
    return createMetricTilesFunction(this.stockTicksData);
  }

  /**
   * Initialize dashboard config using the Enhanced Chart Builders
   */
  protected initializeDashboardConfig(): void {
    // Create widgets using enhanced chart builders

     // Investment Distribution Map (using density map builder)
     const densityMapInvestment = DensityMapBuilder.create()
     .setData([]) // Data will be populated later
     .setHeader('Investment Distribution by Region')
     .setCurrencyFormatter('INR', 'en-US')
     .build();

    // Stock Industry Horizontal Bar Chart
    const barStockIndustry = HorizontalBarChartBuilder.create()
        .setData(this.stockTicksData) // Data will be populated later
        .setHeader('Industry')
        .setCurrencyFormatter('INR', 'en-US')
        .setPredefinedPalette('business')
        .setTooltip('axis', '{b}: {c}')
        .setFilterColumn('industry')
        .setEvents((widget, chart) => {
          if (chart) {
            chart.on('click', (params: any) => {
              // Filter by industry when bar is clicked
              this.filterChartsByIndustry(params.name);
            });
          }
        })
        .build();
    
    // Stock Sector Allocation Pie Chart with financial display
    const pieStockSector = PieChartBuilder.create()
      .setData(this.stockTicksData) // Data will be populated later
      .setHeader('Sector Allocation')
      .setDonutStyle('40%', '70%')
      .setFinancialDisplay('INR', 'en-US')
      .setPredefinedPalette('finance')
      .setFilterColumn('sector')
      .setEvents((widget, chart) => {
        if (chart) {
          chart.on('click', (params: any) => {
            // Filter by sector when pie slice is clicked
            this.filterChartsBySector(params.name);
          });
        }
      })
      .build();

    // Performance Metrics Polar Chart
    const polarChart = PolarChartBuilder.create()
    .setData([]) // Data will be populated later
    .setHeader('Performance Metrics')
    .setPercentageFormatter(1)
    .build();

    // Portfolio Performance Area Chart
    const linePortfolioPerformance = AreaChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Portfolio Performance')
      .setFinancialTrend('INR', 'en-US')
      .setPredefinedPalette('finance')
      .build();

    // Risk vs Return Scatter Chart
    const scatterRiskVsReturn = ScatterChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Risk vs Return Analysis')
      .setTooltip('item', '{b}: Risk {c[0]}%, Return {c[1]}%')
      .setPredefinedPalette('modern')
      .build();

    // Savings Goal Gauge
    const gaugeSavingsGoal = GaugeChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Savings Goal Progress')
      .setPercentageFormatter(0)
      .build();

    // Spending Heatmap
    const heatmapSpending = HeatmapChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Weekly Spending Heatmap')
      .setCurrencyFormatter('INR', 'en-US')
      .build();

    // Revenue Trend Area Chart
    const areaChart = AreaChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Revenue Trend')
      .setFinancialTrend('INR', 'en-US')
      .build();

    // Financial Overview Stacked Area
    const stackedAreaChart = AreaChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Financial Overview')
      .setFinancialTrend('INR', 'en-US')
      .setStack('total')
      .build();

    // Portfolio Distribution Treemap
    const treemapChart = TreemapChartBuilder.create()
      .setData(this.stockTicksData) // Data will be populated later
      .setHeader('Portfolio Distribution')
      .setPortfolioConfiguration()
      .setFinancialDisplay('INR', 'en-US')
      .build();

    // Monthly Expenses Treemap
    const expenseTreemap = TreemapChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Monthly Expenses')
      .setExpenseConfiguration()
      .setFinancialDisplay('INR', 'en-US')
      .build();

    // Organizational Structure Sunburst
    const sunburstChart = SunburstChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Organizational Structure')
      .build();

    // Financial Flow Sankey
    const sankeyChart = SankeyChartBuilder.create()
      .setData({ nodes: [], links: [] }) // Data will be populated later
      .setHeader('Financial Flow')
      .setFinancialFlow()
      .setCurrencyDisplay('INR', 'en-US')
      .build();

    // Investment Flow Sankey
    const investmentFlowSankey = SankeyChartBuilder.create()
      .setData({ nodes: [], links: [] }) // Data will be populated later
      .setHeader('Investment Flow')
      .setInvestmentFlow()
      .setCurrencyDisplay('INR', 'en-US')
      .build();

    // Budget Allocation Sankey
    const budgetAllocationSankey = SankeyChartBuilder.create()
      .setData({ nodes: [], links: [] }) // Data will be populated later
      .setHeader('Budget Allocation')
      .setBudgetAllocation()
      .setCurrencyDisplay('INR', 'en-US')
      .build();

    // Stock Price Candlestick
    const candlestickChart = CandlestickChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Stock Price Analysis')
      .setCurrencyFormatter('INR', 'en-US')
      .build();

    const filterWidget = createFilterWidget();
    const metricTiles = this.createMetricTiles([]);

    // Position metric tiles at row 0 (top of dashboard)
    // Metric tiles are already positioned at y: 0 in the createMetricTiles function

    // Position filter widget at row 1 (below metric tiles)
    filterWidget.position = { x: 0, y: 1, cols: 12, rows: 1 };

    // Position other widgets starting from row 2 (below filter)
    // densityMapInvestment.position = { x: 0, y: 4, cols: 8, rows: 8 };

    barStockIndustry.position = { x: 0, y: 3, cols: 8, rows: 8 };
    pieStockSector.position = { x: 8, y: 3, cols: 4, rows: 8 };
    treemapChart.position = { x: 0, y: 11, cols: 12, rows: 8 };

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
        // Core financial widgets
        barStockIndustry,
        pieStockSector,
        treemapChart,
        //linePortfolioPerformance,
        //scatterRiskVsReturn,
        //gaugeSavingsGoal,
        //heatmapSpending,
        //densityMapInvestment,
        //areaChart,
        //polarChart,
        //stackedAreaChart,
        //expenseTreemap,
        //sunburstChart,
        //sankeyChart,
        //investmentFlowSankey,
        //budgetAllocationSankey,
        //candlestickChart
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

    // Find all echart widgets and populate them with initial data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      const widgetTitle = widget.config?.header?.title;
      
      // Try to get data by widget title first
      let initialData = null;
      if (widgetTitle) {
        initialData = this.getFilteredDataForWidget(widgetTitle);
      }
      
      // If no data found by title, try to detect chart type and provide appropriate data
      if (!initialData) {
        console.warn(`Widget ${widget.id} has no title defined or no matching data. Attempting to detect chart type...`);
        initialData = this.getDataByChartType(widget);
      }
      
      if (initialData) {
        this.updateEchartWidget(widget, initialData);
      } else {
        console.warn(`No data found for widget: ${widget.id} (title: ${widgetTitle})`);
      }
    });

    // Populate metric tiles with initial data
    this.updateMetricTilesWithFilters([]);

    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Get data for widget based on chart type detection
   */
  protected override getDataByChartType(widget: IWidget): any {
    const chartOptions = widget.config?.options as any;
    
    if (!chartOptions?.series?.[0]) {
      return null;
    }
    
    const seriesType = chartOptions.series[0].type;
    const mapType = chartOptions.series[0].map;
    
    // Detect chart type and provide appropriate data
    switch (seriesType) {
      case 'map':
        // This is a density/choropleth map - provide investment distribution data
        return this.groupByAndSum(this.dashboardData, 'market', 'totalValue');
        
      case 'pie':
        // This is a pie chart - provide asset allocation data
        return this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
        
      case 'bar':
        // This is a bar chart - provide monthly data
        return this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        
      case 'line':
        // This is a line chart - provide portfolio performance data
        return this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        
      case 'scatter':
        // This is a scatter chart - provide risk vs return data
        const riskReturnData = this.dashboardData.filter(row => row.riskValue !== undefined && row.returnValue !== undefined);
        const groupedRiskReturn = riskReturnData.reduce((acc, row) => {
          if (!acc[row.assetCategory]) {
            acc[row.assetCategory] = {
              name: row.assetCategory,
              value: [row.riskValue!, row.returnValue!]
            };
          }
          return acc;
        }, {} as Record<string, any>);
        return Object.values(groupedRiskReturn);
        
      case 'heatmap':
        // This is a heatmap - provide heatmap data
        return this.createHeatmapData(this.dashboardData);
        
      case 'gauge':
        // This is a gauge chart - provide simple numeric data
        const totalValue = this.dashboardData.reduce((sum, row) => sum + row.totalValue, 0);
        return [{ name: 'Progress', value: Math.min(totalValue / 10, 100) }]; // Scale to percentage
        
      case 'treemap':
        // This is a treemap - provide hierarchical treemap data from stockTicksData
        return this.createStockTicksTreemapData(this.stockTicksData);
        
      case 'sunburst':
        // This is a sunburst chart - provide sunburst data
        return this.createSunburstData(this.dashboardData);
        
      case 'sankey':
        // This is a sankey diagram - provide default sankey data
        return {
          nodes: [
            { name: 'Income' }, { name: 'Expenses' }, { name: 'Savings' }
          ],
          links: [
            { source: 'Income', target: 'Expenses', value: 70 },
            { source: 'Income', target: 'Savings', value: 30 }
          ]
        };
        
      // case 'candlestick':
      //   // This is a candlestick chart - provide sample OHLC data
      //   console.log('Detected candlestick widget, providing sample OHLC data');
      //   // Sample OHLC data based on totalValue from dashboard data
      //   const stockData = [];
      //   const dateLabels = [];
      //   const sortedData = this.dashboardData.sort((a, b) => a.month.localeCompare(b.month));
      //   
      //   for (let i = 0; i < Math.min(sortedData.length, 15); i++) {
      //     const baseValue = sortedData[i].totalValue;
      //     // Generate realistic OHLC data: [open, close, low, high]
      //     const open = baseValue + (Math.random() - 0.5) * 10;
      //     const close = open + (Math.random() - 0.5) * 15;
      //     const low = Math.min(open, close) - Math.random() * 5;
      //     const high = Math.max(open, close) + Math.random() * 5;
      //     
      //     stockData.push([open, close, low, high]);
      //     dateLabels.push(`2024-01-${String(i + 1).padStart(2, '0')}`);
      //   }
      //   
      //   return { data: stockData, xAxisData: dateLabels };
        
      default:
        console.warn(`Unknown chart type: ${seriesType}`);
        return null;
    }
  }

  /**
   * Get filtered data for a specific widget using enhanced chart builder transformation methods
   */
  protected getFilteredDataForWidget(widgetTitle: string, data?: DashboardDataRow[]): any {
    const sourceData = data || this.dashboardData;

    switch (widgetTitle) {
      case 'Asset Allocation':
        // Use enhanced data transformation for pie chart
        return PieChartBuilder.transformData(sourceData, {
          valueField: 'totalValue',
          nameField: 'assetCategory',
          sortBy: 'value'
        });
        
      case 'Sector Allocation':
        // Use stock ticks data grouped by sector with totalTradedValue
        if (!this.stockTicksData) {
          console.warn('No stock ticks data available for sector allocation');
          return [];
        }
        
        // Group by sector and sum totalTradedValue
        const sectorData = this.stockTicksData.reduce((acc, stock) => {
          const sector = stock.sector || 'Unknown';
          const tradedValue = stock.totalTradedValue || 0;
          
          if (!acc[sector]) {
            acc[sector] = 0;
          }
          acc[sector] += tradedValue;
          return acc;
        }, {} as Record<string, number>);
        
        // Transform to pie chart format
        return Object.entries(sectorData).map(([sector, value]) => ({
          name: sector,
          value: value
        })).sort((a, b) => b.value - a.value);
        
      case 'Industry':
        // Use stock ticks data grouped by basicIndustry with totalTradedValue
        if (!this.stockTicksData) {
          console.warn('No stock ticks data available for industry chart');
          return [];
        }
        
        // Group by basicIndustry and sum totalTradedValue
        const industryData = this.stockTicksData.reduce((acc, stock) => {
          const industry = stock.basicIndustry || 'Unknown';
          const tradedValue = stock.totalTradedValue || 0;
          
          if (!acc[industry]) {
            acc[industry] = 0;
          }
          acc[industry] += tradedValue;
          return acc;
        }, {} as Record<string, number>);
        
        // Transform to bar chart format
        return Object.entries(industryData).map(([industry, value]) => ({
          name: industry,
          value: value
        })).sort((a, b) => b.value - a.value);
        
      case 'Portfolio Performance':
        // Use AreaChartBuilder's transformation method
        const { data: portfolioData, xAxisData } = AreaChartBuilder.transformToAreaData(sourceData, {
          valueField: 'totalValue',
          nameField: 'month',
          xAxisField: 'month'
        });
        return portfolioData;
        
      case 'Risk vs Return Analysis':
        // Filter rows that have both risk and return values, group by assetCategory
        const riskReturnData = sourceData.filter(row => row.riskValue !== undefined && row.returnValue !== undefined);
        // Group by assetCategory and take the first occurrence for each category
        const groupedRiskReturn = riskReturnData.reduce((acc, row) => {
          if (!acc[row.assetCategory]) {
            acc[row.assetCategory] = {
              name: row.assetCategory,
              value: [row.riskValue!, row.returnValue!]
            };
          }
          return acc;
        }, {} as Record<string, any>);
        return Object.values(groupedRiskReturn);
        
      case 'Investment Distribution by Region':
        // Group by market (country) and sum totalValue for map visualization
        const investmentData = this.groupByAndSum(sourceData, 'market', 'totalValue');
        return investmentData;
        
      case 'Weekly Spending Heatmap':
        // Create heatmap data from the dashboard data
        // Group by month and assetCategory to create a heatmap
        const heatmapData = this.createHeatmapData(sourceData);
        return heatmapData;
        
      case 'Revenue Trend':
        // Group by month and sum totalValue for area chart
        const revenueData = this.groupByAndSum(sourceData, 'month', 'totalValue');
        return revenueData;
        
      case 'Financial Overview':
        // Create multi-series data for stacked area chart
        const financialData = this.createMultiSeriesData(sourceData);
        return financialData;
        
      case 'Performance Monitoring':
        // Use all data points for large-scale area chart
        const performanceData = sourceData.map(row => ({
          name: `${row.month}-${row.assetCategory}`,
          value: row.totalValue
        }));
        return performanceData;
        
      case 'Performance Metrics':
        // Create polar chart data from asset categories
        const polarData = this.createPolarData(sourceData);
        return polarData;
        
      case 'Financial Performance':
        // Create multi-series polar data
        const multiPolarData = this.createMultiSeriesPolarData(sourceData);
        return multiPolarData;
        
      case 'Business Metrics':
        // Create radar-style polar data
        const radarData = this.createRadarData(sourceData);
        return radarData;
        
      case 'Portfolio Allocation':
        // Create multi-series data for stacked area chart
        const portfolioAllocationData = this.createMultiSeriesData(sourceData);
        return portfolioAllocationData;
        
      case 'Market Conditions':
        // Create multi-series data for market trends
        const marketData = this.createMarketTrendData(sourceData);
        return marketData;
        
      case 'Portfolio Distribution':
        // Use stock ticks data with macro, industry, and sector hierarchy
        if (!this.stockTicksData) {
          console.warn('No stock ticks data available for Portfolio Distribution treemap');
          return [];
        }
        
        // Create hierarchical treemap data: macro -> industry -> sector with sum(totalTradedValue)
        const macroGroups = this.stockTicksData.reduce((acc, stock) => {
          const macro = stock.macro || 'Unknown Macro';
          const industry = stock.industry || 'Unknown Industry';
          const sector = stock.sector || 'Unknown Sector';
          const tradedValue = stock.totalTradedValue || 0;
          
          if (!acc[macro]) {
            acc[macro] = {};
          }
          if (!acc[macro][industry]) {
            acc[macro][industry] = {};
          }
          if (!acc[macro][industry][sector]) {
            acc[macro][industry][sector] = 0;
          }
          acc[macro][industry][sector] += tradedValue;
          return acc;
        }, {} as Record<string, Record<string, Record<string, number>>>);
        
        // Transform to treemap format
        return Object.entries(macroGroups).map(([macro, industries]) => {
          const industryChildren = Object.entries(industries).map(([industry, sectors]) => {
            const sectorChildren = Object.entries(sectors).map(([sector, value]) => ({
              name: sector,
              value: value
            }));
            
            const industryValue = sectorChildren.reduce((sum, child) => sum + child.value, 0);
            
            return {
              name: industry,
              value: industryValue,
              children: sectorChildren
            };
          });
          
          const macroValue = industryChildren.reduce((sum, child) => sum + child.value, 0);
          
          return {
            name: macro,
            value: macroValue,
            children: industryChildren
          };
        }).sort((a, b) => b.value - a.value);
        
      case 'Monthly Expenses':
        // Use TreemapChartBuilder's transformation method for expenses
        return TreemapChartBuilder.transformToTreemapData(sourceData, {
          valueField: 'totalValue',
          nameField: 'assetCategory',
          childrenField: 'month'
        });
        
      case 'Financial Overview Treemap':
        // Create large-scale treemap data
        const largeTreemapData = this.createLargeTreemapData(sourceData);
        return largeTreemapData;
        
      case 'Organizational Structure':
        // Create sunburst data from asset categories
        const sunburstData = this.createSunburstData(sourceData);
        return sunburstData;
        
      case 'Financial Overview Sunburst':
        // Create large-scale sunburst data
        const largeSunburstData = this.createLargeSunburstData(sourceData);
        return largeSunburstData;
        
      case 'Financial Flow':
      case 'Investment Flow':
      case 'Budget Allocation':
        // Use SankeyChartBuilder's transformation method
        return SankeyChartBuilder.transformToSankeyData(sourceData, {
          sourceField: 'assetCategory',
          targetField: 'market',
          valueField: 'totalValue',
          aggregateBy: 'sum'
        });
        
      case 'Test Filter Widget':
        // Group by assetCategory and sum totalValue (same as Asset Allocation)
        const testData = this.groupByAndSum(sourceData, 'assetCategory', 'totalValue');
        return testData;
        
      default:
        console.warn(`Unknown widget title: ${widgetTitle}`);
        return null;
    }
  }

  /**
   * Enhanced data update method using chart builder transformation methods
   */
  protected updateWidgetWithEnhancedData(widget: IWidget, sourceData: DashboardDataRow[]): void {
    const widgetTitle = widget.config?.header?.title;
    if (!widgetTitle) return;

    // Get transformed data using the new approach
    const transformedData = this.getFilteredDataForWidget(widgetTitle, sourceData);
    if (!transformedData) return;

    // Use enhanced update methods with retry mechanism
    // Check if this is an ECharts widget
    if (widget.config?.component !== 'echart') {
      this.updateEchartWidget(widget, transformedData);
      return;
    }

    const chartOptions = widget.config.options as any;
    const chartType = chartOptions?.series?.[0]?.type;
    
    switch (chartType) {
      case 'pie':
        PieChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        break;
      case 'line':
        if (chartOptions?.series?.[0]?.areaStyle) {
          // This is an area chart
          AreaChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        }
        break;
      case 'treemap':
        TreemapChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        break;
      case 'sankey':
        SankeyChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        break;
      default:
        // Fall back to the base update method
        this.updateEchartWidget(widget, transformedData);
        break;
    }
  }

  /**
   * Handle filter values change from dashboard container (required by BaseDashboardComponent)
   */
  override onFilterValuesChanged(filters: any[]): void {
    // Call the parent method to handle the base filtering logic
    super.onFilterValuesChanged(filters);
    
    // Apply enhanced filtering specific to this component
    this.applyEnhancedFilters(filters);
  }

  /**
   * Enhanced filtering method that applies filters and updates all widgets
   */
  protected applyEnhancedFilters(filters: any[]): void {
    if (!this.dashboardConfig?.widgets) return;

    // Apply filters to base data
    let filteredData = this.dashboardData;
    
    if (filters && filters.length > 0) {
      // Use the enhanced filtering from the base chart builder
      const dataFilters = filters.map(filter => ({
        property: filter.filterColumn || 'assetCategory',
        operator: 'equals' as const,
        value: filter.value
      }));
      
      filteredData = ApacheEchartBuilder.applyFilters(this.dashboardData, dataFilters);
    }

    // Update all chart widgets with filtered data
    const chartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    chartWidgets.forEach(widget => {
      this.updateWidgetWithEnhancedData(widget, filteredData);
    });

    // Update metric tiles
    this.updateMetricTilesWithFilters(filters);

    // Trigger change detection
    setTimeout(() => this.cdr.detectChanges(), 100);
  }

  // Helper methods specific to this component's data transformations

  /**
   * Helper method to create polar chart data
   */
  private createPolarData(data: DashboardDataRow[]): number[] {
    // Group by asset category and sum totalValue
    const groupedData = data.reduce((acc, row) => {
      if (!acc[row.assetCategory]) {
        acc[row.assetCategory] = 0;
      }
      acc[row.assetCategory] += row.totalValue;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.values(groupedData);
  }

  /**
   * Helper method to create multi-series polar data
   */
  private createMultiSeriesPolarData(data: DashboardDataRow[]): Array<{ name: string; data: number[] }> {
    // Create multiple series based on markets
    const markets = [...new Set(data.map(row => row.market))];
    const categories = [...new Set(data.map(row => row.assetCategory))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const dataByCategory = categories.map(category => {
        const categoryData = marketData.find(row => row.assetCategory === category);
        return categoryData ? categoryData.totalValue : 0;
      });
      
      return {
        name: market,
        data: dataByCategory
      };
    });
  }

  /**
   * Helper method to create radar data
   */
  private createRadarData(data: DashboardDataRow[]): number[] {
    // Create radar data from asset categories
    const categories = [...new Set(data.map(row => row.assetCategory))];
    return categories.map(category => {
      const categoryData = data.filter(row => row.assetCategory === category);
      return categoryData.reduce((sum, row) => sum + row.totalValue, 0);
    });
  }

  /**
   * Helper method to create market trend data
   */
  private createMarketTrendData(data: DashboardDataRow[]): Array<{ name: string; data: number[] }> {
    // Create market trend series
    const months = [...new Set(data.map(row => row.month))];
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const dataByMonth = months.map(month => {
        const monthData = marketData.find(row => row.month === month);
        return monthData ? monthData.totalValue : 0;
      });
      
      return {
        name: market,
        data: dataByMonth
      };
    });
  }

  /**
   * Helper method to create treemap data from stockTicksData with proper hierarchy
   */
  protected createStockTicksTreemapData(data: StockDataDto[] | null): Array<{
    name: string;
    value: number;
    children?: Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }>
  }> {
    if (!data || data.length === 0) {
      return [];
    }

    // Group by macro -> industry -> sector hierarchy
    const macroGroups = new Map<string, StockDataDto[]>();
    
    data.forEach(stock => {
      const macro = stock.macro || 'Other';
      if (!macroGroups.has(macro)) {
        macroGroups.set(macro, []);
      }
      macroGroups.get(macro)!.push(stock);
    });

    return Array.from(macroGroups.entries()).map(([macro, macroStocks]) => {
      // Group by industry within macro
      const industryGroups = new Map<string, StockDataDto[]>();
      
      macroStocks.forEach(stock => {
        const industry = stock.industry || 'Other';
        if (!industryGroups.has(industry)) {
          industryGroups.set(industry, []);
        }
        industryGroups.get(industry)!.push(stock);
      });

      const industryChildren = Array.from(industryGroups.entries()).map(([industry, industryStocks]) => {
        // Group by sector within industry
        const sectorGroups = new Map<string, StockDataDto[]>();
        
        industryStocks.forEach(stock => {
          const sector = stock.sector || 'Other';
          if (!sectorGroups.has(sector)) {
            sectorGroups.set(sector, []);
          }
          sectorGroups.get(sector)!.push(stock);
        });

        const sectorChildren = Array.from(sectorGroups.entries()).map(([sector, sectorStocks]) => {
          const sectorValue = sectorStocks.reduce((sum, stock) => sum + (stock.lastPrice || 0), 0);
          return {
            name: sector,
            value: sectorValue
          };
        });

        const industryValue = sectorChildren.reduce((sum, child) => sum + child.value, 0);
        
        return {
          name: industry,
          value: industryValue,
          children: sectorChildren
        };
      });

      const macroValue = industryChildren.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: macro,
        value: macroValue,
        children: industryChildren
      };
    });
  }

  /**
   * Helper method to create treemap data from dashboardData (legacy method)
   */
  protected createTreemapData(data: DashboardDataRow[]): Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }> {
    // Group by market and asset category
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const children = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const value = categoryData.reduce((sum, row) => sum + row.totalValue, 0);
        return { name: category, value };
      });
      
      const totalValue = children.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: market,
        value: totalValue,
        children
      };
    });
  }

  /**
   * Helper method to create expense treemap data
   */
  private createExpenseTreemapData(data: DashboardDataRow[]): Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }> {
    // Create expense categories from asset categories
    const categories = [...new Set(data.map(row => row.assetCategory))];
    
    return categories.map(category => {
      const categoryData = data.filter(row => row.assetCategory === category);
      const markets = [...new Set(categoryData.map(row => row.market))];
      
      const children = markets.map(market => {
        const marketData = categoryData.filter(row => row.market === market);
        const value = marketData.reduce((sum, row) => sum + row.totalValue, 0);
        return { name: market, value };
      });
      
      const totalValue = children.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: category,
        value: totalValue,
        children
      };
    });
  }

  /**
   * Helper method to create large treemap data
   */
  private createLargeTreemapData(data: DashboardDataRow[]): Array<{ name: string; value: number; children?: Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }> }> {
    // Create hierarchical data structure
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const categoryChildren = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const months = [...new Set(categoryData.map(row => row.month))];
        
        const monthChildren = months.map(month => {
          const monthData = categoryData.find(row => row.month === month);
          return { name: month, value: monthData ? monthData.totalValue : 0 };
        });
        
        const categoryValue = monthChildren.reduce((sum, child) => sum + child.value, 0);
        
        return {
          name: category,
          value: categoryValue,
          children: monthChildren
        };
      });
      
      const marketValue = categoryChildren.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: market,
        value: marketValue,
        children: categoryChildren
      };
    });
  }

  /**
   * Helper method to create sunburst data
   */
  protected createSunburstData(data: DashboardDataRow[]): Array<{ name: string; value?: number; children?: Array<{ name: string; value: number }> }> {
    // Create hierarchical sunburst data
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const children = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const value = categoryData.reduce((sum, row) => sum + row.totalValue, 0);
        return { name: category, value };
      });
      
      return {
        name: market,
        children
      };
    });
  }

  /**
   * Helper method to create large sunburst data
   */
  private createLargeSunburstData(data: DashboardDataRow[]): Array<{ name: string; value?: number; children?: Array<{ name: string; value?: number; children?: Array<{ name: string; value: number }> }> }> {
    // Create more detailed hierarchical sunburst data
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const categoryChildren = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const months = [...new Set(categoryData.map(row => row.month))];
        
        const monthChildren = months.map(month => {
          const monthData = categoryData.find(row => row.month === month);
          return { name: month, value: monthData ? monthData.totalValue : 0 };
        });
        
        return {
          name: category,
          children: monthChildren
        };
      });
      
      return {
        name: market,
        children: categoryChildren
      };
    });
  }

  /**
   * Filter charts by industry (called when bar chart is clicked)
   */
  private filterChartsByIndustry(industry: string): void {
    if (!this.stockTicksData) return;

    // Filter stock data by industry
    this.filteredStockData = this.stockTicksData.filter(stock => stock.industry === industry);
    
    // Update the pie chart with filtered data
    this.updatePieChartWithFilteredData();
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Filter charts by sector (called when pie chart is clicked)
   */
  private filterChartsBySector(sector: string): void {
    if (!this.stockTicksData) return;

    // Filter stock data by sector
    this.filteredStockData = this.stockTicksData.filter(stock => stock.sector === sector);
    
    // Update the bar chart with filtered data
    this.updateBarChartWithFilteredData();
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Clear all filters and restore original data
   */
  private clearAllChartFilters(): void {
    // Restore original data
    this.filteredStockData = this.stockTicksData;
    
    // Update both charts with original data
    this.updateBarChartWithFilteredData();
    this.updatePieChartWithFilteredData();
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Update pie chart with filtered data
   */
  private updatePieChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredStockData) return;

    const pieWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Sector Allocation'
    );

    if (pieWidget) {
      // Transform filtered data for pie chart (group by sector)
      const sectorData = this.filteredStockData.reduce((acc, stock) => {
        const sector = stock.sector || 'Unknown';
        if (!acc[sector]) {
          acc[sector] = 0;
        }
        acc[sector] += stock.totalTradedValue || 0;
        return acc;
      }, {} as Record<string, number>);

      const pieData = Object.entries(sectorData).map(([name, value]) => ({ name, value }));
      
      // Update the widget with new data
      this.updateEchartWidget(pieWidget, pieData);
    }
  }

  /**
   * Update bar chart with filtered data
   */
  private updateBarChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredStockData) return;

    const barWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Industry'
    );

    if (barWidget) {
      // Transform filtered data for bar chart (group by industry)
      const industryData = this.filteredStockData.reduce((acc, stock) => {
        const industry = stock.industry || 'Unknown';
        if (!acc[industry]) {
          acc[industry] = 0;
        }
        acc[industry] += stock.totalTradedValue || 0;
        return acc;
      }, {} as Record<string, number>);

      const barData = Object.entries(industryData).map(([name, value]) => ({ name, value }));
      
      // Update the widget with new data
      this.updateEchartWidget(barWidget, barData);
    }
  }
}