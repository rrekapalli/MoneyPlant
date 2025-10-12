# Frequently Asked Questions - Criteria Builder UI Library

This document answers common questions about the Criteria Builder UI Library.

## Table of Contents

- [General Questions](#general-questions)
- [Installation and Setup](#installation-and-setup)
- [Usage and Configuration](#usage-and-configuration)
- [API Integration](#api-integration)
- [Performance and Scalability](#performance-and-scalability)
- [Security and Best Practices](#security-and-best-practices)
- [Customization and Theming](#customization-and-theming)
- [Troubleshooting](#troubleshooting)
- [Development and Contributing](#development-and-contributing)

## General Questions

### Q: What is the Criteria Builder UI Library?

**A:** The Criteria Builder UI Library is an Angular v20 library that provides a sophisticated visual form control for building complex filtering criteria. It allows users to create queries through interactive tokens and clickable elements, generating both human-readable criteria sentences and safe parameterized SQL WHERE clauses.

### Q: What Angular versions are supported?

**A:** The library is built specifically for Angular v20 and requires Angular v20 or higher. It uses the latest Angular features and APIs that are not available in older versions.

### Q: Can I use this library with older Angular versions?

**A:** No, the library specifically targets Angular v20 and uses features not available in older versions. If you're using an older Angular version, you'll need to upgrade your application to Angular v20 first.

### Q: Is this library compatible with Angular Universal (SSR)?

**A:** Yes, the library is designed to work with Angular Universal. However, some features like localStorage-based presets may need special handling in SSR environments. The component will gracefully degrade when localStorage is not available.

### Q: What are the main features of this library?

**A:** Key features include:
- Visual token-based interface for building criteria
- Dynamic API integration for fields and functions
- Drag & drop reordering of query elements
- Full Angular Reactive Forms integration
- Server-side SQL generation for security
- Import/export and preset management
- Comprehensive accessibility support
- Real-time validation with detailed error reporting

### Q: Is the library free to use?

**A:** Yes, the library is released under the MIT License, which allows free use in both commercial and non-commercial projects.

## Installation and Setup

### Q: How do I install the library?

**A:** Install the library and its peer dependencies:

```bash
npm install @projects/criteria-builder
npm install @angular/common@^20.0.0 @angular/core@^20.0.0 @angular/forms@^20.0.0 @angular/cdk@^20.0.0 primeng@^20.0.0 primeicons@^7.0.0 primeflex@^4.0.0 rxjs@~7.8.0
```

### Q: Why does the library require PrimeNG?

**A:** The library uses PrimeNG components for UI elements like dropdowns, dialogs, buttons, and overlays. PrimeNG provides a consistent, accessible, and well-tested set of components that integrate seamlessly with Angular.

### Q: Can I use a different UI library instead of PrimeNG?

**A:** No, PrimeNG is a required dependency. The library is built specifically with PrimeNG components and would require significant refactoring to use a different UI library.

### Q: How do I set up the required styles?

**A:** Add the required styles to your `angular.json` or import them in your global styles:

```scss
@import 'primeng/resources/themes/saga-blue/theme.css';
@import 'primeng/resources/primeng.min.css';
@import 'primeicons/primeicons.css';
@import 'primeflex/primeflex.css';
```

### Q: Can I use a different PrimeNG theme?

**A:** Yes, you can use any PrimeNG theme. Just replace `saga-blue` with your preferred theme name:

```scss
@import 'primeng/resources/themes/lara-light-blue/theme.css';
```

## Usage and Configuration

### Q: How do I integrate the component with Angular Reactive Forms?

**A:** The component implements `ControlValueAccessor` and works seamlessly with Reactive Forms:

```typescript
const criteriaControl = new FormControl<CriteriaDSL | null>(null);

// In template
<ac-criteria-builder [formControl]="criteriaControl"></ac-criteria-builder>
```

### Q: Can I use template-driven forms instead of reactive forms?

**A:** While the component supports `ngModel`, we strongly recommend using Reactive Forms for better type safety, validation, and testing capabilities:

```html
<!-- Supported but not recommended -->
<ac-criteria-builder [(ngModel)]="criteria"></ac-criteria-builder>

<!-- Recommended -->
<ac-criteria-builder [formControl]="criteriaControl"></ac-criteria-builder>
```

### Q: How do I configure the component behavior?

**A:** Use the `BuilderConfig` interface to customize the component:

```typescript
const config: BuilderConfig = {
  allowGrouping: true,
  maxDepth: 5,
  enableAdvancedFunctions: true,
  showSqlPreview: true,
  debounceMs: 200,
  compactMode: false
};
```

### Q: Can I disable certain features?

**A:** Yes, most features can be disabled through configuration:

```typescript
const minimalConfig: BuilderConfig = {
  allowGrouping: false,           // Disable nested groups
  enableAdvancedFunctions: false, // Disable function library
  showSqlPreview: false,         // Hide SQL preview
  enableKeyboardShortcuts: false // Disable keyboard shortcuts
};
```

### Q: How do I handle validation events?

**A:** Listen to the `validityChange` event:

```typescript
onValidityChange(isValid: boolean) {
  console.log('Criteria is valid:', isValid);
  this.canSave = isValid;
}
```

### Q: How do I get the generated SQL?

**A:** Listen to the `sqlPreviewChange` event:

```typescript
onSqlPreviewChange(result: { sql: string; params: Record<string, any> }) {
  console.log('Generated SQL:', result.sql);
  console.log('Parameters:', result.params);
}
```

## API Integration

### Q: What backend API endpoints do I need to implement?

**A:** The library expects these REST endpoints:

```
GET /api/screeners/criteria/fields
GET /api/screeners/criteria/functions
GET /api/screeners/criteria/functions/{id}/signature
GET /api/screeners/criteria/fields/{id}/operators
GET /api/screeners/criteria/fields/{id}/suggestions
POST /api/screeners/criteria/validate
POST /api/screeners/criteria/sql
```

### Q: Can I use different API endpoints?

**A:** Currently, the API endpoints are hardcoded in the `CriteriaApiService`. You would need to extend or modify the service to use different endpoints.

### Q: What should the API endpoints return?

**A:** Each endpoint has a specific response format. For example:

```typescript
// GET /api/screeners/criteria/fields
[
  {
    "id": "price",
    "label": "Price",
    "dbColumn": "current_price",
    "dataType": "currency",
    "category": "Financial"
  }
]
```

See the API documentation for complete response formats.

### Q: How do I handle API authentication?

**A:** Implement an HTTP interceptor to add authentication headers:

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${this.getToken()}`)
    });
    return next.handle(authReq);
  }
}
```

### Q: What happens if API endpoints are not available?

**A:** The component will show error states and fallback behavior:
- Empty dropdowns for fields/functions
- Validation will be disabled
- SQL generation will not work
- Error messages will be displayed to users

### Q: Can I provide static field and function data instead of API calls?

**A:** Currently, the library is designed for dynamic API integration. You could potentially mock the API service, but this would require custom implementation.

## Performance and Scalability

### Q: How does the component perform with large numbers of fields or functions?

**A:** The component handles large datasets efficiently:
- Fields and functions are loaded lazily from API
- Dropdowns include search functionality
- Consider categorizing fields and functions on the server
- Use pagination if you have thousands of items

### Q: What's the maximum number of conditions supported?

**A:** There's no hard limit, but performance considerations apply:
- Default `maxConditions` is 100
- Complex criteria with 50+ conditions may see slower rendering
- Use `compactMode` and increase `debounceMs` for better performance

### Q: How can I optimize performance for complex criteria?

**A:** Several optimization strategies:

```typescript
const performanceConfig: BuilderConfig = {
  debounceMs: 500,      // Longer debounce for complex criteria
  compactMode: true,    // Reduced visual complexity
  maxDepth: 3,          // Limit nesting depth
  maxConditions: 50     // Limit total conditions
};
```

### Q: Does the component cause memory leaks?

**A:** The component is designed to clean up properly, but ensure you:
- Unsubscribe from observables in `ngOnDestroy`
- Use `takeUntil` pattern for subscriptions
- Don't hold references to large DSL objects unnecessarily

### Q: How much memory does the component use?

**A:** Memory usage depends on criteria complexity:
- Simple criteria: ~1-2MB
- Complex criteria (100+ conditions): ~5-10MB
- The component cleans up properly when destroyed

## Security and Best Practices

### Q: Is the generated SQL safe from injection attacks?

**A:** Yes, the library implements multiple security layers:
- Server-side SQL generation only
- Parameterized queries with named parameters
- Field and function ID validation against server whitelists
- Input sanitization and validation

### Q: Can users inject malicious content through the interface?

**A:** No, the library includes comprehensive security measures:
- All field and function IDs are validated against server whitelists
- User input is sanitized and validated
- Import functionality includes security scanning
- No dynamic SQL construction on the client

### Q: Should I validate the DSL on my backend?

**A:** Yes, always validate DSL on your backend before:
- Generating SQL
- Saving to database
- Executing queries

Client-side validation is for user experience only.

### Q: Are there any security considerations for import/export?

**A:** The import system includes security validation:
- Detects and blocks script tags and JavaScript code
- Validates JSON structure and content
- Enforces file size limits
- Scans for suspicious patterns

Always validate imported content on your backend as well.

### Q: How should I handle user permissions for fields and functions?

**A:** Implement permission filtering in your API endpoints:

```typescript
// Return only fields/functions the current user can access
GET /api/screeners/criteria/fields
GET /api/screeners/criteria/functions
```

## Customization and Theming

### Q: How do I customize the visual appearance?

**A:** The library uses PrimeNG theming. You can:
1. Use different PrimeNG themes
2. Override CSS variables for colors
3. Use the `theme` and `compactMode` config options
4. Enable high contrast or colorblind-friendly modes

### Q: Can I customize the token colors?

**A:** Yes, override the CSS variables:

```scss
:root {
  --criteria-field-color: #your-color;
  --criteria-operator-color: #your-color;
  --criteria-value-color: #your-color;
  --criteria-function-color: #your-color;
}
```

### Q: How do I add custom keyboard shortcuts?

**A:** The library provides built-in shortcuts, but you can add custom ones:

```typescript
@HostListener('keydown', ['$event'])
onKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    this.saveCriteria();
  }
}
```

### Q: Can I customize the error messages?

**A:** Error messages come from the server-side validation API. Customize them in your backend validation logic.

### Q: How do I add tooltips or help text?

**A:** Use the `description` and `helpText` fields in your field and function metadata:

```typescript
{
  "id": "price",
  "label": "Price",
  "description": "Current stock price in USD",
  "helpText": "Enter price in dollars (e.g., 150.25)"
}
```

## Troubleshooting

### Q: The component is not displaying. What should I check?

**A:** Common issues:
1. Module not imported: Add `CriteriaBuilderModule` to imports
2. Styles not loaded: Import PrimeNG styles
3. Selector typo: Use `<ac-criteria-builder>` not `<criteria-builder>`
4. CSS display issues: Ensure the element is visible

### Q: Why are my fields/functions not loading?

**A:** Check:
1. API endpoints are accessible and return correct format
2. CORS is configured properly
3. Authentication headers are included if required
4. Network requests in browser dev tools for errors

### Q: The component shows as invalid even with correct criteria. Why?

**A:** Possible causes:
1. Field IDs in DSL don't match API field IDs exactly
2. Function IDs are invalid or not found
3. Server-side validation logic has errors
4. Network issues preventing validation API calls

### Q: How do I debug issues?

**A:** Enable debug mode:

```typescript
localStorage.setItem('criteria-builder-debug', 'true');
```

This provides detailed logging of API calls, validation, and component state.

### Q: The component is slow with large criteria. How can I improve performance?

**A:** Try these optimizations:
- Increase `debounceMs` to 500ms or higher
- Enable `compactMode`
- Reduce `maxDepth` and `maxConditions`
- Use OnPush change detection in your component

## Development and Contributing

### Q: How do I build the library locally?

**A:** 
```bash
git clone <repository>
cd <project>
npm install
ng build criteria-builder
```

### Q: How do I run tests?

**A:**
```bash
ng test criteria-builder
ng test criteria-builder --code-coverage
```

### Q: How can I contribute to the library?

**A:** 
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run linting and tests
5. Submit a pull request

### Q: What's the development roadmap?

**A:** Future enhancements may include:
- Additional field types and operators
- More advanced function capabilities
- Enhanced theming options
- Performance optimizations
- Additional accessibility features

### Q: How do I report bugs or request features?

**A:** 
- **Bugs:** Create an issue on GitHub with reproduction steps
- **Features:** Create a feature request issue with use case description
- **Questions:** Use GitHub Discussions or Stack Overflow

### Q: Is there a community or support forum?

**A:** 
- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and community discussion
- **Stack Overflow:** Tag questions with `criteria-builder-ui`

### Q: How often is the library updated?

**A:** The library follows semantic versioning:
- **Patch releases:** Bug fixes and minor improvements
- **Minor releases:** New features and enhancements
- **Major releases:** Breaking changes and major new features

### Q: What's the long-term support policy?

**A:** 
- Current major version receives active development
- Previous major version receives security updates for 6 months
- Angular version compatibility follows Angular's LTS schedule

---

## Still Have Questions?

If your question isn't answered here:

1. **Check the documentation:** README.md, API.md, TROUBLESHOOTING.md
2. **Search existing issues:** GitHub issues and discussions
3. **Enable debug mode:** Get detailed logging information
4. **Create a minimal reproduction:** Isolate the issue
5. **Ask the community:** GitHub Discussions or Stack Overflow

When asking questions, please include:
- Angular version
- Library version
- Browser and version
- Console errors (if any)
- Minimal code example
- Expected vs actual behavior