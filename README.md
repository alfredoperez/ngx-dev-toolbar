# Angular Dev Toolbar

[![npm version](https://badge.fury.io/js/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![Downloads](https://img.shields.io/npm/dm/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![License](https://img.shields.io/npm/l/ngx-dev-toolbar.svg)](https://github.com/alfredoperez/ngx-dev-toolbar/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-19%2B-red)](https://angular.io/)

A development toolbar for Angular 19+ applications that helps developers interact with the application more efficiently.

![Dev Toolbar Demo](./docs/images/demo.gif)

## Why ngx-dev-toolbar?

- Toggle feature flags without backend changes
- Switch languages instantly
- Test product features and subscription tiers
- Switch themes on the fly
- Change user sessions effortlessly
- Mock network requests in real-time
- Test permission-based UI without backend changes

No more context switching or backend dependencies - everything you need is right in your browser!

## Installation

```bash
npm install ngx-dev-toolbar --save-dev
```

## Quick Start

```typescript
import { DevToolbarComponent } from 'ngx-dev-toolbar';

@Component({
  imports: [DevToolbarComponent],
  template: `<ndt-toolbar></ndt-toolbar>`,
})
export class AppComponent {}
```

## Available Tools

| Tool | Description |
|------|-------------|
| Feature Flags | Toggle feature flags on/off during development |
| Permissions | Test permission-based UI without backend changes |
| App Features | Test product features and subscription tiers |
| Language Switcher | Switch between available languages |
| Presets | Save and restore tool configurations |
| Network Mocker | Mock HTTP requests in real-time |

## Feature Flags

```typescript
import { DevToolbarFeatureFlagService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private featureFlagsService = inject(DevToolbarFeatureFlagService);

  constructor() {
    this.featureFlagsService.setAvailableOptions([
      { id: 'darkMode', name: 'Dark Mode', isEnabled: false },
      { id: 'betaFeatures', name: 'Beta Features', isEnabled: true },
    ]);
  }
}
```

Subscribe to forced values:

```typescript
this.featureFlagsService.getForcedValues().subscribe((flags) => {
  // Apply forced flag states
});
```

## Permissions

```typescript
import { DevToolbarPermissionsService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private permissionsService = inject(DevToolbarPermissionsService);

  constructor() {
    this.permissionsService.setAvailableOptions([
      { id: 'can-edit', name: 'Can Edit', isGranted: false },
      { id: 'is-admin', name: 'Admin Access', isGranted: false },
    ]);
  }
}
```

## App Features

Test product-level feature availability like license tiers and subscription features:

```typescript
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private appFeaturesService = inject(DevToolbarAppFeaturesService);

  constructor() {
    this.appFeaturesService.setAvailableOptions([
      { id: 'analytics', name: 'Advanced Analytics', isEnabled: false },
      { id: 'multi-user', name: 'Multi-User Support', isEnabled: true },
    ]);
  }
}
```

## Language Switcher

```typescript
import { DevToolbarLanguageService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private languageService = inject(DevToolbarLanguageService);

  constructor() {
    this.languageService.setAvailableOptions([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
    ]);
  }
}
```

## Configuration

The toolbar accepts a configuration object to control visibility of tools:

```typescript
@Component({
  template: `<ndt-toolbar [config]="toolbarConfig"></ndt-toolbar>`,
})
export class AppComponent {
  toolbarConfig = {
    enabled: true,
    showLanguageTool: true,
    showFeatureFlagsTool: true,
    showAppFeaturesTool: true,
    showPermissionsTool: true,
    showPresetsTool: true,
  };
}
```

## Keyboard Shortcuts

- **Ctrl+Shift+D**: Toggle toolbar visibility

## Features

- **Persistent State**: Settings persist across page reloads
- **Production Ready**: Hidden by default in production with zero impact
- **Extensible**: Create custom tools to fit your workflow

## Documentation

For full documentation, visit: [https://alfredoperez.github.io/ngx-dev-toolbar/](https://alfredoperez.github.io/ngx-dev-toolbar/)

## Contributing

We welcome contributions! Please see our [contributing guidelines](https://github.com/alfredoperez/ngx-dev-toolbar/blob/main/CONTRIBUTING.md) for details.

## Support

- [Documentation](https://alfredoperez.github.io/ngx-dev-toolbar/)
- [Issue Tracker](https://github.com/alfredoperez/ngx-dev-toolbar/issues)
- [Discussions](https://github.com/alfredoperez/ngx-dev-toolbar/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/alfredoperez/ngx-dev-toolbar/blob/main/LICENSE) file for details.

---

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/alfredo-perez/)
[![Bluesky](https://img.shields.io/badge/Bluesky-Follow-1DA1F2)](https://bsky.app/profile/alfredo-perez.bsky.social)
[![GitHub Stars](https://img.shields.io/github/stars/alfredoperez/ngx-dev-toolbar?style=social)](https://github.com/alfredoperez/ngx-dev-toolbar)
