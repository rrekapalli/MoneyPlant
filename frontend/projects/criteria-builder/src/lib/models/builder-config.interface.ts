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

/**
 * Token system types for visual representation
 */
export type TokenType = 'field' | 'operator' | 'value' | 'function' | 'group' | 'logic' | 'parenthesis';

export interface QueryToken {
  id: string;
  type: TokenType;
  displayText: string;
  value: any;
  depth: number;
  position: number;
  isEditable: boolean;
  isDeletable: boolean;
  hasDropdown: boolean;
  hasDialog: boolean;
  icon?: string;
  tooltip?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface TokenStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  hoverColor: string;
  focusColor: string;
  errorColor: string;
}

export interface TokenInteraction {
  onClick: () => void;
  onDoubleClick?: () => void;
  onRightClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  isDraggable: boolean;
  isDropTarget: boolean;
}

export interface OverlayConfig {
  type: 'dropdown' | 'dialog' | 'contextmenu' | 'inline';
  position: 'below' | 'above' | 'center' | 'right' | 'left';
  width?: string;
  height?: string;
  modal?: boolean;
  closeOnClickOutside?: boolean;
  dropdownType?: string;
  options?: DropdownOption[];
  selectedValue?: any;
  selectedFunction?: any;
  valueType?: any;
  currentValue?: any;
  operator?: any;
  fieldMeta?: any;
}

export interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
  category?: string;
  description?: string;
}

export interface OverlayAction {
  type: 'select' | 'confirm' | 'cancel' | 'delete' | 'edit';
  payload: any;
  targetToken: QueryToken;
}

export type OverlayType = 'dropdown' | 'dialog' | 'contextmenu' | 'valueInput';