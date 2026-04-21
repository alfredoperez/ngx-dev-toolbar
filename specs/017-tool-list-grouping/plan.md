# Tool List Grouping — Plan

**Spec**: 017-tool-list-grouping
**Date**: 2026-04-20

## Approach

Introduce a shared `ToolbarListGroupComponent` for collapsible group headers and a `groupItems` utility function that partitions any item array into pinned + named groups + ungrouped. Each tool's `filteredX()` computed signal is replaced with a `groupedX()` computed that returns a structured array of groups, rendered in the template using nested `@for` loops with the new group component.

## Technical Context

All three tools (feature-flags, app-features, permissions) share an identical pattern:
- A `filteredX()` computed signal that filters by search/filter, then sorts pinned-first + alphabetical
- A flat `@for` loop rendering `<ndt-list-item>` elements
- `ToolViewState` persisted to localStorage with `pinnedIds`

The grouping feature layers on top of this by:
1. Adding `group?: string` to each model
2. Replacing flat sort with a group-aware partitioning utility
3. Wrapping items per group inside a collapsible `<ndt-list-group>` element
4. Extending `ToolViewState` with `collapsedGroups: string[]`

## Data Model

| Field | Location | Type | Purpose |
|-------|----------|------|---------|
| `group` | `ToolbarFlag`, `ToolbarAppFeature`, `ToolbarPermission` | `string \| undefined` | Optional group assignment |
| `collapsedGroups` | `ToolViewState` | `string[]` | Persisted collapsed group names |

## Flow

```
Items from service
       │
       ▼
  Filter (search + active filter)
       │
       ▼
  groupItems(filtered, pinnedIds)
       │
       ├── pinned: Item[]        ← always first, no header
       ├── groups: { name, items }[]  ← sorted alpha, each collapsible
       └── ungrouped: Item[]     ← "Other" section, last
       │
       ▼
  Template renders sections
```

## Files to Create

| File | Purpose |
|------|---------|
| `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.ts` | Collapsible group header + content wrapper |
| `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.scss` | Group header styling |
| `libs/ngx-dev-toolbar/src/utils/group-items.util.ts` | Pure function: partitions items into pinned/groups/ungrouped |
| `libs/ngx-dev-toolbar/src/utils/group-items.util.spec.ts` | Unit tests for the grouping utility |
| `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.spec.ts` | Component tests |

## Files to Modify

| File | Change |
|------|--------|
| `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags.models.ts` | Add `group?: string` |
| `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features.models.ts` | Add `group?: string` |
| `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions.models.ts` | Add `group?: string` |
| `libs/ngx-dev-toolbar/src/models/tool-view-state.models.ts` | Add `collapsedGroups?: string[]` |
| `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts` | Replace flat sort with grouped rendering |
| `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts` | Replace flat sort with grouped rendering |
| `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts` | Replace flat sort with grouped rendering |
| `libs/ngx-dev-toolbar/src/index.ts` | Export `ToolbarListGroupComponent` |

## Risks

- **Template complexity**: Nested `@for` with conditional group headers adds template depth. Mitigated by keeping the group component self-contained with `<ng-content>` projection.
- **Backward compat regression**: If `groupItems()` doesn't handle the "all ungrouped" case correctly, existing users see unexpected headers. Mitigated by explicit unit tests for the no-group scenario returning a flat structure.
