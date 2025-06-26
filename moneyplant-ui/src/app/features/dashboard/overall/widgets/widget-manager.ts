import { Injectable } from '@angular/core';
import { IWidget, FilterService } from '@dashboards/public-api';
import { BaseWidget, WidgetFactory } from './base-widget';
import { DashboardDataRow, INITIAL_DASHBOARD_DATA } from './dashboard-data';
import { 
  AssetAllocationWidget, 
  PortfolioPerformanceWidget, 
  MonthlyIncomeExpensesWidget, 
  RiskReturnWidget 
} from './chart-widgets';

/**
 * Widget registry for managing widget types and their configurations
 */
export interface WidgetRegistration {
  id: string;
  name: string;
  description: string;
  widgetClass: new (...args: any[]) => BaseWidget<any>;
  defaultConfig: any;
  category: 'chart' | 'tile' | 'filter' | 'utility';
}

/**
 * Service for managing dashboard widgets with the new architecture
 */
@Injectable({
  providedIn: 'root'
})
export class WidgetManager {
  private widgets: Map<string, BaseWidget<any>> = new Map();
  private widgetRegistry: Map<string, WidgetRegistration> = new Map();
  private dashboardData: DashboardDataRow[] = [...INITIAL_DASHBOARD_DATA];

  constructor() {
    this.registerDefaultWidgets();
  }

  /**
   * Register default widget types
   */
  private registerDefaultWidgets(): void {
    const registrations: WidgetRegistration[] = [
      {
        id: 'asset-allocation',
        name: 'Asset Allocation',
        description: 'Pie chart showing portfolio asset allocation',
        widgetClass: AssetAllocationWidget,
        defaultConfig: {
          header: 'Asset Allocation',
          position: { x: 0, y: 0, cols: 4, rows: 8 }
        },
        category: 'chart'
      },
      {
        id: 'portfolio-performance', 
        name: 'Portfolio Performance',
        description: 'Line chart showing portfolio performance over time',
        widgetClass: PortfolioPerformanceWidget,
        defaultConfig: {
          header: 'Portfolio Performance',
          position: { x: 0, y: 4, cols: 6, rows: 4 }
        },
        category: 'chart'
      },
      {
        id: 'monthly-income-expenses',
        name: 'Monthly Income vs Expenses',
        description: 'Bar chart comparing monthly income and expenses',
        widgetClass: MonthlyIncomeExpensesWidget,
        defaultConfig: {
          header: 'Monthly Income vs Expenses',
          position: { x: 4, y: 0, cols: 6, rows: 4 }
        },
        category: 'chart'
      },
      {
        id: 'risk-return',
        name: 'Risk vs Return Analysis',
        description: 'Scatter chart analyzing risk vs return for assets',
        widgetClass: RiskReturnWidget,
        defaultConfig: {
          header: 'Risk vs Return Analysis',
          position: { x: 6, y: 4, cols: 6, rows: 4 }
        },
        category: 'chart'
      }
    ];

    registrations.forEach(reg => this.widgetRegistry.set(reg.id, reg));
  }

  /**
   * Create a widget instance
   */
  createWidget(
    registrationId: string, 
    customConfig?: any, 
    instanceId?: string
  ): IWidget | null {
    const registration = this.widgetRegistry.get(registrationId);
    if (!registration) {
      console.error(`Widget registration not found: ${registrationId}`);
      return null;
    }

    const id = instanceId || `${registrationId}-${Date.now()}`;
    const config = { ...registration.defaultConfig, ...customConfig };

    try {
      const widgetInstance = new registration.widgetClass(config);
      const widget = widgetInstance.create(this.dashboardData);
      
      this.widgets.set(id, widgetInstance);
      return widget;
    } catch (error) {
      console.error(`Failed to create widget: ${registrationId}`, error);
      return null;
    }
  }

  /**
   * Create multiple widgets from a configuration array
   */
  createWidgets(configurations: Array<{
    registrationId: string;
    config?: any;
    instanceId?: string;
  }>): IWidget[] {
    return configurations
      .map(({ registrationId, config, instanceId }) => 
        this.createWidget(registrationId, config, instanceId)
      )
      .filter(widget => widget !== null) as IWidget[];
  }

  /**
   * Update a specific widget with new data
   */
  updateWidget(
    instanceId: string, 
    newData?: DashboardDataRow[], 
    filterService?: FilterService
  ): void {
    const widgetInstance = this.widgets.get(instanceId);
    if (widgetInstance) {
      widgetInstance.updateData(newData || this.dashboardData, filterService);
    } else {
      console.warn(`Widget instance not found: ${instanceId}`);
    }
  }

  /**
   * Update all widgets with new data
   */
  updateAllWidgets(
    newData?: DashboardDataRow[], 
    filterService?: FilterService
  ): void {
    const dataToUse = newData || this.dashboardData;
    this.widgets.forEach(widget => {
      widget.updateData(dataToUse, filterService);
    });
  }

  /**
   * Get widget instance
   */
  getWidgetInstance(instanceId: string): BaseWidget<any> | undefined {
    return this.widgets.get(instanceId);
  }

  /**
   * Get all available widget registrations
   */
  getAvailableWidgets(): WidgetRegistration[] {
    return Array.from(this.widgetRegistry.values());
  }

  /**
   * Get widgets by category
   */
  getWidgetsByCategory(category: string): WidgetRegistration[] {
    return Array.from(this.widgetRegistry.values())
      .filter(reg => reg.category === category);
  }

  /**
   * Register a new widget type
   */
  registerWidget(registration: WidgetRegistration): void {
    this.widgetRegistry.set(registration.id, registration);
  }

  /**
   * Remove a widget instance
   */
  removeWidget(instanceId: string): void {
    this.widgets.delete(instanceId);
  }

  /**
   * Update dashboard data
   */
  setDashboardData(newData: DashboardDataRow[]): void {
    this.dashboardData = [...newData];
  }

  /**
   * Get current dashboard data
   */
  getDashboardData(): DashboardDataRow[] {
    return [...this.dashboardData];
  }

  /**
   * Create a default dashboard layout
   */
  createDefaultDashboard(): IWidget[] {
    const defaultConfigurations = [
      {
        registrationId: 'asset-allocation',
        instanceId: 'default-asset-allocation'
      },
      {
        registrationId: 'monthly-income-expenses',
        instanceId: 'default-monthly-income-expenses'
      },
      {
        registrationId: 'portfolio-performance',
        instanceId: 'default-portfolio-performance'
      },
      {
        registrationId: 'risk-return',
        instanceId: 'default-risk-return'
      }
    ];

    return this.createWidgets(defaultConfigurations);
  }

  /**
   * Simulate data refresh for all widgets
   */
  async refreshAllWidgets(): Promise<void> {
    const refreshPromises = Array.from(this.widgets.values()).map(async (widget) => {
      try {
        const newData = await widget.getUpdatedData();
        if (newData.length > 0) {
          widget.updateData(newData);
        }
      } catch (error) {
        console.error('Error refreshing widget data:', error);
      }
    });

    await Promise.all(refreshPromises);
  }

  /**
   * Get performance metrics for widget management
   */
  getPerformanceMetrics(): {
    totalWidgets: number;
    widgetTypes: number;
    memoryUsage: number;
  } {
    return {
      totalWidgets: this.widgets.size,
      widgetTypes: this.widgetRegistry.size,
      memoryUsage: this.dashboardData.length
    };
  }
} 