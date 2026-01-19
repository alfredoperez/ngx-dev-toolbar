import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarInternalFeatureFlagService } from '../feature-flags-tool/feature-flags-internal.service';
import { ToolbarInternalLanguageService } from '../language-tool/language-internal.service';
import { ToolbarInternalPermissionsService } from '../permissions-tool/permissions-internal.service';
import { ToolbarInternalAppFeaturesService } from '../app-features-tool/app-features-internal.service';
import {
  ToolbarPreset,
  ToolbarPresetConfig,
  PresetCategoryOptions,
} from './presets.models';

/**
 * Internal service for managing presets state.
 * Handles CRUD operations, captures current toolbar config, and applies presets.
 */
@Injectable({ providedIn: 'root' })
export class ToolbarInternalPresetsService {
  private readonly STORAGE_KEY = 'presets';
  private storageService = inject(ToolbarStorageService);

  // Inject all other tool internal services (for reading/writing state)
  private featureFlagsService = inject(ToolbarInternalFeatureFlagService);
  private languageService = inject(ToolbarInternalLanguageService);
  private permissionsService = inject(ToolbarInternalPermissionsService);
  private appFeaturesService = inject(ToolbarInternalAppFeaturesService);

  private presetsSubject = new BehaviorSubject<ToolbarPreset[]>([]);
  public presets$: Observable<ToolbarPreset[]> =
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
    description?: string,
    categoryOptions?: PresetCategoryOptions
  ): ToolbarPreset {
    const preset: ToolbarPreset = {
      id: this.generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: this.captureCurrentConfig(categoryOptions),
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
  addPreset(preset: ToolbarPreset): ToolbarPreset {
    // Generate new ID to avoid conflicts
    const newPreset: ToolbarPreset = {
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
  getPresetById(presetId: string): ToolbarPreset | undefined {
    return this.presetsSubject.value.find((p) => p.id === presetId);
  }

  /**
   * Capture current configuration from all tools
   */
  private captureCurrentConfig(
    categoryOptions?: PresetCategoryOptions
  ): ToolbarPresetConfig {
    // Default to including all categories if not specified
    const options = {
      includeFeatureFlags: categoryOptions?.includeFeatureFlags ?? true,
      includePermissions: categoryOptions?.includePermissions ?? true,
      includeAppFeatures: categoryOptions?.includeAppFeatures ?? true,
      includeLanguage: categoryOptions?.includeLanguage ?? true,
    };

    // Get current forced states
    const currentFlags = this.featureFlagsService.getCurrentForcedState();
    const currentPerms = this.permissionsService.getCurrentForcedState();
    const currentFeatures = this.appFeaturesService.getCurrentForcedState();

    // Filter by selected IDs if provided
    const filterById = (ids: string[], selected?: string[]) =>
      selected && selected.length > 0 ? ids.filter((id) => selected.includes(id)) : ids;

    return {
      featureFlags: options.includeFeatureFlags
        ? {
            enabled: filterById(
              currentFlags.enabled,
              categoryOptions?.selectedFlagIds
            ),
            disabled: filterById(
              currentFlags.disabled,
              categoryOptions?.selectedFlagIds
            ),
          }
        : { enabled: [], disabled: [] },
      language: options.includeLanguage
        ? this.languageService.getCurrentForcedLanguage()
        : null,
      permissions: options.includePermissions
        ? {
            granted: filterById(
              currentPerms.granted,
              categoryOptions?.selectedPermissionIds
            ),
            denied: filterById(
              currentPerms.denied,
              categoryOptions?.selectedPermissionIds
            ),
          }
        : { granted: [], denied: [] },
      appFeatures: options.includeAppFeatures
        ? {
            enabled: filterById(
              currentFeatures.enabled,
              categoryOptions?.selectedFeatureIds
            ),
            disabled: filterById(
              currentFeatures.disabled,
              categoryOptions?.selectedFeatureIds
            ),
          }
        : { enabled: [], disabled: [] },
    };
  }

  /**
   * Load presets from localStorage
   */
  private loadPresets(): void {
    try {
      const saved =
        this.storageService.get<ToolbarPreset[]>(this.STORAGE_KEY);
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
