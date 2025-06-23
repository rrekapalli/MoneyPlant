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
  HeatmapChart
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
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
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
  // Data interfaces
  PieChartData,
  BarChartData,
  LineChartData,
  ScatterChartData,
  GaugeChartData,
  HeatmapChartData
} from '@dashboards/public-api';


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
   * Initialize dashboard widgets with mock data using new chart builders
   */
  private initializeDashboardWidgets(): void {
    // Asset allocation data for pie chart
    const assetAllocationData: PieChartData[] = [
      { value: 45, name: 'Stocks' },
      { value: 25, name: 'Bonds' },
      { value: 15, name: 'Cash' },
      { value: 10, name: 'Real Estate' },
      { value: 5, name: 'Commodities' },
    ];

    // Monthly income vs expenses data for bar chart
    const monthlyData: BarChartData[] = [
      { name: 'Jan', value: 8500 },
      { name: 'Feb', value: 9200 },
      { name: 'Mar', value: 7800 },
      { name: 'Apr', value: 9500 },
      { name: 'May', value: 8800 },
      { name: 'Jun', value: 10200 }
    ];
    const monthlyCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    // Portfolio performance data for line chart
    const portfolioData: LineChartData[] = [
      { name: 'Jan', value: 100000 },
      { name: 'Feb', value: 105000 },
      { name: 'Mar', value: 102000 },
      { name: 'Apr', value: 108000 },
      { name: 'May', value: 112000 },
      { name: 'Jun', value: 115000 }
    ];
    const portfolioCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    // Risk vs return data for scatter chart
    const riskReturnData: ScatterChartData[] = [
      { value: [0.05, 0.08], name: 'Bonds' },
      { value: [0.12, 0.15], name: 'Stocks' },
      { value: [0.08, 0.10], name: 'REITs' },
      { value: [0.15, 0.20], name: 'Small Cap' },
      { value: [0.20, 0.25], name: 'Emerging Markets' },
      { value: [0.03, 0.05], name: 'Cash' }
    ];

    // Savings goal progress data for gauge chart
    const savingsGoalData: GaugeChartData[] = [
      { value: 75, name: 'Savings Goal Progress' }
    ];

    // Spending heatmap data
    const spendingHeatmapData: HeatmapChartData[] = [
      { value: [0, 0, 1200], name: 'Mon-Food' },
      { value: [1, 0, 1100], name: 'Tue-Food' },
      { value: [2, 0, 1300], name: 'Wed-Food' },
      { value: [3, 0, 1000], name: 'Thu-Food' },
      { value: [4, 0, 1400], name: 'Fri-Food' },
      { value: [0, 1, 800], name: 'Mon-Transport' },
      { value: [1, 1, 750], name: 'Tue-Transport' },
      { value: [2, 1, 900], name: 'Wed-Transport' },
      { value: [3, 1, 700], name: 'Thu-Transport' },
      { value: [4, 1, 850], name: 'Fri-Transport' },
      { value: [0, 2, 500], name: 'Mon-Entertainment' },
      { value: [1, 2, 600], name: 'Tue-Entertainment' },
      { value: [2, 2, 400], name: 'Wed-Entertainment' },
      { value: [3, 2, 700], name: 'Thu-Entertainment' },
      { value: [4, 2, 800], name: 'Fri-Entertainment' }
    ];
    const heatmapXAxis = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const heatmapYAxis = ['Food', 'Transport', 'Entertainment'];

    // Create widgets using new chart builders
    const pieAssetAllocation = PieChartBuilder.create()
      .setData(assetAllocationData)
      .setHeader('Asset Allocation')
      .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
      .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
      .setRadius(['40%', '70%'])
      .setLabelFormatter('{b}: {c} ({d}%)')
      .setTooltip('item', '{b}: ${c} ({d}%)')
      .build();
    
    this.pieAssetAllocationWidgetId = pieAssetAllocation.id;

    const barMonthlyIncomeVsExpenses = BarChartBuilder.create()
      .setData(monthlyData.map(d => d.value))
      .setCategories(monthlyCategories)
      .setHeader('Monthly Income vs Expenses')
      .setPosition({ x: 4, y: 0, cols: 6, rows: 4 })
      .setTitle('Monthly Income vs Expenses', 'Last 6 Months')
      .setColors(['#5470c6'])
      .setBarWidth('60%')
      .setBarBorderRadius(4)
      .setYAxisName('Amount ($)')
      .setTooltip('axis', '{b}: ${c}')
      .build();

    const linePortfolioPerformance = LineChartBuilder.create()
      .setData(portfolioData.map(d => d.value))
      .setXAxisData(portfolioCategories)
      .setHeader('Portfolio Performance')
      .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
      .setTitle('Portfolio Performance', 'Last 6 Months')
      .setSmooth(true)
      .setAreaStyle('#5470c6', 0.3)
      .setLineStyle(3, '#5470c6', 'solid')
      .setSymbol('circle', 8)
      .setYAxisName('Portfolio Value ($)')
      .setTooltip('axis', '{b}: ${c}')
      .build();

    const scatterRiskVsReturn = ScatterChartBuilder.create()
      .setData(riskReturnData)
      .setHeader('Risk vs Return Analysis')
      .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
      .setTitle('Risk vs Return Analysis', 'Portfolio Components')
      .setXAxisName('Risk (Volatility)')
      .setYAxisName('Return (%)')
      .setSymbol('circle', 10)
      .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'])
      .setTooltip('item', '{b}: Risk {c[0]}, Return {c[1]}%')
      .build();

    const gaugeSavingsGoal = GaugeChartBuilder.create()
      .setData(savingsGoalData)
      .setHeader('Savings Goal Progress')
      .setPosition({ x: 10, y: 0, cols: 4, rows: 4 })
      .setTitle('Savings Goal Progress', 'Current Year')
      .setRange(0, 100)
      .setRadius('60%')
      .setCenter(['50%', '60%'])
      .setProgress(true, 10)
      .setPointer(true, '80%', 6)
      .setAxisLine(20, [[0.3, '#ff6e76'], [0.7, '#fddd60'], [1, '#58d9f9']])
      .setDetail(true, [0, 40], '#333', 20, '{value}%')
      .setGaugeTitle(true, [0, 70], '#333', 16)
      .build();

    const heatmapSpending = HeatmapChartBuilder.create()
      .setData(spendingHeatmapData)
      .setXAxisData(heatmapXAxis)
      .setYAxisData(heatmapYAxis)
      .setHeader('Weekly Spending Heatmap')
      .setPosition({ x: 6, y: 8, cols: 8, rows: 4 })
      .setTitle('Weekly Spending Heatmap', 'By Category')
      .setVisualMap(0, 1500, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'])
      .setXAxisName('Days')
      .setYAxisName('Categories')
      .setTooltip('item', '{b}: ${c}')
      .build();


    // Set the widgets array
    this.widgets = [
      pieAssetAllocation,
      barMonthlyIncomeVsExpenses,
      linePortfolioPerformance,
      scatterRiskVsReturn,
      gaugeSavingsGoal,
      heatmapSpending,
    ];

    this.updateAssetAllocationData(pieAssetAllocation);
  }

  /**
   * Example method showing how end users can update widget data dynamically
   * This is the exposed setData functionality for end users
   */
  public async updateAssetAllocationData(widget: IWidget): Promise<void> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example updated data from API
      const updatedData: PieChartData[] = [
        { value: 50, name: 'Stocks' },
        { value: 20, name: 'Bonds' },
        { value: 20, name: 'Cash' },
        { value: 8, name: 'Real Estate' },
        { value: 2, name: 'Commodities' },
      ];
      
      // Use the exposed setData method - this is what end users will call
      PieChartBuilder.updateData(widget, updatedData);
      
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
    const pieChartWidgets = this.getWidgetsByType('echart');
    const pieChartData = [
      [
        { value: 60, name: 'Stocks' },
        { value: 15, name: 'Bonds' },
        { value: 15, name: 'Cash' },
        { value: 7, name: 'Real Estate' },
        { value: 3, name: 'Commodities' },
      ],
      [
        { value: 40, name: 'Domestic' },
        { value: 35, name: 'International' },
        { value: 25, name: 'Emerging Markets' },
      ]
    ];
    
    await this.updateMultipleWidgets(pieChartWidgets, pieChartData);
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
      const newData = [9500, 9800, 8200, 10000, 9200, 10800];
      BarChartBuilder.updateData(barWidget, newData);
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
      const newData = [100000, 107000, 104000, 111000, 116000, 120000];
      LineChartBuilder.updateData(lineWidget, newData);
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
      const newData = [{ value: 85, name: 'Savings Goal Progress' }];
      GaugeChartBuilder.updateData(gaugeWidget, newData);
      this.cdr.detectChanges();
      console.log('Gauge chart updated successfully');
    }
  }
}
