# Implementation Plan: Toolbar Positioning & Hide Shortcut

**Branch**: `010-toolbar-positioning` | **Date**: 2026-03-06 | **Spec**: N/A (user request)
**Input**: User request: "Position toolbar in top, right, bottom, or left + CMD+. to hide completely"

## Summary

Add configurable toolbar position (top, right, bottom, left) with localStorage persistence and a new keyboard shortcut (Cmd+. on macOS / Ctrl+. on Windows/Linux) to completely hide/show the toolbar. The position defaults to bottom (current behavior) and can be changed by the user at runtime through the Home tool settings UI.

## Technical Context

**Language/Version**: TypeScript 5.5, Angular 19.0
**Primary Dependencies**: Angular CDK 19.0 (overlay positioning), RxJS 7.8
**Storage**: localStorage via `ToolbarStorageService` (prefix: `AngularToolbar.`)
**Testing**: Jest (unit), Playwright (e2e)
**Target Platform**: Browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Angular component library
**Performance Goals**: Animations at 60fps, position switch < 16ms
**Constraints**: Zero production bundle impact, ShadowDOM encapsulation
**Scale/Scope**: 5 files modified, 1-2 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Signals-First | PASS | Position state will use `signal()` in `ToolbarStateService`, derived position classes via `computed()` |
| II. Standalone Components | PASS | No new components needed; modifications to existing standalone components only |
| III. Zero Production Bundle | PASS | Position logic only executes when toolbar is rendered (dev-only) |
| IV. Type-Safe APIs | PASS | `ToolbarPosition` union type (`'top' \| 'right' \| 'bottom' \| 'left'`), added to `ToolbarConfig` interface |
| V. Minimal Configuration | PASS | Default position is `'bottom'` (current behavior); zero-config still works |
| VI. Accessible by Default | PASS | Keyboard shortcut Cmd/Ctrl+. follows platform conventions; aria-label updates for position context |
| VII. Developer Experience | PASS | Position persists in localStorage; `provideToolbar({ position: 'left' })` for programmatic override |

## Project Structure

### Documentation (this feature)

```text
specs/010-toolbar-positioning/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
libs/ngx-dev-toolbar/src/
├── models/
│   ├── toolbar-config.interface.ts    # Add `position` to ToolbarConfig
│   └── toolbar-position.model.ts      # NEW: ToolbarPosition type + helpers
├── toolbar.component.ts               # Position-aware template + animations
├── toolbar.component.scss             # Position-dependent CSS classes
├── toolbar-state.service.ts           # Add position signal + persistence
├── tools/home-tool/
│   ├── home-tool.component.ts         # Position selector UI in settings
│   ├── home-tool.component.scss       # Styles for position selector
│   └── settings.models.ts             # Add position to Settings
└── components/toolbar-tool/
    └── toolbar-tool.component.ts      # Position-aware overlay positioning
```

**Structure Decision**: Existing library structure. One new model file for
`ToolbarPosition` type. All other changes modify existing files.

## Complexity Tracking

> No violations. All changes align with existing patterns.
