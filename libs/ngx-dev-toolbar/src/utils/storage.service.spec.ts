import { TestBed } from '@angular/core/testing';
import { DevToolsStorageService } from './storage.service';

describe('DevToolsStorageService', () => {
  let service: DevToolsStorageService;
  let storageMock: { [key: string]: string };

  beforeAll(() => {
    storageMock = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => storageMock[key] || null,
      setItem: (key: string, value: string): void => {
        storageMock[key] = value;
      },
      removeItem: (key: string): void => {
        delete storageMock[key];
      },
      clear: (): void => {
        storageMock = {};
      },
      length: 0,
      key: (): string => '',
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  beforeEach(() => {
    storageMock = {};
    TestBed.configureTestingModule({
      providers: [DevToolsStorageService],
    });
    service = TestBed.inject(DevToolsStorageService);
  });

  describe('set', () => {
    it('should store value in localStorage with prefix', () => {
      const key = 'testKey';
      const value = { test: 'value' };

      service.set(key, value);

      const storedValue = JSON.parse(
        storageMock['AngularDevTools.testKey'] ?? '{}'
      );
      expect(storedValue).toEqual(value);
    });

    it('should add key to tool keys', () => {
      const key = 'testKey';
      const value = { test: 'value' };

      service.set(key, value);

      const toolKeys = JSON.parse(storageMock['AngularDevTools.keys'] ?? '[]');
      expect(toolKeys).toContain('AngularDevTools.testKey');
    });
  });

  describe('get', () => {
    it('should retrieve stored value', () => {
      const key = 'testKey';
      const value = { test: 'value' };
      service.set(key, value);

      const result = service.get<{ test: string }>(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', () => {
      const key = 'nonExistentKey';

      const result = service.get(key);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove value from localStorage', () => {
      const key = 'testKey';
      const value = { test: 'value' };
      service.set(key, value);

      service.remove(key);

      expect(storageMock['ndt-testKey']).toBeUndefined();
    });

    it('should keep other values in localStorage', () => {
      const key1 = 'key1';
      const key2 = 'key2';
      service.set(key1, { value: 1 });
      service.set(key2, { value: 2 });

      service.remove(key1);

      expect(service.get(key2)).toEqual({ value: 2 });
    });
  });

  describe('getAllSettings', () => {
    it('should return all stored settings', () => {
      const settings = {
        key1: { value: 1 },
        key2: { value: 2 },
      };
      Object.entries(settings).forEach(([key, value]) => {
        service.set(key, value);
      });

      const result = service.getAllSettings();

      const settingsWithPrefix = {
        'AngularDevTools.key1': { value: 1 },
        'AngularDevTools.key2': { value: 2 },
      };
      expect(result).toEqual(settingsWithPrefix);
    });
  });

  describe('setAllSettings', () => {
    it('should store multiple settings at once', () => {
      const settings = {
        'AngularDevTools.key1': { value: 1 },
        'AngularDevTools.key2': { value: 2 },
      };

      service.setAllSettings(settings);

      const valueOne = service.get('AngularDevTools.key1');
      const valueTwo = service.get('AngularDevTools.key2');
      expect(valueOne).toEqual({ value: 1 });
      expect(valueTwo).toEqual({ value: 2 });
    });

    it('should preserve existing keys not included in settings', () => {
      service.set('key1', { value: 1 });
      service.set('key2', { value: 2 });

      service.setAllSettings({ key1: { value: 3 } });

      expect(service.get('key2')).toEqual({ value: 2 });
    });
  });

  describe('clearAllSettings', () => {
    it('should remove all stored settings', () => {
      service.set('featureFlagsTool', { value: 1 });
      service.set('i18nTool2', { value: 2 });

      service.clearAllSettings();

      const allSettings = service.getAllSettings();
      expect(allSettings).toEqual({});
    });

    it('should only clear tool settings', () => {
      service.set('key1', { value: 1 });
      storageMock['other-key'] = JSON.stringify({ value: 2 });

      service.clearAllSettings();

      expect(storageMock['other-key']).toBeDefined();
    });

    it('should remove tool keys', () => {
      service.set('featureFlagsTool', { value: 1 });
      service.set('i18nTool2', { value: 2 });

      service.clearAllSettings();

      expect(service.getToolKeys()).toEqual([]);
    });
  });
});
