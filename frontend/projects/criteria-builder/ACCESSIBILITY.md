# Accessibility Features - Criteria Builder UI Library

This document describes the comprehensive accessibility features implemented in the Criteria Builder UI Library to ensure compliance with WCAG 2.1 AA standards and provide an inclusive experience for all users.

## Overview

The Criteria Builder includes extensive accessibility enhancements designed to support:
- Screen reader users
- Keyboard-only navigation
- Users with visual impairments (high contrast, colorblind)
- Users with motor disabilities
- Users with cognitive disabilities

## Accessibility Features

### 1. Comprehensive ARIA Labels and Descriptions

#### Token ARIA Labels
Every token in the query builder includes detailed ARIA labels that provide:
- Token type (Field, Operator, Value, Function, Group, Logic)
- Token content/value
- Position information (e.g., "Position 2 of 5")
- Parent context (e.g., "Inside group")
- Error information when applicable
- Available interactions (edit, delete, dropdown options)

```typescript
// Example ARIA label
"Field: Price. Position 1 of 3. Press Enter or Space to edit. Press Delete to remove. Press Arrow Down to open options"
```

#### Overlay ARIA Labels
Interactive overlays (dropdowns, dialogs, context menus) include:
- Purpose description
- Navigation instructions
- Available actions

### 2. Keyboard Shortcuts for Token Manipulation

#### Global Shortcuts
- `Ctrl + Enter`: Add new condition
- `Ctrl + Shift + Enter`: Add new group
- `Ctrl + Z`: Undo (when implemented)
- `Ctrl + Y`: Redo (when implemented)

#### Token-Specific Shortcuts
- `Delete` / `Backspace`: Delete selected token
- `F2` / `Enter` / `Space`: Edit selected token
- `Arrow Down`: Open dropdown options (for tokens with dropdowns)
- `Ctrl + D`: Duplicate selected token
- `Ctrl + Arrow Up/Down`: Move token up/down
- `Ctrl + G`: Toggle grouping
- `Escape`: Cancel current action

#### Navigation Shortcuts
- `Arrow Left/Right`: Navigate between tokens
- `Tab` / `Shift + Tab`: Navigate between tokens
- `Home`: Go to first token
- `End`: Go to last token

### 3. Focus Management

#### Focus Tracking
- Maintains focus history for easy navigation
- Visual focus indicators with high contrast
- Focus trap in modal dialogs
- Proper tab order throughout the interface

#### Focus Methods
```typescript
// Focus management API
accessibilityService.setFocusedToken(tokenId);
accessibilityService.focusPreviousToken();
accessibilityService.focusElement(element);
accessibilityService.trapFocus(container, event);
```

### 4. Screen Reader Announcements

#### Live Announcements
- Token changes (add, edit, delete, move)
- Query structure updates
- Validation errors and warnings
- Mode changes (simple/advanced)
- Import/export operations

#### Announcement Types
- **Polite**: Non-urgent updates (token changes, structure updates)
- **Assertive**: Urgent updates (errors, deletions, warnings)

#### Query Structure Descriptions
```typescript
// Example announcements
"Added Field: Price at position 1"
"Query structure: 3 conditions in 2 groups"
"Deleted Operator token"
"Error: Invalid number format"
```

### 5. High Contrast Mode Support

#### Visual Enhancements
- Increased border width (2px)
- Bold font weights
- High contrast color scheme:
  - Fields: Blue background, white text
  - Operators: Black background, white text
  - Values: Green background, white text
  - Functions: Purple background, white text
  - Groups: Orange background, black text
  - Logic: Red background, white text

#### Activation
```typescript
// Programmatic activation
accessibilityService.setHighContrastMode(true);

// Automatic detection
// Detects user's system preference for high contrast
```

### 6. Colorblind-Friendly Features

#### Shape and Pattern Indicators
Each token type has unique visual indicators beyond color:
- **Fields**: Square symbol (■) + diagonal stripes
- **Operators**: Circle symbol (●) + horizontal stripes
- **Values**: Triangle symbol (▲) + diagonal stripes (opposite direction)
- **Functions**: Diamond symbol (♦) + radial pattern
- **Groups**: Rectangle symbol (▬) + vertical stripes
- **Logic**: Star symbol (✦) + crosshatch pattern
- **Parentheses**: Literal "( )" symbols + gradient pattern

#### Pattern Implementation
```scss
// CSS patterns for colorblind users
.token-field {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.1) 2px,
    rgba(0,0,0,0.1) 4px
  );
}
```

## Usage

### Basic Setup

```typescript
import { CriteriaBuilderModule } from '@projects/criteria-builder';

@NgModule({
  imports: [CriteriaBuilderModule]
})
export class AppModule { }
```

### Accessibility Settings Component

```html
<!-- Include accessibility settings panel -->
<ac-accessibility-settings></ac-accessibility-settings>

<!-- Main criteria builder with accessibility features -->
<ac-criteria-builder
  [(ngModel)]="criteria"
  [config]="builderConfig">
</ac-criteria-builder>
```

### Programmatic Accessibility Control

```typescript
import { AccessibilityService } from '@projects/criteria-builder';

constructor(private accessibilityService: AccessibilityService) {}

// Enable high contrast mode
this.accessibilityService.setHighContrastMode(true);

// Enable colorblind-friendly mode
this.accessibilityService.setColorBlindMode(true);

// Enable enhanced screen reader support
this.accessibilityService.setScreenReaderMode(true);

// Register custom keyboard shortcuts
this.accessibilityService.registerKeyboardShortcut('Ctrl+s', () => {
  this.saveCriteria();
});

// Make announcements to screen readers
this.accessibilityService.announceToScreenReader('Criteria saved successfully');
```

