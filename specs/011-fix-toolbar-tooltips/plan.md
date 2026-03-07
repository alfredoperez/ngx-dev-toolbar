# Implementation Plan: Fix Toolbar Tooltips

**Branch**: `011-fix-toolbar-tooltips` | **Date**: 2026-03-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-fix-toolbar-tooltips/spec.md`

## Summary

Fix three tooltip issues in the toolbar: (1) eliminate duplicate tooltips caused by Angular `title` input conflicting with the native HTML `title` attribute, (2) reposition tooltips closer to the toolbar with a directional arrow/caret (shadcn/Radix style), and (3) contain hover background effects within the toolbar's rounded borders. Additionally, update tooltip styling to use a theme-aware inverted color scheme for high contrast.

## Technical Context

**Language/Version**: TypeScript 5.5, Angular 19.0
**Primary Dependencies**: Angular CDK 19.0 (overlay positioning), RxJS 7.8
**Storage**: N/A (no data persistence changes)
**Testing**: Jest (unit), Playwright (e2e)
**Target Platform**: Browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Angular component library (npm package)
**Performance Goals**: N/A (tooltip is a lightweight UI element)
**Constraints**: Shadow DOM encapsulation; must not leak styles; must work across all 4 toolbar positions
**Scale/Scope**: ~5 files modified (tool-button component, toolbar-tool component, styles)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Signals-First State Management | PASS | Tooltip visibility already uses signals (`isTooltipVisible`, `tooltipState`). No changes needed to state management pattern. |
| II. Standalone Components Only | PASS | No new components needed. Modifying existing standalone components. |
| III. Zero Production Bundle Impact | PASS | CSS-only changes + minor template fix. No new runtime code beyond what exists. |
| IV. Type-Safe APIs | PASS | No public API changes. Renaming internal `title` input to avoid HTML attribute conflict. |
| V. Minimal Configuration | PASS | No configuration changes. Tooltips work automatically. |
| VI. Accessible by Default | PASS | Tooltip already has `pointer-events: none`. Arrow is decorative. Verify `aria-label` on buttons after `title` rename. |
| VII. Developer Experience First | PASS | Visual polish improvement. No API changes. |
| CSS Architecture | PASS | Using `--ndt-*` custom properties. Component-scoped styles. Defensive spacing. |
| Tool Architecture Pattern | PASS | No new tools. Modifying existing component internals only. |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/011-fix-toolbar-tooltips/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: N/A (no data model changes)
├── quickstart.md        # Phase 1: Quick verification guide
└── tasks.md             # Phase 2: Task breakdown (created by /speckit.tasks)
```

### Source Code (files to modify)

```text
libs/ngx-dev-toolbar/src/
├── styles.scss                                          # Add inverted tooltip CSS custom properties
├── toolbar.component.ts                                 # Add inverted tooltip vars to global styles
├── toolbar.component.scss                               # Add overflow clip for hover containment
├── components/
│   ├── tool-button/
│   │   ├── tool-button.component.ts                     # Rename title input, fix tooltip visibility logic
│   │   └── tool-button.component.scss                   # Restyle tooltip: position, arrow, inverted colors
│   └── toolbar-tool/
│       ├── toolbar-tool.component.ts                    # Remove data-tooltip attr, pass position to button
│       └── toolbar-tool.component.scss                  # (minor adjustments if needed)
```

**Structure Decision**: No new files or directories. All changes are modifications to existing components in the established library structure.

## Complexity Tracking

> No violations to justify. All changes are within existing components.
