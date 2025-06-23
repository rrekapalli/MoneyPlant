import { IWidget, HeatmapChartBuilder, HeatmapChartData } from '@dashboards/public-api';

// Static data for spending heatmap
export const SPENDING_HEATMAP_DATA: HeatmapChartData[] = [
  { value: [0, 0, 1200], name: 'Mon-Food' },
  { value: [1, 0, 1100], name: 'Tue-Food' },
  { value: [2, 0, 1300], name: 'Wed-Food' },
  { value: [3, 0, 1000], name: 'Thu-Food' },
  { value: [4, 0, 1400], name: 'Fri-Food' },
  { value: [0, 1, 800], name: 'Mon-Transport' },
  { value: [1, 1, 750], name: 'Tue-Transport' },
  { value: [2, 1, 900], name: 'Wed-Transport' },
  { value: [3, 1, 700], name: 'Thu-Transport' },
  { value: [4, 1, 850], name: 'Fri-Transport' },
  { value: [0, 2, 500], name: 'Mon-Entertainment' },
  { value: [1, 2, 600], name: 'Tue-Entertainment' },
  { value: [2, 2, 400], name: 'Wed-Entertainment' },
  { value: [3, 2, 700], name: 'Thu-Entertainment' },
  { value: [4, 2, 800], name: 'Fri-Entertainment' }
];

export const HEATMAP_X_AXIS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const HEATMAP_Y_AXIS = ['Food', 'Transport', 'Entertainment'];

/**
 * Create the spending heatmap widget
 */
export function createSpendingHeatmapWidget(): IWidget {
  return HeatmapChartBuilder.create()
    .setData(SPENDING_HEATMAP_DATA)
    .setXAxisData(HEATMAP_X_AXIS)
    .setYAxisData(HEATMAP_Y_AXIS)
    .setHeader('Weekly Spending Heatmap')
    .setPosition({ x: 6, y: 8, cols: 8, rows: 4 })
    .setTitle('Weekly Spending Heatmap', 'By Category')
    .setVisualMap(0, 1500, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'])
    .setXAxisName('Days')
    .setYAxisName('Categories')
    .setTooltip('item', '{b}: ${c}')
    .build();
}

/**
 * Update spending heatmap widget data
 */
export function updateSpendingHeatmapData(widget: IWidget, newData?: HeatmapChartData[]): void {
  const data = newData || SPENDING_HEATMAP_DATA;
  HeatmapChartBuilder.updateData(widget, data);
}

/**
 * Get updated spending heatmap data (simulated API call)
 */
export async function getUpdatedSpendingHeatmapData(): Promise<HeatmapChartData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { value: [0, 0, 1300], name: 'Mon-Food' },
    { value: [1, 0, 1200], name: 'Tue-Food' },
    { value: [2, 0, 1400], name: 'Wed-Food' },
    { value: [3, 0, 1100], name: 'Thu-Food' },
    { value: [4, 0, 1500], name: 'Fri-Food' },
    { value: [0, 1, 900], name: 'Mon-Transport' },
    { value: [1, 1, 850], name: 'Tue-Transport' },
    { value: [2, 1, 1000], name: 'Wed-Transport' },
    { value: [3, 1, 800], name: 'Thu-Transport' },
    { value: [4, 1, 950], name: 'Fri-Transport' },
    { value: [0, 2, 600], name: 'Mon-Entertainment' },
    { value: [1, 2, 700], name: 'Tue-Entertainment' },
    { value: [2, 2, 500], name: 'Wed-Entertainment' },
    { value: [3, 2, 800], name: 'Thu-Entertainment' },
    { value: [4, 2, 900], name: 'Fri-Entertainment' }
  ];
}

/**
 * Get alternative spending heatmap data for testing
 */
export function getAlternativeSpendingHeatmapData(): HeatmapChartData[] {
  return [
    { value: [0, 0, 1000], name: 'Mon-Food' },
    { value: [1, 0, 950], name: 'Tue-Food' },
    { value: [2, 0, 1100], name: 'Wed-Food' },
    { value: [3, 0, 900], name: 'Thu-Food' },
    { value: [4, 0, 1200], name: 'Fri-Food' },
    { value: [0, 1, 700], name: 'Mon-Transport' },
    { value: [1, 1, 650], name: 'Tue-Transport' },
    { value: [2, 1, 800], name: 'Wed-Transport' },
    { value: [3, 1, 600], name: 'Thu-Transport' },
    { value: [4, 1, 750], name: 'Fri-Transport' },
    { value: [0, 2, 400], name: 'Mon-Entertainment' },
    { value: [1, 2, 500], name: 'Tue-Entertainment' },
    { value: [2, 2, 300], name: 'Wed-Entertainment' },
    { value: [3, 2, 600], name: 'Thu-Entertainment' },
    { value: [4, 2, 700], name: 'Fri-Entertainment' }
  ];
} 