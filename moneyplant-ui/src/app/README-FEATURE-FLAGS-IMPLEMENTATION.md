# Feature Flag Implementation in MoneyPlant

This document provides an overview of how feature flags have been implemented throughout the MoneyPlant application.

## Implemented Feature Flags

The following feature flags have been implemented:

### Main Features (Route Level)

These feature flags control access to entire features via route guards:

| Feature Flag | Description | Controls |
|--------------|-------------|----------|
| `dashboard` | Controls access to the dashboard feature | Dashboard route |
| `watchlist` | Controls access to the watchlist feature | Watchlist routes |
| `holdings` | Controls access to the holdings feature | Holdings routes |
| `positions` | Controls access to the positions feature | Positions routes |
| `market` | Controls access to the market feature | Market routes |

### Component Level Features

These feature flags control specific UI components:

| Feature Flag | Description | Controls |
|--------------|-------------|----------|
| `settings` | Controls visibility of the settings button | Settings button in header |
| `user-profile` | Controls visibility of the user profile button | User profile button in header |
| `dashboard-overall` | Controls visibility of the Overall tab | Overall tab in dashboard |
| `dashboard-today` | Controls visibility of the Today tab | Today tab in dashboard |
| `dashboard-week` | Controls visibility of the This Week tab | This Week tab in dashboard |
| `dashboard-month` | Controls visibility of the This Month tab | This Month tab in dashboard |
| `dashboard-year` | Controls visibility of the This Year tab | This Year tab in dashboard |

## Implementation Details

### Route Guards

Feature flags are enforced at the route level using the `featureFlagGuard` function:

```typescript
// In app.routes.ts
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/dashboard.component')
    .then(m => m.DashboardComponent),
  title: 'Dashboard - MoneyPlant',
  canActivate: [featureFlagGuard('dashboard')]
};
```

If a feature flag is disabled, the user will be redirected to the dashboard.

### Component Templates

Feature flags are used in component templates with the `*featureFlag` directive:

```html
<!-- Show content only if the feature flag is enabled -->
<ng-container *featureFlag="'feature-name'">
  <!-- Feature content here -->
</ng-container>

<!-- With an else template -->
<ng-container *featureFlag="'feature-name'; else disabledTemplate">
  <!-- Feature enabled content -->
</ng-container>
<ng-template #disabledTemplate>
  <!-- Feature disabled content -->
</ng-template>
```

### TypeScript Code

Feature flags can be checked programmatically in TypeScript code:

```typescript
import { FeatureFlagStateService } from '../../services/state/feature-flag.state';

@Component({...})
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

## Adding New Feature Flags

To add a new feature flag:

1. Create the feature flag in the backend or add it to the initial state
2. Use the feature flag in your component or route as shown above
3. Update this documentation to reflect the new feature flag

## Testing Feature Flags

To test feature flags, you can:

1. Use the FeatureFlagService to enable/disable flags programmatically
2. Create test cases that verify both enabled and disabled states
3. Manually toggle flags in the development environment
