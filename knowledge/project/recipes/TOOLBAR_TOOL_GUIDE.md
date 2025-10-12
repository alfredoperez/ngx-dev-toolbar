# Creating a Toolbar Tool Guide

This guide provides a comprehensive approach to creating new toolbar tools for the ngx-dev-toolbar library, using the Feature Flags tool as a reference implementation.

## Table of Contents

1. [Overview](#overview)
2. [Tool Structure](#tool-structure)
3. [Available Components](#available-components)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Best Practices](#best-practices)
6. [Example Implementation](#example-implementation)

## Overview

A toolbar tool is a standalone Angular component that provides specific functionality within the development toolbar. Each tool consists of:

- A **tool component** that contains the main logic and UI
- A **service** (optional) for managing tool-specific state and operations
- **Models/interfaces** for type safety
- Integration with the toolbar state management system

## Tool Structure

### Required Files

```
tools/
├── your-tool/
│   ├── your-tool.component.ts          # Main tool component
│   ├── your-tool.component.scss        # Component styles (optional)
│   ├── your-tool.service.ts            # Tool service (optional)
│   ├── your-tool.models.ts             # Type definitions
│   └── your-tool.component.spec.ts     # Unit tests
```

### Component Structure

```typescript
@Component({
  selector: 'ndt-your-tool',
  standalone: true,
  imports: [
    // Required imports
    DevToolbarToolComponent,
    // Additional components as needed
  ],
  template: `
    <ndt-toolbar-tool [options]="options" title="Your Tool Title" icon="your-icon">
      <!-- Tool content here -->
    </ndt-toolbar-tool>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarYourToolComponent {
  // Component implementation
}
```

## Available Components

### Core Components

| Component          | Selector             | Purpose                    | Key Features                                       |
| ------------------ | -------------------- | -------------------------- | -------------------------------------------------- |
| **Toolbar Tool**   | `ndt-toolbar-tool`   | Main wrapper for all tools | Window management, positioning, animations         |
| **Input**          | `ndt-input`          | Text input field           | Two-way binding, validation, accessibility         |
| **Select**         | `ndt-select`         | Dropdown selection         | Options array, custom styling, keyboard navigation |
| **Button**         | `ndt-button`         | Action button              | Multiple variants, icons, states                   |
| **Card**           | `ndt-card`           | Content container          | Hover effects, click handling                      |
| **Clickable Card** | `ndt-clickable-card` | Interactive card           | Icon, title, subtitle, click events                |
| **Link Button**    | `ndt-link-button`    | External link button       | Icon, text, external link handling                 |

### Icon Components

All tools can use icons from the `IconName` type:

```typescript
type IconName = 'angular' | 'bug' | 'code' | 'database' | 'discord' | 'docs' | 'export' | 'flag' | 'gauge' | 'gear' | 'git-branch' | 'import' | 'layout' | 'lighting' | 'lightbulb' | 'moon' | 'network' | 'puzzle' | 'refresh' | 'star' | 'sun' | 'terminal' | 'toggle-left' | 'translate' | 'trash' | 'user';
```

## Step-by-Step Implementation

### 1. Define Tool Models

Create type definitions for your tool's data structures:

```typescript
// your-tool.models.ts
export interface YourToolItem {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
}

export type YourToolFilter = 'all' | 'enabled' | 'disabled';
```

### 2. Create Tool Service (Optional)

If your tool needs state management or external operations:

```typescript
// your-tool.service.ts
import { Injectable, signal } from '@angular/core';
import { YourToolItem } from './your-tool.models';

@Injectable({
  providedIn: 'root',
})
export class DevToolbarYourToolService {
  private readonly items = signal<YourToolItem[]>([]);

  getItems() {
    return this.items.asReadonly();
  }

  addItem(item: YourToolItem) {
    this.items.update((items) => [...items, item]);
  }

  removeItem(id: string) {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
}
```

### 3. Implement the Tool Component

Follow this structure for your main component:

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { DevToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { YourToolService } from './your-tool.service';
import { YourToolItem, YourToolFilter } from './your-tool.models';

@Component({
  selector: 'ndt-your-tool',
  standalone: true,
  imports: [
    DevToolbarToolComponent,
    // Add other components as needed
  ],
  template: `
    <ndt-toolbar-tool [options]="options" title="Your Tool" icon="your-icon">
      <div class="container">
        <!-- Tool content -->
      </div>
    </ndt-toolbar-tool>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarYourToolComponent {
  // Injects
  private readonly yourToolService = inject(YourToolService);

  // Signals
  protected readonly activeFilter = signal<YourToolFilter>('all');
  protected readonly searchQuery = signal<string>('');

  // Computed values
  protected readonly items = this.yourToolService.getItems();
  protected readonly filteredItems = computed(() => {
    return this.items().filter((item) => {
      const searchTerm = this.searchQuery().toLowerCase();
      const matchesSearch = !this.searchQuery() || item.name.toLowerCase().includes(searchTerm) || item.description?.toLowerCase().includes(searchTerm);

      const matchesFilter = this.activeFilter() === 'all' || (this.activeFilter() === 'enabled' && item.isEnabled) || (this.activeFilter() === 'disabled' && !item.isEnabled);

      return matchesSearch && matchesFilter;
    });
  });

  // Window options
  protected readonly options: DevToolbarWindowOptions = {
    title: 'Your Tool',
    description: 'Description of your tool functionality',
    isClosable: true,
    size: 'medium', // 'small' | 'medium' | 'tall' | 'large'
    id: 'ndt-your-tool',
    isBeta: false,
  };

  // Public methods
  onFilterChange(value: string | undefined): void {
    // Handle filter changes
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  // Protected methods
  protected onItemToggle(item: YourToolItem): void {
    // Handle item toggle
  }
}
```

### 4. Add Component to Library Exports

Update the main library index file to export your new component:

```typescript
// libs/ngx-dev-toolbar/src/index.ts
export { DevToolbarYourToolComponent } from './tools/your-tool/your-tool.component';
```

## Best Practices

### Component Organization

1. **Property Order**: Follow this order in your component class:

   ```typescript
   export class YourComponent {
     // 1. Injects
     private readonly service = inject(YourService);

     // 2. Inputs
     readonly input = input<string>();

     // 3. Outputs
     readonly output = output<string>();

     // 4. Signals
     protected readonly signal = signal<string>('');

     // 5. Computed values
     protected readonly computed = computed(() => /* logic */);

     // 6. Other properties
     protected readonly options = { /* ... */ };

     // 7. Public methods
     onAction() { /* ... */ }

     // 8. Protected methods
     protected onInternalAction() { /* ... */ }

     // 9. Private methods
     private onPrivateAction() { /* ... */ }
   }
   ```

### Styling Guidelines

1. **Use CSS Variables**: Leverage the design system variables:

   ```scss
   .your-component {
     background: var(--ndt-background-secondary);
     color: var(--ndt-text-primary);
     border: 1px solid var(--ndt-border-primary);
     border-radius: var(--ndt-border-radius-medium);
     padding: var(--ndt-spacing-md);
   }
   ```

2. **Responsive Layout**: Use flexbox for responsive layouts:

   ```scss
   .container {
     display: flex;
     flex-direction: column;
     height: 100%;
     gap: var(--ndt-spacing-md);
   }
   ```

3. **Scrollable Content**: For long lists, implement proper scrolling:
   ```scss
   .scrollable-content {
     flex: 1;
     min-height: 0;
     overflow-y: auto;
     padding-right: var(--ndt-spacing-sm);
   }
   ```

### State Management

1. **Use Signals**: Prefer Angular signals for reactive state:

   ```typescript
   protected readonly items = signal<Item[]>([]);
   protected readonly filteredItems = computed(() => {
     return this.items().filter(/* logic */);
   });
   ```

2. **Service Integration**: Use services for complex state management:
   ```typescript
   private readonly service = inject(YourService);
   protected readonly items = this.service.getItems();
   ```

### Accessibility

1. **ARIA Labels**: Provide proper ARIA labels for interactive elements:

   ```typescript
   <ndt-select
     [ariaLabel]="'Filter items by status'"
     (valueChange)="onFilterChange($event)"
   />
   ```

2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible:
   ```typescript
   <div
     tabindex="0"
     (keydown.enter)="onAction()"
     (keydown.space)="onAction()"
   >
   ```

## Example Implementation

Here's a complete example of a simple "Notes" tool:

```typescript
// notes-tool.models.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

// notes-tool.service.ts
import { Injectable, signal } from '@angular/core';
import { Note } from './notes-tool.models';

@Injectable({
  providedIn: 'root',
})
export class DevToolbarNotesService {
  private readonly notes = signal<Note[]>([]);

  getNotes() {
    return this.notes.asReadonly();
  }

  addNote(note: Omit<Note, 'id' | 'createdAt'>) {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.notes.update((notes) => [newNote, ...notes]);
  }

  removeNote(id: string) {
    this.notes.update((notes) => notes.filter((note) => note.id !== id));
  }
}

// notes-tool.component.ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { DevToolbarInputComponent } from '../../components/input/input.component';
import { DevToolbarButtonComponent } from '../../components/button/button.component';
import { DevToolbarCardComponent } from '../../components/card/card.component';
import { DevToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { DevToolbarNotesService } from './notes-tool.service';
import { Note } from './notes-tool.models';

@Component({
  selector: 'ndt-notes-tool',
  standalone: true,
  imports: [FormsModule, DevToolbarToolComponent, DevToolbarInputComponent, DevToolbarButtonComponent, DevToolbarCardComponent],
  template: `
    <ndt-toolbar-tool [options]="options" title="Notes" icon="lightbulb">
      <div class="container">
        <div class="header">
          <ndt-input [value]="newNoteTitle()" (valueChange)="onTitleChange($event)" placeholder="Note title..." />
          <ndt-input [value]="newNoteContent()" (valueChange)="onContentChange($event)" placeholder="Note content..." />
          <ndt-button label="Add Note" (click)="onAddNote()" [disabled]="!canAddNote()" />
        </div>

        <div class="notes-list">
          @for (note of notes(); track note.id) {
          <ndt-card (clicked)="onRemoveNote(note.id)">
            <div class="note">
              <h3>{{ note.title }}</h3>
              <p>{{ note.content }}</p>
              <small>{{ note.createdAt | date : 'short' }}</small>
            </div>
          </ndt-card>
          }
        </div>
      </div>
    </ndt-toolbar-tool>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--ndt-spacing-md);
      }

      .header {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-sm);
        flex-shrink: 0;
      }

      .notes-list {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-sm);
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      .note {
        padding: var(--ndt-spacing-sm);

        h3 {
          margin: 0 0 var(--ndt-spacing-xs) 0;
          font-size: var(--ndt-font-size-md);
          color: var(--ndt-text-primary);
        }

        p {
          margin: 0 0 var(--ndt-spacing-xs) 0;
          font-size: var(--ndt-font-size-sm);
          color: var(--ndt-text-secondary);
        }

        small {
          font-size: var(--ndt-font-size-xs);
          color: var(--ndt-text-muted);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarNotesToolComponent {
  // Injects
  private readonly notesService = inject(DevToolbarNotesService);

  // Signals
  protected readonly newNoteTitle = signal<string>('');
  protected readonly newNoteContent = signal<string>('');

  // Computed values
  protected readonly notes = this.notesService.getNotes();
  protected readonly canAddNote = computed(() => this.newNoteTitle().trim().length > 0 && this.newNoteContent().trim().length > 0);

  // Window options
  protected readonly options: DevToolbarWindowOptions = {
    title: 'Notes',
    description: 'Quick notes for development',
    isClosable: true,
    size: 'medium',
    id: 'ndt-notes',
    isBeta: false,
  };

  // Public methods
  onTitleChange(title: string): void {
    this.newNoteTitle.set(title);
  }

  onContentChange(content: string): void {
    this.newNoteContent.set(content);
  }

  onAddNote(): void {
    if (this.canAddNote()) {
      this.notesService.addNote({
        title: this.newNoteTitle().trim(),
        content: this.newNoteContent().trim(),
      });
      this.newNoteTitle.set('');
      this.newNoteContent.set('');
    }
  }

  onRemoveNote(id: string): void {
    this.notesService.removeNote(id);
  }
}
```

## Testing

Create comprehensive unit tests for your tool:

```typescript
// your-tool.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevToolbarYourToolComponent } from './your-tool.component';
import { DevToolbarYourToolService } from './your-tool.service';

describe('DevToolbarYourToolComponent', () => {
  let component: DevToolbarYourToolComponent;
  let fixture: ComponentFixture<DevToolbarYourToolComponent>;
  let service: jasmine.SpyObj<DevToolbarYourToolService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('DevToolbarYourToolService', ['getItems', 'addItem', 'removeItem']);

    await TestBed.configureTestingModule({
      imports: [DevToolbarYourToolComponent],
      providers: [{ provide: DevToolbarYourToolService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DevToolbarYourToolComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(DevToolbarYourToolService) as jasmine.SpyObj<DevToolbarYourToolService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSearchChange', () => {
    it('should update search query', () => {
      const query = 'test query';
      component.onSearchChange(query);
      expect(component['searchQuery']()).toBe(query);
    });
  });

  // Add more test cases for your specific functionality
});
```

## Conclusion

This guide provides a comprehensive framework for creating toolbar tools. By following these patterns and best practices, you can create consistent, maintainable, and accessible tools that integrate seamlessly with the ngx-dev-toolbar library.

Remember to:

- Follow the established patterns and conventions
- Use the available design system components
- Implement proper accessibility features
- Write comprehensive tests
- Document your tool's functionality

For more examples, refer to the existing tools in the codebase, particularly the Feature Flags tool which serves as an excellent reference implementation.

## App Features Tool Integration Example

The App Features Tool demonstrates how to test product-level feature availability like license tiers, deployment configurations, and environment flags without backend changes. Here's a complete integration example:

### Basic Integration

```typescript
// app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DevToolbarAppFeaturesService, DevToolbarAppFeature } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: `
    <ndt-toolbar />
    <router-outlet />
  `
})
export class AppComponent implements OnInit {
  private readonly appFeaturesService = inject(DevToolbarAppFeaturesService);

  ngOnInit(): void {
    // Configure available features based on current tier/environment
    const features: DevToolbarAppFeature[] = [
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics Dashboard',
        description: 'Premium reporting and data visualization',
        isEnabled: false,  // Not available in current tier
        isForced: false
      },
      {
        id: 'multi-user-support',
        name: 'Multi-User Collaboration',
        description: 'Team features and user management',
        isEnabled: true,   // Available in current tier
        isForced: false
      }
    ];

    this.appFeaturesService.setAvailableOptions(features);

    // Subscribe to forced overrides from the toolbar
    this.appFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe((forcedFeatures) => {
        forcedFeatures.forEach((feature) => {
          // Apply forced feature state to your application logic
          this.applyFeatureState(feature.id, feature.isEnabled);
        });
      });
  }

  private applyFeatureState(featureId: string, isEnabled: boolean): void {
    // Update your application's feature configuration
    console.log(`Feature ${featureId} is now ${isEnabled ? 'enabled' : 'disabled'}`);
  }
}
```

### Advanced Integration: Product Tier Management

For SaaS applications with subscription tiers, create a dedicated service:

```typescript
// app-features-config.service.ts
import { Injectable, signal, computed } from '@angular/core';

export type ProductTier = 'basic' | 'professional' | 'enterprise';

@Injectable({
  providedIn: 'root',
})
export class AppFeaturesConfigService {
  public currentTier = signal<ProductTier>('basic');
  private forcedFeatures = signal<Map<string, boolean>>(new Map());

  private readonly tierFeatures: Record<ProductTier, string[]> = {
    basic: ['core-features', 'single-user', 'basic-support'],
    professional: [
      'core-features',
      'single-user',
      'basic-support',
      'analytics',
      'multi-user',
      'priority-support'
    ],
    enterprise: [
      'core-features',
      'single-user',
      'basic-support',
      'analytics',
      'multi-user',
      'priority-support',
      'white-label',
      'sso-integration',
      'api-access'
    ],
  };

  private readonly featureMetadata: Record<string, { name: string; description: string }> = {
    'core-features': {
      name: 'Core Features',
      description: 'Essential app functionality and basic tools',
    },
    'analytics': {
      name: 'Analytics Dashboard',
      description: 'Advanced reporting and data visualization tools',
    },
    'multi-user': {
      name: 'Multi-User Support',
      description: 'Team collaboration and user management features',
    },
    'white-label': {
      name: 'White Label Branding',
      description: 'Customize app branding with your logo and colors',
    },
    'sso-integration': {
      name: 'SSO Integration',
      description: 'Single sign-on with enterprise identity providers',
    },
    'api-access': {
      name: 'API Access',
      description: 'Full REST API access for custom integrations',
    },
    // ... more features
  };

  /**
   * Get all features across all tiers (for toolbar display)
   */
  public getAllFeatures() {
    const allFeatureIds = new Set<string>();
    Object.values(this.tierFeatures).forEach((features) =>
      features.forEach((id) => allFeatureIds.add(id))
    );

    const tier = this.currentTier();
    const enabledFeatures = this.tierFeatures[tier];

    return Array.from(allFeatureIds).map((id) => ({
      id,
      name: this.featureMetadata[id]?.name || id,
      description: this.featureMetadata[id]?.description || '',
      isEnabled: enabledFeatures.includes(id),
      isForced: false,
    }));
  }

  /**
   * Check if a specific feature is enabled (considering forced overrides)
   */
  public isFeatureEnabled(featureId: string): boolean {
    const forced = this.forcedFeatures();

    // If forced via toolbar, use forced state
    if (forced.has(featureId)) {
      return forced.get(featureId) ?? false;
    }

    // Otherwise, check if feature is in current tier
    const tier = this.currentTier();
    return this.tierFeatures[tier].includes(featureId);
  }

  /**
   * Force a feature to enabled/disabled state (called by dev toolbar)
   */
  public forceFeature(featureId: string, isEnabled: boolean): void {
    this.forcedFeatures.update((map) => {
      const newMap = new Map(map);
      newMap.set(featureId, isEnabled);
      return newMap;
    });
  }

  /**
   * Clear all forced overrides
   */
  public clearAllForcedFeatures(): void {
    this.forcedFeatures.set(new Map());
  }

  /**
   * Set the product tier (for demo/testing purposes)
   */
  public setTier(tier: ProductTier): void {
    this.currentTier.set(tier);
  }
}
```

### Integration with App Component

```typescript
// app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';
import { AppFeaturesConfigService } from './services/app-features-config.service';

@Component({
  selector: 'app-root',
  template: `<ndt-toolbar /><router-outlet />`
})
export class AppComponent implements OnInit {
  private readonly devToolbarAppFeaturesService = inject(DevToolbarAppFeaturesService);
  private readonly appFeaturesConfig = inject(AppFeaturesConfigService);

  ngOnInit(): void {
    this.loadAppFeatures();
  }

  private loadAppFeatures(): void {
    // Get all features across all tiers for the dev toolbar
    const features = this.appFeaturesConfig.getAllFeatures();
    this.devToolbarAppFeaturesService.setAvailableOptions(features);

    // Subscribe to forced feature overrides from the dev toolbar
    this.devToolbarAppFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe((forcedFeatures) => {
        // Clear all forced features first
        this.appFeaturesConfig.clearAllForcedFeatures();

        // Apply forced states from toolbar
        forcedFeatures.forEach((feature) => {
          this.appFeaturesConfig.forceFeature(feature.id, feature.isEnabled);
        });
      });
  }
}
```

### Using Features in Components

```typescript
// feature-gated.component.ts
import { Component, inject } from '@angular/core';
import { AppFeaturesConfigService } from '../services/app-features-config.service';

@Component({
  selector: 'app-analytics-dashboard',
  template: `
    @if (hasAnalytics()) {
      <div class="analytics-dashboard">
        <h2>Advanced Analytics</h2>
        <!-- Premium analytics features -->
      </div>
    } @else {
      <div class="upgrade-prompt">
        <p>Upgrade to Professional tier to unlock Advanced Analytics</p>
        <button (click)="onUpgrade()">Upgrade Now</button>
      </div>
    }
  `
})
export class AnalyticsDashboardComponent {
  private readonly appFeaturesConfig = inject(AppFeaturesConfigService);

  protected hasAnalytics(): boolean {
    return this.appFeaturesConfig.isFeatureEnabled('analytics');
  }

  protected onUpgrade(): void {
    // Handle upgrade flow
  }
}
```

### Preset Integration

For saving and loading feature configurations:

```typescript
// Using with presets tool
import { DevToolbarAppFeaturesService, ForcedAppFeaturesState } from 'ngx-dev-toolbar';

// Save current state as preset
const currentState: ForcedAppFeaturesState =
  this.appFeaturesService.getCurrentForcedState();
// Returns: { enabled: ['analytics'], disabled: ['white-label'] }

// Apply preset
const enterprisePreset: ForcedAppFeaturesState = {
  enabled: ['analytics', 'multi-user', 'white-label', 'sso-integration'],
  disabled: []
};
this.appFeaturesService.applyPresetFeatures(enterprisePreset);
```

### Testing Different Scenarios

The App Features Tool enables testing various scenarios:

1. **Tier Upgrades**: Force premium features on to test upgrade flows
2. **Tier Downgrades**: Force premium features off to test graceful degradation
3. **Mixed Configurations**: Test specific feature combinations
4. **Edge Cases**: Test what happens when features are unexpectedly available/unavailable

### Best Practices

1. **Centralized Configuration**: Keep all feature definitions in one service
2. **Type Safety**: Use TypeScript enums or union types for feature IDs
3. **Metadata**: Include names and descriptions for clear UI presentation
4. **Forced Overrides**: Always check forced state first, then natural state
5. **Clear on Reset**: Clear all forced features when resetting to natural state
6. **localStorage Sync**: The toolbar persists forced state automatically
7. **Testing**: Use the toolbar to test tier changes without backend modifications

This pattern works excellently for:
- SaaS subscription tiers (Basic, Pro, Enterprise)
- Environment-specific features (dev, staging, production)
- Deployment configurations (on-premise vs cloud)
- License-based feature gates
- A/B testing scenarios
- Beta feature rollouts
