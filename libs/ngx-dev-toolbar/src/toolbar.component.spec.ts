import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { ToolbarStateService } from './toolbar-state.service';
import { ToolbarStorageService } from './utils/storage.service';
import { TOOLBAR_CUSTOM_TOOLS } from './tokens';
import { SettingsService } from './tools/home-tool/settings.service';

@Component({
  standalone: true,
  selector: 'ndt-mock-custom-tool',
  template: '<div class="mock-custom-tool">Custom Tool Rendered</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockCustomToolComponent {}

@Component({
  standalone: true,
  selector: 'ndt-mock-custom-tool-b',
  template: '<div class="mock-custom-tool-b">Second Tool Rendered</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockCustomToolBComponent {}

function createMockStateService() {
  return {
    theme: signal('light' as 'light' | 'dark'),
    isEnabled: signal(true),
    activeToolId: signal<string | null>(null),
    position: signal('bottom' as const),
    isHidden: signal(false),
    isVisible: signal(true),
    isCompletelyHidden: signal(false),
    hasActiveTool: signal(false),
    delay: signal(3000),
    config: signal({}),
    setConfig: jest.fn(),
    setVisibility: jest.fn(),
    setTheme: jest.fn(),
    toggleCompletelyHidden: jest.fn(),
  };
}

function createMockStorageService() {
  return {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockSettingsService() {
  return {
    loadSettings: jest.fn(),
  };
}

describe('ToolbarComponent — custom tools', () => {
  let fixture: ComponentFixture<ToolbarComponent>;

  function setup(customTools: any[] = []) {
    TestBed.configureTestingModule({
      imports: [ToolbarComponent],
      providers: [
        { provide: TOOLBAR_CUSTOM_TOOLS, useValue: customTools },
        { provide: ToolbarStateService, useValue: createMockStateService() },
        { provide: ToolbarStorageService, useValue: createMockStorageService() },
        { provide: SettingsService, useValue: createMockSettingsService() },
      ],
    });

    fixture = TestBed.createComponent(ToolbarComponent);
    fixture.componentRef.setInput('config', {});
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
  }

  it('should render a single custom tool component', fakeAsync(() => {
    setup([MockCustomToolComponent]);

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const customTool = shadowRoot?.querySelector('ndt-mock-custom-tool');
    expect(customTool).toBeTruthy();
    expect(customTool?.textContent).toContain('Custom Tool Rendered');
  }));

  it('should render multiple custom tool components', fakeAsync(() => {
    setup([MockCustomToolComponent, MockCustomToolBComponent]);

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const toolA = shadowRoot?.querySelector('ndt-mock-custom-tool');
    const toolB = shadowRoot?.querySelector('ndt-mock-custom-tool-b');
    expect(toolA).toBeTruthy();
    expect(toolB).toBeTruthy();
  }));

  it('should render no custom tools when token is empty', fakeAsync(() => {
    setup([]);

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const customTool = shadowRoot?.querySelector('ndt-mock-custom-tool');
    expect(customTool).toBeNull();
  }));

  it('should render no custom tools when token is not provided', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToolbarComponent],
      providers: [
        { provide: ToolbarStateService, useValue: createMockStateService() },
        { provide: ToolbarStorageService, useValue: createMockStorageService() },
        { provide: SettingsService, useValue: createMockSettingsService() },
      ],
    });

    fixture = TestBed.createComponent(ToolbarComponent);
    fixture.componentRef.setInput('config', {});
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const customTool = shadowRoot?.querySelector('ndt-mock-custom-tool');
    expect(customTool).toBeNull();
  }));
});
