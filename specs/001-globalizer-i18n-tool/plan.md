# Plan: i18n Tool (Advanced i18n Simulation)

**Spec**: [spec.md](./spec.md) | **Date**: 2026-03-08

## Approach

Create a new `i18n-tool` under `libs/ngx-dev-toolbar/src/tools/` following the established tool architecture (models → internal service → public service → component). The tool replaces the existing language tool with a richer model that decouples locale, timezone, currency, and unit system into independent override signals. Pseudo-localization and RTL mirroring are implemented as simple toggles that emit boolean flags (RTL also sets `document.dir`). The existing `ToolbarLanguageService` public API is preserved as a deprecated facade that delegates to the new i18n internal service for backward compatibility. Documentation follows the Astro Starlight MDX pattern, and the demo app gets a new lazy-loaded page demonstrating live formatting previews.

## Architecture

### Service Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Consumer Application                      │
│                                                              │
│  ┌──────────────────────┐    ┌───────────────────────────┐  │
│  │ ToolbarLanguageService│    │ ToolbarI18nService        │  │
│  │    (DEPRECATED)       │    │     (New Public API)      │  │
│  │                       │    │                           │  │
│  │ • setAvailableOptions │    │ • setAvailableLocales()   │  │
│  │ • getForcedValues()   │    │ • getForcedLocale()       │  │
│  │ • getValues()         │    │ • getForcedTimezone()     │  │
│  └───────────┬───────────┘    │ • getForcedCurrency()     │  │
│              │ delegates      │ • getUnitSystem()         │  │
│              │                │ • isPseudoLocEnabled()    │  │
│              ▼                │ • isRtlEnabled()          │  │
│  ┌───────────────────────┐   └─────────────┬─────────────┘  │
│  │                       │◄────────────────┘                │
│  │ I18nInternalService   │                                   │
│  │                       │                                   │
│  │ BehaviorSubject per   │    ┌─────────────────────────┐   │
│  │ dimension:            │───►│  ToolbarStorageService   │   │
│  │ • locale$             │    │  (localStorage)          │   │
│  │ • timezone$           │    │                          │   │
│  │ • currency$           │    │  Keys:                   │   │
│  │ • unitSystem$         │    │  • i18n.locale           │   │
│  │ • pseudoLocEnabled$   │    │  • i18n.timezone         │   │
│  │ • rtlEnabled$         │    │  • i18n.currency         │   │
│  │                       │    │  • i18n.unitSystem       │   │
│  │ Preset hooks:         │    │  • i18n.pseudoLoc        │   │
│  │ • applyPreset()       │    │  • i18n.rtl              │   │
│  │ • getCurrentState()   │    └─────────────────────────┘   │
│  └───────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

### Component UI Layout

```
┌──────────────────────────────────────────┐
│  🌐 i18n                          [✕]  │
│  Simulate regional & linguistic env      │
├──────────────────────────────────────────┤
│                                          │
│  Locale        [en-US           ▾]       │
│  Timezone      [America/New_York ▾]      │
│  Currency      [USD ($)          ▾]      │
│  Units         [Metric           ▾]      │
│                                          │
├──────────────────────────────────────────┤
│  📋 Formatting Preview                   │
│  ┌────────────────────────────────────┐  │
│  │ Number:   1,234.56                │  │
│  │ Date:     03/08/2026              │  │
│  │ Time:     2:30 PM EST            │  │
│  │ Currency: $1,234.56              │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│  Stress Testing                          │
│  ┌──────────────────────────┐            │
│  │ Pseudo-Localization  [○] │            │
│  │ RTL Mirroring        [○] │            │
│  └──────────────────────────┘            │
└──────────────────────────────────────────┘
```

### Data Flow: Locale Change

```
User selects "ja-JP"
        │
        ▼
┌─────────────────────┐
│ I18nToolComponent   │
│ onLocaleChange()    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐     ┌─────────────────┐
│ I18nInternal        │────►│ StorageService   │
│ setForcedLocale()   │     │ persist to       │
│                     │     │ localStorage     │
│ locale$.next(ja-JP) │     └─────────────────┘
└────────┬────────────┘
         │ BehaviorSubject emits
         ▼
┌─────────────────────────────────────────┐
│ Subscribers receive new locale          │
│                                         │
│ • Formatting Preview updates (Intl API) │
│ • App's Transloco switches lang bundle  │
│ • App's pipes/services re-render        │
└─────────────────────────────────────────┘
```

## Documentation Plan

### Docs to Create

| File | Content |
|------|---------|
| `apps/docs/src/content/docs/i18n.mdx` | **New page** — Overview, use cases (locale testing, timezone simulation, currency validation, pseudo-localization, RTL), Quick Start code, Advanced Usage (Transloco integration, Angular i18n hooks, decoupled currency), API Reference table, Best Practices |

