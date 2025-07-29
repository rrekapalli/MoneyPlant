# Generic Component Communication Service Guide

## Overview
The `ComponentCommunicationService` has been refactored to be a generic, extensible service that facilitates communication between various components and routing to different dashboards. This service supports multiple communication topics, pluggable data transformers, and flexible routing configurations.

## Key Features

### 1. Generic Communication Channels
- Support for multiple communication topics
- Type-safe communication using enums
- Automatic channel initialization
- Unique message identification

### 2. Pluggable Data Transformers
- Register custom transformation functions for different data types
- Transform data before sending to dashboard components
- Support for multiple transformer types per topic

### 3. Dashboard Route Mapping
- Configure routes for different communication topics
- Automatic navigation support
- Component identification for routing

### 4. Backward Compatibility
- Legacy methods maintained for existing implementations
- Seamless migration path
- No breaking changes to existing code

## Communication Topics

The service supports the following predefined topics:

```typescript
export enum CommunicationTopic {
  INDEX_SELECTION = 'index_selection',
  STOCK_SELECTION = 'stock_selection',
  PORTFOLIO_SELECTION = 'portfolio_selection',
  WATCHLIST_SELECTION = 'watchlist_selection',
  CUSTOM = 'custom'
}
```

## Basic Usage

### 1. Sending Data

```typescript
// In your source component
constructor(private communicationService: ComponentCommunicationService) {}

onItemClick(itemData: any) {
  this.communicationService.sendData(
    CommunicationTopic.STOCK_SELECTION,
    'StockListComponent',
    'StockDashboardComponent',
    itemData,
    'stock'
  );
}
```

### 2. Receiving Data

```typescript
// In your destination component
ngOnInit() {
  this.communicationService.receiveData(CommunicationTopic.STOCK_SELECTION)
    .subscribe(data => {
      if (data) {
        console.log('Received data:', data.payload);
        this.updateDashboard(data.payload);
      }
    });
}
```

### 3. Data Transformation

```typescript
// Register a custom transformer
this.communicationService.registerTransformer(
  CommunicationTopic.STOCK_SELECTION,
  (stockData: StockData) => ({
    id: stockData.symbol,
    assetCategory: 'Stock',
    month: new Date().toLocaleString('default', { month: 'long' }),
    market: stockData.exchange,
    totalValue: stockData.price,
    riskValue: stockData.volatility,
    returnValue: stockData.changePercent,
    description: `${stockData.symbol} - ${stockData.name}`
  })
);

// Use the transformer
const transformedData = this.communicationService.transformData(
  CommunicationTopic.STOCK_SELECTION,
  stockData
);
```

### 4. Route Management

```typescript
// Register a dashboard route
this.communicationService.registerDashboardRoute(
  CommunicationTopic.PORTFOLIO_SELECTION,
  '/dashboard/portfolio',
  'PortfolioDashboardComponent'
);

// Get route information
const route = this.communicationService.getDashboardRoute(
  CommunicationTopic.PORTFOLIO_SELECTION
);
if (route) {
  this.router.navigate([route.path]);
}
```

## Advanced Usage Examples

### Example 1: Stock Selection Component

```typescript
// stock-list.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardCommunicationService, CommunicationTopic } from '../services/dashboard-communication.service';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  exchange: string;
}

@Component({
  selector: 'app-stock-list',
  template: `
    <div *ngFor="let stock of stocks" 
         (click)="onStockClick(stock)"
         class="stock-item clickable">
      {{ stock.symbol }} - {{ stock.name }}
    </div>
  `
})
export class StockListComponent {
  stocks: StockData[] = []; // Your stock data

  constructor(
    private communicationService: DashboardCommunicationService,
    private router: Router
  ) {
    // Register custom transformer for stocks
    this.communicationService.registerTransformer(
      CommunicationTopic.STOCK_SELECTION,
      this.transformStockData.bind(this)
    );

    // Register dashboard route
    this.communicationService.registerDashboardRoute(
      CommunicationTopic.STOCK_SELECTION,
      '/dashboard/stock',
      'StockDashboardComponent'
    );
  }

  onStockClick(stock: StockData): void {
    // Send stock data
    this.communicationService.sendData(
      CommunicationTopic.STOCK_SELECTION,
      'StockListComponent',
      'StockDashboardComponent',
      stock,
      'stock'
    );

    // Navigate to dashboard
    const route = this.communicationService.getDashboardRoute(CommunicationTopic.STOCK_SELECTION);
    if (route) {
      this.router.navigate([route.path]);
    }
  }

  private transformStockData(stock: StockData): any {
    return {
      id: stock.symbol,
      assetCategory: 'Stock',
      month: new Date().toLocaleString('default', { month: 'long' }),
      market: stock.exchange,
      totalValue: stock.price,
      riskValue: stock.volume / 1000000, // Convert to millions
      returnValue: stock.changePercent,
      description: `${stock.symbol} - ${stock.name}`
    };
  }
}
```

