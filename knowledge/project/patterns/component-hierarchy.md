# Component Hierarchy & Structure

**Last Updated**: 2025-10-12
**Purpose**: Document how components relate and are organized in ngx-dev-toolbar

---

## Component Tree Overview

```
DevToolbarComponent (root)
├── DevToolbarHomeToolComponent
├── DevToolbarLanguageToolComponent
│   └── DevToolbarToolComponent (wrapper)
│       ├── DevToolbarInputComponent (search)
│       ├── DevToolbarSelectComponent (language picker)
│       └── DevToolbarIconComponent
├── DevToolbarFeatureFlagsToolComponent
│   └── DevToolbarToolComponent (wrapper)
│       ├── DevToolbarInputComponent (search)
│       ├── DevToolbarSelectComponent (filter)
│       └── Multiple DevToolbarSelectComponent (flag controls)
├── DevToolbarPermissionsToolComponent (planned)
│   └── DevToolbarToolComponent (wrapper)
│       ├── DevToolbarInputComponent (search)
│       ├── DevToolbarSelectComponent (filter + controls)
│       └── DevToolbarIconComponent
└── [Custom Tools via ng-content]
```

---

## Component Layers

### Layer 1: Root Component

**Component**: `DevToolbarComponent`
**Responsibility**: Container and visibility management
**File**: `libs/ngx-dev-toolbar/src/dev-toolbar.component.ts`

