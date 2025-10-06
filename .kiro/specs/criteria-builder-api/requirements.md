# Requirements Document - Criteria Builder API

## Introduction

This specification defines the requirements for extending the existing MoneyPlant screener package to support the Criteria Builder UI library. The API will provide endpoints for managing field metadata, function definitions, criteria validation, SQL generation, and secure execution of user-defined criteria against the database. This enhancement leverages the existing screener infrastructure (ScreenerVersion.dsl_json, compiled_sql, execution framework) by adding new entities, services, and endpoints directly within the existing screener package structure. The backend component ensures security, performance, and data integrity when processing criteria built by the frontend library.

## Requirements

### Requirement 1: Field Metadata Management

**User Story:** As a system administrator, I want to manage available fields for criteria building within the screener package, so that users can only create filters using valid and authorized data columns.

#### Acceptance Criteria

1. WHEN field metadata is requested via GET /api/screeners/fields THEN it SHALL return FieldMeta objects with id, label, dbColumn, dataType, allowedOps, category, description, example
2. WHEN field metadata is created THEN it SHALL validate dataType against supported types (number, integer, string, date, boolean, enum, percent, currency)
3. WHEN field metadata is updated THEN it SHALL validate that dbColumn exists in the target database schema
4. WHEN field metadata includes allowedOps THEN it SHALL validate operators against the field's dataType compatibility
5. WHEN field metadata is deleted THEN it SHALL check for existing screener versions using those fields before removal
6. WHEN field access is requested THEN it SHALL enforce role-based permissions for sensitive fields using existing screener security
7. WHEN field metadata includes visual properties THEN it SHALL support category grouping, descriptions, and examples for enhanced UI display
8. WHEN field suggestions are requested THEN it SHALL optionally provide suggestionsApi endpoint for dynamic value completion in visual interface

### Requirement 2: Function Definition Management

**User Story:** As a system administrator, I want to define and manage available functions for advanced criteria building within the screener package using database master tables, so that users can create sophisticated technical analysis conditions with centrally managed function definitions.

#### Acceptance Criteria

1. WHEN function metadata is requested via GET /api/screeners/functions THEN it SHALL return FunctionMeta objects from screener_functions table with id, label, returnType, sqlTemplate, category, description, examples
2. WHEN function is created THEN it SHALL validate sqlTemplate for SQL injection safety and store in screener_functions table
3. WHEN function parameters are defined THEN it SHALL validate parameter types and default values and store in screener_function_params table
4. WHEN function sqlTemplate is processed THEN it SHALL support token replacement for {{col}}, {{period}}, and parameter placeholders from stored template
5. WHEN function is used THEN it SHALL validate parameter count and types match the definition stored in screener_function_params table
6. WHEN nested functions are called THEN it SHALL prevent infinite recursion and enforce depth limits based on function definitions
7. WHEN function metadata includes visual properties THEN it SHALL support category grouping, descriptions, and usage examples stored in screener_functions table for enhanced dialog display
8. WHEN function parameters have constraints THEN it SHALL provide validation rules and help text from screener_function_params table for visual parameter editors
9. WHEN function definitions are loaded THEN it SHALL join screener_functions with screener_function_params to build complete FunctionMeta objects
10. WHEN function definitions are cached THEN it SHALL invalidate cache when screener_functions or screener_function_params tables are modified

### Requirement 2.1: Function Database Schema Management

**User Story:** As a database administrator, I want well-defined database tables for storing function definitions and parameters, so that function metadata can be managed centrally and consistently across the application.

#### Acceptance Criteria

1. WHEN screener_functions table is created THEN it SHALL include columns: id (primary key), function_name (unique), label, return_type, sql_template, category, description, examples, is_active, created_at, updated_at
2. WHEN screener_function_params table is created THEN it SHALL include columns: id (primary key), function_id (foreign key to screener_functions), param_name, param_type, param_order, default_value, is_required, validation_rules, help_text, created_at, updated_at
3. WHEN function definitions are stored THEN it SHALL enforce referential integrity between screener_functions and screener_function_params tables
4. WHEN function parameters are ordered THEN it SHALL use param_order column to maintain consistent parameter sequence
5. WHEN function validation occurs THEN it SHALL use validation_rules column to store JSON validation constraints for parameters
6. WHEN functions are deactivated THEN it SHALL use is_active flag for soft deletion without breaking existing screener versions
7. WHEN function metadata is queried THEN it SHALL support efficient joins between screener_functions and screener_function_params tables
8. WHEN database migrations are applied THEN it SHALL include proper indexes on function_name, category, and function_id columns for performance

### Requirement 3: Criteria DSL Validation

**User Story:** As a developer, I want server-side validation of criteria DSL within screener versions, so that I can ensure data integrity and prevent malicious or invalid criteria execution.

#### Acceptance Criteria

