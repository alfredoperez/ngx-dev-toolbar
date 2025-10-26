# Defensive CSS Patterns

## Overview

Defensive CSS is a set of techniques that make styles resilient to external interference. This is **critical** for component libraries like ngx-dev-toolbar that must work correctly in any host application, regardless of the host's CSS framework, resets, or global styles.

## Why Defensive CSS Matters

### The Problem

When ngx-dev-toolbar is installed in external applications, it encounters various CSS resets and frameworks:

- **CSS Resets**: Normalize.css, Reset.css, Meyer's Reset
- **CSS Frameworks**: Tailwind CSS, Bootstrap, Material Design
- **Custom Global Styles**: Application-specific resets

These can cause:
- ❌ Collapsed margins/padding
- ❌ Overlapping content
- ❌ Invisible elements
- ❌ Broken layouts
- ❌ Incorrect spacing

### Real-World Example

**Symptom**: Tool titles hidden, search/filter inputs overlapping window header

**Root Cause**: External application's CSS reset collapsed margins, causing tool content to overlap window header due to missing `padding-top` on `.content` div.

**Why Demo App Worked**: Demo app has minimal CSS reset (`margin: 0; padding: 0` only), external app had aggressive reset removing all margins/padding.

## Core Defensive Patterns

### 1. Explicit Spacing

**Always use explicit padding and margins** - never rely on default spacing.

#### Bad ❌
```scss
.container {
  display: flex;
  flex-direction: column;
  // No explicit spacing - relies on browser defaults
}

.content {
  flex: 1;
  overflow: auto;
  // No padding-top - content may overlap header
}
```

#### Good ✅
```scss
.container {
  display: flex;
  flex-direction: column;
  margin-top: var(--ndt-spacing-sm); // Defensive spacing against CSS resets
  gap: var(--ndt-spacing-md);
}

.content {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding-top: var(--ndt-spacing-md); // Prevents overlap with header
}
```

**Key Points:**
- Always set `margin-top` on container elements
- Always set `padding-top` on content areas
- Use design tokens (CSS variables) for consistency
- Add comments explaining the defensive purpose

### 2. CSS Containment

Use `contain: layout style` to isolate components from external CSS interference.

```scss
.ndt-window {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  contain: layout style; // Isolates window from external CSS interference
}
```

**What it does:**
- **`layout`**: Element's internal layout doesn't affect outside elements
- **`style`**: CSS counters/quotes scoped to element and descendants
- **Combined**: Creates isolated rendering context

**When to use:**
- Overlay windows
- Modal dialogs
- Floating panels
- Any component that must resist external styles

### 3. Flexbox Isolation

Use specific flex properties to prevent layout collapse.

```scss
.header {
  flex-shrink: 0;      // Prevents header from shrinking
  display: flex;
  gap: var(--ndt-spacing-sm);
  margin-bottom: var(--ndt-spacing-sm);
}

.content {
  flex: 1;             // Grows to fill space
  min-height: 0;       // Critical for nested flex containers with overflow
  overflow: auto;      // Enables scrolling when content exceeds height
  padding-top: var(--ndt-spacing-md);
}

.footer {
  flex-shrink: 0;      // Prevents footer from shrinking
  padding-top: var(--ndt-spacing-sm);
}
```

**Key Properties:**
- `flex-shrink: 0`: Use on headers/footers to prevent collapse
- `min-height: 0`: Use on scrollable flex children (overrides default `min-height: auto`)
- `flex: 1`: Use on main content areas to fill available space
- `overflow: auto`: Enable scrolling with explicit overflow behavior

### 4. Box Sizing

Always use `box-sizing: border-box` for predictable sizing.

```scss
.ndt-window {
  box-sizing: border-box;
  padding: var(--ndt-window-padding);
  border: 1px solid var(--ndt-border-primary);
  // Width/height now include padding and border
}
```

**Why:** Ensures padding/border are included in element's width/height, preventing layout overflow.

### 5. Explicit Display Properties

Never rely on default display values.

#### Bad ❌
```scss
.header {
  justify-content: space-between;  // Has no effect without display: flex
}
```

#### Good ✅
```scss
.header {
  display: flex;                   // Explicit flex container
  justify-content: space-between;
  align-items: center;
}
```

### 6. Z-Index Layering

Use a centralized z-index system to avoid conflicts.

```scss
// _variables.scss
$z-indices: (
  toolbar: 9999,
  overlay-backdrop: 10000,
  window: 10001,
  dropdown: 10002,
  tooltip: 10003
);

// Component usage
@use 'sass:map';
@use '../../styles' as *;

.ndt-window {
  position: relative;
  z-index: #{map.get($z-indices, window)};
}
```

**Benefits:**
- Prevents z-index wars
- Ensures correct stacking order
- Makes z-index values predictable

## Applied Defensive Patterns in ngx-dev-toolbar

### Window Component

**File**: `libs/ngx-dev-toolbar/src/components/window/window.component.scss`

