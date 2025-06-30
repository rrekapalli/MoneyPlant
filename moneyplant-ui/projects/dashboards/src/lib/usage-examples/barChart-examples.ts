import { IWidget } from '../entities/IWidget';
import { BarChartBuilder, BarChartData, BAR_VARIANTS } from '../echart-chart-builders/bar/bar-chart-builder';

/**
 * Examples demonstrating the usage of BarChartBuilder class with various variants
 */

// Sample data for examples
const sampleData: BarChartData[] = [
  { name: 'Q1', value: 45 },
  { name: 'Q2', value: 65 },
  { name: 'Q3', value: 55 },
  { name: 'Q4', value: 75 },
  { name: 'Q5', value: 85 },
];

const categories = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];

/**
 * Example 1: Standard vertical bar chart
 */
export function createVerticalBarChart(): IWidget {
  return BarChartBuilder.create()
    .setData(sampleData)
    .setCategories(categories)
    .setVariant(BAR_VARIANTS.VERTICAL)
    .setHeader('Quarterly Sales - Vertical Bars')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 2: Horizontal bar chart
 */
export function createHorizontalBarChart(): IWidget {
  return BarChartBuilder.create()
    .setData(sampleData)
    .setCategories(categories)
    .setVariant(BAR_VARIANTS.HORIZONTAL)
    .setHeader('Quarterly Sales - Horizontal Bars')
    .setPosition({ x: 4, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 3: Stacked bar chart
 */
export function createStackedBarChart(): IWidget {
  return BarChartBuilder.create()
    .setData(sampleData)
    .setCategories(categories)
    .setVariant(BAR_VARIANTS.STACKED)
    .setHeader('Quarterly Sales - Stacked Bars')
    .setPosition({ x: 8, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 4: Waterfall chart
 */
export function createWaterfallChart(): IWidget {
  const waterfallData: BarChartData[] = [
    { name: 'Starting', value: 900 },
    { name: 'Growth', value: 345 },
    { name: 'Expansion', value: 393 },
    { name: 'Loss 1', value: -108 },
    { name: 'Loss 2', value: -154 },
    { name: 'Recovery', value: 135 },
  ];

  return BarChartBuilder.create()
    .setData(waterfallData)
    .setCategories(waterfallData.map(d => d.name))
    .setVariant(BAR_VARIANTS.WATERFALL)
    .setHeader('Financial Flow - Waterfall Chart')
    .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 5: Advanced vertical bar chart with styling
 */
export function createAdvancedVerticalBarChart(): IWidget {
  return BarChartBuilder.create()
    .setData(sampleData)
    .setCategories(categories)
    .setVariant(BAR_VARIANTS.VERTICAL)
    .setBarWidth('60%')
    .setBarBorderRadius(8)
    .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
    .setCurrencyFormatter('USD', 'en-US')
    .setYAxisName('Revenue ($)')
    .setXAxisName('Quarter')
    .setHeader('Advanced Vertical Bar Chart')
    .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 6: Horizontal bar chart with percentage formatting
 */
export function createHorizontalPercentageBarChart(): IWidget {
  const percentageData: BarChartData[] = [
    { name: 'Sales', value: 85 },
    { name: 'Marketing', value: 72 },
    { name: 'Operations', value: 68 },
    { name: 'Support', value: 91 },
    { name: 'Development', value: 78 },
  ];

  return BarChartBuilder.create()
    .setData(percentageData)
    .setCategories(percentageData.map(d => d.name))
    .setVariant(BAR_VARIANTS.HORIZONTAL)
    .setPercentageFormatter(1)
    .setColors(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'])
    .setXAxisName('Performance (%)')
    .setYAxisName('Department')
    .setHeader('Department Performance - Horizontal')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 7: Multiple series stacked bar chart
 */
export function createMultiSeriesStackedBarChart(): IWidget {
  const stackedData = [
    { name: 'Q1', value: 30, series: 'Product A' },
    { name: 'Q2', value: 35, series: 'Product A' },
    { name: 'Q3', value: 25, series: 'Product A' },
    { name: 'Q4', value: 40, series: 'Product A' },
  ];

  return BarChartBuilder.create()
    .setData(stackedData)
    .setCategories(['Q1', 'Q2', 'Q3', 'Q4'])
    .setVariant(BAR_VARIANTS.STACKED)
    .setColors(['#5470c6', '#91cc75'])
    .setHeader('Multi-Series Stacked Chart')
    .setPosition({ x: 6, y: 8, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 8: Financial waterfall chart with proper formatting
 */
export function createFinancialWaterfallChart(): IWidget {
  const financialData: BarChartData[] = [
    { name: 'Opening Balance', value: 50000 },
    { name: 'Revenue', value: 25000 },
    { name: 'Operating Costs', value: -15000 },
    { name: 'Marketing', value: -8000 },
    { name: 'Investment', value: 12000 },
    { name: 'Closing Balance', value: 64000 },
  ];

  return BarChartBuilder.create()
    .setData(financialData)
    .setCategories(financialData.map(d => d.name))
    .setVariant(BAR_VARIANTS.WATERFALL)
    .setCurrencyFormatter('USD', 'en-US')
    .setColors(['#2ecc71', '#3498db', '#e74c3c', '#e74c3c', '#3498db', '#2ecc71'])
    .setYAxisName('Amount ($)')
    .setHeader('Financial Waterfall Analysis')
    .setPosition({ x: 0, y: 12, cols: 8, rows: 4 })
    .build();
}

/**
 * Example 9: Comparison of all bar chart variants
 */
export function createAllBarVariantsComparison(): IWidget[] {
  const widgets: IWidget[] = [];

  // Vertical bars
  widgets.push(
    BarChartBuilder.create()
      .setData(sampleData)
      .setCategories(categories)
      .setVariant(BAR_VARIANTS.VERTICAL)
      .setHeader('Vertical')
      .setPosition({ x: 0, y: 0, cols: 3, rows: 3 })
      .build()
  );

  // Horizontal bars
  widgets.push(
    BarChartBuilder.create()
      .setData(sampleData)
      .setCategories(categories)
      .setVariant(BAR_VARIANTS.HORIZONTAL)
      .setHeader('Horizontal')
      .setPosition({ x: 3, y: 0, cols: 3, rows: 3 })
      .build()
  );

  // Stacked bars
  widgets.push(
    BarChartBuilder.create()
      .setData(sampleData)
      .setCategories(categories)
      .setVariant(BAR_VARIANTS.STACKED)
      .setHeader('Stacked')
      .setPosition({ x: 6, y: 0, cols: 3, rows: 3 })
      .build()
  );

  // Waterfall chart
  widgets.push(
    BarChartBuilder.create()
      .setData([
        { name: 'Start', value: 100 },
        { name: 'Growth', value: 50 },
        { name: 'Loss', value: -30 },
        { name: 'End', value: 120 }
      ])
      .setCategories(['Start', 'Growth', 'Loss', 'End'])
      .setVariant(BAR_VARIANTS.WATERFALL)
      .setHeader('Waterfall')
      .setPosition({ x: 9, y: 0, cols: 3, rows: 3 })
      .build()
  );

  return widgets;
}

/**
 * Example 10: Dynamic bar chart variant switching
 */
export function createDynamicBarChart(variant: BAR_VARIANTS = BAR_VARIANTS.VERTICAL): IWidget {
  return BarChartBuilder.create()
    .setData(sampleData)
    .setCategories(categories)
    .setVariant(variant)
    .setHeader(`Dynamic Bar Chart - ${variant.charAt(0).toUpperCase() + variant.slice(1)}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 6 })
    .build();
}

/**
 * Example 11: Sales revenue configuration with vertical bars
 */
export function createSalesRevenueChart(): IWidget {
  const revenueData: BarChartData[] = [
    { name: 'Jan', value: 125000 },
    { name: 'Feb', value: 142000 },
    { name: 'Mar', value: 138000 },
    { name: 'Apr', value: 156000 },
    { name: 'May', value: 178000 },
    { name: 'Jun', value: 195000 },
  ];

  return BarChartBuilder.create()
    .setData(revenueData)
    .setCategories(revenueData.map(d => d.name))
    .setVariant(BAR_VARIANTS.VERTICAL)
    .setSalesRevenueConfiguration()
    .setHeader('Monthly Sales Revenue')
    .setPosition({ x: 8, y: 12, cols: 4, rows: 4 })
    .build();
} 