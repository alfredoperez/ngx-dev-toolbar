# Internal API Contract: DevToolbarInternalAppFeaturesService

**Feature**: App Features Tool | **Branch**: `002-app-features-tool` | **Date**: 2025-10-12

## Overview

This document defines the internal API contract for `DevToolbarInternalAppFeaturesService`, which manages state, localStorage persistence, and reactive data flows for the App Features Tool. This service is NOT exposed in the public API and is used exclusively by `DevToolbarAppFeaturesService` and `DevToolbarAppFeaturesToolComponent`.

## Service Declaration

```typescript
import { Injectable, Signal, computed, signal } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DevToolsStorageService } from '../../../utils/storage.service';
import { DevToolbarAppFeature, ForcedAppFeaturesState } from './app-features.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarInternalAppFeaturesService {
  private readonly STORAGE_KEY = 'app-features';

  // Internal state management (documented below)
}
```

**File Location**: `/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-internal.service.ts`

---

## State Architecture

### Private State

```typescript
/**
 * App features configured via setAvailableOptions()
 * Source of truth for available features before forced overrides applied
 */
private appFeaturesSubject = new BehaviorSubject<DevToolbarAppFeature[]>([]);
private appFeatures$ = this.appFeaturesSubject.asObservable();

/**
 * Forced feature state from localStorage/UI interactions
 * Contains only feature IDs forced to enabled/disabled
 */
private forcedFeaturesSubject = new BehaviorSubject<ForcedAppFeaturesState>({
  enabled: [],
  disabled: []
});
private forcedFeatures$ = this.forcedFeaturesSubject.asObservable();

/**
 * Combined features stream with forced overrides applied
 * Merges appFeatures$ with forcedFeatures$ to compute isEnabled and isForced
 */
private features$ = combineLatest([
  this.appFeatures$,
  this.forcedFeatures$
]).pipe(
  map(([appFeatures, forcedState]) => this.mergeForcedState(appFeatures, forcedState))
);
```

### Public State

```typescript
/**
 * Reactive signal of all features with forced state applied
 * Used by component for UI rendering with computed filters
 */
public features: Signal<DevToolbarAppFeature[]> = toSignal(this.features$, {
  initialValue: []
});
```

**State Flow Diagram**:
```
setAvailableOptions([...])
         ↓
  appFeaturesSubject.next([...])
         ↓
  appFeatures$ emits
         ↓
  combineLatest with forcedFeatures$
         ↓
  mergeForcedState() applies overrides
         ↓
  features$ emits merged result
         ↓
  toSignal() converts to signal
         ↓
  Component reads features() signal
         ↓
  computed() applies search/filter
         ↓
  UI renders filtered features
```

---

## Core Methods

### setAppFeatures()

Set available app features (called by public service). Replaces current features and reconciles with forced state.

**Signature**:
```typescript
setAppFeatures(features: DevToolbarAppFeature[]): void
```

**Parameters**:
- `features`: Array of configured features with natural state

**Behavior**:
1. Validates feature IDs for uniqueness (throws if duplicates found)
2. Validates feature names are not empty (logs warning if empty)
3. Trims whitespace from feature names
4. Emits features to `appFeaturesSubject`
5. Triggers `combineLatest` recombination with `forcedFeaturesSubject`
6. Calls `validateAndCleanForcedState()` to remove invalid forced IDs
7. Returns merged features via `features$` observable

