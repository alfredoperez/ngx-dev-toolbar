# Toolbar Service Architecture Guide

**Last Updated**: 2025-10-12
**Purpose**: Document the service architecture patterns used in ngx-dev-toolbar tools

---

## Overview

The ngx-dev-toolbar uses a **dual-service architecture** for tools that need to integrate with consuming applications. This pattern separates public API from internal state management.

## Service Architecture Patterns

### Pattern 1: Dual-Service Architecture (Public API Tools)

**Use when**: Tool needs to expose a public API for app integration (e.g., Feature Flags, Language, Permissions)

**Structure**:
```
tools/[tool-name]/
├── [tool-name].service.ts          # Public API service
├── [tool-name]-internal.service.ts # Internal state management
├── [tool-name]-tool.component.ts   # UI component
└── [tool-name].models.ts           # Type definitions
```

#### Public Service (`*.service.ts`)

**Purpose**: Provides the public API for consuming applications

**Pattern**:
```typescript
@Injectable({ providedIn: 'root' })
export class DevToolbar[Name]Service implements DevToolsService<[Type]> {
  private internalService = inject(DevToolbarInternal[Name]Service);

  /**
   * Set available options from the consuming application
   */
  setAvailableOptions(options: [Type][]): void {
    this.internalService.setApp[Items](options);
  }

  /**
   * Get forced values that override app defaults
   * @returns Observable of forced items
   */
  getForcedValues(): Observable<[Type][]> {
    return this.internalService.getForced[Items]();
  }
}
```

**Key Characteristics**:
- Implements `DevToolsService<T>` interface
- Thin facade over internal service
- Injectable as `providedIn: 'root'`
- Only exposes methods needed by consumers
- Delegates all logic to internal service

**Example**: `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags.service.ts`

---

#### Internal Service (`*-internal.service.ts`)

**Purpose**: Manages internal state, persistence, and business logic

**Pattern**:
```typescript
@Injectable({ providedIn: 'root' })
export class DevToolbarInternal[Name]Service {
  private readonly STORAGE_KEY = '[tool-name]';
  private storageService = inject(DevToolsStorageService);

  // App-provided options
  private app[Items]$ = new BehaviorSubject<[Type][]>([]);

  // Forced state (toolbar overrides)
  private forced[State]Subject = new BehaviorSubject<Forced[Name]State>({
    enabled: [],
    disabled: [],
  });

  // Combined state (app + forced)
  public [items]$: Observable<[Type][]> = combineLatest([
    this.app[Items]$,
    this.forced[State]Subject.asObservable(),
  ]).pipe(
    map(([appItems, forcedState]) => {
      return appItems.map((item) => ({
        ...item,
        isForced: this.isItemForced(item.id, forcedState),
        isEnabled: this.getItemState(item.id, forcedState, item.isEnabled),
      }));
    })
  );

  // Signal for reactive components
  public [items] = toSignal(this.[items]$, { initialValue: [] });

  constructor() {
    this.loadForcedState();
  }

  // --- Public Methods (called by public service) ---

  setApp[Items](items: [Type][]): void {
    this.app[Items]$.next(items);
  }

  getForced[Items](): Observable<[Type][]> {
    return this.[items]$.pipe(
      map(items => items.filter(item => item.isForced))
    );
  }

  // --- Component Methods ---

  set[Item](id: string, enabled: boolean): void {
    const current = this.forced[State]Subject.value;
    const updated = this.updateForcedState(current, id, enabled);
    this.forced[State]Subject.next(updated);
    this.storageService.set(this.STORAGE_KEY, updated);
  }

  remove[Item]Override(id: string): void {
    const current = this.forced[State]Subject.value;
    const updated = {
      enabled: current.enabled.filter(i => i !== id),
      disabled: current.disabled.filter(i => i !== id),
    };
    this.forced[State]Subject.next(updated);
    this.storageService.set(this.STORAGE_KEY, updated);
  }

  // --- Preset Integration Methods ---

  applyPreset[Items](presetState: Forced[Name]State): void {
    this.forced[State]Subject.next(presetState);
    this.storageService.set(this.STORAGE_KEY, presetState);
  }

  getCurrentForcedState(): Forced[Name]State {
    return this.forced[State]Subject.value;
  }

  // --- Private Methods ---

  private loadForcedState(): void {
    const saved = this.storageService.get<Forced[Name]State>(this.STORAGE_KEY);
    if (saved) {
      this.forced[State]Subject.next(saved);
    }
  }

  private isItemForced(id: string, state: Forced[Name]State): boolean {
    return state.enabled.includes(id) || state.disabled.includes(id);
  }

  private getItemState(
    id: string,
    state: Forced[Name]State,
    defaultValue: boolean
  ): boolean {
    if (state.enabled.includes(id)) return true;
    if (state.disabled.includes(id)) return false;
    return defaultValue;
  }

  private updateForcedState(
    current: Forced[Name]State,
    id: string,
    enabled: boolean
  ): Forced[Name]State {
    return {
      enabled: enabled
        ? [...current.enabled.filter(i => i !== id), id]
        : current.enabled.filter(i => i !== id),
      disabled: !enabled
        ? [...current.disabled.filter(i => i !== id), id]
        : current.disabled.filter(i => i !== id),
    };
  }
}
```

