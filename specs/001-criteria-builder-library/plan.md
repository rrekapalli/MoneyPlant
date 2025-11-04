# Implementation Plan: Criteria Builder Library

**Branch**: `001-criteria-builder-library` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-criteria-builder-library/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create an Angular v20 library implementing a reusable `<mp-criteria-builder>` component with badge-based visual interface for stock screening criteria. The component implements ControlValueAccessor for form integration, supports drag-and-drop interactions, generates real-time DSL/SQL output, and integrates with PrimeNG v20 components for consistent UI design. **The component is fully standalone with ALL data provided via @Input properties, leveraging existing frontend API services in ./frontend/src/app/services/ rather than creating its own API layer.**

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Angular 20+ with TypeScript 5.8.3  
**Primary Dependencies**: PrimeNG 20+, Angular CDK (Drag & Drop), RxJS, ng-packagr  
**Storage**: N/A (component state managed via ControlValueAccessor)  
**Testing**: Jasmine/Karma for unit tests, Angular Testing Library for component tests  
**Target Platform**: Web browsers (Angular Universal compatible)  
**Project Type**: Angular library (ng-packagr ready)  
**Performance Goals**: <100ms DSL generation, <200ms SQL preview, <150ms drag operations  
**Constraints**: WCAG 2.1 AA accessibility, <100 nested elements, 10-level max depth  
**Scale/Scope**: Reusable component library, publishable to npm registry  
**Backend Integration**: Standalone component leveraging existing frontend API services in ./frontend/src/app/services/ with NO internal API layer

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modular Monolith Compliance
- [x] Feature fits within frontend architecture as reusable library component
- [x] Component boundaries enforced through Angular module system and public API
- [x] Integration with backend screener module via REST API contracts

### Authentication & Security Compliance
- [x] Component integrates with existing Microsoft OAuth2 authentication flow
- [x] No direct API endpoints (uses existing backend screener endpoints)
- [x] Component data handled securely through Angular reactive forms

### API Design Compliance
- [x] Component is standalone with NO internal API calls - all data via @Input properties
- [x] Leverages existing frontend API services in ./frontend/src/app/services/ for data fetching
- [x] Parent components handle all API integration using existing ScreenerApiService

### Testing Compliance
- [x] Unit tests planned for all component classes and services
- [x] Integration tests planned for ControlValueAccessor implementation
- [x] Contract tests planned for DSL/SQL generation validation

### Technology Stack Compliance
- [x] Frontend: Angular 20, PrimeNG 20 (compliant with constitution)
- [x] Uses existing backend screener module (Java 21, Spring Boot 3.3.0)
- [x] No new engine requirements (uses existing data processing)

## Backend Integration Details

### Existing Backend Screener Package Analysis
The Angular criteria builder library is designed to integrate seamlessly with the existing Java Spring Boot screener package located in `backend/src/main/java/com/moneyplant/screener/`. Key integration points:

#### Backend DTOs and Entities (Already Implemented)
- **CriteriaDSL**: Root DSL object with version and metadata support
- **Group**: Logical grouping with AND/OR/NOT operators
- **Condition**: Individual conditions with left/right operands and operators
- **FieldRef**: Field references with optional aliases
- **Literal**: Typed literal values (STRING|NUMBER|BOOLEAN|NULL|DATE|ARRAY)
- **FunctionCall**: Function calls with parameterized arguments
- **FieldMetaResp**: Field metadata with validation rules and categories
- **FunctionMetaResp**: Function definitions with SQL templates

#### Backend REST Endpoints (Already Implemented)
- **GET /api/screeners/fields**: Get available fields for criteria building
- **GET /api/screeners/functions**: Get available functions for criteria building
- **POST /api/screeners/validate-criteria**: Validate criteria DSL structure
- **POST /api/screeners/generate-sql**: Generate parameterized SQL from DSL
- **POST /api/screeners/preview-criteria**: Preview criteria with estimates
- **GET /api/screeners/fields/{fieldId}/operators**: Get compatible operators
- **GET /api/screeners/operators**: Get all available operators

