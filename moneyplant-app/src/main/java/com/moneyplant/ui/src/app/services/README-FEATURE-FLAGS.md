# Feature Flagging in MoneyPlant

This document provides guidance on how to use the feature flagging system in the MoneyPlant application.

## Overview

Feature flagging allows you to conditionally enable or disable features in the application without deploying new code. This is useful for:

- Gradual rollout of new features
- A/B testing
- Toggling features for different environments
- Quickly disabling problematic features in production

## Feature Flag Structure

Each feature flag has the following properties:

```typescript
interface FeatureFlag {
  id: string;       // Unique identifier
  name: string;     // Human-readable name
  description: string; // Description of what the feature does
  enabled: boolean; // Whether the feature is enabled
  group?: string;   // Optional grouping for related flags
  metadata?: Record<string, any>; // Optional additional data
}
```

## Using Feature Flags in Components

### Conditional Rendering with the Feature Flag Directive

The `FeatureFlagDirective` allows you to conditionally render elements based on whether a feature flag is enabled:

```html
<!-- Basic usage -->
<div *featureFlag="'feature-name'">
  This content will only be shown if the 'feature-name' flag is enabled
</div>

<!-- With an else template -->
<div *featureFlag="'feature-name'; else disabledTemplate">
  Feature is enabled
</div>
<ng-template #disabledTemplate>
  Feature is disabled
</ng-template>
```

To use the directive in a component, import it:

```typescript
import { FeatureFlagDirective } from '../../core/directives';

@Component({
  // ...
  imports: [
    // ...
    FeatureFlagDirective
  ]
})
export class YourComponent {
  // ...
}
```

### Programmatic Checking in TypeScript

You can also check if a feature is enabled in your TypeScript code:

```typescript
import { FeatureFlagStateService } from '../../services';

@Component({
  // ...
})
export class YourComponent {
  constructor(private featureFlagService: FeatureFlagStateService) {}

  someMethod() {
    if (this.featureFlagService.isFeatureEnabled('feature-name')) {
      // Do something when the feature is enabled
    } else {
      // Do something else when the feature is disabled
    }
  }
}
```

## Managing Feature Flags

### API Service

The `FeatureFlagService` provides methods for managing feature flags:

```typescript
import { FeatureFlagService } from '../../services';

// Get all feature flags
featureFlagService.getFeatureFlags().subscribe(flags => {
  console.log(flags);
});

// Create a new feature flag
featureFlagService.createFeatureFlag({
  name: 'new-feature',
  description: 'A new feature',
  enabled: false
}).subscribe(newFlag => {
  console.log(newFlag);
});

// Enable a feature flag
featureFlagService.enableFeatureFlag('feature-id').subscribe(updatedFlag => {
  console.log(updatedFlag);
});

// Disable a feature flag
featureFlagService.disableFeatureFlag('feature-id').subscribe(updatedFlag => {
  console.log(updatedFlag);
});
```

### State Service

The `FeatureFlagStateService` provides methods for managing feature flag state with caching:

```typescript
import { FeatureFlagStateService } from '../../services';

// Get all feature flags (with caching)
featureFlagStateService.getFeatureFlags().subscribe(flags => {
  console.log(flags);
});

// Force refresh from API
featureFlagStateService.getFeatureFlags(true).subscribe(flags => {
  console.log(flags);
});

// Check if a feature is enabled
const isEnabled = featureFlagStateService.isFeatureEnabled('feature-name');
```

## Best Practices

1. **Use meaningful names**: Choose clear, descriptive names for feature flags
2. **Document purpose**: Always include a clear description of what the feature flag controls
3. **Clean up old flags**: Remove feature flags that are no longer needed
4. **Group related flags**: Use the `group` property to organize related flags
5. **Default to off**: New features should default to disabled until ready for release
6. **Test both states**: Always test your application with the feature flag both enabled and disabled