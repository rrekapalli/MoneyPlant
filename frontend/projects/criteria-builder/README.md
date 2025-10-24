# Criteria Builder Library

A sophisticated Angular library for building complex query expressions through an intuitive visual interface using nested group-chips and interactive popovers.

## Overview

The Criteria Builder provides a visual query builder system for the MoneyPlant screener application. Users can dynamically compose sophisticated conditional expressions through click-based interactions, which are automatically converted to CriteriaDSL JSON format for backend processing.

## Key Features

- **Visual-First Approach**: Build queries through visual interactions, no manual SQL/DSL writing required
- **Nested Group-Chip Architecture**: Hierarchical chip structure mirroring logical query structure
- **Progressive Disclosure**: Start simple and build complexity through popovers
- **Real-time Validation**: Immediate feedback and SQL preview as queries are built
- **PrimeNG Integration**: Built on PrimeNG components for consistent UI/UX
- **Form Integration**: Seamless integration with Angular reactive forms via ControlValueAccessor
- **Accessibility**: Full WCAG 2.1 AA compliance with keyboard navigation and screen reader support

## Installation

```bash
npm install criteria-builder
```

## Peer Dependencies

This library requires the following peer dependencies:

```json
{
  "@angular/common": "^20.3.0",
  "@angular/core": "^20.3.0",
  "@angular/forms": "^20.3.0",
  "@angular/cdk": "^20.2.0",
  "primeng": "^20.2.0",
  "primeicons": "^7.0.0",
  "rxjs": "~7.8.0"
}
```

## Basic Usage

```typescript
import { CriteriaBuilderComponent, CriteriaBuilderConfig } from 'criteria-builder';

@Component({
  template: `
    <mp-criteria-builder
      [config]="config"
      formControlName="criteria"
      (dslChange)="onCriteriaChange($event)">
    </mp-criteria-builder>
  `
})
export class MyComponent {
  config: CriteriaBuilderConfig = {
    maxDepth: 10,
    maxElements: 100,
    compactMode: false,
    enableDragDrop: true,
    showSqlPreview: true,
    validationMode: 'realtime'
  };

  onCriteriaChange(dsl: CriteriaDSL) {
    console.log('Criteria changed:', dsl);
  }
}
```

## Configuration

The library accepts a `CriteriaBuilderConfig` object for customization:

- `maxDepth`: Maximum nesting depth (default: 10)
- `maxElements`: Maximum total elements (default: 100)
- `compactMode`: Display in compact mode (default: false)
- `enableDragDrop`: Enable drag and drop (default: true)
- `showSqlPreview`: Show SQL preview panel (default: true)
- `validationMode`: Validation timing ('realtime' | 'onchange' | 'manual')

## API Integration

The component integrates with backend APIs for:

- Field metadata: `/api/screeners/fields`
- Function metadata: `/api/screeners/functions`
- Operator compatibility: `/api/screeners/fields/{fieldId}/operators`
- Real-time validation: `/api/screeners/validate-partial-criteria`
- SQL generation: `/api/screeners/generate-sql`
- Human-readable preview: `/api/screeners/preview-criteria`

## Development

### Building the Library

```bash
ng build criteria-builder
```

### Running Tests

```bash
ng test criteria-builder
```

### Publishing

```bash
ng build criteria-builder
cd dist/criteria-builder
npm publish
```

## Architecture

The library follows a modular architecture with:

- **Core Interfaces**: TypeScript interfaces for type safety
- **Component Hierarchy**: Nested components for different chip types
- **Service Layer**: API integration and state management
- **Validation System**: Real-time validation with error handling
- **Accessibility Layer**: WCAG 2.1 AA compliance features

## Contributing

Please refer to the main MoneyPlant project contributing guidelines.

## License

MIT License - see LICENSE file for details.