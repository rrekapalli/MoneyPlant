import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';

import { ScreenerStateService } from '../../../services/state/screener.state';
import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria, ScreenerCriteriaConfig } from '../../../services/entities/screener.entities';
import { INDICATOR_FIELDS } from '../../../services/entities/indicators.entities';
import { QueryBuilderComponent } from '../../../../../projects/query-builder/src/lib/components/query-builder.component';
import { QueryRuleSet } from '../../../../../projects/query-builder/src/lib/interfaces/query.interface';

@Component({
  selector: 'app-screener-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    TabsModule,
    QueryBuilderComponent
  ],
  providers: [MessageService],
  templateUrl: './screener-form.component.html',
  styleUrl: './screener-form.component.scss'
})
export class ScreenerFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State
  screener: ScreenerResp | null = null;
  loading = false;
  error: string | null = null;
  isEdit = false;
  
  // Form
  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false,
    defaultUniverse: '',
    criteria: undefined
  };

  // Query Builder
  activeTab = 'basic';
  criteriaQuery: QueryRuleSet = {
    condition: 'and',
    rules: []
  };
  
  criteriaConfig: ScreenerCriteriaConfig = {
    fields: this.getIndicatorFields(),
    defaultCondition: 'and',
    allowCollapse: true,
    allowEmpty: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private screenerState: ScreenerStateService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadScreener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
    this.screenerState.currentScreener$
      .pipe(takeUntil(this.destroy$))
      .subscribe(screener => {
        this.screener = screener;
        if (screener) {
          this.screenerForm = {
            name: screener.name,
            description: screener.description || '',
            isPublic: screener.isPublic,
            defaultUniverse: screener.defaultUniverse || '',
            criteria: screener.criteria
          };
          
          // Convert criteria to query format if it exists
          if (screener.criteria) {
            this.criteriaQuery = this.convertCriteriaToQuery(screener.criteria);
          }
        }
      });

    this.screenerState.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.screenerState.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);
  }

  private loadScreener() {
    const screenerId = this.route.snapshot.paramMap.get('id');
    const isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');
    
    this.isEdit = isEdit;
    
    if (screenerId && isEdit) {
      this.screenerState.loadScreener(+screenerId).subscribe({
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load screener for editing'
          });
          this.router.navigate(['/screeners']);
        }
      });
    }
  }

  saveScreener() {
    if (!this.screenerForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Screener name is required'
      });
      return;
    }

    if (this.isEdit && this.screener) {
      this.updateScreener();
    } else {
      this.createScreener();
    }
  }

  private createScreener() {
    this.screenerState.createScreener(this.screenerForm).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener created successfully'
        });
        this.router.navigate(['/screeners']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create screener'
        });
      }
    });
  }

  private updateScreener() {
    if (!this.screener) return;

    this.screenerState.updateScreener(this.screener.screenerId, this.screenerForm).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener updated successfully'
        });
        this.router.navigate(['/screeners', this.screener!.screenerId]);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update screener'
        });
      }
    });
  }

  cancel() {
    if (this.isEdit && this.screener) {
      this.router.navigate(['/screeners', this.screener.screenerId]);
    } else {
      this.router.navigate(['/screeners']);
    }
  }

  // Query Builder Methods
  onCriteriaChange(query: QueryRuleSet) {
    this.criteriaQuery = query;
    this.screenerForm.criteria = this.convertQueryToCriteria(query);
  }

  onTabChange(event: any) {
    this.activeTab = event.value;
  }

  private getIndicatorFields() {
    return INDICATOR_FIELDS.map(field => ({
      name: field.name,
      value: field.value,
      type: field.type as 'string' | 'number' | 'date' | 'time' | 'boolean' | 'category',
      category: field.category,
      description: field.description,
      operators: this.getOperatorsForType(field.type),
      options: undefined
    }));
  }

  private getOperatorsForType(type: string): string[] {
    switch (type) {
      case 'number':
        return ['=', '!=', '>', '>=', '<', '<=', 'between', 'not between', 'is empty', 'is not empty'];
      case 'string':
        return ['=', '!=', 'contains', 'not contains', 'starts with', 'ends with', 'is empty', 'is not empty'];
      case 'date':
      case 'time':
        return ['=', '!=', '>', '>=', '<', '<=', 'between', 'not between', 'is empty', 'is not empty'];
      case 'boolean':
        return ['=', '!=', 'is empty', 'is not empty'];
      case 'category':
        return ['=', '!=', 'in', 'not in', 'is empty', 'is not empty'];
      default:
        return ['=', '!=', 'is empty', 'is not empty'];
    }
  }

  private convertQueryToCriteria(query: QueryRuleSet): ScreenerCriteria {
    return {
      condition: query.condition,
      rules: query.rules.map((rule: any) => {
        if ('field' in rule) {
          // It's a QueryRule
          return {
            field: rule.field,
            operator: rule.operator,
            value: rule.value,
            entity: rule.entity
          };
        } else {
          // It's a nested QueryRuleSet
          return this.convertQueryToCriteria(rule);
        }
      }),
      collapsed: query.collapsed
    };
  }

  private convertCriteriaToQuery(criteria: ScreenerCriteria): QueryRuleSet {
    return {
      condition: criteria.condition,
      rules: criteria.rules.map((rule: any) => {
        if ('field' in rule) {
          // It's a ScreenerRule
          return {
            field: rule.field,
            operator: rule.operator,
            value: rule.value,
            entity: rule.entity
          };
        } else {
          // It's a nested ScreenerCriteria
          return this.convertCriteriaToQuery(rule);
        }
      }),
      collapsed: criteria.collapsed
    };
  }

  clearCriteria() {
    this.criteriaQuery = {
      condition: 'and',
      rules: []
    };
    this.screenerForm.criteria = undefined;
  }

  hasCriteria(): boolean {
    return this.criteriaQuery.rules.length > 0;
  }
}
