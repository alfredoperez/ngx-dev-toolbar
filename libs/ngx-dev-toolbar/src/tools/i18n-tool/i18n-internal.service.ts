import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarStorageService } from '../../utils/storage.service';
import {
  I18nCurrency,
  I18nDateFormat,
  I18nFirstDayOfWeek,
  I18nLocale,
  I18nNumberFormat,
  I18nPresetConfig,
  I18nState,
  I18nTimezone,
  I18nToolConfig,
  I18nUnitSystem,
  DEFAULT_TIMEZONES,
  DEFAULT_CURRENCIES,
} from './i18n.models';

@Injectable({ providedIn: 'root' })
export class ToolbarInternalI18nService {
  private readonly STORAGE_LOCALE = 'i18n.locale';
  private readonly STORAGE_TIMEZONE = 'i18n.timezone';
  private readonly STORAGE_CURRENCY = 'i18n.currency';
  private readonly STORAGE_UNIT_SYSTEM = 'i18n.unitSystem';
  private readonly STORAGE_DATE_FORMAT = 'i18n.dateFormat';
  private readonly STORAGE_FIRST_DAY = 'i18n.firstDay';
  private readonly STORAGE_NUMBER_FORMAT = 'i18n.numberFormat';
  private readonly STORAGE_PSEUDO_LOC = 'i18n.pseudoLoc';
  private readonly STORAGE_RTL = 'i18n.rtl';
  private readonly OLD_LANGUAGE_KEY = 'language';

  private readonly storageService = inject(ToolbarStorageService);
  private readonly stateService = inject(ToolbarStateService);
  private readonly document = inject(DOCUMENT);

  private locales$ = new BehaviorSubject<I18nLocale[]>([]);
  private timezones$ = new BehaviorSubject<I18nTimezone[]>(DEFAULT_TIMEZONES);
  private currencies$ = new BehaviorSubject<I18nCurrency[]>(DEFAULT_CURRENCIES);

  private forcedLocale$ = new BehaviorSubject<I18nLocale | null>(null);
  private forcedTimezone$ = new BehaviorSubject<I18nTimezone | null>(null);
  private forcedCurrency$ = new BehaviorSubject<I18nCurrency | null>(null);
  private forcedUnitSystem$ = new BehaviorSubject<I18nUnitSystem | null>(null);
  private forcedDateFormat$ = new BehaviorSubject<I18nDateFormat | null>(null);
  private forcedFirstDayOfWeek$ = new BehaviorSubject<I18nFirstDayOfWeek | null>(null);
  private forcedNumberFormat$ = new BehaviorSubject<I18nNumberFormat | null>(null);
  private toolConfig$ = new BehaviorSubject<I18nToolConfig>({});
  private pseudoLocEnabled$ = new BehaviorSubject<boolean>(false);
  private rtlEnabled$ = new BehaviorSubject<boolean>(false);

  public locales = toSignal(this.locales$, { initialValue: [] });
  public timezones = toSignal(this.timezones$, { initialValue: DEFAULT_TIMEZONES });
  public availableCurrencies = toSignal(this.currencies$, { initialValue: DEFAULT_CURRENCIES });

  public forcedLocale = toSignal(this.forcedLocale$, { initialValue: null });
  public forcedTimezone = toSignal(this.forcedTimezone$, { initialValue: null });
  public forcedCurrency = toSignal(this.forcedCurrency$, { initialValue: null });
  public forcedUnitSystem = toSignal(this.forcedUnitSystem$, { initialValue: null });
  public forcedDateFormat = toSignal(this.forcedDateFormat$, { initialValue: null });
  public forcedFirstDayOfWeek = toSignal(this.forcedFirstDayOfWeek$, { initialValue: null });
  public forcedNumberFormat = toSignal(this.forcedNumberFormat$, { initialValue: null });
  public toolConfig = toSignal(this.toolConfig$, { initialValue: {} });
  public pseudoLocEnabled = toSignal(this.pseudoLocEnabled$, { initialValue: false });
  public rtlEnabled = toSignal(this.rtlEnabled$, { initialValue: false });

