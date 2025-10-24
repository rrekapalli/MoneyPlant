/**
 * Context interface for popover configuration and state
 */
export interface PopoverContext {
  /** ID of the chip that triggered the popover */
  chipId: string;
  
  /** Type of chip that opened the popover */
  chipType: ChipType;
  
  /** Current value/state of the chip */
  currentValue: any;
  
  /** Available options for selection */
  availableOptions: PopoverOption[];
  
  /** Validation rules for the current context */
  validationRules: PopoverValidationRule[];
  
  /** Which tabs should be visible in the popover */
  visibleTabs: PopoverTab[];
  
  /** Currently active tab */
  activeTab: PopoverTab;
  
  /** Position information for the popover */
  position?: PopoverPosition;
  
  /** Whether the popover is in loading state */
  isLoading: boolean;
  
  /** Error message if any */
  error?: string;
  
  /** Additional context data */
  metadata?: Record<string, any>;
}

/**
 * Import ChipType from chip view model
 */
import { ChipType } from './chip-view-model.interface';

/**
 * Available tabs in the popover
 */
export type PopoverTab = 
  | 'fields'      // Field selection tab
  | 'operators'   // Operator selection tab
  | 'functions'   // Math functions tab
  | 'indicators'  // Technical indicators tab
  | 'values';     // Value input tab

/**
 * Option item in popover selection lists
 */
export interface PopoverOption {
  /** Unique identifier for the option */
  id: string;
  
  /** Display label for the option */
  label: string;
  
  /** Optional description or help text */
  description?: string;
  
  /** Category for grouping options */
  category?: string;
  
  /** Icon to display with the option */
  icon?: string;
  
  /** Whether the option is currently disabled */
  disabled: boolean;
  
  /** Additional data associated with the option */
  data?: any;
  
  /** Search keywords for filtering */
  keywords?: string[];
}

/**
 * Validation rule for popover inputs
 */
export interface PopoverValidationRule {
  /** Type of validation */
  type: ValidationType;
  
  /** Validation parameters */
  params?: any;
  
  /** Error message if validation fails */
  message: string;
  
  /** Whether this is a warning or error */
  severity: 'error' | 'warning' | 'info';
}

/**
 * Types of validation supported
 */
export type ValidationType = 
  | 'required'      // Field is required
  | 'pattern'       // Must match regex pattern
  | 'min'           // Minimum value
  | 'max'           // Maximum value
  | 'minLength'     // Minimum string length
  | 'maxLength'     // Maximum string length
  | 'custom';       // Custom validation function

/**
 * Popover positioning information
 */
export interface PopoverPosition {
  /** Target element for positioning */
  target: HTMLElement;
  
  /** Preferred position relative to target */
  placement: PopoverPlacement;
  
  /** Offset from the target element */
  offset?: { x: number; y: number };
  
  /** Whether to auto-adjust position if out of viewport */
  autoAdjust: boolean;
}

/**
 * Popover placement options
 */
export type PopoverPlacement = 
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

/**
 * Event emitted when popover selection changes
 */
export interface PopoverSelectionEvent {
  /** The selected option */
  option: PopoverOption;
  
  /** The tab where selection occurred */
  tab: PopoverTab;
  
  /** The chip context */
  chipId: string;
  
  /** Additional event data */
  data?: any;
}