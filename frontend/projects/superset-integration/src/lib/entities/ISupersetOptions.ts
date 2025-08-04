/**
 * Interface for Superset dashboard options
 */
export interface ISupersetOptions {
  /** The URL of the Superset dashboard */
  dashboardUrl: string;
  
  /** The guest token for authentication */
  guestToken?: string;
  
  /** The dashboard ID */
  dashboardId: string;
  
  /** Additional configuration options */
  config?: {
    /** Whether to show the dashboard header */
    showHeader?: boolean;
    
    /** Whether to show the dashboard footer */
    showFooter?: boolean;
    
    /** Custom CSS classes to apply */
    cssClasses?: string[];
    
    /** Custom height for the dashboard */
    height?: string;
    
    /** Custom width for the dashboard */
    width?: string;
  };
}