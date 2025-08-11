import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryRule, QueryRuleSet, QueryBuilderConfig } from '../interfaces/query.interface';
import { QueryBuilderService } from '../services/query-builder.service';
import { QueryRuleComponent } from './query-rule.component';

@Component({
  selector: 'app-query-rule-set',
  standalone: true,
  imports: [CommonModule, FormsModule, QueryRuleComponent],
  template: `
    <div class="query-rule-set" [style.padding-left.px]="level * 20">
      <!-- Condition Selector -->
      <div class="query-rule-set-header">
        <div class="form-check form-check-inline">
          <input 
            class="form-check-input" 
            type="radio" 
            name="condition-{{level}}-{{rulesetIndex}}"
            id="and-{{level}}-{{rulesetIndex}}"
            value="and"
            [(ngModel)]="ruleset.condition"
            (ngModelChange)="onConditionChange($event)">
          <label class="form-check-label" for="and-{{level}}-{{rulesetIndex}}">
            AND
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input 
            class="form-check-input" 
            type="radio" 
            name="condition-{{level}}-{{rulesetIndex}}"
            id="or-{{level}}-{{rulesetIndex}}"
            value="or"
            [(ngModel)]="ruleset.condition"
            (ngModelChange)="onConditionChange($event)">
          <label class="form-check-label" for="or-{{level}}-{{rulesetIndex}}">
            OR
          </label>
        </div>
        
        <!-- Collapse Toggle -->
        <button 
          *ngIf="config?.allowCollapse && ruleset.rules.length > 1"
          type="button" 
          class="btn btn-link btn-sm"
          (click)="toggleCollapse()"
          [attr.aria-expanded]="!ruleset.collapsed"
          title="Toggle collapse">
          <i class="fas" [class.fa-chevron-down]="!ruleset.collapsed" [class.fa-chevron-right]="ruleset.collapsed"></i>
        </button>
      </div>

      <!-- Rules and Rule Sets -->
      <div class="query-rule-set-content" [class.collapsed]="ruleset.collapsed">
        <div 
          *ngFor="let item of ruleset.rules; let i = index"
          class="query-item"
          [ngClass]="{'query-rule-item': !isRuleSet(item), 'query-ruleset-item': isRuleSet(item)}">
          
          <!-- Individual Rule -->
          <app-query-rule
            *ngIf="!isRuleSet(item)"
            [rule]="item"
            [config]="config"
            [ruleIndex]="i"
            (ruleChange)="onRuleChange(i, $event)"
            (removeRuleEvent)="removeRule(i)">
          </app-query-rule>
          
          <!-- Nested Rule Set -->
          <app-query-rule-set
            *ngIf="isRuleSet(item)"
            [ruleset]="item"
            [config]="config"
            [level]="level + 1"
            [rulesetIndex]="i"
            (queryChange)="onRuleSetChange(i, $event)"
            (removeRuleSetEvent)="removeRuleSet(i)">
          </app-query-rule-set>
        </div>
      </div>

      <!-- Add Buttons -->
      <div class="query-rule-set-actions" *ngIf="!ruleset.collapsed">
        <button 
          type="button" 
          class="btn btn-primary btn-sm"
          (click)="addRule()">
          <i class="fas fa-plus"></i> Add Rule
        </button>
        <button 
          type="button" 
          class="btn btn-secondary btn-sm"
          (click)="addRuleSet()">
          <i class="fas fa-layer-group"></i> Add Group
        </button>
                  <button 
            *ngIf="level > 0"
            type="button" 
            class="btn btn-danger btn-sm"
            (click)="removeCurrentRuleSet()">
            <i class="fas fa-trash"></i> Remove Group
          </button>
      </div>
    </div>
  `,
  styleUrls: ['./query-rule-set.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryRuleSetComponent implements OnInit {
  @Input() ruleset!: QueryRuleSet;
  @Input() config!: QueryBuilderConfig;
  @Input() level: number = 0;
  @Input() rulesetIndex: number = 0;
  @Output() queryChange = new EventEmitter<QueryRuleSet>();
  @Output() removeRuleSetEvent = new EventEmitter<number>();

  constructor(private queryBuilderService: QueryBuilderService) {}

  ngOnInit(): void {
    if (this.ruleset.rules.length === 0) {
      this.addRule();
    }
  }

  isRuleSet(item: QueryRule | QueryRuleSet): item is QueryRuleSet {
    return 'rules' in item;
  }

  onConditionChange(condition: 'and' | 'or'): void {
    this.ruleset.condition = condition;
    this.queryChange.emit(this.ruleset);
  }

  onRuleChange(index: number, rule: QueryRule): void {
    this.ruleset.rules[index] = rule;
    this.queryChange.emit(this.ruleset);
  }

  onRuleSetChange(index: number, ruleSet: QueryRuleSet): void {
    this.ruleset.rules[index] = ruleSet;
    this.queryChange.emit(this.ruleset);
  }

  addRule(): void {
    const newRule: QueryRule = {
      field: '',
      operator: '',
      value: null
    };
    
    this.ruleset.rules.push(newRule);
    this.queryChange.emit(this.ruleset);
  }

  addRuleSet(): void {
    const newRuleSet: QueryRuleSet = {
      condition: 'and',
      rules: []
    };
    
    this.ruleset.rules.push(newRuleSet);
    this.queryChange.emit(this.ruleset);
  }

  removeRule(index: number): void {
    this.ruleset.rules.splice(index, 1);
    
    // Ensure at least one rule exists
    if (this.ruleset.rules.length === 0) {
      this.addRule();
    }
    
    this.queryChange.emit(this.ruleset);
  }

  removeRuleSet(index: number): void {
    this.ruleset.rules.splice(index, 1);
    
    // Ensure at least one rule exists
    if (this.ruleset.rules.length === 0) {
      this.addRule();
    }
    
    this.queryChange.emit(this.ruleset);
  }

  removeCurrentRuleSet(): void {
    this.removeRuleSetEvent.emit(this.rulesetIndex);
  }

  toggleCollapse(): void {
    if (this.config?.allowCollapse) {
      this.ruleset.collapsed = !this.ruleset.collapsed;
      this.queryChange.emit(this.ruleset);
    }
  }
}
