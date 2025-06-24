import { GridsterConfig, GridType, DisplayGrid } from 'angular-gridster2';
import { DashboardContainerBuilder } from './dashboard-container-builder';

/**
 * Standard Dashboard Container Builder
 * Provides a concrete implementation for standard dashboard containers
 */
export class StandardDashboardBuilder extends DashboardContainerBuilder<GridsterConfig> {
  
  /**
   * Get default configuration for standard dashboard
   */
  protected getDefaultConfig(): Partial<GridsterConfig> {
    return {
      gridType: GridType.VerticalFixed,
      displayGrid: DisplayGrid.None,
      outerMargin: true,
      draggable: {
        enabled: false,
      },
      resizable: {
        enabled: false,
      },
      maxCols: 12,
      minCols: 1,
      maxRows: 50,
      minRows: 1,
      fixedColWidth: 100,
      fixedRowHeight: 100,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      mobileBreakpoint: 640,
    };
  }

  /**
   * Enable edit mode with draggable and resizable widgets
   */
  enableEditMode(): this {
    return this
      .setDraggable(true)
      .setResizable(true)
      .setEditMode(true)
      .setDisplayGrid(DisplayGrid.Always);
  }

  /**
   * Disable edit mode (view-only)
   */
  disableEditMode(): this {
    return this
      .setDraggable(false)
      .setResizable(false)
      .setEditMode(false)
      .setDisplayGrid(DisplayGrid.None);
  }

  /**
   * Set responsive configuration
   */
  setResponsive(breakpoint: number = 640): this {
    return this.setMobileBreakpoint(breakpoint);
  }

  /**
   * Set compact layout (smaller margins and spacing)
   */
  setCompactLayout(): this {
    return this
      .setOuterMargin(false)
      .setFixedColWidth(80)
      .setFixedRowHeight(80);
  }

  /**
   * Set spacious layout (larger margins and spacing)
   */
  setSpaciousLayout(): this {
    return this
      .setOuterMargin(true)
      .setFixedColWidth(120)
      .setFixedRowHeight(120);
  }

  /**
   * Set grid layout with visible grid lines
   */
  setGridLayout(): this {
    return this.setDisplayGrid(DisplayGrid.Always);
  }

  /**
   * Set fluid layout (responsive columns)
   */
  setFluidLayout(): this {
    return this
      .setGridType(GridType.VerticalFixed)
      .setMaxCols(24)
      .setMinCols(1);
  }

  /**
   * Set fixed layout (non-responsive)
   */
  setFixedLayout(): this {
    return this
      .setGridType(GridType.Fit)
      .setMaxCols(12)
      .setMinCols(12);
  }

  /**
   * Configure for mobile devices
   */
  setMobileOptimized(): this {
    return this
      .setMobileBreakpoint(768)
      .setMaxCols(6)
      .setFixedColWidth(60)
      .setFixedRowHeight(60);
  }

  /**
   * Configure for desktop devices
   */
  setDesktopOptimized(): this {
    return this
      .setMaxCols(12)
      .setFixedColWidth(100)
      .setFixedRowHeight(100)
      .setMobileBreakpoint(1024);
  }

  /**
   * Set custom grid dimensions
   */
  setGridDimensions(cols: number, rows: number): this {
    return this
      .setMaxCols(cols)
      .setMinCols(cols)
      .setMaxRows(rows);
  }

  /**
   * Enable empty cell interactions
   */
  enableEmptyCellInteractions(): this {
    return this
      .setEmptyCellConfig({
        enableEmptyCellClick: true,
        enableEmptyCellContextMenu: true,
        enableEmptyCellDrop: true,
        enableEmptyCellDrag: true
      });
  }

  /**
   * Disable empty cell interactions
   */
  disableEmptyCellInteractions(): this {
    return this
      .setEmptyCellConfig({
        enableEmptyCellClick: false,
        enableEmptyCellContextMenu: false,
        enableEmptyCellDrop: false,
        enableEmptyCellDrag: false
      });
  }

  /**
   * Set custom item size constraints
   */
  setItemSizeConstraints(
    minCols: number = 1,
    maxCols: number = 12,
    minRows: number = 1,
    maxRows: number = 50
  ): this {
    return this
      .setMinCols(minCols)
      .setMaxCols(maxCols)
      .setMinRows(minRows)
      .setMaxRows(maxRows);
  }

  /**
   * Create a builder instance with common dashboard settings
   */
  static createStandard(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
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
      .setMobileBreakpoint(640);
  }

  /**
   * Create a builder instance for edit mode
   */
  static createEditMode(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .enableEditMode()
      .setMaxCols(12)
      .setMinCols(1)
      .setMaxRows(50)
      .setMinRows(1)
      .setFixedColWidth(100)
      .setFixedRowHeight(100)
      .setMobileBreakpoint(640);
  }

  /**
   * Create a builder instance for mobile devices
   */
  static createMobile(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .setMobileOptimized()
      .setCompactLayout();
  }

  /**
   * Create a builder instance for desktop devices
   */
  static createDesktop(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .setDesktopOptimized()
      .setSpaciousLayout();
  }
} 