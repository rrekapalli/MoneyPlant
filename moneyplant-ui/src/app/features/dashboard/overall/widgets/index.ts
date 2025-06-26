// Widget creation functions
export { createAssetAllocationWidget } from './asset-allocation-widget';
export { createMonthlyIncomeExpensesWidget } from './monthly-income-expenses-widget';
export { createPortfolioPerformanceWidget } from './portfolio-performance-widget';
export { createRiskReturnWidget } from './risk-return-widget';
export { createSavingsGoalWidget } from './savings-goal-widget';
export { createSpendingHeatmapWidget } from './spending-heatmap-widget';
export { createInvestmentDistributionWidget } from './investment-distribution-widget';
export { createAreaChartWidget, createStackedAreaChartWidget, createLargeScaleAreaChartWidget } from './area-chart-widget';
export { createPolarChartWidget, createMultiSeriesPolarChartWidget, createRadarPolarChartWidget } from './polar-chart-widget';
export { createStackedAreaChartWidget as createNewStackedAreaChartWidget, createPerformanceStackedAreaChartWidget, createMarketTrendStackedAreaChartWidget } from './stacked-area-chart-widget';
export { createTreemapChartWidget, createExpenseTreemapWidget, createLargeScaleTreemapWidget } from './treemap-chart-widget';
export { createSunburstChartWidget, createOrganizationalSunburstWidget, createLargeScaleSunburstWidget } from './sunburst-chart-widget';
export { createSankeyChartWidget, createInvestmentFlowSankeyWidget, createBudgetAllocationSankeyWidget, createMinimalSankeyChartWidget } from './sankey-chart-widget';
export { createCandlestickChartWidget, createAdvancedCandlestickChartWidget } from './candlestick-chart-widget';
export { createFilterWidget } from './filter-widget';
export { createMetricTiles, createAlternativeMetricTiles } from './metric-tiles';

// Dashboard data
export { DashboardDataRow, INITIAL_DASHBOARD_DATA } from './dashboard-data';

// Data update functions
export { updateAssetAllocationData } from './asset-allocation-widget';
export { updateMonthlyIncomeExpensesData } from './monthly-income-expenses-widget';
export { updatePortfolioPerformanceData } from './portfolio-performance-widget';
export { updateRiskReturnData } from './risk-return-widget';
export { updateSavingsGoalData } from './savings-goal-widget';
export { updateSpendingHeatmapData } from './spending-heatmap-widget';
export { updateInvestmentDistributionData } from './investment-distribution-widget';
export { updateAreaChartData } from './area-chart-widget';
export { updatePolarChartData } from './polar-chart-widget';
export { updateStackedAreaChartData } from './stacked-area-chart-widget';
export { updateTreemapChartData } from './treemap-chart-widget';
export { updateSunburstChartData } from './sunburst-chart-widget';
export { updateSankeyChartData } from './sankey-chart-widget';
export { updateFilterData, addFilter, removeFilter, clearAllFilters, getFilterValues } from './filter-widget';

// Data fetching functions
export { getUpdatedAssetAllocationData } from './asset-allocation-widget';
export { getUpdatedMonthlyData } from './monthly-income-expenses-widget';
export { getUpdatedPortfolioData } from './portfolio-performance-widget';
export { getUpdatedRiskReturnData } from './risk-return-widget';
export { getUpdatedSavingsGoalData } from './savings-goal-widget';
export { getUpdatedSpendingHeatmapData } from './spending-heatmap-widget';
export { getUpdatedInvestmentDistributionData } from './investment-distribution-widget';
export { getUpdatedAreaChartData } from './area-chart-widget';
export { getUpdatedPolarChartData } from './polar-chart-widget';
export { getUpdatedStackedAreaChartData } from './stacked-area-chart-widget';
export { getUpdatedTreemapChartData } from './treemap-chart-widget';
export { getUpdatedSunburstChartData } from './sunburst-chart-widget';
export { getUpdatedSankeyChartData } from './sankey-chart-widget';

// Alternative data functions
export { getAlternativeAssetAllocationData } from './asset-allocation-widget';
export { getAlternativeMonthlyData } from './monthly-income-expenses-widget';
export { getAlternativePortfolioData } from './portfolio-performance-widget';
export { getAlternativeRiskReturnData } from './risk-return-widget';
export { getAlternativeSavingsGoalData } from './savings-goal-widget';
export { getAlternativeSpendingHeatmapData } from './spending-heatmap-widget';
export { getAlternativeInvestmentDistributionData } from './investment-distribution-widget';
export { getAlternativeAreaChartData } from './area-chart-widget';
export { getAlternativePolarChartData } from './polar-chart-widget';
export { getAlternativeStackedAreaChartData } from './stacked-area-chart-widget';
export { getAlternativeTreemapChartData } from './treemap-chart-widget';
export { getAlternativeSunburstChartData } from './sunburst-chart-widget';
export { getAlternativeSankeyChartData } from './sankey-chart-widget';

// Static data exports (keeping only what still exists)
export { ASSET_ALLOCATION_COLORS } from './asset-allocation-widget';
export { MONTHLY_CATEGORIES } from './monthly-income-expenses-widget';
export { PORTFOLIO_CATEGORIES } from './portfolio-performance-widget';
export { RISK_RETURN_COLORS } from './risk-return-widget';
export { SAVINGS_GOAL_DATA } from './savings-goal-widget';
export { SPENDING_HEATMAP_DATA, HEATMAP_X_AXIS, HEATMAP_Y_AXIS } from './spending-heatmap-widget';
export { INVESTMENT_DISTRIBUTION_DATA } from './investment-distribution-widget';
export { sampleAreaChartData, sampleAreaChartXAxis } from './area-chart-widget';
export { samplePolarChartData } from './polar-chart-widget';
export { sampleStackedAreaChartData, sampleStackedAreaChartXAxis } from './stacked-area-chart-widget';
export { sampleTreemapData, alternativeTreemapData } from './treemap-chart-widget';
export { SUNBURST_DATA, ALTERNATIVE_SUNBURST_DATA } from './sunburst-chart-widget';
export { SANKEY_CHART_DATA, SANKEY_CHART_COLORS } from './sankey-chart-widget'; 