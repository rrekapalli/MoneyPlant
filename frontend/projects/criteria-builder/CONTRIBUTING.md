# Contributing to Criteria Builder UI Library

Thank you for your interest in contributing to the Criteria Builder UI Library! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and professional in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Angular CLI 20+
- Git
- A modern code editor (VS Code recommended)

### Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/criteria-builder-ui.git
   cd criteria-builder-ui
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build the library:**
   ```bash
   ng build criteria-builder
   ```

5. **Run tests:**
   ```bash
   ng test criteria-builder
   ```

## Development Setup

### Project Structure

```
frontend/projects/criteria-builder/
├── src/
│   ├── lib/
│   │   ├── components/          # UI components
│   │   ├── services/           # Services and utilities
│   │   ├── models/             # TypeScript interfaces and types
│   │   ├── directives/         # Angular directives
│   │   └── utils/              # Utility functions
│   └── public-api.ts           # Public API exports
├── README.md                   # Main documentation
├── API.md                      # API documentation
├── SECURITY.md                 # Security guidelines
├── TROUBLESHOOTING.md          # Troubleshooting guide
├── FAQ.md                      # Frequently asked questions
├── ACCESSIBILITY.md            # Accessibility features
├── IMPORT_EXPORT.md           # Import/export documentation
├── CHANGELOG.md               # Version history
└── package.json               # Package configuration
```

### Development Commands

```bash
# Build the library
ng build criteria-builder

# Build in watch mode
ng build criteria-builder --watch

# Run unit tests
ng test criteria-builder

# Run tests with coverage
ng test criteria-builder --code-coverage

# Run linting
ng lint criteria-builder

# Build documentation
npm run docs:build

# Serve documentation
npm run docs:serve
```

### Local Development

To test your changes in a local application:

1. **Build the library:**
   ```bash
   ng build criteria-builder
   ```

2. **Link the library:**
   ```bash
   cd dist/criteria-builder
   npm link
   ```

3. **In your test application:**
   ```bash
   npm link criteria-builder
   ```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix issues in existing functionality
- **Feature enhancements**: Improve existing features
- **New features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize performance
- **Accessibility**: Improve accessibility features

### Before You Start

1. **Check existing issues** to see if your contribution is already being worked on
2. **Create an issue** to discuss major changes before implementing
3. **Fork the repository** and create a feature branch
4. **Follow coding standards** and write tests
5. **Update documentation** as needed

### Issue Guidelines

When creating issues:

- **Use clear, descriptive titles**
- **Provide detailed descriptions** with steps to reproduce
- **Include environment information** (Angular version, browser, OS)
- **Add labels** to categorize the issue
- **Include code examples** when relevant

#### Issue Templates

**Bug Report:**
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Angular version: 
- Library version: 
- Browser: 
- OS: 

## Additional Context
Any other relevant information
```

**Feature Request:**
```markdown
## Feature Description
Brief description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass:**
   ```bash
   ng test criteria-builder
   ```

2. **Run linting:**
   ```bash
   ng lint criteria-builder
   ```

3. **Build successfully:**
   ```bash
   ng build criteria-builder
   ```

4. **Update documentation** if needed

5. **Add or update tests** for your changes

### Pull Request Guidelines

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following coding standards

3. **Commit your changes** with clear messages:
   ```bash
   git commit -m "feat: add new token validation feature"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Breaking change notes if applicable

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(tokens): add drag and drop reordering
fix(validation): resolve null reference error
docs(api): update component documentation
test(services): add unit tests for import service
```

### Review Process

1. **Automated checks** must pass (tests, linting, build)
2. **Code review** by maintainers
3. **Testing** of functionality
4. **Documentation review** if applicable
5. **Approval** and merge

## Coding Standards

### TypeScript Guidelines

- **Use strict TypeScript** with proper typing
- **Follow Angular style guide**
- **Use meaningful variable and function names**
- **Add JSDoc comments** for public APIs
- **Prefer composition over inheritance**
- **Use readonly properties** where appropriate

```typescript
// ✅ Good
interface CriteriaConfig {
  readonly allowGrouping: boolean;
  readonly maxDepth: number;
}

/**
 * Validates a criteria DSL structure
 * @param dsl The criteria DSL to validate
 * @returns Validation result with errors and warnings
 */
validateCriteria(dsl: CriteriaDSL): ValidationResult {
  // Implementation
}

// ❌ Avoid
function validate(data: any): any {
  // Implementation
}
```

### Angular Guidelines

- **Use OnPush change detection** where possible
- **Implement OnDestroy** for cleanup
- **Use reactive forms** over template-driven forms
- **Follow component/service separation**
- **Use dependency injection** properly

