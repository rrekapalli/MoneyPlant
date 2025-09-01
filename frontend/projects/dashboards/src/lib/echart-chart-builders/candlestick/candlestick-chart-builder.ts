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
    barWidth?: string; // Added for bar width
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
  // Add time range filter options
  timeRangeFilters?: {
    selectedRange: string;
    ranges: string[];
  };
}

// Time range filter options
export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | 'MAX';

// Custom event interface for time range filter changes
export interface TimeRangeFilterEvent {
  type: 'timeRangeChange';
  range: TimeRange;
  widgetId: string;
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
 * - Time range filters (1D, 5D, 1M, 3M, 6M, YTD, 1Y, 3Y, 5Y, MAX)
 * - Area series overlay with close price data
 * - Custom event system for time range filter changes
 */
export class CandlestickChartBuilder extends ApacheEchartBuilder<CandlestickChartOptions, CandlestickSeriesOptions> {
  protected override seriesOptions: CandlestickSeriesOptions;
  private xAxisData: string[] = [];
  private filterColumn: string = '';
  private timeRangeFilters: TimeRange[] = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'MAX'];
  private selectedTimeRange: TimeRange = '1Y';
  private showAreaSeries: boolean = true;
  private areaSeriesOpacity: number = 0.3;
  private timeRangeChangeCallback?: (event: TimeRangeFilterEvent) => void;

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
        top: '20%',    // Increased from 10% to 15% to make room for time range filters
        left: '5%',    // Reduced from 10% to 5%
        right: '5%',   // Reduced from 10% to 5%
        bottom: '5%', // Reduced from 15% to 10% to give more space to chart
        height: '60%'
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
   * Enable data zoom functionality for the candlestick chart
   * @param startPercent Start percentage (0-100) for initial zoom view
   * @param endPercent End percentage (0-100) for initial zoom view
   */
  enableDataZoom(startPercent: number = 70, endPercent: number = 100): this {
    (this.chartOptions as any).dataZoom = [
      {
        type: 'inside',
        start: startPercent,
        end: endPercent,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      },
      {
        type: 'slider',
        start: startPercent,
        end: endPercent,
        bottom: '2%',   // Reduced from 1% to 0% to give more space to chart
        height: '8%',   // Reduced from 8% to 6% to give more space to chart
        borderColor: '#ccc',
        fillerColor: 'rgba(167,183,204,0.4)',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0,0,0,0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ];
    return this;
  }

  /**
   * Set the width of candlestick bars
   * @param width Bar width as percentage (e.g., '60%') or pixel value
   */
  setBarWidth(width: string): this {
    if (this.seriesOptions.itemStyle) {
      this.seriesOptions.itemStyle.barWidth = width;
    } else {
      this.seriesOptions.itemStyle = { barWidth: width };
    }
    return this;
  }

  /**
   * Enable time range filters above the chart
   * @param ranges Array of time ranges to show (default: all standard ranges)
   * @param defaultRange Default selected range (default: '1Y')
   */
  enableTimeRangeFilters(ranges: TimeRange[] = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'MAX'], defaultRange: TimeRange = '1Y'): this {
    this.timeRangeFilters = ranges;
    this.selectedTimeRange = defaultRange;
    
    // Add time range filter configuration to chart options
    (this.chartOptions as any).timeRangeFilters = {
      selectedRange: this.selectedTimeRange,
      ranges: this.timeRangeFilters
    };
    
    return this;
  }

  /**
   * Set the selected time range
   * @param range The time range to select
   */
  setSelectedTimeRange(range: TimeRange): this {
    this.selectedTimeRange = range;
    if ((this.chartOptions as any).timeRangeFilters) {
      (this.chartOptions as any).timeRangeFilters.selectedRange = range;
    }
    return this;
  }

  /**
   * Set callback for time range filter changes
   * @param callback Function to handle time range filter changes
   */
  setTimeRangeChangeCallback(callback: (event: TimeRangeFilterEvent) => void): this {
    this.timeRangeChangeCallback = callback;
    return this;
  }

  /**
   * Enable area series overlay with close price data
   * @param enabled Whether to show the area series (default: true)
   * @param opacity Opacity of the area series (default: 0.3)
   */
  enableAreaSeries(enabled: boolean = true, opacity: number = 0.3): this {
    this.showAreaSeries = enabled;
    this.areaSeriesOpacity = opacity;
    return this;
  }

