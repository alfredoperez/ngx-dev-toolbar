# Research: Tool Badges and UX Improvements

**Feature**: 005-badges-each-tools
**Date**: 2025-12-29

## Research Questions

### Q1: How to add badge input to tool-button component?

**Decision**: Add optional `badge` input to `DevToolbarToolButtonComponent` and render in template when provided.

**Rationale**:
- The CSS class `.tool-button__badge` already exists in `tool-button.component.scss:40-54` with proper positioning, colors, and responsive sizing
- Following the existing pattern: `readonly title = input.required<string>()` but using `readonly badge = input<string>()` (optional)
- Badge HTML will be conditionally rendered with `@if (badge())` in the template
- Display "99+" when count exceeds 99 per FR-005

**Alternatives considered**:
- Adding badge to `DevToolbarToolComponent` instead: Rejected because the badge CSS is in `tool-button.component.scss` and the badge is logically part of the button, not the tool wrapper
- Using a separate badge component: Rejected as over-engineering for a simple conditional element

**Implementation approach**:
```typescript
// tool-button.component.ts
readonly badge = input<string>(); // Optional badge content

// In template, after <ng-content />:
@if (badge()) {
  <span class="tool-button__badge">{{ badge() }}</span>
}
```

---

### Q2: How to compute badge count from forced values in each tool?

**Decision**: Add computed signal in each tool component using `getCurrentForcedState()` from internal service.

**Rationale**:
- All three internal services (`feature-flags-internal.service.ts`, `permissions-internal.service.ts`, `app-features-internal.service.ts`) already expose `getCurrentForcedState()` method
- Feature Flags: `state.enabled.length + state.disabled.length`
- Permissions: `state.granted.length + state.denied.length`
- App Features: `state.enabled.length + state.disabled.length`
- Using computed signal ensures reactivity when state changes
- Pattern already demonstrated in presets-tool (`getCurrentFlagsCount()`)

**Alternatives considered**:
- Subscribing to observable: Rejected because signals are preferred per constitution and provide better change detection
- Creating a shared badge count service: Rejected as unnecessary abstraction for 3 simple computed values

**Implementation approach**:
```typescript
// In feature-flags-tool.component.ts
private readonly featureFlagsInternal = inject(DevToolbarInternalFeatureFlagService);

protected readonly badgeCount = computed(() => {
  const state = this.featureFlagsInternal.getCurrentForcedState();
  const count = state.enabled.length + state.disabled.length;
  return count > 99 ? '99+' : count > 0 ? count.toString() : '';
});
```

---

### Q3: How to pass badge from tool component to tool-button?

**Decision**: Add `badge` input to `DevToolbarToolComponent` which passes it through to `DevToolbarToolButtonComponent`.

**Rationale**:
- Each tool component uses `<ndt-toolbar-tool>` wrapper which internally renders `<ndt-tool-button>`
- The badge must flow: Tool Component → DevToolbarToolComponent → DevToolbarToolButtonComponent
- Both components need a `badge` input to pass the value through

**Implementation approach**:
```typescript
// toolbar-tool.component.ts
readonly badge = input<string>(); // Add optional badge input

// In template:
<ndt-tool-button [title]="title()" [toolId]="options().id" [badge]="badge()">
```

```typescript
// In feature-flags-tool.component.ts template:
<ndt-toolbar-tool
  [options]="options"
  title="Feature Flags"
  icon="toggle-left"
  [badge]="badgeCount()"
>
```

---

### Q4: How to persist search/filter/sort state per tool?

**Decision**: Store view state in localStorage using existing `DevToolsStorageService` with tool-specific keys.

**Rationale**:
- `DevToolsStorageService` already handles prefixing (`AngularDevTools.`), JSON serialization, and tool key tracking
- Each tool can have its own view state key: `feature-flags-view`, `permissions-view`, `app-features-view`
- State persisted: `{ searchQuery: string, filter: string, sortOrder: 'asc' | 'desc' }`
- Reusing existing service follows Simplicity First principle

**Alternatives considered**:
- Creating a new view state service: Rejected as unnecessary when storage service exists
- Storing in component state only: Rejected because state wouldn't persist across page refreshes
- Storing all view states in single key: Rejected because independent keys are simpler to manage

