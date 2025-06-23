import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createDataGridWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 0, y: 8, cols: 6, rows: 4 })
    .setComponent('data-grid')
    .setHeader('Recent Transactions')
    .setTableOptions({
      columns: ['date', 'description', 'category', 'amount'],
      data: [
        {
          date: '2023-06-01',
          description: 'Grocery Store',
          category: 'Food',
          amount: -120.5,
        },
        {
          date: '2023-06-02',
          description: 'Salary Deposit',
          category: 'Income',
          amount: 3000.0,
        },
        {
          date: '2023-06-03',
          description: 'Electric Bill',
          category: 'Utilities',
          amount: -85.2,
        },
        {
          date: '2023-06-05',
          description: 'Restaurant',
          category: 'Dining',
          amount: -45.8,
        },
        {
          date: '2023-06-07',
          description: 'Gas Station',
          category: 'Transportation',
          amount: -40.0,
        },
        {
          date: '2023-06-10',
          description: 'Online Shopping',
          category: 'Shopping',
          amount: -65.99,
        },
        {
          date: '2023-06-12',
          description: 'Phone Bill',
          category: 'Utilities',
          amount: -55.0,
        },
        {
          date: '2023-06-15',
          description: 'Dividend Payment',
          category: 'Investment',
          amount: 120.5,
        },
        {
          date: '2023-06-18',
          description: 'Gym Membership',
          category: 'Health',
          amount: -30.0,
        },
        {
          date: '2023-06-20',
          description: 'Internet Bill',
          category: 'Utilities',
          amount: -60.0,
        },
      ],
    })
    .build();
} 