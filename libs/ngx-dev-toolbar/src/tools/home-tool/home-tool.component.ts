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
import { DevToolsStorageService } from '../../utils/storage.service';
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
            <div class="instruction__control-button">
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

        <div class="settings-container">
          <div class="instruction">
            <div class="instruction__label">
              <span class="instruction__label-text">Reset Settings</span>
              <span class="instruction__label-description">
                Reset all settings to their default values
              </span>
            </div>
            <div class="instruction__control">
              <div class="instruction__control-button">
                <ndt-button
                  variant="icon"
                  icon="trash"
                  ariaLabel="Reset all settings"
                  (click)="onResetSettings()"
                />
              </div>
            </div>
          </div>
          <div class="settings-actions">
            <ndt-clickable-card
              icon="export"
              title="Export Settings"
              subtitle="Export the current settings to share with other devs or use in your tests"
              (click)="onExportSettings()"
            />
            <ndt-clickable-card
              icon="import"
              title="Import Settings"
              subtitle="Import settings to reproduce a scenario"
              (click)="onImportSettings()"
            />
          </div>
        </div>

        <div class="footer-links">
          @for (link of links; track link.url) {
          <ndt-link-button [icon]="link.icon" [url]="link.url">
            {{ link.label }}
          </ndt-link-button>
          }
        </div>
      </section>
    </ndt-toolbar-tool>
  `,
  styleUrls: ['./home-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarHomeToolComponent {
  protected readonly state = inject(DevToolbarStateService);
  private readonly settingsService = inject(SettingsService);
  private readonly storageService = inject(DevToolsStorageService);

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

  readonly links = [
    {
      icon: 'bug',
      url: 'https://github.com/alfredoperez/ngx-dev-toolbar/issues',
      label: 'Bug report',
    },
    {
      icon: 'lightbulb',
      url: 'https://github.com/alfredoperez/ngx-dev-toolbar/discussions',
      label: 'Suggestions',
    },
    {
      icon: 'docs',
      url: 'https://alfredoperez.github.io/ngx-dev-toolbar/',
      label: 'Docs',
    },
    {
      icon: 'star',
      url: 'https://github.com/alfredoperez/ngx-dev-toolbar',
      label: 'Star on GitHub',
    },
    {
      icon: 'discord',
      url: 'https://discord.com/invite/angular',
      label: 'Community',
    },
  ] as const;

  onToggleTheme(): void {
    const newTheme: ThemeType = this.state.isDarkTheme() ? 'light' : 'dark';
    this.settingsService.setSettings({ isDarkMode: newTheme === 'dark' });
    this.state.setTheme(newTheme);
  }

  onExportSettings(): void {
    const settings = this.storageService.getAllSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `ngx-dev-toolbar-settings-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  onImportSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            this.storageService.setAllSettings(settings);
            window.location.reload();
          } catch (error) {
            console.error('Error importing settings:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  onResetSettings(): void {
    this.storageService.clearAllSettings();
    window.location.reload();
  }
}
