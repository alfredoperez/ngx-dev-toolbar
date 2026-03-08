# Tasks: Fix Toolbar Tooltips

**Input**: Design documents from `/specs/011-fix-toolbar-tooltips/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not explicitly requested in the feature spec. Test tasks are limited to running existing tests and manual validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Library root**: `libs/ngx-dev-toolbar/src/`
- **Components**: `libs/ngx-dev-toolbar/src/components/`

---

## Phase 1: Setup

**Purpose**: No project setup needed — this is a modification to an existing library.

*(No tasks in this phase)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add CSS custom properties for the inverted tooltip color scheme that US2 depends on.

- [x] T001 [P] Add `--ndt-tooltip-bg` and `--ndt-tooltip-text` CSS custom properties to the `devtools-theme` mixin in `libs/ngx-dev-toolbar/src/styles.scss`. For light theme: `--ndt-tooltip-bg` should use `$color-black-900` (rgb(17, 24, 39)), `--ndt-tooltip-text` should use `$color-white` (rgb(255, 255, 255)). For future dark theme: invert these values.
- [x] T002 [P] Add `--ndt-tooltip-bg` and `--ndt-tooltip-text` to the global light theme styles injected in `libs/ngx-dev-toolbar/src/toolbar.component.ts` (inside the `injectGlobalStyles()` method). Set `--ndt-tooltip-bg: rgb(17, 24, 39)` and `--ndt-tooltip-text: rgb(255, 255, 255)`.

**Checkpoint**: Inverted tooltip CSS variables are available across all components and overlays.

---

## Phase 3: User Story 1 - Single, Clean Tooltip on Hover (Priority: P1) MVP

**Goal**: Eliminate duplicate tooltips so only one custom tooltip appears per tool icon on hover.

**Independent Test**: Hover over any tool icon — exactly one tooltip appears, no native browser tooltip visible.

### Implementation for User Story 1

- [x] T003 [US1] Rename `title` input to `toolLabel` in `libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.ts`. Update the `tooltip` computed signal to use `this.toolLabel()` directly instead of reading from `parentElement.getAttribute('data-tooltip')`. Remove the `ElementRef` inject if no longer needed.
- [x] T004 [US1] Update `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts`: (a) remove `[attr.data-tooltip]="title()"` from the `#buttonContainer` div, (b) change `[title]="title()"` to `[toolLabel]="title()"` on the `<ndt-tool-button>` element.
- [x] T005 [US1] Update the `isTooltipVisible` computed signal in `libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.ts` to also check `this.isToolbarVisible()` — tooltips should not appear during the peeking state (FR-007). The signal should be: `() => this.toolLabel() && !this.isActive() && this.isToolbarVisible()`.

**Checkpoint**: Hovering over any tool icon shows exactly one custom tooltip. No native browser tooltip appears. Tooltips don't show during peeking state.

---

## Phase 4: User Story 2 - Tooltip Positioned Close to Toolbar with Arrow (Priority: P1)

**Goal**: Reposition tooltips adjacent to the toolbar edge with a small gap, add a directional arrow/caret, and apply an inverted color scheme.

**Independent Test**: Hover over a tool icon in each toolbar position (top, bottom, left, right) — tooltip appears close to toolbar with an arrow pointing toward the icon, using dark background + light text.

### Implementation for User Story 2

- [x] T006 [US2] Add a `position` input to `libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.ts`: `readonly position = input<'top' | 'bottom' | 'left' | 'right'>('bottom')`. Add a host class binding to reflect the position: use `host: { '[class]': '"tooltip-position-" + position()' }` in the component decorator.
- [x] T007 [US2] Pass the toolbar position from `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts` to the tool button: add `[position]="state.position()"` on the `<ndt-tool-button>` element.
- [x] T008 [US2] Restyle tooltip positioning in `libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.scss`: (a) Replace `bottom: calc(100% + 1.2rem)` with position-aware styles using `:host` position classes. For `tooltip-position-bottom`: tooltip above button with `bottom: calc(100% + 8px)`, centered horizontally. For `tooltip-position-top`: tooltip below with `top: calc(100% + 8px)`. For `tooltip-position-left`: tooltip to the right with `left: calc(100% + 8px)`. For `tooltip-position-right`: tooltip to the left with `right: calc(100% + 8px)`. (b) Update the `tooltipAnimation` states in the `.ts` file to match the new position offsets.
- [x] T009 [US2] Add arrow/caret via `::after` pseudo-element on `.tooltip` in `libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.scss`. Use CSS border-triangle technique: 5px solid borders with transparent on 3 sides and `var(--ndt-tooltip-bg)` on the side pointing away from the toolbar. Arrow direction must adapt per position class: `tooltip-position-bottom` → arrow points down (below tooltip), `tooltip-position-top` → arrow points up (above tooltip), `tooltip-position-left` → arrow points left, `tooltip-position-right` → arrow points right. Position the arrow centered on the tooltip edge closest to the icon.
- [x] T010 [US2] Apply inverted color scheme to `.tooltip` in `libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.scss`: change `background` from `var(--ndt-bg-primary)` to `var(--ndt-tooltip-bg)`, change `color` from `var(--ndt-text-primary)` to `var(--ndt-tooltip-text)`. Update `box-shadow` to use the existing `var(--ndt-shadow-tooltip)`.

