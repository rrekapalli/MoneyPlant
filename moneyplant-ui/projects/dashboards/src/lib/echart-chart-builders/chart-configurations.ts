/**
 * Enum for common chart configuration presets
 * These configurations can be used across different chart types
 */
export enum ChartConfiguration {
  DEFAULT = 'default',
  FINANCIAL = 'financial',
  PERFORMANCE = 'performance',
  STACKED = 'stacked',
  MINIMAL = 'minimal',
  DARK_THEME = 'darkTheme',
  LIGHT_THEME = 'lightTheme',
  HIGH_CONTRAST = 'highContrast',
  DASHBOARD = 'dashboard',
  PRESENTATION = 'presentation'
}

/**
 * Area Chart specific configurations
 */
export enum AreaChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  FINANCIAL = ChartConfiguration.FINANCIAL,
  PERFORMANCE = ChartConfiguration.PERFORMANCE,
  STACKED = ChartConfiguration.STACKED,
  MINIMAL = ChartConfiguration.MINIMAL,
  SMOOTH_GRADIENT = 'smoothGradient',
  MULTI_SERIES = 'multiSeries',
  LARGE_DATASET = 'largeDataset'
}

/**
 * Bar Chart specific configurations
 */
export enum BarChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  FINANCIAL = ChartConfiguration.FINANCIAL,
  PERFORMANCE = ChartConfiguration.PERFORMANCE,
  STACKED = ChartConfiguration.STACKED,
  MINIMAL = ChartConfiguration.MINIMAL,
  HORIZONTAL = 'horizontal',
  GROUPED = 'grouped',
  WATERFALL = 'waterfall'
}

/**
 * Line Chart specific configurations
 */
export enum LineChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  FINANCIAL = ChartConfiguration.FINANCIAL,
  PERFORMANCE = ChartConfiguration.PERFORMANCE,
  MINIMAL = ChartConfiguration.MINIMAL,
  SMOOTH = 'smooth',
  STEPPED = 'stepped',
  MULTI_AXIS = 'multiAxis',
  TIME_SERIES = 'timeSeries'
}

/**
 * Pie Chart specific configurations
 */
export enum PieChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  FINANCIAL = ChartConfiguration.FINANCIAL,
  MINIMAL = ChartConfiguration.MINIMAL,
  DONUT = 'donut',
  NESTED = 'nested',
  ROSE = 'rose',
  SEMI_CIRCLE = 'semiCircle'
}

/**
 * Scatter Chart specific configurations
 */
export enum ScatterChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  PERFORMANCE = ChartConfiguration.PERFORMANCE,
  MINIMAL = ChartConfiguration.MINIMAL,
  BUBBLE = 'bubble',
  CORRELATION = 'correlation',
  CLUSTERING = 'clustering'
}

/**
 * Candlestick Chart specific configurations
 */
export enum CandlestickChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  FINANCIAL = ChartConfiguration.FINANCIAL,
  MINIMAL = ChartConfiguration.MINIMAL,
  TRADING = 'trading',
  VOLUME_ANALYSIS = 'volumeAnalysis',
  PRICE_ACTION = 'priceAction'
}

/**
 * Gauge Chart specific configurations
 */
export enum GaugeChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  PERFORMANCE = ChartConfiguration.PERFORMANCE,
  MINIMAL = ChartConfiguration.MINIMAL,
  DASHBOARD_KPI = 'dashboardKpi',
  SPEEDOMETER = 'speedometer',
  PROGRESS = 'progress'
}

/**
 * Heatmap Chart specific configurations
 */
export enum HeatmapChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  PERFORMANCE = ChartConfiguration.PERFORMANCE,
  MINIMAL = ChartConfiguration.MINIMAL,
  CORRELATION = 'correlation',
  CALENDAR = 'calendar',
  GEOGRAPHIC = 'geographic'
}

/**
 * Density Map specific configurations
 */
export enum DensityMapConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  MINIMAL = ChartConfiguration.MINIMAL,
  GEOGRAPHIC = 'geographic',
  POPULATION = 'population',
  HEAT_ZONES = 'heatZones',
  COUNTRY_VIEW = 'countryView'
}

/**
 * Polar Chart specific configurations
 */
export enum PolarChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  MINIMAL = ChartConfiguration.MINIMAL,
  RADAR = 'radar',
  CIRCULAR = 'circular',
  WIND_ROSE = 'windRose',
  SKILLS_CHART = 'skillsChart'
}

/**
 * Sankey Chart specific configurations
 */
export enum SankeyChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  MINIMAL = ChartConfiguration.MINIMAL,
  FLOW_ANALYSIS = 'flowAnalysis',
  BUDGET_FLOW = 'budgetFlow',
  ENERGY_FLOW = 'energyFlow',
  DATA_FLOW = 'dataFlow'
}

/**
 * Sunburst Chart specific configurations
 */
export enum SunburstChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  MINIMAL = ChartConfiguration.MINIMAL,
  HIERARCHICAL = 'hierarchical',
  FILE_SYSTEM = 'fileSystem',
  ORGANIZATION = 'organization',
  PORTFOLIO_BREAKDOWN = 'portfolioBreakdown'
}

/**
 * Treemap Chart specific configurations
 */
export enum TreemapChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  MINIMAL = ChartConfiguration.MINIMAL,
  HIERARCHICAL = 'hierarchical',
  FINANCIAL_BREAKDOWN = 'financialBreakdown',
  SIZE_COMPARISON = 'sizeComparison',
  SPACE_UTILIZATION = 'spaceUtilization'
}

/**
 * Stacked Area Chart specific configurations
 */
