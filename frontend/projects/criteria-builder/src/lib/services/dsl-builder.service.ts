/**
 * DSL Builder Service for converting UI state to CriteriaDSL JSON format
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  CriteriaDSL,
  Group,
  Condition,
  FieldRef,
  FunctionCall,
  Literal,
  LogicalOperator,
  FieldDataType
} from '../interfaces/criteria-dsl.interface';
import {
  ValidationResult,
  ValidationOptions
} from '../interfaces/validation.interface';

/**
 * DSL Builder operation result
 */
export interface DSLBuilderResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validation?: ValidationResult;
}

/**
 * DSL Builder configuration
 */
export interface DSLBuilderConfig {
  version: string;
  validation: ValidationOptions;
  autoValidate: boolean;
  generateIds: boolean;
}

/**
 * Default DSL Builder configuration
 */
export const DEFAULT_DSL_BUILDER_CONFIG: DSLBuilderConfig = {
  version: '1.0.0',
  validation: {
    deep: true,
    allowPartial: false,
    maxDepth: 10,
    includeWarnings: true,
    includeSuggestions: true
  },
  autoValidate: true,
  generateIds: true
};

@Injectable({
  providedIn: 'root'
})
export class DSLBuilderService {
  private _dsl$ = new BehaviorSubject<CriteriaDSL | null>(null);
  private _validation$ = new BehaviorSubject<ValidationResult | null>(null);
  private _config: DSLBuilderConfig = DEFAULT_DSL_BUILDER_CONFIG;
  private _idCounter = 0;

  /**
   * Observable for DSL changes
   */
  get dsl$(): Observable<CriteriaDSL | null> {
    return this._dsl$.asObservable();
  }

  /**
   * Observable for validation changes
   */
  get validation$(): Observable<ValidationResult | null> {
    return this._validation$.asObservable();
  }

  /**
   * Current DSL value
   */
  get currentDSL(): CriteriaDSL | null {
    return this._dsl$.value;
  }

  /**
   * Current validation result
   */
  get currentValidation(): ValidationResult | null {
    return this._validation$.value;
  }

