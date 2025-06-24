import { IWidget } from '../entities/IWidget';
import { D3PieChartBuilder, D3PieChartData } from '../d3-chart-builders/pie/pie-chart-builder';

interface PieArcDatum {
  data: D3PieChartData;
  endAngle: number;
  startAngle: number;
}

/**
 * Example 1: Basic D3.js Pie Chart
 * Simple pie chart with default configuration
 */
export function createBasicD3PieChart(): IWidget {
  const data: D3PieChartData[] = [
    { value: 45, name: 'Stocks', color: '#5470c6' },
    { value: 25, name: 'Bonds', color: '#91cc75' },
    { value: 15, name: 'Cash', color: '#fac858' },
    { value: 10, name: 'Real Estate', color: '#ee6666' },
    { value: 5, name: 'Commodities', color: '#73c0de' }
  ];

  return D3PieChartBuilder.create()
    .setData(data)
    .setHeader('Portfolio Distribution', 'As of December 2024')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .setColors(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
    .setRadius(150)
    .setInnerRadius(50) // Creates a donut chart
    .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: ${d.data.value}% (${((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)}%)`)
    .setLegend(true, 'right')
    .setAnimation(true, 1000)
    .setBackgroundColor('#f8f9fa')
    .setDimensions(400, 400)
    .setMargins(20, 20, 20, 20)
    .build();
}

/**
 * Example 2: Investment Distribution with Custom Colors
 * Pie chart with custom colors and enhanced tooltips
 */
export function createInvestmentDistributionChart(): IWidget {
  const data: D3PieChartData[] = [
    { value: 50000, name: 'Technology Stocks', color: '#ff6b6b' },
    { value: 35000, name: 'Healthcare ETFs', color: '#4ecdc4' },
    { value: 25000, name: 'Government Bonds', color: '#45b7d1' },
    { value: 20000, name: 'Real Estate Trusts', color: '#96ceb4' },
    { value: 15000, name: 'Commodity Funds', color: '#feca57' },
    { value: 10000, name: 'Cash Reserves', color: '#ff9ff3' }
  ];

  return D3PieChartBuilder.create()
    .setData(data)
    .setHeader('Investment Distribution')
    .setPosition({ x: 4, y: 0, cols: 4, rows: 4 })
    .setColors(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'])
    .setRadius(140)
    .setInnerRadius(70)
    .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: $${d.data.value.toLocaleString()}`)
    .setLegend(true, 'bottom')
    .setAnimation(true, 1200)
    .setBackgroundColor('#ffffff')
    .setDimensions(450, 450)
    .setMargins(30, 30, 30, 30)
    .build();
}

/**
 * Example 3: Sorted Asset Allocation
 * Pie chart with data sorted by value
 */
export function createSortedAssetAllocationChart(): IWidget {
  const data: D3PieChartData[] = [
    { value: 60, name: 'Large Cap Stocks', color: '#2ecc71' },
    { value: 20, name: 'International Stocks', color: '#3498db' },
    { value: 15, name: 'Bonds', color: '#e74c3c' },
    { value: 5, name: 'Cash', color: '#f39c12' }
  ];

  // Sort data by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return D3PieChartBuilder.create()
    .setData(sortedData)
    .setHeader('Sorted Asset Allocation')
    .setPosition({ x: 0, y: 4, cols: 4, rows: 4 })
    .setColors(['#2ecc71', '#3498db', '#e74c3c', '#f39c12'])
    .setRadius(160)
    .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: ${d.data.value}%`)
    .setLegend(true, 'left')
    .setAnimation(true, 800)
    .setBackgroundColor('#f8f9fa')
    .setDimensions(500, 500)
    .setMargins(25, 25, 25, 25)
    .build();
}

/**
 * Example 4: Interactive Portfolio with Events
 * Pie chart with interactive features and event handling
 */
export function createInteractivePortfolioChart(): IWidget {
  const data: D3PieChartData[] = [
    { value: 40, name: 'Growth Stocks', color: '#9b59b6' },
    { value: 30, name: 'Value Stocks', color: '#e67e22' },
    { value: 20, name: 'Dividend Stocks', color: '#1abc9c' },
    { value: 10, name: 'Cash', color: '#34495e' }
  ];

  return D3PieChartBuilder.create()
    .setData(data)
    .setHeader('Interactive Portfolio')
    .setPosition({ x: 4, y: 4, cols: 4, rows: 4 })
    .setColors(['#9b59b6', '#e67e22', '#1abc9c', '#34495e'])
    .setRadius(130)
    .setInnerRadius(40)
    .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: ${d.data.value}%`)
    .setLegend(true, 'right')
    .setAnimation(true, 1500)
    .setBackgroundColor('#ffffff')
    .setDimensions(400, 400)
    .setMargins(20, 20, 20, 20)
    .build();
}

