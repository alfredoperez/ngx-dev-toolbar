import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DevToolsStorageService } from '../../utils/storage.service';
import { DevToolbarInternalLanguageService } from './language-internal.service';
import { Language } from './language.models';

describe('DevToolbarInternalLanguageService', () => {
  let service: DevToolbarInternalLanguageService;
  let storageService: jest.Mocked<DevToolsStorageService>;

  const createMockLanguage = (id: string, name: string): Language => ({
    id,
    name,
  });

  beforeEach(() => {
    const storageServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DevToolbarInternalLanguageService,
        { provide: DevToolsStorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(DevToolbarInternalLanguageService);
    storageService = TestBed.inject(
      DevToolsStorageService
    ) as jest.Mocked<DevToolsStorageService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty languages', () => {
      expect(service.languages()).toEqual([]);
    });

    it('should load forced language from localStorage on initialization', () => {
      expect(storageService.get).toHaveBeenCalledWith('language');
    });

    it('should apply forced language from localStorage after setAppLanguages', () => {
      const savedLanguage: Language = { id: 'en', name: 'English' };
      storageService.get.mockReturnValue(savedLanguage);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalLanguageService,
          { provide: DevToolsStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(DevToolbarInternalLanguageService);

      const languages = [
        createMockLanguage('en', 'English'),
        createMockLanguage('es', 'Spanish'),
      ];
      newService.setAppLanguages(languages);

      expect(storageService.get).toHaveBeenCalledWith('language');
    });
  });

  describe('setAppLanguages', () => {
    it('should update languages when setAppLanguages is called', () => {
      const languages = [
        createMockLanguage('en', 'English'),
        createMockLanguage('es', 'Spanish'),
        createMockLanguage('fr', 'French'),
      ];

      service.setAppLanguages(languages);

      expect(service.languages()).toEqual(languages);
    });

    it('should handle empty languages array', () => {
      service.setAppLanguages([]);

      expect(service.languages()).toEqual([]);
    });

    it('should emit languages through getAppLanguages', async () => {
      const languages = [
        createMockLanguage('en', 'English'),
        createMockLanguage('es', 'Spanish'),
      ];

      service.setAppLanguages(languages);

      const result = await firstValueFrom(service.getAppLanguages());
      expect(result).toEqual(languages);
    });
  });

  describe('setForcedLanguage', () => {
    it('should set forced language and persist to localStorage', () => {
      const language = createMockLanguage('en', 'English');
      service.setForcedLanguage(language);

      expect(storageService.set).toHaveBeenCalledWith('language', language);
    });

    it('should emit forced language through getForcedLanguage', async () => {
      const language = createMockLanguage('es', 'Spanish');
      service.setForcedLanguage(language);

      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result).toEqual([language]);
    });

    it('should replace previous forced language', async () => {
      const firstLanguage = createMockLanguage('en', 'English');
      const secondLanguage = createMockLanguage('es', 'Spanish');

      service.setForcedLanguage(firstLanguage);
      service.setForcedLanguage(secondLanguage);

      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result).toEqual([secondLanguage]);
    });
  });

  describe('removeForcedLanguage', () => {
    it('should remove forced language and clear from localStorage', () => {
      const language = createMockLanguage('en', 'English');
      service.setForcedLanguage(language);

      service.removeForcedLanguage();

      expect(storageService.remove).toHaveBeenCalledWith('language');
    });

    it('should emit empty array through getForcedLanguage after removal', async () => {
      const language = createMockLanguage('en', 'English');
      service.setForcedLanguage(language);

      service.removeForcedLanguage();

      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result).toEqual([]);
    });

    it('should not throw error when removing non-existent forced language', () => {
      expect(() => service.removeForcedLanguage()).not.toThrow();
    });
  });

  describe('getForcedLanguage', () => {
    it('should return empty array when no forced language set', async () => {
      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result).toEqual([]);
    });

    it('should return array with single language when forced', async () => {
      const language = createMockLanguage('fr', 'French');
      service.setForcedLanguage(language);

      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result).toEqual([language]);
      expect(result.length).toBe(1);
    });
  });

  describe('Preset Integration: applyPresetLanguage() and getCurrentForcedLanguage()', () => {
    beforeEach(() => {
      const languages = [
        createMockLanguage('en', 'English'),
        createMockLanguage('es', 'Spanish'),
        createMockLanguage('fr', 'French'),
      ];
      service.setAppLanguages(languages);
    });

    it('should apply preset language by ID and set forced language', async () => {
      await service.applyPresetLanguage('es');

      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('es');
      expect(result[0].name).toBe('Spanish');
    });

    it('should persist applied preset language to localStorage', async () => {
      await service.applyPresetLanguage('fr');

      expect(storageService.set).toHaveBeenCalledWith('language', {
        id: 'fr',
        name: 'French',
      });
    });

    it('should handle null languageId by removing forced language', async () => {
      service.setForcedLanguage(createMockLanguage('en', 'English'));

      await service.applyPresetLanguage(null);

      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result).toEqual([]);
      expect(storageService.remove).toHaveBeenCalledWith('language');
    });

    it('should log warning when language ID not found in available languages', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.applyPresetLanguage('invalid-lang');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Language invalid-lang not found')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should not apply forced language when ID not found', async () => {
      service.setForcedLanguage(createMockLanguage('en', 'English'));

      await service.applyPresetLanguage('invalid-lang');

      // Should still have the old forced language since invalid ID was skipped
      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result[0].id).toBe('en');
    });

    it('should handle empty available languages array gracefully', async () => {
      service.setAppLanguages([]);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.applyPresetLanguage('en');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Language en not found')
      );

      consoleWarnSpy.mockRestore();
    });

    it('getCurrentForcedLanguage should return language ID when forced', () => {
      service.setForcedLanguage(createMockLanguage('es', 'Spanish'));

      const result = service.getCurrentForcedLanguage();
      expect(result).toBe('es');
    });

    it('getCurrentForcedLanguage should return null when no forced language', () => {
      const result = service.getCurrentForcedLanguage();
      expect(result).toBe(null);
    });

    it('getCurrentForcedLanguage should return null after removing forced language', () => {
      service.setForcedLanguage(createMockLanguage('en', 'English'));
      service.removeForcedLanguage();

      const result = service.getCurrentForcedLanguage();
      expect(result).toBe(null);
    });

    it('applyPresetLanguage should work with async/await pattern', async () => {
      await service.applyPresetLanguage('fr');

      const currentId = service.getCurrentForcedLanguage();
      expect(currentId).toBe('fr');
    });

    it('should handle rapid sequential preset applications', async () => {
      await service.applyPresetLanguage('en');
      await service.applyPresetLanguage('es');
      await service.applyPresetLanguage('fr');

      const result = await firstValueFrom(service.getForcedLanguage());
      expect(result[0].id).toBe('fr');
      expect(service.getCurrentForcedLanguage()).toBe('fr');
    });
  });

  describe('localStorage persistence', () => {
    it('should load forced language from localStorage on initialization', () => {
      const savedLanguage: Language = { id: 'de', name: 'German' };
      storageService.get.mockReturnValue(savedLanguage);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalLanguageService,
          { provide: DevToolsStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(DevToolbarInternalLanguageService);

      expect(storageService.get).toHaveBeenCalledWith('language');
    });

    it('should handle missing localStorage gracefully', () => {
      storageService.get.mockReturnValue(null);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalLanguageService,
          { provide: DevToolsStorageService, useValue: storageService },
        ],
      });

      expect(() =>
        TestBed.inject(DevToolbarInternalLanguageService)
      ).not.toThrow();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      storageService.get.mockReturnValue({ invalid: 'data' } as any);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalLanguageService,
          { provide: DevToolsStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(DevToolbarInternalLanguageService);

      expect(newService.languages()).toEqual([]);
    });
  });
});
