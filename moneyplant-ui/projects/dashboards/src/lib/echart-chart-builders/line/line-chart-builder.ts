import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder, ConfigurableChartBuilder } from '../apache-echart-builder';
import { LineChartConfiguration, ChartConfiguration } from '../chart-configurations';

export interface LineChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface LineChartSeriesOptions {
  name?: string;
  type?: string;
  data?: LineChartData[] | number[];
  smooth?: boolean;
  symbol?: string;
  symbolSize?: number;
  step?: string | boolean;
  stack?: string;
  sampling?: string;
  connectNulls?: boolean;
  lineStyle?: {
    width?: number;
    color?: string;
    type?: string;
    opacity?: number;
  };
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
  };
  areaStyle?: {
    color?: string | object;
    opacity?: number;
    origin?: string;
  };
  showSymbol?: boolean;
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
    areaStyle?: {
      opacity?: number;
    };
  };
  markPoint?: {
    data?: any[];
  };
  markLine?: {
    data?: any[];
  };
}

export interface LineChartOptions extends EChartsOption {
  xAxis?: {
    type?: string;
    data?: string[];
    name?: string;
    nameLocation?: string;
    axisLabel?: {
      rotate?: number;
      color?: string;
    };
  };
  yAxis?: {
    type?: string;
    name?: string;
    nameLocation?: string;
    axisLabel?: {
      color?: string;
    };
  };
  series?: LineChartSeriesOptions[];
}

/**
 * Enhanced Line Chart Builder with configurable presets
 * 
 * Usage examples:
 * 
 * // Using default configuration
 * const widget = LineChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setXAxisData(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Monthly Sales')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Using a preset configuration
 * const widget = LineChartBuilder.create()
 *   .useConfiguration(LineChartConfiguration.FINANCIAL)
 *   .setData([10, 20, 30, 40, 50])
 *   .setXAxisData(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Financial Performance')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Creating with custom configuration callback
 * const widget = LineChartBuilder.create()
 *   .createWithCustomConfig(builder => 
 *     builder
 *       .setSmooth(true)
 *       .setAreaStyle('#5470c6', 0.3)
 *       .setTitle('Custom Line Chart')
 *   )
 *   .setData([10, 20, 30, 40, 50])
 *   .build();
 * 
 * // Creating multiple variations
 * const widgets = LineChartBuilder.createVariations(() => LineChartBuilder.create(), [
 *   {
 *     name: 'smooth',
 *     preset: LineChartConfiguration.SMOOTH,
 *     config: builder => builder.setHeader('Smooth Line').setData(data1)
 *   },
 *   {
 *     name: 'stepped',
 *     preset: LineChartConfiguration.STEPPED,
 *     config: builder => builder.setHeader('Stepped Line').setData(data2)
 *   }
 * ]);
 * 
 * // Using factory pattern
 * const lineChartFactory = LineChartBuilder.create().createFactory();
 * const widget1 = lineChartFactory(data1, builder => builder.useConfiguration(LineChartConfiguration.TIME_SERIES));
 * const widget2 = lineChartFactory(data2, builder => builder.useConfiguration(LineChartConfiguration.SMOOTH));
 */
export class LineChartBuilder extends ConfigurableChartBuilder<LineChartOptions, LineChartSeriesOptions> {
  protected override seriesOptions: LineChartSeriesOptions;
  private xAxisData: string[] = [];

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new LineChartBuilder instance
   */
  static create(): LineChartBuilder {
    return new LineChartBuilder();
  }

