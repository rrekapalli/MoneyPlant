import { IWidget } from '../../entities/IWidget';
import * as d3 from 'd3';

export interface D3PieChartData {
  value: number;
  name: string;
  color?: string;
}

interface PieArcDatum extends d3.PieArcDatum<D3PieChartData> {
  data: D3PieChartData;
}

export interface D3PieChartOptions {
  chartType: 'd3-pie';
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
  series?: {
    radius?: number;
    innerRadius?: number;
    padAngle?: number;
    cornerRadius?: number;
  };
  tooltip?: {
    show?: boolean;
    formatter?: (d: PieArcDatum) => string;
  };
  legend?: {
    show?: boolean;
    position?: 'left' | 'right' | 'top' | 'bottom';
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  backgroundColor?: string;
}

export interface D3PieChartConfig {
  component: 'd3-chart';
  options: D3PieChartOptions;
  header?: {
    title?: string;
    subtitle?: string;
  };
}

/**
 * D3.js Pie Chart Builder
 * Provides a fluent API for creating and configuring D3.js pie charts
 */
export class D3PieChartBuilder {
  private widget!: IWidget;
  private options: D3PieChartOptions;
  private data: D3PieChartData[] = [];
  private header: { title: string; subtitle?: string } = { title: '' };
  private position: { x: number; y: number; cols: number; rows: number } = { x: 0, y: 0, cols: 4, rows: 4 };

  private constructor() {
    this.options = {
      chartType: 'd3-pie',
      width: 400,
      height: 400,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
      series: {
        radius: 150,
        innerRadius: 0,
        padAngle: 0,
        cornerRadius: 0
      },
      tooltip: {
        show: true,
        formatter: (d: PieArcDatum) => `${d.data.name}: ${d.data.value}`
      },
      legend: {
        show: true,
        position: 'right'
      },
      animation: {
        enabled: true,
        duration: 750
      },
      backgroundColor: '#ffffff'
    };
  }

  /**
   * Create a new D3PieChartBuilder instance
   */
  static create(): D3PieChartBuilder {
    return new D3PieChartBuilder();
  }

  /**
   * Set the chart data
   */
  setData(data: D3PieChartData[]): D3PieChartBuilder {
    this.data = data;
    return this;
  }

  /**
   * Set the chart header
   */
  setHeader(title: string, subtitle?: string): D3PieChartBuilder {
    this.header = { title, subtitle };
    return this;
  }

  /**
   * Set the widget position
   */
  setPosition(position: { x: number; y: number; cols: number; rows: number }): D3PieChartBuilder {
    this.position = position;
    return this;
  }

  /**
   * Set the chart colors
   */
  setColors(colors: string[]): D3PieChartBuilder {
    this.options.colors = colors;
    return this;
  }

  /**
   * Set the chart radius
   */
  setRadius(radius: number): D3PieChartBuilder {
    this.options.series!.radius = radius;
    return this;
  }

  /**
   * Set the inner radius (for donut charts)
   */
  setInnerRadius(innerRadius: number): D3PieChartBuilder {
    this.options.series!.innerRadius = innerRadius;
    return this;
  }

  /**
   * Set the padding angle between slices
   */
  setPadAngle(padAngle: number): D3PieChartBuilder {
    this.options.series!.padAngle = padAngle;
    return this;
  }

  /**
   * Set the corner radius for rounded slices
   */
  setCornerRadius(cornerRadius: number): D3PieChartBuilder {
    this.options.series!.cornerRadius = cornerRadius;
    return this;
  }

  /**
   * Configure tooltip
   */
  setTooltip(show: boolean, formatter?: (d: PieArcDatum) => string): D3PieChartBuilder {
    this.options.tooltip = { show, formatter };
    return this;
  }

  /**
   * Configure legend
   */
  setLegend(show: boolean, position: 'left' | 'right' | 'top' | 'bottom' = 'right'): D3PieChartBuilder {
    this.options.legend = { show, position };
    return this;
  }

  /**
   * Configure animation
   */
  setAnimation(enabled: boolean, duration: number = 750): D3PieChartBuilder {
    this.options.animation = { enabled, duration };
    return this;
  }

  /**
   * Set background color
   */
  setBackgroundColor(color: string): D3PieChartBuilder {
    this.options.backgroundColor = color;
    return this;
  }

