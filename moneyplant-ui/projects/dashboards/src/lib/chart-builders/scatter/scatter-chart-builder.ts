import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

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
  itemStyle?: {
    color?: string | string[];
    opacity?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  emphasis?: {
    focus?: string;
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
  };
  large?: boolean;
  largeThreshold?: number;
  progressive?: number;
  progressiveThreshold?: number;
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
 * Scatter Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
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
 * // Advanced usage with custom options
 * const widget = ScatterChartBuilder.create()
 *   .setData(data)
 *   .setTitle('Portfolio Risk vs Return', 'Scatter Analysis')
 *   .setXAxisName('Risk')
 *   .setYAxisName('Return')
 *   .setSymbol('circle', 10)
 *   .setColors(['#5470c6', '#91cc75', '#fac858'])
 *   .setLargeScatter(true, 2000)
 *   .setTooltip('item', '{b}: ({c})')
 *   .setLegend('horizontal', 'bottom')
 *   .setHeader('Risk-Return Analysis')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * ScatterChartBuilder.updateData(widget, newData);
 */
export class ScatterChartBuilder extends ApacheEchartBuilder<ScatterChartOptions, ScatterChartSeriesOptions> {
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