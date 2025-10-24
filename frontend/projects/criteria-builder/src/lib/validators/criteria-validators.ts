import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CriteriaDSL, Group, Condition } from '../interfaces/criteria-dsl.interface';

/**
 * Custom validators for criteria builder form integration
 */
export class CriteriaValidators {
  
  /**
   * Validator to ensure criteria has at least one condition
   */
  static required(control: AbstractControl): ValidationErrors | null {
    const criteria = control.value as CriteriaDSL;
    
    if (!criteria || !criteria.root || !criteria.root.children || criteria.root.children.length === 0) {
      return {
        criteriaRequired: {
          message: 'At least one condition is required',
          code: 'CRITERIA_REQUIRED'
        }
      };
    }
    
    return null;
  }

  /**
   * Validator to check minimum number of conditions
   */
  static minConditions(minCount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const criteria = control.value as CriteriaDSL;
      
      if (!criteria || !criteria.root) {
        return null; // Let required validator handle this
      }
      
      const conditionCount = CriteriaValidators.countConditions(criteria.root);
      
      if (conditionCount < minCount) {
        return {
          minConditions: {
            message: `At least ${minCount} condition${minCount > 1 ? 's' : ''} required`,
            code: 'MIN_CONDITIONS',
            requiredCount: minCount,
            actualCount: conditionCount
          }
        };
      }
      
      return null;
    };
  }

  /**
   * Validator to check maximum number of conditions
   */
  static maxConditions(maxCount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const criteria = control.value as CriteriaDSL;
      
      if (!criteria || !criteria.root) {
        return null;
      }
      
      const conditionCount = CriteriaValidators.countConditions(criteria.root);
      
      if (conditionCount > maxCount) {
        return {
          maxConditions: {
            message: `Maximum ${maxCount} condition${maxCount > 1 ? 's' : ''} allowed`,
            code: 'MAX_CONDITIONS',
            maxCount: maxCount,
            actualCount: conditionCount
          }
        };
      }
      
      return null;
    };
  }

  /**
   * Validator to check maximum nesting depth
   */
  static maxDepth(maxDepth: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const criteria = control.value as CriteriaDSL;
      
      if (!criteria || !criteria.root) {
        return null;
      }
      
      const actualDepth = CriteriaValidators.calculateDepth(criteria.root);
      
      if (actualDepth > maxDepth) {
        return {
          maxDepth: {
            message: `Maximum nesting depth of ${maxDepth} exceeded`,
            code: 'MAX_DEPTH_EXCEEDED',
            maxDepth: maxDepth,
            actualDepth: actualDepth
          }
        };
      }
      
      return null;
    };
  }

  /**
   * Validator to ensure all conditions are complete
   */
  static completeConditions(control: AbstractControl): ValidationErrors | null {
    const criteria = control.value as CriteriaDSL;
    
    if (!criteria || !criteria.root) {
      return null;
    }
    
    const incompleteConditions = CriteriaValidators.findIncompleteConditions(criteria.root);
    
    if (incompleteConditions.length > 0) {
      return {
        incompleteConditions: {
          message: `${incompleteConditions.length} incomplete condition${incompleteConditions.length > 1 ? 's' : ''} found`,
          code: 'INCOMPLETE_CONDITIONS',
          incompleteConditions: incompleteConditions
        }
      };
    }
    
    return null;
  }

  /**
   * Validator to ensure valid field references
   */
  static validFieldReferences(availableFields: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const criteria = control.value as CriteriaDSL;
      
      if (!criteria || !criteria.root) {
        return null;
      }
      
      const invalidFields = CriteriaValidators.findInvalidFieldReferences(criteria.root, availableFields);
      
      if (invalidFields.length > 0) {
        return {
          invalidFieldReferences: {
            message: `Invalid field reference${invalidFields.length > 1 ? 's' : ''}: ${invalidFields.join(', ')}`,
            code: 'INVALID_FIELD_REFERENCES',
            invalidFields: invalidFields
          }
        };
      }
      
      return null;
    };
  }

  /**
   * Validator to ensure valid function references
   */
  static validFunctionReferences(availableFunctions: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const criteria = control.value as CriteriaDSL;
      
      if (!criteria || !criteria.root) {
        return null;
      }
      
      const invalidFunctions = CriteriaValidators.findInvalidFunctionReferences(criteria.root, availableFunctions);
      
      if (invalidFunctions.length > 0) {
        return {
          invalidFunctionReferences: {
            message: `Invalid function reference${invalidFunctions.length > 1 ? 's' : ''}: ${invalidFunctions.join(', ')}`,
            code: 'INVALID_FUNCTION_REFERENCES',
            invalidFunctions: invalidFunctions
          }
        };
      }
      
      return null;
    };
  }

  /**
   * Composite validator that combines multiple criteria validators
   */
  static criteriaValidator(options: {
    required?: boolean;
    minConditions?: number;
    maxConditions?: number;
    maxDepth?: number;
    completeConditions?: boolean;
    availableFields?: string[];
    availableFunctions?: string[];
  } = {}): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const validators: ValidatorFn[] = [];
      
      if (options.required) {
        validators.push(CriteriaValidators.required);
      }
      
      if (options.minConditions !== undefined) {
        validators.push(CriteriaValidators.minConditions(options.minConditions));
      }
      
      if (options.maxConditions !== undefined) {
        validators.push(CriteriaValidators.maxConditions(options.maxConditions));
      }
      
      if (options.maxDepth !== undefined) {
        validators.push(CriteriaValidators.maxDepth(options.maxDepth));
      }
      
      if (options.completeConditions) {
        validators.push(CriteriaValidators.completeConditions);
      }
      
      if (options.availableFields) {
        validators.push(CriteriaValidators.validFieldReferences(options.availableFields));
      }
      
      if (options.availableFunctions) {
        validators.push(CriteriaValidators.validFunctionReferences(options.availableFunctions));
      }
      
      // Run all validators and combine errors
      const errors: ValidationErrors = {};
      
      for (const validator of validators) {
        const result = validator(control);
        if (result) {
          Object.assign(errors, result);
        }
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Helper methods

  /**
   * Count total number of conditions in a group
   */
  private static countConditions(group: Group): number {
    let count = 0;
    
    for (const child of group.children) {
      if ('operator' in child && child.operator) {
        // It's a group
        count += CriteriaValidators.countConditions(child as Group);
      } else {
        // It's a condition
        count += 1;
      }
    }
    
    return count;
  }

  /**
   * Calculate maximum nesting depth
   */
  private static calculateDepth(group: Group, currentDepth: number = 0): number {
    let maxDepth = currentDepth;
    
    for (const child of group.children) {
      if ('operator' in child && child.operator) {
        // It's a group
        const childDepth = CriteriaValidators.calculateDepth(child as Group, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    
    return maxDepth;
  }

  /**
   * Find incomplete conditions
   */
  private static findIncompleteConditions(group: Group, path: string = 'root'): string[] {
    const incomplete: string[] = [];
    
    group.children.forEach((child, index) => {
      const childPath = `${path}.children[${index}]`;
      
      if ('operator' in child && child.operator) {
        // It's a group
        incomplete.push(...CriteriaValidators.findIncompleteConditions(child as Group, childPath));
      } else {
        // It's a condition
        const condition = child as Condition;
        
        if (!condition.left || !condition.operator) {
          incomplete.push(childPath);
        } else if (!CriteriaValidators.isUnaryOperator(condition.operator) && !condition.right) {
          incomplete.push(childPath);
        }
      }
    });
    
    return incomplete;
  }

  /**
   * Find invalid field references
   */
  private static findInvalidFieldReferences(group: Group, availableFields: string[]): string[] {
    const invalid: string[] = [];
    
    for (const child of group.children) {
      if ('operator' in child && child.operator) {
        // It's a group
        invalid.push(...CriteriaValidators.findInvalidFieldReferences(child as Group, availableFields));
      } else {
        // It's a condition
        const condition = child as Condition;
        
        // Check left operand
        if (condition.left && condition.left.type === 'field' && !availableFields.includes(condition.left.fieldId)) {
          invalid.push(condition.left.fieldId);
        }
        
        // Check right operand
        if (condition.right && condition.right.type === 'field' && !availableFields.includes(condition.right.fieldId)) {
          invalid.push(condition.right.fieldId);
        }
      }
    }
    
    return [...new Set(invalid)]; // Remove duplicates
  }

  /**
   * Find invalid function references
   */
  private static findInvalidFunctionReferences(group: Group, availableFunctions: string[]): string[] {
    const invalid: string[] = [];
    
    for (const child of group.children) {
      if ('operator' in child && child.operator) {
        // It's a group
        invalid.push(...CriteriaValidators.findInvalidFunctionReferences(child as Group, availableFunctions));
      } else {
        // It's a condition
        const condition = child as Condition;
        
        // Check left operand
        if (condition.left && condition.left.type === 'function' && !availableFunctions.includes(condition.left.functionId)) {
          invalid.push(condition.left.functionId);
        }
        
        // Check right operand
        if (condition.right && condition.right.type === 'function' && !availableFunctions.includes(condition.right.functionId)) {
          invalid.push(condition.right.functionId);
        }
      }
    }
    
    return [...new Set(invalid)]; // Remove duplicates
  }

  /**
   * Check if an operator is unary
   */
  private static isUnaryOperator(operator: string): boolean {
    return ['IS NULL', 'IS NOT NULL'].includes(operator);
  }
}