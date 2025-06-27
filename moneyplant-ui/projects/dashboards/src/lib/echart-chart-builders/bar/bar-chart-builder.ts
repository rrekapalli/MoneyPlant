import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder, ConfigurableChartBuilder } from '../apache-echart-builder';
import { BarChartConfiguration, ChartConfiguration } from '../chart-configurations';

export interface BarChartData {
  name: string;
  value: number;
}

export interface BarChartSeriesOptions {
  name?: string;
  type?: string;
  data?: number[] | BarChartData[];
  barWidth?: string;
  barHeight?: string;
  barMaxWidth?: string;
  barMinWidth?: string;
  barGap?: string;
  barCategoryGap?: string;
  stack?: string;
  sampling?: string;
  itemStyle?: {
    color?: string | string[];
    borderRadius?: number | number[];
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
  };
  emphasis?: {
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  label?: {
    show?: boolean;
    position?: string;
    formatter?: string;
    fontSize?: number;
    color?: string;
  };
  backgroundStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };
}

export interface BarChartOptions extends EChartsOption {
  xAxis?: any;
  yAxis?: any;
  series?: BarChartSeriesOptions[];
}

/**
 * Enhanced Bar Chart Builder with configurable presets
 * 
 * Usage examples:
 * 
 * // Using default configuration
 * const widget = BarChartBuilder.create()
 *   .setData([10, 20, 30, 40, 50])
 *   .setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Monthly Sales')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Using a preset configuration
 * const widget = BarChartBuilder.create()
 *   .useConfiguration(BarChartConfiguration.FINANCIAL)
 *   .setData([10, 20, 30, 40, 50])
 *   .setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Financial Performance')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Creating with custom configuration callback
 * const widget = BarChartBuilder.create()
 *   .createWithCustomConfig(builder => 
 *     builder
 *       .setBarWidth('60%')
 *       .setBarBorderRadius(8)
 *       .setTitle('Custom Bar Chart')
 *   )
 *   .setData([10, 20, 30, 40, 50])
 *   .build();
 * 
 * // Creating multiple variations
 * const widgets = BarChartBuilder.createVariations(() => BarChartBuilder.create(), [
 *   {
 *     name: 'financial',
 *     preset: BarChartConfiguration.FINANCIAL,
 *     config: builder => builder.setHeader('Financial').setData(data1)
 *   },
 *   {
 *     name: 'performance',
 *     preset: BarChartConfiguration.PERFORMANCE,
 *     config: builder => builder.setHeader('Performance').setData(data2)
 *   }
 * ]);
 * 
 * // Using factory pattern
 * const barChartFactory = BarChartBuilder.create().createFactory();
 * const widget1 = barChartFactory(data1, builder => builder.useConfiguration(BarChartConfiguration.STACKED));
 * const widget2 = barChartFactory(data2, builder => builder.useConfiguration(BarChartConfiguration.HORIZONTAL));
 */
export class BarChartBuilder extends ConfigurableChartBuilder<BarChartOptions, BarChartSeriesOptions> {
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
   * Initialize predefined configuration presets
   */
  protected override initializeDefaultConfigurations(): void {
    // Default configuration
    this.addConfiguration(BarChartConfiguration.DEFAULT, this.getDefaultOptions(), this.getDefaultSeriesOptions());

    // Financial bar chart configuration
    this.addConfiguration(BarChartConfiguration.FINANCIAL, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '12%',
        left: '8%',
        right: '8%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: ${c}K',
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: '#777',
        textStyle: { color: '#fff' }
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      itemStyle: {
        color: '#4CAF50',
        borderRadius: [4, 4, 0, 0],
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        show: true,
        position: 'top',
        formatter: '${c}K',
        fontSize: 11,
        color: '#4CAF50'
      }
    });

    // Performance monitoring configuration
    this.addConfiguration(BarChartConfiguration.PERFORMANCE, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '10%',
        left: '5%',
        right: '5%',
        bottom: '12%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      itemStyle: {
        color: '#ff6b6b',
        borderRadius: 2,
      },
      barWidth: '70%'
    });

    // Stacked bar configuration
    this.addConfiguration(BarChartConfiguration.STACKED, {
      ...this.getDefaultOptions(),
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      stack: 'total',
      itemStyle: {
        borderRadius: 0,
      }
    });

    // Minimal/clean configuration
    this.addConfiguration(BarChartConfiguration.MINIMAL, {
      ...this.getDefaultOptions(),
      grid: {
        containLabel: true,
        top: '5%',
        left: '2%',
        right: '2%',
        bottom: '5%',
      },
      tooltip: { trigger: 'axis' },
      legend: { show: false }
    }, {
      ...this.getDefaultSeriesOptions(),
      barWidth: '50%',
      itemStyle: {
        borderRadius: 1,
        opacity: 0.8
      }
    });

    // Horizontal bar configuration
    this.addConfiguration(BarChartConfiguration.HORIZONTAL, {
      ...this.getDefaultOptions(),
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: [],
      },
      grid: {
        containLabel: true,
        top: '10%',
        left: '15%',
        right: '10%',
        bottom: '10%',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      barHeight: '60%',
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
      }
    });

    // Grouped bar configuration
    this.addConfiguration(BarChartConfiguration.GROUPED, {
      ...this.getDefaultOptions(),
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%',
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      barGap: '20%',
      barCategoryGap: '40%',
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
      }
    });

    // Waterfall configuration
    this.addConfiguration(BarChartConfiguration.WATERFALL, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      }
    });
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
   * Set stack for stacked bar charts
   */
  setStack(stack: string): this {
    this.seriesOptions.stack = stack;
    return this;
  }

  /**
   * Set bar gap between bars in the same category
   */
  setBarGap(gap: string): this {
    this.seriesOptions.barGap = gap;
    return this;
  }

  /**
   * Set category gap between different categories
   */
  setBarCategoryGap(gap: string): this {
    this.seriesOptions.barCategoryGap = gap;
    return this;
  }

  /**
   * Set horizontal orientation (swaps x and y axes)
   */
  setHorizontal(horizontal: boolean = true): this {
    if (horizontal) {
      (this.chartOptions as any).xAxis = {
        type: 'value',
      };
      (this.chartOptions as any).yAxis = {
        type: 'category',
        data: this.categories,
      };
    } else {
      (this.chartOptions as any).xAxis = {
        type: 'category',
        data: this.categories,
      };
      (this.chartOptions as any).yAxis = {
        type: 'value',
      };
    }
    return this;
  }

  /**
   * Set label options
   */
  setLabel(show: boolean, position: string = 'top', formatter?: string): this {
    this.seriesOptions.label = {
      show,
      position,
      formatter: formatter || '{c}',
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

/**
 * Factory function to create bar chart widget
 */
export function createBarChartWidget(data?: BarChartData[] | number[], categories?: string[]): WidgetBuilder {
  const builder = BarChartBuilder.create();
  if (data) {
    builder.setData(data);
  }
  if (categories) {
    builder.setCategories(categories);
  }
  
  return builder['widgetBuilder'];
} 