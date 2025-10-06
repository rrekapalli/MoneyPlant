import { FieldType } from './criteria-dsl.interface';

/**
 * Function metadata interface for configuring available functions
 */
export interface FunctionMeta {
  id: string;
  label: string;
  returnType: FieldType;
  params: FunctionParam[];
  sqlTemplate?: string;
  description?: string;
  category?: string;
  examples?: string[];
  deprecated?: boolean;
  version?: string;
}

/**
 * Function parameter definition
 */
export interface FunctionParam {
  name: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * API response interface for function metadata
 */
export interface FunctionMetaResp {
  id: string;
  label: string;
  returnType: FieldType;
  category: string;
  description: string;
  examples: string[];
  paramCount: number;
}

/**
 * Function signature with detailed parameter information
 */
export interface FunctionSignature {
  id: string;
  label: string;
  description: string;
  returnType: FieldType;
  parameters: ParameterSignature[];
  examples: string[];
  category: string;
  sqlTemplate?: string;
}

/**
 * Parameter signature from API
 */
export interface ParameterSignature {
  name: string;
  type: FieldType;
  order: number;
  required: boolean;
  defaultValue?: string;
  validationRules?: Record<string, any>;
  helpText?: string;
}