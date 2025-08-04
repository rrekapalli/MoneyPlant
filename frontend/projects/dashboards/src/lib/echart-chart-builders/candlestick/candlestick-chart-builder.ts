import { IWidget } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder, ChartDataTransformOptions, DataFilter, ColorPalette } from '../apache-echart-builder';

export interface CandlestickChartData {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
  volume?: number;
  [key: string]: any;
}

export interface CandlestickSeriesOptions {
  name?: string;
  type?: string;
  data?: number[][];
  itemStyle?: {
    color?: string;
    color0?: string;
    borderColor?: string;
    borderColor0?: string;
    borderWidth?: number;
  };
}

export interface CandlestickChartOptions extends EChartsOption {
  xAxis?: {
    type?: string;
    data?: string[];
    name?: string;
  };
  yAxis?: {
    type?: string;
    name?: string;
    scale?: boolean;
  };
  series?: CandlestickSeriesOptions[];
}

/**
 * Enhanced Candlestick Chart Builder
 * 
 * Features:
 * - Generic data transformation from any[] to candlestick format
 * - Advanced formatting (currency, percentage, number)
 * - Predefined color palettes
 * - Filter integration
 * - Sample data generation
 * - Configuration presets for financial analysis
 * - Enhanced update methods with retry mechanism
 */
export class CandlestickChartBuilder extends ApacheEchartBuilder<CandlestickChartOptions, CandlestickSeriesOptions> {
  protected override seriesOptions: CandlestickSeriesOptions;
  private xAxisData: string[] = [];
  private filterColumn: string = '';

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new CandlestickChartBuilder instance
   */
  static create(): CandlestickChartBuilder {
    return new CandlestickChartBuilder();
  }

