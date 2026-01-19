import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Simulates a LaunchDarkly SDK service.
 * In a real app, this would be the actual LaunchDarkly client.
 */
export interface LDFlag {
  key: string;
  value: boolean;
}

@Injectable({ providedIn: 'root' })
export class LaunchDarklyService {
  private flags$ = new BehaviorSubject<LDFlag[]>([
    { key: 'dark-mode', value: false },
    { key: 'new-dashboard', value: false },
    { key: 'beta-features', value: false },
    { key: 'new-notifications', value: true },
  ]);

  getFlags(): Observable<LDFlag[]> {
    return this.flags$.asObservable();
  }
}
