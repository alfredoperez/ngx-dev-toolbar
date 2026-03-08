# Tasks: Fix Hover Background Overflow on Toolbar Icons

## Phase 1 — Core

- [x] **T001** · Clip hover overflow on first/last toolbar children
  - **Do**: In `libs/ngx-dev-toolbar/src/toolbar.component.scss`, inside each position block (`&--bottom`, `&--top`, `&--left`, `&--right`), add `> :first-child` and `> :last-child` rules with `overflow: hidden` and appropriate `border-radius` (9999px on outer edges, 0 on inner edges). Horizontal positions use left/right rounding; vertical positions use top/bottom rounding.
  - **Verify**: `nx build ngx-dev-toolbar` passes; hover first and last toolbar icons — background stays within pill shape; tooltips remain visible
