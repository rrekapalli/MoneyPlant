<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0
Modified principles: All placeholder principles replaced with MoneyPlant-specific principles
Added sections: Technology Stack Requirements, Security Standards, Development Workflow
Removed sections: None (all placeholders filled)
Templates requiring updates: 
  ✅ plan-template.md (Constitution Check section updated)
  ✅ spec-template.md (aligned with modular architecture principles)
  ✅ tasks-template.md (aligned with Spring Boot Modulith structure)
Follow-up TODOs: None - all placeholders resolved
-->

# MoneyPlant Constitution

## Core Principles

### I. Modular Monolith Architecture (NON-NEGOTIABLE)
Every feature MUST be implemented within Spring Boot Modulith boundaries; Modules MUST be self-contained with clear API contracts; Module boundaries MUST be enforced through package-info.java annotations; Clear separation between core, portfolio, stock, transaction, watchlist, and screener modules required.

### II. Microsoft OAuth2 Authentication
All user authentication MUST use Microsoft OAuth2 provider; JWT tokens MUST be generated and validated for API access; Frontend MUST integrate with Azure MSAL for seamless authentication; Authentication state MUST be consistent across all three applications (backend, engines, frontend).

### III. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Unit tests MUST achieve minimum 80% code coverage; Integration tests REQUIRED for all API endpoints; Contract tests REQUIRED for inter-module communication.

### IV. API-First Design
All backend functionality MUST expose REST APIs with OpenAPI/Swagger documentation; API versioning MUST follow /api/v{version}/{module}/{resource} pattern; Frontend MUST consume APIs through dedicated service layers; Engines MUST communicate via Kafka messaging and REST APIs.

### V. Real-Time Data Processing
Market data MUST be processed in real-time using Apache Kafka; WebSocket connections REQUIRED for live stock quotes; Data ingestion engines MUST handle multiple sources (NSE, Yahoo Finance); Performance MUST support concurrent user sessions without degradation.

## Technology Stack Requirements

### Backend Applications
- **Java 21**: Latest LTS version with modern language features
- **Spring Boot 3.3.0**: Application framework with Modulith support
- **Spring Security**: JWT and OAuth2 authentication
- **PostgreSQL**: Primary database with JPA/Hibernate
- **Apache Kafka**: Real-time messaging and data streaming
- **Redis**: Caching layer for performance optimization

### Frontend Application
- **Angular 20**: Latest Angular version with TypeScript 5.8.3
- **PrimeNG 20**: UI component library for consistent design
- **Azure MSAL**: Microsoft authentication integration
- **Chart.js/ECharts**: Data visualization components
- **STOMP.js**: WebSocket communication for real-time updates

### Data Processing Engines
- **Apache Spark 3.5.0**: Big data processing and analytics
- **Apache Hudi/Iceberg**: Data lake capabilities
- **Trino**: Distributed SQL query engine
- **InfluxDB**: Time series data storage

## Security Standards

### Authentication & Authorization
- Microsoft OAuth2 MUST be the primary authentication provider
- JWT tokens MUST have configurable expiration (default 9 hours)
- Role-based access control REQUIRED for sensitive operations
- API endpoints MUST validate JWT tokens on every request

### Data Protection
- All sensitive data MUST be encrypted at rest and in transit
- Database credentials MUST be externalized to environment variables
- CORS configuration MUST be properly configured for frontend domains
- Security headers MUST be added to all API responses

## Development Workflow

### Code Quality Standards
- Google Java Format plugin REQUIRED for consistent formatting
- Conventional Commits specification MUST be followed
- All public methods MUST have JavaDoc documentation
- OpenAPI annotations REQUIRED for all REST endpoints

### Testing Requirements
- Unit tests MUST be written for all service classes
- Integration tests REQUIRED for API endpoints
- Contract tests REQUIRED for inter-module communication
- End-to-end tests REQUIRED for critical user journeys

### Deployment Standards
- Docker containerization REQUIRED for all applications
- Kubernetes deployment manifests REQUIRED for production
- Health checks MUST be implemented for all services
- CI/CD pipeline MUST include automated testing and security scanning

## Governance

Constitution supersedes all other practices; Amendments require documentation, approval, and migration plan; All PRs/reviews must verify compliance with constitution principles; Complexity must be justified with clear rationale; Use existing documentation in docs/ directory for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