  constructor() {
    this.migrateOldLanguageKey();
    this.loadFromStorage();
  }

  // --- Locale ---

  setAvailableLocales(locales: I18nLocale[]): void {
    this.locales$.next(locales);
  }

  getAvailableLocales(): Observable<I18nLocale[]> {
    return this.locales$.asObservable();
  }

  setForcedLocale(locale: I18nLocale): void {
    this.forcedLocale$.next(locale);
    this.storageService.set(this.STORAGE_LOCALE, locale);
  }

  getForcedLocale(): Observable<I18nLocale[]> {
    return this.forcedLocale$.pipe(
      map((locale) => {
        if (!this.stateService.isEnabled()) {
          return [];
        }
        return locale ? [locale] : [];
      })
    );
  }

  removeForcedLocale(): void {
    this.forcedLocale$.next(null);
    this.storageService.remove(this.STORAGE_LOCALE);
  }

  // --- Timezone ---

  setAvailableTimezones(timezones: I18nTimezone[]): void {
    this.timezones$.next(timezones);
  }

  getAvailableTimezones(): Observable<I18nTimezone[]> {
    return this.timezones$.asObservable();
  }

  setForcedTimezone(timezone: I18nTimezone): void {
    this.forcedTimezone$.next(timezone);
    this.storageService.set(this.STORAGE_TIMEZONE, timezone);
  }

  getForcedTimezone(): Observable<I18nTimezone | null> {
    return this.forcedTimezone$.pipe(
      map((tz) => (this.stateService.isEnabled() ? tz : null))
    );
  }

  removeForcedTimezone(): void {
    this.forcedTimezone$.next(null);
    this.storageService.remove(this.STORAGE_TIMEZONE);
  }

  // --- Currency ---

  setAvailableCurrencies(currencies: I18nCurrency[]): void {
    this.currencies$.next(currencies);
  }

  getAvailableCurrencies(): Observable<I18nCurrency[]> {
    return this.currencies$.asObservable();
  }

  setForcedCurrency(currency: I18nCurrency): void {
    this.forcedCurrency$.next(currency);
    this.storageService.set(this.STORAGE_CURRENCY, currency);
  }

  getForcedCurrency(): Observable<I18nCurrency | null> {
    return this.forcedCurrency$.pipe(
      map((c) => (this.stateService.isEnabled() ? c : null))
    );
  }

  removeForcedCurrency(): void {
    this.forcedCurrency$.next(null);
    this.storageService.remove(this.STORAGE_CURRENCY);
  }

  // --- Unit System ---

  setForcedUnitSystem(unitSystem: I18nUnitSystem): void {
    this.forcedUnitSystem$.next(unitSystem);
    this.storageService.set(this.STORAGE_UNIT_SYSTEM, unitSystem);
  }

  getForcedUnitSystem(): Observable<I18nUnitSystem | null> {
    return this.forcedUnitSystem$.pipe(
      map((u) => (this.stateService.isEnabled() ? u : null))
    );
  }

  removeForcedUnitSystem(): void {
    this.forcedUnitSystem$.next(null);
    this.storageService.remove(this.STORAGE_UNIT_SYSTEM);
  }

  // --- Date Format ---

  setForcedDateFormat(dateFormat: I18nDateFormat): void {
    this.forcedDateFormat$.next(dateFormat);
    this.storageService.set(this.STORAGE_DATE_FORMAT, dateFormat);
  }

  getForcedDateFormat(): Observable<I18nDateFormat | null> {
    return this.forcedDateFormat$.pipe(
      map((df) => (this.stateService.isEnabled() ? df : null))
    );
  }

  removeForcedDateFormat(): void {
    this.forcedDateFormat$.next(null);
    this.storageService.remove(this.STORAGE_DATE_FORMAT);
  }

  // --- First Day of Week ---

  setForcedFirstDayOfWeek(firstDay: I18nFirstDayOfWeek): void {
    this.forcedFirstDayOfWeek$.next(firstDay);
    this.storageService.set(this.STORAGE_FIRST_DAY, firstDay);
  }

