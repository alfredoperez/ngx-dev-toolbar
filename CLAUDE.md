# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Rules

- **Never add Claude Code attribution** to commits, PRs, code comments, or any generated content (no "Co-Authored-By: Claude", no "Generated with Claude Code", etc.)

## Project Overview

**ngx-dev-toolbar** is an Angular 19+ development toolbar library that provides tools for feature flags, language switching, theme management, user session control, and network request mocking. It's built as a standalone Angular component library using Nx monorepo architecture.

## Commands

### Build & Package
```bash
# Build the library
nx run ngx-dev-toolbar:build

# Package for distribution (used before release)
npm run package
```

### Testing
```bash
# Run all tests for the library
nx test ngx-dev-toolbar

# Run tests with coverage
nx test ngx-dev-toolbar --coverage

# Run tests in CI mode
nx test ngx-dev-toolbar --configuration=ci

# Run e2e tests
nx e2e ngx-dev-toolbar-demo-e2e
```

### Development
```bash
# Serve the demo app
nx serve ngx-dev-toolbar-demo

# Serve the documentation app
nx serve documentation

# Lint the library
nx lint ngx-dev-toolbar
```

### Release
```bash
# The release process uses Nx release with conventional commits
# Version bumping and changelog generation happen automatically
# Release configuration is in nx.json under "release" section
```

## Architecture

### Library Structure

The main library (`libs/ngx-dev-toolbar/`) follows this structure:

- **`src/toolbar.component.ts`**: Main toolbar component that wraps all tools and manages visibility/animations
- **`src/toolbar-state.service.ts`**: Centralized state management using Angular signals for toolbar visibility, active tool, theme, and delay settings
- **`src/tools/`**: Individual tool implementations (feature-flags, language, network-mocker, home)
- **`src/components/`**: Reusable UI components (button, input, select, card, window, icons)
- **`src/models/`**: Shared interfaces and types (ToolbarService interface)
- **`src/utils/`**: Utility services (storage service for localStorage persistence)

### Tool Architecture

Each tool follows a consistent pattern:

1. **Tool Component** (`*-tool.component.ts`): Main UI component that wraps content in `ToolbarToolComponent`
2. **Service Layer**:
   - **Internal Service** (`*-internal.service.ts`): Manages tool-specific state using signals
   - **Public Service** (`*.service.ts`): Public API implementing `ToolbarService<T>` interface with `setAvailableOptions()` and `getForcedValues()` methods
3. **Models** (`*.models.ts`): Type definitions for the tool's data structures

### State Management Pattern

The library uses Angular signals extensively:
- **Component state**: Local signals with `signal()` and `computed()` for derived state
- **Service state**: Services expose readonly signals via `asReadonly()` and update via `signal.update()`
- **Side effects**: Use `effect()` for reactive side effects
- **State transformations**: Pure, immutable updates using spread operators

### Component System

Reusable components are in `src/components/`:
- **ToolbarToolComponent**: Main wrapper providing window management, positioning, and animations
- **Input/Select/Button**: Form controls with consistent styling and two-way binding
- **Card/ClickableCard**: Content containers with hover effects
- **Window**: Modal-like container with header, description, and closable behavior
- **Icons**: 20+ SVG icon components with consistent sizing

## Testing

- Framework: **Jest** (migrated from Vitest)
- E2E: **Playwright**
- Follow AAA pattern (Arrange, Act, Assert)
- Use `jest.fn()` for mocks
- Use `HttpTestingController` for HTTP testing
- Test component inputs/outputs and template rendering
- Implement proper cleanup in `afterEach`

## Styling

### CSS Architecture

The library uses a **hybrid CSS architecture** combining component-scoped styles with global overlay styles:

- **Class Naming**: Use `ndt-` prefix ONLY for global/overlay classes (outside Shadow DOM). Component-scoped classes don't need prefixes.
- **Design Tokens**: All theme values use CSS custom properties (`--ndt-*` prefix)
- **Theme Support**: Light/dark themes via `[attr.data-theme]="theme()"`
- **Defensive CSS**: Explicit spacing patterns to resist external CSS resets

### Defensive CSS Patterns (CRITICAL)

**The demo app is NOT representative of real-world environments.** Always apply defensive CSS to prevent issues when integrated into apps with CSS resets (Normalize, Tailwind, Bootstrap):

1. **Explicit Spacing**: Always use explicit `padding-top`, `margin-top`, and `gap` - never rely on browser defaults
2. **CSS Containment**: Use `contain: layout style` on overlay windows to isolate from external styles
3. **Flexbox Isolation**: Use `flex-shrink: 0` on headers/footers, `min-height: 0` on scrollable content

**Example Pattern:**
```scss
.container {
  display: flex;
  flex-direction: column;
  margin-top: var(--ndt-spacing-sm); // Defensive spacing against CSS resets
  gap: var(--ndt-spacing-md);
}

.ndt-window {
  contain: layout style; // Isolates window from external CSS interference
}

.content {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding-top: var(--ndt-spacing-md); // Prevents overlap with header
}
```

### Design Tokens

All `--ndt-*` CSS custom properties are defined in `libs/ngx-dev-toolbar/src/styles.scss` and `libs/ngx-dev-toolbar/src/global-theme.scss`.

## Key Integration Points

### Creating Custom Tools

1. Implement the tool component extending `ToolbarToolComponent`
2. Create a service implementing `ToolbarService<T>` interface
3. Define models/interfaces for type safety
4. Use signals for state management
5. Export from `libs/ngx-dev-toolbar/src/index.ts`
6. Add to `ToolbarComponent` template

Reference: See the [Create a Custom Tool](https://alfredoperez.github.io/ngx-dev-toolbar/docs/guides/custom-tool) guide on the documentation website.

### Consumer Configuration

The `<ndt-toolbar>` config shape is `ToolbarConfig` — see `libs/ngx-dev-toolbar/src/models/toolbar-config.interface.ts`.

### Keyboard Shortcuts

- **Ctrl+Shift+D**: Toggle toolbar visibility

## Dependencies

- **Angular 19.0**: Core framework with signals support
- **Angular CDK 19.0**: Component Dev Kit for advanced UI patterns
- **RxJS 7.8**: Reactive programming
- **Nx 20.3**: Monorepo tooling
- **Transloco**: i18n support (planned)
- **ngx-highlightjs**: Code highlighting (planned)

## Release Process

- Uses **Nx Release** with conventional commits
- Commit types: `feat`, `fix`, `cleanup`, `refactor` (all trigger releases)
- `docs` commits don't trigger releases
- Version bumping based on conventional commit types
- Automatic changelog generation
- GitHub releases created automatically
- Pre-version command runs `npm run package`
