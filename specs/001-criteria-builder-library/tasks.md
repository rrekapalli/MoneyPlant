# Implementation Tasks: Criteria Builder Library

**Feature**: Criteria Builder Library  
**Branch**: `001-criteria-builder-library`  
**Created**: 2024-12-19  
**Status**: Ready for Implementation  

## Overview

This document provides a bare minimum implementation task list for creating an Angular v20 library with a reusable `<mp-criteria-builder>` component. The component implements ControlValueAccessor for form integration, supports badge-based visual interface, and integrates with existing frontend API services.

**Total Tasks**: 47  
**Estimated Duration**: 3-4 weeks  
**MVP Scope**: User Story 1 (Basic Criteria Creation) - 15 tasks  

## Dependencies

### Story Completion Order
1. **Phase 1**: Setup (T001-T005) - Must complete first
2. **Phase 2**: Foundational (T006-T010) - Must complete before user stories
3. **Phase 3**: User Story 1 - Basic Criteria Creation (T011-T025) - MVP
4. **Phase 4**: User Story 2 - Grouped Criteria (T026-T035) - Depends on US1
5. **Phase 5**: User Story 3 - Function Integration (T036-T042) - Depends on US1
6. **Phase 6**: User Story 4 - Interactive Badge Management (T043-T047) - Depends on US1
7. **Phase 7**: User Story 5 - Form Integration (T048-T052) - Depends on US1

### Parallel Execution Opportunities
- **Phase 3**: T011-T014 can run in parallel (different files)
- **Phase 4**: T026-T029 can run in parallel (different files)
- **Phase 5**: T036-T039 can run in parallel (different files)

## Phase 1: Setup (Project Initialization)

### T001: Create Angular Library Structure
- [x] T001 Create project structure in frontend/projects/criteria-builder per implementation plan

### T002: Configure ng-packagr
- [x] T002 Configure ng-packagr for library packaging in frontend/projects/criteria-builder/ng-package.json

### T003: Setup Package Dependencies
- [x] T003 Configure package.json with Angular 20, PrimeNG 20, Angular CDK dependencies in frontend/projects/criteria-builder/package.json

### T004: Create Module Structure
- [x] T004 Create MpCriteriaBuilderModule with proper imports and exports in frontend/projects/criteria-builder/src/lib/criteria-builder.module.ts

### T005: Setup Public API
- [x] T005 Create public-api.ts with component and interface exports in frontend/projects/criteria-builder/src/public-api.ts

## Phase 2: Foundational (Blocking Prerequisites)

### T006: Create Core Data Models
- [ ] T006 Implement core data interfaces (CriteriaDSL, FieldMeta, FunctionMeta) in frontend/projects/criteria-builder/src/lib/models/criteria.models.ts

### T007: Create Configuration Interfaces
- [ ] T007 Implement configuration interfaces (CriteriaConfig, ValidationResult) in frontend/projects/criteria-builder/src/lib/models/config.models.ts

### T008: Create Event Interfaces
- [ ] T008 Implement event interfaces (BadgeActionEvent, CriteriaChangeEvent) in frontend/projects/criteria-builder/src/lib/models/event.models.ts

### T009: Create Constants and Utilities
- [ ] T009 Implement constants (DEFAULT_CONFIG, OPERATORS_BY_FIELD_TYPE) in frontend/projects/criteria-builder/src/lib/utils/constants.ts

### T010: Create Type Definitions
- [ ] T010 Implement type definitions (FieldType, Operator, LogicalOperator) in frontend/projects/criteria-builder/src/lib/types/criteria.types.ts

## Phase 3: User Story 1 - Basic Criteria Creation (MVP)

**Goal**: Users can create simple stock screening criteria using field comparisons and basic operators.

**Independent Test**: Create condition "Close > 100" and verify DSL output and SQL preview generation.

### T011: Create Main Component Shell
- [ ] T011 [P] [US1] Create MpCriteriaBuilderComponent shell with @Input/@Output properties in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T012: Implement ControlValueAccessor
- [ ] T012 [US1] Implement ControlValueAccessor interface in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T013: Create Field Badge Component
- [ ] T013 [P] [US1] Create FieldBadgeComponent for displaying field names in frontend/projects/criteria-builder/src/lib/components/badges/field-badge.component.ts

### T014: Create Operator Badge Component
- [ ] T014 [P] [US1] Create OperatorBadgeComponent for displaying operators in frontend/projects/criteria-builder/src/lib/components/badges/operator-badge.component.ts

