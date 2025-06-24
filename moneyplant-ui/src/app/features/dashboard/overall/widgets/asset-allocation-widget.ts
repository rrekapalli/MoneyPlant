import { IWidget, D3PieChartBuilder, D3PieChartData } from '@dashboards/public-api';

// Static data for asset allocation
export const ASSET_ALLOCATION_DATA: D3PieChartData[] = [
  { value: 45, name: 'Stocks' },
  { value: 25, name: 'Bonds' },
  { value: 15, name: 'Cash' },
  { value: 10, name: 'Real Estate' },
  { value: 5, name: 'Commodities' },
];

export const ASSET_ALLOCATION_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

/**
 * Create the asset allocation pie chart widget using D3.js
 */
export function createAssetAllocationWidget(): IWidget {
  return D3PieChartBuilder.create()
    .setData(ASSET_ALLOCATION_DATA)
    .setHeader('Asset Allocation')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .setColors(ASSET_ALLOCATION_COLORS)
    .setRadius(120)
    .setInnerRadius(60) // Create a donut chart
    .setCornerRadius(4) // Rounded corners
    .setPadAngle(0.02) // Small gap between slices
    .setTooltip(true, (d) => `${d.data.name}: $${d.data.value.toLocaleString()} (${((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)}%)`)
    .setLegend(true, 'right')
    .setAnimation(true, 750)
    .setBackgroundColor('#ffffff')
    .setDimensions(400, 400)
    .setMargins(20, 20, 20, 20)
    .build();
}

/**
 * Update asset allocation widget data
 */
export function updateAssetAllocationData(widget: IWidget, newData?: D3PieChartData[]): void {
  const data = newData || ASSET_ALLOCATION_DATA;
  D3PieChartBuilder.updateData(widget, data);
}

/**
 * Get updated asset allocation data (simulated API call)
 */
export async function getUpdatedAssetAllocationData(): Promise<D3PieChartData[]> {
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
export function getAlternativeAssetAllocationData(): D3PieChartData[] {
  return [
    { value: 60, name: 'Stocks' },
    { value: 15, name: 'Bonds' },
    { value: 15, name: 'Cash' },
    { value: 7, name: 'Real Estate' },
    { value: 3, name: 'Commodities' },
  ];
} 

/**
 * Alternative method showing direct widget.setData() usage
 * (if the widget has the setData method implemented)
 */
export function updatePieChartDataDirect(widget: IWidget, newData: D3PieChartData[]): void {
  D3PieChartBuilder.updateData(widget, newData);
} 