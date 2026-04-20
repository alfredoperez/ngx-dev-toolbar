# Tool List Grouping

**Spec**: 017-tool-list-grouping
**Date**: 2026-04-20
**Status**: Draft

## Summary

Add optional grouping support to the Feature Flags, App Features, and Permissions tools so items can be organized under collapsible group headers. Pinned items always render above all groups regardless of their original group assignment.

## Requirements

### R001 — Optional `group` field on item models

Each tool's item model (`ToolbarFlag`, `ToolbarAppFeature`, `ToolbarPermission`) gains an optional `group?: string` property. Items without a group render in an "Ungrouped" section at the bottom (after pinned, before or after groups depending on design).

### R002 — Pinned items always appear above groups

Regardless of group assignment, pinned items are extracted and rendered in a dedicated "Pinned" section at the top of the list. This preserves existing behavior where pinned items sort first.

### R003 — Group headers are collapsible

Each group renders with a header showing the group name and item count. Clicking the header toggles collapse/expand. Collapsed state persists in `ToolViewState` via localStorage.

### R004 — Sorting within groups

Within each group (and within the pinned section), items sort alphabetically by name — matching existing behavior.

### R005 — Groups sort alphabetically

Group sections sort alphabetically by group name. Ungrouped items appear after all named groups.

### R006 — Search and filter work across groups

When a search query or filter is active, only matching items display. Empty groups are hidden. Group headers still show when at least one item in the group matches.

### R007 — Shared group list component

A reusable `ToolbarListGroupComponent` renders the group header with collapse toggle. This avoids duplicating group UI logic across 3 tools.

### R008 — Backward compatible

When no items have a `group` property, the tools render identically to today — a flat list with pinned-first sorting.

## Scenarios

### Scenario: Items with groups render under headers

Given flags with groups "Authentication" and "Payments", the list shows "Pinned" section (if any pinned), then "Authentication" header with its flags, then "Payments" header with its flags.

### Scenario: Pinned item from a group appears in pinned section only

Given a flag in group "Auth" that is pinned, it appears in the Pinned section at the top and is removed from the "Auth" group rendering.

### Scenario: Collapsing a group hides its items

Clicking the "Payments" group header collapses it. Only the header with count remains visible. Re-opening restores items.

### Scenario: No groups — flat list (backward compat)

When all items have `group: undefined`, no group headers render. The list is flat with pinned-first sorting, identical to current behavior.

### Scenario: Search filters within groups

Searching "payment" shows only items matching across all groups. Groups with no matches are hidden entirely.

### Scenario: Mixed grouped and ungrouped items

Some items have `group`, others don't. Grouped items render under their headers; ungrouped items render in an "Other" section after all named groups.