  /**
   * Set chart dimensions
   */
  setDimensions(width: number, height: number): D3PieChartBuilder {
    this.options.width = width;
    this.options.height = height;
    return this;
  }

  /**
   * Set chart margins
   */
  setMargins(top: number, right: number, bottom: number, left: number): D3PieChartBuilder {
    this.options.margin = { top, right, bottom, left };
    return this;
  }

  /**
   * Build the widget
   */
  build(): IWidget {
    this.widget = {
      id: this.generateId(),
      x: this.position.x,
      y: this.position.y,
      cols: this.position.cols,
      rows: this.position.rows,
      position: this.position,
      data: this.data,
      config: {
        component: 'd3-chart',
        options: this.options,
        header: {
          title: this.header.title
        }
      }
    };

    return this.widget;
  }

  /**
   * Update widget data
   */
  static updateData(widget: IWidget, newData: D3PieChartData[]): void {
    widget.data = newData;
    
    // Update chart instance if available
    if (widget.chartInstance && (widget.chartInstance as any).updateData) {
      (widget.chartInstance as any).updateData(newData);
    }
  }

  /**
   * Generate unique widget ID
   */
  private generateId(): string {
    return `d3-pie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export chart data to various formats
   */
  static exportData(widget: IWidget, format: 'json' | 'csv' | 'excel' = 'json'): any {
    const data = widget.data as D3PieChartData[];
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'excel':
        return this.convertToExcel(data);
      default:
        return data;
    }
  }

  /**
   * Convert data to CSV format
   */
  private static convertToCSV(data: D3PieChartData[]): string {
    const headers = ['Name', 'Value', 'Color'];
    const rows = data.map(item => [item.name, item.value, item.color || '']);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Convert data to Excel format
   */
  private static convertToExcel(data: D3PieChartData[]): any {
    return {
      sheetName: 'Pie Chart Data',
      headers: ['Name', 'Value', 'Color'],
      data: data.map(item => [item.name, item.value, item.color || ''])
    };
  }

  /**
   * Get chart statistics
   */
  static getStatistics(widget: IWidget): {
    total: number;
    count: number;
    average: number;
    max: number;
    min: number;
  } {
    const data = widget.data as D3PieChartData[];
    const values = data.map(item => item.value);
    
    return {
      total: values.reduce((sum, val) => sum + val, 0),
      count: values.length,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values)
    };
  }

  /**
   * Sort data by value
   */
  static sortByValue(widget: IWidget, ascending: boolean = false): void {
    const data = widget.data as D3PieChartData[];
    const sortedData = [...data].sort((a, b) => {
      return ascending ? a.value - b.value : b.value - a.value;
    });
    
    this.updateData(widget, sortedData);
  }

  /**
   * Sort data by name
   */
  static sortByName(widget: IWidget, ascending: boolean = true): void {
    const data = widget.data as D3PieChartData[];
    const sortedData = [...data].sort((a, b) => {
      return ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    
    this.updateData(widget, sortedData);
  }

  /**
   * Filter data by minimum value
   */
  static filterByMinValue(widget: IWidget, minValue: number): void {
    const data = widget.data as D3PieChartData[];
    const filteredData = data.filter(item => item.value >= minValue);
    
    this.updateData(widget, filteredData);
  }

  /**
   * Get percentage for a data point
   */
  static getPercentage(widget: IWidget, itemName: string): number {
    const data = widget.data as D3PieChartData[];
    const item = data.find(d => d.name === itemName);
    if (!item) return 0;
    
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return total > 0 ? (item.value / total) * 100 : 0;
  }

  /**
   * Create a sample pie chart widget
   */
  static createSample(): IWidget {
    const sampleData: D3PieChartData[] = [
      { value: 30, name: 'Category A', color: '#5470c6' },
      { value: 25, name: 'Category B', color: '#91cc75' },
      { value: 20, name: 'Category C', color: '#fac858' },
      { value: 15, name: 'Category D', color: '#ee6666' },
      { value: 10, name: 'Category E', color: '#73c0de' }
    ];

    return D3PieChartBuilder.create()
      .setData(sampleData)
      .setHeader('Sample Pie Chart')
      .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
      .setRadius(150)
      .setInnerRadius(50)
      .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: ${d.data.value} (${((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)}%)`)
      .setLegend(true, 'right')
      .setAnimation(true, 1000)
      .build();
  }
} 