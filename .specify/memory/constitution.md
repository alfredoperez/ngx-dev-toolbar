<!--
Sync Impact Report:
Version Change: Initial (none) → 1.0.0
Constitution Type: MINOR - Initial constitution establishment with comprehensive principles
Modified Principles: N/A (initial version)
Added Sections:
  - Core Principles (7 principles)
  - Angular Development Standards
  - Testing & Quality Standards
  - Governance
Removed Sections: None
Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section aligns
  ✅ .specify/templates/spec-template.md - Requirements structure aligns
  ✅ .specify/templates/tasks-template.md - Task organization aligns
Follow-up TODOs: None
-->

# ngx-dev-toolbar Constitution

## Core Principles

### I. Standalone Component Architecture

**ngx-dev-toolbar** MUST be built as a standalone Angular component library. This principle is NON-NEGOTIABLE.

- Every component MUST use standalone: true (implicit in Angular 19+, do not explicitly set)
- All components, directives, and pipes MUST be independently importable
- No NgModule declarations or imports permitted in library code
- Components MUST declare all dependencies in their imports array
- Public API surfaces MUST be clearly defined through index.ts barrel exports

**Rationale**: Standalone architecture ensures modern Angular compatibility, reduces bundle size through tree-shaking, simplifies testing, and provides consumers with granular import control.

### II. Signal-First State Management

**ngx-dev-toolbar** MUST use Angular signals as the primary state management mechanism. This principle is NON-NEGOTIABLE for all new code.

- Component state MUST use signal() for reactive state
- Derived state MUST use computed() for pure transformations
- Service state MUST expose readonly signals via asReadonly()
- Side effects MUST use effect() for DOM updates, localStorage, logging
- State updates MUST be pure and immutable (use spread operators)
- RxJS observables permitted ONLY for public API compatibility (e.g., getForcedValues())

**Rationale**: Signals provide predictable reactivity, automatic dependency tracking, improved performance, and align with Angular's future direction. This creates a consistent mental model across the codebase.

### III. Test-First Development (NON-NEGOTIABLE)

Every feature MUST follow Test-Driven Development (TDD) practices.

**Workflow**:
1. Tests written FIRST based on acceptance criteria
2. User validates test scenarios
3. Tests MUST fail (Red phase)
4. Implement minimal code to pass (Green phase)
5. Refactor while keeping tests green

**Testing Requirements**:
- Jest for unit and integration tests
- Playwright for E2E tests
- Follow AAA pattern (Arrange, Act, Assert)
- Test component inputs/outputs and template rendering
- Use jest.fn() for mocks, HttpTestingController for HTTP testing
- Implement proper cleanup in afterEach
- Coverage targets: >80% for services, >70% for components

**Rationale**: TDD ensures requirements are testable, reduces defects, provides living documentation, and enables confident refactoring.

### IV. OnPush Change Detection & Performance

All components MUST use OnPush change detection strategy.

- ChangeDetectionStrategy.OnPush required for all components
- Use signals and computed values to trigger change detection
- Avoid mutable operations that bypass change detection
- Use markForCheck() only when absolutely necessary
- Profile components with DevTools before optimizing

**Performance Standards**:
- Initial toolbar render <100ms
- Tool switching transition <50ms
- State updates <16ms (60fps)
- Bundle size delta per tool <5KB gzipped

**Rationale**: OnPush dramatically reduces change detection cycles, improves rendering performance, and forces immutable state patterns that prevent bugs.

### V. Consistent Tool Architecture Pattern

Every tool MUST follow the established three-layer architecture.

**Required Structure**:
1. **Tool Component** (*-tool.component.ts): UI layer wrapping DevToolbarToolComponent
2. **Internal Service** (*-internal.service.ts): State management with signals
3. **Public Service** (*.service.ts): Public API implementing DevToolsService<T>
4. **Models** (*.models.ts): Type definitions for tool data

**Public Service Contract**:
```typescript
interface DevToolsService<T> {
  setAvailableOptions(options: T[]): void;
  getForcedValues(): Observable<T[]>;
}
```