### T015: Create Value Badge Component
- [ ] T015 [US1] Create ValueBadgeComponent for displaying literal values in frontend/projects/criteria-builder/src/lib/components/badges/value-badge.component.ts

### T016: Create Basic Template
- [ ] T016 [US1] Create basic template for rendering field-operator-value combinations in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.html

### T017: Implement DSL Generation
- [ ] T017 [US1] Implement basic DSL generation for simple conditions in frontend/projects/criteria-builder/src/lib/services/criteria-serializer.service.ts

### T018: Implement SQL Preview Generation
- [ ] T018 [US1] Implement basic SQL preview generation for simple conditions in frontend/projects/criteria-builder/src/lib/services/criteria-serializer.service.ts

### T019: Create Criteria Validation Service
- [ ] T019 [US1] Create CriteriaValidationService for validating field-operator-value combinations in frontend/projects/criteria-builder/src/lib/services/criteria-validation.service.ts

### T020: Implement Change Detection
- [ ] T020 [US1] Implement change detection and DSL emission in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T021: Add Basic Styling
- [ ] T021 [US1] Add basic CSS styling for badge components in frontend/projects/criteria-builder/src/lib/components/badges/badge.component.scss

### T022: Implement Field Selection
- [ ] T022 [US1] Implement field selection dropdown in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T023: Implement Operator Selection
- [ ] T023 [US1] Implement operator selection based on field type in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T024: Implement Value Input
- [ ] T024 [US1] Implement value input with type validation in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T025: Create Basic Tests
- [ ] T025 [US1] Create basic unit tests for MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.spec.ts

## Phase 4: User Story 2 - Grouped Criteria with Logical Operators

**Goal**: Users can create complex screening criteria using AND/OR/NOT groupings.

**Independent Test**: Create nested groups like "(Close > 100 AND Volume > 1000000)" and verify proper nesting.

### T026: Create Group Badge Component
- [ ] T026 [P] [US2] Create GroupBadgeComponent for displaying logical groups in frontend/projects/criteria-builder/src/lib/components/badges/group-badge.component.ts

### T027: Implement Group Creation
- [ ] T027 [US2] Implement group creation with AND/OR/NOT operators in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T028: Implement Curly Brace Toggle
- [ ] T028 [P] [US2] Implement curly brace toggle functionality in GroupBadgeComponent in frontend/projects/criteria-builder/src/lib/components/badges/group-badge.component.ts

### T029: Extend DSL Generation for Groups
- [ ] T029 [US2] Extend DSL generation to handle nested groups in frontend/projects/criteria-builder/src/lib/services/criteria-serializer.service.ts

### T030: Extend SQL Generation for Groups
- [ ] T030 [US2] Extend SQL generation to handle logical operators and parentheses in frontend/projects/criteria-builder/src/lib/services/criteria-serializer.service.ts

### T031: Implement Group Validation
- [ ] T031 [US2] Implement group structure validation in CriteriaValidationService in frontend/projects/criteria-builder/src/lib/services/criteria-validation.service.ts

### T032: Add Group Styling
- [ ] T032 [US2] Add CSS styling for group badges and nesting in frontend/projects/criteria-builder/src/lib/components/badges/group-badge.component.scss

### T033: Implement Group Template
- [ ] T033 [US2] Update template to render nested groups in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.html

### T034: Add Group Tests
- [ ] T034 [US2] Add unit tests for group functionality in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.spec.ts

### T035: Implement Nesting Depth Validation
- [ ] T035 [US2] Implement nesting depth validation (max 10 levels) in CriteriaValidationService in frontend/projects/criteria-builder/src/lib/services/criteria-validation.service.ts

## Phase 5: User Story 3 - Function Integration and Parameter Editing

**Goal**: Users can use technical analysis functions like SMA, EMA, RSI with proper parameter configuration.

**Independent Test**: Create function calls like "SMA(Close, 20) > 50" and verify parameter validation and SQL generation.

### T036: Create Function Badge Component
- [ ] T036 [P] [US3] Create FunctionBadgeComponent for displaying function calls in frontend/projects/criteria-builder/src/lib/components/badges/function-badge.component.ts

### T037: Implement Function Selection
- [ ] T037 [US3] Implement function selection dropdown in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T038: Implement Parameter Configuration
- [ ] T038 [US3] Implement parameter configuration for function calls in FunctionBadgeComponent in frontend/projects/criteria-builder/src/lib/components/badges/function-badge.component.ts

