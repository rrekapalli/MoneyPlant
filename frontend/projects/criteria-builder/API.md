# API Documentation - Criteria Builder UI Library

This document provides detailed API documentation for all public interfaces, components, and services in the Criteria Builder UI Library.

## Table of Contents

- [Core Interfaces](#core-interfaces)
- [Components](#components)
- [Services](#services)
- [Directives](#directives)
- [Types and Enums](#types-and-enums)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)

## Core Interfaces

### CriteriaDSL

The main data structure representing a complete criteria definition.

```typescript
interface CriteriaDSL {
  root: Group;
  meta?: CriteriaMeta;
  validation?: ValidationState;
}

interface CriteriaMeta {
  name?: string;
  description?: string;
  version?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastValidated?: string;
}
```

**Usage:**
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
  },
  meta: {
    name: 'High Price Filter',
    description: 'Filter for stocks with price > $100',
    createdBy: 'user@example.com',
    createdAt: '2024-01-01T00:00:00Z'
  }
};
```

### Group

Represents a logical grouping of conditions with AND/OR/NOT operators.

```typescript
interface Group {
  operator: GroupOperator;
  children: (Condition | Group)[];
}

type GroupOperator = 'AND' | 'OR' | 'NOT';
```

**Usage:**
```typescript
const group: Group = {
  operator: 'AND',
  children: [
    {
      left: { fieldId: 'price' },
      op: '>',
      right: { type: 'number', value: 100 }
    },
    {
      operator: 'OR',
      children: [
        {
          left: { fieldId: 'volume' },
          op: '>',
          right: { type: 'number', value: 1000000 }
        }
      ]
    }
  ]
};
```

### Condition

Represents a single comparison condition.

```typescript
interface Condition {
  left: FieldRef | FunctionCall;
  op: Operator;
  right?: Literal | FieldRef | FunctionCall;
}

interface FieldRef {
  fieldId: string;
}

interface FunctionCall {
  functionId: string;
  params: (Literal | FieldRef | FunctionCall)[];
}

interface Literal {
  type: FieldType;
  value: any;
}

type Operator = 
  | '=' | '!=' | '<' | '<=' | '>' | '>='
  | 'LIKE' | 'NOT_LIKE' | 'IN' | 'NOT_IN'
  | 'IS_NULL' | 'IS_NOT_NULL'
  | 'BETWEEN' | 'NOT_BETWEEN';
```

**Usage:**
```typescript
// Simple field comparison
const condition: Condition = {
  left: { fieldId: 'price' },
  op: '>',
  right: { type: 'number', value: 100 }
};

// Function call comparison
const functionCondition: Condition = {
  left: {
    functionId: 'sma',
    params: [
      { fieldId: 'close' },
      { type: 'integer', value: 20 }
    ]
  },
  op: '>',
  right: { fieldId: 'price' }
};

// Null check (no right side)
const nullCondition: Condition = {
  left: { fieldId: 'dividend' },
  op: 'IS_NULL'
};
```

### FieldMeta

Metadata describing available fields for criteria building.

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
  validation?: FieldValidation;
  formatting?: FieldFormatting;
}

interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  customRules?: Record<string, any>;
}

interface FieldFormatting {
  displayFormat?: string;
  inputFormat?: string;
  precision?: number;
  currency?: string;
  dateFormat?: string;
}

type FieldType = 
  | 'string' | 'number' | 'integer' | 'boolean'
  | 'date' | 'datetime' | 'time'
  | 'enum' | 'percent' | 'currency';
```

**Usage:**
```typescript
const priceField: FieldMeta = {
  id: 'price',
  label: 'Stock Price',
  dbColumn: 'current_price',
  dataType: 'currency',
  allowedOps: ['=', '!=', '<', '<=', '>', '>=', 'BETWEEN'],
  category: 'Financial',
  description: 'Current stock price in USD',
  example: '150.25',
  nullable: false,
  validation: {
    min: 0,
    max: 10000,
    required: true
  },
  formatting: {
    displayFormat: '$#,##0.00',
    currency: 'USD',
    precision: 2
  }
};
```

### FunctionMeta

Metadata describing available functions for criteria building.

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

interface FunctionParam {
  name: string;
  type: FieldType;
  order: number;
  required: boolean;
  defaultValue?: any;
  validationRules?: Record<string, any>;
  helpText?: string;
  allowedValues?: any[];
}
```

**Usage:**
```typescript
const smaFunction: FunctionMeta = {
  id: 'sma',
  label: 'Simple Moving Average',
  returnType: 'number',
  params: [
    {
      name: 'field',
      type: 'number',
      order: 1,
      required: true,
      helpText: 'The field to calculate average for'
    },
    {
      name: 'periods',
      type: 'integer',
      order: 2,
      required: true,
      defaultValue: 20,
      validationRules: { min: 1, max: 200 },
      helpText: 'Number of periods for the average'
    }
  ],
  sqlTemplate: 'AVG({field}) OVER (ORDER BY date ROWS {periods} PRECEDING)',
  description: 'Calculates simple moving average over specified periods',
  category: 'Technical Analysis',
  examples: ['SMA(close, 20)', 'SMA(volume, 10)']
};
```

### BuilderConfig

Configuration options for the criteria builder component.

```typescript
interface BuilderConfig {
  // Core functionality
  allowGrouping?: boolean;
  maxDepth?: number;
  enableAdvancedFunctions?: boolean;
  
  // UI behavior
  showSqlPreview?: boolean;
  debounceMs?: number;
  compactMode?: boolean;
  
  // Accessibility
  enableKeyboardShortcuts?: boolean;
  enableScreenReaderMode?: boolean;
  enableHighContrastMode?: boolean;
  enableColorBlindMode?: boolean;
  
  // Theming
  theme?: 'light' | 'dark';
  locale?: string;
  
  // Advanced options
  autoSave?: boolean;
  maxConditions?: number;
  enableDragDrop?: boolean;
  showTooltips?: boolean;
}
```

**Default Values:**
```typescript
const defaultConfig: BuilderConfig = {
  allowGrouping: true,
  maxDepth: 5,
  enableAdvancedFunctions: true,
  showSqlPreview: true,
  debounceMs: 200,
  compactMode: false,
  enableKeyboardShortcuts: true,
  enableScreenReaderMode: false,
  enableHighContrastMode: false,
  enableColorBlindMode: false,
  theme: 'light',
  locale: 'en',
  autoSave: false,
  maxConditions: 100,
  enableDragDrop: true,
  showTooltips: true
};
```

## Components

### AcCriteriaBuilderComponent

The main criteria builder component that implements ControlValueAccessor.

#### Selector
```typescript
'ac-criteria-builder'
```

#### Inputs
```typescript
@Input() config: BuilderConfig = {};
```

#### Outputs
```typescript
@Output() validityChange = new EventEmitter<boolean>();
@Output() sqlPreviewChange = new EventEmitter<SqlPreviewResult>();
@Output() dslChange = new EventEmitter<CriteriaDSL>();
@Output() errorChange = new EventEmitter<ValidationError[]>();
```

#### Methods

##### writeValue
```typescript
writeValue(value: CriteriaDSL | null): void
```
Sets the current criteria DSL value. Part of ControlValueAccessor interface.

**Parameters:**
- `value`: The CriteriaDSL to set, or null to clear

**Usage:**
```typescript
const dsl: CriteriaDSL = { /* ... */ };
component.writeValue(dsl);
```

##### registerOnChange
```typescript
registerOnChange(fn: (value: CriteriaDSL | null) => void): void
```
Registers a callback for when the criteria value changes.

##### registerOnTouched
```typescript
registerOnTouched(fn: () => void): void
```
Registers a callback for when the component is touched.

##### setDisabledState
```typescript
setDisabledState(isDisabled: boolean): void
```
Sets the disabled state of the component.

##### addCondition
```typescript
addCondition(position?: number): void
```
Programmatically adds a new condition.

**Parameters:**
- `position`: Optional position to insert the condition

##### addGroup
```typescript
addGroup(position?: number): void
```
Programmatically adds a new group.

##### clearAll
```typescript
clearAll(): void
```
Clears all conditions and groups.

##### validateCriteria
```typescript
validateCriteria(): Promise<ValidationResult>
```
Manually triggers validation of the current criteria.

**Returns:** Promise resolving to validation result

#### Usage Example
```typescript
@Component({
  template: `
    <ac-criteria-builder
      [config]="config"
      [formControl]="criteriaControl"
      (validityChange)="onValidityChange($event)"
      (sqlPreviewChange)="onSqlPreviewChange($event)">
    </ac-criteria-builder>
  `
})
export class MyComponent {
  criteriaControl = new FormControl<CriteriaDSL | null>(null);
  
  config: BuilderConfig = {
    allowGrouping: true,
    showSqlPreview: true
  };
  
  onValidityChange(isValid: boolean) {
    console.log('Criteria is valid:', isValid);
  }
  
  onSqlPreviewChange(result: SqlPreviewResult) {
    console.log('Generated SQL:', result.sql);
  }
}
```

### AcBuilderToolbarComponent

Toolbar component with import/export and mode switching functionality.

#### Selector
```typescript
'ac-builder-toolbar'
```

#### Inputs
```typescript
@Input() currentDSL: CriteriaDSL | null = null;
@Input() mode: 'simple' | 'advanced' = 'simple';
@Input() showPresets: boolean = true;
@Input() showImportExport: boolean = true;
```

#### Outputs
```typescript
@Output() modeChange = new EventEmitter<'simple' | 'advanced'>();
@Output() importDSL = new EventEmitter<CriteriaDSL>();
@Output() exportDSL = new EventEmitter<void>();
@Output() clearAll = new EventEmitter<void>();
@Output() presetLoad = new EventEmitter<string>();
@Output() presetSave = new EventEmitter<{ name: string; description?: string }>();
```

## Services

### CriteriaApiService

Service for integrating with backend API endpoints.

#### Methods

##### getFields
```typescript
getFields(): Observable<FieldMetaResp[]>
```
Loads available fields from the API.

**Returns:** Observable of field metadata array

**API Endpoint:** `GET /api/screeners/criteria/fields`

##### getFunctions
```typescript
getFunctions(): Observable<FunctionMetaResp[]>
```
Loads available functions from the API.

**Returns:** Observable of function metadata array

**API Endpoint:** `GET /api/screeners/criteria/functions`

##### getFunctionSignature
```typescript
getFunctionSignature(functionId: string): Observable<FunctionSignature>
```
Gets detailed signature for a specific function.

**Parameters:**
- `functionId`: The ID of the function

**Returns:** Observable of function signature

**API Endpoint:** `GET /api/screeners/criteria/functions/{functionId}/signature`

##### getFieldOperators
```typescript
getFieldOperators(fieldId: string): Observable<OperatorInfo[]>
```
Gets compatible operators for a specific field.

**Parameters:**
- `fieldId`: The ID of the field

**Returns:** Observable of operator information array

**API Endpoint:** `GET /api/screeners/criteria/fields/{fieldId}/operators`

##### getFieldSuggestions
```typescript
getFieldSuggestions(fieldId: string, query?: string): Observable<ValueSuggestion[]>
```
Gets value suggestions for a specific field.

**Parameters:**
- `fieldId`: The ID of the field
- `query`: Optional search query for filtering suggestions

**Returns:** Observable of value suggestions array

**API Endpoint:** `GET /api/screeners/criteria/fields/{fieldId}/suggestions`

##### validateCriteria
```typescript
validateCriteria(dsl: CriteriaDSL): Observable<ValidationResult>
```
Validates a criteria DSL structure.

**Parameters:**
- `dsl`: The criteria DSL to validate

**Returns:** Observable of validation result

**API Endpoint:** `POST /api/screeners/criteria/validate`

##### generateSql
```typescript
generateSql(dsl: CriteriaDSL): Observable<SqlGenerationResult>
```
Generates SQL from a criteria DSL.

**Parameters:**
- `dsl`: The criteria DSL to convert to SQL

**Returns:** Observable of SQL generation result

**API Endpoint:** `POST /api/screeners/criteria/sql`

#### Usage Example
```typescript
@Injectable()
export class MyService {
  constructor(private criteriaApiService: CriteriaApiService) {}
  
  async loadMetadata() {
    try {
      const fields = await this.criteriaApiService.getFields().toPromise();
      const functions = await this.criteriaApiService.getFunctions().toPromise();
      
      console.log('Loaded fields:', fields);
      console.log('Loaded functions:', functions);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  }
  
  async validateAndGenerateSQL(dsl: CriteriaDSL) {
    try {
      const validation = await this.criteriaApiService.validateCriteria(dsl).toPromise();
      
      if (validation.isValid) {
        const sqlResult = await this.criteriaApiService.generateSql(dsl).toPromise();
        return sqlResult;
      } else {
        throw new Error('Invalid criteria: ' + validation.errors.map(e => e.message).join(', '));
      }
    } catch (error) {
      console.error('Validation or SQL generation failed:', error);
      throw error;
    }
  }
}
```

### CriteriaImportExportService

Service for importing and exporting criteria DSL as JSON.

#### Methods

##### exportToJson
```typescript
exportToJson(dsl: CriteriaDSL, options?: ExportOptions): ExportResult
```
Exports a criteria DSL to JSON string.

**Parameters:**
- `dsl`: The criteria DSL to export
- `options`: Optional export configuration

**Returns:** Export result with success status and data

##### importFromJson
```typescript
importFromJson(jsonString: string, options?: ImportOptions): ImportResult
```
Imports a criteria DSL from JSON string.

**Parameters:**
- `jsonString`: The JSON string to import
- `options`: Optional import configuration

**Returns:** Import result with success status and DSL

##### exportToFile
```typescript
exportToFile(dsl: CriteriaDSL, filename?: string, options?: ExportOptions): void
```
Exports criteria DSL to a downloadable file.

**Parameters:**
- `dsl`: The criteria DSL to export
- `filename`: Optional filename (defaults to generated name)
- `options`: Optional export configuration

##### importFromFile
```typescript
importFromFile(file: File, options?: ImportOptions): Promise<ImportResult>
```
Imports criteria DSL from a file.

**Parameters:**
- `file`: The file to import
- `options`: Optional import configuration

**Returns:** Promise resolving to import result

#### Options Interfaces

```typescript
interface ExportOptions {
  minify?: boolean;
  includeValidation?: boolean;
  allowInvalid?: boolean;
  exportedBy?: string;
  additionalMetadata?: Record<string, any>;
}

interface ImportOptions {
  validateContent?: boolean;
  allowInvalid?: boolean;
  maxFileSize?: number;
  importedBy?: string;
}

interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  errors?: string[];
}

interface ImportResult {
  success: boolean;
  dsl?: CriteriaDSL;
  errors?: string[];
  warnings?: string[];
}
```

### CriteriaPresetService

Service for managing saved criteria presets.

#### Methods

##### savePreset
```typescript
savePreset(name: string, dsl: CriteriaDSL, description?: string): PresetSaveResult
```
Saves a criteria DSL as a named preset.

##### loadPreset
```typescript
loadPreset(id: string): PresetLoadResult
```
Loads a preset by ID.

##### getPresets
```typescript
getPresets(): CriteriaPreset[]
```
Gets all saved presets.

##### deletePreset
```typescript
deletePreset(id: string): boolean
```
Deletes a preset by ID.

##### searchPresets
```typescript
searchPresets(query: string): CriteriaPreset[]
```
Searches presets by name, description, or tags.

##### exportPreset
```typescript
exportPreset(id: string): ExportResult
```
Exports a preset to JSON.

##### importPreset
```typescript
importPreset(jsonString: string, options?: ImportOptions): ImportResult
```
Imports a preset from JSON.

#### Observable Streams

```typescript
readonly presets: Observable<CriteriaPreset[]>
readonly presetsCount: Observable<number>
```

## Types and Enums

### FieldType Enum
```typescript
enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  ENUM = 'enum',
  PERCENT = 'percent',
  CURRENCY = 'currency'
}
```

### Operator Type
```typescript
type Operator = 
  | '=' | '!=' | '<' | '<=' | '>' | '>='
  | 'LIKE' | 'NOT_LIKE' | 'IN' | 'NOT_IN'
  | 'IS_NULL' | 'IS_NOT_NULL'
  | 'BETWEEN' | 'NOT_BETWEEN';
```

### ValidationError Interface
```typescript
interface ValidationError {
  id: string;
  type: ValidationErrorType;
  message: string;
  path: string;
  severity: 'error' | 'warning';
  context?: Record<string, any>;
}

type ValidationErrorType = 
  | 'field_not_found'
  | 'function_not_found'
  | 'type_mismatch'
  | 'operator_incompatible'
  | 'required_parameter_missing'
  | 'invalid_value_format'
  | 'max_depth_exceeded'
  | 'max_conditions_exceeded';
```

## API Endpoints

### Expected Backend Endpoints

The library expects the following REST API endpoints to be implemented:

#### GET /api/screeners/criteria/fields
Returns available fields for criteria building.

**Response:**
```typescript
interface FieldMetaResp {
  id: string;
  label: string;
  dbColumn: string;
  dataType: FieldType;
  allowedOps?: Operator[];
  category?: string;
  description?: string;
  example?: string;
}

// Response: FieldMetaResp[]
```

#### GET /api/screeners/criteria/functions
Returns available functions for criteria building.

**Response:**
```typescript
interface FunctionMetaResp {
  id: string;
  label: string;
  returnType: FieldType;
  category: string;
  description: string;
  examples: string[];
  paramCount: number;
}

// Response: FunctionMetaResp[]
```

#### GET /api/screeners/criteria/functions/{functionId}/signature
Returns detailed function signature including parameters.

**Response:**
```typescript
interface FunctionSignature {
  id: string;
  label: string;
  description: string;
  returnType: FieldType;
  parameters: ParameterSignature[];
  examples: string[];
  category: string;
  sqlTemplate?: string;
}

interface ParameterSignature {
  name: string;
  type: FieldType;
  order: number;
  required: boolean;
  defaultValue?: string;
  validationRules?: Record<string, any>;
  helpText?: string;
}
```

#### GET /api/screeners/criteria/fields/{fieldId}/operators
Returns compatible operators for a specific field.

**Response:**
```typescript
interface OperatorInfo {
  id: string;
  label: string;
  description: string;
  requiresRightSide: boolean;
  supportedTypes: FieldType[];
}

// Response: OperatorInfo[]
```

#### GET /api/screeners/criteria/fields/{fieldId}/suggestions
Returns value suggestions for a specific field.

**Query Parameters:**
- `query?: string` - Optional search query

**Response:**
```typescript
interface ValueSuggestion {
  label: string;
  value: any;
  description?: string;
}

// Response: ValueSuggestion[]
```

#### POST /api/screeners/criteria/validate
Validates a criteria DSL structure.

**Request Body:**
```typescript
{
  dsl: CriteriaDSL
}
```

**Response:**
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

#### POST /api/screeners/criteria/sql
Generates SQL from a criteria DSL.

**Request Body:**
```typescript
{
  dsl: CriteriaDSL
}
```

**Response:**
```typescript
interface SqlGenerationResult {
  sql: string;
  parameters: Record<string, any>;
  generatedAt: string;
  generatedBy: string;
  dslHash: string;
}
```

## Error Handling

### Error Types

The library defines several error types for different scenarios:

```typescript
enum CriteriaErrorType {
  VALIDATION_ERROR = 'validation_error',
  API_ERROR = 'api_error',
  IMPORT_ERROR = 'import_error',
  EXPORT_ERROR = 'export_error',
  PRESET_ERROR = 'preset_error',
  SECURITY_ERROR = 'security_error'
}

interface CriteriaError {
  type: CriteriaErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}
```

### Error Handling Patterns

#### API Errors
```typescript
this.criteriaApiService.getFields().subscribe({
  next: (fields) => {
    // Handle successful response
  },
  error: (error) => {
    if (error.status === 404) {
      // Handle not found
    } else if (error.status === 500) {
      // Handle server error
    } else {
      // Handle other errors
    }
  }
});
```

#### Validation Errors
```typescript
const validationResult = await this.criteriaApiService.validateCriteria(dsl).toPromise();

if (!validationResult.isValid) {
  validationResult.errors.forEach(error => {
    console.error(`Validation error at ${error.path}: ${error.message}`);
  });
}
```

#### Import/Export Errors
```typescript
const importResult = this.importExportService.importFromJson(jsonString);

if (!importResult.success) {
  importResult.errors?.forEach(error => {
    console.error('Import error:', error);
  });
}
```

### Global Error Handler

You can implement a global error handler for the library:

```typescript
@Injectable()
export class CriteriaErrorHandler {
  handleError(error: CriteriaError): void {
    // Log error
    console.error('Criteria Builder Error:', error);
    
    // Show user-friendly message
    this.showUserMessage(this.getUserFriendlyMessage(error));
    
    // Report to monitoring service
    this.reportError(error);
  }
  
  private getUserFriendlyMessage(error: CriteriaError): string {
    switch (error.type) {
      case CriteriaErrorType.API_ERROR:
        return 'Unable to connect to server. Please try again.';
      case CriteriaErrorType.VALIDATION_ERROR:
        return 'Please check your criteria for errors.';
      case CriteriaErrorType.IMPORT_ERROR:
        return 'Unable to import file. Please check the file format.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
```

This comprehensive API documentation provides detailed information about all public interfaces, components, and services in the Criteria Builder UI Library. Use this as a reference when integrating the library into your applications.