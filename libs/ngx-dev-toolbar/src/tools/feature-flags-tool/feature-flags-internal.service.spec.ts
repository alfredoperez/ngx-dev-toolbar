import { TestBed } from '@angular/core/testing';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { ToolbarFlag } from './feature-flags.models';

interface ForcedFlagsState {
  enabled: string[];
  disabled: string[];
}

describe('ToolbarInternalFeatureFlagService', () => {
  let service: ToolbarInternalFeatureFlagService;
  let storageService: jest.Mocked<ToolbarStorageService>;
  let stateService: ToolbarStateService;

  const createMockFlag = (
    id: string,
    name: string,
    isEnabled = false,
    description?: string
  ): ToolbarFlag => ({
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
        ToolbarInternalFeatureFlagService,
        ToolbarStateService,
        { provide: ToolbarStorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(ToolbarInternalFeatureFlagService);
    storageService = TestBed.inject(
      ToolbarStorageService
    ) as jest.Mocked<ToolbarStorageService>;
    stateService = TestBed.inject(ToolbarStateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty flags', () => {
      expect(service.flags()).toEqual([]);
    });

    it('should load forced flags from localStorage on initialization', () => {
      expect(storageService.get).toHaveBeenCalledWith('feature-flags');
    });

    it('should apply forced state from localStorage after setAppFlags', () => {
      const savedState: ForcedFlagsState = {
        enabled: ['flag1'],
        disabled: ['flag2'],
      };
      storageService.get.mockReturnValue(savedState);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalFeatureFlagService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(ToolbarInternalFeatureFlagService);

      const flags = [
        createMockFlag('flag1', 'Flag 1', false),
        createMockFlag('flag2', 'Flag 2', true),
      ];
      newService.setAppFlags(flags);

      const result = newService.flags();
      expect(result[0].isEnabled).toBe(true); // Forced enabled
      expect(result[0].isForced).toBe(true);
      expect(result[1].isEnabled).toBe(false); // Forced disabled
      expect(result[1].isForced).toBe(true);
    });
  });

  describe('setAppFlags', () => {
    it('should update flags when setAppFlags is called', () => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', true),
        createMockFlag('flag2', 'Feature Flag 2', false),
      ];

      service.setAppFlags(flags);

      const result = service.flags();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('flag1');
      expect(result[0].name).toBe('Feature Flag 1');
      expect(result[1].id).toBe('flag2');
      expect(result[1].name).toBe('Feature Flag 2');
    });

    it('should handle empty flags array', () => {
      service.setAppFlags([]);

      expect(service.flags()).toEqual([]);
    });

    it('should preserve forced state when setAppFlags is called', () => {
      const initialFlags = [
        createMockFlag('flag1', 'Feature Flag 1', false),
      ];
      service.setAppFlags(initialFlags);

      service.setFlag('flag1', true);

      const newFlags = [
        createMockFlag('flag1', 'Feature Flag 1', false),
      ];
      service.setAppFlags(newFlags);

      const result = service.flags();
      expect(result[0].isForced).toBe(true);
      expect(result[0].isEnabled).toBe(true);
    });
  });

  describe('setFlag to enabled', () => {
    beforeEach(() => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', false),
        createMockFlag('flag2', 'Feature Flag 2', false),
      ];
      service.setAppFlags(flags);
    });

    it('should add flag to enabled array when isEnabled=true', () => {
      service.setFlag('flag1', true);

      const result = service.flags();
      expect(result[0].isForced).toBe(true);
      expect(result[0].isEnabled).toBe(true);
    });

    it('should remove flag from disabled array if present', () => {
      service.setFlag('flag1', false);
      let result = service.flags();
      expect(result[0].isEnabled).toBe(false);

      service.setFlag('flag1', true);
      result = service.flags();
      expect(result[0].isEnabled).toBe(true);
      expect(result[0].isForced).toBe(true);
    });

    it('should persist to localStorage with key feature-flags', () => {
      service.setFlag('flag1', true);

      expect(storageService.set).toHaveBeenCalledWith('feature-flags', {
        enabled: ['flag1'],
        disabled: [],
      });
    });
  });

  describe('setFlag to disabled', () => {
    beforeEach(() => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', true),
        createMockFlag('flag2', 'Feature Flag 2', true),
      ];
      service.setAppFlags(flags);
    });

    it('should add flag to disabled array when isEnabled=false', () => {
      service.setFlag('flag1', false);

      const result = service.flags();
      expect(result[0].isForced).toBe(true);
      expect(result[0].isEnabled).toBe(false);
    });

    it('should remove flag from enabled array if present', () => {
      service.setFlag('flag1', true);
      let result = service.flags();
      expect(result[0].isEnabled).toBe(true);

      service.setFlag('flag1', false);
      result = service.flags();
      expect(result[0].isEnabled).toBe(false);
      expect(result[0].isForced).toBe(true);
    });

    it('should persist to localStorage', () => {
      service.setFlag('flag1', false);

      expect(storageService.set).toHaveBeenCalledWith('feature-flags', {
        enabled: [],
        disabled: ['flag1'],
      });
    });
  });

  describe('removeFlagOverride', () => {
    it('should remove flag from both enabled and disabled arrays', () => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', true),
        createMockFlag('flag2', 'Feature Flag 2', false),
      ];
      service.setAppFlags(flags);

      service.setFlag('flag1', false);
      let result = service.flags();
      expect(result[0].isForced).toBe(true);

      service.removeFlagOverride('flag1');
      result = service.flags();
      expect(result[0].isForced).toBe(false);
    });

    it('should restore flag to original app state', () => {
      // Set initial state where flag1 has natural isEnabled = true
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', true),
        createMockFlag('flag2', 'Feature Flag 2', false),
      ];
      service.setAppFlags(flags);

      // Force it to disabled
      service.setFlag('flag1', false);
      let result = service.flags();
      expect(result[0].isEnabled).toBe(false);
      expect(result[0].isForced).toBe(true);

      // Remove override - should restore to natural state (true)
      service.removeFlagOverride('flag1');
      result = service.flags();
      expect(result[0].isEnabled).toBe(true); // Restored to original
      expect(result[0].isForced).toBe(false);
    });

    it('should update localStorage', () => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', true),
        createMockFlag('flag2', 'Feature Flag 2', false),
      ];
      service.setAppFlags(flags);

      service.setFlag('flag1', true);
      service.setFlag('flag2', false);

      service.removeFlagOverride('flag1');

      expect(storageService.set).toHaveBeenCalledWith('feature-flags', {
        enabled: [],
        disabled: ['flag2'],
      });
    });
  });

  describe('getForcedFlags', () => {
    beforeEach(() => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', true),
        createMockFlag('flag2', 'Feature Flag 2', false),
        createMockFlag('flag3', 'Feature Flag 3', true),
      ];
      service.setAppFlags(flags);
    });

    it('should return only flags with isForced=true', (done) => {
      service.setFlag('flag1', false);
      service.setFlag('flag3', true);

      service.getForcedFlags().subscribe((forced) => {
        expect(forced.length).toBe(2);
        expect(forced[0].id).toBe('flag1');
        expect(forced[0].isForced).toBe(true);
        expect(forced[1].id).toBe('flag3');
        expect(forced[1].isForced).toBe(true);
        done();
      });
    });

    it('should emit when forced state changes', (done) => {
      let emitCount = 0;

      service.getForcedFlags().subscribe((forced) => {
        emitCount++;
        if (emitCount === 2) {
          expect(forced.length).toBe(1);
          done();
        }
      });

      service.setFlag('flag1', true);
    });

    it('should handle empty forced state', (done) => {
      service.getForcedFlags().subscribe((forced) => {
        expect(forced.length).toBe(0);
        done();
      });
    });
  });

  describe('Preset Integration: applyPresetFlags() and getCurrentForcedState()', () => {
    beforeEach(() => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', false),
        createMockFlag('flag2', 'Feature Flag 2', false),
        createMockFlag('flag3', 'Feature Flag 3', true),
      ];
      service.setAppFlags(flags);
    });

    it('should apply preset state and replace current forced state', () => {
      service.setFlag('flag1', true);
      let result = service.flags();
      expect(result[0].isForced).toBe(true);

      const presetState: ForcedFlagsState = {
        enabled: ['flag2'],
        disabled: ['flag3'],
      };
      service.applyPresetFlags(presetState);

      result = service.flags();
      expect(result[0].isForced).toBe(false); // flag1 no longer forced
      expect(result[1].isForced).toBe(true); // flag2 now forced enabled
      expect(result[1].isEnabled).toBe(true);
      expect(result[2].isForced).toBe(true); // flag3 now forced disabled
      expect(result[2].isEnabled).toBe(false);
    });

    it('should persist applied preset state to localStorage', () => {
      const presetState: ForcedFlagsState = {
        enabled: ['flag1'],
        disabled: ['flag2'],
      };
      service.applyPresetFlags(presetState);

      expect(storageService.set).toHaveBeenCalledWith(
        'feature-flags',
        presetState
      );
    });

    it('should emit updated forced flags after applying preset', (done) => {
      const presetState: ForcedFlagsState = {
        enabled: ['flag1'],
        disabled: [],
      };

      service.getForcedFlags().subscribe((forced) => {
        if (forced.length === 1 && forced[0].id === 'flag1') {
          expect(forced[0].isForced).toBe(true);
          expect(forced[0].isEnabled).toBe(true);
          done();
        }
      });

      service.applyPresetFlags(presetState);
    });

    it('should handle empty preset state (clear all forced overrides)', () => {
      service.setFlag('flag1', true);
      service.setFlag('flag2', false);

      const emptyPreset: ForcedFlagsState = {
        enabled: [],
        disabled: [],
      };
      service.applyPresetFlags(emptyPreset);

      const result = service.flags();
      expect(result[0].isForced).toBe(false);
      expect(result[1].isForced).toBe(false);
      expect(result[2].isForced).toBe(false);
    });

    it('getCurrentForcedState should return current ForcedFlagsState object', () => {
      service.setFlag('flag1', true);
      service.setFlag('flag2', false);

      const currentState = service.getCurrentForcedState();
      expect(currentState).toEqual({
        enabled: ['flag1'],
        disabled: ['flag2'],
      });
    });

    it('getCurrentForcedState should return empty state when no flags forced', () => {
      const currentState = service.getCurrentForcedState();
      expect(currentState).toEqual({
        enabled: [],
        disabled: [],
      });
    });

    it('getCurrentForcedState should match structure: { enabled: string[], disabled: string[] }', () => {
      const result = service.getCurrentForcedState();

      expect(result).toHaveProperty('enabled');
      expect(result).toHaveProperty('disabled');
      expect(Array.isArray(result.enabled)).toBe(true);
      expect(Array.isArray(result.disabled)).toBe(true);
    });
  });

  describe('Disabled Toolbar State', () => {
    beforeEach(() => {
      const flags = [
        createMockFlag('flag1', 'Feature Flag 1', false),
        createMockFlag('flag2', 'Feature Flag 2', true),
      ];
      service.setAppFlags(flags);
      service.setFlag('flag1', true);
      service.setFlag('flag2', false);
    });

    it('should return empty array from getForcedFlags when toolbar is disabled', (done) => {
      stateService.setConfig({ enabled: false });

      service.getForcedFlags().subscribe((forced) => {
        expect(forced.length).toBe(0);
        done();
      });
    });

    it('should return app flags without overrides from flags$ when toolbar is disabled', (done) => {
      stateService.setConfig({ enabled: false });

      service.flags$.subscribe((flags) => {
        expect(flags[0].id).toBe('flag1');
        expect(flags[0].isEnabled).toBe(false); // Original value, not forced
        expect(flags[0].isForced).toBe(false);
        expect(flags[1].id).toBe('flag2');
        expect(flags[1].isEnabled).toBe(true); // Original value, not forced
        expect(flags[1].isForced).toBe(false);
        done();
      });
    });

    it('should preserve localStorage data when toolbar is disabled', () => {
      const setCallCount = storageService.set.mock.calls.length;
      stateService.setConfig({ enabled: false });

      // Verify no additional localStorage calls were made
      expect(storageService.set).toHaveBeenCalledTimes(setCallCount);

      // Verify data is still in localStorage (from when it was enabled)
      const lastCall = storageService.set.mock.calls[setCallCount - 1];
      expect(lastCall[0]).toBe('feature-flags');
      expect(lastCall[1]).toEqual({
        enabled: ['flag1'],
        disabled: ['flag2'],
      });
    });

    it('should return forced values when toolbar is re-enabled', (done) => {
      // First disable toolbar
      stateService.setConfig({ enabled: false });

      // Subscribe and verify disabled state
      service.getForcedFlags().subscribe((forced) => {
        expect(forced.length).toBe(0);
      });

      // Re-enable toolbar
      stateService.setConfig({ enabled: true });

      // Subscribe again and verify forced values are returned
      service.getForcedFlags().subscribe((forced) => {
        expect(forced.length).toBe(2);
        expect(forced[0].id).toBe('flag1');
        expect(forced[1].id).toBe('flag2');
        done();
      });
    });
  });
});
