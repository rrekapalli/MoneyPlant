import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
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
  console.log('World map registered successfully');
}).catch((error) => {
  console.error('Failed to load world map data:', error);
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
  ExcelExportOptions
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

import { v4 as uuidv4 } from 'uuid';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { updatePieChartDataDirect } from './widgets/asset-allocation-widget';

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
})
export class OverallComponent implements OnInit {
  // Dashboard config (Fluent API)
  dashboardConfig!: DashboardConfig;
  
  // PDF export loading state
  isExportingPdf = false;
  
  // Excel export loading state
  isExportingExcel = false;

  // Reference to dashboard container for PDF export
  @ViewChild('dashboardContainer', { static: false }) dashboardContainer!: ElementRef<HTMLElement>;

  constructor(
    private cdr: ChangeDetectorRef,
    private pdfExportService: PdfExportService,
    private excelExportService: ExcelExportService
  ) {}

  ngOnInit(): void {
    this.initializeDashboardConfig();
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

    // Use the Fluent API to build the dashboard config
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('overall-dashboard')
      .setWidgets([
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
        minimalSankeyTest
      ])
      .setEditMode(false)
      .build();
  }

  /**
   * Export dashboard to PDF
   */
  public async exportDashboardToPdf(): Promise<void> {
    if (!this.dashboardContainer) {
      console.error('Dashboard container reference not found');
      return;
    }

    this.isExportingPdf = true;
    this.cdr.detectChanges();

    try {
      console.log('Starting PDF export...');
      console.log('Dashboard container:', this.dashboardContainer.nativeElement);
      console.log('Number of widgets to export:', this.dashboardConfig.widgets.length);
      console.log('Widgets:', this.dashboardConfig.widgets.map(w => ({
        id: w.id,
        title: w.config?.header?.title,
        component: w.config?.component,
        position: w.position
      })));

      const options: PdfExportOptions = {
        orientation: 'landscape',
        format: 'a4',
        margin: 15,
        filename: `financial-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
        title: 'Financial Dashboard - MoneyPlant',
        includeHeader: true,
        includeFooter: true,
        quality: 1,
        scale: 2
      };

      await this.pdfExportService.exportDashboardToPdf(
        this.dashboardContainer,
        this.dashboardConfig.widgets,
        options
      );

      console.log('Dashboard exported to PDF successfully');
    } catch (error) {
      console.error('Error exporting dashboard to PDF:', error);
      // You could add a toast notification here for user feedback
    } finally {
      this.isExportingPdf = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Export dashboard data to Excel
   */
  public async exportDashboardToExcel(): Promise<void> {
    this.isExportingExcel = true;
    this.cdr.detectChanges();

    try {
      console.log('Starting Excel export...');
      console.log('Number of widgets to export:', this.dashboardConfig.widgets.length);
      console.log('Widgets:', this.dashboardConfig.widgets.map(w => ({
        id: w.id,
        title: w.config?.header?.title,
        component: w.config?.component,
        position: w.position
      })));

      const options: ExcelExportOptions = {
        filename: `financial-dashboard-data-${new Date().toISOString().split('T')[0]}.xlsx`,
        includeHeaders: true,
        includeTimestamp: true,
        sheetNamePrefix: 'Widget',
        autoColumnWidth: true,
        includeWidgetTitles: true
      };

      await this.excelExportService.exportDashboardToExcel(
        this.dashboardConfig.widgets,
        options
      );

      console.log('Dashboard data exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting dashboard to Excel:', error);
      // You could add a toast notification here for user feedback
    } finally {
      this.isExportingExcel = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Utility method to update multiple widgets at once
   */
  public async updateMultipleWidgets(widgets: IWidget[], data: any[]): Promise<void> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update each widget with corresponding data using chart builders
      widgets.forEach((widget, index) => {
        if (data[index]) {
          const series = (widget.config.options as any)?.series?.[0];
          const chartType = series?.type;
          const hasAreaStyle = series?.areaStyle;
          const coordinateSystem = series?.coordinateSystem;
          const hasStack = series?.stack;
          
          // Use chart builders to update data based on chart type
          if (chartType === 'pie') {
            PieChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'bar') {
            BarChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'line' && coordinateSystem === 'polar') {
            // Polar chart (line chart with polar coordinate system)
            PolarChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'line' && hasAreaStyle && hasStack) {
            // Stacked area chart (line chart with area style and stack)
            StackedAreaChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'line' && hasAreaStyle) {
            // Area chart (line chart with area style)
            AreaChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'line') {
            LineChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'scatter') {
            ScatterChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'gauge') {
            GaugeChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'heatmap') {
            HeatmapChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'map') {
            DensityMapBuilder.updateData(widget, data[index]);
          } else if (chartType === 'treemap') {
            TreemapChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'sunburst') {
            SunburstChartBuilder.updateData(widget, data[index]);
          } else if (chartType === 'sankey') {
            SankeyChartBuilder.updateData(widget, data[index]);
          } else {
            WidgetBuilder.setData(widget, data[index]);
          }
        }
      });
      
      // Trigger change detection once for all updates
      this.cdr.detectChanges();
      console.log(`Updated ${widgets.length} widgets successfully`);
    } catch (error) {
      console.error('Error updating multiple widgets:', error);
    }
  }

  /**
   * Example of updating all chart widgets with appropriate data
   */
  public async updateAllCharts(): Promise<void> {
    // Get all echart widgets
    const chartWidgets = this.dashboardConfig.widgets.filter(w => w.config.component === 'echart');
    console.log('Found chart widgets:', chartWidgets.length);
    
    // Create appropriate data for each chart type using chart builders
    const chartData: any[] = [];
    chartWidgets.forEach(widget => {
      const series = (widget.config.options as any)?.series?.[0];
      const chartType = series?.type;
      const hasAreaStyle = series?.areaStyle;
      const coordinateSystem = series?.coordinateSystem;
      const hasStack = series?.stack;
      console.log('Widget chart type:', chartType, 'hasAreaStyle:', hasAreaStyle, 'coordinateSystem:', coordinateSystem, 'hasStack:', hasStack);
      
      // Use chart builders to determine appropriate data
      let data: any;
      if (chartType === 'line' && coordinateSystem === 'polar') {
        // Polar chart (line chart with polar coordinate system)
        data = getAlternativePolarChartData();
      } else if (chartType === 'line' && hasAreaStyle && hasStack) {
        // Stacked area chart (line chart with area style and stack)
        data = getAlternativeStackedAreaChartData();
      } else if (chartType === 'line' && hasAreaStyle) {
        // Area chart (line chart with area style)
        data = getAlternativeAreaChartData();
      } else {
        switch (chartType) {
          case 'pie':
            data = getAlternativeAssetAllocationData();
            break;
          case 'bar':
            data = getAlternativeMonthlyData();
            break;
          case 'line':
            data = getAlternativePortfolioData();
            break;
          case 'scatter':
            data = getAlternativeRiskReturnData();
            break;
          case 'gauge':
            data = getAlternativeSavingsGoalData();
            break;
          case 'heatmap':
            data = getAlternativeSpendingHeatmapData();
            break;
          case 'map':
            data = getAlternativeInvestmentDistributionData();
            break;
          case 'treemap':
            data = getAlternativeTreemapChartData();
            break;
          case 'sunburst':
            data = getAlternativeSunburstChartData();
            break;
          case 'sankey':
            data = getAlternativeSankeyChartData();
            break;
          default:
            data = [];
            console.warn('Unknown chart type:', chartType);
        }
      }
      chartData.push(data);
    });
    
    await this.updateMultipleWidgets(chartWidgets, chartData);
  }
}