1. WHEN CriteriaDSL is received via POST /api/screeners/validate-criteria THEN it SHALL validate all fieldId references against authorized field metadata
2. WHEN CriteriaDSL contains functions THEN it SHALL validate all functionId references against active functions in screener_functions table
3. WHEN operators are used THEN it SHALL validate operator compatibility with field types
4. WHEN values are provided THEN it SHALL validate value types match expected field or function return types
5. WHEN groups are nested THEN it SHALL enforce maximum depth limits to prevent stack overflow
6. WHEN criteria size is large THEN it SHALL enforce limits on total conditions and complexity

### Requirement 4: SQL Generation and Parameterization

**User Story:** As a developer, I want secure SQL generation from validated criteria DSL that integrates with existing screener infrastructure, so that I can execute user-defined filters without SQL injection risks.

#### Acceptance Criteria

1. WHEN DSL is converted to SQL via POST /api/screeners/generate-sql THEN it SHALL generate parameterized queries with named parameters
2. WHEN field references are processed THEN it SHALL map fieldId to actual dbColumn names
3. WHEN function calls are processed THEN it SHALL retrieve sqlTemplate from screener_functions table and apply proper parameter substitution using screener_function_params definitions
4. WHEN nested groups exist THEN it SHALL generate proper parentheses and operator precedence
5. WHEN parameters are created THEN it SHALL use sequential naming (:p1, :p2, etc.) and maintain parameter map compatible with existing screener execution
6. WHEN SQL is generated THEN it SHALL store in ScreenerVersion.compiled_sql and never include user input directly in SQL string

### Requirement 5: Criteria Execution and Results

**User Story:** As a user, I want to execute my criteria against the database using existing screener infrastructure and receive filtered results, so that I can analyze data based on my custom conditions.

#### Acceptance Criteria

1. WHEN criteria execution is requested via POST /api/screeners/{id}/runs THEN it SHALL re-validate the DSL server-side before execution
2. WHEN SQL is executed THEN it SHALL use existing screener execution framework with prepared statements and parameter binding
3. WHEN query runs THEN it SHALL leverage existing screener timeout limits and execution monitoring
4. WHEN results are returned THEN it SHALL use existing screener_result table structure and pagination
5. WHEN execution fails THEN it SHALL use existing screener error handling and logging infrastructure
6. WHEN query performance is poor THEN it SHALL integrate with existing screener performance monitoring

### Requirement 6: Criteria Persistence and Versioning

**User Story:** As a user, I want to save and manage my criteria configurations using existing screener infrastructure, so that I can reuse and share complex filtering setups.

#### Acceptance Criteria

1. WHEN criteria is saved THEN it SHALL store CriteriaDSL JSON in existing ScreenerVersion.dsl_json field and compiled SQL in compiled_sql field
2. WHEN criteria is versioned THEN it SHALL leverage existing screener versioning system with ScreenerVersion entities
3. WHEN criteria is loaded THEN it SHALL validate stored DSL against current field metadata and active function definitions in screener_functions table
4. WHEN criteria is shared THEN it SHALL use existing screener ownership and public/private sharing mechanisms
5. WHEN criteria is deleted THEN it SHALL use existing screener soft delete patterns
6. WHEN criteria migration is needed THEN it SHALL provide tools to update old DSL format to current version within screener versions

### Requirement 7: Security and Authorization

**User Story:** As a security administrator, I want comprehensive security controls for criteria building that integrate with existing screener security, so that users cannot access unauthorized data or perform malicious operations.

#### Acceptance Criteria

1. WHEN user accesses fields THEN it SHALL enforce role-based field visibility using existing screener JWT authentication
2. WHEN criteria is executed THEN it SHALL validate user permissions using existing screener authorization mechanisms
3. WHEN function calls are made THEN it SHALL whitelist functions from screener_functions table where is_active=true and prevent arbitrary code execution
4. WHEN SQL is generated THEN it SHALL sanitize all inputs and use parameterized queries exclusively
5. WHEN rate limiting is applied THEN it SHALL integrate with existing screener rate limiting infrastructure
6. WHEN audit logging is enabled THEN it SHALL use existing screener audit logging for criteria creation, modification, and execution activities

### Requirement 8: Performance and Caching

**User Story:** As a system user, I want fast response times when building and executing criteria using existing screener infrastructure, so that I can work efficiently without delays.

#### Acceptance Criteria

1. WHEN field metadata is requested THEN it SHALL cache results with appropriate TTL and cache invalidation
2. WHEN function definitions are loaded THEN it SHALL cache compiled function metadata from screener_functions and screener_function_params tables for reuse
3. WHEN SQL generation occurs THEN it SHALL cache generated SQL for identical DSL structures in ScreenerVersion.compiled_sql
4. WHEN database queries run THEN it SHALL leverage existing screener query optimization and connection pooling
5. WHEN concurrent requests occur THEN it SHALL use existing screener concurrency handling mechanisms
6. WHEN memory usage is high THEN it SHALL integrate with existing screener memory management and cleanup

### Requirement 9: API Endpoints and Documentation

