# Quickstart Guide: App Features Tool

**Feature**: App Features Tool | **Branch**: `002-app-features-tool` | **Date**: 2025-10-12

## Overview

The App Features Tool enables developers to test product-level feature availability (license tiers, deployment configurations, environment flags) without backend changes. This guide provides a 5-minute integration with real-world product tier examples.

## 5-Minute Integration

### Prerequisites

- Angular 19+ application
- `ngx-dev-toolbar` package installed

```bash
npm install ngx-dev-toolbar
```

### Step 1: Import the Toolbar Component

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { DevToolbarComponent } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  imports: [DevToolbarComponent],
  template: `
    <ndt-toolbar />
    <router-outlet />
  `
})
export class AppComponent {
  // Integration in steps 2-4
}
```

### Step 2: Inject the Service

```typescript
import { inject } from '@angular/core';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

export class AppComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
}
```

### Step 3: Configure Available Features

```typescript
import { OnInit } from '@angular/core';
import { DevToolbarAppFeature } from 'ngx-dev-toolbar';

export class AppComponent implements OnInit {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private currentTier = 'basic'; // From license service

  ngOnInit(): void {
    const features: DevToolbarAppFeature[] = [
      {
        id: 'analytics',
        name: 'Analytics Dashboard',
        description: 'Advanced reporting and data visualization',
        isEnabled: this.currentTier !== 'basic',
        isForced: false
      },
      {
        id: 'multi-user',
        name: 'Multi-User Support',
        description: 'Collaborate with team members',
        isEnabled: this.currentTier !== 'basic',
        isForced: false
      },
      {
        id: 'white-label',
        name: 'White Label Branding',
        description: 'Custom branding and theming',
        isEnabled: this.currentTier === 'enterprise',
        isForced: false
      }
    ];

    this.appFeaturesService.setAvailableOptions(features);
  }
}
```

### Step 4: Subscribe to Forced Values

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class AppComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  constructor() {
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedFeatures => {
        forcedFeatures.forEach(feature => {
          if (feature.isEnabled) {
            this.enableFeature(feature.id);
          } else {
            this.disableFeature(feature.id);
          }
        });
      });
  }

  private enableFeature(featureId: string): void {
    console.log(`Enabling feature: ${featureId}`);
    // Update app state to enable feature
  }

  private disableFeature(featureId: string): void {
    console.log(`Disabling feature: ${featureId}`);
    // Update app state to disable feature
  }
}
```

### Complete Integration Example

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DevToolbarComponent,
  DevToolbarAppFeaturesService,
  DevToolbarAppFeature
} from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  imports: [DevToolbarComponent],
  template: `
    <ndt-toolbar />
    <router-outlet />
  `
})
export class AppComponent implements OnInit {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private currentTier = 'basic'; // From license service

