import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
// Import echarts using ES module import
import * as echarts from 'echarts';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { EventBusService } from '../../services/event-bus.service';

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
export class EchartComponent extends BaseWidgetComponent {
  isSingleClick: boolean = true;
  initOpts: any = {
    height: 300,
    rowHeightRatio: 0.25,
    fixedRowHeight: 30,
    width: 'auto',
    locale: 'en',
  };

  constructor(protected override eventBus: EventBusService) {
    super(eventBus);
  }

  get chartOptions(): echarts.EChartsOption {
    return (this.widget?.config?.options || {}) as echarts.EChartsOption;
  }

  /**
   * Initializes the chart instance
   * 
   * @param instance - The ECharts instance
   */
  onChartInit(instance: any) {
    if (this.widget && instance) {
      this.widget.chartInstance = instance as echarts.ECharts;
      setTimeout(() => {
        this.loadData();
      });
    }
  }

  /**
   * Handles double-click events on the chart
   * 
   * @param e - The double-click event
   */
  onChartDblClick(e: any): void {
    this.isSingleClick = false;
  }

  /**
   * Handles click events on the chart
   * 
   * @param e - The click event
   */
  onClick(e: any) {
    this.isSingleClick = true;
    setTimeout(() => {
      if (!this.isSingleClick) return; // Ignore if it was part of a double-click

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

      // Use the base class method to update the filter
      this.updateFilter(selectedPoint);
    }, 250);
  }

  /**
   * Called when the widget is updated
   * Reloads data if necessary
   */
  protected override onWidgetUpdated(): void {
    // Reload data when the widget is updated
    this.loadData();
  }

  /**
   * Called when filters are updated
   * Reloads data if the widget supports filtering
   * 
   * @param filterData - The updated filter data
   */
  protected override onFilterUpdated(filterData: any): void {
    // Only reload data if this widget supports filtering
    if (this.widget.config.state?.supportsFiltering !== false) {
      this.loadData();
    }
  }
}
