import { Component, OnInit, OnDestroy } from '@angular/core';
import { IWidget, FilterService } from '@dashboards/public-api';
import { WidgetManager } from './widget-manager';
import { DashboardDataRow } from './dashboard-data';
import { Subject, takeUntil } from 'rxjs';

/**
 * Example component showing how to use the new widget architecture
 */
@Component({
  selector: 'app-dashboard-example',
  template: `
    <div class="dashboard-container">
      <!-- Widget performance metrics -->
      <div class="metrics-bar">
        <span>Widgets: {{metrics.totalWidgets}}</span>
        <span>Types: {{metrics.widgetTypes}}</span>
        <span>Data Points: {{metrics.memoryUsage}}</span>
        <button (click)="refreshAllWidgets()" [disabled]="isRefreshing">
          {{isRefreshing ? 'Refreshing...' : 'Refresh All'}}
        </button>
      </div>

      <!-- Widget selection panel -->
      <div class="widget-panel">
        <h3>Available Widgets</h3>
        <div class="widget-list">
          <div *ngFor="let registration of availableWidgets" 
               class="widget-item"
               (click)="addWidget(registration.id)">
            <h4>{{registration.name}}</h4>
            <p>{{registration.description}}</p>
            <span class="category">{{registration.category}}</span>
          </div>
        </div>
      </div>

      <!-- Dashboard grid (this would be your actual dashboard component) -->
      <div class="dashboard-grid">
        <div *ngFor="let widget of widgets" class="widget-container">
          <!-- Widget would be rendered here -->
          <h4>{{widget.config?.header}}</h4>
          <div>Position: {{widget.config?.position | json}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .metrics-bar {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }

    .widget-panel {
      padding: 1rem;
      border-bottom: 1px solid #ddd;
      max-height: 200px;
      overflow-y: auto;
    }

    .widget-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .widget-item {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .widget-item:hover {
      background-color: #f0f0f0;
    }

    .category {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: #007bff;
      color: white;
      border-radius: 12px;
      font-size: 0.75rem;
    }

    .dashboard-grid {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
    }

    .widget-container {
      margin-bottom: 1rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class DashboardExampleComponent implements OnInit, OnDestroy {
  widgets: IWidget[] = [];
  availableWidgets: any[] = [];
  metrics = { totalWidgets: 0, widgetTypes: 0, memoryUsage: 0 };
  isRefreshing = false;

  private destroy$ = new Subject<void>();

  constructor(
    private widgetManager: WidgetManager,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.initializeDashboard();
    this.loadAvailableWidgets();
    this.updateMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize dashboard with default widgets
   */
  private initializeDashboard(): void {
    try {
      // Create default dashboard layout
      this.widgets = this.widgetManager.createDefaultDashboard();
      console.log(`Created ${this.widgets.length} default widgets`);
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  }

  /**
   * Load available widget types
   */
  private loadAvailableWidgets(): void {
    this.availableWidgets = this.widgetManager.getAvailableWidgets();
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    this.metrics = this.widgetManager.getPerformanceMetrics();
  }

  /**
   * Add a new widget to the dashboard
   */
  addWidget(registrationId: string): void {
    try {
      // Generate a unique instance ID
      const instanceId = `${registrationId}-${Date.now()}`;
      
      // Create custom configuration (could be based on available space)
      const customConfig = {
        position: this.calculateNextPosition()
      };

      const newWidget = this.widgetManager.createWidget(
        registrationId, 
        customConfig, 
        instanceId
      );

      if (newWidget) {
        this.widgets.push(newWidget);
        this.updateMetrics();
        console.log(`Added widget: ${registrationId}`);
      }
    } catch (error) {
      console.error(`Failed to add widget: ${registrationId}`, error);
    }
  }

  /**
   * Refresh all widgets with new data
   */
  async refreshAllWidgets(): Promise<void> {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    try {
      await this.widgetManager.refreshAllWidgets();
      console.log('All widgets refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh widgets:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Update widgets with new data
   */
  updateWidgetsWithNewData(newData: DashboardDataRow[]): void {
    try {
      this.widgetManager.setDashboardData(newData);
      this.widgetManager.updateAllWidgets(newData, this.filterService);
      console.log('Widgets updated with new data');
    } catch (error) {
      console.error('Failed to update widgets with new data:', error);
    }
  }

  /**
   * Apply filters to all widgets
   */
  applyFilters(): void {
    try {
      this.widgetManager.updateAllWidgets(undefined, this.filterService);
      console.log('Filters applied to all widgets');
    } catch (error) {
      console.error('Failed to apply filters:', error);
    }
  }

  /**
   * Remove a widget from the dashboard
   */
  removeWidget(widget: IWidget): void {
    try {
      const index = this.widgets.indexOf(widget);
      if (index > -1) {
        this.widgets.splice(index, 1);
        // Note: In a real implementation, you'd need to track instance IDs
        // this.widgetManager.removeWidget(instanceId);
        this.updateMetrics();
        console.log('Widget removed');
      }
    } catch (error) {
      console.error('Failed to remove widget:', error);
    }
  }

  /**
   * Get widgets by category
   */
  getWidgetsByCategory(category: string): any[] {
    return this.widgetManager.getWidgetsByCategory(category);
  }

  /**
   * Calculate next available position for new widgets
   */
  private calculateNextPosition(): { x: number; y: number; cols: number; rows: number } {
    // Simple logic - in real implementation, this would be more sophisticated
         // Simple calculation for demonstration purposes
     const usedPositions = this.widgets.length;
     const maxY = Math.floor(usedPositions / 3) * 4; // Simple grid calculation
    
    return {
      x: 0,
      y: maxY,
      cols: 4,
      rows: 4
    };
  }

  /**
   * Example of creating a custom widget configuration
   */
  createCustomAssetAllocationWidget(): void {
    const customWidget = this.widgetManager.createWidget('asset-allocation', {
      header: 'My Custom Asset Allocation',
      position: { x: 8, y: 0, cols: 6, rows: 6 },
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    });

    if (customWidget) {
      this.widgets.push(customWidget);
      this.updateMetrics();
    }
  }

  /**
   * Example of registering a completely new widget type
   */
  registerCustomWidgetType(): void {
    // This would typically be done in a module or service initialization
    /*
    this.widgetManager.registerWidget({
      id: 'custom-analytics',
      name: 'Custom Analytics Widget',
      description: 'Advanced analytics visualization',
      widgetClass: CustomAnalyticsWidget, // Your custom widget class
      defaultConfig: {
        header: 'Custom Analytics',
        position: { x: 0, y: 0, cols: 8, rows: 6 }
      },
      category: 'chart'
    });
    */
  }

  /**
   * Example of handling widget events (like click events for filtering)
   */
  onWidgetClick(widget: IWidget, clickData: any): void {
    try {
      // Get the widget instance to create filters
      const widgetInstance = this.widgetManager.getWidgetInstance('widget-instance-id');
      if (widgetInstance) {
        const filter = widgetInstance.createFilter(clickData);
                 if (filter) {
           // Add filter and update all widgets
           // Note: The actual FilterService method name may be different
           // this.filterService.addFilter(filter);
           this.applyFilters();
         }
      }
    } catch (error) {
      console.error('Failed to handle widget click:', error);
    }
  }
} 