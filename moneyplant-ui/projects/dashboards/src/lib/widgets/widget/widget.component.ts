import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {EchartComponent} from '../echarts/echart.component';
import {D3ChartComponent} from '../d3/d3-chart.component';
import {FilterComponent} from '../filter/filter.component';
import {TableComponent} from '../table/table.component';
import {TileComponent} from '../tile/tile.component';
import {MarkdownCellComponent} from '../markdown-cell/markdown-cell.component';
import {CodeCellComponent} from '../code-cell/code-cell.component';
import { provideEchartsCore } from 'ngx-echarts';
import {ITableOptions} from '../../entities/ITableOptions';

// Import chart builders
import * as EChartsBuilders from '../../echart-chart-builders';
import * as D3Builders from '../../d3-chart-builders';

/**
 * Factory function to determine the appropriate component based on widget type
 * @param widget - Widget configuration to determine component for
 * @returns Component class to render
 */
const onGetWidget = (widget: IWidget) => {
  switch (widget?.config?.component) {
    case 'echart':
      return EchartComponent;
    case 'd3-chart':
      return D3ChartComponent;
    case 'filter':
      return FilterComponent;
    case 'table':
      return TableComponent;
    case 'tile':
      return TileComponent;
    case 'markdownCell':
      return MarkdownCellComponent;
    case 'codeCell':
      return CodeCellComponent;
    default:
      return EchartComponent;
  }
};

/**
 * Generic widget component that dynamically renders different widget types
 * based on the widget configuration. Supports echart, d3-chart, filter, table, tile,
 * markdown cell, and code cell components.
 */
@Component({
  selector: 'vis-widget',
  standalone: true,
  templateUrl:'./widget.component.html',
  imports: [NgComponentOutlet],
  providers: [
    provideEchartsCore({
      echarts: () => import('echarts'),
    })
  ]
})
export class WidgetComponent {
  /** Widget configuration to render */
  @Input() widget!: IWidget;
  
  /** Current view mode for the widget */
  @Input() viewMode: 'chart' | 'table' = 'chart';
  
  /** Event emitted when widget data is loaded */
  @Output() onDataLoad: EventEmitter<IWidget> = new EventEmitter();
  
  /** Event emitted when filter is updated */
  @Output() onUpdateFilter: EventEmitter<any> = new EventEmitter();

  private originalWidget: IWidget | null = null;
  private tableWidget: IWidget | null = null;

  /**
   * Get the current widget configuration for dynamic component rendering
   * @returns Object containing component class and input properties
   */
  get currentWidget() {
    const widgetToRender = this.getWidgetForCurrentMode();
    return {
      component: onGetWidget(widgetToRender),
      inputs: {
        widget: widgetToRender,
        onDataLoad: this.onDataLoad,
        onUpdateFilter: this.onUpdateFilter,
      },
    };
  }

  /**
   * Check if the current widget is an ECharts component
   * @returns True if the widget is an ECharts component
   */
  get isEchartComponent(): boolean {
    const widgetToRender = this.getWidgetForCurrentMode();
    return onGetWidget(widgetToRender) === EchartComponent;
  }

  /**
   * Check if the current widget is a D3.js component
   * @returns True if the widget is a D3.js component
   */
  get isD3Component(): boolean {
    const widgetToRender = this.getWidgetForCurrentMode();
    return onGetWidget(widgetToRender) === D3ChartComponent;
  }

  /**
   * Get the widget configuration based on current view mode
   * @returns Widget configuration for current mode
   */
  private getWidgetForCurrentMode(): IWidget {
    if (this.viewMode === 'table') {
      return this.getTableWidget();
    } else {
      return this.getOriginalWidget();
    }
  }

  /**
   * Get the original widget configuration
   * @returns Original widget configuration
   */
  private getOriginalWidget(): IWidget {
    if (!this.originalWidget) {
      this.originalWidget = { ...this.widget };
    }
    return this.originalWidget;
  }

  /**
   * Get or create table widget configuration
   * @returns Table widget configuration
   */
  private getTableWidget(): IWidget {
    if (!this.tableWidget) {
      this.tableWidget = this.createTableWidget();
    }
    return this.tableWidget;
  }

  /**
   * Create table widget configuration from chart data
   * @returns Table widget configuration
   */
  private createTableWidget(): IWidget {
    const originalWidget = this.getOriginalWidget();
    const dataExtractor = this.getDataExtractor(originalWidget);
    
    let columns: string[] = [];
    let data: any[] = [];

    if (dataExtractor) {
      columns = dataExtractor.getHeaders(originalWidget);
      const rawData = dataExtractor.extractData(originalWidget);
      
      // Convert array data to object format for table
      data = rawData.map((row: any[], index: number) => {
        const rowObj: any = {};
        columns.forEach((col: string, colIndex: number) => {
          rowObj[col] = row[colIndex] || '';
        });
        return rowObj;
      });
    } else {
      // Fallback for unsupported widget types
      columns = ['Property', 'Value'];
      data = [
        { 'Property': 'Widget ID', 'Value': originalWidget.id },
        { 'Property': 'Component Type', 'Value': originalWidget.config?.component || 'Unknown' },
        { 'Property': 'Title', 'Value': originalWidget.config?.header?.title || 'Untitled' }
      ];
    }

    const tableOptions: ITableOptions = {
      columns,
      data
    };

    return {
      ...originalWidget,
      config: {
        ...originalWidget.config,
        component: 'table',
        options: tableOptions
      }
    };
  }

