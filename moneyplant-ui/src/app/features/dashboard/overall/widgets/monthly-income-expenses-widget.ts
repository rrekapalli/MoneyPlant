import { IWidget, BarChartBuilder, BarChartData, FilterService, IFilterValues } from '@dashboards/public-api';

// Default categories for monthly data
export const MONTHLY_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/**
 * Create the monthly income vs expenses bar chart widget
 */
export function createMonthlyIncomeExpensesWidget(): IWidget {
  // Create data with both name and value properties for proper filtering
  const initialData: BarChartData[] = MONTHLY_CATEGORIES.map(month => ({
    name: month,
    value: 0
  }));

  const widget = BarChartBuilder.create()
    .setData(initialData) // Use structured data instead of empty array
    .setCategories(MONTHLY_CATEGORIES)
    .setHeader('Monthly Income vs Expenses')
    .setPosition({ x: 4, y: 0, cols: 6, rows: 8 })
    .setTitle('Monthly Income vs Expenses', 'Last 6 Months')
    .setColors(['#5470c6'])
    .setBarWidth('60%')
    .setBarBorderRadius(4)
    .setYAxisName('Amount ($)')
    .setTooltip('axis', '{b}: ${c}')
    .build();
    
  // Add filterColumn configuration - filter by month names (series.name)
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
  let structuredData: BarChartData[] = [];
  let categories = MONTHLY_CATEGORIES;
  
  // If newData is provided, convert to structured format with month names
  if (newData) {
    structuredData = newData.map((value, index) => ({
      name: MONTHLY_CATEGORIES[index] || `Month ${index + 1}`,
      value: value
    }));
  } else {
    // Create default structure with zero values
    structuredData = MONTHLY_CATEGORIES.map(month => ({
      name: month,
      value: 0
    }));
  }
  
  // If filter service is provided, apply filters
  if (filterService) {
    const currentFilters = filterService.getFilterValues();
    
    if (currentFilters.length > 0) {
      // Use the filter service's applyFiltersToData method
      const filteredData = filterService.applyFiltersToData(structuredData, currentFilters);
      
      if (filteredData.length > 0) {
        structuredData = filteredData;
        categories = filteredData.map((item: any) => item.name);
      }
    }
  }
  
  // Update widget data using BarChartBuilder
  BarChartBuilder.updateData(widget, structuredData);
  
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

/**
 * Create filter value from monthly income expenses widget click data
 * This ensures filtering uses month names (series.name) rather than values
 */
export function createMonthlyIncomeExpensesFilter(clickedData: any, event: any): IFilterValues | null {
  if (!event || event.dataIndex === undefined) {
    return null;
  }

  // Get the month name from the x-axis categories using the dataIndex
  const monthName = MONTHLY_CATEGORIES[event.dataIndex];
  
  if (!monthName) {
    return null;
  }

  return {
    accessor: 'month',
    filterColumn: 'month',
    month: monthName,
    value: monthName, // Use month name as the value for filtering
    amount: clickedData?.toString() || '0'
  };
} 