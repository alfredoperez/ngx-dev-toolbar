import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DevToolsStorageService } from '../../utils/storage.service';
import { DevToolbarInternalAppFeaturesService } from './app-features-internal.service';
import { DevToolbarAppFeature, ForcedAppFeaturesState } from './app-features.models';

describe('DevToolbarInternalAppFeaturesService', () => {
  let service: DevToolbarInternalAppFeaturesService;
  let storageService: jest.Mocked<DevToolsStorageService>;

  const createMockFeature = (
    id: string,
    name: string,
    isEnabled: boolean = false,
    description?: string
  ): DevToolbarAppFeature => ({
    id,
    name,
    description,
    isEnabled,
    isForced: false,
  });

  beforeEach(() => {
    const storageServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DevToolbarInternalAppFeaturesService,
        { provide: DevToolsStorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(DevToolbarInternalAppFeaturesService);
    storageService = TestBed.inject(DevToolsStorageService) as jest.Mocked<DevToolsStorageService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 4: setAppFeatures() validation and storage', () => {
    it('should accept valid features array and emit to BehaviorSubject', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics Dashboard', false, 'View analytics'),
        createMockFeature('multi-user', 'Multi-User Support', true),
      ];

      service.setAppFeatures(features);

      const appFeatures = await firstValueFrom(service.getAppFeatures());
      expect(appFeatures).toEqual(features);
    });

    it('should throw error on duplicate feature IDs', () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics Dashboard'),
        createMockFeature('analytics', 'Duplicate Analytics'), // Duplicate ID
      ];

      expect(() => service.setAppFeatures(features)).toThrow();
    });

    it('should throw error on empty feature ID', () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('', 'Invalid Feature'), // Empty ID
      ];

      expect(() => service.setAppFeatures(features)).toThrow();
    });

    it('should trim whitespace from feature names', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', '  Analytics Dashboard  '),
      ];

      service.setAppFeatures(features);

      const appFeatures = await firstValueFrom(service.getAppFeatures());
      expect(appFeatures[0].name).toBe('Analytics Dashboard');
    });

    it('should log warning for empty feature names (non-blocking)', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', ''),
      ];

      expect(() => service.setAppFeatures(features)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Feature 'analytics' has empty name")
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Task 5: mergeForcedState() combines natural and forced state', () => {
    it('should return features with isForced=false when no forced state exists', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      service.setAppFeatures(features);

      const result = await firstValueFrom(service.getAppFeatures());
      expect(result[0].isForced).toBe(false);
      expect(result[0].isEnabled).toBe(false);
    });

    it('should set isEnabled=true and isForced=true for features in enabled array', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue({
          enabled: ['analytics'],
          disabled: [],
        }),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      newService.setAppFeatures(features);

      const result = newService.features();
      expect(result[0].isEnabled).toBe(true);
      expect(result[0].isForced).toBe(true);
    });

    it('should set isEnabled=false and isForced=true for features in disabled array', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', true),
      ];

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue({
          enabled: [],
          disabled: ['analytics'],
        }),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      newService.setAppFeatures(features);

      const result = newService.features();
      expect(result[0].isEnabled).toBe(false);
      expect(result[0].isForced).toBe(true);
    });

    it('should preserve natural isEnabled when feature not in forced state', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', true),
        createMockFeature('multi-user', 'Multi-User', false),
      ];

      // Use default service with no forced state
      service.setAppFeatures(features);

      const result = service.features();
      expect(result[0].isEnabled).toBe(true);
      expect(result[0].isForced).toBe(false);
      expect(result[1].isEnabled).toBe(false);
      expect(result[1].isForced).toBe(false);
    });

    it('should handle mixed forced state (some enabled, some disabled)', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', true),
        createMockFeature('white-label', 'White Label', true),
      ];

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue({
          enabled: ['analytics'],
          disabled: ['white-label'],
        }),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      newService.setAppFeatures(features);

      const result = newService.features();
      expect(result[0].isEnabled).toBe(true);
      expect(result[0].isForced).toBe(true);
      expect(result[1].isEnabled).toBe(true);
      expect(result[1].isForced).toBe(false);
      expect(result[2].isEnabled).toBe(false);
      expect(result[2].isForced).toBe(true);
    });
  });

  describe('Task 6: setFeature() and removeFeatureOverride() manage forced state', () => {
    beforeEach(() => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', false),
      ];
      service.setAppFeatures(features);
    });

    it('should add feature ID to enabled array when setFeature(id, true) called', () => {
      service.setFeature('analytics', true);

      expect(storageService.set).toHaveBeenCalledWith('app-features', {
        enabled: ['analytics'],
        disabled: [],
      });
    });

    it('should add feature ID to disabled array when setFeature(id, false) called', () => {
      service.setFeature('analytics', false);

      expect(storageService.set).toHaveBeenCalledWith('app-features', {
        enabled: [],
        disabled: ['analytics'],
      });
    });

    it('should move feature from disabled to enabled when forcing to enabled', () => {
      service.setFeature('analytics', false);
      jest.clearAllMocks();

      service.setFeature('analytics', true);

      expect(storageService.set).toHaveBeenCalledWith('app-features', {
        enabled: ['analytics'],
        disabled: [],
      });
    });

    it('should remove feature from both arrays when removeFeatureOverride() called', () => {
      service.setFeature('analytics', true);
      jest.clearAllMocks();

      service.removeFeatureOverride('analytics');

      expect(storageService.set).toHaveBeenCalledWith('app-features', {
        enabled: [],
        disabled: [],
      });
    });

    it('should persist forced state to localStorage after each change', () => {
      service.setFeature('analytics', true);
      expect(storageService.set).toHaveBeenCalledTimes(1);

      service.setFeature('multi-user', false);
      expect(storageService.set).toHaveBeenCalledTimes(2);

      service.removeFeatureOverride('analytics');
      expect(storageService.set).toHaveBeenCalledTimes(3);
    });
  });

  describe('Task 8: localStorage persistence and loading', () => {
    it('should load forced state from localStorage on initialization', () => {
      const forcedState: ForcedAppFeaturesState = {
        enabled: ['analytics'],
        disabled: ['multi-user'],
      };

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue(forcedState),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', true),
      ];

      newService.setAppFeatures(features);

      const result = newService.features();
      expect(result[0].isEnabled).toBe(true);
      expect(result[0].isForced).toBe(true);
      expect(result[1].isEnabled).toBe(false);
      expect(result[1].isForced).toBe(true);
    });

    it('should handle missing localStorage gracefully (no error thrown)', () => {
      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      expect(() => TestBed.inject(DevToolbarInternalAppFeaturesService)).not.toThrow();
    });

    it('should handle corrupted JSON in localStorage (log error, use empty state)', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockImplementation(() => {
          throw new Error('Invalid JSON');
        }),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      expect(() => TestBed.inject(DevToolbarInternalAppFeaturesService)).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should emit loaded forced state to forcedFeaturesSubject', async () => {
      const forcedState: ForcedAppFeaturesState = {
        enabled: ['analytics'],
        disabled: [],
      };

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue(forcedState),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      newService.setAppFeatures(features);

      const forcedFeatures = await firstValueFrom(newService.getForcedFeatures());
      expect(forcedFeatures).toHaveLength(1);
      expect(forcedFeatures[0].id).toBe('analytics');
      expect(forcedFeatures[0].isForced).toBe(true);
    });

    it('should validate and clean invalid feature IDs after setAppFeatures() called', () => {
      const forcedState: ForcedAppFeaturesState = {
        enabled: ['analytics', 'invalid-feature'],
        disabled: ['multi-user', 'another-invalid'],
      };

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue(forcedState),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', false),
      ];

      newService.setAppFeatures(features);

      const result = newService.features();
      expect(result).toHaveLength(2);
      expect(result[0].isForced).toBe(true);
      expect(result[1].isForced).toBe(true);
    });

    it('should log warning when removing invalid feature IDs', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const forcedState: ForcedAppFeaturesState = {
        enabled: ['invalid-feature'],
        disabled: ['another-invalid'],
      };

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue(forcedState),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      newService.setAppFeatures(features);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removed invalid feature IDs')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should persist cleaned forced state back to localStorage', () => {
      const forcedState: ForcedAppFeaturesState = {
        enabled: ['analytics', 'invalid-feature'],
        disabled: [],
      };

      // Create a fresh TestBed for this test
      TestBed.resetTestingModule();
      const newStorageService = {
        get: jest.fn().mockReturnValue(forcedState),
        set: jest.fn(),
        remove: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          DevToolbarInternalAppFeaturesService,
          { provide: DevToolsStorageService, useValue: newStorageService },
        ],
      });

      const newService = TestBed.inject(DevToolbarInternalAppFeaturesService);
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      newService.setAppFeatures(features);

      expect(newStorageService.set).toHaveBeenCalledWith('app-features', {
        enabled: ['analytics'],
        disabled: [],
      });
    });
  });

  describe('Task 10: getCurrentForcedState() returns snapshot', () => {
    it('should return empty state when no features forced', () => {
      const result = service.getCurrentForcedState();

      expect(result).toEqual({
        enabled: [],
        disabled: [],
      });
    });

    it('should return current forced state with enabled/disabled arrays', () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', false),
      ];

      service.setAppFeatures(features);
      service.setFeature('analytics', true);
      service.setFeature('multi-user', false);

      const result = service.getCurrentForcedState();

      expect(result).toEqual({
        enabled: ['analytics'],
        disabled: ['multi-user'],
      });
    });

    it('should return defensive copy (mutations dont affect internal state)', () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      service.setAppFeatures(features);
      service.setFeature('analytics', true);

      const result1 = service.getCurrentForcedState();
      result1.enabled.push('malicious-mutation');

      const result2 = service.getCurrentForcedState();

      expect(result2.enabled).toEqual(['analytics']);
      expect(result2.enabled).not.toContain('malicious-mutation');
    });

    it('should match structure: { enabled: string[], disabled: string[] }', () => {
      const result = service.getCurrentForcedState();

      expect(result).toHaveProperty('enabled');
      expect(result).toHaveProperty('disabled');
      expect(Array.isArray(result.enabled)).toBe(true);
      expect(Array.isArray(result.disabled)).toBe(true);
    });
  });

  describe('Preset Integration: applyForcedState() and getCurrentForcedState()', () => {
    beforeEach(() => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', false),
        createMockFeature('white-label', 'White Label', true),
      ];
      service.setAppFeatures(features);
    });

    it('should apply preset state and replace current forced state', () => {
      service.setFeature('analytics', true);
      let result = service.features();
      expect(result[0].isForced).toBe(true);

      const presetState: ForcedAppFeaturesState = {
        enabled: ['multi-user'],
        disabled: ['white-label'],
      };
      service.applyForcedState(presetState);

      result = service.features();
      expect(result[0].isForced).toBe(false); // analytics no longer forced
      expect(result[1].isForced).toBe(true); // multi-user now forced enabled
      expect(result[1].isEnabled).toBe(true);
      expect(result[2].isForced).toBe(true); // white-label now forced disabled
      expect(result[2].isEnabled).toBe(false);
    });

    it('should persist applied preset state to localStorage', () => {
      const presetState: ForcedAppFeaturesState = {
        enabled: ['analytics'],
        disabled: ['multi-user'],
      };
      service.applyForcedState(presetState);

      expect(storageService.set).toHaveBeenCalledWith('app-features', presetState);
    });

    it('should filter out invalid feature IDs from preset', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const presetState: ForcedAppFeaturesState = {
        enabled: ['analytics', 'invalid-feature-1'],
        disabled: ['multi-user', 'invalid-feature-2'],
      };
      service.applyForcedState(presetState);

      const result = service.features();
      expect(result[0].isForced).toBe(true); // analytics (valid)
      expect(result[1].isForced).toBe(true); // multi-user (valid)
      expect(result.length).toBe(3); // Only configured features

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid-feature-1')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid-feature-2')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should persist only valid IDs to localStorage after filtering', () => {
      const presetState: ForcedAppFeaturesState = {
        enabled: ['analytics', 'invalid-feature'],
        disabled: ['multi-user'],
      };
      service.applyForcedState(presetState);

      expect(storageService.set).toHaveBeenCalledWith('app-features', {
        enabled: ['analytics'],
        disabled: ['multi-user'],
      });
    });

    it('should emit updated forced features after applying preset', async () => {
      const presetState: ForcedAppFeaturesState = {
        enabled: ['analytics'],
        disabled: [],
      };
      service.applyForcedState(presetState);

      const forcedFeatures = await firstValueFrom(service.getForcedFeatures());
      expect(forcedFeatures.length).toBe(1);
      expect(forcedFeatures[0].id).toBe('analytics');
      expect(forcedFeatures[0].isForced).toBe(true);
      expect(forcedFeatures[0].isEnabled).toBe(true);
    });

    it('should handle empty preset state (clear all forced overrides)', () => {
      service.setFeature('analytics', true);
      service.setFeature('multi-user', false);

      const emptyPreset: ForcedAppFeaturesState = {
        enabled: [],
        disabled: [],
      };
      service.applyForcedState(emptyPreset);

      const result = service.features();
      expect(result[0].isForced).toBe(false);
      expect(result[1].isForced).toBe(false);
      expect(result[2].isForced).toBe(false);
    });
  });
});
