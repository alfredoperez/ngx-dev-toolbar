# Plan: List Item UX Improvements

**Spec**: [spec.md](./spec.md) | **Date**: 2026-04-10

## Approach

Increase the list item title font size in SCSS and reposition the pin button using absolute positioning so it overlays rather than occupying flex row space. The pin button already has opacity-based show/hide on hover — we add `position: absolute` and `width: 0`/`overflow: visible` so it doesn't push content.

## Files to Change

### Modify

- `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` — Increase h3 font-size to `--ndt-font-size-sm`; change pin-button positioning to absolute so it doesn't occupy flex space when hidden
- `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts` — Potentially adjust template structure if needed for pin button overlay positioning
