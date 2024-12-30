import { Injectable, inject } from '@angular/core';
import { DevToolsStorageService } from '../../utils/storage.service';
import { Settings } from './settings.models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'settings';
  private readonly storageService = inject(DevToolsStorageService);

  public getSettings(): Settings {
    return (
      this.storageService.get<Settings>(this.STORAGE_KEY) || {
        isDarkMode: false,
      }
    );
  }

  public setSettings(settings: Settings): void {
    this.storageService.set(this.STORAGE_KEY, settings);
  }
}
