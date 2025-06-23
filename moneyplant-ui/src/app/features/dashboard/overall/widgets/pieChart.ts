import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';
import { EChartsOption } from 'echarts';

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

export interface PieChartOptions {
  title?: {
    text?: string;
    subtext?: string;
    left?: string | number;
    top?: string | number;
    textStyle?: {
      fontSize?: number;
      color?: string;
    };
  };
  tooltip?: {
    trigger?: string;
    formatter?: string | Function;
    backgroundColor?: string;
    borderColor?: string;
    textStyle?: {
      color?: string;
    };
  };
  legend?: {
    show?: boolean;
    orient?: string;
    left?: string | number;
    top?: string | number;
    bottom?: string | number;
    right?: string | number;
    textStyle?: {
      fontSize?: number;
      color?: string;
    };
  };
  grid?: {
    containLabel?: boolean;
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    height?: string | number;
  };
  series?: PieChartSeriesOptions[];
}

/**
 * Generic wrapper class for ECharts pie charts with method chaining support
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
export class PieChartBuilder {
  private widgetBuilder: WidgetBuilder;
  private chartOptions: PieChartOptions;
  private seriesOptions: PieChartSeriesOptions;

  private constructor() {
    this.widgetBuilder = new WidgetBuilder()
      .setId(uuidv4())
      .setComponent('echart');
    
    this.chartOptions = {
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

    this.seriesOptions = {
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
   * Create a new PieChartBuilder instance
   */
  static create(): PieChartBuilder {
    return new PieChartBuilder();
  }

  /**
   * Set the data for the pie chart
   */
  setData(data: PieChartData[]): PieChartBuilder {
    this.seriesOptions.data = data;
    this.widgetBuilder.setData(data);
    return this;
  }

  /**
   * Set the title and subtitle
   */
  setTitle(text: string, subtext?: string): PieChartBuilder {
    this.chartOptions.title = {
      text,
      subtext,
      left: 'center',
      top: '10',
      textStyle: {
        fontSize: 16,
        color: '#333',
      },
    };
    return this;
  }

  /**
   * Set the radius of the pie chart
   */
  setRadius(radius: string | string[]): PieChartBuilder {
    this.seriesOptions.radius = radius;
    return this;
  }

  /**
   * Set the center position of the pie chart
   */
  setCenter(center: string | string[]): PieChartBuilder {
    this.seriesOptions.center = center;
    return this;
  }

  /**
   * Set the label formatter
   */
  setLabelFormatter(formatter: string): PieChartBuilder {
    this.seriesOptions.label = {
      ...this.seriesOptions.label,
      formatter,
    };
    return this;
  }

  /**
   * Set label visibility
   */
  setLabelShow(show: boolean): PieChartBuilder {
    this.seriesOptions.label = {
      ...this.seriesOptions.label,
      show,
    };
    return this;
  }

  /**
   * Set label position
   */
  setLabelPosition(position: string): PieChartBuilder {
    this.seriesOptions.label = {
      ...this.seriesOptions.label,
      position,
    };
    return this;
  }

  /**
   * Set colors for the pie chart segments
   */
  setColors(colors: string[]): PieChartBuilder {
    this.seriesOptions.itemStyle = {
      ...this.seriesOptions.itemStyle,
      color: colors,
    };
    return this;
  }

  /**
   * Set border radius for pie segments
   */
  setBorderRadius(radius: number): PieChartBuilder {
    this.seriesOptions.itemStyle = {
      ...this.seriesOptions.itemStyle,
      borderRadius: radius,
    };
    return this;
  }

  /**
   * Set border color and width
   */
  setBorder(color: string, width: number = 1): PieChartBuilder {
    this.seriesOptions.itemStyle = {
      ...this.seriesOptions.itemStyle,
      borderColor: color,
      borderWidth: width,
    };
    return this;
  }

  /**
   * Set tooltip configuration
   */
  setTooltip(trigger: string, formatter?: string | Function): PieChartBuilder {
    this.chartOptions.tooltip = {
      trigger,
      formatter: formatter || '{b}: {c} ({d}%)',
    };
    return this;
  }

  /**
   * Set legend configuration
   */
  setLegend(orient: string = 'vertical', position: string = 'left'): PieChartBuilder {
    this.chartOptions.legend = {
      show: true,
      orient,
      left: position === 'left' ? 'left' : position === 'right' ? 'right' : 'center',
      top: orient === 'horizontal' ? 'bottom' : 'middle',
      bottom: orient === 'horizontal' ? '10' : undefined,
    };
    return this;
  }

  /**
   * Set grid configuration
   */
  setGrid(grid: {
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    height?: string | number;
  }): PieChartBuilder {
    this.chartOptions.grid = {
      ...this.chartOptions.grid,
      ...grid,
    };
    return this;
  }

  /**
   * Set emphasis effects
   */
  setEmphasis(shadowBlur: number = 10, shadowOffsetX: number = 0, shadowColor: string = 'rgba(0, 0, 0, 0.5)'): PieChartBuilder {
    this.seriesOptions.emphasis = {
      itemStyle: {
        shadowBlur,
        shadowOffsetX,
        shadowColor,
      },
    };
    return this;
  }

  /**
   * Set widget header
   */
  setHeader(title: string, options?: string[]): PieChartBuilder {
    this.widgetBuilder.setHeader(title, options);
    return this;
  }

  /**
   * Set widget position
   */
  setPosition(position: { x: number; y: number; cols: number; rows: number }): PieChartBuilder {
    this.widgetBuilder.setPosition(position);
    return this;
  }

  /**
   * Set custom ECharts options (overrides all other settings)
   */
  setCustomOptions(options: EChartsOption): PieChartBuilder {
    this.widgetBuilder.setEChartsOptions(options);
    return this;
  }

  /**
   * Build and return the final widget
   */
  build(): IWidget {
    // Merge series options with chart options
    const finalOptions: EChartsOption = {
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
  static updateData(widget: IWidget, data: PieChartData[]): void {
    WidgetBuilder.setData(widget, data);
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
    
    const finalOptions: EChartsOption = {
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
