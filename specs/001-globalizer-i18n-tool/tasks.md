# Tasks: i18n Tool (Advanced i18n Simulation)

**Plan**: [plan.md](./plan.md) | **Date**: 2026-03-08

## Format

- `[P]` = Can run in parallel  |  `[A]` = Agent-eligible

---

## Phase 1: Core Implementation (Sequential)

- [x] **T001** Define i18n models — `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n.models.ts`
  - **Do**: Create `i18n.models.ts` with interfaces: `I18nLocale` (id, name, code), `I18nTimezone` (id, name, offset), `I18nCurrency` (code, name, symbol), `I18nUnitSystem` (`'metric' | 'imperial'`), and `I18nState` (composite: locale, timezone, currency, unitSystem, pseudoLocEnabled, rtlEnabled). Include a `DEFAULT_TIMEZONES` and `DEFAULT_CURRENCIES` const array with common values for built-in options.
  - **Verify**: File compiles with `nx build ngx-dev-toolbar --dry-run` or IDE shows no type errors.

- [x] **T002** Create formatting utilities *(depends on T001)* — `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-formatting.utils.ts`
  - **Do**: Create pure utility functions using browser `Intl` APIs: `formatNumber(locale: string, value: number): string`, `formatDate(locale: string, timezone: string, date: Date): string`, `formatTime(locale: string, timezone: string, date: Date): string`, `formatCurrency(locale: string, currency: string, value: number): string`, `pseudoLocalize(text: string): string` (char-map accent transform wrapping in brackets like `[Ħéļļö]`), `expandText(text: string, factor?: number): string` (default ~35% expansion by repeating vowels/inserting padding chars).
  - **Verify**: Functions are importable and return expected strings for known inputs (e.g., `formatNumber('de-DE', 1234.56)` → `'1.234,56'`).

- [x] **T003** Create i18n internal service *(depends on T001)* — `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-internal.service.ts`
  - **Do**: Create `ToolbarInternalI18nService` (providedIn: root). Inject `ToolbarStorageService` and `ToolbarStateService`. Create BehaviorSubjects: `locale$`, `timezone$`, `currency$`, `unitSystem$`, `pseudoLocEnabled$`, `rtlEnabled$`. Storage keys: `i18n.locale`, `i18n.timezone`, `i18n.currency`, `i18n.unitSystem`, `i18n.pseudoLoc`, `i18n.rtl`. Constructor loads saved values. Include: `setForcedLocale()`, `removeForcedLocale()`, `getForcedLocale(): Observable<I18nLocale[]>`, `setAvailableLocales()`, `getAvailableLocales()`, and equivalent getters/setters for timezone, currency, unitSystem, pseudoLoc (boolean), RTL (boolean). RTL setter should also set `document.documentElement.dir`. Add preset hooks: `applyPresetI18n(state: Partial<I18nState>)`, `getCurrentI18nState(): I18nState`. Add migration: in `loadFromStorage()`, check for old `language` key and migrate to `i18n.locale`. Follow exact pattern from `language-internal.service.ts`.
  - **Verify**: Service instantiates without errors. `getForcedLocale()` returns empty array by default.

- [x] **T004** Create i18n public service *(depends on T003)* — `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n.service.ts`
  - **Do**: Create `ToolbarI18nService` implementing `ToolbarService<I18nLocale>`. Inject `ToolbarInternalI18nService`. Implement `setAvailableOptions(locales)` → delegates to `internalService.setAvailableLocales()`. Implement `getForcedValues()` → delegates to `internalService.getForcedLocale()`. Implement `getValues()` → same as `getForcedValues()` (single-selection tool). Add additional typed accessors: `getForcedTimezone(): Observable<I18nTimezone | null>`, `getForcedCurrency(): Observable<I18nCurrency | null>`, `getUnitSystem(): Observable<I18nUnitSystem | null>`, `isPseudoLocalizationEnabled(): Observable<boolean>`, `isRtlEnabled(): Observable<boolean>`, `setAvailableTimezones(timezones: I18nTimezone[])`, `setAvailableCurrencies(currencies: I18nCurrency[])`.
  - **Verify**: Service compiles. `ToolbarService<I18nLocale>` interface is satisfied.

