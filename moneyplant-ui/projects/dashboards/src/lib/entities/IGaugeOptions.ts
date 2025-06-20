/**
 * Interface for gauge chart widget options
 */
export interface IGaugeOptions {
  /** Value for the gauge */
  value?: number;
  
  /** Minimum value for the gauge */
  min?: number;
  
  /** Maximum value for the gauge */
  max?: number;
  
  /** Title of the gauge */
  title?: string;
  
  /** Detail text format */
  detailFormat?: string;
  
  /** Whether to show the pointer */
  showPointer?: boolean;
  
  /** Whether to show progress */
  showProgress?: boolean;
  
  /** Whether to show the axis tick */
  showAxisTick?: boolean;
  
  /** Whether to show the axis label */
  showAxisLabel?: boolean;
  
  /** Color ranges for the gauge */
  ranges?: Array<{
    /** Minimum value for this range */
    min: number;
    /** Maximum value for this range */
    max: number;
    /** Color for this range */
    color: string;
  }>;
  
  /** Color of the gauge */
  color?: string | string[];
  
  /** Whether to enable animation */
  animation?: boolean;
  
  /** Whether to enable tooltip */
  tooltip?: boolean;
  
  /** Data accessor function or path */
  accessor?: string;
}