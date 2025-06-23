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

// Import dashboard modules
// Import from the library's public API
import { 
  IWidget,
  DashboardContainerComponent,
  WidgetBuilder
} from '@dashboards/public-api';
import { PieChartBuilder, PieChartData } from './widgets/pieChart';
import { createBarChartWidget } from './widgets/barMonthlyIncomeVsExpensesChart';
import { createLineChartWidget } from './widgets/linePortfolioPerformanceChart';
import { createScatterChartWidget } from './widgets/scatterRiskVsReturnChart';
import { createGaugeChartWidget } from './widgets/gaugeSavingsGoalProgressChart';
import { createHeatmapWidget } from './widgets/heatmapSpendingChart';
import { createDataGridWidget } from './widgets/gridRecentTransactions';
import { createTileWidget } from './widgets/tileNetWorth';
import { createMarkdownWidget } from './widgets/markdownFinancialTips';

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
   * Initialize dashboard widgets with mock data
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

    // Create widgets for each chart type
    const pieAssetAllocation = PieChartBuilder.create()
      .setData(assetAllocationData)
      .setHeader('Asset Allocation')
      .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
      .build();
    
    this.pieAssetAllocationWidgetId = pieAssetAllocation.id;

    const widgets = [
      pieAssetAllocation,
      createBarChartWidget(),
      createLineChartWidget(),
      createScatterChartWidget(),
      createGaugeChartWidget(),
      createHeatmapWidget()
    ];

    // Set the widgets array
    this.widgets = widgets;

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
          // Use PieChartBuilder for pie chart widgets, WidgetBuilder for others
          if (widget.config.component === 'echart' && 
              (widget.config.options as any)?.series?.[0]?.type === 'pie') {
            PieChartBuilder.updateData(widget, data[index]);
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
}
