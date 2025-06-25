import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
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
  SankeyChart
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
  PolarComponent
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
  // Fluent API
  StandardDashboardBuilder,
  DashboardConfig,
  // PDF Export Service
  PdfExportService,
  PdfExportOptions,
  // Excel Export Service
  ExcelExportService,
  ExcelExportOptions,
  IFilterValues
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
  createFilterWidget,
  // Dashboard data
  DashboardDataRow,
  INITIAL_DASHBOARD_DATA
} from './widgets';

// Import test filter widget directly
import { createTestFilterWidget } from './widgets/test-filter-widget';

// Filter service
import { FilterService } from '@dashboards/public-api';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overall',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule,
    MessageModule,
    ScrollPanelModule,
    // Dashboard components
    DashboardContainerComponent
  ],
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverallComponent implements OnInit, OnDestroy {
  // Dashboard config (Fluent API)
  dashboardConfig!: DashboardConfig;
  
  // PDF export loading state
  isExportingPdf = false;
  
  // Excel export loading state
  isExportingExcel = false;

  // Flag to prevent recursive filter updates
  private isUpdatingFilters = false;

  // Debounce mechanism for widget updates
  private widgetUpdateTimeout?: any;
  private filterSubscription?: Subscription;

  // Reference to dashboard container for PDF export
  @ViewChild('dashboardContainer', { static: false }) dashboardContainer!: ElementRef<HTMLElement>;

  // Reference to dashboard container component
  @ViewChild(DashboardContainerComponent, { static: false }) dashboardContainerComponent!: DashboardContainerComponent;

  // Shared dashboard data - Flat structure
  private dashboardData: DashboardDataRow[] = [...INITIAL_DASHBOARD_DATA];

  constructor(
    private cdr: ChangeDetectorRef,
    private pdfExportService: PdfExportService,
    private excelExportService: ExcelExportService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.initializeDashboardConfig();
    
    // Subscribe to filter service changes
    this.filterSubscription = this.filterService.filterValues$.subscribe(filters => {
      this.updateWidgetsWithFilters(filters);
    });

    // Register world map for density map charts
    import('echarts-map-collection/custom/world.json').then((worldMapData) => {
      DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
    }).catch((error) => {
      // Handle world map loading error silently
    });
  }

  /**
   * Handle filter values change from dashboard container
   */
  onFilterValuesChanged(filters: IFilterValues[]): void {
    if (this.isUpdatingFilters) {
      return;
    }

    this.isUpdatingFilters = true;
    
    // Set filter values in the service
    this.filterService.setFilterValues(filters);
    
    this.isUpdatingFilters = false;
  }

  /**
   * Update all widgets with current filters
   */
  private updateWidgetsWithFilters(filters?: IFilterValues[]): void {
    if (this.isUpdatingFilters) {
      return;
    }

    const currentFilters = filters || this.filterService.getFilterValues();
    
    // Apply filters to the shared dashboard data
    this.applyFiltersToDashboardData(currentFilters);
    
    // Find all echart widgets
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      this.updateWidgetWithFilters(widget, currentFilters);
    });

    // Trigger change detection with a delay to ensure all updates are complete
    setTimeout(() => {
      this.cdr.detectChanges();
      
      // Force another change detection after a short delay to catch any delayed updates
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    }, 50);
  }

  /**
   * Apply filters to the shared dashboard data
   */
  private applyFiltersToDashboardData(filters: IFilterValues[]): void {
    if (filters.length === 0) {
      // Reset to initial data if no filters
      this.dashboardData = [...INITIAL_DASHBOARD_DATA];
      return;
    }

    // Apply filters to the flat dataset using custom logic for our data structure
    this.dashboardData = this.applyFiltersToFlatData(INITIAL_DASHBOARD_DATA, filters);
  }

  /**
   * Apply filters to flat data structure
   */
  private applyFiltersToFlatData(data: DashboardDataRow[], filters: IFilterValues[]): DashboardDataRow[] {
    if (!filters || filters.length === 0) {
      return data;
    }

    return data.filter(row => {
      return filters.every(filter => {
        return this.matchesFlatDataFilter(row, filter);
      });
    });
  }

  /**
   * Check if a flat data row matches a filter
   */
  private matchesFlatDataFilter(row: DashboardDataRow, filter: IFilterValues): boolean {
    // Handle different filter types
    switch (filter.accessor) {
      case 'category':
        // Filter by assetCategory
        return row.assetCategory === filter['category'] || 
               row.assetCategory === filter['value'];
        
      case 'month':
        // Filter by month
        return row.month === filter['month'] || 
               row.month === filter['value'];
        
      case 'market':
        // Filter by market
        return row.market === filter['market'] || 
               row.market === filter['value'];
        
      case 'assetCategory':
        // Direct assetCategory filter
        return row.assetCategory === filter['assetCategory'] || 
               row.assetCategory === filter['value'];
        
      default:
        // Try to match by any property
        const filterValue = filter['value'] || filter[filter.accessor];
        return row.assetCategory === filterValue || 
               row.month === filterValue || 
               row.market === filterValue;
    }
  }

  /**
   * Get filtered data for a specific widget based on its requirements
   */
  private getFilteredDataForWidget(widgetTitle: string): any {
    console.log(`Getting filtered data for widget: ${widgetTitle}`);
    console.log('Available dashboard data rows:', this.dashboardData.length);
    
    switch (widgetTitle) {
      case 'Asset Allocation':
        // Group by assetCategory and sum totalValue (for current month or all data)
        const assetData = this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
        console.log('Asset Allocation data:', assetData);
        return assetData;
        
      case 'Monthly Income vs Expenses':
        // Group by month and sum totalValue (for all asset categories)
        const monthlyData = this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        console.log('Monthly Income vs Expenses data:', monthlyData);
        return monthlyData;
        
      case 'Portfolio Performance':
        // Group by month and sum totalValue (for all asset categories)
        const portfolioData = this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        console.log('Portfolio Performance data:', portfolioData);
        return portfolioData;
        
      case 'Risk vs Return Analysis':
        // Filter rows that have both risk and return values, group by assetCategory
        const riskReturnData = this.dashboardData.filter(row => row.riskValue !== undefined && row.returnValue !== undefined);
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
        console.log('Risk vs Return data:', riskReturnResult);
        return riskReturnResult;
        
      case 'Investment Distribution by Region':
        // Group by market (country) and sum totalValue for map visualization
        const investmentData = this.groupByAndSum(this.dashboardData, 'market', 'totalValue');
        console.log('Investment Distribution data:', investmentData);
        return investmentData;
        
      case 'Weekly Spending Heatmap':
        // Create heatmap data from the dashboard data
        // Group by month and assetCategory to create a heatmap
        const heatmapData = this.createHeatmapData(this.dashboardData);
        console.log('Weekly Spending Heatmap data:', heatmapData);
        return heatmapData;
        
      case 'Revenue Trend':
        // Group by month and sum totalValue for area chart
        const revenueData = this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        console.log('Revenue Trend data:', revenueData);
        return revenueData;
        
      case 'Financial Overview':
        // Create multi-series data for stacked area chart
        const financialData = this.createMultiSeriesData(this.dashboardData);
        console.log('Financial Overview data:', financialData);
        return financialData;
        
      case 'Performance Monitoring':
        // Use all data points for large-scale area chart
        const performanceData = this.dashboardData.map(row => ({
          name: `${row.month}-${row.assetCategory}`,
          value: row.totalValue
        }));
        console.log('Performance Monitoring data:', performanceData);
        return performanceData;
        
      case 'Performance Metrics':
        // Create polar chart data from asset categories
        const polarData = this.createPolarData(this.dashboardData);
        console.log('Performance Metrics data:', polarData);
        return polarData;
        
      case 'Financial Performance':
        // Create multi-series polar data
        const multiPolarData = this.createMultiSeriesPolarData(this.dashboardData);
        console.log('Financial Performance data:', multiPolarData);
        return multiPolarData;
        
      case 'Business Metrics':
        // Create radar-style polar data
        const radarData = this.createRadarData(this.dashboardData);
        console.log('Business Metrics data:', radarData);
        return radarData;
        
      case 'Portfolio Allocation':
        // Create multi-series data for stacked area chart
        const portfolioAllocationData = this.createMultiSeriesData(this.dashboardData);
        console.log('Portfolio Allocation data:', portfolioAllocationData);
        return portfolioAllocationData;
        
      case 'Market Conditions':
        // Create multi-series data for market trends
        const marketData = this.createMarketTrendData(this.dashboardData);
        console.log('Market Conditions data:', marketData);
        return marketData;
        
      case 'Portfolio Distribution':
        // Create treemap data from asset categories and markets
        const treemapData = this.createTreemapData(this.dashboardData);
        console.log('Portfolio Distribution data:', treemapData);
        return treemapData;
        
      case 'Monthly Expenses':
        // Create alternative treemap data
        const expenseTreemapData = this.createExpenseTreemapData(this.dashboardData);
        console.log('Monthly Expenses data:', expenseTreemapData);
        return expenseTreemapData;
        
      case 'Financial Overview Treemap':
        // Create large-scale treemap data
        const largeTreemapData = this.createLargeTreemapData(this.dashboardData);
        console.log('Financial Overview Treemap data:', largeTreemapData);
        return largeTreemapData;
        
      case 'Organizational Structure':
        // Create sunburst data from asset categories
        const sunburstData = this.createSunburstData(this.dashboardData);
        console.log('Organizational Structure data:', sunburstData);
        return sunburstData;
        
      case 'Financial Overview Sunburst':
        // Create large-scale sunburst data
        const largeSunburstData = this.createLargeSunburstData(this.dashboardData);
        console.log('Financial Overview Sunburst data:', largeSunburstData);
        return largeSunburstData;
        
      case 'Test Filter Widget':
        // Group by assetCategory and sum totalValue (same as Asset Allocation)
        const testData = this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
        console.log('Test Filter Widget data:', testData);
        return testData;
        
      default:
        console.warn(`Unknown widget title: ${widgetTitle}`);
        return null;
    }
  }

  /**
   * Helper method to group data by a field and sum another field
   */
  private groupByAndSum(data: DashboardDataRow[], groupBy: string, sumField: string): Array<{ name: string; value: number }> {
    const grouped = data.reduce((acc, row) => {
      const key = (row as any)[groupBy];
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += (row as any)[sumField];
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }

  /**
   * Helper method to create heatmap data from dashboard data
   */
  private createHeatmapData(data: DashboardDataRow[]): Array<{ value: [number, number, number]; name: string }> {
    // Get unique months and asset categories
    const months = [...new Set(data.map(row => row.month))];
    const categories = [...new Set(data.map(row => row.assetCategory))];
    
    // Create month to index mapping
    const monthIndexMap = months.reduce((acc, month, index) => {
      acc[month] = index;
      return acc;
    }, {} as Record<string, number>);
    
    // Create category to index mapping
    const categoryIndexMap = categories.reduce((acc, category, index) => {
      acc[category] = index;
      return acc;
    }, {} as Record<string, number>);
    
    // Group data by month and category
    const groupedData = data.reduce((acc, row) => {
      const key = `${row.month}-${row.assetCategory}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += row.totalValue;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to heatmap format
    const heatmapData: Array<{ value: [number, number, number]; name: string }> = [];
    
    Object.entries(groupedData).forEach(([key, value]) => {
      const [month, category] = key.split('-');
      const xIndex = monthIndexMap[month];
      const yIndex = categoryIndexMap[category];
      
      if (xIndex !== undefined && yIndex !== undefined) {
        heatmapData.push({
          value: [xIndex, yIndex, value],
          name: key
        });
      }
    });
    
    return heatmapData;
  }

  /**
   * Helper method to create multi-series data for stacked area charts
   */
  private createMultiSeriesData(data: DashboardDataRow[]): Array<{ name: string; data: number[] }> {
    // Group by asset category and month
    const categories = [...new Set(data.map(row => row.assetCategory))];
    const months = [...new Set(data.map(row => row.month))];
    
    return categories.map(category => {
      const categoryData = data.filter(row => row.assetCategory === category);
      const dataByMonth = months.map(month => {
        const monthData = categoryData.find(row => row.month === month);
        return monthData ? monthData.totalValue : 0;
      });
      
      return {
        name: category,
        data: dataByMonth
      };
    });
  }

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
  private createTreemapData(data: DashboardDataRow[]): Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }> {
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
  private createSunburstData(data: DashboardDataRow[]): Array<{ name: string; value?: number; children?: Array<{ name: string; value: number }> }> {
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
   * Update a specific widget with filtered data
   */
  private updateWidgetWithFilters(widget: IWidget, filters: IFilterValues[]): void {
    if (!widget.config || !widget.config.component) {
      return;
    }

    const widgetTitle = widget.config?.header?.title;
    if (!widgetTitle) {
      console.warn(`Widget ${widget.id} has no title defined`);
      return;
    }

    // Get filtered data for this specific widget
    const filteredData = this.getFilteredDataForWidget(widgetTitle);
    
    if (!filteredData) {
      console.warn(`No filtered data available for widget: ${widgetTitle}`);
      return;
    }

    // Update widget data based on component type
    if (widget.config.component === 'echart') {
      this.updateEchartWidget(widget, filteredData);
    }
  }

  /**
   * Update echart widget with filtered data
   */
  private updateEchartWidget(widget: IWidget, filteredData: any): void {
    if (!widget.config?.options) {
      return;
    }

    const widgetTitle = widget.config?.header?.title;

    // Create a new options object to trigger change detection
    const newOptions = { ...widget.config.options } as any;

    // Update series data based on widget type
    if (newOptions.series && newOptions.series.length > 0) {
      const series = newOptions.series[0];
      
      if (widgetTitle === 'Risk vs Return Analysis') {
        // Scatter plot - update data points
        series.data = filteredData;
      } else {
        // Bar/Pie/Line charts - update data
        series.data = filteredData;
        
        // Update xAxis categories for bar/line charts if needed
        if (newOptions.xAxis && newOptions.xAxis[0] && newOptions.xAxis[0].data) {
          newOptions.xAxis[0].data = filteredData.map((item: any) => item.name);
        }
      }
    }

    // Update widget config with new options
    widget.config.options = newOptions;

    // Schedule widget update with retry mechanism
    this.scheduleWidgetUpdate(widget);
  }

  /**
   * Schedule widget update with retry mechanism
   */
  private scheduleWidgetUpdate(widget: IWidget): void {
    // Clear any existing timeout
    if (this.widgetUpdateTimeout) {
      clearTimeout(this.widgetUpdateTimeout);
    }

    // Schedule update with retry logic
    this.widgetUpdateTimeout = setTimeout(() => {
      this.retryWidgetUpdate(widget, 0);
    }, 50);
  }

  /**
   * Retry widget update with exponential backoff
   */
  private retryWidgetUpdate(widget: IWidget, attempt: number): void {
    const maxAttempts = 5;
    const baseDelay = 100;
    const widgetTitle = widget.config?.header?.title || widget.id;

    if (attempt >= maxAttempts) {
      console.warn(`Failed to update widget after ${maxAttempts} attempts:`, widgetTitle);
      return;
    }

    // Try to update the widget
    try {
      // Force change detection
      this.cdr.detectChanges();
      
      // Schedule another change detection after a short delay
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
      
    } catch (error) {
      console.warn(`Widget update attempt ${attempt + 1} failed:`, error);
      
      // Retry with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      setTimeout(() => {
        this.retryWidgetUpdate(widget, attempt + 1);
      }, delay);
    }
  }

  /**
   * Initialize dashboard config using the Fluent API
   */
  private initializeDashboardConfig(): void {
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
    const filterWidget = createFilterWidget();
    const testFilterWidget = createTestFilterWidget();

    // Adjust positions of all widgets to move them down by 1 row to accommodate the filter widget
    const widgetsToAdjust = [
      pieAssetAllocation,
      barMonthlyIncomeVsExpenses,
      linePortfolioPerformance,
      scatterRiskVsReturn,
      gaugeSavingsGoal,
      heatmapSpending,
      densityMapInvestment,
      areaChart,
      polarChart,
      stackedAreaChart,
      performanceStackedAreaChart,
      marketTrendStackedAreaChart,
      treemapChart,
      expenseTreemap,
      largeScaleTreemap,
      sunburstChart,
      organizationalSunburst,
      largeScaleSunburst,
      sankeyChart,
      investmentFlowSankey,
      budgetAllocationSankey,
      minimalSankeyTest,
      testFilterWidget
    ];

    // Move all widgets down by 1 row
    widgetsToAdjust.forEach(widget => {
      if (widget.position) {
        widget.position.y += 1;
      }
    });

    // Use the Fluent API to build the dashboard config
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('overall-dashboard')
      .setWidgets([
        filterWidget, // Filter widget at the top
        pieAssetAllocation,
        barMonthlyIncomeVsExpenses,
        linePortfolioPerformance,
        scatterRiskVsReturn,
        gaugeSavingsGoal,
        heatmapSpending,
        densityMapInvestment,
        areaChart,
        polarChart,
        stackedAreaChart,
        performanceStackedAreaChart,
        marketTrendStackedAreaChart,
        treemapChart,
        expenseTreemap,
        largeScaleTreemap,
        sunburstChart,
        organizationalSunburst,
        largeScaleSunburst,
        sankeyChart,
        investmentFlowSankey,
        budgetAllocationSankey,
        minimalSankeyTest,
        testFilterWidget
      ])
      .setEditMode(false)
      .build();

    // Populate widgets with initial data
    this.populateWidgetsWithInitialData();
  }

  /**
   * Populate all widgets with initial data from the shared dataset
   */
  private populateWidgetsWithInitialData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    console.log('=== Populating Widgets with Initial Data ===');
    console.log('Total dashboard data rows:', this.dashboardData.length);
    console.log('Sample dashboard data:', this.dashboardData.slice(0, 3));

    // Find all echart widgets and populate them with initial data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    console.log('Found echart widgets:', echartWidgets.length);

    echartWidgets.forEach(widget => {
      const widgetTitle = widget.config?.header?.title;
      
      if (!widgetTitle) {
        console.warn(`Widget ${widget.id} has no title defined`);
        return;
      }
      
      const initialData = this.getFilteredDataForWidget(widgetTitle);
      
      console.log(`Widget: ${widgetTitle}`);
      console.log('Initial data:', initialData);
      
      if (initialData) {
        this.updateEchartWidget(widget, initialData);
      } else {
        console.warn(`No initial data found for widget: ${widgetTitle}`);
      }
    });

    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('Change detection triggered');
    }, 100);
  }

  /**
   * Export dashboard to PDF
   */
  public async exportDashboardToPdf(): Promise<void> {
    if (!this.dashboardContainer) {
      return;
    }

    this.isExportingPdf = true;

    try {
      await this.pdfExportService.exportDashboardToPdf(
        this.dashboardContainer,
        this.dashboardConfig.widgets,
        {
          orientation: 'landscape',
          format: 'a4',
          margin: 15,
          filename: `financial-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
          title: 'Financial Dashboard - MoneyPlant',
          includeHeader: true,
          includeFooter: true,
          quality: 1,
          scale: 2
        }
      );
    } catch (error) {
      // Handle PDF export error silently
    } finally {
      this.isExportingPdf = false;
    }
  }

  /**
   * Export dashboard data to Excel
   */
  public async exportDashboardToExcel(): Promise<void> {
    this.isExportingExcel = true;

    try {
      await this.excelExportService.exportDashboardToExcel(
        this.dashboardConfig.widgets,
        {
          filename: `financial-dashboard-data-${new Date().toISOString().split('T')[0]}.xlsx`,
          includeHeaders: true,
          includeTimestamp: true,
          sheetNamePrefix: 'Widget',
          autoColumnWidth: true,
          includeWidgetTitles: true
        }
      );
    } catch (error) {
      // Handle Excel export error silently
    } finally {
      this.isExportingExcel = false;
    }
  }

  /**
   * Update all charts with new data
   */
  public async updateAllCharts(): Promise<void> {
    try {
      // Simulate API call to get updated data
      const updatedData = await this.getUpdatedChartData();
      
      // Update each chart widget
      this.dashboardConfig.widgets.forEach((widget, index) => {
        if (widget.config?.component === 'echart' && updatedData[index]) {
          if (widget.config?.options) {
            const chartOptions = widget.config.options as any;
            if (chartOptions.series) {
              chartOptions.series.forEach((series: any, seriesIndex: number) => {
                if (updatedData[index][seriesIndex]) {
                  series.data = updatedData[index][seriesIndex];
                }
              });
            }
          }
        }
      });
    } catch (error) {
      // Handle chart update error silently
    }
  }

  /**
   * Simulate getting updated chart data from API
   */
  private async getUpdatedChartData(): Promise<any[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock updated data
    return [
      { name: 'Updated Data 1', value: Math.random() * 100 },
      { name: 'Updated Data 2', value: Math.random() * 100 },
      { name: 'Updated Data 3', value: Math.random() * 100 }
    ];
  }

  /**
   * Clear all filters
   */
  public clearAllFilters(): void {
    this.isUpdatingFilters = true;
    try {
      this.filterService.clearAllFilters();
    } finally {
      this.isUpdatingFilters = false;
    }
  }

  /**
   * Get current filter values
   */
  public getCurrentFilters(): IFilterValues[] {
    return this.filterService.getFilterValues();
  }

  ngOnDestroy(): void {
    // Cleanup code when component is destroyed
    if (this.widgetUpdateTimeout) {
      clearTimeout(this.widgetUpdateTimeout);
    }
    
    // Unsubscribe from filter service
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }
}
