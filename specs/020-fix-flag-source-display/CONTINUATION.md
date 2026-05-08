# Continuation: Fix Flag Source Display + Clean Up 012 Sidecar

**Date written**: 2026-05-08
**For**: A fresh session starting from `main` with no memory of how this got here.

This document is self-contained. Read it cold, run the verification commands, then execute. The spec/plan/tasks files in this directory are authoritative for *what* to build; this document is authoritative for *what's already done* and *exactly which edits are still pending*.

---

## TL;DR

Two pieces of leftover work that should ship together as one small PR:

1. **Delete `specs/012-fix-hover-overflow/.spec-context.json`** — stale SDD workflow sidecar, the underlying feature already shipped via PR #35.
2. **Implement spec 020 (Fix Flag Source Display)** — bug where the dot indicator next to each flag/permission/app-feature shows the *forced* value instead of the *source-of-truth* value. Most of the groundwork is already in place; only T001 (one component change) and T002 (unit tests) are pending.

Estimated total work: 30–60 minutes including tests + PR.

---

## Pre-flight: verify the codebase still matches the plan

Run these checks before editing. If any output diverges, stop and re-read the actual code instead of trusting this plan.

```bash
# 1. Confirm the dot binding still uses currentValue (T001 not started)
grep -n "dot-indicator--on\|dot-indicator--off" libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts
# Expected: lines binding `[class.dot-indicator--on]="currentValue()"` and `[class.dot-indicator--off]="!currentValue()"`

# 2. Confirm `sourceValue` does NOT yet exist
grep -n "sourceValue" libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts
# Expected: no matches

# 3. Confirm `originalValue` input exists (foundation already in place)
grep -n "originalValue = input" libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts
# Expected: line ~126 with `originalValue = input<boolean | undefined>(undefined);`

# 4. Confirm [showApply] is wired in all three tools (T003 already complete — no code change needed)
grep -n "\[showApply\]" \
  libs/ngx-dev-toolbar/src/tools/feature-flags-tool/feature-flags-tool.component.ts \
  libs/ngx-dev-toolbar/src/tools/permissions-tool/permissions-tool.component.ts \
  libs/ngx-dev-toolbar/src/tools/app-features-tool/app-features-tool.component.ts
# Expected: 3 hits, all binding to `hasApplyCallback()`

# 5. Confirm 012 sidecar still exists and is untracked
ls specs/012-fix-hover-overflow/.spec-context.json
git ls-files specs/012-fix-hover-overflow/.spec-context.json
# Expected: file exists, but `git ls-files` returns empty (untracked)
```

If everything matches, proceed.

---

## Branch + scope

```bash
git checkout main
git pull origin main      # PR #50 may or may not be merged yet — either is fine, this branch's scope doesn't overlap
git checkout -b fix/list-item-dot-indicator-source-value
```

**Scope of the PR:**

- ✏️ Edit `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts`
- ✏️ Edit `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.spec.ts`
- 🗑️ Delete `specs/012-fix-hover-overflow/.spec-context.json`

Nothing else. The `[showApply]` work (T003) is already done in `main`.

---

## What's already done (do NOT redo)

These were verified by grep on 2026-05-08:

- ✅ `originalValue = input<boolean | undefined>(undefined)` — `list-item.component.ts:126`
- ✅ `tooltipText` already branches on `isForced() && originalValue() !== undefined` — `list-item.component.ts:171`
- ✅ `[showApply]="hasApplyCallback()"` in:
  - `feature-flags-tool.component.ts:122`
  - `permissions-tool.component.ts:145`
  - `app-features-tool.component.ts:150`
- ✅ Each internal service exposes a `hasApplyCallback` computed driven by `applyCallback() !== null`

---

## T001 — exact edits to `list-item.component.ts`

### Edit 1: Add `sourceValue` computed

Find the existing computeds in the component class (around line 168, just above `tooltipText`). Insert:

```typescript
/**
 * Source-of-truth value: when an item is forced and we know the original
 * upstream value, expose that; otherwise fall back to currentValue.
 *
 * The dot indicator binds to this so it always reflects what the server /
 * provider reported, never the developer's override.
 */
protected sourceValue = computed(() => {
  const original = this.originalValue();
  return this.isForced() && original !== undefined ? original : this.currentValue();
});
```

### Edit 2: Switch dot bindings (template at the top of the file, ~lines 30-33)

```diff
   class="dot-indicator"
-  [class.dot-indicator--on]="currentValue()"
-  [class.dot-indicator--off]="!currentValue()"
+  [class.dot-indicator--on]="sourceValue()"
+  [class.dot-indicator--off]="!sourceValue()"
   [class.dot-indicator--forced]="isForced()"
```

