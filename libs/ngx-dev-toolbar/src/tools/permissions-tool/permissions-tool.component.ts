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
import { ToolbarInternalPermissionsService } from './permissions-internal.service';
import {
  ToolbarPermission,
  PermissionFilter,
} from './permissions.models';

@Component({
  selector: 'ndt-permissions-tool',
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
      title="Permissions"
      icon="lock"
      [badge]="badgeCount()"
    >
      <div class="container">
        <div class="tool-header">
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search permissions..."
            [ariaLabel]="'Search permissions'"
          />
          <div class="filter-wrapper">
            <ndt-icon name="filter" class="filter-icon" />
            <ndt-select
              [value]="activeFilter()"
              [options]="filterOptions"
              [size]="'medium'"
              (valueChange)="onFilterChange($event)"
              [ariaLabel]="'Filter permissions by state'"
            />
          </div>
        </div>

        <ndt-list
          [hasItems]="!hasNoPermissions()"
          [hasResults]="!hasNoFilteredPermissions()"
          emptyMessage="No permissions found"
          [emptyHint]="'Call setAvailableOptions() to configure permissions'"
          noResultsMessage="No permissions match your filter"
        >
          @for (permission of filteredPermissions(); track permission.id) {
            <ndt-list-item
              [title]="permission.name"
              [description]="permission.description"
              [isForced]="permission.isForced"
              [currentValue]="permission.isGranted"
              [originalValue]="permission.originalValue"
            >
              <ndt-select
                [value]="getPermissionValue(permission)"
                [options]="permissionValueOptions"
                [ariaLabel]="'Override state for ' + permission.name"
                (valueChange)="onPermissionChange(permission.id, $event ?? '')"
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
        const filter = saved.filter as PermissionFilter;
        if (['all', 'forced', 'granted', 'denied'].includes(filter)) {
          this.activeFilter.set(filter);
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
  protected readonly filteredPermissions = computed(() => {
    const filtered = this.permissions().filter((permission) => {
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

    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  });
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
    isBeta: true,
  } as ToolbarWindowOptions;

  protected readonly filterOptions = [
    { value: 'all', label: 'All Permissions' },
    { value: 'forced', label: 'Forced' },
    { value: 'granted', label: 'Granted' },
    { value: 'denied', label: 'Denied' },
  ];

  protected readonly permissionValueOptions = [
    { value: 'not-forced', label: 'Not Forced' },
    { value: 'denied', label: 'Forced Denied' },
    { value: 'granted', label: 'Forced Granted' },
  ];

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

  // Protected methods
  protected getPermissionValue(permission: ToolbarPermission): string {
    if (!permission.isForced) return '';
    return permission.isGranted ? 'granted' : 'denied';
  }
}
