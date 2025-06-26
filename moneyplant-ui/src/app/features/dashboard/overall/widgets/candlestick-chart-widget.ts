import { IWidget } from '@dashboards/public-api';
import { CandlestickChartBuilder } from '@dashboards/public-api';

/**
 * Minimal candlestick chart widget with static financial data
 * Simple implementation to avoid ECharts assertion errors
 */
export function createCandlestickChartWidget(): IWidget {
  // Simple stock data: [open, close, low, high] for each day
  const stockData = [
    [20, 34, 10, 38],     // Day 1: Open 20, Close 34, Low 10, High 38
    [40, 35, 30, 50],     // Day 2
    [31, 38, 33, 44],     // Day 3
    [38, 15, 5, 42],      // Day 4
    [15, 25, 12, 28],     // Day 5
    [25, 32, 20, 35],     // Day 6
    [32, 28, 26, 36],     // Day 7
    [28, 45, 25, 48],     // Day 8
    [45, 40, 38, 52],     // Day 9
    [40, 55, 35, 58]      // Day 10
  ];

  // Simple date labels
  const dateLabels = [
    '01-15', '01-16', '01-17', '01-18', '01-19',
    '01-22', '01-23', '01-24', '01-25', '01-26'
  ];

  return CandlestickChartBuilder.create()
    .setData(stockData)
    .setXAxisData(dateLabels)
    .setTitle('Stock Price', 'Daily OHLC Data')
    .setXAxisName('Date')
    .setYAxisName('Price ($)')
    .setColors(['#ec0000', '#00da3c'])  // up/down colors
    .setHeader('Candlestick Chart')
    .setPosition({ x: 0, y: 12, cols: 6, rows: 6 })
    .build();
}

/**
 * Simple advanced candlestick chart widget
 */
export function createAdvancedCandlestickChartWidget(): IWidget {
  // More stock data for 15 days
  const advancedStockData = [
    [85, 92, 78, 95],    [92, 88, 85, 98],    [88, 95, 82, 102], 
    [95, 87, 89, 100],   [87, 93, 84, 98],    [93, 89, 88, 97],
    [89, 96, 86, 101],   [96, 91, 90, 99],    [91, 98, 87, 103],
    [98, 94, 92, 105],   [94, 102, 89, 108],  [102, 97, 95, 110],
    [97, 105, 93, 112],  [105, 99, 101, 115], [99, 108, 96, 118]
  ];

  // Simple date labels
  const advancedDateLabels = [
    '01-01', '01-02', '01-03', '01-04', '01-05',
    '01-08', '01-09', '01-10', '01-11', '01-12',
    '01-15', '01-16', '01-17', '01-18', '01-19'
  ];

  return CandlestickChartBuilder.create()
    .setData(advancedStockData)
    .setXAxisData(advancedDateLabels)
    .setTitle('Advanced Stock Analysis', '15-Day Trading Data')
    .setXAxisName('Trading Date')
    .setYAxisName('Stock Price ($)')
    .setColors(['#d14a61', '#5cb85c'])  // Custom colors
    .setHeader('Advanced Candlestick Chart')
    .setPosition({ x: 6, y: 12, cols: 6, rows: 6 })
    .build();
} 