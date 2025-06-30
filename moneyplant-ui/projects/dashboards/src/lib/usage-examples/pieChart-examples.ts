import { IWidget } from '../entities/IWidget';
import { PieChartBuilder, PieChartData, PIE_VARIANTS } from '../echart-chart-builders/pie/pie-chart-builder';

/**
 * Examples demonstrating the usage of PieChartBuilder class with various variants
 */

// Sample data for examples
const sampleData: PieChartData[] = [
  { value: 45, name: 'Stocks' },
  { value: 25, name: 'Bonds' },
  { value: 15, name: 'Cash' },
  { value: 10, name: 'Real Estate' },
  { value: 5, name: 'Commodities' },
];

/**
 * Example 1: Basic pie chart with default options (Standard variant)
 */
export function createBasicPieChart(): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(PIE_VARIANTS.STANDARD)
    .setHeader('Asset Allocation - Standard Pie Chart')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 2: Doughnut chart variant
 */
export function createDoughnutChart(): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(PIE_VARIANTS.DOUGHNUT)
    .setHeader('Asset Allocation - Doughnut Chart')
    .setPosition({ x: 4, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 3: Nightingale (Rose) chart variant
 */
export function createNightingaleChart(): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(PIE_VARIANTS.NIGHTINGALE)
    .setHeader('Asset Allocation - Nightingale Chart')
    .setPosition({ x: 8, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 4: Half doughnut chart variant
 */
export function createHalfDoughnutChart(): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(PIE_VARIANTS.HALF_DOUGHNUT)
    .setHeader('Asset Allocation - Half Doughnut')
    .setPosition({ x: 0, y: 4, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 5: Nested pie chart variant
 */
export function createNestedPieChart(): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(PIE_VARIANTS.NESTED)
    .setHeader('Asset Allocation - Nested Pie')
    .setPosition({ x: 4, y: 4, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 6: Advanced doughnut chart with custom styling
 */
export function createAdvancedDoughnutChart(): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(PIE_VARIANTS.DOUGHNUT)
    .setTitle('Portfolio Distribution', 'As of December 2024')
    .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
    .setTooltip('item', '{b}: {c} ({d}%)')
    .setLegend('horizontal', 'bottom')
    .setHeader('Advanced Doughnut Chart')
    .setPosition({ x: 8, y: 4, cols: 4, rows: 4 })
    .build();
}

/**
 * Example 7: Financial doughnut chart with currency formatting
 */
export function createFinancialDoughnutChart(): IWidget {
  const financialData: PieChartData[] = [
    { value: 125000, name: 'Stocks' },
    { value: 75000, name: 'Bonds' },
    { value: 45000, name: 'Cash' },
    { value: 30000, name: 'Real Estate' },
    { value: 15000, name: 'Commodities' },
  ];

  return PieChartBuilder.create()
    .setData(financialData)
    .setVariant(PIE_VARIANTS.DOUGHNUT)
    .setFinancialDisplay('USD', 'en-US')
    .setHeader('Financial Portfolio - Doughnut')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 8: Nightingale chart with percentage labels
 */
export function createNightingaleWithPercentages(): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(PIE_VARIANTS.NIGHTINGALE)
    .setPercentageLabels(true, 2)
    .setColors(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'])
    .setHeader('Nightingale Chart with Percentages')
    .setPosition({ x: 6, y: 8, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 9: Comparison of all variants in a dashboard
 */
export function createAllVariantsComparison(): IWidget[] {
  const widgets: IWidget[] = [];

  // Standard pie chart
  widgets.push(
    PieChartBuilder.create()
      .setData(sampleData)
      .setVariant(PIE_VARIANTS.STANDARD)
      .setHeader('Standard Pie')
      .setPosition({ x: 0, y: 0, cols: 3, rows: 3 })
      .build()
  );

  // Doughnut chart
  widgets.push(
    PieChartBuilder.create()
      .setData(sampleData)
      .setVariant(PIE_VARIANTS.DOUGHNUT)
      .setHeader('Doughnut')
      .setPosition({ x: 3, y: 0, cols: 3, rows: 3 })
      .build()
  );

  // Nightingale chart
  widgets.push(
    PieChartBuilder.create()
      .setData(sampleData)
      .setVariant(PIE_VARIANTS.NIGHTINGALE)
      .setHeader('Nightingale')
      .setPosition({ x: 6, y: 0, cols: 3, rows: 3 })
      .build()
  );

  // Half doughnut
  widgets.push(
    PieChartBuilder.create()
      .setData(sampleData)
      .setVariant(PIE_VARIANTS.HALF_DOUGHNUT)
      .setHeader('Half Doughnut')
      .setPosition({ x: 9, y: 0, cols: 3, rows: 3 })
      .build()
  );

  return widgets;
}

/**
 * Example 10: Dynamic variant switching (for interactive dashboards)
 */
export function createDynamicPieChart(variant: PIE_VARIANTS = PIE_VARIANTS.STANDARD): IWidget {
  return PieChartBuilder.create()
    .setData(sampleData)
    .setVariant(variant)
    .setHeader(`Dynamic Pie Chart - ${variant.charAt(0).toUpperCase() + variant.slice(1)}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 6 })
    .build();
} 