import { AreaChartBuilder, AreaChartData, AreaChartConfiguration } from '@dashboards/public-api';
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
 * Create area chart factory for reusable chart creation
 * This factory can be used to create multiple area charts with consistent styling
 */
export const createAreaChartFactory = () => {
  return AreaChartBuilder.create().createFactory();
};

/**
 * Create a basic area chart widget using default configuration
 */
export function createAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setXAxisData(sampleAreaChartXAxis)
    .setTitle('Monthly Revenue Trend', 'Last 12 months')
    .setHeader('Revenue Trend')
    .setPosition({ x: 6, y: 0, cols: 6, rows: 8 })
    .withRuntimeCustomization((chartOptions, seriesOptions) => {
      // Custom runtime adjustments
      seriesOptions.smooth = true;
      seriesOptions.lineStyle = { width: 3, color: '#5470c6', type: 'solid' };
      seriesOptions.symbolSize = 6;
      if (chartOptions.tooltip) {
        chartOptions.tooltip.formatter = '{b}: ${c}K';
      }
    })
    .build();
}

/**
 * Create a financial area chart widget using financial preset
 */
export function createFinancialAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .useConfiguration(AreaChartConfiguration.FINANCIAL)
    .setData([]) // Data will be populated from shared dashboard data
    .setXAxisData(sampleAreaChartXAxis)
    .setTitle('Financial Overview', 'Revenue vs Expenses vs Profit')
    .setHeader('Financial Overview')
    .setPosition({ x: 0, y: 4, cols: 8, rows: 4 })
    .build();
}

/**
 * Create a performance monitoring area chart using performance preset
 */
export function createPerformanceAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .useConfiguration(AreaChartConfiguration.PERFORMANCE)
    .setData([]) // Data will be populated from shared dashboard data
    .setXAxisData([]) // Will be populated from data
    .setTitle('Performance Monitoring', '500 data points with sampling')
    .setHeader('Performance Monitoring')
    .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Create a stacked area chart widget using stacked preset
 */
export function createStackedAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .useConfiguration(AreaChartConfiguration.STACKED)
    .setData([]) // Data will be populated from shared dashboard data
    .setXAxisData(sampleAreaChartXAxis)
    .setTitle('Stacked Area Analysis', 'Multiple data series')
    .setHeader('Stacked Analysis')
    .setPosition({ x: 0, y: 8, cols: 8, rows: 4 })
    .build();
}

/**
 * Create multiple area chart variations using the configurable builder
 */
export function createAreaChartVariations(): IWidget[] {
  return AreaChartBuilder.createVariations(() => AreaChartBuilder.create(), [
    {
      name: 'revenue-trend',
      config: (builder) => 
        builder
          .setData(sampleAreaChartData.map(d => d.value))
          .setXAxisData(sampleAreaChartXAxis)
          .setTitle('Revenue Trend')
          .setHeader('Monthly Revenue')
          .setPosition({ x: 0, y: 0, cols: 6, rows: 4 }),
      preset: AreaChartConfiguration.FINANCIAL
    },
    {
      name: 'performance-monitor',
      config: (builder) => 
        builder
          .setData(sampleAreaChartData.map(d => d.value * 0.8))
          .setXAxisData(sampleAreaChartXAxis)
          .setTitle('Performance Monitor')
          .setHeader('System Performance')
          .setPosition({ x: 6, y: 0, cols: 6, rows: 4 }),
      preset: AreaChartConfiguration.PERFORMANCE
    },
    {
      name: 'minimal-view',
      config: (builder) => 
        builder
          .setData(sampleAreaChartData.map(d => d.value * 1.2))
          .setXAxisData(sampleAreaChartXAxis)
          .setHeader('Clean View')
          .setPosition({ x: 0, y: 4, cols: 6, rows: 4 }),
      preset: AreaChartConfiguration.MINIMAL
    }
  ]);
}

/**
 * Create area chart with custom configuration callback
 * Demonstrates the flexible configuration approach
 */
export function createCustomAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .createWithCustomConfig((builder) => 
      builder
        .setSmooth(true)
        .setGradientAreaStyle('#5470c6', '#91cc75', 0.4)
        .setLineStyle(3, '#5470c6', 'solid')
        .setSymbol('circle', 6)
        .setTooltip('axis', '{b}: ${c}K')
        .setLegend('horizontal', 'bottom')
        .setTitle('Custom Gradient Area Chart', 'With smooth curves')
    )
    .setData([]) // Data will be populated from shared dashboard data
    .setXAxisData(sampleAreaChartXAxis)
    .setHeader('Custom Chart')
    .setPosition({ x: 6, y: 8, cols: 6, rows: 4 })
    .build();
}

/**
 * Update area chart data using the enhanced builder
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

/**
 * Demo function showing all available configurations
 */
export function getAvailableAreaChartConfigurations(): string[] {
  return AreaChartBuilder.create().getAvailableConfigurations();
}

/**
 * Factory-based area chart creation with different presets
 */
export const AreaChartWidgetFactory = {
  /**
   * Create financial area chart
   */
  createFinancial: (data?: number[], xAxisData?: string[]) => {
    const factory = createAreaChartFactory();
    return factory(data, (builder) => 
      builder
        .useConfiguration(AreaChartConfiguration.FINANCIAL)
        .setXAxisData(xAxisData || sampleAreaChartXAxis)
    );
  },

  /**
   * Create performance area chart
   */
  createPerformance: (data?: number[], xAxisData?: string[]) => {
    const factory = createAreaChartFactory();
    return factory(data, (builder) => 
      builder
        .useConfiguration(AreaChartConfiguration.PERFORMANCE)
        .setXAxisData(xAxisData || sampleAreaChartXAxis)
    );
  },

  /**
   * Create stacked area chart
   */
  createStacked: (data?: number[], xAxisData?: string[]) => {
    const factory = createAreaChartFactory();
    return factory(data, (builder) => 
      builder
        .useConfiguration(AreaChartConfiguration.STACKED)
        .setXAxisData(xAxisData || sampleAreaChartXAxis)
    );
  },

  /**
   * Create minimal area chart
   */
  createMinimal: (data?: number[], xAxisData?: string[]) => {
    const factory = createAreaChartFactory();
    return factory(data, (builder) => 
      builder
        .useConfiguration(AreaChartConfiguration.MINIMAL)
        .setXAxisData(xAxisData || sampleAreaChartXAxis)
    );
  }
}; 