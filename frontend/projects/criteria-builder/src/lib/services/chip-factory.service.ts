/**
 * Chip Factory Service for dynamic chip creation
 */

import { Injectable } from '@angular/core';
import {
  ChipViewModel,
  ChipType,
  ChipBadge,
  BadgeType,
  BadgePosition
} from '../interfaces/chip-view-model.interface';
import {
  Group,
  Condition,
  FieldRef,
  FunctionCall,
  Literal,
  LogicalOperator,
  FieldDataType
} from '../interfaces/criteria-dsl.interface';

/**
 * Configuration for chip creation
 */
export interface ChipFactoryConfig {
  /** Whether to generate unique IDs automatically */
  generateIds: boolean;
  
  /** Default depth for new chips */
  defaultDepth: number;
  
  /** Whether chips are editable by default */
  defaultEditable: boolean;
  
  /** Whether chips are deletable by default */
  defaultDeletable: boolean;
  
  /** Whether chips are draggable by default */
  defaultDraggable: boolean;
  
  /** Custom CSS classes to apply */
  customCssClasses: string[];
}

/**
 * Default chip factory configuration
 */
export const DEFAULT_CHIP_FACTORY_CONFIG: ChipFactoryConfig = {
  generateIds: true,
  defaultDepth: 0,
  defaultEditable: true,
  defaultDeletable: true,
  defaultDraggable: true,
  customCssClasses: []
};

/**
 * Function parameter metadata for placeholder generation
 */
