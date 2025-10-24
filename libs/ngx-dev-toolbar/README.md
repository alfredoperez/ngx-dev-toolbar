# Angular Dev Toolbar

<div align="center">

[![npm version](https://badge.fury.io/js/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![Downloads](https://img.shields.io/npm/dm/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![License](https://img.shields.io/npm/l/ngx-dev-toolbar.svg)](https://github.com/yourusername/ngx-dev-toolbar/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red)](https://angular.io/)
[![GitHub Stars](https://img.shields.io/github/stars/alfredoperez/ngx-dev-toolbar?style=social)](https://github.com/alfredoperez/ngx-dev-toolbar)

<h3>A powerful development toolbar for Angular applications that helps developers to interact with the application in a more efficient way.</h3>


[📚 Documentation & Demo](https://alfredoperez.github.io/ngx-dev-toolbar/)

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
  </table>
</div>

No more context switching or backend dependencies - everything you need is right in your browser!

## 🎯 Features

<div class="feature-grid">

### 📦 Available Tools

- Feature Flags
- Language Switcher
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
  template: ` <ndt-dev-toolbar> </ndt-dev-toolbar>`,
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

The toolbar provides two methods for retrieving feature flag values:

##### Option 1: Using `getValues()` (Recommended ✨)

The `getValues()` method returns ALL feature flags with overrides already applied, simplifying integration:

```typescript
@Component({
  // ... component decorator
})
export class FeatureComponent {
  private featureFlagsService = inject(DevToolbarFeatureFlagService);

  ngOnInit() {
    // Get all flags with overrides applied
    this.featureFlagsService.getValues().pipe(
      map(flags => flags.find(f => f.id === 'darkMode')),
      map(flag => flag?.isEnabled ?? false)
    ).subscribe(isDarkMode => {
      if (isDarkMode) {
        // Apply dark mode logic
      }
    });
  }
}
```

**Benefits:**
- ✅ No manual merging with `combineLatest` needed
- ✅ 60-80% less integration code
- ✅ Includes `isForced` property to identify overridden flags
- ✅ Returns all flags (both overridden and natural state)

##### Option 2: Using `getForcedValues()` (Legacy)

The `getForcedValues()` method returns only flags that have been overridden:

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

> **Note:** This method only returns overridden flags. You need to manually merge with your base flags for complete state.

#### Dev Toolbar Interface

[Screenshot placeholder showing the feature flags interface in the dev toolbar]

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

## 🔄 Migration Guide

### Upgrading to v2.x (getValues() API)

If you're using the legacy `getForcedValues()` with manual `combineLatest` merging, you can simplify your code significantly:

#### Before (Manual Merging):

```typescript
@Injectable()
export class FeatureFlagService {
  private store = inject(Store);
  private devToolbar = inject(DevToolbarFeatureFlagService);

  getFlag(flagId: string): Observable<boolean> {
    return combineLatest([
      this.store.select(state => state.flags[flagId]),
      this.devToolbar.getForcedValues().pipe(startWith([]))
    ]).pipe(
      map(([baseValue, overrides]) => {
        const override = overrides.find(o => o.id === flagId);
        return override ? override.isEnabled : baseValue;
      })
    );
  }
}
```

#### After (Using getValues()):

```typescript
@Injectable()
export class FeatureFlagService {
  private store = inject(Store);
  private devToolbar = inject(DevToolbarFeatureFlagService);

  getFlag(flagId: string): Observable<boolean> {
    return this.devToolbar.getValues().pipe(
      map(flags => flags.find(f => f.id === flagId)),
      map(flag => flag?.isEnabled ?? this.getBaseValue(flagId))
    );
  }

  private getBaseValue(flagId: string): boolean {
    return this.store.selectSnapshot(state => state.flags[flagId]);
  }
}
```

**What changed:**
- ❌ Removed `combineLatest` complexity
- ❌ Removed manual override merging logic
- ✅ Single observable with merged state
- ✅ ~60% less code

### Available for All Tools

The `getValues()` method is available for:
- ✅ **DevToolbarFeatureFlagService** - Feature flags with overrides
- ✅ **DevToolbarPermissionsService** - Permissions with overrides
- ✅ **DevToolbarAppFeaturesService** - App features with overrides
- ℹ️ **DevToolbarLanguageService** - Returns forced language (same as `getForcedValues()`)

### Breaking Changes

**None!** This is a non-breaking change. Both APIs work:
- `getValues()` - New, recommended method
- `getForcedValues()` - Legacy method, still supported

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
