# API Contracts: Criteria Builder Library

**Date**: 2024-12-19  
**Feature**: Criteria Builder Library  
**Purpose**: Define API contracts for standalone component integration with existing frontend services

## Component Public API (Standalone Architecture)

### MpCriteriaBuilderComponent

#### Inputs (@Input) - All Data Provided by Parent
```typescript
@Input() fields: FieldMeta[] = [];                    // Field metadata from parent
@Input() functions: FunctionMeta[] = [];             // Function definitions from parent
@Input() validationResult?: ValidationResult;        // Validation results from parent
@Input() sqlPreview?: string;                        // SQL preview from parent
@Input() config: CriteriaConfig = DEFAULT_CONFIG;    // Component configuration
@Input() initialValue?: CriteriaDSL;                 // Initial criteria value
@Input() disabled: boolean = false;                  // Disabled state
@Input() readonly: boolean = false;                  // Read-only state
```

#### Outputs (@Output) - Events for Parent to Handle
```typescript
@Output() dslChange = new EventEmitter<CriteriaDSL>();           // DSL changes
@Output() validityChange = new EventEmitter<boolean>();           // Validity changes
@Output() validationRequest = new EventEmitter<CriteriaDSL>();    // Request validation
@Output() sqlRequest = new EventEmitter<CriteriaDSL>();           // Request SQL generation
@Output() badgeAction = new EventEmitter<BadgeActionEvent>();    // Badge interactions
```

#### ControlValueAccessor Implementation
```typescript
writeValue(value: CriteriaDSL | null): void;
registerOnChange(fn: (value: CriteriaDSL | null) => void): void;
registerOnTouched(fn: () => void): void;
setDisabledState(isDisabled: boolean): void;
```

## Parent Component Integration Pattern

### Parent Component Responsibilities
```typescript
export class ScreenerConfigureComponent {
  // Inject existing frontend services
  constructor(
    private screenerApi: ScreenerApiService,
    private screenerState: ScreenerStateService
  ) {}

  // Observable data for component inputs
  fields$ = this.screenerApi.getFields();
  functions$ = this.screenerApi.getFunctions();
  validationResult$ = this.screenerState.validationResult$;
  sqlPreview$ = this.screenerState.sqlPreview$;

  // Handle component events
  onValidationRequest(dsl: CriteriaDSL) {
    this.screenerApi.validateCriteria(dsl).subscribe(result => {
      this.screenerState.setValidationResult(result);
    });
  }

  onSqlRequest(dsl: CriteriaDSL) {
    this.screenerApi.generateSql(dsl).subscribe(sql => {
      this.screenerState.setSqlPreview(sql);
    });
  }
}
```

### Template Integration
```html
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
```

## Existing Frontend Services Integration

### ScreenerApiService (Already Implemented)
```typescript
// Existing service methods that parent components will use
getFields(): Observable<FieldMetaResp[]>
getFunctions(): Observable<FunctionMetaResp[]>
validateCriteria(request: CriteriaValidationReq): Observable<ValidationResult>
generateSql(request: CriteriaSqlReq): Observable<SqlGenerationResult>
previewCriteria(request: CriteriaPreviewReq): Observable<CriteriaPreview>
```

### ScreenerStateService (Already Implemented)
```typescript
// Existing state management that parent components will use
validationResult$: Observable<ValidationResult>
sqlPreview$: Observable<string>
setValidationResult(result: ValidationResult): void
setSqlPreview(sql: string): void
```

## Component Internal Services (No API Calls)

### CriteriaSerializerService (Internal Only)
```typescript
// Internal service for DSL/SQL generation - NO API calls
serialize(dsl: CriteriaDSL, fields: FieldMeta[], functions: FunctionMeta[]): SerializationResult;
validateStructure(dsl: CriteriaDSL): ValidationResult;
generateSqlPreview(dsl: CriteriaDSL): string;
```

### CriteriaValidationService (Internal Only)
```typescript
// Internal service for structure validation - NO API calls
validateField(fieldId: string, fields: FieldMeta[]): boolean;
validateFunction(functionId: string, functions: FunctionMeta[]): boolean;
validateOperator(operator: Operator, fieldType: FieldType): boolean;
validateCondition(condition: Condition, fields: FieldMeta[], functions: FunctionMeta[]): ValidationResult;
validateGroup(group: Group, fields: FieldMeta[], functions: FunctionMeta[]): ValidationResult;
```

