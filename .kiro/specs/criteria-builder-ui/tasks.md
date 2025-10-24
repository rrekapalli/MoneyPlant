# Implementation Plan

- [x] 1. Set up Angular library project structure and core interfaces
  - Create Angular library project in ./frontend/projects/criteria-builder using ng-packagr
  - Define core TypeScript interfaces (CriteriaBuilderConfig, ChipViewModel, PopoverContext)
  - Set up barrel exports in public-api.ts for library consumers
  - Configure build scripts and library dependencies in package.json
  - _Requirements: FR-001, FR-011_

- [x] 2. Implement core data models and DSL integration
  - [x] 2.1 Create CriteriaDSL data models matching backend structure
    - Implement CriteriaDSL, Group, Condition, FieldRef, FunctionCall, Literal interfaces
    - Create type guards and validation utilities for DSL objects
    - _Requirements: FR-007, FR-008_

  - [x] 2.2 Build DSL Builder Service for JSON conversion
    - Implement service to convert UI state to CriteriaDSL JSON format
    - Create methods for adding, updating, and removing criteria elements
    - Add validation for DSL structure integrity and nesting limits
    - _Requirements: FR-007, FR-012_

  - [x] 2.3 Create Chip Factory Service for dynamic chip creation
    - Implement factory pattern for creating different chip types (group, condition, function, parameter)
    - Add methods for generating placeholder chips for function parameters
    - Create chip ID generation and parent-child relationship management
    - _Requirements: FR-003, FR-006_

- [x] 3. Build core chip components with PrimeNG integration
  - [x] 3.1 Implement base chip component using p-button
    - Create abstract base chip component with common functionality (hover, click, badges)
    - Implement badge system using PrimeNG badge component for superscripts/subscripts
    - Add accessibility features (ARIA labels, keyboard navigation, focus management)
    - _Requirements: FR-002, FR-010, FR-016_

  - [x] 3.2 Create group-chip component with nesting support
    - Implement group-chip component extending base chip with curly braces '{}' icon
    - Add encircled plus '+' icon functionality for adding sibling chips
    - Implement visual hierarchy with proper indentation and containment styling
    - Add drag-and-drop support for reordering within groups
    - _Requirements: FR-004, FR-005, FR-016_

  - [x] 3.3 Build condition-chip component for field/operator/value display
    - Create condition chip component for displaying field, operator, and value elements
    - Implement individual chip creation for each selection (field, operator, value)
    - Add delete functionality with hover states and confirmation
    - _Requirements: FR-002, FR-003, FR-016_

  - [x] 3.4 Implement function-chip component with parameter management
    - Create function chip component with parameter placeholder generation
    - Add nested function support and parameter validation indicators
    - Implement expandable parameter view for complex functions
    - _Requirements: FR-006, FR-016_

- [x] 4. Create multi-tab popover system using PrimeNG
  - [x] 4.1 Build popover container with tab navigation
    - Implement PrimeNG Popover component with TabView for Fields, Operators, Math Functions, Indicators
    - Add context-aware tab display based on chip type and current state
    - Implement popover positioning and responsive behavior
    - _Requirements: FR-003, FR-006_

  - [x] 4.2 Implement Fields tab with API integration
    - Create fields tab component displaying field metadata from /api/screeners/fields
    - Add field selection functionality with search and filtering
    - Implement field categorization and grouping for better UX
    - _Requirements: FR-003, FR-011_

  - [x] 4.3 Build Operators tab with dynamic operator loading
    - Create operators tab showing compatible operators from /api/screeners/fields/{fieldId}/operators
    - Implement logical operators (AND, OR, NOT) and comparison operators (=, >, <, etc.)
    - Add operator validation and compatibility checking
    - _Requirements: FR-004, FR-011_

  - [x] 4.4 Create Math Functions and Indicators tabs
    - Implement function tabs displaying functions from /api/screeners/functions filtered by category
    - Add function signature loading from /api/screeners/functions/{functionId}/signature
    - Create parameter input fields based on FunctionParameterResp definitions
    - _Requirements: FR-006, FR-011_

