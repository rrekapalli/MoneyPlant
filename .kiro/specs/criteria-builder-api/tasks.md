# Implementation Plan - Criteria Builder API

- [x] 1. Set up criteria functionality within existing screener module
  - Add new dependencies to existing screener pom.xml for criteria-specific functionality (caching, validation, collections)
  - Extend existing screener configuration to support criteria features
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 2. Implement criteria DSL model classes and new entities
  - [x] 2.1 Create criteria DSL model classes in screener.dtos package
    - Implement CriteriaDSL, Group, Condition, FunctionCall, FieldRef, and Literal classes in existing screener.dtos package
    - Add JSON serialization annotations for storage in existing ScreenerVersion.dsl_json field
    - Create validation constraints for DSL structure and content
    - _Requirements: 3.1, 3.2, 6.1, 6.2_

  - [x] 2.2 Create new JPA entities for field and function metadata in screener.entities package
    - Implement FieldMetadata entity with validation rules, audit fields, category, description, and example properties
    - Create ScreenerFunction entity with SQL templates, category, description, examples, and is_active flag for soft deletion
    - Add ScreenerFunctionParam entity with parameter definitions, validation rules, help text, and ordering support
    - Add database migration scripts for field_metadata, screener_functions, and screener_function_params tables
    - Implement proper foreign key relationships and indexes for performance
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 1.8, 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.5, 2.1.6, 2.1.7, 2.1.8_

  - [ ]* 2.3 Write unit tests for DSL models and new entities
    - Test JSON serialization/deserialization of DSL objects
    - Verify JPA entity persistence and retrieval for metadata entities
    - _Requirements: 12.1_

- [x] 3. Create repositories for new metadata entities in screener.repositories package
  - Create FieldMetadataRepository with custom queries for user-based field access and role filtering
  - Implement ScreenerFunctionRepository with active function filtering, category-based queries, and soft deletion support
  - Add ScreenerFunctionParamRepository with parameter ordering and function relationship queries
  - Add custom repository methods for field and function search, categorization, and parameter management
  - Implement efficient joins between screener_functions and screener_function_params tables
  - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.1.7, 2.1.8, 8.1, 8.2_

- [x] 4. Implement enhanced criteria validation service with visual interface support
  - [x] 4.1 Create CriteriaValidationService for comprehensive DSL validation
    - Implement structural validation for groups, conditions, and nesting depth limits
    - Add semantic validation for field and function references against user permissions
    - Create operator compatibility validation with field types
    - Add value type checking and range validation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 4.2 Add visual interface validation support methods
    - Implement validatePartialDSL method for real-time validation feedback during query building
    - Create previewCriteria method for generating human-readable descriptions and result estimates
    - Add getAllOperators method for complete operator metadata with descriptions and compatibility
    - Build validation suggestion system for contextual help during query construction
    - _Requirements: 9.1.3, 9.1.5, 9.1.6_
  - [x] 4.3 Integrate validation with existing screener security
    - Use existing CurrentUserService for user context and permissions
    - Leverage existing screener JWT authentication for field access control
    - Integrate with existing screener audit logging for validation events
    - _Requirements: 7.1, 7.2, 7.6_

  - [ ]* 4.4 Write comprehensive validation tests
    - Test validation with various invalid DSL structures and edge cases
    - Verify error message generation and validation path tracking
    - Test partial validation and preview functionality for visual interface
    - _Requirements: 12.1, 12.3_

- [x] 5. Implement SQL generation service for criteria DSL
  - [x] 5.1 Create CriteriaSqlService for safe SQL generation
    - Build recursive SQL generation for groups and conditions with proper parentheses
    - Implement parameter binding with sequential naming (:p1, :p2, etc.) compatible with existing screener execution
    - Add SQL template processing for function calls with token replacement
    - Create column name sanitization and SQL injection prevention
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 5.2 Integrate with existing screener SQL execution infrastructure
    - Generate SQL compatible with existing screener query execution framework
    - Store generated SQL in ScreenerVersion.compiled_sql field
    - Create parameter schema compatible with existing screener parameter handling
    - _Requirements: 4.6, 6.1, 8.3_

  - [ ]* 5.3 Write SQL generation tests with security focus
    - Test parameterized query generation for complex nested scenarios
    - Verify SQL injection prevention in all code paths
    - Test integration with existing screener SQL execution
    - _Requirements: 12.1, 12.3_

