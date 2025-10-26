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
import { DevToolbarInternalPresetsService } from './presets-internal.service';
import { DevToolbarInternalFeatureFlagService } from '../feature-flags-tool/feature-flags-internal.service';
import { DevToolbarInternalPermissionsService } from '../permissions-tool/permissions-internal.service';
import { DevToolbarInternalAppFeaturesService } from '../app-features-tool/app-features-internal.service';
import { DevToolbarInternalLanguageService } from '../language-tool/language-internal.service';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';

@Component({
  selector: 'ndt-presets-tool',
  standalone: true,
  imports: [
    FormsModule,
    DevToolbarToolComponent,
    DevToolbarInputComponent,
    DevToolbarButtonComponent,
    DevToolbarIconComponent,
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

          <!-- Category selection checkboxes -->
          <div class="preset-summary">
            <h4>Select what to include:</h4>

            @if (isFeatureFlagsEnabled()) {
            <div class="category-section">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  [checked]="includeFeatureFlags()"
                  (change)="includeFeatureFlags.set(!includeFeatureFlags())"
                  [disabled]="getCurrentFlagsCount() === 0"
                />
                <span>Feature Flags ({{ getCurrentFlagsCount() }} forced)</span>
              </label>
              @if (forcedFlags().length > 0) {
              <ul class="forced-items-list">
                @for (flag of forcedFlags(); track flag.id) {
                <li>
                  <label class="item-checkbox">
                    <input
                      type="checkbox"
                      [checked]="isItemSelected(selectedFlagIds(), flag.id)"
                      (change)="toggleItemSelection(selectedFlagIds, flag.id)"
                    />
                    <span class="item-name">{{ flag.name }}</span>
                    <span class="item-status" [class.enabled]="flag.isEnabled" [class.disabled]="!flag.isEnabled">
                      {{ flag.isEnabled ? 'ON' : 'OFF' }}
                    </span>
                  </label>
                </li>
                }
              </ul>
              }
            </div>
            }

            @if (isPermissionsEnabled()) {
            <div class="category-section">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  [checked]="includePermissions()"
                  (change)="includePermissions.set(!includePermissions())"
                  [disabled]="getCurrentPermissionsCount() === 0"
                />
                <span>Permissions ({{ getCurrentPermissionsCount() }} forced)</span>
              </label>
              @if (forcedPermissions().length > 0) {
              <ul class="forced-items-list">
                @for (perm of forcedPermissions(); track perm.id) {
                <li>
                  <label class="item-checkbox">
                    <input
                      type="checkbox"
                      [checked]="isItemSelected(selectedPermissionIds(), perm.id)"
                      (change)="toggleItemSelection(selectedPermissionIds, perm.id)"
                    />
                    <span class="item-name">{{ perm.name }}</span>
                    <span class="item-status" [class.enabled]="perm.isGranted" [class.disabled]="!perm.isGranted">
                      {{ perm.isGranted ? 'GRANTED' : 'DENIED' }}
                    </span>
                  </label>
                </li>
                }
              </ul>
              }
            </div>
            }

            @if (isAppFeaturesEnabled()) {
            <div class="category-section">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  [checked]="includeAppFeatures()"
                  (change)="includeAppFeatures.set(!includeAppFeatures())"
                  [disabled]="getCurrentAppFeaturesCount() === 0"
                />
                <span>App Features ({{ getCurrentAppFeaturesCount() }} forced)</span>
              </label>
              @if (forcedAppFeatures().length > 0) {
              <ul class="forced-items-list">
                @for (feat of forcedAppFeatures(); track feat.id) {
                <li>
                  <label class="item-checkbox">
                    <input
                      type="checkbox"
                      [checked]="isItemSelected(selectedFeatureIds(), feat.id)"
                      (change)="toggleItemSelection(selectedFeatureIds, feat.id)"
                    />
                    <span class="item-name">{{ feat.name }}</span>
                    <span class="item-status" [class.enabled]="feat.isEnabled" [class.disabled]="!feat.isEnabled">
                      {{ feat.isEnabled ? 'ON' : 'OFF' }}
                    </span>
                  </label>
                </li>
                }
              </ul>
              }
            </div>
            }

            @if (isLanguageEnabled()) {
            <div class="category-section">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  [checked]="includeLanguage()"
                  (change)="includeLanguage.set(!includeLanguage())"
                  [disabled]="!getCurrentLanguage() || getCurrentLanguage() === 'Not Forced'"
                />
                <span>Language ({{ getCurrentLanguage() }})</span>
              </label>
            </div>
            }
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
        margin-top: var(--ndt-spacing-sm); // Defensive spacing against CSS resets
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
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-sm);

        h4 {
          margin: 0;
          font-size: var(--ndt-font-size-sm);
          color: var(--ndt-text-primary);
        }
      }

      .category-section {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-xs);
      }

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: var(--ndt-spacing-sm);
        cursor: pointer;
        color: var(--ndt-text-secondary);
        font-size: var(--ndt-font-size-sm);

        input[type='checkbox'] {
          cursor: pointer;
          width: 16px;
          height: 16px;
          accent-color: var(--ndt-primary);

          &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }
        }

        &:has(input:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .forced-items-list {
        list-style: none;
        padding: 0;
        margin: 0 0 0 var(--ndt-spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-xs);
        font-size: var(--ndt-font-size-xs);

        li {
          background: rgba(var(--ndt-primary-rgb), 0.05);
          border-radius: var(--ndt-border-radius-small);
          border-left: 2px solid rgba(var(--ndt-primary-rgb), 0.3);
        }

        .item-checkbox {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--ndt-spacing-xs) var(--ndt-spacing-sm);
          cursor: pointer;
          gap: var(--ndt-spacing-sm);

          input[type='checkbox'] {
            cursor: pointer;
            width: 14px;
            height: 14px;
            accent-color: var(--ndt-primary);
            flex-shrink: 0;
          }

          &:hover {
            background: rgba(var(--ndt-primary-rgb), 0.08);
          }
        }

        .item-name {
          color: var(--ndt-text-primary);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-status {
          font-weight: 600;
          padding: 2px 6px;
          border-radius: var(--ndt-border-radius-small);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;

          &.enabled {
            background: rgba(34, 197, 94, 0.15);
            color: rgb(34, 197, 94);
          }

          &.disabled {
            background: rgba(239, 68, 68, 0.15);
            color: rgb(239, 68, 68);
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
  protected readonly state = inject(DevToolbarStateService);

  // Signals
  protected readonly viewMode = signal<'list' | 'create'>('list');
  protected readonly searchQuery = signal<string>('');
  protected readonly presetName = signal<string>('');
  protected readonly presetDescription = signal<string>('');
  protected readonly includeFeatureFlags = signal<boolean>(true);
  protected readonly includePermissions = signal<boolean>(true);
  protected readonly includeAppFeatures = signal<boolean>(true);
  protected readonly includeLanguage = signal<boolean>(true);

  // Track selected individual items
  protected readonly selectedFlagIds = signal<Set<string>>(new Set());
  protected readonly selectedPermissionIds = signal<Set<string>>(new Set());
  protected readonly selectedFeatureIds = signal<Set<string>>(new Set());

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

  // Tool availability (based on config)
  protected readonly isFeatureFlagsEnabled = computed(
    () => this.state.config().showFeatureFlagsTool ?? true
  );
  protected readonly isPermissionsEnabled = computed(
    () => this.state.config().showPermissionsTool ?? true
  );
  protected readonly isAppFeaturesEnabled = computed(
    () => this.state.config().showAppFeaturesTool ?? true
  );
  protected readonly isLanguageEnabled = computed(
    () => this.state.config().showLanguageTool ?? true
  );

  // Forced items details
  protected readonly forcedFlags = computed(() => {
    return this.featureFlagsService.flags().filter((flag) => flag.isForced);
  });
  protected readonly forcedPermissions = computed(() => {
    return this.permissionsService.permissions().filter((perm) => perm.isForced);
  });
  protected readonly forcedAppFeatures = computed(() => {
    return this.appFeaturesService.features().filter((feat) => feat.isForced);
  });

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
    // Reset checkboxes - only enable categories that have forced items
    this.includeFeatureFlags.set(this.getCurrentFlagsCount() > 0);
    this.includePermissions.set(this.getCurrentPermissionsCount() > 0);
    this.includeAppFeatures.set(this.getCurrentAppFeaturesCount() > 0);
    const currentLang = this.getCurrentLanguage();
    this.includeLanguage.set(!!currentLang && currentLang !== 'Not Forced');

    // Initialize selected items - select all by default
    this.selectedFlagIds.set(new Set(this.forcedFlags().map((f) => f.id)));
    this.selectedPermissionIds.set(
      new Set(this.forcedPermissions().map((p) => p.id))
    );
    this.selectedFeatureIds.set(
      new Set(this.forcedAppFeatures().map((f) => f.id))
    );
  }

  onSwitchToListMode(): void {
    this.viewMode.set('list');
  }

  onSavePreset(event: Event): void {
    event.preventDefault();
    if (!this.presetName()) return;
    this.presetsService.saveCurrentAsPreset(
      this.presetName(),
      this.presetDescription(),
      {
        includeFeatureFlags: this.includeFeatureFlags(),
        includePermissions: this.includePermissions(),
        includeAppFeatures: this.includeAppFeatures(),
        includeLanguage: this.includeLanguage(),
        selectedFlagIds: Array.from(this.selectedFlagIds()),
        selectedPermissionIds: Array.from(this.selectedPermissionIds()),
        selectedFeatureIds: Array.from(this.selectedFeatureIds()),
      }
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

  /**
   * Toggle selection of an individual item
   */
  protected toggleItemSelection(
    signal: typeof this.selectedFlagIds,
    itemId: string
  ): void {
    const current = new Set(signal());
    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    signal.set(current);
  }

  /**
   * Check if an item is selected
   */
  protected isItemSelected(selectedSet: Set<string>, itemId: string): boolean {
    return selectedSet.has(itemId);
  }
}