## Backend Integration Contracts (Parent Component Responsibility)

### Field Metadata Endpoints (Parent Uses Existing Service)
```typescript
// Parent component calls existing ScreenerApiService
GET /api/screeners/fields
Response: FieldMetaResp[]
```

### Function Definition Endpoints (Parent Uses Existing Service)
```typescript
// Parent component calls existing ScreenerApiService
GET /api/screeners/functions
Response: FunctionMetaResp[]
```

### Criteria Validation Endpoints (Parent Uses Existing Service)
```typescript
// Parent component calls existing ScreenerApiService
POST /api/screeners/validate-criteria
Request Body: CriteriaValidationReq
Response: ValidationResult
```

### SQL Generation Endpoints (Parent Uses Existing Service)
```typescript
// Parent component calls existing ScreenerApiService
POST /api/screeners/generate-sql
Request Body: CriteriaSqlReq
Response: SqlGenerationResult
```

## Module Integration

### MpCriteriaBuilderModule (Standalone)
```typescript
@NgModule({
  declarations: [
    MpCriteriaBuilderComponent,
    FieldBadgeComponent,
    OperatorBadgeComponent,
    ValueBadgeComponent,
    FunctionBadgeComponent,
    GroupBadgeComponent,
    BadgeActionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    PrimeNGModules
  ],
  exports: [
    MpCriteriaBuilderComponent,
    MpCriteriaBuilderModule
  ],
  providers: [
    CriteriaSerializerService,    // Internal service only
    CriteriaValidationService     // Internal service only
  ]
})
export class MpCriteriaBuilderModule { }
```

## Event Contracts

### Badge Interaction Events
```typescript
interface BadgeClickEvent {
  badgeId: string;
  badgeType: BadgeComponentType;
  data: any;
  event: MouseEvent;
}

interface BadgeDragEvent {
  badgeId: string;
  badgeType: BadgeComponentType;
  sourceIndex: number;
  targetIndex: number;
  sourceGroupId?: string;
  targetGroupId?: string;
}

interface BadgeEditEvent {
  badgeId: string;
  badgeType: BadgeComponentType;
  oldValue: any;
  newValue: any;
  isValid: boolean;
}
```

### Validation Events
```typescript
interface ValidationStateChangeEvent {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  affectedBadgeIds: string[];
}

interface SqlPreviewChangeEvent {
  sql: string;
  paramCount: number;
  isValid: boolean;
  errors?: string[];
}
```

## Configuration Contracts

### Theme Configuration
```typescript
interface CriteriaBuilderTheme {
  badgeColors: {
    field: string;
    operator: string;
    value: string;
    function: string;
    group: string;
    action: string;
  };
  spacing: {
    badgeMargin: string;
    groupPadding: string;
    indentSize: string;
  };
  typography: {
    badgeFontSize: string;
    badgeFontWeight: string;
    groupFontSize: string;
  };
}
```

### Accessibility Configuration
```typescript
interface AccessibilityConfig {
  enableKeyboardNavigation: boolean;
  enableScreenReaderSupport: boolean;
  announceChanges: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
}
```

## Error Handling Contracts

### Error Types
```typescript
enum CriteriaBuilderErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR'
}

interface CriteriaBuilderError {
  type: CriteriaBuilderErrorType;
  code: string;
  message: string;
  details?: any;
  badgeId?: string;
  recoverable: boolean;
}
```

### Error Recovery
```typescript
interface ErrorRecoveryStrategy {
  canRecover(error: CriteriaBuilderError): boolean;
  recover(error: CriteriaBuilderError): Promise<void>;
  fallback(error: CriteriaBuilderError): void;
}
```

## Performance Contracts

### Performance Metrics
```typescript
interface PerformanceMetrics {
  dslGenerationTime: number;
  sqlGenerationTime: number;
  validationTime: number;
  renderTime: number;
  memoryUsage: number;
  badgeCount: number;
  nestingDepth: number;
}

interface PerformanceThresholds {
  maxDslGenerationTime: number; // 100ms
  maxSqlGenerationTime: number; // 200ms
  maxValidationTime: number; // 50ms
  maxRenderTime: number; // 150ms
  maxMemoryUsage: number; // 10MB (increased from 5MB)
  maxBadgeCount: number; // 100 (increased from 50)
  maxNestingDepth: number; // 10 (increased from 5)
}
```