  /**
   * Set area series opacity
   * @param opacity Opacity value between 0 and 1
   */
  setAreaSeriesOpacity(opacity: number): this {
    this.areaSeriesOpacity = Math.max(0, Math.min(1, opacity));
    return this;
  }

  /**
   * Enable brush selection for technical analysis
   */
  enableBrush(): this {
    (this.chartOptions as any).brush = {
      xAxisIndex: 0,
      brushLink: 'all',
      outOfBrush: {
        colorAlpha: 0.1
      },
      brushStyle: {
        borderWidth: 1,
        color: 'rgba(120,140,180,0.3)',
        borderColor: 'rgba(120,140,180,0.8)'
      }
    };
    return this;
  }

  /**
   * Enable large data mode for better performance with many data points
   * @param threshold Minimum number of data points to enable large mode
   */
  setLargeMode(threshold: number = 600): this {
    if (this.data && this.data.length >= threshold) {
      (this.chartOptions as any).useUTC = true;
      (this.chartOptions as any).animation = false;
      (this.chartOptions as any).progressive = 500;
      (this.chartOptions as any).progressiveThreshold = 3000;
    }
    return this;
  }

  /**
   * Set tooltip type for better user experience
   * @param type Tooltip type: 'item' for data point, 'axis' for crosshair
   */
  setTooltipType(type: 'item' | 'axis' = 'axis'): this {
    (this.chartOptions as any).tooltip = {
      ...(this.chartOptions as any).tooltip,
      trigger: type
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
    const series: any[] = [{
      ...this.seriesOptions,
      type: 'candlestick',
    }];

    // Add area series if enabled
    if (this.showAreaSeries && this.seriesOptions.data && this.seriesOptions.data.length > 0) {
      // Extract close prices for area series
      const closePrices = this.seriesOptions.data.map(candle => candle[2]); // Close is at index 2
      
      series.push({
        name: 'Close Price Area',
        type: 'line',
        data: closePrices,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 0
        },
        areaStyle: {
          color: this.getAreaSeriesColor(),
          opacity: this.areaSeriesOpacity
        },
        z: 1 // Ensure area is behind candlesticks
      });
    }

    // If time range filters are enabled, add them as graphic elements to the chart
    if (this.timeRangeFilters.length > 0) {
      // Create a global function for time range changes if it doesn't exist
      if (typeof window !== 'undefined' && !(window as any).handleTimeRangeFilterClick) {
        (window as any).handleTimeRangeFilterClick = (range: string) => {
          console.log('Global time range filter clicked:', range);
          if (this.timeRangeChangeCallback) {
            const event: TimeRangeFilterEvent = {
              type: 'timeRangeChange',
              range: range as TimeRange,
              widgetId: 'candlestick-chart'
            };
            this.timeRangeChangeCallback(event);
          }
        };
      }

      // Add time range filters as graphic elements positioned in top left corner
      const timeRangeButtons = this.timeRangeFilters.map((range, index) => ({
        type: 'rect',
        left: 10 + (index * 45),
        top: 5,  // Moved up slightly to ensure visibility
        width: 40,
        height: 25,  // Reduced height slightly
        style: {
          fill: range === this.selectedTimeRange ? '#007bff' : '#f8f9fa',
          stroke: range === this.selectedTimeRange ? '#007bff' : '#dee2e6',
          lineWidth: 1,
          borderRadius: 4
        },
        // Store the range as a custom property for event handling
        range: range,
        // Add cursor style for better UX
        cursor: 'pointer',
        // Add event handling properties
        onclick: (params: any) => {
          console.log('Button clicked directly:', range);
          if (this.timeRangeChangeCallback) {
            const event: TimeRangeFilterEvent = {
              type: 'timeRangeChange',
              range: range as TimeRange,
              widgetId: 'candlestick-chart'
            };
            this.timeRangeChangeCallback(event);
          }
          // Also call the global function as fallback
          if (typeof window !== 'undefined' && (window as any).handleTimeRangeFilterClick) {
            (window as any).handleTimeRangeFilterClick(range);
          }
        }
      }));

      // Add text labels for the buttons
      const timeRangeTexts = this.timeRangeFilters.map((range, index) => ({
        type: 'text',
        left: 10 + (index * 45) + 20, // Center text in button
        top: 5 + 12, // Center text vertically in the smaller button
        style: {
          text: range,
          fill: range === this.selectedTimeRange ? '#ffffff' : '#495057',
          fontSize: 10,  // Slightly smaller font
          fontWeight: 'bold',
          textAlign: 'center',
          textVerticalAlign: 'middle'
        },
        // Store the range as a custom property for event handling
        range: range,
        // Add cursor style for better UX
        cursor: 'pointer',
        // Add event handling properties
        onclick: (params: any) => {
          console.log('Text clicked directly:', range);
          if (this.timeRangeChangeCallback) {
            const event: TimeRangeFilterEvent = {
              type: 'timeRangeChange',
              range: range as TimeRange,
              widgetId: 'candlestick-chart'
            };
            this.timeRangeChangeCallback(event);
          }
          // Also call the global function as fallback
          if (typeof window !== 'undefined' && (window as any).handleTimeRangeFilterClick) {
            (window as any).handleTimeRangeFilterClick(range);
          }
        }
      }));

      // Add graphics to chart options
      (this.chartOptions as any).graphic = [...timeRangeButtons, ...timeRangeTexts];
    }

    const finalOptions: CandlestickChartOptions = {
      ...this.chartOptions,
      series: series,
    };

    // Create the base widget
    const baseWidget = this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();

    // Add time range filters data to the widget for external access
    if (this.timeRangeFilters.length > 0) {
      (baseWidget as any).timeRangeFilters = {
        ranges: this.timeRangeFilters,
        selectedRange: this.selectedTimeRange
      };
    }

    return baseWidget;
  }



