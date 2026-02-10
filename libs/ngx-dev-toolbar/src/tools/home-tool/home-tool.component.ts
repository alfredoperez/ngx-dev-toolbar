import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolbarButtonComponent } from '../../components/button/button.component';
import { ToolbarClickableCardComponent } from '../../components/clickable-card/clickable-card.component';
import { ToolbarLinkButtonComponent } from '../../components/link-button/link-button.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarStorageService } from '../../utils/storage.service';
import { SettingsService } from './settings.service';

type ThemeType = 'light' | 'dark';

@Component({
  selector: 'ndt-home-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    FormsModule,
    ToolbarButtonComponent,
    ToolbarClickableCardComponent,
    ToolbarLinkButtonComponent,
  ],
  template: `
    <ndt-toolbar-tool [options]="options" title="Home" icon="angular">
      <section class="settings">
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
export class ToolbarHomeToolComponent {
  protected readonly state = inject(ToolbarStateService);
  private readonly settingsService = inject(SettingsService);
  private readonly storageService = inject(ToolbarStorageService);

  readonly badge = input<string | number>();
  readonly title = `Angular Toolbar`;
  readonly options: ToolbarWindowOptions = {
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
