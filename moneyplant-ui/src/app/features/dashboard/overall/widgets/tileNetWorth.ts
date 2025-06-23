import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createTileWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 6, y: 8, cols: 3, rows: 2 })
    .setComponent('tile')
    .setHeader('Net Worth')
    .setTileOptions({
      value: '$125,000',
      change: '+5.2%',
      changeType: 'positive',
      icon: 'pi pi-dollar',
      color: '#4caf50',
      description: 'Total assets minus liabilities',
    })
    .build();
} 