import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria, ScreenerRule } from '../../../services/entities/screener.entities';
// QueryBuilder imports
import { 
  QueryBuilderComponent, 
  QueryBuilderConfig, 
  RuleSet, 
  Rule, 
  STOCK_FIELDS
} from 'querybuilder';

@Component({
  selector: 'app-screeners-configure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    MessageModule,
    QueryBuilderComponent
  ],
  templateUrl: './screeners-configure.component.html',
  styleUrl: './screeners-configure.component.scss'
})
export class ScreenersConfigureComponent implements OnInit, OnChanges {
  @Input() selectedScreener: ScreenerResp | null = null;
  @Input() loading = false;
  @Input() universeOptions: any[] = [];

  // ViewChild reference for query builder component
  @ViewChild(QueryBuilderComponent) queryBuilder!: QueryBuilderComponent;

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    // Initialize query builder configuration with stock fields
    this.queryConfig = {
      fields: STOCK_FIELDS,
      allowEmptyRulesets: true,
      allowRuleset: true
    };
  }

  @Output() createScreener = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() saveScreener = new EventEmitter<ScreenerCreateReq>();

  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false,
    defaultUniverse: '',
    criteria: undefined
  };

  // Basic Info Edit State
  isEditingBasicInfo = false;
  originalBasicInfo: Partial<ScreenerCreateReq> = {};

  // Query Builder Configuration and State
  queryConfig: QueryBuilderConfig;
  currentQuery: RuleSet = { condition: 'and', rules: [] };
  queryValidationState = true;
  queryValidationErrors: string[] = [];


  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedScreener'] && changes['selectedScreener'].currentValue) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.selectedScreener) {
      this.screenerForm = {
        name: this.selectedScreener.name,
        description: this.selectedScreener.description || '',
        isPublic: this.selectedScreener.isPublic,
        defaultUniverse: this.selectedScreener.defaultUniverse || '',
        criteria: this.selectedScreener.criteria
      };
      
      // Initialize query from existing criteria
      this.currentQuery = this.convertScreenerCriteriaToQuery(this.selectedScreener.criteria);
      
      // Reset edit state
      this.isEditingBasicInfo = false;
      this.originalBasicInfo = {};
    } else {
      this.screenerForm = {
        name: '',
        description: '',
        isPublic: false,
        defaultUniverse: '',
        criteria: undefined
      };
      
      // Initialize empty query
      this.currentQuery = { condition: 'and', rules: [] };
      
      this.isEditingBasicInfo = false;
      this.originalBasicInfo = {};
    }
  }

  onCreateScreener(): void {
    this.createScreener.emit();
  }

  onClearSelection(): void {
    this.clearSelection.emit();
  }

  onSaveScreener(): void {
    if (!this.screenerForm.name.trim()) {
      return;
    }
    
    // Validate query before saving
    if (!this.isQueryValid()) {
      this.updateQueryValidationErrors();
      return;
    }
    
    // Ensure criteria is updated from current query
    this.screenerForm.criteria = this.convertQueryToScreenerCriteria(this.currentQuery);
    
    this.saveScreener.emit(this.screenerForm);
  }


  onVisibilityChange(event: any): void {
    this.screenerForm.isPublic = event.target.checked;
  }

  // Basic Info Edit Methods
  toggleBasicInfoEdit(): void {
    if (this.isEditingBasicInfo) {
      // Save changes
      if (this.hasBasicInfoChanges()) {
        this.saveBasicInfoChanges();
      }
      this.isEditingBasicInfo = false;
    } else {
      // Enter edit mode
      this.isEditingBasicInfo = true;
      this.storeOriginalBasicInfo();
    }
  }

  private storeOriginalBasicInfo(): void {
    this.originalBasicInfo = {
      name: this.screenerForm.name,
      description: this.screenerForm.description,
      defaultUniverse: this.screenerForm.defaultUniverse,
      isPublic: this.screenerForm.isPublic
    };
  }

  hasBasicInfoChanges(): boolean {
    return (
      this.screenerForm.name !== this.originalBasicInfo.name ||
      this.screenerForm.description !== this.originalBasicInfo.description ||
      this.screenerForm.defaultUniverse !== this.originalBasicInfo.defaultUniverse ||
      this.screenerForm.isPublic !== this.originalBasicInfo.isPublic
    );
  }

  private saveBasicInfoChanges(): void {
    // Emit the save event to parent component
    this.onSaveScreener();
  }

  cancelBasicInfoEdit(): void {
    // Simple approach: always discard changes and exit edit mode
    this.discardBasicInfoChanges();
  }

  private discardBasicInfoChanges(): void {
    // Restore original values
    this.screenerForm.name = this.originalBasicInfo.name || '';
    this.screenerForm.description = this.originalBasicInfo.description || '';
    this.screenerForm.defaultUniverse = this.originalBasicInfo.defaultUniverse || '';
    this.screenerForm.isPublic = this.originalBasicInfo.isPublic || false;
    
    // Exit edit mode
    this.isEditingBasicInfo = false;
    this.originalBasicInfo = {};
  }

  // Query Builder Event Handlers
  onQueryChange(query: RuleSet): void {
    this.currentQuery = query;
    // Convert query to screener criteria format and update form
    this.screenerForm.criteria = this.convertQueryToScreenerCriteria(query);
    this.cdr.detectChanges();
  }

  onQueryValidationChange(isValid: boolean): void {
    this.queryValidationState = isValid;
    this.updateQueryValidationErrors();
    this.cdr.detectChanges();
  }

  private updateQueryValidationErrors(): void {
    this.queryValidationErrors = [];
    if (!this.queryValidationState) {
      this.queryValidationErrors.push('Query contains invalid rules or incomplete conditions');
    }
  }

  // Conversion Methods between Query Format and Screener Criteria
  private convertQueryToScreenerCriteria(query: RuleSet): ScreenerCriteria | undefined {
    if (!query || !query.rules || query.rules.length === 0) {
      return undefined;
    }

    // Convert RuleSet to ScreenerCriteria format
    const criteria: ScreenerCriteria = {
      condition: query.condition as 'and' | 'or',
      rules: this.convertRuleSetToScreenerRules(query)
    };

    return criteria;
  }

  private convertRuleSetToScreenerRules(ruleSet: RuleSet): Array<ScreenerRule | ScreenerCriteria> {
    const rules: Array<ScreenerRule | ScreenerCriteria> = [];

    for (const rule of ruleSet.rules) {
      if (this.isRule(rule)) {
        // Convert individual rule
        rules.push({
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          entity: rule.entity
        });
      } else {
        // Convert nested ruleset
        rules.push({
          condition: rule.condition as 'and' | 'or',
          rules: this.convertRuleSetToScreenerRules(rule)
        });
      }
    }

    return rules;
  }

  private convertScreenerCriteriaToQuery(criteria: ScreenerCriteria | undefined): RuleSet {
    if (!criteria || !criteria.rules) {
      return { condition: 'and', rules: [] };
    }

    // Convert ScreenerCriteria to RuleSet format
    return {
      condition: criteria.condition,
      rules: this.convertScreenerRulesToQueryRules(criteria.rules)
    };
  }

  private convertScreenerRulesToQueryRules(screenerRules: Array<ScreenerRule | ScreenerCriteria>): Array<Rule | RuleSet> {
    const rules: Array<Rule | RuleSet> = [];

    for (const screenerRule of screenerRules) {
      if ('field' in screenerRule) {
        // Convert ScreenerRule to Rule
        rules.push({
          field: screenerRule.field,
          operator: screenerRule.operator,
          value: screenerRule.value,
          entity: screenerRule.entity
        });
      } else {
        // Convert ScreenerCriteria to RuleSet
        rules.push({
          condition: screenerRule.condition,
          rules: this.convertScreenerRulesToQueryRules(screenerRule.rules)
        });
      }
    }

    return rules;
  }

  private isRule(item: Rule | RuleSet): item is Rule {
    return 'field' in item && 'operator' in item;
  }

  // Validation Methods
  isQueryValid(): boolean {
    return this.queryValidationState && this.hasValidQuery();
  }

  hasValidQuery(): boolean {
    return this.currentQuery && this.currentQuery.rules && this.currentQuery.rules.length > 0;
  }

  getQueryValidationMessage(): string {
    if (!this.queryValidationState) {
      return 'Query contains invalid rules or incomplete conditions';
    }
    if (!this.hasValidQuery()) {
      return 'Please add at least one screening condition';
    }
    return '';
  }
}