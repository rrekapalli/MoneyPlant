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
