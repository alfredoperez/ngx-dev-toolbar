# Tasks: Pin List Items

**Plan**: [plan.md](./plan.md) | **Date**: 2026-04-01

## Format

- `[P]` = Can run in parallel  |  `[A]` = Agent-eligible

---

## Phase 1: Core Implementation (Sequential)

- [x] **T001** Create pin icon component — `libs/ngx-dev-toolbar/src/components/icons/pin-icon.component.ts`
  - **Do**: Create `PinIconComponent` following the same pattern as `star-icon.component.ts`. Use a thumbtack/pin SVG from Phosphor Icons (256x256 viewBox). Include both an outline path and a filled `opacity="0.2"` path. Accept `fill` input with default `'#FFFF'`.
  - **Verify**: File exists, exports the component, matches icon conventions.

- [x] **T002** Register pin icon in icon system *(depends on T001)* — `icon.models.ts` + `icon.component.ts`
  - **Do**: Add `'pin'` to the `IconName` union in `icon.models.ts`. In `icon.component.ts`, import `PinIconComponent`, add to imports array, and add `@case ('pin') { <ndt-pin-icon [fill]="fill()" /> }` to the `@switch` template.
  - **Verify**: `<ndt-icon name="pin" />` renders correctly; build passes.

- [x] **T003** Extend ToolViewState with pinnedIds — `libs/ngx-dev-toolbar/src/models/tool-view-state.models.ts`
  - **Do**: Add optional `pinnedIds?: string[]` field to the `ToolViewState` interface.
  - **Verify**: Type checks pass, no breaking changes to existing consumers.

- [x] **T004** Add pin UI to list-item component *(depends on T001, T002)* — `list-item.component.ts` + `list-item.component.scss`
  - **Do**: In `list-item.component.ts`: add `isPinned = input<boolean>(false)` and `pinToggle = output<void>()`. In the template, insert a pin `ndt-icon-button` before the existing apply button inside `.actions`, using icon `'pin'` with `[fill]` bound to show filled state when pinned. Add `aria-label` computed from pinned state ("Unpin item" / "Pin item"). In `list-item.component.scss`: add `.pin-button` styles — ghost variant, lower opacity (0.4) when not pinned, full opacity when pinned, with hover transition.
  - **Verify**: List item renders pin button; clicking emits `pinToggle`; visual states (pinned/unpinned) are distinct.

- [x] **T005** Add pinning to feature-flags tool *(depends on T003, T004)* — `feature-flags-tool.component.ts`
  - **Do**: Add `pinnedIds = signal<Set<string>>(new Set())`. Load from `ToolViewState.pinnedIds` in `loadViewState()`, save in the `effect()`. Add `togglePin(flagId: string)` method that adds/removes from the set. Pass `[isPinned]` and `(pinToggle)` to `<ndt-list-item>` in template. Update `filteredFlags()` computed to sort pinned items first (pinned alphabetically, then unpinned alphabetically).
  - **Verify**: Pinning a flag moves it to top; unpinning returns it to normal position; pin state survives reload.

- [x] **T006** Add pinning to app-features tool *(depends on T003, T004)* — `app-features-tool.component.ts`
  - **Do**: Same pinning pattern as T005 — `pinnedIds` signal, persist/load from `ToolViewState`, `togglePin()` method, pass `[isPinned]`/`(pinToggle)` to list items, sort pinned first in filtered computed.
  - **Verify**: Same behavior as feature-flags tool.

- [x] **T007** Add pinning to permissions tool *(depends on T003, T004)* — `permissions-tool.component.ts`
  - **Do**: Same pinning pattern as T005/T006.
  - **Verify**: Same behavior as feature-flags and app-features tools.

---

## Phase 2: Quality (Parallel — launch agents in single message)

- [x] **T008** [P][A] Unit tests — `test-expert`
  - **Files**: `list-item.component.spec.ts`, `feature-flags-tool.component.spec.ts`
  - **Pattern**: Jest with AAA pattern, `jest.fn()` for mocks, test input/output bindings
  - **Reference**: Existing `*.spec.ts` files in the project

---

## Progress

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1 | T001–T007 | [x] |
| Phase 2 | T008 | [x] |
