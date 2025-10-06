import { Injectable } from '@angular/core';
import { 
  CriteriaDSL, 
  Group, 
  Condition, 
  ValidationResult, 
  ValidationError, 
  FieldRef, 
  FunctionCall, 
  Literal,
  FieldType,
  Operator
} from '../models/criteria-dsl.interface';
import { QueryToken, TokenType } from '../models/token-system.interface';
import { FieldMeta, FunctionMeta } from '../models';

/**
 * Service for local DSL operations including validation, token conversion, and import/export
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaSerializerService {

  constructor() {}

  // Local DSL validation methods for immediate feedback

  /**
   * Validate DSL structure and basic type checking
   */
  validateDSL(dsl: CriteriaDSL, fields: FieldMeta[] = [], functions: FunctionMeta[] = []): ValidationResult {
    const errors: ValidationError[] = [];
    
    try {
      if (!dsl || !dsl.root) {
        errors.push({
          id: this.generateId(),
          type: 'invalid_operator',
          message: 'Invalid DSL structure: missing root group',
          path: '$.root',
          severity: 'error'
        });
        return { isValid: false, errors, warnings: [] };
      }

      this.validateGroup(dsl.root, fields, functions, errors, '$.root');
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings: []
      };
    } catch (error) {
      errors.push({
        id: this.generateId(),
        type: 'invalid_operator',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        path: '$.root',
        severity: 'error'
      });
      
      return { isValid: false, errors, warnings: [] };
    }
  }

  /**
   * Validate group structure recursively
   */
  private validateGroup(group: Group, fields: FieldMeta[], functions: FunctionMeta[], errors: ValidationError[], path: string): void {
    // Validate group operator
    if (!['AND', 'OR', 'NOT'].includes(group.operator)) {
      errors.push({
        id: this.generateId(),
        type: 'invalid_operator',
        message: `Invalid group operator: ${group.operator}`,
        path: `${path}.operator`,
        severity: 'error'
      });
    }

    // Validate NOT operator has only one child
    if (group.operator === 'NOT' && group.children.length !== 1) {
      errors.push({
        id: this.generateId(),
        type: 'invalid_operator',
        message: 'NOT operator must have exactly one child',
        path: `${path}.children`,
        severity: 'error'
      });
    }

    // Validate children
    if (!group.children || group.children.length === 0) {
      errors.push({
        id: this.generateId(),
        type: 'invalid_operator',
        message: 'Group must have at least one child',
        path: `${path}.children`,
        severity: 'error'
      });
      return;
    }

    group.children.forEach((child, index) => {
      const childPath = `${path}.children[${index}]`;
      if (this.isCondition(child)) {
        this.validateCondition(child, fields, functions, errors, childPath);
      } else if (this.isGroup(child)) {
        this.validateGroup(child, fields, functions, errors, childPath);
      } else {
        errors.push({
          id: this.generateId(),
          type: 'invalid_operator',
          message: 'Invalid child type in group',
          path: childPath,
          severity: 'error'
        });
      }
    });
  }

  /**
   * Validate condition structure
   */
  private validateCondition(condition: Condition, fields: FieldMeta[], functions: FunctionMeta[], errors: ValidationError[], path: string): void {
    // Validate left side
    if (!condition.left) {
      errors.push({
        id: this.generateId(),
        type: 'field_not_found',
        message: 'Condition must have a left side',
        path: `${path}.left`,
        severity: 'error'
      });
    } else {
      this.validateExpression(condition.left, fields, functions, errors, `${path}.left`);
    }

    // Validate operator
    if (!condition.op) {
      errors.push({
        id: this.generateId(),
        type: 'operator_incompatible',
        message: 'Condition must have an operator',
        path: `${path}.op`,
        severity: 'error'
      });
    }

    // Validate right side (if required by operator)
    const operatorsRequiringRightSide: Operator[] = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'NOT BETWEEN'];
    if (operatorsRequiringRightSide.includes(condition.op) && !condition.right) {
      errors.push({
        id: this.generateId(),
        type: 'required_parameter_missing',
        message: `Operator ${condition.op} requires a right side value`,
        path: `${path}.right`,
        severity: 'error'
      });
    } else if (condition.right) {
      this.validateExpression(condition.right, fields, functions, errors, `${path}.right`);
    }
  }

  /**
   * Validate expression (FieldRef, FunctionCall, or Literal)
   */
  private validateExpression(expression: FieldRef | FunctionCall | Literal, fields: FieldMeta[], functions: FunctionMeta[], errors: ValidationError[], path: string): void {
    if (this.isFieldRef(expression)) {
      // Validate field exists
      const field = fields.find(f => f.id === expression.fieldId);
      if (!field) {
        errors.push({
          id: this.generateId(),
          type: 'field_not_found',
          message: `Field not found: ${expression.fieldId}`,
          path: path,
          severity: 'error'
        });
      }
    } else if (this.isFunctionCall(expression)) {
      // Validate function exists
      const func = functions.find(f => f.id === expression.functionId);
      if (!func) {
        errors.push({
          id: this.generateId(),
          type: 'function_not_found',
          message: `Function not found: ${expression.functionId}`,
          path: path,
          severity: 'error'
        });
      } else {
        // Validate parameters
        const requiredParams = func.params.filter(p => p.required);
        if (expression.params.length < requiredParams.length) {
          errors.push({
            id: this.generateId(),
            type: 'required_parameter_missing',
            message: `Function ${expression.functionId} requires ${requiredParams.length} parameters, got ${expression.params.length}`,
            path: `${path}.params`,
            severity: 'error'
          });
        }

        // Validate each parameter
        expression.params.forEach((param, index) => {
          this.validateExpression(param, fields, functions, errors, `${path}.params[${index}]`);
        });
      }
    } else if (this.isLiteral(expression)) {
      // Validate literal value matches type
      if (!this.isValidLiteralValue(expression.value, expression.type)) {
        errors.push({
          id: this.generateId(),
          type: 'type_mismatch',
          message: `Invalid value for type ${expression.type}: ${expression.value}`,
          path: path,
          severity: 'error'
        });
      }
    }
  }

  // DSL to token conversion for visual representation

  /**
   * Convert DSL to visual tokens for rendering
   */
  dslToTokens(dsl: CriteriaDSL): QueryToken[] {
    if (!dsl || !dsl.root) {
      return [];
    }

    const tokens: QueryToken[] = [];
    this.groupToTokens(dsl.root, tokens, 0);
    return tokens;
  }

  /**
   * Convert group to tokens recursively
   */
  private groupToTokens(group: Group, tokens: QueryToken[], depth: number): void {
    if (group.children.length === 0) {
      return;
    }

    // Add opening parenthesis for nested groups
    if (depth > 0) {
      tokens.push(this.createToken('parenthesis', '(', '(', depth));
    }

    group.children.forEach((child, index) => {
      // Add logical operator before each child (except first)
      if (index > 0) {
        tokens.push(this.createToken('logic', group.operator, group.operator, depth));
      }

      if (this.isCondition(child)) {
        this.conditionToTokens(child, tokens, depth);
      } else if (this.isGroup(child)) {
        this.groupToTokens(child, tokens, depth + 1);
      }
    });

    // Add closing parenthesis for nested groups
    if (depth > 0) {
      tokens.push(this.createToken('parenthesis', ')', ')', depth));
    }
  }

  /**
   * Convert condition to tokens
   */
  private conditionToTokens(condition: Condition, tokens: QueryToken[], depth: number): void {
    // Left side token
    if (condition.left) {
      this.expressionToTokens(condition.left, tokens, depth);
    }

    // Operator token
    if (condition.op) {
      tokens.push(this.createToken('operator', condition.op, condition.op, depth));
    }

    // Right side token
    if (condition.right) {
      this.expressionToTokens(condition.right, tokens, depth);
    }
  }

  /**
   * Convert expression to tokens
   */
  private expressionToTokens(expression: FieldRef | FunctionCall | Literal, tokens: QueryToken[], depth: number): void {
    if (this.isFieldRef(expression)) {
      tokens.push(this.createToken('field', expression.fieldId, expression.fieldId, depth, { fieldId: expression.fieldId }));
    } else if (this.isFunctionCall(expression)) {
      tokens.push(this.createToken('function', expression.functionId, `${expression.functionId}(...)`, depth, { 
        functionId: expression.functionId,
        params: expression.params
      }));
    } else if (this.isLiteral(expression)) {
      const displayValue = this.formatLiteralValue(expression.value, expression.type);
      tokens.push(this.createToken('value', displayValue, displayValue, depth, { 
        type: expression.type,
        value: expression.value
      }));
    }
  }

  /**
   * Create a token with standard properties
   */
  private createToken(type: TokenType, value: any, displayText: string, depth: number, metadata?: Record<string, any>): QueryToken {
    return {
      id: this.generateId(),
      type,
      displayText,
      value,
      depth,
      position: 0, // Will be set by the display component
      isEditable: type !== 'parenthesis' && type !== 'logic',
      isDeletable: type !== 'parenthesis',
      hasDropdown: type === 'field' || type === 'operator' || type === 'value',
      hasDialog: type === 'function',
      metadata
    };
  }

  // Import/export functionality for CriteriaDSL JSON

  /**
   * Export DSL to JSON string
   */
  exportDSL(dsl: CriteriaDSL): string {
    try {
      // Add export metadata
      const exportData = {
        ...dsl,
        meta: {
          ...dsl.meta,
          exportedAt: new Date().toISOString(),
          exportedBy: 'criteria-builder-ui',
          version: dsl.meta?.version || 1
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export DSL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import DSL from JSON string with validation
   */
  importDSL(jsonString: string): { dsl: CriteriaDSL | null; errors: string[] } {
    const errors: string[] = [];

    try {
      const parsed = JSON.parse(jsonString);
      
      // Basic structure validation
      if (!parsed || typeof parsed !== 'object') {
        errors.push('Invalid JSON structure');
        return { dsl: null, errors };
      }

      if (!parsed.root) {
        errors.push('Missing root group in DSL');
        return { dsl: null, errors };
      }

      // Validate root group structure
      if (!this.isValidGroupStructure(parsed.root)) {
        errors.push('Invalid root group structure');
        return { dsl: null, errors };
      }

      const dsl: CriteriaDSL = {
        root: parsed.root,
        meta: parsed.meta || {},
        validation: parsed.validation
      };

      return { dsl, errors };
    } catch (error) {
      errors.push(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { dsl: null, errors };
    }
  }

  /**
   * Create empty DSL structure
   */
  createEmptyDSL(): CriteriaDSL {
    return {
      root: {
        operator: 'AND',
        children: []
      },
      meta: {
        name: 'New Criteria',
        version: 1,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Helper methods

  private isCondition(obj: any): obj is Condition {
    return obj && typeof obj === 'object' && 'left' in obj && 'op' in obj;
  }

  private isGroup(obj: any): obj is Group {
    return obj && typeof obj === 'object' && 'operator' in obj && 'children' in obj;
  }

  private isFieldRef(obj: any): obj is FieldRef {
    return obj && typeof obj === 'object' && 'fieldId' in obj;
  }

  private isFunctionCall(obj: any): obj is FunctionCall {
    return obj && typeof obj === 'object' && 'functionId' in obj && 'params' in obj;
  }

  private isLiteral(obj: any): obj is Literal {
    return obj && typeof obj === 'object' && 'type' in obj && 'value' in obj;
  }

  private isValidGroupStructure(group: any): boolean {
    if (!group || typeof group !== 'object') return false;
    if (!['AND', 'OR', 'NOT'].includes(group.operator)) return false;
    if (!Array.isArray(group.children)) return false;
    
    return group.children.every((child: any) => 
      this.isValidGroupStructure(child) || this.isValidConditionStructure(child)
    );
  }

  private isValidConditionStructure(condition: any): boolean {
    if (!condition || typeof condition !== 'object') return false;
    if (!condition.left || !condition.op) return false;
    
    return true; // Basic validation, more detailed validation in validateDSL
  }

  private isValidLiteralValue(value: any, type: FieldType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
      case 'percent':
      case 'currency':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return typeof value === 'number' && Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return typeof value === 'string' && !isNaN(Date.parse(value));
      case 'enum':
        return typeof value === 'string' || typeof value === 'number';
      default:
        return true; // Allow unknown types
    }
  }

  private formatLiteralValue(value: any, type: FieldType): string {
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'percent':
        return `${value}%`;
      case 'currency':
        return `$${value}`;
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}