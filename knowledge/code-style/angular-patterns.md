# Angular Development Patterns

**Last Updated**: 2025-10-12
**Purpose**: Standard Angular coding patterns for ngx-dev-toolbar

---

## Signals & State Management

### Local Component State

**Use signals for all local state**:

```typescript
export class MyComponent {
  // ✅ CORRECT: Use signal for reactive state
  protected readonly count = signal(0);
  protected readonly name = signal('');

  increment(): void {
    this.count.update(v => v + 1);
  }

  // ❌ INCORRECT: Don't use plain properties for reactive state
  protected count = 0; // Won't trigger change detection
}
```

### Derived State

**Use computed() for pure transformations**:

```typescript
export class MyComponent {
  protected readonly items = signal<Item[]>([]);
  protected readonly filter = signal('');

  // ✅ CORRECT: computed for derived state
  protected readonly filteredItems = computed(() => {
    const items = this.items();
    const filter = this.filter().toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(filter)
    );
  });

  // ❌ INCORRECT: Don't manually track dependencies
  protected filteredItems: Item[] = [];
  updateFilter(newFilter: string): void {
    this.filter.set(newFilter);
    this.filteredItems = this.items().filter(...); // Manual tracking
  }
}
```

### Side Effects

**Use effect() for DOM updates, logging, localStorage**:

```typescript
export class MyComponent {
  protected readonly theme = signal<'light' | 'dark'>('light');

  constructor() {
    // ✅ CORRECT: effect for side effects
    effect(() => {
      document.body.setAttribute('data-theme', this.theme());
    });
  }

  // ❌ INCORRECT: Don't do side effects in computed
  protected readonly applyTheme = computed(() => {
    document.body.setAttribute('data-theme', this.theme()); // Side effect!
    return this.theme();
  });
}
```

---

## Component Patterns

### Standalone Components

**Always use standalone components (implicit in Angular 19+)**:

```typescript
// ✅ CORRECT: Standalone component (implicit)
@Component({
  selector: 'app-my-component',
  imports: [CommonModule, FormsModule, OtherComponent],
  template: `...`,
})
export class MyComponent {}

// ❌ INCORRECT: Don't explicitly set standalone
@Component({
  standalone: true, // Implicit, don't set
  selector: 'app-my-component',
  template: `...`,
})
export class MyComponent {}

// ❌ INCORRECT: No NgModules
@NgModule({
  declarations: [MyComponent],
  imports: [CommonModule],
})
export class MyModule {} // Don't create modules
```

### Change Detection

**Always use OnPush**:

```typescript
// ✅ CORRECT: OnPush change detection
@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class MyComponent {}

// ❌ INCORRECT: Default change detection (inefficient)
@Component({
  selector: 'app-my-component',
  // No changeDetection specified = Default
  template: `...`,
})
export class MyComponent {}
```

### Inputs & Outputs

**Use input() and output() functions, not decorators**:

```typescript
export class MyComponent {
  // ✅ CORRECT: input() function
  readonly data = input.required<DataType>();
  readonly optional = input<string>('default');

  // ✅ CORRECT: output() function
  readonly itemSelected = output<ItemType>();

  // ❌ INCORRECT: @Input decorator (old pattern)
  @Input() data!: DataType;

  // ❌ INCORRECT: @Output decorator (old pattern)
  @Output() itemSelected = new EventEmitter<ItemType>();
}
```

### Two-Way Binding

**Use model() for two-way bound properties**:

```typescript
export class InputComponent {
  // ✅ CORRECT: model signal for two-way binding
  readonly value = model<string>('');
}

// Parent usage
<app-input [(value)]="parentValue" />

// ❌ INCORRECT: Manual @Input/@Output pair
@Input() value = '';
@Output() valueChange = new EventEmitter<string>();
```

---

## Template Patterns

### Control Flow

**Use @if, @for, @switch (not structural directives)**:

```typescript
template: `
  <!-- ✅ CORRECT: Control flow syntax -->
  @if (isVisible()) {
    <div>Visible content</div>
  } @else {
    <div>Hidden content</div>
  }

  @for (item of items(); track item.id) {
    <div>{{ item.name }}</div>
  }

  @switch (status()) {
    @case ('loading') { <div>Loading...</div> }
    @case ('error') { <div>Error</div> }
    @default { <div>Ready</div> }
  }

  <!-- ❌ INCORRECT: Structural directives (old pattern) -->
  <div *ngIf="isVisible()">Old pattern</div>
  <div *ngFor="let item of items()">{{ item.name }}</div>
  <div [ngSwitch]="status()">...</div>
