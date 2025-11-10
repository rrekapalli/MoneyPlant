# Criteria Builder Troubleshooting Guide

## Quick Diagnostics

### 1. Check if Query Builder is Rendering
Open browser DevTools (F12) and run:
```javascript
document.querySelector('lib-query-builder')
```
- If `null`: Query builder component is not rendering
- If element exists: Query builder is rendering

### 2. Check if Buttons Exist in DOM
```javascript
document.querySelectorAll('.query-button-group .p-button')
```
- If empty array: Buttons are not being created
- If has elements: Buttons exist but may have visibility issues

### 3. Check Button Visibility
```javascript
const buttons = document.querySelectorAll('.query-button-group .p-button');
buttons.forEach(btn => {
  console.log('Button:', btn.textContent, 
    'Display:', getComputedStyle(btn).display,
    'Visibility:', getComputedStyle(btn).visibility,
    'Opacity:', getComputedStyle(btn).opacity);
});
```

## Common Issues and Fixes

### Issue 1: Query Builder Not Rendering

**Symptoms:**
- Empty space where criteria builder should be
- No AND/OR dropdown visible

**Possible Causes:**
1. Query builder library not built
2. Import path incorrect
3. Component not properly initialized

**Solutions:**
```bash
# Rebuild the query builder library
cd frontend
npm run build:querybuilder

# Verify the build output
ls -la dist/querybuilder

# Restart the dev server
npm start
```

**Verify in Component:**
```typescript
// In screeners-configure.component.ts
ngOnInit(): void {
  console.log('Query config:', this.queryConfig);
  console.log('Current query:', this.currentQuery);
  this.initializeForm();
}
```

### Issue 2: Buttons Not Visible

**Symptoms:**
- AND/OR dropdown is visible
- No "+ Rule" or "+ Group" buttons

**Possible Causes:**
1. CSS display: none or visibility: hidden
2. Z-index issues
3. Overlapping elements
4. CSS not loaded

**Solutions:**

**Check CSS Loading:**
```javascript
// In browser console
const styles = Array.from(document.styleSheets);
const qbStyles = styles.filter(s => 
  s.href && s.href.includes('querybuilder')
);
console.log('Query builder styles loaded:', qbStyles.length > 0);
```

**Force Button Visibility (Temporary Debug):**
```javascript
// In browser console
document.querySelectorAll('.query-button-group').forEach(group => {
  group.style.display = 'inline-flex';
  group.style.visibility = 'visible';
  group.style.opacity = '1';
});

document.querySelectorAll('.query-button-group .p-button').forEach(btn => {
  btn.style.display = 'inline-flex';
  btn.style.visibility = 'visible';
  btn.style.opacity = '1';
  btn.style.backgroundColor = '#22c55e';
  btn.style.color = 'white';
  btn.style.padding = '6px 12px';
  btn.style.height = '32px';
});
```

### Issue 3: Buttons Not Clickable

**Symptoms:**
- Buttons are visible
- Clicking does nothing

**Possible Causes:**
1. Event handlers not bound
2. Disabled state
3. Pointer-events: none
4. Overlapping transparent element

**Solutions:**

**Check Event Bindings:**
```typescript
// In query-button-group.component.ts
onAddRule(): void {
  console.log('Add rule clicked!');
  if (!this.disabled) {
    this.addRule.emit();
  }
}
```

**Check Disabled State:**
```javascript
// In browser console
document.querySelectorAll('.query-button-group .p-button').forEach(btn => {
  console.log('Button:', btn.textContent, 
    'Disabled:', btn.disabled,
    'Pointer events:', getComputedStyle(btn).pointerEvents);
});
```

**Force Enable (Temporary Debug):**
```javascript
document.querySelectorAll('.query-button-group .p-button').forEach(btn => {
  btn.disabled = false;
  btn.style.pointerEvents = 'auto';
  btn.style.cursor = 'pointer';
});
```

### Issue 4: PrimeNG Components Not Rendering

**Symptoms:**
- Buttons appear as plain text
- No PrimeNG styling

**Possible Causes:**
1. PrimeNG not installed
2. PrimeNG theme not loaded
3. Module not imported

**Solutions:**

**Verify PrimeNG Installation:**
```bash
npm list primeng
```

