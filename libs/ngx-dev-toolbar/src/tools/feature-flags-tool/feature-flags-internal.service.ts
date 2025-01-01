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
export class DevToolbarInternalFeatureFlagService {
  private readonly STORAGE_KEY = 'feature-flags';
  private storageService = inject(DevToolsStorageService);

  private appFlags$ = new BehaviorSubject<Flag[]>([]);
  private forcedFlagsSubject = new BehaviorSubject<ForcedFlagsState>({
    enabled: [],
    disabled: [],
  });

  private readonly forcedFlags$ = this.forcedFlagsSubject.asObservable();

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

  setAppFlags(flags: Flag[]): void {
    this.appFlags$.next(flags);
  }

  getAppFlags(): Observable<Flag[]> {
    return this.appFlags$.asObservable();
  }

  getForcedFlags(): Observable<Flag[]> {
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
}
