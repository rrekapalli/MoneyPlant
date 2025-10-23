# Research Findings: Criteria Builder Library

**Date**: 2024-12-19  
**Feature**: Criteria Builder Library  
**Purpose**: Resolve technical clarifications and establish implementation approach

## Technology Decisions

### Angular Library Architecture
**Decision**: Use ng-packagr for library packaging with Angular 20+  
**Rationale**: ng-packagr is the official Angular library packaging tool, provides optimal bundle sizes, and ensures compatibility with Angular's build system  
**Alternatives considered**: 
- Custom webpack configuration (rejected - adds complexity)
- Angular CLI library generation (rejected - limited customization)

### PrimeNG Component Integration
**Decision**: Use PrimeNG 20+ components for badge styling and interactions  
**Rationale**: PrimeNG provides consistent design system, accessibility features, and comprehensive component library that aligns with MoneyPlant's UI standards  
**Alternatives considered**:
- Custom CSS-only badges (rejected - lacks accessibility features)
- Material Design components (rejected - inconsistent with existing PrimeNG usage)

### Drag & Drop Implementation
**Decision**: Use Angular CDK Drag & Drop module  
**Rationale**: Official Angular solution with excellent accessibility support, performance optimization, and seamless integration with Angular reactive forms  
**Alternatives considered**:
- Custom drag & drop implementation (rejected - complex accessibility requirements)
- Third-party libraries like ng2-dragula (rejected - maintenance concerns)

### State Management
**Decision**: Use ControlValueAccessor with RxJS for reactive state management  
**Rationale**: ControlValueAccessor provides seamless Angular form integration, RxJS enables reactive programming patterns for real-time updates  
**Alternatives considered**:
- NgRx state management (rejected - overkill for component-level state)
- Simple component properties (rejected - lacks form integration)

### DSL/SQL Generation
**Decision**: Implement CriteriaSerializerService with template-based SQL generation  
**Rationale**: Template-based approach provides flexibility for different SQL dialects, maintains separation of concerns, and enables easy testing  
**Alternatives considered**:
- Query builder libraries (rejected - adds external dependencies)
- Direct SQL string concatenation (rejected - security and maintainability concerns)

## Implementation Patterns

### Badge Component Architecture
**Pattern**: Hierarchical component structure with base BadgeComponent and specialized implementations  
**Rationale**: Enables code reuse, consistent styling, and easy extension for new badge types  
**Implementation**:
- Base `BadgeComponent` with common functionality
- Specialized components: `FieldBadgeComponent`, `OperatorBadgeComponent`, `FunctionBadgeComponent`, `GroupBadgeComponent`
- Shared `BadgeActionComponent` for delete/edit controls

### Form Integration Strategy
**Pattern**: ControlValueAccessor implementation with reactive form support  
**Rationale**: Enables seamless integration with Angular reactive forms, provides validation support, and maintains form state consistency  
**Implementation**:
- Implement `ControlValueAccessor` interface
- Use `@Input()` for configuration (fields, functions, config)
- Emit `@Output()` events for DSL changes, validity changes, SQL preview

### Performance Optimization
**Pattern**: OnPush change detection with memoized computations  
**Rationale**: Reduces unnecessary re-renders, improves performance for complex criteria structures  
**Implementation**:
- Use `ChangeDetectionStrategy.OnPush`
- Implement `TrackByFunction` for badge lists
- Memoize expensive computations (SQL generation, validation)

## Accessibility Implementation

### Keyboard Navigation
**Pattern**: Full keyboard support with logical tab order and ARIA attributes  
**Rationale**: Ensures WCAG 2.1 AA compliance and provides equal access for all users  
**Implementation**:
- `role="group"` for group badges
- `aria-pressed` for curly-brace toggle
- `aria-label` for delete buttons
- Arrow key navigation for badge selection
- Enter/Space for activation

### Screen Reader Support
**Pattern**: Comprehensive ARIA labeling and live regions for dynamic content  
**Rationale**: Enables screen reader users to understand and interact with the criteria builder  
**Implementation**:
- `aria-live` regions for DSL/SQL updates
- Descriptive labels for all interactive elements
- Announcements for drag & drop operations

## Testing Strategy

### Unit Testing
**Pattern**: Component testing with Angular Testing Library  
**Rationale**: Provides realistic user interaction testing and better maintainability than traditional Angular testing utilities  
**Implementation**:
- Test user interactions (click, drag, keyboard)
- Mock external dependencies (field metadata, function definitions)
- Validate DSL/SQL output generation

### Integration Testing
**Pattern**: Form integration testing with real ControlValueAccessor implementation  
**Rationale**: Ensures component works correctly within Angular reactive forms  
**Implementation**:
- Test form validation states
- Test form value changes
- Test error handling and recovery

## Security Considerations

### Input Validation
**Pattern**: Whitelist validation for field IDs and function names  
**Rationale**: Prevents injection attacks and ensures only valid criteria are generated  
**Implementation**:
- Validate field IDs against provided metadata
- Validate function names against provided definitions
- Sanitize user input for SQL generation

### SQL Injection Prevention
**Pattern**: Parameterized query generation with proper escaping  
**Rationale**: Prevents SQL injection attacks while maintaining query functionality  
**Implementation**:
- Use parameterized placeholders (`:p1`, `:p2`, etc.)
- Escape special characters in field names
- Validate operator compatibility

## Performance Targets

### Response Time Goals
- DSL generation: <100ms (achieved through memoization)
- SQL preview: <200ms (achieved through template caching)
- Drag operations: <150ms (achieved through CDK optimization)

### Memory Usage
- Component memory footprint: <10MB for typical usage (increased from 5MB due to higher limits)
- Support for up to 100 nested elements without degradation (increased from 50)
- Support for up to 10 levels of nesting depth (increased from 5)
- Efficient cleanup of event listeners and subscriptions

## Integration Points

### Backend Integration
**Pattern**: REST API consumption through dedicated service layer  
**Rationale**: Maintains separation of concerns and enables easy testing/mocking  
**Implementation**:
- `ScreenerService` for field metadata and function definitions
- `CriteriaValidationService` for server-side validation
- Error handling with user-friendly messages

### Frontend Integration
**Pattern**: Module-based architecture with clear public API  
**Rationale**: Enables easy integration into existing Angular applications  
**Implementation**:
- `MpCriteriaBuilderModule` as main export
- Clear public API in `public-api.ts`
- Comprehensive documentation and examples
