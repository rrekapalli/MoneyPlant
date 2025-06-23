import { IWidget, PieChartBuilder, PieChartData } from '@dashboards/public-api';

// Static data for asset allocation
export const ASSET_ALLOCATION_DATA: PieChartData[] = [
  { value: 45, name: 'Stocks' },
  { value: 25, name: 'Bonds' },
  { value: 15, name: 'Cash' },
  { value: 10, name: 'Real Estate' },
  { value: 5, name: 'Commodities' },
];

export const ASSET_ALLOCATION_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

/**
 * Create the asset allocation pie chart widget
 */
export function createAssetAllocationWidget(): IWidget {
  return PieChartBuilder.create()
    .setData(ASSET_ALLOCATION_DATA)
    .setHeader('Asset Allocation')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .setColors(ASSET_ALLOCATION_COLORS)
    .setRadius(['40%', '70%'])
    .setLabelFormatter('{b}: {c} ({d}%)')
    .setTooltip('item', '{b}: ${c} ({d}%)')
    .build();
}

/**
 * Update asset allocation widget data
 */
export function updateAssetAllocationData(widget: IWidget, newData?: PieChartData[]): void {
  const data = newData || ASSET_ALLOCATION_DATA;
  PieChartBuilder.updateData(widget, data);
}

/**
 * Get updated asset allocation data (simulated API call)
 */
export async function getUpdatedAssetAllocationData(): Promise<PieChartData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { value: 50, name: 'Stocks' },
    { value: 20, name: 'Bonds' },
    { value: 20, name: 'Cash' },
    { value: 8, name: 'Real Estate' },
    { value: 2, name: 'Commodities' },
  ];
}

/**
 * Get alternative asset allocation data for testing
 */
export function getAlternativeAssetAllocationData(): PieChartData[] {
  return [
    { value: 60, name: 'Stocks' },
    { value: 15, name: 'Bonds' },
    { value: 15, name: 'Cash' },
    { value: 7, name: 'Real Estate' },
    { value: 3, name: 'Commodities' },
  ];
} 