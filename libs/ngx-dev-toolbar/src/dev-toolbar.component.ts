import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  DestroyRef,
  OnInit,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { filter, throttleTime } from 'rxjs/operators';
import { DevToolbarStateService } from './dev-toolbar-state.service';
import { DevToolbarConfig } from './models/dev-toolbar-config.interface';
import { DevToolbarAppFeaturesToolComponent } from './tools/app-features-tool/app-features-tool.component';
import { DevToolbarFeatureFlagsToolComponent } from './tools/feature-flags-tool/feature-flags-tool.component';
import { DevToolbarHomeToolComponent } from './tools/home-tool/home-tool.component';
import { SettingsService } from './tools/home-tool/settings.service';
import { DevToolbarLanguageToolComponent } from './tools/language-tool/language-tool.component';
import { DevToolbarPermissionsToolComponent } from './tools/permissions-tool/permissions-tool.component';
import { DevToolbarPresetsToolComponent } from './tools/presets-tool/presets-tool.component';

@Component({
  standalone: true,
  selector: 'ndt-toolbar',
  styleUrls: ['./dev-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [
    DevToolbarHomeToolComponent,
    DevToolbarLanguageToolComponent,
    DevToolbarFeatureFlagsToolComponent,
    DevToolbarAppFeaturesToolComponent,
    DevToolbarPermissionsToolComponent,
    DevToolbarPresetsToolComponent,
  ],
  template: `
    <div
      aria-label="Developer tools"
      role="toolbar"
      class="dev-toolbar"
      [@toolbarState]="state.isVisible() ? 'visible' : 'hidden'"
      [attr.data-theme]="state.theme()"
      [class.dev-toolbar--active]="state.isVisible()"
      (mouseenter)="onMouseEnter()"
    >
      <ndt-home-tool />
      @if (config().showLanguageTool ?? true) {
        <ndt-language-tool />
      }
      @if (config().showFeatureFlagsTool ?? true) {
        <ndt-feature-flags-tool />
      }
      @if (config().showAppFeaturesTool ?? true) {
        <ndt-app-features-tool />
      }
      @if (config().showPermissionsTool ?? true) {
        <ndt-permissions-tool />
      }
      @if (config().showPresetsTool ?? true) {
        <ndt-presets-tool />
      }
      <ng-content />
    </div>
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
export class DevToolbarComponent implements OnInit {
  state = inject(DevToolbarStateService);
  destroyRef = inject(DestroyRef);
  settingsService = inject(SettingsService);

  config = input<DevToolbarConfig>({});

  private keyboardShortcut = fromEvent<KeyboardEvent>(window, 'keydown')
    .pipe(
      filter((event) => event.ctrlKey && event.shiftKey && event.key === 'D'),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(() => this.toggleDevTools());

  private mouseLeave = fromEvent<MouseEvent>(document, 'mouseleave')
    .pipe(throttleTime(3000), takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.onMouseLeave());

  ngOnInit(): void {
    const settings = this.settingsService.getSettings();
    this.state.setTheme(settings.isDarkMode ? 'dark' : 'light');
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
}
