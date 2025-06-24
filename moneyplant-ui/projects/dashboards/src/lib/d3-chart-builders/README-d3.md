# D3.js Chart Builders

This directory contains D3.js-based chart builders that provide an alternative to the ECharts implementations. D3.js offers more control over rendering and is particularly useful for custom visualizations and performance-critical applications.

## Overview

The D3.js chart builders follow the same architectural pattern as the ECharts builders, providing:
- Abstract base class (`D3ChartBuilder`) for common functionality
- Specific chart type implementations (e.g., `PieChartBuilder`)
- Consistent API for configuration, data management, and export
- Support for both SVG and Canvas rendering

## Architecture

### Base Class: D3ChartBuilder

The `D3ChartBuilder` abstract class provides:
- Common configuration options (title, tooltip, legend, colors, etc.)
- Data management and widget building
- Chart instance management
- Export functionality
- Utility methods for chart type checking and updates

### Chart Implementations

Each chart type extends `D3ChartBuilder` and implements:
- Chart-specific rendering logic
- Custom configuration options
- Data update mechanisms
- Export data formatting

## Available Chart Types

### Pie Chart (`PieChartBuilder`)

**Features:**
- SVG-based rendering for optimal performance
- Support for pie and donut charts
- Customizable colors, radius, and styling
- Interactive tooltips and animations
- Legend support
- Data export functionality

**Usage:**
```typescript
import { PieChartBuilder } from './d3-chart-builders';

const widget = PieChartBuilder.create()
  .setData(pieData)
  .setTitle('Asset Allocation')
  .setRadius(150)
  .setInnerRadius(50) // For donut chart
  .setColors(['#5470c6', '#91cc75', '#fac858'])
  .setTooltip(true, (d) => `${d.data.name}: ${d.data.value}%`)
  .setLegend(true, 'right')
  .setHeader('Portfolio Distribution')
  .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
  .build();
```

## Rendering Strategy

### SVG vs Canvas

The D3.js implementations use a hybrid approach:

1. **SVG for Pie Charts**: Used for pie charts due to their typically smaller data sets and need for precise control over individual segments.

2. **Canvas for Heavy Charts**: Future implementations (bar, line, scatter) will use Canvas rendering to handle large datasets efficiently and avoid DOM overload.

### Performance Considerations

- **SVG**: Better for interactive charts with fewer elements (< 1000 data points)
- **Canvas**: Better for static charts or charts with many data points (> 1000)
- **Hybrid**: Can combine both approaches for complex visualizations

## Configuration Options

### Common Options

```typescript
interface D3ChartOptions {
  title?: {
    text?: string;
    subtext?: string;
    fontSize?: number;
    color?: string;
  };
  tooltip?: {
    show?: boolean;
    formatter?: (d: any) => string;
  };
  legend?: {
    show?: boolean;
    position?: string;
  };
  colors?: string[];
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  backgroundColor?: string;
  width?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}
```

### Pie Chart Specific Options

```typescript
interface PieChartSeriesOptions {
  radius?: number;
  innerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sort?: ((a: PieChartData, b: PieChartData) => number) | null;
}
```

## Data Format

### Pie Chart Data

```typescript
interface PieChartData {
  value: number;
  name: string;
  color?: string; // Optional custom color
}
```

## API Methods

### Common Methods

- `setData(data)`: Set chart data
- `setTitle(text, subtext?)`: Set chart title
- `setColors(colors[])`: Set color palette
- `setTooltip(show, formatter?)`: Configure tooltips
- `setLegend(show, position?)`: Configure legend
- `setAnimation(enabled, duration?)`: Configure animations
- `setDimensions(width, height)`: Set chart dimensions
- `setMargins(top, right, bottom, left)`: Set chart margins
- `setHeader(title, options?)`: Set widget header
- `setPosition(position)`: Set widget position
- `build()`: Build the widget

### Pie Chart Specific Methods

- `setRadius(radius)`: Set outer radius
- `setInnerRadius(innerRadius)`: Set inner radius for donut charts
- `setPadAngle(padAngle)`: Set padding between segments
- `setCornerRadius(cornerRadius)`: Set corner radius for rounded segments
- `setSort(sortFunction)`: Set custom sort function

### Static Methods

- `updateData(widget, data)`: Update existing chart data
- `isPieChart(widget)`: Check if widget is a pie chart
- `exportData(widget)`: Export chart data
- `getExportHeaders(widget)`: Get export headers
- `getExportSheetName(widget)`: Get export sheet name

## Examples

See `d3-pieChart-examples.ts` for comprehensive usage examples including:

1. Basic pie chart
2. Advanced pie chart with custom options
3. Donut chart
4. Sorted pie chart
5. Interactive pie chart with events
6. Exportable pie chart
7. Multiple pie charts
8. Data updates
9. Export functionality

## Integration with Dashboard

The D3.js chart builders integrate seamlessly with the existing dashboard system:

1. **Widget Compatibility**: Uses the same `IWidget` interface
2. **Gridster Integration**: Supports the same positioning system
3. **Event Handling**: Compatible with existing event system
4. **Export Support**: Works with Excel/CSV export functionality
5. **State Management**: Supports widget state persistence

## Performance Benefits

### Compared to ECharts

- **Smaller Bundle Size**: D3.js is more modular
- **Better Control**: Direct access to DOM/SVG/Canvas
- **Custom Animations**: More flexible animation system
- **Memory Efficiency**: Better garbage collection for large datasets

### Best Practices

1. **Use SVG for Interactive Charts**: Better event handling
2. **Use Canvas for Static Charts**: Better performance for large datasets
3. **Implement Proper Cleanup**: Remove event listeners and DOM elements
4. **Optimize Animations**: Use `requestAnimationFrame` for smooth animations
5. **Lazy Loading**: Load D3.js only when needed

## Future Implementations

Planned chart types using Canvas rendering:

1. **Bar Chart**: For large datasets
2. **Line Chart**: For time series data
3. **Scatter Plot**: For correlation analysis
4. **Heatmap**: For matrix data visualization
5. **Area Chart**: For stacked time series
6. **Histogram**: For distribution analysis

## Dependencies

- **D3.js**: Core visualization library
- **@types/d3**: TypeScript definitions
- **uuid**: For generating unique widget IDs

## Installation

D3.js is already included in the project dependencies:

```bash
npm install d3 @types/d3
```

## Usage in Components

```typescript
import { PieChartBuilder } from '@moneyplant/dashboards/d3-chart-builders';

@Component({
  selector: 'app-dashboard',
  template: '<div id="pie-chart"></div>'
})
export class DashboardComponent {
  ngOnInit() {
    const widget = PieChartBuilder.create()
      .setData(this.chartData)
      .setHeader('Asset Allocation')
      .build();
    
    // Add widget to dashboard
    this.dashboardService.addWidget(widget);
  }
}
```

## Troubleshooting

### Common Issues

1. **Chart Not Rendering**: Check if container element exists
2. **Performance Issues**: Consider using Canvas for large datasets
3. **Memory Leaks**: Ensure proper cleanup in component destruction
4. **Type Errors**: Verify data format matches interface requirements

### Debug Tips

1. **Console Logging**: Use browser dev tools to inspect D3 selections
2. **Data Validation**: Verify data structure before rendering
3. **Performance Profiling**: Use browser performance tools
4. **Error Boundaries**: Implement error handling for chart failures

## Contributing

When adding new D3.js chart types:

1. Extend `D3ChartBuilder` abstract class
2. Implement required abstract methods
3. Add proper TypeScript interfaces
4. Include comprehensive examples
5. Update this documentation
6. Add unit tests
7. Consider performance implications 