# Dev Toolbar Tools

This document provides comprehensive documentation for all available tools in the Angular Dev Toolbar.

## Table of Contents

- [Overview](#overview)
- [Tool Architecture](#tool-architecture)
- [Available Tools](#available-tools)
  - [Feature Flags Tool](#feature-flags-tool)
  - [Language Tool](#language-tool)
  - [Permissions Tool](#permissions-tool)
  - [Network Mocker Tool](#network-mocker-tool)
- [Creating Custom Tools](#creating-custom-tools)

## Overview

The Angular Dev Toolbar provides a set of tools that help developers interact with their applications during development. Each tool follows a consistent architecture pattern and provides a service-based API for integration.

All tools share these common characteristics:

- **Signal-based state management** - Using Angular signals for reactive state
- **localStorage persistence** - Settings persist across page reloads
- **OnPush change detection** - Optimized performance
- **DevToolsService interface** - Consistent API across all tools

## Tool Architecture

### Architecture Patterns

The dev toolbar supports two architectural patterns for tools:

#### 1. Dual-Service Architecture (Recommended)

Used when you need both internal state management and a public API.

**Structure:**
```
tool-name/
├── tool-name.models.ts          # Type definitions
├── tool-name-internal.service.ts # Internal state management
├── tool-name.service.ts          # Public API (implements DevToolsService)
├── tool-name.component.ts        # UI component
└── *.spec.ts                     # Tests
```

**When to use:**
- Complex state management requirements
- Need to separate concerns between internal state and public API
- Multiple state sources (app config + user overrides)
- Advanced features like presets, bulk operations, or validation

**Example:** Permissions Tool, Feature Flags Tool

#### 2. Single-Service Architecture

Used for simpler tools with straightforward state management.

**Structure:**
```
tool-name/
├── tool-name.models.ts    # Type definitions
├── tool-name.service.ts   # Combined service (implements DevToolsService)
├── tool-name.component.ts # UI component
└── *.spec.ts              # Tests
```

**When to use:**
- Simple state management
- Direct mapping between API and internal state
- No complex validation or transformation logic
- Single source of truth

**Example:** Language Tool

### Component Structure

All tool components follow this structure:

```typescript
@Component({
  selector: 'ngt-tool-name',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngt-toolbar-tool [options]="options" title="Tool Name" icon="icon-name">
      <!-- Tool content -->
    </ngt-toolbar-tool>
  `
})
export class ToolComponent {
  // 1. Injects
  private readonly service = inject(ToolService);

  // 2. Inputs
  // No inputs typically needed

  // 3. Outputs
  // No outputs typically needed

  // 4. Signals
  protected readonly searchQuery = signal<string>('');
  protected readonly activeFilter = signal<FilterType>('all');

  // 5. Computed values
  protected readonly filteredItems = computed(() => {
    // Compute derived state
  });

  // 6. Other properties
  protected readonly options: DevToolbarWindowOptions = {
    title: 'Tool Name',
    description: 'Tool description',
    isClosable: true,
    size: 'medium',
    id: 'ngt-tool-name'
  };

  // 7. Public methods

  // 8. Protected methods
  protected onItemChange(id: string, value: any): void {
    // Handle changes
  }

  // 9. Private methods
}
```

### Service Interface

All tool services implement the `DevToolsService<T>` interface:

```typescript
export interface DevToolsService<T> {
  /**
   * Sets the available options that can be displayed and modified in the dev toolbar
   * @param options - Array of items to display in the tool
   */
  setAvailableOptions(options: T[]): void;

  /**
   * Returns an observable that emits the current forced/overridden values
   * @returns Observable that emits when forced values change
   */
  getForcedValues(): Observable<T[]>;
}
```

## Available Tools

### Feature Flags Tool

Toggle feature flags without backend changes.

#### API Reference

**Service:** `DevToolbarFeatureFlagService`

**Methods:**

```typescript
class DevToolbarFeatureFlagService implements DevToolsService<DevToolbarFeatureFlag> {
  /**
   * Sets the available feature flags
   * @param flags - Array of feature flags to display
   */
  setAvailableOptions(flags: DevToolbarFeatureFlag[]): void;

  /**
   * Returns observable of forced feature flags
   * @returns Observable emitting only flags that are forced (overridden)
   */
  getForcedValues(): Observable<DevToolbarFeatureFlag[]>;
}
```

**Data Model:**

```typescript
interface DevToolbarFeatureFlag {
  id: string;           // Unique identifier
  name: string;         // Display name
  description?: string; // Optional description
  isEnabled: boolean;   // Current enabled state
  isForced: boolean;    // Whether value is forced via toolbar
}
```

#### Usage Example

```typescript
import { DevToolbarFeatureFlagService } from 'ngx-dev-toolbar';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-feature',
  template: `
    @if (isDarkModeEnabled()) {
      <div class="dark-theme">Dark Mode Active</div>
    }
  `
})
export class FeatureComponent implements OnInit {
  private featureFlagService = inject(DevToolbarFeatureFlagService);

  isDarkModeEnabled = signal(false);

  ngOnInit() {
    // Configure available flags
    this.featureFlagService.setAvailableOptions([
      { id: 'dark-mode', name: 'Dark Mode', isEnabled: false, isForced: false },
      { id: 'beta-ui', name: 'Beta UI', description: 'New UI design', isEnabled: false, isForced: false }
    ]);

    // Subscribe to forced values
    this.featureFlagService.getForcedValues().subscribe(forcedFlags => {
      const darkMode = forcedFlags.find(f => f.id === 'dark-mode');
      this.isDarkModeEnabled.set(darkMode?.isEnabled ?? false);
    });
  }
}
```

### Language Tool

Switch application language instantly.

#### API Reference

**Service:** `DevToolbarLanguageService`

**Methods:**

```typescript
class DevToolbarLanguageService implements DevToolsService<DevToolbarLanguage> {
  /**
   * Sets the available languages
   * @param languages - Array of languages to display
   */
  setAvailableOptions(languages: DevToolbarLanguage[]): void;

  /**
   * Returns observable of forced language selection
   * @returns Observable emitting array with single selected language
   */
  getForcedValues(): Observable<DevToolbarLanguage[]>;
}
```

**Data Model:**

```typescript
interface DevToolbarLanguage {
  code: string;         // Language code (e.g., 'en', 'es', 'fr')
  name: string;         // Display name (e.g., 'English', 'Spanish')
  isSelected: boolean;  // Whether this language is currently selected
  isForced: boolean;    // Whether language is forced via toolbar
}
```

#### Usage Example

```typescript
import { DevToolbarLanguageService } from 'ngx-dev-toolbar';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-i18n'
})
export class I18nComponent implements OnInit {
  private languageService = inject(DevToolbarLanguageService);

  currentLanguage = signal('en');

  ngOnInit() {
    // Configure available languages
    this.languageService.setAvailableOptions([
      { code: 'en', name: 'English', isSelected: true, isForced: false },
      { code: 'es', name: 'Español', isSelected: false, isForced: false },
      { code: 'fr', name: 'Français', isSelected: false, isForced: false }
    ]);

    // Subscribe to language changes
    this.languageService.getForcedValues().subscribe(([selectedLang]) => {
      if (selectedLang) {
        this.currentLanguage.set(selectedLang.code);
        this.loadTranslations(selectedLang.code);
      }
    });
  }

  private loadTranslations(langCode: string) {
    // Load translations for the selected language
  }
}
```

### Permissions Tool

Test permission-based UI and access control without backend changes.

#### API Reference

**Service:** `DevToolbarPermissionsService`

**Methods:**

```typescript
class DevToolbarPermissionsService implements DevToolsService<DevToolbarPermission> {
  /**
   * Sets the available permissions that can be forced in the dev toolbar
   * @param permissions - Array of permissions to display
   */
  setAvailableOptions(permissions: DevToolbarPermission[]): void;

  /**
   * Returns observable that emits permissions with forced overrides
   * @returns Observable emitting only permissions that are forced (granted or denied)
   */
  getForcedValues(): Observable<DevToolbarPermission[]>;
}
```

**Internal Service Methods (Advanced):**

The `DevToolbarInternalPermissionsService` provides additional methods for advanced use cases:

```typescript
class DevToolbarInternalPermissionsService {
  /**
   * Forces a permission to granted or denied state
   * @param id - Permission identifier
   * @param granted - Whether to grant (true) or deny (false) the permission
   */
  setPermission(id: string, granted: boolean): void;

  /**
   * Removes the forced override for a permission, restoring original state
   * @param id - Permission identifier
   */
  removePermissionOverride(id: string): void;

  /**
   * Applies a preset configuration of forced permissions
   * @param state - Object containing arrays of granted and denied permission IDs
   */
  applyPresetPermissions(state: ForcedPermissionsState): void;

  /**
   * Gets the current forced permissions state
   * @returns Object containing arrays of granted and denied permission IDs
   */
  getCurrentForcedState(): ForcedPermissionsState;

  /**
   * Returns a signal containing all permissions (app + forced)
   * @returns Signal with combined permissions array
   */
  readonly permissions: Signal<DevToolbarPermission[]>;
}
```

#### Data Models

```typescript
/**
 * Represents a single permission in the application
 */
interface DevToolbarPermission {
  /** Unique identifier for the permission */
  id: string;

  /** Human-readable name displayed in the UI */
  name: string;

  /** Optional description explaining what the permission controls */
  description?: string;

  /** Whether the permission is currently granted */
  isGranted: boolean;

  /** Whether the permission state is forced via the dev toolbar */
  isForced: boolean;
}

/**
 * Represents the stored state of forced permissions
 */
interface ForcedPermissionsState {
  /** Array of permission IDs that are forced to granted */
  granted: string[];

  /** Array of permission IDs that are forced to denied */
  denied: string[];
}

/**
 * Filter options for the permissions list
 */
type PermissionFilter = 'all' | 'forced' | 'granted' | 'denied';

/**
 * Value options for permission override dropdown
 */
type PermissionValue = 'not-forced' | 'granted' | 'denied';
```

#### Basic Usage

```typescript
import { DevToolbarPermissionsService } from 'ngx-dev-toolbar';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-protected',
  template: `
    @if (canEdit()) {
      <button>Edit Post</button>
    }
    @if (canDelete()) {
      <button>Delete Post</button>
    }
    @if (isAdmin()) {
      <button>Admin Panel</button>
    }
  `
})
export class ProtectedComponent implements OnInit {
  private permissionsService = inject(DevToolbarPermissionsService);

