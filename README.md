# Angular Dev Toolbar

<div align="center">

[![npm version](https://badge.fury.io/js/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![Downloads](https://img.shields.io/npm/dm/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![License](https://img.shields.io/npm/l/ngx-dev-toolbar.svg)](https://github.com/yourusername/ngx-dev-toolbar/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red)](https://angular.io/)
[![GitHub Stars](https://img.shields.io/github/stars/alfredoperez/ngx-dev-toolbar?style=social)](https://github.com/alfredoperez/ngx-dev-toolbar)

<h3>A powerful development toolbar for Angular applications that helps developers to interact with the application in a more efficient way.</h3>

<p align="center">
  <img src="./docs/images/demo.gif" alt="Dev Toolbar Demo" width="600px" />
</p>

</div>

## ✨ Why ngx-dev-toolbar?

<div align="center">
  <table>
    <tr>
      <td align="center">🚥</td>
      <td>Toggle feature flags without backend changes</td>
    </tr>
    <td align="center">🌍</td>
      <td>Switch languages instantly</td>
    </tr>
    <td align="center">🎨</td>
      <td>Switch themes on the fly</td>
    </tr>
    <td align="center">👤</td>
      <td>Change user sessions effortlessly</td>
    </tr>
    <td align="center">🔄</td>
      <td>Mock network requests in real-time</td>
    </tr>
    <tr>
    <td align="center">🔐</td>
      <td>Test permission-based UI without backend changes</td>
    </tr>
  </table>
</div>

No more context switching or backend dependencies - everything you need is right in your browser!

## 🎯 Features

<div class="feature-grid">

### 📦 Available Tools

- Feature Flags
- Language Switcher
- Permissions Tool
- Themes `Coming Soon`
- User Session `Coming Soon`
- Network Requests Mocker `Coming Soon`

### 🛠️ Extensible

- Create custom tools
- Add your own functionality

### 🔒 Production Ready

- Hidden by default in production
- Zero production impact
- Secure implementation

### 💾 Persistent State

- Settings persist across reloads
- Import/Export configuration `Coming Soon`

</div>

## 📱 Quick Start

<details>
<summary><b>1. Installation</b></summary>

```bash
npm install ngx-dev-toolbar --save-dev
```

</details>

<details>
<summary><b>2. Import Component</b></summary>

```typescript
import { DevToolbarComponent } from 'ngx-dev-toolbar';

@Component({
  imports: [DevToolbarComponent],
  template: ` <ndt-toolbar> </ndt-toolbar>`,
})
export class AppComponent {}
```

</details>

## Available Tools

The tools come with a default implementation, but you can create your own tools and add them to the toolbar.

They have a service that you can use to interact with them.

### Feature Flags

#### Configuration

In order to use the feature flags tool, you need to import the `DevToolbarFeatureFlagService` and inject it in your component.

Then you just need to call the `setAvailableOptions` method with the available feature flags that can come from your backend or a third party service.

```typescript
import { DevToolbarFeatureFlagService } from 'ngx-dev-toolbar';
import { inject } from '@angular/core';

@Component({
  // ... component decorator
})
export class AppComponent {
  private featureFlagsService = inject(DevToolbarFeatureFlagService);

  constructor() {
    // Set available feature flags
    this.featureFlagsService.setAvailableOptions([
      { id: 'darkMode', name: 'Dark Mode' },
      { id: 'betaFeatures', name: 'Beta Features' },
      { id: 'experimentalUI', name: 'Experimental UI' },
    ]);
  }
}
```

Once it is added you should see them in the Feature Flags tool in the Angular Dev Toolbar.

![Feature Flags Tool](./docs/images/feature-flags-tool.png)

#### Usage

```typescript
@Component({
  // ... component decorator
})
export class FeatureComponent {
  private featureFlagsService = inject(DevToolbarFeatureFlagService);

  ngOnInit() {
    this.featureFlagsService.getForcedValues().subscribe((forcedFlags) => {
      const isDarkMode = forcedFlags.some((flag) => flag.id === 'darkMode');
      // Apply dark mode logic
    });
  }
}
```

#### Dev Toolbar Interface

[Screenshot placeholder showing the feature flags interface in the dev toolbar]

### Permissions Tool

#### Configuration

```typescript
import { DevToolbarPermissionsService } from 'ngx-dev-toolbar';
import { inject } from '@angular/core';

@Component({
  // ... component decorator
})
export class AppComponent {
  private permissionsService = inject(DevToolbarPermissionsService);

  constructor() {
    // Set available permissions
    this.permissionsService.setAvailableOptions([
      { id: 'can-edit', name: 'Can Edit Posts', description: 'Allows editing posts', isGranted: false, isForced: false },
      { id: 'can-delete', name: 'Can Delete Posts', description: 'Allows deleting posts', isGranted: false, isForced: false },
      { id: 'can-manage-users', name: 'Can Manage Users', description: 'Allows user management', isGranted: false, isForced: false },
      { id: 'is-admin', name: 'Admin Access', description: 'Full admin access', isGranted: false, isForced: false },
    ]);
  }
}
```

#### Usage

```typescript
@Component({
  // ... component decorator
})
export class ProtectedComponent {
  private permissionsService = inject(DevToolbarPermissionsService);

  ngOnInit() {
    this.permissionsService.getForcedValues().subscribe((forcedPermissions) => {
      const canEdit = forcedPermissions.some(p => p.id === 'can-edit' && p.isGranted);
      const isAdmin = forcedPermissions.some(p => p.id === 'is-admin' && p.isGranted);
      // Apply permission-based logic
    });
  }
}
```

### Language Switcher

#### Configuration

```typescript
import { DevToolbarLanguageService } from 'ngx-dev-toolbar';
import { inject } from '@angular/core';

@Component({
  // ... component decorator
})
export class AppComponent {
  private languageService = inject(DevToolbarLanguageService);

  constructor() {
    // Set available languages
    this.languageService.setAvailableOptions([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
    ]);
  }
}
```

#### Usage

```typescript
@Component({
  // ... component decorator
})
export class TranslatedComponent {
  private languageService = inject(DevToolbarLanguageService);

  ngOnInit() {
    this.languageService.getForcedValues().subscribe(([selectedLang]) => {
      // Update component's language
      this.currentLanguage = selectedLang.code;
      this.loadTranslations();
    });
  }
}
```

## Contributing

We welcome contributions! Please see our [contributing guidelines](https://github.com/alfredoperez/ngx-dev-toolbar/blob/main/CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/alfredoperez/ngx-dev-toolbar/blob/main/LICENSE) file for details.

## Support

<div align="center">

<table>
  <tr>
    <td align="center">
      <a href="https://alfredoperez.github.io/ngx-dev-toolbar/">
        📚
        <br />
        Documentation
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/alfredoperez/ngx-dev-toolbar/issues">
        🐛
        <br />
        Issue Tracker
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/alfredoperez/ngx-dev-toolbar/discussions">
        💬
        <br />
        Discussions
      </a>
    </td>
  </tr>
</table>

</div>

## 🌟 Stay Connected

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/alfredo-perez/)
[![Bluesky](https://img.shields.io/badge/Bluesky-Follow-1DA1F2)](https://bsky.app/profile/alfredo-perez.bsky.social)
[![GitHub Stars](https://img.shields.io/github/stars/alfredoperez/ngx-dev-toolbar?style=social)](https://github.com/alfredoperez/ngx-dev-toolbar)

<hr />

<p>Built with ❤️ using <a href="https://nx.dev">Nx</a></p>

</div>
