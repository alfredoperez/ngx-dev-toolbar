import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DevToolsService } from '../../models/dev-tools.interface';
import { DevToolbarInternalAppFeaturesService } from './app-features-internal.service';
import { DevToolbarAppFeature, ForcedAppFeaturesState } from './app-features.models';

/**
 * Public service for managing app features in the dev toolbar.
 *
 * This service implements the DevToolsService interface and provides methods for:
 * - Configuring available product features
 * - Retrieving forced feature overrides
 * - Applying preset feature configurations
 * - Exporting current forced state for presets
 *
 * @example
 * ```typescript
 * import { DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';
 *
 * @Component({...})
 * export class AppComponent implements OnInit {
 *   private appFeaturesService = inject(DevToolbarAppFeaturesService);
 *
 *   ngOnInit() {
 *     // Configure available features based on current tier
 *     const features: DevToolbarAppFeature[] = [
 *       { id: 'analytics', name: 'Analytics Dashboard', isEnabled: true, isForced: false },
 *       { id: 'multi-user', name: 'Multi-User Support', isEnabled: false, isForced: false }
 *     ];
 *     this.appFeaturesService.setAvailableOptions(features);
 *
 *     // Subscribe to forced overrides
 *     this.appFeaturesService.getForcedValues().subscribe(forcedFeatures => {
 *       forcedFeatures.forEach(feature => {
 *         // Apply forced feature state to application logic
 *         this.applyFeatureState(feature.id, feature.isEnabled);
 *       });
 *     });
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DevToolbarAppFeaturesService implements DevToolsService<DevToolbarAppFeature> {
  private internalService = inject(DevToolbarInternalAppFeaturesService);

  /**
   * Set available app features for the application.
   *
   * Configures the list of product features that can be toggled in the dev toolbar.
   * Features should represent product-level capabilities like license tiers,
   * deployment configurations, or environment flags.
   *
   * @param features - Array of app features to display in the toolbar
   * @throws Error if duplicate feature IDs or empty IDs are detected
   *
   * @example
   * ```typescript
   * const features: DevToolbarAppFeature[] = [
   *   {
   *     id: 'advanced-analytics',
   *     name: 'Advanced Analytics Dashboard',
   *     description: 'Access premium reporting and data visualization',
   *     isEnabled: false,  // Not available in current tier
   *     isForced: false
   *   },
   *   {
   *     id: 'multi-user-support',
   *     name: 'Multi-User Collaboration',
   *     description: 'Enable team features and user management',
   *     isEnabled: true,   // Available in current tier
   *     isForced: false
   *   }
   * ];
   * this.appFeaturesService.setAvailableOptions(features);
   * ```
   */
  setAvailableOptions(features: DevToolbarAppFeature[]): void {
    this.internalService.setAppFeatures(features);
  }

  /**
   * Get observable stream of features that have forced overrides.
   *
   * Emits an array of features that have been forced via the dev toolbar.
   * Only features with `isForced = true` are included in the emissions.
   * Use this to react to feature override changes and update application behavior.
   *
   * @returns Observable that emits array of forced features whenever state changes
   *
   * @example
   * ```typescript
   * this.appFeaturesService.getForcedValues()
   *   .pipe(takeUntilDestroyed())
   *   .subscribe(forcedFeatures => {
   *     forcedFeatures.forEach(feature => {
   *       if (feature.isEnabled) {
   *         this.enableFeature(feature.id);
   *       } else {
   *         this.disableFeature(feature.id);
   *       }
   *     });
   *   });
   * ```
   */
  getForcedValues(): Observable<DevToolbarAppFeature[]> {
    return this.internalService.getForcedFeatures();
  }

  /**
   * Gets ALL app feature values with overrides already applied.
   * Returns the complete set of features where overridden values replace base values.
   * Each feature includes an `isForced` property indicating if it was overridden.
   *
   * This method simplifies integration by eliminating the need to manually merge
   * base features with overrides using combineLatest.
   *
   * @returns Observable of all features with overrides applied
   *
   * @example
   * ```typescript
   * // Check if a feature is enabled with overrides applied
   * this.appFeaturesService.getValues().pipe(
   *   map(features => features.find(f => f.id === 'premium-analytics')),
   *   map(feature => feature?.isEnabled ?? false)
   * ).subscribe(isEnabled => {
   *   if (isEnabled) {
   *     // Enable premium analytics
   *   }
   * });
   * ```
   */
  getValues(): Observable<DevToolbarAppFeature[]> {
    return this.internalService.features$;
  }

  /**
   * Apply a preset feature configuration (for preset tool integration).
   *
   * Accepts a forced features state object and applies it to the current configuration.
   * Invalid feature IDs (not in configured features) are filtered out with a warning.
   *
   * @param state - Forced features state containing enabled/disabled arrays
   *
   * @example
   * ```typescript
   * // Apply "Enterprise Tier" preset
   * const enterprisePreset: ForcedAppFeaturesState = {
   *   enabled: ['analytics', 'multi-user', 'white-label', 'sso'],
   *   disabled: []
   * };
   * this.appFeaturesService.applyPresetFeatures(enterprisePreset);
   *
   * // Apply "Basic Tier" preset
   * const basicPreset: ForcedAppFeaturesState = {
   *   enabled: [],
   *   disabled: ['analytics', 'multi-user', 'white-label', 'sso']
   * };
   * this.appFeaturesService.applyPresetFeatures(basicPreset);
   * ```
   */
  applyPresetFeatures(state: ForcedAppFeaturesState): void {
    this.internalService.applyForcedState(state);
  }

  /**
   * Get current forced feature state as a snapshot (for preset export).
   *
   * Returns the current forced features state with enabled/disabled arrays.
   * Useful for exporting toolbar state to save as a preset or for debugging.
   * Returns a defensive copy - mutations will not affect internal state.
   *
   * @returns Current forced features state
   *
   * @example
   * ```typescript
   * // Export current toolbar state to save as preset
   * const currentState = this.appFeaturesService.getCurrentForcedState();
   * this.presetsService.savePreset('my-config', {
   *   appFeatures: currentState,
   *   // ... other tool states
   * });
   *
   * console.log(currentState);
   * // { enabled: ['analytics'], disabled: ['white-label'] }
   * ```
   */
  getCurrentForcedState(): ForcedAppFeaturesState {
    return this.internalService.getCurrentForcedState();
  }
}
