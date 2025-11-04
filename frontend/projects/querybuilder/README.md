# QueryBuilder Library

A custom Angular QueryBuilder library for the MoneyPlant frontend application. This library replicates the Angular-QueryBuilder pattern using Angular v20 and PrimeNG v20 components with a compact UI design.

## Features

- Angular v20 compatible
- PrimeNG v20 components only
- Compact UI design for minimal space usage
- Stock screening field configurations
- Compatible with existing screener API

## Installation

This library is part of the MoneyPlant monorepo and is built alongside the main application.

## Usage

```typescript
import { QueryBuilderModule } from 'querybuilder';

@Component({
  imports: [QueryBuilderModule]
})
export class MyComponent {
  // Component implementation
}
```

## Development

To build the library:

```bash
ng build querybuilder
```

To run tests:

```bash
ng test querybuilder
```