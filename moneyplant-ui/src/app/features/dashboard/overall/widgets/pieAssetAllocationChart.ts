import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export interface PieChartData {
  value: number;
  name: string;
}

/**
 * Creates a pie chart widget template
 * 
 * Usage examples:
 * 
 * // Create widget with initial data
 * const widget = createPieChartWidget(initialData)
 *   .setHeader('Asset Allocation')
 *   .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
 *   .build();
 * 
 * // Update widget data dynamically (for end users)
 * WidgetBuilder.setData(widget, newData);
 * 
 * // Or if widget has setData method implemented
 * widget.setData(newData);
 */
export function createPieChartWidget(data?: PieChartData[]): WidgetBuilder {
  const defaultEChartOptions = {
    grid: {
      containLabel: true,
      top: '15%',
      left: '5%',
      right: '5%',
      bottom: '15%',
      height: '70%',
    },
    series: [
      {
        name: 'Pie Chart',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '50%'],
        itemStyle: {
          borderRadius: 2,
        },
        label: {
          formatter: '{b}\n{c}%\n({d})%',
          show: true,
        },
        data: data || [],
      },
    ],
  };

  return new WidgetBuilder()
    .setId(uuidv4())
    .setComponent('echart')
    .setEChartsOptions(defaultEChartOptions)
    .setData(data || []);
} 