# DropdownContentComponent Usage Examples

## Basic Field Selection Dropdown

```typescript
// Component usage
<ac-dropdown-content
  overlayType="field"
  [loadFromApi]="true"
  [searchable]="true"
  [categorized]="true"
  [enableTooltips]="true"
  [showDescriptions]="true"
  (optionSelect)="onFieldSelect($event)"
  (loadingChange)="onLoadingChange($event)">
</ac-dropdown-content>

// Component handler
onFieldSelect(option: DropdownOption) {
  console.log('Selected field:', option);
  // option.value contains the field ID
  // option.label contains the display name
  // option.category contains the field category
}
```

## Operator Selection with Field Context

```typescript
// Component usage for field-specific operators
<ac-dropdown-content
  overlayType="operator"
  [fieldId]="selectedFieldId"
  [loadFromApi]="true"
  [searchable]="true"
  [categorized]="true"
  (optionSelect)="onOperatorSelect($event)">
</ac-dropdown-content>

// This will automatically load operators compatible with the specified field
```

## Function Selection with Search and Categories

```typescript
// Component usage for functions
<ac-dropdown-content
  overlayType="function"
  [loadFromApi]="true"
  [searchable]="true"
  [categorized]="true"
  [enableTooltips]="true"
  [showDescriptions]="true"
  maxHeight="400px"
  (optionSelect)="onFunctionSelect($event)"
  (searchChange)="onFunctionSearch($event)">
</ac-dropdown-content>

// Search handler
onFunctionSearch(searchTerm: string) {
  console.log('User searching for:', searchTerm);
  // The component automatically handles API calls for search
}
```

## Value Suggestions with Dynamic Loading

```typescript
// Component usage for value suggestions
<ac-dropdown-content
  overlayType="value"
  [fieldId]="selectedFieldId"
  [loadFromApi]="true"
  [searchable]="true"
  [enableTooltips]="true"
  (optionSelect)="onValueSelect($event)"
  (searchChange)="onValueSearch($event)">
</ac-dropdown-content>

// The component will automatically call the field suggestions API
// and reload suggestions as the user types
```

## Fallback Mode (Without API)

```typescript
// Component usage with static data
<ac-dropdown-content
  overlayType="field"
  [loadFromApi]="false"
  [fields]="staticFields"
  [searchable]="true"
  [categorized]="true"
  (optionSelect)="onFieldSelect($event)">
</ac-dropdown-content>

// Static data
staticFields: FieldMeta[] = [
  {
    id: 'price',
    label: 'Price',
    dbColumn: 'price',
    dataType: 'number',
    category: 'Financial',
    description: 'Stock price'
  }
];
```

## Keyboard Navigation

The component supports full keyboard navigation:

- **↑/↓ Arrow Keys**: Navigate through options
- **Enter**: Select highlighted option
- **Escape**: Close dropdown
- **/** (Forward slash): Focus search input
- **Tab**: Navigate to next focusable element

## API Integration Features

### Automatic Data Loading
- Fields loaded from `/api/screeners/criteria/fields`
- Functions loaded from `/api/screeners/criteria/functions`
- Operators loaded from `/api/screeners/criteria/fields/{fieldId}/operators`
- Value suggestions from `/api/screeners/criteria/fields/{fieldId}/suggestions`

### Error Handling
- Graceful fallback to static data on API failures
- User-friendly error messages
- Retry functionality for failed requests

### Loading States
- Loading indicators during API calls
- Disabled search input during loading
- Loading state in dropdown options

### Search Integration
- Debounced search (300ms)
- Real-time API calls for value suggestions
- Local filtering for other overlay types
- Search term highlighting in results

## Accessibility Features

- Full ARIA support with proper labels and descriptions
- Screen reader announcements for state changes
- High contrast mode support
- Keyboard navigation with visual focus indicators
- Tooltips with helpful descriptions and help text

## Customization Options

```typescript
interface DropdownContentInputs {
  overlayType: 'field' | 'operator' | 'function' | 'value';
  fieldId?: string;              // For operator/value context
  searchable?: boolean;          // Enable/disable search
  categorized?: boolean;         // Group by categories
  maxHeight?: string;            // Maximum dropdown height
  enableTooltips?: boolean;      // Show tooltips
  showDescriptions?: boolean;    // Show option descriptions
  loadFromApi?: boolean;         // Use API or static data
}
```

## Events

```typescript
interface DropdownContentOutputs {
  optionSelect: EventEmitter<DropdownOption>;    // Option selected
  searchChange: EventEmitter<string>;            // Search term changed
  loadingChange: EventEmitter<boolean>;          // Loading state changed
}
```