import { Injectable, Signal, computed, signal } from '@angular/core';
import { DevToolsStorageService } from '../../utils/storage.service';
import { Flag } from './feature-flags.models';

interface ForcedFlagsState {
  enabled: string[];
  disabled: string[];
}

@Injectable({ providedIn: 'root' })
export class DevToolbarFeatureFlagsService {
  private readonly STORAGE_KEY = 'feature-flags';

  /**
   * App flags are the flags that are currently in the app
   */
  public appFlags = signal<Flag[]>([]);

  /**
   * Forced flags are the flags that are currently forced in the app
   */
  public forcedFlags = signal<ForcedFlagsState>({ enabled: [], disabled: [] });

  /**
   * Flags with the forced flag status
   */
  public flags: Signal<Flag[]> = computed(() => {
    const appFlags = this.appFlags();
    const { enabled, disabled } = this.forcedFlags();

    return appFlags.map((flag) => ({
      ...flag,
      isForced: enabled.includes(flag.id) || disabled.includes(flag.id),
      isEnabled: enabled.includes(flag.id),
    }));
  });

  constructor(private storageService: DevToolsStorageService) {
    this.loadForcedFlags();
  }

  public set(flags: Flag[]): void {
    this.appFlags.set(flags);
  }

  /**
   * This is used by the app that uses the dev toolbar and
   * helps to set the flags that can be overridden by the dev toolbar
   * @param flags - The flags to set
   */
  public setAppFlags(flags: Flag[]): void {
    this.appFlags.set(flags);
  }

  public getAppFlags(): Signal<Flag[]> {
    return this.appFlags;
  }

  public setFlag(flagId: string, isEnabled: boolean): void {
    const { enabled, disabled } = this.forcedFlags();

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
    this.forcedFlags.set(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  public removeFlagOverride(flagId: string): void {
    const { enabled, disabled } = this.forcedFlags();

    const newState = {
      enabled: enabled.filter((id) => id !== flagId),
      disabled: disabled.filter((id) => id !== flagId),
    };

    this.forcedFlags.set(newState);
    this.storageService.set(this.STORAGE_KEY, newState);
  }

  private loadForcedFlags(): void {
    const savedFlags = this.storageService.get<ForcedFlagsState>(
      this.STORAGE_KEY,
    );

    if (savedFlags) {
      this.forcedFlags.set(savedFlags);
    }
  }
}
