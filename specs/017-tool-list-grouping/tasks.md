# Tasks: Tool List Grouping

**Plan**: [plan.md](./plan.md) | **Date**: 2026-04-21

---

## Phase 1: Core Implementation (Sequential)

- [x] **T001** Add optional `group` field to all three tool models — `libs/ngx-dev-toolbar/src/tools/{feature-flags-tool/feature-flags.models.ts, app-features-tool/app-features.models.ts, permissions-tool/permissions.models.ts}` | R001, R008
  - **Do**: Add `group?: string;` to `ToolbarFlag`, `ToolbarAppFeature`, and `ToolbarPermission` interfaces. Include a brief JSDoc line: `Optional group name. Items without a group render in an "Other" section`.
  - **Verify**: `nx build ngx-dev-toolbar` passes. No existing consumers break (the field is optional).
  - **Leverage**: existing field shapes in `feature-flags.models.ts:1-9` (style: optional fields with `?`).

- [x] **T002** Extend `ToolViewState` with persisted collapsed-group set — `libs/ngx-dev-toolbar/src/models/tool-view-state.models.ts` | R003
  - **Do**: Add `collapsedGroups?: string[];` after `pinnedIds?: string[]`. JSDoc: `Names of groups currently collapsed in the UI; persisted to localStorage`.
  - **Verify**: Type compiles. Existing `loadViewState()` paths in tool components don't break (field is optional).
  - **Leverage**: same pattern as `pinnedIds?: string[]` already on the interface.

- [x] **T003** Implement `groupItems` partitioning utility — `libs/ngx-dev-toolbar/src/utils/group-items.util.ts` | R002, R004, R005, R008
  - **Do**: Export `groupItems<T extends { id: string; name: string; group?: string }>(items: T[], pinnedIds: Set<string>): { pinned: T[]; groups: { name: string; items: T[] }[]; ungrouped: T[] }`. Pinned items are extracted first (regardless of group), groups are sorted alphabetically by name with their items sorted alphabetically by `name`, ungrouped items are sorted alphabetically. When no item has a `group`, return `{ pinned, groups: [], ungrouped: nonPinnedAlpha }` so existing flat layout is preserved.
  - **Verify**: TypeScript generic resolves cleanly. Pure function — no side effects.
  - **Leverage**: existing pinned-first + alpha sort in `feature-flags-tool.component.ts:172-180` (extract that exact ordering rule).

- [x] **T004** Unit-test `groupItems` covering all scenarios — `libs/ngx-dev-toolbar/src/utils/group-items.util.spec.ts` | R002, R004, R005, R006, R008
  - **Do**: Jest specs for: (a) all-ungrouped → flat (backward compat), (b) mixed grouped + ungrouped, (c) pinned item from a group goes to `pinned` and is removed from its group, (d) groups sorted alphabetically, (e) items within a group sorted alphabetically, (f) empty input → all empty arrays.
  - **Verify**: `nx test ngx-dev-toolbar --testPathPattern=group-items` passes.
  - **Leverage**: AAA pattern from `feature-flags-internal.service.spec.ts`.

- [x] **T005** Build `ToolbarListGroupComponent` with collapsible header — `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.ts` + `.scss` | R003, R007
  - **Do**: Standalone, OnPush component selector `ndt-list-group`. Inputs: `name: string`, `count: number`, `collapsed: boolean` (via `input()`). Output: `collapsedChange = output<boolean>()`. Template: header button with name + count badge + chevron icon (use existing `ndt-icon` + `chevron-right` / `chevron-down`); `<ng-content>` for items, hidden via `@if (!collapsed())`. Style header to align with existing list-item visual rhythm using `--ndt-spacing-*` tokens.
  - **Verify**: Component compiles. Storybook/demo not required — wired up in T008.
  - **Leverage**: collapsible patterns from `toolbar-tool.component.ts`; icon usage from `list-item.component.ts`; defensive CSS rules in `CLAUDE.md` (explicit spacing, `ndt-` prefix only for global classes).

- [x] **T006** Test `ToolbarListGroupComponent` rendering and toggle — `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.spec.ts` | R003, R007
  - **Do**: Specs: header shows name + count, content projection visible when expanded, hidden when collapsed, clicking header emits `collapsedChange` with negated value.
  - **Verify**: `nx test ngx-dev-toolbar --testPathPattern=list-group` passes.
  - **Leverage**: component test setup from `app-features-tool.component.spec.ts`.

- [x] **T007** Export `ToolbarListGroupComponent` from public API — `libs/ngx-dev-toolbar/src/index.ts` | R007
  - **Do**: Add `export * from './components/list-group/list-group.component';` next to existing `list-item.component` export.
  - **Verify**: `nx build ngx-dev-toolbar` passes; export visible in built `dist/` types.
  - **Leverage**: surrounding component exports in `index.ts:13-33`.

- [x] **T008** Wire grouping into Feature Flags tool — `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts` | R002, R003, R006, R008
  - **Do**: Replace the current `filteredFlags()` computed with `groupedFlags()` that runs the same search/filter logic, then calls `groupItems(filtered, pinnedIds())`. Add `collapsedGroups = signal<Set<string>>(new Set())`; load from saved view state in `loadViewState()`; persist via the existing `effect()`. Template: `@for` over pinned items first, then `@for (group of groupedFlags().groups)` wrapped in `<ndt-list-group>` with `[collapsed]` bound + `(collapsedChange)` toggling the set, then `@for` over ungrouped under an "Other" `<ndt-list-group>` only if non-empty. Keep `hasNoFilteredFlags` computed working off the combined count.
  - **Verify**: Demo app — feature flags with `group` render under headers; without `group` render flat (backward compat); collapse persists across reload; search hides empty groups.
  - **Leverage**: existing computed pattern `feature-flags-tool.component.ts:152-180`; `loadViewState()`/`effect()` pair at lines 113-140.

- [x] **T009** Wire grouping into App Features tool — `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts` | R002, R003, R006, R008
  - **Do**: Mirror the T008 pattern — replace flat `filteredX()` computed with grouped equivalent, add `collapsedGroups` signal, load/persist in view state, render via `<ndt-list-group>`.
  - **Verify**: Same as T008 but in the App Features tool.
  - **Leverage**: changes from T008 as the reference implementation.

- [x] **T010** Wire grouping into Permissions tool — `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts` | R002, R003, R006, R008
  - **Do**: Mirror T008/T009 — replace flat `filteredX()` computed with grouped equivalent, add `collapsedGroups` signal, load/persist in view state, render via `<ndt-list-group>`.
  - **Verify**: Same as T008 but in the Permissions tool.
  - **Leverage**: changes from T008 as the reference implementation.

- [x] **T011** Update demo wiring + run full test/lint sweep — `apps/demo/**`, `nx test ngx-dev-toolbar`, `nx lint ngx-dev-toolbar` | R001, R008
  - **Do**: In the demo app, add `group` to a handful of sample flags/features/permissions to exercise the new UX. Run `nx test ngx-dev-toolbar`, `nx lint ngx-dev-toolbar`, `nx build ngx-dev-toolbar`. Manually verify in `nx serve demo`: grouped items render, collapse persists, search/filter still work, items without `group` still render flat.
  - **Verify**: All commands pass with no new warnings; manual UX checks pass.
  - **Leverage**: existing sample data shape in `apps/demo/`.

---

## Progress

- Phase 1: T001–T011 [ ]
