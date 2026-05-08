# Design

> Visual system for ngx-dev-toolbar. Tokens here mirror `libs/ngx-dev-toolbar/src/styles.scss` —
> when those change, refresh this file.

## Visual Theme

A floating dev tool that lives over arbitrary host apps (Tailwind, Bootstrap, custom CSS).
The chrome is restrained and surface-focused: layered translucent shadows, near-1px borders,
neutrals tinted toward the brand indigo. The brand color is reserved for primary actions and
streaming state; everything else is graphite, paper, and ink.

**Color strategy:** Restrained. Tinted neutrals carry the surface, indigo `#635BFF` carries
≤10% — primary buttons, focus rings, the active step glyph during streaming.

**Theme:** Both light and dark are first-class via `[attr.data-theme="light|dark"]`. Light is
the default for dev environments (mirrors most editors and the Angular DevTools panel).
Dark is a single attribute swap.

## Color Palette

All colors stored as CSS custom properties under `--ndt-*` and exported via the
`devtools-theme` mixin in `styles.scss`.

### Light (default)

| Token | Value | Use |
|---|---|---|
| `--ndt-bg-primary` | `rgb(255 255 255)` | window surface |
| `--ndt-bg-gradient` | `linear-gradient(180deg, gray-200, gray-200/.88)` | toolbar pill |
| `--ndt-text-primary` | `rgb(17 24 39)` | headings, primary text |
| `--ndt-text-secondary` | `rgb(55 65 81)` | body |
| `--ndt-text-muted` | `rgb(107 114 128)` | timestamps, hints |
| `--ndt-border-primary` | `#e5e7eb` | dividers, inputs |
| `--ndt-border-subtle` | `rgb(17 24 39 / .1)` | hairline separators |
| `--ndt-hover-bg` | `rgb(17 24 39 / .05)` | row hover |
| `--ndt-primary` | `#635BFF` | brand / focus / streaming-active glyph |

### Dark

| Token | Value | Use |
|---|---|---|
| `--ndt-bg-primary` | `rgb(17 24 39)` | window surface |
| `--ndt-bg-gradient` | `linear-gradient(180deg, #13151a, #13151a/.88)` | toolbar pill |
| `--ndt-text-primary` | `rgb(255 255 255)` | headings |
| `--ndt-text-secondary` | `rgb(229 231 235)` | body |
| `--ndt-text-muted` | `rgb(156 163 175)` | timestamps |
| `--ndt-border-primary` | `#343841` | dividers, inputs |
| `--ndt-hover-bg` | `rgb(255 255 255 / .12)` | row hover |
| `--ndt-primary` | `#635BFF` | brand / streaming |

### Annotation colors (for streaming step status)

`note` (info, blue), `warning` (yellow), `error` (red). Backgrounds at 10–15% alpha,
borders at 20–30%. Reserved for state, never decoration.

## Typography

System sans for everything: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
"Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`.

Monospace for code, route paths, generated entity names: `ui-monospace, SFMono-Regular,
"SF Mono", Menlo, Consolas, monospace`.

### Scale (rem)

| Token | Size | Use |
|---|---|---|
| `--ndt-font-size-xxs` | 0.65 | timestamps, micro-labels |
| `--ndt-font-size-xs` | 0.75 | body small, tabs, action rows |
| `--ndt-font-size-sm` | 0.875 | body, list items |
| `--ndt-font-size-md` | 1.00 | section headings |
| `--ndt-font-size-lg` | 1.25 | window title (compact) |
| `--ndt-font-size-xl` | 2.00 | reserved for large hero (rare) |

Hierarchy through weight contrast: 400 body, 500 emphasis, 600 headings & badges.
Avoid italics. Never letter-space body text. Tabular-nums on timestamps and counters.

## Spacing & Layout

| Token | Value |
|---|---|
| `--ndt-spacing-xs` | 4px |
| `--ndt-spacing-sm` | 6px |
| `--ndt-spacing-md` | 12px |
| `--ndt-spacing-lg` | 16px |
| `--ndt-window-padding` | 16px |