Leave `dot-indicator--forced` (and any `list-item--forced` row tint) bound to `isForced()` — the *forced* visual state is independent of the dot color.

### Edit 3: Refresh `tooltipText` to use the spec wording

Spec R007 wants `"Server: enabled · Forced: disabled"` style. The current `tooltipText` says `"Currently enabled (originally disabled)"`. Rewrite:

```typescript
protected tooltipText = computed(() => {
  const current = this.currentValue() ? 'enabled' : 'disabled';
  const original = this.originalValue();

  if (this.isForced() && original !== undefined && original !== this.currentValue()) {
    const originalLabel = original ? 'enabled' : 'disabled';
    return `Server: ${originalLabel} · Forced: ${current}`;
  }

  return `Currently ${current}`;
});
```

Note: when forced + values match, fall through to `"Currently <state>"` per spec scenario "Forced flag with matching source value".

### Edit 4: Refresh `statusAriaLabel` to announce source value

Current code uses `currentValue` for both forced and non-forced. Spec NFR001 wants the source value announced (with `, forced` qualifier when applicable):

```typescript
protected statusAriaLabel = computed(() => {
  const source = this.sourceValue() ? 'enabled' : 'disabled';
  return this.isForced() ? `${source}, forced` : source;
});
```

---

## T002 — exact tests to add to `list-item.component.spec.ts`

Read the existing file first to learn the `TestBed.createComponent` + `componentRef.setInput` pattern. Then add four cases:

```typescript
describe('source-value dot indicator', () => {
  // 1. Forced with diverging source → dot reflects source, tooltip shows both
  it('renders dot in source style when forced value differs from source', () => {
    const fixture = TestBed.createComponent(ToolbarListItemComponent);
    fixture.componentRef.setInput('label', 'dark-mode');
    fixture.componentRef.setInput('currentValue', true);
    fixture.componentRef.setInput('originalValue', false);
    fixture.componentRef.setInput('isForced', true);
    fixture.detectChanges();

    const dot = fixture.nativeElement.querySelector('.dot-indicator');
    expect(dot.classList).toContain('dot-indicator--off');     // source = false
    expect(dot.classList).not.toContain('dot-indicator--on');
    expect(dot.classList).toContain('dot-indicator--forced');
    expect(dot.getAttribute('title')).toMatch(/Server: disabled · Forced: enabled/);
    expect(dot.getAttribute('aria-label')).toBe('disabled, forced');
  });

  // 2. Forced with matching source → dot still ok, tooltip is the simple form
  it('renders dot in source style and simple tooltip when forced value matches source', () => {
    const fixture = TestBed.createComponent(ToolbarListItemComponent);
    fixture.componentRef.setInput('label', 'beta-features');
    fixture.componentRef.setInput('currentValue', true);
    fixture.componentRef.setInput('originalValue', true);
    fixture.componentRef.setInput('isForced', true);
    fixture.detectChanges();

    const dot = fixture.nativeElement.querySelector('.dot-indicator');
    expect(dot.classList).toContain('dot-indicator--on');
    expect(dot.classList).toContain('dot-indicator--forced');
    expect(dot.getAttribute('title')).toBe('Currently enabled');
    expect(dot.getAttribute('aria-label')).toBe('enabled, forced');
  });

  // 3. Non-forced regression guard → dot tracks currentValue exactly as before
  it('falls through to currentValue for non-forced items', () => {
    const fixture = TestBed.createComponent(ToolbarListItemComponent);
    fixture.componentRef.setInput('label', 'public-flag');
    fixture.componentRef.setInput('currentValue', true);
    fixture.componentRef.setInput('isForced', false);
    fixture.detectChanges();

    const dot = fixture.nativeElement.querySelector('.dot-indicator');
    expect(dot.classList).toContain('dot-indicator--on');
    expect(dot.classList).not.toContain('dot-indicator--forced');
    expect(dot.getAttribute('title')).toBe('Currently enabled');
  });

  // 4. Defensive: forced but no originalValue → fall back to currentValue
  it('falls back to currentValue when forced but originalValue is undefined', () => {
    const fixture = TestBed.createComponent(ToolbarListItemComponent);
    fixture.componentRef.setInput('label', 'mystery-flag');
    fixture.componentRef.setInput('currentValue', true);
    fixture.componentRef.setInput('isForced', true);
    // originalValue intentionally not set
    fixture.detectChanges();

    const dot = fixture.nativeElement.querySelector('.dot-indicator');
    expect(dot.classList).toContain('dot-indicator--on');
    expect(dot.classList).toContain('dot-indicator--forced');
  });
});
```