**Checkpoint**: Tooltips appear snug against the toolbar in all 4 positions with a directional arrow and dark-on-light inverted colors.

---

## Phase 5: User Story 3 - Tooltip Contained Within Visual Bounds (Priority: P2)

**Goal**: Prevent hover background effects from spilling beyond the toolbar's rounded corners.

**Independent Test**: Hover over the first and last tool icons — hover background stays within the toolbar's rounded border.

### Implementation for User Story 3

- [x] T011 [US3] Add hover containment in `libs/ngx-dev-toolbar/src/toolbar.component.scss`: apply `overflow: hidden` and `border-radius: inherit` to the `.ndt-toolbar` element to clip hover backgrounds at the rounded edges. Since tooltips are rendered inside Shadow DOM with `position: absolute` and `z-index: 1000`, verify they still appear outside the clipped area. If `overflow: hidden` clips tooltips too, use an alternative approach: wrap the toolbar's tool icons in an inner container div with `overflow: hidden` and matching `border-radius`, keeping the outer `.ndt-toolbar` at `overflow: visible`.

**Checkpoint**: Hover backgrounds are clipped at toolbar edges. Tooltips still render outside the toolbar bounds.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup across all stories.

- [x] T012 Run `nx lint ngx-dev-toolbar` and fix any lint errors introduced by the changes
- [x] T013 Run `nx test ngx-dev-toolbar` and fix any test failures caused by the `title` → `toolLabel` rename or other changes
- [x] T014 Validate all scenarios from `specs/011-fix-toolbar-tooltips/quickstart.md` by serving the demo app with `nx serve ngx-dev-toolbar-demo`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately. T001 and T002 are parallel (different files).
- **US1 (Phase 3)**: No dependency on Phase 2 (doesn't need tooltip color vars). Can start immediately.
- **US2 (Phase 4)**: Depends on Phase 2 (needs `--ndt-tooltip-bg`/`--ndt-tooltip-text` vars) AND Phase 3 (T006/T007 modify same files as T003/T004).
- **US3 (Phase 5)**: No dependency on Phase 3 or 4. Can start after Phase 2 or in parallel with US1.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately — no dependencies on other stories.
- **User Story 2 (P1)**: Depends on US1 completion (modifies same files: `tool-button.component.ts`, `toolbar-tool.component.ts`). Also depends on Phase 2.
- **User Story 3 (P2)**: Independent of US1 and US2. Only touches `toolbar.component.scss`.

### Within Each User Story

- US1: T003 → T004 → T005 (sequential, same files)
- US2: T006 → T007 → T008 → T009 → T010 (T006/T007 sequential same files, T008/T009/T010 touch same SCSS file)
- US3: T011 (single task)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files: `styles.scss` vs `toolbar.component.ts`)
- Phase 2 and US1 (Phase 3) can run in parallel (no shared files between T001/T002 and T003/T004/T005)
- US3 (Phase 5) can run in parallel with US1 or US2 (different files: `toolbar.component.scss` vs `tool-button.*`)

---

## Parallel Example: Phases 2 + 3 (simultaneous start)

```bash
# Stream 1: Foundational CSS variables
Task T001: "Add tooltip CSS vars to styles.scss"
Task T002: "Add tooltip CSS vars to toolbar.component.ts global styles"

# Stream 2: US1 - Fix duplicate tooltips (can start in parallel with Stream 1)
Task T003: "Rename title input in tool-button.component.ts"
Task T004: "Update toolbar-tool.component.ts bindings"
Task T005: "Gate tooltip on isToolbarVisible()"

# Stream 3: US3 - Hover containment (can also start in parallel)
Task T011: "Add overflow clipping to toolbar.component.scss"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T002) — in parallel
2. Complete Phase 3: User Story 1 (T003-T005) — sequential
3. **STOP and VALIDATE**: Hover over tool icons — only one tooltip, no native tooltip
4. This alone fixes the most visible bug

### Incremental Delivery

1. US1 → Fixes duplicate tooltips (most jarring bug) — **MVP**
2. US2 → Repositions + adds arrow + inverted colors (visual polish) — **Enhanced**
3. US3 → Clips hover at edges (finishing touch) — **Complete**
4. Each story adds visual quality without breaking previous fixes

### Optimal Execution (single developer)

1. Start T001 + T002 + T003 in parallel
2. T004 → T005 (after T003)
3. T006 → T007 → T008 → T009 → T010 (after T005 + T001/T002)
4. T011 (can be done anytime, but logically after US2)
5. T012 → T013 → T014 (validation)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The `title` → `toolLabel` rename (T003/T004) is the critical fix for duplicate tooltips
- T008 tooltip positioning and T009 arrow styles are in the same SCSS file — must be sequential
- Total: 14 tasks across 6 phases
- No test-writing tasks since tests were not requested; existing tests must pass after changes
