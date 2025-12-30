# Tasks: Tool Badges and UX Improvements

**Input**: Design documents from `/specs/005-badges-each-tools/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Library**: `libs/ngx-dev-toolbar/src/` for source files
- **Root**: `README.md` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared types and models needed by multiple user stories

- [x] T001 [P] [Setup] Create ToolViewState interface in `libs/ngx-dev-toolbar/src/models/tool-view-state.models.ts`
- [x] T002 [P] [Setup] Export ToolViewState from `libs/ngx-dev-toolbar/src/index.ts`

**Checkpoint**: Shared types ready for use by all user stories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add badge infrastructure to shared components that ALL badge-displaying tools depend on

**⚠️ CRITICAL**: User Story 1 cannot begin until badge inputs are added to shared components

- [x] T003 [Foundational] Add `badge` input to DevToolbarToolButtonComponent in `libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.ts` - add `readonly badge = input<string>()` and render badge span with `@if (badge())` after `<ng-content />`
- [x] T004 [Foundational] Add `badge` input to DevToolbarToolComponent in `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts` - add `readonly badge = input<string>()` and pass to `<ndt-tool-button [badge]="badge()">`

**Checkpoint**: Badge infrastructure ready - tool-specific badges can now be implemented

---

## Phase 3: User Story 1 - Forced Values Badge Visibility (Priority: P1) 🎯 MVP

**Goal**: Display badge counts on Feature Flags, Permissions, and App Features tool buttons showing the number of forced values

**Independent Test**: Force values in each tool and verify the badge count displays correctly on the toolbar buttons. Badge should update immediately when forcing/unforcing values.

### Implementation for User Story 1

- [x] T005 [P] [US1] Add badge count computed signal to Feature Flags tool in `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts` - compute `enabled.length + disabled.length` from `getCurrentForcedState()`, format as '' (zero), '1'-'99', or '99+'
- [x] T006 [P] [US1] Add badge count computed signal to Permissions tool in `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts` - compute `granted.length + denied.length` from `getCurrentForcedState()`, format as '' (zero), '1'-'99', or '99+'
- [x] T007 [P] [US1] Add badge count computed signal to App Features tool in `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts` - compute `enabled.length + disabled.length` from `getCurrentForcedState()`, format as '' (zero), '1'-'99', or '99+'
- [x] T008 [US1] Update Feature Flags tool template to pass `[badge]="badgeCount()"` to `<ndt-toolbar-tool>` in `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts`
- [x] T009 [US1] Update Permissions tool template to pass `[badge]="badgeCount()"` to `<ndt-toolbar-tool>` in `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts`
- [x] T010 [US1] Update App Features tool template to pass `[badge]="badgeCount()"` to `<ndt-toolbar-tool>` in `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts`

**Checkpoint**: At this point, all three tools should display badge counts. Verify:
- Badge shows correct count when values are forced
- Badge hidden when count is 0
- Badge shows "99+" when count exceeds 99
- Badge updates immediately when forcing/unforcing values
- Badge shows correct count on page refresh (persisted state)

---

## Phase 4: User Story 2 - Persisted Filter and Search State (Priority: P2)

**Goal**: Persist search queries, filter selections, and sort preferences per tool to localStorage so they survive tool close/reopen and page refresh

**Independent Test**: Configure search/filter/sort in a tool, close and reopen the tool (or refresh the page), and verify settings are restored. Each tool should maintain independent state.

### Implementation for User Story 2

- [x] T011 [P] [US2] Add view state persistence to Feature Flags tool in `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts` - inject DevToolsStorageService, add VIEW_STATE_KEY constant, implement loadViewState() in constructor and effect() to save on changes
- [x] T012 [P] [US2] Add view state persistence to Permissions tool in `libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts` - inject DevToolsStorageService, add VIEW_STATE_KEY constant, implement loadViewState() in constructor and effect() to save on changes
- [x] T013 [P] [US2] Add view state persistence to App Features tool in `libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts` - inject DevToolsStorageService, add VIEW_STATE_KEY constant, implement loadViewState() in constructor and effect() to save on changes
- [x] T014 [US2] Add error handling for corrupted localStorage data in all three tools - wrap loadViewState() in try/catch, reset to defaults on error, log warning

**Checkpoint**: At this point, view state persistence should work for all three tools. Verify:
- Search query persists when closing and reopening tool
- Filter selection persists when closing and reopening tool
- Settings persist after page refresh
- Each tool maintains independent state
- "Clear All Settings" resets view state to defaults (automatic via existing storage service)
- Corrupted localStorage data handled gracefully (reset to defaults)

---

## Phase 5: User Story 3 - Simplified NPM README (Priority: P3)

**Goal**: Rewrite README.md to be markdown-only (no HTML), under 200 lines, and focused on essential usage information for npm package viewers

**Independent Test**: View the README on npm website and verify it renders correctly, is concise, and contains only usage-essential information without any raw HTML tags.

### Implementation for User Story 3

- [x] T015 [US3] Rewrite README.md at repository root - remove all HTML tags (`<div>`, `<table>`, `<details>`, etc.), use markdown-only syntax for all formatting including images, keep under 200 lines
- [x] T016 [US3] Structure README.md with essential sections only: package description, badges, installation, quick start example, available tools list, link to documentation, license
- [x] T017 [US3] Verify README renders correctly by checking markdown syntax and ensuring no HTML remnants

**Checkpoint**: README should now be markdown-only and render correctly on npm. Verify:
- No HTML tags in README
- README under 200 lines
- Renders correctly on npm website (test by viewing raw markdown)
- Contains installation instructions
- Contains basic usage example
- Links to documentation

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T018 Run quickstart.md validation - verify all testing checklist items pass
- [x] T019 Verify all acceptance scenarios from spec.md pass for each user story

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS User Story 1
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Setup completion (needs ToolViewState) - can run in parallel with US1
- **User Story 3 (Phase 5)**: No dependencies on other stories - can run in parallel with US1 and US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - badge infrastructure must exist first
- **User Story 2 (P2)**: Depends on Setup (Phase 1) - only needs ToolViewState interface, NOT dependent on US1
- **User Story 3 (P3)**: No code dependencies - README rewrite is independent

### Within Each Phase

- Tasks marked [P] can run in parallel (different files)
- Tasks without [P] must run sequentially within their phase

### Parallel Opportunities

- T001 and T002 can run in parallel (Setup phase)
- T005, T006, T007 can ALL run in parallel (different tool files)
- T011, T012, T013 can ALL run in parallel (different tool files)
- US2 and US3 can start as soon as Setup completes (don't need Foundational)
- US1, US2, and US3 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1 Badge Implementation

```bash
# After Foundational phase completes, launch all badge computations in parallel:
Task: "Add badge count computed signal to Feature Flags tool"
Task: "Add badge count computed signal to Permissions tool"
Task: "Add badge count computed signal to App Features tool"