  canEdit = signal(false);
  canDelete = signal(false);
  isAdmin = signal(false);

  ngOnInit() {
    // Configure available permissions
    this.permissionsService.setAvailableOptions([
      {
        id: 'can-edit',
        name: 'Can Edit Posts',
        description: 'Allows editing posts',
        isGranted: false,
        isForced: false
      },
      {
        id: 'can-delete',
        name: 'Can Delete Posts',
        description: 'Allows deleting posts',
        isGranted: false,
        isForced: false
      },
      {
        id: 'is-admin',
        name: 'Admin Access',
        description: 'Full administrative access',
        isGranted: false,
        isForced: false
      }
    ]);

    // Subscribe to forced permissions
    this.permissionsService.getForcedValues().subscribe(forcedPermissions => {
      this.canEdit.set(
        forcedPermissions.some(p => p.id === 'can-edit' && p.isGranted)
      );
      this.canDelete.set(
        forcedPermissions.some(p => p.id === 'can-delete' && p.isGranted)
      );
      this.isAdmin.set(
        forcedPermissions.some(p => p.id === 'is-admin' && p.isGranted)
      );
    });
  }
}
```

#### Advanced Usage: Integration with Auth Service

```typescript
import { DevToolbarPermissionsService } from 'ngx-dev-toolbar';
import { Component, inject, OnInit, effect } from '@angular/core';

