import { IWidget } from '../entities/IWidget';
import { LineChartBuilder, LineChartData, LINE_VARIANTS } from '../echart-chart-builders/line/line-chart-builder';

/**
 * Examples demonstrating the usage of LineChartBuilder class with various variants
 */

// Sample data for examples
const sampleLineData: LineChartData[] = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 132 },
  { name: 'Mar', value: 101 },
  { name: 'Apr', value: 134 },
  { name: 'May', value: 90 },
  { name: 'Jun', value: 230 },
];

const sampleXAxisData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/**
 * Example 1: Basic line chart with default options
 */
export function createBasicLineChart(): IWidget {
  return LineChartBuilder.create()
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setVariant(LINE_VARIANTS.BASIC)
    .setHeader('Basic Line Chart')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 2: Smooth line chart variant
 */
export function createSmoothLineChart(): IWidget {
  return LineChartBuilder.create()
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setVariant(LINE_VARIANTS.SMOOTH)
    .setHeader('Smooth Line Chart')
    .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 3: Area line chart variant
 */
export function createAreaLineChart(): IWidget {
  return LineChartBuilder.create()
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setVariant(LINE_VARIANTS.AREA)
    .setHeader('Area Line Chart')
    .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 4: Stepped line chart variant
 */
export function createSteppedLineChart(): IWidget {
  return LineChartBuilder.create()
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setVariant(LINE_VARIANTS.STEPPED)
    .setHeader('Stepped Line Chart')
    .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 5: Stacked line chart variant
 */
export function createStackedLineChart(): IWidget {
  return LineChartBuilder.create()
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setVariant(LINE_VARIANTS.STACKED)
    .setHeader('Stacked Line Chart')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 6: Financial trend line chart with currency formatting
 */
export function createFinancialTrendChart(): IWidget {
  const financialData = [
    { name: 'Q1', value: 45000 },
    { name: 'Q2', value: 52000 },
    { name: 'Q3', value: 48000 },
    { name: 'Q4', value: 61000 },
  ];

  return LineChartBuilder.create()
    .setData(financialData)
    .setXAxisData(['Q1', 'Q2', 'Q3', 'Q4'])
    .setVariant(LINE_VARIANTS.SMOOTH)
    .setCurrencyFormatter('USD', 'en-US')
    .setXAxisName('Quarter')
    .setYAxisName('Revenue')
    .setHeader('Quarterly Revenue Trend')
    .setPosition({ x: 6, y: 8, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 7: Performance monitoring line chart
 */
export function createPerformanceMonitoringChart(): IWidget {
  const performanceData = [
    { name: 'Week 1', value: 85 },
    { name: 'Week 2', value: 90 },
    { name: 'Week 3', value: 78 },
    { name: 'Week 4', value: 95 },
  ];

  return LineChartBuilder.create()
    .setData(performanceData)
    .setXAxisData(['Week 1', 'Week 2', 'Week 3', 'Week 4'])
    .setVariant(LINE_VARIANTS.AREA)
    .setPercentageFormatter(0)
    .setXAxisName('Time Period')
    .setYAxisName('Performance Score')
    .setHeader('Weekly Performance')
    .setPosition({ x: 0, y: 12, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 8: Advanced line chart with custom configuration
 */
export function createAdvancedLineChart(): IWidget {
  return LineChartBuilder.create()
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setVariant(LINE_VARIANTS.SMOOTH)
    .setLineStyle(3, '#e74c3c', 'dashed')
    .setSymbol('diamond', 8)
    .setXAxisName('Months')
    .setYAxisName('Sales Volume')
    .setTooltip('axis', '{b}: {c} units')
    .setLegend('horizontal', 'top')
    .setHeader('Advanced Line Chart Configuration')
    .setPosition({ x: 6, y: 12, cols: 6, rows: 4 })
    .build();
} 