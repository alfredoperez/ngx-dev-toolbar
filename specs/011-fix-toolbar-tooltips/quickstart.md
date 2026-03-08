# Quickstart: Fix Toolbar Tooltips

**Branch**: `011-fix-toolbar-tooltips`

## How to Verify

### 1. Start the demo app

```bash
nx serve ngx-dev-toolbar-demo
```

### 2. Test single tooltip (FR-001, FR-002)

- Hover over any tool icon in the toolbar
- Verify only ONE tooltip appears (no native browser tooltip underneath)
- Check that the tooltip shows the tool's name

### 3. Test tooltip positioning & arrow (FR-003, FR-004, FR-008)

- Hover over a tool icon — tooltip should appear **directly adjacent** to the toolbar (small gap, not floating far away)
- Verify the tooltip has a small **arrow/caret pointing toward the icon**
- Open the Home tool → change toolbar position to each edge (top, bottom, left, right)
- Verify tooltip appears on the correct side with the arrow pointing toward the toolbar in each position

### 4. Test inverted color scheme (FR-009)

- In light theme (default): tooltip should have a **dark background with light text**
- The tooltip should clearly stand out against the toolbar's light background

### 5. Test hover containment (FR-005)

- Hover over the **first** and **last** tool icons in the toolbar
- Verify the hover background does not extend beyond the toolbar's rounded corners

### 6. Test peeking state (FR-007)

- Move mouse away from toolbar and wait for it to retract (peek state)
- Hover over the peeking toolbar area — tooltips should NOT appear until the toolbar is fully visible

### 7. Test active tool (FR-006)

- Click a tool icon to open its window
- Hover over that same icon — no tooltip should appear for the active tool

## Run Tests

```bash
nx test ngx-dev-toolbar
nx e2e ngx-dev-toolbar-demo-e2e
```