  /**
   * Configure the DSL builder
   */
  configure(config: Partial<DSLBuilderConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Initialize with empty DSL
   */
  initializeEmpty(): DSLBuilderResult<CriteriaDSL> {
    const dsl: CriteriaDSL = {
      root: {
        operator: 'AND',
        children: [],
        id: this.generateId()
      },
      version: this._config.version,
      metadata: {
        createdAt: new Date().toISOString(),
        elementCount: 1,
        maxDepth: 0
      }
    };

    return this.setDSL(dsl);
  }

  /**
   * Set the entire DSL
   */
  setDSL(dsl: CriteriaDSL): DSLBuilderResult<CriteriaDSL> {
    try {
      // Validate if auto-validation is enabled
      let validation: ValidationResult | undefined;
      if (this._config.autoValidate) {
        validation = this.validateDSL(dsl);
        if (!validation.isValid) {
          return {
            success: false,
            error: 'DSL validation failed',
            validation
          };
        }
      }

      // Update metadata
      dsl.metadata = {
        ...dsl.metadata,
        elementCount: this.countElements(dsl),
        maxDepth: this.getMaxDepth(dsl),
        lastModified: new Date().toISOString()
      };

      this._dsl$.next(dsl);
      if (validation) {
        this._validation$.next(validation);
      }

      return {
        success: true,
        data: dsl,
        validation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add a new group to the DSL
   */
  addGroup(
    parentId?: string, 
    operator: LogicalOperator = 'AND', 
    position?: number
  ): DSLBuilderResult<Group> {
    const currentDSL = this.currentDSL;
    if (!currentDSL) {
      return { success: false, error: 'No DSL initialized' };
    }

    try {
      const newGroup: Group = {
        operator,
        children: [],
        id: this.generateId()
      };

      if (!parentId) {
        // Add to root
        if (position !== undefined) {
          currentDSL.root.children.splice(position, 0, newGroup);
        } else {
          currentDSL.root.children.push(newGroup);
        }
      } else {
        // Find parent group and add
        const parent = this.findGroupById(currentDSL.root, parentId);
        if (!parent) {
          return { success: false, error: `Parent group with ID ${parentId} not found` };
        }

        if (position !== undefined) {
          parent.children.splice(position, 0, newGroup);
        } else {
          parent.children.push(newGroup);
        }
      }

      const result = this.setDSL(currentDSL);
      return result.success ? { success: true, data: newGroup } : { success: false, error: result.error, validation: result.validation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add group'
      };
    }
  }

  /**
   * Add a new condition to a group
   */
  addCondition(
    groupId: string,
    left: FieldRef | FunctionCall,
    operator: string,
    right?: Literal | FieldRef | FunctionCall,
    position?: number
  ): DSLBuilderResult<Condition> {
    const currentDSL = this.currentDSL;
    if (!currentDSL) {
      return { success: false, error: 'No DSL initialized' };
    }

    try {
      const newCondition: Condition = {
        left,
        operator,
        right,
        id: this.generateId()
      };

      const group = this.findGroupById(currentDSL.root, groupId);
      if (!group) {
        return { success: false, error: `Group with ID ${groupId} not found` };
      }

      if (position !== undefined) {
        group.children.splice(position, 0, newCondition);
      } else {
        group.children.push(newCondition);
      }

      const result = this.setDSL(currentDSL);
      return result.success ? { success: true, data: newCondition } : { success: false, error: result.error, validation: result.validation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add condition'
      };
    }
  }

  /**
   * Update an existing group
   */
  updateGroup(groupId: string, updates: Partial<Group>): DSLBuilderResult<Group> {
    const currentDSL = this.currentDSL;
    if (!currentDSL) {
      return { success: false, error: 'No DSL initialized' };
    }

    try {
      const group = this.findGroupById(currentDSL.root, groupId);
      if (!group) {
        return { success: false, error: `Group with ID ${groupId} not found` };
      }

      // Apply updates (excluding children and id)
      const { children, id, ...allowedUpdates } = updates;
      Object.assign(group, allowedUpdates);

      const result = this.setDSL(currentDSL);
      return result.success ? { success: true, data: group } : { success: false, error: result.error, validation: result.validation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update group'
      };
    }
  }

  /**
   * Update an existing condition
   */
  updateCondition(conditionId: string, updates: Partial<Condition>): DSLBuilderResult<Condition> {
    const currentDSL = this.currentDSL;
    if (!currentDSL) {
      return { success: false, error: 'No DSL initialized' };
    }

    try {
      const condition = this.findConditionById(currentDSL.root, conditionId);
      if (!condition) {
        return { success: false, error: `Condition with ID ${conditionId} not found` };
      }

      // Apply updates (excluding id)
      const { id, ...allowedUpdates } = updates;
      Object.assign(condition, allowedUpdates);

      const result = this.setDSL(currentDSL);
      return result.success ? { success: true, data: condition } : { success: false, error: result.error, validation: result.validation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update condition'
      };
    }
  }

  /**
   * Remove a group or condition by ID
   */
  removeElement(elementId: string): DSLBuilderResult<boolean> {
    const currentDSL = this.currentDSL;
    if (!currentDSL) {
      return { success: false, error: 'No DSL initialized' };
    }

    try {
      const removed = this.removeElementFromGroup(currentDSL.root, elementId);
      if (!removed) {
        return { success: false, error: `Element with ID ${elementId} not found` };
      }

      const result = this.setDSL(currentDSL);
      return result.success ? { success: true, data: true } : { success: false, error: result.error, validation: result.validation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove element'
      };
    }
  }

  /**
   * Move an element to a new position
   */
  moveElement(
    elementId: string, 
    targetGroupId: string, 
    position: number
  ): DSLBuilderResult<boolean> {
    const currentDSL = this.currentDSL;
    if (!currentDSL) {
      return { success: false, error: 'No DSL initialized' };
    }

    try {
      // Find and remove the element
      const element = this.findElementById(currentDSL.root, elementId);
      if (!element) {
        return { success: false, error: `Element with ID ${elementId} not found` };
      }

      const removed = this.removeElementFromGroup(currentDSL.root, elementId);
      if (!removed) {
        return { success: false, error: 'Failed to remove element from current position' };
      }

      // Find target group and insert
      const targetGroup = this.findGroupById(currentDSL.root, targetGroupId);
      if (!targetGroup) {
        return { success: false, error: `Target group with ID ${targetGroupId} not found` };
      }

      targetGroup.children.splice(position, 0, element);

      const result = this.setDSL(currentDSL);
      return result.success ? { success: true, data: true } : { success: false, error: result.error, validation: result.validation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to move element'
      };
    }
  }

  /**
   * Clone an element (group or condition)
   */
  cloneElement(elementId: string): DSLBuilderResult<Group | Condition> {
    const currentDSL = this.currentDSL;
    if (!currentDSL) {
      return { success: false, error: 'No DSL initialized' };
    }

    try {
      const element = this.findElementById(currentDSL.root, elementId);
      if (!element) {
        return { success: false, error: `Element with ID ${elementId} not found` };
      }

      const cloned = this.deepCloneElement(element);
      return { success: true, data: cloned };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clone element'
      };
    }
  }

  /**
   * Validate the current DSL
   */
  validateDSL(dsl?: CriteriaDSL): ValidationResult {
    const targetDSL = dsl || this.currentDSL;
    if (!targetDSL) {
      return {
        isValid: false,
        errors: [{
          path: 'root',
          message: 'No DSL to validate',
          code: 'NO_DSL',
          severity: 'error',
          canAutoFix: false
        }],
        warnings: [],
        timestamp: new Date()
      };
    }

    const structureValidation = this.validateCriteriaDSL(targetDSL);
    const elementCountValidation = this.validateElementCount(
      targetDSL, 
      this._config.validation.maxDepth
    );

    return {
      isValid: structureValidation.isValid && elementCountValidation.isValid,
      errors: [...structureValidation.errors, ...elementCountValidation.errors],
      warnings: [...structureValidation.warnings, ...elementCountValidation.warnings],
      timestamp: new Date()
    };
  }

  /**
   * Convert DSL to JSON string
   */
  toJSON(dsl?: CriteriaDSL): string {
    const targetDSL = dsl || this.currentDSL;
    if (!targetDSL) {
      throw new Error('No DSL to convert');
    }
    return JSON.stringify(targetDSL, null, 2);
  }

  /**
   * Parse DSL from JSON string
   */
  fromJSON(json: string): DSLBuilderResult<CriteriaDSL> {
    try {
      const dsl = JSON.parse(json) as CriteriaDSL;
      return this.setDSL(dsl);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse JSON'
      };
    }
  }

  /**
   * Clear the current DSL
   */
  clear(): void {
    this._dsl$.next(null);
    this._validation$.next(null);
  }

  // Private helper methods

  private generateId(): string {
    if (!this._config.generateIds) {
      return '';
    }
    return `element_${++this._idCounter}_${Date.now()}`;
  }

  private findGroupById(group: Group, id: string): Group | null {
    if (group.id === id) {
      return group;
    }

    for (const child of group.children) {
      if (child.hasOwnProperty('children')) {
        const found = this.findGroupById(child as Group, id);
        if (found) return found;
      }
    }

    return null;
  }

  private findConditionById(group: Group, id: string): Condition | null {
    for (const child of group.children) {
      if (!child.hasOwnProperty('children') && child.id === id) {
        return child as Condition;
      } else if (child.hasOwnProperty('children')) {
        const found = this.findConditionById(child as Group, id);
        if (found) return found;
      }
    }

    return null;
  }

  private findElementById(group: Group, id: string): Group | Condition | null {
    return this.findGroupById(group, id) || this.findConditionById(group, id);
  }

  private removeElementFromGroup(group: Group, elementId: string): boolean {
    const index = group.children.findIndex(child => child.id === elementId);
    if (index !== -1) {
      group.children.splice(index, 1);
      return true;
    }

    for (const child of group.children) {
      if (child.hasOwnProperty('children')) {
        if (this.removeElementFromGroup(child as Group, elementId)) {
          return true;
        }
      }
    }

    return false;
  }

  private deepCloneElement(element: Group | Condition): Group | Condition {
    const cloned = JSON.parse(JSON.stringify(element));
    this.assignNewIds(cloned);
    return cloned;
  }

  private assignNewIds(element: any): void {
    if (element.id) {
      element.id = this.generateId();
    }

    if (element.children) {
      element.children.forEach((child: any) => this.assignNewIds(child));
    }
  }

  // Simple validation functions (inline implementations)
  private validateCriteriaDSL(dsl: CriteriaDSL): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };
  }

