<!--
  Sync Impact Report
  ===================
  Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution adoption)

  Added sections:
  - I. Angular Modern Patterns
  - II. Defensive CSS Architecture
  - III. Testing Standards
  - IV. Component Architecture
  - V. Simplicity First
  - Development Standards section
  - Quality Gates section

  Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ Constitution Check section exists
  - .specify/templates/spec-template.md: ✅ No changes needed
  - .specify/templates/tasks-template.md: ✅ No changes needed

  Follow-up TODOs: None
-->

# ngx-dev-toolbar Constitution

## Core Principles

### I. Angular Modern Patterns

All components and services MUST follow Angular 19+ best practices:

- Components MUST use `standalone: true` explicitly
- Components MUST use `OnPush` change detection strategy
- State MUST be managed using Angular signals (`signal()`, `computed()`, `effect()`)
- Inputs and outputs MUST use function-based `input()` and `output()` instead of decorators
- Forms MUST use Reactive Forms over Template-driven forms
- Class bindings MUST be used instead of `ngClass`; style bindings instead of `ngStyle`

**Rationale**: Modern Angular patterns provide better performance, type safety, and maintainability.
Signal-based reactivity eliminates common pitfalls with zone.js change detection.

### II. Defensive CSS Architecture

All styling MUST be resilient to external CSS interference:

- Global/overlay classes MUST use `ndt-` prefix; component-scoped classes do not require prefixes
- Theme values MUST use CSS custom properties with `--ndt-*` prefix
- Spacing MUST be explicit (`padding-top`, `margin-top`, `gap`) - never rely on browser defaults
- Overlay windows MUST use `contain: layout style` for CSS isolation
- Flexbox layouts MUST use `flex-shrink: 0` on headers/footers and `min-height: 0` on scrollable content

**Rationale**: The library integrates into applications with various CSS resets (Normalize, Tailwind,
Bootstrap). Defensive patterns prevent visual regressions in real-world environments that the demo
app cannot replicate.

### III. Testing Standards

All code MUST be tested according to these standards:

- Unit tests MUST use Jest with the AAA pattern (Arrange, Act, Assert)
- E2E tests MUST use Playwright
- Mocks MUST use `jest.fn()` for functions and `HttpTestingController` for HTTP
- Tests MUST include proper cleanup in `afterEach`
- Component tests MUST verify inputs, outputs, and template rendering

**Rationale**: Consistent testing patterns ensure reliability and make tests maintainable across
the codebase. The AAA pattern provides clear test structure.

### IV. Component Architecture

All tools MUST follow the established component pattern:

- Tool Component (`*-tool.component.ts`): UI wrapped in `DevToolbarToolComponent`
- Internal Service (`*-internal.service.ts`): Tool-specific state using signals
- Public Service (`*.service.ts`): Public API implementing `DevToolsService<T>` interface
- Models (`*.models.ts`): Type definitions for the tool's data structures

Component property order MUST be: Injects → Inputs → Outputs → Signals → Computed → Other →
Public methods → Protected methods → Private methods.

**Rationale**: Consistent architecture makes the codebase predictable. Developers can understand
any tool by understanding one tool. The separation of internal/public services provides clean APIs.

### V. Simplicity First

All implementations MUST prioritize simplicity:

- Changes MUST be limited to what is directly requested or clearly necessary
- Features MUST NOT be added beyond the explicit request
- Abstractions MUST NOT be created for one-time operations
- Error handling MUST only validate at system boundaries (user input, external APIs)
- Comments MUST only be added where logic is not self-evident
- Unused code MUST be deleted completely - no backward-compatibility hacks

**Rationale**: Over-engineering creates maintenance burden and obscures intent. YAGNI (You Aren't
Gonna Need It) keeps the codebase lean and understandable.

## Development Standards

### Technology Stack

- **Framework**: Angular 19.0+ with signals support
- **Component Dev Kit**: Angular CDK 19.0
- **Reactive Programming**: RxJS 7.8
- **Monorepo Tooling**: Nx 20.3+
- **Testing**: Jest (unit), Playwright (E2E)

### Code Quality

- All components MUST pass `nx lint ngx-dev-toolbar`
- All tests MUST pass `nx test ngx-dev-toolbar`
- Exports MUST be registered in `libs/ngx-dev-toolbar/src/index.ts`

## Quality Gates

### Before Merging

- [ ] All lint rules pass without warnings
- [ ] All unit tests pass
- [ ] E2E tests pass for affected features
- [ ] New components follow the established architecture pattern
- [ ] CSS follows defensive patterns documented in CLAUDE.md
- [ ] No unnecessary abstractions or over-engineering

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

All pull requests and code reviews MUST verify compliance with these principles. Complexity beyond
these standards MUST be explicitly justified in the PR description.

For runtime development guidance, refer to `CLAUDE.md` which contains detailed implementation
patterns and examples.

**Version**: 1.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2025-12-29
