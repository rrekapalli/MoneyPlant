# ConfigurableChartBuilder Architecture

## Overview

The `ConfigurableChartBuilder` is an enhanced base class that extends `ApacheEchartBuilder` to provide a more flexible and generic approach to chart creation. It supports configurable presets, runtime customization, factory patterns, and variation creation.

## Key Benefits

1. **Predefined Configurations**: Set up multiple configuration presets for different chart styles
2. **Runtime Customization**: Apply customizations without changing base configurations
3. **Factory Pattern**: Create reusable chart factories for consistent styling
4. **Variation Creation**: Generate multiple chart variations with different configurations
5. **Configuration Merging**: Combine configurations to create new presets
6. **Flexible Instantiation**: Support both preset-based and custom configuration approaches

## Architecture

```typescript
ConfigurableChartBuilder<T, TSeries>
  ├── defaultConfigurations: Map<string, Partial<T>>
  ├── seriesConfigurations: Map<string, Partial<TSeries>>
  ├── currentConfiguration: string
  └── Methods:
      ├── addConfiguration()
      ├── useConfiguration()
      ├── createWithCustomConfig()
      ├── withRuntimeCustomization()
      ├── createFactory()
      └── static createVariations()
```

## Basic Usage

### 1. Using Predefined Configurations

```typescript
import { AreaChartBuilder, AreaChartConfiguration } from '@dashboards/public-api';

// Create chart with financial preset
const widget = AreaChartBuilder.create()
  .useConfiguration(AreaChartConfiguration.FINANCIAL)
  .setData(data)
  .setXAxisData(xAxisData)
  .setHeader('Financial Overview')
  .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
  .build();

// Available configurations for AreaChartBuilder:
// - AreaChartConfiguration.DEFAULT: Standard area chart styling
// - AreaChartConfiguration.FINANCIAL: Green gradient with financial formatting
// - AreaChartConfiguration.PERFORMANCE: Red theme for performance monitoring
// - AreaChartConfiguration.STACKED: Configuration for stacked area charts
// - AreaChartConfiguration.MINIMAL: Clean, minimal styling with reduced elements
// - AreaChartConfiguration.SMOOTH_GRADIENT: Smooth gradients for enhanced visuals
// - AreaChartConfiguration.MULTI_SERIES: Optimized for multi-series data
// - AreaChartConfiguration.LARGE_DATASET: Performance optimized for large datasets
```

### 2. Custom Configuration with Callback

```typescript
const widget = AreaChartBuilder.create()
  .createWithCustomConfig((builder) => 
    builder
      .setSmooth(true)
      .setGradientAreaStyle('#5470c6', '#91cc75')
      .setTitle('Custom Chart', 'With smooth curves')
  )
  .setData(data)
  .build();
```

### 3. Runtime Customization

```typescript
const widget = AreaChartBuilder.create()
  .useConfiguration(AreaChartConfiguration.FINANCIAL)
  .withRuntimeCustomization((chartOptions, seriesOptions) => {
    // Apply runtime modifications without changing base preset
    seriesOptions.smooth = true;
    seriesOptions.symbolSize = 8;
    if (chartOptions.tooltip) {
      chartOptions.tooltip.formatter = 'Custom: {b}: ${c}K';
    }
  })
  .setData(data)
  .build();
```

## Advanced Patterns

### 1. Factory Pattern

```typescript
// Create a reusable factory
const areaChartFactory = AreaChartBuilder.create().createFactory();

// Use factory to create multiple charts with consistent customizations
const chart1 = areaChartFactory(data1, builder => 
  builder.useConfiguration(AreaChartConfiguration.FINANCIAL).setHeader('Revenue')
);

const chart2 = areaChartFactory(data2, builder => 
  builder.useConfiguration(AreaChartConfiguration.PERFORMANCE).setHeader('Performance')
);
```

### 2. Creating Multiple Variations

```typescript
const widgets = AreaChartBuilder.createVariations(() => AreaChartBuilder.create(), [
  {
    name: 'revenue',
    preset: AreaChartConfiguration.FINANCIAL,
    config: builder => builder.setHeader('Revenue').setData(revenueData)
  },
  {
    name: 'performance',
    preset: AreaChartConfiguration.PERFORMANCE, 
    config: builder => builder.setHeader('Performance').setData(perfData)
  },
  {
    name: 'minimal',
    preset: AreaChartConfiguration.MINIMAL,
    config: builder => builder.setHeader('Clean View').setData(minimalData)
  }
]);
```

### 3. Configuration Merging

```typescript
const builder = AreaChartBuilder.create();

// Create new configuration by merging existing ones
builder.mergeConfigurations('financial', 'performance', 'hybrid');

// Use the new hybrid configuration
const widget = builder
  .useConfiguration('hybrid')
  .setData(data)
  .build();
```

### 4. Factory Object Pattern

```typescript
export const AreaChartWidgetFactory = {
  createFinancial: (data?: number[], xAxisData?: string[]) => {
    const factory = AreaChartBuilder.create().createFactory();
    return factory(data, builder => 
      builder.useConfiguration(AreaChartConfiguration.FINANCIAL).setXAxisData(xAxisData)
    );
  },
  
  createPerformance: (data?: number[], xAxisData?: string[]) => {
    const factory = AreaChartBuilder.create().createFactory();
    return factory(data, builder => 
      builder.useConfiguration(AreaChartConfiguration.PERFORMANCE).setXAxisData(xAxisData)
    );
  }
};

// Usage
const financialChart = AreaChartWidgetFactory.createFinancial(data, xAxis);
const performanceChart = AreaChartWidgetFactory.createPerformance(data, xAxis);
```

