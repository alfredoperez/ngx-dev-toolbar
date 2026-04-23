# Spec: Add All Filter

**Slug**: 019-add-all-filter | **Date**: 2026-04-23

## Summary

Add an explicit **All** chip to the filter chip-group in the Feature Flags, App Features, and Permissions tools. Today the `all` state is implicit (no chip highlighted) and clicking an already-active chip silently resets to this invisible state — which users read as "my click broke the filter". An explicit "All" option makes the reset behavior discoverable and removes the stuck-filter bug caused by the handler ignoring the `'all'` value.

## Requirements

- **R001** (MUST): The Feature Flags, App Features, and Permissions tools MUST expose an **All** chip as the first option in their filter chip-group (ordered: All → Forced → Enabled/Granted → Disabled/Denied).
- **R002** (MUST): Clicking the **All** chip MUST set the tool's `activeFilter` signal to `'all'` and show every item in the list (no state-based filtering applied), regardless of which chip was previously active.
- **R003** (MUST): When `activeFilter` equals `'all'`, the **All** chip MUST appear visually active (`filter-segment--active` styling, `aria-checked="true"`), and no other chip in the group MUST appear active.
- **R004** (MUST): On first open of a tool (no persisted view state), the **All** chip MUST be the active chip (matching the `activeFilter` initial value of `'all'`).
- **R005** (MUST): Each tool's `onFilterChange(value)` handler MUST accept `'all'` as a valid value and update `activeFilter` accordingly — it must no longer silently drop unrecognized-but-valid filter values.
- **R006** (MUST): Clicking an already-active chip (including **All**) MUST leave the filter state on that chip — i.e., the chip stays visibly active and the filter stays applied. The implicit "click-to-deselect" toggle in `ToolbarToolHeaderComponent` MUST be removed or neutralized, since "All" now serves as the explicit reset affordance.
- **R007** (SHOULD): Filter view state persisted in localStorage MUST remain backwards-compatible — existing saved values of `'all'`, `'forced'`, `'enabled'`, `'disabled'`, `'granted'`, `'denied'` MUST all load without error and render the correct active chip.
- **R008** (SHOULD): Keyboard navigation (`ArrowLeft`/`ArrowRight`/`Home`/`End`) within the chip-group MUST include the **All** chip in the navigation cycle.

## Scenarios

### First-open state

**When** the user opens the Feature Flags tool for the first time (no localStorage state)
**Then** the **All** chip appears as the active chip, and all feature flags are listed

### Clicking "All" from a filtered state

**When** the user has the **Forced** chip active (showing only forced flags) and clicks the **All** chip
**Then** the **All** chip becomes the active chip, the **Forced** chip becomes inactive, and the list shows every flag

### Clicking the currently-active chip (regression case)

**When** the user has the **Forced** chip active and clicks **Forced** again
**Then** the **Forced** chip remains active and the list continues to show only forced flags (no silent reset to an invisible `all` state)

### Persistence across sessions

**When** the user sets the filter to **Enabled** in the App Features tool and reopens the tool in a new session
**Then** the **Enabled** chip is the active chip and only enabled features are shown

### Legacy persisted state

**When** localStorage contains a previously-saved view state with `filter: 'all'` (from before this change)
**Then** the tool loads without error and the **All** chip appears active

### Consistency across tools

**When** the user opens each of the three tools (Feature Flags, App Features, Permissions)
**Then** each tool's filter chip-group shows **All** as the leftmost option, followed by the tool's state-specific chips in their original order

## Non-Functional Requirements

- **NFR001** (MUST): The **All** chip MUST use the same visual styling, sizing, and spacing as existing filter chips — no layout regression within the tool header.
- **NFR002** (SHOULD): The chip-group MUST remain accessible: `role="radiogroup"` on the container, `role="radio"` + correct `aria-checked` on each chip, and keyboard navigation unaffected other than including the new chip.

## Out of Scope

- Changing the underlying filter logic (how items are filtered by state) — only the chip set and click-reset behavior change.
- Adding filter chips to tools that currently have none (i18n, Presets, Home, Network Mocker, Request Mocker).
- Introducing new filter states (e.g., a "Modified" or "Recent" filter) — only **All** is added.
- Redesigning the chip-group's visual style or converting it to a different control (dropdown, segmented switch, etc.).
- Renaming existing filter values in localStorage-persisted state (backwards-compatibility required).
