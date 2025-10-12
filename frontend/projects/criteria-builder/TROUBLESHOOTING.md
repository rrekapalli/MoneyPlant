# Troubleshooting Guide - Criteria Builder UI Library

This guide helps you diagnose and resolve common issues when using the Criteria Builder UI Library.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation Issues](#installation-issues)
- [Component Issues](#component-issues)
- [API Integration Issues](#api-integration-issues)
- [Form Integration Issues](#form-integration-issues)
- [Performance Issues](#performance-issues)
- [Accessibility Issues](#accessibility-issues)
- [Import/Export Issues](#import-export-issues)
- [Browser Compatibility Issues](#browser-compatibility-issues)
- [Debug Tools](#debug-tools)
- [Getting Help](#getting-help)

## Quick Diagnostics

### Enable Debug Mode

First, enable debug mode to get detailed logging:

```typescript
// In your main.ts or app.component.ts
if (!environment.production) {
  localStorage.setItem('criteria-builder-debug', 'true');
}
```

### Check Browser Console

Open browser developer tools (F12) and check for:
- JavaScript errors in Console tab
- Failed network requests in Network tab
- Missing resources in Network tab

### Verify Basic Setup

```typescript
// Check if module is imported
import { CriteriaBuilderModule } from '@projects/criteria-builder';

@NgModule({
  imports: [
    CriteriaBuilderModule, // ✅ Should be here
    // ...
  ]
})
export class AppModule { }
```

## Installation Issues

### Issue: Package Not Found

**Error:** `npm ERR! 404 Not Found - GET https://registry.npmjs.org/@projects/criteria-builder`

**Solution:**
```bash
# If using local library build
ng build criteria-builder
npm link dist/criteria-builder

# In your app
npm link @projects/criteria-builder
```

### Issue: Peer Dependency Warnings

**Error:** `WARN peerDependencies The peer dependency @angular/core@^20.0.0 is not satisfied`

**Solution:**
```bash
# Install all required peer dependencies
npm install @angular/common@^20.0.0 @angular/core@^20.0.0 @angular/forms@^20.0.0 @angular/cdk@^20.0.0 primeng@^20.0.0 primeicons@^7.0.0 primeflex@^4.0.0 rxjs@~7.8.0
```

### Issue: Style Not Loading

**Problem:** Component appears unstyled or with broken layout.

**Solution:**
```scss
// In your global styles.scss or angular.json
@import 'primeng/resources/themes/saga-blue/theme.css';
@import 'primeng/resources/primeng.min.css';
@import 'primeicons/primeicons.css';
@import 'primeflex/primeflex.css';
```

Or in `angular.json`:
```json
{
  "styles": [
    "node_modules/primeng/resources/themes/saga-blue/theme.css",
    "node_modules/primeng/resources/primeng.min.css",
    "node_modules/primeicons/primeicons.css",
    "node_modules/primeflex/primeflex.css",
    "src/styles.scss"
  ]
}
```

## Component Issues

### Issue: Component Not Displaying

**Problem:** `<ac-criteria-builder>` element is empty or not visible.

**Diagnosis:**
```typescript
// Check if component is recognized
@Component({
  template: `
    <div>
      <h3>Before Component</h3>
      <ac-criteria-builder></ac-criteria-builder>
      <h3>After Component</h3>
    </div>
  `
})
```

**Solutions:**

1. **Module Import Missing:**
```typescript
@NgModule({
  imports: [
    CriteriaBuilderModule, // ✅ Add this
    ReactiveFormsModule,   // ✅ Required for forms
    // ...
  ]
})
```

2. **Selector Typo:**
```html
<!-- ❌ Wrong -->
<criteria-builder></criteria-builder>

<!-- ✅ Correct -->
<ac-criteria-builder></ac-criteria-builder>
```

3. **CSS Display Issues:**
```scss
ac-criteria-builder {
  display: block; // Ensure it's visible
  min-height: 200px; // Give it some height
}
```

### Issue: Component Shows Error State

**Problem:** Component displays error message or red border.

**Diagnosis:**
```typescript
onValidityChange(isValid: boolean) {
  console.log('Component validity:', isValid);
}

onErrorChange(errors: ValidationError[]) {
  console.log('Component errors:', errors);
}
```

**Solutions:**

1. **Check API Endpoints:**
```typescript
// Verify API endpoints are accessible
async testApiEndpoints() {
  try {
    const fields = await this.criteriaApiService.getFields().toPromise();
    console.log('Fields loaded:', fields.length);
  } catch (error) {
    console.error('API Error:', error);
  }
}
```

2. **Check Network Connectivity:**
```bash
# Test API endpoints directly
curl -X GET "http://your-api/api/screeners/criteria/fields"
curl -X GET "http://your-api/api/screeners/criteria/functions"
```

### Issue: Tokens Not Clickable

**Problem:** Visual tokens don't respond to clicks.

**Diagnosis:**
```scss
// Check if tokens have proper CSS
.token-container {
  pointer-events: auto; // Should not be 'none'
  cursor: pointer;
}
```

**Solutions:**

1. **CSS Pointer Events:**
```scss
.criteria-builder-container * {
  pointer-events: auto; // Ensure clicks work
}
```

2. **Z-Index Issues:**
```scss
.token-renderer {
  position: relative;
  z-index: 1; // Ensure tokens are on top
}
```

3. **Event Handler Issues:**
```typescript
// Check if click handlers are bound
@Component({
  template: `
    <ac-criteria-builder
      (click)="onComponentClick($event)"
      [config]="config">
    </ac-criteria-builder>
  `
})
export class TestComponent {
  onComponentClick(event: MouseEvent) {
    console.log('Component clicked:', event.target);
  }
}
```

## API Integration Issues

### Issue: Fields Not Loading

**Problem:** Dropdown menus are empty or show "No fields available".

**Diagnosis:**
```typescript
// Check API response
this.criteriaApiService.getFields().subscribe({
  next: (fields) => {
    console.log('Fields response:', fields);
    console.log('Fields count:', fields.length);
  },
  error: (error) => {
    console.error('Fields API error:', error);
    console.error('Status:', error.status);
    console.error('Message:', error.message);
  }
});
```

**Solutions:**

1. **API Endpoint Not Found (404):**
```typescript
// Check if endpoint exists
// GET /api/screeners/criteria/fields should return FieldMetaResp[]

// Example response format:
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

2. **CORS Issues:**
```typescript
// Backend CORS configuration
app.enableCors({
  origin: ['http://localhost:4200', 'https://your-domain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

3. **Authentication Issues:**
```typescript
// Check if API requires authentication
const headers = new HttpHeaders({
  'Authorization': `Bearer ${this.authService.getToken()}`
});

this.http.get('/api/screeners/criteria/fields', { headers }).subscribe(/*...*/);
```

### Issue: Functions Not Loading

**Problem:** Function dialog is empty or shows errors.

**Diagnosis:**
```typescript
// Test function API
this.criteriaApiService.getFunctions().subscribe({
  next: (functions) => console.log('Functions:', functions),
  error: (error) => console.error('Functions error:', error)
});

// Test specific function signature
this.criteriaApiService.getFunctionSignature('sma').subscribe({
  next: (signature) => console.log('SMA signature:', signature),
  error: (error) => console.error('Signature error:', error)
});
```

**Solutions:**

1. **Check Function API Response Format:**
```json
// GET /api/screeners/criteria/functions
[
  {
    "id": "sma",
    "label": "Simple Moving Average",
    "returnType": "number",
    "category": "Technical Analysis",
    "description": "Calculates moving average",
    "examples": ["SMA(close, 20)"],
    "paramCount": 2
  }
]

// GET /api/screeners/criteria/functions/sma/signature
{
  "id": "sma",
  "label": "Simple Moving Average",
  "description": "Calculates simple moving average",
  "returnType": "number",
  "parameters": [
    {
      "name": "field",
      "type": "number",
      "order": 1,
      "required": true,
      "helpText": "Field to average"
    },
    {
      "name": "periods",
      "type": "integer", 
      "order": 2,
      "required": true,
      "defaultValue": "20",
      "helpText": "Number of periods"
    }
  ]
}
```

### Issue: Validation Always Fails

**Problem:** All criteria show as invalid even when they appear correct.

**Diagnosis:**
```typescript
// Test validation API directly
const testDSL: CriteriaDSL = {
  root: {
    operator: 'AND',
    children: [{
      left: { fieldId: 'price' },
      op: '>',
      right: { type: 'number', value: 100 }
    }]
  }
};

this.criteriaApiService.validateCriteria(testDSL).subscribe({
  next: (result) => {
    console.log('Validation result:', result);
    console.log('Is valid:', result.isValid);
    console.log('Errors:', result.errors);
  },
  error: (error) => console.error('Validation API error:', error)
});
```

**Solutions:**

1. **Check Field ID Validation:**
```typescript
// Ensure field IDs in DSL match API field IDs exactly
const availableFields = await this.criteriaApiService.getFields().toPromise();
const fieldIds = availableFields.map(f => f.id);
console.log('Available field IDs:', fieldIds);

// Check if your DSL uses valid field IDs
```

2. **Check Function ID Validation:**
```typescript
// Ensure function IDs are valid
const availableFunctions = await this.criteriaApiService.getFunctions().toPromise();
const functionIds = availableFunctions.map(f => f.id);
console.log('Available function IDs:', functionIds);
```

3. **Check Validation API Response:**
```json
// POST /api/screeners/criteria/validate should return:
{
  "isValid": false,
  "errors": [
    {
      "id": "error_1",
      "type": "field_not_found",
      "message": "Field 'invalid_field' not found",
      "path": "$.root.children[0].left.fieldId",
      "severity": "error"
    }
  ],
  "warnings": []
}
```

## Form Integration Issues

### Issue: FormControl Not Working

**Problem:** Component doesn't integrate with Angular Reactive Forms.

**Diagnosis:**
```typescript
// Check FormControl setup
const criteriaControl = new FormControl<CriteriaDSL | null>(null);
console.log('Initial value:', criteriaControl.value);

criteriaControl.valueChanges.subscribe(value => {
  console.log('Form value changed:', value);
});
```

**Solutions:**

1. **Missing ReactiveFormsModule:**
```typescript
@NgModule({
  imports: [
    ReactiveFormsModule, // ✅ Required for FormControl
    CriteriaBuilderModule,
    // ...
  ]
})
```

2. **Incorrect Binding:**
```html
<!-- ❌ Wrong -->
<ac-criteria-builder [(ngModel)]="criteria"></ac-criteria-builder>

<!-- ✅ Correct -->
<ac-criteria-builder [formControl]="criteriaControl"></ac-criteria-builder>
```

3. **Type Issues:**
```typescript
// ✅ Correct typing
const criteriaControl = new FormControl<CriteriaDSL | null>(null);

// ❌ Wrong typing
const criteriaControl = new FormControl(null); // Too generic
```

### Issue: Validation Not Propagating

**Problem:** Form validation doesn't reflect component validity.

**Diagnosis:**
```typescript
// Check validation events
onValidityChange(isValid: boolean) {
  console.log('Component validity changed:', isValid);
  console.log('Form control valid:', this.criteriaControl.valid);
  console.log('Form control errors:', this.criteriaControl.errors);
}
```

**Solutions:**

1. **Custom Validator:**
```typescript
const criteriaControl = new FormControl(null, [
  Validators.required,
  this.criteriaValidator.bind(this)
]);

criteriaValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as CriteriaDSL;
  if (!value || !value.root.children.length) {
    return { emptyCriteria: true };
  }
  return null;
}
```

2. **Manual Validation Update:**
```typescript
onValidityChange(isValid: boolean) {
  if (isValid) {
    this.criteriaControl.setErrors(null);
  } else {
    this.criteriaControl.setErrors({ invalidCriteria: true });
  }
}
```

## Performance Issues

### Issue: Slow Rendering with Large Criteria

**Problem:** Component becomes slow or unresponsive with complex criteria.

**Diagnosis:**
```typescript
// Measure rendering performance
const startTime = performance.now();
this.criteriaControl.setValue(largeDSL);
setTimeout(() => {
  const endTime = performance.now();
  console.log('Rendering took:', endTime - startTime, 'ms');
}, 0);
```

**Solutions:**

1. **Increase Debounce Time:**
```typescript
const config: BuilderConfig = {
  debounceMs: 500, // Increase from default 200ms
};
```

2. **Enable Compact Mode:**
```typescript
const config: BuilderConfig = {
  compactMode: true, // Reduces visual complexity
};
```

3. **Limit Nesting Depth:**
```typescript
const config: BuilderConfig = {
  maxDepth: 3, // Reduce from default 5
  maxConditions: 50, // Limit total conditions
};
```

### Issue: Memory Leaks

**Problem:** Memory usage increases over time.

**Diagnosis:**
```typescript
// Check for subscription leaks
export class MyComponent implements OnDestroy {
  private subscriptions = new Subscription();
  
  ngOnInit() {
    this.subscriptions.add(
      this.criteriaControl.valueChanges.subscribe(/*...*/)
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe(); // ✅ Clean up
  }
}
```

**Solutions:**

1. **Proper Cleanup:**
```typescript
// Use takeUntil pattern
private destroy$ = new Subject<void>();

ngOnInit() {
  this.criteriaControl.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(/*...*/);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

2. **OnPush Change Detection:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class MyComponent {
  // Component will only check for changes when inputs change
}
```

## Accessibility Issues

### Issue: Screen Reader Not Working

**Problem:** Screen readers don't announce token changes or interactions.

**Diagnosis:**
```typescript
// Check if accessibility mode is enabled
const config: BuilderConfig = {
  enableScreenReaderMode: true, // ✅ Should be enabled
};

// Check for ARIA labels in DOM
const tokens = document.querySelectorAll('.token-container');
tokens.forEach(token => {
  console.log('Token ARIA label:', token.getAttribute('aria-label'));
});
```

**Solutions:**

1. **Enable Accessibility Features:**
```typescript
const accessibleConfig: BuilderConfig = {
  enableScreenReaderMode: true,
  enableKeyboardShortcuts: true,
  enableHighContrastMode: false, // Auto-detected
  enableColorBlindMode: true,
};
```

2. **Check ARIA Labels:**
```html
<!-- Tokens should have proper ARIA labels -->
<div class="token-container" 
     role="button" 
     tabindex="0"
     aria-label="Field: Price. Position 1 of 3. Press Enter to edit.">
</div>
```

### Issue: Keyboard Navigation Not Working

**Problem:** Cannot navigate using keyboard only.

**Diagnosis:**
```typescript
// Test keyboard events
document.addEventListener('keydown', (event) => {
  console.log('Key pressed:', event.key, 'Target:', event.target);
});
```

**Solutions:**

1. **Check Tab Order:**
```scss
.token-container {
  &:focus {
    outline: 2px solid #007bff; // Visible focus indicator
    outline-offset: 2px;
  }
}
```

2. **Enable Keyboard Shortcuts:**
```typescript
const config: BuilderConfig = {
  enableKeyboardShortcuts: true,
};

// Test shortcuts
// Ctrl+Enter: Add condition
// Delete: Delete token
// F2/Enter: Edit token
```

## Import/Export Issues

### Issue: Import Fails with Valid JSON

**Problem:** Import shows errors even with seemingly valid JSON.

**Diagnosis:**
```typescript
// Test import step by step
const jsonString = '{"root":{"operator":"AND","children":[]}}';

console.log('JSON string:', jsonString);

try {
  const parsed = JSON.parse(jsonString);
  console.log('Parsed JSON:', parsed);
  
  const importResult = this.importExportService.importFromJson(jsonString, {
    validateContent: true,
    allowInvalid: false
  });
  
  console.log('Import result:', importResult);
} catch (error) {
  console.error('Import error:', error);
}
```

**Solutions:**

1. **Check JSON Structure:**
```typescript
// Valid CriteriaDSL structure
const validDSL: CriteriaDSL = {
  root: {
    operator: 'AND',
    children: [
      {
        left: { fieldId: 'price' },
        op: '>',
        right: { type: 'number', value: 100 }
      }
    ]
  }
};
```

2. **Disable Content Validation:**
```typescript
// For testing, disable strict validation
const importResult = this.importExportService.importFromJson(jsonString, {
  validateContent: false, // Disable security validation
  allowInvalid: true      // Allow invalid DSL
});
```

3. **Check File Size:**
```typescript
// Ensure file is not too large
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  console.error('File too large:', file.size);
}
```

### Issue: Export Creates Invalid JSON

**Problem:** Exported JSON cannot be re-imported.

**Diagnosis:**
```typescript
// Test export/import cycle
const originalDSL = this.criteriaControl.value;
console.log('Original DSL:', originalDSL);

const exportResult = this.importExportService.exportToJson(originalDSL);
console.log('Export result:', exportResult);

if (exportResult.success) {
  const importResult = this.importExportService.importFromJson(exportResult.data);
  console.log('Re-import result:', importResult);
}
```

**Solutions:**

1. **Check Export Options:**
```typescript
const exportResult = this.importExportService.exportToJson(dsl, {
  minify: false,           // Don't minify for debugging
  includeValidation: true, // Include validation info
  allowInvalid: false      // Only export valid DSL
});
```

2. **Validate Before Export:**
```typescript
const validation = await this.criteriaApiService.validateCriteria(dsl).toPromise();
if (!validation.isValid) {
  console.error('Cannot export invalid DSL:', validation.errors);
  return;
}
```

## Browser Compatibility Issues

### Issue: Component Not Working in Internet Explorer

**Problem:** Component doesn't load or function in older browsers.

**Solution:**
The library requires modern browser features and does not support Internet Explorer. Minimum supported browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Issue: Mobile Touch Issues

**Problem:** Touch interactions don't work properly on mobile devices.

**Solutions:**

1. **Mobile-Friendly Configuration:**
```typescript
const mobileConfig: BuilderConfig = {
  compactMode: true,
  debounceMs: 500,           // Longer debounce for touch
  enableKeyboardShortcuts: false, // Not needed on mobile
  showTooltips: false        // Tooltips can interfere with touch
};
```

2. **Touch Event Handling:**
```scss
.token-container {
  touch-action: manipulation; // Improve touch responsiveness
  -webkit-tap-highlight-color: transparent; // Remove tap highlight
}
```

## Debug Tools

### Enable Comprehensive Logging

```typescript
// Enable all debug logging
localStorage.setItem('criteria-builder-debug', 'true');
localStorage.setItem('criteria-builder-debug-api', 'true');
localStorage.setItem('criteria-builder-debug-validation', 'true');
localStorage.setItem('criteria-builder-debug-accessibility', 'true');

// This will log:
// - All API requests and responses
// - Validation results
// - DSL structure changes
// - Token interactions
// - Accessibility events
```

### Debug Component State

```typescript
// Add to your component for debugging
export class DebugComponent {
  @ViewChild(AcCriteriaBuilderComponent) criteriaBuilder: AcCriteriaBuilderComponent;
  
  debugComponentState() {
    console.log('Current DSL:', this.criteriaControl.value);
    console.log('Form valid:', this.criteriaControl.valid);
    console.log('Form errors:', this.criteriaControl.errors);
    console.log('Component config:', this.config);
  }
  
  debugApiState() {
    this.criteriaApiService.getFields().subscribe(fields => {
      console.log('Available fields:', fields);
    });
    
    this.criteriaApiService.getFunctions().subscribe(functions => {
      console.log('Available functions:', functions);
    });
  }
}
```

### Network Debugging

```typescript
// HTTP Interceptor for debugging
@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/api/screeners/criteria/')) {
      console.log('Criteria API Request:', req.method, req.url, req.body);
    }
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && req.url.includes('/api/screeners/criteria/')) {
          console.log('Criteria API Response:', event.status, event.body);
        }
      }),
      catchError(error => {
        if (req.url.includes('/api/screeners/criteria/')) {
          console.error('Criteria API Error:', error);
        }
        throw error;
      })
    );
  }
}
```

## Getting Help

### Before Asking for Help

1. **Enable debug mode** and check console logs
2. **Test with minimal configuration** to isolate the issue
3. **Verify API endpoints** are working correctly
4. **Check network requests** in browser dev tools
5. **Test in different browsers** to rule out browser-specific issues

### Information to Include

When reporting issues, please provide:

- **Angular version:** `ng version`
- **Library version:** Check package.json
- **Browser and version:** Chrome 120, Firefox 115, etc.
- **Operating system:** Windows 11, macOS 14, etc.
- **Console errors:** Copy full error messages
- **Network errors:** Check Network tab in dev tools
- **Minimal reproduction:** Simplest code that shows the issue
- **Expected vs actual behavior:** What should happen vs what happens

### Debug Information Script

```typescript
// Run this in browser console for debug info
function getCriteriaBuilderDebugInfo() {
  const info = {
    userAgent: navigator.userAgent,
    angularVersion: (window as any).ng?.version?.full,
    criteriaBuilderElements: document.querySelectorAll('ac-criteria-builder').length,
    localStorage: {
      debug: localStorage.getItem('criteria-builder-debug'),
      debugApi: localStorage.getItem('criteria-builder-debug-api')
    },
    errors: []
  };
  
  // Check for common issues
  if (!document.querySelector('ac-criteria-builder')) {
    info.errors.push('No criteria builder components found');
  }
  
  if (!window.getComputedStyle(document.body).getPropertyValue('--primary-color')) {
    info.errors.push('PrimeNG styles may not be loaded');
  }
  
  console.log('Criteria Builder Debug Info:', info);
  return info;
}

getCriteriaBuilderDebugInfo();
```

### Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| Component not showing | Check module import and styles |
| API not working | Verify endpoints and CORS |
| Form not working | Add ReactiveFormsModule |
| Performance slow | Increase debounceMs, enable compactMode |
| Accessibility issues | Enable accessibility config options |
| Import/export fails | Check JSON structure and file size |
| Mobile issues | Use mobile-friendly config |

### Support Channels

1. **GitHub Issues:** For bugs and feature requests
2. **Documentation:** Check README.md and API.md
3. **Stack Overflow:** Tag questions with `criteria-builder-ui`
4. **Community Discord:** Real-time help and discussions

Remember to search existing issues and documentation before creating new support requests.