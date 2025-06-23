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
