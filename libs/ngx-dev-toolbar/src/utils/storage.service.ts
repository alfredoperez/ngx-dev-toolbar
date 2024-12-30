import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevToolsStorageService {
  private readonly prefix = 'ndt-';

  public set<T>(key: string, value: T): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  public get<T>(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    return item ? JSON.parse(item) : null;
  }

  public remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}
