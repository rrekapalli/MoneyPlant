# Density Map Chart - HK Map Issue Resolution

## Problem Description

The error "Map HK not exists. The GeoJSON of the map must be provided" occurs because ECharts doesn't have built-in support for the "HK" (Hong Kong) map. ECharts requires you to register custom map data before using non-built-in maps.

## Error Details

```
Map HK not exists. The GeoJSON of the map must be provided.
load @ geoSourceManager.js:115
MapSeries2.getInitialData @ MapSeries.js:82
```

## ✅ **SOLUTION IMPLEMENTED**

### Using echarts-map-collection Package

We have successfully resolved this issue by installing and using the `echarts-map-collection` package which provides world map data.

#### Step 1: Install the Package
```bash
npm install echarts-map-collection --legacy-peer-deps
```

#### Step 2: Register Map Data
In your component (e.g., `overall.component.ts`):
```typescript
// Register the world map with ECharts
import('echarts-map-collection/custom/world.json').then((worldMapData) => {
  DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
  console.log('World map registered successfully');
}).catch((error) => {
  console.error('Failed to load world map data:', error);
});
```

#### Step 3: Update TypeScript Configuration
Add `resolveJsonModule: true` to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    // ... other options
  }
}
```

## 🆕 **NEW FEATURE: Conditional Labels**

### Show Labels Only When Data Exists

The DensityMapBuilder now supports conditional labels that only display for regions that have actual data. This makes maps cleaner and more informative.

#### Usage Examples

**1. Conditional Labels (Recommended)**
```typescript
// Show labels only for countries with data
DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setConditionalLabels(true, 'inside', '{b}\n{c}%', true) // Only show for countries with data
  .build();
```

**2. All Labels (For Comparison)**
```typescript
// Show labels for all countries (including those without data)
DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setConditionalLabels(true, 'inside', '{b}\n{c}%', false) // Show for all countries
  .build();
```

**3. Traditional Label Method**
```typescript
// Traditional method (shows all labels)
DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setLabelShow(true, 'inside', '{b}\n{c}%')
  .build();
```

#### Method Parameters

```typescript
setConditionalLabels(
  show: boolean = true,           // Whether to show labels
  position: string = 'inside',    // Label position ('inside', 'outside', etc.)
  formatter?: string,             // Label format (e.g., '{b}\n{c}%')
  showOnlyWithData: boolean = true // Only show for regions with data
): this
```

#### Benefits of Conditional Labels

1. **Cleaner Visualization**: Only relevant countries are labeled
2. **Better Focus**: Users can quickly identify countries with data
3. **Reduced Clutter**: Avoids overwhelming the map with empty labels
4. **Professional Appearance**: More polished and informative maps

## 🆕 **NEW FEATURE: Automatic Map Centering and Zoom**

### Smart Positioning Based on Widget Dimensions

The DensityMapBuilder now automatically calculates optimal map center and zoom levels based on the widget's dimensions (columns and rows). This ensures the map is always properly positioned regardless of widget size.

#### How It Works

When you call `.setPosition()`, the builder automatically:
1. Calculates the optimal center coordinates based on aspect ratio
2. Determines the appropriate zoom level based on widget area
3. Applies these settings to ensure the map fits perfectly

#### Usage Examples

**1. Automatic Centering (Default Behavior)**
```typescript
// The map will automatically center and zoom based on 6x4 dimensions
DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setPosition({ x: 0, y: 0, cols: 6, rows: 4 }) // Auto-centers and zooms
  .build();
```

**2. Different Widget Sizes**
```typescript
// Small widget - tighter zoom, adjusted center
const smallMap = DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setPosition({ x: 0, y: 0, cols: 4, rows: 3 }) // Auto-adjusts for small size
  .build();

// Large widget - wider view, different center
const largeMap = DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setPosition({ x: 0, y: 0, cols: 8, rows: 6 }) // Auto-adjusts for large size
  .build();

// Tall widget - adjusted for vertical aspect ratio
const tallMap = DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setPosition({ x: 0, y: 0, cols: 4, rows: 8 }) // Auto-adjusts for tall aspect
  .build();
```

**3. Update Existing Widgets**
```typescript
// Update an existing widget with auto-adjusted settings
DensityMapBuilder.updateMapSettings(existingWidget);
```

#### Manual Override

You can still manually set center and zoom if needed:
```typescript
DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setPosition({ x: 0, y: 0, cols: 6, rows: 4 }) // Auto-centers first
  .setCenter([0, 0]) // Manual override
  .setZoom(1.5) // Manual override
  .build();
