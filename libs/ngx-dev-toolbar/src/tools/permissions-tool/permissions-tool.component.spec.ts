import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DevToolbarPermissionsToolComponent } from './permissions-tool.component';
import { DevToolbarInternalPermissionsService } from './permissions-internal.service';
import { DevToolbarPermission } from './permissions.models';

describe('DevToolbarPermissionsToolComponent', () => {
  let component: DevToolbarPermissionsToolComponent;
  let fixture: ComponentFixture<DevToolbarPermissionsToolComponent>;
  let internalService: jest.Mocked<DevToolbarInternalPermissionsService>;

  const mockPermissions: DevToolbarPermission[] = [
    {
      id: 'perm1',
      name: 'Edit Posts',
      description: 'Can edit blog posts',
      isGranted: true,
      isForced: false,
    },
    {
      id: 'perm2',
      name: 'Delete Posts',
      description: 'Can delete blog posts',
      isGranted: false,
      isForced: false,
    },
    {
      id: 'perm3',
      name: 'Manage Users',
      description: 'Can manage user accounts',
      isGranted: true,
      isForced: true,
    },
  ];

  beforeEach(async () => {
    const permissionsSignal = signal<DevToolbarPermission[]>(mockPermissions);

    const internalServiceMock = {
      permissions: permissionsSignal,
      setPermission: jest.fn(),
      removePermissionOverride: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DevToolbarPermissionsToolComponent, NoopAnimationsModule],
      providers: [
        {
          provide: DevToolbarInternalPermissionsService,
          useValue: internalServiceMock,
        },
      ],
    }).compileComponents();

    internalService = TestBed.inject(
      DevToolbarInternalPermissionsService
    ) as jest.Mocked<DevToolbarInternalPermissionsService>;
    fixture = TestBed.createComponent(DevToolbarPermissionsToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with permissions signal from internal service', () => {
      expect(component['permissions']()).toEqual(mockPermissions);
    });

    it('should initialize with empty search query', () => {
      expect(component['searchQuery']()).toBe('');
    });

    it('should initialize with all filter', () => {
      expect(component['activeFilter']()).toBe('all');
    });
  });

  describe('onPermissionChange', () => {
    it('should call setPermission when value is granted', () => {
      component.onPermissionChange('perm1', 'granted');

      expect(internalService.setPermission).toHaveBeenCalledWith('perm1', true);
    });

    it('should call setPermission when value is denied', () => {
      component.onPermissionChange('perm1', 'denied');

      expect(internalService.setPermission).toHaveBeenCalledWith(
        'perm1',
        false
      );
    });

    it('should call removePermissionOverride when value is not-forced', () => {
      component.onPermissionChange('perm1', 'not-forced');

      expect(internalService.removePermissionOverride).toHaveBeenCalledWith(
        'perm1'
      );
    });

    it('should not call service methods for invalid value', () => {
      component.onPermissionChange('perm1', 'invalid');

      expect(internalService.setPermission).not.toHaveBeenCalled();
      expect(internalService.removePermissionOverride).not.toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should have correct window options configured', () => {
      expect(component['options'].title).toBe('Permissions');
      expect(component['options'].isClosable).toBe(true);
      expect(component['options'].size).toBe('tall');
    });

    it('should have filter options configured', () => {
      expect(component['filterOptions'].length).toBe(4);
      expect(component['filterOptions'][0].value).toBe('all');
      expect(component['filterOptions'][1].value).toBe('forced');
    });

    it('should have permission value options configured', () => {
      expect(component['permissionValueOptions'].length).toBe(3);
      expect(component['permissionValueOptions'][0].value).toBe('not-forced');
      expect(component['permissionValueOptions'][1].value).toBe('denied');
      expect(component['permissionValueOptions'][2].value).toBe('granted');
    });

    it('should compute correct permission value for not forced permission', () => {
      const value = component['getPermissionValue'](mockPermissions[0]);
      expect(value).toBe('');
    });
  });

  describe('search functionality', () => {
    it('onSearchChange should update searchQuery signal', () => {
      component.onSearchChange('test query');

      expect(component['searchQuery']()).toBe('test query');
    });

    it('filteredPermissions should include only permissions matching search query by name', () => {
      component.onSearchChange('edit');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Edit Posts');
    });

    it('filteredPermissions should include permissions matching search query by description', () => {
      component.onSearchChange('blog posts');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(2);
      expect(filtered[0].name).toBe('Edit Posts');
      expect(filtered[1].name).toBe('Delete Posts');
    });

    it('filteredPermissions should show all permissions when search query is empty', () => {
      component.onSearchChange('');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(3);
    });

    it('search should be case-insensitive', () => {
      component.onSearchChange('EDIT');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Edit Posts');
    });
  });

  describe('filter dropdown functionality', () => {
    it('onFilterChange should update activeFilter signal', () => {
      component.onFilterChange('forced');

      expect(component['activeFilter']()).toBe('forced');
    });

    it('filteredPermissions should show all permissions when filter is all', () => {
      component.onFilterChange('all');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(3);
    });

    it('filteredPermissions should show only forced permissions when filter is forced', () => {
      component.onFilterChange('forced');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('perm3');
    });

    it('filteredPermissions should show only granted permissions when filter is granted', () => {
      component.onFilterChange('granted');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(2);
      expect(filtered[0].id).toBe('perm1');
      expect(filtered[1].id).toBe('perm3');
    });

    it('filteredPermissions should show only denied permissions when filter is denied', () => {
      component.onFilterChange('denied');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('perm2');
    });
  });

  describe('combined search and filter', () => {
    it('filteredPermissions should apply both search and filter together', () => {
      component.onSearchChange('posts');
      component.onFilterChange('granted');
      fixture.detectChanges();

      const filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('perm1');
    });

    it('clearing search should preserve active filter', () => {
      component.onFilterChange('forced');
      component.onSearchChange('user');
      fixture.detectChanges();

      let filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);

      component.onSearchChange('');
      fixture.detectChanges();

      filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);
      expect(component['activeFilter']()).toBe('forced');
    });

    it('changing filter should preserve search query', () => {
      component.onSearchChange('posts');
      component.onFilterChange('granted');
      fixture.detectChanges();

      let filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);

      component.onFilterChange('denied');
      fixture.detectChanges();

      filtered = component['filteredPermissions']();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('perm2');
      expect(component['searchQuery']()).toBe('posts');
    });
  });

  describe('empty states', () => {
    it('should detect when permissions array is empty', async () => {
      // Create a new test setup with empty permissions
      const emptyPermissionsSignal = signal<DevToolbarPermission[]>([]);
      const emptyServiceMock = {
        permissions: emptyPermissionsSignal,
        setPermission: jest.fn(),
        removePermissionOverride: jest.fn(),
      };

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [DevToolbarPermissionsToolComponent, NoopAnimationsModule],
        providers: [
          {
            provide: DevToolbarInternalPermissionsService,
            useValue: emptyServiceMock,
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(DevToolbarPermissionsToolComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['hasNoPermissions']()).toBe(true);
      expect(component['filteredPermissions']().length).toBe(0);
    });

    it('should detect when search/filter produces no results', () => {
      component.onSearchChange('nonexistent');
      fixture.detectChanges();

      expect(component['hasNoFilteredPermissions']()).toBe(true);
      expect(component['filteredPermissions']().length).toBe(0);
    });

    it('should show filtered results when they exist', () => {
      expect(component['hasNoPermissions']()).toBe(false);
      expect(component['hasNoFilteredPermissions']()).toBe(false);
      expect(component['filteredPermissions']().length).toBe(3);
    });
  });

  describe('getPermissionValue', () => {
    it('should return empty string when permission is not forced', () => {
      const value = component['getPermissionValue'](mockPermissions[0]);
      expect(value).toBe('');
    });

    it('should return granted when permission is forced and granted', () => {
      const value = component['getPermissionValue'](mockPermissions[2]);
      expect(value).toBe('granted');
    });

    it('should return denied when permission is forced and not granted', () => {
      const forcedDenied: DevToolbarPermission = {
        id: 'test',
        name: 'Test',
        isGranted: false,
        isForced: true,
      };
      const value = component['getPermissionValue'](forcedDenied);
      expect(value).toBe('denied');
    });
  });
});
