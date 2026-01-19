import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ToolbarService } from '../../models/toolbar.interface';
import { ToolbarInternalPermissionsService } from './permissions-internal.service';
import { ToolbarPermission, ForcedPermissionsState } from './permissions.models';

/**
 * Public service for integrating the Permissions Tool with your application.
 * Use this service to:
 * 1. Register your application's permissions with setAvailableOptions()
 * 2. Listen for toolbar permission overrides with getForcedValues()
 * 3. Apply preset permission states for testing with applyPreset()
 *
 * @example
 * ```typescript
 * constructor(private permissionsService: ToolbarPermissionsService) {
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
export class ToolbarPermissionsService
  implements ToolbarService<ToolbarPermission>
{
  private internalService = inject(ToolbarInternalPermissionsService);

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
  setAvailableOptions(permissions: ToolbarPermission[]): void {
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
  getForcedValues(): Observable<ToolbarPermission[]> {
    return this.internalService.getForcedPermissions();
  }

  /**
   * Gets ALL permission values with overrides already applied.
   * Returns the complete set of permissions where overridden values replace base values.
   * Each permission includes an `isForced` property indicating if it was overridden.
   *
   * This method simplifies integration by eliminating the need to manually merge
   * base permissions with overrides using combineLatest.
   *
   * @returns Observable of all permissions with overrides applied
   *
   * @example
   * ```typescript
   * // Simple permission check with overrides applied
   * this.permissionsService.getValues().pipe(
   *   map(permissions => permissions.find(p => p.id === 'can-edit')),
   *   map(permission => permission?.isGranted ?? false)
   * ).subscribe(canEdit => {
   *   if (canEdit) {
   *     // Enable edit functionality
   *   }
   * });
   * ```
   */
  getValues(): Observable<ToolbarPermission[]> {
    return this.internalService.permissions$;
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
