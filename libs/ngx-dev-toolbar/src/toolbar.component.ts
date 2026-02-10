import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  effect,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { filter, throttleTime } from 'rxjs/operators';
import { ToolbarStateService } from './toolbar-state.service';
import { ToolbarConfig } from './models/toolbar-config.interface';
import { ToolbarAppFeaturesToolComponent } from './tools/app-features-tool/app-features-tool.component';
import { ToolbarFeatureFlagsToolComponent } from './tools/feature-flags-tool/feature-flags-tool.component';
import { ToolbarHomeToolComponent } from './tools/home-tool/home-tool.component';
import { SettingsService } from './tools/home-tool/settings.service';
import { ToolbarLanguageToolComponent } from './tools/language-tool/language-tool.component';
import { ToolbarPermissionsToolComponent } from './tools/permissions-tool/permissions-tool.component';
import { ToolbarPresetsToolComponent } from './tools/presets-tool/presets-tool.component';

@Component({
  standalone: true,
  selector: 'ndt-toolbar',
  styleUrls: ['./toolbar.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [
    ToolbarHomeToolComponent,
    ToolbarLanguageToolComponent,
    ToolbarFeatureFlagsToolComponent,
    ToolbarAppFeaturesToolComponent,
    ToolbarPermissionsToolComponent,
    ToolbarPresetsToolComponent,
  ],
  template: `
    @if (config().enabled ?? true) {
      <div
        aria-label="Developer tools"
        role="toolbar"
        class="ndt-toolbar"
        [@toolbarState]="state.isVisible() ? 'visible' : 'hidden'"
        [attr.data-theme]="state.theme()"
        [class.ndt-toolbar--active]="state.isVisible()"
        (mouseenter)="onMouseEnter()"
      >
        <ndt-home-tool />
        <ng-content />
        @if (config().showLanguageTool ?? false) {
          <ndt-language-tool />
        }
        @if (config().showPresetsTool ?? false) {
          <ndt-presets-tool />
        }
        @if (config().showAppFeaturesTool ?? false) {
          <ndt-app-features-tool />
        }
        @if (config().showPermissionsTool ?? false) {
          <ndt-permissions-tool />
        }
        @if (config().showFeatureFlagsTool ?? false) {
          <ndt-feature-flags-tool />
        }
      </div>
    }
  `,
  animations: [
    trigger('toolbarState', [
      state(
        'hidden',
        style({
          transform: 'translate(-50%, calc(100% + -1.2rem))',
        })
      ),
      state(
        'visible',
        style({
          transform: 'translate(-50%, -1rem)',
        })
      ),
      transition('hidden <=> visible', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
  ],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);
  state = inject(ToolbarStateService);
  destroyRef = inject(DestroyRef);
  settingsService = inject(SettingsService);

  config = input<ToolbarConfig>({});
  private globalStyleElement?: HTMLStyleElement;

  private keyboardShortcut = fromEvent<KeyboardEvent>(window, 'keydown')
    .pipe(
      filter((event) => event.ctrlKey && event.shiftKey && event.key === 'D'),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(() => this.toggleDevTools());

  private mouseLeave = fromEvent<MouseEvent>(document, 'mouseleave')
    .pipe(throttleTime(3000), takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.onMouseLeave());

  constructor() {
    // Update state service when config changes
    effect(() => {
      this.state.setConfig(this.config());
    });
  }

  ngOnInit(): void {
    this.injectGlobalStyles();
    // Always use light theme
    this.state.setTheme('light');
  }

  ngOnDestroy(): void {
    this.globalStyleElement?.remove();
  }

  onMouseEnter(): void {
    this.state.setVisibility(true);
  }

  onMouseLeave(): void {
    setTimeout(() => this.state.setVisibility(false), this.state.delay());
  }

  private toggleDevTools(): void {
    this.state.setVisibility(!this.state.isVisible());
  }

  /**
   * Injects global theme styles into the document head to make CSS variables
   * available to CDK overlays and other elements rendered outside Shadow DOM.
   * Uses light theme only.
   */
  private injectGlobalStyles(): void {
    // Check if styles are already injected (e.g., by another toolbar instance)
    if (this.document.getElementById('ndt-global-theme')) {
      return;
    }

    this.globalStyleElement = this.document.createElement('style');
    this.globalStyleElement.id = 'ndt-global-theme';
    this.globalStyleElement.textContent = `
      /* Global Light Theme for ngx-dev-toolbar overlays */
      :where(ndt-toolbar),
      .ndt-overlay-panel,
      .cdk-overlay-container {
        --ndt-border-radius-small: 4px;
        --ndt-border-radius-medium: 8px;
        --ndt-border-radius-large: 12px;
        --ndt-transition-default: all 0.2s ease-out;
        --ndt-transition-smooth: all 0.2s ease-in-out;
        --ndt-spacing-xs: 4px;
        --ndt-spacing-sm: 6px;
        --ndt-spacing-md: 12px;
        --ndt-spacing-lg: 16px;
        --ndt-window-padding: 16px;
        --ndt-font-size-xxs: 0.65rem;
        --ndt-font-size-xs: 0.75rem;
        --ndt-font-size-sm: 0.875rem;
        --ndt-font-size-md: 1rem;
        --ndt-font-size-lg: 1.25rem;
        --ndt-font-size-xl: 2rem;
        --ndt-primary: #df30d4;
        --ndt-primary-rgb: 223, 48, 212;
        --ndt-text-on-primary: rgb(255, 255, 255);
        --ndt-bg-primary: rgb(255, 255, 255);
        --ndt-bg-gradient: linear-gradient(180deg, rgb(243, 244, 246) 0%, rgba(243, 244, 246, 0.88) 100%);
        --ndt-text-primary: rgb(17, 24, 39);
        --ndt-text-secondary: rgb(55, 65, 81);
        --ndt-text-muted: rgb(107, 114, 128);
        --ndt-border-primary: #e5e7eb;
        --ndt-border-subtle: rgba(17, 24, 39, 0.1);
        --ndt-hover-bg: rgba(17, 24, 39, 0.05);
        --ndt-hover-danger: rgb(239, 68, 68);
        --ndt-shadow-toolbar: 0 2px 8px rgba(156, 163, 175, 0.2);
        --ndt-shadow-tooltip: 0 0 0 1px rgba(17, 24, 39, 0.05), 0 4px 8px rgba(107, 114, 128, 0.15), 0 2px 4px rgba(107, 114, 128, 0.1);
        --ndt-shadow-window: 0px 0px 0px 0px rgba(156, 163, 175, 0.1), 0px 1px 2px 0px rgba(156, 163, 175, 0.12), 0px 4px 4px 0px rgba(156, 163, 175, 0.1), 0px 10px 6px 0px rgba(156, 163, 175, 0.08), 0px 17px 7px 0px rgba(156, 163, 175, 0.05), 0px 26px 7px 0px rgba(156, 163, 175, 0.02);
        --ndt-background-secondary: var(--ndt-bg-primary);
        --ndt-background-hover: var(--ndt-hover-bg);
        --ndt-border-color: var(--ndt-border-primary);
        --ndt-note-background: rgb(219, 234, 254);
        --ndt-note-border: rgba(37, 99, 235, 0.2);
        --ndt-warning-background: rgb(254, 249, 195);
        --ndt-warning-border: rgba(202, 138, 4, 0.2);
        --ndt-error-background: rgb(254, 226, 226);
        --ndt-error-border: rgba(220, 38, 38, 0.2);
      }
      .ndt-overlay-panel {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
        box-sizing: border-box;
        isolation: isolate;
        z-index: 999999999;
      }
      .ndt-overlay-panel *, .ndt-overlay-panel *::before, .ndt-overlay-panel *::after {
        box-sizing: border-box;
      }
      .cdk-overlay-backdrop.ndt-overlay-backdrop {
        background: transparent;
      }
    `;

    this.document.head.appendChild(this.globalStyleElement);
  }
}
