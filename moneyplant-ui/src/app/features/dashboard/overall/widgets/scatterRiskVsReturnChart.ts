import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createScatterChartWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 0, y: 4, cols: 4, rows: 4 })
    .setComponent('echart')
    .setHeader('Risk vs Return')
    .setEChartsOptions({
      xAxis: {
        name: 'Risk (Volatility)',
        nameLocation: 'middle',
        nameGap: 30,
        scale: true,
      },
      yAxis: {
        name: 'Return (%)',
        nameLocation: 'middle',
        nameGap: 30,
        scale: true,
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `${params.data[2]}<br/>Risk: ${params.data[0].toFixed(
            2
          )}<br/>Return: ${params.data[1].toFixed(2)}%`;
        },
      },
      series: [
        {
          type: 'scatter',
          symbolSize: 20,
          data: [
            [3.5, 8.2, 'Stocks'],
            [1.2, 4.5, 'Bonds'],
            [0.5, 2.0, 'Cash'],
            [5.0, 9.5, 'Real Estate'],
            [7.5, 12.0, 'Commodities'],
          ],
        },
      ],
    })
    .build();
} 