**Implementation**:
```typescript
setAppFeatures(features: DevToolbarAppFeature[]): void {
  // Validate unique IDs
  const ids = features.map(f => f.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate feature IDs detected: ${duplicates.join(', ')}`);
  }

  // Validate non-empty IDs
  const emptyIds = features.filter(f => !f.id || f.id.trim() === '');
  if (emptyIds.length > 0) {
    throw new Error('Feature ID cannot be empty');
  }

  // Validate and clean names
  const cleanedFeatures = features.map(f => ({
    ...f,
    name: f.name.trim()
  }));

  cleanedFeatures.forEach(f => {
    if (!f.name) {
      console.warn(`Feature '${f.id}' has empty name`);
    }
  });

  // Emit cleaned features
  this.appFeaturesSubject.next(cleanedFeatures);

  // Clean invalid forced state
  this.validateAndCleanForcedState();
}
```

**Usage** (by public service):
```typescript
// DevToolbarAppFeaturesService delegates to internal service
setAvailableOptions(features: DevToolbarAppFeature[]): void {
  this.internalService.setAppFeatures(features);
}
```

---

### getAppFeatures()

Get observable of available features (for public service).

**Signature**:
```typescript
getAppFeatures(): Observable<DevToolbarAppFeature[]>
```

**Returns**:
- `Observable<DevToolbarAppFeature[]>`: Stream of configured features without forced overrides applied

**Behavior**:
- Returns raw `appFeatures$` observable (before merge with forced state)
- Used by public service for internal operations
- Does NOT include forced state (use `getForcedFeatures()` for that)

**Usage**:
```typescript
// Internal use only - typically not needed by public service
getAppFeatures().subscribe(features => {
  console.log('Configured features:', features);
});
```

---

### getForcedFeatures()

Get observable of forced features (for public service).

**Signature**:
```typescript
getForcedFeatures(): Observable<DevToolbarAppFeature[]>
```

**Returns**:
- `Observable<DevToolbarAppFeature[]>`: Stream of features with forced overrides applied
  - Only includes features where `isForced === true`
  - `isEnabled` reflects forced state (not natural state)

**Behavior**:
1. Subscribes to `features$` (merged app features + forced state)
2. Filters to features where `isForced === true`
3. Emits filtered array whenever forced state changes

**Implementation**:
```typescript
getForcedFeatures(): Observable<DevToolbarAppFeature[]> {
  return this.features$.pipe(
    map(features => features.filter(f => f.isForced))
  );
}
```

**Usage** (by public service):
```typescript
// DevToolbarAppFeaturesService exposes this as getForcedValues()
getForcedValues(): Observable<DevToolbarAppFeature[]> {
  return this.internalService.getForcedFeatures();
}
```

---

### setFeature()

Force a feature to enabled or disabled state. Persists to localStorage immediately.

**Signature**:
```typescript
setFeature(featureId: string, isEnabled: boolean): void
```

**Parameters**:
- `featureId`: ID of feature to force (must exist in configured features)
- `isEnabled`: Forced state (true = force enabled, false = force disabled)

**Behavior**:
1. Gets current forced state from `forcedFeaturesSubject`
2. Removes `featureId` from opposite array (if present)
3. Adds `featureId` to target array (enabled or disabled)
4. Emits updated forced state to `forcedFeaturesSubject`
5. Persists updated state to localStorage via `storageService`
6. Triggers `features$` recombination and emission

**Implementation**:
```typescript
setFeature(featureId: string, isEnabled: boolean): void {
  const currentState = this.forcedFeaturesSubject.value;

  // Remove from opposite array
  const newState: ForcedAppFeaturesState = {
    enabled: currentState.enabled.filter(id => id !== featureId),
    disabled: currentState.disabled.filter(id => id !== featureId)
  };

  // Add to target array
  if (isEnabled) {
    newState.enabled.push(featureId);
  } else {
    newState.disabled.push(featureId);
  }

  // Emit and persist
  this.forcedFeaturesSubject.next(newState);
  this.saveForcedFeatures(newState);
}
```

**Usage** (by component):
```typescript
// User changes dropdown to "Enabled"
onFeatureChange(featureId: string, value: 'on' | 'off' | ''): void {
  if (value === 'on') {
    this.internalService.setFeature(featureId, true);
  } else if (value === 'off') {
    this.internalService.setFeature(featureId, false);
  } else {
    this.internalService.removeFeatureOverride(featureId);
  }
}
```

**Edge Cases**:
```typescript
// Forcing same state twice is idempotent
setFeature('analytics', true);
setFeature('analytics', true); // No-op, already in enabled array

