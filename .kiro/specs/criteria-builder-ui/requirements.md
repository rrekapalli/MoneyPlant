# Requirements Document - Criteria Builder UI Library

## Introduction

This specification defines the requirements for building an Angular v20 library called `@projects/criteria-builder` that provides a sophisticated form control for composing human-readable criteria sentences. The library will enable users to build complex filtering conditions through both simple and advanced modes, generating both an internal JSON DSL and safe parameterized SQL WHERE clauses suitable for persistence and server execution.

## Requirements

### Requirement 1: Core Angular Library Structure

**User Story:** As a developer, I want to integrate a reusable criteria builder component into my Angular applications, so that I can provide consistent filtering capabilities across different screens.

#### Acceptance Criteria

1. WHEN the library is built THEN it SHALL be compatible with Angular v20 and use ng-packagr structure
2. WHEN the library is imported THEN it SHALL export AcCriteriaBuilderModule, AcCriteriaBuilderComponent, CriteriaSerializerService, and type definitions
3. WHEN the library is packaged THEN it SHALL have proper peerDependencies for Angular v20 and PrimeNG v20
4. WHEN the library is used THEN it SHALL be accessible via @projects/criteria-builder import path
5. WHEN the library is built THEN it SHALL be TypeScript-only with no AngularJS dependencies

### Requirement 2: Form Control Integration

**User Story:** As a developer, I want the criteria builder to work seamlessly with Angular Reactive Forms, so that I can validate and manage the criteria data like any other form control.

#### Acceptance Criteria

1. WHEN the component is used THEN it SHALL implement ControlValueAccessor interface
2. WHEN the form value changes THEN it SHALL emit the internal JSON DSL as the control value
3. WHEN writeValue is called THEN it SHALL properly populate the UI with the provided CriteriaDSL
4. WHEN the criteria becomes invalid THEN it SHALL emit validityChange event with false
5. WHEN the criteria becomes valid THEN it SHALL emit validityChange event with true
6. WHEN changes occur THEN it SHALL debounce updates by 200ms before calling onChange

### Requirement 3: Field and Function Configuration with Dynamic API Integration

**User Story:** As a developer, I want to configure available fields and functions for the criteria builder using dynamic API endpoints, so that users can build criteria using centrally managed and up-to-date data sources and operations.

#### Acceptance Criteria

1. WHEN fields input is provided THEN it SHALL accept FieldMeta[] with id, label, dbColumn, dataType, and optional properties from API endpoints
2. WHEN functions are loaded THEN it SHALL fetch FunctionMeta[] from criteria functions API with id, label, returnType, params loaded from criteria_functions and criteria_function_params tables
3. WHEN config input is provided THEN it SHALL accept BuilderConfig with allowGrouping, maxDepth, enableAdvancedFunctions settings
4. WHEN a field is selected THEN it SHALL only show operators compatible with the field's dataType using field-specific operator API
5. WHEN a function is used THEN it SHALL validate parameter types and required/optional status using database-stored parameter definitions
6. WHEN function metadata is requested THEN it SHALL call GET /api/screeners/criteria/functions to load active functions from criteria_functions table
7. WHEN function signature is needed THEN it SHALL call GET /api/screeners/criteria/functions/{functionId}/signature to get parameter details from criteria_function_params table
8. WHEN field operators are needed THEN it SHALL call GET /api/screeners/criteria/fields/{fieldId}/operators for field-specific operator compatibility
9. WHEN value suggestions are needed THEN it SHALL call GET /api/screeners/criteria/fields/{fieldId}/suggestions for dynamic value completion

### Requirement 3.1: API Integration Service

**User Story:** As a developer, I want the criteria builder to integrate with the backend API for dynamic function and field management, so that the UI always reflects the current database-driven configuration.

#### Acceptance Criteria

1. WHEN CriteriaApiService is initialized THEN it SHALL provide methods for fetching fields, functions, operators, and validation from backend API
2. WHEN functions are loaded THEN it SHALL call GET /api/screeners/criteria/functions and map response to FunctionMeta objects with parameters from database
3. WHEN function signature is requested THEN it SHALL call GET /api/screeners/criteria/functions/{functionId}/signature and return parameter details from criteria_function_params table
4. WHEN field operators are requested THEN it SHALL call GET /api/screeners/criteria/fields/{fieldId}/operators for field-specific compatibility
5. WHEN value suggestions are needed THEN it SHALL call GET /api/screeners/criteria/fields/{fieldId}/suggestions with query parameter for dynamic completion
6. WHEN DSL validation is required THEN it SHALL call POST /api/screeners/criteria/validate for server-side validation
7. WHEN SQL generation is needed THEN it SHALL call POST /api/screeners/criteria/sql for parameterized SQL generation
8. WHEN partial validation is required THEN it SHALL call POST /api/screeners/criteria/validate-partial for real-time feedback
9. WHEN criteria preview is requested THEN it SHALL call POST /api/screeners/criteria/preview for formatted preview and estimation
10. WHEN API calls fail THEN it SHALL provide fallback behavior and error handling with user-friendly messages

