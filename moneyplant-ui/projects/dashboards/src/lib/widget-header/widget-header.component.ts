import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IWidget} from '../entities/IWidget';
import {PanelModule} from 'primeng/panel';
import {SidebarModule} from 'primeng/sidebar';
import {WidgetConfigComponent} from '../widget-config/widget-config.component';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';  

@Component({
  selector: 'vis-widget-header',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    PanelModule,
    WidgetConfigComponent,
    ButtonModule,
  ],
  templateUrl: './widget-header.component.html',
  styleUrls: ['./widget-header.component.css'],
})
export class WidgetHeaderComponent {
  @Input() widget!: IWidget;
  @Output() onUpdateWidget: EventEmitter<IWidget> = new EventEmitter();
  @Output() onDeleteWidget: EventEmitter<IWidget> = new EventEmitter();
  @Input() onEditMode: boolean = true;
  @Input() dashboardId:any;

  sidebarVisible: boolean = false;

  get title() {
    return this.widget?.config?.header?.title;
  }

  onUpdateOptions(data: IWidget) {
    this.onUpdateWidget.emit(data);
    this.sidebarVisible = false;
  }

  onEditModeClicked() {
    this.onEditMode = !this.onEditMode;
  }

  onDeleteWidgetClicked(event: any) {
    this.onDeleteWidget.emit(this.widget);
  }

}
