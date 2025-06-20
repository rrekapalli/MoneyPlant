import {Component, OnDestroy, AfterViewInit, ElementRef, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
// Import echarts using ES module import
import * as echarts from 'echarts';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { EventBusService } from '../../services/event-bus.service';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

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
    class="echart-container"
  ></div>`,
  styles: [`
    .echart-container {
      width: 100%;
      height: 100%;
    }
  `],
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EchartComponent extends BaseWidgetComponent implements AfterViewInit, OnDestroy {
  isSingleClick: boolean = true;
  private resizeSubject = new Subject<void>();
  private resizeObserver: ResizeObserver | null = null;

  initOpts: any = {
    height: 300,
    rowHeightRatio: 0.25,
    fixedRowHeight: 30,
    width: 'auto',
    locale: 'en',
    renderer: 'canvas' // Use canvas renderer for better performance
  };

  constructor(
    protected override eventBus: EventBusService,
    private elementRef: ElementRef
  ) {
    super(eventBus);
  }

  /**
   * Gets the chart options with dataset API if available
   */
  get chartOptions(): echarts.EChartsOption {
    const options = (this.widget?.config?.options || {}) as echarts.EChartsOption;

    // Convert to dataset API if possible
    if (options.series && Array.isArray(options.series) && !options.dataset) {
      this.convertToDatasetAPI(options);
    }

    return options;
  }

  /**
   * Converts standard ECharts options to use the dataset API for better performance
   * 
   * @param options - The ECharts options to convert
   */
  private convertToDatasetAPI(options: echarts.EChartsOption): void {
    // Only convert if we have series data
    if (!options.series || !Array.isArray(options.series) || options.series.length === 0) {
      return;
    }

    // If dataset is already defined, don't override it
    if (options.dataset) {
      return;
    }

    // Handle different series types differently
    const seriesArray = options.series as any[];

    // Check if all series have the same data structure
    const allSeriesHaveSameStructure = seriesArray.every(series => 
      series.type === seriesArray[0].type && 
      Array.isArray(series.data)
    );

    if (allSeriesHaveSameStructure) {
      // For pie charts, we need a different approach
      if (seriesArray[0].type === 'pie') {
        this.convertPieChartToDataset(options, seriesArray);
        return;
      }

      // For bar and line charts with multiple series
      if (['bar', 'line'].includes(seriesArray[0].type) && seriesArray.length > 1) {
        this.convertMultiSeriesToDataset(options, seriesArray);
        return;
      }
    }

    // Default conversion for simple cases
    // Check if the first series has data
    const firstSeries = seriesArray[0];
    if (!firstSeries.data || !Array.isArray(firstSeries.data)) {
      return;
    }

    // Create dataset from the first series data
    options.dataset = {
      source: firstSeries.data
    };

    // Update series to use the dataset
    options.series = seriesArray.map((series: any) => {
      const newSeries = { ...series };

      // Keep the data reference for scatter plots which often need the original data
      if (series.type !== 'scatter') {
        delete newSeries.data;
      }

      return newSeries;
    });
  }

  /**
   * Converts pie chart data to use the dataset API
   * 
   * @param options - The ECharts options to convert
   * @param seriesArray - The array of series
   */
  private convertPieChartToDataset(options: echarts.EChartsOption, seriesArray: any[]): void {
    const firstSeries = seriesArray[0];
    if (!firstSeries.data || !Array.isArray(firstSeries.data)) {
      return;
    }

    // For pie charts, we need to keep the name property
    options.dataset = {
      source: firstSeries.data.map((item: any) => ({
        name: item.name,
        value: item.value
      }))
    };

    // Update series to use the dataset
    options.series = seriesArray.map((series: any) => {
      const newSeries = { ...series };
      delete newSeries.data;

      // Add encode property to tell ECharts how to map dataset fields
      newSeries.encode = {
        itemName: 'name',
        value: 'value'
      };

      return newSeries;
    });
  }

  /**
   * Converts multiple series data to use the dataset API
   * 
   * @param options - The ECharts options to convert
   * @param seriesArray - The array of series
   */
  private convertMultiSeriesToDataset(options: echarts.EChartsOption, seriesArray: any[]): void {
    // Extract all unique x-axis values
    const xAxisValues = new Set<string>();
    seriesArray.forEach(series => {
      if (series.data && Array.isArray(series.data)) {
        series.data.forEach((item: any) => {
          if (Array.isArray(item) && item.length >= 2) {
            xAxisValues.add(item[0].toString());
          } else if (item && item.name) {
            xAxisValues.add(item.name.toString());
          }
        });
      }
    });

    // Create a source array with all series data
    const source: any[] = [['product', ...seriesArray.map(s => s.name || `Series ${seriesArray.indexOf(s)}`)]]

    // Add data for each x-axis value
    Array.from(xAxisValues).forEach(xValue => {
      const row = [xValue];

      seriesArray.forEach(series => {
        if (series.data && Array.isArray(series.data)) {
          const dataItem = series.data.find((item: any) => 
            (Array.isArray(item) && item[0].toString() === xValue) ||
            (item && item.name && item.name.toString() === xValue)
          );

          if (dataItem) {
            row.push(Array.isArray(dataItem) ? dataItem[1] : dataItem.value);
          } else {
            row.push('');
          }
        } else {
          row.push('');
        }
      });

      source.push(row);
    });

    // Set the dataset
    options.dataset = { source };

    // Update series to use the dataset
    options.series = seriesArray.map((series: any, index: number) => {
      return {
        type: series.type,
        name: series.name,
        // Use the series index + 1 as the y-axis dimension (0 is the x-axis)
        encode: { x: 0, y: index + 1 },
        // Preserve other properties except data
        ...Object.keys(series)
          .filter(key => key !== 'data' && key !== 'type' && key !== 'name')
          .reduce((obj, key) => ({ ...obj, [key]: series[key] }), {})
      };
    });
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized
   */
  ngAfterViewInit(): void {
    // Set up resize handling
    this.setupResizeHandling();

    // Set up window resize listener
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.resizeChart();
      });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed
   */
  override ngOnDestroy(): void {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clean up resize subject
    this.resizeSubject.complete();

    // Call parent ngOnDestroy
    super.ngOnDestroy();
  }

  /**
   * Sets up resize handling for the chart
   */
  private setupResizeHandling(): void {
    // Use ResizeObserver if available
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        this.resizeSubject.next();
      });

      const container = this.elementRef.nativeElement.querySelector('.echart-container');
      if (container) {
        this.resizeObserver.observe(container);
      }

      // Debounce resize events
      this.resizeSubject
        .pipe(
          debounceTime(100),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.resizeChart();
        });
    }
  }

  /**
   * Resizes the chart to fit its container
   * Uses requestAnimationFrame for better performance
   */
  private resizeChart(): void {
    if (this.widget?.chartInstance) {
      // Use requestAnimationFrame to optimize resize performance
      // This ensures the resize happens during the next animation frame
      // which prevents multiple resize calls in the same frame
      requestAnimationFrame(() => {
        if (this.widget?.chartInstance) {
          // Get the container dimensions
          const container = this.elementRef.nativeElement.querySelector('.echart-container');
          if (container) {
            const { width, height } = container.getBoundingClientRect();

            // Only resize if dimensions are valid (non-zero)
            if (width > 0 && height > 0) {
              this.widget.chartInstance.resize({
                width: width,
                height: height
              });
            }
          } else {
            // Fallback to auto-resize if container not found
            this.widget.chartInstance.resize();
          }
        }
      });
    }
  }

  /**
   * Initializes the chart instance
   * 
   * @param instance - The ECharts instance
   */
  onChartInit(instance: any) {
    if (this.widget && instance) {
      this.widget.chartInstance = instance as echarts.ECharts;

      // Set chart theme and renderer options
      instance.setOption({
        backgroundColor: 'transparent',
        textStyle: {
          fontFamily: 'Arial, sans-serif'
        }
      }, false, false);

      // Load data after a short delay to ensure the chart is ready
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

    // Resize the chart to ensure it fits properly
    setTimeout(() => {
      this.resizeChart();
    }, 0);
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
