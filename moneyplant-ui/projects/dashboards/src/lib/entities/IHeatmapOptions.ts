/**
 * Interface for heatmap chart widget options
 */
export interface IHeatmapOptions {
  /** Data for the heatmap */
  data?: Array<[number, number, number]>;
  
  /** X-axis data */
  xAxis?: string[];
  
  /** Y-axis data */
  yAxis?: string[];
  
  /** Minimum value for the color scale */
  min?: number;
  
  /** Maximum value for the color scale */
  max?: number;
  
  /** Color range for the heatmap */
  colors?: string[];
  
  /** Whether to show the color legend */
  showLegend?: boolean;
  
  /** Position of the legend */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Whether to enable visual map */
  visualMap?: boolean;
  
  /** Whether to enable tooltip */
  tooltip?: boolean;
  
  /** Whether to enable label */
  label?: boolean;
  
  /** Whether to enable emphasis on hover */
  emphasis?: boolean;
  
  /** Data accessor function or path */
  accessor?: string;
}