# Spec: Home Tool Redesign

**Slug**: 022-home-tool-redesign | **Date**: 2026-05-08

## Summary

Tighten the Home Tool surface so it reads like a focused settings panel (modeled on Vercel Toolbar's Preferences) instead of a mixed grid of footer links and a wide segmented control. Pair this with three small chrome polish items — close-button hover, sidebar-mode tooltip direction, and a header-and-controls review — so the toolbar window feels coherent at every position.

## Requirements

- **R001** (MUST): Home Tool footer link row contains only the entries that earn their place daily; the lower-value resources are removed (final list to be one of: Docs, Bug report — others removed).
- **R002** (MUST): The toolbar position control reads as a settings row consistent with the Export / Import / Reset rows: a left-aligned label + description with a single right-aligned control. The current full-width segmented bar is replaced with an inline control (compact segmented control or dropdown/select) sized to its content, not stretched edge-to-edge.
- **R003** (MUST): In sidebar mode (`sidebar-left` and `sidebar-right`), `ndt-tool-button` tooltips appear horizontally adjacent to the button on the **inward** side of the viewport — never on the side that would clip outside the screen edge.
- **R004** (MUST): The window close button (`.control--close`) hover state is visually consistent with the other header controls (minimize / maximize). The current red-tinted `--ndt-hover-danger` background on close-button hover is replaced with the same subtle neutral hover treatment used by sibling controls, or a clearly intentional softer accent.
- **R005** (SHOULD): The Home Tool settings rows share a single layout pattern (title + helper text + right-aligned control) reminiscent of the Vercel Preferences screenshot, with no row breaking the rhythm.
- **R006** (SHOULD): The window header (title, optional description, controls) is reviewed for spacing and alignment in both default and `--compact` (sidebar) layouts; controls are vertically centered against the title in compact mode and balanced against the title block in default mode.
- **R007** (MAY): A divider or top-border between the position control and the export/import/reset cluster groups "Layout" away from "Data" so the panel feels grouped, not flat.

## Scenarios

### Home Tool with reduced footer

**When** the user opens the Home Tool
**Then** the footer link strip shows only the curated set (R001) — surplus links (Suggestions, Star, Community, etc., depending on what is kept) are gone, the strip's vertical weight is lighter, and the panel ends with a calm closing row instead of a busy band of icons.

### Position control as a settings row

**When** the user views the Home Tool
**Then** the toolbar position selector is rendered with the same `instruction` row layout as Export / Import / Reset (label + description on the left, control on the right) instead of a stretched segmented bar, and the row aligns visually with the others.

### Tooltip direction in sidebar mode

**When** the toolbar is in `sidebar-right` position and the user hovers a tool button
**Then** the tooltip appears to the **left** of the button (toward the viewport interior), fully visible — not clipped against the right edge.

**When** the toolbar is in `sidebar-left` position and the user hovers a tool button
**Then** the tooltip appears to the **right** of the button (toward the viewport interior), fully visible — not clipped against the left edge.

### Close button hover

**When** the user hovers the window close button (`×`) in any toolbar position
**Then** the hover background and color match the visual language of the minimize/maximize hovers (or a single, intentional close-only treatment that doesn't read as an error). The button's hover state does not feel like a destructive warning popping out of an otherwise calm header.

### Header in compact (sidebar) mode

**When** the toolbar is in a sidebar position and a tool window is open
**Then** the header title and the right-aligned controls are vertically aligned, the controls do not visually overshoot the title row, and the close `×` glyph is centered inside its hit area.

## Non-Functional Requirements

- **NFR001** (MUST): All hover and focus states remain keyboard-reachable. `:focus-visible` outlines are preserved on the new position control and on the home-tool footer links.
- **NFR002** (SHOULD): Tooltip direction logic does not regress non-sidebar positions (`top`, `bottom`, `left`, `right`) — those continue to use the existing top/bottom/left/right tooltip treatment.
- **NFR003** (SHOULD): Color contrast on the new close-button hover meets WCAG AA against both light and dark themes.
- **NFR004** (MAY): No new dependencies introduced. Changes are CSS-and-template-first; logic changes are limited to the tooltip-direction mapping and (if needed) the position-row template/control choice.

## Out of Scope

- Adding new Home Tool features (e.g., theme toggle, notifications, accessibility audit) like the ones shown in the Vercel screenshot — the screenshot is a visual reference for **layout and density**, not a feature spec.
- Renaming or restructuring other tools (Feature Flags, App Features, Permissions, Presets, i18n, etc.).
- Theming, palette, or design-token changes beyond what's required to fix the close-button hover.
- Replacing the icon set or adopting a new icon library.
- Changes to keyboard shortcuts or the master `Ctrl+Shift+D` toggle.
- Documentation site updates — those follow the implementation in a separate pass.
