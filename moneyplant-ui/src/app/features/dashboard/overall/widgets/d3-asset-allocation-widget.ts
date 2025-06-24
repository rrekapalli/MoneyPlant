import { IWidget, D3PieChartBuilder, D3PieChartData } from '@dashboards/public-api';

// Static data for asset allocation
export const D3_ASSET_ALLOCATION_DATA: D3PieChartData[] = [
  { value: 45, name: 'Stocks', color: '#5470c6' },
  { value: 25, name: 'Bonds', color: '#91cc75' },
  { value: 15, name: 'Cash', color: '#fac858' },
  { value: 10, name: 'Real Estate', color: '#ee6666' },
  { value: 5, name: 'Commodities', color: '#73c0de' },
];

export const D3_ASSET_ALLOCATION_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

/**
 * Create the D3.js asset allocation pie chart widget
 */
export function createD3AssetAllocationWidget(): IWidget {
  return D3PieChartBuilder.create()
    .setData(D3_ASSET_ALLOCATION_DATA)
    .setHeader('Asset Allocation (D3.js)')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .setColors(D3_ASSET_ALLOCATION_COLORS)
    .setRadius(150)
    .setInnerRadius(50) // Creates a donut chart
    .setTooltip(true, (d) => `${d.data.name}: ${d.data.value}% (${((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)}%)`)
    .setLegend(true, 'right')
    .setAnimation(true, 1000)
    .setBackgroundColor('#f8f9fa')
    .setDimensions(400, 400)
    .setMargins(20, 20, 20, 20)
    .build();
}

/**
 * Update D3.js asset allocation widget data
 */
export function updateD3AssetAllocationData(widget: IWidget, newData?: D3PieChartData[]): void {
  const data = newData || D3_ASSET_ALLOCATION_DATA;
  D3PieChartBuilder.updateData(widget, data);
}

/**
 * Get updated D3.js asset allocation data (simulated API call)
 */
export async function getUpdatedD3AssetAllocationData(): Promise<D3PieChartData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { value: 50, name: 'Stocks', color: '#5470c6' },
    { value: 20, name: 'Bonds', color: '#91cc75' },
    { value: 20, name: 'Cash', color: '#fac858' },
    { value: 8, name: 'Real Estate', color: '#ee6666' },
    { value: 2, name: 'Commodities', color: '#73c0de' },
  ];
}

/**
 * Get alternative D3.js asset allocation data for testing
 */
export function getAlternativeD3AssetAllocationData(): D3PieChartData[] {
  return [
    { value: 60, name: 'Stocks', color: '#5470c6' },
    { value: 15, name: 'Bonds', color: '#91cc75' },
    { value: 15, name: 'Cash', color: '#fac858' },
    { value: 7, name: 'Real Estate', color: '#ee6666' },
    { value: 3, name: 'Commodities', color: '#73c0de' },
  ];
}

/**
 * Alternative method showing direct widget.setData() usage
 * (if the widget has the setData method implemented)
 */
export function updateD3PieChartDataDirect(widget: IWidget, newData: D3PieChartData[]): void {
  D3PieChartBuilder.updateData(widget, newData);
} 