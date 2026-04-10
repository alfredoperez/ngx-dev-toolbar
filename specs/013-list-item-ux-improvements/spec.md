# Spec: List Item UX Improvements

**Slug**: 013-list-item-ux-improvements | **Date**: 2026-04-10

## Summary

Improve list item readability by increasing the title font size from `--ndt-font-size-xs` to `--ndt-font-size-sm`. Reduce the pin button's visual footprint by hiding it by default and only revealing it on list item hover (already partially implemented — needs refinement to avoid layout shift and reduce space occupation when hidden).

## Requirements

- **R001** (MUST): List item title (`h3`) uses `--ndt-font-size-sm` instead of `--ndt-font-size-xs`
- **R002** (MUST): Pin button is hidden by default and only appears on list item hover or when the item is pinned
- **R003** (MUST): Pin button does not reserve space in the layout when hidden (use absolute positioning or conditional rendering to avoid occupying row space)
- **R004** (SHOULD): No layout shift when pin button appears on hover

## Scenarios

### Bigger font in list items

**When** a list item renders
**Then** the title text is displayed at `--ndt-font-size-sm` size

### Pin button visibility on hover

**When** the user hovers over a list item that is not pinned
**Then** the pin button fades in without shifting the layout

### Pin button visibility when pinned

**When** a list item is pinned
**Then** the pin button is always visible regardless of hover state

### Pin button hidden by default

**When** a list item is not hovered and not pinned
**Then** the pin button is not visible and does not occupy horizontal space

## Out of Scope

- Changes to description font size
- Changes to pin icon design
- Changes to list item spacing or padding
