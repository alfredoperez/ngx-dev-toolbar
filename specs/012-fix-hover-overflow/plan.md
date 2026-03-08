# Plan: Fix Hover Background Overflow on Toolbar Icons

**Spec**: specs/012-fix-hover-overflow/spec.md | **Date**: 2026-03-07

## Approach

Add `overflow: hidden` and matching pill border-radius to the first and last direct children of `.ndt-toolbar` using `:first-child` / `:last-child` pseudo-selectors. This clips the inner tool-button hover backgrounds to the toolbar's pill shape without affecting the toolbar's own `overflow: visible` (preserving tooltip visibility).

## Files to Change

- `libs/ngx-dev-toolbar/src/toolbar.component.scss` — Add first/last child border-radius + overflow rules per toolbar position

## Phase 1 Tasks

| ID | Do | Verify |
|----|-----|--------|
| T001 | Add `:first-child` / `:last-child` CSS rules with `overflow: hidden` and matching `border-radius` inside each `&--bottom`, `&--top`, `&--left`, `&--right` block | Hover first/last icons — background stays within toolbar pill shape; tooltips still visible |
