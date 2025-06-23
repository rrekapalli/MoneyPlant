import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IWidget} from '../entities/IWidget';
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core';
import {FormlyPrimeNGModule} from '@ngx-formly/primeng';
import {TabMenuModule} from 'primeng/tabmenu';
import {CommonModule} from '@angular/common';
import {MenuItem} from 'primeng/api';
// import { formOptions } from './options';
import {merge} from 'lodash';
import {VisStorybookModule,MessageService} from 'vis-storybook';
import {dataOptions} from '../formly-configs/series-options';
import {formOptions} from '../formly-configs/form-options';
import {set} from 'lodash-es';
import { DashboardApi } from 'vis-services';
import _ from 'lodash';

@Component({
  selector: 'vis-widget-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyPrimeNGModule,
    TabMenuModule,
    VisStorybookModule,
  ],
  providers: [MessageService],
  templateUrl: './widget-config.component.html',
  styleUrls: ['./widget-config.component.scss'],
})
export class WidgetConfigComponent {

  private readonly messageService = inject(MessageService);
  private readonly dashboardApi = inject(DashboardApi);

  sidebarVisible: boolean = true;
  private _widget!: IWidget | undefined;
  @Output() onUpdate: EventEmitter<IWidget> = new EventEmitter();
  @Input() selectedDashboardId:any;
  @Input() set widget(value: IWidget | undefined) {
    this._widget = value;

    // Patch form value after a delay!  Why is this needed?
    setTimeout(() => {
      this.formWidgetOptions.patchValue({
        position: value?.position,
        config: value?.config,
      });
    }, 1000);
  }

  formModel: any = {};

  items: MenuItem[] = [
    {label: 'Positions', value: 0},
    {label: 'Options', value: 1},
    {label: 'Data Options', value: 2},
  ];

  get title() {
    return this.widget?.config?.header?.title;
  }

  activeItem: MenuItem = this.items[0];
  formWidgetOptions = new FormGroup({});
  form = new FormGroup({});
  formSeriesOptions = new FormGroup({});

  widgetFields: FormlyFieldConfig[] = formOptions;
  seriesFields: FormlyFieldConfig[] = dataOptions;

  // formlyTabOptions: FormlyFieldConfig[] = formOptions;

  ngOnInit() {
    this.formModel = {};
  }

  onActiveTabItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  onWidgetSave() {
    const newOptions = merge(this._widget, this.formModel);
    set(newOptions, 'config.options.series', this.formModel.series);
    this.onUpdate.emit(newOptions);

    if(this._widget && !_.isEmpty(this._widget)){
      if(_.isEmpty(this._widget.series)){
        this._widget.series?.push({});
      } 
    } 

    let payload = {
      name: (this._widget?.config?.header?.title ?? this._widget?.id) ?? 'New Widget',
      category: this._widget?.config.component ?? 'BarChartVisual',
      description: this._widget?.config.component ?? 'BarChartVisual',
      placementOptions: JSON.stringify(this._widget?.position),
      chartOptions: JSON.stringify(this._widget?.config),
      otherOptions: JSON.stringify(this._widget?.series),
    };

    // Call the API to save the empty widget
    this.dashboardApi.updateByQuery(`${this.selectedDashboardId}/${this._widget?.id}/visualization`, payload)
    .subscribe({
      next: (res: any) => {
        if(res) {
          if(this._widget) {
            this._widget.id = res.id;
          }
        }
        //this.messageService.add({ severity: 'success', summary: 'SUCCESS', detail: 'Visualization created successfully', key: 'br', life: 3000 });      
      },      
      error: (error) => {
        console.log('Error creating visualization:', error);
        this.messageService.add({ severity: 'error', summary: 'ERROR', detail: 'Error creating visualization', key: 'br', life: 3000 });
      },
      complete: () => {
        this.messageService.add({ severity: 'success', summary: 'SUCCESS', detail: 'Visualization created successfully', key: 'br', life: 3000 }); 
      }
    });
  }

}
