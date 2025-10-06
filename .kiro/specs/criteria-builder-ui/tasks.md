# Implementation Plan - Criteria Builder UI Library

- [x] 1. Set up Angular library project structure and core interfaces
  - Create Angular library using `ng generate library criteria-builder` in `./frontend/projects/`
  - Configure ng-packagr build setup with proper exports in public-api.ts
  - Set up TypeScript interfaces for CriteriaDSL, FieldMeta, FunctionMeta, and BuilderConfig
  - Configure library to use PrimeNG v20 as peer dependency
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement core data models and token system types
  - [x] 2.1 Create TypeScript interfaces for DSL structure
    - Define CriteriaDSL, Group, Condition, FunctionCall, FieldRef, and Literal interfaces
    - Implement FieldType enum and Operator type definitions
    - Create ValidationError and ValidationResult interfaces
    - _Requirements: 3.1, 3.2, 9.1, 9.2_
  - [x] 2.2 Create visual token system type definitions
    - Define QueryToken interface with type, display, interaction, and styling properties
    - Implement TokenType enum and TokenStyle interfaces for visual representation
    - Create OverlayConfig and OverlayAction interfaces for interaction management
    - Add DropdownOption interface for selection overlays
    - _Requirements: 3.1.1, 3.1.2, 3.1.3, 3.1.4_
  - [x] 2.3 Create field and function metadata models
    - Implement FieldMeta interface with validation rules and formatting options
    - Create FunctionMeta interface with parameter definitions and SQL templates
    - Define BuilderConfig interface for component configuration
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 2.4 Write unit tests for data model validation
    - Test interface type checking and validation logic
    - Verify enum and type constraint enforcement
    - Test token system type definitions
    - _Requirements: 12.1, 12.2_

- [x] 3. Create CriteriaApiService for backend integration and CriteriaSerializerService for local operations
  - [x] 3.1 Implement CriteriaApiService for API integration
    - Create service methods for fetching fields, functions, and operators from backend API
    - Implement function signature retrieval from criteria_functions and criteria_function_params tables via API
    - Add field operator compatibility and value suggestions API calls
    - Implement server-side validation and SQL generation API calls
    - Add error handling and fallback behavior for API failures
    - _Requirements: 3.1.1, 3.1.2, 3.1.3, 3.1.4, 3.1.5, 3.1.6, 3.1.7, 3.1.8, 3.1.9, 3.1.10_
  - [x] 3.2 Implement CriteriaSerializerService for local DSL operations
    - Create local DSL validation methods for immediate feedback
    - Implement DSL to token conversion for visual representation
    - Add local validation for structure and basic type checking
    - Create import/export functionality for CriteriaDSL JSON
    - _Requirements: 9.1, 9.2, 10.1, 10.2, 10.3_

  - [ ]* 3.3 Write comprehensive unit tests for API and serializer services
    - Test API service with mock HTTP responses and error scenarios
    - Test local DSL validation and token conversion logic
    - Test import/export functionality with various DSL structures
    - _Requirements: 12.2, 12.4_

- [x] 4. Build main AcCriteriaBuilderComponent with visual token interface
  - [x] 4.1 Create component shell with ControlValueAccessor implementation
    - Implement writeValue, registerOnChange, and registerOnTouched methods
    - Set up reactive form structure with FormArray and FormGroup
    - Add debounced change detection (200ms) and validation state management
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [x] 4.2 Implement component inputs, outputs, and API integration
    - Add @Input properties for config and optional override data
    - Create @Output events for validityChange and sqlPreviewChange
    - Set up BehaviorSubject streams for reactive state management
    - Integrate CriteriaApiService to load fields, functions, and operators dynamically
    - Add error handling for API failures with fallback behavior
    - _Requirements: 2.1, 2.4, 2.5, 8.6, 3.1.1, 3.1.2, 3.1.10_
  - [x] 4.3 Create component template with token-based query display
    - Design responsive layout using TokenQueryDisplayComponent
    - Integrate toolbar, error banner, and SQL preview components
    - Add placeholder for empty query state with "Click to add condition"
    - _Requirements: 4.1, 4.2, 4.9, 4.10, 4.11, 4.12_

  - [ ]* 4.4 Write unit tests for ControlValueAccessor implementation
    - Test form integration and change propagation
    - Verify debouncing and validation state management
    - Test token-based interface integration
    - _Requirements: 12.1_

