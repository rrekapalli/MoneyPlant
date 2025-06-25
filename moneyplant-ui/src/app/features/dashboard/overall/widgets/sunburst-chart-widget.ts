import { IWidget, SunburstChartBuilder, SunburstChartData } from '@dashboards/public-api';

// Sample hierarchical data for sunburst chart
export const SUNBURST_DATA: SunburstChartData[] = [
  {
    name: 'Financial Portfolio',
    children: [
      {
        name: 'Stocks',
        value: 40,
        children: [
          { name: 'Technology', value: 15, itemStyle: { color: '#5470c6' } },
          { name: 'Healthcare', value: 10, itemStyle: { color: '#91cc75' } },
          { name: 'Finance', value: 8, itemStyle: { color: '#fac858' } },
          { name: 'Consumer', value: 7, itemStyle: { color: '#ee6666' } }
        ]
      },
      {
        name: 'Bonds',
        value: 30,
        children: [
          { name: 'Government', value: 15, itemStyle: { color: '#73c0de' } },
          { name: 'Corporate', value: 10, itemStyle: { color: '#3ba272' } },
          { name: 'Municipal', value: 5, itemStyle: { color: '#fc8452' } }
        ]
      },
      {
        name: 'Real Estate',
        value: 20,
        children: [
          { name: 'Residential', value: 12, itemStyle: { color: '#9a60b4' } },
          { name: 'Commercial', value: 8, itemStyle: { color: '#ea7ccc' } }
        ]
      },
      {
        name: 'Cash',
        value: 10,
        itemStyle: { color: '#f4e001' }
      }
    ]
  }
];

// Alternative data for demonstration
export const ALTERNATIVE_SUNBURST_DATA: SunburstChartData[] = [
  {
    name: 'Company Structure',
    children: [
      {
        name: 'Engineering',
        value: 50,
        children: [
          { name: 'Frontend', value: 20, itemStyle: { color: '#5470c6' } },
          { name: 'Backend', value: 18, itemStyle: { color: '#91cc75' } },
          { name: 'DevOps', value: 12, itemStyle: { color: '#fac858' } }
        ]
      },
      {
        name: 'Sales',
        value: 25,
        children: [
          { name: 'Enterprise', value: 15, itemStyle: { color: '#ee6666' } },
          { name: 'SMB', value: 10, itemStyle: { color: '#73c0de' } }
        ]
      },
      {
        name: 'Marketing',
        value: 15,
        children: [
          { name: 'Digital', value: 10, itemStyle: { color: '#3ba272' } },
          { name: 'Content', value: 5, itemStyle: { color: '#fc8452' } }
        ]
      },
      {
        name: 'Support',
        value: 10,
        itemStyle: { color: '#9a60b4' }
      }
    ]
  }
];

/**
 * Create a sunburst chart widget for portfolio allocation
 */
export function createSunburstChartWidget(): IWidget {
  return SunburstChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Portfolio Allocation', 'Hierarchical View')
    .setRadius(['20%', '90%'])
    .setCenter(['50%', '50%'])
    .setLabelFormatter('{b}')
    .setLevels([
      {
        itemStyle: {
          borderWidth: 2,
          borderColor: '#777',
        },
      },
      {
        itemStyle: {
          borderWidth: 1,
          borderColor: '#555',
        },
      },
      {
        itemStyle: {
          borderWidth: 1,
          borderColor: '#333',
        },
      },
    ])
    .setTooltip('item', '{b}: {c}%')
    .setLegend('vertical', 'left')
    .setHeader('Portfolio Allocation')
    .setPosition({ x: 8, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Create an organizational structure sunburst chart widget
 */
export function createOrganizationalSunburstWidget(): IWidget {
  return SunburstChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Organizational Structure', 'Department Distribution')
    .setRadius(['15%', '85%'])
    .setCenter(['50%', '50%'])
    .setLabelFormatter('{b}')
    .setLevels([
      {
        itemStyle: {
          borderWidth: 3,
          borderColor: '#999',
        },
      },
      {
        itemStyle: {
          borderWidth: 2,
          borderColor: '#666',
        },
      },
      {
        itemStyle: {
          borderWidth: 1,
          borderColor: '#333',
        },
      },
    ])
    .setTooltip('item', '{b}: {c}%')
    .setLegend('vertical', 'right')
    .setHeader('Organizational Structure')
    .setPosition({ x: 12, y: 0, cols: 4, rows: 4 })
    .build();
}

/**
 * Create a large-scale sunburst chart widget
 */
export function createLargeScaleSunburstWidget(): IWidget {
  return SunburstChartBuilder.create()
    .setData([]) // Data will be populated from shared dashboard data
    .setTitle('Financial Overview Sunburst', 'Complete Portfolio Breakdown')
    .setRadius(['10%', '95%'])
    .setCenter(['50%', '50%'])
    .setLabelFormatter('{b}')
    .setLevels([
      {
        itemStyle: {
          borderWidth: 4,
          borderColor: '#888',
        },
      },
      {
        itemStyle: {
          borderWidth: 2,
          borderColor: '#555',
        },
      },
      {
        itemStyle: {
          borderWidth: 1,
          borderColor: '#222',
        },
      },
    ])
    .setTooltip('item', '{b}: {c}%')
    .setLegend('horizontal', 'bottom')
    .setHeader('Financial Overview Sunburst')
    .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Update sunburst chart data
 */
export function updateSunburstChartData(widget: IWidget, data: SunburstChartData[]): void {
  SunburstChartBuilder.updateData(widget, data);
}

/**
 * Get updated sunburst chart data
 */
export function getUpdatedSunburstChartData(): SunburstChartData[] {
  return ALTERNATIVE_SUNBURST_DATA;
}

/**
 * Get alternative sunburst chart data
 */
export function getAlternativeSunburstChartData(): SunburstChartData[] {
  return [
    {
      name: 'Investment Strategy',
      children: [
        {
          name: 'Growth',
          value: 45,
          children: [
            { name: 'Tech Growth', value: 20, itemStyle: { color: '#5470c6' } },
            { name: 'Emerging Markets', value: 15, itemStyle: { color: '#91cc75' } },
            { name: 'Small Cap', value: 10, itemStyle: { color: '#fac858' } }
          ]
        },
        {
          name: 'Value',
          value: 35,
          children: [
            { name: 'Large Cap Value', value: 20, itemStyle: { color: '#ee6666' } },
            { name: 'Dividend Stocks', value: 15, itemStyle: { color: '#73c0de' } }
          ]
        },
        {
          name: 'Income',
          value: 20,
          children: [
            { name: 'Bonds', value: 12, itemStyle: { color: '#3ba272' } },
            { name: 'REITs', value: 8, itemStyle: { color: '#fc8452' } }
          ]
        }
      ]
    }
  ];
} 