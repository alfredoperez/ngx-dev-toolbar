import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ToolbarFeatureFlagsToolComponent } from './feature-flags-tool.component';
import { ToolbarInternalFeatureFlagService } from './feature-flags-internal.service';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarFlag } from './feature-flags.models';

describe('ToolbarFeatureFlagsToolComponent', () => {
  it('should be defined', () => {
    expect(ToolbarFeatureFlagsToolComponent).toBeDefined();
  });

  // NOTE: Full template rendering requires deep dependency mocking
  // (ToolbarToolComponent -> ToolbarToolButtonComponent -> ToolbarStateService.isToolbarVisible).
  // The tests below verify component logic without rendering.
  describe('component logic', () => {
    let component: ToolbarFeatureFlagsToolComponent;

    const mockFlags: ToolbarFlag[] = [
      { id: 'beta', name: 'Beta Feature', description: 'Beta', isEnabled: true, isForced: false },
      { id: 'alpha', name: 'Alpha Feature', description: 'Alpha', isEnabled: false, isForced: false },
      { id: 'gamma', name: 'Gamma Feature', description: 'Gamma', isEnabled: true, isForced: false },
    ];

    let mockStorageService: {
      get: jest.Mock;
      set: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      mockStorageService = {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn(),
        remove: jest.fn(),
      };

      const mockInternalService = {
        flags: signal(mockFlags),
        hasApplyCallback: signal(false),
        applyStates: signal({}),
        setFlag: jest.fn(),
        removeFlagOverride: jest.fn(),
        applyToSource: jest.fn(),
      };

      const mockStateService = {
        theme: signal('light' as 'light' | 'dark'),
        isEnabled: signal(true),
        activeToolId: signal(null),
        position: signal('bottom'),
        isHidden: signal(false),
        isToolbarVisible: signal(true),
      };

      TestBed.configureTestingModule({
        imports: [ToolbarFeatureFlagsToolComponent],
        providers: [
          { provide: ToolbarInternalFeatureFlagService, useValue: mockInternalService },
          { provide: ToolbarStorageService, useValue: mockStorageService },
          { provide: ToolbarStateService, useValue: mockStateService },
        ],
      });

      // Create component instance without rendering template
      component = TestBed.createComponent(ToolbarFeatureFlagsToolComponent).componentInstance;
    });

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('togglePin should add a flag ID to pinnedIds', () => {
      // Act
      component.togglePin('beta');

      // Assert
      expect((component as any).pinnedIds().has('beta')).toBe(true);
    });

    it('togglePin should remove a flag ID that is already pinned', () => {
      // Arrange
      component.togglePin('beta');

      // Act
      component.togglePin('beta');

      // Assert
      expect((component as any).pinnedIds().has('beta')).toBe(false);
    });

    it('flatFlags should sort pinned items first (no-groups backward compat)', () => {
      // Arrange: pin 'gamma' so it should appear before 'alpha' and 'beta'
      component.togglePin('gamma');

      // Act
      const result = (component as any).flatFlags();

      // Assert: gamma first (pinned), then alpha, beta (alphabetical)
      expect(result[0].id).toBe('gamma');
      expect(result[1].id).toBe('alpha');
      expect(result[2].id).toBe('beta');
    });

    it('should load pinnedIds from saved ToolViewState', () => {
      // Arrange: set up storage mock to return saved state with pinned IDs
      mockStorageService.get.mockReturnValue({
        searchQuery: '',
        filter: 'all',
        sortOrder: 'asc',
        pinnedIds: ['beta', 'gamma'],
      });

      // Act: create a new component that will load from storage
      const freshComponent = TestBed.createComponent(ToolbarFeatureFlagsToolComponent).componentInstance;

      // Assert: pinnedIds were loaded from storage
      expect((freshComponent as any).pinnedIds().has('beta')).toBe(true);
      expect((freshComponent as any).pinnedIds().has('gamma')).toBe(true);
      expect((freshComponent as any).pinnedIds().has('alpha')).toBe(false);
    });
  });
});
