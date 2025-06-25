import { IWidget, ScatterChartBuilder, ScatterChartData, FilterService } from '@dashboards/public-api';

// Static data for risk vs return analysis
export const RISK_RETURN_DATA: ScatterChartData[] = [
  { value: [0.05, 0.08], name: 'Bonds' },
  { value: [0.12, 0.15], name: 'Stocks' },
  { value: [0.08, 0.10], name: 'REITs' },
  { value: [0.15, 0.20], name: 'Small Cap' },
  { value: [0.20, 0.25], name: 'Emerging Markets' },
  { value: [0.03, 0.05], name: 'Cash' }
];

export const RISK_RETURN_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];

/**
 * Create the risk vs return scatter chart widget
 */
export function createRiskReturnWidget(): IWidget {
  const widget = ScatterChartBuilder.create()
    .setData(RISK_RETURN_DATA)
    .setHeader('Risk vs Return Analysis')
    .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
    .setTitle('Risk vs Return Analysis', 'Portfolio Components')
    .setXAxisName('Risk (Volatility)')
    .setYAxisName('Return (%)')
    .setSymbol('circle', 10)
    .setColors(RISK_RETURN_COLORS)
    .setTooltip('item', '{b}: Risk {c[0]}, Return {c[1]}%')
    .build();
    
  // Add filterColumn configuration
  if (widget.config) {
    widget.config.filterColumn = 'assetType';
  }
  
  return widget;
}

/**
 * Update risk vs return widget data with filtering support
 */
export function updateRiskReturnData(
  widget: IWidget, 
  newData?: ScatterChartData[], 
  filterService?: FilterService
): void {
  let data = newData || RISK_RETURN_DATA;
  
  // Apply filters if filter service is provided
  if (filterService) {
    const currentFilters = filterService.getFilterValues();
    if (currentFilters.length > 0) {
      // Filter by asset type
      const assetTypeFilters = currentFilters.filter(filter => 
        filter.accessor === 'category' || filter.filterColumn === 'assetType'
      );
      
      if (assetTypeFilters.length > 0) {
        data = data.filter(item => {
          return assetTypeFilters.some(filter => 
            item.name === filter['category'] || 
            item.name === filter['value'] ||
            item.name === filter['assetType']
          );
        });
      }
    }
  }
  
  // Update widget data
  ScatterChartBuilder.updateData(widget, data);
}

/**
 * Get updated risk return data (simulated API call)
 */
export async function getUpdatedRiskReturnData(): Promise<ScatterChartData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { value: [0.06, 0.09], name: 'Bonds' },
    { value: [0.13, 0.16], name: 'Stocks' },
    { value: [0.09, 0.11], name: 'REITs' },
    { value: [0.16, 0.21], name: 'Small Cap' },
    { value: [0.21, 0.26], name: 'Emerging Markets' },
    { value: [0.04, 0.06], name: 'Cash' }
  ];
}

/**
 * Get alternative risk return data for testing
 */
export function getAlternativeRiskReturnData(): ScatterChartData[] {
  return [
    { value: [0.04, 0.07], name: 'Bonds' },
    { value: [0.11, 0.14], name: 'Stocks' },
    { value: [0.07, 0.09], name: 'REITs' },
    { value: [0.14, 0.19], name: 'Small Cap' },
    { value: [0.19, 0.24], name: 'Emerging Markets' },
    { value: [0.02, 0.04], name: 'Cash' }
  ];
} 