import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

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
    color?: string;
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
 * Line Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = LineChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setXAxisData(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Monthly Sales')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = LineChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setXAxisData(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setTitle('Portfolio Performance', 'Last 5 months')
 *   .setSmooth(true)
 *   .setAreaStyle('#5470c6', 0.3)
 *   .setLineStyle(3, '#5470c6', 'solid')
 *   .setSymbol('circle', 8)
 *   .setTooltip('axis', '{b}: {c}')
 *   .setLegend('horizontal', 'bottom')
 *   .setHeader('Performance Chart')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * LineChartBuilder.updateData(widget, newData);
 */
export class LineChartBuilder extends ApacheEchartBuilder<LineChartOptions, LineChartSeriesOptions> {
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
   * Export line chart data for Excel/CSV
   */
  static override exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    const xAxis = (widget.config?.options as any)?.xAxis;
    
    console.log('LineChartBuilder.exportData - Widget config:', widget.config?.options);
    console.log('LineChartBuilder.exportData - Series:', series);
    console.log('LineChartBuilder.exportData - XAxis:', xAxis);
    
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

    console.log('LineChartBuilder.exportData - Categories:', categories);
    console.log('LineChartBuilder.exportData - Series data:', series.data);

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