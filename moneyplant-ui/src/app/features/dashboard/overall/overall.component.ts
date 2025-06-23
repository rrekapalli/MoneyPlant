import { Component, OnInit } from '@angular/core';
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
import { createPieChartWidget } from './widgets/pieAssetAllocationChart';
import { createBarChartWidget } from './widgets/barMonthlyIncomeVsExpensesChart';
import { createLineChartWidget } from './widgets/linePortfolioPerformanceChart';
import { createScatterChartWidget } from './widgets/scatterRiskVsReturnChart';
import { createGaugeChartWidget } from './widgets/gaugeSavingsGoalProgressChart';
import { createHeatmapWidget } from './widgets/heatmapSpendingChart';
import { createDataGridWidget } from './widgets/gridRecentTransactions';
import { createTileWidget } from './widgets/tileNetWorth';
import { createMarkdownWidget } from './widgets/markdownFinancialTips';

import { v4 as uuidv4 } from 'uuid';

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
    // Dashboard components
    DashboardContainerComponent
  ],
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss'],
})
export class OverallComponent implements OnInit {
  // Dashboard widgets
  widgets: IWidget[] = [];

  // Dashboard options
  options: GridsterConfig = {
    gridType: GridType.Fit, // Changed from Fixed to Fit for better visibility
    displayGrid: DisplayGrid.Always, // Changed from None to Always for debugging
    margin: 10,
    outerMargin: true,
    draggable: {
      enabled: false
    },
    resizable: {
      enabled: false
    },
    maxCols: 12,
    minCols: 1,
    maxRows: 50,
    minRows: 1,
    rowHeightRatio: 0.70,
    fixedRowHeight: 30,
    outerMarginTop: 20, // Added top margin
    outerMarginBottom: 20, // Added bottom margin
    outerMarginLeft: 20, // Added left margin
    outerMarginRight: 20, // Added right margin
    enableEmptyCellClick: false,
    enableEmptyCellContextMenu: false,
    enableEmptyCellDrop: false,
    enableEmptyCellDrag: false,
    emptyCellDragMaxCols: 50,
    emptyCellDragMaxRows: 50,
    ignoreMarginInRow: false,
    mobileBreakpoint: 640
  };

  constructor() {}

  ngOnInit(): void {
    // Initialize dashboard widgets
    this.initializeDashboardWidgets();
  }

  /**
   * Initialize dashboard widgets with mock data
   */
  private initializeDashboardWidgets(): void {
    // Create widgets for each chart type
    const widgets = [
      createPieChartWidget(),
      createBarChartWidget(),
      createLineChartWidget(),
      createScatterChartWidget(),
      createGaugeChartWidget(),
      createHeatmapWidget()
    ];

    // Set the widgets array
    this.widgets = widgets;
  }
}
