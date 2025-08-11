# Query Builder Library

A powerful and flexible Angular query builder library for building dynamic queries with rules and rule sets. This library provides a user-friendly interface for creating complex queries with support for multiple field types, operators, and nested conditions.

## Features

- 🚀 **Angular 20+ Compatible** - Built with modern Angular features
- 🎯 **Dynamic Query Building** - Create complex queries with rules and rule sets
- 🔧 **Multiple Field Types** - Support for string, number, date, time, boolean, and category fields
- 📱 **Responsive Design** - Mobile-friendly interface with responsive layouts
- 🎨 **Customizable Styling** - Easy to customize with CSS classes and SCSS variables
- 🔄 **Real-time Updates** - Live query updates with change detection
- 📦 **Standalone Components** - Modern Angular standalone component architecture
- 🧪 **TypeScript Support** - Full TypeScript support with comprehensive interfaces

## Installation

The query builder is included as part of the MoneyPlant frontend project. No additional installation is required.

## Quick Start

### Basic Usage

```typescript
import { QueryBuilderComponent, QueryBuilderConfig, QueryRuleSet } from '@query-builder';

@Component({
  selector: 'app-my-component',
  template: `
    <app-query-builder
      [query]="query"
      [config]="config"
      (queryChange)="onQueryChange($event)">
    </app-query-builder>
  `,
  imports: [QueryBuilderComponent],
  standalone: true
})
export class MyComponent {
  config: QueryBuilderConfig = {
    fields: [
      { name: 'Name', value: 'name', type: 'string' },
      { name: 'Age', value: 'age', type: 'number' },
      { name: 'Email', value: 'email', type: 'string' },
      { name: 'Active', value: 'active', type: 'boolean' }
    ],
    allowCollapse: true,
    defaultCondition: 'and'
  };

  query: QueryRuleSet = {
    condition: 'and',
    rules: [
      {
        field: 'name',
        operator: 'contains',
        value: 'John'
      }
    ]
  };

  onQueryChange(query: QueryRuleSet): void {
    console.log('Query changed:', query);
  }
}
```

### Advanced Configuration

```typescript
config: QueryBuilderConfig = {
  fields: [
    { 
      name: 'Category', 
      value: 'category', 
      type: 'category',
      options: [
        { name: 'Premium', value: 'premium' },
        { name: 'Standard', value: 'standard' },
        { name: 'Basic', value: 'basic' }
      ]
    },
    { 
      name: 'Created Date', 
      value: 'createdDate', 
      type: 'date' 
    }
  ],
  allowCollapse: true,
  defaultCondition: 'or',
  classNames: {
    queryBuilder: 'custom-query-builder',
    ruleSet: 'custom-rule-set',
    rule: 'custom-rule'
  }
};
```

## API Reference

### Components

#### QueryBuilderComponent

Main component that orchestrates the entire query building interface.

**Inputs:**
- `query: QueryRuleSet` - The current query state
- `config: QueryBuilderConfig` - Configuration object for the query builder

**Outputs:**
- `queryChange: EventEmitter<QueryRuleSet>` - Emitted when the query changes

#### QueryRuleComponent

Individual rule component for editing single query rules.

#### QueryRuleSetComponent

Component for managing groups of rules and nested rule sets.

### Interfaces

#### QueryField

```typescript
interface QueryField {
  name: string;           // Display name for the field
  value: string;          // Unique identifier for the field
  type: 'string' | 'number' | 'date' | 'time' | 'boolean' | 'category';
  operators?: string[];   // Custom operators for this field
  options?: QueryOption[]; // Options for category fields
  getOperators?: () => string[]; // Function to get operators dynamically
  getOptions?: () => QueryOption[]; // Function to get options dynamically
}
```

#### QueryRule

```typescript
interface QueryRule {
  field: string;          // Field identifier
  operator: string;       // Operator (e.g., '=', 'contains', '>')
  value: any;             // Value for the rule
  entity?: string;        // Optional entity identifier
}
```

