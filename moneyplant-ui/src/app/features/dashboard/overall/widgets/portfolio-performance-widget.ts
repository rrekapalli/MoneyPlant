import { IWidget, LineChartBuilder, LineChartData, FilterService } from '@dashboards/public-api';

// Default categories for portfolio performance
export const PORTFOLIO_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/**
 * Create the portfolio performance line chart widget
 */
export function createPortfolioPerformanceWidget(): IWidget {
  const widget = LineChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setXAxisData(PORTFOLIO_CATEGORIES)
    .setHeader('Portfolio Performance')
    .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
    .setTitle('Portfolio Performance', 'Last 6 Months')
    .setSmooth(true)
    .setAreaStyle('#5470c6', 0.3)
    .setLineStyle(3, '#5470c6', 'solid')
    .setSymbol('circle', 8)
    .setYAxisName('Portfolio Value ($)')
    .setTooltip('axis', '{b}: ${c}')
    .build();
    
  // Add filterColumn configuration
  if (widget.config) {
    widget.config.filterColumn = 'month';
  }
  
  return widget;
}

/**
 * Update portfolio performance widget data with filtering support
 */
export function updatePortfolioPerformanceData(
  widget: IWidget, 
  newData?: number[], 
  filterService?: FilterService
): void {
  let data = newData || [];
  let categories = PORTFOLIO_CATEGORIES;
  
  // If newData is provided, use it directly (from shared dashboard data)
  // Otherwise, apply filters if filter service is provided
  if (!newData && filterService) {
    const currentFilters = filterService.getFilterValues();
    
    if (currentFilters.length > 0) {
      // Use the filter service's applyFiltersToData method
      const filteredData = filterService.applyFiltersToData([], currentFilters);
      
      if (filteredData.length > 0) {
        // Map the filtered data back to values and categories
        data = filteredData.map((item: any) => item.value);
        categories = filteredData.map((item: any) => item.name);
      }
    }
  } else if (newData) {
    // If newData is provided, we need to reconstruct categories based on the data length
    // This is a simplified approach - in a real scenario, you might want to pass categories separately
    categories = newData.map((_, index) => PORTFOLIO_CATEGORIES[index] || `Month ${index + 1}`);
  }
  
  // Update widget data using LineChartBuilder
  LineChartBuilder.updateData(widget, data);
  
  // Also update the x-axis categories if they changed
  if (widget.config?.options) {
    const options = widget.config.options as any;
    if (options.xAxis) {
      // Handle both array and single object xAxis configurations
      if (Array.isArray(options.xAxis)) {
        options.xAxis[0].data = categories;
      } else {
        options.xAxis.data = categories;
      }
    }
  }
  
  // Force chart update if chart instance is available
  if (widget.chartInstance) {
    try {
      widget.chartInstance.setOption(widget.config?.options as any, true);
    } catch (error) {
      // Handle error silently
    }
  } else {
    // Try to update with retry mechanism
    const maxAttempts = 10;
    let attempts = 0;
    
    const retryUpdate = () => {
      attempts++;
      
      if (widget.chartInstance) {
        try {
          widget.chartInstance.setOption(widget.config?.options as any, true);
          return;
        } catch (error) {
          // Handle error silently
        }
      }
      
      if (attempts < maxAttempts) {
        const delay = Math.min(500 * Math.pow(1.5, attempts - 1), 2000);
        setTimeout(retryUpdate, delay);
      }
    };
    
    // Start retry with initial delay
    setTimeout(retryUpdate, 100);
  }
}

/**
 * Get updated portfolio data (simulated API call)
 */
export async function getUpdatedPortfolioData(): Promise<number[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [100000, 107000, 104000, 111000, 116000, 120000];
}

/**
 * Get alternative portfolio data for testing
 */
export function getAlternativePortfolioData(): number[] {
  return [100000, 103000, 101000, 106000, 109000, 113000];
} 