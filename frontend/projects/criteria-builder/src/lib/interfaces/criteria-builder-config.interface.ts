/**
 * Configuration interface for the criteria builder component
 */
export interface CriteriaBuilderConfig {
  /** Maximum nesting depth for group chips (default: 10) */
  maxDepth: number;
  
  /** Maximum total number of elements allowed (default: 100) */
  maxElements: number;
  
  /** Whether to display in compact mode (default: false) */
  compactMode: boolean;
  
  /** Enable drag and drop functionality (default: true) */
  enableDragDrop: boolean;
  
  /** Show SQL preview panel (default: true) */
  showSqlPreview: boolean;
  
  /** Validation mode for real-time feedback */
  validationMode: 'realtime' | 'onchange' | 'manual';
  
  /** Enable undo functionality for delete operations (default: true) */
  enableUndo: boolean;
  
  /** Undo timeout in milliseconds (default: 5000) */
  undoTimeout: number;
  
  /** API endpoints configuration */
  apiEndpoints?: {
    fields?: string;
    functions?: string;
    operators?: string;
    validate?: string;
    generateSql?: string;
    preview?: string;
  };
}

/**
 * Default configuration for the criteria builder
 */
export const DEFAULT_CRITERIA_BUILDER_CONFIG: CriteriaBuilderConfig = {
  maxDepth: 10,
  maxElements: 100,
  compactMode: false,
  enableDragDrop: true,
  showSqlPreview: true,
  validationMode: 'realtime',
  enableUndo: true,
  undoTimeout: 5000,
  apiEndpoints: {
    fields: '/api/screeners/fields',
    functions: '/api/screeners/functions',
    operators: '/api/screeners/fields/{fieldId}/operators',
    validate: '/api/screeners/validate-partial-criteria',
    generateSql: '/api/screeners/generate-sql',
    preview: '/api/screeners/preview-criteria'
  }
};