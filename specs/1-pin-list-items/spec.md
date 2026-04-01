# Spec: Pin List Items

**Branch**: 1-pin-list-items | **Date**: 2026-04-01

## Summary

Allow users to pin items in any tool's list (feature flags, app features, permissions) so pinned items always appear at the top of the list, above non-pinned items. Pinned state is persisted in localStorage and survives page reloads. This helps developers quickly access frequently-used items in tools with long lists.

## Requirements

- **R001** (MUST): Each list item displays a pin/unpin button that toggles the item's pinned state
- **R002** (MUST): Pinned items appear at the top of the list, before non-pinned items, while preserving alphabetical sort within each group
- **R003** (MUST): Pinned item IDs are persisted per tool in localStorage via `ToolbarStorageService` and restored on reload
- **R004** (MUST): Pin state works correctly with search and filter — pinned items still respect active filters/search, they just sort to the top of the filtered results
- **R005** (SHOULD): Pinned items have a visual indicator (e.g., filled pin icon) distinguishing them from unpinned items
- **R006** (SHOULD): The pin button is accessible with appropriate aria labels

## Scenarios

### Pinning an item

**When** the user clicks the pin button on a list item
**Then** the item moves to the top of the list, the pin icon changes to a filled/active state, and the pinned ID is saved to localStorage

### Unpinning an item

**When** the user clicks the pin button on an already-pinned item
**Then** the item returns to its normal alphabetical position, the pin icon reverts, and the ID is removed from localStorage

### Pinned items with active filters

**When** the user has pinned items and applies a filter (e.g., "Forced" in feature flags)
**Then** only pinned items that match the filter appear at the top; pinned items that don't match the filter are hidden

### Pinned items with search

**When** the user has pinned items and types a search query
**Then** only pinned items matching the search appear at the top of results

### Persistence across reloads

**When** the user reloads the page
**Then** previously pinned items are still pinned and appear at the top of the list

## Out of Scope

- Drag-and-drop reordering of pinned items
- Pin ordering (pinned items are alphabetical among themselves)
- Pinning in the presets, i18n, or network mocker tools (these have different list patterns)
- A dedicated "pinned only" filter option (can be added later)
