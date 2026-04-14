# Plan: Fix Pin Hover Layout

**Spec**: [spec.md](./spec.md) | **Date**: 2026-04-14

## Approach

Adjust the `.pin-button` styling in `list-item.component.scss` so the button has a constrained size, explicit padding, and a hover treatment that stays within its own bounds. Consider disabling the underlying `ndt-icon-button` ghost hover background (via a modifier or `::ng-deep`) and relying on opacity/color shifts instead, so hover never spills into the list-item title region.

## Files to Change

- `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.scss` — refine `.pin-button` sizing, padding, and hover styles; suppress/override the icon-button's default hover background that leaks into adjacent content.
- `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts` — (only if needed) pass a variant/class to `ndt-icon-button` to disable its hover background.
