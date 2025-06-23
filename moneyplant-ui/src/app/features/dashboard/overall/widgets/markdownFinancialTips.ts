import { IWidget, WidgetBuilder } from '@dashboards/public-api';
import { v4 as uuidv4 } from 'uuid';

export function createMarkdownWidget(): IWidget {
  return new WidgetBuilder()
    .setId(uuidv4())
    .setPosition({ x: 9, y: 8, cols: 3, rows: 4 })
    .setComponent('markdownCell')
    .setHeader('Financial Tips')
    .setMarkdownCellOptions({
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
          `,
    })
    .build();
} 