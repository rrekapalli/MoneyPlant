import { IWidget, WidgetBuilder } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';
import * as echarts from 'echarts/core';

export interface DensityMapData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface DensityMapSeriesOptions {
  name?: string;
  type?: string;
  map?: string;
  roam?: boolean;
  zoom?: number;
  center?: [number, number];
  data?: DensityMapData[];
  label?: {
    show?: boolean;
    position?: string;
    formatter?: string | Function;
    fontSize?: number;
    color?: string;
  };
  itemStyle?: {
    areaColor?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowBlur?: number;
    shadowColor?: string;
  };
  emphasis?: {
    itemStyle?: {
      areaColor?: string;
      shadowBlur?: number;
      shadowColor?: string;
    };
  };
  select?: {
    itemStyle?: {
      areaColor?: string;
    };
  };
  visualMap?: {
    min?: number;
    max?: number;
    left?: string;
    top?: string;
    text?: [string, string];
    calculable?: boolean;
    inRange?: {
      color?: string[];
    };
  };
}

export interface DensityMapOptions extends EChartsOption {
  visualMap?: {
    type?: string;
    min?: number;
    max?: number;
    left?: string;
    top?: string;
    text?: [string, string];
    calculable?: boolean;
    inRange?: {
      color?: string[];
    };
    textStyle?: {
      color?: string;
    };
  };
  series?: DensityMapSeriesOptions[];
}

/**
 * Density Map Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = DensityMapBuilder.create()
 *   .setData([
 *     { name: 'Hong Kong Island', value: 100 },
 *     { name: 'Kowloon', value: 80 },
 *     { name: 'New Territories', value: 60 }
 *   ])
 *   .setMap('HK')
 *   .setHeader('Population Density')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = DensityMapBuilder.create()
 *   .setData(densityData)
 *   .setMap('HK')
 *   .setTitle('Hong Kong Population Density', '2023 Data')
 *   .setVisualMap(0, 100, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'])
 *   .setRoam(true)
 *   .setZoom(1.2)
 *   .setCenter([114.1694, 22.3193])
 *   .setTooltip('item', '{b}: {c}')
 *   .setHeader('Population Density Map')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
 *   .build();
 * 
 * // Update widget data dynamically
 * DensityMapBuilder.updateData(widget, newData);
 */
export class DensityMapBuilder extends ApacheEchartBuilder<DensityMapOptions, DensityMapSeriesOptions> {
  protected override seriesOptions: DensityMapSeriesOptions;
  private mapName: string = 'world';
  private roamEnabled: boolean = false;
  private zoomLevel: number = 1;
  private centerCoords: [number, number] = [0, 0];
  private visualMapRange: [number, number] = [0, 100];
  private visualMapColors: string[] = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'];

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new DensityMapBuilder instance
   */
  static create(): DensityMapBuilder {
    return new DensityMapBuilder();
  }

  /**
   * Register a custom map with ECharts
   * @param mapName - Name of the map
   * @param geoJson - GeoJSON data for the map
   */
  static registerMap(mapName: string, geoJson: any): void {
    try {
      echarts.registerMap(mapName, geoJson);
    } catch (error) {
    }
  }

