# Quickstart: Tool Badges and UX Improvements

**Feature**: 005-badges-each-tools
**Date**: 2025-12-29

## Overview

This feature adds three improvements to the ngx-dev-toolbar:

1. **Badges on Tool Buttons**: Visual indicator showing count of forced values
2. **Persisted View State**: Search, filter, and sort preferences saved per tool
3. **Simplified README**: Markdown-only content for npm rendering

## Implementation Sequence

### Phase 1: Badge Infrastructure (P1)

**Step 1.1**: Add badge input to `DevToolbarToolButtonComponent`

```typescript
// libs/ngx-dev-toolbar/src/components/tool-button/tool-button.component.ts
readonly badge = input<string>(); // Add this input

// In template, after <ng-content />:
@if (badge()) {
  <span class="tool-button__badge">{{ badge() }}</span>
}
```

**Step 1.2**: Add badge input to `DevToolbarToolComponent`

```typescript
// libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts
readonly badge = input<string>();

// In template, update ndt-tool-button:
<ndt-tool-button [title]="title()" [toolId]="options().id" [badge]="badge()">
```

**Step 1.3**: Add badge count to Feature Flags tool

```typescript
// libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts

// Add signal for reactive badge count
protected readonly badgeCount = computed(() => {
  const state = this.featureFlags.getCurrentForcedState();
  const count = state.enabled.length + state.disabled.length;
  if (count === 0) return '';
  if (count > 99) return '99+';
  return count.toString();
});

// Update template:
<ndt-toolbar-tool
  [options]="options"
  title="Feature Flags"
  icon="toggle-left"
  [badge]="badgeCount()"
>
```

**Step 1.4**: Repeat for Permissions and App Features tools

Same pattern, using `granted.length + denied.length` for Permissions.

### Phase 2: View State Persistence (P2)

**Step 2.1**: Create ToolViewState interface

```typescript
// libs/ngx-dev-toolbar/src/models/tool-view-state.models.ts
export interface ToolViewState {
  searchQuery: string;
  filter: string;
  sortOrder: 'asc' | 'desc';
}
```

**Step 2.2**: Add persistence to Feature Flags tool

```typescript
// libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts

private readonly storageService = inject(DevToolsStorageService);
private readonly VIEW_STATE_KEY = 'feature-flags-view';

constructor() {
  this.loadViewState();

  // Save view state on changes
  effect(() => {
    const state: ToolViewState = {
      searchQuery: this.searchQuery(),
      filter: this.activeFilter(),
      sortOrder: 'asc',
    };
    this.storageService.set(this.VIEW_STATE_KEY, state);
  });
}

private loadViewState(): void {
  try {
    const saved = this.storageService.get<ToolViewState>(this.VIEW_STATE_KEY);
    if (saved) {
      this.searchQuery.set(saved.searchQuery ?? '');
      this.activeFilter.set((saved.filter as FeatureFlagFilter) ?? 'all');
    }
  } catch {
    // Use defaults on error
  }
}
```

**Step 2.3**: Repeat for Permissions and App Features tools

Same pattern with tool-specific storage keys.

### Phase 3: README Simplification (P3)

**Step 3.1**: Rewrite README.md

Remove all HTML tags (`<div>`, `<table>`, `<details>`, etc.) and replace with markdown equivalents. Keep under 200 lines.

Target structure:
- Title + badges
- One-line description
- Installation
- Quick Start (basic example)
- Available Tools (bullet list)
- Link to documentation
- License

## Testing Checklist

### Badges (P1)

- [ ] Feature Flags badge shows correct count
- [ ] Permissions badge shows correct count
- [ ] App Features badge shows correct count
- [ ] Badge hidden when count is 0
- [ ] Badge shows "99+" when count exceeds 99
- [ ] Badge updates immediately when forcing/unforcing values
- [ ] Badge shows correct count on page refresh

### View State Persistence (P2)

- [ ] Search query persists when closing and reopening tool
- [ ] Filter selection persists when closing and reopening tool
- [ ] Settings persist after page refresh
- [ ] Each tool maintains independent state
- [ ] "Clear All Settings" resets view state to defaults
- [ ] Corrupted localStorage data handled gracefully

### README (P3)

- [ ] No HTML tags in README
- [ ] README under 200 lines
- [ ] Renders correctly on npm website
- [ ] Contains installation instructions
- [ ] Contains basic usage example
- [ ] Links to documentation

## Files to Modify

| File | Changes |
|------|---------|
| `tool-button.component.ts` | Add `badge` input, render badge in template |
| `toolbar-tool.component.ts` | Add `badge` input, pass to tool-button |
| `feature-flags-tool.component.ts` | Add badge count computed, add view state persistence |
| `permissions-tool.component.ts` | Add badge count computed, add view state persistence |
| `app-features-tool.component.ts` | Add badge count computed, add view state persistence |
| `tool-view-state.models.ts` | New file: ToolViewState interface |
| `README.md` | Rewrite with markdown only |
| `index.ts` | Export ToolViewState if needed |

## Success Metrics

Per spec success criteria:

- **SC-001**: Badges visible on toolbar without opening tools
- **SC-002**: Badge updates within 100ms of change
- **SC-003**: View state persists across page refreshes
- **SC-004**: README renders correctly on npm
- **SC-005**: Installation instructions findable within 10 seconds
- **SC-006**: Zero HTML tags in README
- **SC-007**: All three tools maintain independent view state