**Key Characteristics**:
- Uses `BehaviorSubject` for reactive state streams
- Combines app state with forced overrides using `combineLatest`
- Converts observables to signals with `toSignal()` for components
- Persists forced state to localStorage
- Exposes preset integration methods for Presets tool
- All state updates are immutable (spread operators)

**Example**: `libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-internal.service.ts`

---

### Pattern 2: Single-Service Architecture (Internal-Only Tools)

**Use when**: Tool is self-contained and doesn't need app integration (e.g., Home, Network Mocker)

**Structure**:
```
tools/[tool-name]/
├── [tool-name].service.ts        # Single service (no internal/public split)
├── [tool-name]-tool.component.ts # UI component
└── [tool-name].models.ts         # Type definitions
```

**Pattern**:
```typescript
@Injectable({ providedIn: 'root' })
export class [Name]Service {
  private readonly STORAGE_KEY = '[tool-name]';
  private storageService = inject(DevToolsStorageService);

  // Direct signal-based state (no BehaviorSubject needed)
  public [state] = signal<[Type]>([]);

  constructor() {
    this.loadState();
  }

  // Public methods for component interaction
  update[State](newState: [Type]): void {
    this.[state].set(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  private loadState(): void {
    const saved = this.storageService.get<[Type]>(this.STORAGE_KEY);
    if (saved) {
      this.[state].set(saved);
    }
  }
}
```

**Key Characteristics**:
- Simpler architecture (no public API contract)
- Direct signal usage (no observable conversion needed)
- Still uses DevToolsStorageService for persistence
- Injectable as `providedIn: 'root'`

**Example**: `libs/ngx-dev-toolbar/src/tools/network-mocker-tool/network-mocker.service.ts`

---

## DevToolsService Interface

All tools with public APIs MUST implement this interface:

```typescript
export interface DevToolsService<OptionType> {
  /**
   * Set available options from the consuming application
   * @param options Array of options to display in the tool
   */
  setAvailableOptions(options: OptionType[]): void;

  /**
   * Get forced values that override app defaults
   * @returns Observable of items with forced overrides
   */
  getForcedValues(): Observable<OptionType[]>;
}
```

**Contract Requirements**:
- `setAvailableOptions()` must accept array of typed options
- `getForcedValues()` must return Observable (not Signal) for RxJS compatibility
- Both methods must be synchronous in execution (async work happens internally)

---

## State Management Patterns

### Forced State Structure

Tools with enable/disable functionality use this pattern:

```typescript
interface Forced[Name]State {
  enabled: string[];   // IDs of items forced to enabled
  disabled: string[];  // IDs of items forced to disabled
}
```

**Why this structure**:
- Distinguishes between "not forced" and "forced to disabled"
- Allows three states: forced-on, forced-off, not-forced
- Efficient lookup with array `includes()`
- Easy to serialize to localStorage

### Single-Selection State

Tools with single selection (like Language) use simpler pattern:

```typescript
private forcedLanguageSubject = new BehaviorSubject<Language | null>(null);
```

**Why this structure**:
- Simpler for single-selection scenarios
- `null` represents "not forced"
- Direct object storage (no array manipulation)

---

## localStorage Persistence Pattern

All services use `DevToolsStorageService` for consistent persistence:

```typescript
// Injecting the service
private storageService = inject(DevToolsStorageService);

// Loading on initialization
constructor() {
  this.loadFromStorage();
}

private loadFromStorage(): void {
  const saved = this.storageService.get<StateType>(this.STORAGE_KEY);
  if (saved) {
    this.stateSubject.next(saved);
  }
}

// Saving on every state change
updateState(newState: StateType): void {
  this.stateSubject.next(newState);
  this.storageService.set(this.STORAGE_KEY, newState);
}
```

**Key Points**:
- Always load state in constructor for immediate availability
- Save to storage on every state mutation
- Use typed get/set methods with generics
- Storage key follows pattern: lowercase tool name (e.g., `'feature-flags'`, `'permissions'`)

---

## Preset Integration Pattern

Tools with public APIs MUST support preset integration by exposing these methods in the **internal service**:

```typescript
// In internal service
/**
 * Apply state from a preset (called by Presets tool)
 */
applyPreset[Items](presetState: Forced[Name]State): void {
  this.forced[State]Subject.next(presetState);
  this.storageService.set(this.STORAGE_KEY, presetState);
}

/**
 * Get current forced state for saving to preset
 */
getCurrentForcedState(): Forced[Name]State {
  return this.forced[State]Subject.value;
}
```

