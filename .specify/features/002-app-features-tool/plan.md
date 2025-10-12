# Implementation Plan: App Features Tool

**Branch**: `002-app-features-tool` | **Date**: 2025-10-12 | **Spec**: [spec.md](/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/.specify/features/002-app-features-tool/spec.md)
**Input**: Feature specification from `/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/.specify/features/002-app-features-tool/spec.md`

## Summary

The App Features Tool enables developers to test product-level feature availability (license tiers, deployment configurations, environment flags) without backend changes. Following the established dual-service architecture pattern from feature flags tool, this tool provides a 3-state dropdown interface (Not Forced / Enabled / Disabled) with search/filter capabilities, localStorage persistence, and preset integration for automated testing scenarios.

**Technical Approach**: Implement dual-service architecture with app-features-internal.service.ts managing signal-based state and localStorage persistence, app-features.service.ts exposing DevToolsService<DevToolbarAppFeature> public API, and app-features-tool.component.ts providing OnPush UI with reactive computed filters. Demo app integration will showcase product tier scenarios (Basic, Professional, Enterprise) with real-time UI updates driven by forced feature values.

## Technical Context

**Language/Version**: TypeScript 5.7+ with Angular 19.0+
**Primary Dependencies**: Angular 19.0 (signals, OnPush), RxJS 7.8, Angular CDK 19.0
**Storage**: localStorage via DevToolsStorageService with key 'app-features'
**Testing**: Jest for unit/integration tests, Playwright for E2E tests
**Target Platform**: Browser-based Angular applications (ES2022+)
**Project Type**: Angular library monorepo managed with Nx 20.3
**Performance Goals**:
  - Search/filter response <100ms for up to 100 features
  - State updates trigger change detection <16ms (60fps)
  - Tool bundle size delta <5KB gzipped
  - Demo UI updates <100ms after feature override change
**Constraints**:
  - Must follow standalone component architecture (no NgModules)
  - Must use signal-first state management (computed for derived state)
  - Must implement OnPush change detection for all components
  - Must maintain <80% unit test coverage for services, >70% for components
  - Zero production impact when toolbar hidden
**Scale/Scope**:
  - Support 100+ features per application
  - Handle real-time search across name/description fields
  - Persist forced state across sessions with automatic cleanup
  - Integration with 3+ demo scenarios (product tiers)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Standalone Component Architecture ✅ PASS

- **Compliance**: All components will use implicit standalone: true (Angular 19+)
- **Components**: DevToolbarAppFeaturesTool will be standalone with declared imports
- **Public API**: Exports through /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/index.ts
- **No violations**: No NgModules, all dependencies explicitly imported

### Principle II: Signal-First State Management ✅ PASS

- **Compliance**: Internal service uses signal() for reactive state, computed() for filtered lists
- **State Pattern**:
  - `appFeatures$ = BehaviorSubject<DevToolbarAppFeature[]>([])` for incoming config
  - `forcedFeaturesSubject = BehaviorSubject<ForcedAppFeaturesState>({ enabled: [], disabled: [] })`
  - `features = toSignal(features$, { initialValue: [] })` for component reactivity
  - `filteredFeatures = computed(() => ...)` for search/filter logic
- **Public API**: getForcedValues() returns Observable for consumer compatibility
- **No violations**: Pure state updates with spread operators, effect() for localStorage side effects

### Principle III: Test-First Development (NON-NEGOTIABLE) ✅ PASS

- **TDD Workflow**:
  1. Phase 2 generates test skeletons from acceptance criteria
  2. User validates test scenarios before implementation
  3. Red-Green-Refactor cycle for each user story
- **Test Coverage**:
  - app-features-internal.service.spec.ts: state management, localStorage, edge cases
  - app-features.service.spec.ts: public API contract adherence
  - app-features-tool.component.spec.ts: UI rendering, search/filter, user interactions
  - E2E tests: demo app integration with product tier scenarios