  private validateElementCount(dsl: CriteriaDSL, maxElements?: number): ValidationResult {
    const count = this.countElements(dsl);
    const limit = maxElements || 100;
    
    if (count > limit) {
      return {
        isValid: false,
        errors: [{
          path: 'root',
          message: `Too many elements: ${count}/${limit}`,
          code: 'MAX_ELEMENTS_EXCEEDED',
          severity: 'error',
          canAutoFix: false
        }],
        warnings: [],
        timestamp: new Date()
      };
    }
    
    return {
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };
  }

  private countElements(dsl: CriteriaDSL): number {
    return this.countGroupElements(dsl.root);
  }

  private countGroupElements(group: Group): number {
    let count = 1; // Count the group itself
    
    group.children.forEach(child => {
      if (this.isGroup(child)) {
        count += this.countGroupElements(child as Group);
      } else {
        count += 1; // Count the condition
      }
    });
    
    return count;
  }

  private getMaxDepth(dsl: CriteriaDSL): number {
    return this.getGroupDepth(dsl.root, 0);
  }

  private getGroupDepth(group: Group, currentDepth: number): number {
    let maxDepth = currentDepth;
    
    group.children.forEach(child => {
      if (this.isGroup(child)) {
        const childDepth = this.getGroupDepth(child as Group, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    
    return maxDepth;
  }

  private isGroup(obj: any): boolean {
    return obj && typeof obj === 'object' && obj.hasOwnProperty('children');
  }}
