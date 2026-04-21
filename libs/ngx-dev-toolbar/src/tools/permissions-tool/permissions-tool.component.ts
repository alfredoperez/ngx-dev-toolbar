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
import { ToolbarInternalPermissionsService } from './permissions-internal.service';
import {
  PermissionFilter,
  ToolbarPermission,
} from './permissions.models';

@Component({
  selector: 'ndt-permissions-tool',
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
      toolTitle="Permissions"
      icon="lock"
      [badge]="badgeCount()"
    >
      <div class="container">
        <ndt-tool-header
          [(searchQuery)]="searchQuery"
          [activeFilter]="activeFilter()"
          (activeFilterChange)="onFilterChange($event)"
          searchPlaceholder="Search permissions by name or description"
          searchAriaLabel="Search permissions"
          filterAriaLabel="Filter permissions by state"
          [filterOptions]="filterOptions"
        />

        <ndt-list
          [hasItems]="!hasNoPermissions()"
          [hasResults]="!hasNoFilteredPermissions()"
          emptyMessage="No permissions found"
          [emptyHint]="'Call setAvailableOptions() to configure permissions'"
          noResultsMessage="No permissions match your filter"
        >
          @if (hasAnyGroups()) {
            @if (groupedPermissions().pinned.length) {
              <ndt-list-group
                name="Pinned"
                [count]="groupedPermissions().pinned.length"
                [collapsed]="isCollapsed('Pinned')"
                (collapsedChange)="setCollapsed('Pinned', $event)"
              >
                @for (
                  permission of groupedPermissions().pinned;
                  track permission.id
                ) {
                  <ng-container
                    *ngTemplateOutlet="
                      permissionItem;
                      context: { $implicit: permission }
                    "
                  />
                }
              </ndt-list-group>
            }
            @for (group of groupedPermissions().groups; track group.name) {
              <ndt-list-group
                [name]="group.name"
                [count]="group.items.length"
                [collapsed]="isCollapsed(group.name)"
                (collapsedChange)="setCollapsed(group.name, $event)"
              >
                @for (permission of group.items; track permission.id) {
                  <ng-container
                    *ngTemplateOutlet="
                      permissionItem;
                      context: { $implicit: permission }
                    "
                  />
                }
              </ndt-list-group>
            }
            @if (groupedPermissions().ungrouped.length) {
              <ndt-list-group
                name="Other"
                [count]="groupedPermissions().ungrouped.length"
                [collapsed]="isCollapsed('Other')"
                (collapsedChange)="setCollapsed('Other', $event)"
              >
                @for (
                  permission of groupedPermissions().ungrouped;
                  track permission.id
                ) {
                  <ng-container
                    *ngTemplateOutlet="
                      permissionItem;
                      context: { $implicit: permission }
                    "
                  />
                }
              </ndt-list-group>
            }
          } @else {
            @for (permission of flatPermissions(); track permission.id) {
              <ng-container
                *ngTemplateOutlet="
                  permissionItem;
                  context: { $implicit: permission }
                "
              />
            }
          }
        </ndt-list>

        <ng-template #permissionItem let-permission>
          <ndt-list-item
            [title]="permission.name"
            [description]="permission.description"
            [isForced]="permission.isForced"
            [currentValue]="permission.isGranted"
            [originalValue]="permission.originalValue"
            [isPinned]="pinnedIds().has(permission.id)"
            [copyableId]="permission.id"
            (pinToggle)="togglePin(permission.id)"
            [showApply]="hasApplyCallback()"
            [applyState]="getApplyState(permission.id)"
            (applyToSource)="
              onApplyToSource(permission.id, permission.isGranted)
            "
          >
            <ndt-select
              [value]="getPermissionValue(permission)"
              [options]="permissionValueOptions"
              [ariaLabel]="'Override state for ' + permission.name"
              (valueChange)="onPermissionChange(permission.id, $event ?? '')"
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
export class ToolbarPermissionsToolComponent {
  // Injects
  private readonly permissionsService = inject(
    ToolbarInternalPermissionsService
  );
  private readonly storageService = inject(ToolbarStorageService);

  // Constants
  private readonly VIEW_STATE_KEY = 'permissions-view';

  // Signals
  protected readonly activeFilter = signal<PermissionFilter>('all');
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
        const filter = saved.filter as PermissionFilter;
        if (['all', 'forced', 'granted', 'denied'].includes(filter)) {
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

  protected readonly permissions = this.permissionsService.permissions;

  // Computed badge count for forced values
  protected readonly badgeCount = computed(() => {
    const count = this.permissions().filter((p) => p.isForced).length;
    if (count === 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  });
  protected readonly hasNoPermissions = computed(
    () => this.permissions().length === 0
  );

  private readonly filteredPermissions = computed(() => {
    return this.permissions().filter((permission) => {
      const searchTerm = this.searchQuery().toLowerCase();
      const permissionName = permission.name.toLowerCase();
      const permissionDescription = permission.description?.toLowerCase() ?? '';

      const matchesSearch =
        !this.searchQuery() ||
        permissionName.includes(searchTerm) ||
        permissionDescription.includes(searchTerm);

      const matchesFilter =
        this.activeFilter() === 'all' ||
        (this.activeFilter() === 'forced' && permission.isForced) ||
        (this.activeFilter() === 'granted' && permission.isGranted) ||
        (this.activeFilter() === 'denied' && !permission.isGranted);

      return matchesSearch && matchesFilter;
    });
  });

  protected readonly groupedPermissions = computed(() =>
    groupItems(this.filteredPermissions(), this.pinnedIds())
  );

  protected readonly flatPermissions = computed(() => {
    const { pinned, ungrouped } = this.groupedPermissions();
    return [...pinned, ...ungrouped];
  });

  protected readonly hasAnyGroups = computed(
    () => this.groupedPermissions().groups.length > 0
  );

  protected readonly hasNoFilteredPermissions = computed(
    () => this.filteredPermissions().length === 0
  );

  // Other properties
  protected readonly options = {
    title: 'Permissions',
    description: 'Manage permission overrides for your current session',
    isClosable: true,
    size: 'tall',
    id: 'ndt-permissions',
  } as ToolbarWindowOptions;

  protected readonly filterOptions = [
    { value: 'forced', label: 'Forced' },
    { value: 'granted', label: 'Granted' },
    { value: 'denied', label: 'Denied' },
  ];

  protected readonly permissionValueOptions = [
    { value: 'not-forced', label: 'Not Forced' },
    { value: 'denied', label: 'Forced Denied' },
    { value: 'granted', label: 'Forced Granted' },
  ];

  // Apply to source (delegated to internal service)
  protected readonly hasApplyCallback = this.permissionsService.hasApplyCallback;

  protected getApplyState(
    permissionId: string
  ): 'idle' | 'loading' | 'success' | 'error' {
    return this.permissionsService.applyStates()[permissionId] ?? 'idle';
  }

  protected onApplyToSource(permissionId: string, value: boolean): void {
    this.permissionsService.applyToSource(permissionId, value);
  }

  // Public methods
  onFilterChange(value: string | undefined): void {
    const filter = this.filterOptions.find((f) => f.value === value);
    if (filter) {
      this.activeFilter.set(filter.value as PermissionFilter);
    }
  }

  onPermissionChange(id: string, value: string): void {
    switch (value) {
      case 'not-forced':
        this.permissionsService.removePermissionOverride(id);
        break;
      case 'granted':
        this.permissionsService.setPermission(id, true);
        break;
      case 'denied':
        this.permissionsService.setPermission(id, false);
        break;
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  togglePin(permissionId: string): void {
    this.pinnedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
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
  protected getPermissionValue(permission: ToolbarPermission): string {
    if (!permission.isForced) return '';
    return permission.isGranted ? 'granted' : 'denied';
  }
}
