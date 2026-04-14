# Plan: Tab Component & Custom Tool Demo

**Spec**: 014-tab-component-custom-tool | **Date**: 2026-04-10

---

## Approach

Build a reusable `ndt-tabs` / `ndt-tab` component pair in the library's component system, following the same standalone + OnPush + signal-based patterns as existing components (card, step-view, select). Then create a custom tool demo in the demo app that uses these tabs to showcase Finder and Maker views with `ndt-select`, `ndt-button`, and `ndt-list-item`.

The tab component uses Angular's `contentChildren` query to discover `ndt-tab` children, tracks the active index via a signal, and projects only the active tab's content. This mirrors how `ndt-step-view` already manages multi-step content but with a horizontal tab bar instead of step navigation.

---

## Technical Context

- **Component pattern**: Standalone, OnPush, `input()`/`output()` functions, signals for state, inline templates for small components.
- **Content projection**: `contentChildren(ToolbarTabComponent)` to discover tabs, similar to `step-view` discovering `ndtStep` directives.
- **Styling**: SCSS with `--ndt-*` design tokens, defensive CSS (explicit spacing, `gap`, no browser-default reliance).
- **Keyboard a11y**: `role="tablist"` / `role="tab"` / `role="tabpanel"`, arrow key navigation, `aria-selected`.

---

## Flow

```
┌─────────────────────────────────────────┐
│ ndt-tabs                                │
│ ┌──────────┬──────────┬───────────────┐ │
│ │ Tab 1 ●  │ Tab 2    │ ...           │ │  ← tab bar (role="tablist")
│ └──────────┴──────────┴───────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  <ng-content> of active ndt-tab     │ │  ← tab panel (role="tabpanel")
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Files to Create

| # | Path | Purpose |
|---|------|---------|
| 1 | `libs/ngx-dev-toolbar/src/components/tabs/tabs.component.ts` | `ToolbarTabsComponent` — container with tab bar + content switching |
| 2 | `libs/ngx-dev-toolbar/src/components/tabs/tabs.component.scss` | Tab bar and panel styling using design tokens |
| 3 | `libs/ngx-dev-toolbar/src/components/tabs/tab.component.ts` | `ToolbarTabComponent` — individual tab with `label` input and content projection |
| 4 | `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool-demo/custom-tool-demo.component.ts` | Demo custom tool using tabs (Finder + Maker) |
| 5 | `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool-demo/custom-tool-demo.component.scss` | Styles for the custom tool demo |

## Files to Modify

| # | Path | Change |
|---|------|--------|
| 1 | `libs/ngx-dev-toolbar/src/index.ts` | Export `ToolbarTabsComponent` and `ToolbarTabComponent` |
| 2 | `apps/ngx-dev-toolbar-demo/src/app/app.component.ts` | Import and render the custom tool demo component |

---

## Implementation Notes

### Tab Component Design

- **`ToolbarTabComponent`**: Minimal component with a `label` input (string) and an `isActive` signal (set by parent). Uses `@if (isActive())` to conditionally render its `<ng-content>`.
- **`ToolbarTabsComponent`**: Uses `contentChildren(ToolbarTabComponent)` to query children. Maintains `activeIndex = signal(0)`. On tab click, sets the new active index and updates each child's `isActive` accordingly via an `effect()`.
- **Tab bar**: Rendered from the tab children's labels. Active tab gets a bottom border highlight using `--ndt-text-primary` color and `--ndt-border-primary`.

### Keyboard Navigation (R008)

- Tab bar buttons use `role="tab"` with `aria-selected`.
- Left/Right arrow keys move focus between tabs.
- Enter/Space activates the focused tab.
- Panel uses `role="tabpanel"` with `aria-labelledby` linking to the active tab.

### Custom Tool Demo

- Registers as a custom tool using `ToolbarToolComponent` wrapper with an icon and title.
- **Finder tab**: `ndt-select` with entity types + `ndt-button` "Find" in a row. Below, an `ndt-list` with `ndt-list-item` entries populated from mock data on button click.
- **Maker tab**: `ndt-select` with entity types + `ndt-button` "Create" in a row. Placeholder content below for future expansion.
- Mock data stored as simple arrays in the component file (no service needed for demo).

### Defensive CSS

- Tab bar: `display: flex; gap: var(--ndt-spacing-sm);` with explicit padding.
- Tab buttons: explicit `padding`, `border: none`, `background: transparent`, `cursor: pointer`.
- Active indicator: `border-bottom: 2px solid var(--ndt-text-primary)` on active tab.
- Panel: `padding-top: var(--ndt-spacing-md)` to prevent content touching tab bar.

---

## Risks

| Risk | Mitigation |
|------|------------|
| `contentChildren` timing — tabs might not be available in `ngOnInit` | Use `afterNextRender` or `effect()` to react to children changes; `contentChildren` with signals updates automatically |
| Tab content re-mounting on switch could lose state | Use `@if` for simplicity (per spec: no state preservation needed); document that lazy rendering is out of scope |
| Demo app import path changes | Use `ngx-dev-toolbar` package import, not relative paths |
