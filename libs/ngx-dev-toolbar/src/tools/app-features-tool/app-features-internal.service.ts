import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { DevToolsStorageService } from '../../utils/storage.service';
import { DevToolbarAppFeature, ForcedAppFeaturesState } from './app-features.models';

/**
 * Internal service for managing app features state and forced overrides.
 *
 * This service handles:
 * - Feature configuration storage
 * - Forced feature state management
 * - localStorage persistence
 * - State validation and cleanup
 *
 * @internal This service is for internal toolbar use only. Consumers should use DevToolbarAppFeaturesService.
 */
@Injectable({ providedIn: 'root' })
export class DevToolbarInternalAppFeaturesService {
  private readonly STORAGE_KEY = 'app-features';
  private storageService = inject(DevToolsStorageService);
  private stateService = inject(DevToolbarStateService);

  private appFeaturesSubject = new BehaviorSubject<DevToolbarAppFeature[]>([]);
  private forcedFeaturesSubject = new BehaviorSubject<ForcedAppFeaturesState>({
    enabled: [],
    disabled: [],
  });

  private readonly forcedFeatures$ = this.forcedFeaturesSubject.asObservable();

  /**
   * Observable stream of all features with merged forced state
   */
  public features$: Observable<DevToolbarAppFeature[]> = combineLatest([
    this.appFeaturesSubject.asObservable(),
    this.forcedFeatures$,
  ]).pipe(
    map(([appFeatures, forcedState]) => this.mergeForcedState(appFeatures, forcedState))
  );

  /**
   * Signal containing current features with merged forced state
   */
  public features = toSignal(this.features$, { initialValue: [] });

  constructor() {
    this.loadForcedFeatures();
  }

  /**
   * Set available app features for the application.
   * Validates features, trims whitespace, and triggers validation of forced state.
   *
   * @param features - Array of app features to configure
   * @throws Error if duplicate feature IDs or empty IDs are detected
   */
  setAppFeatures(features: DevToolbarAppFeature[]): void {
    // Validate for empty IDs
    const emptyIdFeature = features.find((f) => !f.id || f.id.trim() === '');
    if (emptyIdFeature) {
      throw new Error('Feature ID cannot be empty');
    }

    // Validate for duplicate IDs
    const ids = features.map((f) => f.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      throw new Error(`Duplicate feature IDs detected: ${duplicateIds.join(', ')}`);
    }

    // Trim whitespace from names and warn about empty names
    const processedFeatures = features.map((feature) => {
      const trimmedName = feature.name.trim();
      if (!trimmedName) {
        console.warn(`Feature '${feature.id}' has empty name`);
      }
      return {
        ...feature,
        name: trimmedName || feature.name,
      };
    });

    this.appFeaturesSubject.next(processedFeatures);
    this.validateAndCleanForcedState();
  }

  /**
   * Get observable stream of app features (natural state, no forced state merged)
   */
  getAppFeatures(): Observable<DevToolbarAppFeature[]> {
    return this.appFeaturesSubject.asObservable();
  }

  /**
   * Get observable stream of features that have forced overrides
   */
  getForcedFeatures(): Observable<DevToolbarAppFeature[]> {
    return this.features$.pipe(
      map((features) => {
        // If toolbar is disabled, return empty array (no forced values)
        if (!this.stateService.isEnabled()) {
          return [];
        }
        return features.filter((feature) => feature.isForced);
      })
    );
  }

  /**
   * Force a feature to enabled or disabled state.
   * Persists the forced state to localStorage.
   *
   * @param featureId - ID of the feature to force
   * @param isEnabled - Whether to force feature to enabled (true) or disabled (false)
   */
  setFeature(featureId: string, isEnabled: boolean): void {
    const { enabled, disabled } = this.forcedFeaturesSubject.value;

    // Remove feature from both arrays
    const newEnabled = enabled.filter((id) => id !== featureId);
    const newDisabled = disabled.filter((id) => id !== featureId);

    // Add to appropriate array
    if (isEnabled) {
      newEnabled.push(featureId);
    } else {
      newDisabled.push(featureId);
    }

    const newState = { enabled: newEnabled, disabled: newDisabled };
    this.forcedFeaturesSubject.next(newState);
    this.saveForcedFeatures(newState);
  }

  /**
   * Remove forced override for a feature, returning it to natural state.
   * Persists the change to localStorage.
   *
   * @param featureId - ID of the feature to unforce
   */
  removeFeatureOverride(featureId: string): void {
    const { enabled, disabled } = this.forcedFeaturesSubject.value;

    const newState = {
      enabled: enabled.filter((id) => id !== featureId),
      disabled: disabled.filter((id) => id !== featureId),
    };

    this.forcedFeaturesSubject.next(newState);
    this.saveForcedFeatures(newState);
  }

