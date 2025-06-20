/**
 * Interface for dashboard templates
 */
export interface IDashboardTemplate {
  /** Unique identifier for the template */
  id: string;
  
  /** Name of the template */
  name: string;
  
  /** Description of the template */
  description?: string;
  
  /** Category or tags for the template */
  category?: string[];
  
  /** Thumbnail image URL */
  thumbnailUrl?: string;
  
  /** Whether this is a pre-built template */
  isPreBuilt?: boolean;
  
  /** User ID of the creator (for user-created templates) */
  createdBy?: string;
  
  /** Creation date */
  createdAt?: Date;
  
  /** Last modified date */
  updatedAt?: Date;
  
  /** The actual dashboard configuration */
  dashboardConfig: {
    /** Layout settings */
    layout?: any;
    
    /** Widgets in the dashboard */
    widgets: any[];
    
    /** Global dashboard settings */
    settings?: any;
  };
}