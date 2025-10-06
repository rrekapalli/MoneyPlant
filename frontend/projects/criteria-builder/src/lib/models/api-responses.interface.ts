import { ValidationError, ValidationWarning } from './criteria-dsl.interface';

/**
 * API response interfaces for backend integration
 */

export interface PartialValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationSuggestion {
  type: string;
  message: string;
  action?: string;
}

export interface SqlGenerationResult {
  sql: string;
  parameters: Record<string, any>;
  generatedAt: string;
  generatedBy: string;
  dslHash: string;
}

export interface CriteriaPreview {
  valid: boolean;
  description?: string;
  estimatedResultCount?: number;
  complexity?: string;
  estimatedExecutionTime?: string;
  errors?: ValidationError[];
}