  /**
   * Static method to update time range filters in an existing candlestick chart widget
   */
  static updateTimeRangeFilters(widget: IWidget, selectedRange: TimeRange, callback?: (event: TimeRangeFilterEvent) => void): void {
    if (!widget.chartInstance) {
      return;
    }

    try {
      const currentOptions = widget.chartInstance.getOption();
      const timeRangeFilters = (widget as any).timeRangeFilters;
      
      if (!timeRangeFilters || !timeRangeFilters.ranges) {
        return;
      }

      // Update the selected range
      (widget as any).timeRangeFilters.selectedRange = selectedRange;

      // Update graphic elements to reflect the new selected range
      const timeRangeButtons = timeRangeFilters.ranges.map((range: TimeRange, index: number) => ({
        type: 'rect',
        left: 10 + (index * 45),
        top: 5,  // Moved up slightly to ensure visibility
        width: 40,
        height: 25,  // Reduced height slightly
        style: {
          fill: range === selectedRange ? '#007bff' : '#f8f9fa',
          stroke: range === selectedRange ? '#007bff' : '#dee2e6',
          lineWidth: 1,
          borderRadius: 4
        },
        // Store the range as a custom property for event handling
        range: range,
        // Add cursor style for better UX
        cursor: 'pointer',
        // Add event handling properties
        onclick: (params: any) => {
          console.log('Button clicked directly:', range);
          if (callback) {
            const event: TimeRangeFilterEvent = {
              type: 'timeRangeChange',
              range: range as TimeRange,
              widgetId: 'candlestick-chart'
            };
            callback(event);
          }
        }
      }));

      const timeRangeTexts = timeRangeFilters.ranges.map((range: TimeRange, index: number) => ({
        type: 'text',
        left: 10 + (index * 45) + 20, // Center text in button
        top: 5 + 12, // Center text vertically in the smaller button
        style: {
          text: range,
          fill: range === selectedRange ? '#ffffff' : '#495057',
          fontSize: 10,  // Slightly smaller font
          fontWeight: 'bold',
          textAlign: 'center',
          textVerticalAlign: 'middle'
        },
        // Store the range as a custom property for event handling
        range: range,
        // Add cursor style for better UX
        cursor: 'pointer',
        // Add event handling properties
        onclick: (params: any) => {
          console.log('Text clicked directly:', range);
          if (callback) {
            const event: TimeRangeFilterEvent = {
              type: 'timeRangeChange',
              range: range as TimeRange,
              widgetId: 'candlestick-chart'
            };
            callback(event);
          }
        }
      }));

      const newOptions = {
        ...currentOptions,
        graphic: [...timeRangeButtons, ...timeRangeTexts]
      };

      widget.chartInstance.setOption(newOptions, true);
    } catch (error) {
      console.error('Error updating time range filters:', error);
    }
  }

  /**
   * Get the current time range filters configuration
   */
  getTimeRangeFiltersConfig(): { selectedRange: TimeRange; ranges: TimeRange[] } {
    return {
      selectedRange: this.selectedTimeRange,
      ranges: this.timeRangeFilters
    };
  }

