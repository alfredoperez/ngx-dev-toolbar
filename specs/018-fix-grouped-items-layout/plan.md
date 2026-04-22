# Plan: Fix Grouped Items Layout

**Spec**: [spec.md](./spec.md) | **Date**: 2026-04-22

## Approach

Mirror the `ndt-list-group` layout rules (flex column for the host, flex row for the header, flex column for the content) into the existing `.ndt-overlay-panel` defensive-CSS block in `global-theme.scss`, using compound selectors whose specificity beats host-app resets like Tailwind Preflight. The component-scoped styles in `list-group.component.scss` stay untouched so the demo stays pixel-equivalent; the overlay block acts as a redundant safety net that only takes effect when rendered outside the toolbar's Shadow DOM.

## Technical Context

**Stack**: Angular 21.1, TypeScript 5.5, SCSS, Jest
**Key Dependencies**: `@angular/cdk/overlay` (attaches tool panels to `document.body` outside the toolbar's Shadow root)
**Constraints**: Must not bleed CSS outside `.ndt-overlay-panel`; must not inflate the SCSS budget for the presets tool (separate file, so low risk); no `!important` (project convention)

## Files

### Create

- _None._ The fix reuses the existing defensive-CSS surface.

### Modify

- `libs/ngx-dev-toolbar/src/global-theme.scss` — append a defensive block (~25 lines) that re-asserts layout for `ndt-list-group` and its internal `.header`, `.content`, `.chevron`, `.name`, `.count` elements when rendered inside `.ndt-overlay-panel`. Use compound selectors (`.ndt-overlay-panel ndt-list-group`, etc.) so specificity beats `*`-scoped host resets. Include `contain: layout style` on `ndt-list-group` to isolate it from external style leakage, matching the pattern already applied to the panel itself.
- `libs/ngx-dev-toolbar/src/components/list-group/list-group.component.spec.ts` — (optional, per spec R008) extend with one DOM-layout assertion that mounts the component inside a host `<div class="ndt-overlay-panel">` and verifies `getComputedStyle(listGroupEl).display === 'flex'` and `flexDirection === 'column'`. Guards against future regressions if someone edits the overlay block.

## Testing Strategy

- **Unit**: Extend `list-group.component.spec.ts` with the optional layout assertion above. Existing tests (name/count rendering, projection, collapse, aria) stay unchanged.
- **Manual**: Temporarily add a Tailwind Preflight `<link>` (or a `* { all: revert }` reset) to `apps/demo/src/index.html`, open each grouped tool (flags, app features, permissions), and verify headers stack with their items — no blank gaps, no orphan rows. Remove the reset before committing.
- **Visual regression (demo)**: Open each grouped tool in the existing demo (no reset applied) and confirm no visible difference versus `main` — the new rules must be effectively no-ops when component styles already win.

## Risks

- **Specificity collision with future component edits**: If someone later changes `list-group.component.scss` (e.g. switches to `display: grid`), the overlay block will silently keep forcing `display: flex` and the layout will diverge between in-Shadow and out-of-Shadow contexts. **Mitigation**: add a short SCSS comment pointing back to `list-group.component.scss` so the coupling is discoverable.
- **SCSS bundle budget (NFR / R007)**: The budget pressure lives in `presets-tool.component.scss`, not `global-theme.scss`. Adding ~25 lines to `global-theme.scss` has no effect on the problematic budget. Low risk.
- **Chevron rotation selector**: The chevron uses a `.chevron--expanded` modifier class, not `aria-expanded`. Keep the overlay rule targeting the class so the rotation keeps working outside Shadow DOM.
