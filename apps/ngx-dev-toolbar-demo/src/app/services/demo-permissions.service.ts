import { Injectable, inject, signal } from '@angular/core';
import {
  ToolbarPermissionsService,
  ToolbarPermission,
} from 'ngx-dev-toolbar';

/**
 * Demo service for managing permissions in the demo application.
 * This service demonstrates how to integrate the permissions tool with your application.
 *
 * Integration Points:
 * 1. Call setAvailableOptions() in constructor to register permissions with the toolbar
 * 2. Subscribe to getValues() to receive all permissions with overrides already applied
 * 3. Use the permissions signal in your components to check permissions
 * 4. Implement hasPermission() method for easy permission checking
 */
@Injectable({ providedIn: 'root' })
export class DemoPermissionsService {
  private readonly permissionsService = inject(ToolbarPermissionsService);

  /**
   * Define sample permissions for the demo application.
   * In a real app, these would come from your backend/auth service.
   */
  private readonly samplePermissions: ToolbarPermission[] = [
    {
      id: 'can-add-users',
      name: 'Add Users',
      description: 'Can add new users to the system',
      isGranted: false,
      isForced: false,
    },
    {
      id: 'can-add-permissions',
      name: 'Add Permissions',
      description: 'Can assign permissions to users',
      isGranted: false,
      isForced: false,
    },
    {
      id: 'can-manage-comments',
      name: 'Manage Comments',
      description: 'Can moderate and manage comments',
      isGranted: true,
      isForced: false,
    },
    {
      id: 'can-view-dashboard',
      name: 'View Dashboard',
      description: 'Can view the analytics dashboard',
      isGranted: false,
      isForced: false,
    },
    {
      id: 'can-admin',
      name: 'Admin Access',
      description: 'Full admin access to all features',
      isGranted: false,
      isForced: false,
    },
  ];

  /**
   * Signal holding the current permissions state.
   * This is updated when toolbar forces permission changes.
   */
  public readonly permissions = signal<Record<string, boolean>>(
    this.buildPermissionsMap(this.samplePermissions)
  );

  constructor() {
    // Register permissions with the toolbar
    this.permissionsService.setAvailableOptions(this.samplePermissions);

    // Listen for permission changes from the toolbar (with overrides already applied)
    this.permissionsService.getValues().subscribe((allPermissions) => {
      // Update local permissions state with all values (natural + overrides)
      const updatedPermissions = this.buildPermissionsMap(allPermissions);
      this.permissions.set(updatedPermissions);
    });
  }

  /**
   * Check if a specific permission is granted.
   * Use this method in your components/guards.
   */
  hasPermission(id: string): boolean {
    return this.permissions()[id] ?? false;
  }

  /**
   * Convert permission array to a map for easy lookup.
   */
  private buildPermissionsMap(
    permissions: ToolbarPermission[]
  ): Record<string, boolean> {
    return permissions.reduce(
      (acc, permission) => {
        acc[permission.id] = permission.isGranted;
        return acc;
      },
      {} as Record<string, boolean>
    );
  }
}
