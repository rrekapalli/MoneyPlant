import { IWidget, PieChartBuilder, PieChartData, IFilterValues, FilterService } from '@dashboards/public-api';

// Default colors for asset allocation
export const ASSET_ALLOCATION_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

/**
 * Create the asset allocation pie chart widget
 */
export function createAssetAllocationWidget(): IWidget {
  const widget = PieChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setHeader('Asset Allocation')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 8 })
    .setColors(ASSET_ALLOCATION_COLORS)
    .setRadius(['40%', '70%'])
    .setLabelFormatter('{b}: {c} ({d}%)')
    .setTooltip('item', '{b}: ${c} ({d}%)')
    .build();
    
  // Add filterColumn configuration
  if (widget.config) {
    widget.config.filterColumn = 'assetCategory';
  }
  
  return widget;
}

/**
 * Update asset allocation widget data with filtering support
 */
export function updateAssetAllocationData(
  widget: IWidget, 
  newData?: PieChartData[], 
  filterService?: FilterService
): void {
  let data = newData || [];
  
  // If newData is provided, use it directly (from shared dashboard data)
  // Otherwise, apply filters if filter service is provided
  if (!newData && filterService) {
    const currentFilters = filterService.getFilterValues();
    
    if (currentFilters.length > 0) {
      data = filterService.applyFiltersToData(data, currentFilters);
    }
  }
  
  // Update widget data
  PieChartBuilder.updateData(widget, data);
  
  // Force chart update if chart instance is available
  if (widget.chartInstance) {
    try {
      widget.chartInstance.setOption(widget.config?.options as any, true);
    } catch (error) {
      console.error('Error updating Asset Allocation chart:', error);
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
          console.error('Error updating Asset Allocation chart on retry:', error);
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
 * Get updated asset allocation data (simulated API call)
 */
export async function getUpdatedAssetAllocationData(): Promise<PieChartData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [];
  // return [
  //   { value: 50, name: 'Stocks' },
  //   { value: 20, name: 'Bonds' },
  //   { value: 20, name: 'Cash' },
  //   { value: 8, name: 'Real Estate' },
  //   { value: 2, name: 'Commodities' },
  // ];
}

/**
 * Get alternative asset allocation data for testing
 */
export function getAlternativeAssetAllocationData(): PieChartData[] {
  return [];
  // return [
  //   { value: 60, name: 'Stocks' },
  //   { value: 15, name: 'Bonds' },
  //   { value: 15, name: 'Cash' },
  //   { value: 7, name: 'Real Estate' },
  //   { value: 3, name: 'Commodities' },
  // ];
} 

/**
 * Alternative method showing direct widget.setData() usage
 * (if the widget has the setData method implemented)
 */
export function updatePieChartDataDirect(widget: IWidget, newData: PieChartData[]): void {
  PieChartBuilder.updateData(widget, newData);
}

/**
 * Create filter value from asset allocation click data
 */
export function createAssetAllocationFilter(clickedData: any): IFilterValues | null {
  if (!clickedData || !clickedData.name) {
    return null;
  }

  return {
    accessor: 'assetCategory',
    filterColumn: 'assetCategory',
    assetCategory: clickedData.name,
    value: clickedData.name,
    percentage: clickedData.value?.toString() || '0'
  };
} 