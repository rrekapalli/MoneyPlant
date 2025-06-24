import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface GaugeChartData {
  value: number;
  name?: string;
  [key: string]: any;
}

export interface GaugeChartSeriesOptions {
  name?: string;
  type?: string;
  data?: GaugeChartData[];
  min?: number;
  max?: number;
  startAngle?: number;
  endAngle?: number;
  radius?: string | string[];
  center?: string | string[];
  axisLine?: {
    lineStyle?: {
      width?: number;
      color?: Array<[number, string]>;
    };
  };
  progress?: {
    show?: boolean;
    width?: number;
  };
  pointer?: {
    show?: boolean;
    length?: string | number;
    width?: number;
  };
  axisTick?: {
    show?: boolean;
    splitNumber?: number;
    length?: number;
    lineStyle?: {
      width?: number;
      color?: string;
    };
  };
  splitLine?: {
    show?: boolean;
    length?: number;
    lineStyle?: {
      width?: number;
      color?: string;
    };
  };
  axisLabel?: {
    show?: boolean;
    distance?: number;
    color?: string;
    fontSize?: number;
  };
  title?: {
    show?: boolean;
    offsetCenter?: [number, number];
    color?: string;
    fontSize?: number;
  };
  detail?: {
    show?: boolean;
    offsetCenter?: [number, number];
    color?: string;
    fontSize?: number;
    formatter?: string;
  };
  itemStyle?: {
    color?: string;
  };
}

export interface GaugeChartOptions extends EChartsOption {
  series?: GaugeChartSeriesOptions[];
}

/**
 * Gauge Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = GaugeChartBuilder.create()
 *   .setData([{ value: 75, name: 'Progress' }])
 *   .setHeader('Savings Goal Progress')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = GaugeChartBuilder.create()
 *   .setData([{ value: 85, name: 'Portfolio Performance' }])
 *   .setTitle('Portfolio Performance', 'Current Year')
 *   .setRange(0, 100)
 *   .setRadius('60%')
 *   .setCenter(['50%', '60%'])
 *   .setProgress(true, 10)
 *   .setPointer(true, '80%', 6)
 *   .setAxisLine(20, [[0.3, '#ff6e76'], [0.7, '#fddd60'], [1, '#58d9f9']])
 *   .setDetail(true, [0, '70%'], '#333', 20, '{value}%')
 *   .setTitle(true, [0, '-40%'], '#333', 16)
 *   .setHeader('Performance Gauge')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * GaugeChartBuilder.updateData(widget, newData);
 */
