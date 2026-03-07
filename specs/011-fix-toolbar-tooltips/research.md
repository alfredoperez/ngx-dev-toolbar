# Research: Fix Toolbar Tooltips

**Branch**: `011-fix-toolbar-tooltips` | **Date**: 2026-03-07

## R1: Root Cause of Duplicate Tooltips

**Decision**: Rename the `title` input on `ToolbarToolButtonComponent` to avoid collision with the native HTML `title` attribute.

**Rationale**: The `ToolbarToolButtonComponent` declares `readonly title = input.required<string>()`. When Angular binds `[title]="title()"` in the parent template (`toolbar-tool.component.ts:41`), Angular sets the `title` DOM attribute on the `<ndt-tool-button>` host element. The native HTML `title` attribute causes browsers to render their built-in tooltip on hover, creating a second tooltip alongside the custom one.

**Alternatives considered**:
- Using `HostBinding` to explicitly set `title` to `null` — fragile, fighting Angular's attribute binding
- Using `[attr.title]="null"` in template — requires changes in every usage site
- **Chosen**: Rename input to `toolTitle` or `label` to avoid the conflict entirely. Clean, no side effects.

## R2: Tooltip Positioning Strategy

**Decision**: Replace `bottom: calc(100% + 1.2rem)` with position-aware CSS classes that place the tooltip adjacent to the toolbar edge with a small gap (~6px).

**Rationale**: The current tooltip is absolutely positioned with a fixed `bottom` offset relative to the button. This places it far above the toolbar. The gap should be reduced to create a tight visual connection (similar to shadcn/Radix: ~6-8px gap). The tooltip direction must change based on toolbar position (top/bottom/left/right).

**Alternatives considered**:
- Using Angular CDK Overlay for tooltip positioning — too heavy for simple tooltips; CDK Overlay is already used for tool windows
- Using CSS `anchor()` positioning — not yet widely supported in browsers
- **Chosen**: CSS classes driven by a `position` input passed from the toolbar state. Each position variant uses a different offset direction (top/bottom/left/right of the button).

## R3: Arrow/Caret Implementation

**Decision**: Use a CSS `::after` pseudo-element on the tooltip to render a triangular arrow pointing toward the icon.

**Rationale**: CSS triangles via `border` tricks are the standard approach for tooltip arrows. They require no additional DOM elements, are lightweight, and inherit the tooltip's background color. The arrow direction must flip based on toolbar position.

**Alternatives considered**:
- Inline SVG arrow — more markup, harder to keep color in sync
- `clip-path` on the tooltip container — complex, less browser support
- **Chosen**: `::after` pseudo-element with transparent borders. Arrow direction controlled by CSS class matching toolbar position.

## R4: Theme-Aware Inverted Color Scheme

**Decision**: Add new CSS custom properties `--ndt-tooltip-bg` and `--ndt-tooltip-text` that invert relative to the toolbar's theme.

**Rationale**: The toolbar currently only uses light theme (hardcoded in `toolbar.component.ts:118`). However, the design system has dark theme tokens. For the tooltip, we need inverted colors: in light theme (current), the tooltip should have a dark background with light text. New custom properties keep the tooltip styling isolated and future-proof for when dark theme support is added.

**Alternatives considered**:
- Hardcoding dark colors directly in tooltip SCSS — not maintainable, doesn't adapt if dark theme is later enabled
- Using existing dark theme tokens via a CSS class toggle — adds complexity for a small scope
- **Chosen**: New dedicated tooltip color custom properties set in the `devtools-theme` mixin and global styles. Light theme: `--ndt-tooltip-bg` = dark, `--ndt-tooltip-text` = white. Dark theme (future): inverted.

## R5: Hover Containment Strategy

**Decision**: Apply `overflow: hidden` on the toolbar's tool button row and use `border-radius` inheritance to clip hover backgrounds at the toolbar edges.

**Rationale**: The toolbar has `overflow: visible` (needed for tooltips to render outside). The hover backgrounds on tool buttons extend to the full rectangular button area, which at the edges spills past the toolbar's `border-radius: 9999px`. The solution is to separate concerns: the toolbar container keeps `overflow: visible` for tooltips, but an inner container for the buttons uses `overflow: hidden` with matching `border-radius`.

**Alternatives considered**:
- Applying `border-radius` to first/last tool buttons — fragile, depends on which tools are visible
- Using `clip-path` on the toolbar — clips everything including tooltips
- **Chosen**: Inner container approach OR applying `border-radius` to the `.ndt-toolbar` flex container children via `overflow: hidden` on the toolbar itself while positioning tooltips outside (since tooltips are absolutely positioned inside Shadow DOM, they respect the stacking context differently).

## R6: Tooltip Visibility During Peeking State

**Decision**: Gate tooltip display on the toolbar's `isVisible` signal from `ToolbarStateService`.

**Rationale**: The toolbar has a peeking state where it's partially visible (`isHidden: true` but not `isCompletelyHidden`). Tooltips should only appear when `isVisible()` returns `true`. The `ToolbarToolButtonComponent` already injects `ToolbarStateService` and has access to `isToolbarVisible`. The `isTooltipVisible` computed signal should incorporate this check.

**Alternatives considered**:
- CSS-only approach using `opacity` or `visibility` transitions — doesn't prevent the tooltip from being in the DOM
- **Chosen**: Extend the `isTooltipVisible` computed to include `&& this.isToolbarVisible()` check.

## R7: `data-tooltip` Attribute Mechanism

**Decision**: Remove the `[attr.data-tooltip]` binding from `toolbar-tool.component.ts` and pass tooltip text directly via the renamed input.

**Rationale**: Currently, `toolbar-tool.component.ts:39` sets `[attr.data-tooltip]="title()"` on a wrapper div. The `tool-button.component.ts:91-96` reads this attribute from the parent element via `getAttribute('data-tooltip')`. This indirect mechanism is unnecessary — the tooltip text can be passed directly as an input. Removing the data attribute simplifies the code and eliminates a potential source of native browser tooltip confusion.

**Alternatives considered**:
- Keeping the data attribute mechanism — no benefit, adds indirection
- **Chosen**: Direct input binding. The button component already receives `title` (to be renamed). Use that directly for the tooltip text.
