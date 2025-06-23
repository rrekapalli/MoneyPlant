import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  inject,
  output,
} from '@angular/core';
import {
  GridType,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridsterItemComponentInterface,
} from 'angular-gridster2';
import {EChartsOption} from 'echarts';
import buildQuery from 'odata-query';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule} from '@angular/forms';
import {IWidget} from '../entities/IWidget';
import {WidgetComponent} from '../widgets/widget/widget.component';
import {map, find} from 'lodash-es';
import {WidgetHeaderComponent} from '../widget-header/widget-header.component';
import {MenuItem, MessageService, VisStorybookModule} from 'vis-storybook';
import _ from 'lodash';
import {IFilterOptions} from '../entities/IFilterOptions';
import {IFilterValues} from '../entities/IFilterValues';
import {v4 as uuid} from 'uuid';
import {NgxPrintModule} from 'ngx-print';
import {BrowserModule} from '@angular/platform-browser';
import {NgxPrintService, PrintOptions} from 'ngx-print';

@Component({
  selector: 'vis-dashboard-container',
  standalone: true,
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.scss'],
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    GridsterComponent,
    GridsterItemComponent,
    WidgetComponent,
    WidgetHeaderComponent,
    VisStorybookModule,
    NgxPrintModule,
    // BrowserModule
  ],
})
export class DashboardContainerComponent {
  
  private readonly messageService = inject(MessageService);

  @Input() widgets!: IWidget[];
  @Input() filterValues: IFilterValues[] = [];
  public container = DashboardContainerComponent;
  chartHeight: number = 300;
  readonly defaultChartHeight: number = 300;

  @Output() containerTouchChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() editModeStringChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() changesMade: EventEmitter<string> = new EventEmitter<string>();

  availableDashboards: any[] = [];
  //selectedDashboardId: string = '';

  @Input() dashboardId:any;

  initialWidgetData: any;
  @Input() isEditMode: boolean = false;

  onShowConfirmation: any = false;
  onShowNewDashboardDialog = false;

  static containerTouched: any;
  static editModeString = '';

  newDashboardForm!: FormGroup;

  @Input() options: GridsterConfig = {
    itemResizeCallback: DashboardContainerComponent.onWidgetResize,
    itemChangeCallback: DashboardContainerComponent.onWidgetChange
  };

  ngOnInit() {
    // Empty
  }

  async onDataLoad(widget: IWidget) {
    const filterWidget = find(
      this.widgets,
      (item: IWidget) => item.config.component === 'filter'
    );
    let widgetData: any = (widget.config.options as EChartsOption).series;
    let seriesData: any;
    this.filterValues = (filterWidget?.config?.options as IFilterOptions)?.values;
    if (widgetData) {
      if(!_.isEmpty(widgetData.series)) {
        widgetData.map((item: any) => {
          return {
            x: {
              table: {
                id: item.encode?.x?.split('.')[0],
                name: item.encode?.x?.split('.')[1],
              },
              column: {
                id: item.encode?.x?.split('.')[2],
                name: item.encode?.x?.split('.')[3],
              },
            },
            y: {
              table: {
                id: item.encode?.y?.split('.')[0],
                name: item.encode?.y?.split('.')[1],
              },
              column: {
                id: item.encode?.y?.split('.')[2],
                name: item.encode?.y?.split('.')[3],
              },
            },
          };
        });
      } else {
        widgetData.seriesData = {};
      }
    }
    widget.chartInstance?.showLoading();

    if(widget.config.events?.onChartOptions) {
      const filter = widget.config.state?.isOdataQuery === true ? this.getFilterParams() : this.filterValues 
      widget?.config?.events?.onChartOptions(widget,widget.chartInstance ?? undefined , filter  )
    }
  }

  getFilterParams() {
    let params = '';
    if (this.filterValues.length !== 0) {
      const filtersParams: any = [];
      map(this.filterValues, (item) => {
        filtersParams.push({
          [item.accessor]: item[item.accessor]
        });
      });
      const filter = {and: filtersParams};
      params = buildQuery({filter});
      params = params.replace('?$', '').replace('=', '') + '/';
    }
    return params;
  }