  /**
   * Get default chart options
   */
  protected override getDefaultOptions(): Partial<CandlestickChartOptions> {
    return {
      grid: {
        containLabel: true,
        top: '15%',
        left: '10%',
        right: '10%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          const data = param.data;
          return `${param.name}<br/>
                  Open: ${data[1]}<br/>
                  Close: ${data[2]}<br/>
                  Low: ${data[3]}<br/>
                  High: ${data[4]}`;
        }
      },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: {
        type: 'value',
        scale: true,
      },
    };
  }

  /**
   * Get chart type
   */
  protected override getChartType(): string {
    return 'candlestick';
  }

  /**
   * Get default series options
   */
  private getDefaultSeriesOptions(): CandlestickSeriesOptions {
    return {
      name: 'Candlestick',
      type: 'candlestick',
      data: [],
      itemStyle: {
        color: '#ec0000',        // up/bull color
        color0: '#00da3c',       // down/bear color
        borderColor: '#8A0000',  // up border color
        borderColor0: '#008F28', // down border color
        borderWidth: 1,
      },
    };
  }

  /**
   * Transform generic data to candlestick format
   */
  transformData(options: { 
    dateField?: string; 
    openField?: string; 
    closeField?: string; 
    lowField?: string; 
    highField?: string; 
  } & ChartDataTransformOptions = {}): this {
    if (!this.data || !Array.isArray(this.data)) {
      return this;
    }

    const {
      dateField = 'date',
      openField = 'open',
      closeField = 'close',
      lowField = 'low',
      highField = 'high',
      sortBy,
      sortOrder = 'asc',
      limit
    } = options;

    try {
      let transformedData: number[][] = [];
      let xAxisLabels: string[] = [];

      // Apply filters first
      let filteredData = this.data;
      if ((options as any).filters && (options as any).filters.length > 0) {
        filteredData = ApacheEchartBuilder.applyFilters(this.data, (options as any).filters);
      }

      // Transform data to candlestick format [open, close, low, high]
      filteredData.forEach(item => {
        const date = item[dateField];
        const open = parseFloat(item[openField]) || 0;
        const close = parseFloat(item[closeField]) || 0;
        const low = parseFloat(item[lowField]) || 0;
        const high = parseFloat(item[highField]) || 0;

        xAxisLabels.push(date);
        transformedData.push([open, close, low, high]);
      });

      // Apply sorting
      if (sortBy === 'date') {
        const combined = xAxisLabels.map((label, index) => ({ label, data: transformedData[index] }));
        combined.sort((a, b) => {
          const dateA = new Date(a.label).getTime();
          const dateB = new Date(b.label).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        xAxisLabels = combined.map(item => item.label);
        transformedData = combined.map(item => item.data);
      }

      // Apply limit
      if (limit && limit > 0) {
        xAxisLabels = xAxisLabels.slice(0, limit);
        transformedData = transformedData.slice(0, limit);
      }

      this.seriesOptions.data = transformedData;
      this.setXAxisData(xAxisLabels);

    } catch (error) {
      console.error('Error transforming candlestick chart data:', error);
    }

    return this;
  }

  /**
   * Set the data for the candlestick chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data;
    super.setData(data);
    return this;
  }

  /**
   * Set X-axis data (categories/dates)
   */
  setXAxisData(data: string[]): this {
    this.xAxisData = data;
    (this.chartOptions as any).xAxis = {
      ...(this.chartOptions as any).xAxis,
      data: data,
    };
    return this;
  }

  /**
   * Set X-axis name
   */
  setXAxisName(name: string): this {
    (this.chartOptions as any).xAxis = {
      ...(this.chartOptions as any).xAxis,
      name,
    };
    return this;
  }

  /**
   * Set Y-axis name
   */
  setYAxisName(name: string): this {
    (this.chartOptions as any).yAxis = {
      ...(this.chartOptions as any).yAxis,
      name,
    };
    return this;
  }

  /**
   * Set predefined color palette
   */
  override setPredefinedPalette(palette: ColorPalette): this {
    const colors = this.getPaletteColors(palette);
    if (colors.length >= 2) {
      this.seriesOptions.itemStyle = {
        ...this.seriesOptions.itemStyle,
        color: colors[0],   // up/bull color
        color0: colors[1],  // down/bear color
        borderColor: colors[0],
        borderColor0: colors[1],
      };
    }
    return this;
  }

  /**
   * Set currency formatter for values
   */
  override setCurrencyFormatter(currency: string = 'USD', locale: string = 'en-US'): this {
    const formatter = this.createCurrencyFormatter(currency, locale);
    this.setTooltip('axis', (params: any) => {
      const param = Array.isArray(params) ? params[0] : params;
      const data = param.data;
      return `${param.name}<br/>
              Open: ${formatter(data[1])}<br/>
              Close: ${formatter(data[2])}<br/>
              Low: ${formatter(data[3])}<br/>
              High: ${formatter(data[4])}`;
    });
    return this;
  }

  /**
   * Set percentage formatter for values
   */
  override setPercentageFormatter(decimals: number = 2): this {
    const formatter = this.createPercentageFormatter(decimals);
    this.setTooltip('axis', (params: any) => {
      const param = Array.isArray(params) ? params[0] : params;
      const data = param.data;
      return `${param.name}<br/>
              Open: ${formatter(data[1])}<br/>
              Close: ${formatter(data[2])}<br/>
              Low: ${formatter(data[3])}<br/>
              High: ${formatter(data[4])}`;
    });
    return this;
  }

  /**
   * Set number formatter for values with custom options
   */
  setCustomNumberFormatter(decimals: number = 2, locale: string = 'en-US'): this {
    const formatter = this.createNumberFormatter(decimals, locale);
    this.setTooltip('axis', (params: any) => {
      const param = Array.isArray(params) ? params[0] : params;
      const data = param.data;
      return `${param.name}<br/>
              Open: ${formatter(data[1])}<br/>
              Close: ${formatter(data[2])}<br/>
              Low: ${formatter(data[3])}<br/>
              High: ${formatter(data[4])}`;
    });
    return this;
  }

  /**
   * Set border colors for candlestick chart
   */
  setBorderColors(upBorderColor: string, downBorderColor: string): this {
    if (!this.seriesOptions.itemStyle) {
      this.seriesOptions.itemStyle = {};
    }
    this.seriesOptions.itemStyle.borderColor = upBorderColor;
    this.seriesOptions.itemStyle.borderColor0 = downBorderColor;
    return this;
  }

  /**
   * Set filter column for filtering integration
   */
  override setFilterColumn(column: string): this {
    this.filterColumn = column;
    return this;
  }

  /**
   * Create filter from chart data
   */
  createFilterFromChartData(): DataFilter[] {
    if (!this.filterColumn || !this.data) return [];

    const uniqueValues = [...new Set(this.data.map(item => item[this.filterColumn]))];
    return [{
      column: this.filterColumn,
      operator: 'in',
      value: uniqueValues
    }];
  }

  /**
   * Generate sample data for testing
   */
  generateSampleData(count: number = 30): this {
    const sampleData = [];
    let price = 100;
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (count - i));
      
      const open = price;
      const change = (Math.random() - 0.5) * 10;
      const close = Math.max(0.1, open + change);
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      sampleData.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
        symbol: 'SAMPLE'
      });
      
      price = close;
    }

    return this.setData(sampleData);
  }

  /**
   * Configuration preset for stock price analysis
   */
  setStockAnalysisConfiguration(): this {
    return this
      .setPredefinedPalette('finance')
      .setXAxisName('Date')
      .setYAxisName('Price')
      .setCurrencyFormatter('USD', 'en-US')
      .setTooltip('axis');
  }

  /**
   * Configuration preset for cryptocurrency analysis
   */
  setCryptoAnalysisConfiguration(): this {
    return this
      .setPredefinedPalette('modern')
      .setXAxisName('Date')
      .setYAxisName('Price (USD)')
      .setCurrencyFormatter('USD', 'en-US');
  }

  /**
   * Configuration preset for forex analysis
   */
  setForexAnalysisConfiguration(): this {
    return this
      .setPredefinedPalette('business')
      .setXAxisName('Date')
      .setYAxisName('Exchange Rate')
      .setCustomNumberFormatter(4, 'en-US');
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    const finalOptions: CandlestickChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'candlestick',
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Enhanced updateData with retry mechanism
   */
  static override updateData(widget: IWidget, data: any): void {
    const maxRetries = 3;
    let retryCount = 0;

    const updateWithRetry = () => {
      try {
        if (widget.chartInstance) {
          // Transform data if needed
          let transformedData = data;
          if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
            transformedData = data.map(item => [
              parseFloat(item.open) || 0,
              parseFloat(item.close) || 0,
              parseFloat(item.low) || 0,
              parseFloat(item.high) || 0
            ]);
          }

          const currentOptions = widget.chartInstance.getOption();
          const newOptions = {
            ...currentOptions,
            series: [{
              ...(currentOptions as any)['series'][0],
              data: transformedData
            }]
          };

          widget.chartInstance.setOption(newOptions, true);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(updateWithRetry, 100 * retryCount);
        }
      } catch (error) {
        console.error('Error updating candlestick chart data:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(updateWithRetry, 100 * retryCount);
        }
      }
    };

    updateWithRetry();
  }

  /**
   * Static method to check if a widget is a candlestick chart
   */
  static isCandlestickChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'candlestick');
  }

  /**
   * Export candlestick chart data for Excel/CSV export
   */
  static override exportData(widget: IWidget): any[] {
    const exportData: any[] = [];
    
    if (widget['echart_options']?.series?.[0]?.data && widget['echart_options']?.xAxis?.data) {
      const seriesData = widget['echart_options'].series[0].data;
      const xAxisData = widget['echart_options'].xAxis.data;
      
      seriesData.forEach((data: number[], index: number) => {
        exportData.push({
          Date: xAxisData[index] || `Day ${index + 1}`,
          Open: data[0] || 0,
          Close: data[1] || 0,
          Low: data[2] || 0,
          High: data[3] || 0
        });
      });
    }
    
    return exportData;
  }

  /**
   * Get export headers for Excel/CSV export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Date', 'Open', 'Close', 'Low', 'High'];
  }

  /**
   * Get export sheet name for Excel export
   */
  static override getExportSheetName(widget: IWidget): string {
    return 'Candlestick Chart Data';
  }
} 