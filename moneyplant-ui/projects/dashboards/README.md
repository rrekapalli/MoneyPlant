# Dashboards

This library provides reusable dashboard components for the MoneyPlant application. It allows you to create dynamic dashboards with various widget types like charts, tables, filters, and more.

## Installation

This library is part of the MoneyPlant project and is automatically available when the project is cloned.

## Usage

Import the DashboardsModule in your application module:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardsModule } from 'dashboards';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DashboardsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

For standalone components, import the components directly:

```typescript
import { Component } from '@angular/core';
import { DashboardContainerComponent } from 'dashboards';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardContainerComponent],
  template: `
    <vis-dashboard-container [widgets]="widgets"></vis-dashboard-container>
  `
})
export class AppComponent {
  widgets = []; // Your widget configurations
}
```

## Components

### DashboardContainerComponent

A container component for dashboard widgets. It provides a grid-based layout for dashboard widgets using angular-gridster2.

```html
<vis-dashboard-container 
  [widgets]="widgets"
  [filterValues]="filterValues"
  [dashboardId]="dashboardId"
  [isEditMode]="isEditMode"
  [options]="gridsterOptions"
  (containerTouchChanged)="onContainerTouchChanged($event)"
  (editModeStringChange)="onEditModeStringChange($event)"
  (changesMade)="onChangesMade($event)">
</vis-dashboard-container>
```

#### Inputs

- `widgets`: Array of widget configurations (IWidget[])
- `filterValues`: Current filter values applied to the dashboard (IFilterValues[])
- `dashboardId`: ID of the current dashboard (any)
- `isEditMode`: Whether the dashboard is in edit mode (boolean)
- `options`: Gridster configuration options (GridsterConfig)

#### Outputs

- `containerTouchChanged`: Emitted when the container is touched/modified
- `editModeStringChange`: Emitted when the edit mode string changes
- `changesMade`: Emitted when changes are made to the dashboard

### WidgetComponent

A dynamic widget component that renders different widget types based on configuration.

```html
<vis-widget 
  [widget]="widget"
  (onDataLoad)="handleDataLoad($event)"
  (onUpdateFilter)="handleFilterUpdate($event)">
</vis-widget>
```

#### Inputs

- `widget`: The widget configuration (IWidget)

#### Outputs

- `onDataLoad`: Emitted when data needs to be loaded for the widget
- `onUpdateFilter`: Emitted when filter values are updated

### WidgetHeaderComponent

A component for rendering widget headers with title and options.

```html
<vis-widget-header 
  [title]="widget.config.header.title"
  [options]="widget.config.header.options">
</vis-widget-header>
```

### WidgetConfigComponent

A component for configuring widget properties.

```html
<vis-widget-config [widget]="widget"></vis-widget-config>
```

## Widget Types

The library includes several widget types:

### EchartComponent

A widget for rendering ECharts visualizations.

### FilterComponent

A widget for displaying and managing filter values.

### TableComponent

A widget for displaying tabular data.

### TileComponent

A widget for displaying simple metric tiles.

### MarkdownCellComponent

A widget for displaying markdown content.

### CodeCellComponent

A widget for displaying code snippets.

## Interfaces

The library defines several interfaces for widget configuration:

- `IWidget`: The main widget configuration interface
- `IFilterOptions`: Configuration options for filter widgets
- `IFilterValues`: Filter value definitions
- `ITableOptions`: Configuration options for table widgets
- `ITileOptions`: Configuration options for tile widgets
- `IMarkdownCellOptions`: Configuration options for markdown widgets
- `ICodeCellOptions`: Configuration options for code widgets
- `IState`: Widget state interface

## Development

### Building the library

Run `ng build dashboards` to build the library. The build artifacts will be stored in the `dist/dashboards` directory.

### Running tests

Run `ng test dashboards` to execute the unit tests via Karma.
