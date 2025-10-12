import { FieldType, Operator } from './criteria-dsl.interface';

/**
 * Field metadata interface for configuring available fields
 */
export interface FieldMeta {
  id: string;
  label: string;
  dbColumn: string;
  dataType: FieldType;
  allowedOps?: Operator[];
  suggestionsApi?: string;
  formatter?: (value: any) => string;
  parser?: (input: string) => any;
  example?: string;
  nullable?: boolean;
  category?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}

/**
 * API response interface for field metadata
 */
export interface FieldMetaResp {
  id: string;
  label: string;
  dbColumn: string;
  dataType: FieldType;
  allowedOps?: Operator[];
  category?: string;
  description?: string;
  example?: string;
}

/**
 * Operator information interface
 */
export interface OperatorInfo {
  id: string;
  label: string;
  description: string;
  requiresRightSide: boolean;
  supportedTypes: FieldType[];
}

/**
 * Value suggestion interface for field value completion
 */
export interface ValueSuggestion {
  label: string;
  value: any;
  description?: string;
}