  constructor() {
    // Step 4: Subscribe to forced values
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedFeatures => {
        forcedFeatures.forEach(feature => {
          if (feature.isEnabled) {
            this.enableFeature(feature.id);
          } else {
            this.disableFeature(feature.id);
          }
        });
      });
  }

  ngOnInit(): void {
    // Step 3: Configure available features
    const features: DevToolbarAppFeature[] = [
      {
        id: 'analytics',
        name: 'Analytics Dashboard',
        description: 'Advanced reporting and data visualization',
        isEnabled: this.currentTier !== 'basic',
        isForced: false
      },
      {
        id: 'multi-user',
        name: 'Multi-User Support',
        description: 'Collaborate with team members',
        isEnabled: this.currentTier !== 'basic',
        isForced: false
      },
      {
        id: 'white-label',
        name: 'White Label Branding',
        description: 'Custom branding and theming',
        isEnabled: this.currentTier === 'enterprise',
        isForced: false
      }
    ];

    this.appFeaturesService.setAvailableOptions(features);
  }

  private enableFeature(featureId: string): void {
    console.log(`Enabling feature: ${featureId}`);
    // Update app state to enable feature
  }

  private disableFeature(featureId: string): void {
    console.log(`Disabling feature: ${featureId}`);
    // Update app state to disable feature
  }
}
```

---

## Product Tier Examples

### Basic Tier (Free Plan)

**Features**: Core functionality only, premium features disabled

```typescript
const basicTierFeatures: DevToolbarAppFeature[] = [
  {
    id: 'core-features',
    name: 'Core Features',
    description: 'Essential functionality for all users',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'single-user',
    name: 'Single User Mode',
    description: 'Personal workspace for individual use',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'basic-support',
    name: 'Community Support',
    description: 'Access to community forums and documentation',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Advanced reporting and data visualization',
    isEnabled: false, // ❌ Not available on free plan
    isForced: false
  },
  {
    id: 'multi-user',
    name: 'Multi-User Support',
    description: 'Collaborate with team members',
    isEnabled: false, // ❌ Not available on free plan
    isForced: false
  },
  {
    id: 'white-label',
    name: 'White Label Branding',
    description: 'Custom branding and theming',
    isEnabled: false, // ❌ Not available on free plan
    isForced: false
  }
];
```

**UI Display**:
```
┌─────────────────────────────────────────┐
│  App Features                           │
├─────────────────────────────────────────┤
│  ✅ Core Features           [Not Forced]│
│  ✅ Single User Mode        [Not Forced]│
│  ✅ Community Support       [Not Forced]│
│  ❌ Analytics Dashboard     [Not Forced]│
│  ❌ Multi-User Support      [Not Forced]│
│  ❌ White Label Branding    [Not Forced]│
└─────────────────────────────────────────┘
```

**Testing Premium Features**:
Developer on Basic tier wants to test Analytics Dashboard:
1. Change "Analytics Dashboard" dropdown from "Not Forced" to "Enabled"
2. App immediately shows analytics in navigation
3. Developer can test analytics workflows without upgrading
4. Refresh page - forced state persists from localStorage

---

### Professional Tier (Paid Plan)

**Features**: Core + analytics + collaboration

```typescript
const professionalTierFeatures: DevToolbarAppFeature[] = [
  {
    id: 'core-features',
    name: 'Core Features',
    description: 'Essential functionality for all users',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'single-user',
    name: 'Single User Mode',
    description: 'Personal workspace for individual use',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Advanced reporting and data visualization',
    isEnabled: true, // ✅ Available on professional plan
    isForced: false
  },
  {
    id: 'multi-user',
    name: 'Multi-User Support',
    description: 'Collaborate with team members',
    isEnabled: true, // ✅ Available on professional plan
    isForced: false
  },
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: 'Email and chat support with 24h response time',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'white-label',
    name: 'White Label Branding',
    description: 'Custom branding and theming',
    isEnabled: false, // ❌ Enterprise only
    isForced: false
  },
  {
    id: 'sso-integration',
    name: 'SSO Integration',
    description: 'Single sign-on with SAML/OAuth',
    isEnabled: false, // ❌ Enterprise only
    isForced: false
  }
];
```

**Testing Downgrade Scenario**:
Developer wants to test how app behaves without analytics:
1. Change "Analytics Dashboard" dropdown from "Not Forced" to "Disabled"
2. Analytics disappears from navigation (simulates Basic tier)
3. Developer verifies fallback UI works correctly
4. Change back to "Not Forced" to restore professional tier behavior

---

### Enterprise Tier (Full Access)

**Features**: All features enabled

```typescript
const enterpriseTierFeatures: DevToolbarAppFeature[] = [
  {
    id: 'core-features',
    name: 'Core Features',
    description: 'Essential functionality for all users',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Advanced reporting and data visualization',
    isEnabled: true, // ✅ Available
    isForced: false
  },
  {
    id: 'multi-user',
    name: 'Multi-User Support',
    description: 'Collaborate with team members',
    isEnabled: true, // ✅ Available
    isForced: false
  },
  {
    id: 'white-label',
    name: 'White Label Branding',
    description: 'Custom branding and theming',
    isEnabled: true, // ✅ Enterprise feature
    isForced: false
  },
  {
    id: 'sso-integration',
    name: 'SSO Integration',
    description: 'Single sign-on with SAML/OAuth',
    isEnabled: true, // ✅ Enterprise feature
    isForced: false
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'REST API for custom integrations',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'dedicated-support',
    name: 'Dedicated Support',
    description: 'Dedicated account manager and phone support',
    isEnabled: true,
    isForced: false
  },
  {
    id: 'custom-contracts',
    name: 'Custom Contracts',
    description: 'SLA guarantees and custom terms',
    isEnabled: true,
    isForced: false
  }
];
```

**Testing Progressive Disclosure**:
Developer wants to test how app handles missing enterprise features:
1. Disable "White Label Branding" (simulates Professional tier)
2. App shows default branding instead of custom theme
3. Disable "SSO Integration"
4. App shows regular login form instead of SSO options
5. Developer verifies graceful degradation for each tier

---

## 8-Step Demo Workflow

**Scenario**: Developer on Basic tier wants to test Professional tier analytics feature

### Step 1: Start Application
```bash
npm start
```
Open browser to `http://localhost:4200`

