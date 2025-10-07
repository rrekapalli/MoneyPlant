import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, of } from 'rxjs';
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
import { CriteriaBuilderModule } from '@projects/criteria-builder';
import { CriteriaDSL, BuilderConfig, FieldMeta, FieldType, Operator, Group, Condition, FieldRef, Literal } from '@projects/criteria-builder';
import { CriteriaApiService, FieldMetaResp } from '@projects/criteria-builder';

/**
 * Static Field Configuration for Criteria Builder Integration
 * 
 * This section contains the static configuration used for the MVP implementation
 * of the criteria builder integration. These constants map the existing INDICATOR_FIELDS
 * to the format expected by the criteria-builder library.
 */

/**
 * Field type mapping from INDICATOR_FIELDS format to CriteriaBuilder FieldType
 * Maps the field types used in the existing screener system to the types expected
 * by the criteria-builder library for proper operator and validation handling.
 */
const FIELD_TYPE_MAPPING: Record<string, FieldType> = {
  'number': 'number',
  'string': 'string',
  'date': 'date',
  'boolean': 'boolean',
  'percent': 'percent',
  'currency': 'currency'
};

/**
 * Basic operator configuration for different field types
 * Defines which operators are available for each field type in the criteria builder.
 * This provides a static configuration for the MVP implementation, ensuring that
 * users can only select appropriate operators for each field type.
 */
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

/**
 * ScreenerFormComponent - Criteria Builder Integration
 * 
 * This component implements the MVP integration of the criteria-builder library
 * into the screener form, replacing the previous query-builder implementation.
 * 
 * ## Integration Approach
 * 
 * The integration follows a static configuration approach for the MVP:
 * - Uses INDICATOR_FIELDS as the static field source
 * - Implements bidirectional data conversion between ScreenerCriteria and CriteriaDSL formats
 * - Provides basic error handling and user feedback
 * - Maintains backward compatibility with existing screener data
 * 
 * ## Key Features
 * 
 * 1. **Static Field Configuration**: Converts INDICATOR_FIELDS to FieldMeta format
 * 2. **Data Conversion**: Bidirectional conversion between formats
 * 3. **Form Integration**: Seamless integration with existing screener form
 * 4. **Error Handling**: Basic error management with user-friendly messages
 * 5. **State Management**: Proper synchronization between DSL and screener formats
 * 
 * ## Data Flow
 * 
 * 1. Load existing screener → Convert ScreenerCriteria to CriteriaDSL
 * 2. User builds criteria → CriteriaDSL updated in real-time
 * 3. Save screener → Convert CriteriaDSL to ScreenerCriteria for backend
 * 
 * ## Extension Points
 * 
 * - Replace static fields with API-driven field loading
 * - Add advanced validation and error handling
 * - Implement dynamic operator configuration
 * - Add criteria templates and presets
 * 
 * @see {@link https://github.com/your-org/criteria-builder} Criteria Builder Library
 * @see {@link ./screener-form-integration.md} Integration Documentation
 */
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
    CriteriaBuilderModule // Criteria Builder integration - replaces QueryBuilderModule
  ],
  providers: [MessageService],
  templateUrl: './screener-form.component.html',
  styleUrl: './screener-form.component.scss'
})
export class ScreenerFormComponent implements OnInit, OnDestroy {
  /** Subscription management for component cleanup */
  private destroy$ = new Subject<void>();

  // === Component State ===

  /** Current screener being edited (null for new screeners) */
  screener: ScreenerResp | null = null;

  /** Loading state for async operations */
  loading = false;

  /** Error message for display to user */
  error: string | null = null;

  /** Whether component is in edit mode (true) or create mode (false) */
  isEdit = false;

  // === Form Data ===