**Check Theme Loading:**
```javascript
// In browser console
const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
const primeTheme = links.find(l => l.href.includes('primeng'));
console.log('PrimeNG theme loaded:', !!primeTheme);
```

**Verify Module Imports:**
```typescript
// In query-button-group.component.ts
import { ButtonModule } from 'primeng/button';

@Component({
  // ...
  imports: [CommonModule, ButtonModule],
  // ...
})
```

### Issue 5: Query Not Saving

**Symptoms:**
- Can add rules
- Save button doesn't work or shows errors

**Possible Causes:**
1. Validation failing
2. Conversion error
3. API error

**Solutions:**

**Check Validation:**
```typescript
// In screeners-configure.component.ts
onSaveScreener(): void {
  console.log('Saving screener...');
  console.log('Query valid:', this.isQueryValid());
  console.log('Current query:', this.currentQuery);
  console.log('Validation errors:', this.queryValidationErrors);
  
  if (!this.isQueryValid()) {
    console.error('Query validation failed');
    return;
  }
  
  // ... rest of save logic
}
```

**Check Conversion:**
```typescript
// In screeners-configure.component.ts
private convertQueryToScreenerCriteria(query: RuleSet): ScreenerCriteria | undefined {
  console.log('Converting query:', query);
  const result = this.queryConverter.convertQueryToScreenerCriteria(query);
  console.log('Conversion result:', result);
  
  if (!result.success) {
    console.error('Conversion failed:', result.errors);
  }
  
  return result.data;
}
```

## Browser-Specific Issues

### Chrome/Edge
- Usually works best
- Check for extension conflicts (disable ad blockers)

### Firefox
- May have CSS grid issues
- Check for strict tracking protection

### Safari
- May have flexbox issues
- Check for webkit-specific CSS

## Performance Issues

### Slow Rendering
```javascript
// Check component count
console.log('Query entities:', 
  document.querySelectorAll('.query-entity').length);

// Check rule count
console.log('Rules:', 
  document.querySelectorAll('.query-rule').length);
```

**Solution:** Limit nesting depth to 3-4 levels

### Memory Leaks
```typescript
// Ensure proper cleanup in components
ngOnDestroy(): void {
  // Unsubscribe from observables
  // Clear event listeners
}
```

## Development Tools

### Angular DevTools
1. Install Angular DevTools extension
2. Open DevTools
3. Go to Angular tab
4. Inspect QueryBuilderComponent
5. Check inputs and outputs

### PrimeNG Inspector
```javascript
// Check PrimeNG version
console.log('PrimeNG version:', 
  document.querySelector('[ng-version]')?.getAttribute('ng-version'));
```

## Getting Help

### Information to Provide
1. Browser and version
2. Angular version: `ng version`
3. PrimeNG version: `npm list primeng`
4. Console errors (screenshot)
5. Network tab errors (screenshot)
6. Component HTML (from DevTools)

### Debug Mode
Enable Angular debug mode:
```typescript
// In main.ts
import { enableDebugTools } from '@angular/platform-browser';

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(moduleRef => {
    const applicationRef = moduleRef.injector.get(ApplicationRef);
    const componentRef = applicationRef.components[0];
    enableDebugTools(componentRef);
  });
```

## Quick Fixes

### Nuclear Option (Clear Everything)
```bash
# Stop dev server
# Clear node modules and caches
rm -rf node_modules
rm -rf dist
rm -rf .angular
npm cache clean --force

# Reinstall
npm install

# Rebuild query builder
npm run build:querybuilder

# Start dev server
npm start
```

### Force Rebuild
```bash
# Rebuild query builder with clean
rm -rf dist/querybuilder
npm run build:querybuilder

# Rebuild app
npm run build
```

## Success Indicators

✅ Query builder renders with AND/OR dropdown
✅ Green "+ Rule" button is visible and clickable
✅ Blue "+ Group" button is visible and clickable
✅ Can add rules with field, operator, and value selectors
✅ Can remove rules with red X button
✅ Can nest groups
✅ Can save screener with criteria
✅ Criteria persists after page reload
✅ No console errors
✅ Responsive layout works on mobile

## Still Not Working?

If none of these solutions work:
1. Check the GitHub issues for similar problems
2. Review the Angular Query Builder documentation
3. Check PrimeNG documentation for component changes
4. Create a minimal reproduction case
5. File an issue with detailed information
