# QueryBuilder Library

A compact, theme-integrated query builder library for Angular applications using PrimeNG v20 components.

## Features

- **Compact Design**: Space-efficient UI optimized for integration within existing forms
- **Theme Integration**: Seamlessly integrates with PrimeNG v20 themes and application CSS custom properties
- **Accessibility Compliant**: Meets WCAG guidelines with proper focus management and responsive design
- **Angular v20 Compatible**: Built with Angular v20 and standalone component patterns
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

The library is built as part of the main application build process:

```bash
npm run build:querybuilder
```

## Basic Usage

### Import the Module

```typescript
import { QueryBuilderModule } from 'querybuilder';

@NgModule({
  imports: [QueryBuilderModule],
  // ...
})
export class YourModule { }
```

### Use in Component Template

```html
<lib-query-builder
  [config]="queryConfig"
  [query]="currentQuery"
  (queryChange)="onQueryChange($event)"
  (validationChange)="onValidationChange($event)">
</lib-query-builder>
```

### Component Configuration

```typescript
import { QueryBuilderConfig, RuleSet } from 'querybuilder';

export class YourComponent {
  queryConfig: QueryBuilderConfig = {
    fields: [
      {
        name: 'marketCap',
        type: 'number',
        label: 'Market Cap',
        operators: ['=', '!=', '<', '<=', '>', '>=', 'between'],
        defaultOperator: '>',
        defaultValue: 1000000000
      },
      {
        name: 'sector',
        type: 'category',
        label: 'Sector',
        operators: ['=', '!=', 'in', 'not in'],
        defaultOperator: '=',
        options: [
          { name: 'Technology', value: 'TECH' },
          { name: 'Healthcare', value: 'HEALTH' }
        ]
      }
    ]
  };

  currentQuery: RuleSet = {
    condition: 'and',
    rules: []
  };

  onQueryChange(query: RuleSet) {
    this.currentQuery = query;
    // Handle query changes
  }

  onValidationChange(isValid: boolean) {
    // Handle validation state changes
  }
}
```

## Theme Integration

### CSS Custom Properties

The library integrates with your application's CSS custom properties:

```scss
:root {
  --primary-color: #4CAF50;
  --font-size: 0.875rem;
  --surface-card: #ffffff;
  --surface-border: #e9ecef;
  // ... other theme variables
}
```

### Theme Variants

Apply different size variants using CSS classes:

```html
<!-- Default compact design -->
<lib-query-builder [config]="config" [query]="query"></lib-query-builder>

<!-- Extra compact for space-constrained layouts -->
<lib-query-builder 
  class="qb-compact" 
  [config]="config" 
  [query]="query">
</lib-query-builder>

<!-- Maximum density -->
<lib-query-builder 
  class="qb-dense" 
  [config]="config" 
  [query]="query">
</lib-query-builder>

<!-- Comfortable for better accessibility -->
<lib-query-builder 
  class="qb-comfortable" 
  [config]="config" 
  [query]="query">
</lib-query-builder>
```

### Dark Theme Support

The library automatically adapts to dark themes:

```html
<div class="p-dark">
  <lib-query-builder [config]="config" [query]="query"></lib-query-builder>
</div>
```

### PrimeNG Theme Compatibility

Works with all PrimeNG v20 themes:

- Aura (default)
- Material
- Bootstrap
- Lara

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **High Contrast Mode**: Enhanced visibility in high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Touch Targets**: Minimum 44px touch targets on mobile devices
- **Focus Management**: Clear focus indicators and logical tab order

## Responsive Design

The library adapts to different screen sizes:

- **Desktop**: Full horizontal layout with optimal spacing
- **Tablet**: Adjusted sizing for touch interaction
- **Mobile**: Stacked layout with larger touch targets

## Field Types

### Number Fields

```typescript
{
  name: 'price',
  type: 'number',
  label: 'Price',
  operators: ['=', '!=', '<', '<=', '>', '>=', 'between'],
  defaultOperator: '>',
  defaultValue: 100
}
```

### Category Fields

```typescript
{
  name: 'category',
  type: 'category',
  label: 'Category',
  operators: ['=', '!=', 'in', 'not in'],
  defaultOperator: '=',
  options: [
    { name: 'Option 1', value: 'opt1' },
    { name: 'Option 2', value: 'opt2' }
  ]
}
```

### Boolean Fields

```typescript
{
  name: 'isActive',
  type: 'boolean',
  label: 'Is Active',
  operators: ['='],
  defaultOperator: '=',
  defaultValue: true
}
```

### Date Fields

```typescript
{
  name: 'createdDate',
  type: 'date',
  label: 'Created Date',
  operators: ['=', '!=', '<', '<=', '>', '>=', 'between'],
  defaultOperator: '>=',
  defaultValue: new Date()
}
```

## Operators

- `=` - Equals
- `!=` - Not equals
- `<` - Less than
- `<=` - Less than or equal
- `>` - Greater than
- `>=` - Greater than or equal
- `in` - In list
- `not in` - Not in list
- `contains` - Contains text
- `between` - Between two values

## API Reference

### QueryBuilderComponent

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `QueryBuilderConfig` | - | Field definitions and configuration |
| `query` | `RuleSet` | `{ condition: 'and', rules: [] }` | Initial query state |
| `allowRuleset` | `boolean` | `true` | Allow nested rule groups |
| `allowEmpty` | `boolean` | `false` | Allow empty rulesets |
| `emptyMessage` | `string` | `'No rules defined'` | Message for empty state |

#### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `queryChange` | `EventEmitter<RuleSet>` | Emitted when query changes |
| `validationChange` | `EventEmitter<boolean>` | Emitted when validation state changes |

### Interfaces

#### QueryBuilderConfig

```typescript
interface QueryBuilderConfig {
  fields: Field[];
  allowEmptyRulesets?: boolean;
  allowRuleset?: boolean;
  getOperators?: (fieldName: string, field: Field) => string[];
  getInputType?: (field: Field, operator: string) => string;
  getOptions?: (field: Field) => Option[];
}
```

#### Field

```typescript
interface Field {
  name: string;
  type: string;
  label?: string;
  options?: Option[];
  operators?: string[];
  defaultValue?: any;
  defaultOperator?: string;
  nullable?: boolean;
  entity?: string;
}
```

#### RuleSet

```typescript
interface RuleSet {
  condition: string;
  rules: Array<Rule | RuleSet>;
}
```

#### Rule

```typescript
interface Rule {
  field: string;
  operator: string;
  value?: any;
  entity?: string;
}
```

## Styling Customization

### CSS Custom Properties

Override the library's CSS custom properties to customize appearance:

```scss
.query-builder {
  --qb-primary-color: #your-color;
  --qb-font-size: 0.8rem;
  --qb-input-height: 30px;
  --qb-border-radius: 6px;
  --qb-gap: 6px;
}
```

### Component-Specific Styling

Target specific components for custom styling:

```scss
.query-builder {
  .query-field-details {
    // Custom field details styling
  }
  
  .query-button-group {
    // Custom button group styling
  }
  
  .query-remove-button {
    // Custom remove button styling
  }
}
```

## Performance Considerations

- **OnPush Change Detection**: Components use OnPush change detection strategy
- **Minimal DOM Updates**: Efficient rendering with minimal DOM manipulation
- **Lazy Loading**: Components are loaded only when needed
- **Small Bundle Size**: Optimized for minimal impact on application bundle size

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Ensure all tests pass
3. Add tests for new functionality
4. Update documentation as needed

## License

This library is part of the MoneyPlant application and follows the same license terms.