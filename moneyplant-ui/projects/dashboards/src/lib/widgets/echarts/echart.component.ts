import {Component, Input, EventEmitter} from '@angular/core';
import {IWidget} from '../../entities/IWidget';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEcharts} from 'ngx-echarts';
import {ECharts, EChartsInitOpts, EChartsOption} from 'echarts';
import { find } from 'lodash-es';
import { CompactType, DisplayGrid, GridType } from 'angular-gridster2';

@Component({
  selector: 'vis-echart',
  standalone: true,
  template: `<div
    echarts
    [options]="chartOptions"
    (chartInit)="onChartInit($event)"
    (chartClick)="onClick($event)"
    (chartDblClick)="onChartDblClick($event)"
    [initOpts]="initOpts"
  ></div>`,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEcharts()],
})
export class EchartComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;

  isSingleClick: boolean = true;
  initOpts: any = {
    gridType: GridType.Fit,
    displayGrid: DisplayGrid.OnDragAndResize,
    pushItems: true,
    draggable: {
      enabled: true,
    },
    resizable: {
      enabled:  true,
    },
    swap: false,
    minCols: 1,
    maxCols: 12,
    minRows: 50,
    maxRows: 50,
    defaultItemCols: 1,
    defaultItemRows: 1,
    fixedColWidth: 105,
    rowHeightRatio: 0.15,
    fixedRowHeight: 30,
    scrollSensitivity: 10,
    scrollSpeed: 20,
    enableEmptyCellClick: false,
    enableEmptyCellContextMenu: false,
    enableEmptyCellDrop: false,
    enableEmptyCellDrag: false,
    enableOccupiedCellDrop: false,
    emptyCellDragMaxCols: 50,
    emptyCellDragMaxRows: 50,
    ignoreMarginInRow: false,
    dirType: 'ltr',
    disableOneColumnMode: false,
    disablePushOnDrag: false,
    disablePushOnResize: false,
    disableScrollVertical: false,
    disableScrollHorizontal: false,
    enableBoundaryControl: false,
    compactType: CompactType.None,
    margin: 6,
    outerMargin: true,
    outerMarginTop: null,
    outerMarginRight: null,
    outerMarginBottom: null,
    outerMarginLeft: null,
    useTransformPositioning: true,
    mobileBreakpoint: 640,
    useBodyForBreakpoint: false,
    allowMultiLayer: true,
    defaultLayerIndex: 0,
    baseLayerIndex: 0,
    maxLayerIndex: 0,
    allowSwap: false,
    allowSwapOverlap: false,
    doNotPushItems: false,
    disableItemMovement: false,
    disableGridster: false,
    emptyCellClickCallback: undefined,
    emptyCellContextMenuCallback: undefined,
    emptyCellDropCallback: undefined,
    emptyCellDragCallback: undefined,
    itemChangeCallback: undefined,
    itemResizeCallback: undefined,
    itemInitCallback: undefined,
    itemRemovedCallback: undefined,
    itemValidateCallback: undefined
  };

  get chartOptions() {
    return this.widget?.config?.options as EChartsOption;
  }

  onChartInit(instance: ECharts) {
    this.widget.chartInstance = instance;
    setTimeout(() => {
      this.onDataLoad?.emit(this.widget);
    });
  }

  onChartDblClick(e: any): void {
    this.isSingleClick = false;
  }

  onClick(e: any) {
    this.isSingleClick = true;
    setTimeout(() => {
      let selectedPoint = e.data;
      if(e.seriesType === "scatter") {
        const scatterChartData = find(e.data, this.widget.config.state?.accessor)
        selectedPoint = {
          ...selectedPoint,
          ...scatterChartData as object
        }
      }
      this.onUpdateFilter.emit({
        value: selectedPoint,
        widget: this.widget,
      });
    }, 250);
  }
}