#### QueryRuleSet

```typescript
interface QueryRuleSet {
  condition: 'and' | 'or'; // Logical condition for combining rules
  rules: (QueryRule | QueryRuleSet)[]; // Array of rules or nested rule sets
  collapsed?: boolean;     // Whether the rule set is collapsed
}
```

#### QueryBuilderConfig

```typescript
interface QueryBuilderConfig {
  fields: QueryField[];           // Available fields
  operators?: { [key: string]: string[] }; // Custom operators by field type
  defaultCondition?: 'and' | 'or'; // Default logical condition
  allowEmpty?: boolean;           // Allow empty rule sets
  allowCollapse?: boolean;        // Enable collapsible rule sets
  classNames?: { [key: string]: string }; // Custom CSS class names
}
```

### Services

#### QueryBuilderService

Service for managing query state and operations.

**Methods:**
- `addRule(ruleset: QueryRuleSet): QueryRuleSet` - Add a new rule
- `addRuleSet(ruleset: QueryRuleSet): QueryRuleSet` - Add a new rule set
- `removeRule(ruleset: QueryRuleSet, ruleIndex: number): QueryRuleSet` - Remove a rule
- `removeRuleSet(ruleset: QueryRuleSet, ruleSetIndex: number): QueryRuleSet` - Remove a rule set
- `getQueryString(ruleset: QueryRuleSet): string` - Generate query string representation
- `getCurrentState(): QueryRuleSet` - Get current query state

## Field Types

### String Fields
- Operators: `=`, `!=`, `contains`, `not contains`, `starts with`, `ends with`, `is empty`, `is not empty`
- Input: Text input

### Number Fields
- Operators: `=`, `!=`, `>`, `>=`, `<`, `<=`, `between`, `not between`, `is empty`, `is not empty`
- Input: Number input

### Date Fields
- Operators: `=`, `!=`, `>`, `>=`, `<`, `<=`, `between`, `not between`, `is empty`, `is not empty`
- Input: Date picker

### Time Fields
- Operators: `=`, `!=`, `>`, `>=`, `<`, `<=`, `between`, `not between`, `is empty`, `is not empty`
- Input: Time picker

### Boolean Fields
- Operators: `=`, `!=`, `is empty`, `is not empty`
- Input: Checkbox

### Category Fields
- Operators: `=`, `!=`, `in`, `not in`, `is empty`, `is not empty`
- Input: Dropdown with predefined options

## Styling

The query builder comes with built-in styles that can be customized using CSS classes and SCSS variables.

### Custom CSS Classes

```typescript
config: QueryBuilderConfig = {
  // ... other config
  classNames: {
    queryBuilder: 'my-custom-query-builder',
    ruleSet: 'my-custom-rule-set',
    rule: 'my-custom-rule'
  }
};
```

### SCSS Customization

```scss
// Customize button colors
.query-builder {
  .btn-primary {
    background-color: #your-color;
    border-color: #your-color;
  }
  
  .btn-secondary {
    background-color: #your-secondary-color;
    border-color: #your-secondary-color;
  }
}

// Customize form inputs
.query-rule {
  .form-control,
  .form-select {
    border-color: #your-border-color;
    
    &:focus {
      border-color: #your-focus-color;
      box-shadow: 0 0 0 0.2rem rgba(your-focus-color, 0.25);
    }
  }
}
```

## Examples

### Basic Query Builder

See `BasicUsageComponent` for a simple implementation.

### Demo Component

Use `QueryBuilderDemoComponent` to see all features in action.

### Custom Field Types

```typescript
// Custom field with dynamic operators
{
  name: 'Status',
  value: 'status',
  type: 'category',
  getOperators: () => ['=', '!=', 'in', 'not in'],
  getOptions: () => [
    { name: 'Active', value: 'active' },
    { name: 'Inactive', value: 'inactive' },
    { name: 'Pending', value: 'pending' }
  ]
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please refer to the project documentation or create an issue in the repository.
