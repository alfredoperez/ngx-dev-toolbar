import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ToolbarInternalI18nService } from './i18n-internal.service';
import { ToolbarI18nService } from './i18n.service';
import {
  I18nCurrency,
  I18nLocale,
  I18nTimezone,
  I18nUnitSystem,
} from './i18n.models';

describe('ToolbarI18nService', () => {
  let service: ToolbarI18nService;
  let internalServiceMock: {
    setAvailableLocales: jest.Mock;
    getForcedLocale: jest.Mock;
    setAvailableTimezones: jest.Mock;
    setAvailableCurrencies: jest.Mock;
    getForcedTimezone: jest.Mock;
    getForcedCurrency: jest.Mock;
    getForcedUnitSystem: jest.Mock;
    getPseudoLocEnabled: jest.Mock;
    getRtlEnabled: jest.Mock;
  };

  const mockLocale: I18nLocale = {
    id: 'en-US',
    name: 'English (US)',
    code: 'en-US',
  };

  const mockLocale2: I18nLocale = {
    id: 'es-MX',
    name: 'Spanish (Mexico)',
    code: 'es-MX',
  };

  const mockTimezone: I18nTimezone = {
    id: 'America/New_York',
    name: 'Eastern Time (US)',
    offset: '-05:00',
  };

  const mockCurrency: I18nCurrency = {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
  };

  beforeEach(() => {
    internalServiceMock = {
      setAvailableLocales: jest.fn(),
      getForcedLocale: jest.fn().mockReturnValue(of([])),
      setAvailableTimezones: jest.fn(),
      setAvailableCurrencies: jest.fn(),
      getForcedTimezone: jest.fn().mockReturnValue(of(null)),
      getForcedCurrency: jest.fn().mockReturnValue(of(null)),
      getForcedUnitSystem: jest.fn().mockReturnValue(of(null)),
      getPseudoLocEnabled: jest.fn().mockReturnValue(of(false)),
      getRtlEnabled: jest.fn().mockReturnValue(of(false)),
    };

    TestBed.configureTestingModule({
      providers: [
        ToolbarI18nService,
        {
          provide: ToolbarInternalI18nService,
          useValue: internalServiceMock,
        },
      ],
    });

    service = TestBed.inject(ToolbarI18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setAvailableOptions', () => {
    it('should delegate to internalService.setAvailableLocales', () => {
      const locales = [mockLocale, mockLocale2];

      service.setAvailableOptions(locales);

      expect(internalServiceMock.setAvailableLocales).toHaveBeenCalledWith(
        locales
      );
    });

    it('should handle empty array', () => {
      service.setAvailableOptions([]);

      expect(internalServiceMock.setAvailableLocales).toHaveBeenCalledWith([]);
    });
  });

  describe('getForcedValues', () => {
    it('should delegate to internalService.getForcedLocale', async () => {
      internalServiceMock.getForcedLocale.mockReturnValue(of([mockLocale]));

      const result = await firstValueFrom(service.getForcedValues());

      expect(internalServiceMock.getForcedLocale).toHaveBeenCalled();
      expect(result).toEqual([mockLocale]);
    });

    it('should return empty array when no locale is forced', async () => {
      internalServiceMock.getForcedLocale.mockReturnValue(of([]));

      const result = await firstValueFrom(service.getForcedValues());

      expect(result).toEqual([]);
    });
  });

  describe('getValues', () => {
    it('should delegate to internalService.getForcedLocale', async () => {
      internalServiceMock.getForcedLocale.mockReturnValue(of([mockLocale]));

      const result = await firstValueFrom(service.getValues());

      expect(internalServiceMock.getForcedLocale).toHaveBeenCalled();
      expect(result).toEqual([mockLocale]);
    });

    it('should return empty array when no locale is forced', async () => {
      internalServiceMock.getForcedLocale.mockReturnValue(of([]));

      const result = await firstValueFrom(service.getValues());

      expect(result).toEqual([]);
    });
  });

  describe('setAvailableTimezones', () => {
    it('should delegate to internalService.setAvailableTimezones', () => {
      const timezones = [mockTimezone];

      service.setAvailableTimezones(timezones);

      expect(internalServiceMock.setAvailableTimezones).toHaveBeenCalledWith(
        timezones
      );
    });

    it('should handle empty array', () => {
      service.setAvailableTimezones([]);

      expect(internalServiceMock.setAvailableTimezones).toHaveBeenCalledWith(
        []
      );
    });
  });

  describe('setAvailableCurrencies', () => {
    it('should delegate to internalService.setAvailableCurrencies', () => {
      const currencies = [mockCurrency];

      service.setAvailableCurrencies(currencies);

      expect(internalServiceMock.setAvailableCurrencies).toHaveBeenCalledWith(
        currencies
      );
    });

    it('should handle empty array', () => {
      service.setAvailableCurrencies([]);

      expect(internalServiceMock.setAvailableCurrencies).toHaveBeenCalledWith(
        []
      );
    });
  });

  describe('getForcedTimezone', () => {
    it('should delegate to internalService.getForcedTimezone', async () => {
      internalServiceMock.getForcedTimezone.mockReturnValue(of(mockTimezone));

      const result = await firstValueFrom(service.getForcedTimezone());

      expect(internalServiceMock.getForcedTimezone).toHaveBeenCalled();
      expect(result).toEqual(mockTimezone);
    });

    it('should return null when no timezone is forced', async () => {
      internalServiceMock.getForcedTimezone.mockReturnValue(of(null));

      const result = await firstValueFrom(service.getForcedTimezone());

      expect(result).toBeNull();
    });
  });

  describe('getForcedCurrency', () => {
    it('should delegate to internalService.getForcedCurrency', async () => {
      internalServiceMock.getForcedCurrency.mockReturnValue(of(mockCurrency));

      const result = await firstValueFrom(service.getForcedCurrency());

      expect(internalServiceMock.getForcedCurrency).toHaveBeenCalled();
      expect(result).toEqual(mockCurrency);
    });

    it('should return null when no currency is forced', async () => {
      internalServiceMock.getForcedCurrency.mockReturnValue(of(null));

      const result = await firstValueFrom(service.getForcedCurrency());

      expect(result).toBeNull();
    });
  });

  describe('getUnitSystem', () => {
    it('should delegate to internalService.getForcedUnitSystem', async () => {
      const unitSystem: I18nUnitSystem = 'metric';
      internalServiceMock.getForcedUnitSystem.mockReturnValue(of(unitSystem));

      const result = await firstValueFrom(service.getUnitSystem());

      expect(internalServiceMock.getForcedUnitSystem).toHaveBeenCalled();
      expect(result).toBe('metric');
    });

    it('should return imperial when set', async () => {
      internalServiceMock.getForcedUnitSystem.mockReturnValue(of('imperial'));

      const result = await firstValueFrom(service.getUnitSystem());

      expect(result).toBe('imperial');
    });

    it('should return null when no unit system is forced', async () => {
      internalServiceMock.getForcedUnitSystem.mockReturnValue(of(null));

      const result = await firstValueFrom(service.getUnitSystem());

      expect(result).toBeNull();
    });
  });

  describe('isPseudoLocalizationEnabled', () => {
    it('should delegate to internalService.getPseudoLocEnabled', async () => {
      internalServiceMock.getPseudoLocEnabled.mockReturnValue(of(true));

      const result = await firstValueFrom(
        service.isPseudoLocalizationEnabled()
      );

      expect(internalServiceMock.getPseudoLocEnabled).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when pseudo-localization is disabled', async () => {
      internalServiceMock.getPseudoLocEnabled.mockReturnValue(of(false));

      const result = await firstValueFrom(
        service.isPseudoLocalizationEnabled()
      );

      expect(result).toBe(false);
    });
  });

  describe('isRtlEnabled', () => {
    it('should delegate to internalService.getRtlEnabled', async () => {
      internalServiceMock.getRtlEnabled.mockReturnValue(of(true));

      const result = await firstValueFrom(service.isRtlEnabled());

      expect(internalServiceMock.getRtlEnabled).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when RTL is disabled', async () => {
      internalServiceMock.getRtlEnabled.mockReturnValue(of(false));

      const result = await firstValueFrom(service.isRtlEnabled());

      expect(result).toBe(false);
    });
  });
});
