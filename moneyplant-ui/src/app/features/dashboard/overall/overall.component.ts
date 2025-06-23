import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

// Create a simple custom map data for demonstration
const customMapData = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'Hong Kong Island' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kowloon' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'New Territories' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 1], [2, 1], [2, 2], [0, 2], [0, 1]]]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Lantau Island' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[2, 0], [3, 0], [3, 1], [2, 1], [2, 0]]]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Lamma Island' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[3, 0], [4, 0], [4, 1], [3, 1], [3, 0]]]
      }
    }
  ]
};

// Register the custom map data
echarts.registerMap('HK', customMapData);

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
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  CanvasRenderer
]);

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
  DensityMapBuilder,
  // Data interfaces
  PieChartData,
  BarChartData,
  LineChartData,
  ScatterChartData,
  GaugeChartData,
  HeatmapChartData,
  DensityMapData
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
  // Data update functions
  updateAssetAllocationData,
  updateMonthlyIncomeExpensesData,
  updatePortfolioPerformanceData,
  updateRiskReturnData,
  updateSavingsGoalData,
  updateSpendingHeatmapData,
  updateInvestmentDistributionData,
  // Data fetching functions
  getUpdatedAssetAllocationData,
  getUpdatedMonthlyData,
  getUpdatedPortfolioData,
  getUpdatedRiskReturnData,
  getUpdatedSavingsGoalData,
  getUpdatedSpendingHeatmapData,
  getUpdatedInvestmentDistributionData,
  // Alternative data functions
  getAlternativeAssetAllocationData,
  getAlternativeMonthlyData,
  getAlternativePortfolioData,
  getAlternativeRiskReturnData,
  getAlternativeSavingsGoalData,
  getAlternativeSpendingHeatmapData,
  getAlternativeInvestmentDistributionData
} from './widgets';

