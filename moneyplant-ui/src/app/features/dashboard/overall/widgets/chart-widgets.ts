import { IWidget, PieChartBuilder, PieChartData, LineChartBuilder, BarChartBuilder, ScatterChartBuilder } from '@dashboards/public-api';
import { BaseWidget, WidgetConfig, DataTransformation } from './base-widget';
import { DashboardDataRow } from './dashboard-data';

/**
 * Asset Allocation Widget - Pie Chart
 */
export class AssetAllocationWidget extends BaseWidget<PieChartData[]> {
  private static readonly DEFAULT_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

  constructor(config?: Partial<WidgetConfig>) {
    const widgetConfig: WidgetConfig = {
      header: 'Asset Allocation',
      position: { x: 0, y: 0, cols: 4, rows: 8 },
      filterColumn: 'assetCategory',
      colors: AssetAllocationWidget.DEFAULT_COLORS,
      ...config
    };

    const dataTransformation: DataTransformation<PieChartData[]> = {
      transform: (data: DashboardDataRow[]) => {
        // Group by assetCategory and sum totalValue
        const grouped = data.reduce((acc, row) => {
          const category = row.assetCategory;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += row.totalValue || 0;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([name, value]) => ({
          name,
          value
        }));
      },
      validate: (data: PieChartData[]) => {
        return data.length > 0 && data.every(item => 
          typeof item.name === 'string' && 
          typeof item.value === 'number' && 
          item.value >= 0
        );
      }
    };

    super(widgetConfig, dataTransformation);
  }

  protected createWidget(data: PieChartData[]): IWidget {
    return PieChartBuilder.create()
      .setData(data)
      .setHeader(this.config.header)
      .setPosition(this.config.position)
      .setColors(this.config.colors || AssetAllocationWidget.DEFAULT_COLORS)
      .setRadius(['40%', '70%'])
      .setLabelFormatter('{b}: {c} ({d}%)')
      .setTooltip('item', '{b}: ${c} ({d}%)')
      .build();
  }

  protected updateWidgetData(widget: IWidget, data: PieChartData[]): void {
    PieChartBuilder.updateData(widget, data);
  }

  public override async getUpdatedData(): Promise<DashboardDataRow[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real implementation, this would fetch from an API
    return [];
  }

  public override getAlternativeData(): DashboardDataRow[] {
    return [
      { id: 'alt1', assetCategory: 'Stocks', month: 'Jan', market: 'US', totalValue: 60 },
      { id: 'alt2', assetCategory: 'Bonds', month: 'Jan', market: 'US', totalValue: 15 },
      { id: 'alt3', assetCategory: 'Cash', month: 'Jan', market: 'US', totalValue: 15 },
      { id: 'alt4', assetCategory: 'Real Estate', month: 'Jan', market: 'US', totalValue: 7 },
      { id: 'alt5', assetCategory: 'Commodities', month: 'Jan', market: 'US', totalValue: 3 }
    ];
  }
}

/**
 * Portfolio Performance Widget - Line Chart
 */
export class PortfolioPerformanceWidget extends BaseWidget<{value: number, name: string}[]> {
  private static readonly DEFAULT_COLORS = ['#5470c6', '#91cc75'];

  constructor(config?: Partial<WidgetConfig>) {
    const widgetConfig: WidgetConfig = {
      header: 'Portfolio Performance',
      position: { x: 0, y: 4, cols: 6, rows: 4 },
      filterColumn: 'month',
      colors: PortfolioPerformanceWidget.DEFAULT_COLORS,
      ...config
    };

    const dataTransformation: DataTransformation<{value: number, name: string}[]> = {
      transform: (data: DashboardDataRow[]) => {
        // Group by month and sum totalValue
        const grouped = data.reduce((acc, row) => {
          const month = row.month;
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += row.totalValue || 0;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
          .sort(([a], [b]) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months.indexOf(a) - months.indexOf(b);
          })
          .map(([name, value]) => ({ name, value }));
      },
      validate: (data: {value: number, name: string}[]) => {
        return data.length > 0 && data.every(item => 
          typeof item.name === 'string' && 
          typeof item.value === 'number' && 
          item.value >= 0
        );
      }
    };

    super(widgetConfig, dataTransformation);
  }

  protected createWidget(data: {value: number, name: string}[]): IWidget {
    return LineChartBuilder.create()
      .setXAxis(data.map(item => item.name))
      .setSeries([{
        name: 'Portfolio Value',
        data: data.map(item => item.value),
        type: 'line'
      }])
      .setHeader(this.config.header)
      .setPosition(this.config.position)
      .setColors(this.config.colors || PortfolioPerformanceWidget.DEFAULT_COLORS)
      .build();
  }

  protected updateWidgetData(widget: IWidget, data: {value: number, name: string}[]): void {
    LineChartBuilder.updateData(widget, {
      xAxis: data.map(item => item.name),
      series: [{
        name: 'Portfolio Value',
        data: data.map(item => item.value),
        type: 'line'
      }]
    });
  }
}

/**
 * Monthly Income vs Expenses Widget - Bar Chart
 */
export class MonthlyIncomeExpensesWidget extends BaseWidget<any> {
  private static readonly DEFAULT_COLORS = ['#5470c6', '#ee6666'];

