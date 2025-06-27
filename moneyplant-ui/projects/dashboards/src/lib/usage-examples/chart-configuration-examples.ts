import { IWidget } from '../entities/IWidget';
import { AreaChartBuilder } from '../echart-chart-builders/area/area-chart-builder';
import { 
  ChartConfiguration, 
  AreaChartConfiguration, 
  BarChartConfiguration, 
  LineChartConfiguration, 
  PieChartConfiguration,
  ChartConfigurationHelper 
} from '../echart-chart-builders/chart-configurations';

/**
 * Chart Configuration Examples
 * 
 * This file demonstrates how to use the chart configuration enums
 * instead of hardcoded strings for type-safe chart creation.
 */

// Sample data for examples
const sampleData = [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330];
const sampleXAxis = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Example 1: Using General Chart Configurations
 */
export function createAreaChartWithGeneralConfigs(): IWidget[] {
  return [
    // Default configuration
    AreaChartBuilder.create()
      .useConfiguration(ChartConfiguration.DEFAULT)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Default Style')
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build(),

    // Financial configuration
    AreaChartBuilder.create()
      .useConfiguration(ChartConfiguration.FINANCIAL)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Financial Style')
      .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
      .build(),

    // Performance configuration
    AreaChartBuilder.create()
      .useConfiguration(ChartConfiguration.PERFORMANCE)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Performance Style')
      .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
      .build(),

    // Minimal configuration
    AreaChartBuilder.create()
      .useConfiguration(ChartConfiguration.MINIMAL)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Minimal Style')
      .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
      .build()
  ];
}

/**
 * Example 2: Using Area Chart Specific Configurations
 */
export function createAreaChartWithSpecificConfigs(): IWidget[] {
  return [
    // Area chart specific: Smooth Gradient
    AreaChartBuilder.create()
      .useConfiguration(AreaChartConfiguration.SMOOTH_GRADIENT)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Smooth Gradient Style')
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build(),

    // Area chart specific: Multi-series
    AreaChartBuilder.create()
      .useConfiguration(AreaChartConfiguration.MULTI_SERIES)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Multi-series Style')
      .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
      .build(),

    // Area chart specific: Large dataset
    AreaChartBuilder.create()
      .useConfiguration(AreaChartConfiguration.LARGE_DATASET)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Large Dataset Style')
      .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
      .build(),

    // Area chart specific: Stacked
    AreaChartBuilder.create()
      .useConfiguration(AreaChartConfiguration.STACKED)
      .setData(sampleData)
      .setXAxisData(sampleXAxis)
      .setHeader('Stacked Style')
      .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
      .build()
  ];
}

/**
 * Example 3: Configuration Validation and Helper Functions
 */
export function demonstrateConfigurationHelpers(): void {
  // Get all configurations for area charts
  const areaConfigs = ChartConfigurationHelper.getConfigurationsForChartType('area');
  console.log('Available area chart configurations:', areaConfigs);

  // Validate configuration support
  const isSupported = ChartConfigurationHelper.isConfigurationSupportedForChartType(
    AreaChartConfiguration.FINANCIAL, 
    'area'
  );
  console.log('Is FINANCIAL config supported for area charts?', isSupported);

  // Get configuration metadata
  const metadata = ChartConfigurationHelper.getConfigurationMetadata(ChartConfiguration.FINANCIAL);
  console.log('Financial configuration metadata:', metadata);

  // Get configurations by use case
  const dashboardConfigs = ChartConfigurationHelper.getConfigurationsByUseCase('dashboard');
  console.log('Dashboard-optimized configurations:', dashboardConfigs);
}

/**
 * Example 4: Using Configuration Enums in Factory Pattern
 */
export class TypeSafeChartFactory {
  /**
   * Create area chart with specific configuration
   */
  static createAreaChart(
    config: AreaChartConfiguration,
    data: number[],
    xAxisData: string[]
  ): IWidget {
    return AreaChartBuilder.create()
      .useConfiguration(config)
      .setData(data)
      .setXAxisData(xAxisData)
      .setHeader(`Area Chart - ${config}`)
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build();
  }

  /**
   * Create multiple area chart variations
   */
  static createAreaChartVariations(data: number[], xAxisData: string[]): IWidget[] {
    const configurations: AreaChartConfiguration[] = [
      AreaChartConfiguration.DEFAULT,
      AreaChartConfiguration.FINANCIAL,
      AreaChartConfiguration.PERFORMANCE,
      AreaChartConfiguration.MINIMAL
    ];

    return configurations.map((config, index) => 
      AreaChartBuilder.create()
        .useConfiguration(config)
        .setData(data)
        .setXAxisData(xAxisData)
        .setHeader(`Variation ${index + 1} - ${config}`)
        .setPosition({ x: (index % 2) * 6, y: Math.floor(index / 2) * 4, cols: 6, rows: 4 })
        .build()
    );
  }
}

