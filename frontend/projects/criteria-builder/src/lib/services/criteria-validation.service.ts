import { Injectable } from '@angular/core';
import { CriteriaDSL, Group, Condition, FieldRef, Literal, FunctionCall, ValidationResult, ValidationError, ValidationWarning } from '../models/criteria.models';
import { FieldMeta, FunctionMeta } from '../models/criteria.models';
import { PERFORMANCE_LIMITS, VALIDATION_RULES } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class CriteriaValidationService {

  constructor() { }

  /**
   * Validate criteria DSL structure
   * T019: Create CriteriaValidationService for validating field-operator-value combinations
   */
  validateCriteria(dsl: CriteriaDSL, fields: FieldMeta[], functions: FunctionMeta[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Basic structure validation
      this.validateStructure(dsl, errors, warnings);
      
      // Group structure validation
      this.validateGroupStructure(dsl, errors, warnings);
      
      // Performance validation
      this.validatePerformance(dsl, warnings);
      
      // Field validation
      this.validateFields(dsl, fields, errors, warnings);
      
      // Function validation
      this.validateFunctions(dsl, functions, errors, warnings);
      
      // Operator validation
      this.validateOperators(dsl, fields, errors, warnings);

    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error}`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate basic DSL structure
   */
  private validateStructure(dsl: CriteriaDSL, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!dsl) {
      errors.push({
        code: 'MISSING_DSL',
        message: 'Criteria DSL is missing',
        severity: 'error'
      });
      return;
    }

    if (!dsl.root) {
      errors.push({
        code: 'MISSING_ROOT',
        message: 'Criteria DSL root group is missing',
        severity: 'error'
      });
      return;
    }

    if (!dsl.root.children || dsl.root.children.length === 0) {
      warnings.push({
        code: 'EMPTY_CRITERIA',
        message: 'No conditions defined in criteria',
        suggestion: 'Add at least one condition to create meaningful criteria'
      });
    }

    // Validate version
    if (!dsl.version) {
      warnings.push({
        code: 'MISSING_VERSION',
        message: 'DSL version is not specified',
        suggestion: 'Consider adding version information for future compatibility'
      });
    }
  }

  /**
   * Validate performance constraints
   * T031: Extended for group structure validation
   * T035: Implement nesting depth validation (max 10 levels)
   */
  private validatePerformance(dsl: CriteriaDSL, warnings: ValidationWarning[]): void {
    if (!dsl?.root) return;

    const elementCount = this.countElements(dsl.root);
    const nestingDepth = this.calculateNestingDepth(dsl.root);

    if (elementCount > PERFORMANCE_LIMITS.MAX_ELEMENTS) {
      warnings.push({
        code: 'EXCESSIVE_ELEMENTS',
        message: `Criteria has ${elementCount} elements, exceeding recommended limit of ${PERFORMANCE_LIMITS.MAX_ELEMENTS}`,
        suggestion: 'Consider breaking down complex criteria into smaller, more manageable parts'
      });
    }

    if (nestingDepth > PERFORMANCE_LIMITS.MAX_NESTING_DEPTH) {
      warnings.push({
        code: 'EXCESSIVE_NESTING',
        message: `Criteria has ${nestingDepth} levels of nesting, exceeding recommended limit of ${PERFORMANCE_LIMITS.MAX_NESTING_DEPTH}`,
        suggestion: 'Consider simplifying the logical structure'
      });
    }
  }

  /**
   * Validate group structure
   * T031: Implement group structure validation
   */
  private validateGroupStructure(dsl: CriteriaDSL, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!dsl?.root) return;

    this.validateGroup(dsl.root, 1, errors, warnings);
  }

  /**
   * Validate individual group
   * T031: Extended for group validation
   */
  private validateGroup(group: Group, depth: number, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validate group operator
    if (!group.operator || !['AND', 'OR', 'NOT'].includes(group.operator)) {
      errors.push({
        code: 'INVALID_GROUP_OPERATOR',
        message: `Invalid group operator: ${group.operator}`,
        field: group.id,
        severity: 'error'
      });
    }

    // Validate group has children
    if (!group.children || group.children.length === 0) {
      warnings.push({
        code: 'EMPTY_GROUP',
        message: 'Group contains no conditions',
        field: group.id,
        suggestion: 'Add conditions to this group or remove it'
      });
      return;
    }

    // Validate NOT operator usage
    if (group.operator === 'NOT' && group.children.length > 1) {
      warnings.push({
        code: 'NOT_MULTIPLE_CONDITIONS',
        message: 'NOT operator with multiple conditions may not behave as expected',
        field: group.id,
        suggestion: 'Consider using nested groups for complex NOT operations'
      });
    }

    // Validate nesting depth
    if (depth > PERFORMANCE_LIMITS.MAX_NESTING_DEPTH) {
      errors.push({
        code: 'MAX_NESTING_EXCEEDED',
        message: `Maximum nesting depth of ${PERFORMANCE_LIMITS.MAX_NESTING_DEPTH} exceeded`,
        field: group.id,
        severity: 'error'
      });
      return; // Don't validate deeper levels
    }

    // Recursively validate children
    group.children.forEach(child => {
      if (this.isCondition(child)) {
        this.validateCondition(child, errors, warnings);
      } else if (this.isGroup(child)) {
        this.validateGroup(child, depth + 1, errors, warnings);
      }
    });
  }

  /**
   * Validate individual condition
   * T031: Extended for condition validation
   */
  private validateCondition(condition: Condition, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validate condition has required fields
    if (!condition.left) {
      errors.push({
        code: 'MISSING_LEFT_OPERAND',
        message: 'Condition is missing left operand',
        field: condition.id,
        severity: 'error'
      });
    }

    if (!condition.operator) {
      errors.push({
        code: 'MISSING_OPERATOR',
        message: 'Condition is missing operator',
        field: condition.id,
        severity: 'error'
      });
    }

    // Validate operator compatibility with operands
    if (condition.left && condition.operator) {
      this.validateOperatorCompatibility(condition, errors, warnings);
    }
  }

  /**
   * Validate operator compatibility with operands
   * T031: Extended for operator validation
   */
  private validateOperatorCompatibility(condition: Condition, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const operator = condition.operator;
    
    // Check if operator requires right operand
    const requiresRightOperand = !['IS_NULL', 'IS_NOT_NULL'].includes(operator);
    
    if (requiresRightOperand && !condition.right) {
      errors.push({
        code: 'MISSING_RIGHT_OPERAND',
        message: `Operator '${operator}' requires a right operand`,
        field: condition.id,
        severity: 'error'
      });
    }

    // Check if operator should not have right operand
    if (!requiresRightOperand && condition.right) {
      warnings.push({
        code: 'UNNECESSARY_RIGHT_OPERAND',
        message: `Operator '${operator}' does not require a right operand`,
        field: condition.id,
        suggestion: 'Remove the right operand for this operator'
      });
    }
  }

  /**
   * Validate field references
   */
  private validateFields(dsl: CriteriaDSL, fields: FieldMeta[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!dsl?.root || !fields) return;

    const fieldRefs = this.extractFieldRefs(dsl.root);
    const fieldIds = new Set(fields.map(f => f.id));

    fieldRefs.forEach(fieldRef => {
      if (!fieldIds.has(fieldRef.field)) {
        errors.push({
          code: 'INVALID_FIELD',
          message: `Field '${fieldRef.field}' is not available`,
          field: fieldRef.field,
          severity: 'error'
        });
      }
    });
  }

  /**
   * Validate function calls
   */
  private validateFunctions(dsl: CriteriaDSL, functions: FunctionMeta[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!dsl?.root || !functions) return;

    const functionCalls = this.extractFunctionCalls(dsl.root);
    const functionIds = new Set(functions.map(f => f.id));

    functionCalls.forEach(funcCall => {
      if (!functionIds.has(funcCall.function)) {
        errors.push({
          code: 'INVALID_FUNCTION',
          message: `Function '${funcCall.function}' is not available`,
          field: funcCall.function,
          severity: 'error'
        });
        return;
      }

      // Validate function parameters
      const functionMeta = functions.find(f => f.id === funcCall.function);
      if (functionMeta) {
        this.validateFunctionParameters(funcCall, functionMeta, errors, warnings);
      }
    });
  }

  /**
   * Validate function parameters
   */
  private validateFunctionParameters(funcCall: FunctionCall, functionMeta: FunctionMeta, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const expectedParamCount = functionMeta.parameters.length;
    const actualParamCount = funcCall.args.length;

    if (actualParamCount < expectedParamCount) {
      const requiredParams = functionMeta.parameters.filter(p => !p.optional).length;
      if (actualParamCount < requiredParams) {
        errors.push({
          code: 'INSUFFICIENT_PARAMETERS',
          message: `Function '${funcCall.function}' requires at least ${requiredParams} parameters, got ${actualParamCount}`,
          field: funcCall.function,
          severity: 'error'
        });
      }
    }

    if (actualParamCount > expectedParamCount) {
      warnings.push({
        code: 'EXCESSIVE_PARAMETERS',
        message: `Function '${funcCall.function}' expects ${expectedParamCount} parameters, got ${actualParamCount}`,
        field: funcCall.function,
        suggestion: 'Remove extra parameters or check function definition'
      });
    }
  }

  /**
   * Validate operators against field types
   */
  private validateOperators(dsl: CriteriaDSL, fields: FieldMeta[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!dsl?.root || !fields) return;

    const conditions = this.extractConditions(dsl.root);
    
    conditions.forEach(condition => {
      if (this.isFieldRef(condition.left)) {
        const field = fields.find(f => f.id === condition.left.field);
        if (field) {
          this.validateOperatorForField(condition.operator, field, errors, warnings);
        }
      }
    });
  }

  /**
   * Validate operator compatibility with field type
   */
  private validateOperatorForField(operator: string, field: FieldMeta, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const compatibleOperators = this.getCompatibleOperators(field.dataType);
    
    if (!compatibleOperators.includes(operator as any)) {
      errors.push({
        code: 'INCOMPATIBLE_OPERATOR',
        message: `Operator '${operator}' is not compatible with field type '${field.dataType}'`,
        field: field.id,
        severity: 'error'
      });
    }
  }

  /**
   * Get compatible operators for field type
   */
  private getCompatibleOperators(fieldType: string): string[] {
    const operatorMap: Record<string, string[]> = {
      'STRING': ['=', '!=', 'LIKE', 'NOT_LIKE', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
      'NUMBER': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
      'INTEGER': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
      'DATE': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IS_NULL', 'IS_NOT_NULL'],
      'BOOLEAN': ['=', '!=', 'IS_NULL', 'IS_NOT_NULL'],
      'ENUM': ['=', '!=', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
      'PERCENT': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
      'CURRENCY': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT_BETWEEN', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL']
    };
    
    return operatorMap[fieldType] || [];
  }

  /**
   * Utility methods for extracting elements from DSL
   */
  private countElements(group: Group): number {
    let count = 0;
    group.children.forEach(child => {
      if (this.isCondition(child)) {
        count++;
      } else if (this.isGroup(child)) {
        count += this.countElements(child);
      }
    });
    return count;
  }

  private calculateNestingDepth(group: Group, currentDepth = 0): number {
    let maxDepth = currentDepth;
    group.children.forEach(child => {
      if (this.isGroup(child)) {
        maxDepth = Math.max(maxDepth, this.calculateNestingDepth(child, currentDepth + 1));
      }
    });
    return maxDepth;
  }

  private extractFieldRefs(group: Group): FieldRef[] {
    const fieldRefs: FieldRef[] = [];
    group.children.forEach(child => {
      if (this.isCondition(child)) {
        if (this.isFieldRef(child.left)) {
          fieldRefs.push(child.left);
        }
        if (child.right && this.isFieldRef(child.right)) {
          fieldRefs.push(child.right);
        }
      } else if (this.isGroup(child)) {
        fieldRefs.push(...this.extractFieldRefs(child));
      }
    });
    return fieldRefs;
  }

  private extractFunctionCalls(group: Group): FunctionCall[] {
    const functionCalls: FunctionCall[] = [];
    group.children.forEach(child => {
      if (this.isCondition(child)) {
        if (this.isFunctionCall(child.left)) {
          functionCalls.push(child.left);
        }
        if (child.right && this.isFunctionCall(child.right)) {
          functionCalls.push(child.right);
        }
      } else if (this.isGroup(child)) {
        functionCalls.push(...this.extractFunctionCalls(child));
      }
    });
    return functionCalls;
  }

  private extractConditions(group: Group): Condition[] {
    const conditions: Condition[] = [];
    group.children.forEach(child => {
      if (this.isCondition(child)) {
        conditions.push(child);
      } else if (this.isGroup(child)) {
        conditions.push(...this.extractConditions(child));
      }
    });
    return conditions;
  }

  /**
   * Type guards
   */
  private isCondition(obj: any): obj is Condition {
    return obj && typeof obj === 'object' && 'left' in obj && 'operator' in obj;
  }

  private isGroup(obj: any): obj is Group {
    return obj && typeof obj === 'object' && 'operator' in obj && 'children' in obj;
  }

  private isFieldRef(obj: any): obj is FieldRef {
    return obj && typeof obj === 'object' && 'field' in obj;
  }

  private isFunctionCall(obj: any): obj is FunctionCall {
    return obj && typeof obj === 'object' && 'function' in obj && 'args' in obj;
  }
}
