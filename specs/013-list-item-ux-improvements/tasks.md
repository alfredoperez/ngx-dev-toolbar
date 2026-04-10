# Tasks: List Item UX Improvements

**Plan**: [plan.md](./plan.md) | **Date**: 2026-04-10

---

## Phase 1: Core Implementation (Sequential)

- [x] **T001** Increase list item title font size — `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` | R001
  - **Do**: Change `.list-item .info h3` font-size from `var(--ndt-font-size-xs)` to `var(--ndt-font-size-sm)`
  - **Verify**: List item titles visually larger in demo app

- [x] **T002** Reposition pin button to not occupy space — `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` | R002, R003, R004
  - **Do**: Change `.pin-button` to use `position: absolute` with negative left offset or overlay positioning so it doesn't take up flex space. Ensure `.list-item` has `position: relative` (already set). Adjust opacity transitions to keep existing hover reveal behavior. Keep pinned state always visible.
  - **Verify**: Pin button doesn't push content; appears on hover; stays visible when pinned; no layout shift
  - **Leverage**: Current opacity-based transitions in `list-item.component.scss` (lines 86-107)

---

## Progress

- Phase 1: T001–T002 [x]
