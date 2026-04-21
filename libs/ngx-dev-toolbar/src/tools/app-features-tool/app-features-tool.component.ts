import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolbarListComponent } from '../../components/list/list.component';
import { ToolbarListItemComponent } from '../../components/list-item/list-item.component';
import { ToolbarSelectComponent } from '../../components/select/select.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarToolHeaderComponent } from '../../components/tool-header/tool-header.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { ToolViewState } from '../../models/tool-view-state.models';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarInternalAppFeaturesService } from './app-features-internal.service';
import { AppFeatureFilter, ToolbarAppFeature } from './app-features.models';

/**
 * Component for managing app features in the dev toolbar.
 *
 * Provides UI for:
 * - Searching features by name and description
 * - Filtering features by state (all/forced/enabled/disabled)
 * - Forcing features to enabled/disabled state via 3-state dropdown
 * - Viewing feature descriptions and current state
 *
 * @example
 * ```html
 * <ndt-app-features-tool />
 * ```
 */
@Component({
  selector: 'ndt-app-features-tool',
  standalone: true,
  imports: [
    FormsModule,
    ToolbarToolComponent,
    ToolbarToolHeaderComponent,
    ToolbarSelectComponent,
    ToolbarListComponent,
    ToolbarListItemComponent,
  ],
  template: `
    <ndt-toolbar-tool
      [options]="options"
      toolTitle="App Features"
      icon="puzzle"
      [badge]="badgeCount()"
    >
      <div class="container">
        <ndt-tool-header
          [(searchQuery)]="searchQuery"
          [activeFilter]="activeFilter()"
          (activeFilterChange)="onFilterChange($event)"
          searchPlaceholder="Search features by name or description"
          searchAriaLabel="Search app features"
          filterAriaLabel="Filter app features by state"
          [filterOptions]="filterOptions"
        />

        <ndt-list
          [hasItems]="!hasNoFeatures()"
          [hasResults]="!hasNoFilteredFeatures()"
          emptyMessage="No app features found"
          [emptyHint]="'Call setAvailableOptions() to configure features'"
          noResultsMessage="No features match your filter"
        >
          @for (feature of filteredFeatures(); track feature.id) {
            <ndt-list-item
              [title]="feature.name"
              [description]="feature.description"
              [isForced]="feature.isForced"
              [currentValue]="feature.isEnabled"
              [originalValue]="feature.originalValue"
              [isPinned]="pinnedIds().has(feature.id)"
              [copyableId]="feature.id"
              (pinToggle)="togglePin(feature.id)"
              [showApply]="hasApplyCallback()"
              [applyState]="getApplyState(feature.id)"
              (applyToSource)="onApplyToSource(feature.id, feature.isEnabled)"
            >
              <ndt-select
                [value]="getFeatureValue(feature)"
                [options]="featureValueOptions"
                [ariaLabel]="'Set value for ' + feature.name"
                (valueChange)="onFeatureChange(feature.id, $event ?? '')"
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarAppFeaturesToolComponent {
  // Injects
  private readonly appFeaturesService = inject(ToolbarInternalAppFeaturesService);
  private readonly storageService = inject(ToolbarStorageService);

  // Constants
  private readonly VIEW_STATE_KEY = 'app-features-view';

  // Signals
  protected readonly activeFilter = signal<AppFeatureFilter>('all');
  protected readonly searchQuery = signal<string>('');
  protected readonly pinnedIds = signal<Set<string>>(new Set());

  constructor() {
    this.loadViewState();

    // Save view state on changes
    effect(() => {
      const state: ToolViewState = {
        searchQuery: this.searchQuery(),
        filter: this.activeFilter(),
        sortOrder: 'asc',
        pinnedIds: [...this.pinnedIds()],
      };
      this.storageService.set(this.VIEW_STATE_KEY, state);
    });
  }

  private loadViewState(): void {
    try {
      const saved = this.storageService.get<ToolViewState>(this.VIEW_STATE_KEY);
      if (saved) {
        this.searchQuery.set(saved.searchQuery ?? '');
        const filter = saved.filter as AppFeatureFilter;
        if (['all', 'forced', 'enabled', 'disabled'].includes(filter)) {
          this.activeFilter.set(filter);
        }
        if (saved.pinnedIds?.length) {
          this.pinnedIds.set(new Set(saved.pinnedIds));
        }
      }
    } catch {
      // Use defaults on error
    }
  }

  protected readonly features = this.appFeaturesService.features;

  // Computed badge count for forced values
  protected readonly badgeCount = computed(() => {
    const count = this.features().filter((f) => f.isForced).length;
    if (count === 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  });
  protected readonly hasNoFeatures = computed(() => this.features().length === 0);
  protected readonly filteredFeatures = computed(() => {
    const filtered = this.features().filter((feature) => {
      const searchTerm = this.searchQuery().toLowerCase();
      const featureName = feature.name.toLowerCase();
      const featureDescription = feature.description?.toLowerCase() ?? '';

      const matchesSearch =
        !this.searchQuery() ||
        featureName.includes(searchTerm) ||
        featureDescription.includes(searchTerm);

      const matchesFilter =
        this.activeFilter() === 'all' ||
        (this.activeFilter() === 'forced' && feature.isForced) ||
        (this.activeFilter() === 'enabled' && feature.isEnabled) ||
        (this.activeFilter() === 'disabled' && !feature.isEnabled);

      return matchesSearch && matchesFilter;
    });

    const pinned = this.pinnedIds();
    // Sort pinned first, then alphabetically within each group
    return filtered.sort((a, b) => {
      const aPinned = pinned.has(a.id);
      const bPinned = pinned.has(b.id);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  });
  protected readonly hasNoFilteredFeatures = computed(
    () => this.filteredFeatures().length === 0
  );

  // Other properties
  protected readonly options = {
    title: 'App Features',
    description: 'Override product features to test different tiers and configurations',
    isClosable: true,
    size: 'tall',
    id: 'ndt-app-features',
  } as ToolbarWindowOptions;

  protected readonly filterOptions = [
    { value: 'forced', label: 'Forced' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly featureValueOptions = [
    { value: 'not-forced', label: 'Not Forced' },
    { value: 'off', label: 'Disabled' },
    { value: 'on', label: 'Enabled' },
  ];

  // Apply to source (delegated to internal service)
  protected readonly hasApplyCallback = this.appFeaturesService.hasApplyCallback;

  protected getApplyState(
    featureId: string
  ): 'idle' | 'loading' | 'success' | 'error' {
    return this.appFeaturesService.applyStates()[featureId] ?? 'idle';
  }

  protected onApplyToSource(featureId: string, value: boolean): void {
    this.appFeaturesService.applyToSource(featureId, value);
  }

  // Public methods
  /**
   * Handle filter dropdown change.
   * Updates the active filter to show all/forced/enabled/disabled features.
   */
  onFilterChange(value: string | undefined): void {
    const filter = this.filterOptions.find((f) => f.value === value);
    if (filter) {
      this.activeFilter.set(filter.value as AppFeatureFilter);
    }
  }

  /**
   * Handle feature value change from 3-state dropdown.
   * - 'not-forced': Remove forced override
   * - 'on': Force feature to enabled
   * - 'off': Force feature to disabled
   */
  onFeatureChange(featureId: string, value: string): void {
    switch (value) {
      case 'not-forced':
        this.appFeaturesService.removeFeatureOverride(featureId);
        break;
      case 'on':
        this.appFeaturesService.setFeature(featureId, true);
        break;
      case 'off':
        this.appFeaturesService.setFeature(featureId, false);
        break;
    }
  }

  /**
   * Handle search input change.
   * Updates the search query to filter features by name/description.
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  togglePin(featureId: string): void {
    this.pinnedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  }

  // Protected methods
  /**
   * Get the dropdown value for a feature's current state.
   * - Returns empty string if not forced (natural state)
   * - Returns 'on' if forced to enabled
   * - Returns 'off' if forced to disabled
   */
  protected getFeatureValue(feature: ToolbarAppFeature): string {
    if (!feature.isForced) return '';
    return feature.isEnabled ? 'on' : 'off';
  }
}
