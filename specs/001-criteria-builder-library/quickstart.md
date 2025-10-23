# Quickstart Guide: Criteria Builder Library

**Date**: 2024-12-19  
**Feature**: Criteria Builder Library  
**Purpose**: Get started quickly with the Angular criteria builder component

## Installation

### Prerequisites
- Angular 20+
- PrimeNG 20+
- Angular CDK (for drag & drop)

### Install Dependencies
```bash
npm install @angular/cdk primeicons
```

### Install Library
```bash
npm install @moneyplant/criteria-builder
```

## Basic Usage

### 1. Import Module
```typescript
import { MpCriteriaBuilderModule } from '@moneyplant/criteria-builder';

@NgModule({
  imports: [
    MpCriteriaBuilderModule,
    // ... other modules
  ],
  // ...
})
export class AppModule { }
```

### 2. Parent Component Setup (Handles All API Calls)
```typescript
import { Component } from '@angular/core';
import { ScreenerApiService } from '../services/apis/screener.api';
import { ScreenerStateService } from '../services/state/screener.state';
import { FieldMeta, FunctionMeta } from '@moneyplant/criteria-builder';

@Component({
  selector: 'app-screener-configure',
  template: `
    <mp-criteria-builder
      [fields]="fields$ | async"
      [functions]="functions$ | async"
      [validationResult]="validationResult$ | async"
      [sqlPreview]="sqlPreview$ | async"
      [config]="criteriaConfig"
      formControlName="criteria"
      (dslChange)="onDslChange($event)"
      (validationRequest)="onValidationRequest($event)"
      (sqlRequest)="onSqlRequest($event)">
    </mp-criteria-builder>
  `
})
export class ScreenerConfigureComponent {
  // Observable data from existing services
  fields$ = this.screenerApi.getFields();
  functions$ = this.screenerApi.getFunctions();
  validationResult$ = this.screenerState.validationResult$;
  sqlPreview$ = this.screenerState.sqlPreview$;

  criteriaConfig = {
    allowGrouping: true,
    maxDepth: 10,
    enableAdvancedFunctions: true,
    displayMode: 'expanded' as const,
    showSqlPreview: true,
    enableUndo: true,
    maxElements: 100
  };

  constructor(
    private screenerApi: ScreenerApiService,
    private screenerState: ScreenerStateService
  ) {}

  onDslChange(dsl: CriteriaDSL) {
    console.log('DSL changed:', dsl);
  }

  onValidationRequest(dsl: CriteriaDSL) {
    this.screenerApi.validateCriteria({ dsl }).subscribe(result => {
      this.screenerState.setValidationResult(result);
    });
  }

  onSqlRequest(dsl: CriteriaDSL) {
    this.screenerApi.generateSql({ dsl }).subscribe(result => {
      this.screenerState.setSqlPreview(result.sql);
    });
  }
}
```

### 3. Use in Template
```html
<mp-criteria-builder
  formControlName="criteria"
  [fields]="fields"
  [functions]="functions"
  [config]="{ allowGrouping: true, maxDepth: 5 }"
  (dslChange)="onCriteriaChange($event)"
  (validityChange)="onValidityChange($event)"
  (sqlPreviewChange)="onSqlPreviewChange($event)">
</mp-criteria-builder>
```

### 4. Handle Events
```typescript
export class MyComponent {
  onCriteriaChange(dsl: CriteriaDSL) {
    console.log('Criteria changed:', dsl);
  }

  onValidityChange(isValid: boolean) {
    console.log('Validity changed:', isValid);
  }

  onSqlPreviewChange(sql: string) {
    console.log('SQL preview:', sql);
  }
}
```

## Advanced Configuration

### Custom Configuration
```typescript
const config: CriteriaConfig = {
  allowGrouping: true,
  maxDepth: 10,
  enableAdvancedFunctions: true,
  displayMode: 'expanded',
  showSqlPreview: true,
  enableUndo: true,
  maxElements: 100
};
```

### Form Integration
```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class MyComponent {
  criteriaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.criteriaForm = this.fb.group({
      criteria: [null, [this.criteriaValidator]]
    });
  }

  criteriaValidator(control: AbstractControl) {
    const dsl = control.value as CriteriaDSL;
    if (!dsl || !dsl.root) {
      return { required: true };
    }
    return null;
  }
}
```

## Service Usage

### Criteria Serializer Service
```typescript
import { CriteriaSerializerService } from '@moneyplant/criteria-builder';

export class MyService {
  constructor(private serializer: CriteriaSerializerService) {}

  generateSql(dsl: CriteriaDSL) {
    const result = this.serializer.serialize(dsl, fields, functions);
    return {
      sql: result.sql,
      params: result.params
    };
  }
}
```

