import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {WidgetPluginService} from '../../services/widget-plugin.service';

/**
 * A dynamic widget component that renders different widget types based on configuration
 */
@Component({
  selector: 'vis-widget',
  standalone: true,
  templateUrl:'./widget.component.html',
  imports: [NgComponentOutlet],
})
export class WidgetComponent {
  /** The widget configuration */
  @Input() widget!: IWidget;

  /** Event emitted when data needs to be loaded for the widget */
  @Output() onDataLoad: EventEmitter<IWidget> = new EventEmitter();

  /** Event emitted when filter values are updated */
  @Output() onUpdateFilter: EventEmitter<any> = new EventEmitter();

  constructor(private widgetPluginService: WidgetPluginService) {}

  /**
   * Gets the current widget component and its inputs
   * @returns An object containing the component type and inputs
   */
  get currentWidget() {
    return {
      component: this.widgetPluginService.getComponentForType(this.widget?.config?.component || ''),
      inputs: {
        widget: this.widget,
        onDataLoad: this.onDataLoad,
        onUpdateFilter: this.onUpdateFilter,
      },
    };
  }

  /**
   * Checks if the current widget is an EChart component
   * @returns True if the current widget is an EChart component
   */
  get isEchartComponent(): boolean {
    return this.widget?.config?.component === 'echart';
  }
}