### Step 2: Open Dev Toolbar
Press **Ctrl+Shift+D** (or **Cmd+Shift+D** on Mac)

### Step 3: Click "App Features" Tool
Look for puzzle icon (🧩) in toolbar, click to open App Features tool

### Step 4: Find "Analytics Dashboard" Feature
Use search box if needed: type "analytics"

### Step 5: Change Dropdown to "Enabled"
Click dropdown next to "Analytics Dashboard", select "Enabled"

### Step 6: App Shows Analytics Dashboard
Navigation immediately updates, analytics link appears in menu

### Step 7: Test Analytics Workflows
- Click analytics in navigation
- Verify charts load correctly
- Test report generation
- Export data as CSV

### Step 8: Refresh Page - State Persists
1. Press F5 to refresh page
2. Analytics dashboard still available (forced state persisted)
3. Change dropdown back to "Not Forced"
4. Analytics dashboard disappears (returns to Basic tier behavior)

**Expected Timeline**:
- Integration: 5 minutes
- First test: 30 seconds
- Complete workflow: 2 minutes

---

## Advanced Usage

### Conditional UI Rendering

```typescript
import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-dashboard',
  template: `
    <nav>
      <a routerLink="/home">Home</a>

      @if (isFeatureEnabled('analytics')) {
        <a routerLink="/analytics">Analytics</a>
      }

      @if (isFeatureEnabled('multi-user')) {
        <a routerLink="/team">Team</a>
      }

      @if (isFeatureEnabled('white-label')) {
        <a routerLink="/branding">Branding</a>
      }
    </nav>

    @if (!isFeatureEnabled('analytics')) {
      <div class="upgrade-banner">
        <h3>Unlock Analytics Dashboard</h3>
        <p>Upgrade to Professional for advanced reporting</p>
        <button>Upgrade Now</button>
      </div>
    }
  `
})
export class DashboardComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private enabledFeatures = signal<Set<string>>(new Set());

  constructor() {
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedFeatures => {
        const enabled = new Set<string>(
          forcedFeatures
            .filter(f => f.isEnabled)
            .map(f => f.id)
        );
        this.enabledFeatures.set(enabled);
      });
  }

  protected isFeatureEnabled(featureId: string): boolean {
    return this.enabledFeatures().has(featureId);
  }
}
```

### Route Guards Based on Features

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

export const featureGuard = (requiredFeature: string): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const appFeaturesService = inject(DevToolbarAppFeaturesService);

    return appFeaturesService.getForcedValues().pipe(
      map(forcedFeatures => {
        const hasFeature = forcedFeatures.some(
          f => f.id === requiredFeature && f.isEnabled
        );

        if (!hasFeature) {
          router.navigate(['/upgrade']);
          return false;
        }

        return true;
      })
    );
  };
};