  /** 
   * Main form data structure for screener creation/editing
   * This maintains the existing ScreenerCreateReq format for backend compatibility
   */
  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false,
    defaultUniverse: '',
    criteria: undefined // Will be populated from criteriaDSL conversion
  };

  // === Criteria Builder Integration ===

  /** Current active tab in the form interface */
  activeTab = 'basic';

  /** 
   * Internal storage for CriteriaDSL data
   * This is the format used by the criteria-builder component
   */
  private _criteriaDSL: CriteriaDSL | null = null;

  /** 
   * Getter for criteriaDSL with proper typing
   * @returns Current CriteriaDSL or null if no criteria defined
   */
  get criteriaDSL(): CriteriaDSL | null {
    return this._criteriaDSL;
  }

  /** 
   * Setter for criteriaDSL that triggers data conversion
   * Automatically converts DSL to ScreenerCriteria format when set
   * @param value - New CriteriaDSL value or null to clear criteria
   */
  set criteriaDSL(value: CriteriaDSL | null) {
    this._criteriaDSL = value;
    this.onCriteriaChange(value);
  }

  /** 
   * Configuration for the criteria builder component
   * Set up with MVP settings - basic functionality only
   */
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

  /** 
   * Static field configuration for criteria builder
   * Converted from INDICATOR_FIELDS to FieldMeta format
   * This provides the available fields for building criteria
   */
  staticFields: FieldMeta[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private screenerState: ScreenerStateService,
    private messageService: MessageService,
    private criteriaApiService: CriteriaApiService
  ) { }

  ngOnInit() {
    this.initializeSubscriptions();
    this.initializeCriteriaConfig();
    this.loadStaticFields();
    this.setupStaticFieldsForCriteriaBuilder();
    this.loadScreener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component subscriptions and handle criteria conversion on load
   * Implements subtask 5.2: Update form initialization for existing screeners
   * - Modify initializeSubscriptions to handle criteria conversion on load
   * - Add conversion from existing ScreenerCriteria to CriteriaDSL
   * - Set criteriaDSL property for criteria builder initialization
   * - Handle cases where existing screener has no criteria
   */
  private initializeSubscriptions() {
    this.screenerState.currentScreener$
      .pipe(takeUntil(this.destroy$))
      .subscribe(screener => {
        try {
          this.screener = screener;
          if (screener) {
            // Initialize form with screener data
            this.screenerForm = {
              name: screener.name,
              description: screener.description || '',
              isPublic: screener.isPublic,
              defaultUniverse: screener.defaultUniverse || '',
              criteria: screener.criteria
            };

            // Handle criteria conversion on load
            this.initializeCriteriaFromScreener(screener);
          } else {
            // Handle cases where existing screener has no criteria
            this.initializeEmptyForm();
          }
        } catch (error) {
          console.error('Error initializing screener form:', error);
          this.handleCriteriaError(error, 'load');
          this.initializeEmptyForm();
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
   * Initialize criteria from existing screener data
   * Add conversion from existing ScreenerCriteria to CriteriaDSL
   * Set criteriaDSL property for criteria builder initialization
   */
  private initializeCriteriaFromScreener(screener: ScreenerResp) {
    if (screener.criteria) {
      try {
        // Add conversion from existing ScreenerCriteria to CriteriaDSL
        const convertedDSL = this.convertScreenerCriteriaToDsl(screener.criteria);

        // Set criteriaDSL property for criteria builder initialization
        this._criteriaDSL = convertedDSL;

        console.log('Initialized criteria from existing screener:', {
          originalCriteria: screener.criteria,
          convertedDSL: convertedDSL,
          conditionCount: this.getCriteriaCount()
        });
      } catch (error) {
        console.error('Failed to convert existing criteria:', error);
        this.handleConversionError(error);

        // Handle cases where existing screener has no criteria (fallback)
        this._criteriaDSL = null;
      }
    } else {
      // Handle cases where existing screener has no criteria
      this._criteriaDSL = null;
      console.log('Screener has no existing criteria - initialized with empty state');
    }
  }

  /**
   * Initialize empty form state
   * Handle cases where screener loading fails or no screener exists
   */
  private initializeEmptyForm() {
    this.screenerForm = {
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: '',
      criteria: undefined
    };

    // Handle cases where existing screener has no criteria
    this._criteriaDSL = null;
    this.screener = null;
  }

  /**
   * Initialize criteria builder configuration with MVP settings
   * 
   * Sets up the BuilderConfig for the criteria-builder component with basic
   * functionality suitable for the MVP implementation. Advanced features are
   * disabled to keep the initial integration simple and stable.
   * 
   * ## Configuration Details:
   * 
   * - **Basic Grouping**: Allows AND/OR grouping up to 3 levels deep
   * - **Disabled Advanced Features**: No functions, SQL preview, or complex validation
   * - **UI Settings**: Non-compact mode for better visibility and usability
   * - **Performance**: Debounced updates to prevent excessive re-rendering
   * 
   * ## Future Enhancement Points:
   * 
   * - Enable advanced functions when field metadata supports them
   * - Add SQL preview for technical users
   * - Implement more sophisticated validation rules
   * - Add criteria templates and presets
   */
  private initializeCriteriaConfig() {
    this.criteriaConfig = {
      // Basic grouping configuration for MVP
      allowGrouping: true,
      maxDepth: 3,

      // Disable advanced features for MVP - can be enabled incrementally
      enableAdvancedFunctions: false, // TODO: Enable when field metadata supports functions
      showSqlPreview: false,          // TODO: Enable for technical users

      // UI settings for better visibility and usability
      compactMode: false,

      // Performance and UX settings
      enablePartialValidation: true,  // Allow partial criteria while building
      autoSave: false,               // Manual save to prevent accidental changes
      debounceMs: 300,              // Debounce updates for better performance
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
        error: () => {
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
      error: () => {
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

  /**
   * Setup static fields for criteria builder by overriding API service
   * This method provides our INDICATOR_FIELDS to the criteria-builder component
   * by mocking the API service getFields method for MVP integration
   */
  private setupStaticFieldsForCriteriaBuilder() {
    try {
      // Convert our static fields to FieldMetaResp format expected by criteria-builder
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

      console.log('Successfully setup static fields for criteria-builder:', {
        fieldCount: criteriaBuilderFields.length,
        categories: [...new Set(criteriaBuilderFields.map(f => f.category))]
      });

    } catch (error) {
      console.error('Failed to setup static fields for criteria-builder:', error);
      this.handleCriteriaError(error, 'load');
    }
  }

  /**
   * Load and configure static fields for the criteria builder
   * 
   * This method implements the static field configuration approach for the MVP.
   * It converts the existing INDICATOR_FIELDS array to the FieldMeta format
   * expected by the criteria-builder library.
   * 
   * ## Static Field Configuration Process:
   * 
   * 1. **Field Conversion**: Maps each INDICATOR_FIELD to FieldMeta format
   * 2. **Type Mapping**: Converts field types using FIELD_TYPE_MAPPING
   * 3. **Operator Assignment**: Assigns appropriate operators for each field type
   * 4. **Validation Setup**: Configures basic validation rules
   * 5. **Error Handling**: Provides fallback behavior on conversion failure
   * 
   * ## Future Enhancement Points:
   * 
   * - Replace with API-driven field loading
   * - Add dynamic field categorization
   * - Implement field-specific validation rules
   * - Add field usage analytics and recommendations
   * 
   * @throws Handles conversion errors gracefully with user notification
   */
  private loadStaticFields() {
    try {
      // Convert INDICATOR_FIELDS to FieldMeta format for criteria builder
      this.staticFields = INDICATOR_FIELDS.map(field => this.convertIndicatorFieldToFieldMeta(field));

      console.log(`Successfully loaded ${this.staticFields.length} static fields for criteria builder`, {
        fieldCount: this.staticFields.length,
        categories: [...new Set(this.staticFields.map(f => f.category))],
        fieldTypes: [...new Set(this.staticFields.map(f => f.dataType))]
      });

    } catch (error) {
      console.error('Failed to load static fields:', error);
      this.handleCriteriaError(error, 'load');

      // Provide fallback behavior (empty fields array)
      this.staticFields = [];

      this.messageService.add({
        severity: 'warn',
        summary: 'Field Loading Error',
        detail: 'Failed to load available fields. Criteria builder may have limited functionality.',
        life: 5000
      });
    }
  }

  /**
   * Convert an IndicatorField to FieldMeta format for criteria builder
   * 
   * This method handles the conversion from the existing INDICATOR_FIELDS format
   * to the FieldMeta format expected by the criteria-builder library. It includes
   * comprehensive error handling and fallback behavior.
   * 
   * ## Conversion Process:
   * 
   * 1. **Type Mapping**: Maps field.type to FieldType using FIELD_TYPE_MAPPING
   * 2. **Operator Assignment**: Assigns operators based on field type
   * 3. **Validation Setup**: Creates validation configuration from field properties
   * 4. **Example Generation**: Generates appropriate example values
   * 5. **Error Handling**: Provides fallback configuration on conversion failure
   * 
   * @param field - The IndicatorField from INDICATOR_FIELDS to convert
   * @returns FieldMeta object configured for the criteria builder
   * @throws Handles conversion errors gracefully with fallback configuration
   */
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
        nullable: true, // Allow null values for technical indicators
        example: this.generateExampleValue(dataType, field)
      };
    } catch (error) {
      console.error('Failed to convert indicator field to FieldMeta:', error, field);
      // Provide fallback behavior (basic field configuration)
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

  /**
   * Handle criteria changes from the criteria builder
   * Implements subtask 5.1: Update onCriteriaChange method
   * - Modify method to accept CriteriaDSL instead of QueryRuleSet
   * - Add conversion from CriteriaDSL to ScreenerCriteria format
   * - Update screenerForm.criteria with converted data
   * - Handle null/empty criteria cases gracefully
   */
  onCriteriaChange(dsl: CriteriaDSL | null) {
    try {
      // Update the internal DSL state
      this._criteriaDSL = dsl;

      // Handle null/empty criteria cases gracefully
      if (!dsl || !this.hasValidCriteria(dsl)) {
        this.screenerForm.criteria = undefined;
        console.log('Criteria cleared or invalid - set to undefined');
        return;
      }

      // Add conversion from CriteriaDSL to ScreenerCriteria format
      const convertedCriteria = this.convertDslToScreenerCriteria(dsl);

      // Update screenerForm.criteria with converted data
      this.screenerForm.criteria = convertedCriteria;

      console.log('Criteria updated:', {
        dslConditions: this.getCriteriaCount(),
        convertedCriteria: convertedCriteria
      });

    } catch (error) {
      console.error('Error in onCriteriaChange:', error);
      this.handleCriteriaError(error, 'change');

      // Fallback to empty criteria on error
      this._criteriaDSL = null;
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
    try {
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
    } catch (error) {
      console.error('Failed to convert screener group:', error);
      throw error; // Re-throw to be handled by parent conversion method
    }
  }

  /**
   * Convert ScreenerRule to DSL Condition for individual rule conversion
   * Implements subtask 3.2: Add convertScreenerRule method for individual rule conversion
   */
  private convertScreenerRule(rule: ScreenerRule): Condition {
    try {
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
    } catch (error) {
      console.error('Failed to convert screener rule:', error);
      throw error; // Re-throw to be handled by parent conversion method
    }
  }

  /**
   * Convert DSL Group to ScreenerCriteria for recursive group conversion
   * Implements subtask 3.1: Add convertDslGroup method for recursive group conversion
   */
  private convertDslGroup(group: Group): ScreenerCriteria {
    try {
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
    } catch (error) {
      console.error('Failed to convert DSL group:', error);
      throw error; // Re-throw to be handled by parent conversion method
    }
  }

  /**
   * Convert DSL Condition to ScreenerRule for individual condition conversion
   * Implements subtask 3.1: Add convertDslCondition method for individual condition conversion
   */
  private convertDslCondition(condition: Condition, isNegated: boolean = false): ScreenerRule {
    try {
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
    } catch (error) {
      console.error('Failed to convert DSL condition:', error);
      throw error; // Re-throw to be handled by parent conversion method
    }
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

  /**
   * Clear all criteria data
   * Implements subtask 5.3: Update clearCriteria method
   * - Update clearCriteria to reset both criteriaDSL and screenerForm.criteria
   * - Ensure proper state synchronization between formats
   */
  clearCriteria() {
    try {
      // Reset both criteriaDSL and screenerForm.criteria
      this._criteriaDSL = null;
      this.screenerForm.criteria = undefined;

      console.log('Criteria cleared - both DSL and screener format reset');

      // Show user feedback
      this.messageService.add({
        severity: 'info',
        summary: 'Criteria Cleared',
        detail: 'All screening criteria have been removed.',
        life: 3000
      });

    } catch (error) {
      console.error('Error clearing criteria:', error);
      this.handleCriteriaError(error, 'convert');
    }
  }

  /**
   * Check if criteria exists and is valid
   * Implements subtask 5.3: Modify hasCriteria to work with CriteriaDSL structure
   * - Ensure proper state synchronization between formats
   */
  hasCriteria(): boolean {
    try {
      // Check if criteriaDSL exists and has valid criteria
      const hasValidDSL = this._criteriaDSL ? this.hasValidCriteria(this._criteriaDSL) : false;

      // Check if screenerForm.criteria exists (for state synchronization)
      const hasScreenerCriteria = this.screenerForm.criteria !== undefined && this.screenerForm.criteria !== null;

      // Ensure proper state synchronization between formats
      // Both should be in sync - if one exists, the other should too
      if (hasValidDSL !== hasScreenerCriteria) {
        console.warn('Criteria state synchronization issue detected:', {
          hasValidDSL,
          hasScreenerCriteria,
          dslConditions: this.getCriteriaCount(),
          screenerCriteria: this.screenerForm.criteria
        });

        // Try to resync by converting from the existing format
        try {
          if (hasValidDSL && !hasScreenerCriteria && this._criteriaDSL) {
            // DSL exists but screener format doesn't - convert DSL to screener format
            this.screenerForm.criteria = this.convertDslToScreenerCriteria(this._criteriaDSL);
          } else if (!hasValidDSL && hasScreenerCriteria && this.screenerForm.criteria) {
            // Screener format exists but DSL doesn't - convert screener to DSL format
            this._criteriaDSL = this.convertScreenerCriteriaToDsl(this.screenerForm.criteria);
          }
        } catch (error) {
          console.error('Failed to synchronize criteria state:', error);
          this.handleConversionError(error);
          // Reset both to prevent inconsistent state
          this._criteriaDSL = null;
          this.screenerForm.criteria = undefined;
          return false;
        }
      }

      return hasValidDSL;

    } catch (error) {
      console.error('Error checking criteria existence:', error);
      // Return false on error to prevent issues
      return false;
    }
  }

  getCriteriaCount(): number {
    try {
      if (!this.criteriaDSL || !this.criteriaDSL.root) return 0;
      return this.countConditions(this.criteriaDSL.root);
    } catch (error) {
      console.error('Failed to count criteria conditions:', error);
      return 0; // Provide fallback behavior (return 0 on error)
    }
  }

  private countConditions(group: any): number {
    try {
      return group.children.reduce((count: number, child: any) => {
        if ('left' in child) {
          return count + 1; // It's a condition
        } else {
          return count + this.countConditions(child); // It's a nested group
        }
      }, 0);
    } catch (error) {
      console.error('Failed to count conditions in group:', error);
      return 0; // Provide fallback behavior (return 0 on error)
    }
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

  /**
   * Handle criteria-related errors with context-specific messages
   * Used by criteria handling methods for error management
   */
  private handleCriteriaError(error: any, context: string): void {
    console.error(`Criteria error in ${context}:`, error);

    const userMessage = this.getBasicErrorMessage(context);
    this.messageService.add({
      severity: 'error',
      summary: 'Criteria Error',
      detail: userMessage,
      life: 5000
    });
  }

  /**
   * Get user-friendly error messages based on context
   */
  private getBasicErrorMessage(context: string): string {
    const contextMessages: Record<string, string> = {
      'load': 'Failed to load existing criteria. Starting with empty criteria.',
      'save': 'Failed to save screener. Please check your criteria and try again.',
      'convert': 'There was an issue with the criteria format. Please recreate your criteria.',
      'change': 'Failed to process criteria changes. Please try again.'
    };

    return contextMessages[context] || 'An unexpected error occurred. Please try again.';
  }
}
