import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DevToolsService } from '../../models/dev-tools.interface';
import { DevToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { DevToolbarFlag } from './feature-flags.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarFeatureFlagService
  implements DevToolsService<DevToolbarFlag>
{
  private internalService = inject(DevToolbarInternalFeatureFlagService);

  /**
   * Sets the available flags that will be displayed in the tool on the dev toolbar
   * @param flags The flags to be displayed
   */
  setAvailableOptions(flags: DevToolbarFlag[]): void {
    this.internalService.setAppFlags(flags);
  }

  /**
   * Gets the flags that were forced/modified through the tool on the dev toolbar
   * @returns Observable of forced flags array
   */
  getForcedValues(): Observable<DevToolbarFlag[]> {
    return this.internalService.getForcedFlags();
  }
}