Adjust input names if the existing spec file reveals different input identifiers (e.g., `label` may be `name`). Read the file first, mirror its conventions.

---

## 012 cleanup — one command

```bash
rm specs/012-fix-hover-overflow/.spec-context.json
```

That's the entire cleanup. Stage it as part of the same commit as the docs polish, or as its own separate `chore` commit.

---

## Commit + PR strategy

**One PR, two commits:**

```bash
# Commit 1 — the actual fix
git add \
  libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts \
  libs/ngx-dev-toolbar/src/components/list-item/list-item.component.spec.ts
git commit -m "fix(list-item): dot indicator reflects source value, not forced override

The dot next to each flag, permission, and app-feature was showing
the developer's override instead of the value the source-of-truth
reported. Decouple the dot binding from currentValue: when an item
is forced and originalValue is known, the dot now reflects the
upstream value. The amber row tint and 'forced' aria qualifier
remain on the forced state so both pieces of information are visible
at a glance.

Tooltip wording adopts the 'Server: X · Forced: Y' format from spec
020 when the values diverge, otherwise falls through to the existing
'Currently X' phrasing.

Closes spec 020."

# Commit 2 — sidecar cleanup
git rm specs/012-fix-hover-overflow/.spec-context.json
git commit -m "chore: remove stale SDD context for already-shipped spec 012

The hover-overflow fix shipped via PR #35 (commit 1ac6531). The
.spec-context.json sidecar was never advanced past the 'specify' draft
state and is no longer referenced by anything. Deleting to keep the
specs/ directory honest about what's in flight."
```

Verify the chain:

```bash
git log main..HEAD --oneline
# Expected:
#   <hash> chore: remove stale SDD context for already-shipped spec 012
#   <hash> fix(list-item): dot indicator reflects source value, not forced override
```

**Push + PR:**

```bash
git push -u origin fix/list-item-dot-indicator-source-value

gh pr create --title "fix(list-item): dot indicator reflects source value, not forced override" --body "$(cat <<'EOF'
## Summary
- The list-item dot indicator now reflects the value the source of truth (server, LaunchDarkly, etc.) reported, not the developer's override. The amber row tint and 'forced' aria qualifier still convey that the item is forced.
- Tooltip wording adopts \`Server: X · Forced: Y\` when the source and forced values diverge.
- Removes the stale \`.spec-context.json\` sidecar from spec 012 (whose feature shipped via PR #35).

## Why
Spec 020 calls out that developers couldn't tell at a glance what production was actually returning when they had a value forced — the dot was always echoing the override. Decoupling the dot from \`currentValue\` lets both pieces of information surface in one place.

## Changes
- \`list-item.component.ts\`: new \`sourceValue\` computed; dot bindings switched; \`tooltipText\` and \`statusAriaLabel\` updated.
- \`list-item.component.spec.ts\`: 4 new Jest cases covering forced+diverging, forced+matching, non-forced regression guard, and defensive \`originalValue=undefined\` fallback.
- Deletes \`specs/012-fix-hover-overflow/.spec-context.json\`.

## Already in place from prior work (verified, no change needed)
- \`originalValue\` input on \`ndt-list-item\`
- \`[showApply]="hasApplyCallback()"\` wired across feature-flags / permissions / app-features tools
- Internal services exposing \`hasApplyCallback\`
EOF
)"
```

Ask the user for validation of title + body before running `gh pr create` (per their stated PR preference).

---

## Verification before merging

```bash
./node_modules/.bin/nx test ngx-dev-toolbar --testPathPattern=list-item
./node_modules/.bin/nx build ngx-dev-toolbar --skip-nx-cache
./node_modules/.bin/nx lint ngx-dev-toolbar
```

Visual smoke test (refresh the demo dev server):

1. Force a feature flag whose source value is `false` to `true`. Confirm: dot is **red ring (off)**, row has **amber tint**, tooltip reads `Server: disabled · Forced: enabled`, screen reader announces `disabled, forced`.
2. Force a flag whose source is already `true` to `true`. Confirm: dot is **filled green**, row has **amber tint**, tooltip reads `Currently enabled`, screen reader announces `enabled, forced`.
3. Don't force a flag at all. Confirm: dot tracks the source value, no amber tint, tooltip reads `Currently <state>`. (Regression guard.)

---

## After merging

- Mark T001/T002/T003 as ✅ in `specs/020-fix-flag-source-display/tasks.md`, or just delete the file if you don't keep tasks files post-ship.
- The streaming-redesign PR (#50) is unrelated and on its own branch — this work doesn't block or unblock it.
