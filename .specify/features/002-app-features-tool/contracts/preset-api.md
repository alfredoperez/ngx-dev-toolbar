# Preset API Contract: App Features Tool Integration

**Feature**: App Features Tool | **Branch**: `002-app-features-tool` | **Date**: 2025-10-12

## Overview

This document defines the preset integration methods for the App Features Tool. These methods enable the future Preset Tool to save and restore app feature configurations as part of complete development environment presets.

## Integration Architecture

### Dependency Flow

```
Preset Tool (future)
      ↓ imports
DevToolbarAppFeaturesService (public)
      ↓ delegates to
DevToolbarInternalAppFeaturesService (internal)
      ↓ persists to
localStorage (AngularDevTools.app-features)
```

**Key Points**:
- One-way dependency: Preset Tool → App Features Tool
- No circular dependencies
- Preset Tool does not exist yet, but API is designed for future integration
- App Features Tool can be tested independently without Preset Tool

---

## Preset State Format

```typescript
/**
 * Preset state for app features
 * Stored as part of complete preset configuration
 */
interface PresetAppFeaturesState {
  /** Array of feature IDs forced to enabled state */
  enabled: string[];

  /** Array of feature IDs forced to disabled state */
  disabled: string[];
}
```

**Complete Preset Format** (future):
```typescript
interface DevelopmentPreset {
  name: string;
  description?: string;
  timestamp: number;

  // Each tool contributes its state
  appFeatures: PresetAppFeaturesState;
  featureFlags?: PresetFeatureFlagsState;
  language?: PresetLanguageState;
  // ... other tools
}
```

---

## Preset Integration Methods

### applyPresetFeatures()

Apply preset feature configuration when preset is loaded. Overwrites current forced state.

**Purpose**: Restore previously saved app feature configuration

**Signature**:
```typescript
applyPresetFeatures(state: ForcedAppFeaturesState): void
```

**Parameters**:
- `state`: Preset feature state with enabled/disabled arrays
  - `state.enabled`: Feature IDs to force enabled
  - `state.disabled`: Feature IDs to force disabled

**Behavior**:
1. Validates all feature IDs exist in current configuration
2. Removes invalid IDs with console warning
3. Overwrites current forced state (not merged)
4. Persists to localStorage
5. Emits `getForcedValues()` with updated features

**Validation Rules**:
- Invalid feature IDs (not in current config) are removed
- Warnings logged for removed IDs
- Empty arrays allowed (no forced features)
- Duplicate IDs deduplicated

**Example - Preset Tool Loading**:
```typescript
import { inject } from '@angular/core';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

class PresetToolService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  /**
   * Load a saved preset and apply to all tools
   */
  loadPreset(presetName: string): void {
    const preset = this.getPresetFromStorage(presetName);

    if (!preset) {
      console.error(`Preset not found: ${presetName}`);
      return;
    }

    // Apply app features state
    if (preset.appFeatures) {
      this.appFeaturesService.applyPresetFeatures(preset.appFeatures);
      console.log(`Applied app features from preset: ${presetName}`);
    }

    // Apply other tool states...
  }

  private getPresetFromStorage(name: string): DevelopmentPreset | null {
    const stored = localStorage.getItem(`dev-preset-${name}`);
    return stored ? JSON.parse(stored) : null;
  }
}
```

**Example - Product Tier Presets**:
```typescript
class PresetToolService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  /**
   * Built-in presets for common scenarios
   */
  private readonly BUILTIN_PRESETS = {
    'Basic Tier': {
      name: 'Basic Tier',
      description: 'Test app with free tier limitations',
      appFeatures: {
        enabled: [],
        disabled: ['analytics', 'multi-user', 'white-label', 'sso-integration']
      }
    },
    'Professional Tier': {
      name: 'Professional Tier',
      description: 'Test app with professional tier features',
      appFeatures: {
        enabled: ['analytics', 'multi-user'],
        disabled: ['white-label', 'sso-integration']
      }
    },
    'Enterprise Tier': {
      name: 'Enterprise Tier',
      description: 'Test app with all features enabled',
      appFeatures: {
        enabled: ['analytics', 'multi-user', 'white-label', 'sso-integration'],
        disabled: []
      }
    }
  };

  loadBuiltinPreset(presetName: keyof typeof this.BUILTIN_PRESETS): void {
    const preset = this.BUILTIN_PRESETS[presetName];
    this.appFeaturesService.applyPresetFeatures(preset.appFeatures);
  }
}
```

**Error Handling**:
```typescript
// Invalid feature IDs are filtered out with warning
appFeaturesService.applyPresetFeatures({
  enabled: ['analytics', 'non-existent-feature', 'multi-user'],
  disabled: ['removed-feature']
});
// Console: Warning: Removed invalid feature IDs from forced state: non-existent-feature, removed-feature
// Result: Only 'analytics' and 'multi-user' forced enabled

// Empty state clears all forced overrides
appFeaturesService.applyPresetFeatures({
  enabled: [],
  disabled: []
});
// All features return to natural state
```

---

### getCurrentForcedState()

Capture current forced feature state for preset saving.

