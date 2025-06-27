/**
 * Bar Chart Configuration Usage Examples
 * 
 * This file demonstrates various usage patterns for the enhanced BarChartBuilder
 * with configurable presets and flexible customization options.
 */

import { BarChartBuilder, BarChartConfiguration, IWidget } from '../public-api';

// Sample data for examples
const sampleBarData = [120, 200, 150, 80, 70, 110, 130];
const sampleCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const sampleStackedData = {
  series1: [20, 30, 25, 15, 18, 22, 28],
  series2: [15, 25, 20, 12, 16, 18, 20],
  series3: [10, 15, 12, 8, 10, 12, 14]
};

/**
 * Example 1: Basic bar chart with default configuration
 */
export function createDefaultBarChart(): IWidget {
  return BarChartBuilder.create()
    .setData(sampleBarData)
    .setCategories(sampleCategories)
    .setHeader('Weekly Sales')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 2: Financial bar chart using preset configuration
 */
export function createFinancialBarChart(): IWidget {
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.FINANCIAL)
    .setData(sampleBarData)
    .setCategories(sampleCategories)
    .setHeader('Revenue Analysis')
    .setYAxisName('Revenue ($K)')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Example 3: Performance monitoring bar chart
 */
export function createPerformanceBarChart(): IWidget {
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.PERFORMANCE)
    .setData([85, 92, 78, 88, 95, 82, 89])
    .setCategories(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'])
    .setHeader('Performance Metrics')
    .setYAxisName('Score (%)')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 4: Horizontal bar chart
 */
export function createHorizontalBarChart(): IWidget {
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.HORIZONTAL)
    .setData(sampleBarData)
    .setCategories(['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F', 'Product G'])
    .setHorizontal(true)
    .setHeader('Product Sales Comparison')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
    .build();
}

/**
 * Example 5: Stacked bar chart
 */
export function createStackedBarChart(): IWidget {
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.STACKED)
    .setData(sampleStackedData.series1)
    .setCategories(sampleCategories)
    .setStack('total')
    .setHeader('Stacked Revenue Analysis')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Example 6: Minimal clean bar chart
 */
export function createMinimalBarChart(): IWidget {
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.MINIMAL)
    .setData(sampleBarData)
    .setCategories(sampleCategories)
    .setHeader('Clean Sales View')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 3 })
    .build();
}

/**
 * Example 7: Custom configuration with runtime customization
 */
export function createCustomBarChart(): IWidget {
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.DEFAULT)
    .setData(sampleBarData)
    .setCategories(sampleCategories)
    .setBarWidth('60%')
    .setBarBorderRadius(8)
    .setColors(['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548'])
    .setLabel(true, 'top', '{c}')
    .setHeader('Custom Styled Bars')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .withRuntimeCustomization((chartOptions, seriesOptions) => {
      // Add custom shadow effect
      seriesOptions.itemStyle = {
        ...seriesOptions.itemStyle,
        borderWidth: 2,
        borderColor: '#fff'
      };
      if (chartOptions.tooltip) {
        chartOptions.tooltip.formatter = '{b}: ${c}K';
      }
    })
    .build();
}

/**
 * Example 8: Factory pattern usage
 */
export function createBarChartFactory() {
  return BarChartBuilder.create().createFactory();
}

export function createBarChartsUsingFactory(): IWidget[] {
  const factory = createBarChartFactory();
  
  return [
    factory(sampleBarData, (builder) => 
      builder
        .useConfiguration(BarChartConfiguration.FINANCIAL)
        .setCategories(sampleCategories)
        .setHeader('Factory Financial Chart')
        .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    ),
    factory(sampleBarData.map(v => v * 0.8), (builder) => 
      builder
        .useConfiguration(BarChartConfiguration.PERFORMANCE)
        .setCategories(sampleCategories)
        .setHeader('Factory Performance Chart')
        .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
    )
  ];
}

