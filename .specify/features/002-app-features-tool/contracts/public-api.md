# Public API Contract: DevToolbarAppFeaturesService

**Feature**: App Features Tool | **Branch**: `002-app-features-tool` | **Date**: 2025-10-12

## Overview

This document defines the public API contract for `DevToolbarAppFeaturesService`, which implements the `DevToolsService<DevToolbarAppFeature>` interface. This service provides the public-facing API for configuring and observing app feature overrides in consuming applications.

## Service Declaration

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DevToolsService } from '../../models/dev-tools.interface';
import { DevToolbarAppFeature, ForcedAppFeaturesState } from './app-features.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarAppFeaturesService implements DevToolsService<DevToolbarAppFeature> {
  // Public API methods documented below
}
```

**File Location**: `/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features.service.ts`

---

## Core API Methods

### setAvailableOptions()

Configure the available app features displayed in the toolbar. Replaces any previously configured features.

**Signature**:
```typescript
setAvailableOptions(features: DevToolbarAppFeature[]): void
```

**Parameters**:
- `features`: Array of app features with their current state
  - Each feature must have unique `id` property
  - `name` property must not be empty string
  - `description` property is optional
  - `isEnabled` reflects current natural state (before toolbar override)
  - `isForced` should be `false` when initially configuring features

**Behavior**:
- Validates feature IDs for uniqueness
- Throws `Error` if duplicate IDs detected
- Trims whitespace from feature names
- Logs warning if empty feature names detected
- Merges features with current forced state from localStorage
- Triggers `getForcedValues()` emission if forced features exist

**Side Effects**:
- Updates internal features state
- Triggers UI re-render if toolbar is open
- Reconciles forced state with new feature configuration
- Cleans invalid forced feature IDs from localStorage

**Example**:
```typescript
import { inject, Component, OnInit } from '@angular/core';
import { DevToolbarAppFeaturesService, DevToolbarAppFeature } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  // ...
})
export class AppComponent implements OnInit {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private currentTier = 'professional'; // From license service

  ngOnInit(): void {
    const features: DevToolbarAppFeature[] = [
      {
        id: 'analytics',
        name: 'Analytics Dashboard',
        description: 'Advanced reporting and data visualization',
        isEnabled: this.currentTier === 'professional' || this.currentTier === 'enterprise',
        isForced: false
      },
      {
        id: 'multi-user',
        name: 'Multi-User Support',
        description: 'Collaborate with team members',
        isEnabled: this.currentTier === 'professional' || this.currentTier === 'enterprise',
        isForced: false
      },
      {
        id: 'white-label',
        name: 'White Label Branding',
        description: 'Custom branding and theming',
        isEnabled: this.currentTier === 'enterprise',
        isForced: false
      },
      {
        id: 'sso-integration',
        name: 'SSO Integration',
        description: 'Single sign-on with SAML/OAuth',
        isEnabled: this.currentTier === 'enterprise',
        isForced: false
      }
    ];

    this.appFeaturesService.setAvailableOptions(features);
  }
}
```

**Error Scenarios**:
```typescript
// ❌ Duplicate IDs - throws Error
appFeaturesService.setAvailableOptions([
  { id: 'analytics', name: 'Analytics', isEnabled: true, isForced: false },
  { id: 'analytics', name: 'Analytics V2', isEnabled: true, isForced: false }
]);
// Error: Duplicate feature IDs detected: analytics

// ❌ Empty ID - throws Error
appFeaturesService.setAvailableOptions([
  { id: '', name: 'Invalid Feature', isEnabled: true, isForced: false }
]);
// Error: Feature ID cannot be empty

