# Query Builder Visibility Debug Guide

## Current Issue
The query builder is rendering but nothing is visible except a small "A..." dropdown.

## Quick Debug Steps

### 1. Open Browser DevTools
Press F12 or right-click and select "Inspect"

### 2. Check if Query Builder Exists
In the Console tab, run:
```javascript
document.querySelector('lib-query-builder')
```
**Expected**: Should return an element, not null

### 3. Check Query Builder Content
```javascript
const qb = document.querySelector('lib-query-builder');
console.log('Query Builder HTML:', qb?.innerHTML);
console.log('Query Builder Display:', getComputedStyle(qb).display);
console.log('Query Builder Visibility:', getComputedStyle(qb).visibility);
console.log('Query Builder Opacity:', getComputedStyle(qb).opacity);
```

### 4. Check for Query Entity
```javascript
document.querySelectorAll('.query-entity').forEach((el, i) => {
  console.log(`Entity ${i}:`, {
    display: getComputedStyle(el).display,
    visibility: getComputedStyle(el).visibility,
    opacity: getComputedStyle(el).opacity,
    height: getComputedStyle(el).height,
    width: getComputedStyle(el).width
  });
});
```

### 5. Check for Buttons
```javascript
document.querySelectorAll('.query-button-group').forEach((group, i) => {
  console.log(`Button Group ${i}:`, {
    display: getComputedStyle(group).display,
    visibility: getComputedStyle(group).visibility,
    opacity: getComputedStyle(group).opacity,
    buttons: group.querySelectorAll('.p-button').length
  });
});

document.querySelectorAll('.query-button-group .p-button').forEach((btn, i) => {
  console.log(`Button ${i}:`, {
    text: btn.textContent,
    display: getComputedStyle(btn).display,
    visibility: getComputedStyle(btn).visibility,
    opacity: getComputedStyle(btn).opacity,
    width: getComputedStyle(btn).width,
    height: getComputedStyle(btn).height
  });
});
```

### 6. Check Current Query State
In the Console, run:
```javascript
// Get Angular component instance
const component = ng.getComponent(document.querySelector('app-screeners-configure'));
console.log('Current Query:', component.currentQuery);
console.log('Query Config:', component.queryConfig);
```

### 7. Force Visibility (Temporary Fix)
If elements exist but are hidden, try:
```javascript
// Force show everything
document.querySelectorAll('lib-query-builder, lib-query-builder *, .query-builder, .query-builder *, .query-entity, .query-button-group, .query-button-group *').forEach(el => {
  el.style.display = el.style.display === 'none' ? 'block' : el.style.display || '';
  el.style.visibility = 'visible';
  el.style.opacity = '1';
  el.style.height = el.style.height === '0px' ? 'auto' : el.style.height || '';
  el.style.width = el.style.width === '0px' ? 'auto' : el.style.width || '';
});
```

## Common Causes

### 1. CSS Not Loaded
**Check**:
```javascript
Array.from(document.styleSheets).filter(s => 
  s.href && (s.href.includes('screeners-configure') || s.href.includes('querybuilder'))
).forEach(s => console.log('Loaded:', s.href));
```

### 2. Component Not Initialized
**Check**:
```javascript
const component = ng.getComponent(document.querySelector('app-screeners-configure'));
console.log('Component initialized:', !!component);
console.log('Query config:', component?.queryConfig);
console.log('Current query:', component?.currentQuery);
```

### 3. Empty Query
**Check**:
```javascript
const component = ng.getComponent(document.querySelector('app-screeners-configure'));
console.log('Query rules:', component?.currentQuery?.rules);
console.log('Rules length:', component?.currentQuery?.rules?.length);
```

### 4. Display: None Somewhere
**Check**:
```javascript
// Find all hidden elements
document.querySelectorAll('lib-query-builder *').forEach(el => {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    console.log('Hidden element:', el.className, {
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity
    });
  }
});
```

## Manual Fix Steps

### Step 1: Clear Everything
```bash
cd frontend
rm -rf node_modules/.cache
rm -rf .angular
rm -rf dist
```

### Step 2: Rebuild Query Builder
```bash
npm run build:querybuilder
```

### Step 3: Restart Dev Server
```bash
npm start
```

### Step 4: Hard Refresh Browser
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

## Expected State

When working correctly, you should see:
1. A white/light gray box (query builder wrapper)
2. Inside: A header with "AND" dropdown
3. Next to dropdown: Green "+ Rule" button
4. Next to that: Blue "+ Group" button

## If Still Not Working

### Check Component TypeScript
Verify the component is initializing the query:
```typescript
// In screeners-configure.component.ts
ngOnInit(): void {
  console.log('Component initialized');
  console.log('Query config:', this.queryConfig);
  console.log('Current query:', this.currentQuery);
  this.initializeForm();
}
```

### Check Query Builder Component
```typescript
// In query-builder.component.ts
ngOnInit(): void {
  console.log('Query Builder initialized');
  console.log('Config:', this.config);
  console.log('Query:', this.query);
  if (!this.query) {
    this.query = { condition: 'and', rules: [] };
  }
  this.validateQuery();
}
```

### Add Debug Logging
In `screeners-configure.component.ts`:
```typescript
private initializeForm(): void {
  console.log('=== INIT FORM ===');
  console.log('Selected screener:', this.selectedScreener);
  
  if (this.selectedScreener) {
    this.screenerForm = {
      name: this.selectedScreener.name,
      description: this.selectedScreener.description || '',
      isPublic: this.selectedScreener.isPublic,
      defaultUniverse: this.selectedScreener.defaultUniverse || '',
      criteria: this.selectedScreener.criteria
    };
    
    this.currentQuery = this.convertScreenerCriteriaToQuery(this.selectedScreener.criteria);
    console.log('Converted query:', this.currentQuery);
  } else {
    this.screenerForm = {
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: '',
      criteria: undefined
    };
    
    this.currentQuery = { condition: 'and', rules: [] };
    console.log('Empty query:', this.currentQuery);
  }
  
  console.log('=== INIT COMPLETE ===');
}
```

## Contact Support

If none of these steps work, provide:
1. Browser console output from debug steps above
2. Screenshot of the Elements tab showing the query builder HTML
3. Screenshot of the Computed styles for `.query-builder`
4. Any console errors or warnings
