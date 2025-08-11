import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QueryRule, QueryRuleSet, QueryField, QueryBuilderConfig } from '../interfaces/query.interface';

@Injectable({
  providedIn: 'root'
})
export class QueryBuilderService {
  private defaultOperators = {
    string: ['=', '!=', 'contains', 'not contains', 'starts with', 'ends with', 'is empty', 'is not empty'],
    number: ['=', '!=', '>', '>=', '<', '<=', 'between', 'not between', 'is empty', 'is not empty'],
    date: ['=', '!=', '>', '>=', '<', '<=', 'between', 'not between', 'is empty', 'is not empty'],
    time: ['=', '!=', '>', '>=', '<', '<=', 'between', 'not between', 'is empty', 'is not empty'],
    boolean: ['=', '!=', 'is empty', 'is not empty'],
    category: ['=', '!=', 'in', 'not in', 'is empty', 'is not empty']
  };

  private queryStateSubject = new BehaviorSubject<QueryRuleSet>({
    condition: 'and',
    rules: []
  });

  public queryState$: Observable<QueryRuleSet> = this.queryStateSubject.asObservable();

  constructor() {}

  getOperators(fieldType: string): string[] {
    return this.defaultOperators[fieldType as keyof typeof this.defaultOperators] || [];
  }

  getFieldByName(fields: QueryField[], fieldName: string): QueryField | undefined {
    return fields.find(field => field.value === fieldName);
  }

  addRule(ruleset: QueryRuleSet): QueryRuleSet {
    const newRule: QueryRule = {
      field: '',
      operator: '',
      value: null
    };
    
    const updatedRuleset = { ...ruleset };
    updatedRuleset.rules = [...ruleset.rules, newRule];
    
    this.queryStateSubject.next(updatedRuleset);
    return updatedRuleset;
  }

  addRuleSet(ruleset: QueryRuleSet): QueryRuleSet {
    const newRuleSet: QueryRuleSet = {
      condition: 'and',
      rules: []
    };
    
    const updatedRuleset = { ...ruleset };
    updatedRuleset.rules = [...ruleset.rules, newRuleSet];
    
    this.queryStateSubject.next(updatedRuleset);
    return updatedRuleset;
  }

  removeRule(ruleset: QueryRuleSet, ruleIndex: number): QueryRuleSet {
    const updatedRuleset = { ...ruleset };
    updatedRuleset.rules = ruleset.rules.filter((_, index) => index !== ruleIndex);
    
    this.queryStateSubject.next(updatedRuleset);
    return updatedRuleset;
  }

  removeRuleSet(ruleset: QueryRuleSet, ruleSetIndex: number): QueryRuleSet {
    const updatedRuleset = { ...ruleset };
    updatedRuleset.rules = ruleset.rules.filter((_, index) => index !== ruleSetIndex);
    
    this.queryStateSubject.next(updatedRuleset);
    return updatedRuleset;
  }

  updateRule(ruleset: QueryRuleSet, ruleIndex: number, updates: Partial<QueryRule>): QueryRuleSet {
    const updatedRuleset = { ...ruleset };
    const rule = updatedRuleset.rules[ruleIndex] as QueryRule;
    
    if (rule) {
      updatedRuleset.rules[ruleIndex] = { ...rule, ...updates };
    }
    
    this.queryStateSubject.next(updatedRuleset);
    return updatedRuleset;
  }

  toggleCollapse(ruleset: QueryRuleSet, ruleSetIndex: number): QueryRuleSet {
    const updatedRuleset = { ...ruleset };
    const ruleSet = updatedRuleset.rules[ruleSetIndex] as QueryRuleSet;
    
    if (ruleSet) {
      ruleSet.collapsed = !ruleSet.collapsed;
    }
    
    this.queryStateSubject.next(updatedRuleset);
    return updatedRuleset;
  }

  getQueryString(ruleset: QueryRuleSet): string {
    return this.buildQueryString(ruleset);
  }

  private buildQueryString(ruleset: QueryRuleSet): string {
    if (!ruleset.rules || ruleset.rules.length === 0) {
      return '';
    }

    const conditions = ruleset.rules.map(rule => {
      if (this.isRuleSet(rule)) {
        return `(${this.buildQueryString(rule)})`;
      } else {
        return this.buildRuleString(rule as QueryRule);
      }
    });

    return conditions.join(` ${ruleset.condition.toUpperCase()} `);
  }

  private buildRuleString(rule: QueryRule): string {
    if (!rule.field || !rule.operator) {
      return '';
    }

    const value = this.formatValue(rule.value);
    return `${rule.field} ${rule.operator} ${value}`;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    
    if (typeof value === 'string') {
      return `'${value}'`;
    }
    
    if (Array.isArray(value)) {
      return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
    }
    
    return String(value);
  }

  private isRuleSet(rule: QueryRule | QueryRuleSet): rule is QueryRuleSet {
    return 'rules' in rule;
  }

  setQueryState(ruleset: QueryRuleSet): void {
    this.queryStateSubject.next(ruleset);
  }

  getCurrentState(): QueryRuleSet {
    return this.queryStateSubject.value;
  }
}
