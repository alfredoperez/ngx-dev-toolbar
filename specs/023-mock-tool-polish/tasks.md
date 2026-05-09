# Tasks: Mock Tool Polish

**Plan**: [plan.md](./plan.md)

> Format reference: `[P]` markers and parallel groups — see `skills/tasks/SKILL.md` § Phase rules.

## Phase 1: Core Implementation

### Group 1 — Foundations (parallel)

- [x] **T001** [P] Add `StreamRunContext` interface + evolve `runItem` signature — `libs/ngx-dev-toolbar/src/components/stream-runner/stream-runner.models.ts` | R001
  - **Do**: Export a new `StreamRunContext` interface with a single method `prior(stepIndexOrLabel: number | string): readonly unknown[]`. Change `StreamStep<T>.runItem` from `(index: number) => Promise<T>` to `(index: number, ctx: StreamRunContext) => Promise<T>`. Update the JSDoc comment on `runItem` to describe the new context arg ("provides read-only access to items completed in prior steps; existing single-arg callbacks remain valid because the parameter is positional"). Do not change any other types in this file.
  - **Verify**: `nx run ngx-dev-toolbar:build` passes. Existing callers in `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool.component.ts` still type-check (single-arg `(i) => …` is assignable to `(i, ctx) => …`).
  - **Leverage**: existing JSDoc style on `StreamStep` fields (lines 6–38) — match the same compact comment style.

- [x] **T002** [P] Create in-memory mock-data store service — `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/mock-data-store.service.ts` | R003, R004, NFR002
  - **Do**: New `@Injectable({ providedIn: 'root' })` class `MockDataStoreService`. Internal state: a single `signal<Map<string, unknown[]>>(new Map())` keyed by step label (e.g. `"Customers"`, `"Invoices"`). Public API: `addBatch(label: string, items: readonly unknown[]): void` (immutable update — replaces the map entry with a fresh array containing previous + new items), `entities<T>(label: string): readonly T[]` (returns the current array or `[]`), `entitiesSignal<T>(label: string): Signal<readonly T[]>` (computed view for reactive consumers), `clear(label?: string): void`. Use `signal.update()` with spread for immutability. Do **not** persist to localStorage — out of scope per spec.
  - **Verify**: `nx run ngx-dev-toolbar-demo:build` passes (or `nx serve ngx-dev-toolbar-demo` starts cleanly). Service is a singleton in DI.
  - **Leverage**: existing internal-service pattern in `libs/ngx-dev-toolbar/src/tools/feature-flags/feature-flags-internal.service.ts` for signal-based readonly state.

- [x] **T003** [P] Create stream-runner showcase styles — `apps/ngx-dev-toolbar-demo/src/app/components/stream-runner-demo/stream-runner-demo.component.scss` | R005
  - **Do**: Page-level styles consistent with sibling demo pages (e.g. `i18n-demo.component.ts` inline styles or `feature-flags-demo`). Provide `.showcase` container, `.showcase-section` cards, `.showcase-actions` button row, and a `.showcase-runner` slot that gives `<ndt-stream-runner>` a sensible max-width and padding. No imports of toolbar internals — this page sits outside the toolbar Shadow DOM.
  - **Verify**: file compiles (no SCSS syntax errors); the styles do not need to render correctly until T008 lands.
  - **Leverage**: any existing `*-demo.component.scss` for layout rhythm and the `--demo-*` CSS custom-property convention used in `custom-tool-demo.component.ts`.

### Group 2 — Runner runtime (gate)

- [x] **T004** Build `StreamRunContext` and pass to `runItem` — `libs/ngx-dev-toolbar/src/components/stream-runner/stream-runner.component.ts` *(depends on T001)* | R001, NFR001, R007
  - **Do**: Inside `start()`, after `this._records.set(records)`, construct a single context object that closes over the local `records` array: `const ctx: StreamRunContext = { prior: (key) => { const rec = typeof key === 'number' ? records[key] : records.find(r => r.step.label === key); return rec ? rec.items.filter(it => it.status === 'done').map(it => it.value) : []; } }`. Replace the call at line 276 from `await step.runItem(itemIndex)` to `await step.runItem(itemIndex, ctx)`. Note: because `ctx.prior` reads from the live `records` array (not a snapshot), step N sees everything resolved by steps 0..N-1 at the moment it runs. Lookup is O(1) for index, O(steps) for label — acceptable per NFR001 since step counts are tiny. Do **not** widen the public surface beyond what T001 added (no metadata accessors unless they "fall out of the design" — for this spec, skip R007 to keep the API minimal).
  - **Verify**: `nx run ngx-dev-toolbar:build` passes. Manual: existing demo "Generate billing data" still completes end-to-end (back-compat smoke test).
  - **Leverage**: existing `updateRecord` / `updateItem` patterns (lines 430–453) for understanding how records mutate during a run.