@Component({
  selector: 'app-root'
})
export class AppComponent implements OnInit {
  private permissionsService = inject(DevToolbarPermissionsService);
  private authService = inject(AuthService);

  // Map of permission IDs to actual permission states
  private permissionMap = new Map<string, boolean>();

  ngOnInit() {
    // Load permissions from your auth service
    this.authService.getUserPermissions().subscribe(userPerms => {
      // Configure dev toolbar with permissions from backend
      const permissions = userPerms.map(perm => ({
        id: perm.id,
        name: perm.name,
        description: perm.description,
        isGranted: perm.granted,
        isForced: false
      }));

      this.permissionsService.setAvailableOptions(permissions);

      // Store in local map
      permissions.forEach(p => {
        this.permissionMap.set(p.id, p.isGranted);
      });
    });

    // Override with forced permissions from dev toolbar
    this.permissionsService.getForcedValues().subscribe(forcedPerms => {
      // Apply forced overrides
      forcedPerms.forEach(p => {
        this.permissionMap.set(p.id, p.isGranted);
      });

      // Update your auth service with combined permissions
      this.authService.updatePermissions(this.permissionMap);
    });
  }

  hasPermission(id: string): boolean {
    return this.permissionMap.get(id) ?? false;
  }
}
```

#### Preset Integration

Use presets to quickly switch between different permission configurations, useful for automated testing:

```typescript
import { DevToolbarInternalPermissionsService } from 'ngx-dev-toolbar';
import { inject } from '@angular/core';