- [x] 5. Implement BuilderToolbarComponent for mode switching and actions
  - Create toolbar with simple/advanced mode toggle using PrimeNG ToggleButton
  - Add import/export functionality with JSON file handling
  - Implement save/load presets with local storage integration
  - Add clear all and SQL preview toggle buttons
  - _Requirements: 10.1, 10.2, 10.3, 8.5_

- [ ] 6. Build TokenQueryDisplayComponent for visual query representation
  - [ ] 6.1 Create token-based query rendering system
    - Implement DSL to token conversion logic with proper depth and positioning
    - Create token layout with visual grouping, indentation, and separators
    - Add placeholder state for empty queries with interactive add buttons
    - _Requirements: 4.1, 4.2, 4.9, 4.10, 4.11, 4.12_

  - [ ] 6.2 Integrate Angular CDK drag-and-drop for token reordering
    - Set up cdkDropList and cdkDrag directives for token reordering
    - Implement drop validation and visual feedback during drag operations
    - Add drag handles and drop zone indicators for tokens
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 6.3 Write unit tests for token display and drag-and-drop
    - Test DSL to token conversion and visual representation
    - Verify drag-and-drop reordering functionality
    - Test token selection and interaction states
    - _Requirements: 12.3_

- [ ] 7. Create TokenRendererComponent for individual token display and interaction
  - [ ] 7.1 Build token visual representation with styling system
    - Implement token styling based on type (field=blue, operator=gray, value=green, function=purple)
    - Add hover, focus, selected, and error states with appropriate visual feedback
    - Create token layout with icon, text, dropdown indicator, and delete button
    - _Requirements: 3.1.1, 3.1.2, 3.1.3, 3.1.5, 3.1.6_

  - [ ] 7.2 Implement token interaction handlers
    - Add click, double-click, right-click, and keyboard event handlers
    - Implement hover and focus state management
    - Create token selection and deletion functionality
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.11_

  - [ ] 7.3 Add accessibility features for tokens
    - Implement ARIA labels and descriptions for screen readers
    - Add keyboard navigation support with tab order
    - Create focus indicators and keyboard shortcuts
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ]* 7.4 Write unit tests for token rendering and interaction
    - Test token styling and visual state changes
    - Verify interaction handlers and event propagation
    - Test accessibility features and keyboard navigation
    - _Requirements: 12.3_

- [ ] 8. Build InteractionOverlayManagerComponent for dynamic overlays and dialogs
  - [ ] 8.1 Create overlay management system
    - Implement overlay positioning and lifecycle management
    - Create dropdown, dialog, context menu, and value input overlay types
    - Add click-outside-to-close and keyboard navigation support
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.1, 5.6, 5.7, 5.8, 5.9_

  - [ ] 8.2 Build specific overlay content components
    - Create DropdownContentComponent for field, operator, and function selection
    - Implement FunctionDialogContentComponent for function configuration
    - Build ValueInputContentComponent for different value types (numeric, date, enum, multi-select)
    - Add ContextMenuComponent for token actions (cut, copy, paste, delete)
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.3 Write unit tests for overlay management
    - Test overlay positioning and lifecycle management
    - Verify overlay content components and interactions
    - Test keyboard navigation and accessibility features
    - _Requirements: 12.3_

- [ ] 9. Create FunctionDialogContentComponent for database-driven function configuration
  - [ ] 9.1 Build function selection and parameter editing dialog with API integration
    - Implement function browser using functions loaded from criteria_functions table via API
    - Create dynamic parameter editors based on FunctionSignature from API with parameter definitions from criteria_function_params table
    - Add support for nested function calls in parameters with embedded token renderers using the same API-driven function list
    - Implement search, categorization, and filtering using database-stored category and description fields
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.8, 5.9_

  - [ ] 9.2 Implement function parameter validation and preview using database constraints
    - Validate required vs optional parameters using is_required flag from criteria_function_params table
    - Check parameter type compatibility and show validation errors using validation_rules from database
    - Add function preview with expected output format using description and examples from criteria_functions table
    - Display help text from criteria_function_params table for parameter guidance
    - _Requirements: 5.5, 5.9, 9.1, 9.2, 9.7_

  - [ ]* 9.3 Write unit tests for function dialog
    - Test function selection and parameter validation
    - Verify nested function call handling and dialog interactions
    - Test function preview and validation feedback
    - _Requirements: 12.3_

