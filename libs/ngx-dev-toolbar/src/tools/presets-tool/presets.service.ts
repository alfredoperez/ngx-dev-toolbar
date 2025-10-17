import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DevToolbarInternalPresetsService } from './presets-internal.service';
import { DevToolbarPreset } from './presets.models';

/**
 * Public service for managing dev toolbar presets.
 * Allows developers to programmatically save, load, and manage presets.
 */
@Injectable({ providedIn: 'root' })
export class DevToolbarPresetsService {
  private internalService = inject(DevToolbarInternalPresetsService);

  /**
   * Get all saved presets as an Observable
   */
  getPresets(): Observable<DevToolbarPreset[]> {
    return this.internalService.presets$;
  }

  /**
   * Save current toolbar state as a preset
   * @param name - Name for the preset
   * @param description - Optional description
   * @returns The created preset
   */
  savePreset(name: string, description?: string): DevToolbarPreset {
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
  importPreset(json: string): DevToolbarPreset {
    const preset = JSON.parse(json) as DevToolbarPreset;
    return this.internalService.addPreset(preset);
  }
}
