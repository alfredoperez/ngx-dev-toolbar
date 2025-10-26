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
import { DevToolbarListComponent } from '../../components/list/list.component';
import { DevToolbarListItemComponent } from '../../components/list-item/list-item.component';
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
    DevToolbarListComponent,
    DevToolbarListItemComponent,
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

        <ndt-list
          [hasItems]="!hasNoFlags()"
          [hasResults]="!hasNoFilteredFlags()"
          emptyMessage="No flags found"
          noResultsMessage="No flags found matching your filter"
        >
          @for (flag of filteredFlags(); track flag.id) {
            <ndt-list-item
              [title]="flag.name"
              [description]="flag.description"
              [isForced]="flag.isForced"
              [currentValue]="flag.isEnabled"
              [originalValue]="flag.originalValue"
            >
              <ndt-select
                [value]="getFlagValue(flag)"
                [options]="flagValueOptions"
                [ariaLabel]="'Set value for ' + flag.name"
                (valueChange)="onFlagChange(flag.id, $event ?? '')"
                size="small"
              />
            </ndt-list-item>
          }
        </ndt-list>
      </div>
    </ndt-toolbar-tool>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        margin-top: var(--ndt-spacing-sm); // Defensive spacing against CSS resets
      }

      .header {
        flex-shrink: 0;
        display: flex;
        gap: var(--ndt-spacing-sm);
        margin-bottom: var(--ndt-spacing-sm);

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
    const filtered = this.flags().filter((flag) => {
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

    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
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