**User Story:** As a frontend developer, I want well-documented REST APIs for criteria operations integrated with existing screener endpoints, so that I can integrate the backend services effectively.

#### Acceptance Criteria

1. WHEN API documentation is accessed THEN it SHALL extend existing screener Swagger/OpenAPI specification with criteria endpoints
2. WHEN GET /api/screeners/fields is called THEN it SHALL return available field metadata for the user's role with visual display properties
3. WHEN GET /api/screeners/functions is called THEN it SHALL return active function definitions from screener_functions table with category and description metadata
4. WHEN POST /api/screeners/validate-criteria is called THEN it SHALL validate CriteriaDSL and return validation results with field-level error details
5. WHEN POST /api/screeners/generate-sql is called THEN it SHALL generate SQL and parameters from validated DSL
6. WHEN POST /api/screeners/{id}/versions with criteria DSL THEN it SHALL create screener version with criteria in dsl_json field
7. WHEN GET /api/screeners/{id}/versions/{versionId} is called THEN it SHALL return screener version including criteria DSL
8. WHEN POST /api/screeners/{id}/runs is called with criteria-based version THEN it SHALL execute criteria using existing run infrastructure

### Requirement 9.1: Visual Interface Support Endpoints

**User Story:** As a frontend developer using the visual token interface, I want specialized API endpoints that support interactive query building, so that I can provide rich user experiences with dropdowns, suggestions, and real-time validation.

#### Acceptance Criteria

1. WHEN GET /api/screeners/fields/{fieldId}/operators is called THEN it SHALL return compatible operators for the specific field type
2. WHEN GET /api/screeners/fields/{fieldId}/suggestions?query={text} is called THEN it SHALL return value suggestions for enum fields or fields with suggestionsApi
3. WHEN POST /api/screeners/validate-partial-criteria is called with incomplete DSL THEN it SHALL validate partial criteria and return contextual validation feedback
4. WHEN GET /api/screeners/functions/{functionId}/signature is called THEN it SHALL return detailed parameter information from screener_function_params table for function dialog display
5. WHEN POST /api/screeners/preview-criteria is called with DSL THEN it SHALL return formatted preview text and estimated result count without full execution
6. WHEN GET /api/screeners/operators is called THEN it SHALL return all available operators with descriptions and compatibility information

### Requirement 10: Error Handling and Monitoring

**User Story:** As a system administrator, I want comprehensive error handling and monitoring for criteria operations integrated with existing screener monitoring, so that I can maintain system reliability and troubleshoot issues.

#### Acceptance Criteria

1. WHEN validation errors occur THEN it SHALL use existing screener error response format with field-specific messages
2. WHEN SQL generation fails THEN it SHALL integrate with existing screener logging infrastructure for detailed error information
3. WHEN database errors occur THEN it SHALL leverage existing screener database error handling for connection issues, timeouts, and constraint violations
4. WHEN system monitoring is active THEN it SHALL extend existing screener metrics collection for criteria execution performance and error rates
5. WHEN alerts are configured THEN it SHALL integrate with existing screener alerting infrastructure for critical errors
6. WHEN debugging is needed THEN it SHALL use existing screener logging patterns with correlation IDs for request tracing

### Requirement 11: Integration and Compatibility

**User Story:** As a developer, I want seamless integration with existing MoneyPlant screener systems, so that criteria building works consistently within the existing screener framework.

#### Acceptance Criteria

1. WHEN integrated with existing screener auth THEN it SHALL use existing ScreenerJwtAuthenticationFilter and CurrentUserService
2. WHEN database connections are used THEN it SHALL leverage existing screener repository patterns and transaction management
3. WHEN API versioning is needed THEN it SHALL extend existing screener API versioning approach for backward compatibility
4. WHEN configuration is managed THEN it SHALL use existing screener configuration patterns and environment-specific settings
5. WHEN deployment occurs THEN it SHALL deploy as part of existing screener package without separate deployment
6. WHEN monitoring is active THEN it SHALL extend existing screener logging, metrics, and alerting infrastructure

### Requirement 12: Testing and Quality Assurance

**User Story:** As a developer, I want comprehensive testing coverage for the criteria API integrated with existing screener tests, so that I can ensure reliability and maintainability.

#### Acceptance Criteria

1. WHEN unit tests are run THEN it SHALL achieve minimum 90% code coverage for core criteria processing logic within screener package
2. WHEN integration tests are executed THEN it SHALL extend existing ScreenerIntegrationTest to cover DSL validation to SQL execution scenarios
3. WHEN security tests are performed THEN it SHALL validate protection against SQL injection, unauthorized access, and data leakage using existing screener security test patterns
4. WHEN performance tests are conducted THEN it SHALL verify response times and throughput under expected load within existing screener performance testing framework
5. WHEN regression tests are automated THEN it SHALL prevent breaking changes to existing screener functionality while adding criteria features
6. WHEN load testing is performed THEN it SHALL validate system behavior under high concurrent criteria execution using existing screener load testing infrastructure