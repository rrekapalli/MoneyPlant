import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { GridsterConfig, DisplayGrid, GridType } from 'angular-gridster2';

// Import dashboard modules
// Import from the library's public API
import { 
  IWidget,
  EventBusService,
  EchartComponent,
  TableComponent,
  TileComponent,
  MarkdownCellComponent,
  DashboardContainerComponent
} from '@dashboards/public-api';

// Import components not in the public API directly
import { WidgetComponent } from '@dashboards/widgets/widget/widget.component';
import { DataGridComponent } from '@dashboards/widgets/data-grid/data-grid.component';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-overall',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    MessageModule,
    TooltipModule,
    // Dashboard components
    DashboardContainerComponent
  ],
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss'],
  providers: [EventBusService]
})
export class OverallComponent implements OnInit {
  // Dashboard widgets
  widgets: IWidget[] = [];

  // Dashboard options
  options: GridsterConfig = {
    gridType: GridType.Fixed,
    displayGrid: DisplayGrid.None,
    margin: 10,
    outerMargin: true,
    draggable: {
      enabled: false
    },
    resizable: {
      enabled: false
    },
    maxCols: 12,
    minCols: 1,
    maxRows: 100,
    minRows: 1,
    fixedRowHeight: 100
  };

  constructor(@Inject(EventBusService) private eventBus: EventBusService) {}

  ngOnInit(): void {
    // Initialize dashboard widgets
    this.initializeDashboardWidgets();
  }

  /**
   * Initialize dashboard widgets with mock data
   */
  private initializeDashboardWidgets(): void {
    // Create widgets for each chart type
    this.widgets = [
      this.createPieChartWidget(),
      this.createBarChartWidget(),
      this.createLineChartWidget(),
      this.createScatterChartWidget(),
      this.createGaugeChartWidget(),
      this.createHeatmapWidget(),
      this.createDataGridWidget(),
      this.createTileWidget(),
      this.createMarkdownWidget()
    ];
  }

