import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder, ConfigurableChartBuilder } from '../apache-echart-builder';
import { PieChartConfiguration, ChartConfiguration } from '../chart-configurations';

export interface PieChartData {
  value: number;
  name: string;
}

export interface PieChartSeriesOptions {
  name?: string;
  type?: string;
  radius?: string | string[];
  center?: string | string[];
  roseType?: string;
  startAngle?: number;
  endAngle?: number;
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

export interface PieChartOptions extends EChartsOption {
  series?: PieChartSeriesOptions[];
}

/**
 * Enhanced Pie Chart Builder with configurable presets
 * 
 * Usage examples:
 * 
 * // Using default configuration
 * const widget = PieChartBuilder.create()
 *   .setData(initialData)
 *   .setHeader('Asset Allocation')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Using a preset configuration
 * const widget = PieChartBuilder.create()
 *   .useConfiguration(PieChartConfiguration.FINANCIAL)
 *   .setData(data)
 *   .setHeader('Portfolio Distribution')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Creating with custom configuration callback
 * const widget = PieChartBuilder.create()
 *   .createWithCustomConfig(builder => 
 *     builder
 *       .setRadius(['40%', '70%'])
 *       .setColors(['#5470c6', '#91cc75', '#fac858'])
 *       .setTitle('Custom Pie Chart')
 *   )
 *   .setData(data)
 *   .build();
 * 
 * // Creating multiple variations
 * const widgets = PieChartBuilder.createVariations(() => PieChartBuilder.create(), [
 *   {
 *     name: 'donut',
 *     preset: PieChartConfiguration.DONUT,
 *     config: builder => builder.setHeader('Donut Chart').setData(data1)
 *   },
 *   {
 *     name: 'rose',
 *     preset: PieChartConfiguration.ROSE,
 *     config: builder => builder.setHeader('Rose Chart').setData(data2)
 *   }
 * ]);
 * 
 * // Using factory pattern
 * const pieChartFactory = PieChartBuilder.create().createFactory();
 * const widget1 = pieChartFactory(data1, builder => builder.useConfiguration(PieChartConfiguration.DONUT));
 * const widget2 = pieChartFactory(data2, builder => builder.useConfiguration(PieChartConfiguration.ROSE));
 */
export class PieChartBuilder extends ConfigurableChartBuilder<PieChartOptions, PieChartSeriesOptions> {
  protected override seriesOptions: PieChartSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new PieChartBuilder instance
   */
  static create(): PieChartBuilder {
    return new PieChartBuilder();
  }

