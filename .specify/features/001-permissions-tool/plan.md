# Implementation Plan: Permissions Tool

**Branch**: `001-permissions-tool` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a Permissions Tool for the ngx-dev-toolbar that allows developers to test permission-based UI and access control without backend changes. The tool follows the established dual-service architecture pattern (public + internal service) and integrates with demo app and documentation. Developers can force permissions to granted/denied states, with persistence across page refreshes and full preset integration support.

---

## Technical Context

**Language/Version**: TypeScript 5.4+ / Angular 19.0+
**Primary Dependencies**: Angular CDK 19.0, RxJS 7.8
**Storage**: localStorage via `DevToolsStorageService`
**Testing**: Jest (unit/integration), Playwright (E2E)
**Target Platform**: Web (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Angular monorepo (Nx workspace)
**Performance Goals**:
  - Search filter: <100ms for 100+ permissions
  - State updates: <16ms (60fps)
  - Tool switching: <50ms
  - Per-tool bundle: <5KB gzipped

**Constraints**:
  - Must follow 3-layer architecture (component, internal service, public service)
  - OnPush change detection mandatory
  - Signal-first state management
  - Zero production impact
  - TDD required (>80% coverage)

**Scale/Scope**:
  - Support 100+ permissions per app
  - Three filter states (all, forced, granted/denied)
  - Full demo app integration
  - Comprehensive documentation

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Standalone Component Architecture** | ✅ PASS | All components use standalone: true (implicit) |
| **II. Signal-First State Management** | ✅ PASS | Using signals + computed, observables only for public API |
| **III. Test-First Development** | ✅ PASS | TDD workflow required, tests written before implementation |
| **IV. OnPush Change Detection** | ✅ PASS | OnPush strategy on all components |
| **V. Consistent Tool Architecture** | ✅ PASS | Following 3-layer pattern (component, internal service, public service) |
| **VI. Design System Consistency** | ✅ PASS | Using --ndt-* CSS variables, reusable components |
| **VII. Zero Production Impact** | ✅ PASS | Tool hidden by default in production mode |

### Angular Development Standards

| Standard | Status | Notes |
|----------|--------|-------|
| **Component Structure** | ✅ PASS | Property order: injects → inputs → outputs → signals → computed → methods |
| **Template Practices** | ✅ PASS | Using @if/@for, class/style bindings, no ng* directives |
| **Reactive Forms** | N/A | No forms in this tool (search input only) |

### Testing & Quality Standards

| Standard | Status | Notes |
|----------|--------|-------|
| **Test Organization** | ✅ PASS | Unit tests in spec files, E2E in apps/ngx-dev-toolbar-demo-e2e/ |
| **Test Requirements** | ✅ PASS | Unit + integration + E2E coverage planned |
| **Code Quality** | ✅ PASS | ESLint + Prettier, no console.log, TypeScript strict mode |

**GATE RESULT**: ✅ **APPROVED TO PROCEED**

No violations detected. All constitution principles are satisfied.

---

## Project Structure

### Documentation (this feature)

```
specs/001-permissions-tool/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research findings (NEXT)
├── data-model.md        # Phase 1: Data models & interfaces
├── quickstart.md        # Phase 1: Quick integration guide
├── contracts/           # Phase 1: API contracts
│   └── permissions-api.ts
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks)
```

### Source Code (repository root)

```
libs/ngx-dev-toolbar/
├── src/
│   ├── tools/
│   │   ├── permissions-tool/              # NEW TOOL
│   │   │   ├── permissions-tool.component.ts
│   │   │   ├── permissions-tool.component.spec.ts
│   │   │   ├── permissions-internal.service.ts
│   │   │   ├── permissions-internal.service.spec.ts
│   │   │   ├── permissions.service.ts
│   │   │   ├── permissions.service.spec.ts
│   │   │   └── permissions.models.ts
│   │   ├── feature-flags-tool/            # REFERENCE (existing)
│   │   └── language-tool/                 # REFERENCE (existing)
│   ├── components/                        # Reusable components (existing)
│   │   ├── toolbar-tool/
│   │   ├── input/
│   │   ├── select/
│   │   ├── button/
│   │   └── icons/
│   ├── dev-toolbar.component.ts           # MODIFY: Add permissions tool
│   └── index.ts                           # MODIFY: Export new APIs
│
apps/ngx-dev-toolbar-demo/
├── src/
│   ├── app/
│   │   ├── app.component.ts               # MODIFY: Add permissions integration
│   │   ├── services/
│   │   │   └── permissions.service.ts     # NEW: Demo permissions service
│   │   └── components/
│   │       └── permission-demo/           # NEW: Demo UI with permission-dependent elements
│   │           ├── permission-demo.component.ts
│   │           └── permission-demo.component.html
│
apps/ngx-dev-toolbar-demo-e2e/
└── src/
    └── permissions-tool.spec.ts           # NEW: E2E tests for permissions tool
│
README.md                                  # MODIFY: Add permissions tool section
libs/ngx-dev-toolbar/src/tools/README.md   # CREATE: Tools documentation
knowledge/project/recipes/                 # REFERENCE: Implementation guides
```

**Structure Decision**: Following existing Nx monorepo structure with library in `libs/` and demo app in `apps/`. All new code follows established patterns from feature-flags-tool as the reference implementation.

---

## Complexity Tracking

*No violations - this section intentionally left empty.*

All patterns used are already established in the codebase. No new architectural patterns or complexity introduced.

---

## Phase 0: Research & Dependencies

### Research Tasks

1. **Analyze Existing Tool Patterns** ✅ COMPLETED
   - [x] Study feature-flags-tool implementation (dual-service pattern)
   - [x] Study language-tool implementation (single-selection pattern)
   - [x] Document service architecture patterns
   - [x] Document component structure patterns
   - **Output**: Created `knowledge/project/patterns/service-architecture.md`
   - **Output**: Created `knowledge/project/patterns/component-hierarchy.md`

2. **Analyze Demo App Integration** ✅ COMPLETED
   - [x] Study how existing tools integrate in demo app
   - [x] Document integration patterns
   - **Output**: Documented in research findings

3. **Document CSS and Design System** ✅ COMPLETED
   - [x] Catalog available CSS variables
   - [x] Document common layout patterns
   - [x] Document available reusable components
   - **Output**: Documented in research findings

4. **Define Icon Choice** ✅ COMPLETED
   - [x] Review available icons
   - **Decision**: Use `'users'` icon for permissions tool
   - **Alternative**: `'user'` or `'shield'`

### Dependencies Analysis

**Existing Dependencies** (no new dependencies needed):
- `@angular/core`: Component framework
- `@angular/common`: Common directives
- `@angular/cdk`: Component Dev Kit (overlay, etc.)
- `rxjs`: Reactive programming

**Internal Dependencies**:
- `DevToolsStorageService`: localStorage persistence
- `DevToolbarToolComponent`: Tool wrapper
- `DevToolbarInputComponent`: Search input
- `DevToolbarSelectComponent`: Filter & control dropdowns
- `DevToolbarIconComponent`: Icon display

**No external packages required** ✅

---

## Phase 1: Design & Contracts

### Data Models (`data-model.md`)

#### Core Entities

**DevToolbarPermission**
```typescript
interface DevToolbarPermission {
  id: string;                 // Unique identifier (e.g., "can-edit-posts")
  name: string;               // Display name (e.g., "Can Edit Posts")
  description?: string;       // Optional explanation
  isGranted: boolean;         // Current state (from app or forced)
  isForced: boolean;          // Whether overridden by toolbar
}
```

**ForcedPermissionsState** (Internal)
```typescript
interface ForcedPermissionsState {
  granted: string[];   // IDs of permissions forced to granted
  denied: string[];    // IDs of permissions forced to denied
}
```

**PermissionFilter** (Component)
```typescript
type PermissionFilter = 'all' | 'forced' | 'granted' | 'denied';
```

**PermissionValue** (Component)
```typescript
type PermissionValue = 'not-forced' | 'granted' | 'denied';
```

#### Relationships

```
DevToolbarPermissionsService (public)
  └─> DevToolbarInternalPermissionsService (internal)
       ├─> app permissions (BehaviorSubject<DevToolbarPermission[]>)
       ├─> forced state (BehaviorSubject<ForcedPermissionsState>)
       └─> combined permissions$ (Observable<DevToolbarPermission[]>)
            └─> permissions (Signal<DevToolbarPermission[]>) [via toSignal]

DevToolbarPermissionsToolComponent
  ├─> DevToolbarInternalPermissionsService.permissions (signal)
  ├─> searchQuery (signal<string>)
  ├─> activeFilter (signal<PermissionFilter>)
  └─> filteredPermissions (computed<DevToolbarPermission[]>)
```

### API Contracts (`contracts/permissions-api.ts`)

#### Public Service API

```typescript
/**
 * Public API for permissions tool integration
 * Implements DevToolsService<DevToolbarPermission>
 */
@Injectable({ providedIn: 'root' })
export class DevToolbarPermissionsService
  implements DevToolsService<DevToolbarPermission> {

  /**
   * Configure available permissions from consuming application
   * @param permissions Array of permissions to display in tool
   */
  setAvailableOptions(permissions: DevToolbarPermission[]): void;

  /**
   * Get permissions with forced overrides
   * @returns Observable stream of forced permissions
   */
  getForcedValues(): Observable<DevToolbarPermission[]>;
}
```

#### Internal Service API

```typescript
/**
 * Internal state management for permissions tool
 * Not exported in public API
 */
@Injectable({ providedIn: 'root' })
export class DevToolbarInternalPermissionsService {

  // Public signals (for component)
  readonly permissions: Signal<DevToolbarPermission[]>;

  // Methods called by public service
  setAppPermissions(permissions: DevToolbarPermission[]): void;
  getForcedPermissions(): Observable<DevToolbarPermission[]>;

  // Methods called by component
  setPermission(id: string, granted: boolean): void;
  removePermissionOverride(id: string): void;

  // Preset integration methods
  applyPresetPermissions(state: ForcedPermissionsState): void;
  getCurrentForcedState(): ForcedPermissionsState;
}
```

### Component API

```typescript
@Component({
  selector: 'ndt-permissions-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarPermissionsToolComponent {
  // No public inputs/outputs (self-contained tool)

  // Protected signals (template-accessible)
  protected readonly permissions: Signal<DevToolbarPermission[]>;
  protected readonly filteredPermissions: Signal<DevToolbarPermission[]>;
  protected readonly searchQuery: WritableSignal<string>;
  protected readonly activeFilter: WritableSignal<PermissionFilter>;

  // Protected methods (event handlers)
  protected onSearchChange(query: string): void;
  protected onFilterChange(filter: PermissionFilter): void;
  protected onPermissionChange(id: string, value: PermissionValue): void;
}
```

### Integration Example (`quickstart.md`)

```typescript
// 1. Import in app.component.ts
import { DevToolbarComponent, DevToolbarPermissionsService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  imports: [DevToolbarComponent],
  template: `
    <ndt-toolbar />

    @if (canEditPosts()) {
      <button (click)="editPost()">Edit Post</button>
    }
  `,
})
export class AppComponent {
  private permissionsService = inject(DevToolbarPermissionsService);

  protected readonly canEditPosts = signal(false);

  constructor() {
    // 2. Configure available permissions
    this.permissionsService.setAvailableOptions([
      {
        id: 'can-edit-posts',
        name: 'Can Edit Posts',
        description: 'Allows editing published posts',
        isGranted: false,
        isForced: false
      },
      {
        id: 'can-delete-users',
        name: 'Can Delete Users',
        description: 'Allows removing user accounts',
        isGranted: false,
        isForced: false
      },
    ]);

    // 3. React to forced permissions
    this.permissionsService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedPerms => {
        const editPerm = forcedPerms.find(p => p.id === 'can-edit-posts');
        if (editPerm) {
          this.canEditPosts.set(editPerm.isGranted);
        }
      });
  }
}
```

---

## Phase 2: Task Generation

**Completed via `/speckit.tasks` command** (not part of `/speckit.plan`)

Tasks will be generated based on:
- P1 user stories (core functionality)
- P2 user stories (search/filter)
- P3 user stories (empty states)
- Demo app integration
- Documentation requirements

---

## Demo App Integration Plan

### Demo Permissions Service

Create `apps/ngx-dev-toolbar-demo/src/app/services/demo-permissions.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class DemoPermissionsService {
  private toolbarService = inject(DevToolbarPermissionsService);

  // Demo permissions state
  private readonly permissions = signal<Record<string, boolean>>({
    'can-edit-posts': false,
    'can-delete-posts': false,
    'can-manage-users': false,
    'can-view-analytics': true,
    'is-admin': false,
  });

  constructor() {
    // Configure toolbar
    this.toolbarService.setAvailableOptions([
      { id: 'can-edit-posts', name: 'Can Edit Posts', description: 'Allows editing published posts', isGranted: false, isForced: false },
      { id: 'can-delete-posts', name: 'Can Delete Posts', description: 'Allows deleting posts', isGranted: false, isForced: false },
      { id: 'can-manage-users', name: 'Can Manage Users', description: 'Allows user management', isGranted: false, isForced: false },
      { id: 'can-view-analytics', name: 'Can View Analytics', description: 'Allows viewing analytics', isGranted: true, isForced: false },
      { id: 'is-admin', name: 'Is Admin', description: 'Full administrator access', isGranted: false, isForced: false },
    ]);

    // Listen for forced values
    this.toolbarService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(forcedPerms => {
        forcedPerms.forEach(perm => {
          this.permissions.update(state => ({
            ...state,
            [perm.id]: perm.isGranted,
          }));
        });
      });
  }

  hasPermission(id: string): boolean {
    return this.permissions()[id] ?? false;
  }
}
```

### Demo UI Component

Create permission-dependent UI elements that respond to permission changes:

```typescript
@Component({
  selector: 'app-permission-demo',
  template: `
    <section class="demo-section">
      <h2>Permissions Demo</h2>

      <div class="actions">
        @if (canEdit()) {
          <button class="btn-primary">Edit Post</button>
        }

        @if (canDelete()) {
          <button class="btn-danger">Delete Post</button>
        }

        @if (canManageUsers()) {
          <button class="btn-secondary">Manage Users</button>
        }
      </div>

      @if (canViewAnalytics()) {
        <div class="analytics">
          <h3>Analytics Dashboard</h3>
          <p>Analytics content here...</p>
        </div>
      }

      @if (isAdmin()) {
        <div class="admin-panel">
          <h3>Admin Panel</h3>
          <p>Admin controls here...</p>
        </div>
      }
    </section>
  `,
})
export class PermissionDemoComponent {
  private demoPermService = inject(DemoPermissionsService);

  protected readonly canEdit = computed(() =>
    this.demoPermService.hasPermission('can-edit-posts')
  );

  protected readonly canDelete = computed(() =>
    this.demoPermService.hasPermission('can-delete-posts')
  );

  protected readonly canManageUsers = computed(() =>
    this.demoPermService.hasPermission('can-manage-users')
  );

  protected readonly canViewAnalytics = computed(() =>
    this.demoPermService.hasPermission('can-view-analytics')
  );

  protected readonly isAdmin = computed(() =>
    this.demoPermService.hasPermission('is-admin')
  );
}
```

---

## Documentation Plan

### Root README.md Updates

Add to "Available Tools" section:

```markdown
### Permissions Tool

Test permission-based UI and access control without backend changes.

**Icon**: 🔐 (users icon)

#### Configuration
```typescript
import { DevToolbarPermissionsService } from 'ngx-dev-toolbar';

export class AppComponent {
  private permissionsService = inject(DevToolbarPermissionsService);

  constructor() {
    this.permissionsService.setAvailableOptions([
      {
        id: 'can-edit-posts',
        name: 'Can Edit Posts',
        description: 'Allows editing published posts',
        isGranted: false,
        isForced: false
      },
    ]);
  }
}
```

#### Usage
```typescript
// React to forced permissions
this.permissionsService.getForcedValues()
  .pipe(takeUntilDestroyed())
  .subscribe(forcedPerms => {
    // Apply permission overrides
  });
```

### Tools README.md (NEW)

Create `libs/ngx-dev-toolbar/src/tools/README.md`:

**Structure**:
1. Overview of all tools
2. Tool architecture patterns
3. Per-tool API documentation
   - Permissions Tool
   - Feature Flags Tool
   - Language Tool
   - Home Tool
4. Creating custom tools guide
5. Preset integration reference

**Content**: Complete API documentation with TypeScript signatures, usage examples (basic + advanced), data models, edge cases, and troubleshooting.

---

## Testing Strategy

### Unit Tests

**Files to create**:
- `permissions-internal.service.spec.ts`
- `permissions.service.spec.ts`
- `permissions-tool.component.spec.ts`

**Coverage targets**:
- Internal service: >80%
- Public service: >80%
- Component: >70%

**Test scenarios**:
1. Service initialization and state loading
2. Setting and removing permission overrides
3. localStorage persistence
4. Preset integration methods
5. Combining app + forced permissions
6. Component filtering and search
7. Empty state handling

### Integration Tests

Test the full flow:
1. Configure permissions via public service
2. Force permission in UI
3. Verify forced value emitted
4. Verify localStorage updated
5. Reload and verify persistence

### E2E Tests (Playwright)

**File**: `apps/ngx-dev-toolbar-demo-e2e/src/permissions-tool.spec.ts`

**Scenarios**:
1. Open permissions tool and force permission to granted
2. Verify demo UI shows permission-dependent element
3. Force permission to denied
4. Verify demo UI hides element
5. Clear forced state
6. Verify demo UI returns to default state
7. Refresh page and verify persistence

---

## Implementation Order

### Phase 0: Research ✅ COMPLETED
- Analyzed existing patterns
- Documented architecture
- Created knowledge base

### Phase 1: Design & Contracts (Current Phase)
1. Create `data-model.md` with entity definitions
2. Create `contracts/permissions-api.ts` with API contracts
3. Create `quickstart.md` with integration guide
4. Run `.specify/scripts/bash/update-agent-context.sh claude` to update agent context

### Phase 2: Tasks Generation (Next via `/speckit.tasks`)
Will generate detailed implementation tasks based on:
- FR-001 to FR-022 (functional requirements)
- User stories (P1, P2, P3)
- Constitution compliance
- Testing requirements

### Phase 3: Implementation (via `/speckit.implement`)
Implementation tasks will be executed in priority order:
1. P1: Core functionality (models, services, component)
2. P1: Demo app integration
3. P1: Documentation
4. P2: Search and filter
5. P3: Empty states and polish

---

## Success Criteria Checklist

### Tool Performance
- [ ] SC-001: Configure + force permissions in <30 seconds
- [ ] SC-002: 100% persistence reliability across refreshes
- [ ] SC-003: Search <100ms for 100+ permissions
- [ ] SC-004: Zero delay on forced value emission
- [ ] SC-005: All constitution principles followed, >80% test coverage
- [ ] SC-006: Bundle size <5KB gzipped

### Demo App Quality
- [ ] SC-007: Zero console errors in demo
- [ ] SC-008: UI responds in <100ms to permission changes
- [ ] SC-009: 90% of developers can integrate without help

### Documentation Quality
- [ ] SC-010: All public APIs documented with TypeScript signatures
- [ ] SC-011: At least 2 complete usage examples
- [ ] SC-012: Integration possible following docs only
- [ ] SC-013: All edge cases documented

---

## Related Documentation

- **Spec**: `specs/001-permissions-tool/spec.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Service Architecture**: `knowledge/project/patterns/service-architecture.md`
- **Component Hierarchy**: `knowledge/project/patterns/component-hierarchy.md`
- **Angular Patterns**: `knowledge/code-style/angular-patterns.md`
- **Tool Guide**: `knowledge/project/TOOLBAR_TOOL_GUIDE.md`

---

**Version**: 1.0
**Status**: Phase 0 Complete, Phase 1 In Progress
**Next**: Create `data-model.md`, `contracts/`, `quickstart.md`
