# Dashboard Filtering System

This document describes the implementation of the filtering system for the dashboard widgets using `IFilterValues`.

## Overview

The filtering system allows users to click on chart elements and have those selections automatically applied as filters across all widgets in the dashboard. The system uses the `IFilterValues` interface to standardize filter data across different chart types.

## Architecture

### Core Components

1. **FilterService** (`src/app/services/filter.service.ts`)
   - Central service for managing filter values
   - Provides reactive streams for filter changes
   - Handles filter creation from chart click events
   - Applies filters to data

2. **Dashboard Container** (`projects/dashboards/src/lib/dashboard-container/dashboard-container.component.ts`)
   - Manages filter values at the dashboard level
   - Handles chart click events and filter updates
   - Emits filter value changes to parent components

3. **EChart Component** (`projects/dashboards/src/lib/widgets/echarts/echart.component.ts`)
   - Enhanced to create `IFilterValues` from chart clicks
   - Supports different chart types (pie, bar, line, scatter, etc.)
   - Adds widget metadata to filter values

4. **Widget Update Functions**
   - Each widget has an update function that accepts a `FilterService`
   - Filters are applied before `widget.setData()` is called
   - Example: `updateAssetAllocationData(widget, newData, filterService)`

## How It Works

### 1. Chart Click Event Flow

```
User clicks chart element
    ↓
EChart component creates IFilterValues
    ↓
Dashboard container receives filter event
    ↓
FilterService adds filter to global state
    ↓
All widgets are notified of filter change
    ↓
Widgets apply filters to their data
    ↓
Charts update with filtered data
```

### 2. Filter Value Structure

```typescript
interface IFilterValues {
  accessor: string;        // Type of filter (category, series, coordinates, etc.)
  [key: string]: string;   // Dynamic properties based on filter type
}
```

### 3. Chart Type Support

- **Pie Charts**: `{ accessor: 'category', category: 'Stocks', value: 'Stocks' }`
- **Bar Charts**: `{ accessor: 'category', category: 'Q1', value: '100', seriesName: 'Revenue' }`
- **Line Charts**: `{ accessor: 'series', series: 'Portfolio A', value: '1500' }`
- **Scatter Plots**: `{ accessor: 'coordinates', x: '10', y: '20', value: '(10, 20)' }`

## Usage Examples

### 1. Creating a Filter-Aware Widget

```typescript
export function updateMyWidgetData(
  widget: IWidget, 
  newData?: any[], 
  filterService?: FilterService
): void {
  let data = newData || DEFAULT_DATA;
  
  // Apply filters if filter service is provided
  if (filterService) {
    const currentFilters = filterService.getFilterValues();
    if (currentFilters.length > 0) {
      data = filterService.applyFiltersToData(data, currentFilters);
    }
  }
  
  // Update widget with filtered data
  MyChartBuilder.updateData(widget, data);
}
```

### 2. Subscribing to Filter Changes

```typescript
ngOnInit(): void {
  this.filterService.filterValues$.subscribe(filters => {
    this.applyFiltersToWidgets(filters);
  });
}
```

### 3. Clearing All Filters

```typescript
public clearAllFilters(): void {
  this.filterService.clearAllFilters();
}
```

## Widget Integration

### Asset Allocation Widget

The asset allocation widget demonstrates the filtering system:

```typescript
// In asset-allocation-widget.ts
export function updateAssetAllocationData(
  widget: IWidget, 
  newData?: PieChartData[], 
  filterService?: FilterService
): void {
  let data = newData || ASSET_ALLOCATION_DATA;
  
  if (filterService) {
    const currentFilters = filterService.getFilterValues();
    if (currentFilters.length > 0) {
      data = filterService.applyFiltersToData(data, currentFilters);
    }
  }
  
  PieChartBuilder.updateData(widget, data);
}
```

### Test Filter Widget

A test widget is included to demonstrate the filtering functionality:

```typescript
// In test-filter-widget.ts
export function updateTestFilterData(
  widget: IWidget, 
  newData?: PieChartData[], 
  filterService?: FilterService
): void {
  let data = newData || TEST_FILTER_DATA;
  
  if (filterService) {
    const currentFilters = filterService.getFilterValues();
    if (currentFilters.length > 0) {
      // Custom filtering logic for this widget
      const categoryFilters = currentFilters.filter(filter => filter.accessor === 'category');
      if (categoryFilters.length > 0) {
        data = data.filter(item => {
          return categoryFilters.some(filter => 
            item.name === filter['category'] || item.name === filter['value']
          );
        });
      }
    }
  }
  
  PieChartBuilder.updateData(widget, data);
}
```

## Dashboard Integration

### Overall Component

The overall component integrates the filtering system:

```typescript
export class OverallComponent implements OnInit {
  constructor(private filterService: FilterService) {}

  ngOnInit(): void {
    this.subscribeToFilterChanges();
  }

  private subscribeToFilterChanges(): void {
    this.filterService.filterValues$.subscribe(filters => {
      this.applyFiltersToWidgets(filters);
    });
  }

  onFilterValuesChanged(filters: IFilterValues[]): void {
    this.filterService.setFilterValues(filters);
  }
}
```

### Template Integration

```html
<vis-dashboard-container 
  [widgets]="dashboardConfig.widgets" 
  [options]="dashboardConfig.config"
  [dashboardId]="dashboardConfig.dashboardId"
  (filterValuesChanged)="onFilterValuesChanged($event)">
</vis-dashboard-container>
```

## Filter UI

### Filter Widget

A filter widget displays active filters:

```typescript
export function createFilterWidget(): IWidget {
  const filterOptions: IFilterOptions = {
    values: []
  };

  return new WidgetBuilder()
    .setId('filter-widget')
    .setComponent('filter')
    .setPosition({ x: 0, y: 0, cols: 12, rows: 1 })
    .setFilterOptions(filterOptions)
    .build();
}
```

### Filter Controls

The dashboard includes filter control buttons:

```html
<p-button 
  label="Clear All Filters" 
  icon="pi pi-times" 
  (onClick)="clearAllFilters()"
  styleClass="p-button-sm p-button-warning">
</p-button>
```

## Benefits

1. **Centralized Filter Management**: All filter logic is managed by the `FilterService`
2. **Reactive Updates**: Widgets automatically update when filters change
3. **Type Safety**: Uses `IFilterValues` interface for consistent filter structure
4. **Chart Type Support**: Handles different chart types with appropriate filter creation
5. **Extensible**: Easy to add new widget types and filter logic
6. **Performance**: Efficient filtering with minimal re-renders

## Future Enhancements

1. **Filter Persistence**: Save filters to localStorage or backend
2. **Advanced Filtering**: Support for date ranges, numeric ranges, etc.
3. **Filter Combinations**: AND/OR logic for multiple filters
4. **Filter History**: Track filter changes over time
5. **Filter Templates**: Predefined filter sets for common scenarios

# Enhanced Filtering System with filterColumn

## Overview

The filtering system has been enhanced to support a more flexible filtering mechanism using the `filterColumn` property in addition to the existing `accessor` property.

## Key Features

### 1. filterColumn Property

The `filterColumn` property allows you to specify exactly which column/property should be filtered when a chart element is clicked, providing more precise control over filtering behavior.

```typescript
// Widget configuration with filterColumn
const widget: IWidget = {
  id: 'asset-allocation',
  config: {
    component: 'echart',
    accessor: 'category',        // Used for data access
    filterColumn: 'assetCategory', // Used for filtering
    // ... other config
  }
};
```

### 2. Enhanced Filter Logic

The filtering condition now works as: `<filterColumn || accessor> = <clickedValue>`

- If `filterColumn` is specified, it will be used for filtering
- If `filterColumn` is not specified, it falls back to `accessor`
- This provides backward compatibility while enabling more precise filtering

### 3. Updated Interfaces

#### IWidget Interface
```typescript
export interface IWidget {
  config: {
    accessor?: string;      // Data accessor key
    filterColumn?: string;  // Filter column/property
    // ... other properties
  };
}
```