**Purpose**: Save current app feature configuration to preset

**Signature**:
```typescript
getCurrentForcedState(): ForcedAppFeaturesState
```

**Returns**:
- `ForcedAppFeaturesState`: Snapshot of current forced state
  - Contains only forced features (not natural state)
  - Safe to mutate (defensive copy)

**Behavior**:
- Returns snapshot of current forced state
- Does NOT include features in natural state
- Returns empty arrays if no forced features
- Synchronous call (not reactive)

**Example - Preset Tool Saving**:
```typescript
import { inject } from '@angular/core';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

class PresetToolService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  /**
   * Save current toolbar state as a named preset
   */
  saveCurrentPreset(name: string, description?: string): void {
    // Capture state from all tools
    const preset: DevelopmentPreset = {
      name,
      description,
      timestamp: Date.now(),
      appFeatures: this.appFeaturesService.getCurrentForcedState(),
      // featureFlags: this.featureFlagsService.getCurrentForcedState(),
      // language: this.languageService.getCurrentForcedState(),
      // ... other tools
    };

    // Persist to localStorage
    localStorage.setItem(`dev-preset-${name}`, JSON.stringify(preset));
    console.log(`Saved preset: ${name}`, preset);
  }
}
```

**Example - Export to File**:
```typescript
class PresetToolService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  /**
   * Export current preset to JSON file for sharing
   */
  exportPresetToFile(name: string): void {
    const preset = {
      name,
      exportedAt: new Date().toISOString(),
      appFeatures: this.appFeaturesService.getCurrentForcedState(),
      // ... other tools
    };

    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `dev-preset-${name}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
```

**Return Value Examples**:
```typescript
// No forced features
const state = appFeaturesService.getCurrentForcedState();
// Returns: { enabled: [], disabled: [] }

// Some features forced
const state = appFeaturesService.getCurrentForcedState();
// Returns: { enabled: ['analytics'], disabled: ['white-label'] }

// All features in natural state (none forced)
const state = appFeaturesService.getCurrentForcedState();
// Returns: { enabled: [], disabled: [] }
```

---

## Preset Workflow Examples

### Workflow 1: Save and Load Preset

```typescript
class PresetToolService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  // Step 1: Developer configures features via toolbar UI
  // - Forces 'analytics' enabled
  // - Forces 'white-label' disabled

  // Step 2: Save current state as preset
  savePreset(): void {
    const state = this.appFeaturesService.getCurrentForcedState();
    // state = { enabled: ['analytics'], disabled: ['white-label'] }

    const preset = {
      name: 'My Test Config',
      appFeatures: state
    };

    localStorage.setItem('my-preset', JSON.stringify(preset));
  }

  // Step 3: Clear forced state (return to natural state)
  clearForcedState(): void {
    this.appFeaturesService.applyPresetFeatures({
      enabled: [],
      disabled: []
    });
  }

  // Step 4: Restore preset
  loadPreset(): void {
    const stored = localStorage.getItem('my-preset');
    const preset = JSON.parse(stored!);

    this.appFeaturesService.applyPresetFeatures(preset.appFeatures);
    // Features restored to: analytics=enabled, white-label=disabled
  }
}
```

### Workflow 2: Switch Between Product Tiers

```typescript
class PresetToolService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  switchToBasicTier(): void {
    this.appFeaturesService.applyPresetFeatures({
      enabled: [],
      disabled: ['analytics', 'multi-user', 'white-label', 'sso-integration']
    });
    console.log('Switched to Basic tier - all premium features disabled');
  }

  switchToProfessionalTier(): void {
    this.appFeaturesService.applyPresetFeatures({
      enabled: ['analytics', 'multi-user'],
      disabled: ['white-label', 'sso-integration']
    });
    console.log('Switched to Professional tier');
  }

  switchToEnterpriseTier(): void {
    this.appFeaturesService.applyPresetFeatures({
      enabled: ['analytics', 'multi-user', 'white-label', 'sso-integration'],
      disabled: []
    });
    console.log('Switched to Enterprise tier - all features enabled');
  }
}
```

### Workflow 3: Compare Presets

```typescript
class PresetToolService {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  comparePresets(presetA: string, presetB: string): void {
    const a = this.loadPresetByName(presetA);
    const b = this.loadPresetByName(presetB);

    const onlyInA = a.appFeatures.enabled.filter(
      id => !b.appFeatures.enabled.includes(id)
    );
    const onlyInB = b.appFeatures.enabled.filter(
      id => !a.appFeatures.enabled.includes(id)
    );

    console.log('Preset Comparison:', {
      presetA: presetA,
      presetB: presetB,
      onlyInA,
      onlyInB
    });
  }

