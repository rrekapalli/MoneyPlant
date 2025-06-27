import { IWidget } from '../entities/IWidget';
import { PieChartBuilder, PieChartData } from '../echart-chart-builders/pie/pie-chart-builder';
import { 
  ChartConfiguration, 
  PieChartConfiguration,
  ChartConfigurationHelper 
} from '../echart-chart-builders/chart-configurations';

/**
 * Pie Chart Configuration Examples
 * 
 * This file demonstrates how to use the pie chart configuration enums
 * for type-safe pie chart creation with various presets.
 */

// Sample data for examples
const samplePieData: PieChartData[] = [
  { value: 335, name: 'Stocks' },
  { value: 310, name: 'Bonds' },
  { value: 234, name: 'Cash' },
  { value: 135, name: 'Real Estate' },
  { value: 1048, name: 'Mutual Funds' },
  { value: 251, name: 'ETFs' },
  { value: 147, name: 'Commodities' }
];

const assetColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452'];

/**
 * Example 1: Using General Chart Configurations for Pie Charts
 */
export function createPieChartWithGeneralConfigs(): IWidget[] {
  return [
    // Default configuration
    PieChartBuilder.create()
      .useConfiguration(ChartConfiguration.DEFAULT)
      .setData(samplePieData)
      .setColors(assetColors)
      .setHeader('Default Style')
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build(),

    // Financial configuration
    PieChartBuilder.create()
      .useConfiguration(ChartConfiguration.FINANCIAL)
      .setData(samplePieData)
      .setColors(assetColors)
      .setHeader('Financial Style')
      .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
      .build(),

    // Minimal configuration
    PieChartBuilder.create()
      .useConfiguration(ChartConfiguration.MINIMAL)
      .setData(samplePieData)
      .setColors(assetColors)
      .setHeader('Minimal Style')
      .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
      .build()
  ];
}

/**
 * Example 2: Using Pie Chart Specific Configurations
 */
export function createPieChartWithSpecificConfigs(): IWidget[] {
  return [
    // Donut chart
    PieChartBuilder.create()
      .useConfiguration(PieChartConfiguration.DONUT)
      .setData(samplePieData)
      .setColors(assetColors)
      .setHeader('Donut Chart')
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build(),

    // Rose chart
    PieChartBuilder.create()
      .useConfiguration(PieChartConfiguration.ROSE)
      .setData(samplePieData)
      .setColors(assetColors)
      .setHeader('Rose Chart')
      .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
      .build(),

    // Nested pie chart
    PieChartBuilder.create()
      .useConfiguration(PieChartConfiguration.NESTED)
      .setData(samplePieData)
      .setColors(assetColors)
      .setHeader('Nested Pie Chart')
      .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
      .build(),

    // Semi-circle chart
    PieChartBuilder.create()
      .useConfiguration(PieChartConfiguration.SEMI_CIRCLE)
      .setData(samplePieData)
      .setColors(assetColors)
      .setHeader('Semi-Circle Chart')
      .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
      .build()
  ];
}

/**
 * Example 3: Configuration Validation and Helper Functions
 */
