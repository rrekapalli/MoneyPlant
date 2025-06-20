import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {WidgetPluginService} from '../../services/widget-plugin.service';
import {EventBusService} from '../../services/event-bus.service';

/**
 * A dynamic widget component that renders different widget types based on configuration
 */
@Component({
  selector: 'vis-widget',
  standalone: true,
  templateUrl:'./widget.component.html',
  imports: [NgComponentOutlet],
  styles: [`
    .widget-error {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: rgba(255, 0, 0, 0.05);
      border: 1px solid rgba(255, 0, 0, 0.2);
      border-radius: 4px;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      text-align: center;
    }

    .error-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .error-message h3 {
      margin: 0 0 8px 0;
      color: #d32f2f;
    }

    .error-message p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .retry-button {
      padding: 8px 16px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .retry-button:hover {
      background-color: #d32f2f;
    }

    .widget-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.02);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #3498db;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: #666;
    }
  `]
})
export class WidgetComponent {
  /** The widget configuration */
  @Input() widget!: IWidget;

  /** Event emitted when data needs to be loaded for the widget */
  @Output() onDataLoad: EventEmitter<IWidget> = new EventEmitter();

  /** Event emitted when filter values are updated */
  @Output() onUpdateFilter: EventEmitter<any> = new EventEmitter();

  constructor(
    private widgetPluginService: WidgetPluginService,
    private eventBus: EventBusService
  ) {}

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

  /**
   * Retries loading the widget data after an error
   */
  retryLoad(): void {
    if (!this.widget) {
      return;
    }

    // Clear the error state
    this.widget.error = null;

    // Set loading state
    this.widget.loading = true;

    // Emit the data load event
    this.onDataLoad.emit(this.widget);

    // Also publish through the event bus
    this.eventBus.publishDataLoad(this.widget, this.widget.id);
  }
}
