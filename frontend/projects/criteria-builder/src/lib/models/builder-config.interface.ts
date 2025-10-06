/**
 * Configuration interface for the Criteria Builder component
 */
export interface BuilderConfig {
  allowGrouping?: boolean;
  maxDepth?: number;
  enableAdvancedFunctions?: boolean;
  autoSave?: boolean;
  locale?: string;
  theme?: 'light' | 'dark';
  compactMode?: boolean;
  showSqlPreview?: boolean;
  debounceMs?: number;
}