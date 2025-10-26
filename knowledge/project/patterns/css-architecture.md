# CSS Architecture

## Overview

The ngx-dev-toolbar library uses a hybrid CSS architecture that combines **component-scoped styles** with **global overlay styles**. This document explains the architectural decisions, class naming conventions, and patterns used throughout the library.

## Key Architectural Principles

### 1. Shadow DOM vs CDK Overlays

The library uses two distinct rendering contexts:

- **Shadow DOM Components**: Most components (buttons, inputs, selects, cards) render within Angular's Shadow DOM encapsulation
- **CDK Overlay Components**: Tool windows render outside Shadow DOM using Angular CDK's overlay service

This dual architecture requires different styling approaches:

```
Component Tree (Shadow DOM)
├── DevToolbarComponent
│   ├── Button components (scoped styles)
│   ├── Input components (scoped styles)
│   └── Select components (scoped styles)

CDK Overlay (Outside Shadow DOM)
└── Tool Windows (global styles)
    ├── Window component (global .ndt-window)
    ├── Header (global .header)
    └── Content (global .content)
```

### 2. Class Naming Strategy

**Rule**: Only use `ndt-` prefix for classes that exist outside Shadow DOM encapsulation.

#### Global Classes (Outside Shadow DOM)
Use `ndt-` prefix for:
- CDK overlay containers (`.ndt-window`, `.ndt-overlay`)
- Globally injected elements
- Elements requiring theme CSS variables

Examples:
```scss
.ndt-window { }        // ✅ Global overlay class
.ndt-overlay { }       // ✅ Global overlay class
.ndt-toolbar { }       // ✅ Global component class
```

#### Component-Scoped Classes (Inside Shadow DOM)
**DO NOT** use `ndt-` prefix for:
- Component-internal classes
- Template elements
- View-encapsulated styles

Examples:
```scss
.container { }         // ✅ Component-scoped
.header { }            // ✅ Component-scoped
.form-row { }          // ✅ Component-scoped
.mock-item { }         // ✅ Component-scoped

.ndt-container { }     // ❌ Unnecessary prefix
.ndt-header { }        // ❌ Unnecessary prefix
```

**Why?** Angular's `ViewEncapsulation.Emulated` (default) already scopes these classes using attribute selectors like `[_ngcontent-ng-c123]`. Adding `ndt-` prefix provides no additional encapsulation.

### 3. CSS Custom Properties (Design Tokens)

All theme-related values use CSS custom properties with `--ndt-` prefix:

```scss
// Colors
--ndt-background-primary
--ndt-background-secondary
--ndt-text-primary
--ndt-text-secondary
--ndt-text-muted
--ndt-border-primary

// Spacing
--ndt-spacing-xs       // 4px
--ndt-spacing-sm       // 8px
--ndt-spacing-md       // 16px
--ndt-spacing-lg       // 24px

// Border Radius
--ndt-border-radius-small    // 4px
--ndt-border-radius-medium   // 8px
--ndt-border-radius-large    // 12px

// Font Sizes
--ndt-font-size-xs     // 0.75rem
--ndt-font-size-sm     // 0.875rem
--ndt-font-size-md     // 1rem
--ndt-font-size-lg     // 1.125rem
```

**Usage Pattern:**
```scss
.container {
  padding: var(--ndt-spacing-md);
  gap: var(--ndt-spacing-sm);
  background: var(--ndt-background-primary);
  border-radius: var(--ndt-border-radius-medium);
}
```

## Defensive CSS Patterns

See [defensive-css.md](../../code-style/defensive-css.md) for comprehensive defensive CSS strategies.

**Critical defensive patterns applied:**

1. **Explicit Spacing**: Always use explicit `padding-top` and `margin-top` to prevent CSS reset interference
2. **CSS Containment**: Use `contain: layout style` on overlay windows to isolate from external styles
3. **Flexbox Isolation**: Use `flex-shrink: 0` on headers/footers, `min-height: 0` on scrollable content

