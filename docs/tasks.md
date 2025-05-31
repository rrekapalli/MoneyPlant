# MoneyPlant Improvement Tasks

This document contains a prioritized list of improvement tasks for the MoneyPlant project. Each task is marked with a checkbox that can be checked off when completed.

## Architecture Improvements

- [x] 1. Replace hardcoded service URLs in API Gateway with service discovery
- [x] 2. Fix Eureka client configuration (change `default-zone` to `defaultZone` in all services)
- [x] 3. Implement centralized configuration server for managing properties across services
- [x] 4. Add circuit breaker pattern for resilience (using Resilience4j or similar)
- [x] 5. Implement API versioning strategy
- [x] 6. Set up proper environment-specific configurations (dev, test, prod)
- [x] 7. Implement distributed tracing with proper sampling strategy
- [x] 8. Add rate limiting for API endpoints
- [x] 9. Implement proper authentication and authorization (OAuth2/JWT)
- [x] 10. Set up a message queue for asynchronous communication between services

## Code Quality Improvements

- [x] 1. Fix incorrect log message in DiscoveryServerApplication
- [x] 2. Implement proper DTO mappers (MapStruct or similar) as noted in TODOs
- [x] 3. Add input validation for all controller endpoints
- [x] 4. Implement proper exception handling with custom exceptions
- [x] 5. Fix inconsistent naming conventions (e.g., parameter names in PortfolioService)
- [x] 6. Remove redundant annotations and code in entity classes
- [x] 7. Fix @EqualsAndHashCode implementation in entities (set callSuper=true)
- [x] 8. Replace hardcoded "System User" values in BaseAuditEntity with actual user context
- [x] 9. Remove unnecessary @Nationalized annotations (e.g., on UUID fields and timestamps)
- [x] 10. Add proper JavaDoc documentation to all public methods and classes

## Testing Improvements

- [x] 1. Implement unit tests for all services
- [x] 2. Add integration tests for API endpoints
- [x] 3. Set up test containers for database integration tests
- [x] 4. Implement contract tests between services
- [x] 5. Add performance tests for critical endpoints
- [x] 6. Set up code coverage reporting
- [x] 7. Implement mutation testing
- [x] 8. Add end-to-end tests for critical user journeys
- [x] 9. Set up continuous integration with automated testing

## Security Improvements

- [x] 1. Move database credentials to secure configuration
- [x] 2. Implement proper password encryption
- [x] 3. Add HTTPS configuration for all services
- [x] 4. Implement API key validation
- [x] 5. Add request validation to prevent injection attacks
- [x] 6. Implement proper CORS configuration
- [x] 7. Add security headers to API responses
- [x] 8. Set up vulnerability scanning in the build pipeline
- [x] 9. Implement audit logging for security events

## DevOps Improvements

- [x] 1. Fix Jib Maven plugin configuration to properly tag images
- [x] 2. Set up Docker Compose for local development
- [x] 3. Create Kubernetes deployment manifests
- [x] 4. Implement health checks for all services
- [x] 5. Set up proper logging configuration with log aggregation
- [x] 6. Implement database migration strategy (Flyway or Liquibase)
- [x] 7. Set up monitoring and alerting
- [x] 8. Implement CI/CD pipeline
- [x] 9. Add infrastructure as code (Terraform or similar)
- [x] 10. Set up backup and disaster recovery procedures

## Documentation Improvements

- [x] 1. Create comprehensive README with setup instructions
- [x] 2. Document API endpoints with proper OpenAPI annotations
- [x] 3. Create architecture diagrams
- [x] 4. Document database schema
- [x] 5. Add contribution guidelines
- [x] 6. Create user documentation
- [x] 7. Document deployment process
- [x] 8. Add change log
- [x] 9. Create troubleshooting guide

## Feature Improvements

- [ ] 1. Complete implementation of transaction service
- [ ] 2. Complete implementation of watchlist service
- [ ] 3. Add CRUD operations for all entities
- [ ] 4. Implement search functionality
- [ ] 5. Add pagination and sorting for list endpoints
- [ ] 6. Implement filtering capabilities
- [ ] 7. Add reporting features
- [ ] 8. Implement user preferences
- [ ] 9. Add notification system
- [ ] 10. Implement data export functionality
