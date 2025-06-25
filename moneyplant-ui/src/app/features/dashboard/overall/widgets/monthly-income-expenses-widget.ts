import { IWidget, BarChartBuilder, BarChartData, FilterService } from '@dashboards/public-api';

// Static data for monthly income vs expenses
export const MONTHLY_DATA: BarChartData[] = [
  { name: 'Jan', value: 8500 },
  { name: 'Feb', value: 9200 },
  { name: 'Mar', value: 7800 },
  { name: 'Apr', value: 9500 },
  { name: 'May', value: 8800 },
  { name: 'Jun', value: 10200 }
];

export const MONTHLY_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/**
 * Create the monthly income vs expenses bar chart widget
 */
export function createMonthlyIncomeExpensesWidget(): IWidget {
  const widget = BarChartBuilder.create()
    .setData(MONTHLY_DATA.map(d => d.value))
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
  let data = newData || MONTHLY_DATA.map(d => d.value);
  let categories = MONTHLY_CATEGORIES;
  
  // Apply filters if filter service is provided
  if (filterService) {
    const currentFilters = filterService.getFilterValues();
    
    if (currentFilters.length > 0) {
      // Use the filter service's applyFiltersToData method
      const filteredData = filterService.applyFiltersToData(MONTHLY_DATA, currentFilters);
      
      if (filteredData.length !== MONTHLY_DATA.length) {
        // If filtering occurred, map the filtered data back to values and categories
        data = filteredData.map(item => item.value);
        categories = filteredData.map(item => item.name);
      }
    }
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