import { IWidget } from '../entities/IWidget';
import { ScatterChartBuilder, ScatterChartData, SCATTER_VARIANTS } from '../echart-chart-builders/scatter/scatter-chart-builder';

/**
 * Examples demonstrating the usage of ScatterChartBuilder class with various variants
 */

// Sample data for examples
const sampleScatterData: ScatterChartData[] = [
  { value: [10, 20], name: 'Point A' },
  { value: [15, 25], name: 'Point B' },
  { value: [20, 15], name: 'Point C' },
  { value: [25, 35], name: 'Point D' },
  { value: [30, 30], name: 'Point E' },
  { value: [35, 45], name: 'Point F' },
];

// Sample bubble data (with size values) - using any for 3D data
const sampleBubbleData: any[] = [
  { value: [10, 20, 15], name: 'Company A', symbolSize: 15 },
  { value: [15, 25, 25], name: 'Company B', symbolSize: 25 },
  { value: [20, 15, 8], name: 'Company C', symbolSize: 8 },
  { value: [25, 35, 30], name: 'Company D', symbolSize: 30 },
  { value: [30, 30, 20], name: 'Company E', symbolSize: 20 },
];

// Sample large dataset
const generateLargeDataset = (count: number = 1000): ScatterChartData[] => {
  const data: ScatterChartData[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      value: [Math.random() * 100, Math.random() * 100],
      name: `Point ${i + 1}`
    });
  }
  return data;
};

/**
 * Example 1: Basic scatter chart with default options
 */
export function createBasicScatterChart(): IWidget {
  return ScatterChartBuilder.create()
    .setData(sampleScatterData)
    .setVariant(SCATTER_VARIANTS.BASIC)
    .setXAxisName('Risk Level')
    .setYAxisName('Return Rate')
    .setHeader('Basic Scatter Plot')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 2: Bubble chart variant with varying symbol sizes
 */
export function createBubbleChart(): IWidget {
  return ScatterChartBuilder.create()
    .setData(sampleBubbleData)
    .setVariant(SCATTER_VARIANTS.BUBBLE)
    .setXAxisName('Market Cap (B)')
    .setYAxisName('Revenue Growth (%)')
    .setTooltip('item', '{b}<br/>Market Cap: {c[0]}B<br/>Growth: {c[1]}%<br/>Size: {c[2]}')
    .setHeader('Company Performance Bubble Chart')
    .setPosition({ x: 6, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 3: Large dataset optimized scatter chart
 */
export function createLargeDatasetScatterChart(): IWidget {
  const largeData = generateLargeDataset(2000);
  
  return ScatterChartBuilder.create()
    .setData(largeData)
    .setVariant(SCATTER_VARIANTS.LARGE_DATASET)
    .setXAxisName('Variable X')
    .setYAxisName('Variable Y')
    .setTooltip('item', 'X: {c[0]}, Y: {c[1]}')
    .setHeader('Large Dataset Scatter Plot (2000 points)')
    .setPosition({ x: 0, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 4: Risk vs Return analysis scatter chart
 */
export function createRiskReturnAnalysisChart(): IWidget {
  const riskReturnData: ScatterChartData[] = [
    { value: [5, 8], name: 'Conservative Bond' },
    { value: [10, 12], name: 'Balanced Fund' },
    { value: [15, 18], name: 'Growth Stock' },
    { value: [25, 22], name: 'Tech Stock' },
    { value: [30, 35], name: 'Startup Equity' },
    { value: [35, 28], name: 'Crypto Asset' },
  ];

  return ScatterChartBuilder.create()
    .setData(riskReturnData)
    .setVariant(SCATTER_VARIANTS.BASIC)
    .setSymbol('diamond', 10)
    .setItemStyle('#e74c3c', 0.8)
    .setXAxisName('Risk Level (%)')
    .setYAxisName('Expected Return (%)')
    .setTooltip('item', '{b}<br/>Risk: {c[0]}%<br/>Return: {c[1]}%')
    .setHeader('Investment Risk vs Return Analysis')
    .setPosition({ x: 6, y: 4, cols: 6, rows: 4 })
    .build();
}

/**
 * Example 5: Performance correlation scatter chart
 */
export function createPerformanceCorrelationChart(): IWidget {
  const performanceData: ScatterChartData[] = [
    { value: [78, 85], name: 'Team Alpha' },
    { value: [82, 88], name: 'Team Beta' },
    { value: [75, 79], name: 'Team Gamma' },
    { value: [90, 92], name: 'Team Delta' },
    { value: [85, 87], name: 'Team Epsilon' },
    { value: [88, 91], name: 'Team Zeta' },
  ];

  return ScatterChartBuilder.create()
    .setData(performanceData)
    .setVariant(SCATTER_VARIANTS.BASIC)
    .setSymbol('circle', 12)
    .setItemStyle('#3498db', 0.7)
    .setXAxisName('Individual Performance Score')
    .setYAxisName('Team Performance Score')
    .setTooltip('item', '{b}<br/>Individual: {c[0]}<br/>Team: {c[1]}')
    .setHeader('Individual vs Team Performance Correlation')
    .setPosition({ x: 0, y: 8, cols: 6, rows: 4 })
    .build();
} 