#### Backend Services (Already Implemented)
- **FieldMetadataService**: Field metadata management with caching
- **FunctionDefinitionService**: Function definition management
- **CriteriaValidationService**: DSL validation with performance checks
- **CriteriaSqlService**: SQL generation with security validation
- **CurrentUserService**: User context for role-based access

### Frontend-Backend Data Mapping
The Angular component will map backend DTOs to frontend interfaces:

```typescript
// Backend FieldMetaResp → Frontend FieldMeta
interface FieldMeta {
  id: string;           // maps to backend fieldName
  label: string;         // maps to backend displayName
  dbColumn: string;      // maps to backend fieldName
  dataType: FieldType;   // maps to backend dataType
  // ... additional frontend-specific properties
}

// Backend CriteriaDSL → Frontend CriteriaDSL
interface CriteriaDSL {
  root: Group;           // maps to backend Group DTO
  version?: string;      // maps to backend version (default: "1.0")
  metadata?: any;        // maps to backend metadata Object
}
```

### Authentication Integration
- Uses existing JWT token authentication from Microsoft OAuth2
- All API calls include `Authorization: Bearer <jwt-token>` header
- User context provided by backend `CurrentUserService.getCurrentUserId()`
- Role-based field/function access control maintained

### Error Handling Integration
- Backend validation errors mapped to frontend `ValidationError` interface
- Network errors handled with retry logic and user-friendly messages
- Authentication errors trigger re-login flow through existing MSAL integration

### Updated Limits and Performance Considerations
Based on clarification session, the component now supports:
- **Maximum Nesting Depth**: 10 levels (increased from 5)
- **Maximum Elements**: 100 elements (increased from 50)
- **Memory Usage**: Up to 10MB (increased from 5MB)

These limits provide sufficient capacity for complex stock screening criteria while maintaining performance targets. The increased limits require:
- Enhanced memory management for larger criteria structures
- Optimized rendering algorithms for deep nesting
- Efficient change detection strategies for complex hierarchies
- Robust validation for edge cases at higher limits

### Standalone Component Architecture
The criteria builder component follows a pure input-driven architecture:

#### Component Design Principles
- **Zero Internal API Calls**: Component makes NO HTTP requests or API calls internally
- **Pure @Input Data**: All data (fields, functions, validation results, SQL preview) provided via @Input properties
- **Parent Responsibility**: Parent components handle all API integration using existing frontend services
- **Reactive Updates**: Component emits @Output events for data changes, parent handles API calls

#### Integration with Existing Frontend Services
- **ScreenerApiService**: Parent components use existing service for field metadata and function definitions
- **ScreenerStateService**: Parent components manage state and API calls
- **Existing Entities**: Leverage existing screener entities and DTOs from ./frontend/src/app/services/entities/

#### Component Interface
```typescript
@Component({
  selector: 'mp-criteria-builder',
  template: '...'
})
export class MpCriteriaBuilderComponent implements ControlValueAccessor {
  @Input() fields: FieldMeta[] = [];
  @Input() functions: FunctionMeta[] = [];
  @Input() validationResult?: ValidationResult;
  @Input() sqlPreview?: string;
  @Input() config: CriteriaConfig = DEFAULT_CONFIG;
  
  @Output() dslChange = new EventEmitter<CriteriaDSL>();
  @Output() validationRequest = new EventEmitter<CriteriaDSL>();
  @Output() sqlRequest = new EventEmitter<CriteriaDSL>();
}
```

#### Parent Component Pattern
```typescript
// Parent component handles all API calls
export class ScreenerConfigureComponent {
  fields$ = this.screenerApi.getFields();
  functions$ = this.screenerApi.getFunctions();
  
  onValidationRequest(dsl: CriteriaDSL) {
    this.screenerApi.validateCriteria(dsl).subscribe(result => {
      // Pass validation result back to criteria builder
    });
  }
}
```

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
