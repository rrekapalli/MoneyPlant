import { IWidget, SankeyChartBuilder, SankeyChartData } from '@dashboards/public-api';
import { WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

// Static data for sankey chart - Financial Flow
export const SANKEY_CHART_DATA: SankeyChartData = {
  nodes: [
    { name: 'Income' },
    { name: 'Salary' },
    { name: 'Investment Returns' },
    { name: 'Expenses' },
    { name: 'Housing' },
    { name: 'Transportation' },
    { name: 'Food' },
    { name: 'Entertainment' },
    { name: 'Savings' },
    { name: 'Emergency Fund' },
    { name: 'Investment Portfolio' },
    { name: 'Retirement Fund' }
  ],
  links: [
    { source: 'Income', target: 'Salary', value: 80 },
    { source: 'Income', target: 'Investment Returns', value: 20 },
    { source: 'Salary', target: 'Expenses', value: 60 },
    { source: 'Salary', target: 'Savings', value: 20 },
    { source: 'Investment Returns', target: 'Savings', value: 15 },
    { source: 'Investment Returns', target: 'Expenses', value: 5 },
    { source: 'Expenses', target: 'Housing', value: 30 },
    { source: 'Expenses', target: 'Transportation', value: 15 },
    { source: 'Expenses', target: 'Food', value: 12 },
    { source: 'Expenses', target: 'Entertainment', value: 8 },
    { source: 'Savings', target: 'Emergency Fund', value: 15 },
    { source: 'Savings', target: 'Investment Portfolio', value: 12 },
    { source: 'Savings', target: 'Retirement Fund', value: 8 }
  ]
};

export const SANKEY_CHART_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

/**
 * Create a minimal test sankey chart widget for debugging
 */
export function createMinimalSankeyChartWidget(): IWidget {
  // Using the exact structure from ECharts official example
  const minimalData = {
    nodes: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' }
    ],
    links: [
      { source: 'A', target: 'B', value: 10 },
      { source: 'A', target: 'C', value: 5 }
    ]
  };

  // Create widget directly with minimal options
  const widget = new WidgetBuilder()
    .setId(uuidv4())
    .setComponent('echart')
    .setHeader('Minimal Test')
    .setPosition({ x: 16, y: 10, cols: 6, rows: 4 })
    .setEChartsOptions({
      series: [{
        type: 'sankey',
        data: minimalData.nodes,
        links: minimalData.links,
        emphasis: {
          focus: 'adjacency'
        },
        lineStyle: {
          color: 'source',
          curveness: 0.5
        }
      }]
    })
    .build();

  return widget;
}

/**
 * Create the sankey chart widget for financial flow visualization
 */
export function createSankeyChartWidget(): IWidget {
  const widget = SankeyChartBuilder.create()
    .setData(SANKEY_CHART_DATA)
    .setHeader('Financial Flow')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
    .setCurveness(0.5)
    .setTooltip('item', '{b}: {c}')
    .build();

  return widget;
}

/**
 * Create a more complex sankey chart widget for investment flow
 */
export function createInvestmentFlowSankeyWidget(): IWidget {
  const investmentData: SankeyChartData = {
    nodes: [
      { name: 'Total Portfolio' },
      { name: 'Equity' },
      { name: 'Fixed Income' },
      { name: 'Alternative' },
      { name: 'US Stocks' },
      { name: 'International Stocks' },
      { name: 'Government Bonds' },
      { name: 'Corporate Bonds' },
      { name: 'Real Estate' },
      { name: 'Commodities' },
      { name: 'Cash' }
    ],
    links: [
      { source: 'Total Portfolio', target: 'Equity', value: 60 },
      { source: 'Total Portfolio', target: 'Fixed Income', value: 25 },
      { source: 'Total Portfolio', target: 'Alternative', value: 10 },
      { source: 'Total Portfolio', target: 'Cash', value: 5 },
      { source: 'Equity', target: 'US Stocks', value: 40 },
      { source: 'Equity', target: 'International Stocks', value: 20 },
      { source: 'Fixed Income', target: 'Government Bonds', value: 15 },
      { source: 'Fixed Income', target: 'Corporate Bonds', value: 10 },
      { source: 'Alternative', target: 'Real Estate', value: 7 },
      { source: 'Alternative', target: 'Commodities', value: 3 }
    ]
  };

  const widget = SankeyChartBuilder.create()
    .setData(investmentData)
    .setHeader('Investment Flow')
    .setPosition({ x: 8, y: 0, cols: 8, rows: 6 })
    .setCurveness(0.3)
    .setTooltip('item', '{b}: {c}%')
    .build();

  // Add a small delay to ensure proper rendering
  setTimeout(() => {
    // Widget is ready
  }, 100);

  return widget;
}