## Frontend Service Integration

### Authentication Integration
- Parent components handle JWT token authentication through existing services
- Component receives authenticated data via @Input properties
- No direct authentication handling within component

### Error Handling Integration
- Parent components handle network errors and API failures
- Component receives error states via @Input properties
- Component handles only UI-level errors (validation, rendering)

### Caching Integration
- Parent components leverage existing service caching
- Component receives cached data via @Input properties
- No internal caching within component

## Component Public API

### MpCriteriaBuilderComponent

#### Inputs (@Input)
```typescript
@Input() fields: FieldMeta[] = [];
@Input() functions: FunctionMeta[] = [];
@Input() config: CriteriaConfig = DEFAULT_CONFIG;
@Input() initialValue?: CriteriaDSL;
@Input() disabled: boolean = false;
@Input() readonly: boolean = false;
```

#### Outputs (@Output)
```typescript
@Output() dslChange = new EventEmitter<CriteriaDSL>();
@Output() validityChange = new EventEmitter<boolean>();
@Output() sqlPreviewChange = new EventEmitter<string>();
@Output() badgeAction = new EventEmitter<BadgeActionEvent>();
@Output() validationErrors = new EventEmitter<ValidationError[]>();
```

#### ControlValueAccessor Implementation
```typescript
writeValue(value: CriteriaDSL | null): void;
registerOnChange(fn: (value: CriteriaDSL | null) => void): void;
registerOnTouched(fn: () => void): void;
setDisabledState(isDisabled: boolean): void;
```

## Service APIs

### CriteriaSerializerService

#### Methods
```typescript
serialize(dsl: CriteriaDSL, fields: FieldMeta[], functions: FunctionMeta[]): SerializationResult;
validate(dsl: CriteriaDSL, fields: FieldMeta[], functions: FunctionMeta[]): ValidationResult;
generateSql(dsl: CriteriaDSL, fields: FieldMeta[], functions: FunctionMeta[]): string;
generateParameters(dsl: CriteriaDSL): Record<string, any>;
```

### CriteriaValidationService

#### Methods
```typescript
validateField(fieldId: string, fields: FieldMeta[]): boolean;
validateFunction(functionId: string, functions: FunctionMeta[]): boolean;
validateOperator(operator: Operator, fieldType: FieldType): boolean;
validateCondition(condition: Condition, fields: FieldMeta[], functions: FunctionMeta[]): ValidationResult;
validateGroup(group: Group, fields: FieldMeta[], functions: FunctionMeta[]): ValidationResult;
```

## Backend Integration Contracts (Aligned with ScreenerController)

### Field Metadata Endpoints (matches backend)

#### Get Available Fields
```typescript
GET /api/screeners/fields
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: FieldMetaResp[]
```

**Backend Implementation**: `ScreenerController.getAvailableFields()`
**Service**: `FieldMetadataService.getFieldsForUser(userId)`

#### Get Field by ID
```typescript
GET /api/screeners/fields/{fieldId}
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: FieldMetaResp
```

#### Get Compatible Operators for Field
```typescript
GET /api/screeners/fields/{fieldId}/operators
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: OperatorInfo[]
```

**Backend Implementation**: `ScreenerController.getFieldOperators(fieldId)`

### Function Definition Endpoints (matches backend)

#### Get Available Functions
```typescript
GET /api/screeners/functions
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: FunctionMetaResp[]
```

**Backend Implementation**: `ScreenerController.getAvailableFunctions()`
**Service**: `FunctionDefinitionService.getFunctionsForUser(userId)`

#### Get Function by ID
```typescript
GET /api/screeners/functions/{functionId}
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: FunctionMetaResp
```

#### Get Function Parameters
```typescript
GET /api/screeners/functions/{functionId}/parameters
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: FunctionParameterResp[]
```

### Criteria Validation Endpoints (matches backend)

