import { computed, effect, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolbarFeatureFlagService } from 'ngx-dev-toolbar';
import { LaunchDarklyService } from './launch-darkly.service';

/**
 * Feature flags service - Simple pattern using getValues().
 *
 * This service:
 * 1. Gets flags from LaunchDarkly (the "real" source)
 * 2. Registers them with the toolbar
 * 3. Uses getValues() which returns all flags with overrides already applied
 */
@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  private launchDarkly = inject(LaunchDarklyService);
  private toolbarService = inject(ToolbarFeatureFlagService);

  // Descriptions for toolbar display (LaunchDarkly doesn't provide these)
  private readonly descriptions: Record<string, string> = {
    'dark-mode': 'Enable dark theme throughout the application',
    'new-dashboard': 'Enable the redesigned dashboard experience',
    'beta-features': 'Enable experimental beta features',
    'new-notifications': 'Enable the new notifications system',
  };

  // Get flags from LaunchDarkly
  private ldFlags = toSignal(this.launchDarkly.getFlags(), { initialValue: [] });

  // Get all flags with toolbar overrides already applied
  private flags = toSignal(this.toolbarService.getValues(), { initialValue: [] });

  constructor() {
    // When LaunchDarkly flags load, register them with the toolbar
    effect(() => {
      const flags = this.ldFlags();
      if (flags.length) {
        this.toolbarService.setAvailableOptions(
          flags.map((f) => ({
            id: f.key,
            name: this.formatName(f.key),
            description: this.descriptions[f.key] ?? '',
            isEnabled: f.value,
            isForced: false,
          }))
        );
      }
    });
  }

  /**
   * Get a flag value. Returns toolbar value with overrides already applied.
   */
  getFlag(id: string): Signal<boolean> {
    return computed(() => this.flags().find((f) => f.id === id)?.isEnabled ?? false);
  }

  private formatName(key: string): string {
    return key
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
