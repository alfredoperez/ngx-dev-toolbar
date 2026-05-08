import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolbarButtonComponent } from '../../components/button/button.component';
import { ToolbarConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ToolbarLinkButtonComponent } from '../../components/link-button/link-button.component';
import {
  SelectOption,
  ToolbarSelectComponent,
} from '../../components/select/select.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { ToolbarPosition } from '../../models/toolbar-position.model';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarStorageService } from '../../utils/storage.service';
import { SettingsService } from './settings.service';

@Component({
  selector: 'ndt-home-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    FormsModule,
    ToolbarButtonComponent,
    ToolbarConfirmDialogComponent,
    ToolbarLinkButtonComponent,
    ToolbarSelectComponent,
  ],
  template: `
    <ndt-toolbar-tool [options]="options" toolTitle="Home" icon="angular">
      <section class="settings">
        <div class="settings-container">
          <div class="instruction">
            <div class="instruction__label">
              <span class="instruction__label-text">Toolbar Position</span>
              <span class="instruction__label-description">
                Choose where the toolbar appears on screen
              </span>
            </div>
            <div class="instruction__control">
              <ndt-select
                [value]="state.position()"
                [options]="positionOptions"
                ariaLabel="Toolbar position"
                size="small"
                (valueChange)="onPositionChange($any($event))"
              />
            </div>
          </div>

          <div class="instruction instruction--first-data">
            <div class="instruction__label">
              <span class="instruction__label-text">Export Settings</span>
              <span class="instruction__label-description">
                Download the current setup to share or reproduce in tests
              </span>
            </div>
            <div class="instruction__control">
              <ndt-button
                variant="icon"
                icon="export"
                ariaLabel="Export settings"
                (click)="onExportSettings()"
              />
            </div>
          </div>

          <div class="instruction">
            <div class="instruction__label">
              <span class="instruction__label-text">Import Settings</span>
              <span class="instruction__label-description">
                Load a settings file to reproduce a scenario
              </span>
            </div>
            <div class="instruction__control">
              <ndt-button
                variant="icon"
                icon="import"
                ariaLabel="Import settings"
                (click)="onImportSettings()"
              />
            </div>
          </div>

          <div class="instruction instruction--danger-zone">
            <div class="instruction__label">
              <span class="instruction__label-text">Reset Settings</span>
              <span class="instruction__label-description">
                Clear all forced values, presets, and stored preferences
              </span>
            </div>
            <div class="instruction__control">
              <ndt-button
                variant="icon"
                icon="trash"
                ariaLabel="Reset all settings"
                (click)="onResetSettings()"
              />
            </div>
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

    <ndt-confirm-dialog
      #resetDialog
      title="Reset all settings?"
      message="This will clear all forced values, presets, and stored preferences for this session. The page will reload. This cannot be undone."
      confirmLabel="Reset settings"
      cancelLabel="Cancel"
      [danger]="true"
      (confirmed)="confirmReset()"
    />
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
  };

  readonly positionOptions: SelectOption[] = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'sidebar-left', label: '◧ Sidebar L' },
    { value: 'sidebar-right', label: '◨ Sidebar R' },
  ];

  readonly links = [
    {
      icon: 'docs',
      url: 'https://alfredoperez.github.io/ngx-dev-toolbar/',
      label: 'Docs',
    },
    {
      icon: 'lightbulb',
      url: 'https://github.com/alfredoperez/ngx-dev-toolbar/issues/new/choose',
      label: 'Feedback',
    },
  ] as const;

  onPositionChange(position: ToolbarPosition): void {
    this.state.setPosition(position);
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
    this.resetDialog()?.show();
  }

  protected confirmReset(): void {
    this.storageService.clearAllSettings();
    window.location.reload();
  }

  private readonly resetDialog = viewChild<ToolbarConfirmDialogComponent>('resetDialog');
}
