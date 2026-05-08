# Continuation Plan — Impeccable Streaming Redesign

> Picking up after a laptop reset. **Read top-to-bottom before touching code.**
> Last session ended with the demo app rendering blank in the browser — root cause unconfirmed.

---

## ⚠️ Status card

| Field | Value |
|---|---|
| Phase | 1, 2, 3 done · Phase 4 (demo redesign) **broken at runtime** |
| Builds | Library builds clean. Demo builds clean. **Browser is blank with no console errors.** |
| Bisect state | Custom tool stripped to **empty state + simple composer**, no `<ndt-stream-runner>` consumption |
| Last known good behavior | The OLD tabs+create custom tool rendered fine even with sidebar position active |
| Last known broken behavior | New custom-tool with sidebar position → blank app, no console output |
| Files staged in git | None yet. Everything is uncommitted on `main`. |
| Branch | `main` (recommend creating a feature branch — see below) |

---

## 🚨 BEFORE YOU RESET YOUR LAPTOP — DO THIS FIRST

If you're reading this *before* the reset, please run these so nothing is lost:

```bash
cd /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar
git checkout -b feat/impeccable-streaming-redesign
git add PRODUCT.md DESIGN.md \
  libs/ngx-dev-toolbar/src/models/toolbar-position.model.ts \
  libs/ngx-dev-toolbar/src/toolbar.component.ts \
  libs/ngx-dev-toolbar/src/toolbar.component.scss \
  libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts \
  libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.models.ts \
  libs/ngx-dev-toolbar/src/components/window/window.component.ts \
  libs/ngx-dev-toolbar/src/components/window/window.component.scss \
  libs/ngx-dev-toolbar/src/components/stream-runner/ \
  libs/ngx-dev-toolbar/src/index.ts \
  apps/ngx-dev-toolbar-demo/src/app/app.config.ts \
  apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool.component.ts \
  apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool.component.scss \
  specs/021-impeccable-streaming-redesign/

git commit -m "wip(toolbar): impeccable streaming redesign — bisecting blank-app bug

Library: sidebar-right/sidebar-left positions, compact ndt-window mode,
ndt-stream-runner primitive. Demo: custom-tool currently stripped to
empty state for bisection — see specs/021-impeccable-streaming-redesign/
CONTINUATION.md for resume instructions."

git push -u origin feat/impeccable-streaming-redesign
```

That's a WIP commit on a feature branch. The branch lives on the remote, so even a full disk wipe can't lose it. **Do NOT push to main** — this code has a runtime bug.

---

## 📋 What we're building (recap)

Redesign the demo's custom-tool into a **right-edge sidebar** with a **Cursor-style streaming generator** UX. The library gains:
- Two new `ToolbarPosition` values: `'sidebar-right'` and `'sidebar-left'`.
- A `compact` mode on `ndt-window` (auto when sidebar position).
- A footer projection slot on `ndt-window` (`<div ndt-footer>` from consumer).
- A new `ndt-stream-runner` primitive that takes `[{label, run, link, badge}]` step configs and orchestrates the streaming choreography.

The demo's custom-tool consumes all of the above: empty state with sparkle icon, leading verb chip (`Find` ↔ `Make`), structured fields (bundle dropdown + count + Generate button), streaming canvas.

Strategic context lives in `PRODUCT.md` and `DESIGN.md` at the repo root — already written, do not regenerate.

---

## 📦 Inventory of every modified or new file

After the laptop reset, run `wc -l` on each path below. Counts should match. If any file is missing or wildly different, restore from the feature branch (or recreate from the snippets later in this doc).

### Strategic docs (committed to repo root)
| File | Lines | Status |
|---|---:|---|
| `PRODUCT.md` | 55 | NEW — written during teach phase |
| `DESIGN.md` | 172 | NEW — written during teach phase |