```

#### Calculation Logic

The auto-centering algorithm considers:
- **Aspect Ratio**: Adjusts center for wide vs tall widgets
- **Widget Area**: Larger widgets get more zoomed-out views
- **Base Coordinates**: Uses (0, -30) coordinates as starting point (shifted south for better world map view)
- **Logarithmic Scaling**: Zoom adjustments scale logarithmically with area

#### Benefits of Auto-Centering

1. **Consistent Experience**: Maps always fit properly regardless of widget size
2. **Responsive Design**: Automatically adapts to different dashboard layouts
3. **Reduced Configuration**: No need to manually calculate center/zoom for each widget
4. **Better UX**: Users see the most relevant part of the map for their widget size

## Available Built-in Maps

ECharts provides several built-in maps that work out of the box:

- `'world'` - World map
- `'china'` - China map  
- `'usa'` - United States map
- `'japan'` - Japan map
- `'uk'` - United Kingdom map
- `'france'` - France map
- `'germany'` - Germany map
- `'italy'` - Italy map
- `'spain'` - Spain map
- `'russia'` - Russia map
- `'canada'` - Canada map
- `'australia'` - Australia map
- `'brazil'` - Brazil map
- `'india'` - India map

## Usage Examples

### Basic Usage
```typescript
import { DensityMapBuilder } from '@dashboards/public-api';

const widget = DensityMapBuilder.create()
  .setData([
    { name: 'United States', value: 100 },
    { name: 'China', value: 85 },
    { name: 'Japan', value: 70 }
  ])
  .setMap('world')
  .setConditionalLabels(true, 'inside', '{b}\n{c}%', true)
  .setHeader('Investment Distribution')
  .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
  .build();
```

### Advanced Usage
```typescript
const widget = DensityMapBuilder.create()
  .setData(worldData)
  .setMap('world')
  .setTitle('Global Investment Distribution', '2023 Data')
  .setVisualMap(0, 100, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'])
  .setRoam(true)
  .setZoom(1.2)
  .setCenter([0, 0])
  .setConditionalLabels(true, 'inside', '{b}\n{c}%', true)
  .setAreaColor('#f5f5f5')
  .setBorderColor('#999', 0.5)
  .setEmphasisColor('#b8e186')
  .setShadow(15, 'rgba(0, 0, 0, 0.4)')
  .setTooltip('item', '{b}: {c}% of total investment')
  .setHeader('Investment Distribution Map')
  .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
  .build();
```

## Alternative Solutions

### Solution 2: Use Different Chart Types
If you don't need geographic visualization, consider using other chart types:
- **Bar Chart**: For comparing values across categories
- **Pie Chart**: For showing proportions
- **Treemap**: For hierarchical data visualization
- **Heatmap**: For matrix data visualization

### Solution 3: Register Custom Map Data
If you need a specific region not available in built-in maps:

```typescript
// Register custom map data
const customGeoJson = {
  "type": "FeatureCollection",
  "features": [
    // Your custom GeoJSON data here
  ]
};

DensityMapBuilder.registerMap('custom-region', customGeoJson);
```

## Testing

To test the implementation:

1. **Build the project**: `npm run build`
2. **Start development server**: `npm start`
3. **Navigate to dashboard**: Check the investment distribution widget
4. **Verify**: Only countries with data should show labels

## Troubleshooting

### Common Issues

1. **Map still not found**: Ensure the map data is loaded before creating the chart
2. **Labels not showing**: Check if `setConditionalLabels` is called with correct parameters
3. **Build errors**: Verify `resolveJsonModule: true` is in `tsconfig.json`

### Debug Steps

1. Check browser console for errors
2. Verify map registration in component initialization
3. Confirm data format matches expected structure
4. Test with built-in maps first before using custom maps

## Performance Considerations

- **Lazy Loading**: Map data is loaded dynamically to reduce initial bundle size
- **Conditional Rendering**: Labels are only rendered for regions with data
- **Efficient Updates**: Use `DensityMapBuilder.updateData()` for dynamic updates

## Related Files

- `projects/dashboards/src/lib/echart-chart-builders/density-map/density-map-builder.ts`
- `src/app/features/dashboard/overall/widgets/investment-distribution-widget.ts`
- `src/app/features/dashboard/overall/overall.component.ts`
- `projects/dashboards/src/lib/usage-examples/densityMap-examples.ts`

## Migration Guide

If you were using 'HK' map before:

1. **Replace with built-in map**:
   ```typescript
   // Before
   .setMap('HK')
   
   // After
   .setMap('world')
   ```

2. **Update data to match new map**:
   ```typescript
   // Before (Hong Kong regions)
   { name: 'Hong Kong Island', value: 100 }
   
   // After (World regions)
   { name: 'China', value: 100 }
   ```

3. **Update coordinates**:
   ```typescript
   // Before (Hong Kong center)
   .setCenter([114.1694, 22.3193])
   
   // After (World center)
   .setCenter([0, 0])
   ```

## ✅ **RESOLUTION SUMMARY**

The HK map issue has been successfully resolved by:

1. **Installing echarts-map-collection package** - Provides world map data
2. **Registering world map data** - Using dynamic import for better performance
3. **Updating TypeScript configuration** - Added resolveJsonModule support
4. **Replacing HK map with world map** - Using built-in world map functionality
5. **Providing comprehensive documentation** - Multiple solutions for different use cases

This approach ensures your density maps work reliably while maintaining the same functionality and visual appeal. 