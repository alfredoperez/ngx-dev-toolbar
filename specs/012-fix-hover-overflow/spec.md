# Spec: Fix Hover Background Overflow on Toolbar Icons

**Branch**: 012-fix-hover-overflow | **Date**: 2026-03-07

## Summary

When hovering over tool buttons in the toolbar, the hover background rectangle extends beyond the pill-shaped toolbar container. This is most noticeable on the first and last icons where the rectangular hover bg (with 8px border-radius) overflows the toolbar's fully-rounded edges. The fix clips hover backgrounds on edge buttons to match the toolbar's pill shape.

## Requirements

- **R001** (MUST): Hover background on first/last toolbar buttons must not visually exceed the toolbar's pill-shaped border
- **R002** (MUST): Tooltips must remain fully visible and not be clipped
- **R003** (MUST): Fix must work for all four toolbar positions (top, bottom, left, right)

## Scenarios

### Horizontal Toolbar (bottom/top)

**When** user hovers the first (leftmost) or last (rightmost) tool button
**Then** the hover background is clipped to match the toolbar's rounded left/right edges

### Vertical Toolbar (left/right)

**When** user hovers the first (topmost) or last (bottommost) tool button
**Then** the hover background is clipped to match the toolbar's rounded top/bottom edges

## Out of Scope

- Changing tooltip positioning or behavior
- Modifying hover colors or opacity
