export interface QueryField {
  name: string;
  value: string;
  type: 'string' | 'number' | 'date' | 'time' | 'boolean' | 'category';
  operators?: string[];
  options?: QueryOption[];
  getOperators?: () => string[];
  getOptions?: () => QueryOption[];
}

export interface QueryOption {
  name: string;
  value: any;
}

export interface QueryRule {
  field: string;
  operator: string;
  value: any;
  entity?: string;
}

export interface QueryRuleSet {
  condition: 'and' | 'or';
  rules: (QueryRule | QueryRuleSet)[];
  collapsed?: boolean;
}

export interface QueryBuilderConfig {
  fields: QueryField[];
  operators?: { [key: string]: string[] };
  defaultCondition?: 'and' | 'or';
  allowEmpty?: boolean;
  allowCollapse?: boolean;
  classNames?: { [key: string]: string };
}

export interface QueryBuilderState {
  ruleset: QueryRuleSet;
  config: QueryBuilderConfig;
}
