// Configuration Interfaces for Criteria Builder Library

// Import necessary types
import { EventEmitter, Observable } from '@angular/core';
import { CriteriaDSL, FieldMeta, FunctionMeta, ValidationResult, CriteriaValidationReq, CriteriaSqlReq, CriteriaPreviewReq, SqlGenerationResult, CriteriaPreview, FieldRef, Literal, FunctionCall, Group } from './criteria.models';
import { BadgeActionEvent } from './event.models';
import { Operator } from '../types/criteria.types';

// Component Configuration Interface (Angular-specific)
export interface CriteriaConfig {
  allowGrouping?: boolean;
  maxDepth?: number;
  enableAdvancedFunctions?: boolean;
  displayMode?: 'compact' | 'expanded';
  showSqlPreview?: boolean;
  enableUndo?: boolean;
  maxElements?: number;
}

// Component State Interfaces (Angular-specific)

// Badge State Interface
export interface BadgeState {
  id: string;
  type: 'field' | 'operator' | 'value' | 'function' | 'group' | 'action';
  data: FieldRef | Operator | Literal | FunctionCall | Group | any;
  isSelected?: boolean;
  isDragging?: boolean;
  isEditing?: boolean;
  isCollapsed?: boolean;
}

// Criteria Builder State Interface
export interface CriteriaBuilderState {
  dsl: CriteriaDSL | null;
  isValid: boolean;
  sqlPreview: string;
  paramCount: number;
  selectedBadgeId?: string;
  editingBadgeId?: string;
  undoStack: CriteriaDSL[];
  redoStack: CriteriaDSL[];
}

// Component Input/Output Interfaces (Standalone Architecture)

// Component Inputs (All Data from Parent)
export interface MpCriteriaBuilderInputs {
  fields: FieldMeta[];                    // Field metadata from parent service
  functions: FunctionMeta[];              // Function definitions from parent service
  validationResult?: ValidationResult;    // Validation results from parent service
  sqlPreview?: string;                   // SQL preview from parent service
  config: CriteriaConfig;                // Component configuration
  initialValue?: CriteriaDSL;            // Initial criteria value
  disabled?: boolean;                     // Disabled state
  readonly?: boolean;                    // Read-only state
}

// Component Outputs (Events for Parent)
export interface MpCriteriaBuilderOutputs {
  dslChange: EventEmitter<CriteriaDSL>;           // DSL changes
  validityChange: EventEmitter<boolean>;           // Validity changes
  validationRequest: EventEmitter<CriteriaDSL>;    // Request validation from parent
  sqlRequest: EventEmitter<CriteriaDSL>;           // Request SQL generation from parent
  badgeAction: EventEmitter<BadgeActionEvent>;    // Badge interactions
}

// Parent Service Integration Interfaces
export interface ParentApiService {
  getFields(): Observable<FieldMetaResp[]>;
  getFunctions(): Observable<FunctionMetaResp[]>;
  validateCriteria(request: CriteriaValidationReq): Observable<ValidationResult>;
  generateSql(request: CriteriaSqlReq): Observable<SqlGenerationResult>;
  previewCriteria(request: CriteriaPreviewReq): Observable<CriteriaPreview>;
}

export interface ParentStateService {
  validationResult$: Observable<ValidationResult>;
  sqlPreview$: Observable<string>;
  setValidationResult(result: ValidationResult): void;
  setSqlPreview(sql: string): void;
}

// Re-export for convenience
export type { CriteriaDSL, FieldMeta, FunctionMeta, ValidationResult };
