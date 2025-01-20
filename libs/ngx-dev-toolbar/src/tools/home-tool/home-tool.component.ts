import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarButtonComponent } from '../../components/button/button.component';
import { DevToolbarClickableCardComponent } from '../../components/clickable-card/clickable-card.component';
import { DevToolbarLinkButtonComponent } from '../../components/link-button/link-button.component';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { DevToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { SettingsService } from './settings.service';

type ThemeType = 'light' | 'dark';

@Component({
  selector: 'ndt-home-tool',
  standalone: true,
  imports: [
    DevToolbarToolComponent,
    FormsModule,
    DevToolbarButtonComponent,
    DevToolbarClickableCardComponent,
    DevToolbarLinkButtonComponent,
  ],
  template: `
    <ndt-toolbar-tool [options]="options" title="Home" icon="angular">
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

        <div class="settings-actions">
          <ndt-clickable-card
            icon="export"
            title="Export Settings"
            subtitle="Export the current settings to share with other devs or use in your tests"
            (clicked)="onExportSettings()"
          />
          <ndt-clickable-card
            icon="import"
            title="Import Settings"
            subtitle="Import settings to reproduce a scenario"
            (clicked)="onImportSettings()"
          />
        </div>

        <div class="footer-links">
          <ndt-link-button
            icon="bug"
            url="https://github.com/alfredoperez/ngx-dev-toolbar/issues"
          >
            Bug report
          </ndt-link-button>
          <ndt-link-button
            icon="lightbulb"
            url="https://github.com/alfredoperez/ngx-dev-toolbar/discussions"
          >
            Suggestions
          </ndt-link-button>
          <ndt-link-button icon="docs" url="https://ngx-dev-toolbar.dev">
            Docs
          </ndt-link-button>
          <ndt-link-button
            icon="star"
            url="https://github.com/alfredoperez/ngx-dev-toolbar"
          >
            Star on GitHub
          </ndt-link-button>
          <ndt-link-button
            icon="discord"
            url="https://discord.gg/ngx-dev-toolbar"
          >
            Community
          </ndt-link-button>
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
  readonly options: DevToolbarWindowOptions = {
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

  onExportSettings(): void {
    // TODO: Implement export settings functionality
  }

  onImportSettings(): void {
    // TODO: Implement import settings functionality
  }
}
