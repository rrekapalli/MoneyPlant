# Criteria Builder UI Library

An Angular v20 library that provides a sophisticated visual form control for building complex filtering criteria through interactive tokens and clickable elements. The library generates both human-readable criteria sentences and safe parameterized SQL WHERE clauses suitable for persistence and server execution.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Security Considerations](#security-considerations)
- [Accessibility](#accessibility)
- [Import/Export and Presets](#importexport-and-presets)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Visual Token Interface**: Interactive tokens for fields, operators, values, and functions
- **Dynamic API Integration**: Real-time loading of fields, functions, and operators from backend APIs
- **Drag & Drop**: Reorder query elements with Angular CDK drag-and-drop
- **Form Integration**: Full ControlValueAccessor support for Angular Reactive Forms
- **SQL Generation**: Server-side parameterized SQL generation for security
- **Import/Export**: JSON-based criteria sharing and preset management
- **Accessibility**: Full keyboard navigation and screen reader support
- **Validation**: Real-time validation with detailed error reporting
- **Grouping**: Complex nested logic with AND/OR/NOT operators
- **Functions**: Database-driven function library with parameter validation

## Installation

### Quick Install

```bash
# Install the library
npm install @projects/criteria-builder

# Install peer dependencies
npm install @angular/common@^20.0.0 @angular/core@^20.0.0 @angular/forms@^20.0.0 @angular/cdk@^20.0.0 primeng@^20.0.0 primeicons@^7.0.0 primeflex@^4.0.0 rxjs@~7.8.0
```

### Complete Setup Guide

For detailed installation instructions, module setup, styles configuration, and API backend setup, see the **[Complete Installation Guide](INSTALLATION.md)**.

The installation guide covers:
- Prerequisites and system requirements
- Step-by-step installation process
- Module and styles configuration
- API backend setup requirements
- Basic usage examples
- Verification and troubleshooting
- Production deployment considerations

## Quick Start

### 1. Import the Module

```typescript
import { CriteriaBuilderModule } from '@projects/criteria-builder';

@NgModule({
  imports: [
    CriteriaBuilderModule,
    // ... other imports
  ],
  // ...
})
export class AppModule { }
```

### 2. Basic Component Usage

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CriteriaDSL, BuilderConfig } from '@projects/criteria-builder';

@Component({
  selector: 'app-example',
  template: `
    <form>
      <ac-criteria-builder
        [formControl]="criteriaControl"
        [config]="builderConfig"
        (validityChange)="onValidityChange($event)"
        (sqlPreviewChange)="onSqlPreviewChange($event)">
      </ac-criteria-builder>
      
      <div *ngIf="generatedSql">
        <h3>Generated SQL:</h3>
        <pre>{{ generatedSql }}</pre>
      </div>
    </form>
  `
})
export class ExampleComponent {
  criteriaControl = new FormControl<CriteriaDSL | null>(null);
  
  builderConfig: BuilderConfig = {
    allowGrouping: true,
    maxDepth: 5,
    enableAdvancedFunctions: true,
    showSqlPreview: true,
    debounceMs: 200
  };
  
  generatedSql: string = '';
  
  onValidityChange(isValid: boolean) {
    console.log('Criteria validity:', isValid);
  }
  
  onSqlPreviewChange(result: { sql: string; params: Record<string, any> }) {
    this.generatedSql = result.sql;
    console.log('SQL Parameters:', result.params);
  }
}
```

### 3. Configure API Endpoints

The library requires backend API endpoints for dynamic functionality. Configure your API base URL:

```typescript
import { CriteriaApiService } from '@projects/criteria-builder';

// In your app.module.ts or component
constructor(private criteriaApiService: CriteriaApiService) {
  // The service expects these endpoints to be available:
  // GET /api/screeners/criteria/functions
  // GET /api/screeners/criteria/functions/{id}/signature
  // GET /api/screeners/criteria/fields
  // GET /api/screeners/criteria/fields/{id}/operators
  // GET /api/screeners/criteria/fields/{id}/suggestions
  // POST /api/screeners/criteria/validate
  // POST /api/screeners/criteria/sql
}
```

## Configuration

### BuilderConfig Interface

```typescript
interface BuilderConfig {
  // Core functionality
  allowGrouping?: boolean;          // Enable nested groups (default: true)
  maxDepth?: number;               // Maximum nesting depth (default: 5)
  enableAdvancedFunctions?: boolean; // Enable function library (default: true)
  
  // UI behavior
  showSqlPreview?: boolean;        // Show SQL preview panel (default: true)
  debounceMs?: number;            // Debounce delay for changes (default: 200)
  compactMode?: boolean;          // Compact visual layout (default: false)
  
  // Accessibility
  enableKeyboardShortcuts?: boolean; // Enable keyboard shortcuts (default: true)
  enableScreenReaderMode?: boolean;  // Enhanced screen reader support (default: false)
  enableHighContrastMode?: boolean;  // High contrast visual mode (default: false)
  enableColorBlindMode?: boolean;    // Colorblind-friendly indicators (default: false)
  
  // Theming
  theme?: 'light' | 'dark';       // Visual theme (default: 'light')
  locale?: string;                // Localization (default: 'en')
}
```

### Advanced Configuration Example

```typescript
const advancedConfig: BuilderConfig = {
  allowGrouping: true,
  maxDepth: 10,
  enableAdvancedFunctions: true,
  showSqlPreview: true,
  debounceMs: 300,
  compactMode: false,
  enableKeyboardShortcuts: true,
  enableScreenReaderMode: true,
  enableHighContrastMode: false,
  enableColorBlindMode: true,
  theme: 'light',
  locale: 'en'
};
```

## Usage Examples

### Example 1: Simple Criteria Builder

```typescript
@Component({
  template: `
    <ac-criteria-builder
      [(ngModel)]="simpleCriteria"
      [config]="simpleConfig">
    </ac-criteria-builder>
  `
})
export class SimpleCriteriaComponent {
  simpleCriteria: CriteriaDSL | null = null;
  
  simpleConfig: BuilderConfig = {
    allowGrouping: false,
    enableAdvancedFunctions: false,
    showSqlPreview: false
  };
}
```

### Example 2: Advanced Criteria with Validation

```typescript
@Component({
  template: `
    <form [formGroup]="criteriaForm">
      <ac-criteria-builder
        formControlName="criteria"
        [config]="advancedConfig"
        (validityChange)="onValidityChange($event)"
        (sqlPreviewChange)="onSqlChange($event)">
      </ac-criteria-builder>
      
      <button 
        [disabled]="!criteriaForm.valid || !isCriteriaValid"
        (click)="saveCriteria()">
        Save Criteria
      </button>
    </form>
  `
})
export class AdvancedCriteriaComponent {
  criteriaForm = this.fb.group({
    criteria: [null, Validators.required]
  });
  
  isCriteriaValid = false;
  currentSql = '';
  
  advancedConfig: BuilderConfig = {
    allowGrouping: true,
    maxDepth: 5,
    enableAdvancedFunctions: true,
    showSqlPreview: true
  };
  
  constructor(private fb: FormBuilder) {}
  
  onValidityChange(isValid: boolean) {
    this.isCriteriaValid = isValid;
  }
  
  onSqlChange(result: { sql: string; params: Record<string, any> }) {
    this.currentSql = result.sql;
  }
  
  saveCriteria() {
    if (this.criteriaForm.valid && this.isCriteriaValid) {
      const criteria = this.criteriaForm.value.criteria;
      // Save criteria to backend
      console.log('Saving criteria:', criteria);
      console.log('Generated SQL:', this.currentSql);
    }
  }
}
```

### Example 3: Preset Management

```typescript
@Component({
  template: `
    <div class="criteria-container">
      <ac-criteria-builder
        [(ngModel)]="criteria"
        [config]="config">
      </ac-criteria-builder>
      
      <div class="preset-controls">
        <button (click)="saveAsPreset()">Save as Preset</button>
        <select (change)="loadPreset($event.target.value)">
          <option value="">Select Preset...</option>
          <option *ngFor="let preset of presets" [value]="preset.id">
            {{ preset.name }}
          </option>
        </select>
      </div>
    </div>
  `
})
export class PresetExampleComponent {
  criteria: CriteriaDSL | null = null;
  presets: any[] = [];
  
  config: BuilderConfig = {
    allowGrouping: true,
    enableAdvancedFunctions: true
  };
  
  constructor(private presetService: CriteriaPresetService) {
    this.loadPresets();
  }
  
  loadPresets() {
    this.presets = this.presetService.getPresets();
  }
  
  saveAsPreset() {
    if (this.criteria) {
      const name = prompt('Enter preset name:');
      if (name) {
        this.presetService.savePreset(name, this.criteria);
        this.loadPresets();
      }
    }
  }
  
  loadPreset(presetId: string) {
    if (presetId) {
      const result = this.presetService.loadPreset(presetId);
      if (result.success) {
        this.criteria = result.dsl;
      }
    }
  }
}
```

### Example 4: Custom Field and Function Configuration

```typescript
@Component({
  template: `
    <ac-criteria-builder
      [(ngModel)]="criteria"
      [config]="config">
    </ac-criteria-builder>
  `
})
export class CustomConfigComponent implements OnInit {
  criteria: CriteriaDSL | null = null;
  
  config: BuilderConfig = {
    allowGrouping: true,
    enableAdvancedFunctions: true
  };
  
  constructor(private criteriaApiService: CriteriaApiService) {}
  
  ngOnInit() {
    // The API service automatically loads fields and functions
    // from your configured backend endpoints
    
    // Monitor loading state
    this.criteriaApiService.getFields().subscribe({
      next: (fields) => console.log('Loaded fields:', fields),
      error: (error) => console.error('Failed to load fields:', error)
    });
    
    this.criteriaApiService.getFunctions().subscribe({
      next: (functions) => console.log('Loaded functions:', functions),
      error: (error) => console.error('Failed to load functions:', error)
    });
  }
}
```

## API Reference

### Core Interfaces

#### CriteriaDSL
```typescript
interface CriteriaDSL {
  root: Group;
  meta?: {
    name?: string;
    description?: string;
    version?: number;
    createdBy?: string;
    createdAt?: string;
    tags?: string[];
  };
  validation?: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
  };
}
```

#### Group
```typescript
interface Group {
  operator: 'AND' | 'OR' | 'NOT';
  children: (Condition | Group)[];
}
```

#### Condition
```typescript
interface Condition {
  left: FieldRef | FunctionCall;
  op: Operator;
  right?: Literal | FieldRef | FunctionCall;
}
```

#### FieldMeta
```typescript
interface FieldMeta {
  id: string;
  label: string;
  dbColumn: string;
  dataType: FieldType;
  allowedOps?: Operator[];
  category?: string;
  description?: string;
  example?: string;
  nullable?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}
```

#### FunctionMeta
```typescript
interface FunctionMeta {
  id: string;
  label: string;
  returnType: FieldType;
  params: FunctionParam[];
  sqlTemplate?: string;
  description?: string;
  category?: string;
  examples?: string[];
  deprecated?: boolean;
  version?: string;
}
```

### Components

#### AcCriteriaBuilderComponent

**Selector:** `ac-criteria-builder`

**Inputs:**
- `config: BuilderConfig` - Component configuration options
- `ngModel: CriteriaDSL | null` - Current criteria DSL (via ControlValueAccessor)

**Outputs:**
- `validityChange: EventEmitter<boolean>` - Emitted when criteria validity changes
- `sqlPreviewChange: EventEmitter<{sql: string, params: Record<string, any>}>` - Emitted when SQL preview updates

**Methods:**
- `writeValue(value: CriteriaDSL | null): void` - Set criteria value (ControlValueAccessor)
- `registerOnChange(fn: (value: CriteriaDSL | null) => void): void` - Register change callback
- `registerOnTouched(fn: () => void): void` - Register touched callback
- `setDisabledState(isDisabled: boolean): void` - Set disabled state

### Services

#### CriteriaApiService

**Methods:**
- `getFields(): Observable<FieldMetaResp[]>` - Load available fields from API
- `getFunctions(): Observable<FunctionMetaResp[]>` - Load available functions from API
- `getFunctionSignature(functionId: string): Observable<FunctionSignature>` - Get function signature
- `getFieldOperators(fieldId: string): Observable<OperatorInfo[]>` - Get field-compatible operators
- `getFieldSuggestions(fieldId: string, query?: string): Observable<ValueSuggestion[]>` - Get value suggestions
- `validateCriteria(dsl: CriteriaDSL): Observable<ValidationResult>` - Validate criteria DSL
- `generateSql(dsl: CriteriaDSL): Observable<SqlGenerationResult>` - Generate SQL from DSL

#### CriteriaImportExportService

**Methods:**
- `exportToJson(dsl: CriteriaDSL, options?: ExportOptions): ExportResult` - Export DSL to JSON
- `importFromJson(jsonString: string, options?: ImportOptions): ImportResult` - Import DSL from JSON
- `exportToFile(dsl: CriteriaDSL, filename?: string, options?: ExportOptions): void` - Export to file
- `importFromFile(file: File, options?: ImportOptions): Promise<ImportResult>` - Import from file

#### CriteriaPresetService

**Methods:**
- `savePreset(name: string, dsl: CriteriaDSL, description?: string): PresetSaveResult` - Save preset
- `loadPreset(id: string): PresetLoadResult` - Load preset by ID
- `getPresets(): CriteriaPreset[]` - Get all presets
- `deletePreset(id: string): boolean` - Delete preset
- `searchPresets(query: string): CriteriaPreset[]` - Search presets
- `exportPreset(id: string): ExportResult` - Export preset to JSON
- `importPreset(jsonString: string, options?: ImportOptions): ImportResult` - Import preset

## Security Considerations

### SQL Injection Prevention

The Criteria Builder implements multiple layers of protection against SQL injection:

#### 1. Server-Side SQL Generation
- All SQL generation occurs on the server via API calls
- Client never constructs raw SQL strings
- Server uses parameterized queries with named parameters

```typescript
// Safe: Server-side SQL generation
const result = await this.criteriaApiService.generateSql(dsl);
// Returns: { sql: "WHERE price > :p1 AND volume > :p2", params: { p1: 100, p2: 1000 } }
```

#### 2. Field and Function Validation
- All field IDs and function IDs are validated against server-side whitelist
- Invalid references are rejected during validation
- No dynamic field or function names allowed

```typescript
// Safe: Validated field references
const condition: Condition = {
  left: { fieldId: 'price' }, // Validated against server field list
  op: '>',
  right: { type: 'number', value: 100 }
};
```

#### 3. Input Sanitization
- All user input is sanitized before processing
- Special characters are escaped or rejected
- Value types are strictly validated

#### 4. API Endpoint Security
Ensure your backend API endpoints implement proper security:

```typescript
// Backend security checklist:
// ✅ Validate all field IDs against database schema
// ✅ Validate all function IDs against function registry
// ✅ Use parameterized SQL queries only
// ✅ Implement rate limiting on validation endpoints
// ✅ Log suspicious validation attempts
// ✅ Validate DSL structure and depth limits
```

### Import/Export Security

#### 1. Content Validation
- All imported content is validated for malicious patterns
- Script tags and JavaScript code are detected and blocked
- File size limits prevent DoS attacks

```typescript
// Secure import with validation
const importResult = this.importExportService.importFromJson(jsonString, {
  validateContent: true,
  allowInvalid: false,
  maxFileSize: 10 * 1024 * 1024 // 10MB limit
});

if (!importResult.success) {
  console.error('Import blocked:', importResult.errors);
}
```

#### 2. Suspicious Content Detection
The system automatically detects and blocks:
- Script tags (`<script>`, `</script>`)
- JavaScript code patterns
- HTML injection attempts
- Template injection patterns
- Function calls and eval statements

#### 3. Safe Import Practices

```typescript
// DO: Always validate imports
const result = this.importExportService.importFromJson(data, {
  validateContent: true,
  allowInvalid: false
});

// DON'T: Never trust imported data without validation
// const dsl = JSON.parse(untrustedData); // UNSAFE!
```

### Best Practices

#### 1. API Security
```typescript
// Configure secure API endpoints
const apiConfig = {
  baseUrl: 'https://your-secure-api.com',
  timeout: 30000,
  retries: 3,
  validateCertificates: true
};
```

#### 2. Content Security Policy
```html
<!-- Add CSP headers to prevent XSS -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

#### 3. Input Validation
```typescript
// Always validate user input
const isValidFieldId = (fieldId: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldId) && fieldId.length <= 50;
};
```

#### 4. Error Handling
```typescript
// Don't expose sensitive information in errors
try {
  const result = await this.criteriaApiService.validateCriteria(dsl);
} catch (error) {
  // Log detailed error server-side
  console.error('Validation error:', error);
  
  // Show generic error to user
  this.showError('Validation failed. Please check your criteria.');
}
```

## Accessibility

The Criteria Builder includes comprehensive accessibility features. For detailed information, see [ACCESSIBILITY.md](./ACCESSIBILITY.md).

### Quick Accessibility Setup

```typescript
// Enable accessibility features
const accessibleConfig: BuilderConfig = {
  enableKeyboardShortcuts: true,
  enableScreenReaderMode: true,
  enableHighContrastMode: false, // Auto-detected from system
  enableColorBlindMode: true
};
```

### Keyboard Shortcuts

- `Ctrl + Enter`: Add new condition
- `Delete`: Delete selected token
- `F2` / `Enter`: Edit selected token
- `Arrow Keys`: Navigate between tokens
- `Tab`: Navigate to next interactive element

### Screen Reader Support

The component provides comprehensive ARIA labels and live announcements:

```typescript
// Example ARIA label
"Field: Price. Position 1 of 3. Press Enter to edit. Press Delete to remove."
```

## Import/Export and Presets

The library includes comprehensive import/export and preset management. For detailed information, see [IMPORT_EXPORT.md](./IMPORT_EXPORT.md).

### Quick Preset Usage

```typescript
import { CriteriaPresetService } from '@projects/criteria-builder';

// Save preset
const saveResult = this.presetService.savePreset('My Filter', dsl, 'Description');

// Load preset
const loadResult = this.presetService.loadPreset(presetId);

// Export preset
const exportResult = this.presetService.exportPreset(presetId);
```

## Troubleshooting

### Common Issues

#### 1. Component Not Displaying

**Problem:** The criteria builder component is not visible or renders incorrectly.

**Solutions:**
```typescript
// Check module import
@NgModule({
  imports: [
    CriteriaBuilderModule, // ✅ Ensure this is imported
    // ...
  ]
})

// Check styles import
// In angular.json or styles.scss:
@import 'primeng/resources/themes/saga-blue/theme.css';
@import 'primeng/resources/primeng.min.css';
@import 'primeicons/primeicons.css';
```

#### 2. API Endpoints Not Working

**Problem:** Fields, functions, or validation not loading from API.

**Solutions:**
```typescript
// Check API endpoint configuration
// Ensure these endpoints exist and return proper data:
// GET /api/screeners/criteria/functions
// GET /api/screeners/criteria/fields
// POST /api/screeners/criteria/validate
// POST /api/screeners/criteria/sql

// Check CORS configuration
// Ensure your backend allows requests from your frontend domain

// Check network requests in browser dev tools
// Look for 404, 500, or CORS errors
```

#### 3. Form Integration Issues

**Problem:** The component doesn't work with Angular Reactive Forms.

**Solutions:**
```typescript
// ✅ Correct usage with FormControl
const criteriaControl = new FormControl<CriteriaDSL | null>(null);

// ✅ Correct template binding
<ac-criteria-builder [formControl]="criteriaControl"></ac-criteria-builder>

// ❌ Don't use with template-driven forms without proper setup
// <ac-criteria-builder [(ngModel)]="criteria"></ac-criteria-builder>
// Requires FormsModule import
```

#### 4. Validation Not Working

**Problem:** Criteria validation always shows as valid or invalid.

**Solutions:**
```typescript
// Check API endpoint response format
// Validation endpoint should return:
{
  "isValid": boolean,
  "errors": ValidationError[],
  "warnings": ValidationWarning[]
}

// Check validation event handling
onValidityChange(isValid: boolean) {
  console.log('Validation state:', isValid);
  // Ensure this is being called
}

// Check server-side validation logic
// Ensure backend properly validates field IDs, function IDs, etc.
```

#### 5. SQL Generation Errors

**Problem:** SQL preview shows errors or doesn't update.

**Solutions:**
```typescript
// Check SQL generation endpoint
// POST /api/screeners/criteria/sql should return:
{
  "sql": "WHERE field > :p1",
  "parameters": { "p1": 100 },
  "generatedAt": "2024-01-01T00:00:00Z"
}

// Check for validation errors
// SQL generation is disabled when criteria is invalid

// Check event handling
onSqlPreviewChange(result: { sql: string; params: Record<string, any> }) {
  console.log('Generated SQL:', result.sql);
  console.log('Parameters:', result.params);
}
```

#### 6. Import/Export Issues

**Problem:** Import/export functionality not working.

**Solutions:**
```typescript
// Check file format
// Ensure JSON files have proper CriteriaDSL structure

// Check file size limits
const importResult = await this.importExportService.importFromFile(file, {
  maxFileSize: 10 * 1024 * 1024 // 10MB default
});

// Check validation settings
const importResult = this.importExportService.importFromJson(jsonString, {
  validateContent: true, // Enable validation
  allowInvalid: false    // Reject invalid DSL
});
```

#### 7. Performance Issues

**Problem:** Component is slow or unresponsive with large criteria.

**Solutions:**
```typescript
// Increase debounce time for large criteria
const config: BuilderConfig = {
  debounceMs: 500 // Increase from default 200ms
};

// Limit nesting depth
const config: BuilderConfig = {
  maxDepth: 3 // Reduce from default 5
};

// Use compact mode for better performance
const config: BuilderConfig = {
  compactMode: true
};
```

#### 8. Accessibility Issues

**Problem:** Screen readers or keyboard navigation not working.

**Solutions:**
```typescript
// Enable accessibility features
const config: BuilderConfig = {
  enableKeyboardShortcuts: true,
  enableScreenReaderMode: true
};

// Check ARIA labels in browser dev tools
// Ensure all tokens have proper aria-label attributes

// Test with actual screen readers
// NVDA (Windows), VoiceOver (Mac), or Orca (Linux)
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Enable debug mode in localStorage
localStorage.setItem('criteria-builder-debug', 'true');

// This will log detailed information about:
// - API requests and responses
// - Validation results
// - DSL structure changes
// - Token interactions
// - Accessibility events
```

### Getting Help

If you encounter issues not covered here:

1. **Check the browser console** for error messages
2. **Enable debug mode** to get detailed logging
3. **Test with minimal configuration** to isolate the issue
4. **Check network requests** in browser dev tools
5. **Verify API endpoint responses** match expected format
6. **Test with different browsers** to rule out browser-specific issues

## FAQ

### General Questions

#### Q: What Angular versions are supported?
A: The library is built for Angular v20 and requires Angular v20 or higher. It uses the latest Angular features and APIs.

#### Q: Can I use this with older versions of Angular?
A: No, the library specifically targets Angular v20 and uses features not available in older versions. Consider upgrading your Angular application.

#### Q: Is the library compatible with Angular Universal (SSR)?
A: Yes, the library is designed to work with Angular Universal. However, some features like localStorage-based presets may need special handling in SSR environments.

#### Q: Can I use this library without PrimeNG?
A: No, PrimeNG is a required peer dependency. The library uses PrimeNG components for UI elements like dropdowns, dialogs, and buttons.

### Configuration Questions

#### Q: How do I customize the visual appearance?
A: The library uses PrimeNG theming. You can:
1. Use different PrimeNG themes
2. Override CSS variables for colors
3. Use the `theme` and `compactMode` config options
4. Enable high contrast or colorblind-friendly modes

```typescript
const config: BuilderConfig = {
  theme: 'dark',
  compactMode: true,
  enableHighContrastMode: true,
  enableColorBlindMode: true
};
```

#### Q: Can I disable certain features?
A: Yes, most features can be disabled via configuration:

```typescript
const minimalConfig: BuilderConfig = {
  allowGrouping: false,           // Disable nested groups
  enableAdvancedFunctions: false, // Disable function library
  showSqlPreview: false,         // Hide SQL preview
  enableKeyboardShortcuts: false // Disable keyboard shortcuts
};
```

#### Q: How do I set up the required API endpoints?
A: The library expects these REST endpoints:

```
GET /api/screeners/criteria/functions
GET /api/screeners/criteria/functions/{id}/signature
GET /api/screeners/criteria/fields
GET /api/screeners/criteria/fields/{id}/operators
GET /api/screeners/criteria/fields/{id}/suggestions
POST /api/screeners/criteria/validate
POST /api/screeners/criteria/sql
```

See the API documentation for expected request/response formats.

### Usage Questions

#### Q: How do I validate criteria before saving?
A: Use the `validityChange` event and validation service:

```typescript
onValidityChange(isValid: boolean) {
  this.canSave = isValid;
}

// Or check manually
const validationResult = await this.criteriaApiService.validateCriteria(dsl);
if (validationResult.isValid) {
  // Safe to save
}
```

#### Q: Can I programmatically build criteria DSL?
A: Yes, you can construct DSL objects manually:

```typescript
const dsl: CriteriaDSL = {
  root: {
    operator: 'AND',
    children: [
      {
        left: { fieldId: 'price' },
        op: '>',
        right: { type: 'number', value: 100 }
      }
    ]
  }
};

this.criteriaControl.setValue(dsl);
```

#### Q: How do I handle large numbers of fields or functions?
A: The library handles large datasets efficiently:
- Fields and functions are loaded lazily from API
- Dropdowns include search functionality
- Consider categorizing fields and functions on the server
- Use pagination if you have thousands of items

#### Q: Can I customize the available operators for fields?
A: Yes, operators are determined by the API endpoint:

```
GET /api/screeners/criteria/fields/{fieldId}/operators
```

Return only the operators you want to allow for each field type.

### Integration Questions

#### Q: How do I integrate with my existing form validation?
A: The component implements ControlValueAccessor and works with Angular validators:

```typescript
const criteriaControl = new FormControl(null, [
  Validators.required,
  this.customCriteriaValidator
]);

customCriteriaValidator(control: AbstractControl): ValidationErrors | null {
  const dsl = control.value as CriteriaDSL;
  if (!dsl || !dsl.root.children.length) {
    return { emptyCriteria: true };
  }
  return null;
}
```

#### Q: Can I use this in a modal dialog?
A: Yes, the component works well in modal dialogs. Consider these settings:

```typescript
const modalConfig: BuilderConfig = {
  compactMode: true,    // Better for limited space
  showSqlPreview: false // Hide preview to save space
};
```

#### Q: How do I handle user permissions for fields/functions?
A: Implement permission filtering in your API endpoints:

```typescript
// Backend: Filter fields based on user permissions
GET /api/screeners/criteria/fields
// Return only fields the current user can access

// Backend: Filter functions based on user permissions  
GET /api/screeners/criteria/functions
// Return only functions the current user can use
```

### Performance Questions

#### Q: How does the component perform with complex criteria?
A: The component is optimized for complex criteria:
- Uses OnPush change detection
- Debounces validation calls (configurable)
- Lazy loads metadata from API
- Efficient token rendering with virtual scrolling for large queries

#### Q: Can I optimize for mobile devices?
A: Yes, consider these mobile-friendly settings:

```typescript
const mobileConfig: BuilderConfig = {
  compactMode: true,
  debounceMs: 500,      // Longer debounce for touch devices
  enableKeyboardShortcuts: false // Not needed on mobile
};
```

#### Q: How much memory does the component use?
A: Memory usage depends on criteria complexity:
- Simple criteria: ~1-2MB
- Complex criteria (100+ conditions): ~5-10MB
- The component cleans up properly when destroyed

### Security Questions

#### Q: Is the generated SQL safe from injection attacks?
A: Yes, the library implements multiple security layers:
- Server-side SQL generation only
- Parameterized queries with named parameters
- Field and function ID validation
- Input sanitization and validation

#### Q: Can users inject malicious content through import?
A: No, the import system includes security validation:
- Detects and blocks script tags
- Validates JSON structure
- Scans for suspicious patterns
- Enforces file size limits

#### Q: Should I validate the DSL on my backend?
A: Yes, always validate DSL on your backend before:
- Generating SQL
- Saving to database
- Executing queries

The client-side validation is for user experience only.

### Troubleshooting Questions

#### Q: Why aren't my fields/functions loading?
A: Check these common issues:
1. API endpoints returning 404/500 errors
2. CORS configuration blocking requests
3. Incorrect response format from API
4. Network connectivity issues

Enable debug mode to see detailed API request/response logs.

#### Q: Why is validation always failing/passing?
A: Common causes:
1. Validation API endpoint not implemented correctly
2. Field/function IDs not matching server data
3. Server-side validation logic errors
4. Network issues preventing validation calls

#### Q: Why is the component not responding to form changes?
A: Ensure proper ControlValueAccessor usage:
1. Use FormControl, not direct ngModel binding
2. Import ReactiveFormsModule
3. Check for JavaScript errors in console
4. Verify change detection is working

## Development

### Building the Library

```bash
# Install dependencies
npm install

# Build the library
ng build criteria-builder

# Build in watch mode for development
ng build criteria-builder --watch
```

### Running Tests

```bash
# Run unit tests
ng test criteria-builder

# Run tests with coverage
ng test criteria-builder --code-coverage

# Run tests in CI mode
ng test criteria-builder --watch=false --browsers=ChromeHeadless
```

### Linting and Formatting

```bash
# Run linter
ng lint criteria-builder

# Fix linting issues
ng lint criteria-builder --fix

# Format code
npx prettier --write "projects/criteria-builder/**/*.{ts,html,scss}"
```

### Development Server

```bash
# Start development server with test app
ng serve

# The test application will be available at http://localhost:4200
```

### Building Documentation

```bash
# Generate API documentation
npx compodoc -p projects/criteria-builder/tsconfig.lib.json -s

# Generate Storybook stories
npm run storybook
```

## Contributing

We welcome contributions to the Criteria Builder UI Library! Please follow these guidelines:

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
3. **Install dependencies:** `npm install`
4. **Create a feature branch:** `git checkout -b feature/your-feature`
5. **Make your changes**
6. **Run tests:** `ng test criteria-builder`
7. **Run linting:** `ng lint criteria-builder`
8. **Commit your changes:** `git commit -m "Add your feature"`
9. **Push to your fork:** `git push origin feature/your-feature`
10. **Create a pull request**

### Code Standards

- **TypeScript:** Use strict TypeScript with proper typing
- **Angular:** Follow Angular style guide and best practices
- **Testing:** Maintain 90%+ test coverage
- **Documentation:** Update documentation for new features
- **Accessibility:** Ensure all features are accessible

### Testing Requirements

- **Unit Tests:** All new code must have unit tests
- **Integration Tests:** Complex features need integration tests
- **Accessibility Tests:** Test with screen readers and keyboard navigation
- **Performance Tests:** Ensure no performance regressions

### Pull Request Process

1. **Describe your changes** clearly in the PR description
2. **Reference any related issues** using GitHub keywords
3. **Include screenshots** for UI changes
4. **Update documentation** as needed
5. **Ensure all tests pass** in CI
6. **Request review** from maintainers

### Reporting Issues

When reporting issues, please include:

- **Angular version**
- **Library version**
- **Browser and version**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Console errors** (if any)
- **Minimal reproduction** (if possible)

### Feature Requests

For feature requests, please:

- **Check existing issues** to avoid duplicates
- **Describe the use case** clearly
- **Explain the expected behavior**
- **Consider backward compatibility**
- **Provide examples** if possible

## Documentation

### Complete Documentation Set

- **[README.md](README.md)** - Main documentation with overview and quick start
- **[INSTALLATION.md](INSTALLATION.md)** - Complete installation and setup guide
- **[API.md](API.md)** - Complete API reference and interfaces
- **[SECURITY.md](SECURITY.md)** - Security best practices and guidelines
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[FAQ.md](FAQ.md)** - Frequently asked questions
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** - Accessibility features and compliance
- **[IMPORT_EXPORT.md](IMPORT_EXPORT.md)** - Import/export and preset management
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contributing guidelines and development setup

### Quick Links

- [Complete Installation Guide](INSTALLATION.md)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration)
- [API Reference](API.md)
- [Security Considerations](SECURITY.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Accessibility Features](ACCESSIBILITY.md)
- [Import/Export Guide](IMPORT_EXPORT.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Coding standards
- Pull request process
- Testing guidelines

### Development

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Build the library
ng build criteria-builder

# Run tests
ng test criteria-builder

# Run with coverage
ng test criteria-builder --code-coverage
```

## Support

### Getting Help

- **Documentation**: Check the comprehensive documentation set above
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and get community help
- **Stack Overflow**: Tag questions with `criteria-builder-ui`

### Reporting Issues

When reporting issues, please include:
- Angular version (`ng version`)
- Library version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and releases.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Angular](https://angular.io/)
- UI components powered by [PrimeNG](https://primeng.org/)
- Drag & drop functionality using [Angular CDK](https://material.angular.io/cdk)
- Icons from [PrimeIcons](https://github.com/primefaces/primeicons)
- Styling utilities from [PrimeFlex](https://primeflex.org/)

## Project Status

- **Current Version**: 0.0.1
- **Development Status**: Active
- **Angular Compatibility**: v20+
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Accessibility**: WCAG 2.1 AA compliant
- **Security**: SQL injection prevention, input validation, content sanitization

### MIT License Summary

- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify the source code
- ✅ **Distribution** - Distribute the library
- ✅ **Private use** - Use in private projects
- ❌ **Liability** - No warranty or liability
- ❌ **Warranty** - No warranty provided

### Third-Party Licenses

This library depends on several third-party packages:

- **Angular** - MIT License
- **PrimeNG** - MIT License
- **RxJS** - Apache License 2.0
- **Angular CDK** - MIT License

Please review the licenses of all dependencies before use in your projects.