import { IWidget } from '../../../public-api';
import { EChartsOption } from 'echarts';
import { ApacheEchartBuilder } from '../apache-echart-builder';

export interface SankeyNode {
  name: string;
  value?: number;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
}

export interface SankeyChartData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyChartSeriesOptions {
  name?: string;
  type?: string;
  data?: SankeyNode[];
  links?: SankeyLink[];
  layout?: 'none' | 'left' | 'right';
  nodeWidth?: number;
  nodeGap?: number;
  nodeAlign?: 'justify' | 'left' | 'right';
  layoutIterations?: number;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  lineStyle?: {
    color?: string;
    opacity?: number;
    curveness?: number;
  };
  emphasis?: {
    focus?: 'adjacency' | 'source' | 'target';
    itemStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
    lineStyle?: {
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowColor?: string;
    };
  };
}

export interface SankeyChartOptions extends EChartsOption {
  series?: SankeyChartSeriesOptions[];
}

/**
 * Sankey Chart Builder extending the generic ApacheEchartBuilder
 * 
 * Usage examples:
 * 
 * // Basic usage with default options
 * const widget = SankeyChartBuilder.create()
 *   .setData({
 *     nodes: [
 *       { name: 'Income' },
 *       { name: 'Expenses' },
 *       { name: 'Savings' }
 *     ],
 *     links: [
 *       { source: 'Income', target: 'Expenses', value: 70 },
 *       { source: 'Income', target: 'Savings', value: 30 }
 *     ]
 *   })
 *   .setHeader('Cash Flow')
 *   .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
 *   .build();
 * 
 * // Advanced usage with custom options
 * const widget = SankeyChartBuilder.create()
 *   .setData(sankeyData)
 *   .setTitle('Financial Flow Analysis', 'Money Movement')
 *   .setNodeWidth(20)
 *   .setNodeGap(8)
 *   .setLayout('left')
 *   .setCurveness(0.5)
 *   .setTooltip('item', '{b}: {c}')
 *   .setHeader('Custom Sankey Chart')
 *   .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
 *   .build();
 */
export class SankeyChartBuilder extends ApacheEchartBuilder<SankeyChartOptions, SankeyChartSeriesOptions> {
  protected override seriesOptions: SankeyChartSeriesOptions;

  private constructor() {
    super();
    this.seriesOptions = this.getDefaultSeriesOptions();
  }

  /**
   * Create a new SankeyChartBuilder instance
   */
  static create(): SankeyChartBuilder {
    return new SankeyChartBuilder();
  }

  /**
   * Implement abstract method to get default options
   */
  protected override getDefaultOptions(): Partial<SankeyChartOptions> {
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: '{b}: {c}',
      },
      legend: {
        show: false,
      },
    };
  }

  /**
   * Implement abstract method to get chart type
   */
  protected override getChartType(): string {
    return 'sankey';
  }

  /**
   * Get default series options for sankey chart
   */
  private getDefaultSeriesOptions(): SankeyChartSeriesOptions {
    return {
      name: 'Sankey Chart',
      type: 'sankey',
      emphasis: {
        focus: 'adjacency',
      },
      lineStyle: {
        color: 'source',
        curveness: 0.5,
      },
    };
  }

  /**
   * Set the data for the sankey chart
   */
  override setData(data: SankeyChartData): this {
    this.seriesOptions.data = data.nodes;
    this.seriesOptions.links = data.links;
    super.setData(data);
    return this;
  }

  /**
   * Set node width
   */
  setNodeWidth(width: number): this {
    this.seriesOptions.nodeWidth = width;
    return this;
  }

  /**
   * Set node gap
   */
  setNodeGap(gap: number): this {
    this.seriesOptions.nodeGap = gap;
    return this;
  }

  /**
   * Set node alignment
   */
  setNodeAlign(align: 'justify' | 'left' | 'right'): this {
    this.seriesOptions.nodeAlign = align;
    return this;
  }

  /**
   * Set layout iterations
   */
  setLayoutIterations(iterations: number): this {
    this.seriesOptions.layoutIterations = iterations;
    return this;
  }

  /**
   * Set layout direction
   */
  setLayout(layout: 'none' | 'left' | 'right'): this {
    this.seriesOptions.layout = layout;
    return this;
  }

  /**
   * Set line curveness
   */
  setCurveness(curveness: number): this {
    if (!this.seriesOptions.lineStyle) this.seriesOptions.lineStyle = {};
    this.seriesOptions.lineStyle.curveness = curveness;
    return this;
  }

  /**
   * Set line color
   */
  setLineColor(color: string): this {
    if (!this.seriesOptions.lineStyle) this.seriesOptions.lineStyle = {};
    this.seriesOptions.lineStyle.color = color;
    return this;
  }

  /**
   * Set node colors
   */
  setNodeColors(colors: string[]): this {
    if (!this.seriesOptions.itemStyle) this.seriesOptions.itemStyle = {};
    (this.seriesOptions.itemStyle as any).color = colors;
    return this;
  }

  /**
   * Set emphasis focus
   */
  setEmphasisFocus(focus: 'adjacency' | 'source' | 'target'): this {
    if (!this.seriesOptions.emphasis) this.seriesOptions.emphasis = {};
    this.seriesOptions.emphasis.focus = focus;
    return this;
  }

  /**
   * Build the widget
   */
  override build(): IWidget {
    // Merge series options with chart options, splitting nodes/links
    let nodes = (this.seriesOptions.data as any)?.nodes;
    let links = (this.seriesOptions.data as any)?.links;
    const finalOptions: SankeyChartOptions = {
      ...this.chartOptions,
      series: [{
        ...this.seriesOptions,
        type: 'sankey',
        data: nodes,
        links: links,
      }],
    };

    return this.widgetBuilder
      .setEChartsOptions(finalOptions)
      .build();
  }

  /**
   * Static method to update data in an existing widget
   */
  static override updateData(widget: IWidget, data: SankeyChartData): void {
    if ((widget.config?.options as any)?.series?.[0]) {
      (widget.config.options as any).series[0].data = data.nodes;
      (widget.config.options as any).series[0].links = data.links;
    }
    widget.data = data;
  }

  /**
   * Check if widget is a sankey chart
   */
  static isSankeyChart(widget: IWidget): boolean {
    return widget.config?.component === 'echart' && 
           (widget.config?.options as any)?.series?.[0]?.type === 'sankey';
  }

  /**
   * Export sankey chart data for Excel/CSV export
   */
  static override exportData(widget: IWidget): any[] {
    const data = widget.data as SankeyChartData;
    if (!data || !data.links) return [];

    return data.links.map(link => ({
      'Source': link.source,
      'Target': link.target,
      'Value': link.value,
    }));
  }

  /**
   * Get headers for sankey chart export
   */
  static override getExportHeaders(widget: IWidget): string[] {
    return ['Source', 'Target', 'Value'];
  }

  /**
   * Get sheet name for sankey chart export
   */
  static override getExportSheetName(widget: IWidget): string {
    const title = widget.config?.header?.title || 'Sankey Chart';
    return title.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 31);
  }
} 