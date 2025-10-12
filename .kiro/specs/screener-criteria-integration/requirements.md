# Requirements Document - Screener Form Criteria Builder Integration

## Introduction

This specification defines the requirements for integrating the existing criteria-builder library into the screener form component, replacing the current query-builder implementation. The focus is on implementing the bare minimum functionality first to get the integration working, with the ability to enhance features incrementally in future iterations.

## Requirements

### Requirement 1: Basic Library Replacement (MVP)

**User Story:** As a user creating or editing a screener, I want to use the new criteria-builder library instead of the query-builder, so that I can build screening criteria using the new interface.

#### Acceptance Criteria

1. WHEN the screener form loads THEN it SHALL import and use the criteria-builder library instead of query-builder
2. WHEN the criteria tab is accessed THEN it SHALL display the mp-criteria-builder component with basic configuration
3. WHEN the component is imported THEN it SHALL use the correct import path from @projects/criteria-builder
4. WHEN the old query-builder references are removed THEN the application SHALL compile without errors
5. WHEN the criteria builder is displayed THEN it SHALL render within the existing tab layout

### Requirement 2: Basic Data Integration (MVP)

**User Story:** As a developer, I want the criteria builder to work with the existing screener entity structure, so that criteria data can be saved and loaded without breaking current functionality.

#### Acceptance Criteria

1. WHEN screener criteria is saved THEN it SHALL convert the CriteriaDSL to ScreenerCriteria format for backend compatibility
2. WHEN existing screener is loaded THEN it SHALL convert ScreenerCriteria to CriteriaDSL format for the criteria builder
3. WHEN criteria changes THEN it SHALL update the screenerForm.criteria property with the converted data
4. WHEN screener is saved THEN it SHALL include the criteria data in the API request using existing screener endpoints
5. WHEN no criteria exists THEN it SHALL handle empty/null states gracefully

### Requirement 3: Basic Form Integration (MVP)

**User Story:** As a user, I want the criteria builder to work with the screener form, so that I can save my screener with criteria.

#### Acceptance Criteria

1. WHEN switching between tabs THEN the criteria data SHALL be preserved in the form state
2. WHEN the save button is clicked THEN it SHALL include criteria data in the screener submission
3. WHEN form is reset THEN it SHALL clear both basic info and criteria data
4. WHEN criteria is empty THEN it SHALL allow saving the screener without criteria
5. WHEN criteria exists THEN it SHALL save the screener with the criteria data

### Requirement 4: Static Field Configuration (MVP)

**User Story:** As a user building screening criteria, I want to use predefined fields for building criteria, so that I can create basic screening conditions.

#### Acceptance Criteria

1. WHEN the criteria builder initializes THEN it SHALL use a static list of available fields from INDICATOR_FIELDS
2. WHEN building criteria THEN it SHALL support basic field types (number, string, date, boolean)
3. WHEN selecting operators THEN it SHALL provide basic operators (=, !=, >, <, >=, <=) for each field type
4. WHEN entering values THEN it SHALL provide basic input controls for different data types
5. WHEN no API is available THEN it SHALL work with the static configuration without errors

### Requirement 5: Basic Error Handling (MVP)

**User Story:** As a user, I want to see basic error messages when something goes wrong, so that I can understand what needs to be fixed.

#### Acceptance Criteria

1. WHEN validation errors occur THEN it SHALL display basic error messages using the existing toast system
2. WHEN data conversion fails THEN it SHALL show a generic error message and use empty criteria
3. WHEN the component fails to load THEN it SHALL show an error state with a retry option
4. WHEN saving fails THEN it SHALL display the error using the existing error handling mechanism
5. WHEN criteria is invalid THEN it SHALL prevent form submission with a basic validation message

### Requirement 6: Basic Visual Integration (MVP)

**User Story:** As a user, I want the criteria builder to look consistent with the rest of the screener form, so that it feels like part of the same application.

#### Acceptance Criteria

1. WHEN the criteria tab is displayed THEN it SHALL use the existing card layout and styling
2. WHEN criteria are added THEN the criteria tab SHALL show a simple count badge
3. WHEN the criteria builder loads THEN it SHALL fit within the existing tab panel dimensions
4. WHEN no criteria exists THEN it SHALL show a simple empty state message
5. WHEN criteria actions are performed THEN they SHALL use the existing button styling

### Requirement 7: Future Enhancement Readiness

**User Story:** As a developer, I want the basic integration to be designed for future enhancements, so that advanced features can be added incrementally.

#### Acceptance Criteria

1. WHEN the integration is complete THEN it SHALL have clear extension points for API integration
2. WHEN the data mapping is implemented THEN it SHALL support adding more complex conversion logic later
3. WHEN the component configuration is set up THEN it SHALL allow for adding more advanced options
4. WHEN error handling is implemented THEN it SHALL support more sophisticated error management in the future
5. WHEN the basic functionality works THEN advanced features like dynamic fields, functions, and validation can be added incrementally