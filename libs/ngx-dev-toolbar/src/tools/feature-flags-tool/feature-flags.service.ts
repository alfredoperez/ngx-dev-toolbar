import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DevToolsService } from '../../models/dev-tools.interface';
import { DevToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { Flag } from './feature-flags.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarFeatureFlagService implements DevToolsService<Flag> {
  private internalService = inject(DevToolbarInternalFeatureFlagService);

  /**
   * Sets the available flags that will be displayed in the tool on the dev toolbar
   * @param flags The flags to be displayed
   */
  setAvailableOptions(flags: Flag[]): void {
    this.internalService.setAppFlags(flags);
  }

  /**
   * Gets the flags that were forced/modified through the tool on the dev toolbar
   * @returns Observable of forced flags array
   */
  getForcedValues(): Observable<Flag[]> {
    return this.internalService.getForcedFlags();
  }
}
