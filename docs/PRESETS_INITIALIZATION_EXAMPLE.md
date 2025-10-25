# Presets Initialization Example

This example shows how to initialize the Dev Toolbar with predefined presets that all developers can use.

## Basic Setup

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { DevToolbarComponent, DevToolbarPresetsService, InitialPreset } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DevToolbarComponent],
  template: `
    <ndt-toolbar [config]="toolbarConfig" />
    <router-outlet />
  `
})
export class AppComponent implements OnInit {
  private presetsService = inject(DevToolbarPresetsService);

  toolbarConfig = {
    showFeatureFlagsTool: true,
    showPermissionsTool: true,
    showAppFeaturesTool: true,
    showLanguageTool: true,
    showPresetsTool: true,
  };

  ngOnInit() {
    // Initialize presets on app startup
    this.initializeDefaultPresets();
  }

  private initializeDefaultPresets() {
    const defaultPresets: InitialPreset[] = [
      {
        name: 'Admin User - Full Access',
        description: 'Complete admin access with all features enabled',
        config: {
          featureFlags: {
            enabled: ['admin-panel', 'advanced-settings', 'debug-mode'],
            disabled: []
          },
          permissions: {
            granted: ['admin', 'write', 'delete', 'manage-users'],
            denied: []
          },
          appFeatures: {
            enabled: ['analytics', 'reporting', 'export-data', 'advanced-filters'],
            disabled: []
          },
          language: 'en'
        }
      },
      {
        name: 'Editor - Content Management',
        description: 'Editor role with content creation and editing permissions',
        config: {
          featureFlags: {
            enabled: ['content-editor', 'media-library'],
            disabled: ['admin-panel', 'debug-mode']
          },
          permissions: {
            granted: ['read', 'write', 'edit-content'],
            denied: ['delete', 'manage-users', 'admin']
          },
          appFeatures: {
            enabled: ['rich-text-editor', 'media-upload'],
            disabled: ['analytics', 'user-management']
          },
          language: 'en'
        }
      },
      {
        name: 'Viewer - Read-Only Access',
        description: 'Limited read-only access for viewing content',
        config: {
          featureFlags: {
            enabled: [],
            disabled: ['admin-panel', 'content-editor', 'debug-mode']
          },
          permissions: {
            granted: ['read'],
            denied: ['write', 'delete', 'admin', 'manage-users']
          },
          appFeatures: {
            enabled: [],
            disabled: ['analytics', 'reporting', 'export-data']
          },
          language: null
        }
      },
      {
        name: 'QA Testing - Beta Features',
        description: 'Configuration for testing beta and experimental features',
        config: {
          featureFlags: {
            enabled: ['beta-features', 'experimental-ui', 'debug-mode', 'performance-monitor'],
            disabled: []
          },
          permissions: {
            granted: ['read', 'write', 'test-mode'],
            denied: ['delete', 'admin']
          },
          appFeatures: {
            enabled: ['feature-toggles', 'ab-testing', 'error-tracking'],
            disabled: []
          },
          language: 'en'
        }
      },
      {
        name: 'Spanish User - Localization Test',
        description: 'Test Spanish language with standard user permissions',
        config: {
          featureFlags: {
            enabled: ['localization'],
            disabled: ['admin-panel']
          },
          permissions: {
            granted: ['read', 'write'],
            denied: ['delete', 'admin']
          },
          appFeatures: {
            enabled: [],
            disabled: []
          },
          language: 'es'
        }
      }
    ];

    // Initialize presets - adds to any existing user-created presets
    this.presetsService.initializePresets(defaultPresets);

    // OR use setInitialPresets to replace all existing presets
    // this.presetsService.setInitialPresets(defaultPresets);
  }
}
```

## Alternative: Conditional Initialization

You might want to only initialize presets once or only in development:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { DevToolbarPresetsService } from 'ngx-dev-toolbar';
import { environment } from './environments/environment';

@Component({
  // ... component metadata
})
export class AppComponent implements OnInit {
  private presetsService = inject(DevToolbarPresetsService);

  ngOnInit() {
    // Only in development
    if (!environment.production) {
      this.initializePresets();
    }

    // Or check if presets already exist
    this.presetsService.getPresets().subscribe(presets => {
      if (presets.length === 0) {
        this.initializePresets();
      }
    });
  }

  private initializePresets() {
    // ... preset initialization
  }
}
```

## Loading from External JSON

You can also load presets from an external configuration file:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DevToolbarPresetsService, InitialPreset } from 'ngx-dev-toolbar';
import { firstValueFrom } from 'rxjs';

@Component({
  // ... component metadata
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private presetsService = inject(DevToolbarPresetsService);

  async ngOnInit() {
    await this.loadPresetsFromConfig();
  }

  private async loadPresetsFromConfig() {
    try {
      const presets = await firstValueFrom(
        this.http.get<InitialPreset[]>('/assets/dev-toolbar-presets.json')
      );
      this.presetsService.initializePresets(presets);
    } catch (error) {
      console.warn('Failed to load dev toolbar presets:', error);
    }
  }
}
```

**Example `/assets/dev-toolbar-presets.json`:**

```json
[
  {
    "name": "Admin User",
    "description": "Full admin access",
    "config": {
      "featureFlags": {
        "enabled": ["admin-panel", "debug-mode"],
        "disabled": []
      },
      "permissions": {
        "granted": ["admin", "write", "delete"],
        "denied": []
      },
      "appFeatures": {
        "enabled": ["analytics", "reporting"],
        "disabled": []
      },
      "language": "en"
    }
  }
]
```

## Best Practices

1. **Initialize Early**: Call `initializePresets()` in `AppComponent.ngOnInit()` to ensure presets are available when developers open the toolbar

2. **Use Descriptive Names**: Give presets clear names that describe the role or scenario they represent

3. **Add Descriptions**: Include helpful descriptions explaining when to use each preset

4. **Match Real Scenarios**: Create presets that match real user roles, testing scenarios, or bug reproduction cases

5. **Team Coordination**: Share your presets configuration with the team so everyone has access to the same testing scenarios

6. **Version Control**: Keep your presets in version control so all team members have the same configurations

7. **Environment-Specific**: Consider having different presets for development, staging, and production environments

## Common Use Cases

### Testing Different User Roles
Create presets for each user role in your application (admin, editor, viewer, etc.)

### Bug Reproduction
Create presets that reproduce specific bug scenarios with exact feature flag and permission combinations

### Feature Testing
Create presets for testing new features with specific configurations enabled/disabled

### Localization Testing
Create presets for different language configurations to test internationalization

### Performance Testing
Create presets with debug and monitoring features enabled for performance analysis