export class PermissionPresetsService {
  private internalService = inject(DevToolbarInternalPermissionsService);

  // Define preset configurations
  private readonly presets = {
    guest: {
      granted: [],
      denied: ['can-edit', 'can-delete', 'can-manage-users', 'is-admin']
    },
    editor: {
      granted: ['can-edit'],
      denied: ['can-delete', 'can-manage-users', 'is-admin']
    },
    moderator: {
      granted: ['can-edit', 'can-delete'],
      denied: ['can-manage-users', 'is-admin']
    },
    admin: {
      granted: ['can-edit', 'can-delete', 'can-manage-users', 'is-admin'],
      denied: []
    }
  };

  applyPreset(presetName: keyof typeof this.presets): void {
    const preset = this.presets[presetName];
    if (preset) {
      this.internalService.applyPresetPermissions(preset);
    }
  }

  saveCurrentAsPreset(name: string): void {
    const currentState = this.internalService.getCurrentForcedState();
    localStorage.setItem(`permission-preset-${name}`, JSON.stringify(currentState));
  }

  loadSavedPreset(name: string): void {
    const saved = localStorage.getItem(`permission-preset-${name}`);
    if (saved) {
      this.internalService.applyPresetPermissions(JSON.parse(saved));
    }
  }
}
```

#### Edge Cases and Troubleshooting

**Permission forced but removed from available options:**
- Forced permissions that no longer exist in the available options are automatically cleaned up on page load
- A warning is logged to the console: `Removed invalid permission IDs from forced state: [ids]`
- localStorage is updated to remove the invalid IDs

**Duplicate permission IDs:**
- Only the last occurrence of a duplicate ID will be displayed
- Use unique IDs to avoid unexpected behavior

**setAvailableOptions called multiple times:**
- Subsequent calls replace the previous permissions list
- Forced overrides are preserved if the permission ID still exists
- Forced overrides for removed permissions are cleaned up automatically

**Missing permission names:**
- Permissions without names will display their ID as the name
- Always provide descriptive names for better UX

**localStorage quota exceeded:**
- If localStorage quota is exceeded, forced permissions will work during the session but won't persist
- A warning is logged: `Failed to persist permissions to localStorage: QuotaExceededError`
- Consider reducing the number of permissions or clearing old data

**Permissions have missing descriptions:**
- Descriptions are optional
- Missing descriptions won't cause errors, the field will simply not display

**Performance with large permission lists:**
- The search functionality is optimized for lists with 100+ permissions
- Search performs case-insensitive matching on both name and description
- Filter operations use computed signals for efficient updates

### Network Mocker Tool

Mock network requests in real-time without modifying your API code.

#### API Reference

**Service:** `DevToolbarNetworkMockerService`

**Methods:**

```typescript
class DevToolbarNetworkMockerService implements DevToolsService<DevToolbarMockRequest> {
  /**
   * Sets the available network requests that can be mocked
   * @param requests - Array of requests to display
   */
  setAvailableOptions(requests: DevToolbarMockRequest[]): void;

