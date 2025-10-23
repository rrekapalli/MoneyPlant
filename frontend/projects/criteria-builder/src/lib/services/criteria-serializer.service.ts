import { Injectable } from '@angular/core';
import { CriteriaDSL, Group, Condition, FieldRef, Literal, FunctionCall } from '../models/criteria.models';

@Injectable({
  providedIn: 'root'
})
export class CriteriaSerializerService {

  constructor() { }

  /**
   * Generate DSL from criteria builder state
   * T017: Implement basic DSL generation for simple conditions
   * T029: Extend DSL generation to handle nested groups
   * T039: Extend DSL generation to handle function calls
   */
  generateDSL(conditions: Condition[]): CriteriaDSL {
    if (!conditions || conditions.length === 0) {
      return this.createEmptyDSL();
    }

    if (conditions.length === 1) {
      // Single condition - wrap in a simple group
      return {
        root: {
          id: this.generateId(),
          operator: 'AND',
          children: conditions
        },
        version: '1.0',
        metadata: {
          generatedAt: new Date().toISOString(),
          conditionCount: 1,
          groupCount: 1,
          maxDepth: 1
        }
      };
    }

    // Multiple conditions - create AND group
    return {
      root: {
        id: this.generateId(),
        operator: 'AND',
        children: conditions
      },
      version: '1.0',
      metadata: {
        generatedAt: new Date().toISOString(),
        conditionCount: conditions.length,
        groupCount: 1,
        maxDepth: 1
      }
    };
  }

  /**
   * Generate DSL from existing group structure
   * T029: Extended to handle nested groups
   */
  generateDSLFromGroup(rootGroup: Group): CriteriaDSL {
    if (!rootGroup) {
      return this.createEmptyDSL();
    }

    const stats = this.calculateGroupStats(rootGroup);
    
    return {
      root: rootGroup,
      version: '1.0',
      metadata: {
        generatedAt: new Date().toISOString(),
        conditionCount: stats.conditionCount,
        groupCount: stats.groupCount,
        maxDepth: stats.maxDepth
      }
    };
  }

  /**
   * Create a new group with specified operator
   * T029: Extended for group creation
   */
  createGroup(operator: LogicalOperator, children: (Condition | Group)[] = []): Group {
    return {
      id: this.generateId(),
      operator,
      children: children.map(child => {
        // Ensure all children have IDs
        if (this.isCondition(child) && !child.id) {
          child.id = this.generateId();
        } else if (this.isGroup(child) && !child.id) {
          child.id = this.generateId();
        }
        return child;
      })
    };
  }

  /**
   * Add condition to existing group
   * T029: Extended for group manipulation
   */
  addConditionToGroup(group: Group, condition: Condition): Group {
    if (!condition.id) {
      condition.id = this.generateId();
    }

    return {
      ...group,
      children: [...(group.children || []), condition]
    };
  }

  /**
   * Add nested group to existing group
   * T029: Extended for nested group support
   */
  addGroupToGroup(parentGroup: Group, childGroup: Group): Group {
    if (!childGroup.id) {
      childGroup.id = this.generateId();
    }

    return {
      ...parentGroup,
      children: [...(parentGroup.children || []), childGroup]
    };
  }

  /**
   * Remove element from group by ID
   * T029: Extended for group manipulation
   */
  removeElementFromGroup(group: Group, elementId: string): Group {
    return {
      ...group,
      children: (group.children || []).filter(child => child.id !== elementId)
    };
  }

  /**
   * Create a function call with parameters
   * T039: Extended for function call creation
   */
  createFunctionCall(functionName: string, parameters: (FieldRef | Literal)[] = []): FunctionCall {
    return {
      id: this.generateId(),
      function: functionName,
      args: parameters.map(param => {
        // Ensure all parameters have IDs
        if (this.isFieldRef(param) && !param.id) {
          param.id = this.generateId();
        } else if (this.isLiteral(param) && !param.id) {
          param.id = this.generateId();
        }
        return param;
      })
    };
  }

  /**
   * Add function call to condition
   * T039: Extended for function integration
   */
  addFunctionToCondition(condition: Condition, functionCall: FunctionCall, position: 'left' | 'right'): Condition {
    const updatedCondition = { ...condition };
    
    if (position === 'left') {
      updatedCondition.left = functionCall;
    } else {
      updatedCondition.right = functionCall;
    }
    
    return updatedCondition;
  }

