import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder, ConfigurableChartBuilder } from '../apache-echart-builder';
import { AreaChartConfiguration, ChartConfiguration } from '../chart-configurations';

export interface AreaChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface AreaChartSeriesOptions {
  name?: string;
  type?: string;
  data?: AreaChartData[] | number[];
  smooth?: boolean;
  symbol?: string;
  symbolSize?: number;
  lineStyle?: {
    width?: number;
    color?: string;
    type?: string;
  };
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  areaStyle?: {
    color?: string | object;
    opacity?: number;
    origin?: string;
  };
  showSymbol?: boolean;
  emphasis?: {
    focus?: string;
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
    areaStyle?: {
      opacity?: number;
    };
  };
  stack?: string;
  sampling?: string;
  large?: boolean;
  largeThreshold?: number;
}

export interface AreaChartOptions extends EChartsOption {
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
  series?: AreaChartSeriesOptions[];
}

/**
 * Enhanced Area Chart Builder with configurable presets
 * 
 * Usage examples:
 * 
 * // Using default configuration
 * const widget = AreaChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setXAxisData(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Monthly Sales')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Using a preset configuration
 * const widget = AreaChartBuilder.create()
 *   .useConfiguration('financial')
 *   .setData(data)
 *   .setXAxisData(xData)
 *   .setHeader('Financial Overview')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Creating with custom configuration callback
 * const widget = AreaChartBuilder.create()
 *   .createWithCustomConfig(builder => 
 *     builder
 *       .setSmooth(true)
 *       .setGradientAreaStyle('#5470c6', '#91cc75')
 *       .setTitle('Custom Chart')
 *   )
 *   .setData(data)
 *   .build();
 * 
 * // Creating multiple variations
 * const widgets = AreaChartBuilder.createVariations([
 *   {
 *     name: 'revenue',
 *     preset: 'financial',
 *     config: builder => builder.setHeader('Revenue').setData(revenueData)
 *   },
 *   {
 *     name: 'performance',
 *     preset: 'performance',
 *     config: builder => builder.setHeader('Performance').setData(perfData)
 *   }
 * ]);
 * 
 * // Using factory pattern
 * const areaChartFactory = AreaChartBuilder.create().createFactory();
 * const widget1 = areaChartFactory(data1, builder => builder.setSmooth(true));
 * const widget2 = areaChartFactory(data2, builder => builder.setStack('total'));
 */
export class AreaChartBuilder extends ConfigurableChartBuilder<AreaChartOptions, AreaChartSeriesOptions> {
  protected override seriesOptions: AreaChartSeriesOptions;
  private xAxisData: string[] = [];

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new AreaChartBuilder instance
   */
  static create(): AreaChartBuilder {
    return new AreaChartBuilder();
  }

  /**
   * Initialize predefined configuration presets
   */
  protected override initializeDefaultConfigurations(): void {
    // Default configuration
    this.addConfiguration(AreaChartConfiguration.DEFAULT, this.getDefaultOptions(), this.getDefaultSeriesOptions());

    // Financial chart configuration
    this.addConfiguration(AreaChartConfiguration.FINANCIAL, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '10%',
        left: '8%',
        right: '8%',
        bottom: '12%',
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
      lineStyle: { width: 3, color: '#4CAF50' }
    });

    // Performance monitoring configuration
    this.addConfiguration(AreaChartConfiguration.PERFORMANCE, {
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
      areaStyle: {
        color: 'rgba(255, 107, 107, 0.2)',
        opacity: 0.4,
      },
      lineStyle: { width: 2, color: '#ff6b6b' }
    });

    // Stacked area configuration
    this.addConfiguration(AreaChartConfiguration.STACKED, {
      ...this.getDefaultOptions(),
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      stack: 'total',
      areaStyle: { opacity: 0.6 }
    });

    // Minimal/clean configuration
    this.addConfiguration(AreaChartConfiguration.MINIMAL, {
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
      lineStyle: { width: 1 },
      areaStyle: { opacity: 0.1 }
    });

