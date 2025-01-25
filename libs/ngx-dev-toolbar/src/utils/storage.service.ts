import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevToolsStorageService {
  private readonly PREFIX = 'AngularDevTools.';
  private readonly TOOLS_KEY = `${this.PREFIX}keys`;
  private readonly SETTINGS_KEY = `${this.PREFIX}settings`;

  public set<T>(key: string, value: T): void {
    const toolKey = this.getToolKey(key);
    this.addToolKey(toolKey);
    localStorage.setItem(toolKey, JSON.stringify(value));
  }

  public get<T>(key: string): T | null {
    const toolKey = this.getToolKey(key);
    const item = localStorage.getItem(toolKey);
    return item ? JSON.parse(item) : null;
  }

  public remove(key: string): void {
    const toolKey = this.getToolKey(key);
    localStorage.removeItem(toolKey);
    this.removeToolKey(toolKey);
  }

  public getAllSettings(): Record<string, unknown> {
    const settings: Record<string, unknown> = {};

    const keys = this.getToolKeys();
    keys.forEach((key) => {
      const value = this.get(key);
      if (value !== null) {
        settings[key] = value;
      }
    });

    return settings;
  }

  public setAllSettings(settings: Record<string, unknown>): void {
    Object.entries(settings).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  public clearAllSettings(): void {
    const keys = this.getToolKeys();
    keys.forEach((key) => {
      this.remove(key);
    });
  }

  public getToolKeys(): string[] {
    return JSON.parse(localStorage.getItem(this.TOOLS_KEY) ?? '[]');
  }

  private addToolKey(key: string) {
    const currentKeys = this.getToolKeys();
    if (currentKeys.includes(key)) {
      return;
    }
    currentKeys.push(key);
    localStorage.setItem(this.TOOLS_KEY, JSON.stringify(currentKeys));
  }

  private removeToolKey(key: string): void {
    const currentKeys = this.getToolKeys();
    const index = currentKeys.indexOf(key);
    if (index !== -1) {
      currentKeys.splice(index, 1);
    }
    localStorage.setItem(this.TOOLS_KEY, JSON.stringify(currentKeys));
  }

  private getToolKey(key: string): string {
    return key.includes(this.PREFIX) ? key : this.PREFIX + key;
  }

}
