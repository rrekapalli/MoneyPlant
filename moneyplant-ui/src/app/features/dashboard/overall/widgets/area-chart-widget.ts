import { AreaChartBuilder, AreaChartData } from '@dashboards/public-api';
import { IWidget } from '@dashboards/public-api';

/**
 * Sample data for area chart widget
 */
export const sampleAreaChartData: AreaChartData[] = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 132 },
  { name: 'Mar', value: 101 },
  { name: 'Apr', value: 134 },
  { name: 'May', value: 90 },
  { name: 'Jun', value: 230 },
  { name: 'Jul', value: 210 },
  { name: 'Aug', value: 182 },
  { name: 'Sep', value: 191 },
  { name: 'Oct', value: 234 },
  { name: 'Nov', value: 290 },
  { name: 'Dec', value: 330 }
];

export const sampleAreaChartXAxis = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Create a basic area chart widget
 */
export function createAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .setData(sampleAreaChartData.map(item => item.value))
    .setXAxisData(sampleAreaChartXAxis)
    .setTitle('Monthly Revenue Trend', 'Last 12 months')
    .setSmooth(true)
    .setGradientAreaStyle('#5470c6', '#91cc75', 0.4)
    .setLineStyle(3, '#5470c6', 'solid')
    .setSymbol('circle', 6)
    .setTooltip('axis', '{b}: ${c}K')
    .setLegend('horizontal', 'bottom')
    .setHeader('Revenue Trend')
    .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Create a stacked area chart widget for financial data
 */
export function createStackedAreaChartWidget(): IWidget {
  const multiSeriesData = [
    { name: 'Revenue', data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330] },
    { name: 'Expenses', data: [80, 92, 71, 94, 60, 180, 160, 132, 141, 184, 240, 280] },
    { name: 'Profit', data: [40, 40, 30, 40, 30, 50, 50, 50, 50, 50, 50, 50] }
  ];

  return AreaChartBuilder.create()
    .setData(multiSeriesData)
    .setXAxisData(sampleAreaChartXAxis)
    .setTitle('Financial Overview', 'Revenue vs Expenses vs Profit')
    .setSmooth(true)
    .setStack('total')
    .setAreaStyle('#5470c6', 0.6)
    .setLineStyle(2, '#5470c6', 'solid')
    .setSymbol('circle', 5)
    .setTooltip('axis', '{b}: ${c}K')
    .setLegend('horizontal', 'bottom')
    .setHeader('Financial Overview')
    .setPosition({ x: 0, y: 4, cols: 8, rows: 4 })
    .build();
}

/**
 * Create a large-scale area chart widget for performance monitoring
 */
export function createLargeScaleAreaChartWidget(): IWidget {
  // Generate large dataset for performance demonstration
  const largeDataset = Array.from({ length: 500 }, (_, i) => ({
    name: `Point ${i + 1}`,
    value: Math.random() * 100 + Math.sin(i * 0.1) * 20 + 50
  }));

  return AreaChartBuilder.create()
    .setData(largeDataset.map(item => item.value))
    .setXAxisData(largeDataset.map(item => item.name))
    .setTitle('Performance Monitoring', '500 data points with sampling')
    .setSmooth(true)
    .setSampling('average')
    .setGradientAreaStyle('#ff6b6b', '#4ecdc4', 0.3)
    .setLineStyle(1, '#ff6b6b', 'solid')
    .setShowSymbol(false)
    .setTooltip('axis', '{b}: {c}')
    .setLegend('horizontal', 'bottom')
    .setHeader('Performance Monitoring')
    .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Update area chart data
 */
export function updateAreaChartData(widget: IWidget): void {
  const newData = sampleAreaChartData.map(item => ({
    ...item,
    value: item.value + Math.random() * 50 - 25 // Add some randomness
  }));

  AreaChartBuilder.updateData(widget, newData.map(item => item.value));
}

/**
 * Get updated area chart data
 */
export function getUpdatedAreaChartData(): AreaChartData[] {
  return sampleAreaChartData.map(item => ({
    ...item,
    value: item.value + Math.random() * 50 - 25
  }));
}

/**
 * Get alternative area chart data
 */
export function getAlternativeAreaChartData(): AreaChartData[] {
  return [
    { name: 'Q1', value: 150 },
    { name: 'Q2', value: 180 },
    { name: 'Q3', value: 220 },
    { name: 'Q4', value: 280 }
  ];
} 