### Example 2: Portfolio Dashboard Component

```typescript
// portfolio-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardCommunicationService, CommunicationTopic } from '../services/dashboard-communication.service';

@Component({
  selector: 'app-portfolio-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>Portfolio Dashboard</h2>
      <div *ngIf="selectedPortfolio">
        <h3>{{ selectedPortfolio.name }}</h3>
        <p>Total Value: {{ selectedPortfolio.totalValue | currency }}</p>
        <p>Return: {{ selectedPortfolio.returnValue }}%</p>
      </div>
    </div>
  `
})
export class PortfolioDashboardComponent implements OnInit, OnDestroy {
  selectedPortfolio: any = null;
  private subscription: Subscription = new Subscription();

  constructor(private communicationService: DashboardCommunicationService) {}

  ngOnInit(): void {
    // Subscribe to portfolio selection data
    this.subscription.add(
      this.communicationService.receiveData(CommunicationTopic.PORTFOLIO_SELECTION)
        .subscribe(data => {
          if (data) {
            console.log('Received portfolio data:', data);
            this.updateDashboard(data.payload);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateDashboard(portfolioData: any): void {
    // Transform data if needed
    const transformedData = this.communicationService.transformData(
      CommunicationTopic.PORTFOLIO_SELECTION,
      portfolioData
    );

    this.selectedPortfolio = transformedData || portfolioData;
    // Update dashboard widgets, charts, etc.
  }
}
```

### Example 3: Custom Communication Topic

```typescript
// custom-component.component.ts
import { Component } from '@angular/core';
import { DashboardCommunicationService } from '../services/dashboard-communication.service';

@Component({
  selector: 'app-custom-component'
})
export class CustomComponent {
  constructor(private communicationService: DashboardCommunicationService) {
    // Register custom topic and transformer
    this.setupCustomCommunication();
  }

  private setupCustomCommunication(): void {
    const customTopic = 'market_analysis';

    // Register transformer for custom data
    this.communicationService.registerTransformer(
      customTopic,
      (analysisData: any) => ({
        id: analysisData.analysisId,
        assetCategory: 'Market Analysis',
        month: new Date().toLocaleString('default', { month: 'long' }),
        market: analysisData.market,
        totalValue: analysisData.marketCap,
        riskValue: analysisData.volatilityIndex,
        returnValue: analysisData.expectedReturn,
        description: `Market Analysis: ${analysisData.title}`
      })
    );

    // Register dashboard route
    this.communicationService.registerDashboardRoute(
      customTopic,
      '/dashboard/market-analysis',
      'MarketAnalysisDashboardComponent'
    );
  }

  onAnalysisClick(analysisData: any): void {
    this.communicationService.sendData(
      'market_analysis',
      'CustomComponent',
      'MarketAnalysisDashboardComponent',
      analysisData,
      'analysis'
    );
  }
}
```

## Migration Guide

### For Existing Code (Backward Compatibility)

Existing code using the old methods will continue to work without changes:

```typescript
// This still works (legacy methods)
this.communicationService.setSelectedIndex(indexData);
this.communicationService.getSelectedIndex().subscribe(data => {
  // Handle data
});
```

### Recommended Migration

For new implementations, use the generic methods:

```typescript
// New generic approach
this.communicationService.sendData(
  CommunicationTopic.INDEX_SELECTION,
  'IndicesComponent',
  'OverallComponent',
  indexData,
  'index'
);

this.communicationService.receiveData(CommunicationTopic.INDEX_SELECTION)
  .subscribe(data => {
    if (data) {
      // Handle data.payload
    }
  });
```

## Best Practices

1. **Use Enum Topics**: Always use `CommunicationTopic` enum values for type safety
2. **Register Transformers**: Register data transformers during component initialization
3. **Clean Up Subscriptions**: Always unsubscribe in `ngOnDestroy`
4. **Meaningful Source/Destination**: Use descriptive component names for better debugging
5. **Custom Topics**: Use descriptive names for custom topics
6. **Error Handling**: Add proper error handling for data transformation and routing

## Benefits of the Generic Service

1. **Extensibility**: Easy to add new communication channels
2. **Type Safety**: TypeScript interfaces and enums prevent errors
3. **Flexibility**: Support for any data type and transformation
4. **Maintainability**: Centralized communication logic
5. **Testability**: Easy to mock and test individual components
6. **Scalability**: Supports multiple concurrent communication channels
7. **Backward Compatibility**: No breaking changes to existing code

This generic service provides a robust foundation for inter-component communication in the MoneyPlant application and can be easily extended for future requirements.