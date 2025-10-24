/**
 * Field metadata interfaces for the criteria builder
 */

import { FieldDataType } from './criteria-dsl.interface';

/**
 * Field metadata response from /api/screeners/fields
 */
export interface FieldMetaResp {
  /** Unique field identifier */
  fieldId: string;
  
  /** Display name for the field */
  name: string;
  
  /** Detailed description of the field */
  description?: string;
  
  /** Data type of the field */
  dataType: FieldDataType;
  
  /** Category for grouping fields */
  category: string;
  
  /** Whether the field supports null values */
  nullable: boolean;
  
  /** Whether the field is deprecated */
  deprecated: boolean;
  
  /** Display format hint */
  displayFormat?: string;
  
  /** Unit of measurement */
  unit?: string;
  
  /** Minimum value for numeric fields */
  minValue?: number;
  
  /** Maximum value for numeric fields */
  maxValue?: number;
  
  /** Default value */
  defaultValue?: any;
  
  /** Search keywords for filtering */
  keywords?: string[];
  
  /** Icon to display with the field */
  icon?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}



/**
 * Operator metadata response from /api/screeners/fields/{fieldId}/operators
 */
export interface OperatorMetaResp {
  /** Unique operator identifier */
  operatorId: string;
  
  /** Display symbol for the operator */
  symbol: string;
  
  /** Human-readable name */
  name: string;
  
  /** Description of the operator */
  description?: string;
  
  /** Type of operator */
  type: OperatorType;
  
  /** Number of operands required */
  operandCount: number;
  
  /** Compatible field data types */
  compatibleTypes: FieldDataType[];
  
  /** Whether operator requires a value input */
  requiresValue: boolean;
  
  /** Precedence for ordering */
  precedence: number;
  
  /** Example usage */
  example?: string;
}

/**
 * Types of operators
 */
export type OperatorType = 
  | 'comparison'    // =, >, <, >=, <=, !=
  | 'logical'       // AND, OR, NOT
  | 'string'        // LIKE, CONTAINS, STARTS_WITH, ENDS_WITH
  | 'set'           // IN, NOT_IN
  | 'range'         // BETWEEN, NOT_BETWEEN
  | 'null'          // IS_NULL, IS_NOT_NULL
  | 'pattern';      // MATCHES, REGEX

/**
 * Function metadata response from /api/screeners/functions
 */
export interface FunctionMetaResp {
  /** Unique function identifier */
  functionId: string;
  
  /** Function name */
  name: string;
  
  /** Description of the function */
  description?: string;
  
  /** Category for grouping functions */
  category: FunctionCategory;
  
  /** Return data type */
  returnType: FieldDataType;
  
  /** Whether the function is deprecated */
  deprecated: boolean;
  
  /** Display icon */
  icon?: string;
  
  /** Search keywords */
  keywords?: string[];
  
  /** Example usage */
  example?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Function categories
 */
export type FunctionCategory = 
  | 'math'          // Mathematical functions
  | 'indicators'    // Technical indicators
  | 'statistical'   // Statistical functions
  | 'date'          // Date/time functions
  | 'string'        // String manipulation
  | 'aggregation'   // Aggregation functions
  | 'logical'       // Logical functions
  | 'conversion';   // Type conversion functions

/**
 * Function signature response from /api/screeners/functions/{functionId}/signature
 */
export interface FunctionSignatureResp {
  /** Function identifier */
  functionId: string;
  
  /** Function parameters */
  parameters: FunctionParameterResp[];
  
  /** Return type information */
  returnType: FieldDataType;
  
  /** Whether function supports variable arguments */
  variadic: boolean;
  
  /** Minimum number of parameters */
  minParams: number;
  
  /** Maximum number of parameters */
  maxParams?: number;
}

/**
 * Function parameter definition
 */
export interface FunctionParameterResp {
  /** Parameter name */
  name: string;
  
  /** Parameter data type */
  type: FieldDataType;
  
  /** Whether parameter is required */
  required: boolean;
  
  /** Default value if optional */
  defaultValue?: any;
  
  /** Parameter description */
  description?: string;
  
  /** Validation constraints */
  constraints?: ParameterConstraints;
  
  /** Position in parameter list */
  position: number;
}

/**
 * Parameter validation constraints
 */
export interface ParameterConstraints {
  /** Minimum value for numeric parameters */
  min?: number;
  
  /** Maximum value for numeric parameters */
  max?: number;
  
  /** Minimum length for string parameters */
  minLength?: number;
  
  /** Maximum length for string parameters */
  maxLength?: number;
  
  /** Regular expression pattern */
  pattern?: string;
  
  /** Allowed values for enum parameters */
  allowedValues?: any[];
  
  /** Custom validation message */
  message?: string;
}

/**
 * Field suggestion response from /api/screeners/fields/{fieldId}/suggestions
 */
export interface FieldSuggestionResp {
  /** Suggested value */
  value: any;
  
  /** Display label for the value */
  label: string;
  
  /** Description of the suggestion */
  description?: string;
  
  /** Frequency/popularity score */
  score?: number;
  
  /** Additional context */
  context?: Record<string, any>;
}