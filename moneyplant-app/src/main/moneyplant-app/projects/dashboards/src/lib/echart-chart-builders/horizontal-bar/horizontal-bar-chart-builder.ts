import { IWidget } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder, ChartDataTransformOptions, DataFilter, ColorPalette } from '../apache-echart-builder';

export interface HorizontalBarChartData {
  name: string;
  value: number;
}

export interface HorizontalBarChartSeriesOptions {
  name?: string;
  type?: string;
  data?: number[] | HorizontalBarChartData[];
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

export interface HorizontalBarChartOptions extends EChartsOption {
  xAxis?: any;
  yAxis?: any;
  series?: HorizontalBarChartSeriesOptions[];
}

/**
 * Horizontal Bar Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Features:
 * - Horizontal orientation with categories on Y-axis and values on X-axis
 * - Generic data transformation from any[] to horizontal bar chart format
 * - Predefined color palettes and gradients
 * - Built-in formatters for currency, percentage, and numbers
 * - Filter integration and sample data generation
 * - Configuration presets for common use cases
 * - Enhanced update methods with retry mechanisms
 * 
 * Usage examples:
 * 
 * // Basic usage with generic data transformation
 * const widget = HorizontalBarChartBuilder.create()
 *   .setData(genericDataArray)
 *   .transformData({ nameField: 'category', valueField: 'amount' })
 *   .setCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
 *   .setHeader('Monthly Sales')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with presets and formatting
 * const widget = HorizontalBarChartBuilder.create()
 *   .setData(genericDataArray)
 *   .transformData({ nameField: 'category', valueField: 'revenue' })
 *   .setSalesRevenueConfiguration()
 *   .setCurrencyFormatter('USD', 'en-US')
 *   .setPredefinedPalette('finance')
 *   .setFilterColumn('department')
 *   .setHeader('Revenue by Department')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Update with enhanced data transformation
 * HorizontalBarChartBuilder.updateData(widget, newData);
 */
export class HorizontalBarChartBuilder extends ApacheEchartBuilder<HorizontalBarChartOptions, HorizontalBarChartSeriesOptions> {
  protected override seriesOptions: HorizontalBarChartSeriesOptions;
  private categories: string[] = [];
  private filterColumn: string = '';

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new HorizontalBarChartBuilder instance
   */
  static create(): HorizontalBarChartBuilder {
    return new HorizontalBarChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<HorizontalBarChartOptions> {
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
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: [],
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'horizontal-bar';
  }

  /**
   * Get default series options for horizontal bar chart
   */
  private getDefaultSeriesOptions(): HorizontalBarChartSeriesOptions {
    return {
      name: 'Horizontal Bar Chart',
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
   * Transform generic data array to horizontal bar chart format
   */
  transformData(options: ChartDataTransformOptions = {}): this {
    if (!this.data || !Array.isArray(this.data)) {
      return this;
    }

    const {
      nameField = 'name',
      valueField = 'value',
      aggregateBy,
      sortBy,
      sortOrder = 'desc',
      limit
    } = options;

    try {
      let transformedData = this.data.map(item => ({
        name: item[nameField] || 'Unknown',
        value: parseFloat(item[valueField]) || 0
      }));

      // Apply aggregation if specified
      if (aggregateBy) {
        const aggregated = new Map<string, number>();
        transformedData.forEach(item => {
          const key = item.name;
          aggregated.set(key, (aggregated.get(key) || 0) + item.value);
        });
        transformedData = Array.from(aggregated.entries()).map(([name, value]) => ({ name, value }));
      }

      // Apply sorting
      if (sortBy === 'name') {
        transformedData.sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      } else if (sortBy === 'value') {
        transformedData.sort((a, b) => sortOrder === 'asc' ? a.value - b.value : b.value - a.value);
      }

      // Apply limit
      if (limit && limit > 0) {
        transformedData = transformedData.slice(0, limit);
      }

      this.seriesOptions.data = transformedData;
      
      // Auto-generate categories if not provided
      if (this.categories.length === 0) {
        this.categories = transformedData.map(item => item.name);
        this.setCategories(this.categories);
      }

    } catch (error) {
      console.error('Error transforming horizontal bar chart data:', error);
    }

    return this;
  }

  /**
   * Set the data for the horizontal bar chart
   */
  override setData(data: any): this {
    super.setData(data);
    return this;
  }

  /**
   * Set categories for the horizontal bar chart (Y-axis)
   */
  setCategories(categories: string[]): this {
    this.categories = categories;
    if (this.chartOptions.yAxis) {
      this.chartOptions.yAxis.data = categories;
    }
    return this;
  }

  /**
   * Set colors for the horizontal bar chart
   */
  override setColors(colors: string[]): this {
    if (this.seriesOptions.itemStyle) {
      this.seriesOptions.itemStyle.color = colors;
    }
    return this;
  }

  /**
   * Set predefined color palette
   */
  override setPredefinedPalette(palette: ColorPalette): this {
    super.setPredefinedPalette(palette);
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
    if (!this.seriesOptions.itemStyle) {
      this.seriesOptions.itemStyle = {};
    }
    this.seriesOptions.itemStyle.borderRadius = radius;
    return this;
  }

  /**
   * Set X-axis name (value axis for horizontal bars)
   */
  setXAxisName(name: string): this {
    if (!this.chartOptions.xAxis) {
      this.chartOptions.xAxis = {};
    }
    this.chartOptions.xAxis.name = name;
    this.chartOptions.xAxis.nameLocation = 'middle';
    this.chartOptions.xAxis.nameGap = 30;
    return this;
  }

  /**
   * Set Y-axis name (category axis for horizontal bars)
   */
  setYAxisName(name: string): this {
    if (!this.chartOptions.yAxis) {
      this.chartOptions.yAxis = {};
    }
    this.chartOptions.yAxis.name = name;
    this.chartOptions.yAxis.nameLocation = 'middle';
    this.chartOptions.yAxis.nameGap = 50;
    return this;
  }

  /**
   * Set currency formatter
   */
  override setCurrencyFormatter(currency: string = 'USD', locale: string = 'en-US'): this {
    super.setCurrencyFormatter(currency, locale);
    return this;
  }

  /**
   * Set percentage formatter
   */
  override setPercentageFormatter(decimals: number = 1): this {
    super.setPercentageFormatter(decimals);
    return this;
  }

  /**
   * Set custom number formatter
   */
  setCustomNumberFormatter(decimals: number = 0, locale: string = 'en-US'): this {
    super.setNumberFormatter(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return this;
  }

  /**
   * Set filter column for data filtering
   */
  override setFilterColumn(column: string): this {
    this.filterColumn = column;
    return this;
  }

  /**
   * Create filter from chart data
   */
  createFilterFromChartData(): DataFilter | null {
    if (!this.filterColumn || !this.data) {
      return null;
    }

    const uniqueValues = [...new Set(this.data.map(item => item[this.filterColumn]))];
    return {
      column: this.filterColumn,
      operator: 'in' as const,
      value: uniqueValues
    };
  }

  /**
   * Generate sample data for testing
   */
  generateSampleData(count: number = 5): this {
    const sampleData = Array.from({ length: count }, (_, i) => ({
      name: `Category ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 100
    }));
    
    this.setData(sampleData);
    return this;
  }

  /**
   * Set sales revenue configuration preset
   */
  setSalesRevenueConfiguration(): this {
    this.setXAxisName('Revenue')
      .setYAxisName('Products')
      .setCurrencyFormatter('USD', 'en-US')
      .setPredefinedPalette('finance');
    return this;
  }

  /**
   * Set performance configuration preset
   */
  setPerformanceConfiguration(): this {
    this.setXAxisName('Performance Score')
      .setYAxisName('Metrics')
      .setPercentageFormatter(1)
      .setPredefinedPalette('business');
    return this;
  }

  /**
   * Set comparison configuration preset
   */
  setComparisonConfiguration(): this {
    this.setXAxisName('Value')
      .setYAxisName('Categories')
      .setCustomNumberFormatter(0, 'en-US')
      .setPredefinedPalette('modern');
    return this;
  }

  /**
   * Build the widget with all configurations
   */
  override build(): IWidget {
    // Ensure series is properly set
    if (!this.chartOptions.series) {
      this.chartOptions.series = [];
    }
    this.chartOptions.series = [this.seriesOptions];

    return super.build();
  }

  /**
   * Update widget data with enhanced transformation and retry mechanism
   */
  static override updateData(widget: IWidget, data: any[]): void {
    if (!widget || !widget['chartOptions']) {
      return;
    }

    const updateWithRetry = (attempt: number = 1) => {
      try {
        const transformedData = data.map(item => ({
          name: item.name || item.category || 'Unknown',
          value: parseFloat(item.value || item.amount || item.count) || 0
        }));

        if (widget['chartOptions'].series && widget['chartOptions'].series[0]) {
          widget['chartOptions'].series[0].data = transformedData;
        }

        if (widget['chartOptions'].yAxis) {
          widget['chartOptions'].yAxis.data = transformedData.map(item => item.name);
        }

        // Trigger chart update if chart instance exists
        if (widget.chartInstance && typeof widget.chartInstance.setOption === 'function') {
          widget.chartInstance.setOption(widget['chartOptions'], true);
        }

      } catch (error) {
        console.error(`Error updating horizontal bar chart data (attempt ${attempt}):`, error);
        if (attempt < 3) {
          setTimeout(() => updateWithRetry(attempt + 1), 100 * attempt);
        }
      }
    };

    updateWithRetry();
  }

  /**
   * Check if widget is a horizontal bar chart
   */
  static isHorizontalBarChart(widget: IWidget): boolean {
    return widget?.['type'] === 'horizontal-bar' || widget?.['chartType'] === 'horizontal-bar';
  }

  /**
   * Export chart data to various formats
   */
  static override exportData(widget: IWidget): any[] {
    if (!widget?.['chartOptions']?.series?.[0]?.data) {
      return [];
    }

    const data = widget['chartOptions'].series[0].data;
    if (Array.isArray(data)) {
      return data.map((item: any) => {
        if (typeof item === 'object' && item.name && item.value !== undefined) {
          return {
            Category: item.name,
            Value: item.value
          };
        }
        return { Value: item };
      });
    }

    return [];
  }

  /**
   * Get export headers for the chart data
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Category', 'Value'];
  }

  /**
   * Get export sheet name
   */
  static override getExportSheetName(widget: IWidget): string {
    return widget?.['header'] || 'Horizontal Bar Chart Data';
  }
}