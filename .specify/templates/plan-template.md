# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modular Monolith Compliance
- [ ] Feature MUST fit within existing Spring Boot Modulith boundaries (core, portfolio, stock, transaction, watchlist, screener)
- [ ] Module boundaries MUST be enforced through package-info.java annotations
- [ ] Inter-module communication MUST use defined API contracts

### Authentication & Security Compliance
- [ ] Feature MUST integrate with Microsoft OAuth2 authentication
- [ ] All API endpoints MUST validate JWT tokens
- [ ] Sensitive data MUST be properly encrypted and secured

### API Design Compliance
- [ ] All endpoints MUST follow /api/v{version}/{module}/{resource} pattern
- [ ] OpenAPI/Swagger documentation REQUIRED for all REST endpoints
- [ ] Frontend integration MUST use dedicated service layers

### Testing Compliance
- [ ] Unit tests MUST achieve minimum 80% code coverage
- [ ] Integration tests REQUIRED for all API endpoints
- [ ] Contract tests REQUIRED for inter-module communication

### Technology Stack Compliance
- [ ] Backend: Java 21, Spring Boot 3.3.0, PostgreSQL, Kafka
- [ ] Frontend: Angular 20, PrimeNG 20, Azure MSAL
- [ ] Engines: Apache Spark, Hudi/Iceberg, Trino

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (MoneyPlant Architecture)

```text
# MoneyPlant Three-Tier Architecture
backend/
├── src/main/java/com/moneyplant/
│   ├── core/           # Authentication, security, common utilities
│   ├── portfolio/      # Portfolio management and analytics
│   ├── stock/          # Stock data and market information
│   ├── transaction/    # Trade processing and validation
│   ├── watchlist/      # User watchlist management
│   ├── screener/       # Advanced stock screening
│   └── index/          # Index data and operations
├── src/test/java/      # Unit and integration tests
└── src/main/resources/ # Configuration files

engines/
├── src/main/java/com/moneyplant/engines/
│   ├── backtest/       # Strategy backtesting services
│   ├── ingestion/      # Market data ingestion
│   ├── query/          # Data querying and analytics
│   ├── screener/       # Market screening services
│   ├── storage/        # Data storage and management
│   └── strategy/       # Strategy management services
└── src/test/java/      # Engine-specific tests

frontend/
├── src/app/
│   ├── features/       # Feature modules (portfolio, stock, etc.)
│   ├── services/       # API service layers
│   ├── shared/         # Shared components and utilities
│   └── core/           # Core application logic
├── projects/dashboards/ # Dashboard-specific components
└── src/assets/         # Static assets and configurations
```

**Structure Decision**: MoneyPlant uses a three-tier architecture with Spring Boot Modulith backend, separate data processing engines, and Angular frontend. Each tier has clear responsibilities and communicates through well-defined APIs.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
