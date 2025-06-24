import { IWidget, WidgetBuilder } from '../../public-api';
import { v4 as uuidv4 } from 'uuid';
import { EChartsOption } from 'echarts';

/**
 * Abstract base class for Apache ECharts builders
 * Provides common functionality for all chart types
 */
export abstract class ApacheEchartBuilder<T extends EChartsOption = EChartsOption, TSeries extends { [key: string]: any } = any> {
  protected widgetBuilder: WidgetBuilder;
  protected chartOptions: Partial<T>;
  protected seriesOptions!: TSeries;

  protected constructor() {
    this.widgetBuilder = new WidgetBuilder()
      .setId(uuidv4())
      .setComponent('echart');
    
    this.chartOptions = this.getDefaultOptions();
  }

  /**
   * Abstract method to be implemented by subclasses
   * Should return default options for the specific chart type
   */
  protected abstract getDefaultOptions(): Partial<T>;

  /**
   * Abstract method to be implemented by subclasses
   * Should return the chart type string (e.g., 'pie', 'bar', 'line')
   */
  protected abstract getChartType(): string;

  /**
   * Abstract method to export chart data for Excel/CSV export
   * Should return an array of data rows
   */
  abstract exportData(widget: IWidget): any[];

  /**
   * Abstract method to get headers for the exported data
   * Should return an array of column headers
   */
  abstract getExportHeaders(widget: IWidget): string[];

  /**
   * Abstract method to get sheet name for the exported data
   * Should return a string suitable for Excel sheet name
   */
  abstract getExportSheetName(widget: IWidget): string;

  /**
   * Set the data for the chart
   */
  setData(data: any): this {
    this.widgetBuilder.setData(data);
    return this;
  }

  // --- Generic Series Option Methods ---

  /**
   * Set the label formatter
   */
  setLabelFormatter(formatter: string): this {
    if (!(this.seriesOptions as any).label) (this.seriesOptions as any).label = {};
    (this.seriesOptions as any).label.formatter = formatter;
    return this;
  }

  /**
   * Set label visibility
   */
  setLabelShow(show: boolean): this {
    if (!(this.seriesOptions as any).label) (this.seriesOptions as any).label = {};
    (this.seriesOptions as any).label.show = show;
    return this;
  }

  /**
   * Set label position
   */
  setLabelPosition(position: string): this {
    if (!(this.seriesOptions as any).label) (this.seriesOptions as any).label = {};
    (this.seriesOptions as any).label.position = position;
    return this;
  }

  /**
   * Set colors for the chart segments/bars/lines
   */
  setColors(colors: string[]): this {
    const chartType = this.getChartType();
    
    if (chartType === 'pie') {
      // For pie charts, set colors directly on the series
      (this.seriesOptions as any).color = colors;
    } else {
      // For other charts (bar, line, etc.), set colors in itemStyle
      if (!(this.seriesOptions as any).itemStyle) (this.seriesOptions as any).itemStyle = {};
      (this.seriesOptions as any).itemStyle.color = colors;
    }
    
    return this;
  }

  /**
   * Set border radius for segments/bars
   */
  setBorderRadius(radius: number): this {
    if (!(this.seriesOptions as any).itemStyle) (this.seriesOptions as any).itemStyle = {};
    (this.seriesOptions as any).itemStyle.borderRadius = radius;
    return this;
  }

  /**
   * Set border color and width
   */
  setBorder(color: string, width: number = 1): this {
    if (!(this.seriesOptions as any).itemStyle) (this.seriesOptions as any).itemStyle = {};
    (this.seriesOptions as any).itemStyle.borderColor = color;
    (this.seriesOptions as any).itemStyle.borderWidth = width;
    return this;
  }

  /**
   * Set emphasis effects
   */
  setEmphasis(shadowBlur: number = 10, shadowOffsetX: number = 0, shadowColor: string = 'rgba(0, 0, 0, 0.5)'): this {
    (this.seriesOptions as any).emphasis = {
      itemStyle: {
        shadowBlur,
        shadowOffsetX,
        shadowColor,
      },
    };
    return this;
  }

