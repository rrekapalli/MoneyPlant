/**
 * Line Chart Configuration Usage Examples
 * 
 * This file demonstrates various usage patterns for the enhanced LineChartBuilder
 * with configurable presets and flexible customization options.
 */

import { LineChartBuilder } from '../echart-chart-builders/line/line-chart-builder';
import { LineChartConfiguration } from '../echart-chart-builders/chart-configurations';
import { IWidget } from '../entities/IWidget';

// Sample data for examples
const sampleLineData = [65, 70, 80, 81, 56, 75, 88, 92, 78, 85, 90, 95];
const sampleXAxisData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const timeSeriesData = Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.1) * 50 + 100 + Math.random() * 20);

/**
 * Example 1: Basic line chart with default configuration
 */
export function createDefaultLineChart(): IWidget {
  return LineChartBuilder.create()
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setHeader('Monthly Performance')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 2: Financial line chart using preset configuration
 */
export function createFinancialLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.FINANCIAL)
    .setData(sampleLineData.map(v => v * 1000)) // Convert to thousands
    .setXAxisData(sampleXAxisData)
    .setHeader('Revenue Trend')
    .setYAxisName('Revenue ($K)')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Example 3: Performance monitoring line chart
 */
export function createPerformanceLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.PERFORMANCE)
    .setData([78, 82, 85, 88, 84, 90, 92, 89, 91, 94, 96, 98])
    .setXAxisData(sampleXAxisData)
    .setHeader('System Performance')
    .setYAxisName('Performance Score (%)')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 4: Smooth line chart
 */
export function createSmoothLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.SMOOTH)
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setSmooth(true)
    .setAreaStyle('#5470c6', 0.2)
    .setHeader('Smooth Trend Analysis')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 5: Stepped line chart
 */
export function createSteppedLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.STEPPED)
    .setData([10, 15, 15, 20, 20, 25, 30, 30, 35, 40, 40, 45])
    .setXAxisData(sampleXAxisData)
    .setStep('middle')
    .setHeader('Step Function Data')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 6: Time series line chart for large datasets
 */
export function createTimeSeriesLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.TIME_SERIES)
    .setData(timeSeriesData)
    .setXAxisData(timeSeriesData.map((_, i) => `Point ${i + 1}`))
    .setSampling('lttb')
    .setHeader('Time Series Analysis')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Example 7: Minimal clean line chart
 */
export function createMinimalLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.MINIMAL)
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setHeader('Clean Trend View')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 3 })
    .build();
}

/**
 * Example 8: Multi-axis line chart
 */
export function createMultiAxisLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.MULTI_AXIS)
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setHeader('Multi-Series Analysis')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Example 9: Custom configuration with runtime customization
 */
export function createCustomLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.DEFAULT)
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setSmooth(true)
    .setSymbol('diamond', 8)
    .setLineStyle(3, '#e91e63', 'solid')
    .setAreaStyle('#e91e63', 0.3)
    .setLabel(true, 'top', '{c}%')
    .setHeader('Custom Styled Line')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .withRuntimeCustomization((chartOptions, seriesOptions) => {
      // Add gradient area style
      seriesOptions.areaStyle = {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#e91e63' },
            { offset: 1, color: 'rgba(233, 30, 99, 0.1)' }
          ],
        },
        opacity: 0.8,
      };
      if (chartOptions.tooltip) {
        chartOptions.tooltip.formatter = '{b}: {c}%';
      }
    })
    .build();
}

/**
 * Example 10: Factory pattern usage
 */
export function createLineChartFactory() {
  return LineChartBuilder.create().createFactory();
}

export function createLineChartsUsingFactory(): IWidget[] {
  const factory = createLineChartFactory();
  
  return [
    factory(sampleLineData, (builder) => 
      builder
        .useConfiguration(LineChartConfiguration.FINANCIAL)
        .setXAxisData(sampleXAxisData)
        .setHeader('Factory Financial Line')
        .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    ),
    factory(sampleLineData.map(v => v * 0.8), (builder) => 
      builder
        .useConfiguration(LineChartConfiguration.SMOOTH)
        .setXAxisData(sampleXAxisData)
        .setHeader('Factory Smooth Line')
        .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
    )
  ];
}

