import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  computed,
  effect,
  OnDestroy,
} from '@angular/core';
import {CommonModule, NgComponentOutlet} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {EchartComponent} from '../echarts/echart.component';
import {FilterComponent} from '../filter/filter.component';
import {TileComponent} from '../tile/tile.component';
import {TableComponent} from '../table/table.component';
import {MarkdownCellComponent} from '../markdown-cell/markdown-cell.component';
import {CodeCellComponent} from '../code-cell/code-cell.component';
import {IFilterValues} from '../../entities/IFilterValues';
import { provideEchartsCore } from 'ngx-echarts';
import {ITableOptions} from '../../entities/ITableOptions';

/**
 * Factory function to determine the appropriate component based on widget type
 * @param widget - Widget configuration to determine component for
 * @returns Component class to render
 */
const onGetWidget = (widget: IWidget) => {
  switch (widget?.config?.component) {
    case 'echart':
      return EchartComponent;
    case 'filter':
      return FilterComponent;
    case 'table':
      return TableComponent;
    case 'tile':
      return TileComponent;
    case 'markdownCell':
      return MarkdownCellComponent;
    case 'codeCell':
      return CodeCellComponent;
    default:
      return EchartComponent;
  }
};

/**
 * Generic widget component that dynamically renders different widget types
 * based on the widget configuration. Supports echart, filter, table, tile,
 * markdown cell, and code cell components.
 */
@Component({
  selector: 'vis-widget',
  standalone: true,
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  imports: [
    CommonModule,
    NgComponentOutlet,
    EchartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideEchartsCore({
      echarts: () => import('echarts'),
    })
  ]
})
export class WidgetComponent implements OnInit, OnDestroy {
  
  // Signal-based properties (protected for template access)
  protected widgetSignal = signal<IWidget | null>(null);
  protected filterValuesSignal = signal<IFilterValues[]>([]);
  protected chartHeightSignal = signal<number>(300);
  protected viewModeSignal = signal<'chart' | 'table'>('chart');

  // Computed values (public for template access)
  public readonly hasValidWidget = computed(() => !!this.widgetSignal());
  public readonly componentType = computed(() => this.widgetSignal()?.config?.component || '');
  public readonly widgetTitle = computed(() => this.widgetSignal()?.config?.header?.title || '');
  public readonly isChartWidget = computed(() => {
    const component = this.componentType();
    return component === 'echart' || component === 'chart';
  });
  public readonly isFilterWidget = computed(() => this.componentType() === 'filter');
  public readonly isTileWidget = computed(() => this.componentType() === 'tile');
  public readonly isTableWidget = computed(() => this.componentType() === 'table');
  public readonly isMarkdownWidget = computed(() => this.componentType() === 'markdown');
  public readonly isCodeWidget = computed(() => this.componentType() === 'code');

  // Legacy Input/Output for backward compatibility
  @Input() set widget(value: IWidget) {
    this.widgetSignal.set(value);
  }
  get widget(): IWidget | null {
    return this.widgetSignal();
  }

  @Input() set filterValues(value: IFilterValues[]) {
    this.filterValuesSignal.set(value || []);
  }
  get filterValues(): IFilterValues[] {
    return this.filterValuesSignal();
  }

  @Input() set chartHeight(value: number) {
    this.chartHeightSignal.set(value || 300);
  }
  get chartHeight(): number {
    return this.chartHeightSignal();
  }

  @Input() set viewMode(value: 'chart' | 'table') {
    this.viewModeSignal.set(value || 'chart');
  }
  get viewMode(): 'chart' | 'table' {
    return this.viewModeSignal();
  }

  @Output() updateWidget = new EventEmitter<IWidget>();
  @Output() toggleViewMode = new EventEmitter<{widgetId: string, viewMode: 'chart' | 'table'}>();

  constructor(private cdr: ChangeDetectorRef) {
    // Effects for reactive updates

    effect(() => {
      // Trigger change detection when signals change
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Initialize widget if needed
    const widget = this.widgetSignal();
    if (widget) {
      this.handleDataLoad();
    }
  }

  ngOnDestroy(): void {
    // Cleanup any resources if needed
  }

  /**
   * Handle data loading for the widget
   */
  handleDataLoad(): void {
    // Data loading is now handled automatically via signals
    // No need to emit events
  }

  /**
   * Handle widget updates
   */
  handleUpdateWidget(): void {
    const widget = this.widgetSignal();
    if (widget) {
      this.updateWidget.emit(widget);
    }
  }

  /**
   * Handle filter updates
   */
  handleUpdateFilter(event: any): void {
    // Filter updates are now handled directly by the FilterService
    // No need to emit events
  }

  /**
   * Handle view mode toggle
   */
  onToggleViewMode(newViewMode: 'chart' | 'table'): void {
    const widget = this.widgetSignal();
    if (widget) {
      this.viewModeSignal.set(newViewMode);
      this.toggleViewMode.emit({
        widgetId: widget.id,
        viewMode: newViewMode
      });
    }
  }

  /**
   * Get widget configuration options
   */
  getWidgetOptions(): any {
    return this.widgetSignal()?.config?.options || {};
  }

  /**
   * Get widget data
   */
  getWidgetData(): any {
    return this.widgetSignal()?.data || null;
  }

  /**
   * Get widget series
   */
  getWidgetSeries(): any[] {
    return this.widgetSignal()?.series || [];
  }

  /**
   * Check if widget has data
   */
  hasData(): boolean {
    const widget = this.widgetSignal();
    return !!(widget?.data || widget?.series?.length);
  }

  /**
   * Get computed chart height based on widget size
   */
  getComputedChartHeight(): number {
    const widget = this.widgetSignal();
    
    if (widget?.position) {
      const rows = widget.position.rows || 1;
      
      // Calculate height based on gridster row height (50px per row)
      const gridRowHeight = 50; // This should match the fixedRowHeight in gridster config
      const headerHeight = widget.config?.header ? 40 : 10; // Height for widget header if present
      const padding = 10; // Additional padding
      
      const calculatedHeight = (rows * gridRowHeight) - headerHeight - padding;
      
      // Different minimum heights based on widget type
      const componentType = widget.config?.component;
      let minHeight = 50; // Default minimum
      
      if (componentType === 'echart' || componentType === 'chart') {
        minHeight = 200; // Charts need more space
      } else if (componentType === 'tile') {
        minHeight = 80; // Tiles can be smaller
      } else if (componentType === 'filter') {
        minHeight = 40; // Filters are very compact
      }
      
      return Math.max(calculatedHeight, minHeight);
    }
    
    // Fallback to signal value or default
    return this.chartHeightSignal() || 300;
  }

  /**
   * Get current widget for template
   */
  getCurrentWidget(): IWidget | null {
    return this.widgetSignal();
  }

  /**
   * Get component configuration for dynamic rendering (for non-chart components)
   */
  getComponentForWidget(): { component: any; inputs: any } | null {
    const widget = this.getCurrentWidget();
    if (!widget || this.isChartWidget()) {
      return null;
    }

    return {
      component: onGetWidget(widget),
      inputs: {
        widget: widget,
        // No need for event emitters with signal-based architecture
      },
    };
  }
}