- [x] 6. Create field and function metadata services with visual interface support
  - [x] 6.1 Implement enhanced FieldMetadataService for field management
    - Create field metadata CRUD operations with validation and enhanced visual properties
    - Add role-based field visibility and access control using existing screener security
    - Implement field categorization, search functionality, and description support
    - Build field metadata caching integration with category and example data
    - Add getCompatibleOperators method for field-specific operator filtering
    - Implement getValueSuggestions method for dynamic value completion with external API support
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 8.1, 8.2_
  - [x] 6.2 Build database-driven FunctionDefinitionService for function management
    - Create function metadata operations using ScreenerFunctionRepository and ScreenerFunctionParamRepository
    - Implement function loading with parameter joins from screener_functions and screener_function_params tables
    - Add function validation using is_active flag and SQL template safety checks
    - Build function categorization, description, and example support from database metadata
    - Add getFunctionSignature method using database parameter definitions with validation rules and help text
    - Implement function caching with cache invalidation when database tables are modified
    - Add function access control and whitelist management using is_active flag
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [ ]* 6.3 Write service tests for enhanced metadata management
    - Test field and function CRUD operations with various user roles and visual properties
    - Verify security and access control for metadata operations
    - Test visual interface support methods (operator compatibility, value suggestions, function signatures)
    - _Requirements: 12.1, 12.2_

- [x] 7. Extend existing screener services for criteria support
  - [x] 7.1 Extend ScreenerVersionService to support criteria DSL
    - Add criteria DSL validation when creating screener versions
    - Implement automatic SQL generation from DSL and storage in compiled_sql field
    - Add DSL format migration support for version updates
    - Integrate criteria validation with existing screener version creation workflow
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 7.2 Extend ScreenerRunService to support criteria-based execution
    - Add criteria DSL re-validation before screener run execution
    - Integrate criteria-generated SQL with existing screener execution framework
    - Leverage existing screener timeout, pagination, and result storage mechanisms
    - Use existing screener performance monitoring and error handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 7.3 Write integration tests for extended screener services
    - Test end-to-end criteria DSL to screener execution workflow
    - Verify integration with existing screener run and result infrastructure
    - _Requirements: 12.2_

- [x] 8. Extend existing ScreenerController for criteria-specific endpoints
  - [x] 8.1 Implement core criteria validation and SQL generation endpoints in ScreenerController
    - Create GET /api/screeners/fields endpoint with role-based field filtering and enhanced metadata
    - Build GET /api/screeners/functions endpoint with user-based function access and category support
    - Implement POST /api/screeners/validate-criteria endpoint for DSL validation
    - Add POST /api/screeners/generate-sql endpoint for SQL generation from DSL
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  - [x] 8.2 Implement visual interface support endpoints in ScreenerController
    - Create GET /api/screeners/fields/{fieldId}/operators endpoint for field-specific operator compatibility
    - Build GET /api/screeners/fields/{fieldId}/suggestions endpoint for dynamic value suggestions
    - Implement POST /api/screeners/validate-partial-criteria endpoint for real-time validation feedback
    - Add GET /api/screeners/functions/{functionId}/signature endpoint for function dialog display
    - Create POST /api/screeners/preview-criteria endpoint for criteria preview and estimation
    - Build GET /api/screeners/operators endpoint for complete operator metadata
    - _Requirements: 9.1.1, 9.1.2, 9.1.3, 9.1.4, 9.1.5, 9.1.6_
  - [x] 8.3 Integrate with existing screener authentication and security
    - Use existing ScreenerJwtAuthenticationFilter for authentication
    - Leverage existing CurrentUserService for user context
    - Integrate with existing screener error handling and response patterns
    - Apply existing screener rate limiting and security measures
    - _Requirements: 7.1, 7.2, 7.5, 11.1, 11.2_

  - [ ]* 8.4 Write controller tests for criteria endpoints
    - Test all criteria endpoints with various user roles and permissions
    - Verify integration with existing screener security infrastructure
    - Test visual interface support endpoints with different field and function types
    - _Requirements: 12.2_

