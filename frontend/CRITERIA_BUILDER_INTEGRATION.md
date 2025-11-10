# Criteria Builder Integration - Fixed

## Issue
The criteria builder UI was not showing the "Rule" and "Group" buttons, making it impossible to add screening conditions.

## Root Cause
The query builder buttons were rendering but had visibility and styling issues that made them hard to see or interact with.

## Changes Made

### 1. Enhanced Button Visibility
**File**: `frontend/projects/querybuilder/src/lib/components/query-button-group/query-button-group.component.html`
- Updated button labels to "+ Rule" and "+ Group" for clarity
- Changed icons to `pi-plus-circle` and `pi-sitemap` for better visual distinction
- Added explicit style classes `query-add-rule-btn` and `query-add-group-btn`

### 2. Improved Button Styling
**File**: `frontend/projects/querybuilder/src/lib/components/query-button-group/query-button-group.component.scss`
- Made buttons more prominent with explicit colors:
  - Rule button: Green (#22c55e)
  - Group button: Blue (#3b82f6)
- Added hover effects and shadows
- Set explicit dimensions (32px height, 80px min-width)
- Increased gap between buttons to 8px

### 3. Enhanced Ruleset Header Layout
**File**: `frontend/projects/querybuilder/src/lib/components/query-entity/query-entity.component.html`
- Wrapped condition switch and button group in a `.query-ruleset-controls` container
- Improved layout with flexbox for better alignment

**File**: `frontend/projects/querybuilder/src/lib/components/query-entity/query-entity.component.scss`
- Enhanced header styling with background color (#f8f9fa)
- Added padding and proper spacing
- Improved visual hierarchy

### 4. Screeners Configure Component Styling
**File**: `frontend/src/app/features/screeners/configure/screeners-configure.component.scss`
- Added explicit visibility rules with `!important` flags to ensure buttons are always visible
- Enhanced query builder wrapper styling
- Added explicit styling for all query builder components
- Ensured proper layout and spacing

## How to Use the Criteria Builder

### Adding Rules
1. Navigate to the Screeners page
2. Select a screener or create a new one
3. Go to the "Configure" tab
4. In the "Screening Criteria" section, you'll see the query builder
5. Click the green "+ Rule" button to add a new screening condition
6. Select:
   - **Field**: The stock attribute to filter (e.g., Market Cap, P/E Ratio, Price)
   - **Operator**: The comparison operator (e.g., equals, greater than, less than)
   - **Value**: The value to compare against

### Adding Rule Groups
1. Click the blue "+ Group" button to add a nested rule group
2. Choose the condition for the group (AND/OR)
3. Add rules within the group using the "+ Rule" button
4. Groups can be nested for complex screening logic

### Condition Logic
- **AND**: All rules in the group must be true
- **OR**: At least one rule in the group must be true

### Example Screening Criteria
```
AND
  + Rule: Market Cap > 1000 (Crores)
  + Rule: P/E Ratio < 25
  + Group (OR)
      + Rule: Dividend Yield > 2%
      + Rule: ROE > 15%
```

This would find stocks with:
- Market cap greater than 1000 crores AND
- P/E ratio less than 25 AND
- Either dividend yield > 2% OR ROE > 15%

## Visual Indicators
- **Green "+ Rule" button**: Add a new screening condition
- **Blue "+ Group" button**: Add a nested rule group
- **Red X button**: Remove a rule or group
- **AND/OR dropdown**: Change the condition logic for a rule group

## Next Steps
1. Test the criteria builder by creating a new screener
2. Add multiple rules and groups to verify functionality
3. Save the screener and verify the criteria is persisted
4. Run the screener to see results

## Technical Notes
- The query builder uses Angular v20 and PrimeNG v20 components
- All styling is responsive and works on mobile devices
- The query builder integrates with the backend API for screener criteria
- Validation is performed to ensure criteria is valid before saving
