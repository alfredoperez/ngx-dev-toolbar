import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DevToolsService } from '../../models/dev-tools.interface';
import { DevToolsStorageService } from '../../utils/storage.service';
import { DevToolbarInternalAppFeaturesService } from './app-features-internal.service';
import { DevToolbarAppFeaturesService } from './app-features.service';
import { DevToolbarAppFeature, ForcedAppFeaturesState } from './app-features.models';

describe('DevToolbarAppFeaturesService', () => {
  let service: DevToolbarAppFeaturesService;
  let internalService: DevToolbarInternalAppFeaturesService;

  const createMockFeature = (
    id: string,
    name: string,
    isEnabled: boolean = false
  ): DevToolbarAppFeature => ({
    id,
    name,
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
        DevToolbarAppFeaturesService,
        DevToolbarInternalAppFeaturesService,
        { provide: DevToolsStorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(DevToolbarAppFeaturesService);
    internalService = TestBed.inject(DevToolbarInternalAppFeaturesService);
  });

  describe('Task 14: DevToolsService interface compliance', () => {
    it('should implement DevToolsService interface', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(DevToolbarAppFeaturesService);

      // Verify it conforms to DevToolsService interface
      const devToolsService: DevToolsService<DevToolbarAppFeature> = service;
      expect(devToolsService.setAvailableOptions).toBeDefined();
      expect(devToolsService.getForcedValues).toBeDefined();
    });

    it('should expose setAvailableOptions() method', () => {
      expect(typeof service.setAvailableOptions).toBe('function');
    });

    it('should expose getForcedValues() method returning Observable', () => {
      expect(typeof service.getForcedValues).toBe('function');
      const result = service.getForcedValues();
      expect(result.subscribe).toBeDefined(); // Observable check
    });

    it('should expose applyPresetFeatures() method', () => {
      expect(typeof service.applyPresetFeatures).toBe('function');
    });

    it('should expose getCurrentForcedState() method', () => {
      expect(typeof service.getCurrentForcedState).toBe('function');
    });
  });

  describe('Task 14: Public API delegation to internal service', () => {
    it('should delegate setAvailableOptions() to internal service setAppFeatures()', () => {
      const setAppFeaturesSpy = jest.spyOn(internalService, 'setAppFeatures');
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics'),
      ];

      service.setAvailableOptions(features);

      expect(setAppFeaturesSpy).toHaveBeenCalledWith(features);
      expect(setAppFeaturesSpy).toHaveBeenCalledTimes(1);
    });

    it('should delegate getForcedValues() to internal service getForcedFeatures()', async () => {
      const getForcedFeaturesSpy = jest.spyOn(internalService, 'getForcedFeatures');
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      service.setAvailableOptions(features);
      internalService.setFeature('analytics', true);

      const result = await firstValueFrom(service.getForcedValues());

      expect(getForcedFeaturesSpy).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('analytics');
      expect(result[0].isForced).toBe(true);
    });

    it('should delegate applyPresetFeatures() to internal service applyForcedState()', () => {
      const applyForcedStateSpy = jest.spyOn(internalService, 'applyForcedState');
      const presetState: ForcedAppFeaturesState = {
        enabled: ['analytics'],
        disabled: ['multi-user'],
      };

      service.applyPresetFeatures(presetState);

      expect(applyForcedStateSpy).toHaveBeenCalledWith(presetState);
      expect(applyForcedStateSpy).toHaveBeenCalledTimes(1);
    });

    it('should delegate getCurrentForcedState() to internal service', () => {
      const getCurrentForcedStateSpy = jest.spyOn(
        internalService,
        'getCurrentForcedState'
      );
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      service.setAvailableOptions(features);
      internalService.setFeature('analytics', true);

      const result = service.getCurrentForcedState();

      expect(getCurrentForcedStateSpy).toHaveBeenCalled();
      expect(result).toEqual({
        enabled: ['analytics'],
        disabled: [],
      });
    });
  });

  describe('Task 14: Error propagation from internal service', () => {
    it('should throw error on duplicate feature IDs via setAvailableOptions()', () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics'),
        createMockFeature('analytics', 'Duplicate'), // Duplicate ID
      ];

      expect(() => service.setAvailableOptions(features)).toThrow(
        'Duplicate feature IDs detected: analytics'
      );
    });

    it('should throw error on empty feature ID via setAvailableOptions()', () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('', 'Invalid Feature'),
      ];

      expect(() => service.setAvailableOptions(features)).toThrow(
        'Feature ID cannot be empty'
      );
    });
  });

  describe('Task 14: Integration with internal service', () => {
    it('should emit forced features when feature forced via internal service', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', false),
      ];

      service.setAvailableOptions(features);

      // Force features via internal service
      internalService.setFeature('analytics', true);
      internalService.setFeature('multi-user', false);

      const forcedFeatures = await firstValueFrom(service.getForcedValues());

      expect(forcedFeatures).toHaveLength(2);
      expect(forcedFeatures[0].id).toBe('analytics');
      expect(forcedFeatures[0].isEnabled).toBe(true);
      expect(forcedFeatures[0].isForced).toBe(true);
      expect(forcedFeatures[1].id).toBe('multi-user');
      expect(forcedFeatures[1].isEnabled).toBe(false);
      expect(forcedFeatures[1].isForced).toBe(true);
    });

    it('should apply preset state and trigger getForcedValues() emission', async () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', false),
        createMockFeature('white-label', 'White Label', false),
      ];

      service.setAvailableOptions(features);

      const presetState: ForcedAppFeaturesState = {
        enabled: ['analytics', 'white-label'],
        disabled: ['multi-user'],
      };

      service.applyPresetFeatures(presetState);

      const forcedFeatures = await firstValueFrom(service.getForcedValues());

      expect(forcedFeatures).toHaveLength(3);
      expect(forcedFeatures[0].id).toBe('analytics');
      expect(forcedFeatures[0].isEnabled).toBe(true);
      expect(forcedFeatures[1].id).toBe('multi-user');
      expect(forcedFeatures[1].isEnabled).toBe(false);
      expect(forcedFeatures[2].id).toBe('white-label');
      expect(forcedFeatures[2].isEnabled).toBe(true);
    });

    it('should return current forced state matching internal service state', () => {
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', false),
      ];

      service.setAvailableOptions(features);
      internalService.setFeature('analytics', true);
      internalService.setFeature('multi-user', false);

      const publicState = service.getCurrentForcedState();
      const internalState = internalService.getCurrentForcedState();

      expect(publicState).toEqual(internalState);
      expect(publicState).toEqual({
        enabled: ['analytics'],
        disabled: ['multi-user'],
      });
    });

    it('should filter invalid feature IDs when applying preset', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const features: DevToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      service.setAvailableOptions(features);

      const presetState: ForcedAppFeaturesState = {
        enabled: ['analytics', 'invalid-feature'],
        disabled: ['another-invalid'],
      };

      service.applyPresetFeatures(presetState);

      const forcedFeatures = await firstValueFrom(service.getForcedValues());

      // Only valid feature should be forced
      expect(forcedFeatures).toHaveLength(1);
      expect(forcedFeatures[0].id).toBe('analytics');

      // Warning should be logged for invalid IDs
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Preset contains invalid feature IDs')
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
