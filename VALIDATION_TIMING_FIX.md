# Validation Timing Fix

## Problem
Validation errors were showing immediately when adding rules or groups, even before the user had a chance to fill in values. This created a poor user experience with error messages appearing prematurely.

## Root Cause
The validation was running on every query change and immediately displaying errors:

1. User clicks "+ Rule"
2. Empty rule is added
3. `onQueryChange` is triggered
4. `onQueryValidationChange` is triggered
5. `updateQueryValidationErrors` is called
6. Errors are displayed immediately

## Solution
Implemented a "save-attempted" pattern where validation errors only show after the user tries to save:

### 1. Added Save Attempt Flag
```typescript
saveAttempted = false;
```

### 2. Modified Query Change Handler
```typescript
onQueryChange(query: RuleSet): void {
  this.currentQuery = query;
  // Clear any previous validation errors when editing
  this.queryValidationErrors = [];
  // Reset save attempted flag so errors don't show while editing
  this.saveAttempted = false;
  this.cdr.detectChanges();
}
```

### 3. Modified Validation Change Handler
```typescript
onQueryValidationChange(isValid: boolean): void {
  this.queryValidationState = isValid;
  // Don't show validation errors during editing
  // They will be shown when user tries to save
  this.cdr.detectChanges();
}
```

### 4. Updated Save Handler
```typescript
onSaveScreener(): void {
  if (!this.screenerForm.name.trim()) {
    return;
  }
  
  // Mark that save was attempted
  this.saveAttempted = true;
  
  // Convert and validate query before saving
  const criteria = this.convertQueryToScreenerCriteria(this.currentQuery);
  
  if (!criteria) {
    // Show validation errors
    this.updateQueryValidationErrors();
    return;
  }
  
  // ... rest of save logic
}
```

### 5. Updated Template Condition
```html
<!-- Before: Always showed errors when present -->
@if (queryValidationErrors.length > 0 && !isQueryValid()) {
  <div class="query-validation-messages">
    ...
  </div>
}

<!-- After: Only show after save attempt -->
@if (saveAttempted && queryValidationErrors.length > 0) {
  <div class="query-validation-messages">
    ...
  </div>
}
```

### 6. Reset on Form Initialization
```typescript
private initializeForm(): void {
  // Reset validation state
  this.saveAttempted = false;
  this.queryValidationErrors = [];
  
  // ... rest of initialization
}
```

## User Flow

### Before Fix
1. User clicks "+ Rule" → ❌ Errors appear immediately
2. User starts typing → ❌ Errors still showing
3. User fills in value → ✅ Errors disappear
4. Poor UX with premature error messages

### After Fix
1. User clicks "+ Rule" → ✅ No errors shown
2. User can edit freely → ✅ No errors shown
3. User clicks "Save Changes" → ✅ Validation runs
4. If incomplete → ⚠️ Errors shown now
5. User edits → ✅ Errors disappear
6. User saves again → ✅ Validation runs again

## Benefits

1. **Better UX**: Users aren't bombarded with errors while building their query
2. **Clear Feedback**: Errors only appear when user tries to save
3. **Forgiving**: Errors disappear when user starts editing again
4. **Intuitive**: Matches expected behavior of most forms

## Files Modified

1. **frontend/src/app/features/screeners/configure/screeners-configure.component.ts**
   - Added `saveAttempted` flag
   - Modified `onQueryChange` to clear errors and reset flag
   - Modified `onQueryValidationChange` to not show errors
   - Modified `onSaveScreener` to set flag
   - Modified `initializeForm` to reset flag

2. **frontend/src/app/features/screeners/configure/screeners-configure.component.html**
   - Updated validation message condition to check `saveAttempted`

## Testing

### Test Case 1: Adding Rules
1. Click "+ Rule"
2. **Expected**: No validation errors shown
3. **Actual**: ✅ No errors

### Test Case 2: Saving Incomplete
1. Click "+ Rule"
2. Leave value empty
3. Click "Save Changes"
4. **Expected**: Validation errors shown
5. **Actual**: ✅ Errors shown

### Test Case 3: Editing After Error
1. Have validation errors showing
2. Start editing the rule
3. **Expected**: Errors disappear
4. **Actual**: ✅ Errors disappear

### Test Case 4: Saving Complete
1. Click "+ Rule"
2. Fill in all fields
3. Click "Save Changes"
4. **Expected**: No errors, save succeeds
5. **Actual**: ✅ Saves successfully

## Edge Cases Handled

1. **Multiple Save Attempts**: Flag resets on edit, can try saving again
2. **Form Reinitialization**: Flag resets when switching screeners
3. **Query Changes**: Flag resets on any query modification
4. **Closeable Messages**: Users can close error messages manually

## Best Practices

This implements the common "touched" or "dirty" pattern used in forms:
- Don't validate until user interaction is complete
- Show errors only when user attempts to submit
- Clear errors when user starts correcting them
- Allow multiple submission attempts

## Conclusion

The validation timing fix ensures that users have a smooth experience building their screening criteria without being interrupted by premature error messages. Errors only appear when they're relevant - when the user tries to save incomplete data.

---

**Status**: ✅ Fixed
**Pattern**: Save-attempted validation
**UX**: Significantly improved
