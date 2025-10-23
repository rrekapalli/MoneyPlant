// Type Definitions for Criteria Builder Library

// Field Type Definitions
export type FieldType = 'STRING' | 'NUMBER' | 'INTEGER' | 'DATE' | 'BOOLEAN' | 'ENUM' | 'PERCENT' | 'CURRENCY';

// Operator Definitions
export type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'NOT_LIKE' | 'IN' | 'NOT_IN' | 'BETWEEN' | 'NOT_BETWEEN' | 'IS_NULL' | 'IS_NOT_NULL';

// Logical Operator Definitions
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// Badge Component Type
export type BadgeComponentType = 
  | 'field-badge'
  | 'operator-badge' 
  | 'value-badge'
  | 'function-badge'
  | 'group-badge'
  | 'action-badge';

// Display Mode Type
export type DisplayMode = 'compact' | 'expanded';

// Change Type for Events
export type ChangeType = 'add' | 'remove' | 'modify' | 'reorder';

// Badge Action Type
export type BadgeAction = 'select' | 'edit' | 'delete' | 'drag' | 'drop' | 'toggle';

// Badge Type
export type BadgeType = 'field' | 'operator' | 'value' | 'function' | 'group' | 'action';

// Validation Severity
export type ValidationSeverity = 'error' | 'warning';

// Criteria Complexity
export type CriteriaComplexity = 'simple' | 'moderate' | 'complex';

// Utility Types

// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Pick specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Union of all possible values
export type ValueOf<T> = T[keyof T];

// Extract the type of array elements
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Extract the return type of a function
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract the parameter types of a function
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Type guards for runtime type checking
export function isFieldType(value: any): value is FieldType {
  return ['STRING', 'NUMBER', 'INTEGER', 'DATE', 'BOOLEAN', 'ENUM', 'PERCENT', 'CURRENCY'].includes(value);
}

export function isOperator(value: any): value is Operator {
  return ['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'NOT_LIKE', 'IN', 'NOT_IN', 'BETWEEN', 'NOT_BETWEEN', 'IS_NULL', 'IS_NOT_NULL'].includes(value);
}

export function isLogicalOperator(value: any): value is LogicalOperator {
  return ['AND', 'OR', 'NOT'].includes(value);
}

export function isBadgeAction(value: any): value is BadgeAction {
  return ['select', 'edit', 'delete', 'drag', 'drop', 'toggle'].includes(value);
}

export function isChangeType(value: any): value is ChangeType {
  return ['add', 'remove', 'modify', 'reorder'].includes(value);
}

export function isDisplayMode(value: any): value is DisplayMode {
  return ['compact', 'expanded'].includes(value);
}

export function isValidationSeverity(value: any): value is ValidationSeverity {
  return ['error', 'warning'].includes(value);
}

export function isCriteriaComplexity(value: any): value is CriteriaComplexity {
  return ['simple', 'moderate', 'complex'].includes(value);
}
