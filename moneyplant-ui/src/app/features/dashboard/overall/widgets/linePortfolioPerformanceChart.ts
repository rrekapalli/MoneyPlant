import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createLineChartWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 8, y: 0, cols: 4, rows: 4 })
    .setComponent('echart')
    .setHeader('Portfolio Performance')
    .setEChartsOptions({
      animation: true,
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const date = params[0].name;
          let html = `<div style="margin: 0px 0 0;line-height:1;"><div style="font-size:14px;color:#666;font-weight:400;line-height:1;">${date}</div></div>`;
          params.forEach((param: any) => {
            html += `<div style="margin: 10px 0 0;line-height:1;"><div style="margin: 0px 0 0;line-height:1;"><div style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></div><span style="font-size:14px;color:#666;font-weight:400;margin-left:2px">${param.seriesName}</span><span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">$${param.value.toLocaleString()}</span></div></div>`;
          });
          return html;
        },
      },
      legend: {
        data: ['Portfolio', 'Benchmark'],
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      },
      yAxis: {
        type: 'value',
        name: 'Value ($)',
        axisLabel: {
          formatter: function (value: number) {
            return '$' + value.toLocaleString();
          },
        },
      },
      series: [
        {
          name: 'Portfolio',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#4caf50',
          },
          itemStyle: {
            color: '#4caf50',
          },
          data: [10000, 10500, 11000, 10800, 11200, 11500],
        },
        {
          name: 'Benchmark',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#2196f3',
          },
          itemStyle: {
            color: '#2196f3',
          },
          data: [10000, 10300, 10600, 10400, 10700, 11000],
        },
      ],
    })
    .build();
} 