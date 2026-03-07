# Data Model: Toolbar Positioning & Hide Shortcut

## Entities

### ToolbarPosition (new type)

```typescript
type ToolbarPosition = 'top' | 'right' | 'bottom' | 'left';
```

A string union representing the four edges of the viewport where the toolbar
can be anchored. Default: `'bottom'`.

Helper constants:

```typescript
const TOOLBAR_POSITIONS: readonly ToolbarPosition[] = ['top', 'right', 'bottom', 'left'];

function isHorizontalPosition(pos: ToolbarPosition): boolean {
  return pos === 'top' || pos === 'bottom';
}
```

### Settings (modified)

```typescript
interface Settings {
  isDarkMode: boolean;
  position: ToolbarPosition;  // NEW — default: 'bottom'
}
```

### ToolbarConfig (modified)

```typescript
interface ToolbarConfig {
  enabled?: boolean;
  position?: ToolbarPosition;  // NEW — optional, default: 'bottom'
  showLanguageTool?: boolean;
  showFeatureFlagsTool?: boolean;
  showAppFeaturesTool?: boolean;
  showPermissionsTool?: boolean;
  showPresetsTool?: boolean;
}
```

### ToolbarState (modified — internal)

```typescript
interface ToolbarState {
  isHidden: boolean;
  isCompletelyHidden: boolean;  // NEW — toggled by Cmd+.
  position: ToolbarPosition;    // NEW — current position
  activeToolId: string | null;
  error: string | null;
  theme: 'light' | 'dark';
  delay: number;
  config: ToolbarConfig;
}
```

## State Transitions

### Position Change

```
User clicks position option in Home tool
  → SettingsService.setSettings({ ...settings, position })
  → ToolbarStateService.setPosition(position)
  → toolbar.component re-renders with new CSS class
  → ToolbarToolComponent overlay positions recalculate
```

### Complete Hide Toggle (Cmd+.)

```
User presses Cmd+. (or Ctrl+.)
  → ToolbarStateService.toggleCompletelyHidden()
  → isCompletelyHidden signal flips
  → toolbar.component hides entirely (@if guard)
  → No hover reveal possible until shortcut pressed again
```

### Priority Resolution (position)

```
1. ToolbarConfig.position (if set) → always wins
2. Settings.position (localStorage) → user preference
3. 'bottom' → hardcoded fallback
```
