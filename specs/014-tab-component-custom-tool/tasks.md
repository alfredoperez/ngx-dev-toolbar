# Tasks: Tab Component & Custom Tool Demo

**Spec**: 014-tab-component-custom-tool | **Date**: 2026-04-10

---

## Phase 1 — Core Implementation

### T001: Create `ToolbarTabComponent` ✅

Create `libs/ngx-dev-toolbar/src/components/tabs/tab.component.ts` — minimal standalone component with `label` input (string), `isActive` signal (set by parent), and `<ng-content>` wrapped in `@if (isActive())`. OnPush, signal-based.

**Acceptance**: Component compiles, accepts `label` input, conditionally renders projected content based on `isActive`.

---

### T002: Create `ToolbarTabsComponent` with styling ✅

Create `libs/ngx-dev-toolbar/src/components/tabs/tabs.component.ts` and `tabs.component.scss`.

- Use `contentChildren(ToolbarTabComponent)` to discover tab children
- Maintain `activeIndex = signal(0)` for active tab tracking
- Render tab bar from children's labels with `role="tablist"` / `role="tab"` / `role="tabpanel"` ARIA attributes
- Arrow key navigation between tabs, Enter/Space to activate
- Active tab highlighted with bottom border using `--ndt-text-primary`
- Defensive CSS: explicit `gap`, `padding`, `border: none`, `background: transparent` on tab buttons, `padding-top` on panel

**Acceptance**: Tabs render, clicking/keyboard switches active tab, only active tab content is visible, ARIA roles present.

---

### T003: Export tab components from public API ✅

Modify `libs/ngx-dev-toolbar/src/index.ts` — export `ToolbarTabsComponent` and `ToolbarTabComponent`.

**Acceptance**: Both components importable via `ngx-dev-toolbar` package.

---

### T004: Create custom tool demo component ✅

Create `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool-demo/custom-tool-demo.component.ts` and `.scss`.

- Wrap in `ToolbarToolComponent` with icon and title
- **Finder tab**: `ndt-select` (entity types: User, Order, Product) + `ndt-button` "Find" in a row. Below, `ndt-list-item` entries populated from mock data on button click.
- **Maker tab**: `ndt-select` (entity types) + `ndt-button` "Create" in a row. Placeholder content below.
- Mock data as simple arrays in the component file

**Acceptance**: Custom tool renders in toolbar, both tabs functional, Finder shows mock results on "Find" click.

---

### T005: Register custom tool demo in demo app ✅

Modify `apps/ngx-dev-toolbar-demo/src/app/app.component.ts` — import and render the custom tool demo component.

**Acceptance**: Demo app shows the custom tool in the toolbar, tabs work end-to-end.

---

## Phase 2 — Quality

### T006: Unit tests for tab components — `test-expert` [P][A] ✅

Add tests for `ToolbarTabsComponent` and `ToolbarTabComponent`:

- Tab switching updates active content
- Default first tab is active
- Keyboard navigation (arrow keys, Enter/Space)
- ARIA attributes set correctly
- Only active tab content is rendered

**Acceptance**: All tests pass via `nx test ngx-dev-toolbar`.

---
