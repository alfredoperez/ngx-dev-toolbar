# Tasks: Add All Filter

**Plan**: [plan.md](./plan.md) | **Date**: 2026-04-23

## Format

- `[P]` marks tasks that can run in parallel with adjacent `[P]` tasks.
- Consecutive `[P]` tasks form a **parallel group** — `/sdd:implement` spawns them as concurrent subagents.
- Tasks without `[P]` are **gates**: they start only after all prior tasks complete.
- Two tasks that touch the same file are never both `[P]`.

---

## Phase 1: Core Implementation

- [x] **T001** Simplify tool-header filter-click behavior — `libs/ngx-dev-toolbar/src/components/tool-header/tool-header.component.ts` | R006, R008
  - **Do**: In `onFilterClick(value)`, remove the `if (this.activeFilter() === value) { this.activeFilter.set(this.defaultFilter()); }` branch so a click always calls `this.activeFilter.set(value)`. Delete the `defaultFilter = input<string>('all')` declaration and its preceding doc comment (lines 74–79). Verified no external callers set `defaultFilter` — safe to drop.
  - **Verify**: `nx lint ngx-dev-toolbar` passes; `nx test ngx-dev-toolbar` green. Clicking an already-active chip in any of the three consuming tools leaves the chip highlighted (manual check in demo app).
  - **Leverage**: current `onFilterClick` at `tool-header.component.ts:85-93` is the only function changing; `onFilterKeydown` (keyboard nav) already sets `activeFilter` unconditionally and needs no change — R008 is satisfied automatically once `'all'` is in each tool's `filterOptions`.

- [x] **T002** [P] Add All chip to Feature Flags tool *(depends on T001)* — `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts` and `…/feature-flags-tool.component.spec.ts` | R001, R002, R003, R004, R005
  - **Do**: In `feature-flags-tool.component.ts:264-268`, prepend `{ value: 'all', label: 'All' }` to `filterOptions` so the array becomes `[all, forced, enabled, disabled]`. No handler change needed — `onFilterChange('all')` already finds a match via `.find(f => f.value === value)` and sets the signal. In the spec file, update any assertion that hard-codes `filterOptions.length === 3` or index-zero being `'forced'` to reflect the new All-first ordering; add a test: call `component.onFilterChange('forced')` twice, assert `activeFilter()` remains `'forced'` (the regression case from spec.md).
  - **Verify**: `nx test ngx-dev-toolbar --testPathPattern feature-flags` green. Badge count, filtered-list computed, and localStorage round-trip still work (existing tests cover this).
  - **Leverage**: `flagValueOptions` in the same file (same array-of-`{value,label}` shape); the internal filter-union `FeatureFlagFilter` at `feature-flags.models.ts:13` already includes `'all'` — no model change required.

- [x] **T003** [P] Add All chip to App Features tool *(depends on T001)* — `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts` and `…/app-features-tool.component.spec.ts` | R001, R002, R003, R004, R005
  - **Do**: In `app-features-tool.component.ts:288-292`, prepend `{ value: 'all', label: 'All' }` to `filterOptions`. Update the spec file's `filterOptions.length`/index-based assertions to expect the All-first ordering; add the same re-click regression test (two `onFilterChange('forced')` calls → `activeFilter()` stays `'forced'`).
  - **Verify**: `nx test ngx-dev-toolbar --testPathPattern app-features` green.
  - **Leverage**: structurally identical to T002 — copy the same chip entry and test pattern. `AppFeatureFilter` at `app-features.models.ts:80` already includes `'all'`.

- [x] **T004** [P] Add All chip to Permissions tool *(depends on T001)* — `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts` and `…/permissions-tool.component.spec.ts` | R001, R002, R003, R004, R005, R007
  - **Do**: In `permissions-tool.component.ts:289-293`, prepend `{ value: 'all', label: 'All' }` to `filterOptions`. In `permissions-tool.component.spec.ts`, update the hard-coded assertions at lines 142–145 (`filterOptions.length === 3`, `[0].value === 'forced'`, `[1].value === 'granted'`, `[2].value === 'denied'`) to reflect the new 4-entry All-first ordering. The existing test at line 213–219 (`onFilterChange('all')` shows all permissions) stays as-is — it will now exercise the previously-dead handler path. Add the re-click regression test.
  - **Verify**: `nx test ngx-dev-toolbar --testPathPattern permissions` green. The existing `loadViewState` test at spec line ~98 confirms R007 (legacy `'all'` value loads correctly).
  - **Leverage**: same pattern as T002/T003; `PermissionFilter` at `permissions.models.ts:36` already includes `'all'`.
