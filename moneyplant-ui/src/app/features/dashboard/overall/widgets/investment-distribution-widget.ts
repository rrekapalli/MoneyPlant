import { IWidget, DensityMapBuilder, DensityMapData, ColorScheme, MapType } from '@dashboards/public-api';

// Static data for investment distribution by region (world-wide)
export const INVESTMENT_DISTRIBUTION_DATA: DensityMapData[] = [
  { name: 'United States', value: 100 },
  { name: 'China', value: 85 },
  { name: 'Japan', value: 70 },
  { name: 'Germany', value: 65 },
  { name: 'United Kingdom', value: 60 },
  { name: 'France', value: 55 },
  { name: 'Canada', value: 50 },
  { name: 'Australia', value: 45 },
  { name: 'Brazil', value: 40 },
  { name: 'India', value: 35 }
];

/**
 * Create the investment distribution density map widget
 */
export function createInvestmentDistributionWidget(): IWidget {
  return DensityMapBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setMapType(MapType.WORLD)
    .setHeader('Investment Distribution by Country')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 8 })
    .setTitle('Investment Distribution by Country', 'Global')
    .setColorScheme(ColorScheme.DENSITY_BLUE, 0, 100)
    .setRoam(true)
    .setZoom(1.0)
    .setCenter([0, 0])
    .setConditionalLabels(true, 'inside', '{b}\n{c}%', true)
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
    { name: 'United States', value: 95 },
    { name: 'China', value: 90 },
    { name: 'Japan', value: 75 },
    { name: 'Germany', value: 70 },
    { name: 'United Kingdom', value: 65 },
    { name: 'France', value: 60 },
    { name: 'Canada', value: 55 },
    { name: 'Australia', value: 50 },
    { name: 'Brazil', value: 45 },
    { name: 'India', value: 40 }
  ];
}

/**
 * Get alternative investment distribution data for testing
 */
export function getAlternativeInvestmentDistributionData(): DensityMapData[] {
  return [
    { name: 'United States', value: 90 },
    { name: 'China', value: 95 },
    { name: 'Japan', value: 80 },
    { name: 'Germany', value: 75 },
    { name: 'United Kingdom', value: 70 },
    { name: 'France', value: 65 },
    { name: 'Canada', value: 60 },
    { name: 'Australia', value: 55 },
    { name: 'Brazil', value: 50 },
    { name: 'India', value: 45 }
  ];
} 