# Spec: i18n Tool (Advanced i18n Simulation)

**Branch**: 001-globalizer-i18n-tool | **Date**: 2026-03-08

## Summary

Replace the existing Language tool with a comprehensive "i18n Tool" that lets developers simulate complete regional and linguistic environments at runtime. The tool enables locale swapping, timezone teleportation, currency/unit overrides, pseudo-localization stress testing, and RTL mirroring — all without rebuilding or reloading the application. Includes documentation pages and demo integration.

## Requirements

### Core i18n Controls

- **R001** (MUST): Locale swapping — user selects an active locale (e.g., `en-US`, `ja-JP`, `de-DE`) from the toolbar, and the tool emits the selected locale to subscribers via `getForcedValues()`. The service must follow the existing `ToolbarService<T>` pattern.
- **R002** (MUST): Timezone override — user selects a timezone (e.g., `Asia/Tokyo`, `Europe/London`) independently from locale. The tool exposes the forced timezone so consuming apps can apply it to date formatting and time-relative logic.
- **R003** (MUST): Currency & unit override — user can decouple currency (e.g., `USD`, `EUR`, `JPY`) and unit system (`metric`, `imperial`) from the active locale, enabling cross-border profile testing.

### Framework Integration

- **R004** (MUST): Expose integration hooks for Angular i18n (`$localize`) and Transloco so consuming apps can trigger runtime translation updates when locale changes.
- **R005** (SHOULD): Prioritize "soft reload" (signal-based reactivity) over hard browser reload so application state is preserved during locale switches.

### Regional Formatting Preview

- **R006** (MUST): Provide a live formatting preview panel inside the tool window showing how numbers, dates, and currency render under the currently selected locale/currency/timezone combination.

### Pseudo-Localization

- **R007** (MUST): Pseudo-localization toggle that transforms translatable text into accented/distorted versions (e.g., `[Ħéļļö Ŵöŕļđ!!!]`) to detect hardcoded strings.
- **R008** (MUST): Text expansion simulation (~35% string length increase) during pseudo-localization to catch overflow/truncation issues.
- **R009** (MUST): RTL mirroring toggle that sets `dir="rtl"` on the document to verify layout for Arabic/Hebrew.

### Persistence & Configuration

- **R010** (MUST): All i18n Tool settings (locale, timezone, currency, unit system, pseudo-localization, RTL) persist in localStorage across page refreshes using the existing `ToolbarStorageService`.
- **R011** (MUST): Add `showI18nTool` flag to `ToolbarConfig`. Deprecate `showLanguageTool` (keep backward compat by mapping it to `showI18nTool`).

### Documentation & Demo

- **R012** (MUST): Add a documentation page for the i18n Tool on the docs site following the existing doc page patterns (`doc-page`/`doc-hero`/`doc-section` with `CodeExample` objects).
- **R013** (MUST): Add demo integration in the demo app showing locale switching, formatting preview, pseudo-localization, and RTL toggle in action.
- **R014** (SHOULD): Update the project README to mention the i18n Tool and its capabilities.

## Scenarios

### Locale Switching

**When** the developer selects `ja-JP` from the locale dropdown
**Then** the i18n service emits `ja-JP` as the forced locale, and the formatting preview updates to show Japanese number/date/currency formats.

### Timezone Override

**When** the developer selects `Asia/Tokyo` from the timezone dropdown while locale is `en-US`
**Then** the formatting preview shows dates/times in JST, and the forced timezone value is emitted to subscribers.

### Decoupled Currency

**When** the developer sets locale to `de-DE` but currency to `USD` and units to `metric`
**Then** the formatting preview shows German number formatting with `$` currency symbol, and the service emits all three overrides independently.

### Pseudo-Localization

**When** the developer toggles pseudo-localization ON
**Then** the preview shows accented text with ~35% expansion. Any plain English text in the consuming app that doesn't go through i18n is visually identified as a bug.

### RTL Mirroring

**When** the developer toggles RTL mode ON
**Then** `document.documentElement.dir` is set to `"rtl"` and the toolbar's own layout adjusts accordingly.

### Persistence

**When** the developer configures locale=`fr-FR`, timezone=`Europe/Paris`, and refreshes the page
**Then** all settings are restored from localStorage automatically.

### Backward Compatibility

**When** an existing app uses `showLanguageTool: false` in `ToolbarConfig`
**Then** the i18n Tool is hidden (the old flag maps to the new one).

## Out of Scope

- Actual translation file loading or bundling — the tool only signals which locale is active; the consuming app handles translation loading.
- Intercepting or monkey-patching `Intl` or `Date` browser APIs — the tool provides override values, not automatic API interception.
- Building a full translation management UI — this is a simulation/testing tool, not a CMS.
- Network mocker integration for locale-specific API responses.
