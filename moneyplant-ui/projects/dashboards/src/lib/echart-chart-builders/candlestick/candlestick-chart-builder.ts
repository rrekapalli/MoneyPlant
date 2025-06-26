import { IWidget } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

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
 * Minimal Candlestick Chart Builder
 * 
 * Simple implementation that avoids problematic ECharts configurations
 */
export class CandlestickChartBuilder extends ApacheEchartBuilder<CandlestickChartOptions, CandlestickSeriesOptions> {
  protected override seriesOptions: CandlestickSeriesOptions;
  private xAxisData: string[] = [];

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
        trigger: 'axis'
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
   * Set the data for the candlestick chart
   * Data format: [[open, close, low, high], ...]
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
   * Set colors for up and down candles
   */
  override setColors(colors: string[]): this {
    if (colors.length >= 2) {
      this.seriesOptions.itemStyle = {
        ...this.seriesOptions.itemStyle,
        color: colors[0],   // up/bull color
        color0: colors[1],  // down/bear color
      };
    }
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
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
   * Static method to update data on an existing candlestick chart widget
   */
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
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
      
      seriesData.forEach((item: any, index: number) => {
        const ohlc = Array.isArray(item) ? item : item.value;
        exportData.push({
          Date: xAxisData[index] || `Day ${index + 1}`,
          Open: ohlc[0],
          High: ohlc[3],
          Low: ohlc[2],
          Close: ohlc[1]
        });
      });
    }
    
    return exportData;
  }

  /**
   * Get export headers for candlestick data
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Date', 'Open', 'High', 'Low', 'Close'];
  }

  /**
   * Get export sheet name for candlestick data
   */
  static override getExportSheetName(widget: IWidget): string {
    return widget['header']?.title || 'Candlestick Chart';
  }
} 