import * as echarts from 'echarts';
import {GridsterItem} from 'angular-gridster2';
import {IState} from './IState';
import {IFilterOptions} from './IFilterOptions';
import {ITileOptions} from './ITileOptions';
import {IMarkdownCellOptions} from './IMarkdownCellOptions';
import {ICodeCellOptions} from './ICodeCellOptions';
import {ITableOptions} from './ITableOptions';
import {IFilterValues} from './IFilterValues';

/**
 * Interface representing a widget in the dashboard
 */
export interface IWidget {
  /** Unique identifier for the widget */
  id?: string;

  /** Position and size configuration for the gridster layout */
  position: GridsterItem;

  /** Widget configuration object */
  config: {
    /** Component type identifier */
    component?: string;

    /** Initial state of the widget */
    initialState?: IState;

    /** Current state of the widget */
    state?: IState;

    /** Header configuration */
    header?: {
      /** Widget title */
      title: string;
      /** Available options for the widget header */
      options?: string[];
    };

    /** Size configuration [width, height] */
    size?: number[];

    /** Widget-specific options based on the component type */
    options: echarts.EChartsOption | IFilterOptions | ITileOptions | IMarkdownCellOptions | ICodeCellOptions | ITableOptions;

    /** Event handlers */
    events?: {
      /** Callback function when chart options change
       * @param widget - The current widget instance
       * @param chart - Optional ECharts instance
       * @param filters - Optional filter values
       */
      onChartOptions?: (widget: IWidget, chart?: echarts.ECharts, filters?: string | IFilterValues[]) => void 
    };
  };

  /** Data series for the widget */
  series?: [{}];

  /** Reference to the ECharts instance if applicable */
  chartInstance?: echarts.ECharts | null;
}
