import { IWidget } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface BarChartData {
  name: string;
  value: number;
}

export interface BarChartSeriesOptions {
  name?: string;
  type?: string;
  data?: number[] | BarChartData[];
  barWidth?: string;
  itemStyle?: {
    color?: string | string[];
    borderRadius?: number;
  };
  emphasis?: {
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
  };
}

export interface BarChartOptions extends EChartsOption {
  xAxis?: any;
  yAxis?: any;
  series?: BarChartSeriesOptions[];
}

/**
 * Bar Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = BarChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Monthly Sales')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = BarChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setTitle('Monthly Sales Report', 'Q1 2024')
 *   .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
 *   .setBarWidth('60%')
 *   .setBarBorderRadius(4)
 *   .setTooltip('axis', '{b}: {c}')
 *   .setLegend('horizontal', 'bottom')
 *   .setHeader('Custom Bar Chart')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 */
export class BarChartBuilder extends ApacheEchartBuilder<BarChartOptions, BarChartSeriesOptions> {
  protected override seriesOptions: BarChartSeriesOptions;
  private categories: string[] = [];

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new BarChartBuilder instance
   */
  static create(): BarChartBuilder {
    return new BarChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<BarChartOptions> {
    return {
      grid: {
        containLabel: true,
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        show: true,
        orient: 'horizontal',
        top: '10',
      },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: {
        type: 'value',
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'bar';
  }

  /**
   * Get default series options for bar chart
   */
  private getDefaultSeriesOptions(): BarChartSeriesOptions {
    return {
      name: 'Bar Chart',
      type: 'bar',
      itemStyle: {
        borderRadius: 2,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    };
  }

  /**
   * Set the data for the bar chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data;
    super.setData(data);
    return this;
  }

  /**
   * Set categories for x-axis
   */
  setCategories(categories: string[]): this {
    this.categories = categories;
    (this.chartOptions as any).xAxis = {
      ...(this.chartOptions as any).xAxis,
      data: categories,
    };
    return this;
  }

  /**
   * Set colors for the bars
   */
  override setColors(colors: string[]): this {
    // For bar charts, set colors directly on the series
    (this.seriesOptions as any).color = colors;
    return this;
  }

  /**
   * Set bar width
   */
  setBarWidth(width: string): this {
    this.seriesOptions.barWidth = width;
    return this;
  }

  /**
   * Set bar border radius
   */
  setBarBorderRadius(radius: number): this {
    this.seriesOptions.itemStyle = {
      ...this.seriesOptions.itemStyle,
      borderRadius: radius,
    };
    return this;
  }

  /**
   * Set y-axis name
   */
  setYAxisName(name: string): this {
    (this.chartOptions as any).yAxis = {
      ...(this.chartOptions as any).yAxis,
      name,
      nameLocation: 'middle',
      nameGap: 30,
    };
    return this;
  }

  /**
   * Set x-axis name
   */
  setXAxisName(name: string): this {
    (this.chartOptions as any).xAxis = {
      ...(this.chartOptions as any).xAxis,
      name,
      nameLocation: 'middle',
      nameGap: 30,
    };
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: BarChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'bar',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing bar chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a bar chart
   */
  static isBarChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'bar');
  }

  /**
   * Export bar chart data for Excel/CSV export
   * Extracts categories and their corresponding values
   * @param widget - Widget containing bar chart data
   * @returns Array of data rows for export
   */
  static override exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    const xAxis = (widget.config?.options as any)?.xAxis;
    
    if (!series?.data) {
      console.warn('BarChartBuilder.exportData - No series data found');
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
      categories = series.data.map((_: any, index: number) => `Category ${index + 1}`);
    }

    return series.data.map((value: any, index: number) => [
      categories[index] || `Category ${index + 1}`,
      value || 0
    ]);
  }

  /**
   * Get headers for bar chart export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Category', 'Value'];
  }

  /**
   * Get sheet name for bar chart export
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sheet';
    return title.replace(/[^\w\s]/gi, '').substring(0, 31).trim();
  }
} 