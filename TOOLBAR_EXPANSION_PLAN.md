# ngx-dev-toolbar Expansion Plan

**Status**: Planning
**Date**: 2025-10-12
**Author**: Development Team

---

## Executive Summary

Expand the Angular Dev Toolbar with three new tools to support comprehensive developer testing scenarios:

1. **Permissions Tool** - Test user role permissions
2. **App Features Tool** - Test product/application configuration features
3. **Presets Tool** - Save and load complete toolbar configurations

All tools follow the existing 3-layer architecture pattern and constitution principles (signals, OnPush, standalone, TDD).

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Tool 1: Permissions Tool](#2-tool-1-permissions-tool)
3. [Tool 2: App Features Tool](#3-tool-2-app-features-tool)
4. [Tool 3: Presets Tool](#4-tool-3-presets-tool)
5. [Cross-Tool Integration](#5-cross-tool-integration)
6. [Technical Challenges & Solutions](#6-technical-challenges--solutions)
7. [Implementation Phases](#7-implementation-phases)
8. [Testing Strategy](#8-testing-strategy)
9. [File Structure](#9-file-structure)

---

## 1. Current State Analysis

### 1.1 Existing Tools

| Tool | Status | Icon | Data Type | Public Service |
|------|--------|------|-----------|----------------|
| **Home Tool** | ✅ Complete | `angular` | N/A | None (internal only) |
| **Feature Flags** | ✅ Complete | `toggle-left` | Boolean (3-state) | `DevToolbarFeatureFlagService` |
| **Languages** | ✅ Complete | `translate` | Single-select | `DevToolbarLanguageService` |
| **Network Mocker** | ⚠️ Incomplete | `network` | N/A | `DevToolbarNetworkMockerService` |

**Decision**: Drop Network Mocker tool for now (incomplete, lower priority).

### 1.2 Architecture Pattern (Existing)

Each tool follows this structure:

```
tools/[tool-name]/
├── [tool-name]-tool.component.ts      # UI layer (OnPush, signals)
├── [tool-name]-internal.service.ts    # State management (signals, BehaviorSubject)
├── [tool-name].service.ts             # Public API (DevToolsService<T>)
└── [tool-name].models.ts              # Type definitions
```

**Key Architectural Patterns:**
- **Internal Service**: Uses `BehaviorSubject` + signals for reactive state
- **Public Service**: Implements `DevToolsService<T>` interface with:
  - `setAvailableOptions(options: T[]): void` - Set options from app
  - `getForcedValues(): Observable<T[]>` - Get overridden values
- **Storage**: Uses `DevToolsStorageService` with localStorage
- **State Pattern**: Stores forced state as `{ enabled: string[], disabled: string[] }`

---

## 2. Tool 1: Permissions Tool

### 2.1 Purpose

Allow developers to test different user permission states without backend changes or user account switching.

**Use Cases:**
- Test "Admin can delete posts" vs "User cannot delete posts"
- Verify permission-based UI rendering (show/hide buttons)
- Test role-based access control (RBAC) logic
- E2E testing with specific permission sets

### 2.2 Data Model

```typescript
// permissions.models.ts

export interface DevToolbarPermission {
  id: string;                 // e.g., "can-edit-posts"
  name: string;               // e.g., "Can Edit Posts"
  description?: string;       // e.g., "Allows user to edit published posts"
  isGranted: boolean;         // Current permission state (from app or forced)
  isForced: boolean;          // Whether overridden by toolbar
}

export type PermissionFilter = 'all' | 'forced' | 'granted' | 'denied';
```

### 2.3 Internal Service (State Management)

```typescript
// permissions-internal.service.ts

interface ForcedPermissionsState {
  granted: string[];   // IDs of permissions forced to granted
  denied: string[];    // IDs of permissions forced to denied
}

@Injectable({ providedIn: 'root' })
export class DevToolbarInternalPermissionsService {
  private readonly STORAGE_KEY = 'permissions';
  private storageService = inject(DevToolsStorageService);

  private appPermissions$ = new BehaviorSubject<DevToolbarPermission[]>([]);
  private forcedPermissionsSubject = new BehaviorSubject<ForcedPermissionsState>({
    granted: [],
    denied: [],
  });

  public permissions$: Observable<DevToolbarPermission[]> = combineLatest([
    this.appPermissions$,
    this.forcedPermissionsSubject.asObservable(),
  ]).pipe(
    map(([appPerms, { granted, denied }]) => {
      return appPerms.map((perm) => ({
        ...perm,
        isForced: granted.includes(perm.id) || denied.includes(perm.id),
        isGranted: granted.includes(perm.id),
      }));
    })
  );

  public permissions = toSignal(this.permissions$, { initialValue: [] });

  constructor() {
    this.loadForcedPermissions();
  }

  // Methods: setAppPermissions, setPermission, removePermissionOverride
  // Methods: getForcedPermissions, loadForcedPermissions, applyPresetPermissions
}
```

**Key New Method for Presets:**
```typescript
// Apply permissions from preset without user interaction
applyPresetPermissions(presetState: ForcedPermissionsState): void {
  this.forcedPermissionsSubject.next(presetState);
  this.storageService.set(this.STORAGE_KEY, presetState);
}

// Get current forced state for saving to preset
getCurrentForcedState(): ForcedPermissionsState {
  return this.forcedPermissionsSubject.value;
}
```

### 2.4 Public Service (Developer API)

```typescript
// permissions.service.ts

@Injectable({ providedIn: 'root' })
export class DevToolbarPermissionsService implements DevToolsService<DevToolbarPermission> {
  private internalService = inject(DevToolbarInternalPermissionsService);

  setAvailableOptions(permissions: DevToolbarPermission[]): void {
    this.internalService.setAppPermissions(permissions);
  }

  getForcedValues(): Observable<DevToolbarPermission[]> {
    return this.internalService.getForcedPermissions();
  }
}
```

### 2.5 Component (UI)

```typescript
// permissions-tool.component.ts

@Component({
  selector: 'ndt-permissions-tool',
  template: `
    <ndt-toolbar-tool [options]="options" title="Permissions" icon="users">
      <div class="container">
        <!-- Search & Filter Header (same as Feature Flags) -->
        <div class="header">
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search permissions..."
          />
          <ndt-select
            [value]="activeFilter()"
            [options]="filterOptions"
            (valueChange)="onFilterChange($event)"
          />
        </div>

        <!-- Empty States -->
        @if (hasNoPermissions()) {
          <div class="empty">No permissions found</div>
        } @else if (hasNoFilteredPermissions()) {
          <div class="empty">No permissions match your filter</div>
        } @else {
          <!-- Permission List (same structure as Feature Flags) -->
          <div class="permission-list">
            @for (permission of filteredPermissions(); track permission.id) {
              <div class="permission">
                <div class="info">
                  <h3>{{ permission.name }}</h3>
                  <p>{{ permission.description }}</p>
                </div>
                <ndt-select
                  [value]="getPermissionValue(permission)"
                  [options]="permissionValueOptions"
                  (valueChange)="onPermissionChange(permission.id, $event ?? '')"
                  size="small"
                />
              </div>
            }
          </div>
        }
      </div>
    </ndt-toolbar-tool>
  `,
  // Styles: Copy from feature-flags-tool.component.scss
})
export class DevToolbarPermissionsToolComponent {
  // Implementation mirrors feature-flags-tool.component.ts
  // filterOptions: All / Forced / Granted / Denied
  // permissionValueOptions: Not Forced / Granted / Denied
}
```

### 2.6 Usage Example (Consumer App)

```typescript
import { DevToolbarPermissionsService } from 'ngx-dev-toolbar';

@Component({ /* ... */ })
export class AppComponent {
  private permissionsService = inject(DevToolbarPermissionsService);

  ngOnInit() {
    // 1. Set available permissions from your backend/auth system
    this.permissionsService.setAvailableOptions([
      { id: 'can-edit-posts', name: 'Can Edit Posts', isGranted: false, isForced: false },
      { id: 'can-delete-users', name: 'Can Delete Users', isGranted: false, isForced: false },
      { id: 'can-view-analytics', name: 'Can View Analytics', isGranted: true, isForced: false },
      { id: 'is-admin', name: 'Is Admin', isGranted: false, isForced: false },
    ]);

    // 2. Subscribe to forced permissions (dev toolbar overrides)
    this.permissionsService.getForcedValues().subscribe(forcedPerms => {
      // Apply forced permissions to your auth guard/permission service
      forcedPerms.forEach(perm => {
        this.authService.overridePermission(perm.id, perm.isGranted);
      });
    });
  }
}
```

---

## 3. Tool 2: App Features Tool

### 3.1 Purpose

Test product-level feature availability (license tiers, deployment configurations, environment flags).

**Use Cases:**
- Test "Enterprise Edition" features vs "Free Tier"
- Verify features enabled/disabled based on product configuration
- Test multi-tenant feature toggles
- E2E testing with specific product configurations

**Key Distinction from Feature Flags:**
- **Feature Flags** = Developer testing of incomplete features (gradual rollout)
- **App Features** = Product configuration (what's available in this tier/environment)

### 3.2 Data Model

```typescript
// app-features.models.ts

export interface DevToolbarAppFeature {
  id: string;                 // e.g., "multi-tenant-support"
  name: string;               // e.g., "Multi-Tenant Support"
  description?: string;       // e.g., "Enables multiple organizations in one instance"
  isEnabled: boolean;         // Current feature state (from app or forced)
  isForced: boolean;          // Whether overridden by toolbar
}

export type AppFeatureFilter = 'all' | 'forced' | 'enabled' | 'disabled';
```

### 3.3 Implementation

**Follows same pattern as Permissions Tool:**
- Internal service with `ForcedAppFeaturesState: { enabled: string[], disabled: string[] }`
- Public service implementing `DevToolsService<DevToolbarAppFeature>`
- Component with search, filter, 3-state select (Not Forced / Enabled / Disabled)
- Storage key: `'app-features'`
- Icon: `puzzle`

**New Methods for Presets:**
```typescript
// In DevToolbarInternalAppFeaturesService

applyPresetFeatures(presetState: ForcedAppFeaturesState): void {
  this.forcedFeaturesSubject.next(presetState);
  this.storageService.set(this.STORAGE_KEY, presetState);
}

getCurrentForcedState(): ForcedAppFeaturesState {
  return this.forcedFeaturesSubject.value;
}
```

### 3.4 Usage Example

```typescript
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({ /* ... */ })
export class AppComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  ngOnInit() {
    this.appFeaturesService.setAvailableOptions([
      { id: 'multi-tenant', name: 'Multi-Tenant Support', isEnabled: false, isForced: false },
      { id: 'advanced-analytics', name: 'Advanced Analytics', isEnabled: true, isForced: false },
      { id: 'api-access', name: 'API Access', isEnabled: false, isForced: false },
      { id: 'white-label', name: 'White Label Branding', isEnabled: false, isForced: false },
    ]);

    this.appFeaturesService.getForcedValues().subscribe(forcedFeatures => {
      forcedFeatures.forEach(feature => {
        this.configService.overrideFeature(feature.id, feature.isEnabled);
      });
    });
  }
}
```

---

## 4. Tool 3: Presets Tool

### 4.1 Purpose

Save and load complete toolbar configurations as named presets for quick scenario testing.

**Use Cases:**
- Save "Admin User - Full Access" (all permissions + admin features)
- Save "Basic User - Limited" (no permissions, basic features only)
- Save "QA - Beta Testing" (specific feature flags + permissions)
- Save "French Admin" (French language + admin permissions)
- Export/Import presets for E2E tests or team sharing

### 4.2 Data Model

```typescript
// presets.models.ts

export interface DevToolbarPreset {
  id: string;                          // e.g., "admin-full-access"
  name: string;                        // e.g., "Admin User - Full Access"
  description?: string;                // e.g., "Admin with all permissions and features"
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
  config: DevToolbarPresetConfig;      // Complete toolbar state
}

export interface DevToolbarPresetConfig {
  featureFlags: {
    enabled: string[];
    disabled: string[];
  };
  language: string | null;             // Language ID or null for not-forced
  permissions: {
    granted: string[];
    denied: string[];
  };
  appFeatures: {
    enabled: string[];
    disabled: string[];
  };
}

export type PresetFilter = 'all' | 'recent' | 'favorites';
```

### 4.3 Internal Service

```typescript
// presets-internal.service.ts

@Injectable({ providedIn: 'root' })
export class DevToolbarInternalPresetsService {
  private readonly STORAGE_KEY = 'presets';
  private storageService = inject(DevToolsStorageService);

  // Inject all other tool internal services (for reading/writing state)
  private featureFlagsService = inject(DevToolbarInternalFeatureFlagService);
  private languageService = inject(DevToolbarInternalLanguageService);
  private permissionsService = inject(DevToolbarInternalPermissionsService);
  private appFeaturesService = inject(DevToolbarInternalAppFeaturesService);

  private presetsSubject = new BehaviorSubject<DevToolbarPreset[]>([]);
  public presets$ = this.presetsSubject.asObservable();
  public presets = toSignal(this.presets$, { initialValue: [] });

  constructor() {
    this.loadPresets();
  }

  // --- Core Methods ---

  /**
   * Capture current toolbar state as a new preset
   */
  saveCurrentAsPreset(name: string, description?: string): DevToolbarPreset {
    const preset: DevToolbarPreset = {
      id: this.generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: this.captureCurrentConfig(),
    };

    const presets = [...this.presetsSubject.value, preset];
    this.presetsSubject.next(presets);
    this.storageService.set(this.STORAGE_KEY, presets);

    return preset;
  }

  /**
   * Apply a preset to all tools (THIS IS THE KEY METHOD)
   */
  applyPreset(presetId: string): void {
    const preset = this.presetsSubject.value.find(p => p.id === presetId);
    if (!preset) return;

    // Apply to each tool's internal service
    this.featureFlagsService.applyPresetFlags(preset.config.featureFlags);
    this.languageService.applyPresetLanguage(preset.config.language);
    this.permissionsService.applyPresetPermissions(preset.config.permissions);
    this.appFeaturesService.applyPresetFeatures(preset.config.appFeatures);
  }

  /**
   * Update an existing preset with current toolbar state
   */
  updatePreset(presetId: string): void {
    const presets = this.presetsSubject.value.map(preset => {
      if (preset.id === presetId) {
        return {
          ...preset,
          updatedAt: new Date().toISOString(),
          config: this.captureCurrentConfig(),
        };
      }
      return preset;
    });

    this.presetsSubject.next(presets);
    this.storageService.set(this.STORAGE_KEY, presets);
  }

  deletePreset(presetId: string): void {
    const presets = this.presetsSubject.value.filter(p => p.id !== presetId);
    this.presetsSubject.next(presets);
    this.storageService.set(this.STORAGE_KEY, presets);
  }

  // --- Helper Methods ---

  private captureCurrentConfig(): DevToolbarPresetConfig {
    return {
      featureFlags: this.featureFlagsService.getCurrentForcedState(),
      language: this.languageService.getCurrentForcedLanguage(),
      permissions: this.permissionsService.getCurrentForcedState(),
      appFeatures: this.appFeaturesService.getCurrentForcedState(),
    };
  }

  private loadPresets(): void {
    const saved = this.storageService.get<DevToolbarPreset[]>(this.STORAGE_KEY);
    if (saved) {
      this.presetsSubject.next(saved);
    }
  }

  private generateId(): string {
    return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 4.4 Public Service

```typescript
// presets.service.ts

@Injectable({ providedIn: 'root' })
export class DevToolbarPresetsService {
  private internalService = inject(DevToolbarInternalPresetsService);

  /**
   * Get all saved presets
   */
  getPresets(): Observable<DevToolbarPreset[]> {
    return this.internalService.presets$;
  }

  /**
   * Save current toolbar state as a preset
   */
  savePreset(name: string, description?: string): DevToolbarPreset {
    return this.internalService.saveCurrentAsPreset(name, description);
  }

  /**
   * Apply a preset (load its configuration)
   */
  applyPreset(presetId: string): void {
    this.internalService.applyPreset(presetId);
  }

  /**
   * Update a preset with current toolbar state
   */
  updatePreset(presetId: string): void {
    this.internalService.updatePreset(presetId);
  }

  /**
   * Delete a preset
   */
  deletePreset(presetId: string): void {
    this.internalService.deletePreset(presetId);
  }

  /**
   * Export a preset as JSON
   */
  exportPreset(presetId: string): string {
    const preset = this.internalService.presets().find(p => p.id === presetId);
    return JSON.stringify(preset, null, 2);
  }

  /**
   * Import a preset from JSON
   */
  importPreset(json: string): DevToolbarPreset {
    const preset = JSON.parse(json) as DevToolbarPreset;
    // Validate and add to presets
    return this.internalService.addPreset(preset);
  }
}
```

### 4.5 Component (UI)

This is the most complex component. It needs:

1. **List View**: Display all saved presets
2. **Create Modal**: Form to save current state as new preset
3. **Edit Modal**: Update preset with current state or modify details
4. **Apply Button**: Load preset configuration into all tools
5. **Delete Confirmation**: Warn before deleting preset

```typescript
// presets-tool.component.ts

@Component({
  selector: 'ndt-presets-tool',
  template: `
    <ndt-toolbar-tool [options]="options" title="Presets" icon="star">
      <div class="container">
        <!-- Header with Create Button -->
        <div class="header">
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search presets..."
          />
          <ndt-button
            variant="primary"
            icon="plus"
            (click)="onOpenCreateModal()"
          >
            New Preset
          </ndt-button>
        </div>

        <!-- Empty State -->
        @if (hasNoPresets()) {
          <div class="empty">
            <p>No presets saved yet</p>
            <ndt-button (click)="onOpenCreateModal()">
              Create Your First Preset
            </ndt-button>
          </div>
        } @else if (hasNoFilteredPresets()) {
          <div class="empty">No presets match your search</div>
        } @else {
          <!-- Preset List -->
          <div class="preset-list">
            @for (preset of filteredPresets(); track preset.id) {
              <div class="preset-card">
                <div class="preset-card__header">
                  <h3>{{ preset.name }}</h3>
                  <div class="preset-card__actions">
                    <ndt-button
                      variant="icon"
                      icon="refresh"
                      ariaLabel="Apply preset"
                      (click)="onApplyPreset(preset.id)"
                    />
                    <ndt-button
                      variant="icon"
                      icon="gear"
                      ariaLabel="Update preset"
                      (click)="onUpdatePreset(preset.id)"
                    />
                    <ndt-button
                      variant="icon"
                      icon="export"
                      ariaLabel="Export preset"
                      (click)="onExportPreset(preset.id)"
                    />
                    <ndt-button
                      variant="icon"
                      icon="trash"
                      ariaLabel="Delete preset"
                      (click)="onDeletePreset(preset.id)"
                    />
                  </div>
                </div>
                <p class="preset-card__description">{{ preset.description }}</p>
                <div class="preset-card__meta">
                  <span>Updated: {{ formatDate(preset.updatedAt) }}</span>
                </div>
                <!-- Preview of preset config -->
                <div class="preset-card__preview">
                  <span class="badge" *ngIf="preset.config.featureFlags.enabled.length">
                    {{ preset.config.featureFlags.enabled.length }} flags
                  </span>
                  <span class="badge" *ngIf="preset.config.permissions.granted.length">
                    {{ preset.config.permissions.granted.length }} perms
                  </span>
                  <span class="badge" *ngIf="preset.config.language">
                    {{ preset.config.language }}
                  </span>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </ndt-toolbar-tool>

    <!-- Create/Edit Modal (using ndt-window component) -->
    @if (showCreateModal()) {
      <div class="modal-overlay" (click)="onCloseCreateModal()">
        <ndt-window
          [config]="modalConfig"
          (close)="onCloseCreateModal()"
          (click)="$event.stopPropagation()"
        >
          <form (ngSubmit)="onSavePreset()" class="preset-form">
            <ndt-input
              label="Preset Name"
              [value]="presetName()"
              (valueChange)="presetName.set($event)"
              placeholder="e.g., Admin User - Full Access"
              required
            />
            <ndt-input
              label="Description (optional)"
              [value]="presetDescription()"
              (valueChange)="presetDescription.set($event)"
              placeholder="Brief description of this preset"
            />

            <!-- Summary of what will be saved -->
            <div class="preset-summary">
              <h4>Configuration to Save:</h4>
              <ul>
                <li>Feature Flags: {{ getCurrentFlagsCount() }} forced</li>
                <li>Permissions: {{ getCurrentPermissionsCount() }} forced</li>
                <li>App Features: {{ getCurrentAppFeaturesCount() }} forced</li>
                <li>Language: {{ getCurrentLanguage() }}</li>
              </ul>
            </div>

            <div class="form-actions">
              <ndt-button type="button" variant="secondary" (click)="onCloseCreateModal()">
                Cancel
              </ndt-button>
              <ndt-button type="submit" variant="primary">
                Save Preset
              </ndt-button>
            </div>
          </form>
        </ndt-window>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }

    .preset-card {
      background: var(--ndt-background-secondary);
      padding: var(--ndt-spacing-md);
      border-radius: var(--ndt-border-radius-medium);
      display: flex;
      flex-direction: column;
      gap: var(--ndt-spacing-sm);
    }

    .preset-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .preset-card__actions {
      display: flex;
      gap: var(--ndt-spacing-xs);
    }

    .preset-card__preview {
      display: flex;
      gap: var(--ndt-spacing-xs);
      flex-wrap: wrap;
    }

    .badge {
      background: var(--ndt-primary-color);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: var(--ndt-font-size-xs);
    }
  `],
})
export class DevToolbarPresetsToolComponent {
  private presetsService = inject(DevToolbarInternalPresetsService);
  private featureFlagsService = inject(DevToolbarInternalFeatureFlagService);
  private permissionsService = inject(DevToolbarInternalPermissionsService);
  private appFeaturesService = inject(DevToolbarInternalAppFeaturesService);
  private languageService = inject(DevToolbarInternalLanguageService);

  protected readonly options: DevToolbarWindowOptions = {
    title: 'Presets',
    description: 'Save and load toolbar configurations',
    isClosable: true,
    size: 'tall',
    id: 'ndt-presets',
    isBeta: true,
  };

  protected readonly searchQuery = signal<string>('');
  protected readonly showCreateModal = signal<boolean>(false);
  protected readonly presetName = signal<string>('');
  protected readonly presetDescription = signal<string>('');

  protected readonly presets = this.presetsService.presets;
  protected readonly filteredPresets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.presets().filter(preset =>
      preset.name.toLowerCase().includes(query) ||
      preset.description?.toLowerCase().includes(query)
    );
  });

  protected readonly hasNoPresets = computed(() => this.presets().length === 0);
  protected readonly hasNoFilteredPresets = computed(() => this.filteredPresets().length === 0);

  protected readonly modalConfig: DevToolbarWindowOptions = {
    title: 'Create Preset',
    description: 'Save the current toolbar configuration',
    isClosable: true,
    size: 'medium',
    id: 'ndt-preset-modal',
  };

  // --- Actions ---

  onOpenCreateModal(): void {
    this.showCreateModal.set(true);
    this.presetName.set('');
    this.presetDescription.set('');
  }

  onCloseCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onSavePreset(): void {
    if (!this.presetName()) return;
    this.presetsService.saveCurrentAsPreset(
      this.presetName(),
      this.presetDescription()
    );
    this.onCloseCreateModal();
  }

  onApplyPreset(presetId: string): void {
    this.presetsService.applyPreset(presetId);
    // Optional: Show toast notification
  }

  onUpdatePreset(presetId: string): void {
    this.presetsService.updatePreset(presetId);
    // Optional: Show toast notification
  }

  onExportPreset(presetId: string): void {
    const preset = this.presets().find(p => p.id === presetId);
    if (!preset) return;

    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  onDeletePreset(presetId: string): void {
    if (confirm('Are you sure you want to delete this preset?')) {
      this.presetsService.deletePreset(presetId);
    }
  }

  // --- Helper Methods ---

  getCurrentFlagsCount(): number {
    const state = this.featureFlagsService.getCurrentForcedState();
    return state.enabled.length + state.disabled.length;
  }

  getCurrentPermissionsCount(): number {
    const state = this.permissionsService.getCurrentForcedState();
    return state.granted.length + state.denied.length;
  }

  getCurrentAppFeaturesCount(): number {
    const state = this.appFeaturesService.getCurrentForcedState();
    return state.enabled.length + state.disabled.length;
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentForcedLanguage() || 'Not Forced';
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString();
  }
}
```

### 4.6 Import Preset Feature

Add an import button to the presets tool:

```typescript
onImportPreset(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const preset = JSON.parse(e.target?.result as string) as DevToolbarPreset;
          // Validate preset structure
          if (this.isValidPreset(preset)) {
            this.presetsService.addPreset(preset);
            // Optional: Show success toast
          } else {
            // Optional: Show error toast
            console.error('Invalid preset file');
          }
        } catch (error) {
          console.error('Error importing preset:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

private isValidPreset(preset: unknown): preset is DevToolbarPreset {
  const p = preset as DevToolbarPreset;
  return !!(
    p.id &&
    p.name &&
    p.config &&
    typeof p.config.featureFlags === 'object' &&
    typeof p.config.permissions === 'object' &&
    typeof p.config.appFeatures === 'object'
  );
}
```

---

## 5. Cross-Tool Integration

### 5.1 Required New Methods in Existing Services

Each tool's **internal service** needs two new methods for preset integration:

#### Feature Flags Internal Service

```typescript
// In DevToolbarInternalFeatureFlagService

/**
 * Apply feature flags from a preset (used by Presets Tool)
 */
applyPresetFlags(presetState: ForcedFlagsState): void {
  this.forcedFlagsSubject.next(presetState);
  this.storageService.set(this.STORAGE_KEY, presetState);
}

/**
 * Get current forced state for saving to preset
 */
getCurrentForcedState(): ForcedFlagsState {
  return this.forcedFlagsSubject.value;
}
```

#### Language Internal Service

```typescript
// In DevToolbarInternalLanguageService

/**
 * Apply language from a preset
 */
applyPresetLanguage(languageId: string | null): void {
  if (languageId === null) {
    this.removeForcedLanguage();
  } else {
    // Need to get the full Language object from app languages
    firstValueFrom(this.getAppLanguages()).then(languages => {
      const language = languages.find(lang => lang.id === languageId);
      if (language) {
        this.setForcedLanguage(language);
      }
    });
  }
}

/**
 * Get current forced language ID
 */
getCurrentForcedLanguage(): string | null {
  // Return the currently forced language ID or null
  return this.forcedLanguageSubject.value?.id ?? null;
}
```

#### Permissions Internal Service (New)

```typescript
// In DevToolbarInternalPermissionsService (to be created)

applyPresetPermissions(presetState: ForcedPermissionsState): void {
  this.forcedPermissionsSubject.next(presetState);
  this.storageService.set(this.STORAGE_KEY, presetState);
}

getCurrentForcedState(): ForcedPermissionsState {
  return this.forcedPermissionsSubject.value;
}
```

#### App Features Internal Service (New)

```typescript
// In DevToolbarInternalAppFeaturesService (to be created)

applyPresetFeatures(presetState: ForcedAppFeaturesState): void {
  this.forcedFeaturesSubject.next(presetState);
  this.storageService.set(this.STORAGE_KEY, presetState);
}

getCurrentForcedState(): ForcedAppFeaturesState {
  return this.forcedFeaturesSubject.value;
}
```

### 5.2 Service Dependency Graph

```
DevToolbarInternalPresetsService
├── inject DevToolbarInternalFeatureFlagService  (read/write state)
├── inject DevToolbarInternalLanguageService     (read/write state)
├── inject DevToolbarInternalPermissionsService  (read/write state)
└── inject DevToolbarInternalAppFeaturesService  (read/write state)
```

**Key Design Decision**: Presets service depends on *internal* services, not public services, because it needs direct access to forced state (not just the public API).

---

## 6. Technical Challenges & Solutions

### 6.1 Challenge: Circular Dependencies

**Problem**: Presets service injects all other internal services.

**Solution**:
- ✅ **Safe**: All internal services are `providedIn: 'root'` and independent
- ✅ **No circular deps**: Internal services don't inject presets service
- ✅ **One-way dependency**: Presets → Other tools (not bidirectional)

### 6.2 Challenge: Preset Application Timing

**Problem**: When applying a preset, do we reload the page or update in-place?

**Solution**: **In-place updates** (no page reload)
- Each tool's internal service updates its BehaviorSubject
- Components reactively update via signals
- localStorage is updated immediately
- App components listening to `getForcedValues()` receive new values via Observable

### 6.3 Challenge: Language Preset Application

**Problem**: Language requires full `Language` object, but preset stores only `id`.

**Solution**: Language service's `applyPresetLanguage()` method:
1. Receives `languageId: string | null`
2. Fetches available languages from `appLanguages$`
3. Finds matching language by ID
4. Calls `setForcedLanguage(language)` with full object

```typescript
applyPresetLanguage(languageId: string | null): void {
  if (languageId === null) {
    this.removeForcedLanguage();
    return;
  }

  // Get available languages and find matching one
  firstValueFrom(this.appLanguages$).then(languages => {
    const language = languages.find(lang => lang.id === languageId);
    if (language) {
      this.forcedLanguageSubject.next(language);
      this.storageService.set(this.STORAGE_KEY, language);
    } else {
      console.warn(`Language ${languageId} not found in available languages`);
    }
  });
}
```

### 6.4 Challenge: Validating Preset on Apply

**Problem**: Preset might reference IDs that no longer exist in the app.

**Solution**: **Graceful handling**
- If flag/permission/feature ID doesn't exist, skip it (don't error)
- Log warning to console for debugging
- Optional: Show UI notification listing skipped items

```typescript
applyPreset(presetId: string): void {
  const preset = this.presetsSubject.value.find(p => p.id === presetId);
  if (!preset) return;

  const warnings: string[] = [];

  // Validate feature flags
  const validFlags = this.validateFlagIds(preset.config.featureFlags);
  if (validFlags.invalid.length > 0) {
    warnings.push(`Unknown flags: ${validFlags.invalid.join(', ')}`);
  }

  // Apply validated config
  this.featureFlagsService.applyPresetFlags(validFlags.state);
  // ... repeat for other tools

  if (warnings.length > 0) {
    console.warn('Preset applied with warnings:', warnings);
    // Optional: Show toast notification
  }
}
```

### 6.5 Challenge: Modal/Dialog Implementation

**Problem**: Need a modal for creating presets, but library doesn't have a modal component.

**Solution**: **Use `ndt-window` with overlay**
- Reuse existing `DevToolbarWindowComponent`
- Wrap in a modal overlay (`<div class="modal-overlay">`)
- Use signal to control visibility: `showCreateModal()`
- Click overlay to close, click window to prevent close

```typescript
// In template
@if (showCreateModal()) {
  <div class="modal-overlay" (click)="onCloseCreateModal()">
    <ndt-window
      [config]="modalConfig"
      (close)="onCloseCreateModal()"
      (click)="$event.stopPropagation()"
    >
      <!-- Form content -->
    </ndt-window>
  </div>
}

// In styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

---

## 7. Implementation Phases

### Phase 1: Permissions Tool (Foundation)
**Duration**: 2-3 days
**Goal**: Establish pattern for new boolean tools

**Tasks**:
1. Create data models (`permissions.models.ts`)
2. Implement internal service with state management
3. Add `applyPresetPermissions()` and `getCurrentForcedState()` methods
4. Implement public service (`DevToolsService<T>`)
5. Create component (copy/adapt from feature-flags-tool)
6. Write unit tests (TDD: tests first!)
7. Add to `dev-toolbar.component.ts`
8. Export from `index.ts`
9. Update documentation

**Validation**: Can force permissions on/off, persists to localStorage

---

### Phase 2: App Features Tool (Parallel Pattern)
**Duration**: 2-3 days
**Goal**: Replicate permissions pattern for app features

**Tasks**:
1. Create data models (`app-features.models.ts`)
2. Implement internal service (copy from permissions, adjust naming)
3. Add `applyPresetFeatures()` and `getCurrentForcedState()` methods
4. Implement public service
5. Create component (same structure as permissions)
6. Write unit tests
7. Add to `dev-toolbar.component.ts`
8. Export from `index.ts`
9. Update documentation

**Validation**: Can toggle app features, persists to localStorage

---

### Phase 3: Extend Existing Tools for Presets
**Duration**: 1-2 days
**Goal**: Add preset integration methods to existing tools

**Tasks**:
1. **Feature Flags Service**:
   - Add `applyPresetFlags()` method
   - Add `getCurrentForcedState()` method
   - Write tests
2. **Language Service**:
   - Add `applyPresetLanguage()` method
   - Add `getCurrentForcedLanguage()` method
   - Handle ID → Language object conversion
   - Write tests

**Validation**: Can programmatically set state via preset methods

---

### Phase 4: Presets Tool (Complex)
**Duration**: 4-5 days
**Goal**: Implement preset save/load functionality

**Tasks**:
1. Create data models (`presets.models.ts`)
2. Implement internal service:
   - Inject all other internal services
   - Implement `captureCurrentConfig()`
   - Implement `applyPreset()`
   - Implement CRUD operations
3. Implement public service
4. Create component:
   - List view with search
   - Create modal (form)
   - Apply/Update/Delete actions
   - Export/Import JSON
5. Write tests (mock injected services)
6. Add to `dev-toolbar.component.ts`
7. Export from `index.ts`
8. Update documentation

**Validation**: Can save/load presets, all tools update correctly

---

### Phase 5: Polish & Documentation
**Duration**: 2-3 days
**Goal**: UI polish, comprehensive docs, examples

**Tasks**:
1. Add toast notifications for preset actions
2. Improve error handling and validation
3. Add preset preview/summary UI
4. Create demo app examples
5. Write comprehensive README sections
6. Add JSDoc comments to all public APIs
7. Create usage examples for each tool
8. Add E2E tests for preset workflows

---

## 8. Testing Strategy

### 8.1 Unit Tests (Jest)

Each tool requires:

```typescript
// permissions-internal.service.spec.ts

describe('DevToolbarInternalPermissionsService', () => {
  let service: DevToolbarInternalPermissionsService;
  let storageService: jest.Mocked<DevToolsStorageService>;

  beforeEach(() => {
    storageService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        DevToolbarInternalPermissionsService,
        { provide: DevToolsStorageService, useValue: storageService },
      ],
    });

    service = TestBed.inject(DevToolbarInternalPermissionsService);
  });

  describe('setPermission', () => {
    it('should add permission to granted list when enabled', () => {
      service.setPermission('can-edit', true);

      expect(service.permissions()[0]).toEqual(
        expect.objectContaining({
          id: 'can-edit',
          isGranted: true,
          isForced: true,
        })
      );
    });

    it('should persist to storage', () => {
      service.setPermission('can-edit', true);

      expect(storageService.set).toHaveBeenCalledWith(
        'permissions',
        { granted: ['can-edit'], denied: [] }
      );
    });
  });

  describe('applyPresetPermissions', () => {
    it('should apply preset state without user interaction', () => {
      const presetState = {
        granted: ['perm1', 'perm2'],
        denied: ['perm3'],
      };

      service.applyPresetPermissions(presetState);

      expect(service.getCurrentForcedState()).toEqual(presetState);
    });
  });
});
```

### 8.2 Component Tests

```typescript
// permissions-tool.component.spec.ts

describe('DevToolbarPermissionsToolComponent', () => {
  it('should display permissions from service', () => {
    const fixture = TestBed.createComponent(DevToolbarPermissionsToolComponent);
    const internalService = TestBed.inject(DevToolbarInternalPermissionsService);

    internalService.setAppPermissions([
      { id: 'can-edit', name: 'Can Edit', isGranted: false, isForced: false },
    ]);

    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.textContent).toContain('Can Edit');
  });

  it('should call setPermission when select changes', () => {
    const fixture = TestBed.createComponent(DevToolbarPermissionsToolComponent);
    const component = fixture.componentInstance;
    const internalService = TestBed.inject(DevToolbarInternalPermissionsService);
    jest.spyOn(internalService, 'setPermission');

    component.onPermissionChange('can-edit', 'granted');

    expect(internalService.setPermission).toHaveBeenCalledWith('can-edit', true);
  });
});
```

### 8.3 Integration Tests

```typescript
// presets.integration.spec.ts

describe('Presets Integration', () => {
  it('should capture and apply complete toolbar state', () => {
    const presetsService = TestBed.inject(DevToolbarInternalPresetsService);
    const flagsService = TestBed.inject(DevToolbarInternalFeatureFlagService);
    const permsService = TestBed.inject(DevToolbarInternalPermissionsService);

    // Set up state
    flagsService.setFlag('flag1', true);
    permsService.setPermission('perm1', true);

    // Save preset
    const preset = presetsService.saveCurrentAsPreset('Test Preset');

    // Clear state
    flagsService.removeFlagOverride('flag1');
    permsService.removePermissionOverride('perm1');

    // Apply preset
    presetsService.applyPreset(preset.id);

    // Verify state restored
    expect(flagsService.getCurrentForcedState()).toEqual({
      enabled: ['flag1'],
      disabled: [],
    });
    expect(permsService.getCurrentForcedState()).toEqual({
      granted: ['perm1'],
      denied: [],
    });
  });
});
```

### 8.4 E2E Tests (Playwright)

```typescript
// presets.e2e.spec.ts

test('should save and apply preset', async ({ page }) => {
  await page.goto('/');

  // Open dev toolbar
  await page.keyboard.press('Control+Shift+D');

  // Force a feature flag
  await page.click('[aria-label="Feature Flags"]');
  await page.selectOption('select[aria-label="Set value for Dark Mode"]', 'on');

  // Open presets tool
  await page.click('[aria-label="Presets"]');
  await page.click('button:has-text("New Preset")');
  await page.fill('input[placeholder*="Preset Name"]', 'Test Preset');
  await page.click('button:has-text("Save Preset")');

  // Clear flag
  await page.click('[aria-label="Feature Flags"]');
  await page.selectOption('select[aria-label="Set value for Dark Mode"]', 'not-forced');

  // Apply preset
  await page.click('[aria-label="Presets"]');
  await page.click('button[aria-label="Apply preset"]:first');

  // Verify flag restored
  await page.click('[aria-label="Feature Flags"]');
  const value = await page.inputValue('select[aria-label="Set value for Dark Mode"]');
  expect(value).toBe('on');
});
```

---

## 9. File Structure

### 9.1 Complete Directory Structure

```
libs/ngx-dev-toolbar/src/
├── components/
│   ├── icons/
│   │   ├── users-icon.component.ts        # Already exists
│   │   ├── puzzle-icon.component.ts       # Already exists
│   │   └── star-icon.component.ts         # Already exists
│   └── ...
├── tools/
│   ├── feature-flags-tool/                # ✅ Existing
│   │   ├── feature-flags-tool.component.ts
│   │   ├── feature-flags-internal.service.ts   # ➕ Add preset methods
│   │   ├── feature-flags.service.ts
│   │   └── feature-flags.models.ts
│   ├── language-tool/                     # ✅ Existing
│   │   ├── language-tool.component.ts
│   │   ├── language-internal.service.ts        # ➕ Add preset methods
│   │   ├── language.service.ts
│   │   └── language.models.ts
│   ├── permissions-tool/                  # 🆕 NEW TOOL
│   │   ├── permissions-tool.component.ts
│   │   ├── permissions-internal.service.ts
│   │   ├── permissions.service.ts
│   │   └── permissions.models.ts
│   ├── app-features-tool/                 # 🆕 NEW TOOL
│   │   ├── app-features-tool.component.ts
│   │   ├── app-features-internal.service.ts
│   │   ├── app-features.service.ts
│   │   └── app-features.models.ts
│   ├── presets-tool/                      # 🆕 NEW TOOL (COMPLEX)
│   │   ├── presets-tool.component.ts
│   │   ├── presets-internal.service.ts
│   │   ├── presets.service.ts
│   │   └── presets.models.ts
│   ├── home-tool/                         # ✅ Existing
│   └── network-mocker-tool/               # ⚠️ Remove/deprecate
├── models/
│   └── dev-tools.interface.ts             # ✅ Existing (no changes)
├── utils/
│   └── storage.service.ts                 # ✅ Existing (no changes)
├── dev-toolbar.component.ts               # ➕ Add new tool imports
├── dev-toolbar-state.service.ts           # ✅ No changes
└── index.ts                               # ➕ Export new services
```

### 9.2 Files to Create (Count: 12 new files)

**Permissions Tool** (4 files):
1. `tools/permissions-tool/permissions-tool.component.ts`
2. `tools/permissions-tool/permissions-internal.service.ts`
3. `tools/permissions-tool/permissions.service.ts`
4. `tools/permissions-tool/permissions.models.ts`

**App Features Tool** (4 files):
5. `tools/app-features-tool/app-features-tool.component.ts`
6. `tools/app-features-tool/app-features-internal.service.ts`
7. `tools/app-features-tool/app-features.service.ts`
8. `tools/app-features-tool/app-features.models.ts`

**Presets Tool** (4 files):
9. `tools/presets-tool/presets-tool.component.ts`
10. `tools/presets-tool/presets-internal.service.ts`
11. `tools/presets-tool/presets.service.ts`
12. `tools/presets-tool/presets.models.ts`

### 9.3 Files to Modify

1. `dev-toolbar.component.ts` - Add imports and components
2. `index.ts` - Export new public services and models
3. `tools/feature-flags-tool/feature-flags-internal.service.ts` - Add preset methods
4. `tools/language-tool/language-internal.service.ts` - Add preset methods

---

## 10. Developer Usage Examples

### 10.1 Permissions Tool Usage

```typescript
// app.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { DevToolbarPermissionsService, DevToolbarPermission } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: `
    <div>
      @if (canEdit()) {
        <button (click)="editPost()">Edit Post</button>
      }
      @if (canDelete()) {
        <button (click)="deletePost()">Delete Post</button>
      }
    </div>
  `,
})
export class AppComponent implements OnInit {
  private permissionsService = inject(DevToolbarPermissionsService);

  canEdit = signal(false);
  canDelete = signal(false);

  ngOnInit() {
    // 1. Tell toolbar what permissions exist in your app
    this.permissionsService.setAvailableOptions([
      { id: 'posts.edit', name: 'Can Edit Posts', isGranted: false, isForced: false },
      { id: 'posts.delete', name: 'Can Delete Posts', isGranted: false, isForced: false },
      { id: 'users.manage', name: 'Can Manage Users', isGranted: true, isForced: false },
    ]);

    // 2. React to forced permissions from toolbar
    this.permissionsService.getForcedValues().subscribe(forcedPerms => {
      const canEdit = forcedPerms.find(p => p.id === 'posts.edit');
      const canDelete = forcedPerms.find(p => p.id === 'posts.delete');

      if (canEdit) this.canEdit.set(canEdit.isGranted);
      if (canDelete) this.canDelete.set(canDelete.isGranted);
    });
  }
}
```

### 10.2 App Features Tool Usage

```typescript
// app.config.ts

import { ApplicationConfig } from '@angular/core';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    {
      provide: APP_INITIALIZER,
      useFactory: (featuresService: DevToolbarAppFeaturesService) => {
        return () => {
          // Tell toolbar what features exist
          featuresService.setAvailableOptions([
            { id: 'multi-tenant', name: 'Multi-Tenant Support', isEnabled: false, isForced: false },
            { id: 'analytics', name: 'Advanced Analytics', isEnabled: true, isForced: false },
            { id: 'api-access', name: 'API Access', isEnabled: false, isForced: false },
          ]);

          // React to forced features
          featuresService.getForcedValues().subscribe(forcedFeatures => {
            forcedFeatures.forEach(feature => {
              // Update your feature toggle service
              window.appConfig.features[feature.id] = feature.isEnabled;
            });
          });
        };
      },
      deps: [DevToolbarAppFeaturesService],
      multi: true,
    },
  ],
};
```

### 10.3 Presets Tool Usage

```typescript
// Developers interact with presets through the UI, but you can also use the API:

import { DevToolbarPresetsService } from 'ngx-dev-toolbar';

@Component({ /* ... */ })
export class TestUtilsComponent {
  private presetsService = inject(DevToolbarPresetsService);

  // Programmatically save a preset
  saveTestScenario() {
    this.presetsService.savePreset(
      'QA - Beta Features',
      'Configuration for testing beta features'
    );
  }

  // Programmatically apply a preset (useful for E2E tests)
  loadAdminScenario() {
    const presets = this.presetsService.getPresets();
    const adminPreset = presets.find(p => p.name === 'Admin User - Full Access');
    if (adminPreset) {
      this.presetsService.applyPreset(adminPreset.id);
    }
  }

  // Export preset for CI/E2E tests
  exportForTests() {
    const json = this.presetsService.exportPreset('preset-id');
    // Save to fixtures/presets/admin-user.json
  }
}
```

### 10.4 E2E Test Usage

```typescript
// e2e/fixtures/presets/admin-user.json
{
  "id": "preset-admin",
  "name": "Admin User - Full Access",
  "description": "Admin with all permissions and features",
  "config": {
    "featureFlags": {
      "enabled": ["beta-dashboard", "experimental-search"],
      "disabled": []
    },
    "language": null,
    "permissions": {
      "granted": ["posts.edit", "posts.delete", "users.manage", "settings.edit"],
      "denied": []
    },
    "appFeatures": {
      "enabled": ["multi-tenant", "analytics", "api-access"],
      "disabled": []
    }
  }
}

// e2e/tests/admin-workflow.spec.ts
import { test, expect } from '@playwright/test';
import adminPreset from '../fixtures/presets/admin-user.json';

test('admin can delete users', async ({ page }) => {
  // Load preset into localStorage before test
  await page.addInitScript((preset) => {
    localStorage.setItem(
      'AngularDevTools.presets',
      JSON.stringify([preset])
    );

    // Apply the preset state directly
    localStorage.setItem(
      'AngularDevTools.permissions',
      JSON.stringify(preset.config.permissions)
    );
  }, adminPreset);

  await page.goto('/users');

  // Verify delete button is visible (permission granted)
  await expect(page.locator('button:has-text("Delete User")')).toBeVisible();
});
```

---

## 11. Alignment with Constitution

### 11.1 Constitution Compliance Checklist

| Principle | Compliance |
|-----------|------------|
| **I. Standalone Component Architecture** | ✅ All new tools use standalone components |
| **II. Signal-First State Management** | ✅ All state uses signals and computed() |
| **III. Test-First Development** | ✅ TDD required for all new tools |
| **IV. OnPush Change Detection** | ✅ All components use OnPush |
| **V. Consistent Tool Architecture** | ✅ All tools follow 3-layer pattern |
| **VI. Design System Consistency** | ✅ Reuse existing components and CSS vars |
| **VII. Zero Production Impact** | ✅ All tools hidden in production by default |

### 11.2 Architecture Pattern Consistency

All three new tools follow the exact same pattern as existing tools:

```
Tool Component (UI)
    ↓ injects
Internal Service (State Management)
    ↑ injected by
Public Service (Developer API)
```

### 11.3 TypeScript Strictness

All new code will:
- Use TypeScript strict mode
- No `any` types (use generics or unknown)
- Explicit return types on all public methods
- Readonly properties where applicable

---

## 12. Open Questions & Decisions

### 12.1 Naming Decisions

| Option | Vote | Notes |
|--------|------|-------|
| **Tool 3 Name** | | |
| - "Permissions" | ✅ **SELECTED** | Clear and concise |
| - "User Permissions" | | More explicit |
| - "Access Control" | | Too technical |
| **Tool 4 Name** | | |
| - "App Features" | ✅ **SELECTED** | Clear distinction from feature flags |
| - "Product Features" | | More business-oriented |
| - "Capabilities" | | Too abstract |
| - "Configuration" | | Too generic |
| **Tool 5 Name** | | |
| - "Presets" | ✅ **SELECTED** | Short and clear |
| - "Scenarios" | | Good alternative |
| - "Configurations" | | Too long |
| - "Quick Setup" | | Too informal |

### 12.2 Icon Decisions

| Tool | Icon | Alternative |
|------|------|-------------|
| Permissions | `users` ✅ | `shield`, `lock` |
| App Features | `puzzle` ✅ | `gear`, `layout` |
| Presets | `star` ✅ | `database`, `layout` |

### 12.3 Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Preset storage** | localStorage | Consistent with existing tools |
| **Preset format** | JSON | Easy to export/import, version control |
| **Preset validation** | Warn but apply | Graceful degradation if IDs missing |
| **Modal implementation** | ndt-window + overlay | Reuse existing component |
| **Page reload on preset apply** | No reload | Better UX with reactive updates |

---

## 13. Success Criteria

### 13.1 Permissions Tool

- ✅ Can set available permissions via `setAvailableOptions()`
- ✅ Can force permissions to granted/denied via UI
- ✅ Forced permissions persist to localStorage
- ✅ App receives forced permissions via `getForcedValues()`
- ✅ Search and filter work correctly
- ✅ Preset integration methods work

### 13.2 App Features Tool

- ✅ Can set available features via `setAvailableOptions()`
- ✅ Can force features to enabled/disabled via UI
- ✅ Forced features persist to localStorage
- ✅ App receives forced features via `getForcedValues()`
- ✅ Search and filter work correctly
- ✅ Preset integration methods work

### 13.3 Presets Tool

- ✅ Can save current toolbar state as preset
- ✅ Can apply preset to restore complete state
- ✅ All tools update correctly when preset applied
- ✅ Can update existing preset with current state
- ✅ Can delete presets
- ✅ Can export preset as JSON
- ✅ Can import preset from JSON
- ✅ Search presets works
- ✅ Modal UI for creating presets works
- ✅ Presets persist to localStorage

### 13.4 Overall System

- ✅ All tools follow constitution principles
- ✅ All tools have >80% test coverage
- ✅ Zero console errors or warnings
- ✅ Performance: Tool switching <50ms
- ✅ Bundle size delta <5KB per tool (gzipped)
- ✅ Documentation complete for all tools
- ✅ Usage examples provided
- ✅ E2E tests pass

---

## 14. Future Enhancements (Out of Scope)

### 14.1 Nice-to-Have Features

- **Preset Categories/Tags**: Organize presets by scenario type
- **Preset Favorites**: Star frequently-used presets
- **Preset Sharing**: Generate shareable URLs for presets
- **Preset Versioning**: Track changes to presets over time
- **Preset Diff Viewer**: Compare two presets
- **Cloud Sync**: Sync presets across devices
- **Team Presets**: Share presets with team via backend
- **Preset Templates**: Built-in preset templates for common scenarios
- **Preset Search by Config**: Find presets with specific flags/perms
- **Preset Import from URL**: Load preset via query parameter

### 14.2 Advanced Tool Features

- **Permissions**: Group permissions by module/feature
- **App Features**: Feature dependencies (if X, then Y required)
- **All Tools**: Bulk operations (select multiple, force all on/off)
- **All Tools**: Export individual tool state to JSON
- **All Tools**: Keyboard shortcuts for common actions

---

## 15. Migration Path

### 15.1 Backward Compatibility

- ✅ Existing feature flags tool unchanged (except new preset methods)
- ✅ Existing language tool unchanged (except new preset methods)
- ✅ No breaking changes to public APIs
- ✅ Preset methods are additive (no existing functionality removed)

### 15.2 Deprecation Plan

**Network Mocker Tool**: Mark as deprecated, remove in next major version
- Add deprecation warning in console
- Update documentation to indicate "Coming Soon" → "Deprecated"
- Remove from exports in v2.0.0

---

## 16. Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Permissions Tool | 2-3 days | None |
| Phase 2: App Features Tool | 2-3 days | None (parallel with Phase 1) |
| Phase 3: Extend Existing Tools | 1-2 days | Phase 1, 2 complete |
| Phase 4: Presets Tool | 4-5 days | Phase 3 complete |
| Phase 5: Polish & Docs | 2-3 days | Phase 4 complete |
| **Total** | **11-16 days** | |

**Parallel Opportunities**:
- Phase 1 and 2 can run in parallel (if 2 developers)
- Tests can be written in parallel with implementation (TDD)

---

## 17. Conclusion

This plan provides a comprehensive roadmap for expanding the ngx-dev-toolbar with three critical tools:

1. **Permissions Tool** - Test user access control
2. **App Features Tool** - Test product configurations
3. **Presets Tool** - Save/load complete scenarios

**Key Design Principles**:
- ✅ Consistent architecture across all tools
- ✅ Signal-first reactive state management
- ✅ Test-driven development
- ✅ Constitution-compliant implementation
- ✅ Zero production impact
- ✅ Graceful error handling

**Next Steps**:
1. Review and approve plan
2. Begin Phase 1 (Permissions Tool) with TDD
3. Parallel work on Phase 2 (App Features Tool) if resources available
4. Iterate based on feedback from Phases 1-2
5. Implement Phase 4 (Presets Tool) as capstone feature

---

**Document Version**: 1.0
**Last Updated**: 2025-10-12
**Status**: Ready for Implementation