/**
 * Example 9: Multiple variations using createVariations
 */
export function createBarChartVariations(): IWidget[] {
  return BarChartBuilder.createVariations(() => BarChartBuilder.create(), [
    {
      name: 'weekly-sales',
      config: (builder) => 
        builder
          .setData(sampleBarData)
          .setCategories(sampleCategories)
          .setHeader('Weekly Sales')
          .setPosition({ x: 0, y: 0, cols: 4, rows: 4 }),
      preset: BarChartConfiguration.DEFAULT
    },
    {
      name: 'financial-view',
      config: (builder) => 
        builder
          .setData(sampleBarData.map(v => v * 1.2))
          .setCategories(sampleCategories)
          .setHeader('Financial View')
          .setPosition({ x: 4, y: 0, cols: 4, rows: 4 }),
      preset: BarChartConfiguration.FINANCIAL
    },
    {
      name: 'horizontal-comparison',
      config: (builder) => 
        builder
          .setData(sampleBarData)
          .setCategories(sampleCategories)
          .setHorizontal(true)
          .setHeader('Horizontal Comparison')
          .setPosition({ x: 8, y: 0, cols: 4, rows: 4 }),
      preset: BarChartConfiguration.HORIZONTAL
    }
  ]);
}

/**
 * Example 10: Advanced custom configuration with callback
 */
export function createAdvancedCustomBarChart(): IWidget {
  return BarChartBuilder.create()
    .createWithCustomConfig((builder) => 
      builder
        .setBarWidth('50%')
        .setBarGap('20%')
        .setBarCategoryGap('40%')
        .setColors(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
        .setTitle('Advanced Custom Bar Chart', 'With complex styling')
        .setTooltip('axis', '{b}: {c} units')
        .setLegend('horizontal', 'top')
    )
    .setData(sampleBarData)
    .setCategories(sampleCategories)
    .setHeader('Advanced Custom Chart')
    .setPosition({ x: 0, y: 0, cols: 12, rows: 6 })
    .build();
}

/**
 * Example 11: Waterfall chart configuration
 */
export function createWaterfallBarChart(): IWidget {
  const waterfallData = [100, 50, -20, 30, -10, 15, -5];
  const waterfallCategories = ['Starting', 'Q1 Gain', 'Q1 Loss', 'Q2 Gain', 'Q2 Loss', 'Q3 Gain', 'Q3 Loss'];
  
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.WATERFALL)
    .setData(waterfallData)
    .setCategories(waterfallCategories)
    .setColors(['#4CAF50', '#4CAF50', '#F44336', '#4CAF50', '#F44336', '#4CAF50', '#F44336'])
    .setHeader('Waterfall Analysis')
    .setYAxisName('Value Change')
    .setPosition({ x: 0, y: 0, cols: 10, rows: 5 })
    .build();
}

/**
 * Example 12: Grouped bar chart
 */
export function createGroupedBarChart(): IWidget {
  return BarChartBuilder.create()
    .useConfiguration(BarChartConfiguration.GROUPED)
    .setData(sampleBarData)
    .setCategories(sampleCategories)
    .setBarGap('10%')
    .setBarCategoryGap('20%')
    .setHeader('Grouped Bar Analysis')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Helper function to get all available bar chart configurations
 */
export function getAvailableBarChartConfigurations(): string[] {
  return BarChartBuilder.create().getAvailableConfigurations();
}

/**
 * Demo function showing all bar chart examples
 */
export function getAllBarChartExamples(): IWidget[] {
  return [
    createDefaultBarChart(),
    createFinancialBarChart(),
    createPerformanceBarChart(),
    createHorizontalBarChart(),
    createStackedBarChart(),
    createMinimalBarChart(),
    createCustomBarChart(),
    createAdvancedCustomBarChart(),
    createWaterfallBarChart(),
    createGroupedBarChart(),
    ...createBarChartsUsingFactory(),
    ...createBarChartVariations()
  ];
} 