  getForcedFirstDayOfWeek(): Observable<I18nFirstDayOfWeek | null> {
    return this.forcedFirstDayOfWeek$.pipe(
      map((fd) => (this.stateService.isEnabled() ? fd : null))
    );
  }

  removeForcedFirstDayOfWeek(): void {
    this.forcedFirstDayOfWeek$.next(null);
    this.storageService.remove(this.STORAGE_FIRST_DAY);
  }

  // --- Number Format ---

  setForcedNumberFormat(numberFormat: I18nNumberFormat): void {
    this.forcedNumberFormat$.next(numberFormat);
    this.storageService.set(this.STORAGE_NUMBER_FORMAT, numberFormat);
  }

  getForcedNumberFormat(): Observable<I18nNumberFormat | null> {
    return this.forcedNumberFormat$.pipe(
      map((nf) => (this.stateService.isEnabled() ? nf : null))
    );
  }

  removeForcedNumberFormat(): void {
    this.forcedNumberFormat$.next(null);
    this.storageService.remove(this.STORAGE_NUMBER_FORMAT);
  }

  // --- Tool Config ---

  setToolConfig(config: I18nToolConfig): void {
    this.toolConfig$.next(config);
  }

  // --- Pseudo-Localization ---

  setPseudoLocEnabled(enabled: boolean): void {
    this.pseudoLocEnabled$.next(enabled);
    this.storageService.set(this.STORAGE_PSEUDO_LOC, enabled);
  }

  getPseudoLocEnabled(): Observable<boolean> {
    return this.pseudoLocEnabled$.pipe(
      map((enabled) => (this.stateService.isEnabled() ? enabled : false))
    );
  }

  // --- RTL ---

  setRtlEnabled(enabled: boolean): void {
    this.rtlEnabled$.next(enabled);
    this.storageService.set(this.STORAGE_RTL, enabled);
    this.applyRtl(enabled);
  }

  getRtlEnabled(): Observable<boolean> {
    return this.rtlEnabled$.pipe(
      map((enabled) => (this.stateService.isEnabled() ? enabled : false))
    );
  }

  // --- Preset Hooks ---

  async applyPresetLocale(localeId: string | null): Promise<void> {
    if (localeId === null) {
      this.removeForcedLocale();
      return;
    }

    const locales = await firstValueFrom(this.locales$);
    const locale = locales.find((l) => l.id === localeId);

    if (locale) {
      this.setForcedLocale(locale);
    } else {
      console.warn(
        `Locale ${localeId} not found in available locales. Skipping.`
      );
    }
  }

  applyPresetI18n(config: I18nPresetConfig | undefined): void {
    if (!config) return;

    if (config.locale !== undefined) {
      if (config.locale === null) {
        this.removeForcedLocale();
      } else {
        const locale = this.locales$.value.find((l) => l.id === config.locale);
        if (locale) {
          this.setForcedLocale(locale);
        }
      }
    }

    if (config.timezone !== undefined) {
      if (config.timezone === null) {
        this.removeForcedTimezone();
      } else {
        const timezone = this.timezones$.value.find((t) => t.id === config.timezone);
        if (timezone) {
          this.setForcedTimezone(timezone);
        }
      }
    }

    if (config.currency !== undefined) {
      if (config.currency === null) {
        this.removeForcedCurrency();
      } else {
        const currency = this.currencies$.value.find((c) => c.code === config.currency);
        if (currency) {
          this.setForcedCurrency(currency);
        }
      }
    }

    if (config.unitSystem !== undefined) {
      if (config.unitSystem === null) {
        this.removeForcedUnitSystem();
      } else {
        this.setForcedUnitSystem(config.unitSystem as I18nUnitSystem);
      }
    }

    if (config.dateFormat !== undefined) {
      if (config.dateFormat === null) {
        this.removeForcedDateFormat();
      } else {
        this.setForcedDateFormat(config.dateFormat as I18nDateFormat);
      }
    }

    if (config.firstDayOfWeek !== undefined) {
      if (config.firstDayOfWeek === null) {
        this.removeForcedFirstDayOfWeek();
      } else {
        this.setForcedFirstDayOfWeek(config.firstDayOfWeek as I18nFirstDayOfWeek);
      }
    }

    if (config.numberFormat !== undefined) {
      if (config.numberFormat === null) {
        this.removeForcedNumberFormat();
      } else {
        this.setForcedNumberFormat(config.numberFormat as I18nNumberFormat);
      }
    }

    if (config.pseudoLocEnabled !== undefined) {
      this.setPseudoLocEnabled(config.pseudoLocEnabled);
    }

    if (config.rtlEnabled !== undefined) {
      this.setRtlEnabled(config.rtlEnabled);
    }
  }

