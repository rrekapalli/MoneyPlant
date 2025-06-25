import { IWidget, PieChartBuilder, PieChartData, IFilterValues } from '@dashboards/public-api';
import { FilterService } from '../../../../services/filter.service';

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
    .setPosition({ x: 8, y: 1, cols: 4, rows: 4 })
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
  let data = newData || TEST_FILTER_DATA;
  
  // Apply filters if filter service is provided
  if (filterService) {
    const currentFilters = filterService.getFilterValues();
    if (currentFilters.length > 0) {
      console.log('Applying filters to test filter data:', currentFilters);
      
      // Filter the data based on category filters or filterColumn
      const categoryFilters = currentFilters.filter(filter => 
        filter.accessor === 'category' || filter.filterColumn === 'sector'
      );
      if (categoryFilters.length > 0) {
        data = data.filter(item => {
          return categoryFilters.some(filter => 
            item.name === filter['category'] || 
            item.name === filter['value'] ||
            (item as any)['sector'] === filter['sector']
          );
        });
      }
      
      console.log('Filtered test data:', data);
    }
  }
  
  // Update widget data
  PieChartBuilder.updateData(widget, data);
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