import { Injectable, Type } from '@angular/core';
import { IWidgetPlugin } from '../entities/IWidgetPlugin';
import { PlaceholderComponent } from '../widgets/placeholder/placeholder.component';

/**
 * Service for managing widget plugins in the dashboard framework
 * 
 * This service provides methods for registering, retrieving, and managing
 * widget plugins, making it easier to add new widget types.
 */
@Injectable({
  providedIn: 'root'
})
export class WidgetPluginService {
  private plugins: Map<string, IWidgetPlugin> = new Map();
  private componentPromises: Map<string, Promise<any>> = new Map();
  private loadedComponents: Map<string, any> = new Map();

  constructor() {
    this.registerDefaultPlugins();
  }

  /**
   * Registers a new widget plugin
   * 
   * @param plugin - The widget plugin to register
   */
  registerPlugin(plugin: IWidgetPlugin): void {
    if (this.plugins.has(plugin.type)) {
      console.warn(`Plugin with type ${plugin.type} already exists. Overwriting.`);
    }
    this.plugins.set(plugin.type, plugin);
  }

  /**
   * Gets a widget plugin by type
   * 
   * @param type - The type of the widget plugin to retrieve
   * @returns The widget plugin if found, undefined otherwise
   */
  getPlugin(type: string): IWidgetPlugin | undefined {
    return this.plugins.get(type);
  }

  /**
   * Gets all registered widget plugins
   * 
   * @returns Array of all registered widget plugins
   */
  getAllPlugins(): IWidgetPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Gets the component for a widget type
   * 
   * @param type - The type of the widget
   * @returns The component for the widget type, or a promise that resolves to the component
   */
  getComponentForType(type: string): any {
    // If the component is already loaded, return it
    if (this.loadedComponents.has(type)) {
      return this.loadedComponents.get(type);
    }

    // If the component is being loaded, return a placeholder component
    // The actual component will be loaded asynchronously
    if (!this.componentPromises.has(type)) {
      this.loadComponentForType(type);
    }

    // Return a placeholder component that will be replaced when the real component loads
    return this.getPlaceholderComponent();
  }

  /**
   * Loads a component for a widget type
   * 
   * @param type - The type of the widget
   * @returns A promise that resolves to the component
   */
  private async loadComponentForType(type: string): Promise<any> {
    if (!this.componentPromises.has(type)) {
      const promise = this.importComponentForType(type);
      this.componentPromises.set(type, promise);

      try {
        const component = await promise;
        this.loadedComponents.set(type, component);
        return component;
      } catch (error) {
        console.error(`Error loading component for type ${type}:`, error);
        this.componentPromises.delete(type);
        throw error;
      }
    }

    return this.componentPromises.get(type);
  }

  /**
   * Imports a component for a widget type
   * 
   * @param type - The type of the widget
   * @returns A promise that resolves to the component
   */
  private async importComponentForType(type: string): Promise<any> {
    switch (type) {
      case 'echart':
        const echartModule = await import('../widgets/echarts/echart.component');
        return echartModule.EchartComponent;
      case 'filter':
        const filterModule = await import('../widgets/filter/filter.component');
        return filterModule.FilterComponent;
      case 'table':
        const tableModule = await import('../widgets/table/table.component');
        return tableModule.TableComponent;
      case 'tile':
        const tileModule = await import('../widgets/tile/tile.component');
        return tileModule.TileComponent;
      case 'markdownCell':
        const markdownModule = await import('../widgets/markdown-cell/markdown-cell.component');
        return markdownModule.MarkdownCellComponent;
      case 'codeCell':
        const codeModule = await import('../widgets/code-cell/code-cell.component');
        return codeModule.CodeCellComponent;
      default:
        // Default to EChart component
        const defaultModule = await import('../widgets/echarts/echart.component');
        return defaultModule.EchartComponent;
    }
  }

  /**
   * Gets a placeholder component to use while the real component is loading
   * 
   * @returns The placeholder component type
   */
  private getPlaceholderComponent(): Type<any> {
    // Return the actual placeholder component
    return PlaceholderComponent;
  }

  /**
   * Registers the default widget plugins
   */
  private registerDefaultPlugins(): void {
    // Register EChart plugin
    this.registerPlugin({
      type: 'echart',
      displayName: 'Chart',
      description: 'Displays data using ECharts visualizations',
      icon: 'chart-bar',
      component: this.getPlaceholderComponent(), // Will be lazy loaded
      defaultConfig: {
        options: {}
      },
      supportsFiltering: true,
      canBeFilterSource: true
    });

    // Register Filter plugin
    this.registerPlugin({
      type: 'filter',
      displayName: 'Filter',
      description: 'Provides filtering capabilities for the dashboard',
      icon: 'filter',
      component: this.getPlaceholderComponent(), // Will be lazy loaded
      defaultConfig: {
        options: {
          values: []
        }
      },
      supportsFiltering: false,
      canBeFilterSource: false
    });

    // Register Table plugin
    this.registerPlugin({
      type: 'table',
      displayName: 'Table',
      description: 'Displays data in a tabular format',
      icon: 'table',
      component: this.getPlaceholderComponent(), // Will be lazy loaded
      defaultConfig: {
        options: {}
      },
      supportsFiltering: true,
      canBeFilterSource: true
    });

    // Register Tile plugin
    this.registerPlugin({
      type: 'tile',
      displayName: 'Tile',
      description: 'Displays simple metric tiles',
      icon: 'square',
      component: this.getPlaceholderComponent(), // Will be lazy loaded
      defaultConfig: {
        options: {}
      },
      supportsFiltering: false,
      canBeFilterSource: false
    });

    // Register Markdown Cell plugin
    this.registerPlugin({
      type: 'markdownCell',
      displayName: 'Markdown',
      description: 'Displays markdown content',
      icon: 'markdown',
      component: this.getPlaceholderComponent(), // Will be lazy loaded
      defaultConfig: {
        options: {
          content: ''
        }
      },
      supportsFiltering: false,
      canBeFilterSource: false
    });

    // Register Code Cell plugin
    this.registerPlugin({
      type: 'codeCell',
      displayName: 'Code',
      description: 'Displays code snippets',
      icon: 'code',
      component: this.getPlaceholderComponent(), // Will be lazy loaded
      defaultConfig: {
        options: {
          code: '',
          language: 'javascript'
        }
      },
      supportsFiltering: false,
      canBeFilterSource: false
    });

    // Don't preload components - let them be loaded on demand
    // This improves initial loading performance
  }
}
