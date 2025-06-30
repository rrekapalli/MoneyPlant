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
      .build();

    // Risk vs Return Scatter Chart
    const scatterRiskVsReturn = ScatterChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Risk vs Return Analysis')
      .setPosition({ x: 0, y: 11, cols: 6, rows: 8 })
      .setTooltip('item', '{b}: Risk {c[0]}%, Return {c[1]}%')
      .setPredefinedPalette('modern')
      .build();

    // Investment Distribution Map (using density map builder)
    const densityMapInvestment = DensityMapBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Investment Distribution by Region')
      .setPosition({ x: 6, y: 11, cols: 6, rows: 8 })
      .setCurrencyFormatter('USD', 'en-US')
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

    // Update each widget using dedicated functions
    this.updateAssetAllocationWidget();
    this.updateMonthlyIncomeExpensesWidget();
    this.updateRiskReturnAnalysisWidget();
    this.updateInvestmentDistributionWidget();

    // Populate metric tiles with initial data
    this.updateMetricTilesWithFilters([]);

    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Update Asset Allocation Pie Chart Widget
   */
  private async updateAssetAllocationWidget(filters?: any[]): Promise<void> {
    try {
      // Simulate API call for asset allocation data
      const data = await this.getAssetAllocationData(filters);
      
      const widget = this.findWidgetByTitle('Asset Allocation');
      if (widget && data) {
        PieChartBuilder.updateData(widget, data);
      }
    } catch (error) {
      console.error('Error updating Asset Allocation widget:', error);
    }
  }

  /**
   * Update Monthly Income vs Expenses Bar Chart Widget
   */
  private async updateMonthlyIncomeExpensesWidget(filters?: any[]): Promise<void> {
    try {
      // Simulate API call for monthly income vs expenses data
      const data = await this.getMonthlyIncomeExpensesData(filters);
      
      const widget = this.findWidgetByTitle('Monthly Income vs Expenses');
      if (widget && data) {
        BarChartBuilder.updateData(widget, data);
      }
    } catch (error) {
      console.error('Error updating Monthly Income vs Expenses widget:', error);
    }
  }

  /**
   * Update Risk vs Return Analysis Scatter Chart Widget
   */
  private async updateRiskReturnAnalysisWidget(filters?: any[]): Promise<void> {
    try {
      // Simulate API call for risk vs return analysis data
      const data = await this.getRiskReturnAnalysisData(filters);
      
      const widget = this.findWidgetByTitle('Risk vs Return Analysis');
      if (widget && data) {
        ScatterChartBuilder.updateData(widget, data);
      }
    } catch (error) {
      console.error('Error updating Risk vs Return Analysis widget:', error);
    }
  }

  /**
   * Update Investment Distribution Map Widget
   */
  private async updateInvestmentDistributionWidget(filters?: any[]): Promise<void> {
    try {
      // Simulate API call for investment distribution data
      const data = await this.getInvestmentDistributionData(filters);
      
      const widget = this.findWidgetByTitle('Investment Distribution by Region');
      if (widget && data) {
        DensityMapBuilder.updateData(widget, data);
      }
    } catch (error) {
      console.error('Error updating Investment Distribution widget:', error);
    }
  }

  /**
   * API call simulation for Asset Allocation data
   */
  private async getAssetAllocationData(filters?: any[]): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Apply filters to base data
    let sourceData = this.applyFiltersToData(this.dashboardData, filters);
    
    // Aggregate data by asset category
    const aggregatedData = sourceData.reduce((acc, row) => {
      const category = row.assetCategory;
      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }
      acc[category].value += row.totalValue;
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by value
    return Object.values(aggregatedData).sort((a: any, b: any) => b.value - a.value);
  }

  /**
   * API call simulation for Monthly Income vs Expenses data
   */
  private async getMonthlyIncomeExpensesData(filters?: any[]): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Apply filters to base data
    let sourceData = this.applyFiltersToData(this.dashboardData, filters);
    
    // Aggregate data by month
    const aggregatedData = sourceData.reduce((acc, row) => {
      const month = row.month;
      if (!acc[month]) {
        acc[month] = { name: month, value: 0 };
      }
      acc[month].value += row.totalValue;
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by month order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.values(aggregatedData).sort((a: any, b: any) => {
      return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
    });
  }

  /**
   * API call simulation for Risk vs Return Analysis data
   */
  private async getRiskReturnAnalysisData(filters?: any[]): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Apply filters to base data
    let sourceData = this.applyFiltersToData(this.dashboardData, filters);
    
    // Filter and aggregate data with risk and return values
    const riskReturnData = sourceData.filter(row => 
      row.riskValue !== undefined && row.returnValue !== undefined
    );
    
    // Group by asset category and calculate average risk/return
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
    
    // Calculate averages and format for scatter chart
    return Object.values(aggregatedData).map((item: any) => ({
      name: item.name,
      value: [
        Math.round((item.riskSum / item.count) * 100) / 100,
        Math.round((item.returnSum / item.count) * 100) / 100
      ]
    }));
  }

  /**
   * API call simulation for Investment Distribution data
   */
  private async getInvestmentDistributionData(filters?: any[]): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Apply filters to base data
    let sourceData = this.applyFiltersToData(this.dashboardData, filters);
    
    // Aggregate data by market/region
    const aggregatedData = sourceData.reduce((acc, row) => {
      const market = row.market;
      if (!acc[market]) {
        acc[market] = { name: market, value: 0 };
      }
      acc[market].value += row.totalValue;
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by value
    return Object.values(aggregatedData).sort((a: any, b: any) => b.value - a.value);
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
   * Get data for widget based on chart type detection (simplified)
   */
  protected override getDataByChartType(widget: IWidget): any {
    const widgetTitle = widget.config?.header?.title;
    
    if (widgetTitle) {
      // Use the widget title to determine data type
      return this.getFilteredDataForWidget(widgetTitle);
    }
    
    // Fallback: detect by chart type for widgets without titles
    const chartOptions = widget.config?.options as any;
    const seriesType = chartOptions?.series?.[0]?.type;
    
    switch (seriesType) {
      case 'map':
        return this.groupByAndSum(this.dashboardData, 'market', 'totalValue');
      case 'pie':
        return this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
      case 'bar':
        return this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
      case 'scatter':
        const riskReturnData = this.dashboardData.filter(row => 
          row.riskValue !== undefined && row.returnValue !== undefined
        );
        return riskReturnData.map(row => ({
          name: row.assetCategory,
          value: [row.riskValue!, row.returnValue!]
        }));
      default:
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
        
      case 'Monthly Income vs Expenses':
        // Group by month and sum totalValue (for all asset categories)
        const monthlyData = this.groupByAndSum(sourceData, 'month', 'totalValue');
        return monthlyData;
        
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
        
      default:
        console.warn(`Unknown widget title: ${widgetTitle}`);
        return null;
    }
  }

  /**
   * Enhanced data update method using dedicated widget functions
   */
  protected updateWidgetWithEnhancedData(widget: IWidget, sourceData: DashboardDataRow[]): void {
    // This method is now deprecated in favor of dedicated widget update functions
    // Keep for backward compatibility but log a warning
    console.warn('updateWidgetWithEnhancedData is deprecated. Use dedicated widget update functions instead.');
    
    const widgetTitle = widget.config?.header?.title;
    if (!widgetTitle) return;

    // Get transformed data using the legacy approach
    const transformedData = this.getFilteredDataForWidget(widgetTitle, sourceData);
    if (!transformedData) return;

    // Fall back to the base update method
    this.updateEchartWidget(widget, transformedData);
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

  /**
   * Helper method to create treemap data (required by base class)
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
   * Helper method to create sunburst data (required by base class)
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
}