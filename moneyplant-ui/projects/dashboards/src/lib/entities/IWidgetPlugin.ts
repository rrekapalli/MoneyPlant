/**
 * Interface for widget plugins in the dashboard framework
 * 
 * This interface defines the contract that all widget plugins must implement
 * to be compatible with the dashboard system.
 */
export interface IWidgetPlugin {
  /**
   * Unique identifier for the widget type
   */
  type: string;
  
  /**
   * Display name for the widget type (used in UI)
   */
  displayName: string;
  
  /**
   * Description of the widget's purpose and functionality
   */
  description: string;
  
  /**
   * Icon to represent this widget type in the UI
   */
  icon?: string;
  
  /**
   * Component type to be instantiated for this widget
   */
  component: any;
  
  /**
   * Default configuration for this widget type
   */
  defaultConfig: any;
  
  /**
   * Whether this widget type supports filtering
   */
  supportsFiltering?: boolean;
  
  /**
   * Whether this widget type can be a source of filter values
   */
  canBeFilterSource?: boolean;
}