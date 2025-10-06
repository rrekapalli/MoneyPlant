import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
// Removed InputSwitchModule import - using custom toggle instead
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ScreenerStateService } from '../../services/state/screener.state';
import { ScreenerApiService } from '../../services/apis/screener.api';
import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria, ScreenerCriteriaConfig } from '../../services/entities/screener.entities';
import { INDICATOR_FIELDS } from '../../services/entities/indicators.entities';
import { QueryBuilderComponent } from '../../../../projects/query-builder/src/lib/components/query-builder.component';
import { QueryRuleSet } from '../../../../projects/query-builder/src/lib/interfaces/query.interface';
import { QueryBuilderService } from '../../../../projects/query-builder/src/lib/services/query-builder.service';

@Component({
  selector: 'app-screeners',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TabsModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    InputTextModule,
    PaginatorModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
    MessageModule,
    SelectModule,
    QueryBuilderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './screeners.component.html',
  styleUrl: './screeners.component.scss'
})
export class ScreenersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State
  screeners: ScreenerResp[] = [];
  myScreeners: ScreenerResp[] = [];
  publicScreeners: ScreenerResp[] = [];
  starredScreeners: ScreenerResp[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';
  
  // Pagination
  pagination = {
    page: 0,
    size: 25,
    totalElements: 0,
    totalPages: 0
  };

  // UI State
  selectedScreener: ScreenerResp | null = null;
  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false, // Default to Private
    defaultUniverse: '',
    criteria: undefined
  };

  // Active tab index for switching between tabs
  activeTab: string = "0";
  
  // Query Builder
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

  // Universe Options
  universeOptions = [
    { label: 'NIFTY 50', value: 'NIFTY 50' },
    { label: 'NIFTY 100', value: 'NIFTY 100' },
    { label: 'NIFTY 200', value: 'NIFTY 200' },
    { label: 'NIFTY 500', value: 'NIFTY 500' },
    { label: 'NIFTY SMALLCAP 100', value: 'NIFTY SMALLCAP 100' },
    { label: 'NIFTY MIDCAP 100', value: 'NIFTY MIDCAP 100' },
    { label: 'BSE SENSEX', value: 'BSE SENSEX' },
    { label: 'BSE 100', value: 'BSE 100' },
    { label: 'BSE 200', value: 'BSE 200' },
    { label: 'BSE 500', value: 'BSE 500' }
  ];

  // Filter options
  selectedVisibility: string | null = null;
  selectedCategory: string | null = null;
  
  visibilityOptions = [
    { label: 'All Visibility', value: null },
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' }
  ];
  
  categoryOptions = [
    { label: 'All Categories', value: null },
    { label: 'Technical', value: 'technical' },
    { label: 'Fundamental', value: 'fundamental' },
    { label: 'Custom', value: 'custom' }
  ];

  constructor(
    private screenerState: ScreenerStateService,
    private screenerApi: ScreenerApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private queryBuilderService: QueryBuilderService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
    // Subscribe to state changes
    combineLatest([
      this.screenerState.screeners$,
      this.screenerState.myScreeners$,
      this.screenerState.publicScreeners$,
      this.screenerState.starredScreeners$,
      this.screenerState.loading$,
      this.screenerState.error$,
      this.screenerState.pagination$
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([screeners, myScreeners, publicScreeners, starredScreeners, loading, error, pagination]) => {
      this.screeners = screeners;
      this.myScreeners = myScreeners;
      this.publicScreeners = publicScreeners;
      this.starredScreeners = starredScreeners;
      this.loading = loading;
      this.error = error;
      this.pagination = pagination;
    });
  }

  private loadInitialData() {
    this.loadScreeners();
    this.loadMyScreeners();
    this.loadPublicScreeners();
    this.loadStarredScreeners();
  }

  loadScreeners() {
    const params = {
      q: this.searchQuery || undefined,
      page: this.pagination.page,
      size: this.pagination.size
    };
    this.screenerState.loadScreeners(params).subscribe();
  }

  loadMyScreeners() {
    this.screenerState.loadMyScreeners().subscribe();
  }

  loadPublicScreeners() {
    this.screenerState.loadPublicScreeners().subscribe();
  }

  loadStarredScreeners() {
    this.screenerState.loadStarredScreeners().subscribe();
  }

  onSearch() {
    this.pagination.page = 0; // Reset to first page
    this.loadScreeners();
  }

  onPageChange(event: any) {
    this.pagination.page = event.page;
    this.pagination.size = event.rows;
    this.loadScreeners();
  }

  onTabChange(index: string | number): void {
    console.log('Tab changed to:', index);
    this.activeTab = typeof index === 'string' ? index : index.toString();
  }

  getFilteredScreeners(): ScreenerResp[] {
    let filtered = [...this.screeners];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const searchLower = this.searchQuery.toLowerCase();
      filtered = filtered.filter(screener =>
        screener.name.toLowerCase().includes(searchLower) ||
        (screener.description && screener.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply visibility filter
    if (this.selectedVisibility) {
      filtered = filtered.filter(screener => {
        if (this.selectedVisibility === 'public') {
          return screener.isPublic;
        } else if (this.selectedVisibility === 'private') {
          return !screener.isPublic;
        }
        return true;
      });
    }

    return filtered;
  }

  onFilterChange(): void {
    // Filter change is handled by getFilteredScreeners() method
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedVisibility = null;
    this.selectedCategory = null;
  }

  trackScreenerById(index: number, screener: ScreenerResp): number {
    return screener.screenerId;
  }

  runScreener(screener: ScreenerResp) {
    console.log('Running screener', screener);
    // TODO: Implement run screener functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Screener Run',
      detail: `Running screener: ${screener.name}`
    });
  }

  viewResults(screener: ScreenerResp) {
    this.router.navigate(['/screeners', screener.screenerId]);
  }

  createScreener() {
    // Create a new empty screener for creation mode
    this.selectedScreener = {
      screenerId: 0, // Temporary ID for new screener
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: '',
      ownerUserId: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Switch to Configure tab for new screener creation
    this.activeTab = "1";
    console.log('Switched to Configure tab for new screener creation');
  }

  configureScreener(screener: ScreenerResp) {
    console.log('Configure screener:', screener);
    console.log('Current activeTab before switch:', this.activeTab);
    this.selectedScreener = screener;
    this.screenerForm = {
      name: screener.name,
      description: screener.description || '',
      isPublic: screener.isPublic,
      defaultUniverse: screener.defaultUniverse || 'NIFTY 50',
      criteria: screener.criteria
    };
    
    // Convert criteria to query format if it exists
    if (screener.criteria) {
      this.criteriaQuery = this.convertCriteriaToQuery(screener.criteria);
    } else {
      this.criteriaQuery = {
        condition: 'and',
        rules: []
      };
    }
    
    this.activeTab = "1"; // Switch to Configure tab
    console.log('ActiveTab after switch to Configure:', this.activeTab);
  }

  clearSelection(): void {
    this.selectedScreener = null;
    this.screenerForm = {
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: '',
      criteria: undefined
    };
    this.criteriaQuery = {
      condition: 'and',
      rules: []
    };
  }

  deleteScreener(screener: ScreenerResp) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${screener.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.screenerState.deleteScreener(screener.screenerId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Screener deleted successfully'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete screener'
            });
          }
        });
      }
    });
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

    // Ensure criteria is included in the form
    this.screenerForm.criteria = this.convertQueryToCriteria(this.criteriaQuery);

    if (this.selectedScreener && this.selectedScreener.screenerId === 0) {
      this.createNewScreener();
    } else if (this.selectedScreener) {
      this.updateScreener();
    }
  }

  private createNewScreener() {
    this.screenerState.createScreener(this.screenerForm).subscribe({
      next: () => {
        this.clearSelection();
        this.activeTab = "0"; // Switch back to Overview tab
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener created successfully'
        });
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
    if (!this.selectedScreener) return;

    this.screenerState.updateScreener(this.selectedScreener.screenerId, this.screenerForm).subscribe({
      next: () => {
        this.clearSelection();
        this.activeTab = "0"; // Switch back to Overview tab
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener updated successfully'
        });
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

  toggleStar(screener: ScreenerResp) {
    const isStarred = this.starredScreeners.some(s => s.screenerId === screener.screenerId);
    this.screenerState.toggleStar(screener.screenerId, !isStarred).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: isStarred ? 'Removed from starred' : 'Added to starred'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle star'
        });
      }
    });
  }

  isStarred(screener: ScreenerResp): boolean {
    return this.starredScreeners.some(s => s.screenerId === screener.screenerId);
  }


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }


  // Query Builder Methods
  onCriteriaChange(query: QueryRuleSet) {
    this.criteriaQuery = query;
    this.screenerForm.criteria = this.convertQueryToCriteria(query);
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

  onVisibilityChange(event: any) {
    this.screenerForm.isPublic = event.target.checked;
  }

  addRule() {
    const updatedQuery = this.queryBuilderService.addRule(this.criteriaQuery);
    this.criteriaQuery = updatedQuery;
    this.onCriteriaChange(this.criteriaQuery);
  }

  addGroup() {
    const updatedQuery = this.queryBuilderService.addRuleSet(this.criteriaQuery);
    this.criteriaQuery = updatedQuery;
    this.onCriteriaChange(this.criteriaQuery);
  }

  hasCriteria(): boolean {
    return this.criteriaQuery.rules.length > 0;
  }

  // SQL Generation Method
  getGeneratedSQL(): string {
    if (!this.hasCriteria()) {
      return 'SELECT * FROM stocks WHERE 1=1;';
    }

    const conditions = this.generateSQLConditions(this.criteriaQuery);
    return `SELECT * FROM stocks WHERE ${conditions};`;
  }

  // WHERE Condition Generation Method
  getGeneratedWhereCondition(): string {
    if (!this.hasCriteria()) {
      return '1=1';
    }

    return this.generateSQLConditions(this.criteriaQuery);
  }

  private generateSQLConditions(query: QueryRuleSet): string {
    if (query.rules.length === 0) {
      return '1=1';
    }

    const conditions = query.rules.map((rule: any) => {
      if ('field' in rule) {
        // It's a QueryRule
        return this.generateSQLCondition(rule);
      } else {
        // It's a nested QueryRuleSet
        return `(${this.generateSQLConditions(rule)})`;
      }
    });

    const operator = query.condition.toUpperCase();
    return conditions.join(` ${operator} `);
  }

  private generateSQLCondition(rule: any): string {
    const field = rule.field;
    const operator = rule.operator;
    const value = rule.value;

    switch (operator) {
      case '=':
        return `${field} = ${this.formatSQLValue(value)}`;
      case '!=':
        return `${field} != ${this.formatSQLValue(value)}`;
      case '>':
        return `${field} > ${this.formatSQLValue(value)}`;
      case '>=':
        return `${field} >= ${this.formatSQLValue(value)}`;
      case '<':
        return `${field} < ${this.formatSQLValue(value)}`;
      case '<=':
        return `${field} <= ${this.formatSQLValue(value)}`;
      case 'contains':
        return `${field} LIKE '%${value}%'`;
      case 'not contains':
        return `${field} NOT LIKE '%${value}%'`;
      case 'starts with':
        return `${field} LIKE '${value}%'`;
      case 'ends with':
        return `${field} LIKE '%${value}'`;
      case 'between':
        if (typeof value === 'object' && value.min !== null && value.max !== null) {
          return `${field} BETWEEN ${this.formatSQLValue(value.min)} AND ${this.formatSQLValue(value.max)}`;
        }
        return '1=1';
      case 'not between':
        if (typeof value === 'object' && value.min !== null && value.max !== null) {
          return `${field} NOT BETWEEN ${this.formatSQLValue(value.min)} AND ${this.formatSQLValue(value.max)}`;
        }
        return '1=1';
      case 'is empty':
        return `${field} IS NULL OR ${field} = ''`;
      case 'is not empty':
        return `${field} IS NOT NULL AND ${field} != ''`;
      case 'in':
        if (Array.isArray(value)) {
          const values = value.map(v => this.formatSQLValue(v)).join(', ');
          return `${field} IN (${values})`;
        }
        return '1=1';
      case 'not in':
        if (Array.isArray(value)) {
          const values = value.map(v => this.formatSQLValue(v)).join(', ');
          return `${field} NOT IN (${values})`;
        }
        return '1=1';
      default:
        return '1=1';
    }
  }

  private formatSQLValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    return value.toString();
  }

}
