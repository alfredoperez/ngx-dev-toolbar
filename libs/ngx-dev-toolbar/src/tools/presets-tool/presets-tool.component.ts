import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarButtonComponent } from '../../components/button/button.component';
import { DevToolbarIconComponent } from '../../components/icons/icon.component';
import { DevToolbarInputComponent } from '../../components/input/input.component';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { DevToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { DevToolbarWindowComponent } from '../../components/window/window.component';
import { DevToolbarInternalPresetsService } from './presets-internal.service';
import { DevToolbarInternalFeatureFlagService } from '../feature-flags-tool/feature-flags-internal.service';
import { DevToolbarInternalPermissionsService } from '../permissions-tool/permissions-internal.service';
import { DevToolbarInternalAppFeaturesService } from '../app-features-tool/app-features-internal.service';
import { DevToolbarInternalLanguageService } from '../language-tool/language-internal.service';

@Component({
  selector: 'ndt-presets-tool',
  standalone: true,
  imports: [
    FormsModule,
    DevToolbarToolComponent,
    DevToolbarInputComponent,
    DevToolbarButtonComponent,
    DevToolbarIconComponent,
    DevToolbarWindowComponent,
  ],
  template: `
    <ndt-toolbar-tool [options]="options" title="Presets" icon="layout">
      <div class="container">
        <!-- Mode Toggle -->
        @if (!hasNoPresets() || viewMode() === 'create') {
        <div class="header">
          @if (viewMode() === 'list') {
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search presets..."
            [ariaLabel]="'Search presets'"
          />
          <ndt-button
            (click)="onSwitchToCreateMode()"
            [ariaLabel]="'Create new preset'"
          >
            New Preset
          </ndt-button>
          } @else {
          <ndt-button
            (click)="onSwitchToListMode()"
            [ariaLabel]="'Back to list'"
          >
            ← Back to List
          </ndt-button>
          }
        </div>
        }

        <!-- Create Form -->
        @if (viewMode() === 'create') {
        <form (submit)="onSavePreset($event)" class="preset-form">
          <ndt-input
            label="Preset Name"
            [value]="presetName()"
            (valueChange)="presetName.set($event)"
            placeholder="e.g., Admin User - Full Access"
            [ariaLabel]="'Preset name'"
          />
          <ndt-input
            label="Description (optional)"
            [value]="presetDescription()"
            (valueChange)="presetDescription.set($event)"
            placeholder="Brief description of this preset"
            [ariaLabel]="'Preset description'"
          />

          <!-- Summary of what will be saved -->
          <div class="preset-summary">
            <h4>Configuration to Save:</h4>
            <ul>
              <li>Feature Flags: {{ getCurrentFlagsCount() }} forced</li>
              <li>Permissions: {{ getCurrentPermissionsCount() }} forced</li>
              <li>App Features: {{ getCurrentAppFeaturesCount() }} forced</li>
              <li>Language: {{ getCurrentLanguage() }}</li>
            </ul>
          </div>

          <div class="form-actions">
            <ndt-button type="submit">Save Preset</ndt-button>
          </div>
        </form>
        }

        <!-- Empty State -->
        @if (viewMode() === 'list' && hasNoPresets()) {
        <div class="empty">
          <p>No presets saved yet</p>
          <p class="hint">
            Save the current toolbar configuration as a preset for quick access
          </p>
          <ndt-button (click)="onSwitchToCreateMode()">
            Create Your First Preset
          </ndt-button>
        </div>
        } @else if (viewMode() === 'list' && hasNoFilteredPresets()) {
        <div class="empty">
          <p>No presets match your search</p>
        </div>
        } @else if (viewMode() === 'list') {
        <!-- Preset List -->
        <div class="preset-list">
          @for (preset of filteredPresets(); track preset.id) {
          <div class="preset-card">
            <div class="preset-card__header">
              <h3>{{ preset.name }}</h3>
              <div class="preset-card__actions">
                <button
                  class="icon-button"
                  (click)="onApplyPreset(preset.id)"
                  [attr.aria-label]="'Apply preset ' + preset.name"
                  title="Apply preset"
                >
                  <ndt-icon name="refresh" />
                </button>
                <button
                  class="icon-button"
                  (click)="onUpdatePreset(preset.id)"
                  [attr.aria-label]="'Update preset ' + preset.name"
                  title="Update with current state"
                >
                  <ndt-icon name="gear" />
                </button>
                <button
                  class="icon-button"
                  (click)="onExportPreset(preset.id)"
                  [attr.aria-label]="'Export preset ' + preset.name"
                  title="Export as JSON"
                >
                  <ndt-icon name="export" />
                </button>
                <button
                  class="icon-button"
                  (click)="onDeletePreset(preset.id)"
                  [attr.aria-label]="'Delete preset ' + preset.name"
                  title="Delete preset"
                >
                  <ndt-icon name="trash" />
                </button>
              </div>
            </div>
            @if (preset.description) {
            <p class="preset-card__description">{{ preset.description }}</p>
            }
            <div class="preset-card__meta">
              <span>Updated: {{ formatDate(preset.updatedAt) }}</span>
            </div>
            <!-- Preview of preset config -->
            <div class="preset-card__preview">
              @if (preset.config.featureFlags.enabled.length > 0 ||
              preset.config.featureFlags.disabled.length > 0) {
              <span class="badge">
                {{
                  preset.config.featureFlags.enabled.length +
                    preset.config.featureFlags.disabled.length
                }}
                flags
              </span>
              } @if (preset.config.permissions.granted.length > 0 ||
              preset.config.permissions.denied.length > 0) {
              <span class="badge">
                {{
                  preset.config.permissions.granted.length +
                    preset.config.permissions.denied.length
                }}
                perms
              </span>
              } @if (preset.config.appFeatures.enabled.length > 0 ||
              preset.config.appFeatures.disabled.length > 0) {
              <span class="badge">
                {{
                  preset.config.appFeatures.enabled.length +
                    preset.config.appFeatures.disabled.length
                }}
                features
              </span>
              } @if (preset.config.language) {
              <span class="badge">{{ preset.config.language }}</span>
              }
            </div>
          </div>
          }
        </div>
        }
      </div>
    </ndt-toolbar-tool>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .header {
        flex-shrink: 0;
        display: flex;
        gap: var(--ndt-spacing-sm);
        margin-bottom: var(--ndt-spacing-md);

        ndt-input {
          flex: 1;
        }

        ndt-button {
          flex-shrink: 0;
        }
      }

      .empty {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-md);
        flex: 1;
        min-height: 0;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--ndt-border-subtle);
        border-radius: var(--ndt-border-radius-medium);
        padding: var(--ndt-spacing-md);
        background: transparent;
        color: var(--ndt-text-muted);
        text-align: center;

        p {
          margin: 0;
        }

        .hint {
          font-size: var(--ndt-font-size-xs);
        }
      }

      .preset-list {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-md);
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-right: var(--ndt-spacing-sm);

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: var(--ndt-background-secondary);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ndt-border-primary);
          border-radius: 4px;

          &:hover {
            background: var(--ndt-hover-bg);
          }
        }

        scrollbar-width: thin;
        scrollbar-color: var(--ndt-border-primary)
          var(--ndt-background-secondary);
      }

      .preset-card {
        background: var(--ndt-background-secondary);
        padding: var(--ndt-spacing-md);
        border-radius: var(--ndt-border-radius-medium);
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-sm);
      }

      .preset-card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--ndt-spacing-sm);

        h3 {
          margin: 0;
          font-size: var(--ndt-font-size-md);
          color: var(--ndt-text-primary);
          flex: 1;
        }
      }

      .preset-card__actions {
        display: flex;
        gap: var(--ndt-spacing-xs);
      }

      .icon-button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: var(--ndt-spacing-xs);
        border-radius: var(--ndt-border-radius-small);
        color: var(--ndt-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: var(--ndt-hover-bg);
          color: var(--ndt-text-primary);
        }

        ndt-icon {
          width: 16px;
          height: 16px;
        }
      }

      .preset-card__description {
        margin: 0;
        font-size: var(--ndt-font-size-sm);
        color: var(--ndt-text-secondary);
      }

      .preset-card__meta {
        font-size: var(--ndt-font-size-xs);
        color: var(--ndt-text-muted);

        span {
          margin-right: var(--ndt-spacing-sm);
        }
      }

      .preset-card__preview {
        display: flex;
        gap: var(--ndt-spacing-xs);
        flex-wrap: wrap;
      }

      .badge {
        background: var(--ndt-primary-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: var(--ndt-font-size-xs);
        font-weight: 500;
      }

      .preset-form {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-md);
        padding: var(--ndt-spacing-md);

        ndt-input {
          width: 100%;
        }
      }

      .preset-summary {
        background: var(--ndt-background-secondary);
        padding: var(--ndt-spacing-md);
        border-radius: var(--ndt-border-radius-medium);

        h4 {
          margin: 0 0 var(--ndt-spacing-sm) 0;
          font-size: var(--ndt-font-size-sm);
          color: var(--ndt-text-primary);
        }

        ul {
          margin: 0;
          padding-left: var(--ndt-spacing-md);
          color: var(--ndt-text-secondary);
          font-size: var(--ndt-font-size-sm);

          li {
            margin-bottom: var(--ndt-spacing-xs);
          }
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--ndt-spacing-sm);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarPresetsToolComponent {
  // Injects
  private readonly presetsService = inject(DevToolbarInternalPresetsService);
  private readonly featureFlagsService = inject(
    DevToolbarInternalFeatureFlagService
  );
  private readonly permissionsService = inject(
    DevToolbarInternalPermissionsService
  );
  private readonly appFeaturesService = inject(
    DevToolbarInternalAppFeaturesService
  );
  private readonly languageService = inject(DevToolbarInternalLanguageService);

  // Signals
  protected readonly viewMode = signal<'list' | 'create'>('list');
  protected readonly searchQuery = signal<string>('');
  protected readonly presetName = signal<string>('');
  protected readonly presetDescription = signal<string>('');

  protected readonly presets = this.presetsService.presets;
  protected readonly filteredPresets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.presets().filter(
      (preset) =>
        preset.name.toLowerCase().includes(query) ||
        preset.description?.toLowerCase().includes(query)
    );
  });

  protected readonly hasNoPresets = computed(
    () => this.presets().length === 0
  );
  protected readonly hasNoFilteredPresets = computed(
    () => this.filteredPresets().length === 0
  );

  // Other properties
  protected readonly options: DevToolbarWindowOptions = {
    title: 'Presets',
    description: 'Save and load toolbar configurations',
    isClosable: true,
    size: 'tall',
    id: 'ndt-presets',
    isBeta: true,
  };

  // Public methods
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onSwitchToCreateMode(): void {
    this.viewMode.set('create');
    this.presetName.set('');
    this.presetDescription.set('');
  }

  onSwitchToListMode(): void {
    this.viewMode.set('list');
  }

  onSavePreset(event: Event): void {
    event.preventDefault();
    if (!this.presetName()) return;
    this.presetsService.saveCurrentAsPreset(
      this.presetName(),
      this.presetDescription()
    );
    this.onSwitchToListMode();
  }

  onApplyPreset(presetId: string): void {
    this.presetsService.applyPreset(presetId);
  }

  onUpdatePreset(presetId: string): void {
    this.presetsService.updatePreset(presetId);
  }

  onExportPreset(presetId: string): void {
    const preset = this.presets().find((p) => p.id === presetId);
    if (!preset) return;

    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  onDeletePreset(presetId: string): void {
    if (confirm('Are you sure you want to delete this preset?')) {
      this.presetsService.deletePreset(presetId);
    }
  }

  // Protected methods
  protected getCurrentFlagsCount(): number {
    const state = this.featureFlagsService.getCurrentForcedState();
    return state.enabled.length + state.disabled.length;
  }

  protected getCurrentPermissionsCount(): number {
    const state = this.permissionsService.getCurrentForcedState();
    return state.granted.length + state.denied.length;
  }

  protected getCurrentAppFeaturesCount(): number {
    const state = this.appFeaturesService.getCurrentForcedState();
    return state.enabled.length + state.disabled.length;
  }

  protected getCurrentLanguage(): string {
    return this.languageService.getCurrentForcedLanguage() || 'Not Forced';
  }

  protected formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString();
  }
}
