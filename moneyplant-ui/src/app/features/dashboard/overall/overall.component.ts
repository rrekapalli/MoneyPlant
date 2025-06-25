import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { GridsterConfig, DisplayGrid, GridType } from 'angular-gridster2';

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

// Example of registering a custom Hong Kong map (if you have the GeoJSON data)
// You can uncomment and modify this if you have Hong Kong GeoJSON data
/*
const hongKongGeoJson = {
  "type": "FeatureCollection",
  "features": [
    // Your Hong Kong GeoJSON data here
  ]
};
DensityMapBuilder.registerMap('HK', hongKongGeoJson);
*/

// Import dashboard modules and chart builders
import { 
  IWidget,
  DashboardContainerComponent,
  WidgetBuilder,
  // Chart Builders
  PieChartBuilder,
  BarChartBuilder,
  LineChartBuilder,
  ScatterChartBuilder,
  GaugeChartBuilder,
  HeatmapChartBuilder,
  AreaChartBuilder,
  PolarChartBuilder,
  StackedAreaChartBuilder,
  TreemapChartBuilder,
  SunburstChartBuilder,
  SankeyChartBuilder,
  // Data interfaces
  PieChartData,
  BarChartData,
  LineChartData,
  ScatterChartData,
  GaugeChartData,
  HeatmapChartData,
  DensityMapData,
  AreaChartData,
  PolarChartData,
  StackedAreaSeriesData,
  TreemapData,
  SunburstChartData,
  SankeyChartData,
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
  // Data update functions
  updateAssetAllocationData,
  updateMonthlyIncomeExpensesData,
  updatePortfolioPerformanceData,
  updateRiskReturnData,
  updateSavingsGoalData,
  updateSpendingHeatmapData,
  updateInvestmentDistributionData,
  updateAreaChartData,
  updatePolarChartData,
  updateStackedAreaChartData,
  updateTreemapChartData,
  updateSunburstChartData,
  updateSankeyChartData,
  // Data fetching functions
  getUpdatedAssetAllocationData,
  getUpdatedMonthlyData,
  getUpdatedPortfolioData,
  getUpdatedRiskReturnData,
  getUpdatedSavingsGoalData,
  getUpdatedSpendingHeatmapData,
  getUpdatedInvestmentDistributionData,
  getUpdatedAreaChartData,
  getUpdatedPolarChartData,
  getUpdatedStackedAreaChartData,
  getUpdatedTreemapChartData,
  getUpdatedSunburstChartData,
  getUpdatedSankeyChartData,
  // Alternative data functions
  getAlternativeAssetAllocationData,
  getAlternativeMonthlyData,
  getAlternativePortfolioData,
  getAlternativeRiskReturnData,
  getAlternativeSavingsGoalData,
  getAlternativeSpendingHeatmapData,
  getAlternativeInvestmentDistributionData,
  getAlternativeAreaChartData,
  getAlternativePolarChartData,
  getAlternativeStackedAreaChartData,
  getAlternativeTreemapChartData,
  getAlternativeSunburstChartData,
  getAlternativeSankeyChartData
} from './widgets';

// Import test filter widget directly
import { createTestFilterWidget, updateTestFilterData } from './widgets/test-filter-widget';

// Filter service
import { FilterService } from '@dashboards/public-api';

import { v4 as uuidv4 } from 'uuid';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { updatePieChartDataDirect } from './widgets/asset-allocation-widget';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overall',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    MessageModule,
    TooltipModule,
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
    // Prevent recursive updates
    if (this.isUpdatingFilters) {
      return;
    }
    
    this.isUpdatingFilters = true;
    try {
      this.filterService.setFilterValues(filters);
      // Widget updates will be handled by the filter service subscription
    } finally {
      this.isUpdatingFilters = false;
    }
  }

  /**
   * Update all widgets with current filters
   */
  private updateWidgetsWithFilters(filters?: IFilterValues[]): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Use provided filters or get from service
    const currentFilters = filters || this.filterService.getFilterValues();

    this.dashboardConfig.widgets.forEach(widget => {
      if (widget.config.component === 'echart') {
        this.updateWidgetWithFilters(widget, currentFilters);
      }
    });

    // Trigger change detection to update the UI
    this.cdr.detectChanges();
  }

  /**
   * Update a specific widget with filters
   */
  private updateWidgetWithFilters(widget: IWidget, filters: IFilterValues[]): void {
    const widgetTitle = widget.config?.header?.title;
    
    if (widgetTitle === 'Asset Allocation') {
      updateAssetAllocationData(widget, undefined, this.filterService);
    }
    else if (widgetTitle === 'Test Filter Widget') {
      updateTestFilterData(widget, undefined, this.filterService);
    }
    else if (widgetTitle === 'Monthly Income vs Expenses') {
      updateMonthlyIncomeExpensesData(widget, undefined, this.filterService);
    }
    else if (widgetTitle === 'Portfolio Performance') {
      updatePortfolioPerformanceData(widget, undefined, this.filterService);
    }
    else if (widgetTitle === 'Risk vs Return Analysis') {
      updateRiskReturnData(widget, undefined, this.filterService);
    }
    // TODO: Add filtering support to other widgets
    // - Savings Goal Progress
    // - Spending Heatmap
    // - Investment Distribution
    // - Area Chart
    // - Polar Chart
    // - Stacked Area Chart
    // - Treemap Chart
    // - Sunburst Chart
    // - Sankey Chart
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
   * Update a single widget with new data
   */
  public async updateWidget(widgetId: string, newData: any): Promise<void> {
    const widget = this.dashboardConfig.widgets.find(w => w.id === widgetId);
    if (!widget) {
      return;
    }

    try {
      // Apply filters to the new data
      const filteredData = this.filterService.applyFiltersToData([newData], this.filterService.getFilterValues());
      
      if (filteredData.length > 0) {
        // Update the widget with filtered data
        if (widget.config.component === 'echart') {
          // For chart widgets, update the series data
          const chartOptions = widget.config.options as any;
          if (chartOptions.series && chartOptions.series.length > 0) {
            chartOptions.series[0].data = filteredData;
          }
        }
      }
    } catch (error) {
      // Handle widget update error silently
    }
  }

  /**
   * Update multiple widgets with new data
   */
  public async updateMultipleWidgets(widgets: IWidget[], data: any[]): Promise<void> {
    try {
      widgets.forEach((widget, index) => {
        if (data[index]) {
          if (widget.config?.component === 'echart') {
            // Update chart data based on chart type
            const chartOptions = widget.config.options as any;
            if (chartOptions && chartOptions.series) {
              // Update series data
              chartOptions.series.forEach((series: any, seriesIndex: number) => {
                if (data[index][seriesIndex]) {
                  series.data = data[index][seriesIndex];
                }
              });
            }
          }
        }
      });
    } catch (error) {
      // Handle multiple widget update error silently
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
