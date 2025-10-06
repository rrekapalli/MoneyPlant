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
import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria, ScreenerRule } from '../../../services/entities/screener.entities';
import { INDICATOR_FIELDS } from '../../../services/entities/indicators.entities';
import { CriteriaBuilderComponent } from 'criteria-builder';
import { CriteriaDSL, BuilderConfig, FieldMeta, FieldType, Operator, Group, Condition, FieldRef, Literal } from 'criteria-builder';

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
    CriteriaBuilderComponent
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
    this.convertAndUpdateScreenerCriteria(value);
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



  private convertAndUpdateScreenerCriteria(dsl: CriteriaDSL | null) {
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
   * Implements subtask 3.2: Add ScreenerCriteria to CriteriaDSL conversion
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
          source: 'screener',
          name: 'Converted from Screener Criteria',
          description: 'Automatically converted from existing screener criteria format'
        }
      };
    } catch (error) {
      console.error('Failed to convert ScreenerCriteria to DSL:', error);
      this.handleConversionError(error);
      return this.createEmptyDSL();
    }
  }

  /**
   * Convert CriteriaDSL to ScreenerCriteria for backend
   * Implements subtask 3.1: Add CriteriaDSL to ScreenerCriteria conversion
   */
  private convertDslToScreenerCriteria(dsl: CriteriaDSL): ScreenerCriteria | undefined {
    if (!dsl || !dsl.root) {
      return undefined;
    }

    try {
      return this.convertDslGroup(dsl.root);
    } catch (error) {
      console.error('Failed to convert DSL to ScreenerCriteria:', error);
      this.handleConversionError(error);
      return undefined;
    }
  }

  /**
   * Convert ScreenerCriteria to DSL Group for recursive group conversion
   * Implements subtask 3.2: Add convertScreenerGroup method for recursive group conversion
   */
  private convertScreenerGroup(criteria: ScreenerCriteria): Group {
    return {
      operator: criteria.condition.toUpperCase() as 'AND' | 'OR',
      children: criteria.rules.map(rule => {
        if ('field' in rule) {
          // It's a ScreenerRule - convert to Condition
          return this.convertScreenerRule(rule as ScreenerRule);
        } else {
          // It's a nested ScreenerCriteria - convert recursively
          return this.convertScreenerGroup(rule as ScreenerCriteria);
        }
      })
    };
  }

  /**
   * Convert ScreenerRule to DSL Condition for individual rule conversion
   * Implements subtask 3.2: Add convertScreenerRule method for individual rule conversion
   */
  private convertScreenerRule(rule: ScreenerRule): Condition {
    const condition: Condition = {
      left: {
        fieldId: rule.field
      } as FieldRef,
      op: rule.operator as Operator,
      right: undefined
    };

    // Handle operators that don't require a right side value
    if (rule.operator === 'IS NULL' || rule.operator === 'IS NOT NULL') {
      // These operators don't need a right side
      return condition;
    }

    // Add right side for operators that require a value
    if (rule.value !== null && rule.value !== undefined) {
      condition.right = {
        type: this.inferValueType(rule.value),
        value: rule.value
      } as Literal;
    }

    return condition;
  }

  /**
   * Convert DSL Group to ScreenerCriteria for recursive group conversion
   * Implements subtask 3.1: Add convertDslGroup method for recursive group conversion
   */
  private convertDslGroup(group: Group): ScreenerCriteria {
    // Handle NOT operator by converting to AND with negated conditions
    const operator = group.operator === 'NOT' ? 'and' : group.operator.toLowerCase() as 'and' | 'or';
    
    return {
      condition: operator,
      rules: group.children.map((child: Condition | Group) => {
        if ('left' in child) {
          // It's a Condition - convert to ScreenerRule
          return this.convertDslCondition(child as Condition, group.operator === 'NOT');
        } else {
          // It's a nested Group - convert recursively
          return this.convertDslGroup(child as Group);
        }
      }),
      collapsed: false
    };
  }

  /**
   * Convert DSL Condition to ScreenerRule for individual condition conversion
   * Implements subtask 3.1: Add convertDslCondition method for individual condition conversion
   */
  private convertDslCondition(condition: Condition, isNegated: boolean = false): ScreenerRule {
    // Extract field ID from FieldRef
    const fieldId = (condition.left as FieldRef).fieldId;
    
    // Handle basic operator mapping between formats
    let operator = condition.op;
    if (isNegated) {
      operator = this.negateOperator(operator);
    }
    
    // Extract value from right side (Literal or FieldRef)
    let value: any;
    if (condition.right) {
      if ('value' in condition.right) {
        // It's a Literal
        value = (condition.right as Literal).value;
      } else if ('fieldId' in condition.right) {
        // It's a FieldRef - use field ID as value for field-to-field comparisons
        value = (condition.right as FieldRef).fieldId;
      } else {
        // It's a FunctionCall - not supported in basic conversion
        throw new Error('Function calls in conditions are not supported in basic conversion');
      }
    } else {
      // Handle operators that don't require right side (IS NULL, IS NOT NULL)
      value = null;
    }
    
    return {
      field: fieldId,
      operator: operator,
      value: value,
      entity: 'stock'
    };
  }

  /**
   * Handle basic operator mapping between formats
   * Implements subtask 3.1: Handle basic operator mapping between formats
   */
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

  /**
   * Implement inferValueType method for automatic type detection
   * Implements subtask 3.3: Add basic value type inference
   * Support number, string, boolean, and date type inference
   * Handle edge cases and default to string type
   */
  private inferValueType(value: any): FieldType {
    // Handle null and undefined values
    if (value === null || value === undefined) {
      return 'string'; // Default to string for null values
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return 'boolean';
    }

    // Handle number values (including integers and floats)
    if (typeof value === 'number') {
      // Check if it's an integer
      if (Number.isInteger(value)) {
        return 'integer';
      }
      return 'number';
    }

    // Handle string values - check for special patterns
    if (typeof value === 'string') {
      // Handle empty strings
      if (value.trim() === '') {
        return 'string';
      }

      // Check for boolean string representations
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === 'false') {
        return 'boolean';
      }

      // Check for numeric string representations
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        // Check if it's a percentage (ends with %)
        if (value.trim().endsWith('%')) {
          return 'percent';
        }
        
        // Check if it's a currency (starts with $ or other currency symbols)
        if (/^[\$€£¥₹]/.test(value.trim())) {
          return 'currency';
        }
        
        // Check if it's an integer string
        if (Number.isInteger(numericValue) && !value.includes('.')) {
          return 'integer';
        }
        
        return 'number';
      }

      // Check for date patterns (various formats)
      if (this.isDateString(value)) {
        return 'date';
      }

      // Default to string for all other cases
      return 'string';
    }

    // Handle Date objects
    if (value instanceof Date) {
      return 'date';
    }

    // Handle arrays (for IN/NOT IN operators)
    if (Array.isArray(value)) {
      // Infer type from first non-null element
      for (const item of value) {
        if (item !== null && item !== undefined) {
          return this.inferValueType(item);
        }
      }
      return 'string'; // Default if array is empty or all null
    }

    // Handle objects and other complex types
    if (typeof value === 'object') {
      // Try to convert to string and infer from that
      try {
        const stringValue = JSON.stringify(value);
        return 'string';
      } catch {
        return 'string';
      }
    }

    // Default fallback for any other type
    return 'string';
  }

  /**
   * Helper method to detect if a string represents a date
   * Handles edge cases for date detection
   */
  private isDateString(value: string): boolean {
    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO datetime
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    ];

    // Check against patterns
    for (const pattern of datePatterns) {
      if (pattern.test(value.trim())) {
        // Additional validation - try to parse as date
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    }

    // Try parsing with Date constructor as fallback
    const date = new Date(value);
    return !isNaN(date.getTime()) && value.length > 4; // Avoid treating years as dates
  }

  /**
   * Create empty DSL for null/empty cases
   * Implements subtask 3.2: Add createEmptyDSL method for null/empty cases
   */
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

  /**
   * Handle conversion errors with user-friendly messages
   * Used by data conversion methods for error handling
   */
  private handleConversionError(error: any): void {
    console.error('Data conversion error:', error);
    this.messageService.add({
      severity: 'warn',
      summary: 'Data Conversion',
      detail: 'There was an issue converting criteria data. Using empty criteria.',
      life: 5000
    });
  }
}
