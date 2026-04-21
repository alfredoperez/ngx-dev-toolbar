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
import { ToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { FeatureFlagFilter, ToolbarFlag } from './feature-flags.models';
@Component({
  selector: 'ndt-feature-flags-tool',
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
      toolTitle="Feature Flags"
      icon="toggle-left"
      [badge]="badgeCount()"
    >
      <div class="container">
        <ndt-tool-header
          [(searchQuery)]="searchQuery"
          [activeFilter]="activeFilter()"
          (activeFilterChange)="onFilterChange($event)"
          searchPlaceholder="Search flags by name or description"
          searchAriaLabel="Search feature flags"
          filterAriaLabel="Filter feature flags by state"
          [filterOptions]="filterOptions"
        />

        <ndt-list
          [hasItems]="!hasNoFlags()"
          [hasResults]="!hasNoFilteredFlags()"
          emptyMessage="No flags found"
          noResultsMessage="No flags found matching your filter"
        >
          @if (hasAnyGroups()) {
            @if (groupedFlags().pinned.length) {
              <ndt-list-group
                name="Pinned"
                [count]="groupedFlags().pinned.length"
                [collapsed]="isCollapsed('Pinned')"
                (collapsedChange)="setCollapsed('Pinned', $event)"
              >
                @for (flag of groupedFlags().pinned; track flag.id) {
                  <ng-container
                    *ngTemplateOutlet="flagItem; context: { $implicit: flag }"
                  />
                }
              </ndt-list-group>
            }
            @for (group of groupedFlags().groups; track group.name) {
              <ndt-list-group
                [name]="group.name"
                [count]="group.items.length"
                [collapsed]="isCollapsed(group.name)"
                (collapsedChange)="setCollapsed(group.name, $event)"
              >
                @for (flag of group.items; track flag.id) {
                  <ng-container
                    *ngTemplateOutlet="flagItem; context: { $implicit: flag }"
                  />
                }
              </ndt-list-group>
            }
            @if (groupedFlags().ungrouped.length) {
              <ndt-list-group
                name="Other"
                [count]="groupedFlags().ungrouped.length"
                [collapsed]="isCollapsed('Other')"
                (collapsedChange)="setCollapsed('Other', $event)"
              >
                @for (flag of groupedFlags().ungrouped; track flag.id) {
                  <ng-container
                    *ngTemplateOutlet="flagItem; context: { $implicit: flag }"
                  />
                }
              </ndt-list-group>
            }
          } @else {
            @for (flag of flatFlags(); track flag.id) {
              <ng-container
                *ngTemplateOutlet="flagItem; context: { $implicit: flag }"
              />
            }
          }
        </ndt-list>

        <ng-template #flagItem let-flag>
          <ndt-list-item
            [title]="flag.name"
            [description]="flag.description"
            [isForced]="flag.isForced"
            [currentValue]="flag.isEnabled"
            [originalValue]="flag.originalValue"
            [isPinned]="pinnedIds().has(flag.id)"
            [copyableId]="flag.id"
            (pinToggle)="togglePin(flag.id)"
            [showApply]="hasApplyCallback()"
            [applyState]="getApplyState(flag.id)"
            (applyToSource)="onApplyToSource(flag.id, flag.isEnabled)"
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
export class ToolbarFeatureFlagsToolComponent {
  // Injects
  private readonly featureFlags = inject(ToolbarInternalFeatureFlagService);
  private readonly storageService = inject(ToolbarStorageService);

  // Constants
  private readonly VIEW_STATE_KEY = 'feature-flags-view';

  // Signals
  protected readonly activeFilter = signal<FeatureFlagFilter>('all');
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
        const filter = saved.filter as FeatureFlagFilter;
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

  protected readonly flags = this.featureFlags.flags;

  // Computed badge count for forced values
  protected readonly badgeCount = computed(() => {
    const count = this.flags().filter((flag) => flag.isForced).length;
    if (count === 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  });
  protected readonly hasNoFlags = computed(() => this.flags().length === 0);

  // Filter step — search + filter applied to the raw flag list
  private readonly filteredFlags = computed(() => {
    return this.flags().filter((flag) => {
      const searchTerm = this.searchQuery().toLowerCase();
      const flagName = flag.name.toLowerCase();
      const flagDescription = flag.description?.toLowerCase() ?? '';

      const matchesSearch =
        !this.searchQuery() ||
        flagName.includes(searchTerm) ||
        flagDescription.includes(searchTerm);

      const matchesFilter =
        this.activeFilter() === 'all' ||
        (this.activeFilter() === 'forced' && flag.isForced) ||
        (this.activeFilter() === 'enabled' && flag.isEnabled) ||
        (this.activeFilter() === 'disabled' && !flag.isEnabled);

      return matchesSearch && matchesFilter;
    });
  });

  // Grouped view — pinned + named groups + ungrouped
  protected readonly groupedFlags = computed(() =>
    groupItems(this.filteredFlags(), this.pinnedIds())
  );

  // Backward-compat flat list (pinned-first then ungrouped) used when no item has a group
  protected readonly flatFlags = computed(() => {
    const { pinned, ungrouped } = this.groupedFlags();
    return [...pinned, ...ungrouped];
  });

  protected readonly hasAnyGroups = computed(
    () => this.groupedFlags().groups.length > 0
  );

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
  } as ToolbarWindowOptions;

  protected readonly filterOptions = [
    { value: 'forced', label: 'Forced' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly flagValueOptions = [
    { value: 'not-forced', label: 'Not Forced' },
    { value: 'off', label: 'Forced Off' },
    { value: 'on', label: 'Forced On' },
  ];

  // Apply to source (delegated to internal service)
  protected readonly hasApplyCallback = this.featureFlags.hasApplyCallback;

  protected getApplyState(
    flagId: string
  ): 'idle' | 'loading' | 'success' | 'error' {
    return this.featureFlags.applyStates()[flagId] ?? 'idle';
  }

  protected onApplyToSource(flagId: string, value: boolean): void {
    this.featureFlags.applyToSource(flagId, value);
  }

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

  togglePin(flagId: string): void {
    this.pinnedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(flagId)) {
        next.delete(flagId);
      } else {
        next.add(flagId);
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
  protected getFlagValue(flag: ToolbarFlag): string {
    if (!flag.isForced) return '';
    return flag.isEnabled ? 'on' : 'off';
  }

  protected getFlagPlaceholder(flag: ToolbarFlag): string {
    return flag.isEnabled ? 'On' : 'Off';
  }
}
