# Dashboard Grid Constants

This document explains the new dashboard grid constants system that replaces hardcoded values with responsive, maintainable constants.

## Overview

The dashboard grid constants system provides:
- **Desktop-first approach**: Desktop settings are the standard values
- **Responsive ratios**: Other screen sizes are calculated based on defined ratios
- **Maintainable constants**: Single source of truth for all grid settings
- **Type safety**: TypeScript constants with proper typing

## Constants Structure

### Screen Breakpoints
```typescript
export const SCREEN_BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1440
} as const;
```

### Responsive Ratios
```typescript
export const RESPONSIVE_RATIOS = {
  MOBILE: {
    COLS: 0.5,      // 50% of desktop columns
    ROWS: 0.8,      // 80% of desktop rows
    WIDTH: 0.6,     // 60% of desktop column width
    HEIGHT: 1.2     // 120% of desktop row height (taller for touch)
  },
  TABLET: {
    COLS: 0.75,     // 75% of desktop columns
    ROWS: 0.9,      // 90% of desktop rows
    WIDTH: 0.8,     // 80% of desktop column width
    HEIGHT: 1.0     // 100% of desktop row height
  },
  DESKTOP: {
    COLS: 1.0,      // 100% (standard)
    ROWS: 1.0,      // 100% (standard)
    WIDTH: 1.0,     // 100% (standard)
    HEIGHT: 1.0     // 100% (standard)
  },
  LARGE_DESKTOP: {
    COLS: 1.33,     // 133% of desktop columns
    ROWS: 1.1,      // 110% of desktop rows
    WIDTH: 1.2,     // 120% of desktop column width
    HEIGHT: 0.9     // 90% of desktop row height
  }
} as const;
```

### Desktop Settings (Standard Values)
```typescript
export const DESKTOP_GRID_SETTINGS = {
  MAX_COLS: 12,
  MIN_COLS: 1,
  MAX_ROWS: 100,
  MIN_ROWS: 1,
  FIXED_COL_WIDTH: 100,
  FIXED_ROW_HEIGHT: 50,
  MOBILE_BREAKPOINT: 640
} as const;
```

### Calculated Settings
- `MOBILE_GRID_SETTINGS`: Calculated from desktop using mobile ratios
- `TABLET_GRID_SETTINGS`: Calculated from desktop using tablet ratios
- `LARGE_DESKTOP_GRID_SETTINGS`: Calculated from desktop using large desktop ratios

## Usage Examples

### Basic Usage
```typescript
import { StandardDashboardBuilder, DESKTOP_GRID_SETTINGS } from '@dashboards/public-api';

// Create standard dashboard (uses desktop settings by default)
const dashboard = StandardDashboardBuilder.createStandard()
  .setDashboardId('my-dashboard')
  .build();
```

### Screen Size Specific
```typescript
import { StandardDashboardBuilder } from '@dashboards/public-api';

// Create mobile-optimized dashboard
const mobileDashboard = StandardDashboardBuilder.createMobile()
  .setDashboardId('mobile-dashboard')
  .build();

// Create tablet-optimized dashboard
const tabletDashboard = StandardDashboardBuilder.createTablet()
  .setDashboardId('tablet-dashboard')
  .build();

// Create large desktop-optimized dashboard
const largeDesktopDashboard = StandardDashboardBuilder.createLargeDesktop()
  .setDashboardId('large-desktop-dashboard')
  .build();
```

### Custom Screen Size
```typescript
import { StandardDashboardBuilder } from '@dashboards/public-api';

// Set specific screen size
const dashboard = StandardDashboardBuilder.createStandard()
  .setScreenSize('MOBILE')  // 'MOBILE' | 'TABLET' | 'DESKTOP' | 'LARGE_DESKTOP'
  .setDashboardId('custom-dashboard')
  .build();
```

### Using Constants Directly
```typescript
import { DESKTOP_GRID_SETTINGS, MOBILE_GRID_SETTINGS } from '@dashboards/public-api';

// Use constants directly
const dashboard = StandardDashboardBuilder.createStandard()
  .setMaxCols(DESKTOP_GRID_SETTINGS.MAX_COLS)
  .setMinCols(DESKTOP_GRID_SETTINGS.MIN_COLS)
  .setMaxRows(DESKTOP_GRID_SETTINGS.MAX_ROWS)
  .setMinRows(DESKTOP_GRID_SETTINGS.MIN_ROWS)
  .setFixedColWidth(DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH)
  .setFixedRowHeight(DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT)
  .setMobileBreakpoint(DESKTOP_GRID_SETTINGS.MOBILE_BREAKPOINT)
  .build();
```