  /**
   * Get area series color based on current palette
   */
  private getAreaSeriesColor(): string {
    // Use a light version of the current color palette
    if (this.seriesOptions.itemStyle?.color) {
      return this.seriesOptions.itemStyle.color;
    }
    // Default light blue for area series
    return '#91cc75';
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

  /**
   * Set chart events
   */
  override setEvents(callback: (widget: IWidget, chart: any) => void): this {
    this.widgetBuilder.setEvents((widget: IWidget, chart: any) => {
      if (chart) {
        // Handle time range filter clicks
        chart.off('click');
        chart.on('click', (params: any) => {
          console.log('Chart click event:', params);
          console.log('Component type:', params.componentType);
          console.log('Data:', params.data);
          
          // Check if the click is on a time range filter graphic element
          if (params.componentType === 'graphic' && params.data && params.data.range) {
            const clickedRange = params.data.range;
            console.log('Time range filter clicked:', clickedRange);
            console.log('Callback available:', !!this.timeRangeChangeCallback);
            
            // Use the callback if available
            if (this.timeRangeChangeCallback) {
              const event: TimeRangeFilterEvent = {
                type: 'timeRangeChange',
                range: clickedRange as TimeRange,
                widgetId: widget.id || 'candlestick-chart'
              };
              console.log('Calling time range change callback with event:', event);
              this.timeRangeChangeCallback(event);
            } else {
              console.warn('Time range change callback not set');
            }
            
            // Prevent event propagation
            params.event?.stop?.();
            return false;
          }
          
          // Also check for clicks on text elements (labels)
          if (params.componentType === 'graphic' && params.data && params.data.range && params.data.type === 'text') {
            const clickedRange = params.data.range;
            console.log('Time range filter text clicked:', clickedRange);
            console.log('Callback available:', !!this.timeRangeChangeCallback);
            
            // Use the callback if available
            if (this.timeRangeChangeCallback) {
              const event: TimeRangeFilterEvent = {
                type: 'timeRangeChange',
                range: clickedRange as TimeRange,
                widgetId: widget.id || 'candlestick-chart'
              };
              console.log('Calling time range change callback with event:', event);
              this.timeRangeChangeCallback(event);
            } else {
              console.warn('Time range change callback not set');
            }
            
            // Prevent event propagation
            params.event?.stop?.();
            return false;
          }
          
          // Handle other chart clicks (existing functionality)
          if (callback) {
            callback(widget, chart);
          }
          
          return true; // Allow default behavior for non-filter clicks
        });
        
        // Also add mousedown event for better click detection
        chart.off('mousedown');
        chart.on('mousedown', (params: any) => {
          console.log('Chart mousedown event:', params);
          
          // Check if the mousedown is on a time range filter graphic element
          if (params.componentType === 'graphic' && params.data && params.data.range) {
            const clickedRange = params.data.range;
            console.log('Time range filter mousedown:', clickedRange);
            
            // Use the callback if available
            if (this.timeRangeChangeCallback) {
              const event: TimeRangeFilterEvent = {
                type: 'timeRangeChange',
                range: clickedRange as TimeRange,
                widgetId: widget.id || 'candlestick-chart'
              };
              this.timeRangeChangeCallback(event);
            } else {
              console.warn('Time range change callback not set');
            }
            
            // Prevent event propagation
            params.event?.stop?.();
            return false;
          }
          
          return true; // Allow default behavior for non-filter clicks
        });

        // Add mouseup event for additional click detection
        chart.off('mouseup');
        chart.on('mouseup', (params: any) => {
          console.log('Chart mouseup event:', params);
          
          // Check if the mouseup is on a time range filter graphic element
          if (params.componentType === 'graphic' && params.data && params.data.range) {
            const clickedRange = params.data.range;
            console.log('Time range filter mouseup:', clickedRange);
            
            // Use the callback if available
            if (this.timeRangeChangeCallback) {
              const event: TimeRangeFilterEvent = {
                type: 'timeRangeChange',
                range: clickedRange as TimeRange,
                widgetId: widget.id || 'candlestick-chart'
              };
              this.timeRangeChangeCallback(event);
            } else {
              console.warn('Time range change callback not set');
            }
            
            // Prevent event propagation
            params.event?.stop?.();
            return false;
          }
          
          return true; // Allow default behavior for non-filter clicks
        });
      }
    });
    return this;
  }
} 