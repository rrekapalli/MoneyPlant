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
// Removed InputSwitchModule import - using custom toggle instead
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ScreenerStateService } from '../../services/state/screener.state';
import { ScreenerApiService } from '../../services/apis/screener.api';
import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria, ScreenerCriteriaConfig } from '../../services/entities/screener.entities';
import { INDICATOR_FIELDS } from '../../services/entities/indicators.entities';
import { CriteriaBuilderModule } from 'criteria-builder';
import { CriteriaDSL, BuilderConfig, FieldMeta, FieldType, Operator, Group, Condition, FieldRef, Literal } from 'criteria-builder';
import { CriteriaApiService, FieldMetaResp } from 'criteria-builder';



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
    CriteriaBuilderModule
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
  filteredScreeners: ScreenerResp[] = [];
  loading = false;
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
    isPublic: false, // Default to Private
    defaultUniverse: '',
    criteria: undefined
  };

  // Active tab index for switching between tabs
  activeTab: string = "0";
  
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
    maxDepth: 2, // Reduced depth for simplicity
    enableAdvancedFunctions: false,
    showSqlPreview: false,
    compactMode: true, // Enable compact mode for simpler UI
    enablePartialValidation: true,
    autoSave: false,
    debounceMs: 300,
    locale: 'en',
    theme: 'light'
  };
  
  staticFields: FieldMeta[] = [];

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
    private criteriaApiService: CriteriaApiService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadStaticFields();
    this.setupStaticFieldsForCriteriaBuilder();
    this.loadInitialData();
    // Initialize filtered screeners to prevent empty state from showing prematurely
    this.updateFilteredScreeners();
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
      this.dataLoaded = true; // Mark that data has been loaded at least once
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
    this.pagination.page = 0; // Reset to first page
    this.updateFilteredScreeners();
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

  updateFilteredScreeners(): void {
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
    
    // Convert criteria to DSL format if it exists
    if (screener.criteria) {
      this._criteriaDSL = this.convertScreenerCriteriaToDsl(screener.criteria);
    } else {
      this._criteriaDSL = null;
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
    this._criteriaDSL = null;
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
    if (this._criteriaDSL) {
      this.screenerForm.criteria = this.convertDslToScreenerCriteria(this._criteriaDSL);
    }

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


  // Criteria Builder Methods
  onCriteriaChange(dsl: CriteriaDSL | null) {
    try {
      this._criteriaDSL = dsl;
      
      if (!dsl || !this.hasValidCriteria(dsl)) {
        this.screenerForm.criteria = undefined;
        return;
      }

      const convertedCriteria = this.convertDslToScreenerCriteria(dsl);
      this.screenerForm.criteria = convertedCriteria;
      
    } catch (error) {
      console.error('Error in onCriteriaChange:', error);
      this._criteriaDSL = null;
      this.screenerForm.criteria = undefined;
    }
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





  onVisibilityChange(event: any) {
    this.screenerForm.isPublic = event.target.checked;
  }

  addRule() {
    // This will be handled by the criteria-builder component itself
    console.log('Add rule - handled by criteria-builder component');
  }

  addGroup() {
    // This will be handled by the criteria-builder component itself
    console.log('Add group - handled by criteria-builder component');
  }

  hasCriteria(): boolean {
    try {
      const hasValidDSL = this._criteriaDSL ? this.hasValidCriteria(this._criteriaDSL) : false;
      return hasValidDSL;
    } catch (error) {
      console.error('Error checking criteria existence:', error);
      return false;
    }
  }

  clearCriteria() {
    try {
      this._criteriaDSL = null;
      this.screenerForm.criteria = undefined;
      
      this.messageService.add({
        severity: 'info',
        summary: 'Criteria Cleared',
        detail: 'All screening criteria have been removed.',
        life: 3000
      });
    } catch (error) {
      console.error('Error clearing criteria:', error);
    }
  }

  // SQL Generation Method
  getGeneratedSQL(): string {
    if (!this.hasCriteria()) {
      return 'SELECT * FROM stocks WHERE 1=1;';
    }

    if (this._criteriaDSL) {
      // For now, return a placeholder - SQL generation from DSL can be implemented later
      return `SELECT * FROM stocks WHERE /* criteria from DSL */;`;
    }
    return 'SELECT * FROM stocks WHERE 1=1;';
  }

  // WHERE Condition Generation Method
  getGeneratedWhereCondition(): string {
    if (!this.hasCriteria()) {
      return '1=1';
    }

    if (this._criteriaDSL) {
      // For now, return a placeholder - SQL generation from DSL can be implemented later
      return '/* criteria from DSL */';
    }
    return '1=1';
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

  // Criteria Builder Integration Methods
  private loadStaticFields() {
    try {
      this.staticFields = INDICATOR_FIELDS.map(field => this.convertIndicatorFieldToFieldMeta(field));
      console.log(`Successfully loaded ${this.staticFields.length} static fields for criteria builder`);
    } catch (error) {
      console.error('Failed to load static fields:', error);
      this.staticFields = [];
    }
  }

  private setupStaticFieldsForCriteriaBuilder() {
    try {
      const criteriaBuilderFields = this.staticFields.map(field => ({
        id: field.id,
        label: field.label,
        dbColumn: field.dbColumn,
        dataType: field.dataType,
        category: field.category,
        description: field.description,
        example: field.example,
        allowedOps: field.allowedOps,
        validation: field.validation,
        nullable: field.nullable
      }));

      // Override the API service methods to return our static data
      this.criteriaApiService.getFields = () => {
        console.log('Providing static fields to criteria-builder:', criteriaBuilderFields.length);
        return of(criteriaBuilderFields);
      };

      // Override functions to return empty array for MVP
      this.criteriaApiService.getFunctions = () => {
        console.log('Providing empty functions array for MVP');
        return of([]);
      };

      // Override operators to return basic operators
      this.criteriaApiService.getAllOperators = () => {
        console.log('Providing basic operators for MVP');
        const basicOperators = [
          { id: '=', label: 'Equals', description: 'Equal to', requiresRightSide: true, supportedTypes: ['string', 'number', 'integer', 'date', 'boolean'] as FieldType[] },
          { id: '!=', label: 'Not Equals', description: 'Not equal to', requiresRightSide: true, supportedTypes: ['string', 'number', 'integer', 'date', 'boolean'] as FieldType[] },
          { id: '>', label: 'Greater Than', description: 'Greater than', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] },
          { id: '<', label: 'Less Than', description: 'Less than', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] },
          { id: '>=', label: 'Greater Than or Equal', description: 'Greater than or equal to', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] },
          { id: '<=', label: 'Less Than or Equal', description: 'Less than or equal to', requiresRightSide: true, supportedTypes: ['number', 'integer', 'date'] as FieldType[] }
        ];
        return of(basicOperators);
      };

      console.log('Successfully setup static data for criteria-builder');

    } catch (error) {
      console.error('Failed to setup static fields for criteria-builder:', error);
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
        allowedOps: this.getBasicOperatorsForType(dataType),
        category: field.category,
        description: field.description,
        validation: this.createValidationConfig(field),
        nullable: true,
        example: this.generateExampleValue(dataType, field)
      };
    } catch (error) {
      console.error('Failed to convert indicator field to FieldMeta:', error, field);
      return {
        id: field.value || 'unknown',
        label: field.name || 'Unknown Field',
        dbColumn: field.value || 'unknown',
        dataType: 'string',
        allowedOps: ['=', '!='],
        category: field.category || 'Other',
        description: field.description || 'Field conversion failed',
        nullable: true,
        example: 'N/A'
      };
    }
  }

  private mapFieldType(type: string): FieldType {
    const FIELD_TYPE_MAPPING: Record<string, FieldType> = {
      'number': 'number',
      'string': 'string',
      'date': 'date',
      'boolean': 'boolean',
      'percent': 'percent',
      'currency': 'currency'
    };
    return FIELD_TYPE_MAPPING[type] || 'string';
  }

  private getBasicOperatorsForType(fieldType: FieldType): Operator[] {
    const BASIC_OPERATORS: Record<FieldType, Operator[]> = {
      'number': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'integer': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'percent': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'currency': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'string': ['=', '!=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN'],
      'date': ['=', '!=', '>', '>=', '<', '<=', 'BETWEEN', 'NOT BETWEEN'],
      'boolean': ['=', '!='],
      'enum': ['=', '!=', 'IN', 'NOT IN']
    };
    return BASIC_OPERATORS[fieldType] || ['=', '!='];
  }

  private createValidationConfig(field: any): FieldMeta['validation'] {
    const validation: FieldMeta['validation'] = {};
    
    if (field.min !== undefined) {
      validation.min = field.min;
    }
    
    if (field.max !== undefined) {
      validation.max = field.max;
    }
    
    if (field.type === 'number' || field.type === 'percent' || field.type === 'currency') {
      validation.required = false;
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
      case 'percent':
        return '15.5';
      case 'currency':
        return '50.25';
      case 'boolean':
        return 'true';
      case 'date':
        return '2024-01-15';
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
        root: this.convertScreenerGroup(criteria),
        meta: {
          version: 1,
          createdAt: new Date().toISOString(),
          source: 'screener',
          name: 'Converted from Screener Criteria',
          description: 'Automatically converted from existing screener criteria format'
        }
      };
    } catch (error) {
      console.error('Failed to convert ScreenerCriteria to DSL:', error);
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
      console.error('Failed to convert screener group:', error);
      throw error;
    }
  }

  private convertScreenerRule(rule: any): Condition {
    try {
      const condition: Condition = {
        left: {
          fieldId: rule.field
        } as FieldRef,
        op: rule.operator as Operator,
        right: undefined
      };

      if (rule.operator === 'IS NULL' || rule.operator === 'IS NOT NULL') {
        return condition;
      }

      if (rule.value !== null && rule.value !== undefined) {
        condition.right = {
          type: this.inferValueType(rule.value),
          value: rule.value
        } as Literal;
      }

      return condition;
    } catch (error) {
      console.error('Failed to convert screener rule:', error);
      throw error;
    }
  }

  private createEmptyDSL(): CriteriaDSL {
    return {
      root: {
        operator: 'AND',
        children: []
      },
      meta: {
        version: 1,
        createdAt: new Date().toISOString(),
        source: 'screener',
        name: 'Empty Criteria',
        description: 'Empty criteria set - no conditions defined'
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
      }
      return 'number';
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

      return 'string';
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
      console.error('Failed to convert DSL to ScreenerCriteria:', error);
      return undefined;
    }
  }

  private convertDslGroup(group: Group): ScreenerCriteria {
    const operator = group.operator === 'NOT' ? 'and' : group.operator.toLowerCase() as 'and' | 'or';
    
    return {
      condition: operator,
      rules: group.children.map((child: Condition | Group) => {
        if ('left' in child) {
          return this.convertDslCondition(child as Condition, group.operator === 'NOT');
        } else {
          return this.convertDslGroup(child as Group);
        }
      }),
      collapsed: false
    };
  }

  private convertDslCondition(condition: Condition, isNegated: boolean = false): any {
    const fieldId = (condition.left as FieldRef).fieldId;
    let operator = condition.op;
    if (isNegated) {
      operator = this.negateOperator(operator);
    }
    
    let value: any;
    if (condition.right) {
      if ('value' in condition.right) {
        value = (condition.right as Literal).value;
      } else if ('fieldId' in condition.right) {
        value = (condition.right as FieldRef).fieldId;
      } else {
        throw new Error('Function calls in conditions are not supported in basic conversion');
      }
    } else {
      value = null;
    }
    
    return {
      field: fieldId,
      operator: operator,
      value: value,
      entity: 'stock'
    };
  }

  private negateOperator(operator: Operator): Operator {
    const negationMap: Record<Operator, Operator> = {
      '=': '!=',
      '!=': '=',
      '>': '<=',
      '>=': '<',
      '<': '>=',
      '<=': '>',
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

  onValidityChange(isValid: boolean) {
    console.log('Criteria validity changed:', isValid);
  }

}
