/**
 * Core DSL interfaces for the Criteria Builder
 */

export type FieldType = 'string' | 'number' | 'integer' | 'date' | 'boolean' | 'enum' | 'percent' | 'currency';
export type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL' | 'BETWEEN' | 'NOT BETWEEN';

export interface CriteriaDSL {
  root: Group;
  meta?: {
    name?: string;
    description?: string;
    version?: number;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    exportedAt?: string;
    exportedBy?: string;
    exportVersion?: string;
    schemaVersion?: string;
    importedAt?: string;
    importedBy?: string;
    originalExportedAt?: string;
    originalExportedBy?: string;
    [key: string]: any; // Allow additional metadata
  };
  validation?: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
  };
}

export interface Group {
  operator: 'AND' | 'OR' | 'NOT';
  children: (Condition | Group)[];
}

export interface Condition {
  left: FieldRef | FunctionCall;
  op: Operator;
  right?: Literal | FieldRef | FunctionCall;
}

export interface FieldRef {
  fieldId: string;
}

export interface FunctionCall {
  functionId: string;
  params: (Literal | FieldRef | FunctionCall)[];
}

export interface Literal {
  type: FieldType;
  value: any;
}

export interface ValidationError {
  id: string;
  type: 'field_not_found' | 'function_not_found' | 'type_mismatch' | 'operator_incompatible' | 'required_parameter_missing' | 'invalid_operator';
  message: string;
  path: string; // JSONPath to the problematic element
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  id: string;
  type: string;
  message: string;
  path: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}