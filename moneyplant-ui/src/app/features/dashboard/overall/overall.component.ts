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
  DashboardHeaderComponent,
  // Fluent API
  StandardDashboardBuilder,
  DashboardConfig,

  // Excel Export Service
  ExcelExportService,
  ExcelExportOptions,
  IFilterValues,
  ITileOptions
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
  createMetricTiles,
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
    DashboardContainerComponent,
    DashboardHeaderComponent
  ],
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverallComponent implements OnInit, OnDestroy {
  // Dashboard config (Fluent API)
  dashboardConfig!: DashboardConfig;
  
  // PDF export loading state

  
  // Excel export loading state
  isExportingExcel = false;

  // Flag to prevent recursive filter updates
  private isUpdatingFilters = false;

  // Debounce mechanism for widget updates
  private widgetUpdateTimeout?: any;
  private filterSubscription?: Subscription;

  // Filter highlighting mode control
  public isHighlightingEnabled: boolean = true;
  public highlightingOpacity: number = 0.25;

  // Reference to dashboard container for PDF export
  @ViewChild('dashboardContainer', { static: false }) dashboardContainer!: ElementRef<HTMLElement>;

  // Reference to dashboard container component
  @ViewChild(DashboardContainerComponent, { static: false }) dashboardContainerComponent!: DashboardContainerComponent;

  // Shared dashboard data - Flat structure
  private dashboardData: DashboardDataRow[] = [...INITIAL_DASHBOARD_DATA];

  constructor(
    private cdr: ChangeDetectorRef,
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

    // Update metric tiles with filtered data
    this.updateMetricTilesWithFilters(currentFilters);

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
   * Update metric tiles with filtered data
   */
  private updateMetricTilesWithFilters(filters: IFilterValues[]): void {
    // Find all tile widgets
    const tileWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'tile'
    );

    // Create new metric tiles with filtered data
    const updatedMetricTiles = createMetricTiles(this.dashboardData);

    // Update each tile widget with new data
    tileWidgets.forEach((widget, index) => {
      if (index < updatedMetricTiles.length) {
        const updatedTile = updatedMetricTiles[index];
        
        // Check if this tile should update on data change
        const tileOptions = widget.config?.options as ITileOptions;
        const shouldUpdate = tileOptions?.updateOnDataChange !== false;
        
        if (shouldUpdate) {
          // Update the widget's options with new tile data
          if (widget.config?.options) {
            Object.assign(widget.config.options, updatedTile.config?.options);
          }
        }
      }
    });
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

    // Check if highlighting mode is enabled
    const highlightingEnabled = this.dashboardConfig?.filterVisualization?.enableHighlighting;
    
    if (highlightingEnabled) {
      // In highlighting mode, keep the full dataset available
      // Individual widgets will handle their own filtering/highlighting
      this.dashboardData = [...INITIAL_DASHBOARD_DATA];
    } else {
      // In traditional mode, filter the main dataset
      this.dashboardData = this.applyFiltersToFlatData(INITIAL_DASHBOARD_DATA, filters);
    }
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
   * Get filtered data for a specific widget from the original dataset with filters applied
   * Used for non-source widgets in highlighting mode
   */
  private getFilteredDataForWidgetFromOriginalData(widgetTitle: string, filters: IFilterValues[]): any {
    // Apply filters to original data first
    const filteredData = this.applyFiltersToFlatData(INITIAL_DASHBOARD_DATA, filters);
    
    // Then process the filtered data for the specific widget
    switch (widgetTitle) {
      case 'Asset Allocation':
        return this.groupByAndSum(filteredData, 'assetCategory', 'totalValue');
      case 'Monthly Income vs Expenses':
        return this.groupByAndSum(filteredData, 'month', 'totalValue');
      case 'Portfolio Performance':
        return this.groupByAndSum(filteredData, 'month', 'totalValue');
      case 'Investment Distribution by Region':
        return this.groupByAndSum(filteredData, 'market', 'totalValue');
      case 'Test Filter Widget':
        return this.groupByAndSum(filteredData, 'assetCategory', 'totalValue');
      default:
        // For other widget types, return the filtered data as-is
        return filteredData;
    }
  }

  /**
   * Get filtered data for a specific widget based on its requirements
   * In highlighting mode, this uses the full dataset (filtering happens at widget level)
   * In traditional mode, this uses the pre-filtered dashboard data
   */
  private getFilteredDataForWidget(widgetTitle: string): any {
    switch (widgetTitle) {
      case 'Asset Allocation':
        // Group by assetCategory and sum totalValue (for current month or all data)
        const assetData = this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
        return assetData;
        
      case 'Monthly Income vs Expenses':
        // Group by month and sum totalValue (for all asset categories)
        const monthlyData = this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        return monthlyData;
        
      case 'Portfolio Performance':
        // Group by month and sum totalValue (for all asset categories)
        const portfolioData = this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
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
        return riskReturnResult;
        
      case 'Investment Distribution by Region':
        // Group by market (country) and sum totalValue for map visualization
        const investmentData = this.groupByAndSum(this.dashboardData, 'market', 'totalValue');
        return investmentData;
        
      case 'Weekly Spending Heatmap':
        // Create heatmap data from the dashboard data
        // Group by month and assetCategory to create a heatmap
        const heatmapData = this.createHeatmapData(this.dashboardData);
        return heatmapData;
        
      case 'Revenue Trend':
        // Group by month and sum totalValue for area chart
        const revenueData = this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        return revenueData;
        
      case 'Financial Overview':
        // Create multi-series data for stacked area chart
        const financialData = this.createMultiSeriesData(this.dashboardData);
        return financialData;
        
      case 'Performance Monitoring':
        // Use all data points for large-scale area chart
        const performanceData = this.dashboardData.map(row => ({
          name: `${row.month}-${row.assetCategory}`,
          value: row.totalValue
        }));
        return performanceData;
        
      case 'Performance Metrics':
        // Create polar chart data from asset categories
        const polarData = this.createPolarData(this.dashboardData);
        return polarData;
        
      case 'Financial Performance':
        // Create multi-series polar data
        const multiPolarData = this.createMultiSeriesPolarData(this.dashboardData);
        return multiPolarData;
        
      case 'Business Metrics':
        // Create radar-style polar data
        const radarData = this.createRadarData(this.dashboardData);
        return radarData;
        
      case 'Portfolio Allocation':
        // Create multi-series data for stacked area chart
        const portfolioAllocationData = this.createMultiSeriesData(this.dashboardData);
        return portfolioAllocationData;
        
      case 'Market Conditions':
        // Create multi-series data for market trends
        const marketData = this.createMarketTrendData(this.dashboardData);
        return marketData;
        
      case 'Portfolio Distribution':
        // Create treemap data from asset categories and markets
        const treemapData = this.createTreemapData(this.dashboardData);
        return treemapData;
        
      case 'Monthly Expenses':
        // Create alternative treemap data
        const expenseTreemapData = this.createExpenseTreemapData(this.dashboardData);
        return expenseTreemapData;
        
      case 'Financial Overview Treemap':
        // Create large-scale treemap data
        const largeTreemapData = this.createLargeTreemapData(this.dashboardData);
        return largeTreemapData;
        
      case 'Organizational Structure':
        // Create sunburst data from asset categories
        const sunburstData = this.createSunburstData(this.dashboardData);
        return sunburstData;
        
      case 'Financial Overview Sunburst':
        // Create large-scale sunburst data
        const largeSunburstData = this.createLargeSunburstData(this.dashboardData);
        return largeSunburstData;
        
      case 'Test Filter Widget':
        // Group by assetCategory and sum totalValue (same as Asset Allocation)
        const testData = this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
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
    
    // Check if this widget is the source of any filter (where the click originated)
    const isSourceWidget = filters.some(filter => {
      const widgetIdMatch = filter['widgetId'] === widget.id;
      const widgetTitleMatch = filter['widgetTitle'] === widgetTitle;
      return widgetIdMatch || widgetTitleMatch;
    });
    
    // Check if highlighting mode is enabled
    const highlightingEnabled = this.dashboardConfig?.filterVisualization?.enableHighlighting;
    
    // Try to get base data by widget title first
    let baseData = null;
    if (widgetTitle) {
      if (highlightingEnabled && !isSourceWidget && filters.length > 0) {
        // For non-source widgets in highlighting mode, get data from original dataset and apply filtering
        baseData = this.getFilteredDataForWidgetFromOriginalData(widgetTitle, filters);
      } else {
        // For source widgets or traditional mode, use the normal data retrieval
        baseData = this.getFilteredDataForWidget(widgetTitle);
      }
    }
    
    // If no data found by title, try to detect chart type and provide appropriate data
    if (!baseData) {
      console.warn(`Widget ${widget.id} has no title defined or no matching data. Attempting to detect chart type for filtering...`);
      baseData = this.getDataByChartType(widget);
    }
    
    if (!baseData) {
      console.warn(`No base data available for widget: ${widget.id} (title: ${widgetTitle})`);
      return;
    }

    let processedData = baseData;
    
    if (highlightingEnabled && filters.length > 0 && isSourceWidget) {
      // Apply highlighting ONLY to the source widget (where the filter was clicked)
      const chartOptions = widget.config?.options as any;
      let chartType: 'pie' | 'bar' | 'line' | 'scatter' | 'other' = 'other';
      
      // Detect chart type from widget configuration
      if (chartOptions?.series?.[0]?.type) {
        chartType = chartOptions.series[0].type;
      }
      
      // Get highlighting options from dashboard config
      const visualOptions = {
        filteredOpacity: this.dashboardConfig.filterVisualization?.defaultFilteredOpacity || 0.25,
        highlightedOpacity: this.dashboardConfig.filterVisualization?.defaultHighlightedOpacity || 1.0,
        highlightColor: this.dashboardConfig.filterVisualization?.defaultHighlightColor || '#ff6b6b',
        filteredColor: this.dashboardConfig.filterVisualization?.defaultFilteredColor || '#e0e0e0'
      };

      // Apply highlighting to the data
      processedData = this.filterService.applyHighlightingToEChartsData(
        baseData, 
        filters, 
        chartType,
        visualOptions
      );
    } else if (filters.length > 0) {
      // Use traditional filtering for other widgets (non-source widgets)
      processedData = this.filterService.applyFiltersToData(baseData, filters);
      
      // If all data is filtered out and we have filters, show empty state
      if (processedData.length === 0) {
        processedData = [{
          name: 'No data matches filter',
          value: 0,
          itemStyle: {
            color: '#cccccc'
          }
        }];
      }
    }

    // Update widget data based on component type
    if (widget.config.component === 'echart') {
      this.updateEchartWidget(widget, processedData);
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
        // linePortfolioPerformance,
        // scatterRiskVsReturn,
        // gaugeSavingsGoal,
        // heatmapSpending,
        // areaChart,
        // stackedAreaChart,
        // performanceStackedAreaChart,
        // marketTrendStackedAreaChart,
        // treemapChart,
        // expenseTreemap,
        // largeScaleTreemap,
        // sunburstChart,
        // organizationalSunburst,
        // largeScaleSunburst,
        // sankeyChart,
        // investmentFlowSankey,
        // budgetAllocationSankey,
        // minimalSankeyTest,
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
  private populateWidgetsWithInitialData(): void {
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
  private getDataByChartType(widget: IWidget): any {
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
        
      default:
        console.warn(`Unknown chart type: ${seriesType}`);
        return null;
    }
  }



  /**
   * Export dashboard data to Excel
   */
  public async exportDashboardToExcel(): Promise<void> {
    console.log('Overall component: exportDashboardToExcel called');
    this.isExportingExcel = true;
    this.cdr.detectChanges(); // Immediately update UI

    try {
      // Add a small delay to allow UI to update with loading state
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('Starting Excel export...');
      
      // Use setTimeout to make the Excel generation truly async
      await new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
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
            console.log('Excel export completed successfully');
            resolve();
          } catch (error) {
            console.error('Excel export failed:', error);
            reject(error);
          }
        }, 100);
      });
      
    } catch (error) {
      console.error('Excel export error:', error);
      // Could show user-friendly error message here
    } finally {
      this.isExportingExcel = false;
      this.cdr.detectChanges(); // Update UI to remove loading state
      console.log('Excel export process finished');
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

  /**
   * Toggle filter highlighting mode
   */
  public toggleHighlightingMode(): void {
    console.log('Overall component: toggleHighlightingMode called, current state:', this.isHighlightingEnabled);
    this.isHighlightingEnabled = !this.isHighlightingEnabled;
    this.updateDashboardHighlightingConfig();
    
    // Re-apply current filters with new highlighting mode
    const currentFilters = this.getCurrentFilters();
    this.updateWidgetsWithFilters(currentFilters);
    
    console.log(`🎨 Filter highlighting mode ${this.isHighlightingEnabled ? 'enabled' : 'disabled'}`);
    
    // Force change detection to update UI
    this.cdr.detectChanges();
  }

  /**
   * Update highlighting opacity and refresh widgets
   */
  public updateHighlightingOpacity(opacity: number): void {
    this.highlightingOpacity = Math.max(0.1, Math.min(1.0, opacity));
    this.updateDashboardHighlightingConfig();
    
    // Re-apply current filters with new opacity
    const currentFilters = this.getCurrentFilters();
    this.updateWidgetsWithFilters(currentFilters);
    
    console.log(`🎛️ Highlighting opacity updated to ${Math.round(this.highlightingOpacity * 100)}%`);
    
    // Force change detection to update UI
    this.cdr.detectChanges();
  }

  /**
   * Update dashboard configuration with current highlighting settings
   */
  private updateDashboardHighlightingConfig(): void {
    if (this.dashboardConfig?.filterVisualization) {
      this.dashboardConfig.filterVisualization.enableHighlighting = this.isHighlightingEnabled;
      this.dashboardConfig.filterVisualization.defaultFilteredOpacity = this.highlightingOpacity;
      
      console.log(`📊 Dashboard highlighting config updated:`, {
        enabled: this.isHighlightingEnabled,
        opacity: this.highlightingOpacity
      });
    }
  }

  /**
   * Get highlighting status message for UI
   */
  public getHighlightingStatusMessage(): string {
    if (this.isHighlightingEnabled) {
      return `Highlighting Mode: ON - Source widgets highlighted (${Math.round(this.highlightingOpacity * 100)}% opacity), others filtered`;
    } else {
      return 'Highlighting Mode: OFF - All widgets use traditional filtering';
    }
  }

  /**
   * Demo method to show different highlighting configurations
   */
  public setHighlightingPreset(preset: 'subtle' | 'medium' | 'strong'): void {
    let opacity: number;
    
    switch (preset) {
      case 'subtle':
        opacity = 0.4;
        break;
      case 'medium':
        opacity = 0.25;
        break;
      case 'strong':
        opacity = 0.1;
        break;
    }
    
    this.updateHighlightingOpacity(opacity);
    console.log(`✨ Applied ${preset} highlighting preset (opacity: ${Math.round(opacity * 100)}%)`);
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