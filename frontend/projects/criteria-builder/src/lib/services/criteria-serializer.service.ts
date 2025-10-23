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
          conditionCount: 1
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
        conditionCount: conditions.length
      }
    };
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
      return conditions[0];
    }

    const operator = group.operator === 'NOT' ? 'NOT' : group.operator;
    return conditions.join(` ${operator} `);
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
   */
  private generateSQLFromOperand(operand: FieldRef | FunctionCall | Literal | Literal[]): string {
    if (this.isFieldRef(operand)) {
      return operand.alias ? `${operand.field} AS ${operand.alias}` : operand.field;
    }
    
    if (this.isFunctionCall(operand)) {
      const args = operand.args.map(arg => this.generateSQLFromOperand(arg)).join(', ');
      return `${operand.function}(${args})`;
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