/**
 * Create a budget allocation sankey chart widget
 */
export function createBudgetAllocationSankeyWidget(): IWidget {
  const budgetData: SankeyChartData = {
    nodes: [
      { name: 'Monthly Budget' },
      { name: 'Essential' },
      { name: 'Discretionary' },
      { name: 'Savings' },
      { name: 'Rent/Mortgage' },
      { name: 'Utilities' },
      { name: 'Groceries' },
      { name: 'Transport' },
      { name: 'Dining Out' },
      { name: 'Shopping' },
      { name: 'Entertainment' },
      { name: 'Emergency Fund' },
      { name: 'Investment' }
    ],
    links: [
      { source: 'Monthly Budget', target: 'Essential', value: 50 },
      { source: 'Monthly Budget', target: 'Discretionary', value: 30 },
      { source: 'Monthly Budget', target: 'Savings', value: 20 },
      { source: 'Essential', target: 'Rent/Mortgage', value: 25 },
      { source: 'Essential', target: 'Utilities', value: 10 },
      { source: 'Essential', target: 'Groceries', value: 12 },
      { source: 'Essential', target: 'Transport', value: 8 },
      { source: 'Discretionary', target: 'Dining Out', value: 15 },
      { source: 'Discretionary', target: 'Shopping', value: 10 },
      { source: 'Discretionary', target: 'Entertainment', value: 5 },
      { source: 'Savings', target: 'Emergency Fund', value: 10 },
      { source: 'Savings', target: 'Investment', value: 10 }
    ]
  };

  return SankeyChartBuilder.create()
    .setData(budgetData)
    .setHeader('Budget Allocation')
    .setPosition({ x: 0, y: 6, cols: 8, rows: 6 })
    .setCurveness(0.4)
    .setTooltip('item', '{b}: {c}%')
    .build();
}

/**
 * Update sankey chart widget data
 */
export function updateSankeyChartData(widget: IWidget, newData?: SankeyChartData): void {
  const data = newData || SANKEY_CHART_DATA;
  SankeyChartBuilder.updateData(widget, data);
}

/**
 * Get updated sankey chart data (simulated API call)
 */
export async function getUpdatedSankeyChartData(): Promise<SankeyChartData> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    nodes: [
      { name: 'Income' },
      { name: 'Salary' },
      { name: 'Investment Returns' },
      { name: 'Expenses' },
      { name: 'Housing' },
      { name: 'Transportation' },
      { name: 'Food' },
      { name: 'Entertainment' },
      { name: 'Savings' },
      { name: 'Emergency Fund' },
      { name: 'Investment Portfolio' },
      { name: 'Retirement Fund' }
    ],
    links: [
      { source: 'Income', target: 'Salary', value: 85 },
      { source: 'Income', target: 'Investment Returns', value: 15 },
      { source: 'Salary', target: 'Expenses', value: 55 },
      { source: 'Salary', target: 'Savings', value: 30 },
      { source: 'Investment Returns', target: 'Savings', value: 12 },
      { source: 'Investment Returns', target: 'Expenses', value: 3 },
      { source: 'Expenses', target: 'Housing', value: 28 },
      { source: 'Expenses', target: 'Transportation', value: 14 },
      { source: 'Expenses', target: 'Food', value: 10 },
      { source: 'Expenses', target: 'Entertainment', value: 6 },
      { source: 'Savings', target: 'Emergency Fund', value: 20 },
      { source: 'Savings', target: 'Investment Portfolio', value: 15 },
      { source: 'Savings', target: 'Retirement Fund', value: 7 }
    ]
  };
}

/**
 * Get alternative sankey chart data for testing
 */
export function getAlternativeSankeyChartData(): SankeyChartData {
  return {
    nodes: [
      { name: 'Revenue' },
      { name: 'Sales' },
      { name: 'Services' },
      { name: 'Costs' },
      { name: 'Direct Costs' },
      { name: 'Overhead' },
      { name: 'Profit' },
      { name: 'Taxes' },
      { name: 'Net Profit' }
    ],
    links: [
      { source: 'Revenue', target: 'Sales', value: 70 },
      { source: 'Revenue', target: 'Services', value: 30 },
      { source: 'Sales', target: 'Costs', value: 45 },
      { source: 'Sales', target: 'Profit', value: 25 },
      { source: 'Services', target: 'Costs', value: 15 },
      { source: 'Services', target: 'Profit', value: 15 },
      { source: 'Costs', target: 'Direct Costs', value: 40 },
      { source: 'Costs', target: 'Overhead', value: 20 },
      { source: 'Profit', target: 'Taxes', value: 12 },
      { source: 'Profit', target: 'Net Profit', value: 28 }
    ]
  };
} 