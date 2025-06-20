import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgComponentOutlet, NgIf} from '@angular/common';
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
  imports: [NgComponentOutlet, NgIf],
  styles: [`
    .widget-error {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: rgba(255, 0, 0, 0.05);
      border: 1px solid rgba(255, 0, 0, 0.2);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      text-align: center;
      max-width: 90%;
    }

    .error-icon {
      font-size: 32px;
      margin-bottom: 12px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .error-message {
      width: 100%;
    }

    .error-message h3 {
      margin: 0 0 12px 0;
      color: #d32f2f;
      font-size: 18px;
    }

    .error-message p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .error-details {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      text-align: left;
      overflow-x: auto;
      white-space: pre-wrap;
      max-height: 150px;
      overflow-y: auto;
    }

    .details-button {
      padding: 6px 12px;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 16px;
      font-size: 12px;
    }

    .details-button:hover {
      background-color: #e0e0e0;
    }

    .retry-button {
      padding: 10px 20px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }

    .retry-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .retry-button:hover {
      background-color: #d32f2f;
    }

    .retry-button:focus {
      outline: 2px solid #f44336;
      outline-offset: 2px;
    }

    .widget-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #3498db;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: #666;
      font-size: 14px;
      animation: fadeInOut 1.5s ease-in-out infinite;
    }

    @keyframes fadeInOut {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
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

  /** Whether to show detailed error information */
  showErrorDetails = false;

  /** Default widget height in pixels */
  private defaultHeight = '300px';

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
    this.showErrorDetails = false;

    // Set loading state
    this.widget.loading = true;

    // Emit the data load event
    this.onDataLoad.emit(this.widget);

    // Also publish through the event bus
    this.eventBus.publishDataLoad(this.widget, this.widget.id);
  }

  /**
   * Gets the appropriate widget height based on the widget configuration
   * @returns A style object with the height property
   */
  getWidgetHeight(): { [key: string]: string } {
    if (!this.widget) {
      return { height: this.defaultHeight };
    }

    // Use the widget's configured height if available
    if (this.widget.config?.height) {
      return { height: `${this.widget.config.height}px` };
    }

    // Use the widget's gridster item size if available
    if (this.widget.rows) {
      // Calculate height based on rows (approximate 50px per row)
      const calculatedHeight = this.widget.rows * 50;
      return { height: `${calculatedHeight}px` };
    }

    // Fall back to default height
    return { height: this.defaultHeight };
  }

  /**
   * Gets a user-friendly error message from the widget's error object
   * @returns A formatted error message
   */
  getErrorMessage(): string {
    if (!this.widget?.error) {
      return 'An unknown error occurred';
    }

    // If the error is a string, return it directly
    if (typeof this.widget.error === 'string') {
      return this.widget.error;
    }

    // If the error has a message property, return that
    if (this.widget.error.message) {
      return this.widget.error.message;
    }

    // Try to convert the error to a string
    try {
      return JSON.stringify(this.widget.error);
    } catch {
      return 'An unknown error occurred';
    }
  }

  /**
   * Toggles the display of detailed error information
   */
  toggleErrorDetails(): void {
    this.showErrorDetails = !this.showErrorDetails;
  }
}
