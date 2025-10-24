import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DevToolsStorageService } from '../../utils/storage.service';
import { DevToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { DevToolbarFeatureFlagService } from './feature-flags.service';
import { DevToolbarFlag } from './feature-flags.models';

describe('DevToolbarFeatureFlagService', () => {
  let service: DevToolbarFeatureFlagService;
  let internalService: DevToolbarInternalFeatureFlagService;
  let storageService: jest.Mocked<DevToolsStorageService>;

  const createMockFlag = (
    id: string,
    name: string,
    isEnabled: boolean = false,
    description?: string
  ): DevToolbarFlag => ({
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
        DevToolbarFeatureFlagService,
        DevToolbarInternalFeatureFlagService,
        { provide: DevToolsStorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(DevToolbarFeatureFlagService);
    internalService = TestBed.inject(DevToolbarInternalFeatureFlagService);
    storageService = TestBed.inject(
      DevToolsStorageService
    ) as jest.Mocked<DevToolsStorageService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setAvailableOptions', () => {
    it('should set available flags', async () => {
      const flags = [
        createMockFlag('flag1', 'Flag 1', true),
        createMockFlag('flag2', 'Flag 2', false),
      ];

      service.setAvailableOptions(flags);

      const result = await firstValueFrom(service.getValues());
      expect(result).toEqual(flags);
    });
  });

  describe('getForcedValues', () => {
    it('should return only forced flags', async () => {
      const flags = [
        createMockFlag('flag1', 'Flag 1', false),
        createMockFlag('flag2', 'Flag 2', true),
      ];

      service.setAvailableOptions(flags);

      // Force flag1 to enabled
      internalService.setFlag('flag1', true);

      const forcedFlags = await firstValueFrom(service.getForcedValues());
      expect(forcedFlags).toHaveLength(1);
      expect(forcedFlags[0].id).toBe('flag1');
      expect(forcedFlags[0].isEnabled).toBe(true);
      expect(forcedFlags[0].isForced).toBe(true);
    });

    it('should return empty array when no flags are forced', async () => {
      const flags = [
        createMockFlag('flag1', 'Flag 1', false),
        createMockFlag('flag2', 'Flag 2', true),
      ];

      service.setAvailableOptions(flags);

      const forcedFlags = await firstValueFrom(service.getForcedValues());
      expect(forcedFlags).toEqual([]);
    });
  });

  describe('getValues', () => {
    it('should return all flags with overrides applied', async () => {
      const flags = [
        createMockFlag('flag1', 'Flag 1', false),
        createMockFlag('flag2', 'Flag 2', true),
      ];

      service.setAvailableOptions(flags);

      // Force flag1 to enabled
      internalService.setFlag('flag1', true);

      const allFlags = await firstValueFrom(service.getValues());
      expect(allFlags).toHaveLength(2);

      // flag1 should be overridden to enabled
      expect(allFlags[0].id).toBe('flag1');
      expect(allFlags[0].isEnabled).toBe(true);
      expect(allFlags[0].isForced).toBe(true);

      // flag2 should remain unchanged
      expect(allFlags[1].id).toBe('flag2');
      expect(allFlags[1].isEnabled).toBe(true);
      expect(allFlags[1].isForced).toBe(false);
    });

    it('should return all flags when no overrides exist', async () => {
      const flags = [
        createMockFlag('flag1', 'Flag 1', false),
        createMockFlag('flag2', 'Flag 2', true),
      ];

      service.setAvailableOptions(flags);

      const allFlags = await firstValueFrom(service.getValues());
      expect(allFlags).toHaveLength(2);
      expect(allFlags[0].isForced).toBe(false);
      expect(allFlags[1].isForced).toBe(false);
    });

    it('should emit new values when overrides change', (done) => {
      const flags = [createMockFlag('flag1', 'Flag 1', false)];

      service.setAvailableOptions(flags);

      let emissionCount = 0;
      service.getValues().subscribe((allFlags) => {
        emissionCount++;

        if (emissionCount === 1) {
          // First emission: no overrides
          expect(allFlags[0].isEnabled).toBe(false);
          expect(allFlags[0].isForced).toBe(false);

          // Apply override
          internalService.setFlag('flag1', true);
        } else if (emissionCount === 2) {
          // Second emission: override applied
          expect(allFlags[0].isEnabled).toBe(true);
          expect(allFlags[0].isForced).toBe(true);
          done();
        }
      });
    });

    it('should handle multiple flags with mixed overrides', async () => {
      const flags = [
        createMockFlag('flag1', 'Flag 1', false),
        createMockFlag('flag2', 'Flag 2', true),
        createMockFlag('flag3', 'Flag 3', false),
      ];

      service.setAvailableOptions(flags);

      // Force flag1 to enabled and flag2 to disabled
      internalService.setFlag('flag1', true);
      internalService.setFlag('flag2', false);
      // flag3 remains natural (no override)

      const allFlags = await firstValueFrom(service.getValues());
      expect(allFlags).toHaveLength(3);

      // flag1: forced to enabled
      expect(allFlags[0].id).toBe('flag1');
      expect(allFlags[0].isEnabled).toBe(true);
      expect(allFlags[0].isForced).toBe(true);

      // flag2: forced to disabled
      expect(allFlags[1].id).toBe('flag2');
      expect(allFlags[1].isEnabled).toBe(false);
      expect(allFlags[1].isForced).toBe(true);

      // flag3: natural state
      expect(allFlags[2].id).toBe('flag3');
      expect(allFlags[2].isEnabled).toBe(false);
      expect(allFlags[2].isForced).toBe(false);
    });

    it('should correctly identify forced flags using isForced property', async () => {
      const flags = [
        createMockFlag('natural', 'Natural Flag', true),
        createMockFlag('forced', 'Forced Flag', true),
      ];

      service.setAvailableOptions(flags);

      // Force one flag
      internalService.setFlag('forced', false);

      const allFlags = await firstValueFrom(service.getValues());

      const naturalFlag = allFlags.find((f) => f.id === 'natural');
      const forcedFlag = allFlags.find((f) => f.id === 'forced');

      expect(naturalFlag?.isForced).toBe(false);
      expect(forcedFlag?.isForced).toBe(true);
    });
  });

  describe('integration: getValues vs getForcedValues', () => {
    it('should show difference between getValues and getForcedValues', async () => {
      const flags = [
        createMockFlag('flag1', 'Flag 1', false),
        createMockFlag('flag2', 'Flag 2', true),
        createMockFlag('flag3', 'Flag 3', false),
      ];

      service.setAvailableOptions(flags);

      // Force only flag1
      internalService.setFlag('flag1', true);

      const allFlags = await firstValueFrom(service.getValues());
      const forcedFlags = await firstValueFrom(service.getForcedValues());

      // getValues returns all 3 flags
      expect(allFlags).toHaveLength(3);

      // getForcedValues returns only the 1 forced flag
      expect(forcedFlags).toHaveLength(1);
      expect(forcedFlags[0].id).toBe('flag1');
    });
  });
});