- [ ] 9. Extend existing screener controllers for criteria integration
  - [ ] 9.1 Extend ScreenerVersionController to support criteria DSL
    - Modify existing POST /api/screeners/{id}/versions endpoint to accept criteria DSL in dsl_json field
    - Add automatic validation and SQL generation when DSL is provided
    - Integrate criteria validation errors with existing screener error handling
    - Ensure backward compatibility with existing screener version creation
    - _Requirements: 9.6, 9.7, 9.8_

  - [ ] 9.2 Extend ScreenerRunController for criteria-based execution
    - Modify existing POST /api/screeners/{id}/runs endpoint to support criteria-based screener versions
    - Add criteria DSL re-validation before run execution
    - Integrate with existing screener run monitoring and result handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 9.3 Write integration tests for extended screener controllers
    - Test criteria DSL integration with existing screener version and run workflows
    - Verify backward compatibility with non-criteria screener operations
    - _Requirements: 12.2_

- [ ] 10. Integrate caching with existing screener infrastructure
  - Add field metadata and function definition caching using existing screener caching patterns
  - Implement SQL generation result caching with appropriate TTL management
  - Create cache invalidation strategies for metadata updates
  - Integrate with existing screener cache monitoring and metrics
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 11. Extend existing screener error handling and monitoring
  - [ ] 11.1 Integrate criteria exceptions with existing screener error handling
    - Add CriteriaValidationException and SqlGenerationException to existing ScreenerExceptionHandler
    - Use existing screener error response format for criteria-related errors
    - Integrate criteria error logging with existing screener logging infrastructure
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 11.2 Extend existing screener monitoring for criteria operations
    - Add criteria validation and SQL generation metrics to existing screener metrics collection
    - Integrate criteria performance tracking with existing screener monitoring
    - Use existing screener health checks and alerting infrastructure
    - _Requirements: 10.4, 10.5, 10.6_

- [ ] 12. Leverage existing screener security infrastructure
  - Use existing ScreenerJwtAuthenticationFilter for criteria endpoint authentication
  - Integrate criteria operations with existing screener rate limiting mechanisms
  - Apply existing screener CORS and security header configurations
  - Use existing screener audit logging for criteria operations
  - _Requirements: 7.4, 7.5, 7.6, 11.1, 11.2_

- [ ] 13. Extend existing screener test suite for criteria functionality
  - [ ]* 13.1 Write unit tests for new criteria services
    - Test CriteriaValidationService with edge cases and invalid DSL inputs
    - Test CriteriaSqlService with complex nested scenarios and SQL injection prevention
    - Test FieldMetadataService and FunctionDefinitionService with various user roles
    - _Requirements: 12.1_

  - [ ]* 13.2 Extend existing ScreenerIntegrationTest for criteria workflows
    - Test end-to-end criteria DSL to screener execution workflows
    - Verify criteria integration with existing screener security and authorization
    - Test criteria error handling and edge cases within screener context
    - _Requirements: 12.2_

  - [ ]* 13.3 Add criteria-specific performance testing
    - Test criteria validation and SQL generation performance under load
    - Verify criteria-based screener execution performance
    - Test field and function metadata caching effectiveness
    - _Requirements: 12.4_

- [ ] 14. Extend existing screener API documentation for criteria features
  - [ ] 14.1 Update existing screener OpenAPI/Swagger documentation
    - Document new criteria endpoints with request/response examples
    - Update existing screener version and run endpoint documentation to include criteria DSL support
    - Add criteria DSL schema definitions and validation rules to API documentation
    - _Requirements: 9.1_

  - [ ] 14.2 Update existing screener README and documentation
    - Document criteria DSL integration with existing screener workflows
    - Add criteria builder usage examples and best practices
    - Update existing screener troubleshooting guides to include criteria-related issues
    - _Requirements: 11.5, 11.6_

- [ ] 15. Integrate criteria functionality with existing screener deployment
  - Add new criteria dependencies to existing screener pom.xml
  - Create database migration scripts for field_metadata, screener_functions, and screener_function_params tables with proper indexes
  - Use existing screener CI/CD pipelines and deployment processes
  - Add criteria-specific configuration to existing screener property files
  - Create initial data migration scripts to populate screener_functions and screener_function_params with default functions
  - _Requirements: 11.3, 11.4, 11.5, 11.6, 2.1.8_