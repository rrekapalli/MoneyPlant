import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {EchartComponent} from '../echarts/echart.component';
import {FilterComponent} from '../filter/filter.component';
import {TableComponent} from '../table/table.component';
import {TileComponent} from '../tile/tile.component';
import {MarkdownCellComponent} from '../markdown-cell/markdown-cell.component';
import {CodeCellComponent} from '../code-cell/code-cell.component';
import { provideEchartsCore } from 'ngx-echarts';

/**
 * Factory function to determine the appropriate component based on widget type
 * @param widget - Widget configuration to determine component for
 * @returns Component class to render
 */
const onGetWidget = (widget: IWidget) => {
  switch (widget?.config?.component) {
    case 'echart':
      return EchartComponent;
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
 * based on the widget configuration. Supports echart, filter, table, tile,
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
  
  /** Event emitted when widget data is loaded */
  @Output() onDataLoad: EventEmitter<IWidget> = new EventEmitter();
  
  /** Event emitted when filter is updated */
  @Output() onUpdateFilter: EventEmitter<any> = new EventEmitter();

  /**
   * Get the current widget configuration for dynamic component rendering
   * @returns Object containing component class and input properties
   */
  get currentWidget() {
    return {
      component: onGetWidget(this.widget),
      inputs: {
        widget: this.widget,
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
    return this.currentWidget.component === EchartComponent;
  }
}