  /**
   * Set the title and subtitle
   */
  setTitle(text: string, subtext?: string): this {
    (this.chartOptions as any).title = {
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
   * Set custom title options
   */
  setTitleOptions(titleOptions: any): this {
    (this.chartOptions as any).title = {
      ...(this.chartOptions as any).title,
      ...titleOptions,
    };
    return this;
  }

  /**
   * Set tooltip configuration
   */
  setTooltip(trigger: string, formatter?: string | Function): this {
    (this.chartOptions as any).tooltip = {
      trigger,
      formatter: formatter || '{b}: {c}',
    };
    return this;
  }

  /**
   * Set custom tooltip options
   */
  setTooltipOptions(tooltipOptions: any): this {
    (this.chartOptions as any).tooltip = {
      ...(this.chartOptions as any).tooltip,
      ...tooltipOptions,
    };
    return this;
  }

  /**
   * Set legend configuration
   */
  setLegend(orient: string = 'vertical', position: string = 'left'): this {
    (this.chartOptions as any).legend = {
      show: true,
      orient,
      left: position === 'left' ? 'left' : position === 'right' ? 'right' : 'center',
      top: orient === 'horizontal' ? 'bottom' : 'middle',
      bottom: orient === 'horizontal' ? '10' : undefined,
    };
    return this;
  }

  /**
   * Set custom legend options
   */
  setLegendOptions(legendOptions: any): this {
    (this.chartOptions as any).legend = {
      ...(this.chartOptions as any).legend,
      ...legendOptions,
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
    width?: string | number;
    containLabel?: boolean;
  }): this {
    (this.chartOptions as any).grid = {
      ...(this.chartOptions as any).grid,
      ...grid,
    };
    return this;
  }

  /**
   * Set x-axis configuration
   */
  setXAxis(xAxis: any): this {
    (this.chartOptions as any).xAxis = xAxis;
    return this;
  }

  /**
   * Set y-axis configuration
   */
  setYAxis(yAxis: any): this {
    (this.chartOptions as any).yAxis = yAxis;
    return this;
  }

  /**
   * Set series configuration
   */
  setSeries(series: any[]): this {
    (this.chartOptions as any).series = series;
    return this;
  }

  /**
   * Add a single series
   */
  addSeries(series: any): this {
    if (!(this.chartOptions as any).series) {
      (this.chartOptions as any).series = [];
    }
    (this.chartOptions as any).series.push(series);
    return this;
  }

  /**
   * Set animation configuration
   */
  setAnimation(animation: boolean | any): this {
    (this.chartOptions as any).animation = animation;
    return this;
  }

  /**
   * Set background color
   */
  setBackgroundColor(color: string): this {
    (this.chartOptions as any).backgroundColor = color;
    return this;
  }

  /**
   * Set widget header
   */
  setHeader(title: string, options?: string[]): this {
    this.widgetBuilder.setHeader(title, options);
    return this;
  }

  /**
   * Set widget position
   */
  setPosition(position: { x: number; y: number; cols: number; rows: number }): this {
    this.widgetBuilder.setPosition(position);
    return this;
  }

  /**
   * Set custom ECharts options (overrides all other settings)
   */
  setCustomOptions(options: T): this {
    this.widgetBuilder.setEChartsOptions(options);
    return this;
  }

  /**
   * Set events configuration
   */
  setEvents(onChartOptions: (widget: IWidget, chart?: any, filters?: any) => void): this {
    this.widgetBuilder.setEvents(onChartOptions);
    return this;
  }

  /**
   * Set chart instance
   */
  setChartInstance(chartInstance: any): this {
    this.widgetBuilder.setChartInstance(chartInstance);
    return this;
  }

  /**
   * Build and return the final widget
   */
  build(): IWidget {
    return this.widgetBuilder
      .setEChartsOptions(this.chartOptions as T)
      .build();
  }

  /**
   * Get the current chart options (useful for debugging or modification)
   */
  getChartOptions(): Partial<T> {
    return { ...this.chartOptions };
  }

  /**
   * Get the widget builder instance (for advanced usage)
   */
  getWidgetBuilder(): WidgetBuilder {
    return this.widgetBuilder;
  }

  /**
   * Static method to update data on an existing chart widget
   */
  static updateData(widget: IWidget, data: any): void {
    WidgetBuilder.setData(widget, data);
  }

  /**
   * Static method to check if a widget is a specific chart type
   */
  static isChartType(widget: IWidget, chartType: string): boolean {
    return widget.config.component === 'echart' && 
           (widget.config.options as any)?.series?.[0]?.type === chartType;
  }

  /**
   * Static method to get chart type from widget
   */
  static getChartType(widget: IWidget): string | null {
    if (widget.config.component === 'echart' && 
        (widget.config.options as any)?.series?.[0]?.type) {
      return (widget.config.options as any).series[0].type;
    }
    return null;
  }
}

/**
 * Generic interface for chart data
 */
export interface ChartData {
  [key: string]: any;
}

/**
 * Common chart options interface
 */
export interface CommonChartOptions {
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
    width?: string | number;
  };
  xAxis?: any;
  yAxis?: any;
  series?: any[];
  animation?: boolean | any;
  backgroundColor?: string;
} 