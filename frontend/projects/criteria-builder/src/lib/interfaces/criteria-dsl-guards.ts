/**
 * Type guards and validation utilities for CriteriaDSL objects
 */

import {
  CriteriaDSL,
  Group,
  Condition,
  FieldRef,
  FunctionCall,
  Literal,
  LogicalOperator,
  FieldDataType
} from './criteria-dsl.interface';
import {
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './validation.interface';

/**
 * DSL-specific validation options
 */
export interface DSLValidationOptions {
  maxDepth?: number;
  maxElements?: number;
  strictTypeChecking?: boolean;
  allowEmptyGroups?: boolean;
}

/**
 * Default DSL validation options
 */
export const DEFAULT_DSL_VALIDATION_OPTIONS: DSLValidationOptions = {
  maxDepth: 10,
  maxElements: 100,
  strictTypeChecking: true,
  allowEmptyGroups: false
};

/**
 * Type guard for CriteriaDSL
 */
export function isCriteriaDSL(obj: any): obj is CriteriaDSL {
  return (
    obj &&
    typeof obj === 'object' &&
    isGroup(obj.root) &&
    typeof obj.version === 'string'
  );
}

/**
 * Type guard for Group
 */
export function isGroup(obj: any): obj is Group {
  return (
    obj &&
    typeof obj === 'object' &&
    isLogicalOperator(obj.operator) &&
    Array.isArray(obj.children) &&
    obj.children.every((child: any) => isGroup(child) || isCondition(child))
  );
}

/**
 * Type guard for Condition
 */
export function isCondition(obj: any): obj is Condition {
  return (
    obj &&
    typeof obj === 'object' &&
    (isFieldRef(obj.left) || isFunctionCall(obj.left)) &&
    typeof obj.operator === 'string' &&
    (obj.right === undefined || 
     isLiteral(obj.right) || 
     isFieldRef(obj.right) || 
     isFunctionCall(obj.right))
  );
}

/**
 * Type guard for FieldRef
 */
export function isFieldRef(obj: any): obj is FieldRef {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'field' &&
    typeof obj.fieldId === 'string' &&
    typeof obj.name === 'string' &&
    isFieldDataType(obj.dataType)
  );
}

/**
 * Type guard for FunctionCall
 */
export function isFunctionCall(obj: any): obj is FunctionCall {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'function' &&
    typeof obj.functionId === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.parameters) &&
    obj.parameters.every((param: any) => 
      isLiteral(param) || isFieldRef(param) || isFunctionCall(param)
    ) &&
    isFieldDataType(obj.returnType)
  );
}

/**
 * Type guard for Literal
 */
export function isLiteral(obj: any): obj is Literal {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'literal' &&
    obj.hasOwnProperty('value') &&
    isFieldDataType(obj.dataType)
  );
}

/**
 * Type guard for LogicalOperator
 */
export function isLogicalOperator(value: any): value is LogicalOperator {
  return value === 'AND' || value === 'OR' || value === 'NOT';
}

/**
 * Type guard for FieldDataType
 */
export function isFieldDataType(value: any): value is FieldDataType {
  const validTypes: FieldDataType[] = [
    'string', 'number', 'integer', 'decimal', 'boolean',
    'date', 'datetime', 'time', 'array', 'object'
  ];
  return validTypes.includes(value);
}

/**
 * Simple validation function for CriteriaDSL
 */
export function validateCriteriaDSL(
  dsl: any, 
  options: DSLValidationOptions = DEFAULT_DSL_VALIDATION_OPTIONS
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!isCriteriaDSL(dsl)) {
    errors.push({
      path: 'root',
      message: 'Invalid CriteriaDSL structure',
      code: 'INVALID_STRUCTURE',
      severity: 'error',
      canAutoFix: false
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    timestamp: new Date()
  };
}

/**
 * Counts total elements in a CriteriaDSL structure
 */
export function countElements(dsl: CriteriaDSL): number {
  return countGroupElements(dsl.root);
}

/**
 * Counts elements in a Group recursively
 */
export function countGroupElements(group: Group): number {
  let count = 1;
  
  group.children.forEach(child => {
    if (isGroup(child)) {
      count += countGroupElements(child);
    } else {
      count += 1;
    }
  });
  
  return count;
}

/**
 * Gets the maximum depth of a CriteriaDSL structure
 */
export function getMaxDepth(dsl: CriteriaDSL): number {
  return getGroupDepth(dsl.root, 0);
}

/**
 * Gets the depth of a Group recursively
 */
export function getGroupDepth(group: Group, currentDepth: number): number {
  let maxDepth = currentDepth;
  
  group.children.forEach(child => {
    if (isGroup(child)) {
      const childDepth = getGroupDepth(child, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  });
  
  return maxDepth;
}

/**
 * Validates element count against maximum limit
 */
export function validateElementCount(
  dsl: CriteriaDSL, 
  maxElements: number = 100
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const elementCount = countElements(dsl);
  
  if (elementCount > maxElements) {
    errors.push({
      path: 'root',
      message: `Maximum element count of ${maxElements} exceeded (current: ${elementCount})`,
      code: 'MAX_ELEMENTS_EXCEEDED',
      severity: 'error',
      canAutoFix: false
    });
  }
  
  return { 
    isValid: errors.length === 0, 
    errors, 
    warnings,
    timestamp: new Date()
  };
}