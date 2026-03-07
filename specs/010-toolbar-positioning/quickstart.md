# Quickstart: Toolbar Positioning

## Default (no changes needed)

The toolbar defaults to the bottom edge. Existing setups work unchanged:

```typescript
provideToolbar({ enabled: isDevMode() })
```

## Set Initial Position via Config

```typescript
provideToolbar({
  enabled: isDevMode(),
  position: 'left',  // 'top' | 'right' | 'bottom' | 'left'
})
```

## User Runtime Control

1. Click the Home (Angular) icon in the toolbar
2. Select a position from the position selector (top/right/bottom/left)
3. Position persists across page reloads via localStorage

## Keyboard Shortcuts

| Shortcut | macOS | Windows/Linux | Action |
|----------|-------|---------------|--------|
| Toggle visibility | Ctrl+Shift+D | Ctrl+Shift+D | Peek toolbar in/out (existing) |
| Hide completely | Cmd+. | Ctrl+. | Fully hide toolbar; press again to show |

## Verification

After implementing, verify:

1. Toolbar renders at bottom by default
2. `provideToolbar({ position: 'right' })` renders on right edge
3. Changing position in Home tool UI persists after reload
4. Cmd+. hides toolbar completely; Cmd+. again restores it
5. Ctrl+Shift+D still works for peek behavior
6. Tool windows open in correct direction relative to toolbar position