// Switching forced state moves between arrays
setFeature('analytics', true);  // enabled: ['analytics'], disabled: []
setFeature('analytics', false); // enabled: [], disabled: ['analytics']
```

---

### removeFeatureOverride()

Remove forced override, return feature to natural state. Updates localStorage immediately.

**Signature**:
```typescript
removeFeatureOverride(featureId: string): void
```

**Parameters**:
- `featureId`: ID of feature to restore to natural state

**Behavior**:
1. Gets current forced state from `forcedFeaturesSubject`
2. Removes `featureId` from both `enabled` and `disabled` arrays
3. Emits updated forced state to `forcedFeaturesSubject`
4. Persists updated state to localStorage
5. Triggers `features$` recombination with natural `isEnabled` value restored

**Implementation**:
```typescript
removeFeatureOverride(featureId: string): void {
  const currentState = this.forcedFeaturesSubject.value;

  const newState: ForcedAppFeaturesState = {
    enabled: currentState.enabled.filter(id => id !== featureId),
    disabled: currentState.disabled.filter(id => id !== featureId)
  };

  // Only emit and persist if state actually changed
  if (
    currentState.enabled.includes(featureId) ||
    currentState.disabled.includes(featureId)
  ) {
    this.forcedFeaturesSubject.next(newState);
    this.saveForcedFeatures(newState);
  }
}
```

**Usage** (by component):
```typescript
// User changes dropdown to "Not Forced"
onFeatureChange(featureId: string, value: 'on' | 'off' | ''): void {
  if (value === '') {
    this.internalService.removeFeatureOverride(featureId);
  }
}
```

**State Transition**:
```typescript
// Before: Feature forced enabled
features(); // [{ id: 'analytics', isEnabled: true, isForced: true }]

// User selects "Not Forced"
removeFeatureOverride('analytics');

// After: Feature returns to natural state
features(); // [{ id: 'analytics', isEnabled: false, isForced: false }]
// (assuming natural state was disabled)
```

---

### applyForcedState()

Apply preset state (batch operation). Overwrites current forced state, persists to localStorage.

**Signature**:
```typescript
applyForcedState(state: ForcedAppFeaturesState): void
```

**Parameters**:
- `state`: Preset forced state with enabled/disabled feature IDs

**Behavior**:
1. Validates all feature IDs exist in configured features
2. Removes invalid IDs with console warning
3. Emits cleaned state to `forcedFeaturesSubject` (overwrites current)
4. Persists state to localStorage
5. Triggers `features$` recombination with new forced state

**Implementation**:
```typescript
applyForcedState(state: ForcedAppFeaturesState): void {
  const configuredIds = this.appFeaturesSubject.value.map(f => f.id);

  // Validate and filter IDs
  const validEnabled = state.enabled.filter(id => {
    const valid = configuredIds.includes(id);
    if (!valid) {
      console.warn(`Invalid feature ID in preset enabled: ${id}`);
    }
    return valid;
  });

  const validDisabled = state.disabled.filter(id => {
    const valid = configuredIds.includes(id);
    if (!valid) {
      console.warn(`Invalid feature ID in preset disabled: ${id}`);
    }
    return valid;
  });

  const cleanedState: ForcedAppFeaturesState = {
    enabled: validEnabled,
    disabled: validDisabled
  };

  // Emit and persist
  this.forcedFeaturesSubject.next(cleanedState);
  this.saveForcedFeatures(cleanedState);
}
```

**Usage** (by public service):
```typescript
// Preset tool loads "Enterprise Tier" configuration
applyPresetFeatures(state: ForcedAppFeaturesState): void {
  this.internalService.applyForcedState(state);
}
```

**Example**:
```typescript
// Apply enterprise tier preset (all features enabled)
applyForcedState({
  enabled: ['analytics', 'multi-user', 'white-label', 'sso-integration'],
  disabled: []
});

