import { PolarChartBuilder, PolarChartData } from '@dashboards/public-api';
import { IWidget } from '@dashboards/public-api';

/**
 * Sample data for polar chart widget
 */
export const samplePolarChartData: PolarChartData[] = [
  { name: '0°', value: 80 },
  { name: '45°', value: 65 },
  { name: '90°', value: 90 },
  { name: '135°', value: 75 },
  { name: '180°', value: 85 },
  { name: '225°', value: 70 },
  { name: '270°', value: 95 },
  { name: '315°', value: 60 }
];

/**
 * Create a basic polar chart widget
 */
export function createPolarChartWidget(): IWidget {
  return PolarChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Performance Metrics', '360-degree view')
    .setPolarCenter(['50%', '50%'])
    .setPolarRadius(['30%', '80%'])
    .setStartAngle(0)
    .setEndAngle(360)
    .setSmooth(true)
    .setGradientAreaStyle('#5470c6', '#91cc75', 0.4)
    .setLineStyle(3, '#5470c6', 'solid')
    .setSymbol('circle', 8)
    .setTooltip('item', '{b}: {c}')
    .setLegend('horizontal', 'bottom')
    .setHeader('Performance Metrics')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 8 })
    .build();
}

/**
 * Create a multi-series polar chart widget for financial data
 */
export function createMultiSeriesPolarChartWidget(): IWidget {
  return PolarChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Financial Performance', 'Current vs Target vs Previous')
    .setPolarCenter(['50%', '50%'])
    .setPolarRadius(['25%', '75%'])
    .setStartAngle(0)
    .setEndAngle(360)
    .setSmooth(true)
    .setAreaStyle('#5470c6', 0.3)
    .setLineStyle(2, '#5470c6', 'solid')
    .setSymbol('circle', 6)
    .setTooltip('item', '{b}: {c}')
    .setLegend('horizontal', 'bottom')
    .setHeader('Financial Performance')
    .setPosition({ x: 6, y: 8, cols: 6, rows: 8 })
    .build();
}

/**
 * Create a radar-style polar chart widget
 */
export function createRadarPolarChartWidget(): IWidget {
  return PolarChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Business Metrics', 'Radar view of key performance indicators')
    .setPolarCenter(['50%', '50%'])
    .setPolarRadius(['20%', '70%'])
    .setStartAngle(0)
    .setEndAngle(360)
    .setSmooth(true)
    .setGradientAreaStyle('#ff6b6b', '#4ecdc4', 0.4)
    .setLineStyle(3, '#ff6b6b', 'solid')
    .setSymbol('diamond', 8)
    .setTooltip('item', '{b}: {c}%')
    .setLegend('horizontal', 'bottom')
    .setHeader('Business Metrics')
    .setPosition({ x: 0, y: 12, cols: 8, rows: 8 })
    .build();
}

/**
 * Update polar chart data
 */
export function updatePolarChartData(widget: IWidget): void {
  const newData = samplePolarChartData.map(item => ({
    ...item,
    value: item.value + Math.random() * 30 - 15 // Add some randomness
  }));

  PolarChartBuilder.updateData(widget, newData.map(item => item.value));
}

/**
 * Get updated polar chart data
 */
export function getUpdatedPolarChartData(): PolarChartData[] {
  return samplePolarChartData.map(item => ({
    ...item,
    value: item.value + Math.random() * 30 - 15
  }));
}

/**
 * Get alternative polar chart data
 */
export function getAlternativePolarChartData(): PolarChartData[] {
  return [
    { name: 'Q1', value: 75 },
    { name: 'Q2', value: 85 },
    { name: 'Q3', value: 90 },
    { name: 'Q4', value: 80 },
    { name: 'Q5', value: 95 },
    { name: 'Q6', value: 70 }
  ];
} 