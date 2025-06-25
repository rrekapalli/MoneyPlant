import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface StackedAreaChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface StackedAreaSeriesData {
  name: string;
  data: number[];
  [key: string]: any;
}

export interface StackedAreaChartSeriesOptions {
  name?: string;
  type?: string;
  data?: number[];
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
  };
  stack?: string;
  sampling?: string;
}

export interface StackedAreaChartOptions extends EChartsOption {
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
  series?: StackedAreaChartSeriesOptions[];
}

/**
 * Stacked Area Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with multiple series
 * const widget = StackedAreaChartBuilder.create()
 *   .setMultiSeriesData([
 *     { name: 'Revenue', data: [120, 132, 101, 134, 90, 230, 210] },
 *     { name: 'Expenses', data: [80, 92, 71, 94, 60, 180, 160] },
 *     { name: 'Profit', data: [40, 40, 30, 40, 30, 50, 50] }
 *   ])
 *   .setXAxisData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'])
 *   .setHeader('Financial Overview')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom styling
 * const widget = StackedAreaChartBuilder.create()
 *   .setMultiSeriesData([
 *     { name: 'Revenue', data: [120, 132, 101, 134, 90, 230, 210] },
 *     { name: 'Expenses', data: [80, 92, 71, 94, 60, 180, 160] }
 *   ])
 *   .setXAxisData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'])
 *   .setTitle('Financial Performance', 'Revenue vs Expenses')
 *   .setSmooth(true)
 *   .setStack('total')
 *   .setColors(['#5470c6', '#91cc75', '#fac858'])
 *   .setAreaStyle('#5470c6', 0.6)
 *   .setLineStyle(2, '#5470c6', 'solid')
 *   .setSymbol('circle', 5)
 *   .setTooltip('axis', '{b}: ${c}K')
 *   .setLegend('horizontal', 'bottom')
 *   .setHeader('Financial Performance')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * StackedAreaChartBuilder.updateData(widget, newMultiSeriesData);
 */
export class StackedAreaChartBuilder extends ApacheEchartBuilder<StackedAreaChartOptions, StackedAreaChartSeriesOptions> {
  protected override seriesOptions: StackedAreaChartSeriesOptions;
  private xAxisData: string[] = [];
  private multiSeriesData: StackedAreaSeriesData[] = [];
  private colors: string[] = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new StackedAreaChartBuilder instance
   */
  static create(): StackedAreaChartBuilder {
    return new StackedAreaChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<StackedAreaChartOptions> {
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
   * Get default series options for stacked area chart
   */
  private getDefaultSeriesOptions(): StackedAreaChartSeriesOptions {
    return {
      name: 'Stacked Area',
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
        opacity: 0.6,
        origin: 'auto',
      },
      stack: 'total',
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
   * Set multi-series data for stacked area chart
   */
  setMultiSeriesData(data: StackedAreaSeriesData[]): this {
    this.multiSeriesData = data;
    return this;
  }

  /**
   * Set the data for the stacked area chart (single series)
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
  setAreaStyle(color: string, opacity: number = 0.6): this {
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
  setGradientAreaStyle(startColor: string, endColor: string, opacity: number = 0.6): this {
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
   * Set colors for multiple series
   */
  override setColors(colors: string[]): this {
    this.colors = colors;
    return this;
  }

  /**
   * Build the widget with stacked area chart configuration
   */
  override build(): IWidget {
    // Create series from multi-series data
    const series: StackedAreaChartSeriesOptions[] = [];
    
    if (this.multiSeriesData.length > 0) {
      this.multiSeriesData.forEach((seriesData, index) => {
        const seriesOption: StackedAreaChartSeriesOptions = {
          ...this.seriesOptions,
          name: seriesData.name,
          data: seriesData.data,
          itemStyle: {
            color: this.colors[index % this.colors.length],
          },
          areaStyle: {
            color: this.colors[index % this.colors.length],
            opacity: 0.6,
            origin: 'auto',
          },
          lineStyle: {
            width: 2,
            color: this.colors[index % this.colors.length],
            type: 'solid',
          },
        };
        series.push(seriesOption);
      });
    } else {
      // Fallback to single series
      series.push(this.seriesOptions);
    }
    
    // Set the series
    this.chartOptions.series = series;
    
    // Set the chart options
    this.widgetBuilder.setEChartsOptions(this.chartOptions as any);
    
    return this.widgetBuilder.build();
  }

  /**
   * Update widget data
   */
  static override updateData(widget: IWidget, data: StackedAreaSeriesData[]): void {
    if (StackedAreaChartBuilder.isStackedAreaChart(widget)) {
      const options = widget.config?.options as any;
      if (options?.series && Array.isArray(data)) {
        data.forEach((seriesData, index) => {
          if (options.series[index]) {
            options.series[index].data = seriesData.data;
            options.series[index].name = seriesData.name;
          }
        });
      }
    }
  }

  /**
   * Check if widget is a stacked area chart
   */
  static isStackedAreaChart(widget: IWidget): boolean {
    const options = widget.config?.options as any;
    return options?.series?.[0]?.type === 'line' && 
           options?.series?.[0]?.areaStyle && 
           options?.series?.[0]?.stack;
  }

  /**
   * Create stacked area chart widget with default configuration
   */
  static createStackedAreaChartWidget(data?: StackedAreaSeriesData[], xAxisData?: string[]): WidgetBuilder {
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];
    
    const series: StackedAreaChartSeriesOptions[] = [];
    
    if (data && data.length > 0) {
      data.forEach((seriesData, index) => {
        series.push({
          name: seriesData.name,
          type: 'line',
          data: seriesData.data,
          smooth: false,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: true,
          lineStyle: {
            width: 2,
            color: colors[index % colors.length],
            type: 'solid',
          },
          itemStyle: {
            color: colors[index % colors.length],
          },
          areaStyle: {
            color: colors[index % colors.length],
            opacity: 0.6,
            origin: 'auto',
          },
          stack: 'total',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        });
      });
    }

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
        series: series,
      });

    return builder;
  }

  /**
   * Export data from stacked area chart widget
   */
  static override exportData(widget: IWidget): any[] {
    if (!StackedAreaChartBuilder.isStackedAreaChart(widget)) {
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
   * Get export headers for stacked area chart
   */
  static override getExportHeaders(widget: IWidget): string[] {
    const options = widget.config?.options as any;
    const series = options?.series;
    if (!series || series.length === 0) return ['Category'];
    return ['Category', ...series.map((s: any) => s.name || 'Series')];
  }

  /**
   * Get export sheet name for stacked area chart
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Stacked Area Chart';
    return `StackedAreaChart_${title.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}

/**
 * Factory function to create stacked area chart widget
 */
export function createStackedAreaChartWidget(data?: StackedAreaSeriesData[], xAxisData?: string[]): WidgetBuilder {
  return StackedAreaChartBuilder.createStackedAreaChartWidget(data, xAxisData);
} 