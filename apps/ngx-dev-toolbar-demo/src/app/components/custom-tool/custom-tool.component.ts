import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import {
  nounSingular,
  StreamRunOptions,
  StreamStep,
  ToolbarButtonComponent,
  ToolbarStreamRunnerComponent,
  ToolbarToolComponent,
  ToolbarWindowOptions,
  wait,
} from 'ngx-dev-toolbar';

// ─── Mock data shapes ────────────────────────────────────────────────────

interface MockEntity {
  id: string;
  name: string;
}

interface RouteEntity {
  path: string;
  componentName: string;
  loading: 'lazy' | 'eager';
}

interface ElementEntity {
  selector: string;
  componentName: string;
  count: number;
}

// ─── Bundle definitions (CREATE actions) ─────────────────────────────────

interface BundleDefinition {
  id: string;
  label: string;
  preamble: string;
  typeNames: string;
  buildSteps: (count: number) => StreamStep<MockEntity>[];
}

interface EntityStepConfig {
  label: string;
  badge: string;
  prefix: string;
  count: number;
  description: string;
}

function makeEntityStep({
  label,
  badge,
  prefix,
  count,
  description,
}: EntityStepConfig): StreamStep<MockEntity> {
  const singular = nounSingular(label).toLowerCase();
  const titleCaseSingular = nounSingular(label);
  return {
    label,
    badge,
    total: count,
    description,
    runItem: async (i) => {
      // 2–5s per item with jitter for a deliberate "doing it" rhythm.
      await wait(2000 + Math.random() * 3000);
      // ~7% simulated failure to demonstrate error handling.
      if (Math.random() < 0.07) {
        throw new Error(`Could not save ${singular} ${i + 1}`);
      }
      return {
        id: `${badge.toLowerCase()}-${randomId()}`,
        name: `${titleCaseSingular} ${i + 1}`,
      };
    },
    link: (item) => `/${prefix}/${item.id}`,
    describe: (item) => item.name,
    detail: (item) => `id ${item.id} · seed data ready to query`,
    placeholderDetail: `Generating ${singular} record…`,
  };
}

const BUNDLES: BundleDefinition[] = [
  {
    id: 'billing',
    label: 'Billing data',
    preamble: 'Customers, invoices, subscriptions, line items, payment methods.',
    typeNames: 'customers, invoices, subscriptions, line items, payment methods',
    buildSteps: (n) => [
      makeEntityStep({
        label: 'Customers',
        badge: 'CUSTOMER',
        prefix: 'billing/customers',
        count: n,
        description: 'Active accounts with valid payment methods on file.',
      }),
      makeEntityStep({
        label: 'Invoices',
        badge: 'INVOICE',
        prefix: 'billing/invoices',
        count: n,
        description: 'A mix of paid, pending, and overdue invoices.',
      }),
      makeEntityStep({
        label: 'Subscriptions',
        badge: 'SUBSCRIPTION',
        prefix: 'billing/subscriptions',
        count: n,
        description: 'Standard, pro, and enterprise tier subscriptions.',
      }),
      makeEntityStep({
        label: 'Line items',
        badge: 'LINEITEM',
        prefix: 'billing/line-items',
        count: n,
        description: 'Line items linked to the generated invoices.',
      }),
      makeEntityStep({
        label: 'Payment methods',
        badge: 'PAYMENT',
        prefix: 'billing/payment-methods',
        count: n,
        description: 'Cards, ACH transfers, and digital wallets for checkout testing.',
      }),
    ],
  },
  {
    id: 'retail',
    label: 'Retail catalog',
    preamble: 'Categories, products, variants, inventory, suppliers.',
    typeNames: 'categories, products, variants, inventory, suppliers',
    buildSteps: (n) => [
      makeEntityStep({
        label: 'Categories',
        badge: 'CATEGORY',
        prefix: 'retail/categories',
        count: n,
        description: 'Top-level taxonomy that organizes the catalog.',
      }),
      makeEntityStep({
        label: 'Products',
        badge: 'PRODUCT',
        prefix: 'retail/products',
        count: n,
        description: 'SKUs distributed across the generated categories.',
      }),
      makeEntityStep({
        label: 'Variants',
        badge: 'VARIANT',
        prefix: 'retail/variants',
        count: n,
        description: 'Size and color variants attached to each product.',
      }),
      makeEntityStep({
        label: 'Inventory',
        badge: 'INVENTORY',
        prefix: 'retail/inventory',
        count: n,
        description: 'Stock levels with mock warehouse locations.',
      }),
      makeEntityStep({
        label: 'Suppliers',
        badge: 'SUPPLIER',
        prefix: 'retail/suppliers',
        count: n,
        description: 'Vendor records linked to a subset of products.',
      }),
    ],
  },
  {
    id: 'onboarding',
    label: 'User onboarding',
    preamble: 'Users, sessions, profiles, preferences, invitations.',
    typeNames: 'users, sessions, profiles, preferences, invitations',
    buildSteps: (n) => [
      makeEntityStep({
        label: 'Users',
        badge: 'USER',
        prefix: 'users',
        count: n,
        description: 'New accounts in various activation states.',
      }),
      makeEntityStep({
        label: 'Sessions',
        badge: 'SESSION',
        prefix: 'sessions',
        count: n,
        description: 'Active and expired login sessions across devices.',
      }),
      makeEntityStep({
        label: 'Profiles',
        badge: 'PROFILE',
        prefix: 'profiles',
        count: n,
        description: 'Avatars, bios, and preferences set for each user.',
      }),
      makeEntityStep({
        label: 'Preferences',
        badge: 'PREFERENCE',
        prefix: 'preferences',
        count: n,
        description: 'Notification, locale, and display settings per profile.',
      }),
      makeEntityStep({
        label: 'Invitations',
        badge: 'INVITE',
        prefix: 'invites',
        count: n,
        description: 'Pending invites in different stages of acceptance.',
      }),
    ],
  },
];

