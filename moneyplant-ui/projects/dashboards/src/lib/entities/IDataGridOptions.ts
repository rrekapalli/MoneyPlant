/**
 * Interface for data grid widget options
 */
export interface IDataGridOptions {
  /** Columns to display in the grid */
  columns?: string[];
  
  /** Initial sort field */
  sortField?: string;
  
  /** Initial sort order (1 for ascending, -1 for descending) */
  sortOrder?: number;
  
  /** Whether to enable pagination */
  pagination?: boolean;
  
  /** Default rows per page */
  rows?: number;
  
  /** Available rows per page options */
  rowsPerPageOptions?: number[];
  
  /** Whether to enable global filtering */
  globalFilter?: boolean;
  
  /** Whether to enable column filtering */
  columnFilters?: boolean;
  
  /** Whether to enable column resizing */
  resizableColumns?: boolean;
  
  /** Whether to enable column reordering */
  reorderableColumns?: boolean;
  
  /** Whether to enable row selection */
  selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
  
  /** Whether to enable responsive mode */
  responsive?: boolean;
  
  /** Custom style class for the table */
  styleClass?: string;
  
  /** Data accessor function or path */
  accessor?: string;
}