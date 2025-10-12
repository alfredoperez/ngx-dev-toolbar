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
