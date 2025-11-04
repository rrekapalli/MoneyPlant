# Implementation Plan

- [x] 1. Set up QueryBuilder library project structure
  - Create new library project directory under `frontend/projects/querybuilder`
  - Configure Angular workspace settings in `angular.json` for the new library
  - Set up TypeScript configuration files for library compilation
  - Create ng-package.json for library packaging configuration
  - _Requirements: 1.1, 2.2_

- [x] 2. Implement core data models and interfaces following Angular-QueryBuilder pattern
  - [x] 2.1 Create query builder data models exactly matching Angular-QueryBuilder
    - Define QueryBuilderConfig, Field, RuleSet, Rule, and Option interfaces
    - Implement LocalRuleMeta interface and OPERATORS constant
    - Create validation error interfaces and utility types
    - _Requirements: 1.2, 2.1_

  - [x] 2.2 Create stock field configuration models using Angular-QueryBuilder Field format
    - Define stock-specific field configurations with defaultValue and defaultOperator properties
    - Implement sector, market cap, financial ratio field definitions with proper options arrays
    - Create operator mappings for different field types following Angular-QueryBuilder pattern
    - _Requirements: 3.3, 4.3_

- [x] 3. Implement core service layer replicating Angular-QueryBuilder logic
  - [x] 3.1 Create QueryBuilderService with exact Angular-QueryBuilder methods
    - Implement getOperators, getInputType, getOptions methods exactly as in Angular-QueryBuilder
    - Create addRule, addRuleSet, removeRule, removeRuleSet methods with same logic
    - Add validateRuleset method and query state management functionality
    - _Requirements: 2.3, 3.3_

  - [x] 3.2 Implement QueryBuilderConfigService following Angular-QueryBuilder pattern
    - Create service to provide stock field configurations in Angular-QueryBuilder format
    - Implement methods to get operators for specific field types using same logic
    - Add field validation and constraint logic matching Angular-QueryBuilder behavior
    - _Requirements: 3.3, 4.3_

  - [ ]* 3.3 Write unit tests for services
    - Create unit tests for QueryBuilderService validation methods
    - Write tests for FieldConfigurationService field retrieval
    - Test query format conversion functionality
    - _Requirements: 2.3, 3.3_

- [x] 4. Create query builder UI components following Angular-QueryBuilder structure
  - [x] 4.1 Implement QueryBuilderComponent with compact design
    - Create main query builder component replicating Angular-QueryBuilder template structure
    - Implement input/output properties matching Angular-QueryBuilder API exactly
    - Add compact template with minimal spacing and small PrimeNG components
    - Implement query change event handling and validation using Angular-QueryBuilder logic
    - _Requirements: 2.1, 3.1, 4.1_

  - [x] 4.2 Create QuerySwitchGroupComponent for AND/OR conditions
    - Implement condition switcher component using compact PrimeNG Select with size="small"
    - Add condition change event handling matching Angular-QueryBuilder behavior
    - Create template with minimal spacing for compact layout
    - _Requirements: 3.1, 4.1_

  - [x] 4.3 Implement QueryButtonGroupComponent for add actions
    - Create add rule/group buttons using compact PrimeNG Button components with size="small"
    - Implement button group layout with minimal spacing
    - Add event handling for add operations matching Angular-QueryBuilder
    - _Requirements: 3.1, 4.1_

  - [x] 4.4 Create QueryEntityComponent for rules and rulesets
    - Implement rule/ruleset container component with compact padding
    - Add recursive rendering logic exactly matching Angular-QueryBuilder
    - Create template with horizontal layout and minimal vertical spacing
    - _Requirements: 3.1, 4.1_

  - [x] 4.5 Implement QueryFieldDetailsComponent for field/operator/value
    - Create horizontal layout component using compact PrimeNG components
    - Implement field, operator, and value inputs with size="small" and minimal spacing
    - Add dynamic input type switching based on field type and operator
    - _Requirements: 3.1, 4.1_

  - [x] 4.6 Create QueryOperationComponent for operator selection
    - Implement operator dropdown using PrimeNG Select with size="small"
    - Add dynamic operator filtering based on selected field exactly as Angular-QueryBuilder
    - Create compact template with minimal width
    - _Requirements: 3.1, 4.1_

  - [x] 4.7 Implement QueryInputComponent for value inputs
    - Create dynamic input component using compact PrimeNG components (InputText, InputNumber, Calendar, Checkbox, MultiSelect all with size="small")
    - Add support for all input types with compact sizing and minimal padding
    - Implement value validation and change event handling matching Angular-QueryBuilder
    - _Requirements: 3.1, 4.1_

  - [x] 4.8 Create QueryRemoveButtonComponent with minimal size
    - Implement remove button using PrimeNG Button with size="small" and icon-only design
    - Add confirmation logic for removing rule groups
    - Create compact button with minimal padding and margin
    - _Requirements: 3.1, 4.1_