```scss
.ndt-window {
  box-sizing: border-box;           // ✅ Predictable sizing
  display: flex;                     // ✅ Explicit display
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--ndt-bg-primary);
  border: 1px solid var(--ndt-border-primary);
  border-radius: var(--ndt-border-radius-large);
  padding: var(--ndt-window-padding) var(--ndt-window-padding) var(--ndt-spacing-sm);
  z-index: #{map.get($z-indices, window)};  // ✅ Centralized z-index
  contain: layout style;             // ✅ CSS containment for isolation
}

.header {
  display: flex;                     // ✅ Explicit display
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 10;                       // ✅ Above content
  flex-shrink: 0;                    // ✅ Prevents shrinking
}

.content {
  flex: 1;                           // ✅ Grows to fill space
  overflow: auto;                    // ✅ Explicit overflow
  min-height: 0;                     // ✅ Allows flex child to shrink
  padding-top: var(--ndt-spacing-md); // ✅ Defensive spacing
}

.divider {
  height: 1px;
  background-color: var(--ndt-border-primary);
  margin-bottom: var(--ndt-spacing-md);  // ✅ Explicit margins
  margin-top: var(--ndt-spacing-md);
  flex-shrink: 0;                    // ✅ Prevents shrinking
  position: relative;
  z-index: 5;                        // ✅ Positioned in stack
}
```

### Tool Components

**Pattern applied to all tools** (feature-flags, permissions, network-mocker, app-features, presets):

```scss
.container {
  display: flex;                     // ✅ Explicit display
  flex-direction: column;
  height: 100%;
  margin-top: var(--ndt-spacing-sm); // ✅ Defensive spacing against CSS resets
  gap: var(--ndt-spacing-md);        // ✅ Explicit gap instead of margins
}

.header {
  flex-shrink: 0;                    // ✅ Prevents header collapse
  display: flex;                     // ✅ Explicit display
  gap: var(--ndt-spacing-sm);
  margin-bottom: var(--ndt-spacing-sm);
}
```

## Testing Defensive CSS

### Local Testing Checklist

Test your component in environments with:

1. ✅ **No CSS Reset** (vanilla HTML)
2. ✅ **Normalize.css**
3. ✅ **Tailwind CSS** (with preflight enabled)
4. ✅ **Bootstrap**
5. ✅ **Custom aggressive reset** (`* { margin: 0; padding: 0; }`)

### Visual Regression Tests

Check for:
- ❌ Overlapping content
- ❌ Collapsed spacing
- ❌ Invisible elements
- ❌ Broken layouts
- ❌ Incorrect scrolling

### Code Review Checklist

When reviewing CSS changes, verify:

- [ ] All containers have explicit `margin-top` or `padding-top`
- [ ] Flex children use `flex-shrink: 0` (headers/footers) or `min-height: 0` (scrollable content)
- [ ] All spacing uses CSS variables (`--ndt-spacing-*`)
- [ ] Overlay windows use `contain: layout style`
- [ ] All display values are explicit (not relying on defaults)
- [ ] Z-index values come from centralized system
- [ ] Comments explain defensive purposes

## Common Pitfalls

### 1. Relying on Default Margins

#### Bad ❌
```scss
h3 {
  // Relies on browser default margin (may be reset to 0)
}
```

#### Good ✅
```scss
h3 {
  margin: 0 0 var(--ndt-spacing-sm) 0; // Explicit margins
  font-size: var(--ndt-font-size-lg);
}
```

### 2. Missing min-height on Flex Children

#### Bad ❌
```scss
.scrollable-list {
  flex: 1;
  overflow-y: auto;
  // Missing min-height: 0 - may not scroll in some browsers
}
```

#### Good ✅
```scss
.scrollable-list {
  flex: 1;
  min-height: 0;      // Allows flex child to shrink below content size
  overflow-y: auto;
}
```

### 3. Using Relative Units Without Context

#### Bad ❌
```scss
.container {
  padding: 1em;  // Relative to font-size (may change unexpectedly)
}
```

#### Good ✅
```scss
.container {
  padding: var(--ndt-spacing-md);  // Absolute value (16px)
}
```

## Advanced Defensive Techniques

### 1. Stacking Context Isolation

```scss
.ndt-window {
  position: relative;
  z-index: #{map.get($z-indices, window)};
  // Creates new stacking context - z-index children are isolated
}
```

### 2. Scrollbar Styling

Prevent external scrollbar styles from affecting internal scrollbars:

```scss
.mocks-list {
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--ndt-background-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ndt-border-primary);
    border-radius: 4px;

    &:hover {
      background: var(--ndt-hover-bg);
    }
  }
}
```

### 3. Font Family Inheritance Protection

```scss
:host {
  font-family: $font-family; // Explicit font family
}

.ndt-window {
  font-family: $font-family; // Re-declare for overlay context
}
```

## Related Documentation

- [CSS Architecture](../project/patterns/css-architecture.md)
- [Angular Patterns](./angular-patterns.md)
- [Component Hierarchy](../project/patterns/component-hierarchy.md)

## Summary

**Three-Layer Defensive Strategy:**

1. **Explicit Spacing**: Always use explicit `padding-top`, `margin-top`, and `gap`
2. **CSS Containment**: Use `contain: layout style` on overlay windows
3. **Flexbox Isolation**: Use `flex-shrink: 0`, `min-height: 0`, and explicit display properties

**Remember**: The demo app is NOT representative of real-world environments. Always test with aggressive CSS resets and popular frameworks.
