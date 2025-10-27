# Custom Group Chip Component

A simplified, custom group chip component built on PrimeNG p-button that provides the core functionality needed for the criteria builder interface.

## Features

- **Superscripted Toggle Icon**: Curly braces '{}' icon at top-left for enable/disable functionality
- **Main Button**: PrimeNG p-button with click event that opens a multi-tab popover
- **Delete Icon**: Encircled 'x' icon at the end for deletion
- **Multi-tab Popover**: Configurable popover with tabs for Fields, Operators, Math Functions, and Indicators
- **Abstract Base Class**: Extensible architecture for creating additional chip types

## Components

### AbstractChipComponent

Base abstract class that provides common functionality for all chip components:

- Event handling (click, toggle, delete)
- Popover management
- Accessibility features
- Common styling and behavior

### CustomGroupChipComponent

Concrete implementation of a group chip with:

- Toggle functionality with visual feedback
- Multi-tab popover with configurable content
- Event emission for all user interactions
- Responsive design and accessibility compliance

## Usage

```typescript
import { CustomGroupChipComponent } from '@criteria-builder/components';

@Component({
  template: `
    <mp-custom-group-chip
      chipId="my-chip"
      displayText="My Group"
      [hasToggle]="true"
      [toggleState]="false"
      [deletable]="true"
      [showPopover]="true"
      severity="primary"
      tooltip="Configure criteria"
      (chipClick)="onChipClick($event)"
      (toggleClick)="onToggleClick($event)"
      (deleteClick)="onDeleteClick($event)"
      (fieldSelected)="onFieldSelected($event)"
      (operatorSelected)="onOperatorSelected($event)"
      (functionSelected)="onFunctionSelected($event)"
      (indicatorSelected)="onIndicatorSelected($event)">
    </mp-custom-group-chip>
  `
})
export class MyComponent {
  onChipClick(chipId: string) {
    console.log('Chip clicked:', chipId);
  }
  
  onToggleClick(event: {chipId: string, enabled: boolean}) {
    console.log('Toggle clicked:', event);
  }
  
  onDeleteClick(chipId: string) {
    console.log('Delete clicked:', chipId);
  }
  
  onFieldSelected(event: {chipId: string, field: any}) {
    console.log('Field selected:', event);
  }
  
  // ... other event handlers
}
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `chipId` | `string` | - | **Required.** Unique identifier for the chip |
| `displayText` | `string` | `''` | Text displayed on the chip button |
| `disabled` | `boolean` | `false` | Whether the chip is disabled |
| `deletable` | `boolean` | `true` | Whether the delete button is shown |
| `hasToggle` | `boolean` | `false` | Whether the toggle button is shown |
| `toggleState` | `boolean` | `false` | Current state of the toggle |
| `showPopover` | `boolean` | `true` | Whether clicking shows the popover |
| `tooltip` | `string` | - | Tooltip text for the main button |
| `severity` | `string` | `'secondary'` | PrimeNG button severity |
| `size` | `string` | - | PrimeNG button size |
| `outlined` | `boolean` | `true` | Whether the button is outlined |
| `availableFields` | `any[]` | `[]` | Fields shown in the Fields tab |
| `availableOperators` | `any[]` | `[]` | Operators shown in the Operators tab |
| `mathFunctions` | `any[]` | `[]` | Functions shown in the Math Functions tab |
| `technicalIndicators` | `any[]` | `[]` | Indicators shown in the Indicators tab |

## Output Events

| Event | Type | Description |
|-------|------|-------------|
| `chipClick` | `string` | Emitted when the main chip button is clicked |
| `toggleClick` | `{chipId: string, enabled: boolean}` | Emitted when the toggle button is clicked |
| `deleteClick` | `string` | Emitted when the delete button is clicked |
| `popoverShow` | `{chipId: string, overlayPanel: OverlayPanel}` | Emitted when the popover is shown |
| `popoverHide` | `string` | Emitted when the popover is hidden |
| `fieldSelected` | `{chipId: string, field: any}` | Emitted when a field is selected from the popover |
| `operatorSelected` | `{chipId: string, operator: any}` | Emitted when an operator is selected |
| `functionSelected` | `{chipId: string, function: any}` | Emitted when a function is selected |
| `indicatorSelected` | `{chipId: string, indicator: any}` | Emitted when an indicator is selected |

## Styling

The component uses CSS custom properties (CSS variables) for theming and supports:

- Light/dark theme switching
- High contrast mode
- Responsive design
- Reduced motion preferences
- Print styles

Key CSS classes:
- `.custom-group-chip-container` - Main container
- `.toggle-btn` - Toggle button (curly braces)
- `.delete-btn` - Delete button (x icon)
- `.criteria-popover` - Popover styling

## Accessibility

The component is fully accessible with:

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader announcements
- Focus management
- High contrast mode support

## Extending the Component

To create additional chip types, extend the `AbstractChipComponent`:

```typescript
@Component({
  selector: 'mp-my-custom-chip',
  template: `
    <!-- Your custom template -->
  `
})
export class MyCustomChipComponent extends AbstractChipComponent {
  protected getChipType(): string {
    return 'my-custom';
  }
  
  protected initializeChip(): void {
    // Custom initialization logic
  }
}
```

## Dependencies

- Angular 17+
- PrimeNG 17+
- RxJS 7+

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+