Spacing rhythm is intentionally tight — this is a dev tool, not a marketing surface.
Apply explicit padding-top / margin-top on every nested container; do not rely on
browser defaults (host apps may reset them).

**Window sizes** (px): small 320×320, medium 480×480, tall 480×620, large 620×620.
A new `sidebar` size docks against the right edge: 420×100vh-32px.

## Shape

| Token | Radius |
|---|---|
| `--ndt-border-radius-small` | 4px (badges, micro-controls) |
| `--ndt-border-radius-medium` | 8px (inputs, list rows) |
| `--ndt-border-radius-large` | 12px (window) |
| `--ndt-border-radius-full` | 9999px (toolbar pill) |

## Elevation

Shadows are layered for natural depth. The window uses six stacked rgba shadows
(see `$shadow-themes` in styles.scss) — never collapse to a single drop.

| Token | Use |
|---|---|
| `--ndt-shadow-toolbar` | 1-layer subtle, on the toolbar pill |
| `--ndt-shadow-tooltip` | 3-layer, on hover tooltips |
| `--ndt-shadow-window` | 6-layer, on the open tool window |

No glow shadows. No colored shadows except as noted for the brand-color focus ring.

## Motion

Default easing: `--ndt-transition-default: all 0.2s ease-out`. Smooth: `0.2s ease-in-out`.
For the streaming choreography, prefer `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quint) at
180–240ms for step reveal.

Never animate layout properties (width, height, top, left). Use opacity, transform, and
filter only. Respect `prefers-reduced-motion: reduce` — disable streaming choreography
and render all steps instantly.

## Components

Library exposes a deep component vocabulary. Key ones for this redesign:

- **`ndt-toolbar-tool`** — overlay wrapper with positioning, sizing, slide-in animation.
  Sizes: `small | medium | tall | large` (adding `sidebar`).
- **`ndt-window`** — chrome (header with title/description/controls + divider + content
  slot). Compact mode (planned) tightens the header and removes the divider.
- **`ndt-tabs`** + **`ndt-tab`** — flat underline tabs, no pills, no chrome.
- **`ndt-step-view`** — multi-step view switcher (used by streaming UI).
- **`ndt-input`**, **`ndt-button`**, **`ndt-select`**, **`ndt-list`**, **`ndt-list-item`** —
  form controls. Buttons: subtle border, brand fill on primary, no Material ripple.
- **`ndt-icon`** — 30+ SVG icons.

## Iconography

In-house SVG set, single weight (1.5px stroke), 16px default. Avoid filled icons except
where status (success / error / running) requires it. Streaming step glyphs use filled
circles in graduated states: filled brand (running), filled muted (queued), check (done).

## Streaming Choreography (signature)

The Maker tool's signature moment. Specification:

1. **Header line** appears (title + ephemeral "Thought for Xs"), fades in over 180ms.
2. **Each step** appears as a row: glyph + label + optional inline counter ("10 of 10").
   Steps appear sequentially with a 60ms stagger between them.
3. **Active step** has a pulsing brand-color filled glyph (`◐` half-fill animating to
   full at 1.5s loop) and a thin vertical line continuing below it (the "thread").
4. **Completed steps** collapse to a single line with `▾ open` affordance to expand
   the generated entities.
5. **Generated entities** (when expanded) show as a compact list of monospace deeplinks
   with type badges.
6. **Container scrolls** to keep the active step in view. Never auto-scroll on completed
   steps — only on the active one.
7. With `prefers-reduced-motion`, all steps appear at once, no stagger, no pulse, no
   scroll animation.

## Anti-patterns (already enforced in this design)

- No side-stripe `border-left` accents on rows or callouts.
- No gradient text. No `background-clip: text`.
- No glassmorphism / blur as decoration.
- No icon-card grids. No hero metric tiles.
- No Material ripple. No bouncing easings.
