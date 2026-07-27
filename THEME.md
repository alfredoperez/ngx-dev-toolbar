# NGX Dev Toolbar — Visual Theme

Reference for any generated art (hero banners, docs art, social cards).

## Identity in one line

A **dark, restrained developer-tool aesthetic**: near-black slate-blue canvas with a single electric-violet accent delivered as thin rings and tinted glows — product-screenshot-forward, never flashy.

## Palette

| Role | Hex |
|---|---|
| Page black | `#0D1117` |
| Surface | `#131825` |
| Brand accent (THE color, ≤10% of surface) | violet `#635BFF` |
| Light-mode accent swap | indigo `#4F46E5` |
| Danger / count badge | `#EF4444` |
| Body text (dark) | `#C4C9D0` |

Angular red is **not** the brand — Angular chroma appears only in the home-button shield's crimson→magenta→violet gradient (`#E40035 → #6C00F5`), used as a small accent glyph.

## The hero object

The real product UI, drawn faithfully:

- A **fully-rounded white pill toolbar** floating bottom-center, 1px hairline border, containing small monochrome 1.5px-stroke line icons: Angular gradient shield, globe (i18n), layout (presets), puzzle (app features), padlock (permissions), toggle (feature flags) — with a tiny red circular count badge on an active tool
- A **12px-radius dark tool panel rising above the pill**: bold flag names with FORCED ON / FORCED OFF selectors, a violet BETA chip in the header

## Typography

System sans, tight tracking for headlines; **JetBrains Mono** for the wordmark, eyebrow labels, and the install chip: `$ npm install ngx-dev-toolbar` (violet-tinted box).

## Rules

- No glassmorphism, no gradient text, no glow except the violet focus ring/wash (soft 135° violet light from top-left is on-brand)
- Lead violet; Angular gradient shield is the only warm color in frame