  onUpdateWidget(widget: IWidget) {
    const widgetsWithNewOptions = map(this.widgets, (item) =>
      item.id === widget.id ? {...widget} : item
    );
    this.widgets = widgetsWithNewOptions;
    this.widgets.forEach(widget => this.onDataLoad(widget))
  }

  static onWidgetResize(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface
  ) {
    DashboardContainerComponent.containerTouched = true;
    DashboardContainerComponent.editModeString =
      '[Edit Mode - Pending Changes]';
  }

  static onWidgetChange(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface
  ) {
    DashboardContainerComponent.containerTouched = true;
    DashboardContainerComponent.editModeString =
      '[Edit Mode - Pending Changes]';
  }

  updateString(editModeString: any) {
    this.editModeStringChange.emit(editModeString)
  }

  getEditModeString(editModeString: any) {
    // this.editModeStringChange.emit(editModeString)
    return DashboardContainerComponent.editModeString;
  }

  onUpdateFilter($event: any) {
    const filterWidget = find(
      this.widgets,
      (item: IWidget) => item.config.component === 'filter'
    );
    const newFilterWidget = {...filterWidget};
    if (newFilterWidget) {

      if(Array.isArray( $event)) {
        (newFilterWidget?.config?.options as IFilterOptions).values = $event
      }
      else if ((newFilterWidget?.config?.options as IFilterOptions).values as any) {
        (newFilterWidget?.config?.options as IFilterOptions).values?.push({
          accessor: $event.widget.config.state.accessor,
          // [$event.widget.config.state.accessor]: $event.value,
          ...$event.value
        });
      }


      this.onUpdateWidget(newFilterWidget as IWidget);
    }
  }

  onDashboardSelectionChanged($event: any) {
    return;
  }

  // Delete an existing widget, only when in Edit Model
  onDeleteWidget(widget: IWidget) {
    this.widgets.splice(this.widgets.indexOf(widget), 1);
    this.messageService.add({ severity: 'warn', summary: 'ALERT', detail: 'Widget Deleted!', key: 'br', life: 3000 });
  }

  public calculateChartHeight(cols: number, rows: number, flag: boolean = false, baseHeight: number = this.defaultChartHeight): number {
    // Base height for standard container
    const baseContainerHeight = baseHeight;
    
    // Calculate aspect ratio
    const aspectRatio = cols / rows;
    const area = cols * rows;

    // Adjust zoom based on area
    // Larger area = more zoom out (smaller zoom number)
    const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling
    
    // Apply margin reduction (2.5% top and bottom = 5% total)
    const marginReduction = 0.95; // 100% - 5%
    
    // Adjust height based on aspect ratio:
    // - Taller containers (rows > cols) get proportionally more height
    // - Wider containers (cols > rows) maintain base height
    let heightAdjustment = aspectRatio < 1 
      ? 1 / aspectRatio
      : 1;

    if(flag) {
      heightAdjustment = heightAdjustment * aspectRatio;
    }
    
    return Math.round(baseContainerHeight * heightAdjustment * marginReduction);
  }

  // Add these helper methods to your class
  public calculateMapCenter(cols: number, rows: number): number[] {
    // Base center for USA map
    const baseLongitude = -95;
    const baseLatitude = 38;
    
    // Adjust center based on aspect ratio
    const aspectRatio = cols / rows;
    
    // Adjust longitude more for wider containers
    const longitudeAdjustment = (aspectRatio > 1) ? (aspectRatio - 1) * 5 : 0;
  
    // Adjust latitude more for taller containers
    const latitudeAdjustment = (aspectRatio < 1) ? ((1 / aspectRatio) - 1) * 2 : 0;
  
    return [
      baseLongitude + longitudeAdjustment,
      baseLatitude + latitudeAdjustment
    ];
  }

  public calculateMapZoom(cols: number, rows: number): number {
    // Base zoom level
    const baseZoom = 4.0;
    
    // Calculate area of grid
    const area = cols * rows;
    
    // Adjust zoom based on area
    // Larger area = more zoom out (smaller zoom number)
    const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling
    
    // Calculate aspect ratio adjustment
    const aspectRatio = cols / rows;
    const aspectAdjustment = Math.abs(1 - aspectRatio) * 0.5;

    return baseZoom - (zoomAdjustment * 0.1) - aspectAdjustment;
  }
}