// ─── FIND actions: also use the runner, but as single-step "discoveries" ──

const ROUTES: RouteEntity[] = [
  { path: '/dashboard', componentName: 'DashboardComponent', loading: 'lazy' },
  { path: '/users', componentName: 'UsersListComponent', loading: 'eager' },
  { path: '/users/:id', componentName: 'UserDetailComponent', loading: 'lazy' },
  { path: '/settings', componentName: 'SettingsComponent', loading: 'eager' },
  { path: '/reports', componentName: 'ReportsComponent', loading: 'lazy' },
];

const ELEMENTS: ElementEntity[] = [
  { selector: '<app-header>', componentName: 'AppHeaderComponent', count: 1 },
  { selector: '<app-sidebar>', componentName: 'SidebarComponent', count: 1 },
  { selector: '<ndt-toolbar>', componentName: 'ToolbarComponent', count: 1 },
  { selector: '<app-card>', componentName: 'CardComponent', count: 12 },
  { selector: '<app-button>', componentName: 'ButtonComponent', count: 8 },
];

function buildFindRoutesOptions(): StreamRunOptions {
  return {
    title: 'Searching app routes',
    preamble: `${ROUTES.length} routes registered in the router.`,
    steps: [{
      label: 'Routes',
      verbActive: 'Reading',
      verbDone: 'Found',
      total: ROUTES.length,
      runItem: async (i) => {
        await wait(120 + Math.random() * 280);
        return ROUTES[i];
      },
      link: (r) => r.path,
      describe: (r) => r.path,
      detail: (r) => `${r.componentName} · ${r.loading}-loaded`,
      placeholderDetail: 'Reading route configuration…',
    }],
    pacing: { stepGap: 0 },
  };
}

function buildFindElementsOptions(): StreamRunOptions {
  return {
    title: 'Inspecting DOM elements',
    preamble: `${ELEMENTS.length} component types currently mounted.`,
    steps: [{
      label: 'Elements',
      verbActive: 'Inspecting',
      verbDone: 'Found',
      total: ELEMENTS.length,
      runItem: async (i) => {
        await wait(120 + Math.random() * 280);
        return ELEMENTS[i];
      },
      link: () => '#elements',
      describe: (el) => el.selector,
      detail: (el) => `${el.componentName} · ${el.count} instance${el.count === 1 ? '' : 's'}`,
      placeholderDetail: 'Inspecting element tree…',
    }],
    pacing: { stepGap: 0 },
  };
}

// ─── Action catalog ──────────────────────────────────────────────────────

