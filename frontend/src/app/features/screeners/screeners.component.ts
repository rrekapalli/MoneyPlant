import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, of } from 'rxjs';
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
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ScreenerStateService } from '../../services/state/screener.state';
import { ScreenerApiService } from '../../services/apis/screener.api';
import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria } from '../../services/entities/screener.entities';
import { INDICATOR_FIELDS } from '../../services/entities/indicators.entities';
import { CriteriaBuilderModule } from '@projects/criteria-builder';
import { CriteriaDSL, BuilderConfig, FieldMeta, FieldType, Operator, Group, Condition, FieldRef, Literal } from '@projects/criteria-builder';
import { CriteriaApiService } from '@projects/criteria-builder';
import { ScreenersOverviewComponent } from './overview';
import { ScreenersConfigureComponent } from './configure';

@Component({
  selector: 'app-screeners',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ButtonModule, TableModule, CardModule,
    TabsModule, DialogModule, ConfirmDialogModule, ToastModule, InputTextModule,
    PaginatorModule, TagModule, TooltipModule, CheckboxModule, MessageModule,
    SelectModule, CriteriaBuilderModule, ScreenersOverviewComponent, ScreenersConfigureComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './screeners.component.html',
  styleUrl: './screeners.component.scss'
})
export class ScreenersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State properties
  screeners: ScreenerResp[] = [];
  myScreeners: ScreenerResp[] = [];
  publicScreeners: ScreenerResp[] = [];
  starredScreeners: ScreenerResp[] = [];
  filteredScreeners: ScreenerResp[] = [];
  loading = true;
  error: string | null = null;  
  searchQuery = '';
  dataLoaded = false;
  
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
    isPublic: false,
    defaultUniverse: '',
    criteria: undefined
  };

  activeTabIndex: string = "0";
  
  // Criteria Builder Integration
  private _criteriaDSL: CriteriaDSL | null = null;
  
  get criteriaDSL(): CriteriaDSL | null {
    return this._criteriaDSL;
  }
  
  set criteriaDSL(value: CriteriaDSL | null) {
    this._criteriaDSL = value;
    this.onCriteriaChange(value);
  }
  
  criteriaConfig: BuilderConfig = {
    allowGrouping: true,
    maxDepth: 2,
    enableAdvancedFunctions: false,
    showSqlPreview: false,
    compactMode: true,
    enablePartialValidation: true,
    autoSave: false,
    debounceMs: 300,
    locale: 'en',
    theme: 'light'
  };
  
  staticFields: FieldMeta[] = [];

  // Basic Info Edit State
  isEditingBasicInfo = false;
  originalBasicInfo: Partial<ScreenerCreateReq> = {};

  // Universe Options
  universeOptions = [
    { label: 'NIFTY 50', value: 'NIFTY 50' },
    { label: 'NIFTY 100', value: 'NIFTY 100' },
    { label: 'NIFTY 200', value: 'NIFTY 200' },
    { label: 'NIFTY 500', value: 'NIFTY 500' }
  ]; 
  // Filter options
  selectedVisibility: string | null = null;
  selectedCategory: string | null = null;

  // Summary statistics
  get totalScreeners(): number {
    return this.screeners.length;
  }

  get activeScreeners(): number {
    return this.screeners.length; // Assuming all screeners are active for now
  }

  get publicScreenersCount(): number {
    return this.screeners.filter(s => s.isPublic).length;
  }

  get privateScreeners(): number {
    return this.screeners.filter(s => !s.isPublic).length;
  }

  get starredScreenersCount(): number {
    return this.starredScreeners.length;
  }
  
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
    private router: Router,
    private criteriaApiService: CriteriaApiService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadStaticFields();
    this.setupStaticFieldsForCriteriaBuilder();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
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
      
      // Mark data as loaded when we're not loading and have received the first response
      if (!loading) {
        this.dataLoaded = true;
      }
      
      this.updateFilteredScreeners();
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
    this.pagination.page = 0;
    this.updateFilteredScreeners();
    this.loadScreeners();
  }

  onPageChange(event: any) {
    this.pagination.page = event.page;
    this.pagination.size = event.rows;
    this.loadScreeners();
  }

  onTabChange(index: string | number | undefined): void {
    if (index !== undefined) {
      this.activeTabIndex = typeof index === 'string' ? index : index.toString();
      
      // Clear selection when switching back to overview tab
      if (this.activeTabIndex === "0") {
        this.clearSelection();
      }
    }
  }

  updateFilteredScreeners(): void {
    let filtered = [...this.screeners];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(screener =>
        screener.name.toLowerCase().includes(query) ||
        (screener.description && screener.description.toLowerCase().includes(query))
      );
    }

    if (this.selectedVisibility) {
      filtered = filtered.filter(screener => {
        if (this.selectedVisibility === 'public') return screener.isPublic;
        if (this.selectedVisibility === 'private') return !screener.isPublic;
        return true;
      });
    }

    this.filteredScreeners = filtered;
  }
  
  getFilteredScreeners(): ScreenerResp[] {
    return this.filteredScreeners;
  }

  onFilterChange(): void {
    this.updateFilteredScreeners();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedVisibility = null;
    this.selectedCategory = null;
    this.updateFilteredScreeners();
  }

  trackScreenerById(_index: number, screener: ScreenerResp): number {
    return screener.screenerId;
  }

  runScreener(screener: ScreenerResp) {
    this.messageService.add({
      severity: 'info',
      summary: 'Running Screener',
      detail: `Running screener: ${screener.name}`
    });
  }

  viewResults(screener: ScreenerResp) {
    this.router.navigate(['/screeners', screener.screenerId]);
  }

  createScreener() {
    this.selectedScreener = null;
    this.screenerForm = {
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: 'NIFTY 50',
      criteria: undefined
    };
    this._criteriaDSL = null;
    this.activeTabIndex = "1";
  }

  configureScreener(screener: ScreenerResp) {
    this.selectedScreener = screener;
    this.screenerForm = {
      name: screener.name,
      description: screener.description || '',
      isPublic: screener.isPublic,
      defaultUniverse: screener.defaultUniverse || 'NIFTY 50',
      criteria: screener.criteria
    };
    
    // Initialize edit state
    this.isEditingBasicInfo = false;
    this.originalBasicInfo = {};
    
    if (screener.criteria) {
      this._criteriaDSL = this.convertScreenerCriteriaToDsl(screener.criteria);
    } else {
      this._criteriaDSL = null;
    }
    
    this.activeTabIndex = "1";
  }
  
  clearSelection(): void {
    this.selectedScreener = null;
    this.screenerForm = {
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: 'NIFTY 50',
      criteria: undefined
    };
    this._criteriaDSL = null;
    
    // Reset edit state
    this.isEditingBasicInfo = false;
    this.originalBasicInfo = {};
  }

  deleteScreener(screener: ScreenerResp) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${screener.name}"?`,
      header: 'Delete Screener',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.screenerApi.deleteScreener(screener.screenerId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Screener deleted successfully'
            });
            this.loadScreeners();
          },
          error: () => {
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

  saveScreener(screenerData?: ScreenerCreateReq) {
    const formData = screenerData || this.screenerForm;
    
    if (!formData.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Screener name is required'
      });
      return;
    }

    // Update the main form data if provided from child component
    if (screenerData) {
      this.screenerForm = { ...screenerData };
    }

    if (this.selectedScreener) {
      this.updateScreener();
    } else {
      this.createNewScreener();
    }
  }  
  
  private createNewScreener() {
    this.screenerApi.createScreener(this.screenerForm).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener created successfully'
        });
        this.loadScreeners();
        this.activeTabIndex = "0";
      },
      error: () => {
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
    
    this.screenerApi.updateScreener(this.selectedScreener.screenerId, this.screenerForm).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener updated successfully'
        });
        this.loadScreeners();
        this.activeTabIndex = "0";
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update screener'
        });
      }
    });
  }

  toggleStar(screener: ScreenerResp) {
    const isCurrentlyStarred = this.isStarred(screener);
    const action = isCurrentlyStarred ? 'unstar' : 'star';
    
    this.screenerApi.toggleStar(screener.screenerId, { starred: !isCurrentlyStarred }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Screener ${action}red successfully`
        });
        this.loadStarredScreeners();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${action} screener`
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

  onCriteriaChange(dsl: CriteriaDSL | null) {
    if (dsl && this.hasValidCriteria(dsl)) {
      this.screenerForm.criteria = this.convertDslToScreenerCriteria(dsl);
    } else {
      this.screenerForm.criteria = undefined;
    }
  }



  onVisibilityChange(event: any) {
    this.screenerForm.isPublic = event.target.checked;
  }

  // Basic Info Edit Methods
  toggleBasicInfoEdit() {
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

  private storeOriginalBasicInfo() {
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

  private saveBasicInfoChanges() {
    if (this.selectedScreener) {
      // Update existing screener
      this.updateScreener();
    } else {
      // For new screeners, just show a message that changes are saved locally
      this.messageService.add({
        severity: 'success',
        summary: 'Changes Saved',
        detail: 'Basic information updated locally. Save the screener to persist changes.',
        life: 3000
      });
    }
  }

  addRule() {
    // This will be handled by the criteria-builder component itself
  }

  addGroup() {
    // This will be handled by the criteria-builder component itself
  }

  hasCriteria(): boolean {
    if (this._criteriaDSL) {
      return this.hasValidCriteria(this._criteriaDSL);
    } else {
      return false;
    }
  }  
  clearCriteria() {
    try {
      this._criteriaDSL = this.createEmptyDSL();
      this.screenerForm.criteria = undefined;
      
      this.messageService.add({
        severity: 'info',
        summary: 'Criteria Cleared',
        detail: 'All screening criteria have been cleared'
      });
    } catch (error) {
    }
  }





  // Criteria Builder Integration Methods
  private loadStaticFields() {
    try {
      this.staticFields = INDICATOR_FIELDS.map(field => this.convertIndicatorFieldToFieldMeta(field));
    } catch (error) {
      this.staticFields = [];
    }
  }  
  private setupStaticFieldsForCriteriaBuilder() {
    try {
      const criteriaBuilderFields = this.staticFields.map(field => ({
        ...field,
        id: field.id,
        label: field.label,
        dataType: field.dataType,
        category: field.category || 'General',
        description: field.description || '',
        validation: field.validation,
        example: field.example
      }));

      // Override the API service methods to return our static data
      this.criteriaApiService.getFields = () => {
        return of(criteriaBuilderFields);
      };

      // Override functions to return empty array for MVP
      this.criteriaApiService.getFunctions = () => {
        return of([]);
      };

      // Override operators to return basic operators
      this.criteriaApiService.getAllOperators = () => {
        const basicOperators = [
          { id: '=', label: 'Equals', description: 'Equal to', requiresRightSide: true, supportedTypes: ['string', 'number', 'integer', 'date', 'boolean'] as FieldType[] },
          { id: '!=', label: 'Not Equals', description: 'Not equal to', requiresRightSide: true, supportedTypes: ['string', 'number', 'integer', 'date', 'boolean'] as FieldType[] },
          { id: '>', label: 'Greater Than', description: 'Greater than', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] },
          { id: '>=', label: 'Greater Than or Equal', description: 'Greater than or equal to', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] },
          { id: '<', label: 'Less Than', description: 'Less than', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] },
          { id: '<=', label: 'Less Than or Equal', description: 'Less than or equal to', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] }
        ];
        return of(basicOperators);
      };

    } catch (error) {
    }
  }  
  private convertIndicatorFieldToFieldMeta(field: any): FieldMeta {
    try {
      const dataType = this.mapFieldType(field.type);
      
      return {
        id: field.value,
        label: field.name,
        dbColumn: field.value,
        dataType: dataType,
        category: field.category || 'General',
        description: field.description || `${field.name} indicator`,
        validation: this.createValidationConfig(field),
        example: this.generateExampleValue(dataType, field),
        allowedOps: this.getBasicOperatorsForType(dataType),
        nullable: true
      };
    } catch (error) {
      return {
        id: field.value || 'unknown',
        label: field.name || 'Unknown Field',
        dbColumn: field.value || 'unknown',
        dataType: 'string' as FieldType,
        category: 'General'
      };
    }
  }

  private mapFieldType(type: string): FieldType {
    const FIELD_TYPE_MAPPING: Record<string, FieldType> = {
      'number': 'number',
      'percent': 'number',
      'currency': 'number',
      'text': 'string',
      'boolean': 'boolean',
      'date': 'date'
    };
    return FIELD_TYPE_MAPPING[type] || 'string';
  }  
  
  private getBasicOperatorsForType(fieldType: FieldType): Operator[] {
    const BASIC_OPERATORS: Record<FieldType, Operator[]> = {
      'number': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'integer': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'string': ['=', '!=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN'],
      'boolean': ['=', '!='],
      'date': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'enum': ['=', '!=', 'IN', 'NOT IN'],
      'percent': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'currency': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN']
    };
    return BASIC_OPERATORS[fieldType] || ['=', '!='];
  }

  private createValidationConfig(field: any): FieldMeta['validation'] {
    const validation: FieldMeta['validation'] = {};
    
    if (field.min !== undefined) {
      validation!.min = field.min;
    }
    
    if (field.max !== undefined) {
      validation!.max = field.max;
    }
    
    if (field.type === 'number' || field.type === 'percent' || field.type === 'currency') {
      validation!.required = false;
    }
    
    return Object.keys(validation).length > 0 ? validation : undefined;
  }

  private generateExampleValue(dataType: FieldType, field: any): string {
    switch (dataType) {
      case 'number':
      case 'integer':
        if (field.value.includes('rsi')) return '70.5';
        if (field.value.includes('sma') || field.value.includes('ema')) return '150.25';
        if (field.value.includes('volume')) return '1000000';
        return '100.0';
      case 'string':
        return 'example';
      case 'boolean':
        return 'true';
      case 'date':
        return '2024-01-01';
      default:
        return 'example';
    }
  }  
  private hasValidCriteria(dsl: CriteriaDSL): boolean {
    return dsl && dsl.root && dsl.root.children && dsl.root.children.length > 0;
  }

  private convertScreenerCriteriaToDsl(criteria: ScreenerCriteria): CriteriaDSL {
    if (!criteria) {
      return this.createEmptyDSL();
    }

    try {
      return {
        root: this.convertScreenerGroup(criteria)
      };
    } catch (error) {
      return this.createEmptyDSL();
    }
  }

  private convertScreenerGroup(criteria: ScreenerCriteria): Group {
    try {
      return {
        operator: criteria.condition.toUpperCase() as 'AND' | 'OR',
        children: criteria.rules.map(rule => {
          if ('field' in rule) {
            return this.convertScreenerRule(rule as any);
          } else {
            return this.convertScreenerGroup(rule as ScreenerCriteria);
          }
        })
      };
    } catch (error) {
      throw error;
    }
  }

  private convertScreenerRule(rule: any): Condition {
    try {
      return {
        left: {
          fieldId: rule.field
        } as FieldRef,
        op: rule.operator as Operator,
        right: (() => {
          if (rule.operator === 'IS NULL' || rule.operator === 'IS NOT NULL') {
            return undefined;
          }
          if (rule.value !== null && rule.value !== undefined) {
            return {
              type: this.inferValueType(rule.value),
              value: rule.value
            } as Literal;
          }
          return undefined;
        })()
      };
    } catch (error) {
      throw error;
    }
  }  
  private createEmptyDSL(): CriteriaDSL {
    return {
      root: {
        operator: 'AND',
        children: []
      }
    };
  }

  private inferValueType(value: any): FieldType {
    if (value === null || value === undefined) {
      return 'string';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return 'integer';
      } else {
        return 'number';
      }
    }

    if (typeof value === 'string') {
      if (value.trim() === '') {
        return 'string';
      }

      if (!isNaN(Number(value))) {
        return 'number';
      }

      if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        return 'boolean';
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(value)) {
        return 'date';
      }
    }

    return 'string';
  }

  private convertDslToScreenerCriteria(dsl: CriteriaDSL): ScreenerCriteria | undefined {
    if (!dsl || !dsl.root) {
      return undefined;
    }

    try {
      return this.convertDslGroup(dsl.root);
    } catch (error) {
      return undefined;
    }
  }
  
  
  private convertDslGroup(group: Group): ScreenerCriteria {
    const operator = group.operator === 'NOT' ? 'and' : group.operator.toLowerCase() as 'and' | 'or';

    return {
      condition: operator,
      rules: group.children.map((child: Condition | Group) => {
        if ('op' in child) {
          return this.convertDslCondition(child as Condition, group.operator === 'NOT');
        } else {
          return this.convertDslGroup(child as Group);
        }
      })
    };
  }

  private convertDslCondition(condition: Condition, isNegated: boolean = false): any {
    const fieldId = (condition.left as FieldRef).fieldId;
    let operator = condition.op;
    if (isNegated) {
      operator = this.negateOperator(operator);
    }

    let value = null;
    if (condition.right) {
      if ('value' in condition.right) {
        value = (condition.right as Literal).value;
      } else if ('fieldId' in condition.right) {
        value = (condition.right as FieldRef).fieldId;
      }
    }

    return {
      field: fieldId,
      operator: operator,
      value: value
    };
  }

  private negateOperator(operator: Operator): Operator {
    const negationMap: Record<Operator, Operator> = {
      '=': '!=',
      '!=': '=',
      '<': '>=',
      '<=': '>',
      '>': '<=',
      '>=': '<',
      'LIKE': 'NOT LIKE',
      'NOT LIKE': 'LIKE',
      'IN': 'NOT IN',
      'NOT IN': 'IN',
      'IS NULL': 'IS NOT NULL',
      'IS NOT NULL': 'IS NULL',
      'BETWEEN': 'NOT BETWEEN',
      'NOT BETWEEN': 'BETWEEN'
    };
    
    return negationMap[operator] || operator;
  }

  onValidityChange(_isValid: boolean) {
    // Handle criteria validity changes
  }
}