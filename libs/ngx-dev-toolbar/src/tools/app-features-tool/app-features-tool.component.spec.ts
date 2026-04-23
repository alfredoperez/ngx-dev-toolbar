import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { ToolbarAppFeaturesToolComponent } from './app-features-tool.component';
import { ToolbarInternalAppFeaturesService } from './app-features-internal.service';
import { ToolbarStorageService } from '../../utils/storage.service';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarAppFeature } from './app-features.models';

describe('ToolbarAppFeaturesToolComponent', () => {
  it('should be defined', () => {
    expect(ToolbarAppFeaturesToolComponent).toBeDefined();
  });

  describe('filter dropdown functionality', () => {
    let component: ToolbarAppFeaturesToolComponent;

    const mockFeatures: ToolbarAppFeature[] = [
      { id: 'f1', name: 'F1', description: '', isEnabled: true, isForced: false },
    ];

    beforeEach(() => {
      const mockInternalService = {
        features: signal(mockFeatures),
        hasApplyCallback: computed(() => false),
        applyStates: signal({}),
        setFeature: jest.fn(),
        removeFeatureOverride: jest.fn(),
        applyToSource: jest.fn(),
      };

      const mockStorageService = {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn(),
        remove: jest.fn(),
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
        imports: [ToolbarAppFeaturesToolComponent],
        providers: [
          { provide: ToolbarInternalAppFeaturesService, useValue: mockInternalService },
          { provide: ToolbarStorageService, useValue: mockStorageService },
          { provide: ToolbarStateService, useValue: mockStateService },
        ],
      });

      component = TestBed.createComponent(ToolbarAppFeaturesToolComponent).componentInstance;
    });

    it('clicking the same filter value twice keeps the filter active (regression for the invisible-reset bug)', () => {
      component.onFilterChange('forced');
      component.onFilterChange('forced');

      expect((component as any).activeFilter()).toBe('forced');
    });
  });
});
