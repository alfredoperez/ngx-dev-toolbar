import { Observable } from 'rxjs';

/**
 * State of an apply-to-source operation for a single item.
 */
export type ApplyToSourceState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Interface that should be implemented by any tool service that is used in the dev toolbar
 */
export interface ToolbarService<OptionType> {
  /**
   * Sets the available options that will be displayed in the tool on the dev toolbar
   * @param options The options to be displayed
   */
  setAvailableOptions(options: OptionType[]): void;

  /**
   * Gets the values that were forced/modified through the tool on the dev toolbar.
   * If the tool only supports a single option, the returned array will have a single element.
   * @returns Observable of forced values array
   */
  getForcedValues(): Observable<OptionType[]>;

  /**
   * Gets ALL option values with overrides already applied.
   * Returns the complete set of options where overridden values replace base values.
   * Each option includes an `isForced` property indicating if it was overridden.
   *
   * This method simplifies integration by eliminating the need to manually merge
   * base values with overrides using combineLatest.
   *
   * @returns Observable of all values with overrides applied
   *
   * @example
   * ```typescript
   * // Simple integration - no manual merging needed
   * this.devToolbarService.getValues().pipe(
   *   map(values => values.find(v => v.id === targetId)),
   *   map(value => value?.isEnabled ?? defaultValue)
   * ).subscribe(finalValue => {
   *   // Use the final value
   * });
   * ```
   */
  getValues(): Observable<OptionType[]>;

  /**
   * Registers a callback to persist a forced value back to the actual data source.
   * When set, an "apply to source" button appears on each forced item in the toolbar UI.
   *
   * @param callback - Async function that receives the item ID and its forced boolean value.
   *                   Should persist the value (e.g., via API call) and throw on failure.
   *
   * @example
   * ```typescript
   * this.toolbarService.setApplyToSource(async (id, value) => {
   *   await this.api.updateFlag(id, value);
   * });
   * ```
   */
  setApplyToSource?(callback: (id: string, value: boolean) => Promise<void>): void;
}