- **Quality Gates**: Jest with >80% service coverage, >70% component coverage

### Principle IV: OnPush Change Detection & Performance ✅ PASS

- **Strategy**: ChangeDetectionStrategy.OnPush on all components
- **Reactivity**: Signals and computed values trigger change detection automatically
- **Performance Targets**:
  - Tool switching <50ms (inherits from DevToolbarToolComponent)
  - State updates <16ms via signal reactivity
  - Bundle size <5KB gzipped (matches feature flags tool pattern)
- **No violations**: Immutable state updates, no markForCheck() abuse

### Principle V: Consistent Tool Architecture Pattern ✅ PASS

- **Three-Layer Architecture**:
  1. **Tool Component**: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts
  2. **Internal Service**: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-internal.service.ts
  3. **Public Service**: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features.service.ts
  4. **Models**: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features.models.ts
- **DevToolsService Contract**:
  ```typescript
  class DevToolbarAppFeaturesService implements DevToolsService<DevToolbarAppFeature> {
    setAvailableOptions(features: DevToolbarAppFeature[]): void;
    getForcedValues(): Observable<DevToolbarAppFeature[]>;
  }
  ```
- **No violations**: Exact pattern match with feature flags and language tools

### Principle VI: Design System Consistency ✅ PASS

- **CSS Custom Properties**: All styles use --ndt-* prefixed design tokens
- **Theme Support**: [attr.data-theme]="theme()" for light/dark themes
- **Reusable Components**:
  - ndt-input for search functionality
  - ndt-select for filter dropdown and 3-state feature controls
  - ndt-toolbar-tool wrapper for window management
- **Responsive Layout**: Flexbox with scrollable feature list (overflow-y: auto)
- **No violations**: No inline hex colors, consistent spacing/border-radius

### Principle VII: Zero Production Impact ✅ PASS

- **Tree-Shakeable**: Tool exported individually, not bundled unless imported
- **No Runtime Overhead**: Hidden by default, Ctrl+Shift+D disabled in production
- **Production Bundle**: Zero impact if DevToolbarComponent not imported
- **No violations**: No global state pollution, localStorage scoped with 'AngularDevTools.' prefix

## Project Structure

### Documentation (this feature)

```
/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/.specify/features/002-app-features-tool/
├── plan.md              # This file (output of research phase)
├── spec.md              # Feature specification (input, already exists)
├── research.md          # Phase 0: Technical research findings
├── data-model.md        # Phase 1: Data structures and type definitions
├── quickstart.md        # Phase 1: Integration guide for consuming apps
├── contracts/           # Phase 1: Service contracts and interfaces
│   ├── public-api.md    # DevToolbarAppFeaturesService public API
│   ├── internal-api.md  # DevToolbarInternalAppFeaturesService state API
│   └── preset-api.md    # Preset integration methods (applyPresetFeatures, getCurrentForcedState)
└── tasks.md             # Phase 2: Actionable tasks (created by /speckit.tasks command)
```

### Source Code (repository root)