## Configuration Options

### Builder Config
```typescript
interface BuilderConfig {
  // ... other options
  
  // Accessibility-specific options
  enableKeyboardShortcuts?: boolean;
  enableScreenReaderMode?: boolean;
  enableHighContrastMode?: boolean;
  enableColorBlindMode?: boolean;
  debounceMs?: number; // For reducing announcement frequency
}
```

### Accessibility Service Configuration
```typescript
// Listen to accessibility mode changes
this.accessibilityService.highContrastMode.subscribe(enabled => {
  // React to high contrast mode changes
});

this.accessibilityService.announcements.subscribe(message => {
  // Handle screen reader announcements
});
```

## Testing Accessibility

### Screen Reader Testing
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate using only keyboard
3. Verify all tokens are properly announced
4. Test overlay interactions
5. Verify error announcements

### Keyboard Navigation Testing
1. Disable mouse/trackpad
2. Navigate entire interface using keyboard only
3. Test all keyboard shortcuts
4. Verify focus management
5. Test focus trapping in modals

### Visual Accessibility Testing
1. Enable high contrast mode
2. Test with colorblind simulation tools
3. Verify shape indicators are visible
4. Test at different zoom levels (up to 200%)
5. Verify focus indicators are visible

### Automated Testing
```typescript
// Example accessibility tests
describe('Accessibility', () => {
  it('should have proper ARIA labels', () => {
    const token = fixture.debugElement.query(By.css('.token-container'));
    expect(token.nativeElement.getAttribute('aria-label')).toContain('Field: Price');
  });

  it('should handle keyboard navigation', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(event);
    expect(component.focusedTokenIndex).toBe(1);
  });

  it('should announce token changes', () => {
    spyOn(accessibilityService, 'announceToScreenReader');
    component.addCondition();
    expect(accessibilityService.announceToScreenReader)
      .toHaveBeenCalledWith('Added new condition');
  });
});
```

## Browser Support

### Screen Readers
- **Windows**: NVDA, JAWS
- **macOS**: VoiceOver
- **Linux**: Orca
- **Mobile**: TalkBack (Android), VoiceOver (iOS)

### Keyboard Navigation
- All modern browsers
- Supports standard navigation patterns
- Custom shortcuts work across platforms

### High Contrast
- Windows High Contrast Mode
- macOS Increase Contrast
- Browser zoom up to 200%
- Custom high contrast themes

## Compliance

### WCAG 2.1 AA Compliance
- ✅ **1.1.1** Non-text Content: All icons have text alternatives
- ✅ **1.3.1** Info and Relationships: Proper semantic structure
- ✅ **1.4.1** Use of Color: Information not conveyed by color alone
- ✅ **1.4.3** Contrast: Minimum 4.5:1 contrast ratio
- ✅ **1.4.11** Non-text Contrast: UI components meet 3:1 contrast
- ✅ **2.1.1** Keyboard: All functionality available via keyboard
- ✅ **2.1.2** No Keyboard Trap: Focus can move away from components
- ✅ **2.4.3** Focus Order: Logical focus order
- ✅ **2.4.7** Focus Visible: Clear focus indicators
- ✅ **3.2.2** On Input: No unexpected context changes
- ✅ **4.1.2** Name, Role, Value: Proper ARIA implementation

### Section 508 Compliance
- Meets all applicable Section 508 standards
- Compatible with assistive technologies
- Provides alternative access methods

## Troubleshooting

### Common Issues

#### Screen Reader Not Announcing Changes
```typescript
// Ensure announcements are enabled
this.accessibilityService.setScreenReaderMode(true);

// Check if live regions are present
const liveRegions = document.querySelectorAll('[aria-live]');
console.log('Live regions found:', liveRegions.length);
```

#### Keyboard Shortcuts Not Working
```typescript
// Verify shortcuts are registered
this.accessibilityService.registerKeyboardShortcut('Ctrl+Enter', callback);

// Check for conflicting shortcuts
// Ensure focus is on the criteria builder component
```

#### High Contrast Mode Not Applying
```typescript
// Check if mode is enabled
this.accessibilityService.highContrastMode.subscribe(enabled => {
  console.log('High contrast mode:', enabled);
});

// Verify CSS classes are applied
const element = document.querySelector('.ac-criteria-builder');
console.log('Has high-contrast class:', element.classList.contains('high-contrast'));
```

### Debug Mode
```typescript
// Enable debug logging for accessibility events
window.localStorage.setItem('accessibility-debug', 'true');

// This will log all accessibility events to console
```

## Contributing

When contributing to accessibility features:

1. **Test with real assistive technologies**
2. **Follow ARIA best practices**
3. **Maintain keyboard navigation**
4. **Update documentation**
5. **Add accessibility tests**

### Accessibility Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] ARIA labels are comprehensive and accurate
- [ ] Focus management works correctly
- [ ] Screen reader announcements are appropriate
- [ ] High contrast mode is supported
- [ ] Colorblind-friendly indicators are present
- [ ] Tests cover accessibility features

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Universal Design](https://jfly.uni-koeln.de/color/)