import { IWidget, PieChartBuilder, PieChartData, IFilterValues, FilterService } from '@dashboards/public-api';

// Test data that can be filtered
export const TEST_FILTER_DATA: PieChartData[] = [
  { value: 30, name: 'Technology' },
  { value: 25, name: 'Healthcare' },
  { value: 20, name: 'Finance' },
  { value: 15, name: 'Energy' },
  { value: 10, name: 'Consumer' },
];

export const TEST_FILTER_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];

/**
 * Create a test widget to demonstrate filtering
 */
export function createTestFilterWidget(): IWidget {
  const widget = PieChartBuilder.create()
    .setData(TEST_FILTER_DATA)
    .setHeader('Test Filter Widget')
    .setPosition({ x: 8, y: 1, cols: 4, rows: 8 })
    .setColors(TEST_FILTER_COLORS)
    .setRadius(['40%', '70%'])
    .setLabelFormatter('{b}: {c} ({d}%)')
    .setTooltip('item', '{b}: {c} ({d}%)')
    .build();
    
  // Add filterColumn configuration
  if (widget.config) {
    widget.config.filterColumn = 'sector';
  }
  
  return widget;
}

/**
 * Update test filter widget data with filtering support
 */
export function updateTestFilterData(
  widget: IWidget, 
  newData?: PieChartData[], 
  filterService?: FilterService
): void {
  // Use provided data or get from filter service
  let dataToUse = newData;
  
  if (!dataToUse && filterService) {
    const currentFilters = filterService.getFilterValues();
    
    if (currentFilters && currentFilters.length > 0) {
      // Apply filters to the original data
      dataToUse = filterService.applyFiltersToData(TEST_FILTER_DATA, currentFilters);
    } else {
      dataToUse = TEST_FILTER_DATA;
    }
  } else if (!dataToUse) {
    dataToUse = TEST_FILTER_DATA;
  }

  // Update widget data
  widget.data = dataToUse;

  // Update chart options with new data
  if (widget.config?.options) {
    const options = widget.config.options as any;
    
    // Create new options object to trigger change detection
    const newOptions = {
      ...options,
      series: [
        {
          ...options.series[0],
          data: dataToUse
        }
      ]
    };
    
    widget.config.options = newOptions;
  }

  // Function to update the chart using multiple approaches
  const updateChart = () => {
    if (widget.chartInstance) {
      try {
        // Method 1: Direct setOption
        widget.chartInstance.setOption(widget.config?.options as any, true);
        return true;
      } catch (error) {
        try {
          // Method 2: Force resize and update
          widget.chartInstance.resize();
          widget.chartInstance.setOption(widget.config?.options as any);
          return true;
        } catch (error2) {
          return false;
        }
      }
    } else {
      return false;
    }
  };

  // Try to update immediately
  if (!updateChart()) {
    // If chart instance is not available, try with increasing delays
    const maxAttempts = 15; // Increased max attempts
    let attempts = 0;
    
    const retryUpdate = () => {
      attempts++;
      
      if (updateChart()) {
        return;
      }
      
      if (attempts < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(1.5, attempts - 1), 5000); // Exponential backoff with max 5s
        setTimeout(retryUpdate, delay);
      }
    };
    
    // Start retry with initial delay
    setTimeout(retryUpdate, 100);
  }

  // Force change detection by scheduling multiple cycles
  setTimeout(() => {
    // This will trigger Angular's change detection
    if (widget.chartInstance) {
      widget.chartInstance.resize();
    }
  }, 50);

  setTimeout(() => {
    if (widget.chartInstance) {
      widget.chartInstance.setOption(widget.config?.options as any, true);
    }
  }, 150);

  setTimeout(() => {
    if (widget.chartInstance) {
      widget.chartInstance.resize();
      widget.chartInstance.setOption(widget.config?.options as any);
    }
  }, 300);
}

/**
 * Create filter value from test widget click data
 */
export function createTestFilterValue(clickedData: any): IFilterValues | null {
  if (!clickedData || !clickedData.name) {
    return null;
  }

  return {
    accessor: 'category',
    filterColumn: 'sector',
    category: clickedData.name,
    sector: clickedData.name,
    value: clickedData.name,
    percentage: clickedData.value?.toString() || '0',
    source: 'test-widget'
  };
} 