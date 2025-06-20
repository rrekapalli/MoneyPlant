export interface IState {
  accessor: string;
  column: string
  isOdataQuery: boolean
  supportsFiltering?: boolean
  filterDependencies?: string[]
}
