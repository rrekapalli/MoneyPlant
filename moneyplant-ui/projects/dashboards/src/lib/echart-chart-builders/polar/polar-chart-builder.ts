import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface PolarChartData {
  value: number;
  name: string;
  [key: string]: any;
}

export interface PolarChartSeriesOptions {
  name?: string;
  type?: string;
  coordinateSystem?: string;
  data?: PolarChartData[] | number[];
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
  smooth?: boolean;
  stack?: string;
  sampling?: string;
}

export interface PolarChartOptions extends EChartsOption {
  polar?: {
    center?: string | string[];
    radius?: string | string[];
    startAngle?: number;
    endAngle?: number;
  };
  angleAxis?: {
    type?: string;
    startAngle?: number;
    endAngle?: number;
    min?: number;
    max?: number;
    axisLabel?: {
      color?: string;
      fontSize?: number;
    };
  };
  radiusAxis?: {
    type?: string;
    min?: number;
    max?: number;
    axisLabel?: {
      color?: string;
      fontSize?: number;
    };
  };
  series?: PolarChartSeriesOptions[];
}

/**
 * Polar Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = PolarChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setHeader('Polar Chart')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = PolarChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setTitle('Performance Metrics', '360-degree view')
 *   .setPolarCenter(['50%', '50%'])
 *   .setPolarRadius(['30%', '80%'])
 *   .setStartAngle(0)
 *   .setEndAngle(360)
 *   .setSmooth(true)
 *   .setAreaStyle('#5470c6', 0.3)
 *   .setLineStyle(3, '#5470c6', 'solid')
 *   .setSymbol('circle', 8)
 *   .setTooltip('item', '{b}: {c}')
 *   .setLegend('horizontal', 'bottom')
 *   .setHeader('Performance Metrics')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Multi-series polar chart
 * const widget = PolarChartBuilder.create()
 *   .setData([
 *     { name: 'Series 1', data: [10, 20, 30, 40, 50] },
 *     { name: 'Series 2', data: [5, 15, 25, 35, 45] }
 *   ])
 *   .setStack('total')
 *   .setHeader('Multi-Series Polar Chart')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * PolarChartBuilder.updateData(widget, newData);
 */
export class PolarChartBuilder extends ApacheEchartBuilder<PolarChartOptions, PolarChartSeriesOptions> {
  protected override seriesOptions: PolarChartSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new PolarChartBuilder instance
   */
  static create(): PolarChartBuilder {
    return new PolarChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<PolarChartOptions> {
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
        formatter: '{b}: {c}',
      },
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '10',
      },
      polar: {
        center: ['50%', '50%'],
        radius: ['30%', '80%'],
        startAngle: 0,
        endAngle: 360,
      },
      angleAxis: {
        type: 'value',
        startAngle: 0,
        endAngle: 360,
        min: 0,
        max: 100,
        axisLabel: {
          color: '#666',
          fontSize: 12,
        },
      },
      radiusAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          color: '#666',
          fontSize: 12,
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
   * Get default series options for polar chart
   */
  private getDefaultSeriesOptions(): PolarChartSeriesOptions {
    return {
      name: 'Polar Chart',
      type: 'line',
      coordinateSystem: 'polar',
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
   * Set the data for the polar chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data;
    super.setData(data);
    return this;
  }

  /**
   * Set polar center position
   */
  setPolarCenter(center: string | string[]): this {
    (this.chartOptions as any).polar.center = center;
    return this;
  }

  /**
   * Set polar radius
   */
  setPolarRadius(radius: string | string[]): this {
    (this.chartOptions as any).polar.radius = radius;
    return this;
  }

  /**
   * Set start angle
   */
  setStartAngle(angle: number): this {
    (this.chartOptions as any).polar.startAngle = angle;
    (this.chartOptions as any).angleAxis.startAngle = angle;
    return this;
  }

  /**
   * Set end angle
   */
  setEndAngle(angle: number): this {
    (this.chartOptions as any).polar.endAngle = angle;
    (this.chartOptions as any).angleAxis.endAngle = angle;
    return this;
  }

  /**
   * Set angle axis range
   */
  setAngleAxisRange(min: number, max: number): this {
    (this.chartOptions as any).angleAxis.min = min;
    (this.chartOptions as any).angleAxis.max = max;
    return this;
  }

  /**
   * Set radius axis range
   */
  setRadiusAxisRange(min: number, max: number): this {
    (this.chartOptions as any).radiusAxis.min = min;
    (this.chartOptions as any).radiusAxis.max = max;
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
    };
    return this;
  }

