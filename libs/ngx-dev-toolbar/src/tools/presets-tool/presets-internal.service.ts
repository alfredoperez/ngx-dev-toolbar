import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';
import { DevToolsStorageService } from '../../utils/storage.service';
import { DevToolbarInternalFeatureFlagService } from '../feature-flags-tool/feature-flags-internal.service';
import { DevToolbarInternalLanguageService } from '../language-tool/language-internal.service';
import { DevToolbarInternalPermissionsService } from '../permissions-tool/permissions-internal.service';
import { DevToolbarInternalAppFeaturesService } from '../app-features-tool/app-features-internal.service';
import { DevToolbarPreset, DevToolbarPresetConfig } from './presets.models';

/**
 * Internal service for managing presets state.
 * Handles CRUD operations, captures current toolbar config, and applies presets.
 */
@Injectable({ providedIn: 'root' })
export class DevToolbarInternalPresetsService {
  private readonly STORAGE_KEY = 'presets';
  private storageService = inject(DevToolsStorageService);

  // Inject all other tool internal services (for reading/writing state)
  private featureFlagsService = inject(DevToolbarInternalFeatureFlagService);
  private languageService = inject(DevToolbarInternalLanguageService);
  private permissionsService = inject(DevToolbarInternalPermissionsService);
  private appFeaturesService = inject(DevToolbarInternalAppFeaturesService);

  private presetsSubject = new BehaviorSubject<DevToolbarPreset[]>([]);
  public presets$: Observable<DevToolbarPreset[]> =
    this.presetsSubject.asObservable();
  public presets = toSignal(this.presets$, { initialValue: [] });

  constructor() {
    this.loadPresets();
  }

  /**
   * Capture current toolbar state as a new preset
   */
  saveCurrentAsPreset(
    name: string,
    description?: string
  ): DevToolbarPreset {
    const preset: DevToolbarPreset = {
      id: this.generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: this.captureCurrentConfig(),
    };

    const presets = [...this.presetsSubject.value, preset];
    this.presetsSubject.next(presets);
    this.storageService.set(this.STORAGE_KEY, presets);

    return preset;
  }

  /**
   * Apply a preset to all tools (THIS IS THE KEY METHOD)
   */
  async applyPreset(presetId: string): Promise<void> {
    const preset = this.presetsSubject.value.find((p) => p.id === presetId);
    if (!preset) return;

    // Apply to each tool's internal service
    this.featureFlagsService.applyPresetFlags(preset.config.featureFlags);
    await this.languageService.applyPresetLanguage(preset.config.language);
    this.permissionsService.applyPresetPermissions(preset.config.permissions);
    this.appFeaturesService.applyForcedState(preset.config.appFeatures);
  }

  /**
   * Update an existing preset with current toolbar state
   */
  updatePreset(presetId: string): void {
    const presets = this.presetsSubject.value.map((preset) => {
      if (preset.id === presetId) {
        return {
          ...preset,
          updatedAt: new Date().toISOString(),
          config: this.captureCurrentConfig(),
        };
      }
      return preset;
    });

    this.presetsSubject.next(presets);
    this.storageService.set(this.STORAGE_KEY, presets);
  }

  /**
   * Delete a preset
   */
  deletePreset(presetId: string): void {
    const presets = this.presetsSubject.value.filter(
      (p) => p.id !== presetId
    );
    this.presetsSubject.next(presets);
    this.storageService.set(this.STORAGE_KEY, presets);
  }

  /**
   * Add a preset (used for import)
   */
  addPreset(preset: DevToolbarPreset): DevToolbarPreset {
    // Generate new ID to avoid conflicts
    const newPreset: DevToolbarPreset = {
      ...preset,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const presets = [...this.presetsSubject.value, newPreset];
    this.presetsSubject.next(presets);
    this.storageService.set(this.STORAGE_KEY, presets);

    return newPreset;
  }

  /**
   * Get a preset by ID
   */
  getPresetById(presetId: string): DevToolbarPreset | undefined {
    return this.presetsSubject.value.find((p) => p.id === presetId);
  }

  /**
   * Capture current configuration from all tools
   */
  private captureCurrentConfig(): DevToolbarPresetConfig {
    return {
      featureFlags: this.featureFlagsService.getCurrentForcedState(),
      language: this.languageService.getCurrentForcedLanguage(),
      permissions: this.permissionsService.getCurrentForcedState(),
      appFeatures: this.appFeaturesService.getCurrentForcedState(),
    };
  }

  /**
   * Load presets from localStorage
   */
  private loadPresets(): void {
    try {
      const saved =
        this.storageService.get<DevToolbarPreset[]>(this.STORAGE_KEY);
      if (saved && Array.isArray(saved)) {
        this.presetsSubject.next(saved);
      }
    } catch (error) {
      console.error('Failed to load presets from localStorage:', error);
    }
  }

  /**
   * Generate unique preset ID
   */
  private generateId(): string {
    return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
