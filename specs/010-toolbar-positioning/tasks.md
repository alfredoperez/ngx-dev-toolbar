# Tasks: Toolbar Positioning & Hide Shortcut

**Input**: Design documents from `/specs/010-toolbar-positioning/`
**Prerequisites**: plan.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared types and update existing models that both stories depend on.

- [x] T001 [P] Create `ToolbarPosition` type, `TOOLBAR_POSITIONS` constant, and `isHorizontalPosition()` helper in `libs/ngx-dev-toolbar/src/models/toolbar-position.model.ts`
- [x] T002 [P] Add `position?: ToolbarPosition` property to `ToolbarConfig` interface in `libs/ngx-dev-toolbar/src/models/toolbar-config.interface.ts`
- [x] T003 [P] Add `position: ToolbarPosition` property to `Settings` interface in `libs/ngx-dev-toolbar/src/tools/home-tool/settings.models.ts` and update default in `SettingsService.getSettings()` in `libs/ngx-dev-toolbar/src/tools/home-tool/settings.service.ts`
- [x] T004 Export `ToolbarPosition` type and `TOOLBAR_POSITIONS` from public API in `libs/ngx-dev-toolbar/src/index.ts`

**Checkpoint**: Shared types ready. Both user stories can proceed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update `ToolbarStateService` with position and hide state — both stories depend on this.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Add `position: ToolbarPosition` and `isCompletelyHidden: boolean` to the `ToolbarState` interface and initial state in `libs/ngx-dev-toolbar/src/toolbar-state.service.ts`
- [x] T006 Add `position` computed selector (reads `state().position`) and `setPosition(position)` method to `ToolbarStateService` in `libs/ngx-dev-toolbar/src/toolbar-state.service.ts`
- [x] T007 Add `isCompletelyHidden` computed selector and `toggleCompletelyHidden()` method to `ToolbarStateService` in `libs/ngx-dev-toolbar/src/toolbar-state.service.ts`
- [x] T008 Add position initialization logic to `ToolbarStateService`: resolve position from config > localStorage > `'bottom'` default. Read from `SettingsService` and persist changes back via `effect()` in `libs/ngx-dev-toolbar/src/toolbar-state.service.ts`

**Checkpoint**: State service ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Configurable Toolbar Position (Priority: P1) MVP

**Goal**: User can position the toolbar on any viewport edge (top, right, bottom, left) via config or runtime UI, with position persisted across reloads.

**Independent Test**: Set `provideToolbar({ position: 'left' })`, toolbar renders on left edge. Change position in Home tool UI, reload page, position persists.

### Implementation for User Story 1

- [x] T009 [US1] Replace `[@toolbarState]` Angular animation with CSS transition classes in `libs/ngx-dev-toolbar/src/toolbar.component.ts` — remove the `animations` array and use class-based transitions instead
- [x] T010 [US1] Update toolbar template to bind position as CSS class (`ndt-toolbar--top`, `ndt-toolbar--right`, etc.) and read `state.position()` in `libs/ngx-dev-toolbar/src/toolbar.component.ts`
- [x] T011 [US1] Add position-dependent CSS rules for `.ndt-toolbar--top`, `.ndt-toolbar--right`, `.ndt-toolbar--bottom`, `.ndt-toolbar--left` in `libs/ngx-dev-toolbar/src/toolbar.component.scss` — each sets `position: fixed` with correct edge anchoring, centering axis, and flex-direction
- [x] T012 [US1] Add CSS transition rules for show/hide animation per position (translateX/Y slide in from edge) in `libs/ngx-dev-toolbar/src/toolbar.component.scss`
- [x] T013 [US1] Update `mouseenter`/`mouseleave` handling in `libs/ngx-dev-toolbar/src/toolbar.component.ts` to work with position-aware hover zones (left/right positions need horizontal hover detection)
- [x] T014 [US1] Update `positions()` computed signal in `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts` to calculate overlay placement direction based on `state.position()` — overlays open away from the toolbar edge
- [x] T015 [US1] Update `slideAnimation` in `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts` to animate overlays in the correct direction based on toolbar position (translateY for top/bottom, translateX for left/right)
- [x] T016 [US1] Add position selector UI to the Home tool settings in `libs/ngx-dev-toolbar/src/tools/home-tool/home-tool.component.ts` — four clickable cards or buttons for top/right/bottom/left with active state highlighting
- [x] T017 [US1] Add styles for the position selector in `libs/ngx-dev-toolbar/src/tools/home-tool/home-tool.component.scss`
- [x] T018 [US1] Wire position selector click handler to call `ToolbarStateService.setPosition()` and `SettingsService.setSettings()` in `libs/ngx-dev-toolbar/src/tools/home-tool/home-tool.component.ts`

