# Technical Stack

**Last Updated**: 2025-10-12
**Project**: ngx-dev-toolbar

---

## Core Framework

### Angular
- **Version**: 19.0+
- **Architecture**: Standalone components (no NgModules)
- **Change Detection**: OnPush strategy (mandatory)
- **State Management**: Angular Signals (primary), RxJS (interop only)
- **Forms**: Reactive Forms with typed controls

### TypeScript
- **Version**: 5.4+
- **Mode**: Strict mode enabled
- **Target**: ES2022
- **Module**: ESNext

---

## Dependencies

### Angular Ecosystem
```json
{
  "@angular/core": "^19.0.0",
  "@angular/common": "^19.0.0",
  "@angular/cdk": "^19.0.0",
  "@angular/platform-browser": "^19.0.0"
}
```

### Reactive Programming
```json
{
  "rxjs": "^7.8.0"
}
```

### Internationalization (Planned)
```json
{
  "@jsverse/transloco": "^7.0.0"
}
```

---

## Development Tools

### Build System
- **Tool**: Nx
- **Version**: 20.3+
- **Configuration**: `nx.json`, `project.json`
- **Commands**:
  - Build: `nx build ngx-dev-toolbar`
  - Test: `nx test ngx-dev-toolbar`
  - Lint: `nx lint ngx-dev-toolbar`
  - Serve demo: `nx serve ngx-dev-toolbar-demo`

### Testing Framework
- **Unit/Integration**: Jest
- **E2E**: Playwright
- **Coverage Target**: >80% services, >70% components

### Code Quality
- **Linter**: ESLint with Angular rules
- **Formatter**: Prettier
- **Git Hooks**: Husky (pre-commit validation)

---

## Release & Versioning

### Version Management
- **Tool**: Nx Release
- **Strategy**: Conventional Commits
- **Triggers**:
  - `feat:` → Minor version bump
  - `fix:` → Patch version bump
  - `cleanup:`, `refactor:` → Patch version bump
  - `docs:` → No release

### Package Distribution
- **Registry**: npm
- **Package Name**: `ngx-dev-toolbar`
- **Pre-release Command**: `npm run package`
- **Build Artifact**: `dist/libs/ngx-dev-toolbar/`

---

## Browser Support

### Target Browsers
- **Chrome/Edge**: Last 2 versions
- **Firefox**: Last 2 versions
- **Safari**: Last 2 versions
- **Mobile**: iOS Safari 15+, Chrome Android

### Polyfills
- None required (ES2022+ supported natively in target browsers)

---

## Performance Targets

### Bundle Size
- **Per Tool**: <5KB gzipped
- **Core Library**: <15KB gzipped
- **Total with all tools**: <50KB gzipped

### Runtime Performance
- **Initial toolbar render**: <100ms
- **Tool switching transition**: <50ms
- **State updates**: <16ms (60fps)
- **Search filtering**: <100ms for 100+ items

---

## Storage & Persistence

### Client-Side Storage
- **Primary**: localStorage
- **Abstraction**: `DevToolsStorageService`
- **Key Prefix**: `AngularDevTools.`
- **Serialization**: JSON
- **Quota Handling**: Graceful degradation to in-memory

---

## Development Mode Detection

### Angular Development Mode
```typescript
import { isDevMode } from '@angular/core';

if (isDevMode()) {
  // Toolbar visible by default
}
```

### Production Opt-In
```typescript
// Manual enable in production (opt-in only)
<ndt-toolbar [enableInProduction]="true"></ndt-toolbar>
```

---

## Accessibility Standards

### WCAG Compliance
- **Target**: WCAG 2.1 Level AA
- **Requirements**:
  - All interactive elements have aria-labels
  - Keyboard navigation support
  - Focus management
  - Screen reader compatibility
  - Proper semantic HTML

---

## CSS & Styling

### Design System
- **Approach**: CSS Custom Properties (CSS Variables)
- **Prefix**: `--ndt-*`
- **Theme Support**: Light/Dark via `data-theme` attribute
- **Methodology**: Component-scoped styles (Shadow DOM encapsulation)

### Responsive Design
- **Approach**: Flexbox layouts
- **Breakpoints**: None (fixed toolbar UI)
- **Scrolling**: Virtualized for long lists (future enhancement)

---

## Internationalization (i18n)

### Current State
- **Status**: English only (Phase 1)
- **Planned**: Multi-language support via Transloco

### Future Implementation
```typescript
// Planned pattern
this.translocoService.setActiveLang(language.id);
```

---

## Security Considerations

### Production Safety
- **Disabled by default** in production mode
- **Zero impact** on production bundle when not used
- **No sensitive data** stored in localStorage
- **No external API calls** from toolbar

### Development Safety
- **Isolated state**: Toolbar state doesn't affect app state
- **Non-invasive**: Tools observe and override, don't mutate app code
- **Reversible**: All overrides can be cleared instantly

---

## Monorepo Structure

### Workspace Layout
```
ngx-dev-toolbar/
├── libs/
│   └── ngx-dev-toolbar/          # Main library
│       ├── src/
│       ├── project.json
│       └── package.json
├── apps/
│   ├── ngx-dev-toolbar-demo/     # Demo application
│   ├── documentation/             # Documentation site
│   └── ngx-dev-toolbar-demo-e2e/ # E2E tests
├── nx.json                        # Nx configuration
└── package.json                   # Workspace dependencies
```

### Build Targets
- **Library**: `nx build ngx-dev-toolbar`
- **Demo App**: `nx serve ngx-dev-toolbar-demo`
- **Docs**: `nx serve documentation`
- **E2E**: `nx e2e ngx-dev-toolbar-demo-e2e`

---

## Related Documentation

- **Architecture**: See `knowledge/project/core/architecture.md`
- **Angular Patterns**: See `knowledge/code-style/angular-patterns.md`
- **Service Architecture**: See `knowledge/project/patterns/service-architecture.md`
