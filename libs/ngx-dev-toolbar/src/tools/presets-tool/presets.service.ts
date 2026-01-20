import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ToolbarInternalPresetsService } from './presets-internal.service';
import {
  ToolbarPreset,
  ToolbarPresetConfig,
  PartialApplyOptions,
} from './presets.models';

/**
 * Partial preset for initialization (without generated fields)
 */
export interface InitialPreset {
  name: string;
  description?: string;
  config: ToolbarPresetConfig;
}

/**
 * Public service for managing dev toolbar presets.
 * Allows developers to programmatically save, load, and manage presets.
 */
@Injectable({ providedIn: 'root' })
export class ToolbarPresetsService {
  private internalService = inject(ToolbarInternalPresetsService);

  /**
   * Get all saved presets as an Observable
   */
  getPresets(): Observable<ToolbarPreset[]> {
    return this.internalService.presets$;
  }

  /**
   * Save current toolbar state as a preset
   * @param name - Name for the preset
   * @param description - Optional description
   * @returns The created preset
   */
  savePreset(name: string, description?: string): ToolbarPreset {
    return this.internalService.saveCurrentAsPreset(name, description);
  }

  /**
   * Apply a preset (load its configuration into all tools)
   * @param presetId - ID of the preset to apply
   */
  async applyPreset(presetId: string): Promise<void> {
    return this.internalService.applyPreset(presetId);
  }

  /**
   * Update a preset with current toolbar state
   * @param presetId - ID of the preset to update
   */
  updatePreset(presetId: string): void {
    this.internalService.updatePreset(presetId);
  }

  /**
   * Delete a preset
   * @param presetId - ID of the preset to delete
   */
  deletePreset(presetId: string): void {
    this.internalService.deletePreset(presetId);
  }

  /**
   * Toggle favorite status for a preset
   * @param presetId - ID of the preset to toggle
   */
  toggleFavorite(presetId: string): void {
    this.internalService.toggleFavorite(presetId);
  }

  /**
   * Apply a preset with partial options (only selected categories)
   * @param presetId - ID of the preset to apply
   * @param options - Options for which categories to apply
   */
  async partialApplyPreset(
    presetId: string,
    options: PartialApplyOptions
  ): Promise<void> {
    return this.internalService.partialApplyPreset(presetId, options);
  }

  /**
   * Update only the metadata (name, description) of a preset
   * @param presetId - ID of the preset to update
   * @param name - New name for the preset
   * @param description - New description for the preset
   */
  updatePresetMetadata(
    presetId: string,
    name: string,
    description?: string
  ): void {
    this.internalService.updatePresetMetadata(presetId, name, description);
  }

  /**
   * Export a preset as JSON string
   * @param presetId - ID of the preset to export
   * @returns JSON string representation of the preset
   */
  exportPreset(presetId: string): string | null {
    const preset = this.internalService.getPresetById(presetId);
    if (!preset) return null;
    return JSON.stringify(preset, null, 2);
  }

  /**
   * Import a preset from JSON string
   * @param json - JSON string representation of a preset
   * @returns The imported preset
   * @throws Error if JSON is invalid
   */
  importPreset(json: string): ToolbarPreset {
    const preset = JSON.parse(json) as ToolbarPreset;
    return this.internalService.addPreset(preset);
  }

  /**
   * Initialize presets with predefined configurations.
   * Useful for setting up default presets that all developers can use.
   * Skips presets that already exist (by name) to avoid duplicates.
   *
   * @param presets - Array of preset configurations to initialize
   * @returns Array of created presets (only newly added ones)
   *
   * @example
   * ```typescript
   * const presetsService = inject(ToolbarPresetsService);
   *
   * presetsService.initializePresets([
   *   {
   *     name: 'Admin User',
   *     description: 'Full access admin configuration',
   *     config: {
   *       featureFlags: {
   *         enabled: ['admin-panel', 'advanced-features'],
   *         disabled: []
   *       },
   *       permissions: {
   *         granted: ['admin', 'write', 'delete'],
   *         denied: []
   *       },
   *       appFeatures: {
   *         enabled: ['analytics', 'reporting'],
   *         disabled: []
   *       },
   *       language: 'en'
   *     }
   *   },
   *   {
   *     name: 'Read-Only User',
   *     description: 'Limited access for viewing only',
   *     config: {
   *       featureFlags: {
   *         enabled: [],
   *         disabled: ['admin-panel', 'advanced-features']
   *       },
   *       permissions: {
   *         granted: ['read'],
   *         denied: ['write', 'delete']
   *       },
   *       appFeatures: {
   *         enabled: [],
   *         disabled: ['analytics', 'reporting']
   *       },
   *       language: null
   *     }
   *   }
   * ]);
   * ```
   */
  initializePresets(presets: InitialPreset[]): ToolbarPreset[] {
    const existingPresets = this.internalService.presets();
    const existingNames = new Set(
      existingPresets.map((p) => p.name.toLowerCase())
    );

    return presets
      .filter((preset) => !existingNames.has(preset.name.toLowerCase()))
      .map((preset) =>
        this.internalService.addPreset({
          id: '', // Will be generated
          createdAt: '', // Will be generated
          updatedAt: '', // Will be generated
          isSystem: true, // Mark as system preset (not editable)
          ...preset,
        })
      );
  }

  /**
   * Clear all existing presets and set new initial presets.
   * Use this to replace all presets with a fresh set of configurations.
   *
   * @param presets - Array of preset configurations to set as initial
   * @returns Array of created presets
   */
  setInitialPresets(presets: InitialPreset[]): ToolbarPreset[] {
    // Clear existing presets
    const currentPresets = this.internalService.presets();
    currentPresets.forEach((preset) => {
      this.internalService.deletePreset(preset.id);
    });

    // Add new presets
    return this.initializePresets(presets);
  }
}
