import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface HeatmapChartData {
  value: [number, number, number]; // [x, y, value]
  name?: string;
  [key: string]: any;
}

export interface HeatmapChartSeriesOptions {
  name?: string;
  type?: string;
  data?: HeatmapChartData[];
  xAxisIndex?: number;
  yAxisIndex?: number;
  itemStyle?: {
    color?: string | Function;
    borderColor?: string;
    borderWidth?: number;
  };
  emphasis?: {
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
  };
  progressive?: number;
  progressiveThreshold?: number;
  animation?: boolean;
}

export interface HeatmapChartOptions extends EChartsOption {
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
    data?: string[];
    name?: string;
    nameLocation?: string;
    axisLabel?: {
      color?: string;
    };
  };
  visualMap?: {
    show?: boolean;
    min?: number;
    max?: number;
    calculable?: boolean;
    orient?: string;
    left?: string | number;
    top?: string | number;
    inRange?: {
      color?: string[];
    };
    text?: [string, string];
  };
  series?: HeatmapChartSeriesOptions[];
}

/**
 * Heatmap Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const data = [
 *   { value: [0, 0, 5], name: 'Mon-Morning' },
 *   { value: [1, 0, 7], name: 'Tue-Morning' },
 *   { value: [2, 0, 3], name: 'Wed-Morning' }
 * ];
 * const widget = HeatmapChartBuilder.create()
 *   .setData(data)
 *   .setXAxisData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
 *   .setYAxisData(['Morning', 'Afternoon', 'Evening'])
 *   .setHeader('Weekly Activity Heatmap')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = HeatmapChartBuilder.create()
 *   .setData(data)
 *   .setXAxisData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
 *   .setYAxisData(['Morning', 'Afternoon', 'Evening'])
 *   .setTitle('Portfolio Activity Heatmap', 'Last Week')
 *   .setVisualMap(0, 10, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'])
 *   .setXAxisName('Days')
 *   .setYAxisName('Time Periods')
 *   .setTooltip('item', '{b}: {c}')
 *   .setHeader('Activity Heatmap')
 *   .setPosition({ x: 0, y: 0, cols: 10, rows: 6 })
 *   .build();
 * 
 * // Update widget data dynamically
 * HeatmapChartBuilder.updateData(widget, newData);
 */
export class HeatmapChartBuilder extends ApacheEchartBuilder<HeatmapChartOptions, HeatmapChartSeriesOptions> {
  protected override seriesOptions: HeatmapChartSeriesOptions;
  private xAxisData: string[] = [];
  private yAxisData: string[] = [];

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new HeatmapChartBuilder instance
   */
  static create(): HeatmapChartBuilder {
    return new HeatmapChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<HeatmapChartOptions> {
    return {
      grid: {
        containLabel: true,
        top: '15%',
        left: '10%',
        right: '15%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
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
        type: 'category',
        data: [],
        nameLocation: 'middle',
        axisLabel: {
          color: '#666',
        },
      },
      visualMap: {
        show: true,
        min: 0,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%',
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
        },
        text: ['High', 'Low'],
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'heatmap';
  }

  /**
   * Get default series options for heatmap chart
   */
  private getDefaultSeriesOptions(): HeatmapChartSeriesOptions {
    return {
      name: 'Heatmap Chart',
      type: 'heatmap',
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      progressive: 1000,
      progressiveThreshold: 3000,
      animation: true,
    };
  }

  /**
   * Set the data for the heatmap chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data as HeatmapChartData[];
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
   * Set Y-axis data (categories)
   */
  setYAxisData(data: string[]): this {
    this.yAxisData = data;
    (this.chartOptions as any).yAxis.data = data;
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
   * Set visual map configuration
   */
  setVisualMap(min: number, max: number, colors: string[], text: [string, string] = ['High', 'Low']): this {
    if (!(this.chartOptions as any).visualMap) (this.chartOptions as any).visualMap = {};
    (this.chartOptions as any).visualMap.min = min;
    (this.chartOptions as any).visualMap.max = max;
    (this.chartOptions as any).visualMap.inRange = { color: colors };
    (this.chartOptions as any).visualMap.text = text;
    return this;
  }

  /**
   * Set visual map position
   */
  setVisualMapPosition(orient: string = 'horizontal', left: string | number = 'center', top: string | number = '5%'): this {
    if (!(this.chartOptions as any).visualMap) (this.chartOptions as any).visualMap = {};
    (this.chartOptions as any).visualMap.orient = orient;
    (this.chartOptions as any).visualMap.left = left;
    (this.chartOptions as any).visualMap.top = top;
    return this;
  }

  /**
   * Set item style (border color and width)
   */
  setItemStyle(borderColor: string = '#fff', borderWidth: number = 1): this {
    if (!this.seriesOptions.itemStyle) this.seriesOptions.itemStyle = {};
    this.seriesOptions.itemStyle.borderColor = borderColor;
    this.seriesOptions.itemStyle.borderWidth = borderWidth;
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
   * Set animation
   */
  override setAnimation(animation: boolean): this {
    this.seriesOptions.animation = animation;
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: HeatmapChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'heatmap',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing heatmap chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a heatmap chart
   */
  static isHeatmapChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'heatmap');
  }

  /**
   * Static method to create a heatmap chart widget with default configuration
   * (for backward compatibility)
   */
  static createHeatmapChartWidget(data?: HeatmapChartData[], xAxisData?: string[], yAxisData?: string[]): WidgetBuilder {
    const builder = HeatmapChartBuilder.create();
    if (data) {
      builder.setData(data);
    }
    if (xAxisData) {
      builder.setXAxisData(xAxisData);
    }
    if (yAxisData) {
      builder.setYAxisData(yAxisData);
    }
    
    const finalOptions: HeatmapChartOptions = {
      ...builder['chartOptions'],
      series: [{
        ...builder['seriesOptions'],
        type: 'heatmap',
      }],
    };

    return builder['widgetBuilder']
      .setEChartsOptions(finalOptions)
      .setData(data || []);
  }

  /**
   * Export heatmap chart data for Excel/CSV
   */
  exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    if (!series?.data) return [];

    return series.data.map((point: any) => [
      point[0] || 'X',
      point[1] || 'Y',
      point[2] || 0
    ]);
  }

  /**
   * Get headers for heatmap chart export
   */
  getExportHeaders(widget: IWidget): string[] {
    return ['X Axis', 'Y Axis', 'Value'];
  }

  /**
   * Get sheet name for heatmap chart export
   */
  getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Heatmap Chart';
    const cleanTitle = title.replace(/[^\w\s]/gi, '').substring(0, 20);
    return `${cleanTitle} (Heatmap Chart)`;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use HeatmapChartBuilder.create() instead
 */
export function createHeatmapChartWidget(data?: HeatmapChartData[], xAxisData?: string[], yAxisData?: string[]): WidgetBuilder {
  return HeatmapChartBuilder.createHeatmapChartWidget(data, xAxisData, yAxisData);
} 