#### Validate Criteria DSL
```typescript
POST /api/screeners/validate-criteria
Headers: {
  Authorization: "Bearer <jwt-token>",
  Content-Type: "application/json"
}
Request Body: CriteriaValidationReq
Response: ValidationResult
```

**Backend Implementation**: `ScreenerController.validateCriteria(request)`
**Service**: `CriteriaValidationService.validateDSL(dsl, userId)`

#### Partial Validation (for real-time feedback)
```typescript
POST /api/screeners/validate-partial
Headers: {
  Authorization: "Bearer <jwt-token>",
  Content-Type: "application/json"
}
Request Body: PartialCriteriaValidationReq
Response: PartialValidationResult
```

**Backend Implementation**: `ScreenerController.validatePartialCriteria(request)`

### SQL Generation Endpoints (matches backend)

#### Generate SQL from DSL
```typescript
POST /api/screeners/generate-sql
Headers: {
  Authorization: "Bearer <jwt-token>",
  Content-Type: "application/json"
}
Request Body: CriteriaSqlReq
Response: SqlGenerationResult
```

**Backend Implementation**: `ScreenerController.generateSql(request)`
**Service**: `CriteriaSqlService.generateSql(dsl, userId)`

### Criteria Preview Endpoints (matches backend)

#### Preview Criteria
```typescript
POST /api/screeners/preview-criteria
Headers: {
  Authorization: "Bearer <jwt-token>",
  Content-Type: "application/json"
}
Request Body: CriteriaPreviewReq
Response: CriteriaPreview
```

**Backend Implementation**: `ScreenerController.previewCriteria(request)`
**Service**: `CriteriaValidationService.previewCriteria(dsl, userId)`

### Operator Information Endpoints (matches backend)

#### Get All Operators
```typescript
GET /api/screeners/operators
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: OperatorInfo[]
```

**Backend Implementation**: `ScreenerController.getAllOperators()`

#### Get Operator Compatibility
```typescript
GET /api/screeners/operators/compatibility
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Response: OperatorCompatibilityMap
```

### Value Suggestion Endpoints (matches backend)

#### Get Value Suggestions
```typescript
GET /api/screeners/fields/{fieldId}/suggestions
Headers: {
  Authorization: "Bearer <jwt-token>"
}
Query Parameters: {
  query?: string;
  limit?: number;
}
Response: ValueSuggestion[]
```

**Backend Implementation**: `ScreenerController.getValueSuggestions(fieldId, query, limit)`

## Component Integration Contracts

### Angular Reactive Forms Integration

#### Form Control Usage
```typescript
// In parent component
const criteriaControl = new FormControl<CriteriaDSL | null>(null, [criteriaValidator]);

// In template
<mp-criteria-builder
  formControlName="criteria"
  [fields]="availableFields"
  [functions]="availableFunctions"
  [config]="criteriaConfig"
  (dslChange)="onCriteriaChange($event)"
  (validityChange)="onValidityChange($event)"
  (sqlPreviewChange)="onSqlPreviewChange($event)">
</mp-criteria-builder>
```

### Module Integration

#### MpCriteriaBuilderModule
```typescript
@NgModule({
  declarations: [
    MpCriteriaBuilderComponent,
    FieldBadgeComponent,
    OperatorBadgeComponent,
    ValueBadgeComponent,
    FunctionBadgeComponent,
    GroupBadgeComponent,
    BadgeActionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    PrimeNGModules
  ],
  exports: [
    MpCriteriaBuilderComponent,
    MpCriteriaBuilderModule
  ],
  providers: [
    CriteriaSerializerService,
    CriteriaValidationService
  ]
})
export class MpCriteriaBuilderModule { }
```

## Backend Request/Response DTOs (Aligned with Java DTOs)

### Request DTOs

#### CriteriaValidationReq
```typescript
interface CriteriaValidationReq {
  dsl: CriteriaDSL;
  options?: {
    includeWarnings?: boolean;
    validatePerformance?: boolean;
    strictMode?: boolean;
  };
}
```

#### CriteriaSqlReq
```typescript
interface CriteriaSqlReq {
  dsl: CriteriaDSL;
  options?: {
    includeComments?: boolean;
    optimizeForPerformance?: boolean;
    validateSyntax?: boolean;
  };
}
```