// ⚠️ Empty name - logs warning but continues
appFeaturesService.setAvailableOptions([
  { id: 'feature-1', name: '', isEnabled: true, isForced: false }
]);
// Warning: Feature 'feature-1' has empty name
```

---

### getForcedValues()

Observe features forced through the toolbar. Emits whenever a feature is enabled, disabled, or unforced via the toolbar UI.

**Signature**:
```typescript
getForcedValues(): Observable<DevToolbarAppFeature[]>
```

**Returns**:
- `Observable<DevToolbarAppFeature[]>`: Stream of forced features
  - Emits immediately with current forced state (empty array if none)
  - Emits when feature forced to enabled via UI
  - Emits when feature forced to disabled via UI
  - Emits when feature override removed (feature removed from array)
  - Emits after `setAvailableOptions()` reconciles forced state

**Emitted Feature Properties**:
- `id`: Feature identifier matching configured feature
- `name`: Display name from configuration
- `description`: Optional description from configuration
- `isEnabled`: Forced enabled state (true = forced on, false = forced off)
- `isForced`: Always `true` (only forced features emitted)

**Behavior**:
- First emission contains all currently forced features (may be empty array)
- Subsequent emissions reflect real-time changes from toolbar UI
- Features removed from forced state are removed from emitted array
- Features not forced (natural state) are NOT included in emitted array
- Observable never completes (hot observable)

**Use Cases**:
1. **Apply forced features to app state** (most common)
2. **Sync forced features with backend testing API**
3. **Log feature changes for debugging**
4. **Display forced feature indicators in app UI**

**Example**:
```typescript
import { inject, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  // ...
})
export class AppComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private featureManager = inject(FeatureManagerService);

  constructor() {
    // Subscribe to forced feature changes
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedFeatures => {
        console.log('Forced features changed:', forcedFeatures);

        // Apply forced features to app state
        forcedFeatures.forEach(feature => {
          if (feature.isEnabled) {
            this.featureManager.enableFeature(feature.id);
          } else {
            this.featureManager.disableFeature(feature.id);
          }
        });

        // Optionally: Show notification to developer
        if (forcedFeatures.length > 0) {
          console.info(`🔧 ${forcedFeatures.length} features forced via dev toolbar`);
        }
      });
  }
}
```

**Advanced Example - Conditional UI Rendering**:
```typescript
import { inject, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-dashboard',
  template: `
    @if (isFeatureEnabled('analytics')) {
      <app-analytics-dashboard />
    }
    @if (isFeatureEnabled('white-label')) {
      <app-branding-customizer />
    }
    @if (!isFeatureEnabled('multi-user')) {
      <div class="upgrade-banner">
        Upgrade to Professional for team collaboration
      </div>
    }
  `
})
export class DashboardComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  // Track enabled features in signal
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

**Edge Cases**:
```typescript
// Empty array emission (no forced features)
getForcedValues().subscribe(features => {
  if (features.length === 0) {
    console.log('All features in natural state');
  }
});

// Feature forced off but still appears in array
getForcedValues().subscribe(features => {
  features.forEach(feature => {
    if (!feature.isEnabled) {
      console.log(`Feature ${feature.id} is forced OFF`);
      // Ensure feature is disabled in app
    }
  });
});

// Forced feature removed (natural state restored)
// Before: [{ id: 'analytics', isEnabled: true, isForced: true }]
// After:  [] (feature removed from forced array)
```

---

## Preset Integration Methods

### applyPresetFeatures()

Apply preset feature configuration for preset tool integration. Overwrites current forced state with provided configuration.

**Signature**:
```typescript
applyPresetFeatures(state: ForcedAppFeaturesState): void
```

**Parameters**:
- `state`: Forced feature state to apply
  - `state.enabled`: Array of feature IDs to force enabled
  - `state.disabled`: Array of feature IDs to force disabled
  - Feature IDs validated against configured features

**Behavior**:
- Validates all feature IDs exist in configured features
- Removes invalid IDs with console warning
- Overwrites current forced state (not merged)
- Persists state to localStorage immediately
- Triggers `getForcedValues()` emission with new forced features

**Use Case**:
- Preset tool loads saved preset and applies feature configuration
- Automated testing scripts restore known feature states
- QA engineers switch between test scenarios (tiers, environments)

**Example**:
```typescript
import { inject } from '@angular/core';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

// Preset tool calls this when loading "Enterprise Tier" preset
class PresetService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  loadPreset(presetName: string): void {
    const presets = {
      'Basic Tier': {
        enabled: [],
        disabled: ['analytics', 'multi-user', 'white-label', 'sso-integration']
      },
      'Professional Tier': {
        enabled: ['analytics', 'multi-user'],
        disabled: ['white-label', 'sso-integration']
      },
      'Enterprise Tier': {
        enabled: ['analytics', 'multi-user', 'white-label', 'sso-integration'],
        disabled: []
      }
    };

    const state = presets[presetName];
    if (state) {
      this.appFeaturesService.applyPresetFeatures(state);
      console.log(`Applied preset: ${presetName}`);
    }
  }
}
```

