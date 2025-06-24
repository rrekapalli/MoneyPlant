import { StandardDashboardBuilder } from './standard-dashboard-builder';
import { IWidget } from '../entities/IWidget';
import { IFilterValues } from '../entities/IFilterValues';
import { GridType, DisplayGrid } from 'angular-gridster2';

/**
 * Examples demonstrating how to use the Dashboard Container Fluent API
 */

// Example 1: Basic Standard Dashboard
export function createBasicDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('basic-dashboard')
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 2: Edit Mode Dashboard
export function createEditModeDashboard(): any {
  return StandardDashboardBuilder.createEditMode()
    .setDashboardId('edit-dashboard')
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 3: Mobile Optimized Dashboard
export function createMobileDashboard(): any {
  return StandardDashboardBuilder.createMobile()
    .setDashboardId('mobile-dashboard')
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 4: Desktop Optimized Dashboard
export function createDesktopDashboard(): any {
  return StandardDashboardBuilder.createDesktop()
    .setDashboardId('desktop-dashboard')
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 5: Custom Configuration Dashboard
export function createCustomDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('custom-dashboard')
    .setGridType(GridType.VerticalFixed)
    .setDisplayGrid(DisplayGrid.Always)
    .setOuterMargin(true)
    .setDraggable(true)
    .setResizable(true)
    .setMaxCols(16)
    .setMinCols(1)
    .setMaxRows(100)
    .setMinRows(1)
    .setFixedColWidth(80)
    .setFixedRowHeight(80)
    .setMobileBreakpoint(768)
    .setWidgets([])
    .setFilterValues([])
    .setEditMode(true)
    .setChartHeight(350)
    .setDefaultChartHeight(450)
    .build();
}

// Example 6: Compact Layout Dashboard
export function createCompactDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('compact-dashboard')
    .setCompactLayout()
    .setGridDimensions(24, 50)
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 7: Spacious Layout Dashboard
export function createSpaciousDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('spacious-dashboard')
    .setSpaciousLayout()
    .setGridDimensions(8, 30)
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 8: Fluid Layout Dashboard
export function createFluidDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('fluid-dashboard')
    .setFluidLayout()
    .setResponsive(1024)
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 9: Fixed Layout Dashboard
export function createFixedDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('fixed-dashboard')
    .setFixedLayout()
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 10: Dashboard with Custom Callbacks
export function createDashboardWithCallbacks(
  onResize: (item: any, itemComponent: any) => void,
  onChange: (item: any, itemComponent: any) => void
): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('callback-dashboard')
    .setItemResizeCallback(onResize)
    .setItemChangeCallback(onChange)
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 11: Dashboard with Widgets
export function createDashboardWithWidgets(widgets: IWidget[]): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('widgets-dashboard')
    .setWidgets(widgets)
    .setFilterValues([])
    .build();
}

// Example 12: Dashboard with Filters
export function createDashboardWithFilters(filterValues: IFilterValues[]): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('filters-dashboard')
    .setWidgets([])
    .setFilterValues(filterValues)
    .build();
}

// Example 13: Advanced Custom Dashboard
export function createAdvancedDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('advanced-dashboard')
    .setGridType(GridType.VerticalFixed)
    .setDisplayGrid(DisplayGrid.Always)
    .setOuterMargin(true)
    .setDraggable(true)
    .setResizable(true)
    .setMaxCols(20)
    .setMinCols(2)
    .setMaxRows(80)
    .setMinRows(2)
    .setFixedColWidth(90)
    .setFixedRowHeight(90)
    .setMobileBreakpoint(1024)
    .enableEmptyCellInteractions()
    .setItemSizeConstraints(2, 8, 2, 10)
    .setWidgets([])
    .setFilterValues([])
    .setEditMode(true)
    .setChartHeight(400)
    .setDefaultChartHeight(500)
    .build();
}

// Example 14: Dynamic Configuration Update
export function updateDashboardConfig(
  currentConfig: any,
  updates: {
    isEditMode?: boolean;
    widgets?: IWidget[];
    filterValues?: IFilterValues[];
    chartHeight?: number;
  }
): any {
  const builder = StandardDashboardBuilder.createStandard();
  
  // Apply current configuration
  if (currentConfig.config) {
    builder.setCustomConfig(currentConfig.config);
  }
  if (currentConfig.widgets) {
    builder.setWidgets(currentConfig.widgets);
  }
  if (currentConfig.filterValues) {
    builder.setFilterValues(currentConfig.filterValues);
  }
  if (currentConfig.dashboardId) {
    builder.setDashboardId(currentConfig.dashboardId);
  }
  if (currentConfig.isEditMode !== undefined) {
    builder.setEditMode(currentConfig.isEditMode);
  }
  if (currentConfig.chartHeight) {
    builder.setChartHeight(currentConfig.chartHeight);
  }

  // Apply updates
  if (updates.isEditMode !== undefined) {
    if (updates.isEditMode) {
      builder.enableEditMode();
    } else {
      builder.disableEditMode();
    }
  }
  if (updates.widgets) {
    builder.setWidgets(updates.widgets);
  }
  if (updates.filterValues) {
    builder.setFilterValues(updates.filterValues);
  }
  if (updates.chartHeight) {
    builder.setChartHeight(updates.chartHeight);
  }

  return builder.build();
}

// Example 15: Responsive Dashboard Configuration
export function createResponsiveDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('responsive-dashboard')
    .setResponsive(768)
    .setGridType(GridType.VerticalFixed)
    .setDisplayGrid(DisplayGrid.None)
    .setOuterMargin(true)
    .setDraggable(false)
    .setResizable(false)
    .setMaxCols(12)
    .setMinCols(1)
    .setMaxRows(50)
    .setMinRows(1)
    .setFixedColWidth(100)
    .setFixedRowHeight(100)
    .setMobileBreakpoint(768)
    .setWidgets([])
    .setFilterValues([])
    .build();
}

// Example 16: Dashboard with Custom Grid Configuration
export function createCustomGridDashboard(): any {
  return StandardDashboardBuilder.createStandard()
    .setDashboardId('custom-grid-dashboard')
    .setGridType(GridType.VerticalFixed)
    .setDisplayGrid(DisplayGrid.Always)
    .setOuterMargin(false)
    .setDraggable(true)
    .setResizable(true)
    .setMaxCols(32)
    .setMinCols(1)
    .setMaxRows(100)
    .setMinRows(1)
    .setFixedColWidth(60)
    .setFixedRowHeight(60)
    .setMobileBreakpoint(480)
    .enableEmptyCellInteractions()
    .setEmptyCellConfig({
      enableEmptyCellClick: true,
      enableEmptyCellContextMenu: true,
      enableEmptyCellDrop: true,
      enableEmptyCellDrag: true,
      emptyCellDragMaxCols: 32,
      emptyCellDragMaxRows: 100
    })
    .setWidgets([])
    .setFilterValues([])
    .setEditMode(true)
    .build();
} 