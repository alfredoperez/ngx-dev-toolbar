import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Simulates a licensing/subscription service.
 * In a real app, this would fetch enabled features from your backend.
 *
 * Note: External licensing APIs typically only return feature IDs and
 * enabled status - they don't include descriptions for display.
 */
export interface LicensedFeature {
  id: string;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class LicensingService {
  // Simulates features coming from your licensing backend
  // Note: No descriptions - just IDs and enabled status
  private features$ = new BehaviorSubject<LicensedFeature[]>([
    { id: 'analytics', enabled: false },
    { id: 'bulk-export', enabled: false },
    { id: 'white-label', enabled: false },
    { id: 'notifications', enabled: false },
    { id: 'api-access', enabled: false },
  ]);

  getFeatures(): Observable<LicensedFeature[]> {
    return this.features$.asObservable();
  }
}
