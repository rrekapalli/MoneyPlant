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
import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria } from '../../../services/entities/screener.entities';
import { INDICATOR_FIELDS } from '../../../services/entities/indicators.entities';
import { CriteriaBuilderModule } from 'criteria-builder';
import { CriteriaDSL, BuilderConfig, FieldMeta, FieldType, Operator } from 'criteria-builder';

// Field type mapping constants
const FIELD_TYPE_MAPPING: Record<string, FieldType> = {
  'number': 'number',
  'string': 'string',
  'date': 'date',
  'boolean': 'boolean',
  'percent': 'percent',
  'currency': 'currency'
};

// Basic operator configuration for different field types
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
    CriteriaBuilderModule
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

  // Criteria Builder
  activeTab = 'basic';
  private _criteriaDSL: CriteriaDSL | null = null;
  
  get criteriaDSL(): CriteriaDSL | null {
    return this._criteriaDSL;
  }
  
  set criteriaDSL(value: CriteriaDSL | null) {
    this._criteriaDSL = value;
    this.onCriteriaChange(value);
  }
  
  criteriaConfig: BuilderConfig = {};
  
  // Static field configuration
  staticFields: FieldMeta[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private screenerState: ScreenerStateService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.initializeCriteriaConfig();
    this.loadStaticFields();
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
          
          // Convert criteria to DSL format if it exists
          if (screener.criteria) {
            this._criteriaDSL = this.convertScreenerCriteriaToDsl(screener.criteria);
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

  /**
   * Initialize criteria builder configuration with MVP settings
   */
  private initializeCriteriaConfig() {
    this.criteriaConfig = {
      // Basic grouping configuration for MVP
      allowGrouping: true,
      maxDepth: 3,
      
      // Disable advanced features for MVP
      enableAdvancedFunctions: false,
      showSqlPreview: false,
      
      // UI settings for better visibility
      compactMode: false,
      
      // Additional MVP settings
      enablePartialValidation: true,
      autoSave: false,
      debounceMs: 300,
      locale: 'en',
      theme: 'light'
    };
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

  private loadStaticFields() {
    // Convert INDICATOR_FIELDS to FieldMeta format
    this.staticFields = INDICATOR_FIELDS.map(field => this.convertIndicatorFieldToFieldMeta(field));
  }

  /**
   * Convert an IndicatorField to FieldMeta format for criteria builder
   */
  private convertIndicatorFieldToFieldMeta(field: any): FieldMeta {
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
      nullable: true, // Allow null values for technical indicators
      example: this.generateExampleValue(dataType, field)
    };
  }

  /**
   * Map field type from INDICATOR_FIELDS to FieldType
   */
  private mapFieldType(type: string): FieldType {
    return FIELD_TYPE_MAPPING[type] || 'string';
  }

  /**
   * Get basic operators for a specific field type
   */
  private getBasicOperatorsForType(fieldType: FieldType): Operator[] {
    return BASIC_OPERATORS[fieldType] || ['=', '!='];
  }

  /**
   * Create validation configuration for a field
   */
  private createValidationConfig(field: any): FieldMeta['validation'] {
    const validation: FieldMeta['validation'] = {};
    
    if (field.min !== undefined) {
      validation.min = field.min;
    }
    
    if (field.max !== undefined) {
      validation.max = field.max;
    }
    
    // Add specific validation for certain field types
    if (field.type === 'number' || field.type === 'percent' || field.type === 'currency') {
      validation.required = false; // Technical indicators can be null
    }
    
    return Object.keys(validation).length > 0 ? validation : undefined;
  }

  /**
   * Generate example value for field documentation
   */
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

  // Criteria Builder Methods
  onValidityChange(isValid: boolean) {
    // Handle validity changes if needed
    console.log('Criteria validity changed:', isValid);
  }



  private onCriteriaChange(dsl: CriteriaDSL | null) {
    // Convert to screener format for backend compatibility
    if (dsl && this.hasValidCriteria(dsl)) {
      this.screenerForm.criteria = this.convertDslToScreenerCriteria(dsl);
    } else {
      this.screenerForm.criteria = undefined;
    }
  }

  private hasValidCriteria(dsl: CriteriaDSL): boolean {
    return dsl && dsl.root && dsl.root.children && dsl.root.children.length > 0;
  }

  onTabChange(event: any) {
    this.activeTab = event.value;
  }

  /**
   * Convert ScreenerCriteria to CriteriaDSL for criteria builder
   */
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
          source: 'screener'
        }
      };
    } catch (error) {
      console.error('Failed to convert ScreenerCriteria to DSL:', error);
      return this.createEmptyDSL();
    }
  }

  /**
   * Convert CriteriaDSL to ScreenerCriteria for backend
   */
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

  private convertScreenerGroup(criteria: ScreenerCriteria): any {
    return {
      operator: criteria.condition.toUpperCase() as 'AND' | 'OR',
      children: criteria.rules.map(rule => {
        if ('field' in rule) {
          // It's a ScreenerRule - convert to Condition
          return this.convertScreenerRule(rule as any);
        } else {
          // It's a nested ScreenerCriteria - convert recursively
          return this.convertScreenerGroup(rule as ScreenerCriteria);
        }
      })
    };
  }

  private convertScreenerRule(rule: any): any {
    return {
      left: {
        fieldId: rule.field
      },
      op: rule.operator,
      right: {
        type: this.inferValueType(rule.value),
        value: rule.value
      }
    };
  }

  private convertDslGroup(group: any): ScreenerCriteria {
    return {
      condition: group.operator.toLowerCase() as 'and' | 'or',
      rules: group.children.map((child: any) => {
        if ('left' in child) {
          // It's a Condition - convert to ScreenerRule
          return this.convertDslCondition(child);
        } else {
          // It's a nested Group - convert recursively
          return this.convertDslGroup(child);
        }
      }),
      collapsed: false
    };
  }

  private convertDslCondition(condition: any): any {
    return {
      field: condition.left.fieldId,
      operator: condition.op,
      value: condition.right.value,
      entity: 'stock'
    };
  }

  private inferValueType(value: any): 'string' | 'number' | 'boolean' | 'date' {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    return 'string';
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
        source: 'screener'
      }
    };
  }

  clearCriteria() {
    this.criteriaDSL = null;
    this.screenerForm.criteria = undefined;
  }

  hasCriteria(): boolean {
    return this.criteriaDSL ? this.hasValidCriteria(this.criteriaDSL) : false;
  }

  getCriteriaCount(): number {
    if (!this.criteriaDSL || !this.criteriaDSL.root) return 0;
    return this.countConditions(this.criteriaDSL.root);
  }

  private countConditions(group: any): number {
    return group.children.reduce((count: number, child: any) => {
      if ('left' in child) {
        return count + 1; // It's a condition
      } else {
        return count + this.countConditions(child); // It's a nested group
      }
    }, 0);
  }
}
