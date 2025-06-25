import { IWidget, BarChartBuilder, BarChartData, FilterService } from '@dashboards/public-api';

// Default categories for monthly data
export const MONTHLY_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/**
 * Create the monthly income vs expenses bar chart widget
 */
export function createMonthlyIncomeExpensesWidget(): IWidget {
  const widget = BarChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setCategories(MONTHLY_CATEGORIES)
    .setHeader('Monthly Income vs Expenses')
    .setPosition({ x: 4, y: 0, cols: 6, rows: 4 })
    .setTitle('Monthly Income vs Expenses', 'Last 6 Months')
    .setColors(['#5470c6'])
    .setBarWidth('60%')
    .setBarBorderRadius(4)
    .setYAxisName('Amount ($)')
    .setTooltip('axis', '{b}: ${c}')
    .build();
    
  // Add filterColumn configuration
  if (widget.config) {
    widget.config.filterColumn = 'month';
  }
  
  return widget;
}

/**
 * Update monthly income vs expenses widget data with filtering support
 */
export function updateMonthlyIncomeExpensesData(
  widget: IWidget, 
  newData?: number[], 
  filterService?: FilterService
): void {
  let data = newData || [];
  let categories = MONTHLY_CATEGORIES;
  
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
    categories = newData.map((_, index) => MONTHLY_CATEGORIES[index] || `Month ${index + 1}`);
  }
  
  // Update widget data using BarChartBuilder
  BarChartBuilder.updateData(widget, data);
  
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
      console.error('Error updating Monthly Income/Expenses chart:', error);
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
          console.error('Error updating Monthly Income/Expenses chart on retry:', error);
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
 * Get updated monthly data (simulated API call)
 */
export async function getUpdatedMonthlyData(): Promise<number[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [9500, 9800, 8200, 10000, 9200, 10800];
}

/**
 * Get alternative monthly data for testing
 */
export function getAlternativeMonthlyData(): number[] {
  return [9000, 9500, 8000, 9800, 9000, 10500];
} 