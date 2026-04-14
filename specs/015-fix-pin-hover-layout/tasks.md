# Tasks: Fix Pin Hover Layout

**Plan**: [plan.md](./plan.md) | **Date**: 2026-04-14

---

## Phase 1: Core Implementation (Sequential)

- [x] **T001** Constrain pin-button size & padding — `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` | R002
  - **Do**: Add explicit `width`, `height`, `padding`, and `box-sizing` to `.pin-button` so it occupies only the gutter area. Use `--ndt-spacing-xs` scale.
  - **Verify**: Inspect demo — pin button visually matches the icon size with small padding; does not extend under title.

- [x] **T002** Refine pin hover treatment *(depends on T001)* — `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` | R001, R003
  - **Do**: Override/suppress the underlying `ndt-icon-button` ghost hover background inside `.pin-button` (via `::ng-deep .icon-button`); keep opacity/color as the hover affordance, contained within the button bounds.
  - **Verify**: Hovering pin shows emphasis only inside its own box; hovering list item shows pin at reduced opacity without any overlay on title/description.

- [x] **T003** Validate pinned state *(depends on T002)* — `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` | R004
  - **Do**: Confirm `.pin-button--pinned` styles still produce a clearly distinct active state (full opacity, primary text color) given the new base/hover rules; adjust if needed.
  - **Verify**: Pinned items read as active at rest and on hover; matches existing visual language.

---

## Progress

- Phase 1: T001–T003 [x]