### Docs to Modify

| File | Change |
|------|--------|
| `apps/docs/src/content/docs/language.mdx` | Add deprecation banner pointing to i18n Tool page |
| `apps/docs/astro.config.mjs` | Add `{ label: 'i18n', slug: 'i18n' }` to sidebar "Tools" section (before or after Language) |
| `README.md` | Replace "Language Switching" in feature list with "i18n Tool (Advanced i18n Simulation)" + brief description |

### Demo to Create

| File | Content |
|------|---------|
| `apps/ngx-dev-toolbar-demo/src/app/components/i18n-demo/i18n-demo.component.ts` | Interactive demo page: shows formatted numbers/dates/currency updating live as locale changes, pseudo-localization toggle on sample text, RTL toggle on a sample card layout |

## Files

### Create

| File | Purpose |
|------|---------|
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n.models.ts` | Interfaces: `I18nLocale`, `I18nTimezone`, `I18nCurrency`, `I18nUnitSystem`, `I18nState` (composite state type for all overrides) |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-internal.service.ts` | Internal state management with BehaviorSubjects for each override dimension. Persistence via `ToolbarStorageService`. Preset integration hooks. Migration logic for old `language` keys. |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n.service.ts` | Public service implementing `ToolbarService<I18nLocale>` for locale (primary dimension). Additional typed accessors for timezone, currency, units, pseudo-loc, RTL. |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-tool.component.ts` | Tool UI component: locale/timezone/currency/unit dropdowns, formatting preview panel, pseudo-loc & RTL toggles. Wraps in `ToolbarToolComponent` with `size: 'medium'`. |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-tool.component.scss` | Component-scoped styles: section layout, formatting preview card, toggle switches |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-formatting.utils.ts` | Pure utility functions: `formatNumber()`, `formatDate()`, `formatCurrency()`, `pseudoLocalize()`, `expandText()`. Uses browser `Intl` APIs. |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-internal.service.spec.ts` | Unit tests: persistence, preset integration, state management, old-format migration |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n.service.spec.ts` | Unit tests: `ToolbarService` interface compliance, typed accessors |
| `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-formatting.utils.spec.ts` | Unit tests: formatting utilities, pseudo-localization transforms |
| `apps/docs/src/content/docs/i18n.mdx` | Astro Starlight doc page (see Documentation Plan above) |
| `apps/ngx-dev-toolbar-demo/src/app/components/i18n-demo/i18n-demo.component.ts` | Demo page (see Documentation Plan above) |

### Modify

| File | Change |
|------|--------|
| `libs/ngx-dev-toolbar/src/models/toolbar-config.interface.ts` | Add `showI18nTool?: boolean`. Add `@deprecated` JSDoc to `showLanguageTool`. |
| `libs/ngx-dev-toolbar/src/toolbar.component.ts` | Import `ToolbarI18nToolComponent`. Add `@if (showI18n())` block (resolves `showI18nTool ?? showLanguageTool ?? false`). Remove direct `<ndt-language-tool />`. |
| `libs/ngx-dev-toolbar/src/tools/language-tool/language.service.ts` | Add `@deprecated`. Delegate to `I18nInternalService` for locale operations. |
| `libs/ngx-dev-toolbar/src/tools/language-tool/language-internal.service.ts` | Add `@deprecated`. Delegate to `I18nInternalService` for locale state (shared source of truth). |
| `libs/ngx-dev-toolbar/src/index.ts` | Export new i18n models, service, and component. Keep existing language exports (deprecated). |
| `libs/ngx-dev-toolbar/src/tools/presets-tool/presets-internal.service.ts` | Extend preset save/apply with i18n dimensions (timezone, currency, unit system, pseudo-loc, RTL). |
| `apps/docs/astro.config.mjs` | Add `i18n` entry to sidebar "Tools" section. |
| `apps/docs/src/content/docs/language.mdx` | Add deprecation notice pointing to i18n Tool. |
| `apps/ngx-dev-toolbar-demo/src/app/app.routes.ts` | Add lazy-loaded route for `i18n-demo`. |
| `apps/ngx-dev-toolbar-demo/src/app/app.component.ts` | Replace `ToolbarLanguageService` with `ToolbarI18nService`. Configure locales, timezones, currencies. |
| `README.md` | Update feature list with i18n Tool. |

## Risks

- **Backward compatibility with presets**: Existing saved presets contain `language` keys. Mitigation: add migration logic in `loadFromStorage()` to map `language` → `locale`.
- **`Intl` API browser support**: Formatting preview relies on `Intl.DateTimeFormat` with `timeZone`. Mitigation: all modern browsers support this; add fallback message for unsupported environments.