type ActionSection = 'create' | 'find';
type ActionGlyph = 'sparkle' | 'magnifier';

interface ToolAction {
  id: string;
  section: ActionSection;
  glyph: ActionGlyph;
  label: string;
  hint: string;
  /** Drill-in actions need a form for parameters; direct actions run on click. */
  flow: 'drill' | 'direct';
  /** Bundle id (for CREATE drill-in actions). */
  bundleId?: string;
  /** Run options builder (for direct-run actions). */
  buildOptions?: () => StreamRunOptions;
}

const ACTIONS: ToolAction[] = [
  ...BUNDLES.map((b): ToolAction => ({
    id: `create-${b.id}`,
    section: 'create',
    glyph: 'sparkle',
    label: b.label,
    hint: '5 types',
    flow: 'drill',
    bundleId: b.id,
  })),
  {
    id: 'find-routes',
    section: 'find',
    glyph: 'magnifier',
    label: 'Routes',
    hint: `${ROUTES.length} routes`,
    flow: 'direct',
    buildOptions: buildFindRoutesOptions,
  },
  {
    id: 'find-elements',
    section: 'find',
    glyph: 'magnifier',
    label: 'DOM elements',
    hint: `${ELEMENTS.length} types`,
    flow: 'direct',
    buildOptions: buildFindElementsOptions,
  },
];

// ─── Component ───────────────────────────────────────────────────────────

type View = 'home' | 'form' | 'run';