import { v4 as uuidv4 } from 'uuid';
import { ScrollPanelModule } from 'primeng/scrollpanel';

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
  // Dashboard widgets
  widgets: IWidget[] = [];
  private pieAssetAllocationWidgetId: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize dashboard widgets
    this.initializeDashboardWidgets();
  }

  /**
   * Initialize dashboard widgets using the new widget creation functions
   */
  private initializeDashboardWidgets(): void {
    // Create widgets using the new widget functions
    const pieAssetAllocation = createAssetAllocationWidget();
    this.pieAssetAllocationWidgetId = pieAssetAllocation.id;

    const barMonthlyIncomeVsExpenses = createMonthlyIncomeExpensesWidget();
    const linePortfolioPerformance = createPortfolioPerformanceWidget();
    const scatterRiskVsReturn = createRiskReturnWidget();
    const gaugeSavingsGoal = createSavingsGoalWidget();
    const heatmapSpending = createSpendingHeatmapWidget();
    const densityMapInvestment = createInvestmentDistributionWidget();

    // Set the widgets array
    this.widgets = [
      pieAssetAllocation,
      barMonthlyIncomeVsExpenses,
      linePortfolioPerformance,
      scatterRiskVsReturn,
      gaugeSavingsGoal,
      heatmapSpending,
      densityMapInvestment,
    ];

    this.updateAssetAllocationData(pieAssetAllocation);
  }

  /**
   * Example method showing how end users can update widget data dynamically
   * This is the exposed setData functionality for end users
   */
  public async updateAssetAllocationData(widget: IWidget): Promise<void> {
    try {
      // Get updated data from the widget module
      const updatedData = await getUpdatedAssetAllocationData();
      
      // Use the exposed setData method - this is what end users will call
      updateAssetAllocationData(widget, updatedData);
      
      // Trigger change detection to ensure UI updates
      this.cdr.detectChanges();
      
      console.log('Widget data updated successfully');
    } catch (error) {
      console.error('Error updating widget data:', error);
    }
  }

  /**
   * Test method to update pie chart data
   */
  public async testUpdatePieChart(): Promise<void> {
    console.log('Updating pie chart data...');
    const pieAssetAllocation = this.widgets.find(w => w.id === this.pieAssetAllocationWidgetId);
    if (pieAssetAllocation) {
      await this.updateAssetAllocationData(pieAssetAllocation);
    }
  }

  /**
   * Alternative method showing direct widget.setData() usage
   * (if the widget has the setData method implemented)
   */
  public updatePieChartDataDirect(widget: IWidget, newData: PieChartData[]): void {
    if (widget.setData) {
      // Direct call to widget's setData method
      widget.setData(newData);
      this.cdr.detectChanges();
    }
  } 

  /**
   * Utility method to get widget by ID
   */
  public getWidgetById(widgetId: string): IWidget | undefined {
    return this.widgets.find(w => w.id === widgetId);
  }

  /**
   * Utility method to get widgets by component type
   */
  public getWidgetsByType(componentType: string): IWidget[] {
    return this.widgets.filter(w => w.config.component === componentType);
  }

  /**
   * Utility method to update multiple widgets at once
   */
  public async updateMultipleWidgets(widgets: IWidget[], data: any[]): Promise<void> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update each widget with corresponding data
      widgets.forEach((widget, index) => {
        if (data[index]) {
          // Use appropriate chart builder based on widget type
          if (PieChartBuilder.isPieChart(widget)) {
            PieChartBuilder.updateData(widget, data[index]);
          } else if (BarChartBuilder.isBarChart(widget)) {
            BarChartBuilder.updateData(widget, data[index]);
          } else if (LineChartBuilder.isLineChart(widget)) {
            LineChartBuilder.updateData(widget, data[index]);
          } else if (ScatterChartBuilder.isScatterChart(widget)) {
            ScatterChartBuilder.updateData(widget, data[index]);
          } else if (GaugeChartBuilder.isGaugeChart(widget)) {
            GaugeChartBuilder.updateData(widget, data[index]);
          } else if (HeatmapChartBuilder.isHeatmapChart(widget)) {
            HeatmapChartBuilder.updateData(widget, data[index]);
          } else if (DensityMapBuilder.isDensityMap(widget)) {
            DensityMapBuilder.updateData(widget, data[index]);
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
   * Example of updating all pie chart widgets
   */
  public async updateAllPieCharts(): Promise<void> {
    // Get only pie chart widgets, not all echart widgets
    const pieChartWidgets = this.widgets.filter(w => PieChartBuilder.isPieChart(w));
    
    console.log('Found pie chart widgets:', pieChartWidgets.length);
    console.log('All widgets:', this.widgets.map(w => ({
      id: w.id,
      component: w.config.component,
      chartType: (w.config.options as any)?.series?.[0]?.type
    })));
    
    const pieChartData = [
      getAlternativeAssetAllocationData(),
      [
        { value: 40, name: 'Domestic' },
        { value: 35, name: 'International' },
        { value: 25, name: 'Emerging Markets' },
      ]
    ];
    
    await this.updateMultipleWidgets(pieChartWidgets, pieChartData);
  }

  /**
   * Example of updating all chart widgets with appropriate data
   */
  public async updateAllCharts(): Promise<void> {
    // Get all echart widgets
    const chartWidgets = this.widgets.filter(w => w.config.component === 'echart');
    
    console.log('Found chart widgets:', chartWidgets.length);
    
    // Create appropriate data for each chart type
    const chartData: any[] = [];
    
    chartWidgets.forEach(widget => {
      const chartType = (widget.config.options as any)?.series?.[0]?.type;
      console.log('Widget chart type:', chartType);
      
      switch (chartType) {
        case 'pie':
          chartData.push(getAlternativeAssetAllocationData());
          break;
        case 'bar':
          chartData.push(getAlternativeMonthlyData());
          break;
        case 'line':
          chartData.push(getAlternativePortfolioData());
          break;
        case 'scatter':
          chartData.push(getAlternativeRiskReturnData());
          break;
        case 'gauge':
          chartData.push(getAlternativeSavingsGoalData());
          break;
        case 'heatmap':
          chartData.push(getAlternativeSpendingHeatmapData());
          break;
        case 'map':
          chartData.push(getAlternativeInvestmentDistributionData());
          break;
        default:
          chartData.push([]);
          console.warn('Unknown chart type:', chartType);
      }
    });
    
    await this.updateMultipleWidgets(chartWidgets, chartData);
  }

  /**
   * Test method to demonstrate the new generic methods from ApacheEchartBuilder
   */
  public testGenericMethods(): void {
    const pieChart = PieChartBuilder.create()
      .setData([
        { value: 30, name: 'Test 1' },
        { value: 40, name: 'Test 2' },
        { value: 30, name: 'Test 3' }
      ])
      .setLabelFormatter('{b}: {c} ({d}%)')  // Generic method from base class
      .setColors(['#ff6b6b', '#4ecdc4', '#45b7d1'])  // Generic method from base class
      .setBorderRadius(8)  // Generic method from base class
      .setBorder('#fff', 2)  // Generic method from base class
      .setEmphasis(15, 0, 'rgba(0, 0, 0, 0.6)')  // Generic method from base class
      .setHeader('Test Generic Methods')
      .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
      .build();
    
    console.log('Generic methods test completed:', pieChart);
  }

  /**
   * Example method to update bar chart data
   */
  public async updateBarChartData(): Promise<void> {
    const barWidget = this.widgets.find(w => 
      w.config.component === 'echart' && 
      (w.config.options as any)?.series?.[0]?.type === 'bar'
    );
    
    if (barWidget) {
      const newData = await getUpdatedMonthlyData();
      updateMonthlyIncomeExpensesData(barWidget, newData);
      this.cdr.detectChanges();
      console.log('Bar chart updated successfully');
    }
  }

  /**
   * Example method to update line chart data
   */
  public async updateLineChartData(): Promise<void> {
    const lineWidget = this.widgets.find(w => 
      w.config.component === 'echart' && 
      (w.config.options as any)?.series?.[0]?.type === 'line'
    );
    
    if (lineWidget) {
      const newData = await getUpdatedPortfolioData();
      updatePortfolioPerformanceData(lineWidget, newData);
      this.cdr.detectChanges();
      console.log('Line chart updated successfully');
    }
  }

  /**
   * Example method to update gauge chart data
   */
  public async updateGaugeChartData(): Promise<void> {
    const gaugeWidget = this.widgets.find(w => 
      w.config.component === 'echart' && 
      (w.config.options as any)?.series?.[0]?.type === 'gauge'
    );
    
    if (gaugeWidget) {
      const newData = await getUpdatedSavingsGoalData();
      updateSavingsGoalData(gaugeWidget, newData);
      this.cdr.detectChanges();
      console.log('Gauge chart updated successfully');
    }
  }

  /**
   * Example method to update density map data
   */
  public async updateDensityMapData(): Promise<void> {
    const densityMapWidget = this.widgets.find(w => 
      w.config.component === 'echart' && 
      (w.config.options as any)?.series?.[0]?.type === 'map'
    );
    
    if (densityMapWidget) {
      const newData = await getUpdatedInvestmentDistributionData();
      updateInvestmentDistributionData(densityMapWidget, newData);
      this.cdr.detectChanges();
      console.log('Density map updated successfully');
    }
  }
}