### Library — all changes (Phases 1, 2, 3)
| File | Lines | Status |
|---|---:|---|
| `libs/ngx-dev-toolbar/src/models/toolbar-position.model.ts` | 24 | MODIFIED — added sidebar-* values + `isSidebarPosition()` helper |
| `libs/ngx-dev-toolbar/src/toolbar.component.ts` | 240 | MODIFIED — class bindings for sidebar positions |
| `libs/ngx-dev-toolbar/src/toolbar.component.scss` | 146 | MODIFIED — vertical pill, top-anchored, mirrored |
| `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.component.ts` | 233 | MODIFIED — sidebar geometry + `ngProjectAs` forward |
| `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.models.ts` | 39 | MODIFIED — `compact?: boolean` field added |
| `libs/ngx-dev-toolbar/src/components/window/window.component.ts` | 92 | MODIFIED — multi-slot template + `isCompact()` |
| `libs/ngx-dev-toolbar/src/components/window/window.component.scss` | 164 | MODIFIED — compact rules + `.ndt-footer` styles |
| `libs/ngx-dev-toolbar/src/components/stream-runner/stream-runner.component.ts` | 269 | NEW — primary primitive |
| `libs/ngx-dev-toolbar/src/components/stream-runner/stream-runner.component.scss` | 311 | NEW — choreography styles |
| `libs/ngx-dev-toolbar/src/components/stream-runner/stream-runner.models.ts` | 51 | NEW — types |
| `libs/ngx-dev-toolbar/src/index.ts` | 63 | MODIFIED — public exports |

### Demo (Phase 4 — currently in BISECT mode)
| File | Lines | Status |
|---|---:|---|
| `apps/ngx-dev-toolbar-demo/src/app/app.config.ts` | 43 | MODIFIED — added `position: 'sidebar-right'` |
| `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool.component.ts` | 129 | MODIFIED — **STRIPPED**, no stream-runner usage |
| `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool.component.scss` | 214 | NEW — empty/results/composer styles |

**Total touched: 16 files. Total lines: 2245.**

---

## 🐞 The bug (reproduce this first)

When `nx serve ngx-dev-toolbar-demo` runs and you open the app in the browser, **the entire viewport is blank** — body background applies but `<app-root>` content is missing. Console shows only `[vite] connecting...` and `[vite] connected.` — **no errors**.

Confirmed:
- ✅ Library builds clean (`nx build ngx-dev-toolbar`).
- ✅ Demo builds clean (`nx build ngx-dev-toolbar-demo --configuration=development`).
- ✅ Path mapping resolves `ngx-dev-toolbar` → `libs/ngx-dev-toolbar/src/index.ts` (source, not dist), so stale `dist/` is **not** the problem.
- ✅ The toolbar pill rendered correctly in an earlier intermediate state when sidebar position was active but the OLD custom-tool was loaded — proving Phase 1 (sidebar position) and Phase 2 (compact window) were **not** solely the cause.
- ❌ The page goes blank only after the **new custom-tool** is in place + sidebar position is active.

---

## 🔍 Things to check (run through this list in order)

When you resume:

- [ ] **Verify uncommitted state survived the reset.** `git status` should show 13 modified/new files (not counting the spec folder).
- [ ] **If files were lost,** check out the feature branch (see "Before you reset" above) or rebuild from the snippets at the bottom of this doc.
- [ ] **Library + demo both build clean.** Run both build commands (see Step 2 below). Fix any compile error before bisecting.
- [ ] **Clear all caches.** `rm -rf node_modules/.vite .nx/cache` then restart the serve.
- [ ] **Hard reload the browser.** Cmd+Shift+R, plus open devtools network tab and disable cache.
- [ ] **Check localStorage.** Run `localStorage.clear()` in browser console — persisted toolbar position takes priority over `provideToolbar({ position })` config, which can mask test changes.
- [ ] **Inspect the DOM.** With devtools open, look at `<app-root>`. Is it empty? Is it present at all? This tells us if Angular bootstrapped.
- [ ] **Check the network tab** for any module that 404s during initial load.
- [ ] **Check `nx serve` terminal output** — even if browser console is silent, the serve terminal might log a compile/build warning.
- [ ] **Walk through the bisect outcomes table** (below).

