# Research: Toolbar Positioning & Hide Shortcut

## R1: Position-Dependent Animations

**Decision**: Use Angular's `@toolbarState` animation trigger with position-aware transforms.

**Rationale**: The current animation uses `translate(-50%, calc(100% + -1.2rem))` for the hidden state
(slides down off screen) and `translate(-50%, -1rem)` for visible (slides up). Each position needs
its own hidden/visible transform pair:

| Position | Axis | Hidden Transform | Visible Transform |
|----------|------|-----------------|-------------------|
| bottom | Y | `translateX(-50%) translateY(calc(100% + 8px))` | `translateX(-50%) translateY(-1rem)` |
| top | Y | `translateX(-50%) translateY(calc(-100% - 8px))` | `translateX(-50%) translateY(1rem)` |
| left | X | `translateY(-50%) translateX(calc(-100% - 8px))` | `translateY(-50%) translateX(1rem)` |
| right | X | `translateY(-50%) translateX(calc(100% + 8px))` | `translateY(-50%) translateX(-1rem)` |

**Approach**: Since Angular animations use `trigger` + `state` which are static, we'll handle the
show/hide animation via CSS transitions on the host element instead. This allows dynamic position
changes without recreating animation triggers. The `[@toolbarState]` trigger will be replaced with
CSS classes.

**Alternatives considered**:
- Multiple animation triggers (one per position): Overly complex, duplicated animation code
- Angular animation params: Possible but awkward with position-dependent transform strings

## R2: CDK Overlay Positioning per Toolbar Position

**Decision**: Compute `ConnectedPosition[]` dynamically based on `ToolbarPosition`.

**Rationale**: `ToolbarToolComponent` currently hardcodes overlay to open above the toolbar
(negative `offsetY`, centered `offsetX`). Each toolbar position needs different overlay placement:

| Toolbar Position | Overlay Opens | Origin Y | Overlay Y | Primary Offset |
|-----------------|---------------|----------|-----------|----------------|
| bottom | above | top | bottom | offsetY: negative |
| top | below | bottom | top | offsetY: positive |
| left | right | center | center | offsetX: positive |
| right | left | center | center | offsetX: negative |

The `positions()` computed signal in `ToolbarToolComponent` already computes positions dynamically.
It needs to read `state.position()` and switch logic accordingly.

## R3: Keyboard Shortcut — Cmd+. / Ctrl+.

**Decision**: Add `Meta+.` (macOS) / `Ctrl+.` (Windows/Linux) to toggle complete toolbar hide/show.

**Rationale**: `Cmd+.` is a common macOS convention for "cancel/dismiss" (used by Finder, Terminal).
This is distinct from the existing `Ctrl+Shift+D` which toggles toolbar reveal (peek behavior).
The new shortcut completely hides the toolbar so it's invisible and non-interactive.

**Implementation**: Add a second `fromEvent<KeyboardEvent>` subscription in `toolbar.component.ts`
that checks for `(event.metaKey || event.ctrlKey) && event.key === '.'`. This toggles a new
`isCompletelyHidden` signal in `ToolbarStateService`.

**State distinction**:
- `isHidden` (existing): Toolbar is "peeked away" but can be revealed on hover — normal auto-hide
- `isCompletelyHidden` (new): Toolbar is fully hidden, no hover reveal, only shortcut brings it back

## R4: Position Persistence

**Decision**: Store position in `SettingsService` using existing `ToolbarStorageService`.

**Rationale**: The `Settings` interface currently has `isDarkMode: boolean`. Adding
`position: ToolbarPosition` follows the same pattern. The `SettingsService` already reads/writes
to `AngularToolbar.settings` in localStorage.

**Alternatives considered**:
- Separate localStorage key: Unnecessary fragmentation, settings already has a pattern
- ToolbarConfig only (no persistence): Poor DX — user has to re-select position after every reload

## R5: Config vs. User Preference Priority

**Decision**: `ToolbarConfig.position` (from `provideToolbar()`) sets the initial default.
User preference in localStorage overrides it. If config changes, the new config value takes
precedence (treats it as an intentional developer override).

**Rationale**: This matches how browsers handle preferences — the app suggests defaults, user
customization overrides them, but explicit code changes reset preferences.

**Implementation priority**:
1. `ToolbarConfig.position` (if provided) — developer intent
2. localStorage `Settings.position` (if no config override) — user preference
3. `'bottom'` — hardcoded default