// Apply basic tier preset (premium features disabled)
applyForcedState({
  enabled: [],
  disabled: ['analytics', 'multi-user', 'white-label', 'sso-integration']
});
```

---

### getCurrentForcedState()

Get current forced state for preset saving.

**Signature**:
```typescript
getCurrentForcedState(): ForcedAppFeaturesState
```

**Returns**:
- `ForcedAppFeaturesState`: Snapshot of current forced state
  - Defensive copy (safe to mutate)

**Implementation**:
```typescript
getCurrentForcedState(): ForcedAppFeaturesState {
  const state = this.forcedFeaturesSubject.value;
  return {
    enabled: [...state.enabled],
    disabled: [...state.disabled]
  };
}
```

**Usage** (by public service):
```typescript
// Preset tool saves current configuration
getCurrentForcedState(): ForcedAppFeaturesState {
  return this.internalService.getCurrentForcedState();
}
```

---

## Private Methods

### loadForcedFeatures()

Load forced state from localStorage (called in constructor). Validates feature IDs against configured features.

**Signature**:
```typescript
private loadForcedFeatures(): void
```

**Behavior**:
1. Reads `STORAGE_KEY` from localStorage via `storageService`
2. Parses JSON to `ForcedAppFeaturesState`
3. Handles parse errors gracefully (returns empty state)
4. Emits loaded state to `forcedFeaturesSubject`
5. Defers validation to `validateAndCleanForcedState()` (called after features configured)

**Implementation**:
```typescript
private loadForcedFeatures(): void {
  try {
    const stored = this.storageService.get<ForcedAppFeaturesState>(this.STORAGE_KEY);
    if (stored) {
      // Emit loaded state (validation happens later)
      this.forcedFeaturesSubject.next(stored);
    }
  } catch (error) {
    console.error('Failed to load forced app features from localStorage', error);
    // Continue with empty state
  }
}
```

**Called in constructor**:
```typescript
constructor(private storageService: DevToolsStorageService) {
  this.loadForcedFeatures();
}
```

---

### saveForcedFeatures()

Persist forced state to localStorage with error handling.

**Signature**:
```typescript
private saveForcedFeatures(state: ForcedAppFeaturesState): void
```

**Parameters**:
- `state`: Forced state to persist

**Behavior**:
1. Serializes state to JSON
2. Persists to `STORAGE_KEY` via `storageService`
3. Catches `QuotaExceededError` and logs error
4. Does NOT throw (graceful degradation)

**Implementation**:
```typescript
private saveForcedFeatures(state: ForcedAppFeaturesState): void {
  try {
    this.storageService.set(this.STORAGE_KEY, state);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('Failed to persist app features: localStorage quota exceeded', error);
    } else {
      console.error('Failed to persist app features to localStorage', error);
    }
  }
}
```

---

### validateAndCleanForcedState()

Validate and clean forced state (remove invalid feature IDs). Logs warnings for removed IDs.

**Signature**:
```typescript
private validateAndCleanForcedState(): void
```

**Behavior**:
1. Gets configured feature IDs from `appFeaturesSubject`
2. Gets current forced state from `forcedFeaturesSubject`
3. Filters out invalid IDs from `enabled` array
4. Filters out invalid IDs from `disabled` array
5. Logs warning if any IDs removed
6. Emits cleaned state to `forcedFeaturesSubject`
7. Persists cleaned state to localStorage

**Implementation**:
```typescript
private validateAndCleanForcedState(): void {
  const configuredIds = this.appFeaturesSubject.value.map(f => f.id);
  const currentState = this.forcedFeaturesSubject.value;

  const invalidEnabled = currentState.enabled.filter(id => !configuredIds.includes(id));
  const invalidDisabled = currentState.disabled.filter(id => !configuredIds.includes(id));

  if (invalidEnabled.length > 0 || invalidDisabled.length > 0) {
    const invalidIds = [...invalidEnabled, ...invalidDisabled];
    console.warn(`Removed invalid feature IDs from forced state: ${invalidIds.join(', ')}`);

    const cleanedState: ForcedAppFeaturesState = {
      enabled: currentState.enabled.filter(id => configuredIds.includes(id)),
      disabled: currentState.disabled.filter(id => configuredIds.includes(id))
    };

    this.forcedFeaturesSubject.next(cleanedState);
    this.saveForcedFeatures(cleanedState);
  }
}
```

**Called**:
- After `setAppFeatures()` to reconcile forced state with new configuration
- Ensures localStorage never contains stale feature IDs

**Example Scenario**:
```typescript
// App version 1.0 has 'analytics' feature
setAppFeatures([
  { id: 'analytics', name: 'Analytics', isEnabled: false, isForced: false }
]);

// Developer forces analytics enabled
setFeature('analytics', true);
// localStorage: { enabled: ['analytics'], disabled: [] }

