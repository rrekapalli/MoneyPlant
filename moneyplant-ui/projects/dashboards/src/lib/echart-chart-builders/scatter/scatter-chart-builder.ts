import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder, ConfigurableChartBuilder } from '../apache-echart-builder';
import { ScatterChartConfiguration, ChartConfiguration } from '../chart-configurations';

export interface ScatterChartData {
  value: [number, number]; // [x, y] coordinates
  name?: string;
  symbolSize?: number;
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
  [key: string]: any;
}

export interface ScatterChartSeriesOptions {
  name?: string;
  type?: string;
  data?: ScatterChartData[];
  symbolSize?: number | Function;
  symbol?: string;
  sampling?: string;
  coordinateSystem?: string;
  itemStyle?: {
    color?: string | string[];
    opacity?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  label?: {
    show?: boolean;
    position?: string;
    formatter?: string;
    fontSize?: number;
    color?: string;
  };
  emphasis?: {
    focus?: string;
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  large?: boolean;
  largeThreshold?: number;
  progressive?: number;
  progressiveThreshold?: number;
  encode?: {
    x?: number | string;
    y?: number | string;
    tooltip?: number[];
  };
}

export interface ScatterChartOptions extends EChartsOption {
  xAxis?: {
    type?: string;
    name?: string;
    nameLocation?: string;
    scale?: boolean;
    axisLabel?: {
      color?: string;
    };
  };
  yAxis?: {
    type?: string;
    name?: string;
    nameLocation?: string;
    scale?: boolean;
    axisLabel?: {
      color?: string;
    };
  };
  series?: ScatterChartSeriesOptions[];
}

/**
 * Enhanced Scatter Chart Builder with configurable presets
 * 
 * Usage examples:
 * 
 * // Using default configuration
 * const data = [
 *   { value: [10, 20], name: 'Point 1' },
 *   { value: [15, 25], name: 'Point 2' },
 *   { value: [20, 30], name: 'Point 3' }
 * ];
 * const widget = ScatterChartBuilder.create()
 *   .setData(data)
 *   .setHeader('Risk vs Return')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Using a preset configuration
 * const widget = ScatterChartBuilder.create()
 *   .useConfiguration(ScatterChartConfiguration.CORRELATION)
 *   .setData(data)
 *   .setHeader('Correlation Analysis')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Creating with custom configuration callback
 * const widget = ScatterChartBuilder.create()
 *   .createWithCustomConfig(builder => 
 *     builder
 *       .setSymbol('circle', 12)
 *       .setXAxisName('Risk')
 *       .setYAxisName('Return')
 *       .setTitle('Custom Scatter Plot')
 *   )
 *   .setData(data)
 *   .build();
 * 
 * // Creating multiple variations
 * const widgets = ScatterChartBuilder.createVariations(() => ScatterChartBuilder.create(), [
 *   {
 *     name: 'bubble',
 *     preset: ScatterChartConfiguration.BUBBLE,
 *     config: builder => builder.setHeader('Bubble Chart').setData(data1)
 *   },
 *   {
 *     name: 'clustering',
 *     preset: ScatterChartConfiguration.CLUSTERING,
 *     config: builder => builder.setHeader('Cluster Analysis').setData(data2)
 *   }
 * ]);
 * 
 * // Using factory pattern
 * const scatterChartFactory = ScatterChartBuilder.create().createFactory();
 * const widget1 = scatterChartFactory(data1, builder => builder.useConfiguration(ScatterChartConfiguration.CORRELATION));
 * const widget2 = scatterChartFactory(data2, builder => builder.useConfiguration(ScatterChartConfiguration.BUBBLE));
 */
export class ScatterChartBuilder extends ConfigurableChartBuilder<ScatterChartOptions, ScatterChartSeriesOptions> {
  protected override seriesOptions: ScatterChartSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new ScatterChartBuilder instance
   */
  static create(): ScatterChartBuilder {
    return new ScatterChartBuilder();
  }

  /**
   * Initialize predefined configuration presets
   */
  protected override initializeDefaultConfigurations(): void {
    // Default configuration
    this.addConfiguration(ScatterChartConfiguration.DEFAULT, this.getDefaultOptions(), this.getDefaultSeriesOptions());

    // Performance monitoring configuration
    this.addConfiguration(ScatterChartConfiguration.PERFORMANCE, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '8%',
        left: '5%',
        right: '5%',
        bottom: '10%',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: Performance {c}',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      symbolSize: 6,
      itemStyle: {
        color: '#ff6b6b',
        opacity: 0.7,
      }
    });

    // Minimal/clean configuration
    this.addConfiguration(ScatterChartConfiguration.MINIMAL, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '5%',
        left: '2%',
        right: '2%',
        bottom: '5%',
      },
      tooltip: { trigger: 'item' },
      legend: { show: false }
    }, {
      ...this.getDefaultSeriesOptions(),
      symbolSize: 4,
      itemStyle: {
        opacity: 0.6,
      }
    });

