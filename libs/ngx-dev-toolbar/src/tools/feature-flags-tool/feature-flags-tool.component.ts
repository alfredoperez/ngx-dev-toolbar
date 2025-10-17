import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarIconComponent } from '../../components/icons/icon.component';
import { DevToolbarInputComponent } from '../../components/input/input.component';
import { DevToolbarSelectComponent } from '../../components/select/select.component';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { DevToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { DevToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { DevToolbarFlag, FeatureFlagFilter } from './feature-flags.models';
@Component({
  selector: 'ndt-feature-flags-tool',
  standalone: true,
  imports: [
    FormsModule,
    DevToolbarToolComponent,
    DevToolbarInputComponent,
    DevToolbarSelectComponent,
    DevToolbarIconComponent,
  ],
  template: `
    <ndt-toolbar-tool
      [options]="options"
      title="Feature Flags"
      icon="toggle-left"
    >
      <div class="container">
        <div class="header">
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search..."
          />
          <div class="filter-wrapper">
            <ndt-icon name="filter" class="filter-icon" />
            <ndt-select
              [value]="activeFilter()"
              [options]="filterOptions"
              [size]="'medium'"
              (valueChange)="onFilterChange($event)"
            />
          </div>
        </div>

        @if (hasNoFlags()) {
        <div class="empty">
          <p>No flags found</p>
        </div>
        } @else if (hasNoFilteredFlags()) {
        <div class="empty">
          <p>No flags found matching your filter</p>
        </div>
        } @else {
        <div class="flag-list">
          @for (flag of filteredFlags(); track flag.id) {
          <div class="flag">
            <div class="info">
              <h3>{{ flag.name }}</h3>
              <p>{{ flag?.description }}</p>
            </div>

            <ndt-select
              [value]="getFlagValue(flag)"
              [options]="flagValueOptions"
              [ariaLabel]="'Set value for ' + flag.name"
              (valueChange)="onFlagChange(flag.id, $event ?? '')"
              size="small"
            />
          </div>
          }
        </div>
        }
      </div>
    </ndt-toolbar-tool>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .header {
        flex-shrink: 0;
        display: flex;
        gap: var(--ndt-spacing-sm);
        margin-bottom: var(--ndt-spacing-md);

        ndt-input {
          flex: 1;
        }

        .filter-wrapper {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: var(--ndt-spacing-md);

          .filter-icon {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            opacity: 0.6;
          }

          ndt-select {
            flex: 0 0 auto;
            min-width: 180px;
          }
        }
      }

      .empty {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-md);
        flex: 1;
        min-height: 0;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--ndt-warning-border);
        border-radius: var(--ndt-border-radius-medium);
        padding: var(--ndt-spacing-md);
        background: var(--ndt-warning-background);
        color: var(--ndt-text-muted);
      }

      .flag-list {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-md);
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-right: var(--ndt-spacing-sm);

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: var(--ndt-background-secondary);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ndt-border-primary);
          border-radius: 4px;

          &:hover {
            background: var(--ndt-hover-bg);
          }
        }

        scrollbar-width: thin;
        scrollbar-color: var(--ndt-border-primary)
          var(--ndt-background-secondary);
      }

      .flag {
        display: flex;
        flex-direction: row;
        gap: var(--ndt-spacing-sm);
        background: var(--ndt-background-secondary);
        .info {
          flex: 0 0 65%;
          h3 {
            margin: 0;
            font-size: var(--ndt-font-size-md);
            color: var(--ndt-text-primary);
          }

          p {
            font-size: var(--ndt-font-size-xs);
            color: var(--ndt-text-muted);
          }
        }

        ndt-select {
          flex: 0 0 35%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarFeatureFlagsToolComponent {
  // Injects
  private readonly featureFlags = inject(DevToolbarInternalFeatureFlagService);

  // Signals
  protected readonly activeFilter = signal<FeatureFlagFilter>('all');
  protected readonly searchQuery = signal<string>('');

  protected readonly flags = this.featureFlags.flags;
  protected readonly hasNoFlags = computed(() => this.flags().length === 0);
  protected readonly filteredFlags = computed(() => {
    return this.flags().filter((flag) => {
      const searchTerm = this.searchQuery().toLowerCase();
      const flagName = flag.name.toLowerCase();
      const flagDescription = flag.description?.toLowerCase() ?? '';

      const matchesSearch =
        !this.searchQuery() ||
        flagName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flagDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        this.activeFilter() === 'all' ||
        (this.activeFilter() === 'forced' && flag.isForced) ||
        (this.activeFilter() === 'enabled' && flag.isEnabled) ||
        (this.activeFilter() === 'disabled' && !flag.isEnabled);

      return matchesSearch && matchesFilter;
    });
  });
  protected readonly hasNoFilteredFlags = computed(
    () => this.filteredFlags().length === 0
  );

  // Other properties
  protected readonly options = {
    title: 'Feature Flags',
    description: 'Manage the feature flags for your current session',
    isClosable: true,
    size: 'tall',
    id: 'ndt-feature-flags',
    isBeta: true,
  } as DevToolbarWindowOptions;

  protected readonly filterOptions = [
    { value: 'all', label: 'All Flags' },
    { value: 'forced', label: 'Forced' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly flagValueOptions = [
    { value: 'not-forced', label: 'Not Forced' },
    { value: 'off', label: 'Forced Off' },
    { value: 'on', label: 'Forced On' },
  ];

  // Public methods
  onFilterChange(value: string | undefined): void {
    const filter = this.filterOptions.find((f) => f.value === value);
    if (filter) {
      this.activeFilter.set(filter.value as FeatureFlagFilter);
    }
  }

  onFlagChange(flagId: string, value: string): void {
    switch (value) {
      case 'not-forced':
        this.featureFlags.removeFlagOverride(flagId);
        break;
      case 'on':
        this.featureFlags.setFlag(flagId, true);
        break;
      case 'off':
        this.featureFlags.setFlag(flagId, false);
        break;
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  // Protected methods
  protected getFlagValue(flag: DevToolbarFlag): string {
    if (!flag.isForced) return '';
    return flag.isEnabled ? 'on' : 'off';
  }
}