export class GaugeChartBuilder extends ApacheEchartBuilder<GaugeChartOptions, GaugeChartSeriesOptions> {
  protected override seriesOptions: GaugeChartSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new GaugeChartBuilder instance
   */
  static create(): GaugeChartBuilder {
    return new GaugeChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<GaugeChartOptions> {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'gauge';
  }

  /**
   * Get default series options for gauge chart
   */
  private getDefaultSeriesOptions(): GaugeChartSeriesOptions {
    return {
      name: 'Gauge Chart',
      type: 'gauge',
      min: 0,
      max: 100,
      startAngle: 180,
      endAngle: 0,
      radius: '75%',
      center: ['50%', '60%'],
      axisLine: {
        lineStyle: {
          width: 30,
          color: [[0.3, '#ff6e76'], [0.7, '#fddd60'], [1, '#58d9f9']],
        },
      },
      progress: {
        show: true,
        width: 8,
      },
      pointer: {
        show: true,
        length: '60%',
        width: 8,
      },
      axisTick: {
        show: true,
        splitNumber: 5,
        length: 8,
        lineStyle: {
          width: 2,
          color: '#999',
        },
      },
      splitLine: {
        show: true,
        length: 30,
        lineStyle: {
          width: 4,
          color: '#999',
        },
      },
      axisLabel: {
        show: true,
        distance: 5,
        color: '#999',
        fontSize: 12,
      },
      title: {
        show: true,
        offsetCenter: [0, 70],
        color: '#464646',
        fontSize: 14,
      },
      detail: {
        show: true,
        offsetCenter: [0, 40],
        color: '#464646',
        fontSize: 30,
        formatter: '{value}%',
      },
    };
  }

  /**
   * Set the data for the gauge chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data as GaugeChartData[];
    super.setData(data);
    return this;
  }

  /**
   * Set the range (min and max values)
   */
  setRange(min: number, max: number): this {
    this.seriesOptions.min = min;
    this.seriesOptions.max = max;
    return this;
  }

  /**
   * Set the start and end angles
   */
  setAngles(startAngle: number, endAngle: number): this {
    this.seriesOptions.startAngle = startAngle;
    this.seriesOptions.endAngle = endAngle;
    return this;
  }

  /**
   * Set the radius of the gauge
   */
  setRadius(radius: string | string[]): this {
    this.seriesOptions.radius = radius;
    return this;
  }

  /**
   * Set the center position of the gauge
   */
  setCenter(center: string | string[]): this {
    this.seriesOptions.center = center;
    return this;
  }

  /**
   * Set the axis line style
   */
  setAxisLine(width: number, colors: Array<[number, string]>): this {
    if (!this.seriesOptions.axisLine) this.seriesOptions.axisLine = {};
    this.seriesOptions.axisLine.lineStyle = {
      width,
      color: colors,
    };
    return this;
  }

  /**
   * Set progress bar
   */
  setProgress(show: boolean, width: number = 8): this {
    if (!this.seriesOptions.progress) this.seriesOptions.progress = {};
    this.seriesOptions.progress.show = show;
    this.seriesOptions.progress.width = width;
    return this;
  }

  /**
   * Set pointer
   */
  setPointer(show: boolean, length: string | number = '60%', width: number = 8): this {
    if (!this.seriesOptions.pointer) this.seriesOptions.pointer = {};
    this.seriesOptions.pointer.show = show;
    this.seriesOptions.pointer.length = length;
    this.seriesOptions.pointer.width = width;
    return this;
  }

  /**
   * Set axis ticks
   */
  setAxisTick(show: boolean, splitNumber: number = 5, length: number = 8, width: number = 2, color: string = '#999'): this {
    if (!this.seriesOptions.axisTick) this.seriesOptions.axisTick = {};
    this.seriesOptions.axisTick.show = show;
    this.seriesOptions.axisTick.splitNumber = splitNumber;
    this.seriesOptions.axisTick.length = length;
    this.seriesOptions.axisTick.lineStyle = {
      width,
      color,
    };
    return this;
  }

  /**
   * Set split lines
   */
  setSplitLine(show: boolean, length: number = 30, width: number = 4, color: string = '#999'): this {
    if (!this.seriesOptions.splitLine) this.seriesOptions.splitLine = {};
    this.seriesOptions.splitLine.show = show;
    this.seriesOptions.splitLine.length = length;
    this.seriesOptions.splitLine.lineStyle = {
      width,
      color,
    };
    return this;
  }

  /**
   * Set axis labels
   */
  setAxisLabel(show: boolean, distance: number = 5, color: string = '#999', fontSize: number = 12): this {
    if (!this.seriesOptions.axisLabel) this.seriesOptions.axisLabel = {};
    this.seriesOptions.axisLabel.show = show;
    this.seriesOptions.axisLabel.distance = distance;
    this.seriesOptions.axisLabel.color = color;
    this.seriesOptions.axisLabel.fontSize = fontSize;
    return this;
  }

  /**
   * Set gauge title (renamed to avoid conflict with base class setTitle)
   */
  setGaugeTitle(show: boolean, offsetCenter: [number, number] = [0, 70], color: string = '#464646', fontSize: number = 14): this {
    if (!this.seriesOptions.title) this.seriesOptions.title = {};
    this.seriesOptions.title.show = show;
    this.seriesOptions.title.offsetCenter = offsetCenter;
    this.seriesOptions.title.color = color;
    this.seriesOptions.title.fontSize = fontSize;
    return this;
  }

  /**
   * Set detail
   */
  setDetail(show: boolean, offsetCenter: [number, number] = [0, 40], color: string = '#464646', fontSize: number = 30, formatter: string = '{value}%'): this {
    if (!this.seriesOptions.detail) this.seriesOptions.detail = {};
    this.seriesOptions.detail.show = show;
    this.seriesOptions.detail.offsetCenter = offsetCenter;
    this.seriesOptions.detail.color = color;
    this.seriesOptions.detail.fontSize = fontSize;
    this.seriesOptions.detail.formatter = formatter;
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: GaugeChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'gauge',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing gauge chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a gauge chart
   */
  static isGaugeChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'gauge');
  }

  /**
   * Static method to create a gauge chart widget with default configuration
   * (for backward compatibility)
   */
  static createGaugeChartWidget(data?: GaugeChartData[]): WidgetBuilder {
    const builder = GaugeChartBuilder.create();
    if (data) {
      builder.setData(data);
    }
    
    const finalOptions: GaugeChartOptions = {
      ...builder['chartOptions'],
      series: [{
        ...builder['seriesOptions'],
        type: 'gauge',
      }],
    };

    return builder['widgetBuilder']
      .setEChartsOptions(finalOptions)
      .setData(data || []);
  }

  /**
   * Export gauge chart data for Excel/CSV
   */
  static override exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    
    console.log('GaugeChartBuilder.exportData - Widget config:', widget.config?.options);
    console.log('GaugeChartBuilder.exportData - Series:', series);
    
    if (!series?.data) {
      console.warn('GaugeChartBuilder.exportData - No series data found');
      return [];
    }

    const data = series.data[0];
    const max = series.max || 100;
    
    console.log('GaugeChartBuilder.exportData - Data:', data);
    console.log('GaugeChartBuilder.exportData - Max:', max);
    
    return [[
      widget.config?.header?.title || 'Metric',
      data?.value || 0,
      max,
      GaugeChartBuilder.calculatePercentage(data?.value || 0, max)
    ]];
  }

  /**
   * Get headers for gauge chart export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Metric', 'Value', 'Target', 'Percentage'];
  }

  /**
   * Get sheet name for gauge chart export
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sheet';
    return title.replace(/[^\w\s]/gi, '').substring(0, 31).trim();
  }

  /**
   * Calculate percentage for gauge chart data
   */
  private static calculatePercentage(value: number, max: number): string {
    if (max === 0) return '0%';
    return `${((value / max) * 100).toFixed(2)}%`;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use GaugeChartBuilder.create() instead
 */
export function createGaugeChartWidget(data?: GaugeChartData[]): WidgetBuilder {
  return GaugeChartBuilder.createGaugeChartWidget(data);
} 