### Requirement 3.2: Visual Token System

**User Story:** As a user, I want to see my query represented as interactive visual tokens, so that I can understand and modify complex criteria easily.

#### Acceptance Criteria

1. WHEN query is displayed THEN it SHALL render each element as distinct visual tokens with appropriate styling
2. WHEN tokens represent different types THEN they SHALL use color coding (fields=blue, operators=gray, values=green, functions=purple)
3. WHEN tokens are interactive THEN they SHALL show hover states and click affordances
4. WHEN tokens are grouped THEN they SHALL show visual nesting with indentation and connecting lines
5. WHEN tokens are invalid THEN they SHALL display error styling with red borders and warning icons
6. WHEN query is complex THEN it SHALL use line wrapping and proper spacing for readability
7. WHEN tokens are focused THEN they SHALL show keyboard navigation indicators and shortcuts
8. WHEN query is empty THEN it SHALL show placeholder tokens with helpful text like "Click to add condition"

### Requirement 4: Dynamic Visual Query Builder Interface

**User Story:** As a business user, I want to build criteria using an intuitive visual interface with clickable elements, so that I can compose complex queries without typing code.

#### Acceptance Criteria

1. WHEN the interface loads THEN it SHALL display a visual query builder with clickable tokens and operators
2. WHEN a field token is clicked THEN it SHALL open a dropdown menu with available fields loaded from API and categorized by type
3. WHEN an operator is clicked THEN it SHALL show a dropdown with compatible operators fetched from field-specific operator API endpoint
4. WHEN a value token is clicked THEN it SHALL open appropriate input controls with suggestions from field suggestions API when available
5. WHEN function tokens are clicked THEN it SHALL open a dialog for function selection using functions loaded from criteria_functions table via API
6. WHEN parentheses are clicked THEN it SHALL allow grouping operations with visual nesting indicators
7. WHEN logical operators (AND/OR/NOT) are clicked THEN it SHALL provide dropdown selection for logic changes
8. WHEN hovering over tokens THEN it SHALL show tooltips with descriptions and available actions
9. WHEN tokens are selected THEN it SHALL highlight related elements and show contextual action buttons
10. WHEN "Add" button is clicked THEN it SHALL insert new condition tokens at the appropriate position
11. WHEN delete icons are clicked THEN it SHALL remove the associated condition with confirmation
12. WHEN conditions are complex THEN it SHALL use color coding and visual separators for clarity

### Requirement 5: Interactive Function and Expression Builder

**User Story:** As a power user, I want to build criteria using functions and expressions through interactive dialogs and visual elements, so that I can create complex technical analysis conditions intuitively.

#### Acceptance Criteria

1. WHEN function token is clicked THEN it SHALL open a modal dialog with function browser loaded from criteria_functions table with search and category filtering
2. WHEN a function is selected THEN it SHALL fetch function signature from API and show parameter configuration interface with database-stored parameter definitions
3. WHEN function parameters are functions THEN it SHALL support nested function selection through embedded dialogs using the same API-driven function list
4. WHEN function has optional parameters THEN it SHALL show them as collapsible sections using is_required flag from criteria_function_params table
5. WHEN function parameters are invalid THEN it SHALL show inline validation errors using validation_rules from database and help_text for guidance
6. WHEN function dialog is confirmed THEN it SHALL insert the function token into the query at cursor position with validated parameters
7. WHEN function token is double-clicked THEN it SHALL reopen the configuration dialog for editing using stored function signature
8. WHEN function parameter constraints exist THEN it SHALL apply validation_rules from criteria_function_params table for parameter validation
9. WHEN function preview is available THEN it SHALL show expected output format using function description and examples from criteria_functions table

### Requirement 6: Grouping and Logic Operations

**User Story:** As a user, I want to group conditions with AND/OR/NOT logic, so that I can build complex multi-level filtering criteria.

#### Acceptance Criteria

1. WHEN grouping is enabled THEN it SHALL allow creating nested groups with AND/OR/NOT operators
2. WHEN max depth is configured THEN it SHALL prevent nesting beyond the specified level
3. WHEN conditions are added to groups THEN it SHALL maintain proper parent-child relationships
4. WHEN groups are nested THEN it SHALL generate proper parentheses in SQL output
5. WHEN NOT operator is used THEN it SHALL properly negate the entire group condition

### Requirement 7: Interactive Token Management and Reordering

**User Story:** As a user, I want to manipulate query elements through drag and drop and contextual menus, so that I can organize my criteria efficiently.

#### Acceptance Criteria

