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
  inject,
  isDevMode,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { filter, throttleTime } from 'rxjs/operators';
import { DevToolbarIconComponent } from './components/icons/icon.component';
import { DevToolbarToolButtonComponent } from './components/tool-button/tool-button.component';
import { DevToolbarStateService } from './dev-toolbar-state.service';
import { DevToolbarFeatureFlagsToolComponent } from './tools/feature-flags-tool/feature-flags-tool.component';
import { DevToolbarSettingsToolComponent } from './tools/settings-tool/settings-tool.component';
import { SettingsService } from './tools/settings-tool/settings.service';

@Component({
  standalone: true,
  selector: 'ndt-toolbar',
  styleUrls: ['./dev-toolbar.component.scss'],
  imports: [
    DevToolbarToolButtonComponent,
    DevToolbarFeatureFlagsToolComponent,
    DevToolbarSettingsToolComponent,
    DevToolbarIconComponent,
  ],

  template: `
    @if (isDevMode) {
    <div
      aria-label="Developer tools"
      role="toolbar"
      class="dev-toolbar"
      [@toolbarState]="state.isVisible() ? 'visible' : 'hidden'"
      [attr.data-theme]="state.theme()"
      [class.dev-toolbar--active]="state.isVisible()"
      (mouseenter)="onMouseEnter()"
    >
      <ndt-tool-button title="Home" toolId="ndt-home">
        <ndt-icon name="angular" />
      </ndt-tool-button>
      <ndt-feature-flags-tool />
      <ndt-settings-tool />
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
export class DevToolbarComponent implements OnInit {
  state = inject(DevToolbarStateService);
  destroyRef = inject(DestroyRef);
  settingsService = inject(SettingsService);

  isDevMode = isDevMode();

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
