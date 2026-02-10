# Angular Toolbar

[![npm version](https://badge.fury.io/js/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![Downloads](https://img.shields.io/npm/dm/ngx-dev-toolbar.svg)](https://www.npmjs.com/package/ngx-dev-toolbar)
[![License](https://img.shields.io/npm/l/ngx-dev-toolbar.svg)](https://github.com/alfredoperez/ngx-dev-toolbar/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-19%2B-red)](https://angular.io/)

A development toolbar for Angular 19+ applications that helps developers interact with the application more efficiently.

![Toolbar Demo](./docs/images/demo.gif)

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
npm install ngx-dev-toolbar
```

## Quick Start

Add the toolbar to your `app.config.ts` alongside your other providers:

```typescript
// app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToolbar } from 'ngx-dev-toolbar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideToolbar({
      enabled: isDevMode(),
    }),
  ],
};
```

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig);
```

That's it! No template changes needed. The toolbar automatically attaches to the DOM.

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
import { ToolbarFeatureFlagService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private featureFlagsService = inject(ToolbarFeatureFlagService);

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
import { ToolbarPermissionsService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private permissionsService = inject(ToolbarPermissionsService);

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
import { ToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private appFeaturesService = inject(ToolbarAppFeaturesService);

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
import { ToolbarLanguageService } from 'ngx-dev-toolbar';

@Component({...})
export class AppComponent {
  private languageService = inject(ToolbarLanguageService);

  constructor() {
    this.languageService.setAvailableOptions([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
    ]);
  }
}
```

## Creating Custom Tools

Build your own toolbar tools using the exported UI components. Here's a complete Notes tool:

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Injectable } from '@angular/core';
import {
  ToolbarToolComponent,
  ToolbarWindowOptions,
  ToolbarButtonComponent,
  ToolbarInputComponent,
  ToolbarListComponent,
  ToolbarListItemComponent,
  ToolbarStepViewComponent,
  ToolbarStepDirective,
} from 'ngx-dev-toolbar';

// 1. Define your model
interface Note {
  id: string;
  title: string;
  content: string;
}

// 2. Create a service with signal-based state
@Injectable({ providedIn: 'root' })
class NotesService {
  private readonly _notes = signal<Note[]>([]);
  readonly notes = this._notes.asReadonly();

  add(title: string, content: string): void {
    this._notes.update(notes => [
      ...notes,
      { id: crypto.randomUUID(), title, content },
    ]);
  }

  remove(id: string): void {
    this._notes.update(notes => notes.filter(n => n.id !== id));
  }
}

// 3. Build the component
@Component({
  selector: 'app-notes-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    ToolbarButtonComponent,
    ToolbarInputComponent,
    ToolbarListComponent,
    ToolbarListItemComponent,
    ToolbarStepViewComponent,
    ToolbarStepDirective,
  ],
  template: `
    <ndt-toolbar-tool [options]="windowOptions" title="Notes" icon="edit">
      <ndt-step-view
        [currentStep]="viewMode()"
        defaultStep="list"
        (back)="viewMode.set('list')"
      >
        <!-- List view -->
        <ng-template ngtStep="list">
          <ndt-button (click)="viewMode.set('create')" icon="edit">
            Add Note
          </ndt-button>
          <ndt-list
            [hasItems]="notesService.notes().length > 0"
            emptyMessage="No notes yet"
            emptyHint="Click 'Add Note' to create one"
          >
            @for (note of notesService.notes(); track note.id) {
              <ndt-list-item [label]="note.title">
                <ndt-button
                  variant="icon"
                  icon="trash"
                  ariaLabel="Delete"
                  (click)="notesService.remove(note.id)"
                />
              </ndt-list-item>
            }
          </ndt-list>
        </ng-template>

        <!-- Create view -->
        <ng-template ngtStep="create" stepTitle="New Note">
          <ndt-input [(value)]="newTitle" placeholder="Title" ariaLabel="Note title" />
          <ndt-input [(value)]="newContent" placeholder="Content" ariaLabel="Note content" />
          <ndt-button (click)="onCreate()" label="Save" />
        </ng-template>
      </ndt-step-view>
    </ndt-toolbar-tool>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesToolComponent {
  protected readonly notesService = inject(NotesService);

  viewMode = signal<'list' | 'create'>('list');
  newTitle = signal('');
  newContent = signal('');

  readonly windowOptions: ToolbarWindowOptions = {
    id: 'notes',
    title: 'Notes',
    description: 'Quick development notes',
    size: 'medium',
  };

  onCreate(): void {
    if (this.newTitle()) {
      this.notesService.add(this.newTitle(), this.newContent());
      this.newTitle.set('');
      this.newContent.set('');
      this.viewMode.set('list');
    }
  }
}
```

### Exported UI Components

| Component | Selector | Purpose |
|-----------|----------|---------|
| `ToolbarToolComponent` | `ndt-toolbar-tool` | Window wrapper with positioning and animations |
| `ToolbarButtonComponent` | `ndt-button` | Buttons with optional icon |
| `ToolbarInputComponent` | `ndt-input` | Text inputs with two-way binding |
| `ToolbarSelectComponent` | `ndt-select` | Dropdown selection |
| `ToolbarListComponent` | `ndt-list` | List with empty/no-results states |
| `ToolbarListItemComponent` | `ndt-list-item` | List items with optional badge |
| `ToolbarCardComponent` | `ndt-card` | Content container |
| `ToolbarClickableCardComponent` | `ndt-clickable-card` | Interactive card with icon |
| `ToolbarStepViewComponent` | `ndt-step-view` | Multi-step view switcher |
| `ToolbarIconComponent` | `ndt-icon` | 30+ SVG icons |
| `ToolbarLinkButtonComponent` | `ndt-link-button` | External link button |

For a complete guide, see: [Create a Custom Tool](https://alfredoperez.github.io/ngx-dev-toolbar/docs/guides/custom-tool)

## Configuration

Configure which tools are visible:

```typescript
provideToolbar({
  enabled: isDevMode(),
  showLanguageTool: true,
  showFeatureFlagsTool: true,
  showAppFeaturesTool: true,
  showPermissionsTool: true,
  showPresetsTool: true,
})
```

## Keyboard Shortcuts

- **Ctrl+Shift+D**: Toggle toolbar visibility

## Features

- **Zero Bundle Impact**: Dynamic imports exclude toolbar from production builds
- **Persistent State**: Settings persist across page reloads
- **No Template Changes**: Toolbar attaches automatically to the DOM
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
