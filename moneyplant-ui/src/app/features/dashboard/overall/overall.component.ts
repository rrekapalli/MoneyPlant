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
  FilterService
} from '@dashboards/public-api';

// Import widget creation functions
import {
  createAssetAllocationWidget,
  createMonthlyIncomeExpensesWidget,
  createPortfolioPerformanceWidget,
  createRiskReturnWidget,
  createSavingsGoalWidget,
  createSpendingHeatmapWidget,
  createInvestmentDistributionWidget,
  createAreaChartWidget,
  createPolarChartWidget,
  createNewStackedAreaChartWidget,
  createPerformanceStackedAreaChartWidget,
  createMarketTrendStackedAreaChartWidget,
  createTreemapChartWidget,
  createExpenseTreemapWidget,
  createLargeScaleTreemapWidget,
  createSunburstChartWidget,
  createOrganizationalSunburstWidget,
  createLargeScaleSunburstWidget,
  createSankeyChartWidget,
  createInvestmentFlowSankeyWidget,
  createBudgetAllocationSankeyWidget,
  createMinimalSankeyChartWidget,
  createCandlestickChartWidget,
  createAdvancedCandlestickChartWidget,
  createFilterWidget,
  createMetricTiles,
  // Dashboard data
  INITIAL_DASHBOARD_DATA
} from './widgets';

