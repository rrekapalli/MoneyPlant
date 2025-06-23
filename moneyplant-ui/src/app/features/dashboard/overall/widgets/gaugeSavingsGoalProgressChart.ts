import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createGaugeChartWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 4, y: 4, cols: 4, rows: 4 })
    .setComponent('echart')
    .setHeader('Savings Goal Progress')
    .setEChartsOptions({
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%',
      },
      series: [
        {
          name: 'Savings Goal',
          type: 'gauge',
          detail: {
            formatter: '{value}%',
          },
          data: [{ value: 68, name: 'Progress' }],
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.3, '#ff6e76'],
                [0.7, '#fddd60'],
                [1, '#7cffb2'],
              ],
            },
          },
        },
      ],
    })
    .build();
} 