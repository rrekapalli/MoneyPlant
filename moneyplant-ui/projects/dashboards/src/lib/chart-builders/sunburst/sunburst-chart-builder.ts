import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface SunburstChartData {
  name: string;
  value?: number;
  children?: SunburstChartData[];
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}

export interface SunburstChartSeriesOptions {
  name?: string;
  type?: string;
  radius?: string | string[];
  center?: string | string[];
  data?: SunburstChartData[];
  itemStyle?: {
    borderWidth?: number;
    borderColor?: string;
  };
  label?: {
    show?: boolean;
    formatter?: string;
    position?: string;
    fontSize?: number;
    color?: string;
    rotate?: string;
  };
  levels?: any[];
  sort?: string;
  animationDuration?: number;
  animationEasing?: string;
}

export interface SunburstChartOptions extends EChartsOption {
  series?: SunburstChartSeriesOptions[];
}

/**
 * Sunburst Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = SunburstChartBuilder.create()
 *   .setData(initialData)
 *   .setHeader('Hierarchical Data')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = SunburstChartBuilder.create()
 *   .setData(initialData)
 *   .setTitle('Organizational Structure', 'Hierarchical View')
 *   .setRadius(['20%', '90%'])
 *   .setCenter(['50%', '50%'])
 *   .setLabelFormatter('{b}')
 *   .setLevels([
 *     { itemStyle: { borderWidth: 2, borderColor: '#777' } },
 *     { itemStyle: { borderWidth: 1, borderColor: '#555' } },
 *     { itemStyle: { borderWidth: 1, borderColor: '#333' } }
 *   ])
 *   .setTooltip('item', '{b}: {c}')
 *   .setHeader('Custom Sunburst Chart')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * SunburstChartBuilder.updateData(widget, newData);
 */
export class SunburstChartBuilder extends ApacheEchartBuilder<SunburstChartOptions, SunburstChartSeriesOptions> {
  protected override seriesOptions: SunburstChartSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new SunburstChartBuilder instance
   */
  static create(): SunburstChartBuilder {
    return new SunburstChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<SunburstChartOptions> {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
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
    return 'sunburst';
  }

  /**
   * Get default series options for sunburst chart
   */
  private getDefaultSeriesOptions(): SunburstChartSeriesOptions {
    return {
      name: 'Sunburst Chart',
      type: 'sunburst',
      radius: ['20%', '90%'],
      center: ['50%', '50%'],
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff',
      },
      label: {
        show: true,
        formatter: '{b}',
        position: 'inside',
        fontSize: 12,
        color: '#fff',
        rotate: 'radial',
      },
      levels: [
        {
          itemStyle: {
            borderWidth: 2,
            borderColor: '#777',
          },
        },
        {
          itemStyle: {
            borderWidth: 1,
            borderColor: '#555',
          },
        },
        {
          itemStyle: {
            borderWidth: 1,
            borderColor: '#333',
          },
        },
      ],
      sort: 'desc',
      animationDuration: 1000,
      animationEasing: 'cubicOut',
    };
  }

  /**
   * Set the data for the sunburst chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data as SunburstChartData[];
    super.setData(data);
    return this;
  }

  /**
   * Set the radius of the sunburst chart
   */
  setRadius(radius: string | string[]): this {
    this.seriesOptions.radius = radius;
    return this;
  }

  /**
   * Set the center position of the sunburst chart
   */
  setCenter(center: string | string[]): this {
    this.seriesOptions.center = center;
    return this;
  }

  /**
   * Set the levels configuration for the sunburst chart
   */
  setLevels(levels: any[]): this {
    this.seriesOptions.levels = levels;
    return this;
  }

  /**
   * Set the sort order for the sunburst chart
   */
  setSort(sort: string): this {
    this.seriesOptions.sort = sort;
    return this;
  }

  /**
   * Set animation duration
   */
  setAnimationDuration(duration: number): this {
    this.seriesOptions.animationDuration = duration;
    return this;
  }

  /**
   * Set animation easing
   */
  setAnimationEasing(easing: string): this {
    this.seriesOptions.animationEasing = easing;
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: SunburstChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'sunburst',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing sunburst chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a sunburst chart
   */
  static isSunburstChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'sunburst');
  }

  /**
   * Static method to create a sunburst chart widget with default configuration
   */
  static createSunburstChartWidget(data?: SunburstChartData[]): WidgetBuilder {
    return SunburstChartBuilder.create()
      .setData(data || [])
      .setHeader('Sunburst Chart')
      .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
      .getWidgetBuilder();
  }

  /**
   * Static method to export chart data for Excel/CSV export
   */
  static override exportData(widget: IWidget): any[] {
    const data = widget.data || [];
    const exportData: any[] = [];

    const flattenData = (items: SunburstChartData[], level: number = 0, parent: string = ''): void => {
      items.forEach(item => {
        exportData.push({
          'Level': level,
          'Parent': parent,
          'Name': item.name,
          'Value': item.value || 0,
        });

        if (item.children && item.children.length > 0) {
          flattenData(item.children, level + 1, item.name);
        }
      });
    };

    flattenData(data);
    return exportData;
  }

  /**
   * Static method to get headers for the exported data
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Level', 'Parent', 'Name', 'Value'];
  }

  /**
   * Static method to get sheet name for the exported data
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sunburst Chart';
    return title.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 31);
  }
}

/**
 * Convenience function to create a sunburst chart widget
 */
export function createSunburstChartWidget(data?: SunburstChartData[]): WidgetBuilder {
  return SunburstChartBuilder.createSunburstChartWidget(data);
} 