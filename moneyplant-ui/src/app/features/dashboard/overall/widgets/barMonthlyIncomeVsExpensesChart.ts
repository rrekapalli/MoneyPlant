import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createBarChartWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 4, y: 0, cols: 4, rows: 4 })
    .setComponent('echart')
    .setHeader('Monthly Income vs Expenses')
    .setEChartsOptions({
      animation: true,
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['Income', 'Expenses'],
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Amount ($)',
        },
      ],
      series: [
        {
          name: 'Income',
          type: 'bar',
          emphasis: {
            focus: 'series',
          },
          itemStyle: {
            color: '#4caf50',
          },
          data: [5000, 5200, 5100, 5300, 5400, 5500],
        },
        {
          name: 'Expenses',
          type: 'bar',
          emphasis: {
            focus: 'series',
          },
          itemStyle: {
            color: '#f44336',
          },
          data: [4000, 4200, 3800, 4100, 4300, 4200],
        },
      ],
    })
    .build();
} 