  /**
   * Apply a preset forced state (for preset integration).
   * Validates and cleans invalid feature IDs before applying.
   *
   * @param state - Forced features state from preset
   */
  applyForcedState(state: ForcedAppFeaturesState): void {
    const configuredFeatureIds = this.appFeaturesSubject.value.map((f) => f.id);

    // Validate and filter to only valid IDs
    const validEnabled = state.enabled.filter((id) => configuredFeatureIds.includes(id));
    const validDisabled = state.disabled.filter((id) => configuredFeatureIds.includes(id));

    const invalidIds = [
      ...state.enabled.filter((id) => !configuredFeatureIds.includes(id)),
      ...state.disabled.filter((id) => !configuredFeatureIds.includes(id)),
    ];

    if (invalidIds.length > 0) {
      console.warn(`Preset contains invalid feature IDs (ignored): ${invalidIds.join(', ')}`);
    }

    const cleanedState = { enabled: validEnabled, disabled: validDisabled };
    this.forcedFeaturesSubject.next(cleanedState);
    this.saveForcedFeatures(cleanedState);
  }

  /**
   * Get current forced state as a snapshot (defensive copy).
   * Useful for preset exports and debugging.
   *
   * @returns Current forced features state
   */
  getCurrentForcedState(): ForcedAppFeaturesState {
    const state = this.forcedFeaturesSubject.value;
    return {
      enabled: [...state.enabled],
      disabled: [...state.disabled],
    };
  }

  /**
   * Merge natural app features with forced state.
   *
   * @param appFeatures - Natural feature configuration
   * @param forcedState - Forced overrides from localStorage/toolbar
   * @returns Features with merged forced state
   */
  private mergeForcedState(
    appFeatures: DevToolbarAppFeature[],
    forcedState: ForcedAppFeaturesState
  ): DevToolbarAppFeature[] {
    // If toolbar is disabled, return app features without overrides
    if (!this.stateService.isEnabled()) {
      return appFeatures;
    }

    return appFeatures.map((feature) => {
      const isInEnabled = forcedState.enabled.includes(feature.id);
      const isInDisabled = forcedState.disabled.includes(feature.id);
      const isForced = isInEnabled || isInDisabled;

      return {
        ...feature,
        isEnabled: isInEnabled ? true : isInDisabled ? false : feature.isEnabled,
        isForced,
        originalValue: isForced ? feature.isEnabled : undefined,
      };
    });
  }

  /**
   * Load forced features state from localStorage on initialization.
   * Handles missing or corrupted data gracefully.
   */
  private loadForcedFeatures(): void {
    try {
      const savedState = this.storageService.get<ForcedAppFeaturesState>(this.STORAGE_KEY);

      if (savedState) {
        this.forcedFeaturesSubject.next(savedState);
      }
    } catch (error) {
      console.error('Failed to load forced app features from localStorage:', error);
      // Use default empty state on error
    }
  }

  /**
   * Persist forced features state to localStorage.
   * Handles quota exceeded errors gracefully.
   *
   * @param state - Forced state to persist
   */
  private saveForcedFeatures(state: ForcedAppFeaturesState): void {
    try {
      this.storageService.set(this.STORAGE_KEY, state);
    } catch (error) {
      console.error('Failed to persist app features to localStorage:', error);
      // Continue execution - state is still valid in memory for current session
    }
  }

  /**
   * Validate forced feature IDs against configured features and clean up invalid ones.
   * Called after setAppFeatures() to ensure forced state references valid features.
   */
  private validateAndCleanForcedState(): void {
    const configuredFeatureIds = this.appFeaturesSubject.value.map((f) => f.id);
    const currentForcedState = this.forcedFeaturesSubject.value;

    const validEnabled = currentForcedState.enabled.filter((id) =>
      configuredFeatureIds.includes(id)
    );
    const validDisabled = currentForcedState.disabled.filter((id) =>
      configuredFeatureIds.includes(id)
    );

    const removedIds = [
      ...currentForcedState.enabled.filter((id) => !configuredFeatureIds.includes(id)),
      ...currentForcedState.disabled.filter((id) => !configuredFeatureIds.includes(id)),
    ];

    if (removedIds.length > 0) {
      console.warn(`Removed invalid feature IDs from forced state: ${removedIds.join(', ')}`);

      const cleanedState = { enabled: validEnabled, disabled: validDisabled };
      this.forcedFeaturesSubject.next(cleanedState);
      this.saveForcedFeatures(cleanedState);
    }
  }
}