- [x] 5. Implement API integration services
  - [x] 5.1 Create criteria API service extending existing ScreenerApiService
    - Add methods for field metadata, function metadata, and operator compatibility
    - Implement validation API calls (/api/screeners/validate-criteria, /api/screeners/validate-partial-criteria)
    - Add SQL generation API integration (/api/screeners/generate-sql)
    - _Requirements: FR-008, FR-009, FR-011_

  - [x] 5.2 Build caching layer for metadata and validation results
    - Implement LRU cache for field and function metadata to reduce API calls
    - Add cache invalidation strategies and refresh mechanisms
    - Create debounced validation to prevent excessive API requests
    - _Requirements: Performance optimization_

- [x] 6. Implement real-time validation and SQL preview
  - [x] 6.1 Create validation service with real-time feedback
    - Implement real-time validation using /api/screeners/validate-partial-criteria
    - Add validation state management and error display on chips
    - Create validation result caching and debouncing for performance
    - _Requirements: FR-009, FR-011_

  - [x] 6.2 Build SQL preview component
    - Implement SQL preview panel using /api/screeners/generate-sql
    - Add formatted SQL display with syntax highlighting
    - Create human-readable preview using /api/screeners/preview-criteria
    - _Requirements: FR-008, FR-011_

- [ ] 7. Implement ControlValueAccessor and form integration
  - [ ] 7.1 Build form integration with ControlValueAccessor pattern
    - Implement ControlValueAccessor interface for seamless Angular reactive forms integration
    - Add form validation integration with custom validators
    - Create disabled state handling and read-only mode
    - _Requirements: FR-001, FR-009_

  - [ ] 7.2 Add change detection and event emission
    - Implement change detection optimization using OnPush strategy
    - Add event emitters for DSL changes, validation changes, and SQL preview updates
    - Create proper subscription management and cleanup
    - _Requirements: FR-013_

- [ ] 8. Build drag-and-drop and interaction features
  - [ ] 8.1 Implement drag-and-drop functionality
    - Add CDK drag-and-drop support for reordering chips within groups
    - Implement visual feedback during drag operations with drop zones
    - Add constraints for valid drop targets and nesting rules
    - _Requirements: FR-005_

  - [ ] 8.2 Create undo functionality and user feedback
    - Implement undo system for delete operations with 5-second timeout
    - Add toast notifications using existing ToastService for user feedback
    - Create confirmation dialogs for destructive actions
    - _Requirements: FR-014_

- [ ] 9. Add accessibility and responsive design
  - [ ] 9.1 Implement WCAG 2.1 AA accessibility compliance
    - Add comprehensive keyboard navigation support for all interactive elements
    - Implement proper ARIA labels, roles, and state attributes
    - Create screen reader announcements for dynamic content changes
    - Add focus management and logical tab order
    - _Requirements: FR-010_

  - [ ] 9.2 Build responsive design and compact/expanded modes
    - Implement responsive layout that adapts to different screen sizes
    - Add compact and expanded display modes for different use cases
    - Create proper breakpoint handling while maintaining nested structure
    - _Requirements: FR-015, FR-016_

- [ ] 10. Integration with screeners-configure component
  - [ ] 10.1 Replace placeholder implementation in screeners-configure
    - Remove placeholder content from lines 81-91 in screeners-configure.component.html
    - Integrate mp-criteria-builder component with proper form binding
    - Add configuration options and event handling
    - _Requirements: Integration requirement_

  - [ ] 10.2 Add component styling and theming
    - Implement component styling matching MoneyPlant design system
    - Add theme support for light/dark modes using existing theme service
    - Create proper spacing, colors, and visual hierarchy matching reference design
    - _Requirements: FR-016_

- [ ] 11. Testing and quality assurance
  - [ ] 11.1 Write comprehensive unit tests
    - Create unit tests for all components, services, and utilities
    - Add test coverage for chip interactions, popover functionality, and API integration
    - Implement mock services and test data for isolated testing
    - _Requirements: Testing strategy_

  - [ ] 11.2 Build integration and E2E tests
    - Create integration tests for form integration and API communication
    - Add E2E tests for complete user workflows and complex scenarios
    - Implement visual regression tests for component layouts and responsive behavior
    - _Requirements: Testing strategy_

- [ ] 12. Documentation and library packaging
  - [ ] 12.1 Create comprehensive documentation
    - Write API documentation for all public interfaces and components
    - Create usage examples and integration guides
    - Add troubleshooting guide and FAQ section
    - _Requirements: Library requirement_

  - [ ] 12.2 Package and publish library
    - Configure ng-packagr for proper library building and packaging
    - Set up library versioning and release process
    - Create distribution package ready for npm publishing
    - _Requirements: Library requirement_