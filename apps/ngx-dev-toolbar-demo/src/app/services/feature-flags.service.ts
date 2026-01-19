import { Injectable, inject } from '@angular/core';
import { ToolbarFeatureFlagService } from 'ngx-dev-toolbar';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  devToolbarFeatureFlags = inject(ToolbarFeatureFlagService);

  private featureFlags: FeatureFlag[] = [
    {
      name: 'darkMode',
      enabled: false,
      description: 'Enable dark theme throughout the application',
    },
    {
      name: 'newDashboard',
      enabled: false,
      description: 'Enable the redesigned dashboard experience',
    },
    {
      name: 'betaFeatures',
      enabled: false,
      description: 'Enable experimental beta features',
    },
    {
      name: 'newNotifications',
      enabled: false,
      description: 'Enable the new notifications system',
    },
  ];

  private flagsSubject = new BehaviorSubject<FeatureFlag[]>(this.featureFlags);

  readonly flags$ = this.flagsSubject.asObservable();

  select(flagName: string): Observable<boolean> {
    // Use getValues() to get all flags with overrides already applied
    return this.devToolbarFeatureFlags.getValues().pipe(
      map(toolbarFlags => {
        // Check if toolbar has this flag with override
        const toolbarFlag = toolbarFlags.find(f => f.id === flagName);
        if (toolbarFlag) {
          return toolbarFlag.isEnabled;
        }
        // Fall back to local flag value if not in toolbar
        const localFlag = this.featureFlags.find(f => f.name === flagName);
        return localFlag?.enabled ?? false;
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
