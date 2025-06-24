import { StackedAreaChartBuilder, StackedAreaSeriesData } from '@dashboards/public-api';
import { IWidget } from '@dashboards/public-api';

/**
 * Sample data for stacked area chart widget
 */
export const sampleStackedAreaChartData: StackedAreaSeriesData[] = [
  {
    name: 'Revenue',
    data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330]
  },
  {
    name: 'Expenses',
    data: [80, 92, 71, 94, 60, 180, 160, 132, 141, 184, 240, 280]
  },
  {
    name: 'Profit',
    data: [40, 40, 30, 40, 30, 50, 50, 50, 50, 50, 50, 50]
  }
];

export const sampleStackedAreaChartXAxis = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Create a basic stacked area chart widget
 */
export function createStackedAreaChartWidget(): IWidget {
  return StackedAreaChartBuilder.create()
    .setMultiSeriesData(sampleStackedAreaChartData)
    .setXAxisData(sampleStackedAreaChartXAxis)
    .setTitle('Financial Overview', 'Revenue vs Expenses vs Profit')
    .setSmooth(true)
    .setStack('total')
    .setColors(['#5470c6', '#91cc75', '#fac858'])
    .setAreaStyle('#5470c6', 0.6)
    .setLineStyle(2, '#5470c6', 'solid')
    .setSymbol('circle', 5)
    .setTooltip('axis', '{b}: ${c}K')
    .setLegend('horizontal', 'bottom')
    .setHeader('Financial Overview')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Create a performance stacked area chart widget
 */
export function createPerformanceStackedAreaChartWidget(): IWidget {
  const performanceData: StackedAreaSeriesData[] = [
    {
      name: 'Stocks',
      data: [45, 52, 48, 61, 55, 68, 72, 65, 78, 82, 75, 88]
    },
    {
      name: 'Bonds',
      data: [25, 28, 22, 35, 30, 42, 38, 32, 45, 48, 40, 52]
    },
    {
      name: 'Cash',
      data: [15, 18, 12, 25, 20, 32, 28, 22, 35, 38, 30, 42]
    }
  ];

  return StackedAreaChartBuilder.create()
    .setMultiSeriesData(performanceData)
    .setXAxisData(sampleStackedAreaChartXAxis)
    .setTitle('Portfolio Allocation', 'Asset Class Distribution')
    .setSmooth(true)
    .setStack('total')
    .setColors(['#5470c6', '#91cc75', '#fac858'])
    .setAreaStyle('#5470c6', 0.7)
    .setLineStyle(1, '#5470c6', 'solid')
    .setSymbol('circle', 4)
    .setTooltip('axis', '{b}: {c}%')
    .setLegend('horizontal', 'bottom')
    .setHeader('Portfolio Allocation')
    .setPosition({ x: 0, y: 4, cols: 8, rows: 4 })
    .build();
}

/**
 * Create a market trend stacked area chart widget
 */
export function createMarketTrendStackedAreaChartWidget(): IWidget {
  const marketData: StackedAreaSeriesData[] = [
    {
      name: 'Bull Market',
      data: [60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 70, 65]
    },
    {
      name: 'Bear Market',
      data: [20, 15, 10, 5, 0, 0, 0, 5, 10, 15, 20, 25]
    },
    {
      name: 'Sideways',
      data: [20, 20, 20, 20, 20, 15, 10, 10, 10, 10, 10, 10]
    }
  ];

  return StackedAreaChartBuilder.create()
    .setMultiSeriesData(marketData)
    .setXAxisData(sampleStackedAreaChartXAxis)
    .setTitle('Market Conditions', 'Market Trend Analysis')
    .setSmooth(true)
    .setStack('total')
    .setColors(['#91cc75', '#ee6666', '#fac858'])
    .setAreaStyle('#91cc75', 0.6)
    .setLineStyle(2, '#91cc75', 'solid')
    .setSymbol('circle', 5)
    .setTooltip('axis', '{b}: {c}%')
    .setLegend('horizontal', 'bottom')
    .setHeader('Market Conditions')
    .setPosition({ x: 8, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Update stacked area chart data
 */
export function updateStackedAreaChartData(widget: IWidget): void {
  const newData = sampleStackedAreaChartData.map(series => ({
    ...series,
    data: series.data.map(value => value + Math.random() * 30 - 15) // Add some randomness
  }));

  StackedAreaChartBuilder.updateData(widget, newData);
}

/**
 * Get updated stacked area chart data
 */
export function getUpdatedStackedAreaChartData(): StackedAreaSeriesData[] {
  return sampleStackedAreaChartData.map(series => ({
    ...series,
    data: series.data.map(value => value + Math.random() * 30 - 15)
  }));
}

/**
 * Get alternative stacked area chart data
 */
export function getAlternativeStackedAreaChartData(): StackedAreaSeriesData[] {
  return [
    {
      name: 'Q1',
      data: [150, 180, 220, 280]
    },
    {
      name: 'Q2',
      data: [120, 140, 160, 200]
    },
    {
      name: 'Q3',
      data: [80, 100, 120, 140]
    }
  ];
} 