### Validation Service
```typescript
import { CriteriaValidationService } from '@moneyplant/criteria-builder';

export class MyService {
  constructor(private validator: CriteriaValidationService) {}

  validateCriteria(dsl: CriteriaDSL) {
    return this.validator.validate(dsl, fields, functions);
  }
}
```

## Styling and Theming

### Custom Theme
```scss
// Custom badge colors
:host ::ng-deep {
  .mp-field-badge {
    background-color: #e3f2fd;
    color: #1976d2;
  }

  .mp-operator-badge {
    background-color: #f3e5f5;
    color: #7b1fa2;
  }

  .mp-value-badge {
    background-color: #e8f5e8;
    color: #388e3c;
  }

  .mp-function-badge {
    background-color: #fff3e0;
    color: #f57c00;
  }

  .mp-group-badge {
    background-color: #fce4ec;
    color: #c2185b;
  }
}
```

### Responsive Design
```scss
// Mobile-first responsive design
.mp-criteria-builder {
  @media (max-width: 768px) {
    .mp-badge {
      font-size: 0.875rem;
      padding: 0.25rem 0.5rem;
    }
    
    .mp-group {
      padding: 0.5rem;
    }
  }
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between badges
- **Enter/Space**: Activate selected badge
- **Arrow Keys**: Navigate within groups
- **Escape**: Cancel current operation
- **Delete**: Remove selected badge

### Screen Reader Support
- All badges have proper ARIA labels
- Dynamic content changes are announced
- Group structure is properly described
- Form validation states are communicated

## Error Handling

### Validation Errors
```typescript
export class MyComponent {
  onValidationErrors(errors: ValidationError[]) {
    errors.forEach(error => {
      console.error(`Validation Error: ${error.message}`);
      // Handle specific error types
      switch (error.code) {
        case 'INVALID_FIELD':
          // Handle invalid field error
          break;
        case 'INVALID_OPERATOR':
          // Handle invalid operator error
          break;
      }
    });
  }
}
```

### Network Errors
```typescript
export class MyService {
  async loadFieldMetadata() {
    try {
      return await this.http.get<FieldMeta[]>('/api/v1/screener/fields').toPromise();
    } catch (error) {
      console.error('Failed to load field metadata:', error);
      // Fallback to default fields or show error message
      return this.getDefaultFields();
    }
  }
}
```

## Performance Optimization

### OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class MyComponent {
  // Component implementation
}
```

### TrackBy Functions
```typescript
export class MyComponent {
  trackByBadgeId(index: number, badge: BadgeState): string {
    return badge.id;
  }

  trackByFieldId(index: number, field: FieldMeta): string {
    return field.id;
  }
}
```

## Testing

### Unit Tests
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MpCriteriaBuilderModule } from '@moneyplant/criteria-builder';

describe('CriteriaBuilderComponent', () => {
  let component: MpCriteriaBuilderComponent;
  let fixture: ComponentFixture<MpCriteriaBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpCriteriaBuilderModule],
      declarations: [TestComponent]
    }).compileComponents();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit dsl change when criteria is modified', () => {
    spyOn(component.dslChange, 'emit');
    // Test implementation
    expect(component.dslChange.emit).toHaveBeenCalled();
  });
});
```

### Integration Tests
```typescript
describe('Criteria Builder Integration', () => {
  it('should integrate with reactive forms', () => {
    const form = new FormGroup({
      criteria: new FormControl(null)
    });
    
    // Test form integration
    expect(form.valid).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

#### Component Not Rendering
- Ensure `MpCriteriaBuilderModule` is imported
- Check that `fields` and `functions` arrays are provided
- Verify Angular version compatibility

#### Drag & Drop Not Working
- Ensure `DragDropModule` is imported
- Check browser compatibility
- Verify CDK version matches Angular version

#### Validation Errors
- Check field metadata configuration
- Verify operator compatibility with field types
- Ensure function parameters are correctly defined

#### Performance Issues
- Use OnPush change detection strategy
- Implement trackBy functions for lists
- Limit maximum nesting depth
- Consider lazy loading for large datasets

### Debug Mode
```typescript
// Enable debug logging
const config: CriteriaConfig = {
  // ... other config
  debug: true
};
```

## Migration Guide

### From Custom Implementation
1. Replace custom criteria builder with `<mp-criteria-builder>`
2. Update data structures to match `CriteriaDSL` interface
3. Migrate validation logic to use `CriteriaValidationService`
4. Update styling to use component CSS classes

### Version Updates
- Check breaking changes in changelog
- Update field metadata structure if needed
- Verify function definitions compatibility
- Test form integration after updates
