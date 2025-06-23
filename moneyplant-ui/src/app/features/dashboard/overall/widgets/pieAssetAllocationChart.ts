import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createPieChartWidget(): IWidget {
  const pieChartData = [
    { value: 45, name: 'Stocks' },
    { value: 25, name: 'Bonds' },
    { value: 15, name: 'Cash' },
    { value: 10, name: 'Real Estate' },
    { value: 5, name: 'Commodities' },
  ];

  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .setComponent('echart')
    .setHeader('Asset Allocation')
    .setEChartsOptions({
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
          name: 'Asset Allocation',
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
          data: pieChartData,
        },
      ],
    })
    .build();
} 