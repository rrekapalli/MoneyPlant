// Core Data Models for Criteria Builder Library
// Aligned with backend Java DTOs

// Field Type Definitions
export type FieldType = 'STRING' | 'NUMBER' | 'INTEGER' | 'DATE' | 'BOOLEAN' | 'ENUM' | 'PERCENT' | 'CURRENCY';

// Operator Definitions
export type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'NOT_LIKE' | 'IN' | 'NOT_IN' | 'BETWEEN' | 'NOT_BETWEEN' | 'IS_NULL' | 'IS_NOT_NULL';

// Logical Operator Definitions
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// Field Metadata Interface (matches FieldMetaResp)
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

// Function Parameter Interface (matches backend)
export interface FunctionParameter {
  name: string;
  type: FieldType;
  optional?: boolean;
  default?: any;
  description?: string;
  min?: number;
  max?: number;
}

// Function Metadata Interface (matches FunctionMetaResp)
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

// Literal Interface (matches backend Literal DTO)
export interface Literal {
  value: any;                  // value from backend
  type: FieldType;            // type from backend (STRING|NUMBER|BOOLEAN|NULL|DATE|ARRAY)
  id?: string;                // id from backend
}

// Field Reference Interface (matches backend FieldRef DTO)
export interface FieldRef {
  field: string;               // field from backend (required)
  alias?: string;             // alias from backend
  id?: string;                // id from backend
}

// Function Call Interface (matches backend FunctionCall DTO)
export interface FunctionCall {
  function: string;            // function from backend (required)
  args: (FieldRef | Literal | FunctionCall)[]; // args from backend
  id?: string;                // id from backend
}

// Condition Interface (matches backend Condition DTO)
export interface Condition {
  id?: string;                // id from backend
  left: FieldRef | FunctionCall; // left from backend (Object type)
  operator: Operator;         // operator from backend
  right?: Literal | FunctionCall | Literal[]; // right from backend (Object type)
}

// Group Interface (matches backend Group DTO)
export interface Group {
  id?: string;                // id from backend
  operator: LogicalOperator;  // operator from backend (AND|OR|NOT)
  children: (Condition | Group)[]; // children from backend (Object[])
}

// Criteria DSL Interface (matches backend CriteriaDSL DTO)
export interface CriteriaDSL {
  root: Group;                // root from backend (required)
  version?: string;           // version from backend (default: "1.0")
  metadata?: any;            // metadata from backend (Object type)
}

// Request DTOs (matches backend)

// Criteria Validation Request
export interface CriteriaValidationReq {
  dsl: CriteriaDSL;          // dsl from backend (required)
  options?: ValidationOptions; // options from backend
}

export interface ValidationOptions {
  includeWarnings?: boolean;  // includeWarnings from backend (default: true)
  validatePerformance?: boolean; // validatePerformance from backend (default: true)
  strictMode?: boolean;      // strictMode from backend (default: false)
}

// Criteria SQL Request
export interface CriteriaSqlReq {
  dsl: CriteriaDSL;          // dsl from backend (required)
  options?: SqlGenerationOptions; // options from backend
}

export interface SqlGenerationOptions {
  includeComments?: boolean;  // includeComments from backend (default: false)
  optimizeForPerformance?: boolean; // optimizeForPerformance from backend (default: true)
  validateSyntax?: boolean;   // validateSyntax from backend (default: true)
}

// Criteria Preview Request
export interface CriteriaPreviewReq {
  dsl: CriteriaDSL;          // dsl from backend (required)
  includeEstimates?: boolean; // includeEstimates from backend (default: true)
  includeSqlPreview?: boolean; // includeSqlPreview from backend (default: false)
}

// Backend Response DTOs

// Validation Result (matches backend)
export interface ValidationResult {
  isValid: boolean;           // isValid from backend
  errors: ValidationError[];  // errors from backend
  warnings: ValidationWarning[]; // warnings from backend
}

// Validation Error (matches backend)
export interface ValidationError {
  code: string;               // code from backend
  message: string;            // message from backend
  field?: string;            // field from backend
  severity: 'error' | 'warning'; // severity from backend
}

// Validation Warning (matches backend)
export interface ValidationWarning {
  code: string;               // code from backend
  message: string;            // message from backend
  field?: string;            // field from backend
  suggestion?: string;       // suggestion from backend
}

// SQL Generation Result (matches backend)
export interface SqlGenerationResult {
  sql: string;               // sql from backend
  parameters: Record<string, any>; // parameters from backend
  paramCount: number;         // derived from parameters size
  isValid: boolean;          // isValid from backend
  errors?: string[];         // errors from backend
}

// Criteria Preview (matches backend)
export interface CriteriaPreview {
  description: string;        // description from backend
  estimatedCount?: number;   // estimatedCount from backend
  sqlPreview?: string;       // sqlPreview from backend
  complexity: 'simple' | 'moderate' | 'complex'; // complexity from backend
}
