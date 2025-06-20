import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IWidget} from '../entities/IWidget';
import {TabMenuModule} from 'primeng/tabmenu';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ButtonModule} from 'primeng/button';
import {ToastModule} from 'primeng/toast';
import {CommonModule} from '@angular/common';
import {MenuItem, MessageService} from 'primeng/api';
import {merge} from "rxjs";

@Component({
  selector: 'vis-widget-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule,
    ScrollPanelModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './widget-config.component.html',
  styleUrls: ['./widget-config.component.scss'],
})
export class WidgetConfigComponent {

  sidebarVisible: boolean = true;
  private _widget!: IWidget | undefined;
  @Output() onUpdate: EventEmitter<IWidget> = new EventEmitter();
  @Input() selectedDashboardId:any;
  @Input() set widget(value: IWidget | undefined) {
    this._widget = value;

    // Use ngZone.runOutsideAngular to avoid triggering change detection
    // This ensures the form is patched after the component is fully initialized
    queueMicrotask(() => {
      this.formWidgetOptions.patchValue({
        position: value?.position,
        config: value?.config,
      });
    });
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

  ngOnInit() {
    this.formModel = {};
  }

  onActiveTabItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  onWidgetSave() {
    // const newOptions = merge(this._widget, this.formModel);
    // set(newOptions, 'config.options.series', this.formModel.series);
    // this.onUpdate.emit(newOptions);
    //
    // if(this._widget && this._widget){
    //   if(this._widget.series && this._widget.series.length < 1){
    //     this._widget.series?.push({});
    //   }
    // }
    //
    // const payload = {
    //   name: (this._widget?.config?.header?.title ?? this._widget?.id) ?? 'New Widget',
    //   category: this._widget?.config.component ?? 'BarChartVisual',
    //   description: this._widget?.config.component ?? 'BarChartVisual',
    //   placementOptions: JSON.stringify(this._widget?.position),
    //   chartOptions: JSON.stringify(this._widget?.config),
    //   otherOptions: JSON.stringify(this._widget?.series),
    // };

    // // Call the API to save the widget
    // this.dashboardApi.updateByQuery(`${this.selectedDashboardId}/${this._widget?.id}/visualization`, payload)
    // .subscribe({
    //   next: (res: any) => {
    //     if(res && this._widget) {
    //       this._widget.id = res.id;
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error saving visualization:', error);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'ERROR',
    //       detail: 'Error saving visualization',
    //       key: 'br',
    //       life: 3000
    //     });
    //   },
    //   complete: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'SUCCESS',
    //       detail: 'Visualization saved successfully',
    //       key: 'br',
    //       life: 3000
    //     });
    //   }
    // });
  }

}
