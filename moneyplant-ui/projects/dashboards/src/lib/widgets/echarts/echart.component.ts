import {Component, Input, EventEmitter} from '@angular/core';
import {IWidget} from '../../entities/IWidget';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
// Import echarts using dynamic import to avoid module format issues
import {EChartsOption, EChartsType} from 'echarts';
import type {ECharts} from 'echarts/core';

// Use require for echarts to avoid the module format conflict
const echarts = require('echarts');

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
  providers: [provideEchartsCore({ echarts })],
})
export class EchartComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;

  isSingleClick: boolean = true;
  initOpts: any = {
    height: 300,
    rowHeightRatio: 0.25,
    fixedRowHeight: 30,
    width: 'auto',
    locale: 'en',
  };

  get chartOptions(): EChartsOption {
    return (this.widget?.config?.options || {}) as EChartsOption;
  }

  onChartInit(instance: ECharts) {
    if (this.widget) {
      if (instance) {
        // @ts-ignore
        this.widget.chartInstance = instance as EChartsType;
        setTimeout(() => {
          this.onDataLoad?.emit(this.widget);
        });
      }
    }
  }

  onChartDblClick(e: any): void {
    this.isSingleClick = false;
  }

  onClick(e: any) {
    this.isSingleClick = true;
    setTimeout(() => {
      let selectedPoint = e.data;
      if(e.seriesType === "scatter" && Array.isArray(e.data) && this.widget.config.state?.accessor) {
        const scatterChartData = e.data.find(this.widget.config.state.accessor);
        if (scatterChartData) {
          selectedPoint = {
            ...selectedPoint,
            ...scatterChartData as object
          };
        }
      }
      this.onUpdateFilter?.emit({
        value: selectedPoint,
        widget: this.widget,
      });
    }, 250);
  }
}
