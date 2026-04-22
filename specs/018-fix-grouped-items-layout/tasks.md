# Tasks: Fix Grouped Items Layout

**Plan**: [plan.md](./plan.md) | **Date**: 2026-04-22

---

## Phase 1: Core Implementation (Sequential)

- [x] **T001** Add defensive-CSS block for `ndt-list-group` inside `.ndt-overlay-panel` — `libs/ngx-dev-toolbar/src/global-theme.scss` | R001, R002, R003, R004, R005, R006, NFR002, NFR003
  - **Do**: Append a new block after the existing `.ndt-overlay-panel *` box-sizing rule (around line 107) that re-asserts layout for grouped tools when the overlay renders outside Shadow DOM. Use compound descendant selectors so specificity beats host-app `*`-scoped resets; do NOT use `!important`. Specifically add:
    - `.ndt-overlay-panel ndt-list-group { display: flex; flex-direction: column; contain: layout style; }`
    - `.ndt-overlay-panel ndt-list-group .header { display: flex; flex-direction: row; align-items: center; }`
    - `.ndt-overlay-panel ndt-list-group .content { display: flex; flex-direction: column; }`
    - `.ndt-overlay-panel ndt-list-group .chevron { display: inline-block; }`
    - `.ndt-overlay-panel ndt-list-group .chevron--expanded { /* keep rotate transform from component scss winning — do not redeclare transform here */ }` (omit rule or add a comment-only placeholder; the component rule already fires)
    - `.ndt-overlay-panel ndt-list-group .name, .ndt-overlay-panel ndt-list-group .count { display: inline; }` (only if needed to defeat `* { display: block }` resets)
    - Add a one-line SCSS comment above the block pointing to `components/list-group/list-group.component.scss` so the coupling is discoverable (per plan Risk #1).
  - **Verify**:
    - `nx build ngx-dev-toolbar` passes and demo `nx serve demo` still renders grouped tools pixel-equivalent to `main` (NFR001).
    - Manual check per plan "Testing Strategy → Manual": temporarily add `<style>* { all: revert; display: revert; }</style>` (or a Tailwind Preflight `<link>`) into `apps/demo/src/index.html`, open Feature Flags, App Features, and Permissions tools — each group header must stack immediately above its items with no blank gap and no orphan rows at the bottom. **Remove the reset before committing.**
    - No `!important` in the new rules (`grep -n "!important" libs/ngx-dev-toolbar/src/global-theme.scss` reports 0 matches in the added block).
    - Selectors stay scoped under `.ndt-overlay-panel ...` (NFR002) — no bare `ndt-list-group { ... }` at root scope.
  - **Leverage**: existing `.ndt-overlay-panel` block at `libs/ngx-dev-toolbar/src/global-theme.scss:92-107` (same compound-selector + `contain` + `box-sizing` defensive pattern — extend that block's intent rather than introducing a new mechanism).

- [x] **T002** Add DOM-layout regression assertion for list-group inside overlay panel *(depends on T001)* — `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.spec.ts` | R008
  - **Do**: Extend the existing TestBed spec with one new `it('renders as flex column when mounted inside .ndt-overlay-panel', ...)` case. Mount `ToolbarListGroupComponent` inside a wrapper fixture whose host element has `class="ndt-overlay-panel"` (use a small test-host component with `<div class="ndt-overlay-panel"><ndt-list-group ...></ndt-list-group></div>`). Import the global stylesheet for the fixture (TestBed `providers` / `styles` or add via `document.head.appendChild` of a `<style>` tag sourced from the global-theme rules) so the defensive block applies. Then assert:
    - `getComputedStyle(listGroupEl).display === 'flex'`
    - `getComputedStyle(listGroupEl).flexDirection === 'column'`
    - (Optional) `getComputedStyle(headerEl).flexDirection === 'row'` to cover R002.
  - **Verify**:
    - `nx test ngx-dev-toolbar --testPathPattern=list-group.component.spec` → all pre-existing cases plus the new one pass.
    - Full suite: `nx test ngx-dev-toolbar` stays green (no cross-spec regressions).
    - If `jsdom` does not compute flex values (Jest default), fall back to asserting that the element has matching rules in `document.styleSheets` for the `.ndt-overlay-panel ndt-list-group` selector — document which form was used in an inline comment in the test.
  - **Leverage**: existing spec file structure at `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.spec.ts` (TestBed + fixture pattern already used for header-text, projection, collapse, aria-expanded cases — mirror that setup, just wrap the component in a test host).

---

## Progress

- Phase 1: T001–T002 [x]
