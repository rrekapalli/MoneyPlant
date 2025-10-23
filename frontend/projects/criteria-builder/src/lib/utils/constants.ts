// Constants and Utilities for Criteria Builder Library

import { CriteriaConfig } from '../models/config.models';
import { FieldType, Operator } from '../types/criteria.types';

// Default Configuration
export const DEFAULT_CONFIG: CriteriaConfig = {
  allowGrouping: true,
  maxDepth: 10,
  enableAdvancedFunctions: true,
  displayMode: 'expanded',
  showSqlPreview: true,
  enableUndo: true,
  maxElements: 100
};

// Supported Operators by Field Type (matches backend FieldMetadataService)
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

// Badge Component Types
export type BadgeComponentType = 
  | 'field-badge'
  | 'operator-badge' 
  | 'value-badge'
  | 'function-badge'
  | 'group-badge'
  | 'action-badge';

// Performance Constants
export const PERFORMANCE_LIMITS = {
  MAX_NESTING_DEPTH: 10,
  MAX_ELEMENTS: 100,
  MAX_MEMORY_USAGE_MB: 10,
  DSL_GENERATION_TIMEOUT_MS: 100,
  SQL_GENERATION_TIMEOUT_MS: 200,
  DRAG_OPERATION_TIMEOUT_MS: 150
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  MIN_FIELD_NAME_LENGTH: 1,
  MAX_FIELD_NAME_LENGTH: 100,
  MIN_FUNCTION_NAME_LENGTH: 1,
  MAX_FUNCTION_NAME_LENGTH: 50,
  MAX_PARAMETER_COUNT: 10,
  MAX_STRING_LENGTH: 1000,
  MAX_NUMBER_PRECISION: 10,
  MAX_NUMBER_SCALE: 4
} as const;

// UI Constants
export const UI_CONSTANTS = {
  BADGE_MIN_WIDTH: 60,
  BADGE_MAX_WIDTH: 200,
  BADGE_HEIGHT: 32,
  BADGE_SPACING: 8,
  GROUP_PADDING: 16,
  ANIMATION_DURATION_MS: 200,
  DEBOUNCE_DELAY_MS: 300
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_FIELD_TYPE: 'Invalid field type for operator',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  INVALID_NESTING_DEPTH: 'Maximum nesting depth exceeded',
  INVALID_ELEMENT_COUNT: 'Maximum element count exceeded',
  INVALID_FUNCTION_PARAMETERS: 'Invalid function parameters',
  VALIDATION_TIMEOUT: 'Validation operation timed out',
  SQL_GENERATION_FAILED: 'SQL generation failed',
  DRAG_DROP_FAILED: 'Drag and drop operation failed'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CRITERIA_SAVED: 'Criteria saved successfully',
  VALIDATION_PASSED: 'Validation passed',
  SQL_GENERATED: 'SQL generated successfully',
  UNDO_SUCCESS: 'Operation undone',
  REDO_SUCCESS: 'Operation redone'
} as const;
