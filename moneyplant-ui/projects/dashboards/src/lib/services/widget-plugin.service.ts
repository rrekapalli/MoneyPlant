import { Injectable } from '@angular/core';
import { IWidgetPlugin } from '../entities/IWidgetPlugin';
import { EchartComponent } from '../widgets/echarts/echart.component';
import { FilterComponent } from '../widgets/filter/filter.component';
import { TableComponent } from '../widgets/table/table.component';
import { TileComponent } from '../widgets/tile/tile.component';
import { MarkdownCellComponent } from '../widgets/markdown-cell/markdown-cell.component';
import { CodeCellComponent } from '../widgets/code-cell/code-cell.component';

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
   * @returns The component for the widget type, or a default component if not found
   */
  getComponentForType(type: string): any {
    const plugin = this.plugins.get(type);
    return plugin ? plugin.component : EchartComponent; // Default to EchartComponent if not found
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
      component: EchartComponent,
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
      component: FilterComponent,
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
      component: TableComponent,
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
      component: TileComponent,
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
      component: MarkdownCellComponent,
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
      component: CodeCellComponent,
      defaultConfig: {
        options: {
          code: '',
          language: 'javascript'
        }
      },
      supportsFiltering: false,
      canBeFilterSource: false
    });
  }
}