```
/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/

libs/ngx-dev-toolbar/src/
├── tools/
│   └── app-features-tool/
│       ├── app-features.models.ts                    # NEW: DevToolbarAppFeature, AppFeatureFilter types
│       ├── app-features-internal.service.ts          # NEW: State management, localStorage
│       ├── app-features-internal.service.spec.ts     # NEW: Unit tests for internal service
│       ├── app-features.service.ts                   # NEW: Public API implementing DevToolsService
│       ├── app-features.service.spec.ts              # NEW: Unit tests for public service
│       ├── app-features-tool.component.ts            # NEW: UI component with search/filter
│       └── app-features-tool.component.spec.ts       # NEW: Component unit tests
├── models/
│   └── dev-tools.interface.ts                        # EXISTING: DevToolsService<T> interface
├── components/
│   ├── input/                                        # EXISTING: Search input component
│   ├── select/                                       # EXISTING: Dropdown component
│   └── toolbar-tool/                                 # EXISTING: Tool wrapper component
├── utils/
│   └── storage.service.ts                            # EXISTING: localStorage abstraction
└── index.ts                                          # MODIFIED: Add app features tool exports

apps/ngx-dev-toolbar-demo/src/
├── app/
│   ├── app.component.ts                              # MODIFIED: Integrate app features tool
│   ├── services/
│   │   └── app-features.service.ts                   # NEW: Demo app feature management
│   └── features/
│       ├── basic-tier/                               # NEW: Basic product tier demo
│       ├── professional-tier/                        # NEW: Professional product tier demo
│       └── enterprise-tier/                          # NEW: Enterprise product tier demo
└── ...

apps/ngx-dev-toolbar-demo-e2e/
└── src/
    └── app-features-tool.spec.ts                     # NEW: E2E tests for tool integration
```

**Structure Decision**: Angular library monorepo using Nx workspace. The dual-service pattern (internal + public) follows the established convention from feature-flags-tool and language-tool, ensuring consistency across all dev toolbar tools. Demo app integration will showcase real-world product tier scenarios with conditional UI based on forced feature values.

## Complexity Tracking

*No constitution violations requiring justification.*

---

## Phase 0: Research

### Research Topics

1. **Feature Flags Tool Reference Implementation**
   - Source: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/feature-flags-tool/
   - Purpose: Understand dual-service pattern, localStorage persistence, search/filter implementation
   - Key Findings:
     - Internal service uses `BehaviorSubject` with `combineLatest` to merge app flags with forced state
     - Forced state stored as `{ enabled: string[], disabled: string[] }`
     - Component uses `computed()` for filtered lists with search + filter logic
     - 3-state dropdown: 'not-forced', 'on', 'off' values mapped to setFlag/removeFlagOverride methods
     - Empty states handled with conditional rendering (@if/@else)

2. **DevToolsService Interface Contract**
   - Source: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/models/dev-tools.interface.ts
   - Purpose: Verify public API contract for tool services
   - Key Findings:
     - Generic interface `DevToolsService<OptionType>` with two required methods
     - `setAvailableOptions(options: OptionType[]): void` - Configure tool with app data
     - `getForcedValues(): Observable<OptionType[]>` - Emit forced overrides to consumers
     - All tool services must implement this interface for consistency

3. **Storage Service Usage Pattern**
   - Source: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/utils/storage.service.ts
   - Purpose: Understand localStorage abstraction and key management
   - Key Findings:
     - Service prefixes all keys with 'AngularDevTools.'
     - Supports generic get/set with JSON serialization
     - Tracks all tool keys for batch operations (getAllSettings, clearAllSettings)
     - Key validation: `getToolKey()` ensures prefix applied consistently

4. **Demo App Integration Pattern**
   - Source: /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/apps/ngx-dev-toolbar-demo/src/app/app.component.ts
   - Purpose: Learn how to integrate tool with demo app services
   - Key Findings:
     - App component injects both DevToolbar service and app-level feature service
     - `setAvailableOptions()` called in ngOnInit with mapped app data
     - `getForcedValues()` subscribed with `takeUntilDestroyed()` for automatic cleanup
     - Forced values applied to app service, triggering reactive UI updates via signals/observables
     - Example: Language tool forces language change in TranslocoService, updates entire app

5. **Preset Integration Requirements**
   - Source: Spec requirement FR-012, Out of Scope section
   - Purpose: Define methods for preset tool integration without circular dependencies
   - Key Findings:
     - Preset tool will call `applyPresetFeatures(state: ForcedAppFeaturesState): void` to restore saved state
     - Preset tool will call `getCurrentForcedState(): ForcedAppFeaturesState` to capture current config
     - Methods must be on public service, not internal service (consistent with public API surface)
     - localStorage validation must clean invalid feature IDs before applying preset state