  private loadPresetByName(name: string): DevelopmentPreset {
    const stored = localStorage.getItem(`dev-preset-${name}`);
    return JSON.parse(stored!);
  }
}
```

---

## Preset Tool UI Integration (Future)

**Expected Preset Tool UI**:
```
┌─────────────────────────────────────────┐
│  Preset Tool                            │
├─────────────────────────────────────────┤
│  Current Preset: [None]           [▼]  │
│                                         │
│  Quick Presets:                         │
│  ┌─────────────────┐                    │
│  │ Basic Tier      │ [Apply]            │
│  │ Professional    │ [Apply]            │
│  │ Enterprise      │ [Apply]            │
│  └─────────────────┘                    │
│                                         │
│  Custom Presets:                        │
│  ┌─────────────────┐                    │
│  │ My Test Config  │ [Load] [Delete]    │
│  │ QA Scenario 1   │ [Load] [Delete]    │
│  └─────────────────┘                    │
│                                         │
│  [Save Current State]  [Export JSON]    │
└─────────────────────────────────────────┘
```

**Expected User Flow**:
1. Developer configures features via App Features Tool
2. Developer clicks "Save Current State" in Preset Tool
3. Preset Tool calls `getCurrentForcedState()` for all tools
4. Preset saved to localStorage with timestamp
5. Developer makes more changes
6. Developer clicks "Load" on saved preset
7. Preset Tool calls `applyPresetFeatures()` for all tools
8. All tools restore to saved state

---

## Testing Preset Integration

**Unit tests** (no Preset Tool required):

```typescript
describe('Preset Integration', () => {
  it('should capture current forced state', () => {
    service.setAvailableOptions([
      { id: 'test', name: 'Test', isEnabled: false, isForced: false }
    ]);

    // Force feature via internal service (simulates toolbar UI)
    internalService.setFeature('test', true);

    // Capture state (simulates preset tool saving)
    const state = service.getCurrentForcedState();
    expect(state.enabled).toEqual(['test']);
    expect(state.disabled).toEqual([]);
  });

  it('should restore preset state', () => {
    service.setAvailableOptions([
      { id: 'test', name: 'Test', isEnabled: false, isForced: false }
    ]);

    // Apply preset state (simulates preset tool loading)
    service.applyPresetFeatures({
      enabled: ['test'],
      disabled: []
    });

    // Verify feature forced enabled
    service.getForcedValues().subscribe(forced => {
      expect(forced).toEqual([
        { id: 'test', name: 'Test', isEnabled: true, isForced: true }
      ]);
    });
  });

  it('should overwrite existing forced state when applying preset', () => {
    service.setAvailableOptions([
      { id: 'feature1', name: 'Feature 1', isEnabled: false, isForced: false },
      { id: 'feature2', name: 'Feature 2', isEnabled: false, isForced: false }
    ]);

    // Force feature1
    internalService.setFeature('feature1', true);

    // Apply preset that forces feature2 (should clear feature1)
    service.applyPresetFeatures({
      enabled: ['feature2'],
      disabled: []
    });

    const state = service.getCurrentForcedState();
    expect(state.enabled).toEqual(['feature2']);
    expect(state.enabled).not.toContain('feature1');
  });
});
```

**E2E tests** (when Preset Tool implemented):

```typescript
describe('Preset Tool - App Features Integration', () => {
  it('should save and load preset with app features', () => {
    // Open app features tool
    page.click('[data-test="tool-app-features"]');

    // Force analytics enabled
    page.selectOption('[data-feature-id="analytics"]', 'on');

    // Open preset tool
    page.click('[data-test="tool-presets"]');

    // Save preset
    page.click('[data-test="save-preset"]');
    page.fill('[data-test="preset-name"]', 'Test Config');
    page.click('[data-test="confirm-save"]');

    // Clear forced state
    page.click('[data-test="tool-app-features"]');
    page.selectOption('[data-feature-id="analytics"]', '');

    // Load preset
    page.click('[data-test="tool-presets"]');
    page.click('[data-test="load-preset-Test Config"]');

    // Verify analytics forced enabled again
    page.click('[data-test="tool-app-features"]');
    expect(page.locator('[data-feature-id="analytics"]').inputValue()).toBe('on');
  });
});
```

---

## API Contract Summary

| Method | Called By | Purpose | Side Effects |
|--------|-----------|---------|--------------|
| `applyPresetFeatures()` | Preset Tool | Load preset | Overwrites forced state, persists localStorage, emits |
| `getCurrentForcedState()` | Preset Tool | Save preset | None (read-only snapshot) |

**Key Guarantees**:
- `applyPresetFeatures()` validates all feature IDs before applying
- `getCurrentForcedState()` returns defensive copy (safe to mutate)
- Methods work independently without Preset Tool existing
- No circular dependencies between tools
- localStorage persistence handled automatically

---

## Migration Path

**Current State** (Phase 1):
- App Features Tool implements preset integration methods
- Methods tested in isolation
- No Preset Tool exists yet

**Future State** (Phase N):
- Preset Tool implemented
- Preset Tool imports `DevToolbarAppFeaturesService`
- Preset Tool calls `applyPresetFeatures()` and `getCurrentForcedState()`
- Full integration tested with E2E tests

**No Breaking Changes Required**:
- API designed for future integration
- Methods are final (no signature changes needed)
- Preset Tool can be implemented without modifying App Features Tool

---

## See Also

- [Public API Contract](./public-api.md) - Complete public service API
- [Internal API Contract](./internal-api.md) - Internal service implementation
- [Quickstart Guide](../quickstart.md) - Integration examples
