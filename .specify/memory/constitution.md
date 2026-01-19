<!--
  Sync Impact Report
  ===================
  Version change: 1.0.0 → 2.0.0 (MAJOR - complete principle redefinition)

  Modified principles:
  - I. Angular Modern Patterns → I. Signals-First State Management (refocused)
  - II. Defensive CSS Architecture → REMOVED (merged into Development Standards)
  - III. Testing Standards → REMOVED (moved to Quality Gates)
  - IV. Component Architecture → II. Standalone Components Only (refocused)
  - V. Simplicity First → V. Minimal Configuration with Sensible Defaults (refocused)

  Added sections:
  - III. Zero Production Bundle Impact
  - IV. Type-Safe APIs with Strict TypeScript

  Removed sections:
  - Development Standards > Technology Stack (redundant with CLAUDE.md)

  Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ No changes needed (Constitution Check is generic)
  - .specify/templates/spec-template.md: ✅ No changes needed
  - .specify/templates/tasks-template.md: ✅ No changes needed

  Follow-up TODOs: None
-->

# ngx-dev-toolbar Constitution

## Core Principles

### I. Signals-First State Management

All state management MUST use Angular signals as the primary reactive primitive:

- Component state MUST use `signal()` for mutable values and `computed()` for derived state
- Services MUST expose state via `asReadonly()` signals and update via `signal.update()`
- Side effects MUST use `effect()` for reactive DOM updates, localStorage sync, and external interactions
- State transformations MUST be pure and immutable using spread operators
- RxJS SHOULD only be used for HTTP responses and complex async orchestration where signals are insufficient
- Zone.js-dependent patterns (OnPush without signals, async pipe for local state) MUST be avoided

**Rationale**: Signal-based reactivity provides fine-grained updates, better performance, and eliminates
common zone.js pitfalls. Signals are Angular's future direction, ensuring long-term maintainability.

### II. Standalone Components Only

All Angular constructs MUST be standalone without NgModule dependencies:

- Components MUST use `standalone: true` explicitly (never rely on defaults)
- Components MUST use `OnPush` change detection strategy
- Inputs MUST use `input()` function instead of `@Input()` decorator
- Outputs MUST use `output()` function instead of `@Output()` decorator
- Dependencies MUST be imported directly in component `imports` array
- NgModules MUST NOT be created or used anywhere in the library

**Rationale**: Standalone components simplify the mental model, improve tree-shaking, and reduce
boilerplate. They are Angular's recommended approach and ensure optimal bundle optimization.

### III. Zero Production Bundle Impact

The library MUST have zero impact on production bundles when not in use:

- All exports MUST be tree-shakable (no side effects in module initialization)
- Components MUST NOT execute code when not rendered
- Services MUST use `providedIn: 'root'` with tree-shakable providers
- No global styles, polyfills, or runtime patches that affect the host application
- The library SHOULD be conditionally imported only in development environments
- Bundle size impact MUST be documented and monitored

**Rationale**: A development toolbar must never affect production performance or bundle size.
Tree-shaking ensures unused code is eliminated, and conditional imports keep production builds clean.

### IV. Type-Safe APIs with Strict TypeScript

All public APIs MUST provide complete type safety with strict TypeScript:

- All exports MUST have explicit type annotations (no implicit `any`)
- Generic interfaces MUST be used for tool services (`DevToolsService<T>`)
- Union types and discriminated unions MUST be preferred over `any` or `unknown`
- Configuration objects MUST use interfaces with optional properties (not `Partial<T>`)
- Public API changes MUST maintain backward compatibility or follow semver MAJOR bumps
- TypeScript strict mode MUST be enabled (`strict: true` in tsconfig)

**Rationale**: Type safety catches errors at compile time, improves IDE support, and serves as
documentation. Strict TypeScript ensures the library integrates seamlessly with typed applications.

### V. Minimal Configuration with Sensible Defaults

The library MUST work out-of-the-box with zero configuration:

- Default behavior MUST be functional without any configuration
- All configuration options MUST be optional with documented defaults
- The simplest use case MUST require only importing and rendering the component
- Progressive disclosure: advanced features available but not required
- Configuration MUST NOT require understanding library internals
- Error messages MUST guide users toward correct configuration

**Rationale**: Developer experience is paramount. A toolbar should enhance productivity immediately,
not require extensive setup. Sensible defaults reduce cognitive load and onboarding friction.

## Development Standards

### CSS Architecture

All styling MUST be resilient to external CSS interference:

- Global/overlay classes MUST use `ndt-` prefix; component-scoped classes do not require prefixes
- Theme values MUST use CSS custom properties with `--ndt-*` prefix
- Spacing MUST be explicit (`padding-top`, `margin-top`, `gap`) - never rely on browser defaults
- Overlay windows MUST use `contain: layout style` for CSS isolation

### Tool Architecture Pattern

All tools MUST follow the established component pattern:

- Tool Component (`*-tool.component.ts`): UI wrapped in `DevToolbarToolComponent`
- Internal Service (`*-internal.service.ts`): Tool-specific state using signals
- Public Service (`*.service.ts`): Public API implementing `DevToolsService<T>` interface
- Models (`*.models.ts`): Type definitions for the tool's data structures

Component property order MUST be: Injects → Inputs → Outputs → Signals → Computed → Other →
Public methods → Protected methods → Private methods.

## Quality Gates

### Code Quality

- All components MUST pass `nx lint ngx-dev-toolbar`
- All tests MUST pass `nx test ngx-dev-toolbar`
- Exports MUST be registered in `libs/ngx-dev-toolbar/src/index.ts`

### Testing Standards

- Unit tests MUST use Jest with the AAA pattern (Arrange, Act, Assert)
- E2E tests MUST use Playwright
- Component tests MUST verify inputs, outputs, and template rendering

### Before Merging

- [ ] All lint rules pass without warnings
- [ ] All unit tests pass
- [ ] E2E tests pass for affected features
- [ ] New components follow standalone + signals patterns
- [ ] No production bundle impact introduced
- [ ] Public APIs are fully typed

### Release Checklist

- [ ] Build succeeds: `nx run ngx-dev-toolbar:build`
- [ ] Package succeeds: `npm run package`
- [ ] Changelog updated via conventional commits
- [ ] Version follows semantic versioning

## Governance

This constitution supersedes all other development practices for this project. Amendments require:

1. Documentation of the proposed change with rationale
2. Update to this constitution file
3. Migration plan for existing code if breaking changes are introduced

All pull requests and code reviews MUST verify compliance with these principles.

For detailed implementation patterns and examples, refer to `CLAUDE.md`.

**Version**: 2.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2026-01-02