### Technology Decisions

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Use `BehaviorSubject` + `combineLatest` for state merging | Proven pattern from feature flags tool, handles async app config updates gracefully | Direct signal() merging - more complex reactivity tracking, harder to test |
| Store forced state as `{ enabled: string[], disabled: string[] }` | Matches feature flags/permissions pattern, efficient lookup, clear intent | Object map `{ [id]: boolean }` - harder to iterate, doesn't distinguish "forced off" vs "not forced" |
| 3-state dropdown: Not Forced / Enabled / Disabled | Matches feature flags UX, clear mental model for developers | Toggle switch - doesn't support "not forced" state, checkbox - ambiguous for forced disabled |
| Search across name + description | Maximizes discoverability, matches feature flags behavior | Name-only search - too restrictive, tag-based search - out of scope for MVP |
| Filter options: All / Forced / Enabled / Disabled | Standard filtering pattern across all tools, supports common dev workflows | Category-based filters - requires feature grouping (out of scope) |
| localStorage key 'app-features' | Short, descriptive, matches tool naming convention | 'product-features' - too generic, 'application-features' - too verbose |
| Icon: 'puzzle' | Visually represents product capabilities/features, distinct from 'toggle-left' (flags) | 'cube' - too similar to package/module icon, 'layers' - confusing with architecture |

### Open Questions

1. **Q: Should we validate feature names/IDs on setAvailableOptions()?**
   - A: YES - Warn if duplicate IDs detected, reject empty IDs, trim whitespace from names
   - Rationale: Prevents developer errors early, matches strict TypeScript philosophy

2. **Q: How to handle features with missing descriptions in UI?**
   - A: Optional field in model, render without description paragraph if undefined
   - Rationale: Descriptions helpful but not mandatory, matches feature flags pattern

3. **Q: Should search be debounced?**
   - A: NO for MVP - computed() reactivity fast enough for <100 features
   - Future Enhancement: Add 200ms debounce if performance issues reported
   - Rationale: Keep implementation simple, optimize only if necessary

4. **Q: What if localStorage quota exceeded when persisting forced features?**
   - A: Catch exception, log error to console, show toast notification (if toast service exists)
   - Rationale: Graceful degradation, inform developer of issue without breaking app

5. **Q: Should we support bulk operations (enable all, disable all, clear all)?**
   - A: NO - explicitly out of scope per spec, adds UI complexity
   - Future Enhancement: Add bulk actions in v2 if requested by users

---

## Phase 1: Design Artifacts

### Data Model

See: [data-model.md](/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/.specify/features/002-app-features-tool/data-model.md)

**Core Types**:

```typescript
// /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features.models.ts

/**
 * Represents a product-level application feature that can be enabled/disabled
 * based on license tier, deployment configuration, or environment flags.
 */
export interface DevToolbarAppFeature {
  /** Unique identifier for the feature (e.g., 'advanced-analytics', 'multi-user-support') */
  id: string;

  /** Display name shown in the toolbar UI (e.g., 'Advanced Analytics Dashboard') */
  name: string;

  /** Optional description explaining the feature's purpose */
  description?: string;

  /** Current enabled state (true = feature available to user) */
  isEnabled: boolean;

  /** Whether the feature is forced via toolbar (true = overridden, false = natural state) */
  isForced: boolean;
}

/**
 * Filter options for displaying features in the toolbar
 */
export type AppFeatureFilter = 'all' | 'forced' | 'enabled' | 'disabled';

/**
 * Internal storage format for persisted forced feature overrides
 */
export interface ForcedAppFeaturesState {
  /** Array of feature IDs forced to enabled state */
  enabled: string[];

  /** Array of feature IDs forced to disabled state */
  disabled: string[];
}
```

