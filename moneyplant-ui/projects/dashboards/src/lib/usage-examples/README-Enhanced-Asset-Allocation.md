# Enhanced Asset Allocation with PieChartBuilder

## Overview

This document demonstrates the enhanced `PieChartBuilder` functionality specifically implemented for asset allocation charts. The new approach **eliminates the need for separate `asset-allocation-widget.ts` files** by consolidating all functionality directly into the `PieChartBuilder` class.

## Key Benefits

✅ **Consolidated Architecture**: All asset allocation functionality in one place  
✅ **Enhanced Data Management**: Async loading, filtering, retry mechanisms  
✅ **Event Handling**: Automatic click-to-filter, hover effects  
✅ **Multiple Styles**: Financial, donut, minimal variations  
✅ **Factory Patterns**: Consistent widget creation  
✅ **Type Safety**: Full TypeScript support with configurations  
✅ **Runtime Customization**: Dynamic appearance adjustments  

## Basic Usage

### Simple Asset Allocation Widget

```typescript
import { PieChartBuilder, PieChartData } from '@dashboards/public-api';

// Create basic asset allocation widget
const widget = PieChartBuilder.createAssetAllocationWidget([
  { name: 'Stocks', value: 50 },
  { name: 'Bonds', value: 20 },
  { name: 'Cash', value: 20 },
  { name: 'Real Estate', value: 8 },
  { name: 'Commodities', value: 2 }
]);
```

### With Filtering Support

```typescript
// Create asset allocation with filtering
const widget = PieChartBuilder.createAssetAllocationWidget(
  sampleData,
  filterService,  // Your filter service instance
  { x: 0, y: 0, cols: 6, rows: 8 }  // Position
);
```

## Complete Management Interface

### Setup Complete Asset Allocation

```typescript
// Data loader function (simulates API call)
const dataLoader = async (): Promise<PieChartData[]> => {
  const response = await fetch('/api/asset-allocation');
  return response.json();
};

// Setup complete management interface
const assetAllocationManager = PieChartBuilder.setupCompleteAssetAllocation(
  null,           // container element (handled by dashboard)
  initialData,    // initial data
  filterService,  // filter service
  dataLoader      // async data loader
);

// Use the management interface
console.log('Widget Info:', assetAllocationManager.getInfo());
```

### Management Interface Methods

```typescript
interface AssetAllocationManager {
  widget: IWidget;
  updateData: (newData: PieChartData[]) => void;
  loadDataAsync: () => Promise<void>;
  applyFilters: () => void;
  getInfo: () => any;
}
```

## Data Management Examples

### Update Data

```typescript
// Option 1: Update with new data directly
const newData = [
  { name: 'US Stocks', value: 40 },
  { name: 'International Stocks', value: 30 },
  { name: 'Bonds', value: 20 },
  { name: 'Cash', value: 10 }
];
assetAllocationManager.updateData(newData);

// Option 2: Load data asynchronously with retry
await assetAllocationManager.loadDataAsync();

// Option 3: Apply current filters
assetAllocationManager.applyFilters();
```

### Async Loading with Retry

```typescript
// Direct async loading
await PieChartBuilder.loadDataAsync(widget, dataLoader, {
  retryCount: 3,
  retryDelay: 1000,
  timeout: 5000
});
```

### Batch Updates

```typescript
// Update multiple widgets at once
PieChartBuilder.batchUpdateData([
  { widget: widget1, data: newData1, filterService },
  { widget: widget2, data: newData2, filterService },
  { widget: widget3, data: newData3, filterService }
]);
```

## Multiple Variations

### Create Variations

```typescript
const variations = PieChartBuilder.createAssetAllocationVariations(
  baseData,
  filterService
);

// Each variation has update method
variations.forEach(({ name, widget, updateData }) => {
  console.log(`Created ${name} variation`);
  updateData(modifiedData);
});
```

### Factory Pattern

```typescript
const factory = PieChartBuilder.createAssetAllocationFactory(filterService);

// Create different styles
const financialWidget = factory.createFinancial(data);
const donutWidget = factory.createDonut(data);
const minimalWidget = factory.createMinimal(data);
```

## Advanced Features

### Custom Event Handling

```typescript
// Configure click handlers
PieChartBuilder.configureClickHandler(widget, (clickData, widget) => {
  console.log('Clicked:', clickData);
  
  // Create and apply filter
  const filter = PieChartBuilder.createAssetAllocationFilter(clickData);
  if (filter) {
    filterService.addFilter(filter);
  }
});

// Configure hover effects
PieChartBuilder.configureHoverHandler(
  widget,
  (data) => console.log('Hovering:', data.name),
  () => console.log('Hover ended')
);
```

### Auto-Filtering

```typescript
// Enable automatic filtering on clicks
PieChartBuilder.enableAutoFiltering(widget, filterService, (filter) => {
  console.log('Filter created automatically:', filter);
});
```

### Runtime Customization

```typescript
// Apply custom styling at runtime
PieChartBuilder.applyRuntimeCustomization(widget, (chartOptions, seriesOptions) => {
  seriesOptions.radius = ['50%', '80%'];
  seriesOptions.itemStyle = {
    borderRadius: 10,
    borderColor: '#fff',
    borderWidth: 2
  };
  
  if (chartOptions.tooltip) {
    chartOptions.tooltip.formatter = '{b}: ${c}K ({d}%)';
  }
});
```

## Component Integration

### Enhanced Component Usage

