import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ToolbarService } from '../../models/toolbar.interface';
import { ToolbarInternalLanguageService } from './language-internal.service';
import { Language } from './language.models';

@Injectable({ providedIn: 'root' })
export class ToolbarLanguageService implements ToolbarService<Language> {
  private internalService = inject(ToolbarInternalLanguageService);

  /**
   * Sets the available languages that will be displayed in the tool on the dev toolbar
   * @param languages The languages to be displayed
   */
  setAvailableOptions(languages: Language[]): void {
    this.internalService.setAppLanguages(languages);
  }

  /**
   * Gets the languages that were forced/modified through the tool on the dev toolbar
   * @returns Observable of forced languages array
   */
  getForcedValues(): Observable<Language[]> {
    return this.internalService.getForcedLanguage();
  }

  /**
   * Gets the forced language value.
   * For the language tool, this returns the same as getForcedValues() since
   * only one language can be selected at a time.
   * @returns Observable of forced language array (single item or empty)
   */
  getValues(): Observable<Language[]> {
    return this.internalService.getForcedLanguage();
  }
}
