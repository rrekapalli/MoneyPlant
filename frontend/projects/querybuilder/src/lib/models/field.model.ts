import { Option } from './option.model';

/**
 * Field interface matching Angular-QueryBuilder pattern
 */
export interface Field {
  name: string;
  type: string;
  label?: string;
  options?: Option[];
  operators?: string[];
  defaultValue?: any;
  defaultOperator?: string;
  nullable?: boolean;
  entity?: string;
}

/**
 * Field type constants
 */
export const FIELD_TYPES = {
  string: 'string',
  number: 'number',
  date: 'date',
  boolean: 'boolean',
  category: 'category',
  multiselect: 'multiselect'
} as const;

/**
 * Utility type for field types
 */
export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];