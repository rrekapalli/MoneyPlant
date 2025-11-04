import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryBuilderConfig, RuleSet, Rule, LocalRuleMeta } from '../../models/query-builder.models';
import { QueryBuilderService } from '../../services/query-builder.service';
import { QueryEntityComponent } from '../query-entity/query-entity.component';

@Component({
  selector: 'lib-query-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, QueryEntityComponent],
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss']
})
export class QueryBuilderComponent implements OnInit, OnChanges {
  @Input() config!: QueryBuilderConfig;
  @Input() query: RuleSet = { condition: 'and', rules: [] };
  @Input() allowRuleset: boolean = true;
  @Input() allowEmpty: boolean = true;
  @Input() emptyMessage: string = 'A ruleset cannot be empty. Please add a rule or remove it all together.';
  @Input() classNames?: { [key: string]: string };
  @Input() operatorMap?: { [key: string]: string[] };
  @Input() parentValue?: RuleSet;
  @Input() parentAriaLevel: number = 0;

  @Output() queryChange = new EventEmitter<RuleSet>();
  @Output() validationChange = new EventEmitter<boolean>();

  private queryBuilderService = inject(QueryBuilderService);

  ngOnInit(): void {
    if (!this.query) {
      this.query = { condition: 'and', rules: [] };
    }
    this.validateQuery();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['query'] && !changes['query'].firstChange) {
      this.validateQuery();
    }
  }

  onQueryChange(query: RuleSet | Rule): void {
    // The main query builder should always work with RuleSet
    if ('condition' in query && 'rules' in query) {
      this.query = { ...query };
      this.queryChange.emit(this.query);
      this.validateQuery();
    }
  }

  private validateQuery(): void {
    const result = this.queryBuilderService.validateRuleset(this.query, this.config.fields || [], this.allowEmpty);
    this.validationChange.emit(result.valid);
  }

  getDisabledState(): boolean {
    return false;
  }

  getAriaLevel(): number {
    return this.parentAriaLevel + 1;
  }

  getClassNames(): string {
    const baseClass = 'query-builder';
    const customClasses = this.classNames ? Object.values(this.classNames).join(' ') : '';
    return `${baseClass} ${customClasses}`.trim();
  }
}