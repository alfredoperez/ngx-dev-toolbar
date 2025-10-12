import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DevToolsService } from '../../models/dev-tools.interface';
import { DevToolbarInternalPermissionsService } from './permissions-internal.service';
import { DevToolbarPermission, ForcedPermissionsState } from './permissions.models';

/**
 * Public service for integrating the Permissions Tool with your application.
 * Use this service to:
 * 1. Register your application's permissions with setAvailableOptions()
 * 2. Listen for toolbar permission overrides with getForcedValues()
 * 3. Apply preset permission states for testing with applyPreset()
 *
 * @example
 * ```typescript
 * constructor(private permissionsService: DevToolbarPermissionsService) {
 *   // Register permissions
 *   this.permissionsService.setAvailableOptions([
 *     { id: 'can-edit', name: 'Can Edit', isGranted: false, isForced: false }
 *   ]);
 *
 *   // Listen for overrides
 *   this.permissionsService.getForcedValues().subscribe(forcedPermissions => {
 *     // Update your app's permission state
 *   });
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DevToolbarPermissionsService
  implements DevToolsService<DevToolbarPermission>
{
  private internalService = inject(DevToolbarInternalPermissionsService);

  /**
   * Sets the available permissions that will be displayed in the toolbar tool.
   * Call this in your app initialization to register permissions.
   *
   * @param permissions Array of permissions to display in the toolbar
   *
   * @example
   * ```typescript
   * this.permissionsService.setAvailableOptions([
   *   {
   *     id: 'can-edit-posts',
   *     name: 'Edit Posts',
   *     description: 'Can edit blog posts',
   *     isGranted: false,
   *     isForced: false
   *   }
   * ]);
   * ```
   */
  setAvailableOptions(permissions: DevToolbarPermission[]): void {
    this.internalService.setAppPermissions(permissions);
  }

  /**
   * Gets an observable of permissions that were forced/overridden through the toolbar.
   * Subscribe to this to update your application's permission state.
   *
   * @returns Observable emitting array of forced permissions whenever changes occur
   *
   * @example
   * ```typescript
   * this.permissionsService.getForcedValues().subscribe(forcedPermissions => {
   *   forcedPermissions.forEach(permission => {
   *     this.updatePermission(permission.id, permission.isGranted);
   *   });
   * });
   * ```
   */
  getForcedValues(): Observable<DevToolbarPermission[]> {
    return this.internalService.getForcedPermissions();
  }

  /**
   * Apply a preset permission state. Useful for automated testing scenarios.
   *
   * @param state The forced permissions state to apply
   *
   * @example
   * ```typescript
   * this.permissionsService.applyPreset({
   *   granted: ['can-edit-posts'],
   *   denied: ['can-delete-posts']
   * });
   * ```
   */
  applyPreset(state: ForcedPermissionsState): void {
    this.internalService.applyPresetPermissions(state);
  }

  /**
   * Get the current forced permission state.
   *
   * @returns Current forced permissions state
   */
  getCurrentState(): ForcedPermissionsState {
    return this.internalService.getCurrentForcedState();
  }
}
