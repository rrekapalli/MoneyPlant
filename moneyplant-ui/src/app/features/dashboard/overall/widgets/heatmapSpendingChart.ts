import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createHeatmapWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 8, y: 4, cols: 4, rows: 4 })
    .setComponent('echart')
    .setHeader('Spending Heatmap')
    .setEChartsOptions({
      tooltip: {
        position: 'top',
      },
      grid: {
        height: '50%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: ['Morning', 'Afternoon', 'Evening', 'Night'],
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
      },
      series: [
        {
          name: 'Spending',
          type: 'heatmap',
          data: [
            [0, 0, 20],
            [0, 1, 40],
            [0, 2, 60],
            [0, 3, 10],
            [1, 0, 30],
            [1, 1, 50],
            [1, 2, 70],
            [1, 3, 20],
            [2, 0, 40],
            [2, 1, 60],
            [2, 2, 80],
            [2, 3, 30],
            [3, 0, 50],
            [3, 1, 70],
            [3, 2, 90],
            [3, 3, 40],
            [4, 0, 60],
            [4, 1, 80],
            [4, 2, 100],
            [4, 3, 50],
            [5, 0, 70],
            [5, 1, 90],
            [5, 2, 50],
            [5, 3, 60],
            [6, 0, 80],
            [6, 1, 40],
            [6, 2, 30],
            [6, 3, 70],
          ],
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    })
    .build();
} 