1. WHEN drag is initiated on a token THEN it SHALL show visual feedback with drop zones highlighted
2. WHEN token is dropped THEN it SHALL update the internal DSL structure and refresh the visual representation
3. WHEN groups are reordered THEN it SHALL maintain all child conditions within the group with proper nesting
4. WHEN right-clicking on tokens THEN it SHALL show contextual menu with cut/copy/paste/delete options
5. WHEN drag operation is invalid THEN it SHALL show visual indication and snap back to original position
6. WHEN tokens are selected THEN it SHALL allow bulk operations like grouping or deletion
7. WHEN keyboard shortcuts are used THEN it SHALL support Ctrl+C/V/X for copy/paste/cut operations
8. WHEN undo/redo is triggered THEN it SHALL restore previous query states with visual transitions

### Requirement 8: SQL Generation and Preview

**User Story:** As a developer, I want to see the generated SQL and parameters, so that I can verify the criteria will produce the expected database query.

#### Acceptance Criteria

1. WHEN criteria is built THEN it SHALL call API to generate parameterized SQL with named parameters (:p1, :p2, etc.) using server-side SQL generation
2. WHEN SQL is generated THEN it SHALL be safe from SQL injection attacks through server-side parameterization and validation
3. WHEN functions are used THEN it SHALL apply SQL templates stored in criteria_functions table through API SQL generation endpoint
4. WHEN preview is shown THEN it SHALL display both SQL string and parameter object returned from API
5. WHEN SQL preview is clicked THEN it SHALL copy the SQL to clipboard
6. WHEN sqlPreviewChange event is emitted THEN it SHALL include both sql string and params object from API response

### Requirement 9: Validation and Error Handling

**User Story:** As a user, I want to see clear validation errors when my criteria is invalid, so that I can fix issues and create working filters.

#### Acceptance Criteria

1. WHEN field type mismatches operator THEN it SHALL show field compatibility error using server-side validation
2. WHEN required function parameters are missing THEN it SHALL show parameter required error based on is_required flag from criteria_function_params table
3. WHEN value format is invalid THEN it SHALL show value format error using validation_rules from database
4. WHEN fieldId or functionId is invalid THEN it SHALL show unknown reference error from API validation response
5. WHEN validation errors exist THEN it SHALL prevent SQL generation and show error banner with server-side validation results
6. WHEN partial validation is performed THEN it SHALL call API for real-time validation feedback during query building
7. WHEN validation rules are applied THEN it SHALL use validation_rules JSON from criteria_function_params table for parameter constraints

### Requirement 10: Import/Export and Persistence

**User Story:** As a user, I want to save and load my criteria configurations, so that I can reuse complex filters across sessions.

#### Acceptance Criteria

1. WHEN export is requested THEN it SHALL provide JSON representation of CriteriaDSL
2. WHEN import is requested THEN it SHALL accept and validate CriteriaDSL JSON
3. WHEN invalid JSON is imported THEN it SHALL show import error message
4. WHEN criteria is saved THEN it SHALL include metadata like name, description, version, createdBy, createdAt
5. WHEN preset is loaded THEN it SHALL populate the UI with the saved criteria structure

### Requirement 11: Accessibility and Internationalization

**User Story:** As a user with accessibility needs, I want the criteria builder to be keyboard navigable and screen reader friendly, so that I can use it effectively with the visual token interface.

#### Acceptance Criteria

1. WHEN using keyboard navigation THEN it SHALL support tab order through all interactive tokens and controls
2. WHEN screen reader is used THEN it SHALL provide proper ARIA labels describing token types and relationships
3. WHEN labels are configured THEN it SHALL support i18n tokens in FieldMeta and FunctionMeta
4. WHEN focus is on tokens THEN it SHALL show clear visual focus indicators with high contrast borders
5. WHEN actions are available THEN it SHALL provide keyboard shortcuts for add/remove/edit operations on tokens
6. WHEN tokens are selected THEN it SHALL announce the current selection and available actions to screen readers
7. WHEN visual relationships exist THEN it SHALL provide alternative text descriptions for grouping and nesting
8. WHEN color coding is used THEN it SHALL also provide shape or pattern indicators for colorblind users

### Requirement 12: Testing and Quality Assurance

**User Story:** As a developer, I want comprehensive tests and documentation, so that I can confidently integrate and maintain the criteria builder.

#### Acceptance Criteria

1. WHEN library is built THEN it SHALL include unit tests for ControlValueAccessor contract
2. WHEN serializer is tested THEN it SHALL cover edge cases like nested functions and complex operators
3. WHEN UI is tested THEN it SHALL cover condition add/edit/delete and grouping operations
4. WHEN security is tested THEN it SHALL validate protection against field/function injection
5. WHEN Storybook is provided THEN it SHALL include stories for simple mode, advanced mode, and grouped logic examples