  /**
   * Get data extractor for widget type
   * @param widget - Widget to get extractor for
   * @returns Data extractor or null
   */
  private getDataExtractor(widget: IWidget): any {
    const component = widget.config?.component;
    
    // Handle different widget types
    if (component === 'echart') {
      const chartType = this.getChartType(widget);
      if (chartType) {
        return this.getChartDataExtractor(chartType);
      }
    } else if (component === 'd3-chart') {
      const chartType = this.getD3ChartType(widget);
      if (chartType) {
        return this.getD3ChartDataExtractor(chartType);
      }
    } else if (component === 'table') {
      return {
        extractData: (w: IWidget) => (w.config?.options as any)?.data || [],
        getHeaders: (w: IWidget) => (w.config?.options as any)?.columns || [],
        getSheetName: (w: IWidget) => this.getWidgetSheetName(w, 'Table')
      };
    } else if (component === 'tile') {
      return {
        extractData: (w: IWidget) => {
          const options = w.config?.options as any;
          return [[
            'Title',
            options?.title || 'Untitled'
          ], [
            'Value',
            options?.value || 'N/A'
          ], [
            'Subtitle',
            options?.subtitle || ''
          ]];
        },
        getHeaders: () => ['Property', 'Value'],
        getSheetName: (w: IWidget) => this.getWidgetSheetName(w, 'Tile')
      };
    }
    
    return this.getGenericDataExtractor();
  }

  /**
   * Get chart type from ECharts widget
   * @param widget - Widget to get chart type from
   * @returns Chart type string or null
   */
  private getChartType(widget: IWidget): string | null {
    const options = widget.config?.options as any;
    if (options?.series && Array.isArray(options.series) && options.series.length > 0) {
      return options.series[0].type;
    }
    return null;
  }

  /**
   * Get chart type from D3.js widget
   * @param widget - Widget to get chart type from
   * @returns Chart type string or null
   */
  private getD3ChartType(widget: IWidget): string | null {
    const options = widget.config?.options as any;
    return options?.chartType || null;
  }

  /**
   * Get data extractor for ECharts chart type
   * @param chartType - Chart type to get extractor for
   * @returns Data extractor or null
   */
  private getChartDataExtractor(chartType: string): any {
    // Import chart builders dynamically to avoid circular dependencies
    const chartBuilders = this.getChartBuilders();
    
    switch (chartType) {
      case 'pie':
        return chartBuilders.PieChartBuilder;
      case 'bar':
        return chartBuilders.BarChartBuilder;
      case 'line':
        return chartBuilders.LineChartBuilder;
      case 'scatter':
        return chartBuilders.ScatterChartBuilder;
      case 'gauge':
        return chartBuilders.GaugeChartBuilder;
      case 'heatmap':
        return chartBuilders.HeatmapChartBuilder;
      case 'map':
        return chartBuilders.DensityMapBuilder;
      case 'treemap':
        return chartBuilders.TreemapChartBuilder;
      case 'sunburst':
        return chartBuilders.SunburstChartBuilder;
      case 'sankey':
        return chartBuilders.SankeyChartBuilder;
      default:
        return null;
    }
  }

  /**
   * Get data extractor for D3.js chart type
   * @param chartType - Chart type to get extractor for
   * @returns Data extractor or null
   */
  private getD3ChartDataExtractor(chartType: string): any {
    // Import D3 chart builders dynamically to avoid circular dependencies
    const d3ChartBuilders = this.getD3ChartBuilders();
    
    switch (chartType) {
      case 'd3-pie':
        return d3ChartBuilders.D3PieChartBuilder;
      default:
        return null;
    }
  }

  /**
   * Get chart builders dynamically
   * @returns Object containing chart builders
   */
  private getChartBuilders(): any {
    return EChartsBuilders;
  }

  /**
   * Get D3 chart builders dynamically
   * @returns Object containing D3 chart builders
   */
  private getD3ChartBuilders(): any {
    return D3Builders;
  }

  /**
   * Get generic data extractor for unsupported widget types
   * @returns Generic data extractor
   */
  private getGenericDataExtractor(): any {
    return {
      extractData: (w: IWidget) => {
        const data = w.data;
        if (Array.isArray(data)) {
          return data.map((item, index) => [index, item]);
        }
        return [['Data', data]];
      },
      getHeaders: () => ['Index', 'Value'],
      getSheetName: (w: IWidget) => this.getWidgetSheetName(w, 'Widget')
    };
  }

  /**
   * Get sheet name for widget
   * @param widget - Widget to get sheet name for
   * @param prefix - Prefix for sheet name
   * @returns Sheet name string
   */
  private getWidgetSheetName(widget: IWidget, prefix: string): string {
    const title = widget.config?.header?.title || 'Untitled';
    return `${prefix} - ${title}`;
  }

  /**
   * Calculate percentage for pie chart data
   * @param value - Value to calculate percentage for
   * @param data - Array of data items
   * @returns Percentage string
   */
  private calculatePercentage(value: number, data: any[]): string {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    return total > 0 ? ((value / total) * 100).toFixed(2) + '%' : '0%';
  }
}