- [x] 5. Style and theme integration with compact design focus
  - [x] 5.1 Create compact component stylesheets
    - Implement SCSS styles with CSS custom properties for compact spacing (4px-8px margins/padding)
    - Override PrimeNG component sizes to create smaller variants (32px height inputs)
    - Add compact typography with smaller font sizes (0.875rem)
    - Create horizontal layout styles with minimal vertical spacing
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Integrate with application theme maintaining compact design
    - Use existing CSS custom properties for theming with PrimeNG v20 theme system
    - Ensure proper contrast and accessibility compliance with smaller components
    - Test compact design with different PrimeNG v20 themes
    - Validate space efficiency and readability
    - _Requirements: 4.1, 4.2_

- [x] 6. Library packaging and build configuration
  - [x] 6.1 Configure library build system
    - Update angular.json with library build configuration
    - Set up proper TypeScript compilation settings
    - Configure ng-packagr for library distribution
    - _Requirements: 1.1, 2.2, 5.1_

  - [x] 6.2 Create public API exports
    - Define public-api.ts with exported components and services
    - Ensure proper module exports for library consumers
    - Add barrel exports for clean import paths
    - _Requirements: 1.1, 5.4_

  - [x] 6.3 Update main application build configuration
    - Add library to main application build dependencies
    - Update package.json build scripts to include library
    - Test library compilation and integration
    - _Requirements: 5.1, 5.3_

- [x] 7. Integrate with screeners configure component
  - [x] 7.1 Update ScreenersConfigureComponent imports
    - Add QueryBuilderComponent import to screeners configure component
    - Update component imports array with query builder dependencies
    - Add ViewChild reference for query builder component
    - _Requirements: 3.1, 4.1, 4.2_

  - [x] 7.2 Implement query builder integration logic
    - Add query configuration property with stock field definitions
    - Implement query change event handlers
    - Add validation state management for query builder
    - Create methods to convert between query format and screener criteria
    - _Requirements: 3.2, 3.3, 4.2_

  - [x] 7.3 Update screeners configure template with compact integration
    - Add query builder component to template with minimal space allocation
    - Integrate with existing form layout ensuring compact design doesn't break layout
    - Add proper error handling and validation display with small message components
    - Test integration to ensure query builder uses minimal real estate
    - _Requirements: 3.1, 4.1, 4.2_

- [x] 8. API integration and data conversion
  - [x] 8.1 Implement query to API format conversion
    - Create methods to convert RuleSet to ScreenerCriteria format
    - Handle different field types and operators in conversion
    - Add validation for API-compatible query structures
    - _Requirements: 3.3, 4.3_

  - [x] 8.2 Implement API to query format conversion
    - Create methods to convert ScreenerCriteria to RuleSet format
    - Handle loading existing screener configurations
    - Add error handling for invalid API data
    - _Requirements: 3.3, 4.3_

  - [x] 8.3 Update screener service integration
    - Modify screener save/load methods to use new query format
    - Add validation before API calls
    - Implement proper error handling and user feedback
    - _Requirements: 3.3, 4.3_

- [-] 9. Testing and validation
  - [ ]* 9.1 Create component unit tests
    - Write unit tests for all query builder components
    - Test component inputs, outputs, and event handling
    - Mock dependencies and test component isolation
    - _Requirements: 2.1, 3.1_

  - [ ]* 9.2 Create integration tests
    - Test query builder integration with screeners configure component
    - Test API format conversion functionality
    - Validate complete user workflow from UI to API
    - _Requirements: 3.2, 3.3, 4.2_

  - [x] 9.3 Perform manual testing and validation focusing on compact design
    - Test query builder functionality in development environment with space constraints
    - Validate screener creation and editing workflows with compact UI
    - Test with different query complexities and field types to ensure readability
    - Verify compact design works well within screeners configure component layout
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 10. Documentation and finalization
  - [ ] 10.1 Update component documentation
    - Add JSDoc comments to all public methods and properties
    - Document component inputs, outputs, and usage examples
    - Create README for the query builder library
    - _Requirements: 4.4, 5.4_

  - [ ] 10.2 Verify Angular v20 and PrimeNG v20 compatibility with Angular-QueryBuilder logic
    - Test library compilation with Angular v20 and PrimeNG v20 components only
    - Validate standalone component patterns and Angular-QueryBuilder logic replication
    - Ensure TypeScript 5.8 compatibility and compact design functionality
    - Verify no third-party UI dependencies are used and space efficiency is maintained
    - _Requirements: 2.1, 2.2, 2.3_