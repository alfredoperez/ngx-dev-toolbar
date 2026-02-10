import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolbarIconComponent } from '../../components/icons/icon.component';
import { ToolbarInputComponent } from '../../components/input/input.component';
import { ToolbarListComponent } from '../../components/list/list.component';
import { ToolbarListItemComponent } from '../../components/list-item/list-item.component';
import { ToolbarSelectComponent } from '../../components/select/select.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { ToolViewState } from '../../models/tool-view-state.models';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { ToolbarFlag, FeatureFlagFilter } from './feature-flags.models';
@Component({
  selector: 'ndt-feature-flags-tool',
  standalone: true,
  imports: [
    FormsModule,
    ToolbarToolComponent,
    ToolbarInputComponent,
    ToolbarSelectComponent,
    ToolbarIconComponent,
    ToolbarListComponent,
    ToolbarListItemComponent,
  ],
  template: `
    <ndt-toolbar-tool
      [options]="options"
      title="Feature Flags"
      icon="toggle-left"
      [badge]="badgeCount()"
    >
      <div class="container">
        <div class="tool-header">
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
              [placeholder]="getFlagPlaceholder(flag)"
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
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
      }

      .tool-header {
        position: relative;
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
export class ToolbarFeatureFlagsToolComponent {
  // Injects
  private readonly featureFlags = inject(ToolbarInternalFeatureFlagService);
  private readonly storageService = inject(ToolbarStorageService);

  // Constants
  private readonly VIEW_STATE_KEY = 'feature-flags-view';

  // Signals
  protected readonly activeFilter = signal<FeatureFlagFilter>('all');
  protected readonly searchQuery = signal<string>('');

  constructor() {
    this.loadViewState();

    // Save view state on changes
    effect(() => {
      const state: ToolViewState = {
        searchQuery: this.searchQuery(),
        filter: this.activeFilter(),
        sortOrder: 'asc',
      };
      this.storageService.set(this.VIEW_STATE_KEY, state);
    });
  }

  private loadViewState(): void {
    try {
      const saved = this.storageService.get<ToolViewState>(this.VIEW_STATE_KEY);
      if (saved) {
        this.searchQuery.set(saved.searchQuery ?? '');
        const filter = saved.filter as FeatureFlagFilter;
        if (['all', 'forced', 'enabled', 'disabled'].includes(filter)) {
          this.activeFilter.set(filter);
        }
      }
    } catch {
      // Use defaults on error
    }
  }

  protected readonly flags = this.featureFlags.flags;

  // Computed badge count for forced values
  protected readonly badgeCount = computed(() => {
    const count = this.flags().filter((flag) => flag.isForced).length;
    if (count === 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  });
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
  } as ToolbarWindowOptions;

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
  protected getFlagValue(flag: ToolbarFlag): string {
    if (!flag.isForced) return '';
    return flag.isEnabled ? 'on' : 'off';
  }

  protected getFlagPlaceholder(flag: ToolbarFlag): string {
    return flag.isEnabled ? 'On' : 'Off';
  }
}