**Key Design Decisions**:
- `isEnabled` and `isForced` separate fields (not merged) to preserve original state intent
- `description` optional to reduce boilerplate for simple features
- Filter type union prevents invalid filter strings at compile time
- Storage state uses arrays (not Set) for JSON serialization compatibility

### Contracts

#### Public API Contract

See: [contracts/public-api.md](/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/.specify/features/002-app-features-tool/contracts/public-api.md)

```typescript
// /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features.service.ts

@Injectable({ providedIn: 'root' })
export class DevToolbarAppFeaturesService implements DevToolsService<DevToolbarAppFeature> {
  /**
   * Configure the available app features displayed in the toolbar.
   * Replaces any previously configured features.
   *
   * @param features Array of app features with current state
   * @throws Error if duplicate feature IDs detected
   * @example
   * appFeaturesService.setAvailableOptions([
   *   { id: 'analytics', name: 'Analytics Dashboard', isEnabled: false, isForced: false },
   *   { id: 'multi-user', name: 'Multi-User Support', isEnabled: true, isForced: false }
   * ]);
   */
  setAvailableOptions(features: DevToolbarAppFeature[]): void;

  /**
   * Observe features forced through the toolbar.
   * Emits whenever a feature is enabled/disabled/unforced via UI.
   *
   * @returns Observable emitting array of forced features with updated isEnabled state
   * @example
   * appFeaturesService.getForcedValues().subscribe(forcedFeatures => {
   *   forcedFeatures.forEach(feature => {
   *     if (feature.isEnabled) {
   *       enableFeatureInApp(feature.id);
   *     } else {
   *       disableFeatureInApp(feature.id);
   *     }
   *   });
   * });
   */
  getForcedValues(): Observable<DevToolbarAppFeature[]>;

  /**
   * Apply preset feature configuration (for preset tool integration).
   * Overwrites current forced state with provided configuration.
   *
   * @param state Forced feature state from preset
   * @example
   * // Preset tool calls this when loading "Enterprise Tier" preset
   * appFeaturesService.applyPresetFeatures({
   *   enabled: ['analytics', 'multi-user', 'white-label'],
   *   disabled: []
   * });
   */
  applyPresetFeatures(state: ForcedAppFeaturesState): void;

  /**
   * Get current forced feature state for preset saving.
   *
   * @returns Current forced state with enabled/disabled feature IDs
   * @example
   * const currentState = appFeaturesService.getCurrentForcedState();
   * presetService.savePreset('My Config', { appFeatures: currentState });
   */
  getCurrentForcedState(): ForcedAppFeaturesState;
}
```

#### Internal API Contract

See: [contracts/internal-api.md](/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/.specify/features/002-app-features-tool/contracts/internal-api.md)

```typescript
// /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-internal.service.ts

@Injectable({ providedIn: 'root' })
export class DevToolbarInternalAppFeaturesService {
  private readonly STORAGE_KEY = 'app-features';

  /** All features with forced state applied (signal for reactive UI) */
  public features: Signal<DevToolbarAppFeature[]>;

  /**
   * Set available app features (called by public service)
   */
  setAppFeatures(features: DevToolbarAppFeature[]): void;

  /**
   * Get observable of available features (for public service)
   */
  getAppFeatures(): Observable<DevToolbarAppFeature[]>;

  /**
   * Get observable of forced features (for public service)
   */
  getForcedFeatures(): Observable<DevToolbarAppFeature[]>;

  /**
   * Force a feature to enabled or disabled state
   * Persists to localStorage immediately
   */
  setFeature(featureId: string, isEnabled: boolean): void;

  /**
   * Remove forced override, return feature to natural state
   * Updates localStorage immediately
   */
  removeFeatureOverride(featureId: string): void;

  /**
   * Apply preset state (batch operation)
   * Overwrites current forced state, persists to localStorage
   */
  applyForcedState(state: ForcedAppFeaturesState): void;

  /**
   * Get current forced state for preset saving
   */
  getCurrentForcedState(): ForcedAppFeaturesState;

  /**
   * Load forced state from localStorage (called in constructor)
   * Validates feature IDs against configured features
   */
  private loadForcedFeatures(): void;

  /**
   * Validate and clean forced state (remove invalid feature IDs)
   * Logs warnings for removed IDs
   */
  private validateAndCleanForcedState(): void;
}
```