// Import test filter widget directly
import { createTestFilterWidget } from './widgets/test-filter-widget';

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
   * Initialize dashboard config using the Fluent API
   */
  protected initializeDashboardConfig(): void {
    // Create widgets using the new widget functions
    const pieAssetAllocation = createAssetAllocationWidget();
    const barMonthlyIncomeVsExpenses = createMonthlyIncomeExpensesWidget();
    const linePortfolioPerformance = createPortfolioPerformanceWidget();
    const scatterRiskVsReturn = createRiskReturnWidget();
    const gaugeSavingsGoal = createSavingsGoalWidget();
    const heatmapSpending = createSpendingHeatmapWidget();
    const densityMapInvestment = createInvestmentDistributionWidget();
    const areaChart = createAreaChartWidget();
    const polarChart = createPolarChartWidget();
    const stackedAreaChart = createNewStackedAreaChartWidget();
    const performanceStackedAreaChart = createPerformanceStackedAreaChartWidget();
    const marketTrendStackedAreaChart = createMarketTrendStackedAreaChartWidget();
    const treemapChart = createTreemapChartWidget();
    const expenseTreemap = createExpenseTreemapWidget();
    const largeScaleTreemap = createLargeScaleTreemapWidget();
    const sunburstChart = createSunburstChartWidget();
    const organizationalSunburst = createOrganizationalSunburstWidget();
    const largeScaleSunburst = createLargeScaleSunburstWidget();
    const sankeyChart = createSankeyChartWidget();
    const investmentFlowSankey = createInvestmentFlowSankeyWidget();
    const budgetAllocationSankey = createBudgetAllocationSankeyWidget();
    const minimalSankeyTest = createMinimalSankeyChartWidget();
    const candlestickChart = createCandlestickChartWidget();
    const advancedCandlestickChart = createAdvancedCandlestickChartWidget();
    const filterWidget = createFilterWidget();
    const testFilterWidget = createTestFilterWidget();
    const metricTiles = createMetricTiles(INITIAL_DASHBOARD_DATA);

    // Position metric tiles at row 0 (top of dashboard)
    // Metric tiles are already positioned at y: 0 in the createMetricTiles function

    // Position filter widget at row 1 (below metric tiles)
    filterWidget.position = { x: 0, y: 2, cols: 12, rows: 1 };

    // Position other widgets starting from row 2 (below filter)
    densityMapInvestment.position = { x: 0, y: 3, cols: 8, rows: 8 };
    pieAssetAllocation.position = { x: 9, y: 11, cols: 4, rows: 8 };
    polarChart.position = { x: 9, y: 15, cols: 4, rows: 8 };
    barMonthlyIncomeVsExpenses.position = { x: 0, y: 13, cols: 8, rows: 8 };

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
        // Other widgets starting from row 2
        densityMapInvestment,
        pieAssetAllocation,
        polarChart,
        barMonthlyIncomeVsExpenses,
        candlestickChart,
        advancedCandlestickChart,
        testFilterWidget  // Enable test filter widget to demo highlighting
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
        console.log(`Detected density map widget (map: ${mapType}), providing investment distribution data`);
        return this.groupByAndSum(this.dashboardData, 'market', 'totalValue');
        
      case 'pie':
        // This is a pie chart - provide asset allocation data
        console.log('Detected pie chart widget, providing asset allocation data');
        return this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
        
      case 'bar':
        // This is a bar chart - provide monthly data
        console.log('Detected bar chart widget, providing monthly data');
        return this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        
      case 'line':
        // This is a line chart - provide portfolio performance data
        console.log('Detected line chart widget, providing portfolio performance data');
        return this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        
      case 'scatter':
        // This is a scatter chart - provide risk vs return data
        console.log('Detected scatter chart widget, providing risk vs return data');
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
        console.log('Detected heatmap widget, providing heatmap data');
        return this.createHeatmapData(this.dashboardData);
        
      case 'gauge':
        // This is a gauge chart - provide simple numeric data
        console.log('Detected gauge widget, providing gauge data');
        const totalValue = this.dashboardData.reduce((sum, row) => sum + row.totalValue, 0);
        return [{ name: 'Progress', value: Math.min(totalValue / 10, 100) }]; // Scale to percentage
        
      case 'treemap':
        // This is a treemap - provide treemap data
        console.log('Detected treemap widget, providing treemap data');
        return this.createTreemapData(this.dashboardData);
        
      case 'sunburst':
        // This is a sunburst chart - provide sunburst data
        console.log('Detected sunburst widget, providing sunburst data');
        return this.createSunburstData(this.dashboardData);
        
      case 'sankey':
        // This is a sankey diagram - provide default sankey data
        console.log('Detected sankey widget, providing default sankey data');
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
   * Get filtered data for a specific widget based on its requirements
   * This method handles the specific data transformation for each widget type
   */
  protected getFilteredDataForWidget(widgetTitle: string, data?: DashboardDataRow[]): any {
    const sourceData = data || this.dashboardData;

    switch (widgetTitle) {
      case 'Asset Allocation':
        // Group by assetCategory and sum totalValue (for current month or all data)
        const assetData = this.groupByAndSum(sourceData, 'assetCategory', 'totalValue');
        return assetData;
        
      case 'Monthly Income vs Expenses':
        // Group by month and sum totalValue (for all asset categories)
        const monthlyData = this.groupByAndSum(sourceData, 'month', 'totalValue');
        return monthlyData;
        
      case 'Portfolio Performance':
        // Group by month and sum totalValue (for all asset categories)
        const portfolioData = this.groupByAndSum(sourceData, 'month', 'totalValue');
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
        const riskReturnResult = Object.values(groupedRiskReturn);
        return riskReturnResult;
        
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
        // Create treemap data from asset categories and markets
        const treemapData = this.createTreemapData(sourceData);
        return treemapData;
        
      case 'Monthly Expenses':
        // Create alternative treemap data
        const expenseTreemapData = this.createExpenseTreemapData(sourceData);
        return expenseTreemapData;
        
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
        
      case 'Test Filter Widget':
        // Group by assetCategory and sum totalValue (same as Asset Allocation)
        const testData = this.groupByAndSum(sourceData, 'assetCategory', 'totalValue');
        return testData;
        
      default:
        console.warn(`Unknown widget title: ${widgetTitle}`);
        return null;
    }
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
   * Helper method to create treemap data
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
}