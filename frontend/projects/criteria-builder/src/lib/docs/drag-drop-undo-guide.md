# Enhanced Drag & Drop and Undo Functionality Guide

This guide covers the enhanced drag-and-drop functionality and comprehensive undo system implemented in the criteria builder library.

## Overview

The criteria builder now includes:
- **Enhanced Drag & Drop**: Visual feedback, drop zones, constraint validation
- **Comprehensive Undo System**: 5-second timeout with visual countdown
- **User Feedback Integration**: Toast notifications, confirmation dialogs
- **Accessibility Support**: ARIA labels, keyboard navigation, screen reader support

## Features

### Drag & Drop Enhancements

#### Visual Feedback
- **Drag Preview**: Enhanced preview with rotation and glow effects
- **Drop Zones**: Visual indicators for valid/invalid drop targets
- **Placeholder**: Animated placeholder with "Drop here" text
- **Constraints**: Real-time validation of drop operations

#### Constraint Validation
- Maximum nesting depth (configurable, default: 10 levels)
- Maximum elements per group (configurable, default: 100)
- Type compatibility checking
- Circular nesting prevention
- Self-drop prevention

### Undo System

#### Supported Actions
- **Delete Operations**: Restore deleted chips with full data
- **Move Operations**: Restore original positions
- **Edit Operations**: Restore previous values (future enhancement)

#### Visual Feedback
- **Countdown Timer**: Visual progress bar showing remaining time
- **Toast Notifications**: Success/error messages with undo links
- **Undo Notification Component**: Dedicated UI for undo actions

## Usage

### Basic Configuration

```typescript
import { CriteriaBuilderConfig } from '@criteria-builder/lib';

const config: CriteriaBuilderConfig = {
  enableDragDrop: true,
  enableUndo: true,
  undoTimeout: 5000, // 5 seconds
  maxDepth: 10,
  maxElements: 100
};
```

### Component Integration

```html
<mp-criteria-builder
  [config]="config"
  [(ngModel)]="criteria"
  (dragDropCompleted)="onDragDropCompleted($event)"
  (undoRequested)="onUndoRequested($event)">
</mp-criteria-builder>

<!-- Undo Notification (automatically included) -->
<mp-undo-notification
  [compactMode]="false"
  [showProgress]="true"
  [position]="'bottom'"
  (undoExecuted)="onUndoExecuted($event)"
  (undoDismissed)="onUndoDismissed()">
</mp-undo-notification>
```

### Service Integration

```typescript
import { 
  UserFeedbackService, 
  DragDropService, 
  UndoService 
} from '@criteria-builder/lib';

export class MyComponent {
  constructor(
    private userFeedbackService: UserFeedbackService,
    private dragDropService: DragDropService,
    private undoService: UndoService
  ) {}

  async deleteItem(item: any): Promise<void> {
    const deleted = await this.userFeedbackService.handleDelete(
      item.name,
      item.type,
      { id: item.id, data: item },
      () => this.performDelete(item)
    );
    
    if (deleted) {
      console.log('Item deleted with undo support');
    }
  }

  handleMove(item: any, fromIndex: number, toIndex: number): void {
    this.userFeedbackService.handleMove(
      item.name,
      `position ${fromIndex + 1}`,
      `position ${toIndex + 1}`,
      { item, fromIndex, toIndex },
      () => this.performMove(item, fromIndex, toIndex)
    );
  }
}
```

## Services

### UserFeedbackService

Comprehensive service that coordinates undo, confirmations, and notifications.

```typescript
interface UserFeedbackConfig {
  enableUndo: boolean;
  enableConfirmations: boolean;
  enableToasts: boolean;
  undoTimeout: number;
  toastDefaults: {
    successLife: number;
    infoLife: number;
    warningLife: number;
    errorLife: number;
  };
}
```

**Key Methods:**
- `handleDelete(name, type, data, onDelete, skipConfirmation?)`: Delete with undo
- `handleMove(name, from, to, data, onMove)`: Move with undo
- `handleValidationErrors(errors, allowContinue?)`: Show validation errors
- `showSuccess/Info/Warning/Error(summary, detail, life?)`: Toast notifications
- `confirm(config)`: Show confirmation dialog

### DragDropService

Enhanced drag-and-drop management with visual feedback and constraints.

```typescript
interface DragConstraints {
  maxDepth: number;
  maxElements: number;
  allowedTypes: string[];
  preventCircularNesting: boolean;
}
```

**Key Methods:**
- `startDrag(item, fromGroupId)`: Initialize drag operation
- `endDrag()`: Clean up drag operation
- `validateDrop(item, targetGroupId, targetIndex, allGroups)`: Validate drop
- `executeDrop(fromGroupId, toGroupId, fromIndex, toIndex, allGroups)`: Execute drop

