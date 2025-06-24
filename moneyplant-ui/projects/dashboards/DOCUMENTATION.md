# Dashboards Library - Complete Code Documentation

## Overview

The Dashboards library is a comprehensive Angular-based dashboard framework that provides reusable components for creating dynamic, interactive dashboards. It supports various widget types including charts, tables, filters, and more, with a flexible grid-based layout system.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Entities & Interfaces](#entities--interfaces)
3. [Chart Builders](#chart-builders)
4. [Widget Components](#widget-components)
5. [Dashboard Container](#dashboard-container)
6. [Configuration & Formly](#configuration--formly)
7. [Builders & Utilities](#builders--utilities)

## Core Architecture

### Public API (`src/public-api.ts`)

The main entry point that exports all public components, interfaces, and utilities:

```typescript
// Components
export * from './lib/widgets/widget/widget-builder';
export * from './lib/dashboard-container/dashboard-container.component';
export * from './lib/widget-header/widget-header.component';
export * from './lib/widget-config/widget-config.component';

// Dashboard Container Builders
export * from './lib/dashboard-container';

// Config
export * from './lib/formly-configs/form-options';
export * from './lib/formly-configs/series-options';

// Entities
export * from './lib/entities/ICodeCellOptions';
export * from './lib/entities/IFilterOptions';
export * from './lib/entities/IFilterValues';
export * from './lib/entities/IMarkdownCellOptions';
export * from './lib/entities/IState';
export * from './lib/entities/ITableOptions';
export * from './lib/entities/ITileOptions';
export * from './lib/entities/IWidget';

// Chart Builders
export * from './lib/chart-builders';

// Widgets
export * from './lib/widgets/echarts/echart.component';
export * from './lib/widgets/filter/filter.component';
export * from './lib/widgets/table/table.component';
export * from './lib/widgets/tile/tile.component';
export * from './lib/widgets/markdown-cell/markdown-cell.component';
```

## Entities & Interfaces

### Core Widget Interface (`src/lib/entities/IWidget.ts`)

The main interface defining the structure of a dashboard widget:

```typescript
export interface IWidget extends GridsterItem {
  id: string;
  position: GridsterItem;
  config: {
    component?: string;
    initialState?: IState;
    state?: IState;
    header?: {
      title: string;
      options?: string[];
    };
    size?: number[];
    options: EChartsOption | IFilterOptions | ITileOptions | IMarkdownCellOptions | ICodeCellOptions | ITableOptions;
    events?: {
      onChartOptions?: (widget: IWidget, chart?: ECharts, filters?: string | IFilterValues[]) => void 
    };
  };
  series?: [{}];
  data?: any;
  chartInstance?: ECharts | null;
  height?: number;
  setData?(data: any): void;
}
```

### Widget Options Interfaces

#### Filter Options (`src/lib/entities/IFilterOptions.ts`)
```typescript
export interface IFilterOptions {
  values: IFilterValues[];
}
```

#### Filter Values (`src/lib/entities/IFilterValues.ts`)
```typescript
export interface IFilterValues {
  accessor: string;
  [key: string]: string;
}
```

#### Table Options (`src/lib/entities/ITableOptions.ts`)
```typescript
export interface ITableOptions {
  accessor?: string;
  columns: string[];
  data: any[];
}
```

#### Tile Options (`src/lib/entities/ITileOptions.ts`)
```typescript
export interface ITileOptions {
  accessor?: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  description: string;
}
```

#### Markdown Cell Options (`src/lib/entities/IMarkdownCellOptions.ts`)
```typescript
export interface IMarkdownCellOptions {
  accessor?: string;
  content: string;
}
```

#### Code Cell Options (`src/lib/entities/ICodeCellOptions.ts`)
```typescript
export interface ICodeCellOptions {
  accessor: string;
}
```

#### State Interface (`src/lib/entities/IState.ts`)
```typescript
export interface IState {
  accessor: string;
  column: string;
  isOdataQuery: boolean;
}
```

## Chart Builders

### Base Chart Builder (`src/lib/chart-builders/apache-echart-builder.ts`)

Abstract base class providing common functionality for all ECharts-based visualizations:

**Key Features:**
- Generic type support for different chart options
- Fluent API for configuration
- Common styling and layout methods
- Event handling capabilities

**Main Methods:**
- `setData(data: any)`: Set chart data
- `setTitle(text: string, subtext?: string)`: Configure chart title
- `setTooltip(trigger: string, formatter?: string | Function)`: Configure tooltips
- `setLegend(orient: string, position: string)`: Configure legend
- `setColors(colors: string[])`: Set chart colors
- `setBorderRadius(radius: number)`: Set border radius
- `setEmphasis(shadowBlur: number, shadowOffsetX: number, shadowColor: string)`: Set hover effects
- `build()`: Build the final widget

### Specific Chart Builders

#### Pie Chart Builder (`src/lib/chart-builders/pie/pie-chart-builder.ts`)

Extends the base builder with pie chart-specific functionality:

```typescript
export class PieChartBuilder extends ApacheEchartBuilder<PieChartOptions, PieChartSeriesOptions> {
  static create(): PieChartBuilder;
  setRadius(radius: string | string[]): this;
  setCenter(center: string | string[]): this;
  static isPieChart(widget: IWidget): boolean;
}
```

**Usage Example:**
```typescript
const widget = PieChartBuilder.create()
  .setData(pieData)
  .setTitle('Asset Allocation', 'Portfolio Distribution')
  .setRadius(['40%', '70%'])
  .setCenter(['50%', '60%'])
  .setLabelFormatter('{b}: {c} ({d}%)')
  .setColors(['#5470c6', '#91cc75', '#fac858'])
  .setHeader('Custom Pie Chart')
  .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
  .build();
```

#### Bar Chart Builder (`src/lib/chart-builders/bar/bar-chart-builder.ts`)

Provides bar chart-specific configuration options.

#### Line Chart Builder (`src/lib/chart-builders/line/line-chart-builder.ts`)

Supports line chart configurations with multiple series support.

#### Scatter Chart Builder (`src/lib/chart-builders/scatter/scatter-chart-builder.ts`)

Handles scatter plot visualizations with point-based data.

#### Gauge Chart Builder (`src/lib/chart-builders/gauge/gauge-chart-builder.ts`)

Supports gauge/donut chart visualizations for metrics and KPIs.

#### Heatmap Chart Builder (`src/lib/chart-builders/heatmap/heatmap-chart-builder.ts`)

Provides heatmap visualization capabilities for matrix data.

#### Density Map Builder (`src/lib/chart-builders/density-map/density-map-builder.ts`)

Supports geographic density visualizations.

### Chart Builder Index (`src/lib/chart-builders/index.ts`)

Central export point for all chart builders:

```typescript
export * from './apache-echart-builder';
export * from './pie';
export * from './bar';
export * from './line';
export * from './scatter';
export * from './gauge';
export * from './heatmap';
export * from './density-map';
```

## Widget Components

### Main Widget Component (`src/lib/widgets/widget/widget.component.ts`)

Dynamic component that renders different widget types based on configuration:

```typescript
@Component({
  selector: 'vis-widget',
  standalone: true,
  templateUrl: './widget.component.html',
  imports: [NgComponentOutlet],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })]
})
export class WidgetComponent {
  @Input() widget!: IWidget;
  @Output() onDataLoad: EventEmitter<IWidget> = new EventEmitter();
  @Output() onUpdateFilter: EventEmitter<any> = new EventEmitter();
}
```

**Supported Widget Types:**
- `echart`: ECharts visualizations
- `filter`: Filter components
- `table`: Table displays
- `tile`: Metric tiles
- `markdownCell`: Markdown content (commented out)
- `codeCell`: Code snippets (commented out)
- `react`: React component wrapper (commented out)

### Widget Builder (`src/lib/widgets/widget/widget-builder.ts`)

Fluent API builder for creating widget configurations:

```typescript
export class WidgetBuilder {
  setId(id: string): this;
  setPosition(position: GridsterItem): this;
  setComponent(component: string): this;
  setHeader(title: string, options?: string[]): this;
  setEChartsOptions(options: EChartsOption): this;
  setFilterOptions(options: IFilterOptions): this;
  setTileOptions(options: ITileOptions): this;
  setTableOptions(options: ITableOptions): this;
  setData(data: any): this;
  build(): IWidget;
  static setData(widget: IWidget, data: any): void;
}
```

### Individual Widget Components

#### EChart Component (`src/lib/widgets/echarts/echart.component.ts`)

Renders ECharts visualizations with event handling:

```typescript
@Component({
  selector: 'vis-echart',
  standalone: true,
  template: `<div echarts [options]="chartOptions" (chartInit)="onChartInit($event)" (chartClick)="onClick($event)"></div>`,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })]
})
export class EchartComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;
}
```

#### Filter Component (`src/lib/widgets/filter/filter.component.ts`)

Manages filter values and provides filter UI:

```typescript
@Component({
  selector: 'vis-filters',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FilterComponent {
  @Input() widget!: IWidget;
  @Input() onUpdateFilter!: EventEmitter<any>;
  @Input() onDataLoad!: EventEmitter<any>;
  
  clearAllFilters(item: any): void;
  clearFilter(item: any): void;
}
```

#### Table Component (`src/lib/widgets/table/table.component.ts`)

Basic table display component (minimal implementation).

#### Tile Component (`src/lib/widgets/tile/tile.component.ts`)

Basic tile display component (minimal implementation).

#### Markdown Cell Component (`src/lib/widgets/markdown-cell/markdown-cell.component.ts`)

Basic markdown display component (minimal implementation).

#### Code Cell Component (`src/lib/widgets/code-cell/code-cell.component.ts`)

Basic code display component (minimal implementation).

#### React Wrapper Component (`src/lib/widgets/react-wrapper/react-wrapper.component.ts`)

Wrapper for integrating React components into Angular dashboard:

```typescript
@Component({
  selector: 'app-react-component-wrapper',
  template: `<div><my-react-component [widget]="widget"></my-react-component></div>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true
})
export class ReactComponentWrapperComponent implements OnInit, OnDestroy {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;
}
```

## Dashboard Container

### Main Container Component (`src/lib/dashboard-container/dashboard-container.component.ts`)

The core dashboard container that manages the grid layout and widget lifecycle:

```typescript
@Component({
  selector: 'vis-dashboard-container',
  standalone: true,
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.scss'],
  imports: [CommonModule, FormsModule, GridsterComponent, GridsterItemComponent, WidgetComponent, WidgetHeaderComponent, NgxPrintModule, ToastModule]
})
export class DashboardContainerComponent {
  @Input() widgets!: IWidget[];
  @Input() filterValues: IFilterValues[] = [];
  @Input() dashboardId: any;
  @Input() isEditMode: boolean = false;
  @Input() options: GridsterConfig = {};
  
  @Output() containerTouchChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() editModeStringChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() changesMade: EventEmitter<string> = new EventEmitter<string>();
}
```

**Key Features:**
- Grid-based layout using angular-gridster2
- Edit mode support
- Widget resizing and repositioning
- Filter management
- Print functionality
- Responsive design

**Main Methods:**
- `initializeDashboard()`: Initialize dashboard using builder pattern
- `updateDashboardConfig(updates: Partial<DashboardConfig>)`: Update configuration dynamically
- `enableEditMode()` / `disableEditMode()`: Toggle edit mode
- `setResponsive(breakpoint: number)`: Set responsive behavior
- `calculateChartHeight(cols: number, rows: number)`: Calculate optimal chart height
- `onDataLoad(widget: IWidget)`: Handle data loading events
- `onUpdateFilter($event: any)`: Handle filter updates

### Dashboard Container Builder (`src/lib/dashboard-container/dashboard-container-builder.ts`)

Builder pattern implementation for dashboard configuration:

```typescript
export class DashboardContainerBuilder {
  setWidgets(widgets: IWidget[]): this;
  setFilterValues(filterValues: IFilterValues[]): this;
  setDashboardId(dashboardId: any): this;
  setEditMode(isEditMode: boolean): this;
  setChartHeight(chartHeight: number): this;
  setCustomConfig(config: GridsterConfig): this;
  setItemResizeCallback(callback: Function): this;
  setItemChangeCallback(callback: Function): this;
  build(): DashboardConfig;
}
```

### Standard Dashboard Builder (`src/lib/dashboard-container/standard-dashboard-builder.ts`)

Pre-configured dashboard builder with common settings:

```typescript
export class StandardDashboardBuilder extends DashboardContainerBuilder {
  static createStandard(): StandardDashboardBuilder;
  enableEditMode(): this;
  disableEditMode(): this;
  setResponsive(breakpoint: number): this;
  setCompactLayout(): this;
  setSpaciousLayout(): this;
  setMobileOptimized(): this;
  setDesktopOptimized(): this;
}
```

### Usage Examples (`src/lib/dashboard-container/usage-example.ts`)

Comprehensive examples showing how to use the dashboard container:

```typescript
// Basic dashboard setup
const dashboard = StandardDashboardBuilder.createStandard()
  .setWidgets(widgets)
  .setFilterValues(filters)
  .setDashboardId('my-dashboard')
  .setEditMode(false)
  .build();

// Advanced configuration
const advancedDashboard = StandardDashboardBuilder.createStandard()
  .setWidgets(complexWidgets)
  .setResponsive(768)
  .setCompactLayout()
  .setCustomConfig(customGridsterConfig)
  .build();
```

## Widget Header & Configuration

### Widget Header Component (`src/lib/widget-header/widget-header.component.ts`)

Component for rendering widget headers with title and configuration options:

```typescript
@Component({
  selector: 'vis-widget-header',
  standalone: true,
  imports: [CommonModule, SidebarModule, PanelModule, WidgetConfigComponent, ButtonModule],
  templateUrl: './widget-header.component.html',
  styleUrls: ['./widget-header.component.css']
})
export class WidgetHeaderComponent {
  @Input() widget!: IWidget;
  @Output() onUpdateWidget: EventEmitter<IWidget> = new EventEmitter();
  @Output() onDeleteWidget: EventEmitter<IWidget> = new EventEmitter();
  @Input() onEditMode: boolean = true;
  @Input() dashboardId: any;
}
```

**Features:**
- Widget title display
- Edit mode toggle
- Configuration sidebar
- Delete widget functionality

### Widget Config Component (`src/lib/widget-config/widget-config.component.ts`)

Component for configuring widget properties and options:

```typescript
@Component({
  selector: 'vis-widget-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, ScrollPanelModule, PanelModule, TabMenuModule, InputTextModule, ToastModule],
  templateUrl: './widget-config.component.html',
  styleUrls: ['./widget-config.component.scss']
})
export class WidgetConfigComponent {
  @Input() widget!: IWidget | undefined;
  @Output() onUpdate: EventEmitter<IWidget> = new EventEmitter();
  @Input() selectedDashboardId: any;
}
```

**Features:**
- Tabbed configuration interface
- Position configuration
- Options configuration
- Data options configuration
- Form validation
- Save functionality

## Configuration & Formly

### Form Options (`src/lib/formly-configs/form-options.ts`)

Formly configuration for widget configuration forms:

```typescript
export const formOptions = [
  {
    type: 'tabs',
    fieldGroup: [
      {
        props: { label: 'Position' },
        fieldGroup: [
          { key: 'position.x', type: 'number', templateOptions: { label: 'X-axis', required: true } },
          { key: 'position.y', type: 'number', templateOptions: { label: 'Y-axis', required: true } },
          { key: 'position.cols', type: 'number', templateOptions: { label: 'Columns', required: true } },
          { key: 'position.rows', type: 'number', templateOptions: { label: 'Rows', required: true } }
        ]
      },
      {
        props: { label: 'Config' },
        fieldGroup: [
          { key: 'config.component', type: 'select', templateOptions: { label: 'Component', options: [...] } },
          { key: 'config.header', type: 'accordion', templateOptions: { label: 'Header Options' } },
          { key: 'config.options', type: 'accordion', templateOptions: { label: 'Input Fields' } }
        ]
      }
    ]
  }
];
```

### Series Options (`src/lib/formly-configs/series-options.ts`)

Comprehensive Formly configuration for chart series configuration (68KB file with 1980 lines).

## Builders & Utilities

### Dashboard Container Index (`src/lib/dashboard-container/index.ts`)

Export point for dashboard container components:

```typescript
export * from './dashboard-container.component';
export * from './dashboard-container-builder';
export * from './standard-dashboard-builder';
export * from './usage-example';
export * from './dashboard-container-examples';
```

### Chart Builder Examples

Each chart builder includes example files showing usage patterns:

- `pieChart-examples.ts`: Pie chart usage examples
- `lineChart-examples.ts`: Line chart usage examples
- `scatterChart-examples.ts`: Scatter chart usage examples
- `gaugeChart-examples.ts`: Gauge chart usage examples
- `heatmapChart-examples.ts`: Heatmap usage examples
- `densityMap-examples.ts`: Density map usage examples

## Testing

The library includes comprehensive test coverage:

- **Unit Tests**: `.spec.ts` files for component testing
- **E2E Tests**: `.cy.ts` files for Cypress testing
- **Test Coverage**: Components, services, and utilities

## Dependencies

### Core Dependencies
- `@angular/core`: Angular framework
- `angular-gridster2`: Grid layout system
- `echarts`: Charting library
- `ngx-echarts`: Angular wrapper for ECharts
- `primeng`: UI component library
- `uuid`: Unique ID generation

### Development Dependencies
- `@angular/cli`: Angular CLI tools
- `@angular-devkit/build-angular`: Build tools
- `karma`: Test runner
- `cypress`: E2E testing

## Usage Patterns

### Basic Dashboard Setup

```typescript
import { DashboardContainerComponent, PieChartBuilder } from 'dashboards';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardContainerComponent],
  template: `
    <vis-dashboard-container 
      [widgets]="widgets"
      [filterValues]="filterValues"
      [dashboardId]="dashboardId"
      [isEditMode]="isEditMode"
      (containerTouchChanged)="onContainerTouchChanged($event)"
      (changesMade)="onChangesMade($event)">
    </vis-dashboard-container>
  `
})
export class DashboardComponent {
  widgets = signal<IWidget[]>([]);
  filterValues = signal<IFilterValues[]>([]);
  dashboardId = 'my-dashboard';
  isEditMode = false;

  constructor() {
    // Create a pie chart widget
    const pieWidget = PieChartBuilder.create()
      .setData(pieData)
      .setTitle('Asset Allocation')
      .setHeader('Portfolio Distribution')
      .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
      .build();

    this.widgets.set([pieWidget]);
  }
}
```

### Advanced Configuration

```typescript
// Create a complex dashboard with multiple widgets
const dashboard = StandardDashboardBuilder.createStandard()
  .setWidgets([
    PieChartBuilder.create().setData(assetData).setPosition({ x: 0, y: 0, cols: 4, rows: 4 }).build(),
    BarChartBuilder.create().setData(revenueData).setPosition({ x: 4, y: 0, cols: 4, rows: 4 }).build(),
    LineChartBuilder.create().setData(trendData).setPosition({ x: 0, y: 4, cols: 8, rows: 4 }).build()
  ])
  .setFilterValues(filterConfig)
  .setDashboardId('financial-dashboard')
  .setEditMode(true)
  .setResponsive(768)
  .setCompactLayout()
  .build();
```

## Best Practices

1. **Widget Creation**: Use builder patterns for consistent widget creation
2. **State Management**: Use Angular signals for reactive state management
3. **Event Handling**: Implement proper event handling for data loading and filter updates
4. **Responsive Design**: Configure responsive breakpoints for different screen sizes
5. **Performance**: Use virtual scrolling for large dashboards
6. **Testing**: Write comprehensive tests for custom widgets and configurations

## Extension Points

The library is designed for extensibility:

1. **Custom Widget Types**: Implement new widget components following the existing patterns
2. **Custom Chart Types**: Extend the ApacheEchartBuilder for new chart types
3. **Custom Builders**: Create specialized builders for specific use cases
4. **Custom Formly Configs**: Extend form configurations for new options

This documentation provides a comprehensive overview of all code files in the dashboards library, their purposes, and how they work together to create a flexible and extensible dashboard framework. 