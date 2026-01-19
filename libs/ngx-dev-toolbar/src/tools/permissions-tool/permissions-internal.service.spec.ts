import { TestBed } from '@angular/core/testing';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarInternalPermissionsService } from './permissions-internal.service';
import { ForcedPermissionsState } from './permissions.models';

describe('ToolbarInternalPermissionsService', () => {
  let service: ToolbarInternalPermissionsService;
  let storageService: jest.Mocked<ToolbarStorageService>;

  beforeEach(() => {
    const storageServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ToolbarInternalPermissionsService,
        { provide: ToolbarStorageService, useValue: storageServiceMock },
      ],
    });

    storageService = TestBed.inject(
      ToolbarStorageService
    ) as jest.Mocked<ToolbarStorageService>;
    service = TestBed.inject(ToolbarInternalPermissionsService);
  });

  describe('initialization', () => {
    it('should initialize with empty permissions', () => {
      expect(service.permissions()).toEqual([]);
    });

    it('should initialize with empty forced state', () => {
      expect(storageService.get).toHaveBeenCalledWith('permissions');
    });

    it('should load forced state from localStorage if available', () => {
      const savedState: ForcedPermissionsState = {
        granted: ['perm1'],
        denied: ['perm2'],
      };
      storageService.get.mockReturnValue(savedState);

      // Reinitialize service to test constructor
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalPermissionsService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });
      TestBed.inject(ToolbarInternalPermissionsService);

      expect(storageService.get).toHaveBeenCalledWith('permissions');
      // The service should have loaded the saved state (we'll verify this after implementing setAppPermissions)
    });
  });

  describe('setAppPermissions', () => {
    it('should update appPermissions when setAppPermissions called', () => {
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
      ];

      service.setAppPermissions(permissions);

      expect(service.permissions()).toEqual(permissions);
    });

    it('should preserve forced state when setAppPermissions called with new permissions', () => {
      const initialPermissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: false, isForced: false },
      ];
      service.setAppPermissions(initialPermissions);

      // Force permission to granted
      service.setPermission('perm1', true);

      // Update with new permissions (same id, different default value)
      const newPermissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: false, isForced: false },
      ];
      service.setAppPermissions(newPermissions);

      // Should still be forced to granted
      const result = service.permissions();
      expect(result[0].isForced).toBe(true);
      expect(result[0].isGranted).toBe(true);
    });

    it('should combine app permissions with forced state correctly', () => {
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
      ];
      service.setAppPermissions(permissions);

      service.setPermission('perm2', true);

      const result = service.permissions();
      expect(result[0]).toEqual({
        id: 'perm1',
        name: 'Permission 1',
        isGranted: true,
        isForced: false,
      });
      expect(result[1]).toEqual({
        id: 'perm2',
        name: 'Permission 2',
        isGranted: true,
        isForced: true,
        originalValue: false,
      });
    });

    it('should handle empty permissions array', () => {
      service.setAppPermissions([]);

      expect(service.permissions()).toEqual([]);
    });
  });

  describe('setPermission to granted', () => {
    beforeEach(() => {
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: false, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
      ];
      service.setAppPermissions(permissions);
    });

    it('should add permission to granted array when granted=true', () => {
      service.setPermission('perm1', true);

      const result = service.permissions();
      expect(result[0].isForced).toBe(true);
      expect(result[0].isGranted).toBe(true);
    });

    it('should remove permission from denied array if present', () => {
      // First deny it
      service.setPermission('perm1', false);
      let result = service.permissions();
      expect(result[0].isGranted).toBe(false);

      // Then grant it
      service.setPermission('perm1', true);
      result = service.permissions();
      expect(result[0].isGranted).toBe(true);
      expect(result[0].isForced).toBe(true);
    });

    it('should update combined permissions signal', () => {
      service.setPermission('perm1', true);

      const result = service.permissions();
      expect(result[0]).toEqual({
        id: 'perm1',
        name: 'Permission 1',
        isGranted: true,
        isForced: true,
        originalValue: false,
      });
    });

    it('should persist to localStorage with key permissions', () => {
      service.setPermission('perm1', true);

      expect(storageService.set).toHaveBeenCalledWith('permissions', {
        granted: ['perm1'],
        denied: [],
      });
    });
  });

  describe('setPermission to denied', () => {
    beforeEach(() => {
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: true, isForced: false },
      ];
      service.setAppPermissions(permissions);
    });

    it('should add permission to denied array when granted=false', () => {
      service.setPermission('perm1', false);

      const result = service.permissions();
      expect(result[0].isForced).toBe(true);
      expect(result[0].isGranted).toBe(false);
    });

    it('should remove permission from granted array if present', () => {
      // First grant it
      service.setPermission('perm1', true);
      let result = service.permissions();
      expect(result[0].isGranted).toBe(true);

      // Then deny it
      service.setPermission('perm1', false);
      result = service.permissions();
      expect(result[0].isGranted).toBe(false);
      expect(result[0].isForced).toBe(true);
    });

    it('should update combined permissions signal correctly', () => {
      service.setPermission('perm1', false);

      const result = service.permissions();
      expect(result[0]).toEqual({
        id: 'perm1',
        name: 'Permission 1',
        isGranted: false,
        isForced: true,
        originalValue: true,
      });
    });

    it('should persist denied state to localStorage', () => {
      service.setPermission('perm1', false);

      expect(storageService.set).toHaveBeenCalledWith('permissions', {
        granted: [],
        denied: ['perm1'],
      });
    });
  });

  describe('removePermissionOverride', () => {
    beforeEach(() => {
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
      ];
      service.setAppPermissions(permissions);
    });

    it('should remove permission from both granted and denied arrays', () => {
      service.setPermission('perm1', false);
      let result = service.permissions();
      expect(result[0].isForced).toBe(true);

      service.removePermissionOverride('perm1');
      result = service.permissions();
      expect(result[0].isForced).toBe(false);
    });

    it('should restore permission to original app state', () => {
      // Original state: perm1=true, perm2=false
      service.setPermission('perm1', false);
      let result = service.permissions();
      expect(result[0].isGranted).toBe(false);

      service.removePermissionOverride('perm1');
      result = service.permissions();
      expect(result[0].isGranted).toBe(true); // Restored to original
      expect(result[0].isForced).toBe(false);
    });

    it('should update localStorage', () => {
      service.setPermission('perm1', true);
      service.setPermission('perm2', false);

      service.removePermissionOverride('perm1');

      expect(storageService.set).toHaveBeenCalledWith('permissions', {
        granted: [],
        denied: ['perm2'],
      });
    });

    it('should emit updated permissions via getForcedPermissions', (done) => {
      service.setPermission('perm1', true);

      service.getForcedPermissions().subscribe((forced) => {
        if (forced.length === 0) {
          done();
        }
      });

      service.removePermissionOverride('perm1');
    });
  });

  describe('localStorage persistence on initialization', () => {
    it('should load forced state from localStorage on initialization', () => {
      const savedState: ForcedPermissionsState = {
        granted: ['perm1', 'perm2'],
        denied: ['perm3'],
      };
      storageService.get.mockReturnValue(savedState);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalPermissionsService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(ToolbarInternalPermissionsService);

      // Set permissions to verify forced state is applied
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: false, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
        { id: 'perm3', name: 'Permission 3', isGranted: true, isForced: false },
      ];
      newService.setAppPermissions(permissions);

      const result = newService.permissions();
      expect(result[0].isForced).toBe(true);
      expect(result[0].isGranted).toBe(true); // Forced granted
      expect(result[2].isForced).toBe(true);
      expect(result[2].isGranted).toBe(false); // Forced denied
    });

    it('should handle corrupted localStorage data gracefully', () => {
      storageService.get.mockReturnValue({ invalid: 'data' } as any);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalPermissionsService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(ToolbarInternalPermissionsService);

      // Should initialize with empty state, not crash
      expect(newService.permissions()).toEqual([]);
    });

    it('should handle missing localStorage data gracefully', () => {
      storageService.get.mockReturnValue(null);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalPermissionsService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(ToolbarInternalPermissionsService);

      expect(newService.permissions()).toEqual([]);
    });

    it('should handle invalid JSON structure gracefully', () => {
      // Test with data that's not the expected ForcedPermissionsState structure
      storageService.get.mockReturnValue({ granted: 'not-an-array' } as any);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalPermissionsService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });

      // Should not throw error during construction
      expect(() =>
        TestBed.inject(ToolbarInternalPermissionsService)
      ).not.toThrow();
    });
  });

  describe('persisting invalid permission overrides', () => {
    it('should ignore forced permissions that do not exist in available options', () => {
      const savedState: ForcedPermissionsState = {
        granted: ['perm1', 'nonexistent1'],
        denied: ['perm2', 'nonexistent2'],
      };
      storageService.get.mockReturnValue(savedState);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalPermissionsService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(ToolbarInternalPermissionsService);

      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: false, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: true, isForced: false },
      ];
      newService.setAppPermissions(permissions);

      const result = newService.permissions();
      // Only valid forced permissions should be applied
      expect(result[0].isForced).toBe(true);
      expect(result[1].isForced).toBe(true);
      // Should have 2 permissions, not 4
      expect(result.length).toBe(2);
    });

    it('should clean up invalid permission IDs from localStorage after validation', () => {
      const savedState: ForcedPermissionsState = {
        granted: ['perm1', 'nonexistent1'],
        denied: ['nonexistent2'],
      };
      storageService.get.mockReturnValue(savedState);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ToolbarInternalPermissionsService,
          { provide: ToolbarStorageService, useValue: storageService },
        ],
      });
      const newService = TestBed.inject(ToolbarInternalPermissionsService);

      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: false, isForced: false },
      ];
      newService.setAppPermissions(permissions);

      // Should have cleaned up and persisted the valid state only
      expect(storageService.set).toHaveBeenCalledWith('permissions', {
        granted: ['perm1'],
        denied: [],
      });
    });
  });

  describe('preset integration methods', () => {
    beforeEach(() => {
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: false, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
      ];
      service.setAppPermissions(permissions);
    });

    it('applyPresetPermissions should replace current forced state with provided state', () => {
      // Set initial state
      service.setPermission('perm1', true);
      let result = service.permissions();
      expect(result[0].isForced).toBe(true);

      // Apply preset
      const presetState: ForcedPermissionsState = {
        granted: ['perm2'],
        denied: [],
      };
      service.applyPresetPermissions(presetState);

      result = service.permissions();
      expect(result[0].isForced).toBe(false); // perm1 no longer forced
      expect(result[1].isForced).toBe(true); // perm2 now forced
      expect(result[1].isGranted).toBe(true);
    });

    it('applyPresetPermissions should persist new state to localStorage', () => {
      const presetState: ForcedPermissionsState = {
        granted: ['perm1'],
        denied: ['perm2'],
      };
      service.applyPresetPermissions(presetState);

      expect(storageService.set).toHaveBeenCalledWith('permissions', presetState);
    });

    it('applyPresetPermissions should emit updated forced permissions', (done) => {
      const presetState: ForcedPermissionsState = {
        granted: ['perm1'],
        denied: [],
      };

      service.getForcedPermissions().subscribe((forced) => {
        if (forced.length === 1 && forced[0].id === 'perm1') {
          done();
        }
      });

      service.applyPresetPermissions(presetState);
    });

    it('getCurrentForcedState should return current ForcedPermissionsState object', () => {
      service.setPermission('perm1', true);
      service.setPermission('perm2', false);

      const currentState = service.getCurrentForcedState();
      expect(currentState).toEqual({
        granted: ['perm1'],
        denied: ['perm2'],
      });
    });

    it('getCurrentForcedState should return deep copy to prevent external mutations', () => {
      service.setPermission('perm1', true);

      const currentState = service.getCurrentForcedState();
      currentState.granted.push('modified');

      const newState = service.getCurrentForcedState();
      expect(newState.granted).toEqual(['perm1']); // Original unchanged
    });
  });

  describe('getForcedPermissions', () => {
    beforeEach(() => {
      const permissions = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: false },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
        { id: 'perm3', name: 'Permission 3', isGranted: true, isForced: false },
      ];
      service.setAppPermissions(permissions);
    });

    it('should return only permissions with isForced=true', (done) => {
      service.setPermission('perm1', false);
      service.setPermission('perm3', true);

      service.getForcedPermissions().subscribe((forced) => {
        expect(forced.length).toBe(2);
        expect(forced[0].id).toBe('perm1');
        expect(forced[0].isForced).toBe(true);
        expect(forced[1].id).toBe('perm3');
        expect(forced[1].isForced).toBe(true);
        done();
      });
    });

    it('should emit when forced state changes', (done) => {
      let emitCount = 0;

      service.getForcedPermissions().subscribe((forced) => {
        emitCount++;
        if (emitCount === 2) {
          expect(forced.length).toBe(1);
          done();
        }
      });

      service.setPermission('perm1', true);
    });

    it('should handle empty forced state', (done) => {
      service.getForcedPermissions().subscribe((forced) => {
        expect(forced.length).toBe(0);
        done();
      });
    });
  });
});
