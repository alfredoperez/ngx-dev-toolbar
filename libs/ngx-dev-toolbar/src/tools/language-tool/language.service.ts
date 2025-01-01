import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DevToolsService } from '../../models/dev-tools.interface';
import { DevToolbarInternalLanguageService } from './language-internal.service';
import { Language } from './language.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarLanguageService implements DevToolsService<Language> {
  private internalService = inject(DevToolbarInternalLanguageService);

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
}
