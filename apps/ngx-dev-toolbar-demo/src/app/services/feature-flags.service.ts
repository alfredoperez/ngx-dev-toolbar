import { Injectable, inject } from '@angular/core';
import { DevToolbarFeatureFlagService } from 'ngx-dev-toolbar';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  devToolbarFeatureFlags = inject(DevToolbarFeatureFlagService);

  private featureFlags: FeatureFlag[] = [
    {
      name: 'newDemoApplicationLayout',
      enabled: false,
      description: 'Enables the new modern layout for the demo application',
    },
    {
      name: 'experimentalFeatures',
      enabled: true,
      description: 'Enables experimental features across the application',
    },
  ];

  private flagsSubject = new BehaviorSubject<FeatureFlag[]>(this.featureFlags);

  readonly flags$ = this.flagsSubject.asObservable();

  select(flagName: string): Observable<boolean> {
    return combineLatest([
      this.flags$,
      this.devToolbarFeatureFlags.getForcedValues(),
    ]).pipe(
      map(([flags, forcedFlags]) => {
        const flag = flags.find((f) => f.name === flagName);
        const forcedFlag = forcedFlags.find((f) => f.id === flagName);
        const isForced = forcedFlag?.isForced ?? false;
        if (isForced) {
          return forcedFlag?.isEnabled ?? false;
        }
        return flag?.enabled ?? false;
      })
    );
  }

  toggleFlag(flagName: string): void {
    const flags = [...this.featureFlags];
    const flagIndex = flags.findIndex((f) => f.name === flagName);
    if (flagIndex !== -1) {
      flags[flagIndex] = {
        ...flags[flagIndex],
        enabled: !flags[flagIndex].enabled,
      };
      this.featureFlags = flags;
      this.flagsSubject.next(flags);
    }
  }
}
