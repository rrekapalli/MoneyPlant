# Criteria Builder UI Library

An Angular v20 library that provides a sophisticated visual form control for building complex filtering criteria through interactive tokens and clickable elements. The library generates both human-readable criteria sentences and safe parameterized SQL WHERE clauses.

## Features

- **Visual Token Interface**: Interactive token-based query building with drag-and-drop support
- **Angular Reactive Forms Integration**: Implements ControlValueAccessor for seamless form integration
- **Dynamic API Integration**: Loads fields, functions, and operators from backend APIs
- **Type Safety**: Comprehensive TypeScript interfaces and type definitions
- **PrimeNG Integration**: Built with PrimeNG v20 components for consistent UI
- **Accessibility**: Full keyboard navigation and screen reader support
- **SQL Generation**: Server-side parameterized SQL generation for security

## Installation

```bash
npm install @projects/criteria-builder
```

## Peer Dependencies

This library requires the following peer dependencies:

- `@angular/common: ^20.0.0`
- `@angular/core: ^20.0.0`
- `@angular/forms: ^20.0.0`
- `@angular/cdk: ^20.0.0`
- `primeng: ^20.0.0`
- `primeicons: ^7.0.0`
- `primeflex: ^4.0.0`
- `rxjs: ~7.8.0`

## Usage

### Basic Usage

```typescript
import { CriteriaBuilderModule } from '@projects/criteria-builder';

@NgModule({
  imports: [CriteriaBuilderModule],
  // ...
})
export class YourModule { }
```

```html
<mp-criteria-builder
  [config]="builderConfig"
  [(ngModel)]="criteriaValue"
  (validityChange)="onValidityChange($event)"
  (sqlPreviewChange)="onSqlPreviewChange($event)">
</mp-criteria-builder>
```

### Configuration

```typescript
import { BuilderConfig } from '@projects/criteria-builder';

const builderConfig: BuilderConfig = {
  allowGrouping: true,
  maxDepth: 5,
  enableAdvancedFunctions: true,
  showSqlPreview: true,
  debounceMs: 200
};
```

## API

### Interfaces

- `CriteriaDSL`: Main DSL structure for criteria representation
- `FieldMeta`: Field metadata configuration
- `FunctionMeta`: Function metadata configuration
- `BuilderConfig`: Component configuration options
- `QueryToken`: Visual token representation
- `ValidationResult`: Validation result structure

### Components

- `CriteriaBuilderComponent`: Main criteria builder component
- `CriteriaBuilderModule`: Angular module for easy integration

### Services

- `CriteriaBuilderService`: Core service for DSL operations

## Development

### Build

```bash
ng build criteria-builder
```

### Test

```bash
ng test criteria-builder
```

### Lint

```bash
ng lint criteria-builder
```

## License

This project is licensed under the MIT License.