  /**
   * Returns observable of active mock configurations
   * @returns Observable emitting requests with mock responses enabled
   */
  getForcedValues(): Observable<DevToolbarMockRequest[]>;
}
```

**Data Model:**

```typescript
interface DevToolbarMockRequest {
  id: string;              // Unique identifier
  name: string;            // Display name
  method: string;          // HTTP method (GET, POST, etc.)
  url: string;             // Request URL or pattern
  mockResponse?: unknown;  // Mock response data
  isMocked: boolean;       // Whether mocking is active
  isForced: boolean;       // Whether mock is forced via toolbar
}
```

#### Usage Example

```typescript
import { DevToolbarNetworkMockerService } from 'ngx-dev-toolbar';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-api-consumer'
})
export class ApiConsumerComponent implements OnInit {
  private mockService = inject(DevToolbarNetworkMockerService);

  ngOnInit() {
    // Configure available mocks
    this.mockService.setAvailableOptions([
      {
        id: 'get-users',
        name: 'Get Users',
        method: 'GET',
        url: '/api/users',
        mockResponse: { users: [{ id: 1, name: 'Mock User' }] },
        isMocked: false,
        isForced: false
      }
    ]);

    // Subscribe to active mocks
    this.mockService.getForcedValues().subscribe(activeMocks => {
      // Configure HTTP interceptor with active mocks
    });
  }
}
```

## Creating Custom Tools

To create a custom tool, follow these steps:

### 1. Create the Tool Directory

```bash
libs/ngx-dev-toolbar/src/tools/my-tool/
├── my-tool.models.ts
├── my-tool.service.ts
├── my-tool.component.ts
└── my-tool.component.spec.ts
```

### 2. Define Data Models

```typescript
// my-tool.models.ts
export interface MyToolOption {
  id: string;
  name: string;
  isActive: boolean;
  isForced: boolean;
}
```

### 3. Implement the Service

```typescript
// my-tool.service.ts
import { Injectable } from '@angular/core';
import { DevToolsService } from '../../models/dev-tools.interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { MyToolOption } from './my-tool.models';

@Injectable({ providedIn: 'root' })
export class MyToolService implements DevToolsService<MyToolOption> {
  private optionsSubject = new BehaviorSubject<MyToolOption[]>([]);

  setAvailableOptions(options: MyToolOption[]): void {
    this.optionsSubject.next(options);
  }

  getForcedValues(): Observable<MyToolOption[]> {
    return this.optionsSubject.pipe(
      map(opts => opts.filter(o => o.isForced))
    );
  }
}
```

### 4. Create the Component

```typescript
// my-tool.component.ts
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';

@Component({
  selector: 'ngt-my-tool',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DevToolbarToolComponent],
  template: `
    <ngt-toolbar-tool
      [options]="options"
      title="My Tool"
      icon="settings"
    >
      <!-- Your tool UI here -->
    </ngt-toolbar-tool>
  `
})
export class MyToolComponent {
  private service = inject(MyToolService);

  protected readonly options = {
    title: 'My Tool',
    description: 'My custom tool description',
    isClosable: true,
    size: 'medium',
    id: 'ngt-my-tool'
  };
}
```

### 5. Register the Tool

Add your tool to the main toolbar component:

```typescript
// dev-toolbar.component.ts
import { MyToolComponent } from './tools/my-tool/my-tool.component';

@Component({
  imports: [
    // ... other tools
    MyToolComponent
  ],
  template: `
    <ngt-my-tool />
  `
})
export class DevToolbarComponent {}
```

### 6. Export from Library

```typescript
// index.ts
export * from './tools/my-tool/my-tool.models';
export * from './tools/my-tool/my-tool.service';
export * from './tools/my-tool/my-tool.component';
```

## Best Practices

1. **Always implement DevToolsService interface** - Ensures consistency across tools
2. **Use signals for state management** - Leverage Angular's reactive primitives
3. **Persist to localStorage** - Users expect settings to survive page refreshes
4. **Add comprehensive JSDoc** - Document all public APIs
5. **Write unit tests** - Aim for >80% coverage
6. **Follow OnPush change detection** - Optimize performance
7. **Use descriptive names** - Make the UI self-explanatory
8. **Handle edge cases** - Invalid data, quota exceeded, etc.
9. **Provide examples** - Help users understand how to integrate
10. **Keep it simple** - Tools should be easy to use and understand
