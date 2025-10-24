import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DevToolbarPermissionsService } from './permissions.service';
import { DevToolbarInternalPermissionsService } from './permissions-internal.service';
import { DevToolbarPermission } from './permissions.models';

describe('DevToolbarPermissionsService', () => {
  let service: DevToolbarPermissionsService;
  let internalService: jest.Mocked<DevToolbarInternalPermissionsService>;

  beforeEach(() => {
    const internalServiceMock = {
      setAppPermissions: jest.fn(),
      getForcedPermissions: jest.fn(),
      permissions$: of([]),
    };

    TestBed.configureTestingModule({
      providers: [
        DevToolbarPermissionsService,
        {
          provide: DevToolbarInternalPermissionsService,
          useValue: internalServiceMock,
        },
      ],
    });

    internalService = TestBed.inject(
      DevToolbarInternalPermissionsService
    ) as jest.Mocked<DevToolbarInternalPermissionsService>;
    service = TestBed.inject(DevToolbarPermissionsService);
  });

  it('should implement DevToolsService interface', () => {
    expect(service.setAvailableOptions).toBeDefined();
    expect(service.getForcedValues).toBeDefined();
    expect(service.getValues).toBeDefined();
  });

  describe('setAvailableOptions', () => {
    it('should call internal service setAppPermissions', () => {
      const permissions: DevToolbarPermission[] = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: false },
      ];

      service.setAvailableOptions(permissions);

      expect(internalService.setAppPermissions).toHaveBeenCalledWith(
        permissions
      );
    });
  });

  describe('getForcedValues', () => {
    it('should return observable of forced permissions', (done) => {
      const forcedPermissions: DevToolbarPermission[] = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: true },
      ];
      internalService.getForcedPermissions = jest
        .fn()
        .mockReturnValue(of(forcedPermissions));

      service.getForcedValues().subscribe((result) => {
        expect(result).toEqual(forcedPermissions);
        done();
      });
    });
  });

  describe('getValues', () => {
    it('should return all permissions with overrides applied', (done) => {
      const allPermissions: DevToolbarPermission[] = [
        { id: 'perm1', name: 'Permission 1', isGranted: true, isForced: true },
        { id: 'perm2', name: 'Permission 2', isGranted: false, isForced: false },
      ];
      internalService.permissions$ = of(allPermissions);

      service.getValues().subscribe((result) => {
        expect(result).toEqual(allPermissions);
        expect(result).toHaveLength(2);
        expect(result[0].isForced).toBe(true);
        expect(result[1].isForced).toBe(false);
        done();
      });
    });

    it('should return empty array when no permissions are available', (done) => {
      internalService.permissions$ = of([]);

      service.getValues().subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should distinguish between forced and natural permissions', (done) => {
      const permissions: DevToolbarPermission[] = [
        { id: 'natural', name: 'Natural', isGranted: true, isForced: false },
        { id: 'forced', name: 'Forced', isGranted: false, isForced: true },
      ];
      internalService.permissions$ = of(permissions);

      service.getValues().subscribe((result) => {
        const natural = result.find((p) => p.id === 'natural');
        const forced = result.find((p) => p.id === 'forced');

        expect(natural?.isForced).toBe(false);
        expect(forced?.isForced).toBe(true);
        done();
      });
    });
  });
});