  /**
   * Validate function call structure
   * T039: Extended for function validation
   */
  validateFunctionCall(functionCall: FunctionCall, functionMeta?: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!functionCall.function) {
      errors.push('Function name is required');
    }
    
    if (!functionCall.args || functionCall.args.length === 0) {
      errors.push('Function must have at least one parameter');
    }
    
    if (functionMeta) {
      const expectedParamCount = functionMeta.parameters?.length || 0;
      const actualParamCount = functionCall.args?.length || 0;
      
      if (actualParamCount < expectedParamCount) {
        const requiredParams = functionMeta.parameters?.filter((p: any) => !p.optional).length || 0;
        if (actualParamCount < requiredParams) {
          errors.push(`Function requires at least ${requiredParams} parameters, got ${actualParamCount}`);
        }
      }
      
      if (actualParamCount > expectedParamCount) {
        errors.push(`Function expects ${expectedParamCount} parameters, got ${actualParamCount}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate group statistics
   * T029: Extended for metadata generation
   * T039: Extended to include function call statistics
   */
  private calculateGroupStats(group: Group): { conditionCount: number; groupCount: number; maxDepth: number; functionCount: number } {
    let conditionCount = 0;
    let groupCount = 1; // Count the current group
    let maxDepth = 1;
    let functionCount = 0;

    const traverse = (currentGroup: Group, currentDepth: number) => {
      maxDepth = Math.max(maxDepth, currentDepth);
      
      (currentGroup.children || []).forEach(child => {
        if (this.isCondition(child)) {
          conditionCount++;
          // Count function calls in conditions
          if (this.isFunctionCall(child.left)) {
            functionCount++;
          }
          if (child.right && this.isFunctionCall(child.right)) {
            functionCount++;
          }
        } else if (this.isGroup(child)) {
          groupCount++;
          traverse(child, currentDepth + 1);
        }
      });
    };

    traverse(group, 1);

    return { conditionCount, groupCount, maxDepth, functionCount };
  }

  /**
   * Generate SQL preview from DSL
   * T018: Implement basic SQL preview generation for simple conditions
   */
  generateSQLPreview(dsl: CriteriaDSL): string {
    if (!dsl || !dsl.root) {
      return '-- No criteria defined';
    }

    try {
      const sql = this.generateSQLFromGroup(dsl.root);
      return sql || '-- Invalid criteria structure';
    } catch (error) {
      console.error('SQL generation error:', error);
      return '-- Error generating SQL';
    }
  }

  /**
   * Generate SQL from a group (recursive)
   * T030: Extended to handle logical operators and parentheses
   */
  private generateSQLFromGroup(group: Group): string {
    if (!group.children || group.children.length === 0) {
      return '';
    }

    const conditions = group.children.map(child => {
      if (this.isCondition(child)) {
        return this.generateSQLFromCondition(child);
      } else if (this.isGroup(child)) {
        return `(${this.generateSQLFromGroup(child)})`;
      }
      return '';
    }).filter(sql => sql.length > 0);

    if (conditions.length === 0) {
      return '';
    }

    if (conditions.length === 1) {
      // Handle NOT operator for single condition
      if (group.operator === 'NOT') {
        return `NOT (${conditions[0]})`;
      }
      return conditions[0];
    }

    // Handle different logical operators
    let sql = '';
    switch (group.operator) {
      case 'NOT':
        // NOT operator with multiple conditions - wrap all in parentheses
        sql = `NOT (${conditions.join(' AND ')})`;
        break;
      case 'AND':
        sql = conditions.join(' AND ');
        break;
      case 'OR':
        sql = conditions.join(' OR ');
        break;
      default:
        sql = conditions.join(` ${group.operator} `);
    }

    return sql;
  }

  /**
   * Generate SQL from a single condition
   */
  private generateSQLFromCondition(condition: Condition): string {
    const leftOperand = this.generateSQLFromOperand(condition.left);
    const operator = this.getSQLOperator(condition.operator);
    
    if (!condition.right) {
      // Unary operators like IS_NULL, IS_NOT_NULL
      return `${leftOperand} ${operator}`;
    }

    const rightOperand = this.generateSQLFromOperand(condition.right);
    return `${leftOperand} ${operator} ${rightOperand}`;
  }

  /**
   * Generate SQL from operand (FieldRef, FunctionCall, or Literal)
   * T040: Extended to handle function SQL templates
   */
  private generateSQLFromOperand(operand: FieldRef | FunctionCall | Literal | Literal[]): string {
    if (this.isFieldRef(operand)) {
      return operand.alias ? `${operand.field} AS ${operand.alias}` : operand.field;
    }
    
    if (this.isFunctionCall(operand)) {
      return this.generateSQLFromFunctionCall(operand);
    }
    
    if (this.isLiteral(operand)) {
      return this.formatLiteralValue(operand);
    }
    
    if (Array.isArray(operand)) {
      const values = operand.map(literal => this.formatLiteralValue(literal)).join(', ');
      return `(${values})`;
    }
    
    return 'NULL';
  }

  /**
   * Generate SQL from function call
   * T040: Extended to handle function SQL templates
   */
  private generateSQLFromFunctionCall(functionCall: FunctionCall): string {
    const functionName = functionCall.function;
    const args = functionCall.args.map(arg => this.generateSQLFromOperand(arg)).join(', ');
    
    // Handle special function cases
    switch (functionName.toUpperCase()) {
      case 'SMA':
        return `AVG(${args}) OVER (ORDER BY date ROWS BETWEEN ${this.getSmaPeriod(args)} PRECEDING AND CURRENT ROW)`;
      case 'EMA':
        return `EXP_AVG(${args})`;
      case 'RSI':
        return `RSI(${args})`;
      case 'MACD':
        return `MACD(${args})`;
      case 'BOLLINGER_BANDS':
        return `BOLLINGER_BANDS(${args})`;
      case 'STOCHASTIC':
        return `STOCHASTIC(${args})`;
      case 'WILLIAMS_R':
        return `WILLIAMS_R(${args})`;
      case 'CCI':
        return `CCI(${args})`;
      case 'ATR':
        return `ATR(${args})`;
      case 'ADX':
        return `ADX(${args})`;
      default:
        // Generic function call
        return `${functionName}(${args})`;
    }
  }

  /**
   * Get SMA period from arguments
   * T040: Helper for SMA function
   */
  private getSmaPeriod(args: string): number {
    // Extract period from arguments (assuming it's the second parameter)
    const parts = args.split(',');
    if (parts.length >= 2) {
      const period = parseInt(parts[1].trim());
      return isNaN(period) ? 20 : period; // Default to 20 if invalid
    }
    return 20; // Default period
  }

  /**
   * Format literal value for SQL
   */
  private formatLiteralValue(literal: Literal): string {
    if (literal.value === null || literal.value === undefined) {
      return 'NULL';
    }
    
    switch (literal.type) {
      case 'STRING':
        return `'${String(literal.value).replace(/'/g, "''")}'`;
      case 'NUMBER':
      case 'INTEGER':
      case 'PERCENT':
      case 'CURRENCY':
        return String(literal.value);
      case 'DATE':
        return `'${new Date(literal.value).toISOString().split('T')[0]}'`;
      case 'BOOLEAN':
        return literal.value ? 'TRUE' : 'FALSE';
      default:
        return `'${String(literal.value)}'`;
    }
  }

  /**
   * Get SQL operator from DSL operator
   */
  private getSQLOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      '=': '=',
      '!=': '!=',
      '>': '>',
      '>=': '>=',
      '<': '<',
      '<=': '<=',
      'LIKE': 'LIKE',
      'NOT_LIKE': 'NOT LIKE',
      'IN': 'IN',
      'NOT_IN': 'NOT IN',
      'BETWEEN': 'BETWEEN',
      'NOT_BETWEEN': 'NOT BETWEEN',
      'IS_NULL': 'IS NULL',
      'IS_NOT_NULL': 'IS NOT NULL'
    };
    
    return operatorMap[operator] || operator;
  }

  /**
   * Create empty DSL structure
   */
  private createEmptyDSL(): CriteriaDSL {
    return {
      root: {
        id: this.generateId(),
        operator: 'AND',
        children: []
      },
      version: '1.0',
      metadata: {
        generatedAt: new Date().toISOString(),
        conditionCount: 0
      }
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  private isLiteral(obj: any): obj is Literal {
    return obj && typeof obj === 'object' && 'value' in obj && 'type' in obj;
  }
}