**Checkpoint**: Toolbar can be positioned on any edge. Position persists. Tool windows open correctly.

---

## Phase 4: User Story 2 — Complete Hide via Keyboard Shortcut (Priority: P2)

**Goal**: User can fully hide the toolbar with Cmd+. (macOS) / Ctrl+. (Windows/Linux). Hidden toolbar is completely invisible — no hover reveal. Same shortcut brings it back.

**Independent Test**: Press Cmd+., toolbar disappears entirely. Hover over where it was — nothing happens. Press Cmd+. again, toolbar reappears.

### Implementation for User Story 2

- [x] T019 [US2] Add `fromEvent<KeyboardEvent>` subscription for Cmd+./Ctrl+. in `libs/ngx-dev-toolbar/src/toolbar.component.ts` that calls `state.toggleCompletelyHidden()`
- [x] T020 [US2] Update the toolbar template `@if` guard in `libs/ngx-dev-toolbar/src/toolbar.component.ts` to also check `!state.isCompletelyHidden()` — when completely hidden, the entire toolbar DOM is removed
- [x] T021 [US2] Persist `isCompletelyHidden` state in localStorage via `SettingsService` so the hide state survives page reloads in `libs/ngx-dev-toolbar/src/toolbar-state.service.ts`

**Checkpoint**: Cmd+. toggles complete toolbar visibility. State persists across reloads.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect both user stories.

- [x] T022 [P] Update global styles injection in `libs/ngx-dev-toolbar/src/toolbar.component.ts` `injectGlobalStyles()` to ensure overlay panels work correctly with all toolbar positions
- [x] T023 [P] Verify `flex-direction` on `.ndt-toolbar` changes to `column` for left/right positions in `libs/ngx-dev-toolbar/src/toolbar.component.scss` so tool buttons stack vertically
- [ ] T024 Run quickstart.md verification checklist: confirm all 6 test scenarios pass manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types must exist) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with US1
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on US2
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — No dependencies on US1

### Within Each User Story

- Models/types before state service changes
- State service before component changes
- Component logic before template/styles
- Core implementation before UI integration

### Parallel Opportunities

- T001, T002, T003, T004 can all run in parallel (different files)
- T022, T023 can run in parallel (different concerns)
- US1 and US2 can proceed in parallel after Phase 2

---

## Parallel Example: Phase 1

```bash
# All setup tasks in parallel (different files):
Task: "Create ToolbarPosition type in models/toolbar-position.model.ts"
Task: "Add position to ToolbarConfig in models/toolbar-config.interface.ts"
Task: "Add position to Settings in tools/home-tool/settings.models.ts"
Task: "Export ToolbarPosition from index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008)
3. Complete Phase 3: User Story 1 (T009-T018)
4. **STOP and VALIDATE**: Test toolbar positioning independently
5. Demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently (MVP!)
3. Add User Story 2 -> Test independently
4. Polish -> Final validation
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The existing `Ctrl+Shift+D` shortcut remains unchanged — US2 adds a new complementary shortcut
