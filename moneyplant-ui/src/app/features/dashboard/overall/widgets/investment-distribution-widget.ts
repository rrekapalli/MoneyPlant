import { IWidget, DensityMapBuilder, DensityMapData } from '@dashboards/public-api';

// Static data for investment distribution by region
export const INVESTMENT_DISTRIBUTION_DATA: DensityMapData[] = [
  { name: 'Hong Kong Island', value: 100 },
  { name: 'Kowloon', value: 80 },
  { name: 'New Territories', value: 60 },
  { name: 'Lantau Island', value: 30 },
  { name: 'Lamma Island', value: 20 }
];

/**
 * Create the investment distribution density map widget
 */
export function createInvestmentDistributionWidget(): IWidget {
  return DensityMapBuilder.create()
    .setData(INVESTMENT_DISTRIBUTION_DATA)
    .setMap('HK')
    .setHeader('Investment Distribution by Region')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 4 })
    .setTitle('Investment Distribution by Region', 'Hong Kong')
    .setVisualMap(0, 100, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'])
    .setRoam(true)
    .setZoom(1.0)
    .setCenter([2, 1])
    .setLabelShow(true, 'inside', '{b}\n{c}%')
    .setAreaColor('#f5f5f5')
    .setBorderColor('#999', 0.5)
    .setEmphasisColor('#b8e186')
    .setShadow(15, 'rgba(0, 0, 0, 0.4)')
    .setTooltip('item', '{b}: {c}% of total investment')
    .build();
}

/**
 * Update investment distribution widget data
 */
export function updateInvestmentDistributionData(widget: IWidget, newData?: DensityMapData[]): void {
  const data = newData || INVESTMENT_DISTRIBUTION_DATA;
  DensityMapBuilder.updateData(widget, data);
}

/**
 * Get updated investment distribution data (simulated API call)
 */
export async function getUpdatedInvestmentDistributionData(): Promise<DensityMapData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { name: 'Hong Kong Island', value: 90 },
    { name: 'Kowloon', value: 85 },
    { name: 'New Territories', value: 70 },
    { name: 'Lantau Island', value: 45 },
    { name: 'Lamma Island', value: 35 }
  ];
}

/**
 * Get alternative investment distribution data for testing
 */
export function getAlternativeInvestmentDistributionData(): DensityMapData[] {
  return [
    { name: 'Hong Kong Island', value: 95 },
    { name: 'Kowloon', value: 90 },
    { name: 'New Territories', value: 75 },
    { name: 'Lantau Island', value: 50 },
    { name: 'Lamma Island', value: 40 }
  ];
} 