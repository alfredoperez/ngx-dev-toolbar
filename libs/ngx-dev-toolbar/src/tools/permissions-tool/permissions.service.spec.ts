import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToolbarPermissionsService } from './permissions.service';
import { ToolbarInternalPermissionsService } from './permissions-internal.service';
import { ToolbarPermission } from './permissions.models';

describe('ToolbarPermissionsService', () => {
  let service: ToolbarPermissionsService;
  let internalService: jest.Mocked<ToolbarInternalPermissionsService>;

  beforeEach(() => {
    const internalServiceMock = {
      setAppPermissions: jest.fn(),
      getForcedPermissions: jest.fn(),
      permissions$: of([]),
    };

    TestBed.configureTestingModule({
      providers: [
        ToolbarPermissionsService,
        {
          provide: ToolbarInternalPermissionsService,
          useValue: internalServiceMock,
        },
      ],
    });

    internalService = TestBed.inject(
      ToolbarInternalPermissionsService
    ) as jest.Mocked<ToolbarInternalPermissionsService>;
    service = TestBed.inject(ToolbarPermissionsService);
  });

  it('should implement ToolbarService interface', () => {
    expect(service.setAvailableOptions).toBeDefined();
    expect(service.getForcedValues).toBeDefined();
    expect(service.getValues).toBeDefined();
  });

  describe('setAvailableOptions', () => {
    it('should call internal service setAppPermissions', () => {
      const permissions: ToolbarPermission[] = [
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
      const forcedPermissions: ToolbarPermission[] = [
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
      const allPermissions: ToolbarPermission[] = [
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
      const permissions: ToolbarPermission[] = [
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
