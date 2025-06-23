import {Component, Input, EventEmitter} from '@angular/core';
import {IWidget} from '../../entities/IWidget';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import { EChartsOption } from 'echarts';
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
  ></div>`,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({
    echarts: () => import('echarts'),
  })],
})
export class EchartComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;

  isSingleClick: boolean = true;
  
  get chartOptions() {
    return this.widget?.config?.options as EChartsOption;
  }

  onChartInit(instance: any) {
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
        const scatterChartData = e.data.find((item: any) => item.name === this.widget.config.state?.accessor)
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
