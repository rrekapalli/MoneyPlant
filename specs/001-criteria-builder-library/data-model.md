# Data Model: Criteria Builder Library

**Date**: 2024-12-19  
**Feature**: Criteria Builder Library  
**Purpose**: Define TypeScript interfaces and data structures for the criteria builder component, aligned with backend Java DTOs

## Component Input/Output Interfaces (Standalone Architecture)

### Component Inputs (All Data from Parent)
```typescript
interface MpCriteriaBuilderInputs {
  fields: FieldMeta[];                    // Field metadata from parent service
  functions: FunctionMeta[];              // Function definitions from parent service
  validationResult?: ValidationResult;    // Validation results from parent service
  sqlPreview?: string;                   // SQL preview from parent service
  config: CriteriaConfig;                // Component configuration
  initialValue?: CriteriaDSL;            // Initial criteria value
  disabled?: boolean;                     // Disabled state
  readonly?: boolean;                    // Read-only state
}
```

### Component Outputs (Events for Parent)
```typescript
interface MpCriteriaBuilderOutputs {
  dslChange: EventEmitter<CriteriaDSL>;           // DSL changes
  validityChange: EventEmitter<boolean>;           // Validity changes
  validationRequest: EventEmitter<CriteriaDSL>;    // Request validation from parent
  sqlRequest: EventEmitter<CriteriaDSL>;           // Request SQL generation from parent
  badgeAction: EventEmitter<BadgeActionEvent>;    // Badge interactions
}
```

### Parent Service Integration Interfaces
```typescript
// Parent component uses existing ScreenerApiService
interface ParentApiService {
  getFields(): Observable<FieldMetaResp[]>;
  getFunctions(): Observable<FunctionMetaResp[]>;
  validateCriteria(request: CriteriaValidationReq): Observable<ValidationResult>;
  generateSql(request: CriteriaSqlReq): Observable<SqlGenerationResult>;
  previewCriteria(request: CriteriaPreviewReq): Observable<CriteriaPreview>;
}

// Parent component uses existing ScreenerStateService
interface ParentStateService {
  validationResult$: Observable<ValidationResult>;
  sqlPreview$: Observable<string>;
  setValidationResult(result: ValidationResult): void;
  setSqlPreview(sql: string): void;
}
```

## Core Data Types (Aligned with Backend)

### FieldType (matches backend data types)
```typescript
export type FieldType = 'STRING' | 'NUMBER' | 'INTEGER' | 'DATE' | 'BOOLEAN' | 'ENUM' | 'PERCENT' | 'CURRENCY';
```

### Operator (matches backend operator validation)
```typescript
export type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'NOT_LIKE' | 'IN' | 'NOT_IN' | 'BETWEEN' | 'NOT_BETWEEN' | 'IS_NULL' | 'IS_NOT_NULL';
```

### LogicalOperator (matches backend Group operator)
```typescript
export type LogicalOperator = 'AND' | 'OR' | 'NOT';
```

## Configuration Interfaces (Aligned with Backend DTOs)

### FieldMeta (matches FieldMetaResp)
```typescript
export interface FieldMeta {
  id: string;                    // fieldName from backend
  label: string;                 // displayName from backend
  dbColumn: string;              // fieldName from backend
  dataType: FieldType;          // dataType from backend
  allowedOps?: Operator[];      // derived from dataType compatibility
  suggestionsApi?: string;      // suggestionsApi from backend
  nullable?: boolean;           // derived from validationRules
  description?: string;         // description from backend
  category?: string;           // category from backend
  example?: string;            // exampleValue from backend
  validationRules?: any;       // validationRules from backend
}
```

### FunctionParameterResp (matches backend)
```typescript
export interface FunctionParameter {
  name: string;
  type: FieldType;
  optional?: boolean;
  default?: any;
  description?: string;
  min?: number;
  max?: number;
}
```

### FunctionMeta (matches FunctionMetaResp)
```typescript
export interface FunctionMeta {
  id: string;                   // functionName from backend
  label: string;               // displayName from backend
  parameters: FunctionParameter[]; // parameters from backend
  returnType: FieldType;       // returnType from backend
  sqlTemplate?: string;        // sqlTemplate from backend
  description?: string;        // description from backend
  category?: string;          // category from backend
  examples?: string[];        // examples from backend
}
```

