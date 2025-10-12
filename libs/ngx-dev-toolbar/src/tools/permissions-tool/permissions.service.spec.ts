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
});