```typescript
// ✅ Good
@Component({
  selector: 'ac-criteria-builder',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriteriaBuilderComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.setupSubscriptions();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private setupSubscriptions() {
    this.valueChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.handleValueChange(value));
  }
}
```

### CSS/SCSS Guidelines

- **Use BEM methodology** for class naming
- **Scope styles** to components
- **Use CSS custom properties** for theming
- **Follow mobile-first** responsive design
- **Ensure accessibility** in styles

```scss
// ✅ Good
.criteria-builder {
  &__token {
    display: inline-block;
    padding: var(--token-padding, 0.5rem);
    
    &--selected {
      background-color: var(--token-selected-bg, #007bff);
    }
    
    &--error {
      border-color: var(--token-error-border, #dc3545);
    }
  }
}
```

## Testing Guidelines

### Unit Testing

- **Write tests for all public methods**
- **Test error conditions**
- **Use meaningful test descriptions**
- **Mock external dependencies**
- **Aim for 90%+ code coverage**

```typescript
describe('CriteriaBuilderComponent', () => {
  let component: CriteriaBuilderComponent;
  let fixture: ComponentFixture<CriteriaBuilderComponent>;
  let mockApiService: jasmine.SpyObj<CriteriaApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CriteriaApiService', ['validateCriteria']);
    
    TestBed.configureTestingModule({
      declarations: [CriteriaBuilderComponent],
      providers: [
        { provide: CriteriaApiService, useValue: spy }
      ]
    });
    
    fixture = TestBed.createComponent(CriteriaBuilderComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(CriteriaApiService) as jasmine.SpyObj<CriteriaApiService>;
  });

  describe('writeValue', () => {
    it('should update internal DSL when value is provided', () => {
      const testDSL: CriteriaDSL = { /* test data */ };
      
      component.writeValue(testDSL);
      
      expect(component.currentDSL$.value).toEqual(testDSL);
    });

    it('should handle null values gracefully', () => {
      component.writeValue(null);
      
      expect(component.currentDSL$.value).toBeNull();
    });
  });
});
```

### Integration Testing

- **Test component interactions**
- **Test form integration**
- **Test API service integration**
- **Test accessibility features**

### E2E Testing (Future)

- **Test complete user workflows**
- **Test cross-browser compatibility**
- **Test accessibility with real assistive technologies**

## Documentation Guidelines

### Code Documentation

- **Add JSDoc comments** for all public APIs
- **Include examples** in documentation
- **Document parameters and return values**
- **Explain complex logic** with inline comments

```typescript
/**
 * Converts a CriteriaDSL structure to visual tokens for rendering
 * 
 * @param dsl - The criteria DSL to convert
 * @param depth - Current nesting depth (used for indentation)
 * @returns Array of QueryToken objects for rendering
 * 
 * @example
 * ```typescript
 * const tokens = this.dslToTokens(dsl, 0);
 * console.log('Generated tokens:', tokens);
 * ```
 */
private dslToTokens(dsl: CriteriaDSL, depth: number = 0): QueryToken[] {
  // Implementation with inline comments for complex logic
}
```

### README Updates

When adding features, update the README with:
- **Usage examples**
- **Configuration options**
- **API changes**
- **Breaking changes**

### API Documentation

- **Update API.md** for interface changes
- **Include request/response examples**
- **Document error conditions**
- **Provide migration guides** for breaking changes

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

1. **Update version** in package.json
2. **Update CHANGELOG.md** with release notes
3. **Run all tests** and ensure they pass
4. **Build the library** and verify output
5. **Update documentation** as needed
6. **Create release tag** and GitHub release
7. **Publish to npm** (maintainers only)

### Pre-release Testing

Before major releases:
- **Test in multiple Angular versions**
- **Test in different browsers**
- **Test accessibility features**
- **Performance testing**
- **Security review**

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community discussion
- **Pull Request Comments**: Code review discussions

### Maintainer Response Times

- **Critical bugs**: Within 24 hours
- **Regular issues**: Within 1 week
- **Feature requests**: Within 2 weeks
- **Pull requests**: Within 1 week

### Mentorship

New contributors can:
- **Look for "good first issue" labels**
- **Ask questions in GitHub Discussions**
- **Request code review feedback**
- **Pair program with maintainers** (by arrangement)

## Recognition

Contributors will be recognized through:
- **GitHub contributor list**
- **Release notes mentions**
- **Documentation credits**
- **Community highlights**

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the Criteria Builder UI Library! Your contributions help make this library better for everyone.