export enum StackedAreaChartConfiguration {
  DEFAULT = ChartConfiguration.DEFAULT,
  FINANCIAL = ChartConfiguration.FINANCIAL,
  PERFORMANCE = ChartConfiguration.PERFORMANCE,
  MINIMAL = ChartConfiguration.MINIMAL,
  PERCENTAGE = 'percentage',
  STREAM_GRAPH = 'streamGraph',
  CUMULATIVE = 'cumulative'
}

/**
 * Configuration metadata interface
 */
export interface ChartConfigurationMetadata {
  name: string;
  description: string;
  useCase: string;
  chartTypes: string[];
}

/**
 * Configuration metadata registry
 */
export const CHART_CONFIGURATION_METADATA: Record<string, ChartConfigurationMetadata> = {
  [ChartConfiguration.DEFAULT]: {
    name: 'Default',
    description: 'Standard chart styling with balanced appearance',
    useCase: 'General purpose charts',
    chartTypes: ['area', 'bar', 'line', 'pie', 'scatter', 'candlestick', 'gauge', 'heatmap', 'densityMap', 'polar', 'sankey', 'sunburst', 'treemap', 'stackedArea']
  },
  [ChartConfiguration.FINANCIAL]: {
    name: 'Financial',
    description: 'Green gradient theme optimized for financial data',
    useCase: 'Revenue, profit, financial metrics',
    chartTypes: ['area', 'bar', 'line', 'candlestick', 'pie', 'treemap', 'stackedArea']
  },
  [ChartConfiguration.PERFORMANCE]: {
    name: 'Performance',
    description: 'Red theme for performance monitoring and KPIs',
    useCase: 'Performance metrics, system monitoring',
    chartTypes: ['area', 'bar', 'line', 'scatter', 'gauge', 'heatmap', 'stackedArea']
  },
  [ChartConfiguration.STACKED]: {
    name: 'Stacked',
    description: 'Optimized for stacked chart visualizations',
    useCase: 'Multi-series data comparison',
    chartTypes: ['area', 'bar']
  },
  [ChartConfiguration.MINIMAL]: {
    name: 'Minimal',
    description: 'Clean styling with reduced visual elements',
    useCase: 'Dashboard space optimization, clean layouts',
    chartTypes: ['area', 'bar', 'line', 'pie', 'scatter', 'candlestick', 'gauge', 'heatmap', 'densityMap', 'polar', 'sankey', 'sunburst', 'treemap', 'stackedArea']
  },
  [ChartConfiguration.DARK_THEME]: {
    name: 'Dark Theme',
    description: 'Dark background theme for modern interfaces',
    useCase: 'Dark mode applications, modern dashboards',
    chartTypes: ['area', 'bar', 'line', 'pie', 'scatter', 'gauge', 'heatmap', 'polar', 'sunburst', 'treemap']
  },
  [ChartConfiguration.LIGHT_THEME]: {
    name: 'Light Theme',
    description: 'Light background theme for traditional interfaces',
    useCase: 'Light mode applications, print-friendly charts',
    chartTypes: ['area', 'bar', 'line', 'pie', 'scatter', 'gauge', 'heatmap', 'polar', 'sunburst', 'treemap']
  },
  [ChartConfiguration.HIGH_CONTRAST]: {
    name: 'High Contrast',
    description: 'High contrast colors for accessibility',
    useCase: 'Accessibility compliance, vision impairment support',
    chartTypes: ['area', 'bar', 'line', 'pie', 'scatter', 'gauge', 'heatmap', 'polar']
  },
  [ChartConfiguration.DASHBOARD]: {
    name: 'Dashboard',
    description: 'Optimized for dashboard layouts with compact spacing',
    useCase: 'Dashboard widgets, overview panels',
    chartTypes: ['area', 'bar', 'line', 'pie', 'scatter', 'gauge', 'heatmap', 'polar', 'stackedArea']
  },
  [ChartConfiguration.PRESENTATION]: {
    name: 'Presentation',
    description: 'Large text and elements for presentation mode',
    useCase: 'Presentations, large displays',
    chartTypes: ['area', 'bar', 'line', 'pie', 'scatter', 'gauge', 'polar', 'sunburst', 'treemap']
  }
};

/**
 * Helper functions for configuration management
 */
export class ChartConfigurationHelper {
  /**
   * Get all configurations for a specific chart type
   */
  static getConfigurationsForChartType(chartType: string): string[] {
    return Object.entries(CHART_CONFIGURATION_METADATA)
      .filter(([, metadata]) => metadata.chartTypes.includes(chartType))
      .map(([config]) => config);
  }

  /**
   * Get configuration metadata
   */
  static getConfigurationMetadata(configuration: string): ChartConfigurationMetadata | undefined {
    return CHART_CONFIGURATION_METADATA[configuration];
  }

  /**
   * Validate if configuration is supported for chart type
   */
  static isConfigurationSupportedForChartType(configuration: string, chartType: string): boolean {
    const metadata = CHART_CONFIGURATION_METADATA[configuration];
    return metadata ? metadata.chartTypes.includes(chartType) : false;
  }

  /**
   * Get all available configurations
   */
  static getAllConfigurations(): string[] {
    return Object.keys(CHART_CONFIGURATION_METADATA);
  }

  /**
   * Get configurations by use case
   */
  static getConfigurationsByUseCase(useCase: string): string[] {
    return Object.entries(CHART_CONFIGURATION_METADATA)
      .filter(([, metadata]) => metadata.useCase.toLowerCase().includes(useCase.toLowerCase()))
      .map(([config]) => config);
  }
} 