**Validation Example**:
```typescript
// Invalid feature IDs are removed with warning
appFeaturesService.applyPresetFeatures({
  enabled: ['analytics', 'invalid-feature', 'multi-user'],
  disabled: ['non-existent-feature']
});
// Warning: Removed invalid feature IDs from forced state: invalid-feature, non-existent-feature
// Result: Only 'analytics' and 'multi-user' are forced enabled
```

---

### getCurrentForcedState()

Get current forced feature state for preset saving.

**Signature**:
```typescript
getCurrentForcedState(): ForcedAppFeaturesState
```

**Returns**:
- `ForcedAppFeaturesState`: Current forced state
  - `enabled`: Array of feature IDs currently forced enabled
  - `disabled`: Array of feature IDs currently forced disabled
  - Empty arrays if no features forced

**Behavior**:
- Returns snapshot of current forced state (not reactive)
- Does NOT include features in natural state (only forced overrides)
- Safe to mutate returned object (defensive copy)

**Use Case**:
- Preset tool captures current configuration for saving
- Export feature configuration to JSON file
- Compare forced state before/after test scenarios

**Example**:
```typescript
import { inject } from '@angular/core';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

class PresetService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  saveCurrentPreset(presetName: string): void {
    const currentState = this.appFeaturesService.getCurrentForcedState();

    const preset = {
      name: presetName,
      timestamp: Date.now(),
      appFeatures: currentState,
      // Other tool states...
    };

    localStorage.setItem(`preset-${presetName}`, JSON.stringify(preset));
    console.log(`Saved preset: ${presetName}`, currentState);
  }

  compareStates(): void {
    const before = this.appFeaturesService.getCurrentForcedState();

    // Developer makes changes in toolbar UI...

    const after = this.appFeaturesService.getCurrentForcedState();

    console.log('Features changed:', {
      addedEnabled: after.enabled.filter(id => !before.enabled.includes(id)),
      addedDisabled: after.disabled.filter(id => !before.disabled.includes(id)),
      removed: [
        ...before.enabled.filter(id => !after.enabled.includes(id)),
        ...before.disabled.filter(id => !after.disabled.includes(id))
      ]
    });
  }
}
```

**Return Value Examples**:
```typescript
// No forced features (all natural state)
getCurrentForcedState();
// Returns: { enabled: [], disabled: [] }

// Some features forced
getCurrentForcedState();
// Returns: {
//   enabled: ['analytics', 'multi-user'],
//   disabled: ['white-label']
// }

// Export to JSON
const state = getCurrentForcedState();
const json = JSON.stringify(state, null, 2);
// {
//   "enabled": ["analytics"],
//   "disabled": ["white-label"]
// }
```

---

## API Contract Summary

| Method | Purpose | Timing | Side Effects |
|--------|---------|--------|--------------|
| `setAvailableOptions()` | Configure features | App initialization | Updates UI, reconciles forced state, cleans localStorage |
| `getForcedValues()` | Observe forced features | Subscribe in constructor | None (read-only observable) |
| `applyPresetFeatures()` | Load preset state | Preset tool command | Overwrites forced state, updates localStorage, emits |
| `getCurrentForcedState()` | Capture forced state | Preset save command | None (read-only snapshot) |

---

## Integration Pattern