`
```

### Property Binding

**Prefer specific bindings over ng* directives**:

```typescript
template: `
  <!-- ✅ CORRECT: Class bindings -->
  <div [class.active]="isActive()">Content</div>
  <div [class]="{ active: isActive(), disabled: isDisabled() }">Content</div>

  <!-- ✅ CORRECT: Style bindings -->
  <div [style.color]="themeColor()">Content</div>
  <div [style]="{ color: themeColor(), fontSize: '14px' }">Content</div>

  <!-- ❌ INCORRECT: ngClass and ngStyle (less efficient) -->
  <div [ngClass]="{ active: isActive() }">Content</div>
  <div [ngStyle]="{ color: themeColor() }">Content</div>
`
```

### Track Functions

**Always use track in @for loops**:

```typescript
template: `
  <!-- ✅ CORRECT: Track by id for performance -->
  @for (item of items(); track item.id) {
    <div>{{ item.name }}</div>
  }

  <!-- ✅ CORRECT: Track by index if no id -->
  @for (item of items(); track $index) {
    <div>{{ item }}</div>
  }

  <!-- ❌ INCORRECT: No track (poor performance) -->
  @for (item of items()) {
    <div>{{ item.name }}</div>
  }
`
```

---

## Dependency Injection

### Constructor vs inject()

**Prefer inject() function**:

```typescript
export class MyComponent {
  // ✅ CORRECT: inject() function
  private readonly myService = inject(MyService);
  private readonly router = inject(Router);

  // ❌ INCORRECT: Constructor injection (verbose)
  constructor(
    private myService: MyService,
    private router: Router
  ) {}
}
```

### Injection Context

**inject() works in constructor and initializers only**:

```typescript
export class MyComponent {
  // ✅ CORRECT: inject in class field initializer
  private readonly service = inject(MyService);

  // ✅ CORRECT: inject in constructor
  constructor() {
    const service = inject(MyService);
  }

  // ❌ INCORRECT: inject in method (no injection context)
  ngOnInit(): void {
    const service = inject(MyService); // ERROR
  }
}
```

---

## RxJS Patterns

### Observable to Signal Conversion

**Use toSignal() for observable interop**:

```typescript
export class MyComponent {
  private readonly service = inject(MyService);

  // ✅ CORRECT: Convert observable to signal
  protected readonly data = toSignal(this.service.data$, {
    initialValue: [],
  });

  // ❌ INCORRECT: Subscribe manually (memory leak risk)
  protected data: Data[] = [];
  ngOnInit(): void {
    this.service.data$.subscribe(data => {
      this.data = data; // Manual subscription
    });
  }
}
```

### Unsubscribing

**Use takeUntilDestroyed() for automatic cleanup**:

```typescript
export class MyComponent {
  constructor() {
    // ✅ CORRECT: Automatic cleanup with takeUntilDestroyed
    this.myService.data$
      .pipe(takeUntilDestroyed())
      .subscribe(data => this.handleData(data));
  }

  // ❌ INCORRECT: Manual subscription management
  private subscription?: Subscription;
  ngOnInit(): void {
    this.subscription = this.myService.data$.subscribe(...);
  }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```

### Combining Streams

**Use combineLatest for multiple sources**:

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private appData$ = new BehaviorSubject<Data[]>([]);
  private forcedData$ = new BehaviorSubject<Forced>({});

  // ✅ CORRECT: Combine streams
  public combined$ = combineLatest([
    this.appData$,
    this.forcedData$,
  ]).pipe(
    map(([app, forced]) => this.merge(app, forced))
  );
}
```

---

## Forms Patterns

### Reactive Forms

**Always use Reactive Forms (not Template-driven)**:

```typescript
export class MyFormComponent {
  private readonly fb = inject(FormBuilder);

  // ✅ CORRECT: Reactive forms with typed controls
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    age: [0, [Validators.required, Validators.min(0)]],
  });

  // ✅ CORRECT: Access form values with type safety
  onSubmit(): void {
    if (this.form.valid) {
      const values = this.form.value;
      // values is typed
    }
  }
}

// Template
template: `
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <input formControlName="name" />
    <input formControlName="email" type="email" />
    <input formControlName="age" type="number" />
    <button type="submit" [disabled]="form.invalid">Submit</button>
  </form>
`
```

### Form State as Signals

**Convert form state to signals**:

```typescript
export class MyFormComponent {
  protected readonly form = this.fb.group({...});

  // ✅ CORRECT: Form value as signal
  protected readonly formValue = toSignal(
    this.form.valueChanges,
    { initialValue: this.form.value }
  );