/**
 * Example 11: Multiple variations using createVariations
 */
export function createLineChartVariations(): IWidget[] {
  return LineChartBuilder.createVariations(() => LineChartBuilder.create(), [
    {
      name: 'monthly-trend',
      config: (builder) => 
        builder
          .setData(sampleLineData)
          .setXAxisData(sampleXAxisData)
          .setHeader('Monthly Trend')
          .setPosition({ x: 0, y: 0, cols: 4, rows: 4 }),
      preset: LineChartConfiguration.DEFAULT
    },
    {
      name: 'smooth-analysis',
      config: (builder) => 
        builder
          .setData(sampleLineData.map(v => v * 1.1))
          .setXAxisData(sampleXAxisData)
          .setHeader('Smooth Analysis')
          .setPosition({ x: 4, y: 0, cols: 4, rows: 4 }),
      preset: LineChartConfiguration.SMOOTH
    },
    {
      name: 'performance-monitor',
      config: (builder) => 
        builder
          .setData(sampleLineData.map(v => Math.min(v + 10, 100)))
          .setXAxisData(sampleXAxisData)
          .setHeader('Performance Monitor')
          .setPosition({ x: 8, y: 0, cols: 4, rows: 4 }),
      preset: LineChartConfiguration.PERFORMANCE
    }
  ]);
}

/**
 * Example 12: Advanced custom configuration with callback
 */
export function createAdvancedCustomLineChart(): IWidget {
  return LineChartBuilder.create()
    .createWithCustomConfig((builder) => 
      builder
        .setSmooth(true)
        .setSymbol('circle', 6)
        .setLineStyle(2, '#9C27B0', 'solid')
        .setAreaStyle('#9C27B0', 0.2)
        .setConnectNulls(true)
        .setTitle('Advanced Custom Line Chart', 'With complex styling')
        .setTooltip('axis', '{b}: {c}%')
        .setLegend('horizontal', 'top')
    )
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setHeader('Advanced Custom Line')
    .setPosition({ x: 0, y: 0, cols: 12, rows: 6 })
    .build();
}

/**
 * Example 13: Stacked line chart
 */
export function createStackedLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.DEFAULT)
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setStack('total')
    .setAreaStyle('#5470c6', 0.6)
    .setHeader('Stacked Line Analysis')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
    .build();
}

/**
 * Example 14: Line chart with no symbols (clean line)
 */
export function createCleanLineChart(): IWidget {
  return LineChartBuilder.create()
    .useConfiguration(LineChartConfiguration.MINIMAL)
    .setData(sampleLineData)
    .setXAxisData(sampleXAxisData)
    .setShowSymbol(false)
    .setSmooth(true)
    .setLineStyle(1, '#607D8B', 'solid')
    .setHeader('Clean Line View')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 3 })
    .build();
}

/**
 * Helper function to get all available line chart configurations
 */
export function getAvailableLineChartConfigurations(): string[] {
  return LineChartBuilder.create().getAvailableConfigurations();
}

/**
 * Demo function showing all line chart examples
 */
export function getAllLineChartExamples(): IWidget[] {
  return [
    createDefaultLineChart(),
    createFinancialLineChart(),
    createPerformanceLineChart(),
    createSmoothLineChart(),
    createSteppedLineChart(),
    createTimeSeriesLineChart(),
    createMinimalLineChart(),
    createMultiAxisLineChart(),
    createCustomLineChart(),
    createAdvancedCustomLineChart(),
    createStackedLineChart(),
    createCleanLineChart(),
    ...createLineChartsUsingFactory(),
    ...createLineChartVariations()
  ];
} 