### UndoService

Core undo functionality with timeout management.

```typescript
interface UndoAction {
  id: string;
  type: 'delete' | 'move' | 'edit';
  description: string;
  data: any;
  timestamp: number;
  timeout: number;
}
```

**Key Methods:**
- `registerUndoAction(action)`: Register new undo action
- `executeUndo()`: Execute current undo action
- `cancelUndo()`: Cancel current undo action
- `createDeleteAction/MoveAction/EditAction()`: Create typed actions

## Styling

### CSS Classes

The components use these CSS classes for styling:

```scss
// Drag & Drop
.cdk-drag-preview { /* Enhanced drag preview */ }
.cdk-drag-placeholder { /* Drop placeholder */ }
.drop-zone-active { /* Active drop zone */ }
.drop-zone-valid { /* Valid drop target */ }
.drop-zone-invalid { /* Invalid drop target */ }
.criteria-dragging { /* Global drag state */ }

// Undo Notification
.undo-notification { /* Main notification container */ }
.undo-notification.compact { /* Compact mode */ }
.undo-progress { /* Progress bar container */ }
.undo-actions { /* Action buttons */ }
```

### Customization

```scss
// Custom drag preview
::ng-deep .cdk-drag-preview {
  background: your-color;
  border: 2px solid your-border-color;
  box-shadow: your-shadow;
}

// Custom undo notification
.undo-notification {
  background: your-background;
  border: 1px solid your-border;
  border-radius: your-radius;
}
```

## Accessibility

### ARIA Support
- Proper ARIA labels for all interactive elements
- Screen reader announcements for drag operations
- Keyboard navigation support
- Focus management during operations

### Keyboard Shortcuts
- `Ctrl/Cmd + G`: Toggle grouping
- `Ctrl/Cmd + +`: Add sibling (with Shift) or child
- `Arrow Keys`: Navigate and expand/collapse groups
- `Delete`: Delete selected item (with confirmation)
- `Ctrl/Cmd + Z`: Undo last action

## Best Practices

### Performance
1. **Debounce Validation**: Use debounced validation for real-time feedback
2. **Virtual Scrolling**: For large criteria structures
3. **Change Detection**: Use OnPush strategy for optimal performance
4. **Memory Management**: Proper cleanup of subscriptions and timers

### User Experience
1. **Progressive Disclosure**: Start simple, add complexity gradually
2. **Visual Feedback**: Always provide immediate feedback for actions
3. **Error Prevention**: Validate before allowing operations
4. **Recovery Options**: Always provide undo for destructive actions

### Accessibility
1. **Keyboard Support**: Ensure all functionality is keyboard accessible
2. **Screen Readers**: Provide meaningful ARIA labels and descriptions
3. **High Contrast**: Support high contrast mode
4. **Reduced Motion**: Respect user's motion preferences

## Troubleshooting

### Common Issues

**Drag & Drop Not Working**
- Ensure `enableDragDrop` is set to `true`
- Check that CDK drag-drop module is imported
- Verify constraint validation isn't blocking drops

**Undo Not Available**
- Confirm `enableUndo` is set to `true`
- Check that undo timeout hasn't expired
- Verify undo action was properly registered

**Performance Issues**
- Reduce `maxElements` if dealing with large structures
- Enable change detection optimization
- Use virtual scrolling for large lists

**Accessibility Problems**
- Ensure proper ARIA labels are set
- Test with keyboard navigation
- Verify screen reader compatibility

### Debug Mode

Enable debug logging:

```typescript
// In development
if (!environment.production) {
  dragDropService.enableDebugMode();
  undoService.enableDebugMode();
}
```

## Migration Guide

### From Basic to Enhanced

If upgrading from basic drag-and-drop:

1. **Update Configuration**:
   ```typescript
   // Old
   const config = { enableDragDrop: true };
   
   // New
   const config = {
     enableDragDrop: true,
     enableUndo: true,
     undoTimeout: 5000,
     maxDepth: 10,
     maxElements: 100
   };
   ```

2. **Add Event Handlers**:
   ```typescript
   // Add these event handlers
   onDragDropCompleted(result: DragDropResult) { }
   onUndoRequested(undoData: any) { }
   ```

3. **Update Styling**:
   - Import new CSS classes
   - Update custom styles for enhanced features

4. **Test Accessibility**:
   - Verify keyboard navigation
   - Test with screen readers
   - Check ARIA labels

## Examples

See the complete example in `drag-drop-undo-example.ts` for a full implementation demonstrating all features.