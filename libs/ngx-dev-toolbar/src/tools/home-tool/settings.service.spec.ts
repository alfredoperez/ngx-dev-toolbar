import { TestBed } from '@angular/core/testing';
import { DevToolsStorageService } from '../../utils/storage.service';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let storageServiceMock: DevToolsStorageService;

  beforeEach(() => {
    storageServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as DevToolsStorageService;

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        { provide: DevToolsStorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSettings', () => {
    it('should return settings from storage if they exist', () => {
      const mockSettings = { isDarkMode: true };
      jest.spyOn(storageServiceMock, 'get').mockReturnValue(mockSettings);

      const result = service.getSettings();

      expect(storageServiceMock.get).toHaveBeenCalledWith('settings');
      expect(result).toEqual(mockSettings);
    });

    it('should return default settings if nothing in storage', () => {
      jest.spyOn(storageServiceMock, 'get').mockReturnValue(null);

      const result = service.getSettings();

      expect(storageServiceMock.get).toHaveBeenCalledWith('settings');
      expect(result).toEqual({ isDarkMode: false });
    });
  });

  describe('setSettings', () => {
    it('should save settings to storage', () => {
      const settings = { isDarkMode: true };

      service.setSettings(settings);

      expect(storageServiceMock.set).toHaveBeenCalledWith('settings', settings);
    });
  });
});
