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
  @Input() widget!: IWidget;
  @Output() onDataLoad: EventEmitter<IWidget> = new EventEmitter();
  @Output() onUpdateFilter: EventEmitter<any> = new EventEmitter();

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

  get isEchartComponent(): boolean {
    return this.currentWidget.component === EchartComponent;
  }
}