**Rationale**: Consistent architecture reduces cognitive load, enables pattern recognition, simplifies onboarding, and ensures predictable integration for library consumers.

### VI. Design System Consistency

All UI components MUST use the centralized design system.

**Requirements**:
- Use CSS custom properties with --ndt-* prefix exclusively
- Reference design tokens: colors, spacing, border-radius, font-sizes
- Support light/dark themes via [attr.data-theme]="theme()"
- Use reusable components from src/components/ (button, input, select, card, window, icons)
- Responsive layouts with flexbox
- Scrollable content with overflow-y: auto

**Rationale**: Design system ensures visual consistency, maintainability, theme support, and reduces CSS duplication across tools.

### VII. Zero Production Impact

The toolbar MUST have zero impact on production builds unless explicitly enabled.

- Hidden by default in production mode
- No runtime overhead when not visible
- No production bundle size increase for unused tools
- Tree-shakeable exports for partial imports
- Keyboard shortcut (Ctrl+Shift+D) disabled in production by default
- Opt-in production access via configuration flag only

**Rationale**: Development tools should never impact production performance, bundle size, or user experience.

## Angular Development Standards

### Component Structure

Components MUST follow this property order:
1. Injects (using inject() function)
2. Inputs (using input() function)
3. Outputs (using output() function)
4. Signals (signal(), computed())
5. Other properties
6. Public methods
7. Protected methods
8. Private methods

### Template Practices

- Prefer inline templates for components <30 lines
- Use class bindings instead of ngClass: [class.active]="isActive()"
- Use style bindings instead of ngStyle: [style.color]="themeColor()"
- Use @if/@for/@switch (control flow syntax) instead of *ngIf/*ngFor/*ngSwitch
- Avoid template expressions with side effects

### Reactive Forms

- Use Reactive Forms over Template-driven forms
- Typed form controls with FormControl<T>
- Form validation with built-in and custom validators
- Signal-based form state via toSignal()

## Testing & Quality Standards

### Test Organization

```
tests/
├── unit/          # Component and service unit tests
├── integration/   # Multi-component interaction tests
└── e2e/           # End-to-end Playwright tests
```

### Test Requirements

- Every public method MUST have unit test coverage
- Every user-facing feature MUST have E2E test coverage
- Edge cases and error paths MUST be tested
- Breaking changes MUST include migration tests
- Use descriptive test names: "should [expected behavior] when [condition]"

### Code Quality

- ESLint rules MUST pass without warnings
- Prettier formatting MUST be applied
- No console.log statements in committed code
- TypeScript strict mode enabled
- No any types except in explicit edge cases with justification

## Governance

### Constitution Authority

This constitution supersedes all other development practices, style guides, and conventions. In case of conflict, the constitution takes precedence.

### Amendment Process

1. Proposed amendments MUST be documented with rationale
2. Team review and consensus required
3. Version bump according to semantic versioning:
   - **MAJOR**: Backward-incompatible principle removals or redefinitions
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
4. Migration plan required for breaking changes
5. Update date and version in constitution footer

### Compliance Review

- All PRs MUST verify compliance with constitution principles
- Architecture decisions MUST reference relevant principles
- Deviations require explicit justification and approval
- Complex patterns MUST justify why simpler alternatives were rejected

### Versioning & Releases

- Use Nx Release with conventional commits
- Commit types: feat (minor), fix (patch), cleanup/refactor (patch)
- docs commits do not trigger releases
- Automatic changelog generation from commits
- Pre-release: npm run package validates build
- GitHub releases created automatically

### Documentation Standards

- Public APIs MUST have JSDoc comments
- Complex algorithms MUST have inline explanation comments
- Breaking changes MUST be documented in CHANGELOG.md
- Migration guides required for major version bumps
- Use CLAUDE.md for AI agent development guidance

**Version**: 1.0.0 | **Ratified**: 2025-10-12 | **Last Amended**: 2025-10-12
