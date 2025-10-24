# Requirements Document

## Introduction

This specification defines the requirements for a production-ready Angular criteria builder component that provides a visual UI system for configuring complex query expressions. The component enables end users to dynamically compose sophisticated condition expressions through intuitive click-based interactions using a nested group-chip architecture. These visual expressions are automatically converted to JSON format (CriteriaDSL) and eventually processed by an SQL engine for data filtering in the MoneyPlant screener system.

The component replaces the placeholder implementation in the screeners-configure component (lines 81-91) and integrates seamlessly with existing backend API endpoints. It follows established patterns in the MoneyPlant frontend architecture while providing an innovative visual query builder that eliminates the need for users to write complex SQL or DSL syntax manually.

## Requirements

### Requirement 1

**User Story:** As a financial analyst, I want to create stock screening criteria using nestable group-chips with interactive popovers, so that I can build complex filtering logic exactly as shown in the reference design.

#### Acceptance Criteria

1. WHEN a user opens the criteria builder with no existing criteria THEN the system SHALL display 'Add Condition' button and when clicked, SHALL create a new empty group-chip with a curly braces icon '{}' on the left side as a superscript
2. WHEN a user clicks on the empty group-chip THEN the system SHALL open a PrimeNG popover with tabs for Fields, Operators, Math Functions, and Indicators
3. WHEN the popover opens THEN the system SHALL display field selection populated from `/api/screeners/fields` endpoint in the Fields tab
4. WHEN a user selects a field from the popover THEN the system SHALL create a new chip for that field within the group-chip and automatically show the "Operators" tab with compatible operators from `/api/screeners/fields/{fieldId}/operators`
5. WHEN a user selects an operator from the popover THEN the system SHALL create a new chip for that operator and display appropriate value input based on field data type
6. WHEN a user selects a function from the popover THEN the system SHALL create a new chip for that function and add placeholder chips for all required parameters
7. WHEN function parameter placeholder chips are created THEN the system SHALL allow users to click on them to configure values, other functions, or field references through the popover
8. WHEN a user completes configuring all elements THEN the system SHALL render the complete condition as nested chips within the group-chip with appropriate badges
9. WHEN the first group-chip is added THEN the system SHALL always display an encircled plus icon '+' after it to add additional group-chips at the same nesting level
10. WHEN a user clicks the '+' icon THEN the system SHALL create a new empty group-chip and display another encircled plus '+' icon after the new group-chip
11. WHEN multiple group-chips exist THEN the system SHALL continue displaying the '+' icon after the last group-chip to allow unlimited addition of conditional expressions
12. WHEN a user clicks on the curly braces '{}' icon THEN the system SHALL enable/disable grouping for all nested chips within that group-chip
13. WHEN group-chips are nested THEN the system SHALL support unlimited nesting levels up to the maximum depth limit of 10 levels
14. WHEN a user clicks on any existing group-chip or individual chip THEN the system SHALL open the popover with current values pre-filled
15. WHEN criteria changes occur THEN the system SHALL emit the updated CriteriaDSL structure within 100ms

### Requirement 2

**User Story:** As a portfolio manager, I want to use group-chips with logical operators and nesting capabilities, so that I can create sophisticated screening rules with proper precedence exactly as shown in the reference design.

#### Acceptance Criteria

1. WHEN a user has multiple group-chips at the same level THEN the system SHALL automatically apply logical operators (AND/OR/NOT) between them
2. WHEN a user clicks on a group-chip's operator area THEN the system SHALL open the popover with the "Operators" tab showing logical operators (AND, OR, NOT)
3. WHEN a user selects a logical operator THEN the system SHALL update the group-chip display and refresh the visual representation
4. WHEN a user clicks the curly braces '{}' icon on a group-chip THEN the system SHALL toggle the grouping state and visually indicate the grouped elements
5. WHEN group-chips are nested THEN the system SHALL enforce maximum depth limit of 10 levels and show visual hierarchy
6. WHEN total elements exceed 100 THEN the system SHALL prevent further additions and display a warning message
7. WHEN a user drags a group-chip THEN the system SHALL provide visual feedback and allow reordering within the same nesting level
8. WHEN group-chips contain nested elements THEN the system SHALL display them with proper indentation and visual containment
9. WHEN a group-chip is activated for grouping THEN the system SHALL show curly braces around the contained elements
10. WHEN nested group-chips are created THEN the system SHALL maintain the hierarchical structure as shown in the reference design

