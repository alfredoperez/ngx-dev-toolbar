# Data Model: Tool Badges and UX Improvements

**Feature**: 005-badges-each-tools
**Date**: 2025-12-29

## Entities

### ToolViewState

Represents the persisted UI state for a tool (search query, selected filter, sort order).

```typescript
/**
 * Persisted view state for a tool's UI (search, filter, sort).
 * Stored in localStorage via DevToolsStorageService.
 */
interface ToolViewState {
  /** Current search query text */
  searchQuery: string;

  /** Currently selected filter value (e.g., 'all', 'forced', 'enabled', 'disabled') */
  filter: string;

  /** Sort order for list items (currently only 'asc' supported, reserved for future use) */
  sortOrder: 'asc' | 'desc';
}
```

**Storage Keys**:
- Feature Flags: `AngularDevTools.feature-flags-view`
- Permissions: `AngularDevTools.permissions-view`
- App Features: `AngularDevTools.app-features-view`

**Validation Rules**:
- `searchQuery`: Any string, defaults to `''` if missing or invalid
- `filter`: Must be one of the tool's valid filter options, defaults to `'all'` if invalid
- `sortOrder`: Must be `'asc'` or `'desc'`, defaults to `'asc'` if invalid

**State Transitions**:
- On tool open: Load from localStorage, apply to UI signals
- On search change: Update signal, persist to localStorage
- On filter change: Update signal, persist to localStorage
- On clear all settings: Remove from localStorage, reset signals to defaults
- On corrupted data: Log warning, use defaults

---

### BadgeCount (Derived State)

Badge count is a computed/derived value, not a stored entity. It's calculated from existing forced state.

```typescript
/**
 * Computed badge value displayed on tool button.
 * Not stored - derived from forced state at render time.
 */
type BadgeCount = string; // '', '1'-'99', or '99+'
```

**Computation Logic**:

| Tool | Formula | Source |
|------|---------|--------|
| Feature Flags | `enabled.length + disabled.length` | `DevToolbarInternalFeatureFlagService.getCurrentForcedState()` |
| Permissions | `granted.length + denied.length` | `DevToolbarInternalPermissionsService.getCurrentForcedState()` |
| App Features | `enabled.length + disabled.length` | `DevToolbarInternalAppFeaturesService.getCurrentForcedState()` |

**Display Rules**:
- If count = 0: Display nothing (empty string)
- If count 1-99: Display as string (`'1'`, `'42'`, etc.)
- If count > 99: Display `'99+'`

---

## Existing Entities (Reference)

### ForcedFlagsState (Existing)

```typescript
// Already exists in feature-flags-internal.service.ts
interface ForcedFlagsState {
  enabled: string[];   // IDs of flags forced to ON
  disabled: string[];  // IDs of flags forced to OFF
}
```

### ForcedPermissionsState (Existing)

```typescript
// Already exists in permissions.models.ts
interface ForcedPermissionsState {
  granted: string[];   // IDs of permissions forced to GRANTED
  denied: string[];    // IDs of permissions forced to DENIED
}
```

### ForcedAppFeaturesState (Existing)

```typescript
// Already exists in app-features.models.ts
interface ForcedAppFeaturesState {
  enabled: string[];   // IDs of features forced to ENABLED
  disabled: string[];  // IDs of features forced to DISABLED
}
```

---

## Component Inputs (New)

### DevToolbarToolButtonComponent

```typescript
// New input to add
readonly badge = input<string>(); // Optional badge content
```

### DevToolbarToolComponent

```typescript
// New input to add
readonly badge = input<string>(); // Optional badge content, passed to tool-button
```

---

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                     Tool Component                               │
│  (feature-flags-tool, permissions-tool, app-features-tool)      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌─────────────────────┐                    │
│  │ ToolViewState│◄───│ DevToolsStorage     │                    │
│  │ (signals)    │    │ Service             │                    │
│  └──────────────┘    └─────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌─────────────────────┐                    │
│  │ badgeCount   │◄───│ Internal Service    │                    │
│  │ (computed)   │    │ .getCurrentForcedState()                 │
│  └──────────────┘    └─────────────────────┘                    │
│         │                                                        │
└─────────│────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DevToolbarToolComponent                        │
│  badge input ─────────────────────────────────────────┐         │
│                                                        │         │
│  ┌─────────────────────────────────────────────────────▼───┐    │
│  │               DevToolbarToolButtonComponent              │    │
│  │  badge input ────► @if (badge()) { <span>..</span> }    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## localStorage Schema

### Before (Existing)

```json
{
  "AngularDevTools.feature-flags": { "enabled": ["id1"], "disabled": ["id2"] },
  "AngularDevTools.permissions": { "granted": ["p1"], "denied": ["p2"] },
  "AngularDevTools.app-features": { "enabled": ["f1"], "disabled": [] },
  "AngularDevTools.keys": ["AngularDevTools.feature-flags", "AngularDevTools.permissions", "AngularDevTools.app-features"]
}
```

### After (With View State)

```json
{
  "AngularDevTools.feature-flags": { "enabled": ["id1"], "disabled": ["id2"] },
  "AngularDevTools.feature-flags-view": { "searchQuery": "auth", "filter": "forced", "sortOrder": "asc" },
  "AngularDevTools.permissions": { "granted": ["p1"], "denied": ["p2"] },
  "AngularDevTools.permissions-view": { "searchQuery": "", "filter": "all", "sortOrder": "asc" },
  "AngularDevTools.app-features": { "enabled": ["f1"], "disabled": [] },
  "AngularDevTools.app-features-view": { "searchQuery": "", "filter": "enabled", "sortOrder": "asc" },
  "AngularDevTools.keys": [
    "AngularDevTools.feature-flags",
    "AngularDevTools.feature-flags-view",
    "AngularDevTools.permissions",
    "AngularDevTools.permissions-view",
    "AngularDevTools.app-features",
    "AngularDevTools.app-features-view"
  ]
}
```

---

## Migration

No migration needed. New keys are optional and tools gracefully handle missing data by using defaults.
