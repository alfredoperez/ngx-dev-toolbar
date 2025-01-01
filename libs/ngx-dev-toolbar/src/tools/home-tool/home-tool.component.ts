import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarButtonComponent } from '../../components/button/button.component';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { WindowConfig } from '../../components/window/window.models';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { SettingsService } from './settings.service';

type ThemeType = 'light' | 'dark';

@Component({
  selector: 'ndt-home-tool',
  standalone: true,
  imports: [DevToolbarToolComponent, FormsModule, DevToolbarButtonComponent],
  template: `
    <ndt-toolbar-tool [windowConfig]="windowConfig" title="Home" icon="angular">
      <section class="settings">
        <div class="instruction">
          <div class="instruction__label">
            <span class="instruction__label-text">Theme</span>
            <span class="instruction__label-description">
              Switch between light and dark mode
            </span>
          </div>
          <div class="instruction__control">
            <div class="theme">
              <ndt-button
                [isActive]="true"
                (click)="onToggleTheme()"
                variant="icon"
                [ariaLabel]="
                  state.isDarkTheme()
                    ? 'Switch to light theme'
                    : 'Switch to dark theme'
                "
                [icon]="state.isDarkTheme() ? 'sun' : 'moon'"
              />
            </div>
          </div>
        </div>
      </section>
    </ndt-toolbar-tool>
  `,
  styleUrls: ['./home-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarHomeToolComponent {
  state = inject(DevToolbarStateService);
  settingsService = inject(SettingsService);

  readonly badge = input<string | number>();
  readonly title = `Angular Dev Toolbar`;
  readonly windowConfig: WindowConfig = {
    title: this.title,
    isClosable: true,
    id: 'ndt-home',
    size: 'medium',
    description: '',
    isBeta: true,
  };

  onToggleTheme(): void {
    const newTheme: ThemeType = this.state.isDarkTheme() ? 'light' : 'dark';
    this.settingsService.setSettings({ isDarkMode: newTheme === 'dark' });
    this.state.setTheme(newTheme);
  }
}