### Requirement 3

**User Story:** As a quantitative analyst, I want to use technical analysis functions within group-chips through interactive popovers, so that I can screen stocks based on calculated indicators with proper nesting.

#### Acceptance Criteria

1. WHEN a user clicks on any group-chip THEN the system SHALL open a PrimeNG Popover with tabs for "Fields", "Operators", "Math Functions", and "Indicators"
2. WHEN a user selects the "Math Functions" tab THEN the system SHALL display mathematical functions from `/api/screeners/functions` endpoint filtered by category
3. WHEN a user selects the "Indicators" tab THEN the system SHALL display technical analysis functions from `/api/screeners/functions` endpoint filtered by category
4. WHEN a user selects a function from the popover THEN the system SHALL fetch function signature from `/api/screeners/functions/{functionId}/signature` and create a new chip for that function
5. WHEN a function requires parameters THEN the system SHALL create placeholder chips for each parameter based on FunctionParameterResp definitions
6. WHEN a user clicks on parameter placeholder chips THEN the system SHALL open the popover to configure values, field references, or nested functions
7. WHEN a user enters function parameters THEN the system SHALL validate parameter types and show real-time feedback
8. WHEN a function is complete THEN the system SHALL render it within the group-chip showing function name and configured parameters as nested chips with badges
8. WHEN functions are used as operands THEN the system SHALL support nesting functions within other group-chips
9. WHEN a user clicks on an existing function within a group-chip THEN the system SHALL display the popover with current parameter values pre-filled
10. WHEN function parameters change THEN the system SHALL re-validate the function call and update the DSL
11. WHEN functions are nested within group-chips THEN the system SHALL maintain the hierarchical structure and visual containment
12. WHEN complex functions with multiple parameters are used THEN the system SHALL display them as nested group-chips with proper indentation

### Requirement 4

**User Story:** As a developer, I want the criteria builder to integrate seamlessly with Angular reactive forms, so that I can use it in existing form workflows.

#### Acceptance Criteria

1. WHEN the component is used with formControlName THEN the system SHALL implement ControlValueAccessor interface correctly
2. WHEN form validation occurs THEN the system SHALL reflect validation state through CSS classes and ARIA attributes
3. WHEN the form is disabled THEN the system SHALL disable all interactive elements and show read-only state
4. WHEN criteria validation fails THEN the system SHALL display error messages and prevent form submission
5. WHEN the component receives external value changes THEN the system SHALL update the visual representation accordingly
6. WHEN the component emits value changes THEN the system SHALL trigger form validation and change detection
7. WHEN keyboard navigation is used THEN the system SHALL support tab order through all interactive elements
8. WHEN screen readers are used THEN the system SHALL provide appropriate ARIA labels and descriptions

### Requirement 5

**User Story:** As a user, I want real-time validation and SQL preview, so that I can understand how my criteria will be executed.

#### Acceptance Criteria

1. WHEN criteria structure changes THEN the system SHALL call `/api/screeners/validate-partial-criteria` for real-time feedback
2. WHEN validation completes THEN the system SHALL display validation status with error/warning indicators on relevant chips
3. WHEN criteria is valid THEN the system SHALL call `/api/screeners/generate-sql` to show SQL preview
4. WHEN SQL generation succeeds THEN the system SHALL display formatted SQL with parameter placeholders
5. WHEN validation errors occur THEN the system SHALL highlight problematic chips with error styling and tooltips
6. WHEN validation warnings exist THEN the system SHALL show warning indicators without blocking usage
7. WHEN criteria preview is requested THEN the system SHALL call `/api/screeners/preview-criteria` and display human-readable description
8. WHEN API calls fail THEN the system SHALL show appropriate error messages and retry options