- [x] **T005** Create i18n tool component styles *(no dependency)* — `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-tool.component.scss`
  - **Do**: Create SCSS with sections: `.i18n-section` (flex column, `gap: var(--ndt-spacing-md)`, `padding-top: var(--ndt-spacing-sm)` defensive), `.i18n-select-group` (label + select pair with `margin-top: var(--ndt-spacing-sm)`), `.i18n-preview` (background: `var(--ndt-hover-bg)`, border-radius: `var(--ndt-border-radius-medium)`, padding: `var(--ndt-spacing-md)`, monospace font for values), `.i18n-preview-row` (flex row, justify-content: space-between), `.i18n-toggle-section` (flex column with gap), `.i18n-toggle-row` (flex row, align-items: center, justify-content: space-between). Use defensive spacing patterns per CLAUDE.md.
  - **Verify**: SCSS compiles without errors.

- [x] **T006** Create i18n tool component *(depends on T002, T003, T005)* — `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-tool.component.ts`
  - **Do**: Create `ToolbarI18nToolComponent` (selector: `ndt-i18n-tool`, standalone, OnPush, imports: `ToolbarToolComponent`, `ToolbarSelectComponent`). Inject `ToolbarInternalI18nService`. Set `ToolbarWindowOptions` with `title: 'i18n'`, `description: 'Simulate regional & linguistic environments'`, `size: 'medium'`, `id: 'ndt-i18n'`, `isBeta: true`, `isClosable: true`, `icon: 'translate'`. Template sections: (1) Four `<ndt-select>` dropdowns for locale, timezone, currency, unit system — each with "Not Forced" default option, bound to signals from internal service. (2) Formatting Preview panel using `computed()` signals that call formatting utils with current locale/timezone/currency to show live number, date, time, currency examples. (3) Stress Testing section with two toggle rows (pseudo-localization, RTL) using `<input type="checkbox">` bound to internal service booleans. Wire `onLocaleChange()`, `onTimezoneChange()`, `onCurrencyChange()`, `onUnitSystemChange()`, `onPseudoLocToggle()`, `onRtlToggle()` methods.
  - **Verify**: Component compiles. `nx build ngx-dev-toolbar` succeeds.

- [x] **T007** Update ToolbarConfig interface — `libs/ngx-dev-toolbar/src/models/toolbar-config.interface.ts`
  - **Do**: Add `showI18nTool?: boolean` with JSDoc (`Show/hide the i18n tool, @default true`). Add `@deprecated Use showI18nTool instead` JSDoc to existing `showLanguageTool`.
  - **Verify**: Interface compiles. Existing references to `showLanguageTool` still work.

- [x] **T008** Wire i18n tool into toolbar *(depends on T006, T007)* — `libs/ngx-dev-toolbar/src/toolbar.component.ts`
  - **Do**: Import `ToolbarI18nToolComponent`. Replace `@if (config().showLanguageTool ?? false) { <ndt-language-tool /> }` with `@if ((config().showI18nTool ?? config().showLanguageTool) ?? false) { <ndt-i18n-tool /> }`. Add `ToolbarI18nToolComponent` to imports array. Keep `ToolbarLanguageToolComponent` import (might still be used in existing apps via ng-content).
  - **Verify**: `nx build ngx-dev-toolbar` succeeds. Toolbar renders i18n tool when `showI18nTool: true` is set in config.

