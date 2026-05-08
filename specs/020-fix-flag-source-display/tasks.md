# Tasks: Fix Flag Source Display

**Plan**: [plan.md](./plan.md) | **Date**: 2026-04-26

## Format

- `[P]` marks tasks that can run in parallel with adjacent `[P]` tasks.
- Consecutive `[P]` tasks form a **parallel group** — `/sdd:implement` spawns them as concurrent subagents.
- Tasks without `[P]` are **gates**: they start only after all prior tasks complete.
- Two tasks that touch the same file are never both `[P]`.

---

## Phase 1: Core Implementation

- [x] **T001** Decouple dot indicator from forced value in list-item — `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts` | R001, R002, R003, R004, R007, NFR001, NFR002
  - **Do**:
    1. Add a `protected sourceValue = computed(...)` that returns `originalValue()` when `isForced() && originalValue() !== undefined`, else `currentValue()`.
    2. In the template, change the dot bindings from `[class.dot-indicator--on]="currentValue()"` / `[class.dot-indicator--off]="!currentValue()"` to `sourceValue()` / `!sourceValue()`. Leave `dot-indicator--forced` and `list-item--forced` (row tint) bound to `isForced()`.
    3. Update `tooltipText` computed: when `isForced() && originalValue() !== undefined && originalValue() !== currentValue()` → `"Server: <originalState> · Forced: <currentState>"`; when forced and values match → `"Currently <state>"`; else → `"Currently <state>"` (existing behaviour).
    4. Update `statusAriaLabel` computed to announce the **source** value plus `, forced` qualifier when `isForced()` is true (e.g., `"disabled, forced"` for the divergent case where source = disabled, forced = enabled).
  - **Verify**: `nx test ngx-dev-toolbar` passes; visually, a forced-on flag whose source value is `false` renders a red ring (off style) with amber row tint and the divergent tooltip.
  - **Leverage**: existing `tooltipText` and `statusAriaLabel` computeds in this same file — keep their pure/signal style and only widen the branches.

- [x] **T002** [P] Lock new dot semantics with unit tests *(depends on T001)* — `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.spec.ts` | R001, R002, R003, R004, R007
  - **Do**: Add three Jest cases against `ToolbarListItemComponent`:
    1. *Forced + diverging source*: `isForced=true`, `originalValue=false`, `currentValue=true` → host element has class `dot-indicator--off` (NOT `--on`), `dot-indicator--forced` is present, the dot's `title` matches `/Server:.*disabled.*Forced:.*enabled/`, `aria-label` ends with `, forced`.
    2. *Forced + matching source*: `isForced=true`, `originalValue=true`, `currentValue=true` → host has `dot-indicator--on` and `dot-indicator--forced`, `title` is `Currently enabled`, `aria-label` is `enabled, forced`.
    3. *Non-forced regression guard*: `isForced=false`, `originalValue=undefined`, `currentValue=true` → host has `dot-indicator--on`, no `--forced`, `title` is `Currently enabled`.
    4. *Defensive: forced with undefined originalValue* → falls back to `currentValue` so the dot still renders deterministically (e.g., `currentValue=true` → `--on`).
  - **Verify**: `nx test ngx-dev-toolbar --testPathPattern=list-item` passes; all four cases green.
  - **Leverage**: existing test setup in `list-item.component.spec.ts` — reuse its `TestBed.createComponent` + `componentRef.setInput` pattern.

- [x] **T003** [P] Verify `Apply to source` button gating across all three tools *(depends on T001)* — verification only, no code change expected | R005, R006, R008
  - **Do**: Open `feature-flags-tool.component.{ts,html}`, `permissions-tool.component.{ts,html}`, and `app-features-tool.component.{ts,html}`. For each, confirm that:
    1. The component computes a `hasApplyCallback()` (or equivalent) signal driven by the public service's `setApplyToSource` registration state.
    2. The `<ndt-list-item>` template binding is `[showApply]="hasApplyCallback()"` (NOT a hardcoded `true`).
    3. The list-item template gates render with `@if (showApply() && isForced())` — already in place per `list-item.component.ts:61`.
    4. If any of the three tools is missing the `[showApply]` binding or the `hasApplyCallback` plumbing, add it following the pattern from whichever tool already has it correctly wired.
  - **Verify**: A consumer that does NOT call `service.setApplyToSource(...)` and forces a value sees no apply button on any of the three tool lists; one that does call it sees the button only on forced rows. Existing tool component specs (`feature-flags-tool.component.spec.ts`, `permissions-tool.component.spec.ts`, `app-features-tool.component.spec.ts`) still pass.
  - **Leverage**: whichever of the three tools already has the correct pattern serves as the reference for the others if a fix is needed.