#### IFilterValues Interface
```typescript
export interface IFilterValues {
  accessor: string;         // Data accessor key
  filterColumn?: string;    // Filter column/property
  [key: string]: string | undefined;
}
```

## Usage Examples

### Example 1: Asset Allocation Widget

```typescript
export function createAssetAllocationWidget(): IWidget {
  const widget = PieChartBuilder.create()
    .setData(ASSET_ALLOCATION_DATA)
    .setHeader('Asset Allocation')
    // ... other configuration
    .build();
    
  // Add filterColumn configuration
  if (widget.config) {
    widget.config.filterColumn = 'assetCategory';
  }
  
  return widget;
}

// Filter value creation
export function createAssetAllocationFilter(clickedData: any): IFilterValues | null {
  return {
    accessor: 'category',
    filterColumn: 'assetCategory',
    assetCategory: clickedData.name,
    value: clickedData.name,
    percentage: clickedData.value?.toString() || '0'
  };
}
```

### Example 2: Test Filter Widget

```typescript
export function createTestFilterWidget(): IWidget {
  const widget = PieChartBuilder.create()
    .setData(TEST_FILTER_DATA)
    .setHeader('Test Filter Widget')
    // ... other configuration
    .build();
    
  // Add filterColumn configuration
  if (widget.config) {
    widget.config.filterColumn = 'sector';
  }
  
  return widget;
}

// Filter value creation
export function createTestFilterValue(clickedData: any): IFilterValues | null {
  return {
    accessor: 'category',
    filterColumn: 'sector',
    category: clickedData.name,
    sector: clickedData.name,
    value: clickedData.name,
    percentage: clickedData.value?.toString() || '0',
    source: 'test-widget'
  };
}
```

## How It Works

### 1. Chart Click Event

When a user clicks on a chart element:

1. The echart component creates a filter value using `createFilterValueFromClickData()`
2. It uses the widget's `filterColumn` property if available, otherwise falls back to `accessor`
3. The filter value includes both `accessor` and `filterColumn` properties

### 2. Filter Application

When applying filters to data:

1. The FilterService uses `filterColumn || accessor` to determine which property to filter on
2. The `matchesFilter()` method checks the appropriate property in the data
3. This allows for more precise filtering while maintaining backward compatibility

### 3. Filter Parameters

The dashboard container's `getFilterParams()` method now uses:

```typescript
getFilterParams() {
  const filterParams: any = {};
  
  this.filterValues.forEach((filter: IFilterValues) => {
    // Use filterColumn if available, otherwise fall back to accessor
    const filterKey = filter.filterColumn || filter.accessor;
    if (filterKey && filter[filter.accessor]) {
      filterParams[filterKey] = filter[filter.accessor];
    }
  });
  
  return filterParams;
}
```

## Benefits

1. **Precise Filtering**: Specify exactly which property should be filtered
2. **Backward Compatibility**: Existing widgets continue to work without changes
3. **Flexible Configuration**: Different widgets can use different filtering strategies
4. **Clear Separation**: Distinguish between data access (`accessor`) and filtering (`filterColumn`)

## Migration Guide

### For Existing Widgets

Existing widgets will continue to work without changes. The system falls back to using `accessor` when `filterColumn` is not specified.

### For New Widgets

1. Add `filterColumn` to your widget configuration
2. Update filter value creation functions to include `filterColumn`
3. Update data filtering logic to use `filterColumn` when available

### Example Migration

```typescript
// Before
const widget = {
  config: {
    accessor: 'category'
  }
};

// After
const widget = {
  config: {
    accessor: 'category',
    filterColumn: 'assetCategory'  // More specific filtering
  }
};
```

## Testing

To test the enhanced filtering system:

1. Create widgets with different `filterColumn` values
2. Click on chart elements to create filters
3. Verify that filters are applied using the correct properties
4. Check that cross-widget filtering works correctly

The enhanced filtering system provides more control and precision while maintaining full backward compatibility with existing implementations. 