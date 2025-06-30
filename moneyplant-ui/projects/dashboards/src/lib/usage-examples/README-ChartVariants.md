# Chart Variants Documentation

This document provides comprehensive guidance on using the new chart variant system implemented in the MoneyPlant Dashboard library. The variant system allows you to easily switch between different visual styles and behaviors for your charts using enum-based parameters.

## Overview

The chart variant system introduces a unified way to apply different visual styles and configurations to your charts through the `setVariant()` method. This approach is inspired by the [Apache ECharts examples](https://echarts.apache.org/examples/en/index.html) and provides pre-configured chart styles for common use cases.

### Supported Chart Types

- **Pie Charts** - 5 variants available
- **Bar Charts** - 4 variants available
- **Line Charts** - 5 variants available
- **Scatter Charts** - 3 variants available
- **Area Charts** - 4 variants available
- **Gauge Charts** - 4 variants available
- More chart types coming soon...

## Pie Chart Variants

### Available Variants

```typescript
export enum PIE_VARIANTS {
  STANDARD = 'standard',        // Traditional full pie chart
  DOUGHNUT = 'doughnut',       // Ring-style chart with center hole
  NIGHTINGALE = 'nightingale',  // Rose chart (radius varies by value)
  HALF_DOUGHNUT = 'half_doughnut', // Semi-circle doughnut
  NESTED = 'nested'            // For multi-series nested pie charts
}
```

### Usage Examples

#### 1. Standard Pie Chart
Traditional pie chart with full circle display:

```typescript
import { PieChartBuilder, PIE_VARIANTS } from '@moneyplant/dashboards';

const widget = PieChartBuilder.create()
  .setData([
    { value: 45, name: 'Stocks' },
    { value: 25, name: 'Bonds' },
    { value: 15, name: 'Cash' },
    { value: 10, name: 'Real Estate' },
    { value: 5, name: 'Commodities' }
  ])
  .setVariant(PIE_VARIANTS.STANDARD)
  .setHeader('Asset Allocation - Standard')
  .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
  .build();
```

**Configuration Applied:**
- Radius: `['0%', '60%']` (full circle)
- Labels: Outside position with label lines
- No rose type effect

#### 2. Doughnut Chart
Ring-style chart with center area for additional information:

```typescript
const widget = PieChartBuilder.create()
  .setData(data)
  .setVariant(PIE_VARIANTS.DOUGHNUT)
  .setHeader('Asset Allocation - Doughnut')
  .build();
```

**Configuration Applied:**
- Radius: `['40%', '70%']` (creates ring effect)
- Labels: Hidden by default, shown on hover in center
- Center highlighting on mouseover
- Ideal for: KPI displays, portfolio overviews

#### 3. Nightingale (Rose) Chart
Radius varies by data value, creating a rose-like appearance:

```typescript
const widget = PieChartBuilder.create()
  .setData(data)
  .setVariant(PIE_VARIANTS.NIGHTINGALE)
  .setHeader('Asset Allocation - Nightingale')
  .build();
```

**Configuration Applied:**
- Rose type: `'area'` (radius represents value)
- Radius: `['20%', '80%']` (wide range for visual impact)
- Labels: Outside position for clarity
- Ideal for: Comparative analysis, highlighting value differences

#### 4. Half Doughnut Chart
Semi-circle doughnut for compact displays:

```typescript
const widget = PieChartBuilder.create()
  .setData(data)
  .setVariant(PIE_VARIANTS.HALF_DOUGHNUT)
  .setHeader('Asset Allocation - Half Doughnut')
  .build();
```

**Configuration Applied:**
- Start angle: `180°`, End angle: `360°` (semi-circle)
- Center position: `['50%', '75%']` (adjusted for half display)
- Radius: `['40%', '70%']`
- Ideal for: Gauges, progress indicators, compact dashboards

#### 5. Nested Pie Chart
Foundation for multi-series nested pie charts:

```typescript
const widget = PieChartBuilder.create()
  .setData(data)
  .setVariant(PIE_VARIANTS.NESTED)
  .setHeader('Asset Allocation - Nested')
  .build();
```

**Configuration Applied:**
- Radius: `['30%', '60%']` (leaves room for additional series)
- Standard labeling for clarity
- Ideal for: Hierarchical data, category breakdowns

## Bar Chart Variants

### Available Variants

```typescript
export enum BAR_VARIANTS {
  VERTICAL = 'vertical',      // Standard vertical bars
  HORIZONTAL = 'horizontal',  // Horizontal bars (rotated)
  STACKED = 'stacked',       // Stacked bars for multiple series
  WATERFALL = 'waterfall'    // Waterfall chart for cumulative effects
}
```

### Usage Examples

#### 1. Vertical Bar Chart
Standard vertical bar chart (default):

```typescript
import { BarChartBuilder, BAR_VARIANTS } from '@moneyplant/dashboards';

const widget = BarChartBuilder.create()
  .setData([
    { name: 'Q1', value: 45 },
    { name: 'Q2', value: 65 },
    { name: 'Q3', value: 55 },
    { name: 'Q4', value: 75 }
  ])
  .setCategories(['Q1', 'Q2', 'Q3', 'Q4'])
  .setVariant(BAR_VARIANTS.VERTICAL)
  .setHeader('Quarterly Sales - Vertical')
  .build();
```

**Configuration Applied:**
- X-axis: Category type with data labels
- Y-axis: Value type for measurements
- Tooltip: Axis-triggered with shadow pointer
- Ideal for: Time series, category comparisons

#### 2. Horizontal Bar Chart
Rotated bar chart for better label readability:

```typescript
const widget = BarChartBuilder.create()
  .setData(data)
  .setCategories(categories)
  .setVariant(BAR_VARIANTS.HORIZONTAL)
  .setHeader('Department Performance - Horizontal')
  .build();
```

**Configuration Applied:**
- X-axis: Value type (measurements)
- Y-axis: Category type (labels)
- Ideal for: Long category names, ranking displays

#### 3. Stacked Bar Chart
Multiple data series stacked together:

```typescript
const widget = BarChartBuilder.create()
  .setData(data)
  .setCategories(categories)
  .setVariant(BAR_VARIANTS.STACKED)
  .setHeader('Multi-Product Sales - Stacked')
  .build();
```

**Configuration Applied:**
- Stack property: `'total'` (groups series together)
- Standard vertical orientation
- Ideal for: Part-to-whole relationships, multi-series comparisons

#### 4. Waterfall Chart
Shows cumulative effect of sequential positive/negative values:

```typescript
const waterfallData = [
  { name: 'Starting', value: 900 },
  { name: 'Growth', value: 345 },
  { name: 'Loss', value: -154 },
  { name: 'Recovery', value: 135 }
];

const widget = BarChartBuilder.create()
  .setData(waterfallData)
  .setCategories(waterfallData.map(d => d.name))
  .setVariant(BAR_VARIANTS.WATERFALL)
  .setHeader('Financial Flow - Waterfall')
  .build();
```

**Configuration Applied:**
- Stack property: `'waterfall'`
- Special handling for helper bars (transparent)
- X-axis: Split lines hidden
- Ideal for: Financial analysis, cumulative changes, step-by-step processes

## Line Chart Variants

### Available Variants

```typescript
export enum LINE_VARIANTS {
  BASIC = 'basic',        // Standard line chart with markers and straight lines
  SMOOTH = 'smooth',       // Curved lines for smooth transitions between data points
  AREA = 'area',           // Line chart with filled area underneath for emphasis
  STEPPED = 'stepped',     // Step-line chart for discrete data changes
  STACKED = 'stacked'      // Stacked line chart with area fill for multiple series
}
```

### Usage Examples

#### 1. Basic Line Chart
Standard line chart with markers and straight lines:

```typescript
import { LineChartBuilder, LINE_VARIANTS } from '@moneyplant/dashboards';

const widget = LineChartBuilder.create()
  .setData([
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 132 },
    { name: 'Mar', value: 101 }
  ])
  .setXAxisData(['Jan', 'Feb', 'Mar'])
  .setVariant(LINE_VARIANTS.BASIC)
  .setHeader('Monthly Trend')
  .build();
```

**Configuration Applied:**
- Line style: Solid
- Marker: Circle
- Ideal for: Standard time series or trends

#### 2. Smooth Line Chart
Curved lines for smooth transitions between data points:

```typescript
const widget = LineChartBuilder.create()
  .setData([
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 132 },
    { name: 'Mar', value: 101 }
  ])
  .setXAxisData(['Jan', 'Feb', 'Mar'])
  .setVariant(LINE_VARIANTS.SMOOTH)
  .setHeader('Monthly Trend')
  .build();
```

**Configuration Applied:**
- Line style: Curved
- Ideal for: Continuous data with natural curves

#### 3. Area Line Chart
Line chart with filled area underneath for emphasis:

```typescript
const widget = LineChartBuilder.create()
  .setData([
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 132 },
    { name: 'Mar', value: 101 }
  ])
  .setXAxisData(['Jan', 'Feb', 'Mar'])
  .setVariant(LINE_VARIANTS.AREA)
  .setHeader('Monthly Trend')
  .build();
```

**Configuration Applied:**
- Line style: Solid
- Area style: Solid fill
- Ideal for: Emphasize magnitude of change

#### 4. Stepped Line Chart
Step-line chart for discrete data changes:

```typescript
const widget = LineChartBuilder.create()
  .setData([
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 132 },
    { name: 'Mar', value: 101 }
  ])
  .setXAxisData(['Jan', 'Feb', 'Mar'])
  .setVariant(LINE_VARIANTS.STEPPED)
  .setHeader('Monthly Trend')
  .build();
```

**Configuration Applied:**
- Line style: Stepped
- Ideal for: Discrete state changes

#### 5. Stacked Line Chart
Stacked line chart with area fill for multiple series:

```typescript
const widget = LineChartBuilder.create()
  .setData([
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 132 },
    { name: 'Mar', value: 101 }
  ])
  .setXAxisData(['Jan', 'Feb', 'Mar'])
  .setVariant(LINE_VARIANTS.STACKED)
  .setHeader('Monthly Trend')
  .build();
```

**Configuration Applied:**
- Line style: Solid
- Area style: Stacked fill
- Ideal for: Multiple series totals

## Scatter Chart Variants

### Available Variants

```typescript
export enum SCATTER_VARIANTS {
  BASIC = 'basic',        // Standard scatter plot with fixed symbol sizes
  BUBBLE = 'bubble',       // Bubble chart with varying symbol sizes based on data values
  LARGE_DATASET = 'large_dataset'  // Optimized for large datasets with progressive rendering
}
```

### Usage Examples

#### 1. Basic Scatter Plot
Standard scatter plot with fixed symbol sizes:

```typescript
import { ScatterChartBuilder, SCATTER_VARIANTS } from '@moneyplant/dashboards';

const widget = ScatterChartBuilder.create()
  .setData([
    { value: [10, 20], name: 'Point A' },
    { value: [15, 25], name: 'Point B' },
    { value: [20, 30], name: 'Point C' }
  ])
  .setVariant(SCATTER_VARIANTS.BASIC)
  .setXAxisName('Risk Level')
  .setYAxisName('Return Rate')
  .setHeader('Risk vs Return Analysis')
  .build();
```

**Configuration Applied:**
- Symbol: Circle
- Ideal for: Correlation analysis

#### 2. Bubble Chart
Bubble chart with varying symbol sizes based on data values:

```typescript
const widget = ScatterChartBuilder.create()
  .setData([
const widget = PieChartBuilder.create()
  .setData(data)
  .setVariant(PIE_VARIANTS.DOUGHNUT)
  .build();
```

### Backward Compatibility

The variant system is fully backward compatible:
- Existing method calls continue to work
- Variants can be combined with existing customization methods
- No breaking changes to existing APIs

## Future Enhancements

Planned additions to the variant system:
- Line chart variants (smooth, stepped, area, stacked)
- Scatter plot variants (bubble, cluster, heatmap)
- Advanced pie variants (scrollable legend, multi-level nested)
- Custom variant creation API
- Theme-based variant sets

## Support and Examples

For more examples and support:
- See `pieChart-examples.ts` for comprehensive pie chart examples
- See `barChart-examples.ts` for comprehensive bar chart examples
- Check the main documentation for general chart builder usage
- Visit the Apache ECharts examples site for inspiration: https://echarts.apache.org/examples/

The variant system makes it easy to create professional, visually appealing charts that follow best practices while maintaining the flexibility to customize further when needed. 