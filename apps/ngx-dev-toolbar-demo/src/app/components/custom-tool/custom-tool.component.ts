import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import {
  SelectOption,
  ToolbarButtonComponent,
  ToolbarListComponent,
  ToolbarSelectComponent,
  ToolbarTabComponent,
  ToolbarTabsComponent,
  ToolbarToolComponent,
  ToolbarWindowOptions,
} from 'ngx-dev-toolbar';

interface FinderResult {
  id: string;
  name: string;
  detail: string;
}

const MOCK_ROUTES: FinderResult[] = [
  { id: 'r1', name: '/dashboard', detail: 'DashboardComponent — lazy loaded' },
  { id: 'r2', name: '/users', detail: 'UsersListComponent — eager' },
  { id: 'r3', name: '/users/:id', detail: 'UserDetailComponent — lazy loaded' },
  { id: 'r4', name: '/settings', detail: 'SettingsComponent — eager' },
  { id: 'r5', name: '/reports', detail: 'ReportsComponent — lazy loaded' },
];

const MOCK_ELEMENTS: FinderResult[] = [
  { id: 'e1', name: '<app-header>', detail: 'AppHeaderComponent — 1 instance' },
  { id: 'e2', name: '<app-sidebar>', detail: 'SidebarComponent — 1 instance' },
  { id: 'e3', name: '<ndt-toolbar>', detail: 'ToolbarComponent — 1 instance' },
  { id: 'e4', name: '<app-card>', detail: 'CardComponent — 12 instances' },
  { id: 'e5', name: '<app-button>', detail: 'ButtonComponent — 8 instances' },
];

interface CreatedEntry {
  id: string;
  type: string;
  name: string;
  timestamp: string;
}

@Component({
  selector: 'app-custom-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    ToolbarTabsComponent,
    ToolbarTabComponent,
    ToolbarSelectComponent,
    ToolbarButtonComponent,
    ToolbarListComponent,
  ],
  template: `
    <ndt-toolbar-tool [options]="options" toolTitle="Custom Tool" icon="terminal">
      <div class="container">
        <ndt-tabs>
          <ndt-tab label="Finder">
            <div class="action-row">
              <ndt-select
                [options]="finderOptions"
                [(value)]="finderType"
                placeholder="What to look for"
                ariaLabel="Type to search for"
              />
              <ndt-button (click)="onFind()">Find</ndt-button>
            </div>

            <ndt-list
              [hasItems]="finderResults().length > 0"
              emptyMessage="Click Find to search"
            >
              @for (result of finderResults(); track result.id) {
                <div class="finder-item">
                  <span class="finder-item__link">{{ result.name }}</span>
                  <span class="finder-item__detail">{{ result.detail }}</span>
                </div>
              }
            </ndt-list>
          </ndt-tab>

          <ndt-tab label="Maker">
            <div class="action-row">
              <ndt-select
                [options]="makerOptions"
                [(value)]="makerType"
                placeholder="What to create"
                ariaLabel="Type to create"
              />
              <ndt-button (click)="onCreate()">Create</ndt-button>
            </div>

            <ndt-list
              [hasItems]="createdEntries().length > 0"
              emptyMessage="Click Create to generate mock data"
            >
              @for (entry of createdEntries(); track entry.id) {
                <div class="maker-item">
                  <div class="maker-item__header">
                    <span class="maker-item__badge">{{ entry.type }}</span>
                    <span class="maker-item__name">{{ entry.name }}</span>
                  </div>
                  <span class="maker-item__timestamp">{{ entry.timestamp }}</span>
                </div>
              }
            </ndt-list>
          </ndt-tab>
        </ndt-tabs>
      </div>
    </ndt-toolbar-tool>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
      }

      .action-row {
        display: flex;
        align-items: stretch;
        gap: var(--ndt-spacing-sm);
        margin-bottom: var(--ndt-spacing-md);
        flex-shrink: 0;
      }

      .action-row ndt-select {
        flex: 1 1 auto;
        min-width: 120px;
        max-width: 200px;
        display: flex;
      }

      .action-row ndt-button {
        flex: 0 0 auto;
      }

      /* Finder items */
      .finder-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--ndt-spacing-xs) var(--ndt-spacing-sm);
        background: var(--ndt-background-secondary);
        border-radius: var(--ndt-border-radius-medium);
        transition: background-color 0.2s ease;
      }

      .finder-item:hover {
        background: var(--ndt-hover-bg);
      }

      .finder-item__link {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
        font-size: var(--ndt-font-size-xs);
        font-weight: 500;
        color: var(--ndt-primary);
        cursor: pointer;
        text-decoration: none;
      }

      .finder-item__link:hover {
        text-decoration: underline;
      }

      .finder-item__detail {
        font-size: var(--ndt-font-size-xxs);
        color: var(--ndt-text-muted);
      }

      /* Maker items */
      .maker-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--ndt-spacing-xs) var(--ndt-spacing-sm);
        background: var(--ndt-background-secondary);
        border-radius: var(--ndt-border-radius-medium);
        transition: background-color 0.2s ease;
      }

      .maker-item:hover {
        background: var(--ndt-hover-bg);
      }

      .maker-item__header {
        display: flex;
        align-items: center;
        gap: var(--ndt-spacing-sm);
      }

      .maker-item__badge {
        display: inline-flex;
        align-items: center;
        padding: 1px var(--ndt-spacing-xs);
        font-size: var(--ndt-font-size-xxs);
        font-weight: 600;
        color: rgb(34, 197, 94);
        background: rgba(34, 197, 94, 0.1);
        border-radius: var(--ndt-border-radius-small);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .maker-item__name {
        font-size: var(--ndt-font-size-sm);
        font-weight: 500;
        color: var(--ndt-text-primary);
      }

      .maker-item__timestamp {
        font-size: var(--ndt-font-size-xxs);
        color: var(--ndt-text-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarCustomToolComponent {
  protected readonly options: ToolbarWindowOptions = {
    id: 'ndt-custom-tool',
    title: 'Custom Tool',
    description: 'Find routes & elements, create mock data',
    isClosable: true,
    size: 'medium',
  };

  protected readonly finderOptions: SelectOption[] = [
    { value: 'routes', label: 'Routes' },
    { value: 'elements', label: 'Elements' },
  ];

  protected readonly makerOptions: SelectOption[] = [
    { value: 'user', label: 'User' },
    { value: 'order', label: 'Order' },
    { value: 'product', label: 'Product' },
  ];

  readonly finderType = signal('routes');
  readonly makerType = signal('user');
  readonly finderResults = signal<FinderResult[]>([]);
  readonly createdEntries = signal<CreatedEntry[]>([]);

  private createdCount = 0;

  onFind() {
    const type = this.finderType();
    if (type === 'routes') {
      this.finderResults.set(MOCK_ROUTES);
    } else if (type === 'elements') {
      this.finderResults.set(MOCK_ELEMENTS);
    }
  }

  onCreate() {
    const type = this.makerType();
    if (!type) return;

    this.createdCount++;
    const label = this.makerOptions.find((o) => o.value === type)?.label ?? type;
    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    this.createdEntries.update((entries) => [
      {
        id: `created-${this.createdCount}`,
        type: label,
        name: `Mock ${label} #${this.createdCount}`,
        timestamp,
      },
      ...entries,
    ]);
  }
}
