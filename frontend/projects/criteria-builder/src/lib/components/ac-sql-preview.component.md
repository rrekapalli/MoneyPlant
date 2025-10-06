# AcSqlPreviewComponent

The `AcSqlPreviewComponent` provides a collapsible SQL preview panel with API-driven SQL generation for the Criteria Builder library.

## Features

- **Collapsible Panel**: Toggle between expanded and collapsed states
- **API Integration**: Server-side SQL generation using `CriteriaApiService`
- **Syntax Highlighting**: Formatted SQL display with basic syntax highlighting
- **Parameter Display**: Shows parameterized query parameters in separate section
- **Copy Functionality**: Copy SQL, parameters, or both to clipboard
- **Real-time Updates**: Debounced API calls when criteria changes
- **Error Handling**: User-friendly error messages for SQL generation failures
- **Responsive Design**: Mobile-friendly layout with proper responsive behavior
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Usage

### Basic Usage

```html
<ac-sql-preview
  [dsl]="criteriaDSL"
  [isValid]="isValidCriteria"
  [collapsed]="false">
</ac-sql-preview>
```

### With Configuration

```html
<ac-sql-preview
  [dsl]="currentDSL$ | async"
  [isValid]="isValid$ | async"
  [collapsed]="mode === 'simple'">
</ac-sql-preview>
```

## Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dsl` | `CriteriaDSL \| null` | `null` | The criteria DSL to generate SQL from |
| `isValid` | `boolean \| null` | `false` | Whether the criteria is valid for SQL generation |
| `collapsed` | `boolean` | `false` | Whether the panel should be collapsed initially |

## API Integration

The component integrates with the `CriteriaApiService` to generate SQL:

```typescript
// SQL Generation API call
generateSql(dsl: CriteriaDSL): Observable<SqlGenerationResult>
```

### API Response Format

```typescript
interface SqlGenerationResult {
  sql: string;                    // Generated parameterized SQL
  parameters: Record<string, any>; // Parameter values
  generatedAt: string;            // Generation timestamp
  generatedBy: string;            // User who generated the SQL
  dslHash: string;                // Hash of the DSL for caching
}
```

## Component States

### Loading State
- Displays spinner and "Generating SQL..." message
- Shown during API calls

### Error State
- Shows error icon and user-friendly error message
- Handles API failures gracefully

### Invalid State
- Displays info message when criteria is invalid or empty
- Provides guidance on how to fix issues

### Success State
- Shows generated SQL with syntax highlighting
- Displays parameters in formatted JSON
- Provides copy functionality for SQL and parameters

## Copy Functionality

The component provides three copy options:

1. **Copy SQL**: Copies only the SQL query
2. **Copy Parameters**: Copies only the parameters as JSON
3. **Copy All**: Copies SQL, parameters, and metadata

### Copy Methods

```typescript
// Copy individual parts
await component.copySqlToClipboard();
await component.copyParamsToClipboard();

// Copy everything
await component.copyAllToClipboard();
```

## Styling

The component uses CSS custom properties for theming:

```scss
.ac-sql-preview {
  --surface-border: #e0e0e0;
  --surface-card: #ffffff;
  --primary-color: #007bff;
  --text-color: #333;
  --text-color-secondary: #6c757d;
}
```

### Dark Theme Support

The component automatically adapts to dark theme preferences:

```scss
@media (prefers-color-scheme: dark) {
  .ac-sql-preview {
    --surface-card: #1f2937;
    --surface-border: #374151;
  }
}
```

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Tab order and keyboard shortcuts
- **High Contrast**: Support for high contrast mode
- **Focus Indicators**: Clear visual focus indicators
- **Screen Reader Announcements**: Status updates for SQL generation

## Performance Considerations

- **Debounced API Calls**: 300ms debounce to prevent excessive API requests
- **Change Detection**: Uses `OnPush` strategy for optimal performance
- **Memory Management**: Proper subscription cleanup to prevent memory leaks

## Error Handling

The component handles various error scenarios:

1. **API Unavailable**: Shows fallback message
2. **Invalid DSL**: Displays validation guidance
3. **Network Errors**: User-friendly error messages
4. **Clipboard Errors**: Fallback copy methods for older browsers

## Integration Example

```typescript
@Component({
  template: `
    <ac-criteria-builder
      [(ngModel)]="criteria"
      [config]="{ showSqlPreview: true }"
      (validityChange)="onValidityChange($event)">
    </ac-criteria-builder>
  `
})
export class MyComponent {
  criteria: CriteriaDSL = { root: { operator: 'AND', children: [] } };
  
  onValidityChange(isValid: boolean): void {
    console.log('Criteria validity changed:', isValid);
  }
}
```

## Testing

The component includes comprehensive unit tests covering:

- SQL generation with valid/invalid DSL
- Error handling scenarios
- Copy functionality
- State management
- API integration
- User interactions

Run tests with:

```bash
ng test criteria-builder --include="**/ac-sql-preview.component.spec.ts"
```