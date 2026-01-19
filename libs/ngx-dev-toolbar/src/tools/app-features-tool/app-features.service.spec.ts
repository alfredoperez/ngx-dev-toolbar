import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ToolbarService } from '../../models/toolbar.interface';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarInternalAppFeaturesService } from './app-features-internal.service';
import { ToolbarAppFeaturesService } from './app-features.service';
import { ToolbarAppFeature, ForcedAppFeaturesState } from './app-features.models';

describe('ToolbarAppFeaturesService', () => {
  let service: ToolbarAppFeaturesService;
  let internalService: ToolbarInternalAppFeaturesService;

  const createMockFeature = (
    id: string,
    name: string,
    isEnabled = false
  ): ToolbarAppFeature => ({
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
        ToolbarAppFeaturesService,
        ToolbarInternalAppFeaturesService,
        { provide: ToolbarStorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(ToolbarAppFeaturesService);
    internalService = TestBed.inject(ToolbarInternalAppFeaturesService);
  });

  describe('Task 14: ToolbarService interface compliance', () => {
    it('should implement ToolbarService interface', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ToolbarAppFeaturesService);

      // Verify it conforms to ToolbarService interface
      const devToolsService: ToolbarService<ToolbarAppFeature> = service;
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

    it('should expose getValues() method returning Observable', () => {
      expect(typeof service.getValues).toBe('function');
      const result = service.getValues();
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
      const features: ToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics'),
      ];

      service.setAvailableOptions(features);

      expect(setAppFeaturesSpy).toHaveBeenCalledWith(features);
      expect(setAppFeaturesSpy).toHaveBeenCalledTimes(1);
    });

    it('should delegate getForcedValues() to internal service getForcedFeatures()', async () => {
      const getForcedFeaturesSpy = jest.spyOn(internalService, 'getForcedFeatures');
      const features: ToolbarAppFeature[] = [
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
      const features: ToolbarAppFeature[] = [
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
      const features: ToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics'),
        createMockFeature('analytics', 'Duplicate'), // Duplicate ID
      ];

      expect(() => service.setAvailableOptions(features)).toThrow(
        'Duplicate feature IDs detected: analytics'
      );
    });

    it('should throw error on empty feature ID via setAvailableOptions()', () => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('', 'Invalid Feature'),
      ];

      expect(() => service.setAvailableOptions(features)).toThrow(
        'Feature ID cannot be empty'
      );
    });
  });

  describe('Task 14: Integration with internal service', () => {
    it('should emit forced features when feature forced via internal service', async () => {
      const features: ToolbarAppFeature[] = [
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
      const features: ToolbarAppFeature[] = [
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
      const features: ToolbarAppFeature[] = [
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
      const features: ToolbarAppFeature[] = [
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

  describe('getValues', () => {
    it('should return all features with overrides applied', async () => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', true),
      ];

      service.setAvailableOptions(features);

      // Force analytics to enabled
      internalService.setFeature('analytics', true);

      const allFeatures = await firstValueFrom(service.getValues());
      expect(allFeatures).toHaveLength(2);

      // analytics should be overridden to enabled
      expect(allFeatures[0].id).toBe('analytics');
      expect(allFeatures[0].isEnabled).toBe(true);
      expect(allFeatures[0].isForced).toBe(true);

      // multi-user should remain unchanged
      expect(allFeatures[1].id).toBe('multi-user');
      expect(allFeatures[1].isEnabled).toBe(true);
      expect(allFeatures[1].isForced).toBe(false);
    });

    it('should return all features when no overrides exist', async () => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', true),
      ];

      service.setAvailableOptions(features);

      const allFeatures = await firstValueFrom(service.getValues());
      expect(allFeatures).toHaveLength(2);
      expect(allFeatures[0].isForced).toBe(false);
      expect(allFeatures[1].isForced).toBe(false);
    });

    it('should emit new values when overrides change', (done) => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
      ];

      service.setAvailableOptions(features);

      let emissionCount = 0;
      service.getValues().subscribe((allFeatures) => {
        emissionCount++;

        if (emissionCount === 1) {
          // First emission: no overrides
          expect(allFeatures[0].isEnabled).toBe(false);
          expect(allFeatures[0].isForced).toBe(false);

          // Apply override
          internalService.setFeature('analytics', true);
        } else if (emissionCount === 2) {
          // Second emission: override applied
          expect(allFeatures[0].isEnabled).toBe(true);
          expect(allFeatures[0].isForced).toBe(true);
          done();
        }
      });
    });

    it('should handle multiple features with mixed overrides', async () => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', true),
        createMockFeature('white-label', 'White Label', false),
      ];

      service.setAvailableOptions(features);

      // Force analytics to enabled and multi-user to disabled
      internalService.setFeature('analytics', true);
      internalService.setFeature('multi-user', false);
      // white-label remains natural (no override)

      const allFeatures = await firstValueFrom(service.getValues());
      expect(allFeatures).toHaveLength(3);

      // analytics: forced to enabled
      expect(allFeatures[0].id).toBe('analytics');
      expect(allFeatures[0].isEnabled).toBe(true);
      expect(allFeatures[0].isForced).toBe(true);

      // multi-user: forced to disabled
      expect(allFeatures[1].id).toBe('multi-user');
      expect(allFeatures[1].isEnabled).toBe(false);
      expect(allFeatures[1].isForced).toBe(true);

      // white-label: natural state
      expect(allFeatures[2].id).toBe('white-label');
      expect(allFeatures[2].isEnabled).toBe(false);
      expect(allFeatures[2].isForced).toBe(false);
    });

    it('should correctly identify forced features using isForced property', async () => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('natural', 'Natural Feature', true),
        createMockFeature('forced', 'Forced Feature', true),
      ];

      service.setAvailableOptions(features);

      // Force one feature
      internalService.setFeature('forced', false);

      const allFeatures = await firstValueFrom(service.getValues());

      const naturalFeature = allFeatures.find((f) => f.id === 'natural');
      const forcedFeature = allFeatures.find((f) => f.id === 'forced');

      expect(naturalFeature?.isForced).toBe(false);
      expect(forcedFeature?.isForced).toBe(true);
    });

    it('should show difference between getValues and getForcedValues', async () => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('analytics', 'Analytics', false),
        createMockFeature('multi-user', 'Multi-User', true),
        createMockFeature('white-label', 'White Label', false),
      ];

      service.setAvailableOptions(features);

      // Force only analytics
      internalService.setFeature('analytics', true);

      const allFeatures = await firstValueFrom(service.getValues());
      const forcedFeatures = await firstValueFrom(service.getForcedValues());

      // getValues returns all 3 features
      expect(allFeatures).toHaveLength(3);

      // getForcedValues returns only the 1 forced feature
      expect(forcedFeatures).toHaveLength(1);
      expect(forcedFeatures[0].id).toBe('analytics');
    });

    it('should delegate to internal service features$ observable', async () => {
      const features: ToolbarAppFeature[] = [
        createMockFeature('test', 'Test', false),
      ];

      service.setAvailableOptions(features);
      const result = await firstValueFrom(service.getValues());

      // Verify it returns the same as internal service
      const internalResult = await firstValueFrom(internalService.features$);
      expect(result).toEqual(internalResult);
    });
  });
});