  /**
   * Create a pie chart widget
   */
  private createPieChartWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 0, y: 0, cols: 4, rows: 4 },
      config: {
        component: 'echart',
        header: {
          title: 'Asset Allocation'
        },
        options: {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: ['Stocks', 'Bonds', 'Cash', 'Real Estate', 'Commodities']
          },
          series: [
            {
              name: 'Asset Allocation',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 45, name: 'Stocks' },
                { value: 25, name: 'Bonds' },
                { value: 15, name: 'Cash' },
                { value: 10, name: 'Real Estate' },
                { value: 5, name: 'Commodities' }
              ]
            }
          ]
        }
      }
    };
  }

  /**
   * Create a bar chart widget
   */
  private createBarChartWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 4, y: 0, cols: 4, rows: 4 },
      config: {
        component: 'echart',
        header: {
          title: 'Monthly Income vs Expenses'
        },
        options: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['Income', 'Expenses']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: 'Income',
              type: 'bar',
              emphasis: {
                focus: 'series'
              },
              data: [5000, 5200, 5100, 5300, 5400, 5500]
            },
            {
              name: 'Expenses',
              type: 'bar',
              emphasis: {
                focus: 'series'
              },
              data: [4000, 4200, 3800, 4100, 4300, 4200]
            }
          ]
        }
      }
    };
  }

  /**
   * Create a line chart widget
   */
  private createLineChartWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 8, y: 0, cols: 4, rows: 4 },
      config: {
        component: 'echart',
        header: {
          title: 'Portfolio Performance'
        },
        options: {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['Portfolio', 'Benchmark']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'Portfolio',
              type: 'line',
              data: [10000, 10500, 11000, 10800, 11200, 11500]
            },
            {
              name: 'Benchmark',
              type: 'line',
              data: [10000, 10300, 10600, 10400, 10700, 11000]
            }
          ]
        }
      }
    };
  }

  /**
   * Create a scatter chart widget
   */
  private createScatterChartWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 0, y: 4, cols: 4, rows: 4 },
      config: {
        component: 'echart',
        header: {
          title: 'Risk vs Return'
        },
        options: {
          xAxis: {
            name: 'Risk (Volatility)',
            nameLocation: 'middle',
            nameGap: 30,
            scale: true
          },
          yAxis: {
            name: 'Return (%)',
            nameLocation: 'middle',
            nameGap: 30,
            scale: true
          },
          tooltip: {
            trigger: 'item',
            formatter: function(params: any) {
              return `${params.data[2]}<br/>Risk: ${params.data[0].toFixed(2)}<br/>Return: ${params.data[1].toFixed(2)}%`;
            }
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
                [7.5, 12.0, 'Commodities']
              ]
            }
          ]
        }
      }
    };
  }

  /**
   * Create a gauge chart widget
   */
  private createGaugeChartWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 4, y: 4, cols: 4, rows: 4 },
      config: {
        component: 'echart',
        header: {
          title: 'Savings Goal Progress'
        },
        options: {
          tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
          },
          series: [
            {
              name: 'Savings Goal',
              type: 'gauge',
              detail: {
                formatter: '{value}%'
              },
              data: [{ value: 68, name: 'Progress' }],
              axisLine: {
                lineStyle: {
                  width: 30,
                  color: [
                    [0.3, '#ff6e76'],
                    [0.7, '#fddd60'],
                    [1, '#7cffb2']
                  ]
                }
              }
            }
          ]
        }
      }
    };
  }

  /**
   * Create a heatmap widget
   */
  private createHeatmapWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 8, y: 4, cols: 4, rows: 4 },
      config: {
        component: 'echart',
        header: {
          title: 'Spending Heatmap'
        },
        options: {
          tooltip: {
            position: 'top'
          },
          grid: {
            height: '50%',
            top: '10%'
          },
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            splitArea: {
              show: true
            }
          },
          yAxis: {
            type: 'category',
            data: ['Morning', 'Afternoon', 'Evening', 'Night'],
            splitArea: {
              show: true
            }
          },
          visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%'
          },
          series: [
            {
              name: 'Spending',
              type: 'heatmap',
              data: [
                [0, 0, 20], [0, 1, 40], [0, 2, 60], [0, 3, 10],
                [1, 0, 30], [1, 1, 50], [1, 2, 70], [1, 3, 20],
                [2, 0, 40], [2, 1, 60], [2, 2, 80], [2, 3, 30],
                [3, 0, 50], [3, 1, 70], [3, 2, 90], [3, 3, 40],
                [4, 0, 60], [4, 1, 80], [4, 2, 100], [4, 3, 50],
                [5, 0, 70], [5, 1, 90], [5, 2, 50], [5, 3, 60],
                [6, 0, 80], [6, 1, 40], [6, 2, 30], [6, 3, 70]
              ],
              label: {
                show: true
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
      }
    };
  }

  /**
   * Create a data grid widget
   */
  private createDataGridWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 0, y: 8, cols: 6, rows: 4 },
      config: {
        component: 'data-grid',
        header: {
          title: 'Recent Transactions'
        },
        options: {
          columns: ['date', 'description', 'category', 'amount'],
          data: [
            { date: '2023-06-01', description: 'Grocery Store', category: 'Food', amount: -120.50 },
            { date: '2023-06-02', description: 'Salary Deposit', category: 'Income', amount: 3000.00 },
            { date: '2023-06-03', description: 'Electric Bill', category: 'Utilities', amount: -85.20 },
            { date: '2023-06-05', description: 'Restaurant', category: 'Dining', amount: -45.80 },
            { date: '2023-06-07', description: 'Gas Station', category: 'Transportation', amount: -40.00 },
            { date: '2023-06-10', description: 'Online Shopping', category: 'Shopping', amount: -65.99 },
            { date: '2023-06-12', description: 'Phone Bill', category: 'Utilities', amount: -55.00 },
            { date: '2023-06-15', description: 'Dividend Payment', category: 'Investment', amount: 120.50 },
            { date: '2023-06-18', description: 'Gym Membership', category: 'Health', amount: -30.00 },
            { date: '2023-06-20', description: 'Internet Bill', category: 'Utilities', amount: -60.00 }
          ]
        }
      }
    };
  }

  /**
   * Create a tile widget
   */
  private createTileWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 6, y: 8, cols: 3, rows: 2 },
      config: {
        component: 'tile',
        header: {
          title: 'Net Worth'
        },
        options: {
          value: '$125,000',
          change: '+5.2%',
          changeType: 'positive',
          icon: 'pi pi-dollar',
          color: '#4caf50',
          description: 'Total assets minus liabilities'
        }
      }
    };
  }

  /**
   * Create a markdown widget
   */
  private createMarkdownWidget(): IWidget {
    return {
      id: uuidv4(),
      position: { x: 9, y: 8, cols: 3, rows: 4 },
      config: {
        component: 'markdown-cell',
        header: {
          title: 'Financial Tips'
        },
        options: {
          content: `
# Financial Tips

## Budgeting
- Track your expenses
- Create a monthly budget
- Stick to your spending limits

## Saving
- Build an emergency fund
- Save at least 20% of income
- Automate your savings

## Investing
- Start early
- Diversify your portfolio
- Invest for the long term
          `
        }
      }
    };
  }
}
