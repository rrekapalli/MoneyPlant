# Form Integration Guide

The Criteria Builder component provides comprehensive Angular reactive forms integration through the `ControlValueAccessor` interface and custom validators.

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CriteriaValidators } from '@mp/criteria-builder';

@Component({
  template: `
    <form [formGroup]="form">
      <mp-criteria-builder
        formControlName="criteria"
        [config]="config"
        (criteriaChange)="onCriteriaChange($event)"
        (validationChange)="onValidationChange($event)">
      </mp-criteria-builder>
    </form>
  `
})
export class MyComponent {
  form = this.fb.group({
    criteria: [null, [Validators.required, CriteriaValidators.required]]
  });

  constructor(private fb: FormBuilder) {}
}
```

## ControlValueAccessor Implementation

The component implements the `ControlValueAccessor` interface providing:

### Core Methods
- `writeValue(value)` - Updates component when form control value changes
- `registerOnChange(fn)` - Registers callback for value changes
- `registerOnTouched(fn)` - Registers callback for touch events
- `setDisabledState(isDisabled)` - Handles disabled state

### Form State Management
- **Touched State**: Automatically managed when user interacts with component
- **Dirty State**: Set when criteria changes from initial value
- **Disabled State**: Respects form control disabled state
- **Validation State**: Integrates with Angular form validation

## Custom Validators

### Built-in Validators

#### `CriteriaValidators.required`
Ensures criteria has at least one condition.

```typescript
this.fb.group({
  criteria: [null, CriteriaValidators.required]
});
```

#### `CriteriaValidators.minConditions(count)`
Validates minimum number of conditions.

```typescript
this.fb.group({
  criteria: [null, CriteriaValidators.minConditions(2)]
});
```

#### `CriteriaValidators.maxConditions(count)`
Validates maximum number of conditions.

```typescript
this.fb.group({
  criteria: [null, CriteriaValidators.maxConditions(10)]
});
```

#### `CriteriaValidators.maxDepth(depth)`
Validates maximum nesting depth.

```typescript
this.fb.group({
  criteria: [null, CriteriaValidators.maxDepth(5)]
});
```

#### `CriteriaValidators.completeConditions`
Ensures all conditions are complete (have all required fields).

```typescript
this.fb.group({
  criteria: [null, CriteriaValidators.completeConditions]
});
```

#### `CriteriaValidators.validFieldReferences(fields)`
Validates field references against available fields.

```typescript
this.fb.group({
  criteria: [null, CriteriaValidators.validFieldReferences(['price', 'volume'])]
});
```

#### `CriteriaValidators.validFunctionReferences(functions)`
Validates function references against available functions.

```typescript
this.fb.group({
  criteria: [null, CriteriaValidators.validFunctionReferences(['SMA', 'EMA'])]
});
```

### Composite Validator

Use `CriteriaValidators.criteriaValidator()` to combine multiple validators:

```typescript
this.fb.group({
  criteria: [
    null, 
    CriteriaValidators.criteriaValidator({
      required: true,
      minConditions: 1,
      maxConditions: 20,
      maxDepth: 5,
      completeConditions: true,
      availableFields: ['price', 'volume', 'marketCap'],
      availableFunctions: ['SMA', 'EMA', 'RSI']
    })
  ]
});
```

## Event Handling

### Core Events

```typescript
// Criteria changes
(criteriaChange)="onCriteriaChange($event)"

// Validation results
(validationChange)="onValidationChange($event)"

// SQL generation
(sqlGenerated)="onSqlGenerated($event)"

// Preview generation
(previewGenerated)="onPreviewGenerated($event)"
```

### Form State Events

```typescript
// Form state changes
(touched)="onTouched($event)"
(dirty)="onDirty($event)"
(statusChange)="onStatusChange($event)"

// Focus events
(focus)="onFocus()"
(blur)="onBlur()"
```

### User Interaction Events

```typescript
// Chip operations
(chipAdded)="onChipAdded($event)"
(chipRemoved)="onChipRemoved($event)"
(chipModified)="onChipModified($event)"

// Error handling
(errorOccurred)="onError($event)"
(loadingStateChange)="onLoadingChange($event)"
```

## Form Control Classes

The component automatically applies Angular form control CSS classes:

```scss
.criteria-builder-container {
  &.ng-valid { /* Valid state styles */ }
  &.ng-invalid { /* Invalid state styles */ }
  &.ng-touched { /* Touched state styles */ }
  &.ng-dirty { /* Dirty state styles */ }
  &.ng-disabled { /* Disabled state styles */ }
}
```

## Accessibility

### ARIA Attributes
- `aria-invalid` - Set based on validation state
- `aria-describedby` - Links to error messages
- `aria-required` - Set based on required validators
- `aria-label` - Descriptive label for screen readers

### Keyboard Navigation
- `tabindex` - Proper tab order
- Focus management for interactive elements
- Keyboard shortcuts for common operations

## Error Display

### Form Validation Errors
Validation errors are automatically displayed when the control is touched:

```html
<div *ngIf="form.get('criteria')?.errors && form.get('criteria')?.touched">
  <div *ngFor="let error of getCriteriaErrors()">
    {{ error.message }}
  </div>
</div>
```

### Real-time Validation
The component provides real-time validation feedback through:
- Visual indicators on chips
- Validation summary panel
- Form control state updates

## Advanced Configuration

### Validation Configuration
```typescript
const config = {
  enableRealTimeValidation: true,
  validationDebounceMs: 300,
  showValidationBadges: true
};
```

### Change Detection Optimization
The component uses `OnPush` change detection strategy with:
- Reactive streams for state management
- Debounced validation updates
- Optimized subscription management
- Proper cleanup on destroy

## Best Practices

### 1. Form Structure
```typescript
// Good: Clear validation rules
this.form = this.fb.group({
  name: ['', [Validators.required]],
  criteria: [
    null, 
    [
      Validators.required,
      CriteriaValidators.minConditions(1),
      CriteriaValidators.maxDepth(5)
    ]
  ]
});
```

### 2. Error Handling
```typescript
// Good: Comprehensive error handling
onCriteriaError(event: {error: string, context?: any}): void {
  console.error('Criteria error:', event);
  this.showErrorMessage(event.error);
}
```

### 3. State Management
```typescript
// Good: Track all relevant state
onStatusChange(status: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'): void {
  this.criteriaStatus = status;
  this.updateFormActions();
}
```

### 4. Performance
```typescript
// Good: Use OnPush and reactive patterns
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  // Use observables for reactive updates
  criteria$ = this.form.get('criteria')?.valueChanges;
}
```

## Troubleshooting

### Common Issues

1. **Validation not triggering**
   - Ensure validators are properly registered
   - Check that form control is marked as touched
   - Verify validation configuration

2. **Change detection not working**
   - Component uses OnPush strategy
   - Ensure proper event emission
   - Use `markForCheck()` when needed

3. **Form state not updating**
   - Check ControlValueAccessor implementation
   - Verify event handlers are connected
   - Ensure proper subscription cleanup

### Debug Information

Enable debug mode to see detailed state information:

```typescript
const config = {
  showDebugInfo: true,
  enableLogging: true
};
```

This will log all form state changes and validation events to the console.