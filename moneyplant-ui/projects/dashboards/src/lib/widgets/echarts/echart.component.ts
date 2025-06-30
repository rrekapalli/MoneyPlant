import {Component, Input, EventEmitter, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit, ElementRef, OnDestroy} from '@angular/core';
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
    [initOpts]="{renderer: 'canvas'}"
    [autoResize]="true"
    (chartInit)="onChartInit($event)"
    (chartClick)="onClick($event)"
    (chartDblClick)="onChartDblClick($event)"
    (chartError)="onChartError($event)"
    #chart
    [attr.data-widget-id]="widget.id"
    style="width: 100%; height: 100%; min-height: 320px; display: block; position: relative;"
  >
  </div>`,
  imports: [CommonModule, NgxEchartsDirective],
  // ECharts provider moved to app.config.ts to avoid conflicts
})
export class EchartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;
  @ViewChild('chart', { static: false }) chart!: NgxEchartsDirective;

  isSingleClick: boolean = true;
  private disposed = false;
  private lastUpdateTime = 0;
  
  constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.disposed = false;
  }

  ngAfterViewInit() {
    // Schedule a resize after view initialization to ensure proper chart sizing
    setTimeout(() => {
      this.resizeChart();
    }, 200);
  }

  ngOnDestroy() {
    this.disposed = true;
    // Clean up chart instance
    if (this.widget?.chartInstance) {
      try {
        this.widget.chartInstance.dispose();
        this.widget.chartInstance = null;
      } catch (error) {
        // Ignore disposal errors
      }
    }
  }
  
  get chartOptions() {
    const options = this.widget?.config?.options as EChartsOption;
    return options;
  }

  get debugInfo() {
    return `Widget: ${this.widget?.config?.header?.title}, HasOptions: ${!!this.widget?.config?.options}`;
  }

  onChartInit(instance: any) {
    if (this.widget && !this.disposed) {
      // Ensure any previous instance is disposed
      if (this.widget.chartInstance && this.widget.chartInstance !== instance) {
        try {
          this.widget.chartInstance.dispose();
        } catch (error) {
          // Ignore disposal errors
        }
      }
      
      this.widget.chartInstance = instance;
      
      // Force resize after initialization to ensure chart fills container
      setTimeout(() => {
        if (this.widget.chartInstance && !this.widget.chartInstance.isDisposed()) {
          this.widget.chartInstance.resize();
        }
      }, 100);
    }
    
    setTimeout(() => {
      if (!this.disposed) {
        this.onDataLoad?.emit(this.widget);
      }
    });
  }

  onChartError(error: any) {
    console.error('Chart Error for widget:', this.widget?.config?.header?.title, error);
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
    if (clickedData && typeof clickedData === 'object' && clickedData.name && event.seriesType === 'pie') {
      filterValue = {
        accessor: 'category',
        filterColumn: filterColumn,
        category: clickedData.name,
        value: clickedData.name,
        percentage: clickedData.value?.toString() || '0'
      };
    }
    // For bar charts - handle both object and primitive value cases
    else if (event.seriesType === 'bar') {
      let categoryName: string;
      let value: any;
      
      if (clickedData && typeof clickedData === 'object' && clickedData.name) {
        // If clickedData is an object with a name property
        categoryName = clickedData.name;
        value = clickedData.value || clickedData.name;
      } else {
        // If clickedData is just a value (number), we need to get the category from the x-axis
        value = clickedData;
        
        // Try to get the category name from the chart options
        const chartOptions = this.widget.config?.options as any;
        
        let xAxisData: string[] = [];
        
        // Try multiple ways to access x-axis data
        if (chartOptions?.xAxis) {
          if (Array.isArray(chartOptions.xAxis)) {
            xAxisData = chartOptions.xAxis[0]?.data || [];
          } else {
            xAxisData = chartOptions.xAxis.data || [];
          }
        }
        
        // Also try to get from series data if available
        if (xAxisData.length === 0 && chartOptions?.series?.[0]?.data) {
          const seriesData = chartOptions.series[0].data;
          if (Array.isArray(seriesData) && seriesData.length > 0) {
            // If series data has objects with name property
            if (typeof seriesData[0] === 'object' && seriesData[0].name) {
              xAxisData = seriesData.map((item: any) => item.name);
            }
          }
        }
        
        if (xAxisData && Array.isArray(xAxisData) && event.dataIndex !== undefined) {
          categoryName = xAxisData[event.dataIndex];
        } else {
          // Fallback: use the value as the category name
          categoryName = value?.toString() || 'Unknown';
        }
      }
      
      filterValue = {
        accessor: 'category',
        filterColumn: filterColumn,
        category: categoryName,
        value: value,
        seriesName: event.seriesName
      };
    }
    // For line charts
    else if (event.seriesType === 'line') {
      filterValue = {
        accessor: 'series',
        filterColumn: filterColumn,
        series: event.seriesName || (clickedData && typeof clickedData === 'object' ? clickedData.name : null),
        value: clickedData && typeof clickedData === 'object' ? clickedData.value : clickedData,
        xAxis: clickedData && Array.isArray(clickedData) ? clickedData[0]?.toString() : null,
        yAxis: clickedData && Array.isArray(clickedData) ? clickedData[1]?.toString() : null
      };
    }
    // For scatter plots
    else if (event.seriesType === 'scatter' && clickedData && typeof clickedData === 'object' && clickedData.value && Array.isArray(clickedData.value)) {
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
    else if (clickedData && typeof clickedData === 'object') {
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
    } else {
      return null;
    }

    return filterValue.accessor !== 'unknown' ? filterValue : null;
  }

  /**
   * Resize chart to fit container properly
   */
  resizeChart(): void {
    if (this.widget?.chartInstance && !this.disposed) {
      try {
        if (!this.widget.chartInstance.isDisposed()) {
          this.widget.chartInstance.resize();
        }
      } catch (error) {
        console.error('Error resizing chart:', error);
      }
    }
  }

  /**
   * Force chart update when widget data changes
   */
  forceChartUpdate(): void {
    if (this.widget?.chartInstance && !this.disposed) {
      const now = Date.now();
      // Throttle updates to prevent conflicts (minimum 100ms between updates)
      if (now - this.lastUpdateTime < 100) {
        return;
      }
      this.lastUpdateTime = now;
      
      try {
        if (!this.widget.chartInstance.isDisposed()) {
          this.widget.chartInstance.setOption(this.chartOptions, false); // Use merge mode
          // Also resize after updating to ensure proper fit
          setTimeout(() => this.resizeChart(), 50);
        }
      } catch (error) {
        console.error('Error updating chart:', error);
      }
    }
    // Force change detection
    if (!this.disposed) {
      this.cdr.detectChanges();
    }
  }
}
