# Dashboard Widgets

This directory contains individual widget files that have been extracted from the main `overall.component.ts` file to improve maintainability and organization.

## Structure

Each widget is now contained in its own file with the following structure:

- **Widget Creation Function**: Creates and configures the widget
- **Data Update Functions**: Functions to update widget data
- **Data Fetching Functions**: Async functions that simulate API calls
- **Alternative Data Functions**: Functions that provide alternative data for testing
- **Static Data**: Constants containing the widget's default data

## Available Widgets

### 1. Asset Allocation Widget (`asset-allocation-widget.ts`)
- **Type**: Pie Chart
- **Purpose**: Shows portfolio asset allocation breakdown
- **Position**: `{ x: 0, y: 0, cols: 4, rows: 4 }`

### 2. Monthly Income vs Expenses Widget (`monthly-income-expenses-widget.ts`)
- **Type**: Bar Chart
- **Purpose**: Displays monthly income vs expenses comparison
- **Position**: `{ x: 4, y: 0, cols: 6, rows: 4 }`

### 3. Portfolio Performance Widget (`portfolio-performance-widget.ts`)
- **Type**: Line Chart
- **Purpose**: Shows portfolio performance over time
- **Position**: `{ x: 0, y: 4, cols: 6, rows: 4 }`

### 4. Risk vs Return Widget (`risk-return-widget.ts`)
- **Type**: Scatter Chart
- **Purpose**: Analyzes risk vs return for different asset classes
- **Position**: `{ x: 6, y: 4, cols: 6, rows: 4 }`

### 5. Savings Goal Widget (`savings-goal-widget.ts`)
- **Type**: Gauge Chart
- **Purpose**: Shows progress towards savings goals
- **Position**: `{ x: 10, y: 0, cols: 4, rows: 4 }`

### 6. Spending Heatmap Widget (`spending-heatmap-widget.ts`)
- **Type**: Heatmap Chart
- **Purpose**: Visualizes spending patterns by day and category
- **Position**: `{ x: 6, y: 8, cols: 8, rows: 4 }`

### 7. Investment Distribution Widget (`investment-distribution-widget.ts`)
- **Type**: Density Map
- **Purpose**: Shows investment distribution by geographical region
- **Position**: `{ x: 0, y: 8, cols: 6, rows: 4 }`

## Usage

### Importing Widgets

```typescript
import {
  createAssetAllocationWidget,
  createMonthlyIncomeExpensesWidget,
  createPortfolioPerformanceWidget,
  createRiskReturnWidget,
  createSavingsGoalWidget,
  createSpendingHeatmapWidget,
  createInvestmentDistributionWidget
} from './widgets';
```

### Creating Widgets

```typescript
// Create individual widgets
const assetAllocationWidget = createAssetAllocationWidget();
const monthlyWidget = createMonthlyIncomeExpensesWidget();
const portfolioWidget = createPortfolioPerformanceWidget();

// Add to widgets array
this.widgets = [
  assetAllocationWidget,
  monthlyWidget,
  portfolioWidget
];
```

### Updating Widget Data

```typescript
import {
  updateAssetAllocationData,
  getUpdatedAssetAllocationData
} from './widgets';

// Update with new data
const newData = await getUpdatedAssetAllocationData();
updateAssetAllocationData(widget, newData);
```

### Using Alternative Data

```typescript
import {
  getAlternativeAssetAllocationData,
  getAlternativeMonthlyData
} from './widgets';

// Get alternative data for testing
const alternativeData = getAlternativeAssetAllocationData();
updateAssetAllocationData(widget, alternativeData);
```

## Widget Functions

Each widget file exports the following functions:

### Creation Functions
- `create[WidgetName]Widget()`: Creates and configures the widget

### Update Functions
- `update[WidgetName]Data(widget: IWidget, newData?: DataType): void`: Updates widget data

### Data Fetching Functions
- `getUpdated[WidgetName]Data(): Promise<DataType>`: Simulates API call to get updated data

### Alternative Data Functions
- `getAlternative[WidgetName]Data(): DataType`: Provides alternative data for testing

## Benefits of This Structure

1. **Separation of Concerns**: Each widget is self-contained
2. **Maintainability**: Easier to modify individual widgets
3. **Reusability**: Widgets can be easily reused in other components
4. **Testing**: Individual widgets can be tested in isolation
5. **Organization**: Clear structure makes the codebase easier to navigate
6. **Scalability**: Easy to add new widgets following the same pattern

## Adding New Widgets

To add a new widget:

1. Create a new file following the naming convention: `[widget-name]-widget.ts`
2. Export the required functions (creation, update, data fetching, alternative data)
3. Add the exports to `index.ts`
4. Import and use in the main component

## Example: Adding a New Widget

```typescript
// new-widget.ts
import { IWidget, ChartBuilder } from '@dashboards/public-api';

export const NEW_WIDGET_DATA = [
  // ... data
];

export function createNewWidget(): IWidget {
  return ChartBuilder.create()
    .setData(NEW_WIDGET_DATA)
    .setHeader('New Widget')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 4 })
    .build();
}

export function updateNewWidgetData(widget: IWidget, newData?: any[]): void {
  ChartBuilder.updateData(widget, newData || NEW_WIDGET_DATA);
}

export async function getUpdatedNewWidgetData(): Promise<any[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [/* updated data */];
}

export function getAlternativeNewWidgetData(): any[] {
  return [/* alternative data */];
}
```

Then add to `index.ts`:

```typescript
export { createNewWidget } from './new-widget';
export { updateNewWidgetData } from './new-widget';
export { getUpdatedNewWidgetData } from './new-widget';
export { getAlternativeNewWidgetData } from './new-widget';
export { NEW_WIDGET_DATA } from './new-widget';
``` 