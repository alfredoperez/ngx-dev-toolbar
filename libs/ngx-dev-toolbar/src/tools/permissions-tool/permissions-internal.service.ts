import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { DevToolsStorageService } from '../../utils/storage.service';
import {
  DevToolbarPermission,
  ForcedPermissionsState,
} from './permissions.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarInternalPermissionsService {
  private readonly STORAGE_KEY = 'permissions';
  private storageService = inject(DevToolsStorageService);
  private stateService = inject(DevToolbarStateService);

  private appPermissions$ = new BehaviorSubject<DevToolbarPermission[]>([]);
  private forcedStateSubject = new BehaviorSubject<ForcedPermissionsState>({
    granted: [],
    denied: [],
  });

  private readonly forcedState$ = this.forcedStateSubject.asObservable();

  public permissions$: Observable<DevToolbarPermission[]> = combineLatest([
    this.appPermissions$,
    this.forcedState$,
  ]).pipe(
    map(([appPermissions, { granted, denied }]) => {
      // If toolbar is disabled, return app permissions without overrides
      if (!this.stateService.isEnabled()) {
        return appPermissions;
      }

      return appPermissions.map((permission) => {
        const isForced = granted.includes(permission.id) || denied.includes(permission.id);
        return {
          ...permission,
          isForced,
          isGranted: granted.includes(permission.id)
            ? true
            : denied.includes(permission.id)
            ? false
            : permission.isGranted,
          originalValue: isForced ? permission.isGranted : undefined,
        };
      });
    })
  );

  public permissions = toSignal(this.permissions$, { initialValue: [] });

  constructor() {
    this.loadForcedState();
  }

  setAppPermissions(permissions: DevToolbarPermission[]): void {
    this.appPermissions$.next(permissions);
    this.validateAndCleanForcedState(permissions);
  }

  setPermission(id: string, granted: boolean): void {
    const { granted: grantedIds, denied: deniedIds } = this.forcedStateSubject.value;

    const newGranted = grantedIds.filter((permId) => permId !== id);
    const newDenied = deniedIds.filter((permId) => permId !== id);

    if (granted) {
      newGranted.push(id);
    } else {
      newDenied.push(id);
    }

    const newState = { granted: newGranted, denied: newDenied };
    this.forcedStateSubject.next(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  removePermissionOverride(id: string): void {
    const { granted, denied } = this.forcedStateSubject.value;

    const newState = {
      granted: granted.filter((permId) => permId !== id),
      denied: denied.filter((permId) => permId !== id),
    };

    this.forcedStateSubject.next(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  getForcedPermissions(): Observable<DevToolbarPermission[]> {
    return this.permissions$.pipe(
      map((permissions) => {
        // If toolbar is disabled, return empty array (no forced values)
        if (!this.stateService.isEnabled()) {
          return [];
        }
        return permissions.filter((permission) => permission.isForced);
      })
    );
  }

  /**
   * Apply a preset permissions state, replacing the current forced state.
   * Useful for automated testing or restoring saved configurations.
   * @param state The preset forced permissions state to apply
   */
  applyPresetPermissions(state: ForcedPermissionsState): void {
    this.forcedStateSubject.next(state);
    this.storageService.set(this.STORAGE_KEY, state);
  }

  /**
   * Get the current forced permissions state.
   * Returns a deep copy to prevent external mutations.
   * @returns Current forced permissions state
   */
  getCurrentForcedState(): ForcedPermissionsState {
    const currentState = this.forcedStateSubject.value;
    return {
      granted: [...currentState.granted],
      denied: [...currentState.denied],
    };
  }

  private loadForcedState(): void {
    try {
      const savedState = this.storageService.get<ForcedPermissionsState>(
        this.STORAGE_KEY
      );

      if (savedState && this.isValidForcedState(savedState)) {
        this.forcedStateSubject.next(savedState);
      }
    } catch (error) {
      console.warn('Error loading forced permissions state from localStorage:', error);
    }
  }

  private isValidForcedState(state: unknown): state is ForcedPermissionsState {
    if (!state || typeof state !== 'object') {
      return false;
    }

    const candidate = state as Record<string, unknown>;
    return (
      Array.isArray(candidate['granted']) &&
      Array.isArray(candidate['denied'])
    );
  }

  private validateAndCleanForcedState(permissions: DevToolbarPermission[]): void {
    const currentState = this.forcedStateSubject.value;
    const validIds = new Set(permissions.map((p) => p.id));

    const cleanedGranted = currentState.granted.filter((id) => validIds.has(id));
    const cleanedDenied = currentState.denied.filter((id) => validIds.has(id));

    const hasInvalidIds =
      cleanedGranted.length !== currentState.granted.length ||
      cleanedDenied.length !== currentState.denied.length;

    if (hasInvalidIds) {
      const cleanedState = {
        granted: cleanedGranted,
        denied: cleanedDenied,
      };
      this.forcedStateSubject.next(cleanedState);
      this.storageService.set(this.STORAGE_KEY, cleanedState);

      const invalidIds = [
        ...currentState.granted.filter((id) => !validIds.has(id)),
        ...currentState.denied.filter((id) => !validIds.has(id)),
      ];
      if (invalidIds.length > 0) {
        console.warn(
          'Removed invalid permission IDs from forced state:',
          invalidIds
        );
      }
    }
  }
}
