# Filter Highlighting Feature

This document describes the new filter highlighting functionality that allows filtered data to be greyed out while highlighting selected filter values, instead of completely hiding filtered data.

## Overview

The traditional filtering approach completely removes data that doesn't match the filter criteria. The new highlighting mode keeps all data visible but applies visual differentiation:

- **Highlighted data**: Data that matches the filter criteria is emphasized with full opacity and optional highlight styling
- **Filtered/Greyed data**: Data that doesn't match the filter is shown with reduced opacity and greyed styling

## Configuration

### Dashboard Level Configuration

Enable filter highlighting at the dashboard level using the dashboard builder:

```typescript
// Enable filter highlighting with default settings
this.dashboardConfig = StandardDashboardBuilder.createStandard()
  .setDashboardId('my-dashboard')
  .enableFilterHighlighting(true)
  .build();

// Enable filter highlighting with custom styling
this.dashboardConfig = StandardDashboardBuilder.createStandard()
  .setDashboardId('my-dashboard')
  .enableFilterHighlighting(true, {
    filteredOpacity: 0.25,        // Opacity for greyed out data (0-1)
    highlightedOpacity: 1.0,      // Opacity for highlighted data (0-1)
    highlightColor: '#ff6b6b',    // Color for highlight borders/emphasis
    filteredColor: '#e0e0e0'      // Color for filtered data
  })
  .build();

// Or use the more granular approach
this.dashboardConfig = StandardDashboardBuilder.createStandard()
  .setDashboardId('my-dashboard')
  .setFilterVisualization({
    enableHighlighting: true,
    defaultFilteredOpacity: 0.3,
    defaultHighlightedOpacity: 1.0,
    defaultHighlightColor: '#ff6b6b',
    defaultFilteredColor: '#cccccc'
  })
  .build();
```

### Widget Level Configuration

Individual widgets can override the dashboard-level settings:

```typescript
// Create a widget with custom filter visualization
const widget = PieChartBuilder.create()
  .setData(data)
  .setHeader('Asset Allocation')
  .build();

// Add custom filter visualization options to the widget
if (widget.config) {
  widget.config.options = {
    ...widget.config.options,
    visualMode: {
      enableHighlighting: true,
      filteredOpacity: 0.2,
      highlightedOpacity: 1.0,
      highlightColor: '#4CAF50',
      filteredColor: '#f5f5f5'
    }
  };
}
```

## Supported Chart Types

The highlighting feature currently supports:

### Pie Charts
- Highlighted slices: Full opacity with colored border
- Filtered slices: Reduced opacity with grey color

### Bar Charts  
- Highlighted bars: Full opacity with colored border
- Filtered bars: Reduced opacity with grey color

### Line Charts
- Currently returns original data (highlighting support coming soon)

### Scatter Charts
- Currently returns original data (highlighting support coming soon)

## Example Usage

```typescript
export class MyDashboardComponent implements OnInit {
  dashboardConfig!: DashboardConfig;

  ngOnInit(): void {
    // Create dashboard with highlighting enabled
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('analytics-dashboard')
      // Enable highlighting mode
      .enableFilterHighlighting(true, {
        filteredOpacity: 0.25,
        highlightedOpacity: 1.0,
        highlightColor: '#ff6b6b',
        filteredColor: '#e0e0e0'
      })
      .addWidget(this.createPieChart())
      .addWidget(this.createBarChart())
      .addWidget(this.createFilterWidget())
      .build();
  }

  private createPieChart(): IWidget {
    return PieChartBuilder.create()
      .setData([
        { name: 'Technology', value: 30 },
        { name: 'Healthcare', value: 25 },
        { name: 'Finance', value: 20 },
        { name: 'Energy', value: 15 },
        { name: 'Consumer', value: 10 }
      ])
      .setHeader('Asset Allocation')
      .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
      .build();
  }
}
```

## Behavior Comparison

### Traditional Filtering (Default)
- **Applied filter**: Click "Technology" on Widget A
- **Result**: All widgets show only Technology data, other data is removed
- **Effect**: All charts show only filtered data

### Highlighting Mode  
- **Applied filter**: Click "Technology" on Widget A  
- **Source Widget A**: Technology slice/bar is highlighted with border, all others are greyed out within the same widget
- **Other Widgets**: Show only Technology data (traditional filtering)
- **Effect**: Source widget maintains full context, other widgets show focused results

## Migration Guide

### Existing Dashboards
Existing dashboards will continue to work with traditional filtering unless explicitly enabled:

```typescript
// Before (traditional filtering)
.build();

// After (with highlighting)
.enableFilterHighlighting(true)
.build();
```

### Custom Widgets
If you have custom widget implementations, you may need to update them to support the highlighting data format. The highlighting system adds `itemStyle` properties to data items:

```typescript
// Highlighted data item
{
  name: 'Technology',
  value: 30,
  itemStyle: {
    opacity: 1.0,
    borderWidth: 3,
    borderColor: '#ff6b6b'
  }
}

// Filtered data item  
{
  name: 'Healthcare',
  value: 25,
  itemStyle: {
    opacity: 0.25,
    color: '#e0e0e0'
  }
}
```

## API Reference

### FilterService Methods

```typescript
// Apply highlighting to chart data
applyHighlightingToEChartsData(
  data: any[], 
  filters: IFilterValues[],
  chartType: 'pie' | 'bar' | 'line' | 'scatter' | 'other',
  options?: HighlightOptions
): any[]

// Apply highlighting to generic data
applyHighlightingFiltersToData<T>(
  data: T[], 
  filters: IFilterValues[],
  options?: HighlightOptions
): (T & { _filterState?: 'highlighted' | 'filtered' | 'normal' })[]
```

### Interface Definitions

```typescript
interface HighlightOptions {
  filteredOpacity?: number;
  highlightedOpacity?: number; 
  highlightColor?: string;
  filteredColor?: string;
}

interface DashboardConfig {
  // ... other properties
  filterVisualization?: {
    enableHighlighting?: boolean;
    defaultFilteredOpacity?: number;
    defaultHighlightedOpacity?: number;
    defaultHighlightColor?: string;
    defaultFilteredColor?: string;
  };
}
```

## Troubleshooting

### Highlighting Not Working
1. Ensure `enableHighlighting` is set to `true` in dashboard config
2. Check that filters are being applied correctly
3. Verify chart type is supported (pie, bar)

### Performance Issues
1. Highlighting mode processes all data items - consider pagination for large datasets
2. Use appropriate opacity values (avoid very low values that are hard to see)

### Styling Issues
1. Ensure highlight colors have sufficient contrast
2. Test with different themes and color schemes
3. Consider accessibility requirements for color-blind users

## Future Enhancements

- Support for line and scatter chart highlighting
- Animation transitions between filter states
- Custom highlighting patterns (stripes, patterns)
- Integration with chart themes and color palettes
- Performance optimizations for large datasets 