  /**
   * Initialize predefined configuration presets
   */
  protected override initializeDefaultConfigurations(): void {
    // Default configuration
    this.addConfiguration(LineChartConfiguration.DEFAULT, this.getDefaultOptions(), this.getDefaultSeriesOptions());

    // Financial line chart configuration
    this.addConfiguration(LineChartConfiguration.FINANCIAL, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '12%',
        left: '8%',
        right: '8%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: ${c}K',
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: '#777',
        textStyle: { color: '#fff' }
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#4CAF50' },
            { offset: 1, color: 'rgba(76, 175, 80, 0.1)' }
          ],
        },
        opacity: 0.8,
      },
      lineStyle: { width: 3, color: '#4CAF50' },
      symbolSize: 8
    });

    // Performance monitoring configuration
    this.addConfiguration(LineChartConfiguration.PERFORMANCE, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '8%',
        left: '5%',
        right: '5%',
        bottom: '10%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      smooth: true,
      showSymbol: false,
      sampling: 'average',
      lineStyle: { width: 2, color: '#ff6b6b' }
    });

    // Minimal/clean configuration
    this.addConfiguration(LineChartConfiguration.MINIMAL, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '5%',
        left: '2%',
        right: '2%',
        bottom: '5%',
      },
      tooltip: { trigger: 'axis' },
      legend: { show: false }
    }, {
      ...this.getDefaultSeriesOptions(),
      showSymbol: false,
      lineStyle: { width: 1 }
    });

    // Smooth line configuration
    this.addConfiguration(LineChartConfiguration.SMOOTH, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      smooth: true,
      lineStyle: { width: 3 },
      symbolSize: 8
    });

    // Stepped line configuration
    this.addConfiguration(LineChartConfiguration.STEPPED, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      step: 'middle',
      lineStyle: { width: 2 }
    });

    // Multi-axis configuration
    this.addConfiguration(LineChartConfiguration.MULTI_AXIS, {
      ...this.getDefaultOptions(),
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          let result = params[0].name + '<br/>';
          params.forEach((param: any) => {
            result += param.marker + param.seriesName + ': ' + param.value + '<br/>';
          });
          return result;
        }
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      emphasis: {
        focus: 'series'
      }
    });

    // Time series configuration
    this.addConfiguration(LineChartConfiguration.TIME_SERIES, {
      ...this.getDefaultOptions(),
      animation: false,
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}',
        renderMode: 'richText'
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      showSymbol: false,
      sampling: 'lttb',
      lineStyle: { width: 1 }
    });
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<LineChartOptions> {
    return {
      grid: {
        containLabel: true,
        top: '15%',
        left: '10%',
        right: '10%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}',
      },
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '10',
      },
      xAxis: {
        type: 'category',
        data: [],
        nameLocation: 'middle',
        axisLabel: {
          rotate: 0,
          color: '#666',
        },
      },
      yAxis: {
        type: 'value',
        nameLocation: 'middle',
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
    return 'line';
  }

  /**
   * Get default series options for line chart
   */
  private getDefaultSeriesOptions(): LineChartSeriesOptions {
    return {
      name: 'Line Chart',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      lineStyle: {
        width: 2,
        color: '#5470c6',
        type: 'solid',
      },
      itemStyle: {
        color: '#5470c6',
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    };
  }

  /**
   * Set the data for the line chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data;
    super.setData(data);
    return this;
  }

  /**
   * Set X-axis data (categories)
   */
  setXAxisData(data: string[]): this {
    this.xAxisData = data;
    (this.chartOptions as any).xAxis.data = data;
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
   * Set smooth line
   */
  setSmooth(smooth: boolean): this {
    this.seriesOptions.smooth = smooth;
    return this;
  }

  /**
   * Set symbol type and size
   */
  setSymbol(symbol: string, size: number = 6): this {
    this.seriesOptions.symbol = symbol;
    this.seriesOptions.symbolSize = size;
    return this;
  }

  /**
   * Set line style
   */
  setLineStyle(width: number, color: string, type: string = 'solid'): this {
    if (!this.seriesOptions.lineStyle) this.seriesOptions.lineStyle = {};
    this.seriesOptions.lineStyle.width = width;
    this.seriesOptions.lineStyle.color = color;
    this.seriesOptions.lineStyle.type = type;
    return this;
  }

  /**
   * Set area style (for area charts)
   */
  setAreaStyle(color: string, opacity: number = 0.3): this {
    this.seriesOptions.areaStyle = {
      color,
      opacity,
    };
    return this;
  }

  /**
   * Set symbol visibility
   */
  setShowSymbol(show: boolean): this {
    this.seriesOptions.showSymbol = show;
    return this;
  }

  /**
   * Set step type for stepped line charts
   */
  setStep(step: string | boolean): this {
    this.seriesOptions.step = step;
    return this;
  }

  /**
   * Set stack for stacked line charts
   */
  setStack(stack: string): this {
    this.seriesOptions.stack = stack;
    return this;
  }

  /**
   * Set sampling method for large datasets
   */
  setSampling(sampling: string): this {
    this.seriesOptions.sampling = sampling;
    return this;
  }

  /**
   * Set connect nulls
   */
  setConnectNulls(connect: boolean): this {
    this.seriesOptions.connectNulls = connect;
    return this;
  }

  /**
   * Set label options
   */
  setLabel(show: boolean, position: string = 'top', formatter?: string): this {
    this.seriesOptions.label = {
      show,
      position,
      formatter: formatter || '{c}',
    };
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: LineChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'line',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing line chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a line chart
   */
  static isLineChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'line');
  }

  /**
   * Static method to create a line chart widget with default configuration
   * (for backward compatibility)
   */
  static createLineChartWidget(data?: LineChartData[] | number[], xAxisData?: string[]): WidgetBuilder {
    const builder = LineChartBuilder.create();
    if (data) {
      builder.setData(data);
    }
    if (xAxisData) {
      builder.setXAxisData(xAxisData);
    }
    
    const finalOptions: LineChartOptions = {
      ...builder['chartOptions'],
      series: [{
        ...builder['seriesOptions'],
        type: 'line',
      }],
    };

    return builder['widgetBuilder']
      .setEChartsOptions(finalOptions)
      .setData(data || []);
  }

  /**
   * Export line chart data for Excel/CSV export
   * Extracts x-axis categories and their corresponding y-axis values
   * @param widget - Widget containing line chart data
   * @returns Array of data rows for export
   */
  static override exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    const xAxis = (widget.config?.options as any)?.xAxis;
    
    if (!series?.data) {
      console.warn('LineChartBuilder.exportData - No series data found');
      return [];
    }

    // Handle different xAxis structures
    let categories: string[] = [];
    
    if (xAxis) {
      // Handle array of xAxis objects
      if (Array.isArray(xAxis)) {
        categories = xAxis[0]?.data || [];
      } 
      // Handle single xAxis object
      else if (xAxis.data) {
        categories = xAxis.data;
      }
    }

    // If no categories found, create default ones
    if (categories.length === 0) {
      categories = series.data.map((_: any, index: number) => `Point ${index + 1}`);
    }

    return series.data.map((value: any, index: number) => [
      categories[index] || `Point ${index + 1}`,
      value || 0
    ]);
  }

  /**
   * Get headers for line chart export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Date', 'Value'];
  }

  /**
   * Get sheet name for line chart export
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sheet';
    return title.replace(/[^\w\s]/gi, '').substring(0, 31).trim();
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use LineChartBuilder.create() instead
 */
export function createLineChartWidget(data?: LineChartData[] | number[], xAxisData?: string[]): WidgetBuilder {
  return LineChartBuilder.createLineChartWidget(data, xAxisData);
} 