## Layout Presets

### Available Presets
```typescript
export const LAYOUT_PRESETS = {
  COMPACT: {
    FIXED_COL_WIDTH: 80,
    FIXED_ROW_HEIGHT: 40,
    OUTER_MARGIN: false
  },
  STANDARD: {
    FIXED_COL_WIDTH: DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH,
    FIXED_ROW_HEIGHT: DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT,
    OUTER_MARGIN: true
  },
  SPACIOUS: {
    FIXED_COL_WIDTH: 120,
    FIXED_ROW_HEIGHT: 80,
    OUTER_MARGIN: true
  }
} as const;
```

### Using Layout Presets
```typescript
import { StandardDashboardBuilder } from '@dashboards/public-api';

// Compact layout
const compactDashboard = StandardDashboardBuilder.createStandard()
  .setCompactLayout()
  .build();

// Spacious layout
const spaciousDashboard = StandardDashboardBuilder.createStandard()
  .setSpaciousLayout()
  .build();
```

## Utility Functions

### Get Grid Settings for Screen Size
```typescript
import { getGridSettingsForScreenSize } from '@dashboards/public-api';

const mobileSettings = getGridSettingsForScreenSize('MOBILE');
const tabletSettings = getGridSettingsForScreenSize('TABLET');
const desktopSettings = getGridSettingsForScreenSize('DESKTOP');
const largeDesktopSettings = getGridSettingsForScreenSize('LARGE_DESKTOP');
```

### Calculate Responsive Values
```typescript
import { calculateResponsiveValue, DESKTOP_GRID_SETTINGS } from '@dashboards/public-api';

// Calculate mobile column width
const mobileColWidth = calculateResponsiveValue(
  DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH, 
  'MOBILE', 
  'WIDTH'
);
```

## Migration from Hardcoded Values

### Before (Hardcoded)
```typescript
const dashboard = StandardDashboardBuilder.createStandard()
  .setMaxCols(12)
  .setMinCols(1)
  .setMaxRows(100)
  .setMinRows(1)
  .setFixedColWidth(100)
  .setFixedRowHeight(50)
  .setMobileBreakpoint(640)
  .build();
```

### After (Using Constants)
```typescript
import { DESKTOP_GRID_SETTINGS } from '@dashboards/public-api';

const dashboard = StandardDashboardBuilder.createStandard()
  .setMaxCols(DESKTOP_GRID_SETTINGS.MAX_COLS)
  .setMinCols(DESKTOP_GRID_SETTINGS.MIN_COLS)
  .setMaxRows(DESKTOP_GRID_SETTINGS.MAX_ROWS)
  .setMinRows(DESKTOP_GRID_SETTINGS.MIN_ROWS)
  .setFixedColWidth(DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH)
  .setFixedRowHeight(DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT)
  .setMobileBreakpoint(DESKTOP_GRID_SETTINGS.MOBILE_BREAKPOINT)
  .build();
```

### Even Better (Using Preset Methods)
```typescript
const dashboard = StandardDashboardBuilder.createStandard()
  .setScreenSize('DESKTOP')  // Automatically applies all desktop settings
  .build();
```

## Benefits

1. **Maintainability**: Single source of truth for all grid settings
2. **Consistency**: All dashboards use the same base values
3. **Responsiveness**: Automatic calculation of responsive values
4. **Type Safety**: TypeScript constants prevent errors
5. **Flexibility**: Easy to modify ratios and add new screen sizes
6. **Performance**: Constants are calculated at compile time

## Customization

To customize the constants for your project:

1. **Modify Desktop Settings**: Change `DESKTOP_GRID_SETTINGS` to set your base values
2. **Adjust Ratios**: Modify `RESPONSIVE_RATIOS` to change how other screen sizes are calculated
3. **Add New Screen Sizes**: Extend the constants with new breakpoints and ratios
4. **Create Custom Presets**: Add new layout presets to `LAYOUT_PRESETS`

## Best Practices

1. **Use Desktop as Standard**: Always use desktop settings as your base values
2. **Test Responsive Behavior**: Verify that calculated values work well on all screen sizes
3. **Document Changes**: Update this documentation when modifying constants
4. **Use Preset Methods**: Prefer preset methods over manual constant usage when possible
5. **Consider Accessibility**: Ensure calculated values maintain good usability 