### Quickstart Guide

See: [quickstart.md](/Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/.specify/features/002-app-features-tool/quickstart.md)

**Basic Integration** (5 minutes):

```typescript
// 1. Import the service in your app component
import { DevToolbarAppFeaturesService, DevToolbarAppFeature } from 'ngx-dev-toolbar';

// 2. Inject the service
private appFeaturesService = inject(DevToolbarAppFeaturesService);

// 3. Configure available features in ngOnInit
ngOnInit() {
  const features: DevToolbarAppFeature[] = [
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Advanced analytics and reporting',
      isEnabled: this.hasBasicTier, // Current license tier
      isForced: false
    },
    {
      id: 'multi-user',
      name: 'Multi-User Support',
      description: 'Collaborate with team members',
      isEnabled: this.hasProfessionalTier,
      isForced: false
    },
    {
      id: 'white-label',
      name: 'White Label Branding',
      description: 'Custom branding and theming',
      isEnabled: this.hasEnterpriseTier,
      isForced: false
    }
  ];

  this.appFeaturesService.setAvailableOptions(features);
}

// 4. Subscribe to forced values (use takeUntilDestroyed for cleanup)
constructor() {
  this.appFeaturesService
    .getForcedValues()
    .pipe(takeUntilDestroyed())
    .subscribe(forcedFeatures => {
      forcedFeatures.forEach(feature => {
        // Update your app state based on forced feature
        this.updateFeatureState(feature.id, feature.isEnabled);
      });
    });
}

// 5. Use feature state in templates
@if (isFeatureEnabled('analytics')) {
  <app-analytics-dashboard />
}
```

**Demo App Product Tier Scenarios**:

```typescript
// Basic Tier (free plan)
const basicTierFeatures = [
  { id: 'core-features', name: 'Core Features', isEnabled: true, isForced: false },
  { id: 'single-user', name: 'Single User Mode', isEnabled: true, isForced: false },
  { id: 'basic-support', name: 'Community Support', isEnabled: true, isForced: false },
  { id: 'analytics', name: 'Analytics Dashboard', isEnabled: false, isForced: false }, // ❌ Not available
  { id: 'multi-user', name: 'Multi-User Support', isEnabled: false, isForced: false }, // ❌ Not available
];

// Professional Tier (paid plan)
const professionalTierFeatures = [
  { id: 'core-features', name: 'Core Features', isEnabled: true, isForced: false },
  { id: 'single-user', name: 'Single User Mode', isEnabled: true, isForced: false },
  { id: 'analytics', name: 'Analytics Dashboard', isEnabled: true, isForced: false }, // ✅ Available
  { id: 'multi-user', name: 'Multi-User Support', isEnabled: true, isForced: false }, // ✅ Available
  { id: 'priority-support', name: 'Priority Support', isEnabled: true, isForced: false },
  { id: 'white-label', name: 'White Label Branding', isEnabled: false, isForced: false }, // ❌ Not available
];

// Enterprise Tier (full access)
const enterpriseTierFeatures = [
  { id: 'core-features', name: 'Core Features', isEnabled: true, isForced: false },
  { id: 'analytics', name: 'Analytics Dashboard', isEnabled: true, isForced: false },
  { id: 'multi-user', name: 'Multi-User Support', isEnabled: true, isForced: false },
  { id: 'white-label', name: 'White Label Branding', isEnabled: true, isForced: false }, // ✅ Available
  { id: 'sso-integration', name: 'SSO Integration', isEnabled: true, isForced: false },
  { id: 'dedicated-support', name: 'Dedicated Support', isEnabled: true, isForced: false },
];
```