---

## 🔪 Bisection plan — exact next actions

### Step 1. Verify the working state of disk vs git

```bash
cd /Users/alfredoperez/dev/GitHub/ngx-dev-toolbar
git branch -v
git status
git diff --stat
```

If you committed to `feat/impeccable-streaming-redesign` before reset, you should be on that branch with no uncommitted changes. If files are missing, `git checkout` the branch.

### Step 2. Verify both projects still build

```bash
./node_modules/.bin/nx build ngx-dev-toolbar
./node_modules/.bin/nx build ngx-dev-toolbar-demo --configuration=development
```

Both should succeed. If they don't, fix the compile error first — bisect can't proceed otherwise.

### Step 3. Clear caches and start fresh serve

```bash
rm -rf node_modules/.vite .nx/cache
./node_modules/.bin/nx serve ngx-dev-toolbar-demo
```

Open browser, devtools open, hard reload (Cmd+Shift+R). In the browser console, run `localStorage.clear()` and refresh once more.

### Step 4. Observe outcome (the table)

| Outcome | Diagnosis | Next action |
|---|---|---|
| **Page renders, sidebar pill visible, custom tool opens with empty state + composer** | Bisect succeeded — the breakage was inside `<ndt-stream-runner>` usage or its imports. The library primitive itself is fine; consuming it from the demo was the problem. | Add streaming back **incrementally**: (1) re-import `ToolbarStreamRunnerComponent` and `StreamStep` — refresh, see if it boots; (2) add `viewChild('runner')` query — refresh; (3) re-add the `streaming` case to the `@switch` with `<ndt-stream-runner #runner>` — refresh; (4) re-add the `BUNDLES` array and `onGenerate()` handler. Stop at whichever step breaks it. |
| **Still blank** | Breakage is **not** in stream-runner. Suspects in order: (a) the `<div ndt-footer>` projection through `ngProjectAs`, (b) the `isCompact()` computed in `ndt-window`, (c) the sidebar position calculation in `toolbar-tool.component.ts`. | Strip further: (1) remove `<div ndt-footer>` block from custom-tool, refresh — if renders, the projection is the bug. (2) If still blank, change `app.config.ts` to remove `position: 'sidebar-right'`, refresh — if renders, sidebar position calculation is the bug. (3) If still blank, even reverting the sidebar position doesn't help — comment out the entire custom-tool template body, refresh — if renders, something else specific to the new component is the bug. |
| **Console shows an actual error** | Easiest case — read it and fix. | The earlier blank with no console output suggests Angular bootstrap was failing silently. If errors appear after a cache clear, they'll point at the real cause. |

### Step 5. Once the page renders, restore Phase 4 fully

When the demo's custom-tool is showing the empty state + composer, fully restore it from the feature branch's pre-bisect state. The full Phase 4 demo had:
- Three bundles defined (Billing, Retail, Onboarding) at module scope.
- `makeEntityStep` helper.
- `ToolbarStreamRunnerComponent` and `StreamStep` imported.
- `viewChild<ToolbarStreamRunnerComponent>('runner')` query.
- A `streaming` case in the `@switch` containing `<ndt-stream-runner #runner></ndt-stream-runner>`.
- `onGenerate()` async method calling `runner.start({ title, preamble, steps })`.
- Composer with bundle select + numeric count input + Generate button (in addition to the Find branch).

If the feature branch was lost too, see "Recovery snippets" at the bottom of this doc.

---

## 🤔 Likely root causes — informed guesses

In order of plausibility (highest first):

### 1. The `<div ndt-footer>` consumer attribute paired with `ngProjectAs="[ndt-footer]"`

Multi-slot transitive projection through an intermediate component (`ndt-toolbar-tool` → `ndt-window`) is one of Angular's gnarliest features. The chain is:

Consumer (custom-tool):
```html
<ndt-toolbar-tool ...>
  <div class="canvas">...</div>
  <div ndt-footer class="composer">...</div>
</ndt-toolbar-tool>
```

