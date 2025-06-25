import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface TreemapData {
  name: string;
  value: number;
  children?: TreemapData[];
}

export interface TreemapSeriesOptions {
  name?: string;
  type?: string;
  data?: TreemapData[];
  breadcrumb?: {
    show?: boolean;
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
  };
  itemStyle?: {
    borderColor?: string;
    borderWidth?: number;
    gapWidth?: number;
  };
  label?: {
    show?: boolean;
    formatter?: string;
    fontSize?: number;
    color?: string;
  };
  levels?: Array<{
    itemStyle?: {
      borderColor?: string;
      borderWidth?: number;
      gapWidth?: number;
    };
    label?: {
      show?: boolean;
      formatter?: string;
    };
  }>;
  emphasis?: {
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
  };
  roam?: boolean;
  nodeClick?: string;
  width?: string | number;
  height?: string | number;
}

export interface TreemapChartOptions extends EChartsOption {
  series?: TreemapSeriesOptions[];
}

/**
 * Treemap Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = TreemapChartBuilder.create()
 *   .setData(initialData)
 *   .setHeader('Portfolio Distribution')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = TreemapChartBuilder.create()
 *   .setData(initialData)
 *   .setTitle('Investment Portfolio', 'By Asset Class and Sector')
 *   .setBreadcrumb(true, 'top', 'left', 'right', 'bottom')
 *   .setItemStyle('#fff', 1, 1)
 *   .setLabelFormatter('{b}: {c}')
 *   .setLevels([
 *     {
 *       itemStyle: { borderColor: '#777', borderWidth: 0, gapWidth: 1 },
 *       label: { show: false }
 *     },
 *     {
 *       itemStyle: { borderColor: '#555', borderWidth: 5, gapWidth: 1 },
 *       label: { show: true }
 *     }
 *   ])
 *   .setEmphasis(10, 0, 'rgba(0, 0, 0, 0.5)')
 *   .setRoam(true)
 *   .setNodeClick('zoomToNode')
 *   .setTooltip('item', '{b}: {c}')
 *   .setHeader('Investment Portfolio')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically
 * TreemapChartBuilder.updateData(widget, newData);
 */
export class TreemapChartBuilder extends ApacheEchartBuilder<TreemapChartOptions, TreemapSeriesOptions> {
  protected override seriesOptions: TreemapSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new TreemapChartBuilder instance
   */
  static create(): TreemapChartBuilder {
    return new TreemapChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<TreemapChartOptions> {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
      series: [],
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'treemap';
  }

  /**
   * Get default series options for treemap chart
   */
  private getDefaultSeriesOptions(): TreemapSeriesOptions {
    return {
      name: 'Treemap Chart',
      type: 'treemap',
      breadcrumb: {
        show: true,
        top: '10%',
        left: '10%',
        right: '10%',
        bottom: '10%',
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
        gapWidth: 1,
      },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 12,
        color: '#333',
      },
      levels: [
        {
          itemStyle: {
            borderColor: '#777',
            borderWidth: 0,
            gapWidth: 1,
          },
          label: {
            show: false,
          },
        },
        {
          itemStyle: {
            borderColor: '#555',
            borderWidth: 5,
            gapWidth: 1,
          },
          label: {
            show: true,
          },
        },
        {
          itemStyle: {
            borderColor: '#555',
            borderWidth: 5,
            gapWidth: 1,
          },
          label: {
            show: true,
          },
        },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      roam: true,
      nodeClick: 'zoomToNode',
    };
  }

  /**
   * Set the data for the treemap chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data as TreemapData[];
    super.setData(data);
    return this;
  }

  /**
   * Set breadcrumb configuration
   */
  setBreadcrumb(show: boolean, top?: string | number, left?: string | number, right?: string | number, bottom?: string | number): this {
    this.seriesOptions.breadcrumb = {
      show,
      top,
      left,
      right,
      bottom,
    };
    return this;
  }

  /**
   * Set item style for treemap
   */
  setItemStyle(borderColor: string, borderWidth: number, gapWidth: number): this {
    this.seriesOptions.itemStyle = {
      borderColor,
      borderWidth,
      gapWidth,
    };
    return this;
  }

  /**
   * Set label formatter for treemap
   */
  override setLabelFormatter(formatter: string): this {
    if (!this.seriesOptions.label) this.seriesOptions.label = {};
    this.seriesOptions.label.formatter = formatter;
    return this;
  }

  /**
   * Set levels configuration for treemap
   */
  setLevels(levels: Array<{
    itemStyle?: {
      borderColor?: string;
      borderWidth?: number;
      gapWidth?: number;
    };
    label?: {
      show?: boolean;
      formatter?: string;
    };
  }>): this {
    this.seriesOptions.levels = levels;
    return this;
  }

  /**
   * Set roam option for treemap
   */
  setRoam(roam: boolean): this {
    this.seriesOptions.roam = roam;
    return this;
  }

  /**
   * Set node click behavior
   */
  setNodeClick(nodeClick: string): this {
    this.seriesOptions.nodeClick = nodeClick;
    return this;
  }

  /**
   * Set width and height for treemap
   */
  setSize(width: string | number, height: string | number): this {
    this.seriesOptions.width = width;
    this.seriesOptions.height = height;
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: TreemapChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'treemap',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data on an existing treemap chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a treemap chart
   */
  static isTreemapChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'treemap');
  }

  /**
   * Create a treemap chart widget with default configuration
   */
  static createTreemapChartWidget(data?: TreemapData[]): WidgetBuilder {
    const builder = new TreemapChartBuilder();
    if (data) {
      builder.setData(data);
    }
    return builder.widgetBuilder;
  }

  /**
   * Static method to export treemap data for Excel/CSV export
   */
  static override exportData(widget: IWidget): any[] {
    const chartOptions = widget['echartsOptions'];
    if (!chartOptions || !chartOptions.series || !chartOptions.series[0] || !chartOptions.series[0].data) {
      return [];
    }

    const data = chartOptions.series[0].data as TreemapData[];
    return this.flattenTreemapData(data);
  }

  /**
   * Static method to get headers for the exported data
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Name', 'Value', 'Level'];
  }

  /**
   * Static method to get sheet name for the exported data
   */
  static override getExportSheetName(widget: IWidget): string {
    return 'Treemap Data';
  }

  /**
   * Helper method to flatten treemap data for export
   */
  private static flattenTreemapData(data: TreemapData[], level: number = 0): any[] {
    const result: any[] = [];
    
    for (const item of data) {
      result.push({
        name: item.name,
        value: item.value,
        level: level,
      });
      
      if (item.children && item.children.length > 0) {
        result.push(...this.flattenTreemapData(item.children, level + 1));
      }
    }
    
    return result;
  }
}

/**
 * Convenience function to create a treemap chart widget
 */
export function createTreemapChartWidget(data?: TreemapData[]): WidgetBuilder {
  return TreemapChartBuilder.createTreemapChartWidget(data);
} 