import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  DevToolbarPermissionsService,
  DevToolbarPermission,
} from 'ngx-dev-toolbar';
import { DemoPermissionsService } from './demo-permissions.service';

describe('DemoPermissionsService', () => {
  let service: DemoPermissionsService;
  let permissionsService: jest.Mocked<DevToolbarPermissionsService>;

  beforeEach(() => {
    const permissionsServiceMock = {
      setAvailableOptions: jest.fn(),
      getForcedValues: jest.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      providers: [
        DemoPermissionsService,
        {
          provide: DevToolbarPermissionsService,
          useValue: permissionsServiceMock,
        },
      ],
    });

    permissionsService = TestBed.inject(
      DevToolbarPermissionsService
    ) as jest.Mocked<DevToolbarPermissionsService>;
    service = TestBed.inject(DemoPermissionsService);
  });

  it('should initialize with sample permissions', () => {
    expect(service).toBeTruthy();
    const permissions = service.permissions();
    expect(permissions).toBeDefined();
    expect(Object.keys(permissions).length).toBeGreaterThan(0);
  });

  it('should call setAvailableOptions in constructor', () => {
    expect(permissionsService.setAvailableOptions).toHaveBeenCalledTimes(1);
    expect(permissionsService.setAvailableOptions).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'can-edit-posts',
          name: 'Edit Posts',
        }),
      ])
    );
  });

  it('should update permissions signal when forced values change', () => {
    const forcedPermissions: DevToolbarPermission[] = [
      {
        id: 'can-edit-posts',
        name: 'Edit Posts',
        description: 'Can edit blog posts',
        isGranted: true,
        isForced: true,
      },
    ];

    // Trigger the observable to emit forced values
    permissionsService.getForcedValues.mockReturnValue(of(forcedPermissions));

    // Create a new service instance to trigger the subscription
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        DemoPermissionsService,
        {
          provide: DevToolbarPermissionsService,
          useValue: permissionsService,
        },
      ],
    });
    const newService = TestBed.inject(DemoPermissionsService);

    const permissions = newService.permissions();
    expect(permissions['can-edit-posts']).toBe(true);
  });

  it('hasPermission should return correct boolean value', () => {
    expect(service.hasPermission('can-manage-users')).toBe(true);
    expect(service.hasPermission('can-edit-posts')).toBe(false);
  });

  it('hasPermission should return false for non-existent permission', () => {
    expect(service.hasPermission('non-existent-permission')).toBe(false);
  });
});