Library wrapper (toolbar-tool.component.ts):
```html
<ndt-window ...>
  <ng-content />
  <ng-content select="[ndt-footer]" ngProjectAs="[ndt-footer]" />
</ndt-window>
```

Library window:
```html
<div class="ndt-content"><ng-content></ng-content></div>
<div class="ndt-footer"><ng-content select="[ndt-footer]"></ng-content></div>
```

If `ngProjectAs` on `<ng-content>` doesn't have the effect we want at compile time, the matching content might be silently dropped or routed to the wrong slot — causing the entire window content to fail to render.

**Diagnostic test:** remove `<div ndt-footer>` from the custom-tool template entirely. If page renders, this projection chain is the bug.

**Alternate fix #1:** wrap with `ng-container`:
```html
<ndt-window>
  <ng-content />
  <ng-container ngProjectAs="[ndt-footer]">
    <ng-content select="[ndt-footer]" />
  </ng-container>
</ndt-window>
```

**Alternate fix #2 (recommended):** drop the library footer slot. Have the consumer manage canvas + composer as a single flex column inside one default projection slot:
```html
<ndt-toolbar-tool ...>
  <div class="shell">
    <div class="canvas">...</div>
    <div class="composer">...</div>
  </div>
</ndt-toolbar-tool>
```
```scss
.shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.canvas { flex: 1; min-height: 0; overflow: auto; }
.composer { flex-shrink: 0; }
```
Simpler and definitely works. Cost: bottom-input pattern isn't a library primitive.

### 2. The `viewChild()` typed signal query

`viewChild<ToolbarStreamRunnerComponent>('runner')` may be the wrong overload — the correct shape might be `viewChild('runner', { read: ToolbarStreamRunnerComponent })` or just `viewChild(ToolbarStreamRunnerComponent)`. **Currently NOT in the bisect path** since stream-runner usage is removed. But re-introduce carefully when restoring Phase 4.

### 3. Compact mode `isCompact()` triggering on mount

The computed reads `this.config().compact` and `this.devToolbarStateService.position()`. If `config()` is somehow undefined at first evaluation, undefined access could throw. Less likely (Angular guarantees inputs bound before evaluation), but possible.

### 4. Sidebar position math throwing on empty triggerRect

When the toolbar pill's button container hasn't been measured yet, `getButtonContainerRect()` returns undefined. The position computation handles this with `?? ...` fallbacks, so probably fine — but worth re-reading.

---

## 🛟 Recovery snippets (if branch was lost)

If the feature branch was lost in the reset and you have to rebuild from scratch, these are the critical pieces. The full content of every file is in the conversation history of this redesign, but the most load-bearing ones are below.

### `libs/ngx-dev-toolbar/src/models/toolbar-position.model.ts`

```typescript
export type ToolbarPosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'sidebar-right'
  | 'sidebar-left';

export const TOOLBAR_POSITIONS: readonly ToolbarPosition[] = [
  'top', 'right', 'bottom', 'left', 'sidebar-right', 'sidebar-left',
] as const;

export function isHorizontalPosition(position: ToolbarPosition): boolean {
  return position === 'top' || position === 'bottom';
}

export function isSidebarPosition(position: ToolbarPosition): boolean {
  return position === 'sidebar-right' || position === 'sidebar-left';
}
```

### `libs/ngx-dev-toolbar/src/components/toolbar-tool/toolbar-tool.models.ts`

Add `compact?: boolean;` to the existing `ToolbarWindowOptions` interface.

### `libs/ngx-dev-toolbar/src/components/stream-runner/stream-runner.models.ts`

```typescript
export interface StreamStep<T = unknown> {
  label: string;
  badge?: string;
  run: () => T[] | Promise<T[]>;
  link?: (item: T) => string;
  describe?: (item: T) => string;
}

export interface StreamRunOptions {
  title: string;
  preamble?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: StreamStep<any>[];
  staggerMs?: number;
  pacingMs?: number;
}

export type StreamStepStatus = 'queued' | 'running' | 'done' | 'error';

export interface StreamStepRecord {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  step: StreamStep<any>;
  status: StreamStepStatus;
  items: { value: unknown; href?: string; label: string }[];
  error?: string;
  expanded: boolean;
}

export interface StreamRunResult {
  totalItems: number;
  totalSteps: number;
  durationMs: number;
}
```