**Structure**:
```typescript
@Component({
  selector: 'ndt-toolbar',
  template: `
    @if (isDevMode) {
      <div class="dev-toolbar" [class.is-visible]="state.isVisible()">
        <!-- Built-in tools -->
        <ndt-home-tool />
        <ndt-language-tool />
        <ndt-feature-flags-tool />

        <!-- Custom tools via content projection -->
        <ng-content />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarComponent {
  protected readonly state = inject(DevToolbarStateService);
  protected readonly isDevMode = isDevMode();
}
```

**Key Characteristics**:
- Only renders in development mode
- Provides global keyboard shortcut (Ctrl+Shift+D)
- Manages toolbar visibility state
- Projects custom tools via `<ng-content>`

---

### Layer 2: Tool Components

**Pattern**: Each tool is a standalone component
**Responsibility**: Tool-specific UI and business logic
**Examples**: `DevToolbarFeatureFlagsToolComponent`, `DevToolbarLanguageToolComponent`

**Structure**:
```typescript
@Component({
  selector: 'ndt-[tool-name]-tool',
  template: `
    <ndt-toolbar-tool [options]="options" title="[Title]" icon="[icon-name]">
      <!-- Tool-specific content -->
      <div class="container">
        <div class="header">
          <ndt-input />
          <ndt-select />
        </div>
        <div class="content">
          <!-- Items list -->
        </div>
      </div>
    </ndt-toolbar-tool>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbar[Name]ToolComponent {
  private readonly internalService = inject(DevToolbarInternal[Name]Service);

  // Component state (signals)
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal('all');

  // Derived state (computed)
  protected readonly items = this.internalService.items;
  protected readonly filteredItems = computed(() => {
    // Filter logic
  });

  // Window configuration
  protected readonly options: DevToolbarWindowOptions = {
    title: '[Tool Name]',
    description: '[Description]',
    isClosable: true,
    size: 'tall',
    id: 'ndt-[tool-name]',
  };
}
```

**Key Characteristics**:
- Always wraps content in `<ndt-toolbar-tool>`
- Uses OnPush change detection
- Signal-based local state
- Computed values for derived state
- Injects internal service for data

---

### Layer 3: Tool Wrapper Component

**Component**: `DevToolbarToolComponent`
**Responsibility**: Provides consistent window chrome, positioning, animations
**File**: `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts`

**Structure**:
```typescript
@Component({
  selector: 'ndt-toolbar-tool',
  template: `
    <button
      class="tool-button"
      [class.is-active]="isActive()"
      (click)="toggle()"
      [attr.aria-label]="options.title">
      <ndt-icon [name]="icon" />
      @if (title) {
        <span>{{ title }}</span>
      }
    </button>

    @if (isActive()) {
      <ndt-window
        [config]="options"
        (close)="close()">
        <!-- Projected tool content -->
        <ng-content />
      </ndt-window>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarToolComponent {
  readonly options = input.required<DevToolbarWindowOptions>();
  readonly icon = input<string>();
  readonly title = input<string>();

  protected readonly isActive = signal(false);

  protected toggle(): void {
    this.isActive.update(v => !v);
  }
}
```

**Key Characteristics**:
- Provides tool button in toolbar
- Manages window open/close state
- Handles positioning and animations
- Projects tool-specific content
- Consistent chrome across all tools

---

### Layer 4: Reusable UI Components

**Location**: `libs/ngx-dev-toolbar/src/components/`
**Responsibility**: Building blocks for tool UIs

#### Input Component

**Component**: `DevToolbarInputComponent`
**Selector**: `ndt-input`
**Purpose**: Text input with consistent styling

**Usage**:
```typescript
<ndt-input
  [(value)]="searchQuery"
  placeholder="Search..."
  type="text"
  [ariaLabel]="'Search items'"
/>
```

**Props**:
- `value` (model): Two-way bound signal
- `placeholder`: Input placeholder text
- `type`: Input type (text, email, password, etc.)
- `ariaLabel`: Accessibility label

---

#### Select Component

**Component**: `DevToolbarSelectComponent`
**Selector**: `ndt-select`
**Purpose**: Dropdown select with consistent styling

**Usage**:
```typescript
<ndt-select
  [(value)]="activeFilter"
  [options]="filterOptions"
  [size]="'medium'"
  (valueChange)="onFilterChange($event)"
/>
```

**Props**:
- `value` (model): Two-way bound signal
- `options`: Array of `{ value, label }` objects
- `size`: 'small' | 'medium' | 'large'
- `ariaLabel`: Accessibility label

---

#### Button Component

**Component**: `DevToolbarButtonComponent`
**Selector**: `ndt-button`
**Purpose**: Action buttons with variants

**Usage**:
```typescript
<ndt-button
  [variant]="'primary'"
  [icon]="'plus'"
  (click)="onAction()">
  Create New
</ndt-button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'icon'
- `icon`: Icon name (optional)
- `label`: Button text (or via content projection)
- `isActive`: Boolean for toggle state

---

#### Icon Component

**Component**: `DevToolbarIconComponent`
**Selector**: `ndt-icon`
**Purpose**: Consistent SVG icon display

**Usage**:
```typescript
<ndt-icon [name]="'user'" />
```

**Props**:
- `name`: Icon identifier (see `icon.models.ts` for available icons)

**Available Icons**: `user`, `users`, `gear`, `toggle-left`, `translate`, `network`, `star`, `puzzle`, `home`, `angular`, `plus`, `minus`, `refresh`, `export`, `trash`, etc.

---

#### Window Component

**Component**: `DevToolbarWindowComponent`
**Selector**: `ndt-window`
**Purpose**: Modal/floating window container

**Usage**:
```typescript
<ndt-window
  [config]="windowConfig"
  (close)="onClose()">
  <!-- Window content -->
</ndt-window>
```

**Props**:
- `config`: `DevToolbarWindowOptions` configuration object
- `close` (event): Emits when window should close

---

## Component Communication Patterns

### Parent → Child: Inputs

**Pattern**: Use `input()` function (not decorators)

```typescript
// Child component
export class ChildComponent {
  readonly data = input.required<DataType>();
  readonly optional = input<string>('default');
}

// Parent template
<child [data]="parentData" [optional]="'custom'" />
```

---

### Child → Parent: Outputs

**Pattern**: Use `output()` function (not decorators)

```typescript
// Child component
export class ChildComponent {
  readonly itemSelected = output<ItemType>();

  onSelect(item: ItemType): void {
    this.itemSelected.emit(item);
  }
}

// Parent template
<child (itemSelected)="handleSelection($event)" />
```

---

### Two-Way Binding: Models

**Pattern**: Use model signals for two-way binding

```typescript
// Component
export class InputComponent {
  readonly value = model<string>('');
}

// Parent template
<ndt-input [(value)]="parentValue" />

// Parent component
protected readonly parentValue = signal('');
```

---

### Sibling Communication: Services

**Pattern**: Use shared services with signals

```typescript
// Shared service
@Injectable({ providedIn: 'root' })
export class StateService {
  readonly state = signal<StateType>(initialState);

  updateState(newState: StateType): void {
    this.state.set(newState);
  }
}

// Component A
export class ComponentA {
  private stateService = inject(StateService);

  doAction(): void {
    this.stateService.updateState(newState);
  }
}

// Component B
export class ComponentB {
  private stateService = inject(StateService);
  protected readonly state = this.stateService.state;
}
```

---

## Property Order Convention

All components MUST follow this property order:

```typescript
export class ToolComponent {
  // 1. Injects
  private readonly service = inject(ServiceName);
  private readonly anotherService = inject(AnotherService);

  // 2. Inputs
  readonly requiredInput = input.required<Type>();
  readonly optionalInput = input<Type>('default');

  // 3. Outputs
  readonly actionPerformed = output<EventType>();

  // 4. Models (two-way bindings)
  readonly value = model<Type>();

  // 5. Signals (local state)
  protected readonly localState = signal<Type>(initialValue);

  // 6. Computed values
  protected readonly derivedValue = computed(() => {
    return this.localState() * 2;
  });

  // 7. Other properties
  protected readonly options: ConfigType = { ... };
  private readonly CONSTANT = 'value';

  // 8. Lifecycle hooks
  ngOnInit(): void { }
  ngOnDestroy(): void { }

  // 9. Public methods
  public publicMethod(): void { }

  // 10. Protected methods (template-accessible)
  protected onAction(): void { }

  // 11. Private methods
  private helper(): void { }
}
```

---

## Template Structure Convention

All tool components should follow this template structure:

```typescript
template: `
  <ndt-toolbar-tool [options]="options" [title]="title" [icon]="icon">
    <div class="container">
      <!-- 1. Header Section (search, filters, actions) -->
      <div class="header">
        <ndt-input [(value)]="searchQuery" placeholder="Search..." />
        <ndt-select [(value)]="filter" [options]="filterOptions" />
        <ndt-button (click)="onAction()">Action</ndt-button>
      </div>

      <!-- 2. Empty State -->
      @if (hasNoItems()) {
        <div class="empty">
          <p>No items found</p>
          <ndt-button (click)="onCreate()">Create First Item</ndt-button>
        </div>
      }

      <!-- 3. Content Section (list, form, etc.) -->
      @else {
        <div class="content">
          @for (item of filteredItems(); track item.id) {
            <div class="item">
              <!-- Item content -->
            </div>
          }
        </div>
      }

      <!-- 4. Footer Section (optional) -->
      <div class="footer">
        <!-- Footer content -->
      </div>
    </div>
  </ndt-toolbar-tool>
`
```

---

## Styling Structure Convention

All tool components should follow this style structure:

```scss
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--ndt-spacing-md);
}

// 1. Header styles
.header {
  flex-shrink: 0;
  display: flex;
  gap: var(--ndt-spacing-sm);
}

// 2. Empty state styles
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ndt-spacing-md);
  color: var(--ndt-text-muted);
}

// 3. Content styles
.content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--ndt-spacing-md);

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--ndt-border-primary);
    border-radius: 4px;
  }
}

// 4. Item styles
.item {
  background: var(--ndt-background-secondary);
  padding: var(--ndt-spacing-sm);
  border-radius: var(--ndt-border-radius-small);
  display: flex;
  gap: var(--ndt-spacing-sm);

  .info {
    flex: 1;

    h3 {
      margin: 0;
      font-size: var(--ndt-font-size-md);
      color: var(--ndt-text-primary);
    }

    p {
      margin: 0;
      font-size: var(--ndt-font-size-xs);
      color: var(--ndt-text-muted);
    }
  }
}

// 5. Footer styles
.footer {
  flex-shrink: 0;
  border-top: 1px solid var(--ndt-border-primary);
  padding-top: var(--ndt-spacing-sm);
}
```

---

## Content Projection Patterns

### Basic Content Projection

```typescript
// Parent component
<ndt-toolbar-tool>
  <p>Custom content here</p>
</ndt-toolbar-tool>

// Child component
template: `
  <div class="wrapper">
    <ng-content />
  </div>
`
```

### Named Slots (Multiple Projections)

```typescript
// Parent component
<ndt-window>
  <div header>Custom Header</div>
  <div body>Custom Body</div>
  <div footer>Custom Footer</div>
</ndt-window>

// Child component
template: `
  <div class="window">
    <div class="window-header">
      <ng-content select="[header]" />
    </div>
    <div class="window-body">
      <ng-content select="[body]" />
    </div>
    <div class="window-footer">
      <ng-content select="[footer]" />
    </div>
  </div>
`
```

---

## Related Documentation

- **Service Architecture**: See `knowledge/project/patterns/service-architecture.md`
- **Angular Patterns**: See `knowledge/code-style/angular-patterns.md`
- **Styling Patterns**: See `knowledge/code-style/styling-patterns.md`