  /**
   * Set gradient area style
   */
  setGradientAreaStyle(startColor: string, endColor: string, opacity: number = 0.3): this {
    this.seriesOptions.areaStyle = {
      color: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.5,
        colorStops: [
          { offset: 0, color: startColor },
          { offset: 1, color: endColor }
        ],
      },
      opacity,
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
   * Set stack for stacked polar charts
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
   * Build the widget with polar chart configuration
   */
  override build(): IWidget {
    // Set the series with polar chart specific options
    this.chartOptions.series = [this.seriesOptions];
    
    // Set the chart options
    this.widgetBuilder.setEChartsOptions(this.chartOptions as any);
    
    return this.widgetBuilder.build();
  }

  /**
   * Update widget data
   */
  static override updateData(widget: IWidget, data: any): void {
    if (PolarChartBuilder.isPolarChart(widget)) {
      const options = widget.config?.options as any;
      if (options?.series && options.series.length > 0) {
        options.series[0].data = data;
      }
    }
  }

  /**
   * Check if widget is a polar chart
   */
  static isPolarChart(widget: IWidget): boolean {
    const options = widget.config?.options as any;
    return options?.series?.[0]?.coordinateSystem === 'polar';
  }

  /**
   * Create polar chart widget with default configuration
   */
  static createPolarChartWidget(data?: PolarChartData[] | number[]): WidgetBuilder {
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
          trigger: 'item',
          formatter: '{b}: {c}',
        },
        legend: {
          show: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '10',
        },
        polar: {
          center: ['50%', '50%'],
          radius: ['30%', '80%'],
          startAngle: 0,
          endAngle: 360,
        },
        angleAxis: {
          type: 'value',
          startAngle: 0,
          endAngle: 360,
          min: 0,
          max: 100,
          axisLabel: {
            color: '#666',
            fontSize: 12,
          },
        },
        radiusAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            color: '#666',
            fontSize: 12,
          },
        },
        series: [{
          name: 'Polar Chart',
          type: 'line',
          coordinateSystem: 'polar',
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
   * Export data from polar chart widget
   */
  static override exportData(widget: IWidget): any[] {
    if (!PolarChartBuilder.isPolarChart(widget)) {
      return [];
    }

    const options = widget.config?.options as any;
    const series = options?.series;

    if (!series || series.length === 0) return [];

    const data: any[] = [];
    series.forEach((s: any, index: number) => {
      if (s.data) {
        s.data.forEach((value: any, pointIndex: number) => {
          if (index === 0) {
            data[pointIndex] = [`Point ${pointIndex + 1}`];
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
   * Get export headers for polar chart
   */
  static override getExportHeaders(widget: IWidget): string[] {
    const options = widget.config?.options as any;
    const series = options?.series;
    if (!series || series.length === 0) return ['Angle'];
    return ['Angle', ...series.map((s: any) => s.name || 'Series')];
  }

  /**
   * Get export sheet name for polar chart
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Polar Chart';
    return `PolarChart_${title.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}

/**
 * Factory function to create polar chart widget
 */
export function createPolarChartWidget(data?: PolarChartData[] | number[]): WidgetBuilder {
  return PolarChartBuilder.createPolarChartWidget(data);
} 