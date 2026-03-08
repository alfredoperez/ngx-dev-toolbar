# Feature Specification: Fix Toolbar Tooltips

**Feature Branch**: `011-fix-toolbar-tooltips`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "the hover is spilling beyond the limits of the toolbar, there are two tooltips and the tooltip (component) is way above and doesnt look that good..compare to the attached"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single, Clean Tooltip on Hover (Priority: P1)

When a developer hovers over a tool icon in the toolbar, they should see exactly one tooltip label identifying the tool. Currently, two tooltips appear: a native browser tooltip (from the HTML `data-tooltip`/`title` attribute) and a custom-styled tooltip component. Only the custom tooltip should be displayed.

**Why this priority**: Duplicate tooltips are the most visually jarring issue and create a confusing, unpolished experience. This is the most noticeable bug.

**Independent Test**: Can be tested by hovering over any tool icon and confirming only one tooltip appears.

**Acceptance Scenarios**:

1. **Given** the toolbar is visible, **When** a developer hovers over a tool icon, **Then** exactly one tooltip appears showing the tool's name.
2. **Given** the toolbar is visible, **When** a developer hovers over a tool icon, **Then** no native browser tooltip (from HTML `title` or similar attributes) is displayed.

---

### User Story 2 - Tooltip Positioned Close to Toolbar (Priority: P1)

The tooltip should appear directly adjacent to the toolbar, not floating far above it. The tooltip should include a small directional arrow/caret pointing toward the icon (shadcn/Radix tooltip style), making the visual connection between tooltip and icon unmistakable. The overall feel should be similar to the Vercel Toolbar and shadcn/Radix tooltip reference designs.

**Why this priority**: The current positioning makes the tooltip look disconnected and unprofessional. This is equally important to the duplicate tooltip issue.

**Independent Test**: Can be tested by hovering over a tool icon and verifying the tooltip appears within a small gap of the toolbar edge.

**Acceptance Scenarios**:

1. **Given** the toolbar is positioned at the bottom of the screen, **When** a developer hovers over a tool icon, **Then** the tooltip appears just above the toolbar with a small, consistent gap (visually adjacent, not floating far away).
2. **Given** the toolbar is positioned at any edge (top, bottom, left, right), **When** a developer hovers over a tool icon, **Then** the tooltip appears on the outer side of the toolbar (above for bottom, below for top, etc.) with consistent spacing.

---

### User Story 3 - Tooltip Contained Within Visual Bounds (Priority: P2)

The hover effect and tooltip should not visually spill or overflow beyond the toolbar's rounded boundaries. The toolbar should maintain its clean, contained appearance during hover interactions.

**Why this priority**: While less critical than the duplicate/positioning issues, visual overflow makes the toolbar look unfinished. This improves overall polish.

**Independent Test**: Can be tested by hovering over tool icons at the edges of the toolbar and verifying no visual artifacts extend beyond the toolbar's rounded borders.

**Acceptance Scenarios**:

1. **Given** the toolbar is visible, **When** a developer hovers over the first or last tool icon, **Then** the hover background effect does not extend beyond the toolbar's rounded corners.
2. **Given** the toolbar is visible, **When** a developer hovers over any tool icon, **Then** only the tooltip (positioned outside the toolbar) extends beyond the toolbar bounds; the hover background stays contained.

---

### Edge Cases

- What happens when the toolbar is in its partially-hidden (peeking) state and the user hovers to reveal it? Tooltips should only appear once the toolbar is fully visible.
- What happens when the toolbar is positioned at a screen edge and a tooltip would extend off-screen? The tooltip should remain within the viewport.
- What happens when a tool's overlay window is open? Tooltips should not appear for the active tool (current behavior, should be preserved).

## Clarifications

### Session 2026-03-07

- Q: Should the tooltip include a directional arrow/caret pointing toward the icon (like shadcn/Radix tooltips)? → A: Yes, include an arrow/caret pointing from the tooltip toward the icon.
- Q: What color scheme should the tooltip use? → A: Theme-aware inverted — dark tooltip in light theme, light tooltip in dark theme (always high-contrast against the toolbar).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display exactly one tooltip per tool icon on hover (no duplicate native + custom tooltips).
- **FR-002**: System MUST NOT render native browser tooltips (via HTML `title` attribute or similar) on toolbar tool icons.
- **FR-003**: Tooltip MUST appear adjacent to the toolbar edge with a small, consistent gap (similar to the Vercel Toolbar reference).
- **FR-004**: Tooltip position MUST adapt based on toolbar placement (above for bottom toolbar, below for top, right for left, left for right).
- **FR-005**: Hover background effects on tool icons MUST be visually contained within the toolbar's rounded borders.
- **FR-006**: Tooltips MUST NOT appear for the currently active/selected tool (preserve existing behavior).
- **FR-007**: Tooltips MUST NOT appear while the toolbar is in the partially-hidden (peeking) state; they should only show when the toolbar is fully visible.
- **FR-008**: Tooltip MUST include a small directional arrow/caret pointing toward the trigger icon (shadcn/Radix tooltip style). The arrow direction MUST adapt to match the tooltip's position relative to the toolbar.
- **FR-009**: Tooltip MUST use a theme-aware inverted color scheme — dark background with light text in light theme, light background with dark text in dark theme — to ensure high contrast against the toolbar at all times.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Hovering over any tool icon produces exactly one tooltip, with zero duplicate labels visible at any time.
- **SC-002**: The tooltip gap from the toolbar edge is visually consistent across all four toolbar positions (top, bottom, left, right).
- **SC-003**: No visual overflow of hover backgrounds beyond the toolbar's rounded corners on any tool icon.
- **SC-004**: 100% of tool icons show correctly positioned, single tooltips when hovered in all toolbar positions.

## Assumptions

- The Vercel Toolbar screenshots provided by the user serve as a visual reference for the desired tooltip style: compact, close to the toolbar, clean appearance.
- The custom tooltip component already exists but needs visual updates: an arrow/caret must be added, and the color scheme must be changed to a theme-aware inverted style for high contrast.
- Tooltip animation behavior (fade/slide in) is acceptable and does not need to change.
