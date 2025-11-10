# Query Builder Visibility Fix - Summary

## Problem
After the theme integration fix, the query builder became completely invisible except for a small "A..." dropdown.

## Root Cause
The autofix/formatter may have removed or modified critical display properties, causing all query builder components to be hidden.

## Solution Applied

### Added Explicit Visibility Rules

Added `!important` flags to ensure visibility across all query builder components:

#### 1. Query Builder Wrapper
**File**: `frontend/src/app/features/screeners/configure/screeners-configure.component.scss`

```scss
.query-builder-wrapper {
  display: block !important;
  visibility: visible !important;
  
  ::ng-deep lib-query-builder {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    
    .query-builder {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  }
}
```

#### 2. Query Entity Component
**File**: `frontend/projects/querybuilder/src/lib/components/query-entity/query-entity.component.scss`

```scss
.query-entity {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  
  &.query-entity-ruleset {
    display: block !important;
  }
}

.query-ruleset {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  
  .query-ruleset-header {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
}
```

#### 3. Button Group Component
**File**: `frontend/projects/querybuilder/src/lib/components/query-button-group/query-button-group.component.scss`

```scss
.query-button-group {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  
  ::ng-deep {
    .p-button {
      display: inline-flex !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  }
}
```

#### 4. Additional Components in Wrapper
**File**: `frontend/src/app/features/screeners/configure/screeners-configure.component.scss`

```scss
.query-entity {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.query-button-group {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.query-switch-group {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.query-ruleset-header {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  
  .query-ruleset-controls {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
}

.query-ruleset {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
```

## Files Modified

1. `frontend/src/app/features/screeners/configure/screeners-configure.component.scss`
   - Added explicit visibility rules for all query builder components
   - Used `!important` to override any conflicting styles

2. `frontend/projects/querybuilder/src/lib/components/query-entity/query-entity.component.scss`
   - Added display and visibility rules to query entity
   - Ensured ruleset and header are visible

3. `frontend/projects/querybuilder/src/lib/components/query-button-group/query-button-group.component.scss`
   - Added explicit visibility for button group
   - Ensured buttons are displayed

## Build Status

✅ Query builder library built successfully
✅ No TypeScript errors
✅ No SCSS errors
✅ All diagnostics clean

## Testing Steps

### 1. Rebuild Everything
```bash
cd frontend
npm run build:querybuilder
npm start
```

### 2. Hard Refresh Browser
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Safari: Cmd+Option+R (Mac)

### 3. Navigate and Test
1. Go to http://localhost:8080/screeners
2. Select or create a screener
3. Click "Configure" tab
4. You should now see:
   - White/light gray query builder box
   - "AND" dropdown
   - Green "+ Rule" button
   - Blue "+ Group" button

### 4. Verify Functionality
- Click "+ Rule" - should add a rule
- Select field, operator, value
- Click "+ Group" - should add a nested group
- Click X - should remove rules
- Save - should work without errors

## Why !important Was Necessary

The `!important` flag was added because:

1. **CSS Specificity**: Multiple style sources (component styles, wrapper styles, theme styles) were competing
2. **Autofix Changes**: The autofix may have introduced conflicting styles
3. **Deep Nesting**: `::ng-deep` and nested selectors created specificity issues
4. **Theme Variables**: Some theme variables might not be resolving correctly

Using `!important` ensures these critical display properties cannot be overridden.

## Alternative Solutions (If Still Not Working)

### Option 1: Clear All Caches
```bash
cd frontend
rm -rf node_modules/.cache
rm -rf .angular
rm -rf dist
npm install
npm run build:querybuilder
npm start
```

### Option 2: Check Browser Cache
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Hard refresh (Ctrl+Shift+R)

### Option 3: Check for CSS Conflicts
In browser console:
```javascript
const qb = document.querySelector('lib-query-builder');
console.log('Styles:', getComputedStyle(qb));
```

Look for any `display: none` or `visibility: hidden` values.

## Prevention

To prevent this issue in the future:

1. **Don't use autofix on SCSS files** with complex nested selectors
2. **Test after any formatting** changes
3. **Keep explicit display rules** for critical components
4. **Use version control** to track changes

## Rollback

If issues persist, revert to the previous working state:
```bash
git log --oneline | head -5
git revert <commit-hash>
```

Or restore specific files:
```bash
git checkout HEAD~1 -- frontend/projects/querybuilder/src/lib/components/
git checkout HEAD~1 -- frontend/src/app/features/screeners/configure/
```

## Success Indicators

✅ Query builder wrapper is visible (white/gray box)
✅ AND/OR dropdown is visible and functional
✅ Green "+ Rule" button is visible
✅ Blue "+ Group" button is visible
✅ Can add rules and groups
✅ Can remove rules with X button
✅ Can save screener
✅ No console errors

## Next Steps

1. Test the query builder thoroughly
2. Add multiple rules
3. Test nested groups
4. Verify save functionality
5. Check that criteria persists

## Support

If still not working:
1. Check `QUERY_BUILDER_VISIBILITY_DEBUG.md` for debugging steps
2. Run the debug commands in browser console
3. Check for any console errors
4. Verify all files were updated correctly

---

**Status**: ✅ Visibility fix applied
**Build**: ✅ Successful
**Files Modified**: 3
**Approach**: Explicit visibility rules with !important flags