### T039: Extend DSL Generation for Functions
- [ ] T039 [US3] Extend DSL generation to handle function calls in frontend/projects/criteria-builder/src/lib/services/criteria-serializer.service.ts

### T040: Extend SQL Generation for Functions
- [ ] T040 [US3] Extend SQL generation to handle function SQL templates in frontend/projects/criteria-builder/src/lib/services/criteria-serializer.service.ts

### T041: Implement Function Validation
- [ ] T041 [US3] Implement function parameter validation in CriteriaValidationService in frontend/projects/criteria-builder/src/lib/services/criteria-validation.service.ts

### T042: Add Function Tests
- [ ] T042 [US3] Add unit tests for function functionality in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.spec.ts

## Phase 6: User Story 4 - Interactive Badge Management

**Goal**: Users can modify, reorder, and delete criteria elements through intuitive badge interactions.

**Independent Test**: Create criteria and modify them through badge interactions, verifying all changes reflect in DSL output.

### T043: Implement Drag and Drop
- [ ] T043 [US4] Implement drag and drop functionality using Angular CDK in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T044: Implement Delete Functionality
- [ ] T044 [US4] Implement delete functionality with confirmation in badge components in frontend/projects/criteria-builder/src/lib/components/badges/badge.component.ts

### T045: Implement Undo Functionality
- [ ] T045 [US4] Implement undo functionality with toast notifications in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T046: Add Hover States
- [ ] T046 [US4] Add hover states and visual feedback for badge interactions in frontend/projects/criteria-builder/src/lib/components/badges/badge.component.scss

### T047: Add Interaction Tests
- [ ] T047 [US4] Add unit tests for badge interactions in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.spec.ts

## Phase 7: User Story 5 - Form Integration and Validation

**Goal**: Developers can integrate the criteria builder into Angular reactive forms with proper validation and accessibility.

**Independent Test**: Embed component in reactive form and verify ControlValueAccessor implementation and accessibility features.

### T048: Implement Form Integration
- [ ] T048 [US5] Implement proper form integration with validation states in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T049: Implement Accessibility Features
- [ ] T049 [US5] Implement keyboard navigation and ARIA attributes in badge components in frontend/projects/criteria-builder/src/lib/components/badges/badge.component.ts

### T050: Implement Error Handling
- [ ] T050 [US5] Implement error handling and validation error display in MpCriteriaBuilderComponent in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.ts

### T051: Add Accessibility Tests
- [ ] T051 [US5] Add accessibility tests for keyboard navigation in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.spec.ts

### T052: Create Integration Tests
- [ ] T052 [US5] Create integration tests for form integration in frontend/projects/criteria-builder/src/lib/components/mp-criteria-builder.component.spec.ts

## Implementation Strategy

### MVP First Approach
1. **Phase 1-2**: Complete setup and foundational components
2. **Phase 3**: Implement User Story 1 (Basic Criteria Creation) - This provides a working component
3. **Incremental Delivery**: Add remaining user stories based on priority and feedback

### Parallel Execution Examples

**Phase 3 (US1) - Can run in parallel:**
- T011: Create component shell
- T013: Create field badge
- T014: Create operator badge
- T015: Create value badge

**Phase 4 (US2) - Can run in parallel:**
- T026: Create group badge
- T028: Implement curly brace toggle
- T032: Add group styling

**Phase 5 (US3) - Can run in parallel:**
- T036: Create function badge
- T037: Implement function selection
- T038: Implement parameter configuration

### Testing Strategy
- **Unit Tests**: Each component and service has corresponding test files
- **Integration Tests**: Form integration and ControlValueAccessor implementation
- **Accessibility Tests**: Keyboard navigation and ARIA compliance
- **Performance Tests**: DSL/SQL generation timing validation

### Success Criteria Validation
- **SC-001**: Users can create "Close > 100" in under 30 seconds
- **SC-002**: DSL generation completes within 100ms
- **SC-003**: Component handles 100 elements without degradation
- **SC-004**: 95% success rate for grouped criteria creation
- **SC-005**: SQL preview generation within 200ms

## Next Steps

1. **Start with Phase 1**: Complete project setup and configuration
2. **Focus on MVP**: Complete User Story 1 for basic functionality
3. **Iterate**: Add remaining user stories based on feedback and priority
4. **Test Continuously**: Run tests after each phase completion
5. **Document**: Update quickstart guide as features are implemented

**Suggested Next Command**: Begin with T001 (Create Angular Library Structure)
