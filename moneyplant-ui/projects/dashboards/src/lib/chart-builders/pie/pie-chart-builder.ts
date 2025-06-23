import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface PieChartData {
  value: number;
  name: string;
}

export interface PieChartSeriesOptions {
  name?: string;
  type?: string;
  radius?: string | string[];
  center?: string | string[];
  itemStyle?: {
    borderRadius?: number;
    color?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  };
  label?: {
    show?: boolean;
    formatter?: string;
    position?: string;
    fontSize?: number;
    color?: string;
  };
  emphasis?: {
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
  };
  data?: PieChartData[];
}

export interface PieChartOptions extends EChartsOption {
  series?: PieChartSeriesOptions[];
}

/**
 * Pie Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = PieChartBuilder.create()
 *   .setData(initialData)
 *   .setHeader('Asset Allocation')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = PieChartBuilder.create()
 *   .setData(initialData)
 *   .setTitle('Portfolio Distribution', 'As of December 2024')
 *   .setRadius(['40%', '70%'])
 *   .setCenter(['50%', '60%'])
 *   .setLabelFormatter('{b}: {c} ({d}%)')
 *   .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
 *   .setTooltip('item', '{b}: {c} ({d}%)')
 *   .setLegend('horizontal', 'bottom')
 *   .setHeader('Custom Pie Chart')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * PieChartBuilder.updateData(widget, newData);
 */
export class PieChartBuilder extends ApacheEchartBuilder<PieChartOptions, PieChartSeriesOptions> {
  protected override seriesOptions: PieChartSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new PieChartBuilder instance
   */
  static create(): PieChartBuilder {
    return new PieChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<PieChartOptions> {
    return {
      grid: {
        containLabel: true,
        top: '15%',
        left: '5%',
        right: '5%',
        bottom: '15%',
        height: '70%',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        show: true,
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'pie';
  }

  /**
   * Get default series options for pie chart
   */
  private getDefaultSeriesOptions(): PieChartSeriesOptions {
    return {
      name: 'Pie Chart',
      type: 'pie',
      radius: ['30%', '60%'],
      center: ['50%', '50%'],
      itemStyle: {
        borderRadius: 2,
      },
      label: {
        formatter: '{b}\n{c}%\n({d})%',
        show: true,
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
   * Set the data for the pie chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data as PieChartData[];
    super.setData(data);
    return this;
  }

  /**
   * Set the radius of the pie chart
   */
  setRadius(radius: string | string[]): this {
    this.seriesOptions.radius = radius;
    return this;
  }

  /**
   * Set the center position of the pie chart
   */
  setCenter(center: string | string[]): this {
    this.seriesOptions.center = center;
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: PieChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'pie',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing pie chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a pie chart
   */
  static isPieChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'pie');
  }

  /**
   * Static method to create a pie chart widget with default configuration
   * (for backward compatibility)
   */
  static createPieChartWidget(data?: PieChartData[]): WidgetBuilder {
    const builder = PieChartBuilder.create();
    if (data) {
      builder.setData(data);
    }
    
    const finalOptions: PieChartOptions = {
      ...builder['chartOptions'],
      series: [{
        ...builder['seriesOptions'],
        type: 'pie',
      }],
    };

    return builder['widgetBuilder']
      .setEChartsOptions(finalOptions)
      .setData(data || []);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use PieChartBuilder.create() instead
 */
export function createPieChartWidget(data?: PieChartData[]): WidgetBuilder {
  return PieChartBuilder.createPieChartWidget(data);
} 