  constructor(config?: Partial<WidgetConfig>) {
    const widgetConfig: WidgetConfig = {
      header: 'Monthly Income vs Expenses',
      position: { x: 4, y: 0, cols: 6, rows: 4 },
      filterColumn: 'month',
      colors: MonthlyIncomeExpensesWidget.DEFAULT_COLORS,
      ...config
    };

    const dataTransformation: DataTransformation<any> = {
      transform: (data: DashboardDataRow[]) => {
        // Group by month and calculate income/expenses
        const grouped = data.reduce((acc, row) => {
          const month = row.month;
          if (!acc[month]) {
            acc[month] = { income: 0, expenses: 0 };
          }
          // Simple logic: positive values are income, calculate expenses as 80% of income
          const income = row.totalValue || 0;
          acc[month].income += income;
          acc[month].expenses += income * 0.8; // Simplified calculation
          return acc;
        }, {} as Record<string, {income: number, expenses: number}>);

        const months = Object.keys(grouped).sort((a, b) => {
          const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return monthOrder.indexOf(a) - monthOrder.indexOf(b);
        });

        return {
          xAxis: months,
          series: [
            {
              name: 'Income',
              data: months.map(month => grouped[month].income),
              type: 'bar'
            },
            {
              name: 'Expenses', 
              data: months.map(month => grouped[month].expenses),
              type: 'bar'
            }
          ]
        };
      }
    };

    super(widgetConfig, dataTransformation);
  }

  protected createWidget(data: any): IWidget {
    return BarChartBuilder.create()
      .setXAxis(data.xAxis)
      .setSeries(data.series)
      .setHeader(this.config.header)
      .setPosition(this.config.position)
      .setColors(this.config.colors || MonthlyIncomeExpensesWidget.DEFAULT_COLORS)
      .build();
  }

  protected updateWidgetData(widget: IWidget, data: any): void {
    BarChartBuilder.updateData(widget, {
      xAxis: data.xAxis,
      series: data.series
    });
  }
}

/**
 * Risk vs Return Widget - Scatter Chart
 */
export class RiskReturnWidget extends BaseWidget<{value: [number, number], name: string}[]> {
  private static readonly DEFAULT_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

  constructor(config?: Partial<WidgetConfig>) {
    const widgetConfig: WidgetConfig = {
      header: 'Risk vs Return Analysis',
      position: { x: 6, y: 4, cols: 6, rows: 4 },
      filterColumn: 'assetCategory',
      colors: RiskReturnWidget.DEFAULT_COLORS,
      ...config
    };

    const dataTransformation: DataTransformation<{value: [number, number], name: string}[]> = {
      transform: (data: DashboardDataRow[]) => {
        // Group by assetCategory and average risk/return values
        const grouped = data.reduce((acc, row) => {
          const category = row.assetCategory;
          if (!acc[category]) {
            acc[category] = { riskSum: 0, returnSum: 0, count: 0 };
          }
          if (row.riskValue !== undefined && row.returnValue !== undefined) {
            acc[category].riskSum += row.riskValue;
            acc[category].returnSum += row.returnValue;
            acc[category].count += 1;
          }
          return acc;
        }, {} as Record<string, {riskSum: number, returnSum: number, count: number}>);

        return Object.entries(grouped)
          .filter(([_, values]) => values.count > 0)
          .map(([name, values]) => ({
            name,
            value: [
              values.riskSum / values.count, // Average risk
              values.returnSum / values.count // Average return
            ] as [number, number]
          }));
      },
      validate: (data: {value: [number, number], name: string}[]) => {
        return data.length > 0 && data.every(item => 
          typeof item.name === 'string' && 
          Array.isArray(item.value) &&
          item.value.length === 2 &&
          typeof item.value[0] === 'number' &&
          typeof item.value[1] === 'number'
        );
      }
    };

    super(widgetConfig, dataTransformation);
  }

  protected createWidget(data: {value: [number, number], name: string}[]): IWidget {
    return ScatterChartBuilder.create()
      .setSeries([{
        name: 'Risk vs Return',
        data: data,
        type: 'scatter'
      }])
      .setHeader(this.config.header)
      .setPosition(this.config.position)
      .setColors(this.config.colors || RiskReturnWidget.DEFAULT_COLORS)
      .setXAxisName('Risk')
      .setYAxisName('Return')
      .build();
  }

  protected updateWidgetData(widget: IWidget, data: {value: [number, number], name: string}[]): void {
    ScatterChartBuilder.updateData(widget, [{
      name: 'Risk vs Return',
      data: data,
      type: 'scatter'
    }]);
  }
} 