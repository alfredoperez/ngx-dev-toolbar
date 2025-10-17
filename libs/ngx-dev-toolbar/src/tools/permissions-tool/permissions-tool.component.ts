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
import { DevToolbarInternalPermissionsService } from './permissions-internal.service';
import {
  DevToolbarPermission,
  PermissionFilter,
  PermissionValue,
} from './permissions.models';

@Component({
  selector: 'ndt-permissions-tool',
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
      title="Permissions"
      icon="lock"
    >
      <div class="container">
        <div class="header">
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

        @if (hasNoPermissions()) {
        <div class="empty">
          <p>No permissions found</p>
          <p class="hint">Call setAvailableOptions() to configure permissions</p>
        </div>
        } @else if (hasNoFilteredPermissions()) {
        <div class="empty">
          <p>No permissions match your filter</p>
        </div>
        } @else {
        <div class="permission-list">
          @for (permission of filteredPermissions(); track permission.id) {
          <div class="permission">
            <div class="info">
              <h3>{{ permission.name }}</h3>
              <p>{{ permission?.description }}</p>
            </div>

            <ndt-select
              [value]="getPermissionValue(permission)"
              [options]="permissionValueOptions"
              [ariaLabel]="'Override state for ' + permission.name"
              (valueChange)="onPermissionChange(permission.id, $event ?? '')"
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

        p {
          margin: 0;
        }

        .hint {
          font-size: var(--ndt-font-size-xs);
        }
      }

      .permission-list {
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

      .permission {
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
export class DevToolbarPermissionsToolComponent {
  // Injects
  private readonly permissionsService = inject(
    DevToolbarInternalPermissionsService
  );

  // Signals
  protected readonly activeFilter = signal<PermissionFilter>('all');
  protected readonly searchQuery = signal<string>('');

  protected readonly permissions = this.permissionsService.permissions;
  protected readonly hasNoPermissions = computed(
    () => this.permissions().length === 0
  );
  protected readonly filteredPermissions = computed(() => {
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
  } as DevToolbarWindowOptions;

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
  protected getPermissionValue(permission: DevToolbarPermission): string {
    if (!permission.isForced) return '';
    return permission.isGranted ? 'granted' : 'denied';
  }
}
