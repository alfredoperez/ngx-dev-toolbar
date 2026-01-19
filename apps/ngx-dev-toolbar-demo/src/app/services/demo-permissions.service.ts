import { computed, effect, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolbarPermissionsService } from 'ngx-dev-toolbar';
import { AuthService } from './auth.service';

/**
 * Permissions service - Advanced pattern using getForcedValues().
 *
 * This service demonstrates layering toolbar overrides on top of real backend values:
 * 1. Gets permissions from AuthService (the "real" source)
 * 2. Registers them with the toolbar
 * 3. Uses getForcedValues() to get ONLY toolbar overrides
 * 4. hasPermission() checks overrides first, then falls back to real value
 */
@Injectable({ providedIn: 'root' })
export class DemoPermissionsService {
  private authService = inject(AuthService);
  private toolbarService = inject(ToolbarPermissionsService);

  // 👇 Real permissions from your auth backend
  private realPermissions = toSignal(this.authService.getPermissions(), {
    initialValue: [],
  });

  // 👇 Only the permissions overridden in the toolbar
  private forcedPermissions = toSignal(this.toolbarService.getForcedValues(), {
    initialValue: [],
  });

  constructor() {
    // Register permissions with the toolbar when they load
    effect(() => {
      const perms = this.realPermissions();
      if (perms.length) {
        this.toolbarService.setAvailableOptions(
          perms.map((p) => ({
            id: p.id,
            name: p.name,
            isGranted: p.granted,
            isForced: false,
          }))
        );
      }
    });
  }

  /**
   * Check if permission is granted.
   * Checks toolbar override first, then falls back to real value.
   */
  hasPermission(id: string): Signal<boolean> {
    return computed(() => {
      // Check if toolbar has an override for this permission
      const forced = this.forcedPermissions().find((p) => p.id === id);
      if (forced) {
        return forced.isGranted;
      }

      // Fall back to real permission value
      return this.realPermissions().find((p) => p.id === id)?.granted ?? false;
    });
  }
}