**Demo Scenario**: Developer on Basic tier wants to test Professional tier analytics feature:
1. Open dev toolbar (Ctrl+Shift+D)
2. Click "App Features" tool (puzzle icon)
3. Find "Analytics Dashboard" feature (shows "Not Forced" dropdown)
4. Change dropdown to "Enabled"
5. App immediately shows analytics dashboard in navigation
6. Developer can test analytics workflows without upgrading license
7. Refresh page - forced state persists from localStorage
8. Change dropdown back to "Not Forced" - analytics dashboard disappears

---

## Phase 2: Task Generation

Phase 2 generates actionable tasks with dependencies via `/speckit.tasks` command.

**Task generation will produce**:
- tasks.md with dependency-ordered implementation tasks
- Test skeletons for each user story acceptance criteria
- Integration tasks for demo app product tier scenarios
- Documentation tasks for public API and quickstart guide

**Expected task categories**:
1. **Setup Tasks**: Create file structure, models, interfaces
2. **Internal Service Tasks**: State management, localStorage, validation
3. **Public Service Tasks**: DevToolsService implementation, preset integration
4. **Component Tasks**: UI implementation, search/filter, 3-state dropdown
5. **Test Tasks**: Unit tests, integration tests, E2E tests
6. **Demo Integration Tasks**: Product tier services, demo components, navigation updates
7. **Documentation Tasks**: JSDoc comments, quickstart examples, CHANGELOG entry

**Task execution order**:
1. Data model and types (app-features.models.ts)
2. Internal service implementation (state + localStorage)
3. Internal service tests (TDD verification)
4. Public service implementation (API wrapper)
5. Public service tests (contract compliance)
6. Component implementation (UI + interactions)
7. Component tests (rendering + user events)
8. Demo app service implementation (product tiers)
9. Demo app integration (app.component.ts)
10. E2E tests (full workflow scenarios)
11. Documentation (JSDoc, quickstart, exports)
12. Manual QA verification (user story acceptance)

---

## Success Metrics

From spec.md Success Criteria section:

- **SC-001**: Developers can configure and force app features in under 30 seconds
  - **Measurement**: Time from setAvailableOptions() call to forcing feature via UI dropdown
  - **Target**: <30s for 3-feature configuration scenario

- **SC-002**: Forced feature overrides persist across page refreshes with 100% reliability
  - **Measurement**: Automated E2E test forcing 5 features, refreshing page, verifying all persist
  - **Target**: 100% pass rate over 100 test runs

- **SC-003**: Search returns results in under 100ms for feature lists up to 100 items
  - **Measurement**: Performance test with 100 features, measure computed() update time
  - **Target**: <100ms p95 latency

- **SC-004**: Demo app UI updates within 100ms of feature override change
  - **Measurement**: E2E test timing from dropdown change to DOM update
  - **Target**: <100ms from user interaction to UI change

- **SC-005**: Unit test coverage exceeds 80% for all services and components
  - **Measurement**: Jest coverage report (--coverage flag)
  - **Target**: Services >80%, Components >70%

- **SC-006**: Zero console errors or warnings during normal operation
  - **Measurement**: E2E test monitoring console output during feature forcing
  - **Target**: 0 errors/warnings in 10 complete workflow runs

- **SC-007**: Demo app demonstrates at least 3 real-world product feature scenarios
  - **Measurement**: Count of product tier demo components (Basic, Professional, Enterprise)
  - **Target**: 3+ tier scenarios with distinct feature sets

