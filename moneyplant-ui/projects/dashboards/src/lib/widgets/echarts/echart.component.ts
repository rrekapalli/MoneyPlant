import {Component, Input, EventEmitter} from '@angular/core';
import {IWidget} from '../../entities/IWidget';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { CompactType, DisplayGrid, GridType } from 'angular-gridster2';
import { IFilterValues } from '../../entities/IFilterValues';

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
      
      // Create filter value from clicked data
      const filterValue = this.createFilterValueFromClickData(selectedPoint, e);
      
      if (filterValue) {
        // Add widget information to filter value
        filterValue['widgetId'] = this.widget.id;
        if (this.widget.config?.header?.title) {
          filterValue['widgetTitle'] = this.widget.config.header.title;
        }
        
        this.onUpdateFilter.emit({
          value: selectedPoint,
          widget: this.widget,
          filterValue: filterValue
        });
      } else {
        // Fallback to original behavior
        this.onUpdateFilter.emit({
          value: selectedPoint,
          widget: this.widget,
        });
      }
    }, 250);
  }

  /**
   * Create filter value from chart click data
   */
  private createFilterValueFromClickData(clickedData: any, event: any): IFilterValues | null {
    if (!clickedData || typeof clickedData !== 'object') {
      return null;
    }

    // Get the filter column from widget config, fallback to accessor
    const filterColumn = this.widget.config?.filterColumn || this.widget.config?.accessor || 'unknown';

    let filterValue: IFilterValues = {
      accessor: 'unknown',
      filterColumn: filterColumn
    };

    // For pie charts, use the name as the filter key
    if (clickedData.name && event.seriesType === 'pie') {
      filterValue = {
        accessor: 'category',
        filterColumn: filterColumn,
        category: clickedData.name,
        value: clickedData.name,
        percentage: clickedData.value?.toString() || '0'
      };
    }
    // For bar charts
    else if (clickedData.name && event.seriesType === 'bar') {
      filterValue = {
        accessor: 'category',
        filterColumn: filterColumn,
        category: clickedData.name,
        value: clickedData.value || clickedData.name,
        seriesName: event.seriesName
      };
    }
    // For line charts
    else if (event.seriesType === 'line') {
      filterValue = {
        accessor: 'series',
        filterColumn: filterColumn,
        series: event.seriesName || clickedData.name,
        value: clickedData.value || clickedData.name,
        xAxis: clickedData[0]?.toString(),
        yAxis: clickedData[1]?.toString()
      };
    }
    // For scatter plots
    else if (event.seriesType === 'scatter' && clickedData.value && Array.isArray(clickedData.value)) {
      filterValue = {
        accessor: 'coordinates',
        filterColumn: filterColumn,
        x: clickedData.value[0]?.toString(),
        y: clickedData.value[1]?.toString(),
        value: `(${clickedData.value[0]}, ${clickedData.value[1]})`,
        seriesName: event.seriesName
      };
    }
    // For other chart types, try to find meaningful properties
    else {
      const keys = Object.keys(clickedData);
      if (keys.length > 0) {
        const key = keys[0];
        filterValue = {
          accessor: key,
          filterColumn: filterColumn,
          [key]: clickedData[key],
          value: clickedData[key]?.toString(),
          seriesName: event.seriesName
        };
      }
    }

    return filterValue.accessor !== 'unknown' ? filterValue : null;
  }
}
