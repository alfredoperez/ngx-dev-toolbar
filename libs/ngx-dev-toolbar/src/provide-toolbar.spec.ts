import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideToolbar } from './provide-toolbar';
import { TOOLBAR_CONFIG, TOOLBAR_CUSTOM_TOOLS } from './tokens';

@Component({ standalone: true, selector: 'ndt-fake-tool', template: '' })
class FakeToolAComponent {}

@Component({ standalone: true, selector: 'ndt-fake-tool-b', template: '' })
class FakeToolBComponent {}

describe('provideToolbar', () => {
  it('should provide TOOLBAR_CUSTOM_TOOLS with registered components', () => {
    TestBed.configureTestingModule({
      providers: [
        provideToolbar({
          customTools: [FakeToolAComponent, FakeToolBComponent],
        }),
      ],
    });

    const customTools = TestBed.inject(TOOLBAR_CUSTOM_TOOLS);
    expect(customTools).toEqual([FakeToolAComponent, FakeToolBComponent]);
  });

  it('should provide empty array when no custom tools specified', () => {
    TestBed.configureTestingModule({
      providers: [provideToolbar({})],
    });

    const customTools = TestBed.inject(TOOLBAR_CUSTOM_TOOLS);
    expect(customTools).toEqual([]);
  });

  it('should provide empty array when config is undefined', () => {
    TestBed.configureTestingModule({
      providers: [provideToolbar()],
    });

    const customTools = TestBed.inject(TOOLBAR_CUSTOM_TOOLS);
    expect(customTools).toEqual([]);
  });

  it('should not include customTools in TOOLBAR_CONFIG', () => {
    TestBed.configureTestingModule({
      providers: [
        provideToolbar({
          showI18nTool: true,
          customTools: [FakeToolAComponent],
        }),
      ],
    });

    const config = TestBed.inject(TOOLBAR_CONFIG);
    expect(config.showI18nTool).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((config as Record<string, any>)['customTools']).toBeUndefined();
  });

  it('should preserve all config flags when customTools is provided', () => {
    TestBed.configureTestingModule({
      providers: [
        provideToolbar({
          enabled: true,
          showI18nTool: true,
          showFeatureFlagsTool: false,
          showAppFeaturesTool: true,
          showPermissionsTool: false,
          showPresetsTool: true,
          customTools: [FakeToolAComponent],
        }),
      ],
    });

    const config = TestBed.inject(TOOLBAR_CONFIG);
    expect(config).toEqual({
      enabled: true,
      showI18nTool: true,
      showFeatureFlagsTool: false,
      showAppFeaturesTool: true,
      showPermissionsTool: false,
      showPresetsTool: true,
    });
  });
});
