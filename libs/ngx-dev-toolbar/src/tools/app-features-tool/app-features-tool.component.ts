import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolbarListGroupComponent } from '../../components/list-group/list-group.component';
import { ToolbarListItemComponent } from '../../components/list-item/list-item.component';
import { ToolbarListComponent } from '../../components/list/list.component';
import { ToolbarSelectComponent } from '../../components/select/select.component';
import { ToolbarToolHeaderComponent } from '../../components/tool-header/tool-header.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { ToolViewState } from '../../models/tool-view-state.models';
import { groupItems } from '../../utils/group-items.util';
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
    NgTemplateOutlet,
    FormsModule,
    ToolbarToolComponent,
    ToolbarToolHeaderComponent,
    ToolbarSelectComponent,
    ToolbarListComponent,
    ToolbarListGroupComponent,
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
          @if (hasAnyGroups()) {
            @if (groupedFeatures().pinned.length) {
              <ndt-list-group
                name="Pinned"
                [count]="groupedFeatures().pinned.length"
                [collapsed]="isCollapsed('Pinned')"
                (collapsedChange)="setCollapsed('Pinned', $event)"
              >
                @for (feature of groupedFeatures().pinned; track feature.id) {
                  <ng-container
                    *ngTemplateOutlet="
                      featureItem;
                      context: { $implicit: feature }
                    "
                  />
                }
              </ndt-list-group>
            }
            @for (group of groupedFeatures().groups; track group.name) {
              <ndt-list-group
                [name]="group.name"
                [count]="group.items.length"
                [collapsed]="isCollapsed(group.name)"
                (collapsedChange)="setCollapsed(group.name, $event)"
              >
                @for (feature of group.items; track feature.id) {
                  <ng-container
                    *ngTemplateOutlet="
                      featureItem;
                      context: { $implicit: feature }
                    "
                  />
                }
              </ndt-list-group>
            }
            @if (groupedFeatures().ungrouped.length) {
              <ndt-list-group
                name="Other"
                [count]="groupedFeatures().ungrouped.length"
                [collapsed]="isCollapsed('Other')"
                (collapsedChange)="setCollapsed('Other', $event)"
              >
                @for (feature of groupedFeatures().ungrouped; track feature.id) {
                  <ng-container
                    *ngTemplateOutlet="
                      featureItem;
                      context: { $implicit: feature }
                    "
                  />
                }
              </ndt-list-group>
            }
          } @else {
            @for (feature of flatFeatures(); track feature.id) {
              <ng-container
                *ngTemplateOutlet="
                  featureItem;
                  context: { $implicit: feature }
                "
              />
            }
          }
        </ndt-list>

        <ng-template #featureItem let-feature>
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
        </ng-template>
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
  protected readonly collapsedGroups = signal<Set<string>>(new Set());

  constructor() {
    this.loadViewState();

    // Save view state on changes
    effect(() => {
      const state: ToolViewState = {
        searchQuery: this.searchQuery(),
        filter: this.activeFilter(),
        sortOrder: 'asc',
        pinnedIds: [...this.pinnedIds()],
        collapsedGroups: [...this.collapsedGroups()],
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
        if (saved.collapsedGroups?.length) {
          this.collapsedGroups.set(new Set(saved.collapsedGroups));
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

  private readonly filteredFeatures = computed(() => {
    return this.features().filter((feature) => {
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
  });

  protected readonly groupedFeatures = computed(() =>
    groupItems(this.filteredFeatures(), this.pinnedIds())
  );

  protected readonly flatFeatures = computed(() => {
    const { pinned, ungrouped } = this.groupedFeatures();
    return [...pinned, ...ungrouped];
  });

  protected readonly hasAnyGroups = computed(
    () => this.groupedFeatures().groups.length > 0
  );

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

  protected isCollapsed(name: string): boolean {
    return this.collapsedGroups().has(name);
  }

  protected setCollapsed(name: string, collapsed: boolean): void {
    this.collapsedGroups.update((set) => {
      const next = new Set(set);
      if (collapsed) {
        next.add(name);
      } else {
        next.delete(name);
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
