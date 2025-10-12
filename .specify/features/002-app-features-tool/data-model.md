# Data Model: App Features Tool

**Feature**: App Features Tool | **Branch**: `002-app-features-tool` | **Date**: 2025-10-12

## Overview

This document defines the data structures and type definitions for the App Features Tool. The model follows the established pattern from feature flags and permissions tools, using simple interfaces with clear separation between application state and forced overrides.

## Core Entities

### DevToolbarAppFeature

Represents a product-level application feature that can be enabled/disabled based on license tier, deployment configuration, or environment flags.

```typescript
export interface DevToolbarAppFeature {
  /**
   * Unique identifier for the feature
   * @example 'advanced-analytics', 'multi-user-support', 'white-label-branding'
   */
  id: string;

  /**
   * Display name shown in the toolbar UI
   * @example 'Advanced Analytics Dashboard', 'Multi-User Support'
   */
  name: string;

  /**
   * Optional description explaining the feature's purpose and capabilities
   * Displayed below the feature name in the UI
   * @example 'Access advanced reporting and data visualization tools'
   */
  description?: string;

  /**
   * Current enabled state of the feature
   * - true: Feature is available to the user (may be natural state or forced)
   * - false: Feature is not available (may be natural state or forced)
   */
  isEnabled: boolean;

  /**
   * Whether the feature state is forced via the dev toolbar
   * - true: State is overridden by developer, ignoring natural application state
   * - false: State reflects the natural application configuration
   */
  isForced: boolean;
}
```

**Field Relationships**:
- `isEnabled` and `isForced` are **independent** - both must be checked to determine actual state
- When `isForced = false`, `isEnabled` reflects the natural state from `setAvailableOptions()`
- When `isForced = true`, `isEnabled` reflects the forced state from the toolbar UI

**Validation Rules**:
- `id` MUST NOT be empty string
- `id` MUST be unique within a feature set (enforced by service)
- `name` MUST NOT be empty string
- `name` whitespace SHOULD be trimmed by service
- `description` MAY be undefined or empty string (treated as no description)

**Examples**:

```typescript
// Feature in natural state (not forced)
const naturalFeature: DevToolbarAppFeature = {
  id: 'analytics',
  name: 'Analytics Dashboard',
  description: 'Advanced reporting and data visualization',
  isEnabled: false,  // Not available in current tier
  isForced: false    // Natural state, not overridden
};

// Feature forced to enabled (testing premium feature on free tier)
const forcedEnabledFeature: DevToolbarAppFeature = {
  id: 'analytics',
  name: 'Analytics Dashboard',
  description: 'Advanced reporting and data visualization',
  isEnabled: true,   // Forced to enabled for testing
  isForced: true     // Overridden by toolbar
};

// Feature forced to disabled (testing downgrade scenario)
const forcedDisabledFeature: DevToolbarAppFeature = {
  id: 'analytics',
  name: 'Analytics Dashboard',
  description: 'Advanced reporting and data visualization',
  isEnabled: false,  // Forced to disabled
  isForced: true     // Overridden by toolbar
};
```

---

### AppFeatureFilter

Type union defining filter options for displaying features in the toolbar UI.

```typescript
export type AppFeatureFilter =
  | 'all'      // Show all configured features
  | 'forced'   // Show only features with isForced = true
  | 'enabled'  // Show only features with isEnabled = true (regardless of forced state)
  | 'disabled'; // Show only features with isEnabled = false (regardless of forced state)
```

**Filter Behavior**:
- `'all'`: No filtering, displays all features from `setAvailableOptions()`
- `'forced'`: Filters to features where `isForced === true` (either enabled or disabled)
- `'enabled'`: Filters to features where `isEnabled === true` (natural or forced)
- `'disabled'`: Filters to features where `isEnabled === false` (natural or forced)

**Use Cases**:
- Developer wants to see only forced overrides: Select "Forced" filter
- QA wants to verify all enabled features work: Select "Enabled" filter
- Product manager wants to see disabled features for upgrade scenarios: Select "Disabled" filter

---

### ForcedAppFeaturesState

Internal storage format for persisted forced feature overrides in localStorage.

```typescript
export interface ForcedAppFeaturesState {
  /**
   * Array of feature IDs forced to enabled state
   * Features in this array will have isEnabled = true regardless of natural state
   * @example ['advanced-analytics', 'white-label-branding']
   */
  enabled: string[];

  /**
   * Array of feature IDs forced to disabled state
   * Features in this array will have isEnabled = false regardless of natural state
   * @example ['basic-support', 'community-forums']
   */
  disabled: string[];
}
```