```typescript
export class DashboardComponent {
  private assetAllocationManager?: ReturnType<typeof PieChartBuilder.setupCompleteAssetAllocation>;

  ngOnInit() {
    this.initializeAssetAllocation();
  }

  private initializeAssetAllocation(): void {
    const initialData = this.convertToChartData(this.dashboardData);
    
    this.assetAllocationManager = PieChartBuilder.setupCompleteAssetAllocation(
      null,
      initialData,
      this.filterService,
      () => this.loadAssetAllocationData()
    );
  }

  private async loadAssetAllocationData(): Promise<PieChartData[]> {
    // Your API call here
    const response = await this.dataService.getAssetAllocation();
    return this.convertToChartData(response);
  }

  // Update data when dashboard data changes
  private onDataUpdate(): void {
    if (this.assetAllocationManager) {
      const newData = this.convertToChartData(this.dashboardData);
      this.assetAllocationManager.updateData(newData);
    }
  }
}
```

## Widget Information and Monitoring

### Get Widget Information

```typescript
const info = PieChartBuilder.getWidgetInfo(widget);
console.log('Widget Information:', {
  chartType: info.chartType,        // 'pie'
  hasData: info.hasData,           // boolean
  dataCount: info.dataCount,       // number of data points
  filterColumn: info.filterColumn, // 'assetCategory'
  configuration: info.configuration // current config name
});
```

### Validation

```typescript
const validation = PieChartBuilder.validateConfiguration(widget);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}
```

## Data Export

### Export Functionality

```typescript
// Export data for Excel/CSV
const exportData = PieChartBuilder.exportData(widget);
const headers = PieChartBuilder.getExportHeaders(widget);  // ['Category', 'Value', 'Percentage']
const sheetName = PieChartBuilder.getExportSheetName(widget);

console.log('Export ready:', { headers, data: exportData, sheetName });
```

## Configuration Options

### Available Configurations

```typescript
// Use different preset configurations
const configurations = [
  PieChartConfiguration.FINANCIAL,   // Financial styling
  PieChartConfiguration.DONUT,       // Donut chart
  PieChartConfiguration.MINIMAL,     // Clean minimal
  PieChartConfiguration.ROSE,        // Rose/Nightingale
  PieChartConfiguration.NESTED,      // Nested rings
  PieChartConfiguration.SEMI_CIRCLE  // Half circle
];

// Apply configuration
const widget = PieChartBuilder.create()
  .useConfiguration(PieChartConfiguration.FINANCIAL)
  .setData(data)
  .setHeader('Asset Allocation')
  .build();
```

### Runtime Configuration Changes

```typescript
// Change configuration at runtime
PieChartBuilder.applyRuntimeCustomization(widget, (options, series) => {
  // Switch to donut style
  series.radius = ['50%', '80%'];
  
  // Update colors
  series.color = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  
  // Customize tooltip
  options.tooltip = {
    formatter: '{b}: ${c} ({d}%)'
  };
});
```

## Complete Workflow Example

```typescript
async function completeAssetAllocationWorkflow(filterService: FilterService) {
  // 1. Create widget with enhanced features
  const widget = PieChartBuilder.createAssetAllocationWidget(
    initialData,
    filterService
  );
  
  // 2. Validate configuration
  const validation = PieChartBuilder.validateConfiguration(widget);
  if (!validation.isValid) {
    throw new Error('Widget validation failed');
  }
  
  // 3. Setup complete management
  const manager = PieChartBuilder.setupCompleteAssetAllocation(
    null,
    initialData,
    filterService,
    loadDataFunction
  );
  
  // 4. Demonstrate all operations
  await manager.loadDataAsync();
  manager.updateData(newData);
  manager.applyFilters();
  
  // 5. Create variations
  const variations = PieChartBuilder.createAssetAllocationVariations(
    baseData,
    filterService
  );
  
  // 6. Apply customizations
  PieChartBuilder.applyRuntimeCustomization(widget, customizer);
  
  // 7. Monitor and export
  const info = PieChartBuilder.getWidgetInfo(widget);
  const exportData = PieChartBuilder.exportData(widget);
  
  return { widget, manager, variations, info, exportData };
}
```

## Migration from Widget Files

### Before (using asset-allocation-widget.ts)

```typescript
// OLD APPROACH - Required separate file
import { createAssetAllocationWidget } from './widgets/asset-allocation-widget';

const widget = createAssetAllocationWidget();
updateAssetAllocationData(widget, newData, filterService);
```

### After (using enhanced PieChartBuilder)

```typescript
// NEW APPROACH - Everything in PieChartBuilder
import { PieChartBuilder } from '@dashboards/public-api';

const widget = PieChartBuilder.createAssetAllocationWidget([], filterService);
PieChartBuilder.updateAssetAllocationData(widget, newData, filterService);

// Or use complete management interface
const manager = PieChartBuilder.setupCompleteAssetAllocation(null, [], filterService);
manager.updateData(newData);
```

## Benefits Summary

1. **Eliminated Redundancy**: No more separate widget files
2. **Enhanced Functionality**: Rich management features built-in
3. **Better Type Safety**: Full TypeScript support
4. **Consistent API**: Same patterns across all chart types
5. **Improved Performance**: Retry mechanisms and batch operations
6. **Developer Experience**: Better IntelliSense and self-documenting code
7. **Runtime Flexibility**: Dynamic customization capabilities
8. **Comprehensive Export**: Built-in data export functionality

The enhanced `PieChartBuilder` provides a complete, consolidated solution for asset allocation charts with advanced management capabilities, eliminating the need for separate widget files while providing significantly more functionality. 