**Complete integration example**:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DevToolbarAppFeaturesService,
  DevToolbarAppFeature
} from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: `
    <ndt-toolbar />
    <router-outlet />
  `
})
export class AppComponent implements OnInit {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);
  private licenseService = inject(LicenseService);

  constructor() {
    // Step 2: Subscribe to forced values (with automatic cleanup)
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedFeatures => {
        // Apply forced features to app state
        this.applyForcedFeatures(forcedFeatures);
      });
  }

  ngOnInit(): void {
    // Step 1: Configure available features
    const currentTier = this.licenseService.getCurrentTier();
    const features = this.buildFeatureList(currentTier);
    this.appFeaturesService.setAvailableOptions(features);
  }

  private buildFeatureList(tier: string): DevToolbarAppFeature[] {
    const tierFeatures = {
      basic: ['core-features'],
      professional: ['core-features', 'analytics', 'multi-user'],
      enterprise: ['core-features', 'analytics', 'multi-user', 'white-label', 'sso-integration']
    };

    const featureDefinitions = {
      'core-features': { name: 'Core Features', description: 'Essential functionality' },
      'analytics': { name: 'Analytics Dashboard', description: 'Advanced reporting' },
      'multi-user': { name: 'Multi-User Support', description: 'Team collaboration' },
      'white-label': { name: 'White Label Branding', description: 'Custom branding' },
      'sso-integration': { name: 'SSO Integration', description: 'Single sign-on' }
    };

    const enabledFeatures = tierFeatures[tier] || [];

    return Object.entries(featureDefinitions).map(([id, def]) => ({
      id,
      name: def.name,
      description: def.description,
      isEnabled: enabledFeatures.includes(id),
      isForced: false
    }));
  }

  private applyForcedFeatures(forcedFeatures: DevToolbarAppFeature[]): void {
    forcedFeatures.forEach(feature => {
      if (feature.isEnabled) {
        console.log(`Enabling feature: ${feature.name}`);
        this.enableFeature(feature.id);
      } else {
        console.log(`Disabling feature: ${feature.name}`);
        this.disableFeature(feature.id);
      }
    });
  }

  private enableFeature(featureId: string): void {
    // Update app state to enable feature
  }

  private disableFeature(featureId: string): void {
    // Update app state to disable feature
  }
}
```

---

## Type Safety

All methods maintain strict TypeScript type safety:

```typescript
// ✅ Type-safe configuration
const features: DevToolbarAppFeature[] = [
  { id: 'analytics', name: 'Analytics', isEnabled: true, isForced: false }
];
appFeaturesService.setAvailableOptions(features);

// ✅ Type-safe subscription
appFeaturesService.getForcedValues().subscribe(
  (features: DevToolbarAppFeature[]) => {
    features.forEach(f => console.log(f.name));
  }
);

// ✅ Type-safe preset state
const state: ForcedAppFeaturesState = {
  enabled: ['analytics'],
  disabled: ['white-label']
};
appFeaturesService.applyPresetFeatures(state);

// ❌ Compile error - missing required fields
const invalid: DevToolbarAppFeature = {
  id: 'test'
  // Error: missing name, isEnabled, isForced
};
```

---

## Testing Contract

**Unit test requirements**:

```typescript
describe('DevToolbarAppFeaturesService', () => {
  it('should implement DevToolsService interface', () => {
    expect(service).toBeInstanceOf(DevToolbarAppFeaturesService);
    expect(service.setAvailableOptions).toBeDefined();
    expect(service.getForcedValues).toBeDefined();
  });

  it('should throw error on duplicate feature IDs', () => {
    const features = [
      { id: 'test', name: 'Test', isEnabled: true, isForced: false },
      { id: 'test', name: 'Duplicate', isEnabled: true, isForced: false }
    ];
    expect(() => service.setAvailableOptions(features)).toThrow();
  });

  it('should emit forced features via getForcedValues', (done) => {
    service.setAvailableOptions([
      { id: 'test', name: 'Test', isEnabled: false, isForced: false }
    ]);

    service.getForcedValues().subscribe(forced => {
      expect(forced).toEqual([]);
      done();
    });
  });

  it('should apply preset features without errors', () => {
    service.setAvailableOptions([
      { id: 'test', name: 'Test', isEnabled: false, isForced: false }
    ]);

    expect(() => {
      service.applyPresetFeatures({ enabled: ['test'], disabled: [] });
    }).not.toThrow();
  });

  it('should return current forced state', () => {
    const state = service.getCurrentForcedState();
    expect(state).toEqual({ enabled: [], disabled: [] });
  });
});
```

---

## See Also

- [Internal API Contract](./internal-api.md) - Internal service implementation details
- [Preset API Contract](./preset-api.md) - Preset integration specifications
- [Data Model](../data-model.md) - Type definitions and validation rules
- [Quickstart Guide](../quickstart.md) - Integration examples and demos
