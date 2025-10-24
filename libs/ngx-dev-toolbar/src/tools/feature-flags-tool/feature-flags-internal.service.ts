import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { DevToolsStorageService } from '../../utils/storage.service';
import { DevToolbarFlag } from './feature-flags.models';

interface ForcedFlagsState {
  enabled: string[];
  disabled: string[];
}

@Injectable({ providedIn: 'root' })
export class DevToolbarInternalFeatureFlagService {
  private readonly STORAGE_KEY = 'feature-flags';
  private storageService = inject(DevToolsStorageService);

  private appFlags$ = new BehaviorSubject<DevToolbarFlag[]>([]);
  private forcedFlagsSubject = new BehaviorSubject<ForcedFlagsState>({
    enabled: [],
    disabled: [],
  });

  private readonly forcedFlags$ = this.forcedFlagsSubject.asObservable();

  public flags$: Observable<DevToolbarFlag[]> = combineLatest([
    this.appFlags$,
    this.forcedFlags$,
  ]).pipe(
    map(([appFlags, { enabled, disabled }]) => {
      return appFlags.map((flag) => {
        const isForced = enabled.includes(flag.id) || disabled.includes(flag.id);
        return {
          ...flag,
          isForced,
          isEnabled: enabled.includes(flag.id)
            ? true
            : disabled.includes(flag.id)
            ? false
            : flag.isEnabled,
          originalValue: isForced ? flag.isEnabled : undefined,
        };
      });
    })
  );

  public flags = toSignal(this.flags$, { initialValue: [] });

  constructor() {
    this.loadForcedFlags();
  }

  setAppFlags(flags: DevToolbarFlag[]): void {
    this.appFlags$.next(flags);
  }

  getAppFlags(): Observable<DevToolbarFlag[]> {
    return this.appFlags$.asObservable();
  }

  getForcedFlags(): Observable<DevToolbarFlag[]> {
    return this.flags$.pipe(
      map((flags) => flags.filter((flag) => flag.isForced))
    );
  }

  setFlag(flagId: string, isEnabled: boolean): void {
    const { enabled, disabled } = this.forcedFlagsSubject.value;

    const newEnabled = enabled.filter((id) => id !== flagId);
    const newDisabled = disabled.filter((id) => id !== flagId);

    if (isEnabled) {
      newEnabled.push(flagId);
    } else {
      newDisabled.push(flagId);
    }

    const newState = { enabled: newEnabled, disabled: newDisabled };
    this.forcedFlagsSubject.next(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  removeFlagOverride(flagId: string): void {
    const { enabled, disabled } = this.forcedFlagsSubject.value;

    const newState = {
      enabled: enabled.filter((id) => id !== flagId),
      disabled: disabled.filter((id) => id !== flagId),
    };

    this.forcedFlagsSubject.next(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  private loadForcedFlags(): void {
    const savedFlags = this.storageService.get<ForcedFlagsState>(
      this.STORAGE_KEY
    );

    if (savedFlags) {
      this.forcedFlagsSubject.next(savedFlags);
    }
  }

  /**
   * Apply feature flags from a preset (used by Presets Tool)
   * This method directly sets the forced flags state without user interaction
   */
  applyPresetFlags(presetState: ForcedFlagsState): void {
    this.forcedFlagsSubject.next(presetState);
    this.storageService.set(this.STORAGE_KEY, presetState);
  }

  /**
   * Get current forced state for saving to preset
   * Returns the raw state of enabled and disabled flag IDs
   */
  getCurrentForcedState(): ForcedFlagsState {
    return this.forcedFlagsSubject.value;
  }
}
