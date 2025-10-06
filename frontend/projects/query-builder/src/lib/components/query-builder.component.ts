import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryRuleSet, QueryBuilderConfig } from '../interfaces/query.interface';
import { QueryBuilderService } from '../services/query-builder.service';
import { QueryRuleSetComponent } from './query-rule-set.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-query-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, QueryRuleSetComponent],
  template: `
    <div class="query-builder" [class]="config.classNames?.['queryBuilder'] || ''">
      <div class="query-builder-header" *ngIf="!hideHeader">
        <div class="query-builder-title">
          <button 
            *ngIf="config.allowCollapse"
            type="button" 
            class="btn btn-link"
            (click)="toggleCollapse()"
            [attr.aria-expanded]="!collapsed"
            [attr.aria-label]="collapsed ? 'Expand query builder' : 'Collapse query builder'">
            <i class="fas" [class.fa-chevron-down]="!collapsed" [class.fa-chevron-right]="collapsed"></i>
            Query Builder
          </button>
          <span *ngIf="!config.allowCollapse" class="query-builder-title-text">Query Builder</span>
        </div>
        
        <div class="query-builder-header-actions" *ngIf="!collapsed">
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
        </div>
      </div>
      
      <div class="query-builder-content" [class.collapsed]="collapsed && !hideHeader">
        <div class="query-rule-set" *ngIf="!collapsed || hideHeader">
          <app-query-rule-set
            [ruleset]="query"
            [config]="config"
            [level]="0"
            (queryChange)="onQueryChange($event)">
          </app-query-rule-set>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./query-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryBuilderComponent implements OnInit, OnDestroy {
  @Input() query: QueryRuleSet = { condition: 'and', rules: [] };
  @Input() config!: QueryBuilderConfig;
  @Input() hideHeader: boolean = false;
  @Output() queryChange = new EventEmitter<QueryRuleSet>();

  collapsed = false;
  private subscription = new Subscription();

  constructor(private queryBuilderService: QueryBuilderService) {}

  ngOnInit(): void {
    if (this.config.allowCollapse) {
      this.collapsed = false;
    }
    
    this.subscription.add(
      this.queryBuilderService.queryState$.subscribe(state => {
        this.query = state;
        this.queryChange.emit(state);
      })
    );
    
    this.queryBuilderService.setQueryState(this.query);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  addRule(): void {
    const updatedQuery = this.queryBuilderService.addRule(this.query);
    this.query = updatedQuery;
    this.queryChange.emit(updatedQuery);
  }

  addRuleSet(): void {
    const updatedQuery = this.queryBuilderService.addRuleSet(this.query);
    this.query = updatedQuery;
    this.queryChange.emit(updatedQuery);
  }

  onQueryChange(query: QueryRuleSet): void {
    this.query = query;
    this.queryChange.emit(query);
  }
}