#### CriteriaPreviewReq
```typescript
interface CriteriaPreviewReq {
  dsl: CriteriaDSL;
  includeEstimates?: boolean;
  includeSqlPreview?: boolean;
}
```

### Response DTOs

#### FieldMetaResp
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
  suggestionsApi?: string;
  validationRules?: any;
}
```

#### FunctionMetaResp
```typescript
interface FunctionMetaResp {
  id: string;
  label: string;
  returnType: FieldType;
  sqlTemplate?: string;
  category?: string;
  description?: string;
  examples?: string[];
  parameters: FunctionParameterResp[];
}
```

#### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

#### SqlGenerationResult
```typescript
interface SqlGenerationResult {
  sql: string;
  parameters: Record<string, any>;
  isValid: boolean;
  errors?: string[];
}
```

#### CriteriaPreview
```typescript
interface CriteriaPreview {
  description: string;
  estimatedCount?: number;
  sqlPreview?: string;
  complexity: 'simple' | 'moderate' | 'complex';
}
```

## Event Contracts

### Badge Interaction Events
```typescript
interface BadgeClickEvent {
  badgeId: string;
  badgeType: BadgeComponentType;
  data: any;
  event: MouseEvent;
}

interface BadgeDragEvent {
  badgeId: string;
  badgeType: BadgeComponentType;
  sourceIndex: number;
  targetIndex: number;
  sourceGroupId?: string;
  targetGroupId?: string;
}

interface BadgeEditEvent {
  badgeId: string;
  badgeType: BadgeComponentType;
  oldValue: any;
  newValue: any;
  isValid: boolean;
}
```

### Validation Events
```typescript
interface ValidationStateChangeEvent {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  affectedBadgeIds: string[];
}

interface SqlPreviewChangeEvent {
  sql: string;
  paramCount: number;
  isValid: boolean;
  errors?: string[];
}
```

## Configuration Contracts

### Theme Configuration
```typescript
interface CriteriaBuilderTheme {
  badgeColors: {
    field: string;
    operator: string;
    value: string;
    function: string;
    group: string;
    action: string;
  };
  spacing: {
    badgeMargin: string;
    groupPadding: string;
    indentSize: string;
  };
  typography: {
    badgeFontSize: string;
    badgeFontWeight: string;
    groupFontSize: string;
  };
}
```

### Accessibility Configuration
```typescript
interface AccessibilityConfig {
  enableKeyboardNavigation: boolean;
  enableScreenReaderSupport: boolean;
  announceChanges: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
}
```

## Error Handling Contracts

### Error Types
```typescript
enum CriteriaBuilderErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR'
}

interface CriteriaBuilderError {
  type: CriteriaBuilderErrorType;
  code: string;
  message: string;
  details?: any;
  badgeId?: string;
  recoverable: boolean;
}
```

### Error Recovery
```typescript
interface ErrorRecoveryStrategy {
  canRecover(error: CriteriaBuilderError): boolean;
  recover(error: CriteriaBuilderError): Promise<void>;
  fallback(error: CriteriaBuilderError): void;
}
```

## Performance Contracts

### Performance Metrics
```typescript
interface PerformanceMetrics {
  dslGenerationTime: number;
  sqlGenerationTime: number;
  validationTime: number;
  renderTime: number;
  memoryUsage: number;
  badgeCount: number;
  nestingDepth: number;
}

interface PerformanceThresholds {
  maxDslGenerationTime: number; // 100ms
  maxSqlGenerationTime: number; // 200ms
  maxValidationTime: number; // 50ms
  maxRenderTime: number; // 150ms
  maxMemoryUsage: number; // 10MB (increased from 5MB)
  maxBadgeCount: number; // 100 (increased from 50)
  maxNestingDepth: number; // 10 (increased from 5)
}
```

## Backend Service Integration

### Authentication Integration
- All API calls require JWT token in Authorization header
- Token validation handled by backend Spring Security
- User context provided by `CurrentUserService.getCurrentUserId()`

### Error Handling Integration
- Backend validation errors mapped to frontend ValidationError interface
- Network errors handled with retry logic and fallback
- Authentication errors trigger re-login flow

### Caching Integration
- Field metadata cached using `@Cacheable` annotations
- Function definitions cached per user
- Validation results cached for performance