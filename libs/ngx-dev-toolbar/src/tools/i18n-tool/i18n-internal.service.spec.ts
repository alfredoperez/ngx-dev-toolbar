import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarInternalI18nService } from './i18n-internal.service';
import {
  DEFAULT_CURRENCIES,
  DEFAULT_TIMEZONES,
  I18nCurrency,
  I18nDateFormat,
  I18nFirstDayOfWeek,
  I18nLocale,
  I18nNumberFormat,
  I18nTimezone,
  I18nUnitSystem,
} from './i18n.models';

describe('ToolbarInternalI18nService', () => {
  let service: ToolbarInternalI18nService;
  let storageService: jest.Mocked<ToolbarStorageService>;
  let stateService: { isEnabled: jest.Mock };
  let mockDocument: { documentElement: { dir: string } };

  const createLocale = (
    id: string,
    name: string,
    code?: string
  ): I18nLocale => ({
    id,
    name,
    code: code ?? id,
  });

  const createTimezone = (
    id: string,
    name: string,
    offset: string
  ): I18nTimezone => ({
    id,
    name,
    offset,
  });

  const createCurrency = (
    code: string,
    name: string,
    symbol: string
  ): I18nCurrency => ({
    code,
    name,
    symbol,
  });

  function setupTestBed(
    storageGetFn?: jest.Mock
  ): ToolbarInternalI18nService {
    const storageServiceMock = {
      get: storageGetFn ?? jest.fn().mockReturnValue(null),
      set: jest.fn(),
      remove: jest.fn(),
    };

    stateService = {
      isEnabled: jest.fn().mockReturnValue(true),
    };

    mockDocument = {
      documentElement: { dir: 'ltr' },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ToolbarInternalI18nService,
        { provide: ToolbarStorageService, useValue: storageServiceMock },
        { provide: ToolbarStateService, useValue: stateService },
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });

    storageService = TestBed.inject(
      ToolbarStorageService
    ) as jest.Mocked<ToolbarStorageService>;

    return TestBed.inject(ToolbarInternalI18nService);
  }

  beforeEach(() => {
    service = setupTestBed();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty locales', () => {
      expect(service.locales()).toEqual([]);
    });

    it('should initialize timezones with defaults', () => {
      expect(service.timezones()).toEqual(DEFAULT_TIMEZONES);
    });

    it('should initialize currencies with defaults', () => {
      expect(service.availableCurrencies()).toEqual(DEFAULT_CURRENCIES);
    });

    it('should initialize forced values as null', () => {
      expect(service.forcedLocale()).toBeNull();
      expect(service.forcedTimezone()).toBeNull();
      expect(service.forcedCurrency()).toBeNull();
      expect(service.forcedUnitSystem()).toBeNull();
      expect(service.forcedDateFormat()).toBeNull();
      expect(service.forcedFirstDayOfWeek()).toBeNull();
      expect(service.forcedNumberFormat()).toBeNull();
    });

    it('should initialize boolean toggles as false', () => {
      expect(service.pseudoLocEnabled()).toBe(false);
      expect(service.rtlEnabled()).toBe(false);
    });

    it('should load forced locale from storage on initialization', () => {
      const savedLocale = createLocale('en', 'English');
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.locale') return savedLocale;
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.forcedLocale()).toEqual(savedLocale);
    });

    it('should load forced timezone from storage on initialization', () => {
      const savedTz = createTimezone('UTC', 'UTC', '+00:00');
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.timezone') return savedTz;
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.forcedTimezone()).toEqual(savedTz);
    });

    it('should load forced currency from storage on initialization', () => {
      const savedCurrency = createCurrency('EUR', 'Euro', '\u20AC');
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.currency') return savedCurrency;
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.forcedCurrency()).toEqual(savedCurrency);
    });

    it('should load forced unit system from storage on initialization', () => {
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.unitSystem') return 'imperial';
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.forcedUnitSystem()).toBe('imperial');
    });

    it('should load forced date format from storage on initialization', () => {
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.dateFormat') return 'DD/MM/YYYY';
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.forcedDateFormat()).toBe('DD/MM/YYYY');
    });

    it('should load forced first day of week from storage on initialization', () => {
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.firstDay') return 'monday';
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.forcedFirstDayOfWeek()).toBe('monday');
    });

    it('should load forced number format from storage on initialization', () => {
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.numberFormat') return 'comma-period';
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.forcedNumberFormat()).toBe('comma-period');
    });

    it('should load pseudo-loc setting from storage on initialization', () => {
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.pseudoLoc') return true;
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.pseudoLocEnabled()).toBe(true);
    });

    it('should load RTL setting from storage and apply to document', () => {
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.rtl') return true;
        return null;
      });

      const svc = setupTestBed(getFn);
      expect(svc.rtlEnabled()).toBe(true);
      expect(mockDocument.documentElement.dir).toBe('rtl');
    });
  });

  describe('locale', () => {
    it('should set available locales', () => {
      const locales = [
        createLocale('en', 'English'),
        createLocale('es', 'Spanish'),
      ];

      service.setAvailableLocales(locales);

      expect(service.locales()).toEqual(locales);
    });

    it('should emit available locales through getAvailableLocales', async () => {
      const locales = [createLocale('en', 'English')];
      service.setAvailableLocales(locales);

      const result = await firstValueFrom(service.getAvailableLocales());
      expect(result).toEqual(locales);
    });

    it('should set forced locale and persist to storage', () => {
      const locale = createLocale('en', 'English');

      service.setForcedLocale(locale);

      expect(service.forcedLocale()).toEqual(locale);
      expect(storageService.set).toHaveBeenCalledWith('i18n.locale', locale);
    });

    it('should emit forced locale through getForcedLocale', async () => {
      const locale = createLocale('es', 'Spanish');
      service.setForcedLocale(locale);

      const result = await firstValueFrom(service.getForcedLocale());
      expect(result).toEqual([locale]);
    });

    it('should return empty array from getForcedLocale when none set', async () => {
      const result = await firstValueFrom(service.getForcedLocale());
      expect(result).toEqual([]);
    });

    it('should remove forced locale and clear from storage', async () => {
      service.setForcedLocale(createLocale('en', 'English'));

      service.removeForcedLocale();

      expect(service.forcedLocale()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.locale');
      const result = await firstValueFrom(service.getForcedLocale());
      expect(result).toEqual([]);
    });

    it('should replace previous forced locale', async () => {
      service.setForcedLocale(createLocale('en', 'English'));
      service.setForcedLocale(createLocale('fr', 'French'));

      const result = await firstValueFrom(service.getForcedLocale());
      expect(result).toEqual([createLocale('fr', 'French')]);
    });
  });

  describe('timezone', () => {
    it('should set available timezones', () => {
      const timezones = [createTimezone('UTC', 'UTC', '+00:00')];

      service.setAvailableTimezones(timezones);

      expect(service.timezones()).toEqual(timezones);
    });

    it('should emit available timezones through getAvailableTimezones', async () => {
      const timezones = [createTimezone('UTC', 'UTC', '+00:00')];
      service.setAvailableTimezones(timezones);

      const result = await firstValueFrom(service.getAvailableTimezones());
      expect(result).toEqual(timezones);
    });

    it('should set forced timezone and persist to storage', () => {
      const timezone = createTimezone('UTC', 'UTC', '+00:00');

      service.setForcedTimezone(timezone);

      expect(service.forcedTimezone()).toEqual(timezone);
      expect(storageService.set).toHaveBeenCalledWith(
        'i18n.timezone',
        timezone
      );
    });

    it('should emit forced timezone through getForcedTimezone', async () => {
      const timezone = createTimezone('UTC', 'UTC', '+00:00');
      service.setForcedTimezone(timezone);

      const result = await firstValueFrom(service.getForcedTimezone());
      expect(result).toEqual(timezone);
    });

    it('should return null from getForcedTimezone when none set', async () => {
      const result = await firstValueFrom(service.getForcedTimezone());
      expect(result).toBeNull();
    });

    it('should remove forced timezone and clear from storage', async () => {
      service.setForcedTimezone(createTimezone('UTC', 'UTC', '+00:00'));

      service.removeForcedTimezone();

      expect(service.forcedTimezone()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.timezone');
      const result = await firstValueFrom(service.getForcedTimezone());
      expect(result).toBeNull();
    });
  });

  describe('currency', () => {
    it('should set available currencies', () => {
      const currencies = [createCurrency('USD', 'US Dollar', '$')];

      service.setAvailableCurrencies(currencies);

      expect(service.availableCurrencies()).toEqual(currencies);
    });

    it('should emit available currencies through getAvailableCurrencies', async () => {
      const currencies = [createCurrency('USD', 'US Dollar', '$')];
      service.setAvailableCurrencies(currencies);

      const result = await firstValueFrom(service.getAvailableCurrencies());
      expect(result).toEqual(currencies);
    });

    it('should set forced currency and persist to storage', () => {
      const currency = createCurrency('EUR', 'Euro', '\u20AC');

      service.setForcedCurrency(currency);

      expect(service.forcedCurrency()).toEqual(currency);
      expect(storageService.set).toHaveBeenCalledWith(
        'i18n.currency',
        currency
      );
    });

    it('should emit forced currency through getForcedCurrency', async () => {
      const currency = createCurrency('EUR', 'Euro', '\u20AC');
      service.setForcedCurrency(currency);

      const result = await firstValueFrom(service.getForcedCurrency());
      expect(result).toEqual(currency);
    });

    it('should return null from getForcedCurrency when none set', async () => {
      const result = await firstValueFrom(service.getForcedCurrency());
      expect(result).toBeNull();
    });

    it('should remove forced currency and clear from storage', async () => {
      service.setForcedCurrency(createCurrency('EUR', 'Euro', '\u20AC'));

      service.removeForcedCurrency();

      expect(service.forcedCurrency()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.currency');
      const result = await firstValueFrom(service.getForcedCurrency());
      expect(result).toBeNull();
    });
  });

  describe('unit system', () => {
    it('should set forced unit system and persist to storage', () => {
      service.setForcedUnitSystem('metric');

      expect(service.forcedUnitSystem()).toBe('metric');
      expect(storageService.set).toHaveBeenCalledWith(
        'i18n.unitSystem',
        'metric'
      );
    });

    it('should emit forced unit system through getForcedUnitSystem', async () => {
      service.setForcedUnitSystem('imperial');

      const result = await firstValueFrom(service.getForcedUnitSystem());
      expect(result).toBe('imperial');
    });

    it('should return null from getForcedUnitSystem when none set', async () => {
      const result = await firstValueFrom(service.getForcedUnitSystem());
      expect(result).toBeNull();
    });

    it('should remove forced unit system and clear from storage', async () => {
      service.setForcedUnitSystem('metric');

      service.removeForcedUnitSystem();

      expect(service.forcedUnitSystem()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.unitSystem');
      const result = await firstValueFrom(service.getForcedUnitSystem());
      expect(result).toBeNull();
    });
  });

  describe('date format', () => {
    it('should set forced date format and persist to storage', () => {
      service.setForcedDateFormat('DD/MM/YYYY');

      expect(service.forcedDateFormat()).toBe('DD/MM/YYYY');
      expect(storageService.set).toHaveBeenCalledWith('i18n.dateFormat', 'DD/MM/YYYY');
    });

    it('should emit forced date format through getForcedDateFormat', async () => {
      service.setForcedDateFormat('YYYY-MM-DD');

      const result = await firstValueFrom(service.getForcedDateFormat());
      expect(result).toBe('YYYY-MM-DD');
    });

    it('should return null from getForcedDateFormat when none set', async () => {
      const result = await firstValueFrom(service.getForcedDateFormat());
      expect(result).toBeNull();
    });

    it('should remove forced date format and clear from storage', async () => {
      service.setForcedDateFormat('MM/DD/YYYY');
      service.removeForcedDateFormat();

      expect(service.forcedDateFormat()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.dateFormat');
      const result = await firstValueFrom(service.getForcedDateFormat());
      expect(result).toBeNull();
    });
  });

  describe('first day of week', () => {
    it('should set forced first day of week and persist to storage', () => {
      service.setForcedFirstDayOfWeek('monday');

      expect(service.forcedFirstDayOfWeek()).toBe('monday');
      expect(storageService.set).toHaveBeenCalledWith('i18n.firstDay', 'monday');
    });

    it('should emit forced first day of week through getForcedFirstDayOfWeek', async () => {
      service.setForcedFirstDayOfWeek('saturday');

      const result = await firstValueFrom(service.getForcedFirstDayOfWeek());
      expect(result).toBe('saturday');
    });

    it('should return null from getForcedFirstDayOfWeek when none set', async () => {
      const result = await firstValueFrom(service.getForcedFirstDayOfWeek());
      expect(result).toBeNull();
    });

    it('should remove forced first day of week and clear from storage', async () => {
      service.setForcedFirstDayOfWeek('sunday');
      service.removeForcedFirstDayOfWeek();

      expect(service.forcedFirstDayOfWeek()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.firstDay');
      const result = await firstValueFrom(service.getForcedFirstDayOfWeek());
      expect(result).toBeNull();
    });
  });

  describe('number format', () => {
    it('should set forced number format and persist to storage', () => {
      service.setForcedNumberFormat('comma-period');

      expect(service.forcedNumberFormat()).toBe('comma-period');
      expect(storageService.set).toHaveBeenCalledWith('i18n.numberFormat', 'comma-period');
    });

    it('should emit forced number format through getForcedNumberFormat', async () => {
      service.setForcedNumberFormat('space-comma');

      const result = await firstValueFrom(service.getForcedNumberFormat());
      expect(result).toBe('space-comma');
    });

    it('should return null from getForcedNumberFormat when none set', async () => {
      const result = await firstValueFrom(service.getForcedNumberFormat());
      expect(result).toBeNull();
    });

    it('should remove forced number format and clear from storage', async () => {
      service.setForcedNumberFormat('period-comma');
      service.removeForcedNumberFormat();

      expect(service.forcedNumberFormat()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.numberFormat');
      const result = await firstValueFrom(service.getForcedNumberFormat());
      expect(result).toBeNull();
    });
  });

  describe('tool config', () => {
    it('should initialize with empty config', () => {
      expect(service.toolConfig()).toEqual({});
    });

    it('should update tool config', () => {
      service.setToolConfig({ showTimezone: false, showUnits: false });

      expect(service.toolConfig()).toEqual({ showTimezone: false, showUnits: false });
    });

    it('should replace previous config entirely', () => {
      service.setToolConfig({ showTimezone: false });
      service.setToolConfig({ showCurrency: false });

      expect(service.toolConfig()).toEqual({ showCurrency: false });
    });
  });

  describe('pseudo-localization', () => {
    it('should set pseudo-loc enabled and persist to storage', () => {
      service.setPseudoLocEnabled(true);

      expect(service.pseudoLocEnabled()).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith('i18n.pseudoLoc', true);
    });

    it('should emit pseudo-loc state through getPseudoLocEnabled', async () => {
      service.setPseudoLocEnabled(true);

      const result = await firstValueFrom(service.getPseudoLocEnabled());
      expect(result).toBe(true);
    });

    it('should disable pseudo-loc', async () => {
      service.setPseudoLocEnabled(true);
      service.setPseudoLocEnabled(false);

      const result = await firstValueFrom(service.getPseudoLocEnabled());
      expect(result).toBe(false);
    });
  });

  describe('RTL', () => {
    it('should set RTL enabled, persist to storage, and apply to document', () => {
      service.setRtlEnabled(true);

      expect(service.rtlEnabled()).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith('i18n.rtl', true);
      expect(mockDocument.documentElement.dir).toBe('rtl');
    });

    it('should set document.dir to ltr when RTL disabled', () => {
      service.setRtlEnabled(true);
      service.setRtlEnabled(false);

      expect(mockDocument.documentElement.dir).toBe('ltr');
    });

    it('should emit RTL state through getRtlEnabled', async () => {
      service.setRtlEnabled(true);

      const result = await firstValueFrom(service.getRtlEnabled());
      expect(result).toBe(true);
    });
  });

  describe('isEnabled gating', () => {
    it('should return empty array from getForcedLocale when toolbar is disabled', async () => {
      service.setForcedLocale(createLocale('en', 'English'));
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getForcedLocale());
      expect(result).toEqual([]);
    });

    it('should return null from getForcedTimezone when toolbar is disabled', async () => {
      service.setForcedTimezone(createTimezone('UTC', 'UTC', '+00:00'));
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getForcedTimezone());
      expect(result).toBeNull();
    });

    it('should return null from getForcedCurrency when toolbar is disabled', async () => {
      service.setForcedCurrency(createCurrency('USD', 'US Dollar', '$'));
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getForcedCurrency());
      expect(result).toBeNull();
    });

    it('should return null from getForcedUnitSystem when toolbar is disabled', async () => {
      service.setForcedUnitSystem('metric');
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getForcedUnitSystem());
      expect(result).toBeNull();
    });

    it('should return null from getForcedDateFormat when toolbar is disabled', async () => {
      service.setForcedDateFormat('DD/MM/YYYY');
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getForcedDateFormat());
      expect(result).toBeNull();
    });

    it('should return null from getForcedFirstDayOfWeek when toolbar is disabled', async () => {
      service.setForcedFirstDayOfWeek('monday');
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getForcedFirstDayOfWeek());
      expect(result).toBeNull();
    });

    it('should return null from getForcedNumberFormat when toolbar is disabled', async () => {
      service.setForcedNumberFormat('comma-period');
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getForcedNumberFormat());
      expect(result).toBeNull();
    });

    it('should return false from getPseudoLocEnabled when toolbar is disabled', async () => {
      service.setPseudoLocEnabled(true);
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getPseudoLocEnabled());
      expect(result).toBe(false);
    });

    it('should return false from getRtlEnabled when toolbar is disabled', async () => {
      service.setRtlEnabled(true);
      stateService.isEnabled.mockReturnValue(false);

      const result = await firstValueFrom(service.getRtlEnabled());
      expect(result).toBe(false);
    });
  });

  describe('applyPresetI18n', () => {
    beforeEach(() => {
      service.setAvailableLocales([
        createLocale('en', 'English'),
        createLocale('es', 'Spanish'),
        createLocale('fr', 'French'),
      ]);
    });

    it('should do nothing when config is undefined', () => {
      service.applyPresetI18n(undefined);

      expect(service.forcedLocale()).toBeNull();
    });

    it('should resolve locale string ID to locale object and set it', () => {
      service.applyPresetI18n({ locale: 'es' });

      expect(service.forcedLocale()).toEqual(createLocale('es', 'Spanish'));
      expect(storageService.set).toHaveBeenCalledWith(
        'i18n.locale',
        createLocale('es', 'Spanish')
      );
    });

    it('should remove locale when config.locale is null', () => {
      service.setForcedLocale(createLocale('en', 'English'));

      service.applyPresetI18n({ locale: null });

      expect(service.forcedLocale()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.locale');
    });

    it('should not change locale when ID is not found in available locales', () => {
      service.setForcedLocale(createLocale('en', 'English'));

      service.applyPresetI18n({ locale: 'invalid' });

      expect(service.forcedLocale()).toEqual(createLocale('en', 'English'));
    });

    it('should resolve timezone string ID to timezone object and set it', () => {
      service.applyPresetI18n({ timezone: 'UTC' });

      expect(service.forcedTimezone()).toEqual(
        DEFAULT_TIMEZONES.find((t) => t.id === 'UTC')
      );
    });

    it('should remove timezone when config.timezone is null', () => {
      service.setForcedTimezone(DEFAULT_TIMEZONES[0]);

      service.applyPresetI18n({ timezone: null });

      expect(service.forcedTimezone()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.timezone');
    });

    it('should resolve currency code to currency object and set it', () => {
      service.applyPresetI18n({ currency: 'EUR' });

      expect(service.forcedCurrency()).toEqual(
        DEFAULT_CURRENCIES.find((c) => c.code === 'EUR')
      );
    });

    it('should remove currency when config.currency is null', () => {
      service.setForcedCurrency(DEFAULT_CURRENCIES[0]);

      service.applyPresetI18n({ currency: null });

      expect(service.forcedCurrency()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.currency');
    });

    it('should set unit system from config', () => {
      service.applyPresetI18n({ unitSystem: 'imperial' });

      expect(service.forcedUnitSystem()).toBe('imperial');
    });

    it('should remove unit system when config.unitSystem is null', () => {
      service.setForcedUnitSystem('metric');

      service.applyPresetI18n({ unitSystem: null });

      expect(service.forcedUnitSystem()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.unitSystem');
    });

    it('should set date format from config', () => {
      service.applyPresetI18n({ dateFormat: 'DD/MM/YYYY' });

      expect(service.forcedDateFormat()).toBe('DD/MM/YYYY');
    });

    it('should remove date format when config.dateFormat is null', () => {
      service.setForcedDateFormat('MM/DD/YYYY');

      service.applyPresetI18n({ dateFormat: null });

      expect(service.forcedDateFormat()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.dateFormat');
    });

    it('should set first day of week from config', () => {
      service.applyPresetI18n({ firstDayOfWeek: 'monday' });

      expect(service.forcedFirstDayOfWeek()).toBe('monday');
    });

    it('should remove first day of week when config.firstDayOfWeek is null', () => {
      service.setForcedFirstDayOfWeek('sunday');

      service.applyPresetI18n({ firstDayOfWeek: null });

      expect(service.forcedFirstDayOfWeek()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.firstDay');
    });

    it('should set number format from config', () => {
      service.applyPresetI18n({ numberFormat: 'space-comma' });

      expect(service.forcedNumberFormat()).toBe('space-comma');
    });

    it('should remove number format when config.numberFormat is null', () => {
      service.setForcedNumberFormat('comma-period');

      service.applyPresetI18n({ numberFormat: null });

      expect(service.forcedNumberFormat()).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith('i18n.numberFormat');
    });

    it('should set pseudoLocEnabled from config', () => {
      service.applyPresetI18n({ pseudoLocEnabled: true });

      expect(service.pseudoLocEnabled()).toBe(true);
    });

    it('should set rtlEnabled from config and apply to document', () => {
      service.applyPresetI18n({ rtlEnabled: true });

      expect(service.rtlEnabled()).toBe(true);
      expect(mockDocument.documentElement.dir).toBe('rtl');
    });

    it('should apply multiple dimensions at once', () => {
      service.applyPresetI18n({
        locale: 'fr',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        unitSystem: 'metric',
        pseudoLocEnabled: false,
        rtlEnabled: false,
      });

      expect(service.forcedLocale()).toEqual(createLocale('fr', 'French'));
      expect(service.forcedTimezone()?.id).toBe('Europe/Paris');
      expect(service.forcedCurrency()?.code).toBe('EUR');
      expect(service.forcedUnitSystem()).toBe('metric');
      expect(service.pseudoLocEnabled()).toBe(false);
      expect(service.rtlEnabled()).toBe(false);
    });

    it('should skip dimensions not present in config', () => {
      service.setForcedLocale(createLocale('en', 'English'));
      service.setForcedUnitSystem('metric');

      service.applyPresetI18n({ currency: 'GBP' });

      // Locale and unit system should remain unchanged
      expect(service.forcedLocale()).toEqual(createLocale('en', 'English'));
      expect(service.forcedUnitSystem()).toBe('metric');
      expect(service.forcedCurrency()?.code).toBe('GBP');
    });
  });

  describe('getCurrentI18nState', () => {
    it('should return current state with all null/false defaults', () => {
      const state = service.getCurrentI18nState();

      expect(state).toEqual({
        locale: null,
        timezone: null,
        currency: null,
        unitSystem: null,
        dateFormat: null,
        firstDayOfWeek: null,
        numberFormat: null,
        pseudoLocEnabled: false,
        rtlEnabled: false,
      });
    });

    it('should return current state with forced values', () => {
      const locale = createLocale('en', 'English');
      const timezone = DEFAULT_TIMEZONES[0];
      const currency = DEFAULT_CURRENCIES[0];

      service.setForcedLocale(locale);
      service.setForcedTimezone(timezone);
      service.setForcedCurrency(currency);
      service.setForcedUnitSystem('metric');
      service.setForcedDateFormat('DD/MM/YYYY');
      service.setForcedFirstDayOfWeek('monday');
      service.setForcedNumberFormat('comma-period');
      service.setPseudoLocEnabled(true);
      service.setRtlEnabled(true);

      const state = service.getCurrentI18nState();

      expect(state).toEqual({
        locale,
        timezone,
        currency,
        unitSystem: 'metric',
        dateFormat: 'DD/MM/YYYY',
        firstDayOfWeek: 'monday',
        numberFormat: 'comma-period',
        pseudoLocEnabled: true,
        rtlEnabled: true,
      });
    });
  });

  describe('getCurrentForcedLocaleId', () => {
    it('should return null when no forced locale', () => {
      expect(service.getCurrentForcedLocaleId()).toBeNull();
    });

    it('should return locale ID when forced locale is set', () => {
      service.setForcedLocale(createLocale('es', 'Spanish'));

      expect(service.getCurrentForcedLocaleId()).toBe('es');
    });

    it('should return null after removing forced locale', () => {
      service.setForcedLocale(createLocale('en', 'English'));
      service.removeForcedLocale();

      expect(service.getCurrentForcedLocaleId()).toBeNull();
    });
  });

  describe('applyPresetLocale (async)', () => {
    beforeEach(() => {
      service.setAvailableLocales([
        createLocale('en', 'English'),
        createLocale('es', 'Spanish'),
        createLocale('fr', 'French'),
      ]);
    });

    it('should apply preset locale by ID', async () => {
      await service.applyPresetLocale('es');

      const result = await firstValueFrom(service.getForcedLocale());
      expect(result).toEqual([createLocale('es', 'Spanish')]);
    });

    it('should persist applied preset locale to storage', async () => {
      await service.applyPresetLocale('fr');

      expect(storageService.set).toHaveBeenCalledWith(
        'i18n.locale',
        createLocale('fr', 'French')
      );
    });

    it('should handle null localeId by removing forced locale', async () => {
      service.setForcedLocale(createLocale('en', 'English'));

      await service.applyPresetLocale(null);

      const result = await firstValueFrom(service.getForcedLocale());
      expect(result).toEqual([]);
      expect(storageService.remove).toHaveBeenCalledWith('i18n.locale');
    });

    it('should log warning when locale ID not found', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.applyPresetLocale('invalid-locale');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Locale invalid-locale not found')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should not change forced locale when ID not found', async () => {
      service.setForcedLocale(createLocale('en', 'English'));

      await service.applyPresetLocale('invalid-locale');

      expect(service.getCurrentForcedLocaleId()).toBe('en');
    });

    it('should handle rapid sequential applications', async () => {
      await service.applyPresetLocale('en');
      await service.applyPresetLocale('es');
      await service.applyPresetLocale('fr');

      expect(service.getCurrentForcedLocaleId()).toBe('fr');
    });
  });

  describe('old language key migration', () => {
    it('should migrate old language key to i18n.locale', () => {
      const oldLanguage = { id: 'en', name: 'English' };
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'language') return oldLanguage;
        return null;
      });

      setupTestBed(getFn);

      expect(storageService.set).toHaveBeenCalledWith('i18n.locale', {
        id: 'en',
        name: 'English',
        code: 'en',
      });
      expect(storageService.remove).toHaveBeenCalledWith('language');
    });

    it('should not migrate if i18n.locale already exists', () => {
      const oldLanguage = { id: 'en', name: 'English' };
      const existingLocale = createLocale('fr', 'French');
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'language') return oldLanguage;
        if (key === 'i18n.locale') return existingLocale;
        return null;
      });

      const svc = setupTestBed(getFn);

      // Should not have removed the old key since migration was skipped
      expect(storageService.remove).not.toHaveBeenCalledWith('language');
      // Forced locale should be loaded from i18n.locale, not migrated
      expect(svc.forcedLocale()).toEqual(existingLocale);
    });

    it('should not migrate if old language key does not exist', () => {
      const getFn = jest.fn().mockReturnValue(null);

      setupTestBed(getFn);

      // set should not have been called for migration
      expect(storageService.set).not.toHaveBeenCalledWith(
        'i18n.locale',
        expect.objectContaining({ code: expect.any(String) })
      );
    });
  });

  describe('persistence', () => {
    it('should handle missing storage gracefully', () => {
      const getFn = jest.fn().mockReturnValue(null);

      expect(() => setupTestBed(getFn)).not.toThrow();
    });

    it('should handle corrupted storage data gracefully', () => {
      const getFn = jest
        .fn()
        .mockReturnValue({ invalid: 'data' } as any);

      expect(() => setupTestBed(getFn)).not.toThrow();
    });

    it('should not apply RTL from storage when savedRtl is false', () => {
      const getFn = jest.fn().mockImplementation((key: string) => {
        if (key === 'i18n.rtl') return false;
        return null;
      });

      setupTestBed(getFn);

      expect(mockDocument.documentElement.dir).toBe('ltr');
    });
  });
});
