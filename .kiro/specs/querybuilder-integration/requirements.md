# Requirements Document

## Introduction

This feature involves creating a custom QueryBuilder library that replicates the exact implementation pattern and core logic from the Angular QueryBuilder (https://github.com/shout/Angular-QueryBuilder) for the MoneyPlant frontend application. The library will be added as a new project under `./frontend/projects/querybuilder`, built with Angular v20 and PrimeNG v20 components only, and integrated into the screeners configure component with a compact UI design to minimize real estate usage while providing advanced query building capabilities for stock screening functionality.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to create a custom QueryBuilder library for the MoneyPlant frontend project structure, so that it can be used as a reusable component library within the application.

#### Acceptance Criteria

1. WHEN the library is created THEN it SHALL be located in `./frontend/projects/querybuilder` directory
2. WHEN the library is built THEN it SHALL be compatible with Angular v20 used in the main application
3. WHEN the library is packaged THEN it SHALL follow Angular library conventions with proper ng-package.json configuration
4. WHEN dependencies are resolved THEN the library SHALL use compatible versions with the main application's package.json

### Requirement 2

**User Story:** As a developer, I want the QueryBuilder library to be built with Angular v20 and PrimeNG v20 components only, so that it integrates seamlessly with the existing application architecture.

#### Acceptance Criteria

1. WHEN the library code is created THEN it SHALL use only Angular v20 and PrimeNG v20 components and APIs
2. WHEN components are implemented THEN they SHALL use only PrimeNG v20 UI components and no third-party dependencies
3. WHEN TypeScript compilation occurs THEN it SHALL compile without errors using the project's TypeScript configuration
4. WHEN the library is imported THEN it SHALL work with the application's module system and dependency injection
5. WHEN building the library THEN it SHALL produce valid Angular library artifacts (UMD, ESM, etc.)

### Requirement 3

**User Story:** As a user configuring stock screeners, I want to use an advanced query builder interface in the screeners configure component, so that I can create complex filtering criteria with an intuitive visual interface.

#### Acceptance Criteria

1. WHEN I navigate to the screeners configure page THEN I SHALL see the query builder component integrated with a compact UI design that minimizes space usage
2. WHEN I interact with the query builder THEN I SHALL be able to add, remove, and modify filter conditions using the same interaction patterns as the original Angular-QueryBuilder
3. WHEN I build a query THEN the component SHALL output the query in a format compatible with the screener API
4. WHEN I save a screener configuration THEN the query builder state SHALL be persisted and retrievable
5. WHEN the query builder is displayed THEN it SHALL use minimal vertical and horizontal space to accommodate integration within existing forms

### Requirement 4

**User Story:** As a developer, I want the query builder integration to follow the existing application patterns, so that it maintains consistency with the current codebase architecture.

#### Acceptance Criteria

1. WHEN the component is integrated THEN it SHALL follow the existing component structure and naming conventions
2. WHEN services are created THEN they SHALL use the established service patterns and dependency injection
3. WHEN types are defined THEN they SHALL be consistent with existing entity definitions
4. WHEN the component communicates with APIs THEN it SHALL use the existing API service patterns

### Requirement 5

**User Story:** As a developer, I want proper build configuration for the new library, so that it can be built, tested, and distributed as part of the monorepo structure.

#### Acceptance Criteria

1. WHEN the library is built THEN it SHALL integrate with the existing Angular workspace configuration
2. WHEN tests are run THEN the library SHALL have proper test configuration and can be tested independently
3. WHEN the main application is built THEN it SHALL successfully include the query builder library
4. WHEN the library is published THEN it SHALL be available for import in other parts of the application