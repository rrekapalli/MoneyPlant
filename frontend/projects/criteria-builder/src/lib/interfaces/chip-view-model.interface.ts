/**
 * View model interface for individual chips in the criteria builder
 */
export interface ChipViewModel {
  /** Unique identifier for the chip */
  id: string;
  
  /** Type of chip determining its behavior and appearance */
  type: ChipType;
  
  /** Display text shown on the chip */
  displayText: string;
  
  /** Array of badges to display on the chip */
  badges: ChipBadge[];
  
  /** Whether the chip can be edited by clicking */
  isEditable: boolean;
  
  /** Whether the chip passes validation */
  isValid: boolean;
  
  /** Validation message if invalid */
  validationMessage?: string;
  
  /** Nesting depth level (0-based) */
  depth: number;
  
  /** ID of parent chip if nested */
  parentId?: string;
  
  /** Whether the chip is currently selected/active */
  isSelected: boolean;
  
  /** Whether the chip is in a loading state */
  isLoading: boolean;
  
  /** Additional CSS classes for styling */
  cssClasses?: string[];
  
  /** Tooltip text for the chip */
  tooltip?: string;
  
  /** Whether the chip can be deleted */
  isDeletable: boolean;
  
  /** Whether the chip can be dragged */
  isDraggable: boolean;
  
  /** Data associated with the chip */
  data?: any;
}

/**
 * Types of chips supported by the criteria builder
 */
export type ChipType = 
  | 'group'           // Group container with logical operators
  | 'field'           // Field reference
  | 'operator'        // Comparison or logical operator
  | 'value'           // Literal value
  | 'function'        // Function call
  | 'parameter'       // Function parameter placeholder
  | 'add-button';     // Add new element button

/**
 * Badge configuration for chips
 */
export interface ChipBadge {
  /** Badge text content */
  text: string;
  
  /** Badge type affecting styling */
  type: BadgeType;
  
  /** Position of the badge relative to chip */
  position: BadgePosition;
  
  /** Optional icon for the badge */
  icon?: string;
  
  /** Optional tooltip for the badge */
  tooltip?: string;
}

/**
 * Badge types with semantic meaning
 */
export type BadgeType = 
  | 'info'      // Informational badge (blue)
  | 'warning'   // Warning badge (yellow)
  | 'error'     // Error badge (red)
  | 'success'   // Success badge (green)
  | 'primary'   // Primary badge (theme color)
  | 'secondary' // Secondary badge (gray)
  | 'custom';   // Custom styling

/**
 * Badge positioning options
 */
export type BadgePosition = 
  | 'superscript'   // Top-right corner
  | 'subscript'     // Bottom-right corner
  | 'inline'        // Within the chip text
  | 'left'          // Left side of chip
  | 'right';        // Right side of chip

/**
 * Factory function type for creating chip view models
 */
export type ChipViewModelFactory = (
  type: ChipType,
  data: any,
  config?: Partial<ChipViewModel>
) => ChipViewModel;