  /**
   * Initialize predefined configuration presets
   */
  protected override initializeDefaultConfigurations(): void {
    // Default configuration
    this.addConfiguration(PieChartConfiguration.DEFAULT, this.getDefaultOptions(), this.getDefaultSeriesOptions());

    // Financial pie chart configuration
    this.addConfiguration(PieChartConfiguration.FINANCIAL, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ${c} ({d}%)',
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: '#777',
        textStyle: { color: '#fff' }
      },
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '10%',
        textStyle: { fontSize: 12 }
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      radius: ['40%', '70%'],
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        formatter: '{b}\n{d}%',
        fontSize: 11,
        color: '#333'
      }
    });

    // Donut chart configuration
    this.addConfiguration(PieChartConfiguration.DONUT, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'middle'
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      radius: ['50%', '80%'],
      center: ['40%', '50%'],
      itemStyle: {
        borderRadius: 10
      },
      label: {
        show: false
      }
    });

    // Rose (Nightingale) chart configuration
    this.addConfiguration(PieChartConfiguration.ROSE, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%'
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      radius: ['20%', '80%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        show: true,
        formatter: '{b}',
        position: 'outside'
      }
    });

    // Nested pie chart configuration
    this.addConfiguration(PieChartConfiguration.NESTED, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: '5%'
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      radius: ['30%', '50%'],
      center: ['50%', '60%'],
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        position: 'inner'
      }
    });

    // Semi-circle chart configuration
    this.addConfiguration(PieChartConfiguration.SEMI_CIRCLE, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '20%'
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      radius: ['40%', '80%'],
      center: ['50%', '70%'],
      startAngle: 180,
      endAngle: 360,
      itemStyle: {
        borderRadius: 5
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      }
    });

    // Minimal configuration
    this.addConfiguration(PieChartConfiguration.MINIMAL, {
      ...this.getDefaultOptions(),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {d}%'
      },
      legend: {
        show: false
      }
    }, {
      ...this.getDefaultSeriesOptions(),
      radius: ['0%', '60%'],
      itemStyle: {
        borderRadius: 2
      },
      label: {
        show: false
      }
    });
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<PieChartOptions> {
    return {
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
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'pie';
  }

  /**
   * Get default series options for pie chart
   */
  private getDefaultSeriesOptions(): PieChartSeriesOptions {
    return {
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
   * Set the data for the pie chart
   */
  override setData(data: any): this {
    this.seriesOptions.data = data as PieChartData[];
    super.setData(data);
    return this;
  }

  /**
   * Set the radius of the pie chart
   */
  setRadius(radius: string | string[]): this {
    this.seriesOptions.radius = radius;
    return this;
  }

  /**
   * Set the center position of the pie chart
   */
  setCenter(center: string | string[]): this {
    this.seriesOptions.center = center;
    return this;
  }

  /**
   * Override build method to merge series options
   */
  override build(): IWidget {
    // Merge series options with chart options
    const finalOptions: PieChartOptions = {
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
  static override updateData(widget: IWidget, data: any): void {
    ApacheEchartBuilder.updateData(widget, data);
  }

  /**
   * Static method to check if a widget is a pie chart
   */
  static isPieChart(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'pie');
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
    
    const finalOptions: PieChartOptions = {
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

  /**
   * Export pie chart data for Excel/CSV export
   * Extracts category names, values, and calculated percentages
   * @param widget - Widget containing pie chart data
   * @returns Array of data rows for export
   */
  static override exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    
    if (!series?.data) {
      console.warn('PieChartBuilder.exportData - No series data found');
      return [];
    }

    return series.data.map((item: any) => [
      item.name || 'Unknown',
      item.value || 0,
      PieChartBuilder.calculatePercentage(item.value, series.data)
    ]);
  }

  /**
   * Get headers for pie chart export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Category', 'Value', 'Percentage'];
  }

  /**
   * Get sheet name for pie chart export
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sheet';
    return title.replace(/[^\w\s]/gi, '').substring(0, 31).trim();
  }

  /**
   * Calculate percentage for pie chart data
   */
  private static calculatePercentage(value: number, data: any[]): string {
    const total = data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(2)}%`;
  }

  // ========== ENHANCED: ASSET ALLOCATION SPECIFIC METHODS ==========

  /**
   * Create a complete asset allocation widget with all management features
   * This replaces the need for separate asset-allocation-widget.ts file
   */
  static createAssetAllocationWidget(
    data: PieChartData[] = [],
    filterService?: any,
    position: { x: number; y: number; cols: number; rows: number } = { x: 0, y: 0, cols: 4, rows: 8 }
  ): IWidget {
    const widget = PieChartBuilder.create()
      .useConfiguration(PieChartConfiguration.FINANCIAL)
      .setData(data)
      .setHeader('Asset Allocation')
      .setPosition(position)
      .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
      .withRuntimeCustomization((chartOptions, seriesOptions) => {
        // Custom runtime adjustments for asset allocation
        seriesOptions.radius = ['40%', '70%'];
        if (chartOptions.tooltip) {
          chartOptions.tooltip.formatter = '{b}: ${c} ({d}%)';
        }
      })
      .build();

    // Configure filtering
    this.configureFiltering(widget, 'assetCategory', this.createAssetAllocationFilter);

    // Setup automatic filtering if filter service is provided
    if (filterService) {
      this.enableAutoFiltering(widget, filterService, (filter) => {
        console.log('Asset allocation filter created:', filter);
      });
    }

    return widget;
  }

  /**
   * Create asset allocation filter from click data
   * Specific implementation for asset allocation charts
   */
  static createAssetAllocationFilter(clickData: any): any | null {
    if (!clickData || !clickData.name) return null;

    return {
      accessor: 'assetCategory',
      filterColumn: 'assetCategory',
      assetCategory: clickData.name,
      value: clickData.name,
      percentage: clickData.value?.toString() || '0'
    };
  }

  /**
   * Update asset allocation data with enhanced filtering and retry logic
   */
  static updateAssetAllocationData(
    widget: IWidget,
    newData: PieChartData[],
    filterService?: any
  ): void {
    this.updateDataWithFilters(widget, newData, filterService, 'assetCategory');
  }

  /**
   * Load asset allocation data asynchronously with retry mechanism
   */
  static async loadAssetAllocationDataAsync(
    widget: IWidget,
    dataLoader: () => Promise<PieChartData[]>,
    filterService?: any
  ): Promise<void> {
    try {
      await this.loadDataAsync(widget, dataLoader, {
        retryCount: 3,
        retryDelay: 1000,
        timeout: 5000
      });
      
      // Apply filters after loading if filter service is provided
      if (filterService) {
        this.applyFiltersToWidget(widget, filterService);
      }
    } catch (error) {
      console.error('Failed to load asset allocation data:', error);
      throw error;
    }
  }

  /**
   * Setup complete asset allocation widget with all features
   * This method consolidates all the functionality from the widget file
   */
  static setupCompleteAssetAllocation(
    container: HTMLElement | null,
    initialData: PieChartData[] = [],
    filterService?: any,
    dataLoader?: () => Promise<PieChartData[]>
  ): {
    widget: IWidget;
    updateData: (newData: PieChartData[]) => void;
    loadDataAsync: () => Promise<void>;
    applyFilters: () => void;
    getInfo: () => any;
  } {
    // Create the widget
    const widget = this.createAssetAllocationWidget(initialData, filterService);

    // Return management interface
    return {
      widget,
      updateData: (newData: PieChartData[]) => {
        this.updateAssetAllocationData(widget, newData, filterService);
      },
      loadDataAsync: async () => {
        if (dataLoader) {
          await this.loadAssetAllocationDataAsync(widget, dataLoader, filterService);
        }
      },
      applyFilters: () => {
        if (filterService) {
          this.applyFiltersToWidget(widget, filterService);
        }
      },
      getInfo: () => this.getWidgetInfo(widget)
    };
  }

  /**
   * Create multiple asset allocation variations
   * Replaces the variations function from widget file
   */
  static createAssetAllocationVariations(
    baseData: PieChartData[] = [],
    filterService?: any
  ): Array<{
    name: string;
    widget: IWidget;
    updateData: (data: PieChartData[]) => void;
  }> {
    const variations = [
      {
        name: 'financial-style',
        preset: PieChartConfiguration.FINANCIAL,
        position: { x: 0, y: 0, cols: 4, rows: 4 },
        title: 'Financial Style'
      },
      {
        name: 'donut-style',
        preset: PieChartConfiguration.DONUT,
        position: { x: 4, y: 0, cols: 4, rows: 4 },
        title: 'Donut Style'
      },
      {
        name: 'minimal-style',
        preset: PieChartConfiguration.MINIMAL,
        position: { x: 8, y: 0, cols: 4, rows: 4 },
        title: 'Minimal Style'
      }
    ];

    return variations.map(({ name, preset, position, title }) => {
      const widget = PieChartBuilder.create()
        .useConfiguration(preset)
        .setData(baseData)
        .setHeader(title)
        .setPosition(position)
        .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
        .build();

      // Configure filtering for each variation
      this.configureFiltering(widget, 'assetCategory', this.createAssetAllocationFilter);
      
      if (filterService) {
        this.enableAutoFiltering(widget, filterService);
      }

      return {
        name,
        widget,
        updateData: (data: PieChartData[]) => {
          this.updateAssetAllocationData(widget, data, filterService);
        }
      };
    });
  }

  /**
   * Enhanced factory for asset allocation charts
   */
  static createAssetAllocationFactory(filterService?: any) {
    return {
      /**
       * Create financial style asset allocation
       */
      createFinancial: (data?: PieChartData[], customPosition?: any) => {
        return this.createAssetAllocationWidget(
          data || [],
          filterService,
          customPosition || { x: 0, y: 0, cols: 4, rows: 8 }
        );
      },

      /**
       * Create donut style asset allocation
       */
      createDonut: (data?: PieChartData[], customPosition?: any) => {
        const widget = PieChartBuilder.create()
          .useConfiguration(PieChartConfiguration.DONUT)
          .setData(data || [])
          .setHeader('Asset Allocation (Donut)')
          .setPosition(customPosition || { x: 4, y: 0, cols: 4, rows: 8 })
          .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
          .build();

        this.configureFiltering(widget, 'assetCategory', this.createAssetAllocationFilter);
        if (filterService) {
          this.enableAutoFiltering(widget, filterService);
        }
        return widget;
      },

      /**
       * Create minimal style asset allocation
       */
      createMinimal: (data?: PieChartData[], customPosition?: any) => {
        const widget = PieChartBuilder.create()
          .useConfiguration(PieChartConfiguration.MINIMAL)
          .setData(data || [])
          .setHeader('Asset Allocation (Clean)')
          .setPosition(customPosition || { x: 8, y: 0, cols: 4, rows: 8 })
          .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
          .build();

        this.configureFiltering(widget, 'assetCategory', this.createAssetAllocationFilter);
        if (filterService) {
          this.enableAutoFiltering(widget, filterService);
        }
        return widget;
      }
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use PieChartBuilder.create() instead
 */
export function createPieChartWidget(data?: PieChartData[]): WidgetBuilder {
  return PieChartBuilder.createPieChartWidget(data);
} 