/**
 * Core interfaces and types for QueryBuilder component
 * Based on Angular-QueryBuilder implementation pattern
 */

import { Field } from './field.model';
import { Option } from './option.model';
import { Rule } from './rule.model';
import { RuleSet } from './ruleset.model';

/**
 * Main QueryBuilder configuration interface matching Angular-QueryBuilder pattern
 */
export interface QueryBuilderConfig {
  fields: Field[];
  allowEmptyRulesets?: boolean;
  allowRuleset?: boolean;
  getOperators?: (fieldName: string, field: Field) => string[];
  getInputType?: (field: Field, operator: string) => string;
  getOptions?: (field: Field) => Option[];
  addRuleSet?: (parent: RuleSet) => void;
  addRule?: (parent: RuleSet) => void;
  removeRuleSet?: (ruleset: RuleSet, parent: RuleSet) => void;
  removeRule?: (rule: Rule, parent: RuleSet) => void;
}