export function demonstratePieChartConfigurationHelpers(): void {
  // Get all configurations for pie charts
  const pieConfigs = ChartConfigurationHelper.getConfigurationsForChartType('pie');
  console.log('Available pie chart configurations:', pieConfigs);

  // Validate configuration support
  const isSupported = ChartConfigurationHelper.isConfigurationSupportedForChartType(
    PieChartConfiguration.DONUT, 
    'pie'
  );
  console.log('Is DONUT config supported for pie charts?', isSupported);

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
export class TypeSafePieChartFactory {
  /**
   * Create pie chart with specific configuration
   */
  static createPieChart(
    config: PieChartConfiguration,
    data: PieChartData[],
    colors?: string[]
  ): IWidget {
    return PieChartBuilder.create()
      .useConfiguration(config)
      .setData(data)
      .setColors(colors || assetColors)
      .setHeader(`Pie Chart - ${config}`)
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build();
  }

  /**
   * Create multiple pie chart variations
   */
  static createPieChartVariations(data: PieChartData[], colors?: string[]): IWidget[] {
    const configurations: PieChartConfiguration[] = [
      PieChartConfiguration.DEFAULT,
      PieChartConfiguration.FINANCIAL,
      PieChartConfiguration.DONUT,
      PieChartConfiguration.ROSE
    ];

    return configurations.map((config, index) => 
      PieChartBuilder.create()
        .useConfiguration(config)
        .setData(data)
        .setColors(colors || assetColors)
        .setHeader(`Variation ${index + 1} - ${config}`)
        .setPosition({ x: (index % 2) * 6, y: Math.floor(index / 2) * 4, cols: 6, rows: 4 })
        .build()
    );
  }
}

/**
 * Example 5: Runtime Configuration Selection
 */
export function createPieChartWithRuntimeConfig(
  chartType: 'financial' | 'donut' | 'rose' | 'minimal',
  data: PieChartData[],
  colors?: string[]
): IWidget {
  // Map string types to enum values for type safety
  const configMap: Record<string, PieChartConfiguration> = {
    financial: PieChartConfiguration.FINANCIAL,
    donut: PieChartConfiguration.DONUT,
    rose: PieChartConfiguration.ROSE,
    minimal: PieChartConfiguration.MINIMAL
  };

  const config = configMap[chartType] || PieChartConfiguration.DEFAULT;

  return PieChartBuilder.create()
    .useConfiguration(config)
    .setData(data)
    .setColors(colors || assetColors)
    .setHeader(`Runtime Config - ${chartType}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 6: Configuration Comparison
 */
export function createPieChartConfigurationComparison(): IWidget[] {
  const configs = [
    { config: PieChartConfiguration.DEFAULT, name: 'Default' },
    { config: PieChartConfiguration.FINANCIAL, name: 'Financial' },
    { config: PieChartConfiguration.DONUT, name: 'Donut' },
    { config: PieChartConfiguration.ROSE, name: 'Rose' }
  ];

  return configs.map(({ config, name }, index) => 
    PieChartBuilder.create()
      .useConfiguration(config)
      .setData(samplePieData.map(item => ({
        ...item,
        value: item.value * (1 + Math.random() * 0.2)
      })))
      .setColors(assetColors)
      .setTitle(`${name} Configuration`, 'Comparison view')
      .setHeader(name)
      .setPosition({ x: (index % 2) * 6, y: Math.floor(index / 2) * 4, cols: 6, rows: 4 })
      .build()
  );
}

/**
 * Example 7: Type-Safe Configuration Switch
 */
export function switchPieChartConfiguration(
  currentConfig: PieChartConfiguration,
  data: PieChartData[],
  colors?: string[]
): { nextConfig: PieChartConfiguration; widget: IWidget } {
  // Define configuration cycle
  const configCycle: PieChartConfiguration[] = [
    PieChartConfiguration.DEFAULT,
    PieChartConfiguration.FINANCIAL,
    PieChartConfiguration.DONUT,
    PieChartConfiguration.ROSE,
    PieChartConfiguration.NESTED,
    PieChartConfiguration.MINIMAL
  ];

  const currentIndex = configCycle.indexOf(currentConfig);
  const nextIndex = (currentIndex + 1) % configCycle.length;
  const nextConfig = configCycle[nextIndex];

  const widget = PieChartBuilder.create()
    .useConfiguration(nextConfig)
    .setData(data)
    .setColors(colors || assetColors)
    .setHeader(`Switched to ${nextConfig}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();

  return { nextConfig, widget };
}

/**
 * Example 8: Configuration with Custom Styling
 */
export function createCustomStyledPieChart(
  config: PieChartConfiguration,
  data: PieChartData[]
): IWidget {
  return PieChartBuilder.create()
    .createWithCustomConfig(builder => {
      // Apply base configuration
      builder.useConfiguration(config);
      
      // Add custom styling based on configuration
      switch (config) {
        case PieChartConfiguration.DONUT:
          builder.setRadius(['50%', '80%']);
          break;
        case PieChartConfiguration.ROSE:
          builder.setTitle('Rose Chart', 'Nightingale diagram');
          break;
        case PieChartConfiguration.SEMI_CIRCLE:
          builder.setTitle('Semi-Circle Chart', 'Half pie visualization');
          break;
        default:
          builder.setTitle('Custom Pie Chart');
      }
      
      return builder;
    })
    .setData(data)
    .setColors(assetColors)
    .setHeader(`Custom ${config}`)
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 9: Asset Allocation Specific Examples
 */
export function createAssetAllocationExamples(): IWidget[] {
  const assetData: PieChartData[] = [
    { value: 40, name: 'Stocks' },
    { value: 25, name: 'Bonds' },
    { value: 15, name: 'Real Estate' },
    { value: 10, name: 'Cash' },
    { value: 10, name: 'Commodities' }
  ];

  return [
    // Financial style for portfolio overview
    PieChartBuilder.create()
      .useConfiguration(PieChartConfiguration.FINANCIAL)
      .setData(assetData)
      .setColors(['#2E7D32', '#1976D2', '#F57C00', '#388E3C', '#5D4037'])
      .setTitle('Portfolio Allocation', 'By Asset Class')
      .setHeader('Asset Allocation')
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build(),

    // Donut style for clean presentation
    PieChartBuilder.create()
      .useConfiguration(PieChartConfiguration.DONUT)
      .setData(assetData)
      .setColors(['#2E7D32', '#1976D2', '#F57C00', '#388E3C', '#5D4037'])
      .setTitle('Investment Distribution', 'Donut View')
      .setHeader('Investment Mix')
      .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
      .build()
  ];
}

/**
 * Example 10: Configuration Metadata Usage
 */
export function getPieChartConfigurationInfo(config: PieChartConfiguration): string {
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
 * 8. ✅ Specialized Charts: Donut, Rose, Semi-circle variants
 * 9. ✅ Asset Allocation: Financial sector specific styling
 */ 