import { IWidget } from '../../entities/IWidget';
import { ECharts, EChartsOption } from 'echarts';
import { GridsterItem } from 'angular-gridster2';
import { IState } from '../../entities/IState';
import { IFilterOptions } from '../../entities/IFilterOptions';
import { ITileOptions } from '../../entities/ITileOptions';
import { IMarkdownCellOptions } from '../../entities/IMarkdownCellOptions';
import { ICodeCellOptions } from '../../entities/ICodeCellOptions';
import { ITableOptions } from '../../entities/ITableOptions';
import { IFilterValues } from '../../entities/IFilterValues';

export class WidgetBuilder {
  private widget: IWidget = {
    position: { x: 0, y: 0, cols: 1, rows: 1 },
    config: {
      options: {}
    }
  };

  setId(id: string) {
    this.widget.id = id;
    return this;
  }

  setPosition(position: GridsterItem) {
    this.widget.position = position;
    return this;
  }

  setComponent(component: string) {
    this.widget.config.component = component;
    return this;
  }

  setInitialState(initialState: IState) {
    this.widget.config.initialState = initialState;
    return this;
  }

  setState(state: IState) {
    this.widget.config.state = state;
    return this;
  }

  setHeader(title: string, options?: string[]) {
    this.widget.config.header = { title, options };
    return this;
  }

  setSize(size: number[]) {
    this.widget.config.size = size;
    return this;
  }

  setEChartsOptions(options: EChartsOption) {
    this.widget.config.options = options;
    return this;
  }

  setFilterOptions(options: IFilterOptions) {
    this.widget.config.options = options;
    return this;
  }

  setTileOptions(options: ITileOptions) {
    this.widget.config.options = options;
    return this;
  }

  setMarkdownCellOptions(options: IMarkdownCellOptions) {
    this.widget.config.options = options;
    return this;
  }

  setCodeCellOptions(options: ICodeCellOptions) {
    this.widget.config.options = options;
    return this;
  }

  setTableOptions(options: ITableOptions) {
    this.widget.config.options = options;
    return this;
  }

  setEvents(onChartOptions: (widget: IWidget, chart?: ECharts, filters?: string | IFilterValues[]) => void) {
    this.widget.config.events = { onChartOptions };
    return this;
  }

  setEventChartOptions(onChartOptions: (widget: IWidget, chart?: ECharts, filters?: string | IFilterValues[]) => void) {
    this.widget.config.events = { onChartOptions };
    return this;
  }

  setSeries(series: [{}]) {
    this.widget.series = series;
    return this;
  }


  setChartInstance(chartInstance: ECharts | null) {
    this.widget.chartInstance = chartInstance;
    return this;
  }

  setEChartsTitle(title: any) {
    if (!this.widget.config.options) {
      this.widget.config.options = {};
    }
    (this.widget.config.options as EChartsOption).title = title;
    return this;
  }

  setEChartsGrid(grid: any) {
    if (!this.widget.config.options) {
      this.widget.config.options = {};
    }
    (this.widget.config.options as EChartsOption).grid = grid;
    return this;
  }

  setEChartsTooltip(tooltip: any) {
    if (!this.widget.config.options) {
      this.widget.config.options = {};
    }
    (this.widget.config.options as EChartsOption).tooltip = tooltip;
    return this;
  }

  setEChartsLegend(legend: any) {
    if (!this.widget.config.options) {
      this.widget.config.options = {};
    }
    (this.widget.config.options as EChartsOption).legend = legend;
    return this;
  }

  setEChartsXAxis(xAxis: any) {
    if (!this.widget.config.options) {
      this.widget.config.options = {};
    }
    (this.widget.config.options as EChartsOption).xAxis = xAxis;
    return this;
  }

  setEChartsYAxis(yAxis: any) {
    if (!this.widget.config.options) {
      this.widget.config.options = {};
    }
    (this.widget.config.options as EChartsOption).yAxis = yAxis;
    return this;
  }

  setEChartsSeries(series: any) {
    if (!this.widget.config.options) {
      this.widget.config.options = {};
    }
    (this.widget.config.options as EChartsOption).series = series;
    return this;
  }

  build() {
    return this.widget;
  }
}
    