**Storage Rules**:
- Feature ID MUST NOT appear in both `enabled` and `disabled` arrays simultaneously
- If feature forced to enabled, ID MUST be in `enabled` array and NOT in `disabled` array
- If feature forced to disabled, ID MUST be in `disabled` array and NOT in `enabled` array
- If feature not forced, ID MUST NOT be in either array
- Arrays MAY be empty (no forced features)
- Arrays SHOULD NOT contain duplicate IDs (service validates on load)

**localStorage Key**: `AngularDevTools.app-features`

**Persistence Strategy**:
- Persisted immediately when feature forced via `setFeature()`
- Persisted immediately when feature override removed via `removeFeatureOverride()`
- Loaded on service initialization
- Validated against configured features on load (invalid IDs removed with warning)
- Cleaned automatically if stale IDs detected

**Examples**:

```typescript
// No forced features (clean state)
const emptyState: ForcedAppFeaturesState = {
  enabled: [],
  disabled: []
};

// Testing Enterprise tier (force premium features enabled)
const enterpriseState: ForcedAppFeaturesState = {
  enabled: ['analytics', 'multi-user', 'white-label', 'sso-integration'],
  disabled: []
};

// Testing Basic tier (force premium features disabled)
const basicState: ForcedAppFeaturesState = {
  enabled: [],
  disabled: ['analytics', 'multi-user', 'white-label', 'sso-integration']
};

// Mixed scenario (some enabled, some disabled)
const mixedState: ForcedAppFeaturesState = {
  enabled: ['analytics'],          // Test analytics feature
  disabled: ['white-label']        // Ensure branding is off
};
```

---

## State Transitions

### Feature State Machine

```
Natural State (from setAvailableOptions)
         ↓
    isForced = false
    isEnabled = [original value]
         ↓
    User forces to Enabled via UI
         ↓
    isForced = true
    isEnabled = true
    → Added to ForcedAppFeaturesState.enabled[]
         ↓
    User changes to Disabled via UI
         ↓
    isForced = true
    isEnabled = false
    → Moved from enabled[] to disabled[]
         ↓
    User selects "Not Forced" via UI
         ↓
    isForced = false
    isEnabled = [original value]
    → Removed from both arrays
```

### localStorage Validation on Load

```
1. Load ForcedAppFeaturesState from localStorage
2. Get configured features from setAvailableOptions()
3. Validate each ID in enabled[] exists in configured features
4. Validate each ID in disabled[] exists in configured features
5. Remove invalid IDs from enabled[]
6. Remove invalid IDs from disabled[]
7. If any IDs removed, log warning to console
8. If any IDs removed, persist cleaned state to localStorage
9. Emit cleaned forced features via getForcedValues()
```

---

## Edge Cases

### Duplicate Feature IDs in Configuration

**Scenario**: Developer calls `setAvailableOptions()` with duplicate feature IDs

**Behavior**:
- Service SHOULD detect duplicates during validation
- Service SHOULD log warning: "Duplicate feature IDs detected: [id1, id2]"
- Service SHOULD keep last occurrence, discard earlier ones
- UI displays only deduplicated features

### Feature Removed from Configuration

**Scenario**: Feature ID exists in `ForcedAppFeaturesState` but not in configured features

**Behavior**:
- Detected during `loadForcedFeatures()` on service initialization
- Invalid ID removed from `enabled[]` or `disabled[]` array
- Warning logged: "Removed invalid feature IDs from forced state: [id1, id2]"
- Cleaned state persisted to localStorage
- Feature no longer appears in UI or forced values

### Empty Feature Name

**Scenario**: Developer provides feature with empty `name` property

**Behavior**:
- Service SHOULD log warning: "Feature 'id' has empty name"
- UI displays feature ID as fallback name
- Feature remains functional (can be forced/unforced)

### Missing Description

**Scenario**: Feature has `description: undefined` or no description property

**Behavior**:
- UI renders feature name only (no description paragraph)
- Search still works on feature name
- No warning logged (descriptions are optional)

### localStorage Quota Exceeded

**Scenario**: Forcing feature triggers localStorage.setItem() that exceeds quota

**Behavior**:
- Service catches `QuotaExceededError` exception
- Error logged: "Failed to persist app features to localStorage: QuotaExceededError"
- Feature state updates in memory (works for current session)
- State NOT persisted (lost on page refresh)
- Optional: Show toast notification if notification service available

---

## Type Exports

All types exported from:
```
/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features.models.ts
```

Public API re-exports from:
```
/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/index.ts
```

Consumers import:
```typescript
import {
  DevToolbarAppFeature,
  AppFeatureFilter,
  ForcedAppFeaturesState
} from 'ngx-dev-toolbar';
```