    // Smooth gradient configuration
    this.addConfiguration(AreaChartConfiguration.SMOOTH_GRADIENT, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ddd',
        textStyle: { color: '#333' }
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(84, 112, 198, 0.8)' },
            { offset: 0.5, color: 'rgba(84, 112, 198, 0.4)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
          ],
        },
        opacity: 1,
      },
      lineStyle: { width: 3, color: '#5470c6' },
      symbolSize: 8
    });

    // Multi-series configuration
    this.addConfiguration(AreaChartConfiguration.MULTI_SERIES, {
      ...this.getDefaultOptions(),
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%',
        textStyle: { fontSize: 12 }
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
      areaStyle: { opacity: 0.4 },
      emphasis: {
        focus: 'series',
        areaStyle: { opacity: 0.7 }
      }
    });

    // Large dataset configuration
    this.addConfiguration(AreaChartConfiguration.LARGE_DATASET, {
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
      sampling: 'lttb', // Largest-Triangle-Three-Buckets sampling
      large: true,
      largeThreshold: 500,
      areaStyle: { opacity: 0.2 },
      lineStyle: { width: 1 }
    });
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<AreaChartOptions> {
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
   * Get default series options for area chart
   */
  private getDefaultSeriesOptions(): AreaChartSeriesOptions {
    return {
      name: 'Area Chart',
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
      areaStyle: {
        color: '#5470c6',
        opacity: 0.3,
        origin: 'auto',
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
   * Set the data for the area chart
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
    (this.chartOptions as any).xAxis.name = name;
    return this;
  }

  /**
   * Set Y-axis name
   */
  setYAxisName(name: string): this {
    (this.chartOptions as any).yAxis.name = name;
    return this;
  }

  /**
   * Set smooth curve
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
    this.seriesOptions.lineStyle = {
      width,
      color,
      type,
    };
    return this;
  }

  /**
   * Set item style (symbol color, border, etc.)
   */
  setItemStyle(color: string, borderColor?: string, borderWidth?: number): this {
    this.seriesOptions.itemStyle = {
      color,
      borderColor,
      borderWidth,
    };
    return this;
  }

  /**
   * Set area style with color and opacity
   */
  setAreaStyle(color: string, opacity: number = 0.3): this {
    this.seriesOptions.areaStyle = {
      color,
      opacity,
      origin: 'auto',
    };
    return this;
  }

  /**
   * Set gradient area style
   */
  setGradientAreaStyle(startColor: string, endColor: string, opacity: number = 0.3): this {
    this.seriesOptions.areaStyle = {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: startColor },
          { offset: 1, color: endColor }
        ],
      },
      opacity,
      origin: 'auto',
    };
    return this;
  }

  /**
   * Set show symbol
   */
  setShowSymbol(show: boolean): this {
    this.seriesOptions.showSymbol = show;
    return this;
  }

  /**
   * Set stack for stacked area charts
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
   * Build the widget with area chart configuration
   */
  override build(): IWidget {
    // Set the series with area chart specific options
    this.chartOptions.series = [this.seriesOptions];
    
    // Set the chart options
    this.widgetBuilder.setEChartsOptions(this.chartOptions as any);
    
    return this.widgetBuilder.build();
  }

  /**
   * Update widget data
   */
  static override updateData(widget: IWidget, data: any): void {
    if (AreaChartBuilder.isAreaChart(widget)) {
      const options = widget.config?.options as any;
      if (options?.series && options.series.length > 0) {
        options.series[0].data = data;
      }
    }
  }

  /**
   * Check if widget is an area chart
   */
  static isAreaChart(widget: IWidget): boolean {
    const options = widget.config?.options as any;
    return options?.series?.[0]?.type === 'line' && options?.series?.[0]?.areaStyle;
  }

  /**
   * Create area chart widget with default configuration
   */
  static createAreaChartWidget(data?: AreaChartData[] | number[], xAxisData?: string[]): WidgetBuilder {
    const builder = new WidgetBuilder()
      .setComponent('echart')
      .setEChartsOptions({
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
          data: xAxisData || [],
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
        series: [{
          name: 'Area Chart',
          type: 'line',
          data: data || [],
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
          areaStyle: {
            color: '#5470c6',
            opacity: 0.3,
            origin: 'auto',
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }],
      });

    return builder;
  }

  /**
   * Export data from area chart widget
   */
  static override exportData(widget: IWidget): any[] {
    if (!AreaChartBuilder.isAreaChart(widget)) {
      return [];
    }

    const options = widget.config?.options as any;
    const series = options?.series;
    const xAxis = options?.xAxis;

    if (!series || series.length === 0) return [];

    // Handle different xAxis structures
    let categories: string[] = [];
    if (xAxis) {
      if (Array.isArray(xAxis)) {
        categories = xAxis[0]?.data || [];
      } else if (xAxis.data) {
        categories = xAxis.data;
      }
    }

    // If no categories found, create default ones
    if (categories.length === 0 && series[0]?.data) {
      categories = series[0].data.map((_: any, index: number) => `Point ${index + 1}`);
    }

    const data: any[] = [];
    series.forEach((s: any, index: number) => {
      if (s.data) {
        s.data.forEach((value: any, pointIndex: number) => {
          if (index === 0) {
            data[pointIndex] = [categories[pointIndex] || `Point ${pointIndex + 1}`];
          }
          if (data[pointIndex]) {
            data[pointIndex].push(value || 0);
          }
        });
      }
    });

    return data;
  }

  /**
   * Get export headers for area chart
   */
  static override getExportHeaders(widget: IWidget): string[] {
    const options = widget.config?.options as any;
    const series = options?.series;
    if (!series || series.length === 0) return ['Category'];
    return ['Category', ...series.map((s: any) => s.name || 'Series')];
  }

  /**
   * Get export sheet name for area chart
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Area Chart';
    return `AreaChart_${title.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}

/**
 * Factory function to create area chart widget
 */
export function createAreaChartWidget(data?: AreaChartData[] | number[], xAxisData?: string[]): WidgetBuilder {
  return AreaChartBuilder.createAreaChartWidget(data, xAxisData);
} 