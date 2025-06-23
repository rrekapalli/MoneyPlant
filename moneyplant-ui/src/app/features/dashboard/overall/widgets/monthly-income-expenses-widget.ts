import { IWidget, BarChartBuilder, BarChartData } from '@dashboards/public-api';

// Static data for monthly income vs expenses
export const MONTHLY_DATA: BarChartData[] = [
  { name: 'Jan', value: 8500 },
  { name: 'Feb', value: 9200 },
  { name: 'Mar', value: 7800 },
  { name: 'Apr', value: 9500 },
  { name: 'May', value: 8800 },
  { name: 'Jun', value: 10200 }
];

export const MONTHLY_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/**
 * Create the monthly income vs expenses bar chart widget
 */
export function createMonthlyIncomeExpensesWidget(): IWidget {
  return BarChartBuilder.create()
    .setData(MONTHLY_DATA.map(d => d.value))
    .setCategories(MONTHLY_CATEGORIES)
    .setHeader('Monthly Income vs Expenses')
    .setPosition({ x: 4, y: 0, cols: 6, rows: 4 })
    .setTitle('Monthly Income vs Expenses', 'Last 6 Months')
    .setColors(['#5470c6'])
    .setBarWidth('60%')
    .setBarBorderRadius(4)
    .setYAxisName('Amount ($)')
    .setTooltip('axis', '{b}: ${c}')
    .build();
}

/**
 * Update monthly income vs expenses widget data
 */
export function updateMonthlyIncomeExpensesData(widget: IWidget, newData?: number[]): void {
  const data = newData || MONTHLY_DATA.map(d => d.value);
  BarChartBuilder.updateData(widget, data);
}

/**
 * Get updated monthly data (simulated API call)
 */
export async function getUpdatedMonthlyData(): Promise<number[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [9500, 9800, 8200, 10000, 9200, 10800];
}

/**
 * Get alternative monthly data for testing
 */
export function getAlternativeMonthlyData(): number[] {
  return [9000, 9500, 8000, 9800, 9000, 10500];
} 