/**
 * Example 5: Runtime Configuration Selection
 */
export function createChartWithRuntimeConfig(
  chartType: 'financial' | 'performance' | 'minimal',
  data: number[],
  xAxisData: string[]
): IWidget {
  // Map string types to enum values for type safety
  const configMap: Record<string, AreaChartConfiguration> = {
    financial: AreaChartConfiguration.FINANCIAL,
    performance: AreaChartConfiguration.PERFORMANCE,
    minimal: AreaChartConfiguration.MINIMAL
  };

  const config = configMap[chartType] || AreaChartConfiguration.DEFAULT;

  return AreaChartBuilder.create()
    .useConfiguration(config)
    .setData(data)
    .setXAxisData(xAxisData)
    .setHeader(`Runtime Config - ${chartType}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 6: Configuration Comparison
 */
export function createConfigurationComparison(): IWidget[] {
  const configs = [
    { config: AreaChartConfiguration.DEFAULT, name: 'Default' },
    { config: AreaChartConfiguration.FINANCIAL, name: 'Financial' },
    { config: AreaChartConfiguration.PERFORMANCE, name: 'Performance' },
    { config: AreaChartConfiguration.MINIMAL, name: 'Minimal' }
  ];

  return configs.map(({ config, name }, index) => 
    AreaChartBuilder.create()
      .useConfiguration(config)
      .setData(sampleData.map(value => value * (1 + Math.random() * 0.2)))
      .setXAxisData(sampleXAxis)
      .setTitle(`${name} Configuration`, 'Comparison view')
      .setHeader(name)
      .setPosition({ x: (index % 2) * 6, y: Math.floor(index / 2) * 4, cols: 6, rows: 4 })
      .build()
  );
}

/**
 * Example 7: Type-Safe Configuration Switch
 */
export function switchChartConfiguration(
  currentConfig: AreaChartConfiguration,
  data: number[],
  xAxisData: string[]
): { nextConfig: AreaChartConfiguration; widget: IWidget } {
  // Define configuration cycle
  const configCycle: AreaChartConfiguration[] = [
    AreaChartConfiguration.DEFAULT,
    AreaChartConfiguration.FINANCIAL,
    AreaChartConfiguration.PERFORMANCE,
    AreaChartConfiguration.STACKED,
    AreaChartConfiguration.MINIMAL
  ];

  const currentIndex = configCycle.indexOf(currentConfig);
  const nextIndex = (currentIndex + 1) % configCycle.length;
  const nextConfig = configCycle[nextIndex];

  const widget = AreaChartBuilder.create()
    .useConfiguration(nextConfig)
    .setData(data)
    .setXAxisData(xAxisData)
    .setHeader(`Switched to ${nextConfig}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();

  return { nextConfig, widget };
}

/**
 * Example 8: Configuration with Validation
 */
export function createValidatedChart(
  config: string,
  data: number[],
  xAxisData: string[]
): IWidget | null {
  // Validate if the configuration exists
  const allConfigs = Object.values(AreaChartConfiguration);
  if (!allConfigs.includes(config as AreaChartConfiguration)) {
    console.error(`Invalid configuration: ${config}. Available configs:`, allConfigs);
    return null;
  }

  // Validate if configuration is supported for area charts
  if (!ChartConfigurationHelper.isConfigurationSupportedForChartType(config, 'area')) {
    console.error(`Configuration ${config} is not supported for area charts`);
    return null;
  }

  return AreaChartBuilder.create()
    .useConfiguration(config as AreaChartConfiguration)
    .setData(data)
    .setXAxisData(xAxisData)
    .setHeader(`Validated Config - ${config}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 9: Configuration Metadata Usage
 */
export function getConfigurationInfo(config: AreaChartConfiguration): string {
  const metadata = ChartConfigurationHelper.getConfigurationMetadata(config);
  if (!metadata) {
    return `No metadata available for ${config}`;
  }

  return `
Configuration: ${config}
Name: ${metadata.name}
Description: ${metadata.description}
Use Case: ${metadata.useCase}
Supported Chart Types: ${metadata.chartTypes.join(', ')}
  `.trim();
}

/**
 * Usage Examples Summary:
 * 
 * 1. ✅ Type Safety: Enums prevent typos and provide IntelliSense support
 * 2. ✅ Validation: Helper functions validate configuration compatibility
 * 3. ✅ Metadata: Rich information about each configuration
 * 4. ✅ Runtime Safety: Configuration validation at runtime
 * 5. ✅ Factory Patterns: Type-safe factory functions
 * 6. ✅ Configuration Switching: Easy configuration cycling
 * 7. ✅ Documentation: Self-documenting configuration options
 */ 