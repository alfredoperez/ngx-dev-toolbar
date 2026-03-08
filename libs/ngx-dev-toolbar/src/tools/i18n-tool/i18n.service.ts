import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ToolbarService } from '../../models/toolbar.interface';
import { ToolbarInternalI18nService } from './i18n-internal.service';
import {
  I18nCurrency,
  I18nDateFormat,
  I18nFirstDayOfWeek,
  I18nLocale,
  I18nNumberFormat,
  I18nTimezone,
  I18nToolConfig,
  I18nUnitSystem,
} from './i18n.models';

@Injectable({ providedIn: 'root' })
export class ToolbarI18nService implements ToolbarService<I18nLocale> {
  private internalService = inject(ToolbarInternalI18nService);

  /**
   * Sets the available locales displayed in the i18n tool
   */
  setAvailableOptions(locales: I18nLocale[]): void {
    this.internalService.setAvailableLocales(locales);
  }

  /**
   * Gets the locale that was forced through the i18n tool
   * @returns Observable of forced locale array (single item or empty)
   */
  getForcedValues(): Observable<I18nLocale[]> {
    return this.internalService.getForcedLocale();
  }

  /**
   * Gets the forced locale value.
   * For the i18n tool, this returns the same as getForcedValues() since
   * only one locale can be selected at a time.
   */
  getValues(): Observable<I18nLocale[]> {
    return this.internalService.getForcedLocale();
  }

  // --- Extended i18n accessors ---

  /**
   * Sets the available timezones displayed in the i18n tool.
   * If not called, defaults to a built-in list of common timezones.
   */
  setAvailableTimezones(timezones: I18nTimezone[]): void {
    this.internalService.setAvailableTimezones(timezones);
  }

  /**
   * Sets the available currencies displayed in the i18n tool.
   * If not called, defaults to a built-in list of common currencies.
   */
  setAvailableCurrencies(currencies: I18nCurrency[]): void {
    this.internalService.setAvailableCurrencies(currencies);
  }

  /**
   * Gets the timezone that was forced through the i18n tool
   */
  getForcedTimezone(): Observable<I18nTimezone | null> {
    return this.internalService.getForcedTimezone();
  }

  /**
   * Gets the currency that was forced through the i18n tool
   */
  getForcedCurrency(): Observable<I18nCurrency | null> {
    return this.internalService.getForcedCurrency();
  }

  /**
   * Gets the unit system that was forced through the i18n tool
   */
  getUnitSystem(): Observable<I18nUnitSystem | null> {
    return this.internalService.getForcedUnitSystem();
  }

  /**
   * Whether pseudo-localization mode is enabled
   */
  isPseudoLocalizationEnabled(): Observable<boolean> {
    return this.internalService.getPseudoLocEnabled();
  }

  /**
   * Whether RTL mirroring is enabled
   */
  isRtlEnabled(): Observable<boolean> {
    return this.internalService.getRtlEnabled();
  }

  /**
   * Gets the date format that was forced through the i18n tool
   */
  getForcedDateFormat(): Observable<I18nDateFormat | null> {
    return this.internalService.getForcedDateFormat();
  }

  /**
   * Gets the first day of week that was forced through the i18n tool
   */
  getForcedFirstDayOfWeek(): Observable<I18nFirstDayOfWeek | null> {
    return this.internalService.getForcedFirstDayOfWeek();
  }

  /**
   * Gets the number format that was forced through the i18n tool
   */
  getForcedNumberFormat(): Observable<I18nNumberFormat | null> {
    return this.internalService.getForcedNumberFormat();
  }

  /**
   * Configures which sections are visible in the i18n tool panel
   */
  configure(config: I18nToolConfig): void {
    this.internalService.setToolConfig(config);
  }
}