### CriteriaConfig (Angular-specific)
```typescript
export interface CriteriaConfig {
  allowGrouping?: boolean;
  maxDepth?: number;
  enableAdvancedFunctions?: boolean;
  displayMode?: 'compact' | 'expanded';
  showSqlPreview?: boolean;
  enableUndo?: boolean;
  maxElements?: number;
}
```

## Core Data Structures (Aligned with Backend DTOs)

### Literal (matches backend Literal DTO)
```typescript
export interface Literal {
  value: any;                  // value from backend
  type: FieldType;            // type from backend (STRING|NUMBER|BOOLEAN|NULL|DATE|ARRAY)
  id?: string;                // id from backend
}
```

### FieldRef (matches backend FieldRef DTO)
```typescript
export interface FieldRef {
  field: string;               // field from backend (required)
  alias?: string;             // alias from backend
  id?: string;                // id from backend
}
```

### FunctionCall (matches backend FunctionCall DTO)
```typescript
export interface FunctionCall {
  function: string;            // function from backend (required)
  args: (FieldRef | Literal | FunctionCall)[]; // args from backend
  id?: string;                // id from backend
}
```

### Condition (matches backend Condition DTO)
```typescript
export interface Condition {
  id?: string;                // id from backend
  left: FieldRef | FunctionCall; // left from backend (Object type)
  operator: Operator;         // operator from backend
  right?: Literal | FunctionCall | Literal[]; // right from backend (Object type)
}
```

### Group (matches backend Group DTO)
```typescript
export interface Group {
  id?: string;                // id from backend
  operator: LogicalOperator;  // operator from backend (AND|OR|NOT)
  children: (Condition | Group)[]; // children from backend (Object[])
}
```

### CriteriaDSL (matches backend CriteriaDSL DTO)
```typescript
export interface CriteriaDSL {
  root: Group;                // root from backend (required)
  version?: string;           // version from backend (default: "1.0")
  metadata?: any;            // metadata from backend (Object type)
}
```

## Request/Response DTOs (Aligned with Backend)

### CriteriaValidationReq (matches backend)
```typescript
export interface CriteriaValidationReq {
  dsl: CriteriaDSL;          // dsl from backend (required)
  options?: ValidationOptions; // options from backend
}

export interface ValidationOptions {
  includeWarnings?: boolean;  // includeWarnings from backend (default: true)
  validatePerformance?: boolean; // validatePerformance from backend (default: true)
  strictMode?: boolean;      // strictMode from backend (default: false)
}
```

### CriteriaSqlReq (matches backend)
```typescript
export interface CriteriaSqlReq {
  dsl: CriteriaDSL;          // dsl from backend (required)
  options?: SqlGenerationOptions; // options from backend
}

export interface SqlGenerationOptions {
  includeComments?: boolean;  // includeComments from backend (default: false)
  optimizeForPerformance?: boolean; // optimizeForPerformance from backend (default: true)
  validateSyntax?: boolean;   // validateSyntax from backend (default: true)
}
```

### CriteriaPreviewReq (matches backend)
```typescript
export interface CriteriaPreviewReq {
  dsl: CriteriaDSL;          // dsl from backend (required)
  includeEstimates?: boolean; // includeEstimates from backend (default: true)
  includeSqlPreview?: boolean; // includeSqlPreview from backend (default: false)
}
```

## Backend Response DTOs

### ValidationResult (matches backend)
```typescript
export interface ValidationResult {
  isValid: boolean;           // isValid from backend
  errors: ValidationError[];  // errors from backend
  warnings: ValidationWarning[]; // warnings from backend
}
```

### ValidationError (matches backend)
```typescript
export interface ValidationError {
  code: string;               // code from backend
  message: string;            // message from backend
  field?: string;            // field from backend
  severity: 'error' | 'warning'; // severity from backend
}
```

### ValidationWarning (matches backend)
```typescript
export interface ValidationWarning {
  code: string;               // code from backend
  message: string;            // message from backend
  field?: string;            // field from backend
  suggestion?: string;       // suggestion from backend
}
```

