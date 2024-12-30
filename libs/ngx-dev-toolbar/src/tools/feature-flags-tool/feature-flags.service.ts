import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { DevToolsStorageService } from '../../utils/storage.service';
import { Flag } from './feature-flags.models';

interface ForcedFlagsState {
  enabled: string[];
  disabled: string[];
}

@Injectable({ providedIn: 'root' })
export class DevToolbarFeatureFlagsService {
  private readonly STORAGE_KEY = 'feature-flags';
  private storageService = inject(DevToolsStorageService);

  /**
   * App flags are the flags that are currently in the app
   */
  private appFlags$ = new BehaviorSubject<Flag[]>([]);

  /**
   * Forced flags are the flags that are currently forced in the app
   */
  private forcedFlagsSubject = new BehaviorSubject<ForcedFlagsState>({
    enabled: [],
    disabled: [],
  });

  private readonly forcedFlags$ = this.forcedFlagsSubject.asObservable();
  /**
   * Flags with the forced flag status
   */
  public flags$: Observable<Flag[]> = combineLatest([
    this.appFlags$,
    this.forcedFlags$,
  ]).pipe(
    map(([appFlags, { enabled, disabled }]) => {
      return appFlags.map((flag) => ({
        ...flag,
        isForced: enabled.includes(flag.id) || disabled.includes(flag.id),
        isEnabled: enabled.includes(flag.id),
      }));
    })
  );

  public flags = toSignal(this.flags$, { initialValue: [] });

  constructor() {
    this.loadForcedFlags();
  }

  public set(flags: Flag[]): void {
    this.appFlags$.next(flags);
  }

  /**
   * This is used by the app that uses the dev toolbar and
   * helps to set the flags that can be overridden by the dev toolbar
   * @param flags - The flags to set
   */
  public setAppFlags(flags: Flag[]): void {
    this.appFlags$.next(flags);
  }

  public getAppFlags(): Observable<Flag[]> {
    return this.appFlags$.asObservable();
  }

  public setFlag(flagId: string, isEnabled: boolean): void {
    const { enabled, disabled } = this.forcedFlagsSubject.value;

    // Remove from both arrays first
    const newEnabled = enabled.filter((id) => id !== flagId);
    const newDisabled = disabled.filter((id) => id !== flagId);

    // Add to appropriate array
    if (isEnabled) {
      newEnabled.push(flagId);
    } else {
      newDisabled.push(flagId);
    }

    const newState = { enabled: newEnabled, disabled: newDisabled };
    this.forcedFlagsSubject.next(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  public removeFlagOverride(flagId: string): void {
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
}