### Requirement 6

**User Story:** As a user, I want intuitive group-chip interactions using custom PrimeNG components, so that I can efficiently build and modify complex criteria through interactive popovers exactly as shown in the reference design.

#### Acceptance Criteria

1. WHEN group-chips are rendered THEN the system SHALL use custom components built on p-button with proper styling, spacing, and colors matching the reference design
2. WHEN group-chips display badges/indicators THEN the system SHALL show them as superscripts/subscripts using PrimeNG badge components
3. WHEN a user clicks on a group-chip THEN the system SHALL open a multi-tab popover using PrimeNG Popover component
4. WHEN the popover opens THEN the system SHALL display tabs for "Fields", "Operators", "Math Functions", and "Indicators" categories
5. WHEN a user selects the "Fields" tab THEN the system SHALL list available fields from the fields API
6. WHEN a user selects the "Operators" tab THEN the system SHALL list comparison operators (=, >, <, etc.) and logical operators (AND, OR, NOT)
7. WHEN a user selects the "Math Functions" tab THEN the system SHALL list mathematical functions (AVG, SUM, MIN, MAX, etc.) from the functions API
8. WHEN a user selects the "Indicators" tab THEN the system SHALL list technical analysis indicators (SMA, EMA, RSI, etc.) from the functions API
9. WHEN a user hovers over group-chips THEN the system SHALL show hover states with appropriate visual feedback
10. WHEN the curly braces '{}' icon is displayed THEN the system SHALL show it as a superscript on the left side of the group-chip
11. WHEN the encircled plus '+' icon is displayed THEN the system SHALL show it for adding additional group-chips at the same nesting level
12. WHEN drag operations occur THEN the system SHALL show drop zones and provide smooth visual transitions
13. WHEN group-chips are deleted THEN the system SHALL provide undo functionality with toast notification for 5 seconds
14. WHEN the interface is in compact mode THEN the system SHALL show condensed group-chip representations
15. WHEN the interface is in expanded mode THEN the system SHALL show detailed group-chip information with labels
16. WHEN responsive breakpoints are reached THEN the system SHALL adapt layout while maintaining usability and the nested structure

### Requirement 7

**User Story:** As a system integrator, I want the component to work with existing MoneyPlant services, so that it fits seamlessly into the current architecture.

#### Acceptance Criteria

1. WHEN the component initializes THEN the system SHALL use existing ScreenerApiService for all API communications
2. WHEN field suggestions are needed THEN the system SHALL call `/api/screeners/fields/{fieldId}/suggestions` with query filtering
3. WHEN authentication is required THEN the system SHALL use existing auth interceptors and error handling
4. WHEN API errors occur THEN the system SHALL use existing ToastService for user notifications
5. WHEN loading states are needed THEN the system SHALL use existing loading indicators and patterns
6. WHEN the component is destroyed THEN the system SHALL properly clean up subscriptions and resources
7. WHEN configuration changes THEN the system SHALL respect existing environment settings and feature flags
8. WHEN accessibility is required THEN the system SHALL follow existing WCAG 2.1 AA compliance patterns

## Edge Cases

- What happens when a user creates deeply nested groups exceeding the maximum depth limit of 10 levels?
- How does the system handle invalid function parameters or unsupported operator combinations?
- What occurs when a user deletes all criteria elements - does it reset to empty state or maintain structure?
- How does the system handle rapid chip creation/deletion without causing performance issues?
- What happens when field metadata or function definitions change after criteria are created?
- How does the system handle very large criteria structures approaching the 100 element limit?
- What occurs when API endpoints are temporarily unavailable during criteria building?
- How does the system handle concurrent editing scenarios in collaborative environments?