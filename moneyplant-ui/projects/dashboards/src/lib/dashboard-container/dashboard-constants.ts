/**
 * Dashboard Grid Constants
 * Desktop settings are used as the standard values
 * Other screen sizes are calculated based on responsive ratios
 */

// Screen size breakpoints (in pixels)
export const SCREEN_BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1440
} as const;

// Responsive ratios for different screen sizes
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

// Desktop settings (standard values)
export const DESKTOP_GRID_SETTINGS = {
  MAX_COLS: 12,
  MIN_COLS: 1,
  MAX_ROWS: 100,
  MIN_ROWS: 1,
  FIXED_COL_WIDTH: 100,
  FIXED_ROW_HEIGHT: 50,
  MOBILE_BREAKPOINT: 640
} as const;

// Mobile settings (calculated from desktop using ratios)
export const MOBILE_GRID_SETTINGS = {
  MAX_COLS: Math.round(DESKTOP_GRID_SETTINGS.MAX_COLS * RESPONSIVE_RATIOS.MOBILE.COLS),
  MIN_COLS: Math.round(DESKTOP_GRID_SETTINGS.MIN_COLS * RESPONSIVE_RATIOS.MOBILE.COLS),
  MAX_ROWS: Math.round(DESKTOP_GRID_SETTINGS.MAX_ROWS * RESPONSIVE_RATIOS.MOBILE.ROWS),
  MIN_ROWS: Math.round(DESKTOP_GRID_SETTINGS.MIN_ROWS * RESPONSIVE_RATIOS.MOBILE.ROWS),
  FIXED_COL_WIDTH: Math.round(DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH * RESPONSIVE_RATIOS.MOBILE.WIDTH),
  FIXED_ROW_HEIGHT: Math.round(DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT * RESPONSIVE_RATIOS.MOBILE.HEIGHT),
  MOBILE_BREAKPOINT: SCREEN_BREAKPOINTS.MOBILE
} as const;

// Tablet settings (calculated from desktop using ratios)
export const TABLET_GRID_SETTINGS = {
  MAX_COLS: Math.round(DESKTOP_GRID_SETTINGS.MAX_COLS * RESPONSIVE_RATIOS.TABLET.COLS),
  MIN_COLS: Math.round(DESKTOP_GRID_SETTINGS.MIN_COLS * RESPONSIVE_RATIOS.TABLET.COLS),
  MAX_ROWS: Math.round(DESKTOP_GRID_SETTINGS.MAX_ROWS * RESPONSIVE_RATIOS.TABLET.ROWS),
  MIN_ROWS: Math.round(DESKTOP_GRID_SETTINGS.MIN_ROWS * RESPONSIVE_RATIOS.TABLET.ROWS),
  FIXED_COL_WIDTH: Math.round(DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH * RESPONSIVE_RATIOS.TABLET.WIDTH),
  FIXED_ROW_HEIGHT: Math.round(DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT * RESPONSIVE_RATIOS.TABLET.HEIGHT),
  MOBILE_BREAKPOINT: SCREEN_BREAKPOINTS.TABLET
} as const;

// Large desktop settings (calculated from desktop using ratios)
export const LARGE_DESKTOP_GRID_SETTINGS = {
  MAX_COLS: Math.round(DESKTOP_GRID_SETTINGS.MAX_COLS * RESPONSIVE_RATIOS.LARGE_DESKTOP.COLS),
  MIN_COLS: Math.round(DESKTOP_GRID_SETTINGS.MIN_COLS * RESPONSIVE_RATIOS.LARGE_DESKTOP.COLS),
  MAX_ROWS: Math.round(DESKTOP_GRID_SETTINGS.MAX_ROWS * RESPONSIVE_RATIOS.LARGE_DESKTOP.ROWS),
  MIN_ROWS: Math.round(DESKTOP_GRID_SETTINGS.MIN_ROWS * RESPONSIVE_RATIOS.LARGE_DESKTOP.ROWS),
  FIXED_COL_WIDTH: Math.round(DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH * RESPONSIVE_RATIOS.LARGE_DESKTOP.WIDTH),
  FIXED_ROW_HEIGHT: Math.round(DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT * RESPONSIVE_RATIOS.LARGE_DESKTOP.HEIGHT),
  MOBILE_BREAKPOINT: SCREEN_BREAKPOINTS.LARGE_DESKTOP
} as const;

// Layout presets
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

// Utility function to get grid settings for a specific screen size
export function getGridSettingsForScreenSize(screenSize: keyof typeof RESPONSIVE_RATIOS) {
  switch (screenSize) {
    case 'MOBILE':
      return MOBILE_GRID_SETTINGS;
    case 'TABLET':
      return TABLET_GRID_SETTINGS;
    case 'DESKTOP':
      return DESKTOP_GRID_SETTINGS;
    case 'LARGE_DESKTOP':
      return LARGE_DESKTOP_GRID_SETTINGS;
    default:
      return DESKTOP_GRID_SETTINGS;
  }
}

// Utility function to calculate responsive values
export function calculateResponsiveValue(
  desktopValue: number, 
  screenSize: keyof typeof RESPONSIVE_RATIOS,
  property: keyof typeof RESPONSIVE_RATIOS.DESKTOP
): number {
  const ratio = RESPONSIVE_RATIOS[screenSize][property];
  return Math.round(desktopValue * ratio);
} 