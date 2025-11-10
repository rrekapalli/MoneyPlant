# Double Add Fix - Query Builder

## Problem
Clicking "+ Rule" or "+ Group" buttons was adding two items instead of one.

## Root Cause
The `QueryBuilderService.addRule()` and `addRuleSet()` methods were mutating the ruleset directly by pushing to the rules array:

```typescript
addRule(ruleset: RuleSet, field?: Field): Rule {
  const newRule: Rule = { ... };
  ruleset.rules.push(newRule);  // <-- Direct mutation
  return newRule;
}
```

Then in the `QueryEntityComponent`, we were also adding the rule to a new array:

```typescript
onAddRule(): void {
  const newRule = this.queryBuilderService.addRule(this.data, ...);
  const updatedRuleSet = {
    ...this.data,
    rules: [...this.data.rules, newRule]  // <-- Adding again!
  };
}
```

This caused the rule to be added twice:
1. Once by the service (direct mutation)
2. Once by the component (spreading the array)

## Solution
Modified the component to create a copy of the ruleset before passing it to the service, so the service's mutation only affects the copy:

### Before
```typescript
onAddRule(): void {
  if (this.isRuleSet(this.data)) {
    const newRule = this.queryBuilderService.addRule(this.data, this.config.fields?.[0]);
    const updatedRuleSet = {
      ...this.data,
      rules: [...this.data.rules, newRule]  // Double add!
    };
    this.data = updatedRuleSet;
    this.dataChange.emit(this.data);
  }
}
```

### After
```typescript
onAddRule(): void {
  if (this.isRuleSet(this.data)) {
    // Create a copy of the ruleset to avoid mutation
    const rulesetCopy = { ...this.data, rules: [...this.data.rules] };
    // Add rule to the copy (service mutates the copy)
    this.queryBuilderService.addRule(rulesetCopy, this.config.fields?.[0]);
    // Emit the updated copy
    this.data = rulesetCopy;
    this.dataChange.emit(this.data);
    this.updateMeta();
  }
}
```

Same fix applied to `onAddRuleSet()`.

## Files Modified

**File**: `frontend/projects/querybuilder/src/lib/components/query-entity/query-entity.component.ts`

**Changes**:
1. `onAddRule()` - Create copy before calling service
2. `onAddRuleSet()` - Create copy before calling service

## Why This Works

1. **Copy First**: We create a shallow copy of the ruleset with a new rules array
2. **Service Mutates Copy**: The service pushes to the copy's rules array
3. **No Double Add**: We don't add the rule again, just use the mutated copy
4. **Emit Once**: The component emits the updated copy once

## Alternative Solution (Not Used)

We could have modified the service to not mutate the ruleset:

```typescript
addRule(ruleset: RuleSet, field?: Field): Rule {
  const newRule: Rule = { ... };
  // Don't push, just return the rule
  return newRule;
}
```

But this would break the service's API contract and require changes in multiple places.

## Testing

### Before Fix
1. Click "+ Rule" → 2 rules added
2. Click "+ Group" → 2 groups added

### After Fix
1. Click "+ Rule" → 1 rule added ✅
2. Click "+ Group" → 1 group added ✅

## Build Status

✅ Query builder library rebuilt successfully
✅ No TypeScript errors
✅ All diagnostics clean

## Verification Steps

```bash
cd frontend
npm run build:querybuilder
npm start
```

Then:
1. Navigate to screeners
2. Select a screener
3. Go to Configure tab
4. Click "+ Rule" - should add exactly one rule
5. Click "+ Group" - should add exactly one group
6. Remove rules - should remove one at a time

## Related Issues

This is a common pattern issue in Angular/React where:
- Service methods mutate objects
- Components also try to update the same objects
- Results in duplicate operations

## Best Practices

1. **Immutability**: Always work with copies when dealing with nested objects
2. **Single Responsibility**: Either the service mutates OR the component updates, not both
3. **Clear API**: Document whether methods mutate or return new objects

## Conclusion

The fix ensures that clicking "+ Rule" or "+ Group" adds exactly one item by creating a copy of the ruleset before passing it to the service, allowing the service's mutation to only affect the copy.

---

**Status**: ✅ Fixed
**Build**: ✅ Successful
**Testing**: ✅ Verified
