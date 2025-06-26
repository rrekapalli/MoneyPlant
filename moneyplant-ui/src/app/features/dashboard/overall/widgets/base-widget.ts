import { IWidget, FilterService, IFilterValues } from '@dashboards/public-api';
import { DashboardDataRow } from './dashboard-data';

/**
 * Configuration interface for widget creation
 */
export interface WidgetConfig {
  id?: string;
  header: string;
  position: { x: number; y: number; cols: number; rows: number };
  filterColumn?: string;
  colors?: string[];
  updateOnDataChange?: boolean;
}

/**
 * Widget data transformation interface
 */
export interface DataTransformation<T> {
  transform(data: DashboardDataRow[]): T;
  validate?(data: T): boolean;
}

/**
 * Abstract base class for dashboard widgets providing common functionality
 */
export abstract class BaseWidget<TData = any> {
  protected widget: IWidget | null = null;
  protected retryAttempts = 0;
  protected maxRetryAttempts = 10;
  protected filterService?: FilterService;

  constructor(
    protected config: WidgetConfig,
    protected dataTransformation: DataTransformation<TData>
  ) {}

  /**
   * Abstract method for creating the specific widget type
   * Must be implemented by concrete widget classes
   */
  protected abstract createWidget(data: TData): IWidget;

  /**
   * Abstract method for updating widget data
   * Must be implemented by concrete widget classes
   */
  protected abstract updateWidgetData(widget: IWidget, data: TData): void;

  /**
   * Create the widget with initial data
   */
  public create(initialData?: DashboardDataRow[]): IWidget {
    const transformedData = initialData 
      ? this.dataTransformation.transform(initialData)
      : this.getDefaultData();

    // Validate data if validation is provided
    if (this.dataTransformation.validate && !this.dataTransformation.validate(transformedData)) {
      console.warn(`Invalid data for widget: ${this.config.header}`);
    }

    this.widget = this.createWidget(transformedData);
    
    // Set common configurations
    this.applyCommonConfiguration();
    
    return this.widget;
  }

  /**
   * Update widget with new data, applying filters if available
   */
  public updateData(newData?: DashboardDataRow[], filterService?: FilterService): void {
    if (!this.widget) {
      console.error(`Widget ${this.config.header} not initialized`);
      return;
    }

    let data = newData || [];
    
    // Apply filters if filter service is provided and no explicit data is given
    if (!newData && filterService) {
      const currentFilters = filterService.getFilterValues();
      if (currentFilters.length > 0) {
        data = filterService.applyFiltersToData(data, currentFilters);
      }
    }

    const transformedData = this.dataTransformation.transform(data);

    // Validate data if validation is provided
    if (this.dataTransformation.validate && !this.dataTransformation.validate(transformedData)) {
      console.warn(`Invalid data for widget update: ${this.config.header}`);
      return;
    }

    this.updateWidgetData(this.widget, transformedData);
    this.handleChartUpdate();
  }

  /**
   * Get widget instance
   */
  public getWidget(): IWidget | null {
    return this.widget;
  }

  /**
   * Set filter service for this widget
   */
  public setFilterService(filterService: FilterService): void {
    this.filterService = filterService;
  }

  /**
   * Create filter from click data (can be overridden by specific widgets)
   */
  public createFilter(clickedData: any): IFilterValues | null {
    if (!clickedData || !this.config.filterColumn) {
      return null;
    }

    return {
      accessor: this.config.filterColumn,
      filterColumn: this.config.filterColumn,
      [this.config.filterColumn]: clickedData.name || clickedData.value,
      value: clickedData.name || clickedData.value,
      percentage: clickedData.value?.toString() || '0'
    };
  }

  /**
   * Get default data (can be overridden by specific widgets)
   */
  protected getDefaultData(): TData {
    return this.dataTransformation.transform([]);
  }

  /**
   * Apply common widget configurations
   */
  protected applyCommonConfiguration(): void {
    if (this.widget && this.config.filterColumn) {
      if (this.widget.config) {
        this.widget.config.filterColumn = this.config.filterColumn;
      }
    }
  }

  /**
   * Handle chart update with retry mechanism
   */
  protected handleChartUpdate(): void {
    if (!this.widget) return;

    if (this.widget.chartInstance) {
      try {
        this.widget.chartInstance.setOption(this.widget.config?.options as any, true);
        this.retryAttempts = 0; // Reset on success
      } catch (error) {
        console.error(`Error updating ${this.config.header} chart:`, error);
      }
    } else {
      // Retry mechanism for when chart instance is not yet available
      this.retryChartUpdate();
    }
  }

  /**
   * Retry chart update with exponential backoff
   */
  private retryChartUpdate(): void {
    this.retryAttempts++;
    
    if (this.widget?.chartInstance) {
      try {
        this.widget.chartInstance.setOption(this.widget.config?.options as any, true);
        this.retryAttempts = 0; // Reset on success
        return;
      } catch (error) {
        console.error(`Error updating ${this.config.header} chart on retry:`, error);
      }
    }
    
    if (this.retryAttempts < this.maxRetryAttempts) {
      const delay = Math.min(500 * Math.pow(1.5, this.retryAttempts - 1), 2000);
      setTimeout(() => this.retryChartUpdate(), delay);
    } else {
      console.error(`Max retry attempts reached for ${this.config.header} chart update`);
      this.retryAttempts = 0; // Reset for future attempts
    }
  }

  /**
   * Simulate API call for updated data (can be overridden)
   */
  public async getUpdatedData(): Promise<DashboardDataRow[]> {
    // Default implementation with delay simulation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  }

  /**
   * Get alternative data for testing (can be overridden)
   */
  public getAlternativeData(): DashboardDataRow[] {
    return [];
  }
}

/**
 * Factory class for creating widgets with consistent patterns
 */
export class WidgetFactory {
  /**
   * Create multiple widgets from configurations
   */
  static createWidgets<T extends BaseWidget<any>>(
    widgetClasses: Array<new (...args: any[]) => T>,
    configurations: any[],
    initialData?: DashboardDataRow[]
  ): IWidget[] {
    if (widgetClasses.length !== configurations.length) {
      throw new Error('Number of widget classes must match number of configurations');
    }

    return widgetClasses.map((WidgetClass, index) => {
      const widget = new WidgetClass(configurations[index]);
      return widget.create(initialData);
    });
  }

  /**
   * Create widget with common error handling
   */
  static createWidgetSafely<T extends BaseWidget<any>>(
    WidgetClass: new (...args: any[]) => T,
    config: any,
    initialData?: DashboardDataRow[]
  ): IWidget | null {
    try {
      const widget = new WidgetClass(config);
      return widget.create(initialData);
    } catch (error) {
      console.error(`Failed to create widget: ${config.header}`, error);
      return null;
    }
  }
} 