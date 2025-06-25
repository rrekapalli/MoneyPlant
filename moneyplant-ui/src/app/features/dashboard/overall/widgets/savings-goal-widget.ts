import { IWidget, GaugeChartBuilder, GaugeChartData } from '@dashboards/public-api';

// Static data for savings goal progress
export const SAVINGS_GOAL_DATA: GaugeChartData[] = [
  { value: 75, name: 'Savings Goal Progress' }
];

/**
 * Create the savings goal gauge widget
 */
export function createSavingsGoalWidget(): IWidget {
  return GaugeChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setHeader('Savings Goal Progress')
    .setPosition({ x: 12, y: 8, cols: 4, rows: 4 })
    .setTitle('Savings Goal Progress', 'Target: $50,000')
    .setRange(0, 50000)
    .setRadius('60%')
    .setCenter(['50%', '60%'])
    .setProgress(true, 10)
    .setPointer(true, '80%', 6)
    .setAxisLine(20, [[0.3, '#ff6e76'], [0.7, '#fddd60'], [1, '#58d9f9']])
    .setDetail(true, [0, 40], '#333', 20, '{value}%')
    .setGaugeTitle(true, [0, 70], '#333', 16)
    .build();
}

/**
 * Update savings goal widget data
 */
export function updateSavingsGoalData(widget: IWidget, newData?: GaugeChartData[]): void {
  const data = newData || SAVINGS_GOAL_DATA;
  GaugeChartBuilder.updateData(widget, data);
}

/**
 * Get updated savings goal data (simulated API call)
 */
export async function getUpdatedSavingsGoalData(): Promise<GaugeChartData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [{ value: 85, name: 'Savings Goal Progress' }];
}

/**
 * Get alternative savings goal data for testing
 */
export function getAlternativeSavingsGoalData(): GaugeChartData[] {
  return [{ value: 90, name: 'Savings Goal Progress' }];
} 