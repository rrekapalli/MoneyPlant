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

    // Check if the first series has data
    const firstSeries = options.series[0] as any;
    if (!firstSeries.data || !Array.isArray(firstSeries.data)) {
      return;
    }

    // Create dataset from the first series data
    options.dataset = {
      source: firstSeries.data
    };

    // Update series to use the dataset
    options.series = options.series.map((series: any) => {
      const newSeries = { ...series };
      delete newSeries.data;
      return newSeries;
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
   */
  private resizeChart(): void {
    if (this.widget?.chartInstance) {
      this.widget.chartInstance.resize();
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