# Then update templates (can also be parallelized if in different files):
Task: "Update Feature Flags tool template to pass badge"
Task: "Update Permissions tool template to pass badge"
Task: "Update App Features tool template to pass badge"
```

## Parallel Example: User Story 2 View State Persistence

```bash
# Launch all view state persistence implementations in parallel:
Task: "Add view state persistence to Feature Flags tool"
Task: "Add view state persistence to Permissions tool"
Task: "Add view state persistence to App Features tool"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create shared types)
2. Complete Phase 2: Foundational (add badge inputs to shared components)
3. Complete Phase 3: User Story 1 (add badges to all three tools)
4. **STOP and VALIDATE**: Test badge functionality independently
5. Deploy/demo if ready - developers can now see forced value counts at a glance

### Incremental Delivery

1. Complete Setup + Foundational → Badge infrastructure ready
2. Add User Story 1 → Test badges → Deploy/Demo (MVP!)
3. Add User Story 2 → Test persistence → Deploy/Demo (enhanced UX)
4. Add User Story 3 → Test README → Publish to npm (improved discoverability)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Complete Setup together (quick - 2 tasks)
2. Developer A: Foundational + User Story 1 (badges)
3. Developer B: User Story 2 (view state persistence) - can start after Setup
4. Developer C: User Story 3 (README) - can start immediately
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Existing `.tool-button__badge` CSS class handles badge styling - no CSS changes needed
- Existing `DevToolsStorageService.clearAllSettings()` automatically clears view state keys