## Extending the Architecture

### Creating New Chart Types

```typescript
export class CustomChartBuilder extends ConfigurableChartBuilder<CustomChartOptions, CustomSeriesOptions> {
  
  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  static create(): CustomChartBuilder {
    return new CustomChartBuilder();
  }

  protected override initializeDefaultConfigurations(): void {
    // Add default configuration
    this.addConfiguration('default', this.getDefaultOptions(), this.getDefaultSeriesOptions());
    
    // Add custom presets
    this.addConfiguration('theme1', {
      // Custom chart options for theme1
    }, {
      // Custom series options for theme1
    });
    
    this.addConfiguration('theme2', {
      // Custom chart options for theme2
    }, {
      // Custom series options for theme2
    });
  }

  protected override getDefaultOptions(): Partial<CustomChartOptions> {
    return {
      // Default chart configuration
    };
  }

  protected override getChartType(): string {
    return 'custom';
  }

  private getDefaultSeriesOptions(): CustomSeriesOptions {
    return {
      // Default series configuration
    };
  }

  // Add chart-specific methods
  setCustomProperty(value: any): this {
    this.seriesOptions.customProperty = value;
    return this;
  }
}
```

### Adding New Configurations at Runtime

```typescript
const builder = AreaChartBuilder.create();

// Add new configuration dynamically
builder.addConfiguration('darkTheme', {
  backgroundColor: '#1a1a1a',
  tooltip: {
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    textStyle: { color: '#fff' }
  }
}, {
  lineStyle: { color: '#00ff88' },
  areaStyle: { color: 'rgba(0, 255, 136, 0.3)' }
});

// Use the new configuration
const widget = builder
  .useConfiguration('darkTheme')
  .setData(data)
  .build();
```

## Best Practices

1. **Define Common Presets**: Create presets for frequently used styling patterns
2. **Use Factory Pattern**: For consistent chart creation across your application
3. **Runtime Customization**: Use `withRuntimeCustomization()` for one-off modifications
4. **Configuration Naming**: Use descriptive names like 'financial', 'performance', 'minimal'
5. **Variation Creation**: Use `createVariations()` for dashboard layouts with multiple similar charts
6. **Preset Documentation**: Document available presets and their use cases

## Migration from Standard Builder

### Before (Standard Builder)
```typescript
export function createAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .setData([])
    .setXAxisData(xAxis)
    .setTitle('Chart Title')
    .setSmooth(true)
    .setGradientAreaStyle('#5470c6', '#91cc75', 0.4)
    .setLineStyle(3, '#5470c6', 'solid')
    .setSymbol('circle', 6)
    .setTooltip('axis', '{b}: ${c}K')
    .setLegend('horizontal', 'bottom')
    .setHeader('Header')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}
```

### After (Configurable Builder)
```typescript
import { AreaChartBuilder, AreaChartConfiguration } from '@dashboards/public-api';

export function createAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .useConfiguration(AreaChartConfiguration.FINANCIAL)  // Use preset instead of individual settings
    .setData([])
    .setXAxisData(xAxis)
    .setTitle('Chart Title')
    .setHeader('Header')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

// Or with custom adjustments
export function createCustomAreaChartWidget(): IWidget {
  return AreaChartBuilder.create()
    .createWithCustomConfig(builder => 
      builder
        .setSmooth(true)
        .setGradientAreaStyle('#5470c6', '#91cc75', 0.4)
        .setLineStyle(3, '#5470c6', 'solid')
        .setSymbol('circle', 6)
    )
    .setData([])
    .setXAxisData(xAxis)
    .setTitle('Chart Title')
    .setHeader('Header')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}
```

## Configuration Reference

### AreaChartBuilder Configurations

| Configuration | Description | Use Case |
|---------------|-------------|----------|
| `AreaChartConfiguration.DEFAULT` | Standard area chart styling | General purpose charts |
| `AreaChartConfiguration.FINANCIAL` | Green gradient with financial formatting | Revenue, profit, financial data |
| `AreaChartConfiguration.PERFORMANCE` | Red theme with percentage formatting | Performance metrics, KPIs |
| `AreaChartConfiguration.STACKED` | Optimized for stacked area charts | Multi-series data comparison |
| `AreaChartConfiguration.MINIMAL` | Clean styling with reduced elements | Dashboard space optimization |
| `AreaChartConfiguration.SMOOTH_GRADIENT` | Enhanced smooth gradients | Visual appeal, presentations |
| `AreaChartConfiguration.MULTI_SERIES` | Multi-series data handling | Complex data relationships |
| `AreaChartConfiguration.LARGE_DATASET` | Performance optimized | Big data visualizations |

### Methods Reference

| Method | Description | Parameters |
|--------|-------------|------------|
| `useConfiguration(name)` | Apply a predefined configuration | `name: string` |
| `addConfiguration(name, chartOptions, seriesOptions)` | Add new configuration | `name: string, chartOptions: Partial<T>, seriesOptions?: Partial<TSeries>` |
| `createWithCustomConfig(callback, preset)` | Create with custom callback | `callback: (builder) => builder, preset?: string` |
| `withRuntimeCustomization(customizer)` | Apply runtime customizations | `customizer: (chartOptions, seriesOptions) => void` |
| `createFactory()` | Create reusable factory function | Returns factory function |
| `getAvailableConfigurations()` | Get list of available configurations | Returns `string[]` |
| `mergeConfigurations(base, override, newName)` | Merge two configurations | `base: string, override: string, newName: string` |

This architecture provides maximum flexibility while maintaining code reusability and consistency across your chart implementations. 