- [ ] 10. Build DropdownContentComponent for API-driven token selection overlays
  - Create searchable dropdown content for field selection using fields loaded from API with database-stored categorization
  - Implement operator dropdown using field-specific operator API endpoint for compatibility filtering
  - Build function selection dropdown using functions from criteria_functions table with search and category filtering
  - Add tooltips, descriptions, and help text using database-stored description and help_text fields
  - Implement value suggestions dropdown using field suggestions API for dynamic completion
  - Implement keyboard navigation and selection within dropdowns
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 3.1.4, 3.1.5, 3.1.9_

- [ ] 11. Implement SqlPreviewComponent with API-driven SQL generation
  - Create collapsible SQL preview panel using PrimeNG Panel
  - Integrate with CriteriaApiService to generate SQL using server-side API endpoint
  - Display formatted SQL with syntax highlighting using API-generated parameterized queries
  - Show parameter values from API response in separate section
  - Add copy-to-clipboard functionality for SQL and parameters
  - Implement real-time updates when criteria changes using debounced API calls
  - Add error handling for SQL generation failures with user-friendly messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 12. Build ErrorBannerComponent for API-driven validation feedback
  - Create error display using PrimeNG Messages component for server-side validation results
  - Implement expandable error details with JSONPath references from API validation response
  - Add error highlighting that focuses on problematic elements using validation paths
  - Create warning display for performance and complexity issues from server validation
  - Integrate with partial validation API for real-time feedback during query building
  - Display validation errors from database constraints and parameter validation rules
  - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 13. Enhance accessibility features for token-based interface
  - Implement comprehensive ARIA labels and descriptions for all tokens and overlays
  - Add keyboard shortcuts for token manipulation (add, edit, delete, group)
  - Create focus management for token navigation and overlay interactions
  - Add screen reader announcements for token changes and query structure
  - Implement high contrast mode support with alternative visual indicators
  - Add shape and pattern indicators for colorblind users alongside color coding
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [ ] 14. Implement import/export and persistence functionality
  - [ ] 14.1 Create JSON import/export with validation
    - Implement CriteriaDSL JSON serialization and deserialization
    - Add import validation with error reporting
    - Create export functionality with metadata inclusion
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 14.2 Add preset management with local storage
    - Implement save/load preset functionality
    - Create preset management UI with naming and descriptions
    - Add preset sharing and import/export capabilities
    - _Requirements: 10.4, 10.5_

- [ ] 15. Create comprehensive test suite and documentation
  - [ ]* 15.1 Write integration tests for complete workflows
    - Test end-to-end criteria building scenarios
    - Verify form integration and validation workflows
    - Test import/export and preset functionality
    - _Requirements: 12.3_

  - [ ]* 15.2 Create Storybook stories for all components
    - Build stories for simple mode, advanced mode, and grouped logic
    - Create interactive examples with different field and function configurations
    - Add documentation for component APIs and usage patterns
    - _Requirements: 12.5_

  - [ ] 15.3 Write comprehensive README and API documentation
    - Document installation and setup instructions
    - Provide usage examples with code samples
    - Document security considerations and best practices
    - Create troubleshooting guide and FAQ section
    - _Requirements: 12.5_

- [ ] 16. Package library and configure build pipeline
  - Configure ng-packagr for library packaging with proper peer dependencies
  - Set up build scripts for development and production builds
  - Create package.json with correct Angular v20 and PrimeNG v20 peer dependencies
  - Configure library exports in public-api.ts
  - Set up automated testing in CI/CD pipeline
  - _Requirements: 1.3, 1.4, 12.1, 12.2_