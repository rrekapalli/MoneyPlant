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

    // Investment distribution by region data for density map
    const investmentDistributionData: DensityMapData[] = [
      { name: 'Hong Kong Island', value: 100 },
      { name: 'Kowloon', value: 80 },
      { name: 'New Territories', value: 60 },
      { name: 'Lantau Island', value: 30 },
      { name: 'Lamma Island', value: 20 }
    ];

    const densityMapInvestment = DensityMapBuilder.create()
      .setData(investmentDistributionData)
      .setMap('HK')
      .setHeader('Investment Distribution by Region')
      .setPosition({ x: 0, y: 8, cols: 6, rows: 4 })
      .setTitle('Investment Distribution by Region', 'Hong Kong')
      .setVisualMap(0, 100, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'])
      .setRoam(true)
      .setZoom(1.0)
      .setCenter([2, 1])
      .setLabelShow(true, 'inside', '{b}\n{c}%')
      .setAreaColor('#f5f5f5')
      .setBorderColor('#999', 0.5)
      .setEmphasisColor('#b8e186')
      .setShadow(15, 'rgba(0, 0, 0, 0.4)')
      .setTooltip('item', '{b}: {c}% of total investment')
      .build();

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
          chartData.push([
            { value: 55, name: 'Stocks' },
            { value: 20, name: 'Bonds' },
            { value: 15, name: 'Cash' },
            { value: 8, name: 'Real Estate' },
            { value: 2, name: 'Commodities' },
          ]);
          break;
        case 'bar':
          chartData.push([9500, 9800, 8200, 10000, 9200, 10800]);
          break;
        case 'line':
          chartData.push([100000, 107000, 104000, 111000, 116000, 120000]);
          break;
        case 'scatter':
          chartData.push([
            { value: [0.06, 0.09], name: 'Bonds' },
            { value: [0.13, 0.16], name: 'Stocks' },
            { value: [0.09, 0.11], name: 'REITs' },
            { value: [0.16, 0.21], name: 'Small Cap' },
            { value: [0.21, 0.26], name: 'Emerging Markets' },
            { value: [0.04, 0.06], name: 'Cash' }
          ]);
          break;
        case 'gauge':
          chartData.push([{ value: 85, name: 'Savings Goal Progress' }]);
          break;
        case 'heatmap':
          chartData.push([
            { value: [0, 0, 1300], name: 'Mon-Food' },
            { value: [1, 0, 1200], name: 'Tue-Food' },
            { value: [2, 0, 1400], name: 'Wed-Food' },
            { value: [3, 0, 1100], name: 'Thu-Food' },
            { value: [4, 0, 1500], name: 'Fri-Food' },
            { value: [0, 1, 900], name: 'Mon-Transport' },
            { value: [1, 1, 850], name: 'Tue-Transport' },
            { value: [2, 1, 1000], name: 'Wed-Transport' },
            { value: [3, 1, 800], name: 'Thu-Transport' },
            { value: [4, 1, 950], name: 'Fri-Transport' },
            { value: [0, 2, 600], name: 'Mon-Entertainment' },
            { value: [1, 2, 700], name: 'Tue-Entertainment' },
            { value: [2, 2, 500], name: 'Wed-Entertainment' },
            { value: [3, 2, 800], name: 'Thu-Entertainment' },
            { value: [4, 2, 900], name: 'Fri-Entertainment' }
          ]);
          break;
        case 'map':
          chartData.push([
            { name: 'Hong Kong Island', value: 90 },
            { name: 'Kowloon', value: 85 },
            { name: 'New Territories', value: 70 },
            { name: 'Lantau Island', value: 45 },
            { name: 'Lamma Island', value: 35 }
          ]);
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

  /**
   * Example method to update density map data
   */
  public async updateDensityMapData(): Promise<void> {
    const densityMapWidget = this.widgets.find(w => 
      w.config.component === 'echart' && 
      (w.config.options as any)?.series?.[0]?.type === 'map'
    );
    
    if (densityMapWidget) {
      const newData: DensityMapData[] = [
        { name: 'Hong Kong Island', value: 90 },
        { name: 'Kowloon', value: 85 },
        { name: 'New Territories', value: 70 },
        { name: 'Lantau Island', value: 45 },
        { name: 'Lamma Island', value: 35 }
      ];
      DensityMapBuilder.updateData(densityMapWidget, newData);
      this.cdr.detectChanges();
      console.log('Density map updated successfully');
    }
  }
}