The `stream-runner.component.ts` is the most complex restoration target — 269 lines. If lost, refer to the design brief in PRODUCT.md / DESIGN.md and rebuild against this spec:

- Imperative API: `runner.start({ title, preamble, steps, staggerMs?, pacingMs? })` returns a Promise of `StreamRunResult`.
- Internal state: `_records: StreamStepRecord[]`, `_visibleCount`, `_title`, `_preamble`, `_summary`, `_isRunning`, `_hasRun`.
- `isIdle` computed = `!hasRun && !isRunning`. Idle renders `<ng-content>` (empty state slot).
- Streaming choreography: queue all records → reveal with stagger → for each, set running, await `step.run()`, mark done with items → final summary.
- Respect `prefers-reduced-motion`: instant render, no stagger, no scroll animation.
- Step glyphs: queued (small filled circle, muted), running (large filled circle, brand, pulsing), done (filled brand circle with check), error (filled red circle with X).

---

## 🎯 Key facts

- **Angular version**: 19+ (uses `@switch`, `@for`, `signal()`, `input.required()`, `viewChild()`).
- **Path mapping**: `"ngx-dev-toolbar": ["libs/ngx-dev-toolbar/src/index.ts"]` in `tsconfig.base.json`. Demo resolves library to source — no `dist/` involved during dev.
- **Toolbar position is persisted** to localStorage via `ToolbarStorageService`. Persisted state takes priority over `provideToolbar({ position })` config on subsequent loads. Always `localStorage.clear()` when testing.
- **Demo serves with Vite + esbuild HMR.** Sometimes structural changes need a full server restart.
- **CLAUDE.md rule**: never add Claude Code attribution to commits/PRs.
- **MEMORY.md user prefs**: always commit spec files (this folder!); always use Conventional Commits format.

---

## 📦 Commit-time considerations (when it works)

Once the bisect resolves and the full Phase 4 demo is restored, the commit strategy:

1. Commit library changes (`feat(toolbar): add sidebar position and stream-runner primitive`).
2. Commit demo changes (`feat(demo): redesign custom-tool with streaming UX`).
3. Commit `PRODUCT.md` and `DESIGN.md` separately under `docs:` (these don't trigger releases per nx.json).
4. Commit the `specs/021-impeccable-streaming-redesign/` folder.
5. Open a PR — DO NOT push directly to main. The redesign is opinionated enough that a PR review pass makes sense.

---

## ❓ Open questions deferred from the original plan

- Whether the bottom-input footer should become a dedicated library shell component (`<ndt-tool-shell>`) that owns the canvas+composer split. Was punted — revisit after the basic version ships.
- Whether to add per-step `total?: number` so the running glyph can show "X of Y" progress. Currently the runner shows count only after the step completes (since `run()` is atomic).
- The other built-in tools (Feature Flags, i18n, etc.) inherit compact-mode treatment but were designed for ~480px height — they look right but have empty space at the bottom in sidebar mode. Per-tool optimization is future work.
- The `custom-tool-demo.component.ts` (separate from the actual `custom-tool.component.ts` — it's the docs page describing the tool) still mentions "Finder/Maker tabs". Update its copy to match the new design once the redesign ships.

---

## 🆘 If you're really stuck

The simplest "make it work" fallback: ship Phases 1, 2, 3 (library) only. Don't redesign the custom-tool demo at all. The library now offers sidebar position, compact window, and `ndt-stream-runner` as opt-in primitives. Consumers can build sidebar-style tools on their own. The original tabs+create demo stays as-is.

This ships value (the library primitives) without depending on the demo redesign that's currently broken. Phase 4 can be a follow-up PR once the bisect resolves.