@Component({
  selector: 'app-custom-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    ToolbarButtonComponent,
    ToolbarStreamRunnerComponent,
  ],
  template: `
    <ndt-toolbar-tool
      [options]="options"
      toolTitle="Mock Data"
      icon="terminal"
    >
      <div class="canvas">
        @switch (view()) {

          @case ('home') {
            <ul class="home">
              @for (section of sectionsInOrder; track section.id) {
                <li class="home__section">
                  <h4 class="home__section-title">{{ section.label }}</h4>
                  <ul class="home__rows">
                    @for (action of actionsBySection(section.id); track action.id) {
                      <li>
                        <button
                          class="home__action"
                          type="button"
                          (click)="onSelectAction(action)"
                        >
                          <span class="home__glyph" aria-hidden="true">
                            @switch (action.glyph) {
                              @case ('sparkle') {
                                <svg viewBox="0 0 16 16" width="14" height="14">
                                  <path d="M8 1.5l1.4 3.6L13 6.5l-3.6 1.4L8 11.5 6.6 7.9 3 6.5l3.6-1.4L8 1.5z M12 10l.6 1.6L14 12.2l-1.4.6L12 14.4l-.6-1.6L10 12.2l1.4-.6L12 10z" fill="currentColor"/>
                                </svg>
                              }
                              @case ('magnifier') {
                                <svg viewBox="0 0 16 16" width="14" height="14">
                                  <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                                  <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                              }
                            }
                          </span>
                          <span class="home__label">{{ action.label }}</span>
                          <span class="home__hint">{{ action.hint }}</span>
                          <span class="home__chevron" aria-hidden="true">
                            <svg viewBox="0 0 12 12" width="10" height="10">
                              <path d="M4.5 3 7.5 6 4.5 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </span>
                        </button>
                      </li>
                    }
                  </ul>
                </li>
              }
            </ul>
          }

          @case ('form') {
            <div class="form">
              <div class="tool-subnav">
                <button
                  class="tool-subnav__back"
                  type="button"
                  (click)="goHome()"
                  aria-label="Back to actions"
                >
                  <svg viewBox="0 0 14 14" width="12" height="12">
                    <path d="M9 3 5 7 9 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Back to actions
                </button>
              </div>

              <div class="form__body">
                <h3 class="form__title">{{ selectedBundle()?.label }}</h3>
                <p class="form__hint">{{ selectedBundle()?.preamble }}</p>

                <div class="form__field">
                  <label class="form__label" for="count">Items per type</label>
                  <div class="form__count-row">
                    <input
                      id="count"
                      class="form__count"
                      type="number"
                      min="1"
                      max="50"
                      [value]="count()"
                      (input)="onCountChange($event)"
                      aria-label="Items per type"
                    />
                    <span class="form__count-math">
                      × 5 types = <strong>{{ count() * 5 }}</strong> entities
                    </span>
                  </div>
                </div>
              </div>

              <div class="form__submit-row">
                <ndt-button (click)="onGenerate()">Generate</ndt-button>
              </div>
            </div>
          }

          @case ('run') {
            <div class="run">
              <div class="tool-subnav">
                <button
                  class="tool-subnav__back"
                  type="button"
                  (click)="goHome()"
                  aria-label="Back to actions"
                >
                  <svg viewBox="0 0 14 14" width="12" height="12">
                    <path d="M9 3 5 7 9 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Back to actions
                </button>
              </div>

              <ndt-stream-runner #runner></ndt-stream-runner>

              @if (!isRunning()) {
                <div class="run__actions">
                  <ndt-button (click)="onRunAgain()">Run again</ndt-button>
                </div>
              }
            </div>
          }

        }
      </div>
    </ndt-toolbar-tool>
  `,
  styleUrls: ['./custom-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarCustomToolComponent {
  protected readonly options: ToolbarWindowOptions = {
    id: 'ndt-custom-tool',
    title: 'Mock Data',
    description: 'Find and create test data',
    isClosable: true,
    size: 'tall',
  };

  protected readonly sectionsInOrder = [
    { id: 'create' as const, label: 'Create' },
    { id: 'find' as const, label: 'Find' },
  ];

  protected readonly view = signal<View>('home');
  protected readonly selectedActionId = signal<string | null>(null);
  protected readonly count = signal(10);
  protected readonly isRunning = signal(false);

  private readonly runner = viewChild<ToolbarStreamRunnerComponent>('runner');
  private readonly injector = inject(Injector);

  // ── Action lookup helpers ─────────────────────────────────────────────

  protected actionsBySection(section: ActionSection): ToolAction[] {
    return ACTIONS.filter((a) => a.section === section);
  }

  protected selectedAction(): ToolAction | null {
    const id = this.selectedActionId();
    return id ? ACTIONS.find((a) => a.id === id) ?? null : null;
  }

  protected selectedBundle(): BundleDefinition | null {
    const action = this.selectedAction();
    if (!action || !action.bundleId) return null;
    return BUNDLES.find((b) => b.id === action.bundleId) ?? null;
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goHome(): void {
    this.runner()?.reset();
    this.selectedActionId.set(null);
    this.view.set('home');
  }

  protected async onSelectAction(action: ToolAction): Promise<void> {
    this.selectedActionId.set(action.id);
    if (action.flow === 'drill') {
      this.view.set('form');
    } else {
      this.view.set('run');
      this.scheduleRun();
    }
  }

  protected onCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const next = Number.parseInt(input.value, 10);
    if (!Number.isNaN(next) && next > 0) {
      this.count.set(Math.min(50, next));
    }
  }

  protected onGenerate(): void {
    this.view.set('run');
    this.scheduleRun();
  }

  protected async onRunAgain(): Promise<void> {
    // Runner is already mounted from the previous run; no scheduling needed.
    await this.runOnce();
  }

  /**
   * Wait for Angular to render the run view (which mounts the stream-runner)
   * before kicking off the work. Without this, viewChild is undefined when we
   * try to call start() and the user sees an empty canvas.
   */
  private scheduleRun(): void {
    afterNextRender(
      () => { void this.runOnce(); },
      { injector: this.injector },
    );
  }

  // ── Run dispatch ──────────────────────────────────────────────────────

  private async runOnce(): Promise<void> {
    if (this.isRunning()) return;
    const action = this.selectedAction();
    if (!action) return;

    const options = this.buildOptionsForAction(action);
    if (!options) return;

    this.isRunning.set(true);
    const runner = this.runner();
    if (!runner) {
      this.isRunning.set(false);
      return;
    }

    try {
      await runner.start(options);
    } finally {
      this.isRunning.set(false);
    }
  }

  private buildOptionsForAction(action: ToolAction): StreamRunOptions | null {
    if (action.flow === 'direct' && action.buildOptions) {
      return action.buildOptions();
    }
    if (action.flow === 'drill') {
      const bundle = this.selectedBundle();
      if (!bundle) return null;
      return {
        title: `Generating ${bundle.label.toLowerCase()}`,
        preamble: bundle.preamble,
        steps: bundle.buildSteps(this.count()),
      };
    }
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}