  // ✅ CORRECT: Form valid state as signal
  protected readonly isValid = toSignal(
    this.form.statusChanges.pipe(map(() => this.form.valid)),
    { initialValue: false }
  );
}
```

---

## TypeScript Patterns

### Type Safety

**Use strict typing, avoid `any`**:

```typescript
// ✅ CORRECT: Proper types
interface User {
  id: string;
  name: string;
}

function processUser(user: User): void {
  console.log(user.name);
}

// ❌ INCORRECT: any type (no type safety)
function processUser(user: any): void {
  console.log(user.name); // No IDE support
}
```

### Generic Constraints

**Use generics for reusable code**:

```typescript
// ✅ CORRECT: Generic with constraint
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// ❌ INCORRECT: Overly specific
function findUserById(users: User[], id: string): User | undefined {
  return users.find(user => user.id === id);
}
function findPostById(posts: Post[], id: string): Post | undefined {
  return posts.find(post => post.id === id);
}
```

### Readonly Properties

**Use readonly for immutable properties**:

```typescript
export class MyService {
  // ✅ CORRECT: readonly prevents reassignment
  private readonly STORAGE_KEY = 'my-key';
  private readonly storageService = inject(StorageService);

  // ❌ INCORRECT: Mutable configuration
  private STORAGE_KEY = 'my-key'; // Could be reassigned
}
```

---

## Immutability Patterns

### Array Updates

**Use spread operators for immutable updates**:

```typescript
// ✅ CORRECT: Immutable array operations
addItem(item: Item): void {
  this.items.update(current => [...current, item]);
}

removeItem(id: string): void {
  this.items.update(current => current.filter(item => item.id !== id));
}

updateItem(id: string, updates: Partial<Item>): void {
  this.items.update(current =>
    current.map(item => item.id === id ? { ...item, ...updates } : item)
  );
}

// ❌ INCORRECT: Mutating arrays
addItem(item: Item): void {
  const current = this.items();
  current.push(item); // Mutation!
  this.items.set(current);
}
```

### Object Updates

**Use spread operators for object updates**:

```typescript
// ✅ CORRECT: Immutable object update
updateUser(updates: Partial<User>): void {
  this.user.update(current => ({ ...current, ...updates }));
}

// ❌ INCORRECT: Mutating object
updateUser(updates: Partial<User>): void {
  const current = this.user();
  Object.assign(current, updates); // Mutation!
  this.user.set(current);
}
```

---

## Performance Patterns

### trackBy Functions

**Use trackBy for list rendering performance**:

```typescript
template: `
  @for (item of items(); track item.id) {
    <app-item [data]="item" />
  }
`
```

### OnPush + Signals

**Combine OnPush with signals for optimal performance**:

```typescript
@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Signals automatically trigger change detection -->
    <div>{{ count() }}</div>
    <button (click)="increment()">+</button>
  `,
})
export class MyComponent {
  protected readonly count = signal(0);

  increment(): void {
    this.count.update(v => v + 1); // Triggers change detection
  }
}
```

---

## Accessibility Patterns

### ARIA Labels

**Provide aria-label for all interactive elements**:

```typescript
template: `
  <!-- ✅ CORRECT: aria-label for accessibility -->
  <button
    (click)="onAction()"
    [attr.aria-label]="'Perform action'">
    <ndt-icon name="gear" />
  </button>

  <input
    type="text"
    [attr.aria-label]="'Search items'"
    placeholder="Search..."
  />

  <!-- ❌ INCORRECT: No aria-label -->
  <button (click)="onAction()">
    <ndt-icon name="gear" />
  </button>
`
```

### Semantic HTML

**Use proper semantic elements**:

```typescript
template: `
  <!-- ✅ CORRECT: Semantic HTML -->
  <nav aria-label="Main navigation">
    <button type="button">Action</button>
  </nav>

  <main>
    <article>
      <h1>Title</h1>
      <p>Content</p>
    </article>
  </main>

  <!-- ❌ INCORRECT: Div soup -->
  <div class="nav">
    <div class="button" (click)="onAction()">Action</div>
  </div>

  <div class="content">
    <div class="title">Title</div>
    <div class="text">Content</div>
  </div>
`
```

---

## Related Documentation

- **Service Architecture**: See `knowledge/project/patterns/service-architecture.md`
- **Component Hierarchy**: See `knowledge/project/patterns/component-hierarchy.md`
- **Testing Patterns**: See `knowledge/code-style/testing-patterns.md`
- **Styling Patterns**: See `knowledge/code-style/styling-patterns.md`