  /**
   * Get available built-in maps
   */
  static getAvailableMaps(): string[] {
    return [
      'world',
      'china',
      'usa',
      'japan',
      'uk',
      'france',
      'germany',
      'italy',
      'spain',
      'russia',
      'canada',
      'australia',
      'brazil',
      'india'
    ];
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<DensityMapOptions> {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
      legend: {
        show: false,
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 100,
        left: 'left',
        top: 'bottom',
        text: ['High', 'Low'],
        calculable: true,
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'],
        },
        textStyle: {
          color: '#333',
        },
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'map';
  }

  /**
   * Get default series options for density map
   */
  private getDefaultSeriesOptions(): DensityMapSeriesOptions {
    return {
      name: 'Density Map',
      type: 'map',
      map: 'world',
      roam: false,
      zoom: 1,
      center: [0, 0],
      label: {
        show: false,
        position: 'inside',
        formatter: '{b}',
        fontSize: 12,
        color: '#333',
      },
      itemStyle: {
        areaColor: '#eee',
        borderColor: '#999',
        borderWidth: 0.5,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
      },
      emphasis: {
        itemStyle: {
          areaColor: '#b8e186',
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      select: {
        itemStyle: {
          areaColor: '#b8e186',
        },
      },
    };
  }

  /**
   * Set the data for the density map
   */
  override setData(data: DensityMapData[]): this {
    this.seriesOptions.data = data;
    super.setData(data);
    return this;
  }

  /**
   * Set the map type (e.g., 'HK', 'CN', 'US', etc.)
   */
  setMap(mapName: string): this {
    this.mapName = mapName;
    this.seriesOptions.map = mapName;
    return this;
  }

  /**
   * Enable/disable map roaming (pan and zoom)
   */
  setRoam(roam: boolean): this {
    this.roamEnabled = roam;
    this.seriesOptions.roam = roam;
    return this;
  }

  /**
   * Set the zoom level of the map
   */
  setZoom(zoom: number): this {
    this.zoomLevel = zoom;
    this.seriesOptions.zoom = zoom;
    return this;
  }

  /**
   * Set the center coordinates of the map [longitude, latitude]
   */
  setCenter(center: [number, number]): this {
    this.centerCoords = center;
    this.seriesOptions.center = center;
    return this;
  }

  /**
   * Set the visual map configuration for density coloring
   */
  setVisualMap(min: number, max: number, colors?: string[]): this {
    this.visualMapRange = [min, max];
    if (colors) {
      this.visualMapColors = colors;
    }

    (this.chartOptions as any).visualMap = {
      type: 'continuous',
      min,
      max,
      left: 'left',
      top: 'bottom',
      text: ['High', 'Low'],
      calculable: true,
      inRange: {
        color: this.visualMapColors,
      },
      textStyle: {
        color: '#333',
      },
    };

    return this;
  }

  /**
   * Set label visibility and formatting
   */
  override setLabelShow(show: boolean, position: string = 'inside', formatter?: string): this {
    this.seriesOptions.label = {
      show,
      position,
      formatter: formatter || '{b}',
      fontSize: 12,
      color: '#333',
    };
    return this;
  }

  /**
   * Set conditional labels that only show when data exists
   * @param show - Whether to show labels
   * @param position - Label position ('inside', 'outside', etc.)
   * @param formatter - Label formatter (default: '{b}\n{c}')
   * @param showOnlyWithData - Whether to show labels only for regions with data
   */
  setConditionalLabels(
    show: boolean = true, 
    position: string = 'inside', 
    formatter?: string,
    showOnlyWithData: boolean = true
  ): this {
    if (showOnlyWithData) {
      this.seriesOptions.label = {
        show: true,
        position,
        formatter: (params: any) => {
          // Only show label if the region has valid numeric data (including zero)
          const hasValidData = typeof params.value === 'number' && isFinite(params.value);
          if (hasValidData) {
            return formatter
              ? formatter.replace('{b}', params.name).replace('{c}', params.value.toString())
              : `${params.name}\n${params.value}`;
          }
          return '';
        },
        fontSize: 12,
        color: '#333',
      };
    } else {
      this.seriesOptions.label = {
        show,
        position,
        formatter: formatter || '{b}\n{c}',
        fontSize: 12,
        color: '#333',
      };
    }
    return this;
  }

  /**
   * Set area color for regions with no data
   */
  setAreaColor(color: string): this {
    this.seriesOptions.itemStyle = {
      ...this.seriesOptions.itemStyle,
      areaColor: color,
    };
    return this;
  }

  /**
   * Set border color and width for regions
   */
  setBorderColor(color: string, width: number = 0.5): this {
    this.seriesOptions.itemStyle = {
      ...this.seriesOptions.itemStyle,
      borderColor: color,
      borderWidth: width,
    };
    return this;
  }

  /**
   * Set emphasis color for hover effects
   */
  setEmphasisColor(color: string): this {
    this.seriesOptions.emphasis = {
      itemStyle: {
        areaColor: color,
        shadowBlur: 20,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    };
    return this;
  }

  /**
   * Set shadow effects for regions
   */
  setShadow(blur: number = 10, color: string = 'rgba(0, 0, 0, 0.3)'): this {
    this.seriesOptions.itemStyle = {
      ...this.seriesOptions.itemStyle,
      shadowBlur: blur,
      shadowColor: color,
    };
    return this;
  }

  /**
   * Set custom visual map options
   */
  setVisualMapOptions(options: any): this {
    (this.chartOptions as any).visualMap = {
      ...(this.chartOptions as any).visualMap,
      ...options,
    };
    return this;
  }

  /**
   * Set custom geo options
   */
  setGeoOptions(options: any): this {
    (this.chartOptions as any).geo = {
      ...(this.chartOptions as any).geo,
      ...options,
    };
    return this;
  }

  /**
   * Build the final widget with all configurations
   */
  override build(): IWidget {
    // Update series with current options
    this.seriesOptions = {
      ...this.seriesOptions,
      map: this.mapName,
      roam: this.roamEnabled,
      zoom: this.zoomLevel,
      center: this.centerCoords,
    };

    // Set the series in chart options
    (this.chartOptions as any).series = [this.seriesOptions];

    // Build the widget
    return this.widgetBuilder
      .setEChartsOptions(this.chartOptions)
      .build();
  }

  /**
   * Update data for an existing density map widget
   */
  static override updateData(widget: IWidget, data: DensityMapData[]): void {
    if ((widget.config.options as any)?.series?.[0]) {
      (widget.config.options as any).series[0].data = data;
    }
    widget.data = data;
  }

  /**
   * Static method to check if a widget is a density map
   */
  static isDensityMap(widget: IWidget): boolean {
    return ApacheEchartBuilder.isChartType(widget, 'map');
  }

  /**
   * Export density map data for Excel/CSV export
   * Extracts region names and their corresponding values
   * @param widget - Widget containing density map data
   * @returns Array of data rows for export
   */
  static override exportData(widget: IWidget): any[] {
    const series = (widget.config?.options as any)?.series?.[0];
    
    if (!series?.data) {
      return [];
    }

    return series.data.map((item: any) => [
      item.name || 'Unknown Region',
      item.value || 0
    ]);
  }

  /**
   * Get headers for density map export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Region', 'Value'];
  }

  /**
   * Get sheet name for density map export
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sheet';
    return title.replace(/[^\w\s]/gi, '').substring(0, 31).trim();
  }

  /**
   * Create a density map widget with default settings
   */
  static createDensityMapWidget(
    data?: DensityMapData[],
    mapName?: string
  ): WidgetBuilder {
    const builder = DensityMapBuilder.create();
    if (data) {
      builder.setData(data);
    }
    if (mapName) {
      builder.setMap(mapName);
    }
    return builder.getWidgetBuilder();
  }
}

/**
 * Convenience function to create a density map widget
 */
export function createDensityMapWidget(
  data?: DensityMapData[],
  mapName?: string
): WidgetBuilder {
  return DensityMapBuilder.createDensityMapWidget(data, mapName);
} 