# Spec: Fix Flag Source Display

**Slug**: 020-fix-flag-source-display | **Date**: 2026-04-26

## Summary

The list-item indicator dot in the feature-flags / permissions / app-features tools currently reflects the **forced (effective) value** rather than the value the source-of-truth (server, LaunchDarkly, etc.) reported. Additionally, the "Apply to source" action is rendered for items that do not have a configured apply-to-source integration, which misleads developers into thinking they can push a value back when no callback is wired up. This spec corrects both behaviours so the indicator faithfully reflects the upstream value and the apply action only appears when it is actually available.

## Requirements

- **R001** (MUST): The list-item dot indicator (green = on, red ring = off) MUST reflect the value reported by the source of truth — i.e., the original (non-forced) value passed in via `setAvailableOptions`. When a flag/permission/feature is forced, the dot MUST continue to show the source value, NOT the forced override.
- **R002** (MUST): When an item is forced AND its forced value differs from the source value, the UI MUST still convey the forced state (existing amber row tint and "forced" aria label / tooltip remain). Only the dot color is decoupled from the forced value.
- **R003** (MUST): When an item is forced AND its forced value equals the source value, the dot color and forced styling MUST remain visually consistent (no flicker, no contradictory cues).
- **R004** (MUST): For non-forced items, dot behaviour MUST be unchanged — it already reflects the source value because `isEnabled` equals the source value in that case.
- **R005** (MUST): The "Apply to source" icon button MUST NOT render when the consuming application has not registered an apply-to-source callback for that tool (i.e., `setApplyToSource()` was never called on the corresponding public service).
- **R006** (MUST): The "Apply to source" icon button MUST only render when ALL of: (a) the consumer registered a callback, (b) the item is currently forced, (c) the toolbar is enabled.
- **R007** (SHOULD): The tooltip on the dot indicator SHOULD distinguish source value from forced value when they diverge — e.g., "Server: enabled · Forced: disabled" — so developers can see both at a glance.
- **R008** (SHOULD): The fix SHOULD apply uniformly to feature-flags, permissions, and app-features tools, since they share the `ndt-list-item` component and the same `setApplyToSource` pattern.
- **R009** (MAY): A unit-test fixture MAY be added to `list-item.component.spec.ts` exercising forced-with-divergent-source and forced-with-matching-source paths, to lock the behaviour.

## Scenarios

### Forced flag with diverging source value

**When** the source reports flag `dark-mode` as `false` AND a developer forces `dark-mode = true` via the toolbar
**Then** the dot indicator renders in the **off** style (red outlined ring), the row shows the **forced** amber tint, the select shows **Forced On**, and the tooltip reads something like "Server: disabled · Forced: enabled"

### Forced flag with matching source value

**When** the source reports flag `beta-features` as `true` AND a developer forces `beta-features = true` via the toolbar
**Then** the dot indicator renders in the **on** style (filled green), the row shows the **forced** amber tint (because it is still a forced override even if the value matches), and the tooltip simply reads "Currently enabled" (no divergence to surface)

### Non-forced item

**When** the source reports a flag/permission/feature value AND no override exists in the toolbar
**Then** the dot indicator continues to reflect that source value exactly as before — no behavioural change

### Apply-to-source not registered

**When** the consuming app has NOT called `service.setApplyToSource(...)` AND a developer forces an item
**Then** the "Apply to source" icon button MUST NOT render on that item, regardless of forced state

### Apply-to-source registered, item forced

**When** the consuming app HAS called `service.setApplyToSource(...)` AND the item is forced
**Then** the "Apply to source" icon button renders and is interactive (existing behaviour preserved)

### Toolbar disabled with forced items

**When** the toolbar `enabled` config is `false` AND items in the underlying state are forced
**Then** since the toolbar UI itself does not render, the apply button visibility is moot; this is verified only to ensure no regression when the toolbar is re-enabled

## Non-Functional Requirements

- **NFR001** (MUST): Accessibility — the dot's `aria-label` MUST stay accurate (announce the source value, plus a "forced" qualifier when applicable). Color is not the only signal — the ring vs. filled circle shape distinction for off/on remains.
- **NFR002** (SHOULD): No new runtime cost beyond reading an existing `originalValue` field already present on `ToolbarFlag` / `ToolbarPermission` / `ToolbarAppFeature`.

## Out of Scope

- Changing the public API surface of `ToolbarFeatureFlagService`, `ToolbarPermissionsService`, or `ToolbarAppFeaturesService` — the fix is internal/UI-level.
- Reworking how the override (forced) state is stored or computed in the internal services.
- Adding a new "Apply to source" UX for items that are not forced (out of scope; the action only makes sense for forced items by design).
- Migrating away from the deprecated `onApply*` config callbacks in `ToolbarConfig`.