export interface FunctionParameterMeta {
  name: string;
  type: FieldDataType;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

/**
 * Function signature metadata
 */
export interface FunctionSignature {
  functionId: string;
  name: string;
  parameters: FunctionParameterMeta[];
  returnType: FieldDataType;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChipFactoryService {
  private _config: ChipFactoryConfig = DEFAULT_CHIP_FACTORY_CONFIG;
  private _idCounter = 0;

  /**
   * Configure the chip factory
   */
  configure(config: Partial<ChipFactoryConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Create a group chip from Group DSL object
   */
  createGroupChip(
    group: Group,
    depth: number = 0,
    parentId?: string,
    overrides?: Partial<ChipViewModel>
  ): ChipViewModel {
    const badges: ChipBadge[] = [];
    
    // Add operator badge
    badges.push({
      text: group.operator,
      type: this.getOperatorBadgeType(group.operator),
      position: 'left',
      icon: this.getOperatorIcon(group.operator),
      tooltip: `Logical operator: ${group.operator}`
    });

    // Add grouping badge if has children
    if (group.children.length > 0) {
      badges.push({
        text: '{}',
        type: 'primary',
        position: 'superscript',
        tooltip: 'Group container'
      });
    }

    // Add child count badge
    if (group.children.length > 1) {
      badges.push({
        text: group.children.length.toString(),
        type: 'info',
        position: 'subscript',
        tooltip: `${group.children.length} child elements`
      });
    }

    return this.createBaseChip({
      id: group.id || this.generateId(),
      type: 'group',
      displayText: this.getGroupDisplayText(group),
      badges,
      depth,
      parentId,
      data: group,
      tooltip: `Group with ${group.children.length} elements`,
      ...overrides
    });
  }

  /**
   * Create a condition chip from Condition DSL object
   */
  createConditionChip(
    condition: Condition,
    depth: number = 0,
    parentId?: string,
    overrides?: Partial<ChipViewModel>
  ): ChipViewModel {
    const badges: ChipBadge[] = [];
    
    // Add operator badge
    badges.push({
      text: condition.operator,
      type: 'secondary',
      position: 'inline',
      tooltip: `Comparison operator: ${condition.operator}`
    });

    return this.createBaseChip({
      id: condition.id || this.generateId(),
      type: 'operator', // Condition chips are displayed as operator type
      displayText: this.getConditionDisplayText(condition),
      badges,
      depth,
      parentId,
      data: condition,
      tooltip: this.getConditionTooltip(condition),
      ...overrides
    });
  }

  /**
   * Create a field chip from FieldRef DSL object
   */
  createFieldChip(
    fieldRef: FieldRef,
    depth: number = 0,
    parentId?: string,
    overrides?: Partial<ChipViewModel>
  ): ChipViewModel {
    const badges: ChipBadge[] = [];
    
    // Add data type badge
    badges.push({
      text: fieldRef.dataType.toUpperCase(),
      type: this.getDataTypeBadgeType(fieldRef.dataType),
      position: 'superscript',
      tooltip: `Field type: ${fieldRef.dataType}`
    });

    return this.createBaseChip({
      id: fieldRef.fieldId,
      type: 'field',
      displayText: fieldRef.name,
      badges,
      depth,
      parentId,
      data: fieldRef,
      tooltip: `Field: ${fieldRef.name} (${fieldRef.dataType})`,
      ...overrides
    });
  }

  /**
   * Create a function chip from FunctionCall DSL object
   */
  createFunctionChip(
    functionCall: FunctionCall,
    depth: number = 0,
    parentId?: string,
    overrides?: Partial<ChipViewModel>
  ): ChipViewModel {
    const badges: ChipBadge[] = [];
    
    // Add function indicator badge
    badges.push({
      text: 'f()',
      type: 'primary',
      position: 'superscript',
      tooltip: 'Function call'
    });

    // Add parameter count badge
    if (functionCall.parameters.length > 0) {
      badges.push({
        text: functionCall.parameters.length.toString(),
        type: 'info',
        position: 'subscript',
        tooltip: `${functionCall.parameters.length} parameters`
      });
    }

    // Add return type badge
    badges.push({
      text: functionCall.returnType.toUpperCase(),
      type: this.getDataTypeBadgeType(functionCall.returnType),
      position: 'right',
      tooltip: `Returns: ${functionCall.returnType}`
    });

    return this.createBaseChip({
      id: functionCall.functionId,
      type: 'function',
      displayText: functionCall.name,
      badges,
      depth,
      parentId,
      data: functionCall,
      tooltip: `Function: ${functionCall.name}`,
      ...overrides
    });
  }

  /**
   * Create a literal value chip from Literal DSL object
   */
  createValueChip(
    literal: Literal,
    depth: number = 0,
    parentId?: string,
    overrides?: Partial<ChipViewModel>
  ): ChipViewModel {
    const badges: ChipBadge[] = [];
    
    // Add data type badge
    badges.push({
      text: literal.dataType.toUpperCase(),
      type: this.getDataTypeBadgeType(literal.dataType),
      position: 'superscript',
      tooltip: `Value type: ${literal.dataType}`
    });

    return this.createBaseChip({
      id: this.generateId(),
      type: 'value',
      displayText: literal.displayValue || this.formatLiteralValue(literal),
      badges,
      depth,
      parentId,
      data: literal,
      tooltip: `Value: ${literal.value} (${literal.dataType})`,
      ...overrides
    });
  }

  /**
   * Create parameter placeholder chips for a function
   */
  createParameterPlaceholders(
    functionSignature: FunctionSignature,
    depth: number = 0,
    parentId?: string
  ): ChipViewModel[] {
    return functionSignature.parameters.map((param, index) => {
      const badges: ChipBadge[] = [];
      
      // Add parameter type badge
      badges.push({
        text: param.type.toUpperCase(),
        type: this.getDataTypeBadgeType(param.type),
        position: 'superscript',
        tooltip: `Parameter type: ${param.type}`
      });

      // Add required indicator
      if (param.required) {
        badges.push({
          text: '*',
          type: 'error',
          position: 'left',
          tooltip: 'Required parameter'
        });
      }

      return this.createBaseChip({
        id: `${parentId}_param_${index}`,
        type: 'parameter',
        displayText: param.name || `param${index + 1}`,
        badges,
        depth: depth + 1,
        parentId,
        data: param,
        tooltip: param.description || `Parameter: ${param.name}`,
        isValid: !param.required, // Optional parameters are valid by default
        validationMessage: param.required ? 'Required parameter must be configured' : undefined
      });
    });
  }

  /**
   * Create an add button chip
   */
  createAddButtonChip(
    depth: number = 0,
    parentId?: string,
    buttonText: string = 'Add Condition',
    overrides?: Partial<ChipViewModel>
  ): ChipViewModel {
    const badges: ChipBadge[] = [{
      text: '+',
      type: 'success',
      position: 'left',
      tooltip: 'Click to add new element'
    }];

    return this.createBaseChip({
      id: this.generateId(),
      type: 'add-button',
      displayText: buttonText,
      badges,
      depth,
      parentId,
      isEditable: false,
      isDeletable: false,
      isDraggable: false,
      cssClasses: ['add-button-chip'],
      tooltip: `Click to ${buttonText.toLowerCase()}`,
      ...overrides
    });
  }

  /**
   * Create chips from a complete Group DSL structure
   */
  createChipsFromGroup(
    group: Group,
    depth: number = 0,
    parentId?: string
  ): ChipViewModel[] {
    const chips: ChipViewModel[] = [];
    
    // Create the group chip itself
    const groupChip = this.createGroupChip(group, depth, parentId);
    chips.push(groupChip);

    // Create chips for all children
    group.children.forEach(child => {
      if (this.isGroup(child)) {
        chips.push(...this.createChipsFromGroup(child as Group, depth + 1, groupChip.id));
      } else {
        chips.push(this.createConditionChip(child as Condition, depth + 1, groupChip.id));
      }
    });

    // Add an "add" button after the group
    chips.push(this.createAddButtonChip(depth, parentId, 'Add Group'));

    return chips;
  }

  /**
   * Update chip validation state
   */
  updateChipValidation(
    chip: ChipViewModel,
    isValid: boolean,
    validationMessage?: string
  ): ChipViewModel {
    return {
      ...chip,
      isValid,
      validationMessage,
      badges: chip.badges.map(badge => ({
        ...badge,
        type: badge.position === 'superscript' && !isValid ? 'error' : badge.type
      }))
    };
  }

  /**
   * Clone a chip with new ID
   */
  cloneChip(chip: ChipViewModel, newParentId?: string): ChipViewModel {
    return {
      ...chip,
      id: this.generateId(),
      parentId: newParentId || chip.parentId,
      isSelected: false
    };
  }

  // Private helper methods

  private createBaseChip(config: Partial<ChipViewModel> & { id: string; type: ChipType }): ChipViewModel {
    return {
      id: config.id,
      type: config.type,
      displayText: config.displayText || '',
      badges: config.badges || [],
      isEditable: config.isEditable ?? this._config.defaultEditable,
      isValid: config.isValid ?? true,
      validationMessage: config.validationMessage,
      depth: config.depth ?? this._config.defaultDepth,
      parentId: config.parentId,
      isSelected: config.isSelected ?? false,
      isLoading: config.isLoading ?? false,
      cssClasses: [...(config.cssClasses || []), ...this._config.customCssClasses],
      tooltip: config.tooltip,
      isDeletable: config.isDeletable ?? this._config.defaultDeletable,
      isDraggable: config.isDraggable ?? this._config.defaultDraggable,
      data: config.data
    };
  }

  private generateId(): string {
    if (!this._config.generateIds) {
      return '';
    }
    return `chip_${++this._idCounter}_${Date.now()}`;
  }

  private getOperatorBadgeType(operator: LogicalOperator): BadgeType {
    switch (operator) {
      case 'AND': return 'success';
      case 'OR': return 'warning';
      case 'NOT': return 'error';
      default: return 'secondary';
    }
  }

  private getOperatorIcon(operator: LogicalOperator): string {
    switch (operator) {
      case 'AND': return 'pi pi-check';
      case 'OR': return 'pi pi-plus';
      case 'NOT': return 'pi pi-times';
      default: return 'pi pi-question';
    }
  }

  private getDataTypeBadgeType(dataType: FieldDataType): BadgeType {
    switch (dataType) {
      case 'string': return 'info';
      case 'number':
      case 'integer':
      case 'decimal': return 'primary';
      case 'boolean': return 'success';
      case 'date':
      case 'datetime':
      case 'time': return 'warning';
      case 'array':
      case 'object': return 'secondary';
      default: return 'custom';
    }
  }

  private getGroupDisplayText(group: Group): string {
    if (group.children.length === 0) {
      return 'Empty Group';
    }
    
    const childCount = group.children.length;
    const childType = group.children.length === 1 ? 'element' : 'elements';
    return `${group.operator} (${childCount} ${childType})`;
  }

  private getConditionDisplayText(condition: Condition): string {
    const leftText = this.getOperandDisplayText(condition.left);
    const rightText = condition.right ? this.getOperandDisplayText(condition.right) : '';
    
    if (rightText) {
      return `${leftText} ${condition.operator} ${rightText}`;
    } else {
      return `${leftText} ${condition.operator}`;
    }
  }

  private getOperandDisplayText(operand: FieldRef | FunctionCall | Literal): string {
    if (operand.type === 'field') {
      return (operand as FieldRef).name;
    } else if (operand.type === 'function') {
      return `${(operand as FunctionCall).name}()`;
    } else {
      return this.formatLiteralValue(operand as Literal);
    }
  }

  private getConditionTooltip(condition: Condition): string {
    const leftText = this.getOperandDisplayText(condition.left);
    const rightText = condition.right ? this.getOperandDisplayText(condition.right) : '';
    
    if (rightText) {
      return `Condition: ${leftText} ${condition.operator} ${rightText}`;
    } else {
      return `Condition: ${leftText} ${condition.operator}`;
    }
  }

  private formatLiteralValue(literal: Literal): string {
    if (literal.value === null || literal.value === undefined) {
      return 'null';
    }
    
    switch (literal.dataType) {
      case 'string':
        return `"${literal.value}"`;
      case 'date':
      case 'datetime':
      case 'time':
        return new Date(literal.value).toLocaleDateString();
      case 'array':
        return `[${Array.isArray(literal.value) ? literal.value.length : 0} items]`;
      case 'object':
        return '{object}';
      default:
        return String(literal.value);
    }
  }

  private isGroup(obj: any): boolean {
    return obj && typeof obj === 'object' && obj.hasOwnProperty('children');
  }
}