    // Bubble chart configuration
    this.addConfiguration(ScatterChartConfiguration.BUBBLE, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          return `${params.name}<br/>X: ${params.value[0]}<br/>Y: ${params.value[1]}<br/>Size: ${params.value[2] || 'N/A'}`;
        }
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      symbolSize: function(data: any) {
        return Math.sqrt(data[2] || 10) * 2;
      },
      itemStyle: {
        opacity: 0.7,
      }
    });

    // Correlation analysis configuration
    this.addConfiguration(ScatterChartConfiguration.CORRELATION, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ({c})',
      },
      xAxis: {
        type: 'value',
        nameLocation: 'middle',
        scale: true,
        axisLabel: { color: '#666' },
        name: 'Variable X'
      },
      yAxis: {
        type: 'value',
        nameLocation: 'middle',
        scale: true,
        axisLabel: { color: '#666' },
        name: 'Variable Y'
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      symbolSize: 8,
      itemStyle: {
        color: '#5470c6',
        opacity: 0.6,
      }
    });

    // Clustering configuration
    this.addConfiguration(ScatterChartConfiguration.CLUSTERING, {
      ...this.getDefaultOptions(),
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a}<br/>{b}: ({c})',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      symbolSize: 10,
      itemStyle: {
        opacity: 0.8,
        borderWidth: 1,
        borderColor: '#fff'
      }
    });
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<ScatterChartOptions> {
    return {
      grid: {
        containLabel: true,
        top: '15%',
        left: '10%',
        right: '10%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ({c})',
      },
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '10',
      },
      xAxis: {
        type: 'value',
        nameLocation: 'middle',
        scale: true,
        axisLabel: {
          color: '#666',
        },
      },
      yAxis: {
        type: 'value',
        nameLocation: 'middle',
        scale: true,
        axisLabel: {
          color: '#666',
        },
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'scatter';
  }

  /**
   * Get default series options for scatter chart
   */
  private getDefaultSeriesOptions(): ScatterChartSeriesOptions {
    return {
      name: 'Scatter Chart',
      type: 'scatter',
      symbolSize: 8,
      symbol: 'circle',
      itemStyle: {
        color: '#5470c6',
        opacity: 0.8,
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      large: false,
      largeThreshold: 2000,
    };
  }

  /**
   * Set the data for the scatter chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data as ScatterChartData[];
    super.setData(data);
    return this;
  }

  /**
   * Set X-axis name
   */
  setXAxisName(name: string): this {
    if (!(this.chartOptions as any).xAxis) (this.chartOptions as any).xAxis = {};
    (this.chartOptions as any).xAxis.name = name;
    return this;
  }

  /**
   * Set Y-axis name
   */
  setYAxisName(name: string): this {
    if (!(this.chartOptions as any).yAxis) (this.chartOptions as any).yAxis = {};
    (this.chartOptions as any).yAxis.name = name;
    return this;
  }

  /**
   * Set symbol type and size
   */
  setSymbol(symbol: string, size: number = 8): this {
    this.seriesOptions.symbol = symbol;
    this.seriesOptions.symbolSize = size;
    return this;
  }

  /**
   * Set dynamic symbol size function
   */
  setSymbolSizeFunction(sizeFunction: Function): this {
    this.seriesOptions.symbolSize = sizeFunction;
    return this;
  }

  /**
   * Set item style (color, opacity, border)
   */
  setItemStyle(color: string, opacity: number = 0.8, borderColor?: string, borderWidth?: number): this {
    if (!this.seriesOptions.itemStyle) this.seriesOptions.itemStyle = {};
    this.seriesOptions.itemStyle.color = color;
    this.seriesOptions.itemStyle.opacity = opacity;
    if (borderColor) this.seriesOptions.itemStyle.borderColor = borderColor;
    if (borderWidth) this.seriesOptions.itemStyle.borderWidth = borderWidth;
    return this;
  }

  /**
   * Enable large scatter optimization
   */
  setLargeScatter(enabled: boolean, threshold: number = 2000): this {
    this.seriesOptions.large = enabled;
    this.seriesOptions.largeThreshold = threshold;
    return this;
  }

  /**
   * Set progressive rendering
   */
  setProgressive(progressive: number, threshold: number = 3000): this {
    this.seriesOptions.progressive = progressive;
    this.seriesOptions.progressiveThreshold = threshold;
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: ScatterChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'scatter',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing scatter chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a scatter chart
   */
  static isScatterChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'scatter');
  }

  /**
   * Static method to create a scatter chart widget with default configuration
   * (for backward compatibility)
   */
  static createScatterChartWidget(data?: ScatterChartData[]): WidgetBuilder {
    const builder = ScatterChartBuilder.create();
    if (data) {
      builder.setData(data);
    }
    
    const finalOptions: ScatterChartOptions = {
      ...builder['chartOptions'],
      series: [{
        ...builder['seriesOptions'],
        type: 'scatter',
      }],
    };

    return builder['widgetBuilder']
      .setEChartsOptions(finalOptions)
      .setData(data || []);
  }

  /**
   * Export scatter chart data for Excel/CSV export
   * Extracts x, y coordinates and optional category information
   * @param widget - Widget containing scatter chart data
   * @returns Array of data rows for export
   */
  static override exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    
    if (!series?.data) {
      console.warn('ScatterChartBuilder.exportData - No series data found');
      return [];
    }

    return series.data.map((point: any) => [
      point[0] || 0,
      point[1] || 0,
      point[2] || 'Default'
    ]);
  }

  /**
   * Get headers for scatter chart export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['X Value', 'Y Value', 'Category'];
  }

  /**
   * Get sheet name for scatter chart export
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sheet';
    return title.replace(/[^\w\s]/gi, '').substring(0, 31).trim();
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use ScatterChartBuilder.create() instead
 */
export function createScatterChartWidget(data?: ScatterChartData[]): WidgetBuilder {
  return ScatterChartBuilder.createScatterChartWidget(data);
} 