**Why in internal service**:
- Presets tool needs direct access to forced state (not public API)
- Public service focuses on app integration only
- Internal service is already managing forced state

**Usage by Presets Tool**:
```typescript
// In presets-internal.service.ts
private featureFlagsService = inject(DevToolbarInternalFeatureFlagService);
private permissionsService = inject(DevToolbarInternalPermissionsService);

captureCurrentConfig(): PresetConfig {
  return {
    featureFlags: this.featureFlagsService.getCurrentForcedState(),
    permissions: this.permissionsService.getCurrentForcedState(),
    // ...
  };
}

applyPreset(preset: Preset): void {
  this.featureFlagsService.applyPresetFlags(preset.config.featureFlags);
  this.permissionsService.applyPresetPermissions(preset.config.permissions);
  // ...
}
```

---

## Service Method Naming Conventions

### Internal Service Methods

| Method Pattern | Purpose | Example |
|----------------|---------|---------|
| `setApp[Items]()` | Set items from consuming app | `setAppFlags()`, `setAppPermissions()` |
| `getForced[Items]()` | Get items with forced overrides | `getForcedFlags()`, `getForcedPermissions()` |
| `set[Item]()` | Force single item state | `setFlag()`, `setPermission()` |
| `remove[Item]Override()` | Clear forced state | `removeFlagOverride()` |
| `applyPreset[Items]()` | Apply preset state | `applyPresetFlags()` |
| `getCurrentForcedState()` | Get state for preset | `getCurrentForcedState()` |

### Public Service Methods

| Method | Purpose | Required By |
|--------|---------|-------------|
| `setAvailableOptions()` | Configure tool from app | `DevToolsService<T>` |
| `getForcedValues()` | Get forced values | `DevToolsService<T>` |

---

## Testing Patterns

### Internal Service Test Structure

```typescript
describe('DevToolbarInternal[Name]Service', () => {
  let service: DevToolbarInternal[Name]Service;
  let storageService: jest.Mocked<DevToolsStorageService>;

  beforeEach(() => {
    storageService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        DevToolbarInternal[Name]Service,
        { provide: DevToolsStorageService, useValue: storageService },
      ],
    });

    service = TestBed.inject(DevToolbarInternal[Name]Service);
  });

  describe('set[Item]', () => {
    it('should add item to enabled list when enabled', () => {
      service.set[Item]('item-1', true);

      const state = service.getCurrentForcedState();
      expect(state.enabled).toContain('item-1');
      expect(state.disabled).not.toContain('item-1');
    });

    it('should persist to storage', () => {
      service.set[Item]('item-1', true);

      expect(storageService.set).toHaveBeenCalledWith(
        '[tool-name]',
        expect.objectContaining({ enabled: ['item-1'] })
      );
    });
  });

  describe('applyPreset[Items]', () => {
    it('should apply preset state without user interaction', () => {
      const presetState = { enabled: ['a', 'b'], disabled: ['c'] };

      service.applyPreset[Items](presetState);

      expect(service.getCurrentForcedState()).toEqual(presetState);
    });
  });
});
```

### Public Service Test Structure

```typescript
describe('DevToolbar[Name]Service', () => {
  let service: DevToolbar[Name]Service;
  let internalService: DevToolbarInternal[Name]Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DevToolbar[Name]Service,
        DevToolbarInternal[Name]Service,
      ],
    });

    service = TestBed.inject(DevToolbar[Name]Service);
    internalService = TestBed.inject(DevToolbarInternal[Name]Service);
  });

  it('should delegate setAvailableOptions to internal service', () => {
    const spy = jest.spyOn(internalService, 'setApp[Items]');
    const options = [{ id: '1', name: 'Test' }];

    service.setAvailableOptions(options);

    expect(spy).toHaveBeenCalledWith(options);
  });

  it('should return forced values from internal service', (done) => {
    service.getForcedValues().subscribe(values => {
      expect(Array.isArray(values)).toBe(true);
      done();
    });
  });
});
```

---

## Decision Tree: Which Architecture to Use?

```
Does the tool need app integration?
├─ YES → Use Dual-Service Architecture
│   └─ Create: public service + internal service
│
└─ NO → Use Single-Service Architecture
    └─ Create: single service only
```

**App integration means**:
- App needs to provide configuration (setAvailableOptions)
- App needs to react to toolbar changes (getForcedValues)
- Examples: Feature Flags, Permissions, Language, App Features

**No app integration means**:
- Tool is self-contained (Home, Network Mocker)
- Tool manages only toolbar state
- No external API needed

---

## Related Documentation

- **Component Architecture**: See `knowledge/project/TOOLBAR_COMPONENT_ARCHITECTURE.md`
- **Angular Code Style**: See `knowledge/code-style/ANGULAR_PATTERNS.md`
- **Testing Patterns**: See `knowledge/code-style/TESTING_PATTERNS.md`
