import { TreemapChartBuilder, TreemapData } from '@dashboards/public-api';
import { IWidget } from '@dashboards/public-api';

/**
 * Sample data for treemap chart widget - Portfolio Distribution
 */
export const sampleTreemapData: TreemapData[] = [
  {
    name: 'Technology',
    value: 40,
    children: [
      { name: 'Apple Inc.', value: 15 },
      { name: 'Microsoft Corp.', value: 12 },
      { name: 'Alphabet Inc.', value: 8 },
      { name: 'Amazon.com Inc.', value: 5 }
    ]
  },
  {
    name: 'Healthcare',
    value: 25,
    children: [
      { name: 'Johnson & Johnson', value: 10 },
      { name: 'Pfizer Inc.', value: 8 },
      { name: 'UnitedHealth Group', value: 7 }
    ]
  },
  {
    name: 'Financial Services',
    value: 20,
    children: [
      { name: 'JPMorgan Chase', value: 8 },
      { name: 'Bank of America', value: 6 },
      { name: 'Wells Fargo', value: 6 }
    ]
  },
  {
    name: 'Consumer Goods',
    value: 15,
    children: [
      { name: 'Procter & Gamble', value: 6 },
      { name: 'Coca-Cola Co.', value: 5 },
      { name: 'Nike Inc.', value: 4 }
    ]
  }
];

/**
 * Alternative sample data for treemap chart widget - Expense Categories
 */
export const alternativeTreemapData: TreemapData[] = [
  {
    name: 'Housing',
    value: 35,
    children: [
      { name: 'Rent/Mortgage', value: 25 },
      { name: 'Utilities', value: 6 },
      { name: 'Maintenance', value: 4 }
    ]
  },
  {
    name: 'Transportation',
    value: 20,
    children: [
      { name: 'Car Payment', value: 12 },
      { name: 'Fuel', value: 4 },
      { name: 'Insurance', value: 4 }
    ]
  },
  {
    name: 'Food & Dining',
    value: 15,
    children: [
      { name: 'Groceries', value: 10 },
      { name: 'Restaurants', value: 5 }
    ]
  },
  {
    name: 'Entertainment',
    value: 10,
    children: [
      { name: 'Streaming Services', value: 4 },
      { name: 'Movies & Shows', value: 3 },
      { name: 'Hobbies', value: 3 }
    ]
  },
  {
    name: 'Healthcare',
    value: 10,
    children: [
      { name: 'Insurance', value: 6 },
      { name: 'Medications', value: 2 },
      { name: 'Doctor Visits', value: 2 }
    ]
  },
  {
    name: 'Other',
    value: 10,
    children: [
      { name: 'Shopping', value: 4 },
      { name: 'Personal Care', value: 3 },
      { name: 'Miscellaneous', value: 3 }
    ]
  }
];

/**
 * Create a basic treemap chart widget for portfolio distribution
 */
export function createTreemapChartWidget(): IWidget {
  return TreemapChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Portfolio Distribution', 'By Sector and Company')
    .setBreadcrumb(true, '10%', '10%', '10%', '10%')
    .setItemStyle('#fff', 1, 1)
    .setLabelFormatter('{b}\n{c}%')
    .setLevels([
      {
        itemStyle: { borderColor: '#777', borderWidth: 0, gapWidth: 1 },
        label: { show: false }
      },
      {
        itemStyle: { borderColor: '#555', borderWidth: 5, gapWidth: 1 },
        label: { show: true, formatter: '{b}\n{c}%' }
      },
      {
        itemStyle: { borderColor: '#555', borderWidth: 5, gapWidth: 1 },
        label: { show: true, formatter: '{b}\n{c}%' }
      }
    ])
    .setEmphasis(10, 0, 'rgba(0, 0, 0, 0.5)')
    .setRoam(true)
    .setNodeClick('zoomToNode')
    .setTooltip('item', '{b}: {c}%')
    .setHeader('Portfolio Distribution')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 8 })
    .build();
}

/**
 * Create an expense treemap chart widget
 */
export function createExpenseTreemapWidget(): IWidget {
  return TreemapChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Monthly Expenses', 'By Category and Subcategory')
    .setBreadcrumb(true, '10%', '10%', '10%', '10%')
    .setItemStyle('#fff', 1, 1)
    .setLabelFormatter('{b}\n${c}K')
    .setLevels([
      {
        itemStyle: { borderColor: '#777', borderWidth: 0, gapWidth: 1 },
        label: { show: false }
      },
      {
        itemStyle: { borderColor: '#555', borderWidth: 5, gapWidth: 1 },
        label: { show: true, formatter: '{b}\n${c}K' }
      },
      {
        itemStyle: { borderColor: '#555', borderWidth: 5, gapWidth: 1 },
        label: { show: true, formatter: '{b}\n${c}K' }
      }
    ])
    .setEmphasis(10, 0, 'rgba(0, 0, 0, 0.5)')
    .setRoam(true)
    .setNodeClick('zoomToNode')
    .setTooltip('item', '{b}: ${c}K')
    .setHeader('Monthly Expenses')
    .setPosition({ x: 6, y: 8, cols: 6, rows: 8 })
    .build();
}

/**
 * Create a large-scale treemap chart widget for performance demonstration
 */
export function createLargeScaleTreemapWidget(): IWidget {
  return TreemapChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Financial Overview Treemap', 'Complete Portfolio Breakdown')
    .setBreadcrumb(true, '8%', '8%', '8%', '8%')
    .setItemStyle('#fff', 1, 1)
    .setLabelFormatter('{b}\n{c}%')
    .setLevels([
      {
        itemStyle: { borderColor: '#777', borderWidth: 0, gapWidth: 1 },
        label: { show: false }
      },
      {
        itemStyle: { borderColor: '#555', borderWidth: 3, gapWidth: 1 },
        label: { show: true, formatter: '{b}\n{c}%' }
      },
      {
        itemStyle: { borderColor: '#555', borderWidth: 2, gapWidth: 1 },
        label: { show: true, formatter: '{b}\n{c}%' }
      }
    ])
    .setEmphasis(8, 0, 'rgba(0, 0, 0, 0.5)')
    .setRoam(true)
    .setNodeClick('zoomToNode')
    .setTooltip('item', '{b}: {c}%')
    .setHeader('Financial Overview Treemap')
    .setPosition({ x: 0, y: 12, cols: 8, rows: 8 })
    .build();
}

/**
 * Update treemap chart data
 */
export function updateTreemapChartData(widget: IWidget): void {
  const newData = sampleTreemapData.map(category => ({
    ...category,
    value: category.value + Math.random() * 10 - 5, // Add some randomness
    children: category.children?.map(child => ({
      ...child,
      value: child.value + Math.random() * 5 - 2.5
    }))
  }));

  TreemapChartBuilder.updateData(widget, newData);
}

/**
 * Get updated treemap chart data
 */
export function getUpdatedTreemapChartData(): TreemapData[] {
  return sampleTreemapData.map(category => ({
    ...category,
    value: category.value + Math.random() * 10 - 5,
    children: category.children?.map(child => ({
      ...child,
      value: child.value + Math.random() * 5 - 2.5
    }))
  }));
}

/**
 * Get alternative treemap chart data
 */
export function getAlternativeTreemapChartData(): TreemapData[] {
  return alternativeTreemapData;
} 