  getCurrentI18nState(): I18nState {
    return {
      locale: this.forcedLocale$.value,
      timezone: this.forcedTimezone$.value,
      currency: this.forcedCurrency$.value,
      unitSystem: this.forcedUnitSystem$.value,
      dateFormat: this.forcedDateFormat$.value,
      firstDayOfWeek: this.forcedFirstDayOfWeek$.value,
      numberFormat: this.forcedNumberFormat$.value,
      pseudoLocEnabled: this.pseudoLocEnabled$.value,
      rtlEnabled: this.rtlEnabled$.value,
    };
  }

  getCurrentForcedLocaleId(): string | null {
    return this.forcedLocale$.value?.id ?? null;
  }

  // --- Private ---

  private loadFromStorage(): void {
    const savedLocale = this.storageService.get<I18nLocale>(this.STORAGE_LOCALE);
    if (savedLocale) {
      this.forcedLocale$.next(savedLocale);
    }

    const savedTimezone = this.storageService.get<I18nTimezone>(this.STORAGE_TIMEZONE);
    if (savedTimezone) {
      this.forcedTimezone$.next(savedTimezone);
    }

    const savedCurrency = this.storageService.get<I18nCurrency>(this.STORAGE_CURRENCY);
    if (savedCurrency) {
      this.forcedCurrency$.next(savedCurrency);
    }

    const savedUnitSystem = this.storageService.get<I18nUnitSystem>(this.STORAGE_UNIT_SYSTEM);
    if (savedUnitSystem) {
      this.forcedUnitSystem$.next(savedUnitSystem);
    }

    const savedDateFormat = this.storageService.get<I18nDateFormat>(this.STORAGE_DATE_FORMAT);
    if (savedDateFormat) {
      this.forcedDateFormat$.next(savedDateFormat);
    }

    const savedFirstDay = this.storageService.get<I18nFirstDayOfWeek>(this.STORAGE_FIRST_DAY);
    if (savedFirstDay) {
      this.forcedFirstDayOfWeek$.next(savedFirstDay);
    }

    const savedNumberFormat = this.storageService.get<I18nNumberFormat>(this.STORAGE_NUMBER_FORMAT);
    if (savedNumberFormat) {
      this.forcedNumberFormat$.next(savedNumberFormat);
    }

    const savedPseudoLoc = this.storageService.get<boolean>(this.STORAGE_PSEUDO_LOC);
    if (savedPseudoLoc !== null) {
      this.pseudoLocEnabled$.next(savedPseudoLoc);
    }

    const savedRtl = this.storageService.get<boolean>(this.STORAGE_RTL);
    if (savedRtl !== null) {
      this.rtlEnabled$.next(savedRtl);
      if (savedRtl) {
        this.applyRtl(true);
      }
    }
  }

  private migrateOldLanguageKey(): void {
    const oldLanguage = this.storageService.get<{ id: string; name: string }>(
      this.OLD_LANGUAGE_KEY
    );
    if (oldLanguage && !this.storageService.get(this.STORAGE_LOCALE)) {
      const migrated: I18nLocale = {
        id: oldLanguage.id,
        name: oldLanguage.name,
        code: oldLanguage.id,
      };
      this.storageService.set(this.STORAGE_LOCALE, migrated);
      this.storageService.remove(this.OLD_LANGUAGE_KEY);
    }
  }

  private applyRtl(enabled: boolean): void {
    if (this.document?.documentElement) {
      this.document.documentElement.dir = enabled ? 'rtl' : 'ltr';
    }
  }
}
