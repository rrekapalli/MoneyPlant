/**
 * Visual token system interfaces for the Criteria Builder UI
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

export const TOKEN_STYLES: Record<TokenType, TokenStyle> = {
  field: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    textColor: '#1976d2',
    hoverColor: '#bbdefb',
    focusColor: '#1976d2',
    errorColor: '#f44336'
  },
  operator: {
    backgroundColor: '#f5f5f5',
    borderColor: '#9e9e9e',
    textColor: '#424242',
    hoverColor: '#eeeeee',
    focusColor: '#757575',
    errorColor: '#f44336'
  },
  value: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    textColor: '#2e7d32',
    hoverColor: '#c8e6c9',
    focusColor: '#388e3c',
    errorColor: '#f44336'
  },
  function: {
    backgroundColor: '#f3e5f5',
    borderColor: '#9c27b0',
    textColor: '#7b1fa2',
    hoverColor: '#e1bee7',
    focusColor: '#8e24aa',
    errorColor: '#f44336'
  },
  group: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    textColor: '#f57c00',
    hoverColor: '#ffe0b2',
    focusColor: '#fb8c00',
    errorColor: '#f44336'
  },
  logic: {
    backgroundColor: '#fce4ec',
    borderColor: '#e91e63',
    textColor: '#c2185b',
    hoverColor: '#f8bbd9',
    focusColor: '#d81b60',
    errorColor: '#f44336'
  },
  parenthesis: {
    backgroundColor: '#f3e5f5',
    borderColor: '#673ab7',
    textColor: '#512da8',
    hoverColor: '#d1c4e9',
    focusColor: '#5e35b1',
    errorColor: '#f44336'
  }
};

export type OverlayType = 'dropdown' | 'dialog' | 'contextmenu' | 'valueInput';

export interface OverlayConfig {
  type: OverlayType;
  position: 'below' | 'above' | 'center' | 'right' | 'left';
  width?: string;
  height?: string;
  modal?: boolean;
  closeOnClickOutside?: boolean;
  dropdownType?: 'field' | 'operator' | 'function' | 'value';
  options?: DropdownOption[];
  selectedValue?: any;
  selectedFunction?: any;
  valueType?: string;
  currentValue?: any;
  operator?: string;
  fieldMeta?: any;
}

export interface OverlayAction {
  type: 'select' | 'confirm' | 'cancel' | 'delete' | 'edit';
  payload: any;
  targetToken: QueryToken;
}

export interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
  category?: string;
  description?: string;
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