### Group 3 — Consumers (parallel, depend on Group 2)

- [x] **T005** [P] Wire mock-data tool to chaining context + store — `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool.component.ts` *(depends on T001, T002, T004)* | R002, R004
  - **Do**: (1) Inject `MockDataStoreService`. (2) In `makeEntityStep`, after the `runItem` body successfully resolves, **batch** items per step: collect into a local array inside the closure, then push to the store via `addBatch(label, batch)` once the step completes — easiest approach is to wrap the bundle's `buildSteps` so each step has an `runItem` that closes over a per-step buffer and flushes to the store on the last `total` index. (3) Add a dedicated `Invoices` step variant (replacing the `makeEntityStep('Invoices', …)` call inside the billing bundle) whose `runItem: async (i, ctx)` reads `ctx.prior<MockEntity>('Customers')` and stamps `customerId: customers[i % customers.length]?.id` into the generated invoice; the deeplink also routes under that customer (e.g. `/billing/customers/{customerId}/invoices/{id}`). (4) Add new FIND actions per CREATE bundle's first entity type (FIND → Customers, FIND → Categories, FIND → Users). Their `buildOptions` reads `store.entities('<Label>')`; if non-empty, build a single-step run that streams those entities back; if empty, build a single-step run with `total: 0` and a `preamble` like "No customers yet — run CREATE → Customers to seed data." Keep existing FIND → Routes / FIND → DOM elements unchanged.
  - **Verify**: Open the toolbar, run CREATE → Billing data with 3 items; expand Invoices step and confirm each invoice's `detail` mentions a `customerId` matching one of the customers' ids (you can also peek at the runner's stored `value` via DevTools). Then open FIND → Customers and confirm those 3 customers stream back. Open FIND → Customers without prior creates and confirm the empty preamble shows.
  - **Leverage**: existing `makeEntityStep` factory (line 58–89) for the per-item wait + jitter pattern; existing `buildFindRoutesOptions` (line 241) for single-step direct-run shape.

- [x] **T006** [P] Mirror created entities live in demo wrapper — `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool-demo/custom-tool-demo.component.ts` *(depends on T002)* | R003, NFR002
  - **Do**: Replace the entire hardcoded "Finder Tab" / "Maker Tab" markup. New layout: a header explaining what the page mirrors, then a responsive grid of cards — one card per known label (Customers, Invoices, Subscriptions, Line items, Payment methods, Categories, Products, Variants, Inventory, Suppliers, Users, Sessions, Profiles, Preferences, Invitations) — each card shows the count and the latest 5 entities by id+name from `MockDataStoreService.entitiesSignal('<Label>')`. When a label has zero entities, render a muted card with the explanatory text "Run the toolbar's Mock Data tool to seed `<label>`". Inject the service via `inject(MockDataStoreService)`. Use `@for` over a constant labels array, `track`. Because each card reads its own signal slice, only labels with new data re-render — satisfies NFR002 without manual debouncing.
  - **Verify**: `nx serve ngx-dev-toolbar-demo`; navigate to `/custom-tool`; confirm the page initially shows muted "no data" cards. Open the toolbar, run CREATE → Billing data; switch back to the demo page and confirm the Customers/Invoices/etc. cards now show real ids.
  - **Leverage**: card and grid patterns already in this file's `<style>` block (`.demo-card-grid`, `.demo-card`); keep the existing CSS variables (`--demo-card-bg` etc.) for theme consistency.

- [x] **T007** [P] Build stream-runner showcase component — `apps/ngx-dev-toolbar-demo/src/app/components/stream-runner-demo/stream-runner-demo.component.ts` *(depends on T001, T004)* | R005
  - **Do**: New standalone `StreamRunnerDemoComponent` with selector `app-stream-runner-demo`, `OnPush`, paired with `stream-runner-demo.component.scss` (T003). Imports `ToolbarStreamRunnerComponent` and `ToolbarButtonComponent` from `ngx-dev-toolbar`. Two scripted scenarios accessible via buttons: (a) **Quick discovery** — single-step run, 5 hardcoded items, ~150ms each, no chaining; (b) **Multi-step generation** — 3 steps that exercise the new chaining context (e.g. step 1: 3 "Authors", step 2: 5 "Posts" each referencing an author id from step 1 via `ctx.prior('Authors')`, step 3: 4 "Comments" each referencing a post). Inline template, `@ViewChild('runner')` for the `ToolbarStreamRunnerComponent`, `runQuick()` and `runChained()` methods. Render a header explaining the page substitutes for Storybook until Storybook lands.
  - **Verify**: After T008/T009 land, navigate to `/stream-runner` and click each scenario button; confirm the chained scenario produces posts whose `detail` shows the parent author id and comments referencing post ids.
  - **Leverage**: `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool.component.ts` lines 241–283 (`buildFindRoutesOptions`, `buildFindElementsOptions`) for `StreamRunOptions` shape; lines 558–587 (`scheduleRun`, `runOnce`) for the `afterNextRender` + `runner.start()` pattern.

### Group 4 — Wire-up + docs (parallel, depend on T007)

- [x] **T008** [P] Register showcase route — `apps/ngx-dev-toolbar-demo/src/app/app.routes.ts` *(depends on T007)* | R005
  - **Do**: Append a new route `{ path: 'stream-runner', loadComponent: () => import('./components/stream-runner-demo/stream-runner-demo.component').then((m) => m.StreamRunnerDemoComponent) }` after the existing `custom-tool` entry.
  - **Verify**: `nx serve ngx-dev-toolbar-demo`; navigate to `/stream-runner` directly and confirm it loads (the page itself is exercised in T007's verify after this lands).
  - **Leverage**: existing entries in this file (lines 38–43) for the lazy-import shape.

- [x] **T009** [P] Add Stream Runner sidebar nav item — `apps/ngx-dev-toolbar-demo/src/app/components/sidebar/sidebar.component.ts` *(depends on T007)* | R005
  - **Do**: Append a `NavItem` to `navItems` (currently lines 247+) with `label: 'Stream Runner'`, `path: '/stream-runner'`, and an `id` matching the convention used by sibling entries (e.g. `'stream-runner'`). Pick a reasonable existing nav icon — reuse one already in the file's icon switch rather than introducing a new SVG.
  - **Verify**: visual check — the sidebar shows a "Stream Runner" entry that highlights when on that route.
  - **Leverage**: existing `navItems` entries (lines 247–276) for the entry shape and icon-id convention.

- [x] **T010** [P] Append "Streaming Runner" section to custom-tool guide — `apps/docs/src/content/docs/guides/custom-tool.mdx` | R006
  - **Do**: Insert a new H2 section titled "Streaming Runner" *after* the "Multi-Step Tools" section (currently around line 174) and *before* the "Styling" section. Cover: (1) when to reach for `<ndt-stream-runner>` (long-running, multi-entity creation flows), (2) the `StreamStep<T>` shape (label, total, runItem, link, describe, detail), (3) `StreamRunOptions` (title, preamble, steps, pacing), (4) the new `StreamRunContext` and how `runItem(index, ctx)` enables cross-step chaining, with the Mock Data tool's customer→invoice example transcribed as a code block. End with a one-sentence pointer to the demo's `/stream-runner` showcase route. Keep the prose tight — match the guide's existing voice.
  - **Verify**: `nx serve documentation` (or whatever the docs serve target is) renders the new section without MDX parse errors; the code block syntax-highlights.
  - **Leverage**: existing "Multi-Step Tools" section (lines 174–242) for code-block + prose rhythm; existing table-of-design-tokens (lines 277+) is **not** what we want here — favor the MultiStep prose style.
