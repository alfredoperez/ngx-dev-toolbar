# Plan: Fix Flag Source Display

**Spec**: [spec.md](./spec.md) | **Date**: 2026-04-26

## Approach

Decouple the dot indicator in `ndt-list-item` from the forced/effective value so it always renders the upstream source value, while leaving the row tint, select dropdown, and aria semantics untouched. The fix is a single-component change: introduce a `sourceValue` computed that returns `originalValue` when an item is forced (and that value is defined) and falls back to `currentValue` otherwise. R005/R006 (apply-to-source button gating) require **no code change** — every tool component already binds `[showApply]="hasApplyCallback()"` and the template already gates with `@if (showApply() && isForced())`; we will verify this during implementation rather than reintroduce the binding.

## Technical Context

**Stack**: Angular 19, TypeScript 5.5, Jest, signals (`computed`, `input`)
**Constraints**: No public API changes; `originalValue` field is already present on `ToolbarFlag` / `ToolbarPermission` / `ToolbarAppFeature`, so no new state plumbing is needed.

## Files

### Create

(none)

### Modify

- `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.ts` — add `sourceValue` computed (forced + defined `originalValue` → `originalValue`; otherwise → `currentValue`), bind `dot-indicator--on/off` to `sourceValue()` instead of `currentValue()`, refresh `tooltipText` to surface "Server: X · Forced: Y" when the two diverge and a single-state line otherwise, refresh `statusAriaLabel` to announce the source value with a "forced" qualifier.
- `libs/ngx-dev-toolbar/src/components/list-item/list-item.component.spec.ts` — add test cases: (a) forced with diverging source renders dot in source style and tooltip with both values, (b) forced with matching source renders dot in source style and single-state tooltip, (c) non-forced item dot still tracks `currentValue` (regression guard).

## Testing Strategy

- **Unit**: Add three `ToolbarListItemComponent` cases against the existing Jest suite, asserting `dot-indicator--on` / `dot-indicator--off` class presence based on `originalValue` when `isForced` is true, and tooltip + aria-label content for the diverging case.
- **Integration**: Rely on existing `feature-flags-tool.component.spec.ts`, `permissions-tool.component.spec.ts`, and `app-features-tool.component.spec.ts` to confirm no regression in how each tool wires `originalValue` and `showApply` through to the list item.
- **Edge cases**: Forced item with `originalValue === undefined` (defensive — fall back to `currentValue` so we never render a misleading dot); toolbar disabled (still no UI — covered by existing tool-component tests).

## Risks

- **Tooltip / aria-label drift**: The dot now describes the source value while the row tint and select describe the forced value. If we update the dot binding but leave `tooltipText` describing `currentValue`, screen reader users get contradictory cues. Mitigation: update `tooltipText` and `statusAriaLabel` in the same change and cover both with the new specs.
- **Hidden consumers of `currentValue` semantics**: Other components or styles in the file may assume `currentValue` is the dot's source. Mitigation: only change the dot binding and the two computeds tied to it; leave `currentValue` input contract intact so the select dropdown and forced row tint continue to work as before.

---

**Plain-English summary** — the dot next to each flag, permission, and app-feature is showing the developer's override instead of the value the server actually reported, and the spec author wants those decoupled so you can see at a glance both what production says and what you've forced. The fix lives in one shared list-item component: make the dot read the original (server) value when an override exists, and update its tooltip and screen-reader label to mention both values when they disagree. The "apply to source" button gating asked for by the spec is already in place across all three tools, so that part of the fix is just a verification — no new code.
