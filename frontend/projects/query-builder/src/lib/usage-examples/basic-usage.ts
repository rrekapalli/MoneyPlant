import { Component, OnInit } from '@angular/core';
import { QueryBuilderComponent } from '../components/query-builder.component';
import { QueryBuilderConfig, QueryRuleSet, QueryField, QueryRule } from '../interfaces/query.interface';

@Component({
  selector: 'app-basic-usage',
  template: `
    <div class="basic-usage">
      <h3>Basic Query Builder Usage</h3>
      
      <app-query-builder
        [query]="query"
        [config]="config"
        (queryChange)="onQueryChange($event)">
      </app-query-builder>
      
      <div class="query-preview">
        <h4>Generated Query:</h4>
        <pre>{{ queryString }}</pre>
      </div>
    </div>
  `,
  imports: [QueryBuilderComponent],
  standalone: true
})
export class BasicUsageComponent implements OnInit {
  config: QueryBuilderConfig = {
    fields: [
      { name: 'Name', value: 'name', type: 'string' },
      { name: 'Age', value: 'age', type: 'number' },
      { name: 'Email', value: 'email', type: 'string' },
      { name: 'Active', value: 'active', type: 'boolean' }
    ],
    allowCollapse: true,
    defaultCondition: 'and'
  };

  query: QueryRuleSet = {
    condition: 'and',
    rules: [
      {
        field: 'name',
        operator: 'contains',
        value: ''
      }
    ]
  };

  queryString: string = '';

  ngOnInit(): void {
    this.updateQueryString();
  }

  onQueryChange(query: QueryRuleSet): void {
    this.query = query;
    this.updateQueryString();
  }

  private updateQueryString(): void {
    this.queryString = this.buildQueryString(this.query);
  }

  private buildQueryString(ruleset: QueryRuleSet): string {
    if (!ruleset.rules || ruleset.rules.length === 0) {
      return 'No rules defined';
    }

    const conditions = ruleset.rules.map((rule: QueryRule | QueryRuleSet) => {
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

    const field = this.config.fields.find((f: QueryField) => f.value === rule.field);
    const fieldName = field?.name || rule.field;
    const value = this.formatValue(rule.value);
    
    return `${fieldName} ${rule.operator} ${value}`;
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
}
