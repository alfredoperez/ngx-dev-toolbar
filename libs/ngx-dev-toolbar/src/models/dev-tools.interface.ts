import { Observable } from 'rxjs';

/**
 * Interface that should be implemented by any tool service that is used in the dev toolbar
 */
export interface DevToolsService<OptionType> {
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
}