### SqlGenerationResult (matches backend)
```typescript
export interface SqlGenerationResult {
  sql: string;               // sql from backend
  parameters: Record<string, any>; // parameters from backend
  paramCount: number;         // derived from parameters size
  isValid: boolean;          // isValid from backend
  errors?: string[];         // errors from backend
}
```

### CriteriaPreview (matches backend)
```typescript
export interface CriteriaPreview {
  description: string;        // description from backend
  estimatedCount?: number;   // estimatedCount from backend
  sqlPreview?: string;       // sqlPreview from backend
  complexity: 'simple' | 'moderate' | 'complex'; // complexity from backend
}
```

## Component State Interfaces (Angular-specific)

### BadgeState
```typescript
export interface BadgeState {
  id: string;
  type: 'field' | 'operator' | 'value' | 'function' | 'group' | 'action';
  data: FieldRef | Operator | Literal | FunctionCall | Group | any;
  isSelected?: boolean;
  isDragging?: boolean;
  isEditing?: boolean;
  isCollapsed?: boolean;
}
```

### CriteriaBuilderState
```typescript
export interface CriteriaBuilderState {
  dsl: CriteriaDSL | null;
  isValid: boolean;
  sqlPreview: string;
  paramCount: number;
  selectedBadgeId?: string;
  editingBadgeId?: string;
  undoStack: CriteriaDSL[];
  redoStack: CriteriaDSL[];
}
```

## Event Interfaces (Angular-specific)

### CriteriaChangeEvent
```typescript
export interface CriteriaChangeEvent {
  dsl: CriteriaDSL;
  isValid: boolean;
  sqlPreview: string;
  changeType: 'add' | 'remove' | 'modify' | 'reorder';
  affectedBadgeId?: string;
}
```

### BadgeActionEvent
```typescript
export interface BadgeActionEvent {
  action: 'select' | 'edit' | 'delete' | 'drag' | 'drop' | 'toggle';
  badgeId: string;
  badgeType: string;
  data?: any;
}
```

## Utility Types

### BadgeComponentType
```typescript
export type BadgeComponentType = 
  | 'field-badge'
  | 'operator-badge' 
  | 'value-badge'
  | 'function-badge'
  | 'group-badge'
  | 'action-badge';
```

## Constants (Aligned with Backend)

### Default Configuration
```typescript
export const DEFAULT_CONFIG: CriteriaConfig = {
  allowGrouping: true,
  maxDepth: 10,
  enableAdvancedFunctions: true,
  displayMode: 'expanded',
  showSqlPreview: true,
  enableUndo: true,
  maxElements: 100
};
```

### Supported Operators by Field Type (matches backend FieldMetadataService)
```typescript
export const OPERATORS_BY_FIELD_TYPE: Record<FieldType, Operator[]> = {
  STRING: ['=', '!=', 'LIKE', 'NOT_LIKE', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  NUMBER: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  INTEGER: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  DATE: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IS_NULL', 'IS_NOT_NULL'],
  BOOLEAN: ['=', '!=', 'IS_NULL', 'IS_NOT_NULL'],
  ENUM: ['=', '!=', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  PERCENT: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  CURRENCY: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL']
};
```

## Backend Integration Mapping

### Field Metadata Mapping
- Backend `FieldMetadata` entity → Frontend `FieldMeta` interface
- Backend `FieldMetaResp` DTO → Frontend `FieldMeta` interface
- Backend field validation rules → Frontend validation logic

### Function Definition Mapping
- Backend `FunctionDefinition` entity → Frontend `FunctionMeta` interface
- Backend `FunctionMetaResp` DTO → Frontend `FunctionMeta` interface
- Backend SQL templates → Frontend SQL generation

### Criteria DSL Mapping
- Backend `CriteriaDSL` DTO → Frontend `CriteriaDSL` interface
- Backend `Group` DTO → Frontend `Group` interface
- Backend `Condition` DTO → Frontend `Condition` interface
- Backend `FieldRef` DTO → Frontend `FieldRef` interface
- Backend `Literal` DTO → Frontend `Literal` interface
- Backend `FunctionCall` DTO → Frontend `FunctionCall` interface