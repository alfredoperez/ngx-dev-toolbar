import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ToolbarService } from '../../models/toolbar.interface';
import { ToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { ToolbarFlag } from './feature-flags.models';

@Injectable({ providedIn: 'root' })
export class ToolbarFeatureFlagService
  implements ToolbarService<ToolbarFlag>
{
  private internalService = inject(ToolbarInternalFeatureFlagService);

  /**
   * Sets the available flags that will be displayed in the tool on the dev toolbar
   * @param flags The flags to be displayed
   */
  setAvailableOptions(flags: ToolbarFlag[]): void {
    this.internalService.setAppFlags(flags);
  }

  /**
   * Gets the flags that were forced/modified through the tool on the dev toolbar
   * @returns Observable of forced flags array
   */
  getForcedValues(): Observable<ToolbarFlag[]> {
    return this.internalService.getForcedFlags();
  }

  /**
   * Gets ALL flag values with overrides already applied.
   * Returns the complete set of flags where overridden values replace base values.
   * Each flag includes an `isForced` property indicating if it was overridden.
   *
   * This method simplifies integration by eliminating the need to manually merge
   * base flags with overrides using combineLatest.
   *
   * @returns Observable of all flags with overrides applied
   *
   * @example
   * ```typescript
   * // Get a specific flag value with overrides applied
   * this.featureFlagsService.getValues().pipe(
   *   map(flags => flags.find(f => f.id === 'newFeature')),
   *   map(flag => flag?.isEnabled ?? false)
   * ).subscribe(isEnabled => {
   *   if (isEnabled) {
   *     // Enable feature
   *   }
   * });
   * ```
   */
  getValues(): Observable<ToolbarFlag[]> {
    return this.internalService.flags$;
  }
}
