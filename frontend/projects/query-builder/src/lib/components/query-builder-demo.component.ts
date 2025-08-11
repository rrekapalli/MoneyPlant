import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryBuilderComponent } from './query-builder.component';
import { QueryBuilderConfig, QueryRuleSet, QueryField, QueryRule } from '../interfaces/query.interface';

@Component({
  selector: 'app-query-builder-demo',
  standalone: true,
  imports: [CommonModule, QueryBuilderComponent],
  template: `
    <div class="query-builder-demo">
      <h2>Query Builder Demo</h2>
      
      <div class="demo-config">
        <h3>Configuration</h3>
        <pre>{{ config | json }}</pre>
      </div>
      
      <div class="demo-query-builder">
        <h3>Query Builder</h3>
        <app-query-builder
          [query]="query"
          [config]="config"
          (queryChange)="onQueryChange($event)">
        </app-query-builder>
      </div>
      
      <div class="demo-output">
        <h3>Generated Query</h3>
        <div class="query-string">
          <strong>Query String:</strong>
          <code>{{ queryString }}</code>
        </div>
        <div class="query-json">
          <strong>Query Object:</strong>
          <pre>{{ query | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./query-builder-demo.component.scss']
})
export class QueryBuilderDemoComponent implements OnInit {
  config: QueryBuilderConfig = {
    fields: [
      { name: 'Name', value: 'name', type: 'string' },
      { name: 'Age', value: 'age', type: 'number' },
      { name: 'Email', value: 'email', type: 'string' },
      { name: 'Active', value: 'active', type: 'boolean' },
      { name: 'Category', value: 'category', type: 'category', options: [
        { name: 'Premium', value: 'premium' },
        { name: 'Standard', value: 'standard' },
        { name: 'Basic', value: 'basic' }
      ]},
      { name: 'Created Date', value: 'createdDate', type: 'date' },
      { name: 'Score', value: 'score', type: 'number' }
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
        value: 'John'
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
