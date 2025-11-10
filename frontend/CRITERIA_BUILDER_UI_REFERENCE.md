# Criteria Builder UI Reference

## Expected UI Layout

### Initial State (Empty Query Builder)
```
┌─────────────────────────────────────────────────────────────┐
│ Screening Criteria                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [AND ▼]  [+ Rule]  [+ Group]                           │ │
│ │                                                          │ │
│ │ (No rules added yet)                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### With One Rule Added
```
┌─────────────────────────────────────────────────────────────┐
│ Screening Criteria                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [AND ▼]  [+ Rule]  [+ Group]                           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Market Cap ▼] [> ▼] [1000] [X]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### With Multiple Rules and a Group
```
┌─────────────────────────────────────────────────────────────┐
│ Screening Criteria                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [AND ▼]  [+ Rule]  [+ Group]                           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Market Cap ▼] [> ▼] [1000] [X]                       │ │
│ │ [P/E Ratio ▼] [< ▼] [25] [X]                          │ │
│ │ ┌───────────────────────────────────────────────────┐  │ │
│ │ │ [OR ▼]  [+ Rule]  [+ Group]                  [X] │  │ │
│ │ ├───────────────────────────────────────────────────┤  │ │
│ │ │ [Dividend Yield ▼] [> ▼] [2] [X]                │  │ │
│ │ │ [ROE ▼] [> ▼] [15] [X]                          │  │ │
│ │ └───────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Button Colors and Icons

### + Rule Button
- **Color**: Green (#22c55e)
- **Icon**: Plus circle (pi-plus-circle)
- **Label**: "+ Rule"
- **Purpose**: Add a new screening condition

### + Group Button
- **Color**: Blue (#3b82f6)
- **Icon**: Sitemap (pi-sitemap)
- **Label**: "+ Group"
- **Purpose**: Add a nested rule group for complex logic

### Remove Button (X)
- **Color**: Red (#ef4444)
- **Icon**: Times (pi-times)
- **Purpose**: Remove a rule or group

### Condition Dropdown
- **Options**: AND, OR
- **Color**: Default (gray)
- **Purpose**: Set the logical condition for combining rules

## Component Hierarchy

```
QueryBuilderComponent
└── QueryEntityComponent (RuleSet)
    ├── QuerySwitchGroupComponent (AND/OR selector)
    ├── QueryButtonGroupComponent
    │   ├── + Rule Button
    │   └── + Group Button
    ├── QueryRemoveButtonComponent (if nested)
    └── Rules/RuleSets (recursive)
        ├── QueryEntityComponent (Rule)
        │   ├── QueryFieldDetailsComponent
        │   │   ├── Field Selector
        │   │   ├── Operator Selector
        │   │   └── Value Input
        │   └── QueryRemoveButtonComponent
        └── QueryEntityComponent (RuleSet) - recursive
```

## Styling Details

### Header Section
- Background: Light gray (#f8f9fa)
- Border: 1px solid #e0e0e0
- Padding: 8px 12px
- Border radius: 4px (top corners)

### Rule Section
- Background: White
- Padding: 8px 12px
- Border: None (inherits from parent)
- Min height: 40px

### Nested Groups
- Border: 1px solid #e0e0e0
- Border radius: 6px
- Margin: 8px 0
- Background: White
- Indentation: Visual hierarchy through borders

## Responsive Behavior

### Desktop (> 768px)
- Buttons displayed inline
- Full labels visible
- Horizontal layout for rules

### Tablet (480px - 768px)
- Buttons remain inline
- Slightly reduced padding
- Rules may wrap to multiple lines

### Mobile (< 480px)
- Buttons stack vertically
- Full width buttons
- Rules stack vertically
- Increased touch targets (40px height)

## Accessibility Features

- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators on all controls
- Screen reader friendly
- High contrast mode support
- Reduced motion support

## Common Issues and Solutions

### Issue: Buttons not visible
**Solution**: Check that the query builder library is built and imported correctly. Verify CSS is not being overridden.

### Issue: Buttons not clickable
**Solution**: Check z-index and pointer-events CSS properties. Ensure no overlapping elements.

### Issue: Styling looks different
**Solution**: Ensure PrimeNG theme is loaded. Check for CSS conflicts with global styles.

### Issue: Rules not saving
**Solution**: Verify the query converter service is working. Check browser console for errors.

## Testing Checklist

- [ ] Can see "+ Rule" button (green)
- [ ] Can see "+ Group" button (blue)
- [ ] Can click "+ Rule" to add a rule
- [ ] Can select field, operator, and value
- [ ] Can click "X" to remove a rule
- [ ] Can click "+ Group" to add a nested group
- [ ] Can change AND/OR condition
- [ ] Can nest multiple levels of groups
- [ ] Can save screener with criteria
- [ ] Criteria persists after page reload
- [ ] Validation errors display correctly
- [ ] Responsive layout works on mobile
