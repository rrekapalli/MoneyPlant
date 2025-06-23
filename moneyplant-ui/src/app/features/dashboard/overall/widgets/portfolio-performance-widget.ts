import { IWidget, LineChartBuilder, LineChartData } from '@dashboards/public-api';

// Static data for portfolio performance
export const PORTFOLIO_DATA: LineChartData[] = [
  { name: 'Jan', value: 100000 },
  { name: 'Feb', value: 105000 },
  { name: 'Mar', value: 102000 },
  { name: 'Apr', value: 108000 },
  { name: 'May', value: 112000 },
  { name: 'Jun', value: 115000 }
];

export const PORTFOLIO_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/**
 * Create the portfolio performance line chart widget
 */
export function createPortfolioPerformanceWidget(): IWidget {
  return LineChartBuilder.create()
    .setData(PORTFOLIO_DATA.map(d => d.value))
    .setXAxisData(PORTFOLIO_CATEGORIES)
    .setHeader('Portfolio Performance')
    .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
    .setTitle('Portfolio Performance', 'Last 6 Months')
    .setSmooth(true)
    .setAreaStyle('#5470c6', 0.3)
    .setLineStyle(3, '#5470c6', 'solid')
    .setSymbol('circle', 8)
    .setYAxisName('Portfolio Value ($)')
    .setTooltip('axis', '{b}: ${c}')
    .build();
}

/**
 * Update portfolio performance widget data
 */
export function updatePortfolioPerformanceData(widget: IWidget, newData?: number[]): void {
  const data = newData || PORTFOLIO_DATA.map(d => d.value);
  LineChartBuilder.updateData(widget, data);
}

/**
 * Get updated portfolio data (simulated API call)
 */
export async function getUpdatedPortfolioData(): Promise<number[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [100000, 107000, 104000, 111000, 116000, 120000];
}

/**
 * Get alternative portfolio data for testing
 */
export function getAlternativePortfolioData(): number[] {
  return [100000, 103000, 101000, 106000, 109000, 113000];
} 