// App version 2.0 removes 'analytics' feature
setAppFeatures([
  { id: 'dashboard', name: 'Dashboard', isEnabled: true, isForced: false }
]);
// Validation runs automatically:
// Warning: Removed invalid feature IDs from forced state: analytics
// localStorage: { enabled: [], disabled: [] }
```

---

### mergeForcedState()

Merge app features with forced state to compute final isEnabled and isForced values.

**Signature**:
```typescript
private mergeForcedState(
  appFeatures: DevToolbarAppFeature[],
  forcedState: ForcedAppFeaturesState
): DevToolbarAppFeature[]
```

**Parameters**:
- `appFeatures`: Configured features with natural state
- `forcedState`: Forced overrides from localStorage/UI

**Returns**:
- `DevToolbarAppFeature[]`: Merged features with forced state applied

**Logic**:
```typescript
private mergeForcedState(
  appFeatures: DevToolbarAppFeature[],
  forcedState: ForcedAppFeaturesState
): DevToolbarAppFeature[] {
  return appFeatures.map(feature => {
    const forcedEnabled = forcedState.enabled.includes(feature.id);
    const forcedDisabled = forcedState.disabled.includes(feature.id);

    if (forcedEnabled) {
      return { ...feature, isEnabled: true, isForced: true };
    } else if (forcedDisabled) {
      return { ...feature, isEnabled: false, isForced: true };
    } else {
      return { ...feature, isForced: false };
    }
  });
}
```

**Truth Table**:
| Natural isEnabled | In forced.enabled | In forced.disabled | Result isEnabled | Result isForced |
|-------------------|-------------------|---------------------|------------------|-----------------|
| false             | false             | false               | false            | false           |
| true              | false             | false               | true             | false           |
| false             | true              | false               | true             | true            |
| true              | true              | false               | true             | true            |
| false             | false             | true                | false            | true            |
| true              | false             | true                | false            | true            |

---

## Service Initialization

```typescript
constructor(private storageService: DevToolsStorageService) {
  // Load forced state from localStorage on initialization
  this.loadForcedFeatures();

  // Validation happens later when setAppFeatures() is called
}
```

**Initialization Flow**:
1. Service instantiated (providedIn: 'root')
2. Constructor loads forced state from localStorage
3. `forcedFeaturesSubject` emits loaded state
4. App component calls `setAvailableOptions()` → `setAppFeatures()`
5. `validateAndCleanForcedState()` reconciles forced state with configured features
6. Component reads `features()` signal for UI rendering

---

## Testing Contract

**Unit test requirements**:

```typescript
describe('DevToolbarInternalAppFeaturesService', () => {
  it('should merge forced state with app features', () => {
    service.setAppFeatures([
      { id: 'test', name: 'Test', isEnabled: false, isForced: false }
    ]);
    service.setFeature('test', true);

    expect(service.features()).toEqual([
      { id: 'test', name: 'Test', isEnabled: true, isForced: true }
    ]);
  });

  it('should persist forced state to localStorage', () => {
    service.setFeature('test', true);

    const stored = storageService.get<ForcedAppFeaturesState>('app-features');
    expect(stored.enabled).toContain('test');
  });

  it('should clean invalid forced IDs on setAppFeatures', () => {
    // Force non-existent feature
    service.applyForcedState({ enabled: ['invalid'], disabled: [] });

    // Configure features (should clean forced state)
    service.setAppFeatures([
      { id: 'valid', name: 'Valid', isEnabled: true, isForced: false }
    ]);

    const state = service.getCurrentForcedState();
    expect(state.enabled).not.toContain('invalid');
  });

  it('should emit forced features only', (done) => {
    service.setAppFeatures([
      { id: 'forced', name: 'Forced', isEnabled: false, isForced: false },
      { id: 'natural', name: 'Natural', isEnabled: true, isForced: false }
    ]);
    service.setFeature('forced', true);

    service.getForcedFeatures().subscribe(forced => {
      expect(forced.length).toBe(1);
      expect(forced[0].id).toBe('forced');
      done();
    });
  });
});
```

---

## See Also

- [Public API Contract](./public-api.md) - Public service interface
- [Preset API Contract](./preset-api.md) - Preset integration methods
- [Data Model](../data-model.md) - Type definitions and state management