- [x] **T009** Deprecate language services *(depends on T003)* — `libs/ngx-dev-toolbar/src/tools/language-tool/language-internal.service.ts`, `language.service.ts`
  - **Do**: In `language-internal.service.ts`: add `@deprecated Use ToolbarInternalI18nService instead` to class JSDoc. Inject `ToolbarInternalI18nService`. Delegate `setForcedLanguage()` → `i18nService.setForcedLocale({id, name, code: id})`, `getForcedLanguage()` → `i18nService.getForcedLocale()` mapped to `Language[]`, `removeForcedLanguage()` → `i18nService.removeForcedLocale()`, `setAppLanguages()` → `i18nService.setAvailableLocales()` mapped from `Language[]` to `I18nLocale[]`, `applyPresetLanguage()` → delegates to i18n service, `getCurrentForcedLanguage()` → delegates. Remove internal BehaviorSubjects (source of truth moves to i18n service). In `language.service.ts`: add `@deprecated Use ToolbarI18nService instead` to class JSDoc. Keep existing implementation (it delegates to language-internal which now delegates to i18n).
  - **Verify**: `nx build ngx-dev-toolbar` succeeds. Existing language service tests still pass: `nx test ngx-dev-toolbar --testPathPattern=language`.

- [x] **T010** Update public API exports — `libs/ngx-dev-toolbar/src/index.ts`
  - **Do**: Add exports section for i18n Tool: `export * from './tools/i18n-tool/i18n.models';`, `export * from './tools/i18n-tool/i18n.service';`, `export * from './tools/i18n-tool/i18n-tool.component';`. Keep existing language tool exports (they're deprecated but still public API).
  - **Verify**: `nx build ngx-dev-toolbar` succeeds. New types are importable from `ngx-dev-toolbar`.

- [x] **T011** Extend presets with i18n dimensions *(depends on T003)* — `libs/ngx-dev-toolbar/src/tools/presets-tool/presets.models.ts`, `presets-internal.service.ts`
  - **Do**: In `presets.models.ts`: extend `ToolbarPresetConfig` with optional `i18n?: { locale?: string | null; timezone?: string | null; currency?: string | null; unitSystem?: string | null; pseudoLocEnabled?: boolean; rtlEnabled?: boolean; }`. Extend `PresetCategoryOptions` with `includeI18n?: boolean`. Extend `PartialApplyOptions` with `applyI18n?: boolean`. In `presets-internal.service.ts`: inject `ToolbarInternalI18nService`. In `captureCurrentConfig()`: capture i18n state via `this.i18nService.getCurrentI18nState()`. In `applyPreset()` and `partialApplyPreset()`: apply i18n config via `this.i18nService.applyPresetI18n(preset.config.i18n)`. Handle missing `i18n` key gracefully for old presets (default to no-op).
  - **Verify**: `nx build ngx-dev-toolbar` succeeds. Existing preset tests still pass.

- [x] **T012** Create i18n documentation page — `apps/docs/src/content/docs/i18n.mdx`
  - **Do**: Create MDX file with Starlight frontmatter (`title: 'i18n Tool'`, `description: 'Advanced i18n simulation...'`). Sections: Overview (what the tool does, replaces Language tool), Use Cases (locale testing, timezone simulation, currency validation, pseudo-localization for hardcoded string detection, RTL layout verification), Quick Start (TypeScript code showing `ToolbarI18nService` injection, `setAvailableOptions()` with sample locales, `getForcedValues()` subscription), Advanced Usage (subsections: Transloco integration, Angular i18n hooks, decoupled currency/timezone, pseudo-localization workflow, RTL testing), API Reference table (method signatures), Best Practices, Related Tools. Follow pattern from `feature-flags.mdx` and `language.mdx`.
  - **Verify**: `nx build docs` or manually verify MDX syntax is valid.

- [x] **T013** Add deprecation notice to language docs — `apps/docs/src/content/docs/language.mdx`
  - **Do**: Add an Astro Starlight `:::caution` admonition at top of page: `:::caution[Deprecated] The Language tool has been replaced by the [i18n Tool](/ngx-dev-toolbar/i18n). The Language tool is still supported for backward compatibility but will be removed in a future major version. :::`. Keep existing content below.
  - **Verify**: Page renders with visible deprecation banner.

- [x] **T014** Update Astro sidebar config — `apps/docs/astro.config.mjs`
  - **Do**: In the `sidebar` → `Tools` items array, add `{ label: 'i18n', slug: 'i18n' }` after the Language entry. Keep Language entry (users may still reference it).
  - **Verify**: `nx build docs` succeeds. Sidebar shows both "Language" and "i18n" entries.

- [x] **T015** Create demo page *(depends on T004)* — `apps/ngx-dev-toolbar-demo/src/app/components/i18n-demo/i18n-demo.component.ts`
  - **Do**: Create standalone `I18nDemoComponent` (OnPush). Import `ToolbarI18nService`. In constructor: call `setAvailableOptions()` with sample locales (`en-US`, `ja-JP`, `de-DE`, `fr-FR`, `ar-SA`). Subscribe to `getForcedValues()` and display current forced locale. Add computed formatting previews using `Intl` APIs showing number, date, time, currency in current locale. Add section showing pseudo-localization effect on sample strings. Add section demonstrating RTL status. Use card-based layout with responsive grid. Include inline styles following demo app patterns.
  - **Verify**: Component compiles.

- [x] **T016** Wire demo route and app config *(depends on T015)* — `apps/ngx-dev-toolbar-demo/src/app/app.routes.ts`, `app.component.ts`
  - **Do**: In `app.routes.ts`: add `{ path: 'i18n', loadComponent: () => import('./components/i18n-demo/i18n-demo.component').then(m => m.I18nDemoComponent) }`. In `app.component.ts`: replace `ToolbarLanguageService` import with `ToolbarI18nService`. Replace `setAvailableOptions([{id:'en', name:'English'}, ...])` with `setAvailableOptions([{id:'en-US', name:'English (US)', code:'en-US'}, ...])` using richer locale objects. Add `setAvailableTimezones()` and `setAvailableCurrencies()` calls. Update toolbar config to use `showI18nTool: true` instead of `showLanguageTool: true`.
  - **Verify**: `nx serve ngx-dev-toolbar-demo` runs. Navigating to `/i18n` shows the demo page.

- [x] **T017** Update README — `README.md`
  - **Do**: Find the "Language Switching" mention in the feature list. Replace with "i18n Tool — Advanced internationalization simulation with locale, timezone, currency, pseudo-localization, and RTL support". If there's a tools section, update accordingly.
  - **Verify**: README renders correctly on GitHub.

---

## Phase 2: Quality (Parallel — launch agents in single message)

- [x] **T018** [P][A] Unit tests for internal service — `test-expert`
  - **Files**: `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-internal.service.spec.ts`
  - **Pattern**: Jest with `TestBed`, mock `ToolbarStorageService`, `jest.fn()`, AAA pattern, `firstValueFrom` for observable assertions
  - **Reference**: `libs/ngx-dev-toolbar/src/tools/language-tool/language-internal.service.spec.ts`
  - **Cover**: initialization (empty defaults, load from storage), set/get/remove for each dimension (locale, timezone, currency, unitSystem), boolean toggles (pseudoLoc, RTL), persistence to localStorage, preset hooks (applyPresetI18n, getCurrentI18nState), old `language` key migration, `isEnabled()` gating

- [x] **T019** [P][A] Unit tests for public service — `test-expert`
  - **Files**: `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n.service.spec.ts`
  - **Pattern**: Jest with `TestBed`, mock internal service, verify delegation
  - **Reference**: `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags.service.spec.ts`
  - **Cover**: `ToolbarService<I18nLocale>` interface compliance (setAvailableOptions, getForcedValues, getValues), typed accessors (getForcedTimezone, getForcedCurrency, etc.)

- [x] **T020** [P][A] Unit tests for formatting utilities — `test-expert`
  - **Files**: `libs/ngx-dev-toolbar/src/tools/i18n-tool/i18n-formatting.utils.spec.ts`
  - **Pattern**: Jest, pure function tests, no TestBed needed
  - **Reference**: N/A (first pure util tests in project)
  - **Cover**: `formatNumber` with various locales, `formatDate`/`formatTime` with timezone, `formatCurrency` with different currency codes, `pseudoLocalize` accent transform, `expandText` length increase ~35%

---

## Progress

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1 | T001–T017 | [x] |
| Phase 2 | T018–T020 | [x] |