/**
 * Example 5: Exportable Data Chart
 * Pie chart optimized for data export and analysis
 */
export function createExportableDataChart(): IWidget {
  const data: D3PieChartData[] = [
    { value: 35, name: 'US Equities', color: '#e74c3c' },
    { value: 25, name: 'International Equities', color: '#3498db' },
    { value: 20, name: 'Fixed Income', color: '#2ecc71' },
    { value: 15, name: 'Alternative Investments', color: '#f39c12' },
    { value: 5, name: 'Cash & Equivalents', color: '#95a5a6' }
  ];

  return D3PieChartBuilder.create()
    .setData(data)
    .setHeader('Exportable Data')
    .setPosition({ x: 0, y: 8, cols: 4, rows: 4 })
    .setColors(['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#95a5a6'])
    .setRadius(120)
    .setInnerRadius(60)
    .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: ${d.data.value}%`)
    .setLegend(true, 'top')
    .setAnimation(true, 1000)
    .setBackgroundColor('#f8f9fa')
    .setDimensions(350, 350)
    .setMargins(15, 15, 15, 15)
    .build();
}

/**
 * Example 6: Sample Data for Testing
 * Provides sample data for testing and development
 */
export function getSampleD3PieChartData(): D3PieChartData[] {
  return [
    { value: 30, name: 'Category A', color: '#5470c6' },
    { value: 25, name: 'Category B', color: '#91cc75' },
    { value: 20, name: 'Category C', color: '#fac858' },
    { value: 15, name: 'Category D', color: '#ee6666' },
    { value: 10, name: 'Category E', color: '#73c0de' }
  ];
}

/**
 * Example 7: Utility Functions for D3 Pie Charts
 */

/**
 * Check if a widget is a D3 pie chart
 */
export function isD3PieChart(widget: IWidget): boolean {
  return widget.config?.component === 'd3-chart' && 
         (widget.config?.options as any)?.chartType === 'd3-pie';
}

/**
 * Get export headers for D3 pie chart data
 */
export function getD3PieChartExportHeaders(): string[] {
  return ['Name', 'Value', 'Color', 'Percentage'];
}

/**
 * Get export sheet name for D3 pie chart
 */
export function getD3PieChartExportSheetName(widget: IWidget): string {
  const title = widget.config?.header?.title || 'D3 Pie Chart';
  return `D3 Pie Chart - ${title}`;
}

/**
 * Example 8: Dynamic Chart Creation from Configuration
 * Creates a D3 pie chart from a configuration object
 */
export function createD3PieChartFromConfig(chart: {
  title: string;
  data: D3PieChartData[];
  colors?: string[];
  radius?: number;
  innerRadius?: number;
  position?: { x: number; y: number; cols: number; rows: number };
}): IWidget {
  return D3PieChartBuilder.create()
    .setData(chart.data)
    .setHeader(chart.title)
    .setPosition(chart.position || { x: 0, y: 0, cols: 4, rows: 4 })
    .setColors(chart.colors || ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'])
    .setRadius(chart.radius || 150)
    .setInnerRadius(chart.innerRadius || 50)
    .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: ${d.data.value}%`)
    .setLegend(true, 'right')
    .setAnimation(true, 1000)
    .build();
}

/**
 * Example 9: Chart with Custom Styling
 * D3 pie chart with custom styling and enhanced visual effects
 */
export function createCustomStyledD3PieChart(): IWidget {
  const data: D3PieChartData[] = [
    { value: 50, name: 'Primary Investment', color: '#2c3e50' },
    { value: 25, name: 'Secondary Investment', color: '#34495e' },
    { value: 15, name: 'Tertiary Investment', color: '#7f8c8d' },
    { value: 10, name: 'Reserve Fund', color: '#bdc3c7' }
  ];

  return D3PieChartBuilder.create()
    .setData(data)
    .setHeader('Custom Styled Portfolio')
    .setPosition({ x: 4, y: 8, cols: 4, rows: 4 })
    .setColors(['#2c3e50', '#34495e', '#7f8c8d', '#bdc3c7'])
    .setRadius(140)
    .setInnerRadius(30)
    .setPadAngle(0.02) // Add small gaps between slices
    .setCornerRadius(5) // Rounded corners
    .setTooltip(true, (d: PieArcDatum) => `${d.data.name}: ${d.data.value}%`)
    .setLegend(true, 'bottom')
    .setAnimation(true, 2000)
    .setBackgroundColor('#ecf0f1')
    .setDimensions(450, 450)
    .setMargins(30, 30, 30, 30)
    .build();
} 