## Component Styling Patterns

### Tool Component Structure

All tool components follow this structure:

```typescript
@Component({
  template: `
    <ndt-toolbar-tool [options]="options" title="..." icon="...">
      <div class="container">
        <div class="header">
          <!-- Search/filter inputs -->
        </div>

        <ndt-list>
          <!-- List items -->
        </ndt-list>
      </div>
    </ndt-toolbar-tool>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin-top: var(--ndt-spacing-sm); // Defensive spacing
    }

    .header {
      flex-shrink: 0;
      display: flex;
      gap: var(--ndt-spacing-sm);
      margin-bottom: var(--ndt-spacing-sm);
    }
  `]
})
```

### Window Component Structure

The window component provides the overlay container:

```scss
.ndt-window {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: var(--ndt-bg-primary);
  border: 1px solid var(--ndt-border-primary);
  border-radius: var(--ndt-border-radius-large);
  padding: var(--ndt-window-padding) var(--ndt-window-padding) var(--ndt-spacing-sm);
  contain: layout style; // Defensive isolation
}

.content {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding-top: var(--ndt-spacing-md); // Defensive spacing
}
```

## Z-Index Layers

The library uses a centralized z-index system defined in `_variables.scss`:

```scss
$z-indices: (
  toolbar: 9999,
  overlay-backdrop: 10000,
  window: 10001,
  dropdown: 10002,
  tooltip: 10003
);
```

**Usage:**
```scss
@use 'sass:map';
@use '../../styles' as *;

.ndt-window {
  z-index: #{map.get($z-indices, window)};
}
```

## File Organization

```
libs/ngx-dev-toolbar/src/
├── styles/
│   ├── _variables.scss       // Design tokens, z-indices
│   ├── _themes.scss          // Light/dark theme definitions
│   ├── _mixins.scss          // Reusable SCSS mixins
│   └── index.scss            // Global styles entry point
├── components/
│   ├── window/
│   │   ├── window.component.ts
│   │   └── window.component.scss  // Global .ndt-window styles
│   ├── button/
│   │   ├── button.component.ts
│   │   └── button.component.scss  // Scoped .button styles
│   └── ...
└── tools/
    ├── feature-flags-tool/
    │   └── feature-flags-tool.component.ts  // Inline scoped styles
    └── ...
```

## Theme System

Themes are applied via `[attr.data-theme]="theme()"` on the `:host` element:

```scss
:host {
  @include devtools-theme;  // Injects CSS variables
  display: block;
}

// Light theme (default)
:host[data-theme='light'] {
  --ndt-background-primary: #ffffff;
  --ndt-text-primary: #1f2937;
}

// Dark theme
:host[data-theme='dark'] {
  --ndt-background-primary: #1f2937;
  --ndt-text-primary: #f9fafb;
}
```

## Best Practices

### DO ✅
- Use CSS custom properties for all theme-related values
- Use `ndt-` prefix only for global/overlay classes
- Apply defensive spacing patterns (see defensive-css.md)
- Use flexbox for layouts with proper isolation
- Use component-scoped class names for internal elements
- Apply CSS containment to overlay windows
- Follow z-index layering system

### DON'T ❌
- Don't use `ndt-` prefix for component-scoped classes
- Don't use hardcoded color/spacing values
- Don't rely on external margins/padding (may be reset)
- Don't use `ngClass` or `ngStyle` (use class/style bindings)
- Don't use global CSS for component-internal styles
- Don't use `!important` (except for defensive overrides)

## Related Documentation

- [Defensive CSS Patterns](../../code-style/defensive-css.md)
- [Angular Patterns](../../code-style/angular-patterns.md)
- [Component Hierarchy](./component-hierarchy.md)
- [Toolbar Tool Guide](../recipes/TOOLBAR_TOOL_GUIDE.md)
