# Spec: Fix Grouped Items Layout

**Slug**: 018-fix-grouped-items-layout | **Date**: 2026-04-22

## Summary

The collapsible groups introduced in #44 (flags, app features, permissions tools) render correctly in the demo app but break when the toolbar is embedded in a host application with CSS resets (Tailwind Preflight, Normalize, Bootstrap, etc.). Group headers bunch at the top of the panel, a blank gap appears, and the items render detached underneath — because tool overlays are attached via CDK to `document.body`, outside the toolbar's Shadow DOM, where host CSS can defeat `:host`-scoped layout rules on `ndt-list-group`. This spec captures the defensive-CSS fix that must ship so the grouped layout survives any reasonable host environment.

## Requirements

- **R001** (MUST): When `ndt-feature-flags-tool`, `ndt-app-features-tool`, or `ndt-permissions-tool` renders grouped items inside the CDK overlay, each `ndt-list-group` MUST stack vertically with its header immediately followed by its item list, regardless of host-app global CSS (Tailwind Preflight, Normalize, Bootstrap reboot, raw `* { display: block }` resets).
- **R002** (MUST): The header, chevron, and count inside each group header MUST remain on a single horizontal row (flex row) with correct alignment when rendered outside Shadow DOM.
- **R003** (MUST): Expanded group content MUST flow directly beneath its own header as a vertical stack — no blank vertical gap separating headers from items, no items drifting to the bottom of the scroll region.
- **R004** (MUST): Collapsing/expanding a group MUST continue to work (item list hides/shows) and the chevron rotation MUST animate correctly in the host-app environment.
- **R005** (MUST): Pinned / named group / "Other" group composition MUST preserve the same vertical order it has today in the demo: Pinned → named groups (alphabetical) → Other.
- **R006** (SHOULD): The fix SHOULD use the existing "defensive CSS inside overlay" pattern already applied to `.ndt-overlay-panel` in `global-theme.scss` (unscoped selectors, `contain: layout style`, explicit box-sizing) rather than introduce a new mechanism.
- **R007** (SHOULD): The fix SHOULD NOT increase the SCSS bundle beyond the budget (the presets tool is already close to the limit — see CLAUDE.md Known Issues).
- **R008** (MAY): Existing unit tests for `ToolbarListGroupComponent` MAY be extended with a DOM-layout assertion that verifies `ndt-list-group` computes `display: flex` / `flex-direction: column` when rendered inside an `.ndt-overlay-panel` container.

## Scenarios

### Grouped tool loaded inside a host app with Tailwind Preflight

**When** a consuming application imports `@ngx-dev-toolbar` into a page that already loads Tailwind's Preflight (which normalizes custom-element display and button styles), and the user opens the App Features tool with 3+ features configured across different groups
**Then** each group header renders as a compact row (chevron · name · count), followed immediately below by its items, with no blank gap, no stacked/overlapping headers at the top, and no orphan items drifting to the bottom of the scroll area

### Grouped tool loaded inside a host app with a harsher CSS reset

**When** the host app applies a broader reset such as `* { margin: 0; padding: 0; box-sizing: border-box; display: revert; }` or Bootstrap's reboot
**Then** the group layout still behaves exactly as in the demo — the overlay panel's defensive rules win over the reset rules because specificity and rule order guarantee it

### Collapse / expand interaction outside Shadow DOM

**When** the user clicks a group header inside the overlay (rendered outside the shadow root) in a host-app environment
**Then** the items belonging to that group hide, the chevron rotates to the collapsed state, and the persisted `collapsedGroups` set in localStorage updates — all matching the demo behavior

### Multi-group scroll overflow

**When** a tool has enough items that the list needs to scroll (the `.list-container` has `overflow-y: auto`)
**Then** all groups scroll together vertically as a single cohesive stack — headers do NOT become sticky, do NOT float, and do NOT detach from their content rows

### Pinned group and "Other" bucket

**When** the tool has both pinned items and ungrouped items
**Then** the "Pinned" group header renders first, named groups render in the middle, and the "Other" bucket renders last — each with its own header-then-items block, still without blank gaps

## Non-Functional Requirements

- **NFR001** (MUST): The fix MUST not regress the demo app — the visual output of grouped tools inside the demo must be pixel-equivalent to the current main branch (or intentionally tighter, never worse).
- **NFR002** (MUST): The fix MUST NOT bleed any CSS into the host application's DOM outside the overlay panel — selectors MUST be scoped to `.ndt-overlay-panel` (or descendants of `ndt-toolbar`).
- **NFR003** (SHOULD): Accessibility — the `aria-expanded`, `aria-label`, and keyboard-focus styling on group headers MUST continue to work in the host-app environment (host CSS sometimes resets `outline`; defensive rules should include `focus-visible` protection if needed).

## Out of Scope

- Rewriting the toolbar's rendering strategy to keep tools inside the Shadow DOM (would require replacing CDK Overlay).
- Changing the visual design of the group header (chevron icon, typography, spacing) beyond the minimum needed to stay correct.
- Fixing unrelated defensive-CSS regressions in other tools (presets, i18n, network-mocker) unless they use the same primitives and get a free fix from the same SCSS changes.
- Adding a new "fully framework-isolated" mode (e.g., rendering everything inside an iframe).
