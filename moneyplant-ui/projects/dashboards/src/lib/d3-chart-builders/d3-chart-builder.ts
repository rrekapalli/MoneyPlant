import { IWidget, WidgetBuilder } from '../../public-api';
import { v4 as uuidv4 } from 'uuid';
import * as d3 from 'd3';

/**
 * Abstract base class for D3.js chart builders
 * Provides common functionality for all D3 chart types
 */
export abstract class D3ChartBuilder<T extends D3ChartOptions = D3ChartOptions, TSeries extends { [key: string]: any } = any> {
  protected widgetBuilder: WidgetBuilder;
  protected chartOptions: Partial<T>;
  protected seriesOptions!: TSeries;
  protected container: HTMLElement | null = null;
  protected svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;

  protected constructor() {
    this.widgetBuilder = new WidgetBuilder()
      .setId(uuidv4())
      .setComponent('d3-chart');
    
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
   * Abstract method to be implemented by subclasses
   * Should render the chart using D3.js
   */
  protected abstract renderChart(container: HTMLElement, data: any, options: T): void;

  /**
   * Abstract method to be implemented by subclasses
   * Should update the chart with new data
   */
  protected abstract updateChart(data: any, options: T): void;

  /**
   * Static method to export chart data for Excel/CSV export
   * Should return an array of data rows
   */
  static exportData(widget: IWidget): any[] {
    throw new Error('exportData must be implemented by subclass');
  }

  /**
   * Static method to get headers for the exported data
   * Should return an array of column headers
   */
  static getExportHeaders(widget: IWidget): string[] {
    throw new Error('getExportHeaders must be implemented by subclass');
  }

  /**
   * Static method to get sheet name for the exported data
   * Should return a string suitable for Excel sheet name
   */
  static getExportSheetName(widget: IWidget): string {
    throw new Error('getExportSheetName must be implemented by subclass');
  }

  /**
   * Set the data for the chart
   */
  setData(data: any): this {
    this.widgetBuilder.setData(data);
    return this;
  }

  /**
   * Set the title and subtitle
   */
  setTitle(text: string, subtext?: string): this {
    (this.chartOptions as any).title = {
      text,
      subtext,
      fontSize: 16,
      color: '#333',
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
  setTooltip(show: boolean = true, formatter?: (d: any) => string): this {
    (this.chartOptions as any).tooltip = {
      show,
      formatter,
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
  setLegend(show: boolean = true, position: string = 'right'): this {
    (this.chartOptions as any).legend = {
      show,
      position,
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
   * Set colors for the chart segments/bars/lines
   */
  setColors(colors: string[]): this {
    (this.chartOptions as any).colors = colors;
    return this;
  }

  /**
   * Set animation configuration
   */
  setAnimation(enabled: boolean = true, duration: number = 750): this {
    (this.chartOptions as any).animation = {
      enabled,
      duration,
    };
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
   * Set chart dimensions
   */
  setDimensions(width: number, height: number): this {
    (this.chartOptions as any).width = width;
    (this.chartOptions as any).height = height;
    return this;
  }

  /**
   * Set margins
   */
  setMargins(top: number = 20, right: number = 20, bottom: number = 30, left: number = 40): this {
    (this.chartOptions as any).margin = {
      top,
      right,
      bottom,
      left,
    };
    return this;
  }

  /**
   * Set header
   */
  setHeader(title: string, options?: string[]): this {
    this.widgetBuilder.setHeader(title, options);
    return this;
  }

  /**
   * Set position
   */
  setPosition(position: { x: number; y: number; cols: number; rows: number }): this {
    this.widgetBuilder.setPosition(position);
    return this;
  }

  /**
   * Set custom options
   */
  setCustomOptions(options: T): this {
    this.chartOptions = { ...this.chartOptions, ...options };
    return this;
  }

  /**
   * Set events
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
   * Build the widget
   */
  build(): IWidget {
    // Add chart type to options
    (this.chartOptions as any).chartType = this.getChartType();
    
    return this.widgetBuilder
      .setEChartsOptions(this.chartOptions as any)
      .build();
  }

  /**
   * Get chart options
   */
  getChartOptions(): Partial<T> {
    return this.chartOptions;
  }

  /**
   * Get widget builder
   */
  getWidgetBuilder(): WidgetBuilder {
    return this.widgetBuilder;
  }

  /**
   * Static method to update data on an existing chart widget
   */
  static updateData(widget: IWidget, data: any): void {
    if (widget.data) {
      widget.data = data;
      // Trigger chart update if chart instance exists
      if (widget.chartInstance && typeof (widget.chartInstance as any).updateData === 'function') {
        (widget.chartInstance as any).updateData(data);
      }
    }
  }

  /**
   * Static method to check if a widget is a specific chart type
   */
  static isChartType(widget: IWidget, chartType: string): boolean {
    return widget.config['component'] === 'd3-chart' && 
           widget.config['options'] && 
           (widget.config['options'] as any).chartType === chartType;
  }

  /**
   * Static method to get chart type from widget
   */
  static getChartType(widget: IWidget): string | null {
    if (widget.config['component'] === 'd3-chart' && widget.config['options']) {
      return (widget.config['options'] as any).chartType || null;
    }
    return null;
  }

  /**
   * Create canvas element for heavy DOM operations
   */
  protected createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    return canvas;
  }

  /**
   * Create SVG element for lightweight operations
   */
  protected createSVG(container: HTMLElement, width: number, height: number): d3.Selection<SVGSVGElement, unknown, null, undefined> {
    return d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');
  }

  /**
   * Clean up chart resources
   */
  protected cleanup(): void {
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }
    if (this.container && this.canvas) {
      this.container.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
  }
}

/**
 * Common interface for D3 chart data
 */
export interface D3ChartData {
  [key: string]: any;
}

/**
 * Common interface for D3 chart options
 */
export interface D3ChartOptions {
  title?: {
    text?: string;
    subtext?: string;
    fontSize?: number;
    color?: string;
  };
  tooltip?: {
    show?: boolean;
    formatter?: (d: any) => string;
  };
  legend?: {
    show?: boolean;
    position?: string;
  };
  colors?: string[];
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  backgroundColor?: string;
  width?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  chartType?: string;
} 