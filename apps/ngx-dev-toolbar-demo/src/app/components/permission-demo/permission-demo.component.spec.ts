import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PermissionDemoComponent } from './permission-demo.component';
import { DemoPermissionsService } from '../../services/demo-permissions.service';

describe('PermissionDemoComponent', () => {
  let component: PermissionDemoComponent;
  let fixture: ComponentFixture<PermissionDemoComponent>;
  let demoPermService: jest.Mocked<DemoPermissionsService>;

  beforeEach(async () => {
    const permissionsSignal = signal<Record<string, boolean>>({
      'can-edit-posts': false,
      'can-delete-posts': false,
      'can-manage-users': true,
      'can-view-analytics': false,
      'is-admin': false,
    });

    const demoPermServiceMock = {
      permissions: permissionsSignal,
      hasPermission: jest.fn((id: string) => permissionsSignal()[id] ?? false),
    };

    await TestBed.configureTestingModule({
      imports: [PermissionDemoComponent],
      providers: [
        {
          provide: DemoPermissionsService,
          useValue: demoPermServiceMock,
        },
      ],
    }).compileComponents();

    demoPermService = TestBed.inject(
      DemoPermissionsService
    ) as jest.Mocked<DemoPermissionsService>;
    fixture = TestBed.createComponent(PermissionDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show Edit Post button when canEdit is true', () => {
    demoPermService.hasPermission.mockReturnValue(true);

    // Create new component with updated permission
    TestBed.resetTestingModule();
    const permissionsSignal = signal<Record<string, boolean>>({
      'can-edit-posts': true,
      'can-delete-posts': false,
      'can-manage-users': false,
      'can-view-analytics': false,
      'is-admin': false,
    });

    TestBed.configureTestingModule({
      imports: [PermissionDemoComponent],
      providers: [
        {
          provide: DemoPermissionsService,
          useValue: {
            permissions: permissionsSignal,
            hasPermission: (id: string) => id === 'can-edit-posts',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PermissionDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['canEdit']()).toBe(true);
  });

  it('should hide Edit Post button when canEdit is false', () => {
    expect(component['canEdit']()).toBe(false);
  });

  it('should show Admin Panel when isAdmin is true', () => {
    demoPermService.hasPermission.mockImplementation((id) => id === 'is-admin');

    // Create new component with admin permission
    TestBed.resetTestingModule();
    const permissionsSignal = signal<Record<string, boolean>>({
      'can-edit-posts': false,
      'can-delete-posts': false,
      'can-manage-users': false,
      'can-view-analytics': false,
      'is-admin': true,
    });

    TestBed.configureTestingModule({
      imports: [PermissionDemoComponent],
      providers: [
        {
          provide: DemoPermissionsService,
          useValue: {
            permissions: permissionsSignal,
            hasPermission: (id: string) => id === 'is-admin',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PermissionDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['isAdmin']()).toBe(true);
  });

  it('computed signals should call hasPermission with correct IDs', () => {
    component['canEdit']();
    expect(demoPermService.hasPermission).toHaveBeenCalledWith('can-edit-posts');

    component['canDelete']();
    expect(demoPermService.hasPermission).toHaveBeenCalledWith('can-delete-posts');

    component['canManageUsers']();
    expect(demoPermService.hasPermission).toHaveBeenCalledWith('can-manage-users');

    component['canViewAnalytics']();
    expect(demoPermService.hasPermission).toHaveBeenCalledWith('can-view-analytics');

    component['isAdmin']();
    expect(demoPermService.hasPermission).toHaveBeenCalledWith('is-admin');
  });
});
