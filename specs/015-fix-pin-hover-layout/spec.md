# Spec: Fix Pin Hover Layout

**Slug**: 015-fix-pin-hover-layout | **Date**: 2026-04-14

## Summary

The pin button on list items has poor hover layout: its hover indicator overlaps the title text instead of staying within the pin's gutter area. Fix the button sizing and hover treatment so the pin remains visually contained and doesn't bleed into list-item content.

## Requirements

- **R001** (MUST): Pin button hover state must not visually overlap or interfere with the list-item title or description text.
- **R002** (MUST): Pin button must have a defined, consistent hit area with padding sized appropriately for the gutter position.
- **R003** (SHOULD): Pin button hover affordance remains discoverable (opacity change, subtle background, or equivalent) without a heavy circular/box hover that extends beyond the icon bounds.
- **R004** (SHOULD): Pinned state remains clearly distinguishable from unpinned/hover states.

## Scenarios

### Hovering an unpinned list item
**When** the user hovers a list item
**Then** the pin icon appears in the left gutter with its hover treatment fully contained in the gutter area — no visual bleed into the title row.

### Hovering the pin button directly
**When** the user hovers the pin button itself
**Then** the button shows a subtle emphasized state (opacity/background) confined to the button's own bounds, with padding sized to match the icon.

### Pinned item at rest
**When** an item is pinned and not hovered
**Then** the pin icon is fully visible in the gutter, styled as active/pinned, with no hover effect applied.

## Out of Scope

- Changing pin behavior or position (still in left gutter).
- Redesigning the list-item layout beyond pin-button styling.
