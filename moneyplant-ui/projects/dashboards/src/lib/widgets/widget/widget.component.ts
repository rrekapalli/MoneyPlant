import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {EchartComponent} from '../echarts/echart.component';
import {FilterComponent} from '../filter/filter.component';
import {TableComponent} from '../table/table.component';
import {TileComponent} from '../tile/tile.component';
import {MarkdownCellComponent} from '../markdown-cell/markdown-cell.component';
import {CodeCellComponent} from '../code-cell/code-cell.component';

/**
 * Determines the appropriate component type based on the widget configuration
 * 
 * @param widget - The widget configuration
 * @returns The component type to render
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
      break;
  }
  return EchartComponent;
};

/**
 * A dynamic widget component that renders different widget types based on configuration
 */
@Component({
  selector: 'vis-widget',
  standalone: true,
  templateUrl:'./widget.component.html',
  imports: [NgComponentOutlet],
})
export class WidgetComponent {
  /** The widget configuration */
  @Input() widget!: IWidget;

  /** Event emitted when data needs to be loaded for the widget */
  @Output() onDataLoad: EventEmitter<IWidget> = new EventEmitter();

  /** Event emitted when filter values are updated */
  @Output() onUpdateFilter: EventEmitter<any> = new EventEmitter();

  /**
   * Gets the current widget component and its inputs
   * @returns An object containing the component type and inputs
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
   * Checks if the current widget is an EChart component
   * @returns True if the current widget is an EChart component
   */
  get isEchartComponent(): boolean {
    return this.currentWidget.component === EchartComponent;
  }
}
