/**
 * Validation interfaces for criteria builder
 */

/**
 * Result of validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  
  /** Array of validation errors */
  errors: ValidationError[];
  
  /** Array of validation warnings */
  warnings: ValidationWarning[];
  
  /** Validation timestamp */
  timestamp: Date;
  
  /** Additional validation metadata */
  metadata?: Record<string, any>;
}

/**
 * Individual validation error
 */
export interface ValidationError {
  /** Unique error code */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Path to the problematic element */
  path: string;
  
  /** ID of the chip with the error */
  chipId?: string;
  
  /** Severity level */
  severity: ValidationSeverity;
  
  /** Suggested fix for the error */
  suggestion?: string;
  
  /** Whether the error can be auto-fixed */
  canAutoFix: boolean;
  
  /** Additional error context */
  context?: Record<string, any>;
}

/**
 * Individual validation warning
 */
export interface ValidationWarning {
  /** Unique warning code */
  code: string;
  
  /** Human-readable warning message */
  message: string;
  
  /** Path to the element with warning */
  path: string;
  
  /** ID of the chip with the warning */
  chipId?: string;
  
  /** Suggested improvement */
  suggestion?: string;
  
  /** Additional warning context */
  context?: Record<string, any>;
}

/**
 * Validation severity levels
 */
export type ValidationSeverity = 
  | 'error'     // Blocks execution
  | 'warning'   // Allows execution but suggests improvement
  | 'info';     // Informational only

/**
 * Validation request payload
 */
export interface ValidationRequest {
  /** CriteriaDSL to validate */
  criteria: any;
  
  /** Validation options */
  options?: ValidationOptions;
  
  /** Context for validation */
  context?: ValidationContext;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Whether to perform deep validation */
  deep: boolean;
  
  /** Whether to validate partial/incomplete criteria */
  allowPartial: boolean;
  
  /** Maximum validation depth */
  maxDepth?: number;
  
  /** Whether to include warnings */
  includeWarnings: boolean;
  
  /** Whether to include suggestions */
  includeSuggestions: boolean;
  
  /** Custom validation rules */
  customRules?: ValidationRule[];
}

/**
 * Validation context information
 */
export interface ValidationContext {
  /** Available fields for validation */
  availableFields?: string[];
  
  /** Available functions for validation */
  availableFunctions?: string[];
  
  /** User permissions */
  permissions?: string[];
  
  /** Additional context data */
  metadata?: Record<string, any>;
}

/**
 * Custom validation rule
 */
export interface ValidationRule {
  /** Rule identifier */
  id: string;
  
  /** Rule name */
  name: string;
  
  /** Rule description */
  description: string;
  
  /** Validation function */
  validator: (value: any, context: ValidationContext) => ValidationResult;
  
  /** Whether the rule is enabled */
  enabled: boolean;
  
  /** Rule priority (higher = earlier execution) */
  priority: number;
}

/**
 * SQL generation result
 */
export interface SqlGenerationResult {
  /** Generated SQL query */
  sql: string;
  
  /** Query parameters */
  parameters: SqlParameter[];
  
  /** Whether generation was successful */
  success: boolean;
  
  /** Error message if generation failed */
  error?: string;
  
  /** Warnings about the generated SQL */
  warnings?: string[];
  
  /** Metadata about the generation */
  metadata?: Record<string, any>;
}

/**
 * SQL parameter information
 */
export interface SqlParameter {
  /** Parameter name */
  name: string;
  
  /** Parameter value */
  value: any;
  
  /** Parameter data type */
  type: string;
  
  /** Whether parameter is required */
  required: boolean;
}

/**
 * Criteria preview result
 */
export interface CriteriaPreviewResult {
  /** Human-readable description */
  description: string;
  
  /** Structured preview data */
  preview: PreviewSection[];
  
  /** Whether preview generation was successful */
  success: boolean;
  
  /** Error message if preview failed */
  error?: string;
}

/**
 * Section in criteria preview
 */
export interface PreviewSection {
  /** Section title */
  title: string;
  
  /** Section content */
  content: string;
  
  /** Section type */
  type: 'group' | 'condition' | 'function';
  
  /** Nesting level */
  level: number;
  
  /** Child sections */
  children?: PreviewSection[];
}