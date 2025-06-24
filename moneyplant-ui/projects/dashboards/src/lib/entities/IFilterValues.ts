/**
 * Interface representing filter values with dynamic properties
 */
export interface IFilterValues {
  /** Data accessor key for the filter value */
  accessor: string;
  
  /** Additional dynamic properties for filter values */
  [key: string]: string;
}
