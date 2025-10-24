/**
 * Core CriteriaDSL interfaces matching the backend structure
 */

/**
 * Root CriteriaDSL structure
 */
export interface CriteriaDSL {
  /** Root group containing all criteria */
  root: Group;
  
  /** DSL version for compatibility */
  version: string;
  
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Group container for logical operations
 */
export interface Group {
  /** Logical operator for combining children */
  operator: LogicalOperator;
  
  /** Child elements (groups or conditions) */
  children: (Group | Condition)[];
  
  /** Optional unique identifier */
  id?: string;
  
  /** Optional metadata for the group */
  metadata?: Record<string, any>;
}

/**
 * Individual condition within a group
 */
export interface Condition {
  /** Left operand (field or function) */
  left: FieldRef | FunctionCall;
  
  /** Comparison operator */
  operator: string;
  
  /** Right operand (value, field, or function) - optional for unary operators */
  right?: Literal | FieldRef | FunctionCall;
  
  /** Optional unique identifier */
  id?: string;
  
  /** Optional metadata for the condition */
  metadata?: Record<string, any>;
}

/**
 * Reference to a field
 */
export interface FieldRef {
  /** Type identifier */
  type: 'field';
  
  /** Field identifier */
  fieldId: string;
  
  /** Display name of the field */
  name: string;
  
  /** Data type of the field */
  dataType: FieldDataType;
  
  /** Optional field metadata */
  metadata?: Record<string, any>;
}

/**
 * Function call with parameters
 */
export interface FunctionCall {
  /** Type identifier */
  type: 'function';
  
  /** Function identifier */
  functionId: string;
  
  /** Function name */
  name: string;
  
  /** Function parameters */
  parameters: (Literal | FieldRef | FunctionCall)[];
  
  /** Return data type */
  returnType: FieldDataType;
  
  /** Optional function metadata */
  metadata?: Record<string, any>;
}

/**
 * Literal value
 */
export interface Literal {
  /** Type identifier */
  type: 'literal';
  
  /** The actual value */
  value: any;
  
  /** Data type of the value */
  dataType: FieldDataType;
  
  /** Optional display format */
  displayValue?: string;
}

/**
 * Supported logical operators
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

/**
 * Supported field data types
 */
export type FieldDataType = 
  | 'string'
  | 'number'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'enum'
  | 'array'
  | 'object';

/**
 * Comparison operators by data type
 */
export interface OperatorsByType {
  string: string[];
  number: string[];
  integer: string[];
  decimal: string[];
  boolean: string[];
  date: string[];
  datetime: string[];
  time: string[];
  array: string[];
  object: string[];
}

/**
 * Default operators for each data type
 */
export const DEFAULT_OPERATORS: OperatorsByType = {
  string: ['=', '!=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
  number: ['=', '!=', '>', '>=', '<', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
  integer: ['=', '!=', '>', '>=', '<', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
  decimal: ['=', '!=', '>', '>=', '<', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
  boolean: ['=', '!=', 'IS NULL', 'IS NOT NULL'],
  date: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'IS NULL', 'IS NOT NULL'],
  datetime: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'IS NULL', 'IS NOT NULL'],
  time: ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'IS NULL', 'IS NOT NULL'],
  array: ['IN', 'NOT IN', 'CONTAINS', 'NOT CONTAINS', 'IS NULL', 'IS NOT NULL'],
  object: ['IS NULL', 'IS NOT NULL']
};