// Usage in routes
export const routes: Routes = [
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [featureGuard('analytics')]
  },
  {
    path: 'team',
    component: TeamComponent,
    canActivate: [featureGuard('multi-user')]
  }
];
```

### Feature-Based Component Loading

```typescript
import { Component, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: `
    @if (analyticsEnabled()) {
      <app-analytics-widget />
    }

    @if (multiUserEnabled()) {
      <app-team-sidebar />
    }

    @if (whitelabelEnabled()) {
      <app-custom-header [theme]="customTheme" />
    } @else {
      <app-default-header />
    }
  `
})
export class AppComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private forcedFeatures = signal<string[]>([]);

  protected analyticsEnabled = computed(() =>
    this.forcedFeatures().includes('analytics')
  );

  protected multiUserEnabled = computed(() =>
    this.forcedFeatures().includes('multi-user')
  );

  protected whitelabelEnabled = computed(() =>
    this.forcedFeatures().includes('white-label')
  );

  constructor() {
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(features => {
        const enabledIds = features
          .filter(f => f.isEnabled)
          .map(f => f.id);
        this.forcedFeatures.set(enabledIds);
      });
  }
}
```

---

## Common Patterns

### Pattern 1: Feature Service Abstraction

```typescript
import { Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Injectable({ providedIn: 'root' })
export class FeatureManagerService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private features = signal<Map<string, boolean>>(new Map());

  constructor() {
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedFeatures => {
        const map = new Map<string, boolean>();
        forcedFeatures.forEach(f => map.set(f.id, f.isEnabled));
        this.features.set(map);
      });
  }

  isEnabled(featureId: string): boolean {
    return this.features().get(featureId) ?? false;
  }

  requireFeature(featureId: string): void {
    if (!this.isEnabled(featureId)) {
      throw new Error(`Feature ${featureId} is not available`);
    }
  }
}
```

### Pattern 2: Tier Detection

```typescript
import { Injectable, computed } from '@angular/core';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Injectable({ providedIn: 'root' })
export class TierDetectionService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  private enabledFeatures = toSignal(
    this.appFeaturesService.getForcedValues().pipe(
      map(features => new Set(features.filter(f => f.isEnabled).map(f => f.id)))
    ),
    { initialValue: new Set<string>() }
  );

  tier = computed(() => {
    const features = this.enabledFeatures();

    if (features.has('white-label') && features.has('sso-integration')) {
      return 'enterprise';
    }

    if (features.has('analytics') && features.has('multi-user')) {
      return 'professional';
    }

    return 'basic';
  });

  canAccessPremiumFeatures = computed(() =>
    this.tier() !== 'basic'
  );

  canAccessEnterpriseFeatures = computed(() =>
    this.tier() === 'enterprise'
  );
}
```

---

## Troubleshooting

### Features Not Persisting After Refresh

**Problem**: Forced features reset to natural state after page refresh

**Solution**: Check localStorage is enabled in browser
```typescript
// Test localStorage availability
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (e) {
  console.error('localStorage not available', e);
}
```

### Duplicate Feature IDs Error

**Problem**: Error thrown when calling `setAvailableOptions()`

**Solution**: Ensure all feature IDs are unique
```typescript
// ❌ Wrong - duplicate IDs
const features = [
  { id: 'analytics', name: 'Analytics V1', isEnabled: true, isForced: false },
  { id: 'analytics', name: 'Analytics V2', isEnabled: true, isForced: false }
];

// ✅ Correct - unique IDs
const features = [
  { id: 'analytics-v1', name: 'Analytics V1', isEnabled: true, isForced: false },
  { id: 'analytics-v2', name: 'Analytics V2', isEnabled: true, isForced: false }
];
```

### Forced Values Not Emitting

**Problem**: `getForcedValues()` subscription not firing

**Solution**: Ensure features configured before forcing
```typescript
// ❌ Wrong order
getForcedValues().subscribe(...); // Subscribes before features configured
setAvailableOptions([...]); // Configured after subscription

// ✅ Correct order
setAvailableOptions([...]); // Configure first
getForcedValues().subscribe(...); // Then subscribe
// Or use constructor for subscription (recommended)
```

### Invalid Feature IDs in localStorage

**Problem**: Console warnings about removed feature IDs

**Solution**: This is normal - service auto-cleans stale IDs
```
Warning: Removed invalid feature IDs from forced state: old-feature
```
This happens when feature IDs change between app versions. The service automatically removes invalid IDs and persists cleaned state.

---

## Next Steps

- **Configure features** for your product tiers
- **Test tier upgrades/downgrades** with forced overrides
- **Add conditional rendering** based on feature availability
- **Create preset configurations** for common test scenarios
- **Share configs** with team via exported JSON files

---

## See Also

- [Public API Documentation](./contracts/public-api.md) - Complete API reference
- [Data Model](./data-model.md) - Type definitions and validation rules
- [Preset Integration](./contracts/preset-api.md) - Saving and loading configurations
