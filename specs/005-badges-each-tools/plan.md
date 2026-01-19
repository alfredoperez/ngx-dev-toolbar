****# Implementation Plan: Tool Badges and UX Improvements

**Branch**: `005-badges-each-tools` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-badges-each-tools/spec.md`

## Summary

Add badge counts to Feature Flags, Permissions, and App Features tool buttons showing forced values count; persist search/filter/sort state per tool to localStorage; simplify README for npm rendering (markdown-only, <200 lines).

## Technical Context

**Language/Version**: TypeScript 5.5, Angular 19.0
**Primary Dependencies**: Angular 19.0, Angular CDK 19.0, RxJS 7.8
**Storage**: localStorage via `DevToolsStorageService` (prefix: `AngularDevTools.`)
**Testing**: Jest (unit), Playwright (E2E)
**Target Platform**: Web browsers (all modern browsers)
**Project Type**: Nx monorepo with Angular library
**Performance Goals**: Badge updates within 100ms of state change (per spec SC-002)
**Constraints**: Zero production impact when disabled, maintain existing tool architecture
**Scale/Scope**: Library component, 3 tools affected, 1 README file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Angular Modern Patterns ✅
- [x] Components will use `standalone: true` explicitly
- [x] Components will use `OnPush` change detection strategy
- [x] State will use Angular signals (`signal()`, `computed()`)
- [x] Inputs/outputs will use function-based `input()` and `output()`
- [x] No forms involved in this feature

### II. Defensive CSS Architecture ✅
- [x] Badge CSS already exists with `ndt-` conventions in `.tool-button__badge`
- [x] Theme values already use `--ndt-*` CSS custom properties
- [x] No new overlay components needed

### III. Testing Standards ✅

### IV. Component Architecture ✅
- [x] No new tools being added
- [x] Existing internal services already track forced state
- [x] Will add computed signals for badge counts
- [x] Property order will follow: Injects → Inputs → Outputs → Signals → Computed

### V. Simplicity First ✅
- [x] Badge count is derived state (computed from existing forced values)
- [x] Filter persistence reuses existing storage service
- [x] No new abstractions needed
- [x] README simplification removes complexity, doesn't add it

## Project Structure

### Documentation (this feature)

```text
specs/005-badges-each-tools/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
libs/ngx-dev-toolbar/src/
├── components/
│   ├── tool-button/
│   │   ├── tool-button.component.ts    # Add badge input
│   │   └── tool-button.component.scss  # Badge styles already exist
│   └── toolbar-tool/
│       └── toolbar-tool.component.ts   # Pass badge to tool-button
├── tools/
│   ├── feature-flags-tool/
│   │   ├── feature-flags-tool.component.ts    # Add badge count computed
│   │   └── feature-flags-internal.service.ts  # Already has getCurrentForcedState()
│   ├── permissions-tool/
│   │   ├── permissions-tool.component.ts      # Add badge count computed
│   │   └── permissions-internal.service.ts    # Already has getCurrentForcedState()
│   ├── app-features-tool/
│   │   ├── app-features-tool.component.ts     # Add badge count computed
│   │   └── app-features-internal.service.ts   # Already has getCurrentForcedState()
│   └── home-tool/
│       └── home-tool.component.ts             # Clear settings clears view state
├── utils/
│   └── storage.service.ts                     # Reuse for view state persistence
└── models/
    └── tool-view-state.models.ts              # New: ToolViewState interface

README.md                                       # Simplify for npm

libs/ngx-dev-toolbar/src/__tests__/
├── tool-button.component.spec.ts              # Badge display tests
└── tool-view-state.spec.ts                    # Persistence tests
```

**Structure Decision**: Nx monorepo Angular library structure. All changes are within `libs/ngx-dev-toolbar/src/` except README.md at root.

## Complexity Tracking

> **No violations detected. All implementations follow constitution principles.**

N/A - This feature adds minimal complexity:
- Badge count is a computed signal (derived state, no new data flow)
- View state persistence reuses existing storage service pattern
- README changes reduce complexity by removing HTML

---

## Post-Design Constitution Re-Check ✅

*Re-evaluated after Phase 1 design completion on 2025-12-29*

### I. Angular Modern Patterns ✅
- `badge` input uses function-based `input<string>()` syntax
- Badge count uses `computed()` signal for derived state
- View state uses `signal()` for reactive updates
- All changes maintain `OnPush` change detection

### II. Defensive CSS Architecture ✅
- Badge CSS already exists in `.tool-button__badge` with proper positioning
- No new global classes needed
- Theme variables already in place (`--ndt-hover-danger`, `--ndt-text-primary`)

### III. Testing Standards ✅
- Tests will follow AAA pattern with Jest
- Badge visibility testable via component testing
- View state persistence testable via localStorage mocking

### IV. Component Architecture ✅
- No new services created (reusing existing storage service)
- No changes to tool architecture pattern
- Property order maintained per constitution

### V. Simplicity First ✅
- One new model file (`ToolViewState`) - justified for type safety
- No new abstractions or patterns introduced
- README simplified (removes HTML, doesn't add complexity)

**GATE PASSED**: Design complies with all constitution principles.