- **SC-008**: Tool integrates with presets system without requiring preset tool changes
  - **Measurement**: Public API surface includes applyPresetFeatures() and getCurrentForcedState()
  - **Target**: Methods implemented and tested in isolation (preset tool calls them when implemented)

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| localStorage quota exceeded with large feature lists | LOW | MEDIUM | Catch exception, log error, show toast notification. Provide clearAllSettings() method. |
| Performance degradation with 100+ features in search | LOW | MEDIUM | Use computed() for efficient reactivity. Add debouncing in future if issues reported. |
| Forced feature IDs become invalid after app config change | MEDIUM | LOW | Validate on load, remove invalid IDs with console warning, auto-clean localStorage. |
| Demo app integration too complex, delays release | LOW | HIGH | Keep demo simple: 3 tier scenarios, conditional rendering based on feature state. |
| Preset integration requires circular dependency | VERY LOW | MEDIUM | Public service exposes methods, preset tool imports service (one-way dependency). |
| Developers confused by 3-state dropdown semantics | LOW | LOW | Use clear labels: "Not Forced" / "Enabled" / "Disabled". Add tooltip if needed. |

---

## Definition of Done

Feature is complete when:

- [ ] All files in source code structure exist and pass TypeScript compilation
- [ ] All unit tests pass with >80% coverage for services, >70% for components
- [ ] All E2E tests pass for demo app integration scenarios
- [ ] Feature flags tool pattern exactly replicated (dual-service, localStorage, search/filter)
- [ ] Constitution principles verified: standalone, signals, OnPush, TDD, design system
- [ ] Demo app shows 3 product tier scenarios with conditional UI based on forced features
- [ ] Public API exports added to /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar/libs/ngx-dev-toolbar/src/index.ts
- [ ] JSDoc comments added for all public methods
- [ ] Quickstart guide verified with copy-paste demo app integration
- [ ] Manual QA: Configure 10 features, search/filter, force 3 features, refresh page, verify persistence
- [ ] PR review approved, all CI checks passing (lint, test, build)
- [ ] CHANGELOG.md updated with feature description and usage example
- [ ] User validates acceptance criteria for all 5 user stories

---

## Notes for Implementation

1. **Copy Feature Flags Pattern Exactly**: The app features tool is nearly identical to feature flags tool. Copy the file structure, service architecture, and component template as starting point. Only differences: icon='puzzle', different entity names, preset integration methods.

2. **localStorage Validation Critical**: Must validate forced feature IDs on load. If app removes a feature from setAvailableOptions(), the localStorage entry becomes stale. Clean invalid IDs automatically with console.warn() for debugging.

3. **Demo App Product Tiers**: Keep demo simple but realistic:
   - Basic tier: 3 features, 2 disabled (grayed out in UI)
   - Professional tier: 6 features, 1 disabled (enterprise feature)
   - Enterprise tier: 8 features, all enabled (full access)
   - Use @if (isFeatureEnabled('feature-id')) for conditional rendering
   - Show "Upgrade to unlock" messaging for disabled features

4. **Preset Integration Methods**: Add `applyPresetFeatures()` and `getCurrentForcedState()` to public service. These enable future preset tool to save/restore app feature configurations. Test in isolation - preset tool doesn't exist yet.

5. **3-State Dropdown Semantics**:
   - **Not Forced** (empty value ''): Feature returns to natural state from setAvailableOptions()
   - **Enabled** (value 'on'): Feature forced to enabled regardless of natural state
   - **Disabled** (value 'off'): Feature forced to disabled regardless of natural state
   - Use same select options structure as feature flags tool

6. **Performance Optimization**: computed() handles search/filter efficiently for MVP. If performance issues reported with 100+ features, add 200ms debounce to search signal. Don't optimize prematurely.

7. **Test Strategy**: Write tests FIRST based on acceptance criteria. Get user approval on test scenarios before implementing services/component. Follow strict TDD: Red (test fails) → Green (minimal code to pass) → Refactor (clean up while tests pass).

8. **Bundle Size Target**: App features tool should add <5KB gzipped to bundle. Use same components as feature flags tool (no new dependencies). Tree-shakeable exports ensure zero cost if not imported.
