# Plan: Pin List Items

**Spec**: [spec.md](./spec.md) | **Date**: 2026-04-01

## Approach

Add a pin/unpin toggle button to the shared `ToolbarListItemComponent` so pinning UI is consistent across all tools. Each tool component manages its own `pinnedIds` signal (persisted via `ToolbarStorageService`) and sorts pinned items to the top within its existing `filteredX()` computed signal. A new `pin` icon component is added to the icon system. The `ToolViewState` model is extended with an optional `pinnedIds` field so pin state is persisted alongside existing view state (search, filter).

## Files

### Create

| File | Purpose |
|------|---------|
| `libs/ngx-dev-toolbar/src/components/icons/pin-icon.component.ts` | New SVG pin icon (outline when unpinned, filled when pinned via the existing `fill` input) |

### Modify

| File | Change |
|------|--------|
| `libs/ngx-dev-toolbar/src/components/icons/icon.models.ts` | Add `'pin'` to the `IconName` union type |
| `libs/ngx-dev-toolbar/src/components/icons/icon.component.ts` | Import `PinIconComponent`, add it to imports array and `@switch` template |
| `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts` | Add `isPinned` input (boolean), `pinToggle` output, and render a pin `ndt-icon-button` in the actions area (before apply button) |
| `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` | Add `.pin-button` styles: ghost button, visually distinct when `isPinned` is true (e.g., filled icon color) |
| `libs/ngx-dev-toolbar/src/models/tool-view-state.models.ts` | Add optional `pinnedIds?: string[]` field to `ToolViewState` |
| `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts` | Add `pinnedIds` signal, persist/load from `ToolViewState.pinnedIds`, pass `[isPinned]` and `(pinToggle)` to `ndt-list-item`, sort pinned items first in `filteredFlags()` |
| `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts` | Same pinning logic as feature-flags tool |
| `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts` | Same pinning logic as permissions tool |

## Risks

- **Icon visual weight**: The pin icon needs to be subtle enough to not compete with the apply-to-source button. Mitigation: use ghost variant for the pin button and lower opacity when not pinned, matching existing icon-button patterns.