**Implementation approach**:
```typescript
// In feature-flags-tool.component.ts
private readonly VIEW_STATE_KEY = 'feature-flags-view';

constructor() {
  this.loadViewState();
  effect(() => this.saveViewState());
}

private loadViewState(): void {
  const saved = this.storageService.get<ToolViewState>(this.VIEW_STATE_KEY);
  if (saved) {
    this.searchQuery.set(saved.searchQuery ?? '');
    this.activeFilter.set(saved.filter ?? 'all');
  }
}

private saveViewState(): void {
  this.storageService.set(this.VIEW_STATE_KEY, {
    searchQuery: this.searchQuery(),
    filter: this.activeFilter(),
  });
}
```

---

### Q5: How should "Clear All Settings" handle view state?

**Decision**: `DevToolsStorageService.clearAllSettings()` already clears all tool keys, view state keys will be automatically cleared.

**Rationale**:
- `clearAllSettings()` iterates through `getToolKeys()` and removes all stored keys
- View state keys will be tracked in the same keys list via `addToolKey()`
- No additional code needed - existing mechanism handles this case

**Verification**:
- `clearAllSettings()` in `storage.service.ts:47-52` removes all keys tracked in `TOOLS_KEY`
- Any key stored via `set()` is automatically added to the tracked keys

---

### Q6: What should happen with corrupted localStorage data?

**Decision**: Reset to defaults and continue without error.

**Rationale**:
- Per edge case in spec: "How does system handle corrupted localStorage data? Reset to defaults and continue without error"
- Existing services already implement this pattern with try/catch and fallback (see `permissions-internal.service.ts:126-138`)
- View state persistence should follow same pattern

**Implementation approach**:
```typescript
private loadViewState(): void {
  try {
    const saved = this.storageService.get<ToolViewState>(this.VIEW_STATE_KEY);
    if (saved && this.isValidViewState(saved)) {
      this.searchQuery.set(saved.searchQuery ?? '');
      this.activeFilter.set(saved.filter ?? 'all');
    }
  } catch (error) {
    console.warn('Error loading view state, using defaults');
    // Defaults already set in signal initialization
  }
}

private isValidViewState(state: unknown): state is ToolViewState {
  return typeof state === 'object' && state !== null;
}
```

---

### Q7: npm README markdown best practices?

**Decision**: Use pure markdown without HTML tags. Keep under 200 lines per FR-021.

**Rationale**:
- npm renders markdown using a basic parser that handles HTML inconsistently
- HTML tables render but may have styling issues
- Per FR-016: "README MUST render correctly on npm website without raw HTML tags visible"
- Per FR-020: "README MUST NOT contain HTML markup"

**Key changes needed for current README**:
1. Remove `<div align="center">` wrappers (lines 3, 21-52, 356-398)
2. Replace HTML table with markdown table or bullet list
3. Remove `<details><summary>` tags (lines 91-114)
4. Remove emoji shortcodes from headers that may not render
5. Keep badges (they're images, not HTML)
6. Link to external documentation for detailed tool examples

**Target structure** (under 200 lines):
```markdown
# Angular Dev Toolbar
[badges]

A development toolbar for Angular 19+ apps...

## Installation
npm install ngx-dev-toolbar --save-dev

## Quick Start
[basic example]

## Available Tools
- Feature Flags - toggle feature flags
- Permissions - test permission-based UI
- App Features - test product features
- Language Switcher - switch languages
- Presets - save/restore configurations
- Network Mocker - mock HTTP requests

## Documentation
[link to full docs]

## License
MIT
```

---

## Summary

All research questions resolved. Key findings:

| Area | Decision | Complexity |
|------|----------|------------|
| Badge rendering | Add `badge` input to tool-button, use existing CSS | Low |
| Badge count | Computed signal from `getCurrentForcedState()` | Low |
| Badge flow | Pass through toolbar-tool to tool-button | Low |
| View state persistence | Reuse `DevToolsStorageService` with new keys | Low |
| Clear settings | Existing mechanism handles it | None |
| Corrupted data | Try/catch with defaults fallback | Low |
| README | Remove HTML, keep under 200 lines | Low |

No NEEDS CLARIFICATION items remain. Ready for Phase 1 design.
