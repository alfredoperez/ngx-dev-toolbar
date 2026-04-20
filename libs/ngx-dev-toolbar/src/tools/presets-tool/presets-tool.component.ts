import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolbarButtonComponent } from '../../components/button/button.component';
import { ToolbarIconComponent } from '../../components/icons/icon.component';
import { ToolbarInputComponent } from '../../components/input/input.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { ToolbarInternalPresetsService } from './presets-internal.service';
import { ToolbarInternalFeatureFlagService } from '../feature-flags-tool/feature-flags-internal.service';
import { ToolbarInternalPermissionsService } from '../permissions-tool/permissions-internal.service';
import { ToolbarInternalAppFeaturesService } from '../app-features-tool/app-features-internal.service';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarPreset } from './presets.models';

type ViewMode = 'list' | 'create' | 'edit' | 'import' | 'apply' | 'delete';
type ToastType = 'success' | 'error';

@Component({
  selector: 'ndt-presets-tool',
  standalone: true,
  imports: [
    FormsModule,
    ToolbarToolComponent,
    ToolbarInputComponent,
    ToolbarButtonComponent,
    ToolbarIconComponent,
  ],
  template: `
    <ndt-toolbar-tool [options]="options" toolTitle="Presets" icon="layout">
      <div class="container">
        <!-- Toast Notification -->
        @if (toastMessage()) {
        <div class="toast" [class.toast--success]="toastType() === 'success'" [class.toast--error]="toastType() === 'error'">
          <span class="toast__icon">{{ toastType() === 'success' ? '✓' : '✕' }}</span>
          <span class="toast__message">{{ toastMessage() }}</span>
        </div>
        }


        <!-- Mode Toggle -->
        @if (!hasNoPresets() || viewMode() !== 'list') {
        <div class="tool-header">
          @if (viewMode() === 'list') {
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search presets..."
            [ariaLabel]="'Search presets'"
          />
          <ndt-button
            (click)="onSwitchToImportMode()"
            [ariaLabel]="'Import preset'"
          >
            Import
          </ndt-button>
          <ndt-button
            (click)="onSwitchToCreateMode()"
            [ariaLabel]="'Create new preset'"
          >
            New
          </ndt-button>
          } @else {
          <ndt-button
            (click)="onSwitchToListMode()"
            [ariaLabel]="'Back to list'"
          >
            ← Back
          </ndt-button>
          }
        </div>
        }

        <!-- Create Form -->
        @if (viewMode() === 'create') {
        <form (submit)="onSavePreset($event)" class="preset-form">
          <h3 class="form-title">Create Preset</h3>
          <p class="form-hint">This will save the current forced values from other tools. Only items you've explicitly set will be included.</p>
          <div class="form-field">
            <ndt-input
              label="Preset Name *"
              [value]="presetName()"
              (valueChange)="onPresetNameChange($event)"
              placeholder="e.g., Admin User - Full Access"
              [ariaLabel]="'Preset name'"
            />
            @if (nameError()) {
            <span class="field-error">{{ nameError() }}</span>
            }
          </div>
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

          </div>

          <div class="form-actions">
            <ndt-button type="button" (click)="onSwitchToListMode()">Cancel</ndt-button>
            <ndt-button type="submit">Save Preset</ndt-button>
          </div>
        </form>
        }

        <!-- Edit Form -->
        @if (viewMode() === 'edit') {
        <form (submit)="onSaveEdit($event)" class="preset-form">
          <h3 class="form-title">Edit Preset</h3>
          <div class="form-field">
            <ndt-input
              label="Preset Name *"
              [value]="editName()"
              (valueChange)="onEditNameChange($event)"
              placeholder="e.g., Admin User - Full Access"
              [ariaLabel]="'Preset name'"
            />
            @if (nameError()) {
            <span class="field-error">{{ nameError() }}</span>
            }
          </div>
          <ndt-input
            label="Description (optional)"
            [value]="editDescription()"
            (valueChange)="editDescription.set($event)"
            placeholder="Brief description of this preset"
            [ariaLabel]="'Preset description'"
          />

          <!-- Show saved configuration read-only -->
          @if (editingPreset()) {
          <div class="config-preview">
            <h4>Saved Configuration</h4>
            @if (editingPreset()!.config.featureFlags.enabled.length > 0 || editingPreset()!.config.featureFlags.disabled.length > 0) {
            <div class="config-category">
              <span class="config-category__title">Feature Flags ({{ editingPreset()!.config.featureFlags.enabled.length + editingPreset()!.config.featureFlags.disabled.length }})</span>
              <div class="config-items">
                @for (id of editingPreset()!.config.featureFlags.enabled; track id) {
                <span class="config-item config-item--on">{{ id }}: ON</span>
                }
                @for (id of editingPreset()!.config.featureFlags.disabled; track id) {
                <span class="config-item config-item--off">{{ id }}: OFF</span>
                }
              </div>
            </div>
            }
            @if (editingPreset()!.config.permissions.granted.length > 0 || editingPreset()!.config.permissions.denied.length > 0) {
            <div class="config-category">
              <span class="config-category__title">Permissions ({{ editingPreset()!.config.permissions.granted.length + editingPreset()!.config.permissions.denied.length }})</span>
              <div class="config-items">
                @for (id of editingPreset()!.config.permissions.granted; track id) {
                <span class="config-item config-item--on">{{ id }}: GRANTED</span>
                }
                @for (id of editingPreset()!.config.permissions.denied; track id) {
                <span class="config-item config-item--off">{{ id }}: DENIED</span>
                }
              </div>
            </div>
            }
            @if (editingPreset()!.config.appFeatures.enabled.length > 0 || editingPreset()!.config.appFeatures.disabled.length > 0) {
            <div class="config-category">
              <span class="config-category__title">App Features ({{ editingPreset()!.config.appFeatures.enabled.length + editingPreset()!.config.appFeatures.disabled.length }})</span>
              <div class="config-items">
                @for (id of editingPreset()!.config.appFeatures.enabled; track id) {
                <span class="config-item config-item--on">{{ id }}: ON</span>
                }
                @for (id of editingPreset()!.config.appFeatures.disabled; track id) {
                <span class="config-item config-item--off">{{ id }}: OFF</span>
                }
              </div>
            </div>
            }
            <button type="button" class="replace-config-button" (click)="onReplaceConfig()">
              ↻ Replace with current toolbar state
            </button>
          </div>
          }

          <div class="form-actions">
            <ndt-button type="button" (click)="onSwitchToListMode()">Cancel</ndt-button>
            <ndt-button type="submit">Save Changes</ndt-button>
          </div>
        </form>
        }

        <!-- Import View -->
        @if (viewMode() === 'import') {
        <div class="import-view">
          <h3 class="form-title">Import Preset</h3>

          <!-- File Drop Zone -->
          <div
            class="drop-zone"
            [class.drop-zone--active]="isDragOver()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onFileDrop($event)"
            (click)="fileInput.click()"
            (keydown.enter)="fileInput.click()"
            (keydown.space)="fileInput.click()"
            tabindex="0"
            role="button"
          >
            <input
              #fileInput
              type="file"
              accept=".json"
              (change)="onFileSelect($event)"
              hidden
            />
            <span class="drop-zone__icon">📁</span>
            <span class="drop-zone__text">Drop a .json file here</span>
            <span class="drop-zone__hint">or click to browse</span>
          </div>

          <div class="divider">
            <span>or paste JSON</span>
          </div>

          <!-- JSON Textarea -->
          <textarea
            class="json-textarea"
            [value]="importJson()"
            (input)="onImportJsonChange($event)"
            placeholder='{"name": "...", "config": { ... }}'
          ></textarea>

          @if (importError()) {
          <span class="field-error">{{ importError() }}</span>
          }

          <div class="form-actions">
            <ndt-button type="button" (click)="onSwitchToListMode()">Cancel</ndt-button>
            <ndt-button (click)="onImportPreset()">Import Preset</ndt-button>
          </div>
        </div>
        }

        <!-- Partial Apply View -->
        @if (viewMode() === 'apply') {
        <div class="apply-view">
          <h3 class="form-title">Apply: {{ applyingPreset()?.name }}</h3>
          <p class="apply-description">Select which parts to apply</p>

          @if (applyingPreset()) {
          <div class="apply-categories">
            <!-- Feature Flags -->
            @if (applyingPreset()!.config.featureFlags.enabled.length > 0 || applyingPreset()!.config.featureFlags.disabled.length > 0) {
            <div class="apply-category" [class.apply-category--disabled]="!applyFeatureFlags()">
              <label class="apply-category__header">
                <input
                  type="checkbox"
                  [checked]="applyFeatureFlags()"
                  (change)="applyFeatureFlags.set(!applyFeatureFlags())"
                />
                <span>Feature Flags ({{ applyingPreset()!.config.featureFlags.enabled.length + applyingPreset()!.config.featureFlags.disabled.length }})</span>
              </label>
              @if (applyFeatureFlags()) {
              <div class="apply-diff">
                @for (id of applyingPreset()!.config.featureFlags.enabled; track id) {
                <div class="diff-item">
                  <span class="diff-item__name">{{ id }}</span>
                  <span class="diff-item__arrow">→</span>
                  <span class="diff-item__value diff-item__value--on">ON</span>
                </div>
                }
                @for (id of applyingPreset()!.config.featureFlags.disabled; track id) {
                <div class="diff-item">
                  <span class="diff-item__name">{{ id }}</span>
                  <span class="diff-item__arrow">→</span>
                  <span class="diff-item__value diff-item__value--off">OFF</span>
                </div>
                }
              </div>
              }
            </div>
            }

            <!-- Permissions -->
            @if (applyingPreset()!.config.permissions.granted.length > 0 || applyingPreset()!.config.permissions.denied.length > 0) {
            <div class="apply-category" [class.apply-category--disabled]="!applyPermissions()">
              <label class="apply-category__header">
                <input
                  type="checkbox"
                  [checked]="applyPermissions()"
                  (change)="applyPermissions.set(!applyPermissions())"
                />
                <span>Permissions ({{ applyingPreset()!.config.permissions.granted.length + applyingPreset()!.config.permissions.denied.length }})</span>
              </label>
              @if (applyPermissions()) {
              <div class="apply-diff">
                @for (id of applyingPreset()!.config.permissions.granted; track id) {
                <div class="diff-item">
                  <span class="diff-item__name">{{ id }}</span>
                  <span class="diff-item__arrow">→</span>
                  <span class="diff-item__value diff-item__value--on">GRANTED</span>
                </div>
                }
                @for (id of applyingPreset()!.config.permissions.denied; track id) {
                <div class="diff-item">
                  <span class="diff-item__name">{{ id }}</span>
                  <span class="diff-item__arrow">→</span>
                  <span class="diff-item__value diff-item__value--off">DENIED</span>
                </div>
                }
              </div>
              }
            </div>
            }

            <!-- App Features -->
            @if (applyingPreset()!.config.appFeatures.enabled.length > 0 || applyingPreset()!.config.appFeatures.disabled.length > 0) {
            <div class="apply-category" [class.apply-category--disabled]="!applyAppFeatures()">
              <label class="apply-category__header">
                <input
                  type="checkbox"
                  [checked]="applyAppFeatures()"
                  (change)="applyAppFeatures.set(!applyAppFeatures())"
                />
                <span>App Features ({{ applyingPreset()!.config.appFeatures.enabled.length + applyingPreset()!.config.appFeatures.disabled.length }})</span>
              </label>
              @if (applyAppFeatures()) {
              <div class="apply-diff">
                @for (id of applyingPreset()!.config.appFeatures.enabled; track id) {
                <div class="diff-item">
                  <span class="diff-item__name">{{ id }}</span>
                  <span class="diff-item__arrow">→</span>
                  <span class="diff-item__value diff-item__value--on">ON</span>
                </div>
                }
                @for (id of applyingPreset()!.config.appFeatures.disabled; track id) {
                <div class="diff-item">
                  <span class="diff-item__name">{{ id }}</span>
                  <span class="diff-item__arrow">→</span>
                  <span class="diff-item__value diff-item__value--off">OFF</span>
                </div>
                }
              </div>
              }
            </div>
            }

          </div>
          }

          <div class="form-actions">
            <ndt-button type="button" (click)="onSwitchToListMode()">Cancel</ndt-button>
            <ndt-button (click)="onConfirmPartialApply()">Apply Selected</ndt-button>
          </div>
        </div>
        }

        <!-- Delete Confirmation View -->
        @if (viewMode() === 'delete') {
        <div class="delete-view">
          <div class="delete-view__content">
            <div class="delete-view__icon">🗑️</div>
            <h3 class="delete-view__title">Delete "{{ deletePresetName() }}"?</h3>
            <p class="delete-view__description">
              This preset will be permanently removed.
              This action cannot be undone.
            </p>
          </div>
          <div class="form-actions">
            <ndt-button type="button" (click)="onSwitchToListMode()">← Back</ndt-button>
            <button class="delete-button" (click)="onConfirmDelete()">Delete Preset</button>
          </div>
        </div>
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
          @for (preset of sortedPresets(); track preset.id) {
          <div class="preset-card">
            <div class="preset-card__header">
              <button
                class="expand-toggle"
                (click)="onToggleExpand(preset.id); $event.stopPropagation()"
                [attr.aria-label]="expandedPresetId() === preset.id ? 'Collapse details' : 'Expand details'"
              >{{ expandedPresetId() === preset.id ? '▾' : '▸' }}</button>
              <button
                class="favorite-button"
                [class.favorite-button--active]="preset.isFavorite"
                (click)="onToggleFavorite(preset.id); $event.stopPropagation()"
                [attr.aria-label]="preset.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
              >{{ preset.isFavorite ? '★' : '☆' }}</button>
              <span class="preset-card__name">{{ preset.name }}</span>
              @if (preset.isSystem) {<span class="system-badge">SYS</span>}
              <span class="preset-card__spacer"></span>
              <div class="preset-card__actions">
                <button
                  class="more-button"
                  (click)="onToggleMenu(preset.id); $event.stopPropagation()"
                  aria-label="Actions"
                >⋯</button>
              </div>
              @if (openMenuId() === preset.id) {
              <div class="action-menu" role="menu" tabindex="-1" (click)="$event.stopPropagation()" (keydown.escape)="openMenuId.set(null)">
                <button class="action-menu__item" (click)="onStartApply(preset.id); openMenuId.set(null)">
                  <ndt-icon name="refresh" />
                  <span>Apply preset</span>
                </button>
                @if (!preset.isSystem) {
                <button class="action-menu__item" (click)="onStartEdit(preset.id); openMenuId.set(null)">
                  <ndt-icon name="edit" />
                  <span>Edit</span>
                </button>
                <button class="action-menu__item" (click)="onUpdatePreset(preset.id); openMenuId.set(null)">
                  <ndt-icon name="gear" />
                  <span>Update with current values</span>
                </button>
                }
                <button class="action-menu__item" (click)="onExportPreset(preset.id); openMenuId.set(null)">
                  <ndt-icon name="export" />
                  <span>Export as JSON</span>
                </button>
                @if (!preset.isSystem) {
                <button class="action-menu__item action-menu__item--danger" (click)="onDeletePreset(preset.id); openMenuId.set(null)">
                  <ndt-icon name="trash" />
                  <span>Delete</span>
                </button>
                }
              </div>
              }
            </div>
            @if (preset.description) {
            <div class="preset-card__row preset-card__row--meta">
              <span class="preset-card__description">{{ preset.description }}</span>
            </div>
            }
            <div class="preset-card__row preset-card__row--badges">
              @if (preset.config.featureFlags.enabled.length > 0 || preset.config.featureFlags.disabled.length > 0) {
              <span class="badge">{{ preset.config.featureFlags.enabled.length + preset.config.featureFlags.disabled.length }} flags</span>
              }
              @if (preset.config.permissions.granted.length > 0 || preset.config.permissions.denied.length > 0) {
              <span class="badge">{{ preset.config.permissions.granted.length + preset.config.permissions.denied.length }} perms</span>
              }
              @if (preset.config.appFeatures.enabled.length > 0 || preset.config.appFeatures.disabled.length > 0) {
              <span class="badge">{{ preset.config.appFeatures.enabled.length + preset.config.appFeatures.disabled.length }} features</span>
              }
              <span class="preset-card__date">{{ formatDate(preset.updatedAt) }}</span>
            </div>
            @if (expandedPresetId() === preset.id) {
            <div class="preset-card__details">
              @if (preset.config.featureFlags.enabled.length > 0 || preset.config.featureFlags.disabled.length > 0) {
              <div class="details-section">
                <span class="details-section__title">Feature Flags</span>
                <div class="details-section__items">
                  @for (id of preset.config.featureFlags.enabled; track id) {
                  <span class="detail-badge detail-badge--on">{{ id }}: ON</span>
                  }
                  @for (id of preset.config.featureFlags.disabled; track id) {
                  <span class="detail-badge detail-badge--off">{{ id }}: OFF</span>
                  }
                </div>
              </div>
              }
              @if (preset.config.permissions.granted.length > 0 || preset.config.permissions.denied.length > 0) {
              <div class="details-section">
                <span class="details-section__title">Permissions</span>
                <div class="details-section__items">
                  @for (id of preset.config.permissions.granted; track id) {
                  <span class="detail-badge detail-badge--on">{{ id }}: GRANTED</span>
                  }
                  @for (id of preset.config.permissions.denied; track id) {
                  <span class="detail-badge detail-badge--off">{{ id }}: DENIED</span>
                  }
                </div>
              </div>
              }
              @if (preset.config.appFeatures.enabled.length > 0 || preset.config.appFeatures.disabled.length > 0) {
              <div class="details-section">
                <span class="details-section__title">App Features</span>
                <div class="details-section__items">
                  @for (id of preset.config.appFeatures.enabled; track id) {
                  <span class="detail-badge detail-badge--on">{{ id }}: ON</span>
                  }
                  @for (id of preset.config.appFeatures.disabled; track id) {
                  <span class="detail-badge detail-badge--off">{{ id }}: OFF</span>
                  }
                </div>
              </div>
              }
            </div>
            }
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
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
      }

      /* Toast Notification */
      .toast {
        position: absolute;
        bottom: var(--ndt-spacing-md);
        left: var(--ndt-spacing-md);
        right: var(--ndt-spacing-md);
        z-index: 10;
        display: flex;
        align-items: center;
        gap: var(--ndt-spacing-sm);
        padding: var(--ndt-spacing-sm) var(--ndt-spacing-md);
        border-radius: var(--ndt-border-radius-small);
        font-size: var(--ndt-font-size-sm);
        animation: slideUp 150ms ease-out;
      }

      .toast--success {
        background: var(--ndt-success);
        color: white;
      }

      .toast--error {
        background: var(--ndt-danger);
        color: white;
      }

      .toast__icon {
        font-weight: bold;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Delete Confirmation View */
      .delete-view {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--ndt-spacing-md);
      }

      .delete-view__content {
        text-align: center;
        padding: var(--ndt-spacing-lg) var(--ndt-spacing-md);
      }

      .delete-view__icon {
        font-size: 48px;
        margin-bottom: var(--ndt-spacing-md);
      }

      .delete-view__title {
        margin: 0 0 var(--ndt-spacing-sm);
        font-size: var(--ndt-font-size-md);
        color: var(--ndt-text-primary);
      }

      .delete-view__description {
        margin: 0;
        font-size: var(--ndt-font-size-sm);
        color: var(--ndt-text-secondary);
        line-height: 1.5;
      }

      .delete-button {
        background: var(--ndt-danger);
        color: white;
        border: none;
        padding: var(--ndt-spacing-sm) var(--ndt-spacing-md);
        border-radius: var(--ndt-border-radius-small);
        cursor: pointer;
        font-size: var(--ndt-font-size-sm);
        font-weight: 500;
        transition: background 200ms ease-out;

        &:hover {
          background: #dc2626;
        }
      }

      .tool-header {
        position: relative;
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
        gap: var(--ndt-spacing-xs);
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-right: var(--ndt-spacing-xs);

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
        padding: 6px var(--ndt-spacing-sm);
        border-radius: var(--ndt-border-radius-medium);
        display: flex;
        flex-direction: column;
        gap: 2px;
        position: relative;
      }

      .preset-card__header {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
      }

      .preset-card__row {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 18px;
      }

      .preset-card__row--meta {
        padding-left: 36px;
      }

      .preset-card__row--badges {
        padding-left: 36px;
        gap: 4px;
      }

      .preset-card__name {
        font-size: var(--ndt-font-size-sm);
        font-weight: 600;
        color: var(--ndt-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .preset-card__spacer {
        flex: 1;
        min-width: 8px;
      }

      .system-badge {
        font-size: 8px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        padding: 1px 4px;
        border-radius: 3px;
        background: var(--ndt-border-primary);
        color: var(--ndt-text-muted);
        flex-shrink: 0;
      }

      .favorite-button {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 12px;
        color: var(--ndt-text-muted);
        padding: 0;
        line-height: 1;
        transition: color 150ms ease-out;
        flex-shrink: 0;
      }

      .favorite-button:hover {
        color: #f59e0b;
      }

      .favorite-button--active {
        color: #f59e0b;
      }

      .preset-card__actions {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
      }

      .more-button {
        appearance: none;
        background: none;
        border: none;
        cursor: pointer;
        margin: 0;
        padding: 4px;
        border-radius: var(--ndt-border-radius-small);
        color: var(--ndt-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        opacity: 0.5;
        transition: opacity 150ms ease-out, color 150ms ease-out, background 150ms ease-out;
        line-height: 1;
        font-size: 14px;
        font-weight: bold;
        position: relative;

        &:hover {
          background: var(--ndt-hover-bg);
          color: var(--ndt-text-primary);
          opacity: 1;
        }
      }

      .action-menu {
        position: absolute;
        top: 28px;
        right: var(--ndt-spacing-sm);
        background: var(--ndt-bg-primary);
        border: 1px solid var(--ndt-border-primary);
        border-radius: var(--ndt-border-radius-medium);
        box-shadow: var(--ndt-shadow-tooltip);
        z-index: 20;
        min-width: 180px;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .action-menu__item {
        appearance: none;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px;
        border-radius: var(--ndt-border-radius-small);
        color: var(--ndt-text-primary);
        font-size: var(--ndt-font-size-xs);
        transition: background 150ms ease-out;
        white-space: nowrap;

        &:hover {
          background: var(--ndt-hover-bg);
        }

        ndt-icon {
          display: block;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: var(--ndt-text-muted);
        }
      }

      .action-menu__item--danger {
        color: var(--ndt-danger);

        ndt-icon {
          color: var(--ndt-danger);
        }

        &:hover {
          background: rgba(var(--ndt-danger-rgb), 0.1);
        }
      }

      .expand-toggle {
        appearance: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 4px;
        margin-right: 2px;
        font-size: 10px;
        color: var(--ndt-text-muted);
        line-height: 1;
        opacity: 0.6;
        transition: opacity 150ms ease-out;
        flex-shrink: 0;

        &:hover {
          opacity: 1;
        }
      }

      .preset-card__details {
        padding: var(--ndt-spacing-sm) var(--ndt-spacing-sm) var(--ndt-spacing-xs);
        margin-top: 2px;
        border-top: 1px solid var(--ndt-border-primary);
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-xs);
      }

      .details-section__title {
        font-size: 10px;
        font-weight: 600;
        color: var(--ndt-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .details-section__items {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 2px;
      }

      .detail-badge {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: var(--ndt-border-radius-small);
        white-space: nowrap;
      }

      .detail-badge--on {
        background: rgba(var(--ndt-success-rgb), 0.1);
        color: var(--ndt-success);
      }

      .detail-badge--off {
        background: rgba(var(--ndt-danger-rgb), 0.1);
        color: var(--ndt-danger);
      }

      .preset-card__description {
        font-size: 11px;
        color: var(--ndt-text-secondary);
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .preset-card__date {
        font-size: 10px;
        color: var(--ndt-text-muted);
        margin-left: auto;
        flex-shrink: 0;
      }

      .badge {
        background: rgba(99, 102, 241, 0.15);
        color: rgb(99, 102, 241);
        padding: 1px 6px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 500;
        white-space: nowrap;
      }

      .badge--lang {
        background: rgba(var(--ndt-success-rgb), 0.15);
        color: var(--ndt-success);
      }

      .preset-form,
      .import-view,
      .apply-view {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-sm);
        padding: var(--ndt-spacing-sm);

        ndt-input {
          width: 100%;
        }
      }

      .form-title {
        margin: 0;
        font-size: var(--ndt-font-size-sm);
        font-weight: 600;
        color: var(--ndt-text-primary);
      }

      .form-hint {
        margin: 0;
        font-size: 11px;
        color: var(--ndt-text-muted);
        line-height: 1.3;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .field-error {
        color: var(--ndt-danger);
        font-size: 11px;
      }

      .preset-summary {
        background: var(--ndt-background-secondary);
        padding: var(--ndt-spacing-sm);
        border-radius: var(--ndt-border-radius-medium);
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-xs);

        h4 {
          margin: 0;
          font-size: 11px;
          font-weight: 500;
          color: var(--ndt-text-secondary);
        }
      }

      .category-section {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: var(--ndt-spacing-xs);
        cursor: pointer;
        color: var(--ndt-text-primary);
        font-size: var(--ndt-font-size-sm);
        padding: 2px 0;

        input[type='checkbox'] {
          cursor: pointer;
          width: 14px;
          height: 14px;
          accent-color: rgb(99, 102, 241);
          border-radius: 3px;

          &:disabled {
            cursor: not-allowed;
            opacity: 0.4;
          }
        }

        &:has(input:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .forced-items-list {
        list-style: none;
        padding: 0;
        margin: 0 0 0 20px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 11px;
        max-height: 100px;
        overflow-y: auto;

        li {
          background: rgba(var(--ndt-primary-rgb), 0.05);
          border-radius: 3px;
          padding-left: 6px;
        }

        .item-checkbox {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 3px 6px;
          cursor: pointer;
          gap: 6px;

          input[type='checkbox'] {
            cursor: pointer;
            width: 12px;
            height: 12px;
            accent-color: rgb(99, 102, 241);
            flex-shrink: 0;
          }

          &:hover {
            background: rgba(99, 102, 241, 0.08);
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
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          flex-shrink: 0;

          &.enabled {
            background: rgba(var(--ndt-success-rgb), 0.15);
            color: var(--ndt-success);
          }

          &.disabled {
            background: rgba(var(--ndt-danger-rgb), 0.15);
            color: var(--ndt-danger);
          }
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--ndt-spacing-sm);
        margin-top: auto;
        padding-top: var(--ndt-spacing-sm);
      }

      /* Config Preview (Edit Mode) */
      .config-preview {
        background: var(--ndt-background-secondary);
        padding: var(--ndt-spacing-sm);
        border-radius: var(--ndt-border-radius-medium);
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-xs);

        h4 {
          margin: 0;
          font-size: 11px;
          font-weight: 500;
          color: var(--ndt-text-secondary);
        }
      }

      .config-category {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .config-category__title {
        font-size: 10px;
        color: var(--ndt-text-muted);
        font-weight: 500;
      }

      .config-items {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .config-item {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 3px;
        background: var(--ndt-background-primary);
        color: var(--ndt-text-secondary);
      }

      .config-item--on {
        background: rgba(var(--ndt-success-rgb), 0.1);
        color: var(--ndt-success);
      }

      .config-item--off {
        background: rgba(var(--ndt-danger-rgb), 0.1);
        color: var(--ndt-danger);
      }

      .replace-config-button {
        background: transparent;
        border: 1px dashed var(--ndt-border-primary);
        padding: 6px var(--ndt-spacing-sm);
        border-radius: var(--ndt-border-radius-small);
        color: var(--ndt-text-secondary);
        cursor: pointer;
        font-size: 11px;
        transition: all 150ms ease-out;

        &:hover {
          background: var(--ndt-hover-bg);
          border-color: rgb(99, 102, 241);
          color: rgb(99, 102, 241);
        }
      }

      /* Import View */
      .drop-zone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: var(--ndt-spacing-md);
        border: 2px dashed var(--ndt-border-primary);
        border-radius: var(--ndt-border-radius-medium);
        cursor: pointer;
        transition: all 150ms ease-out;
      }

      .drop-zone:hover,
      .drop-zone--active {
        border-color: rgb(99, 102, 241);
        background: rgba(99, 102, 241, 0.05);
      }

      .drop-zone__icon {
        font-size: 24px;
      }

      .drop-zone__text {
        font-size: var(--ndt-font-size-sm);
        color: var(--ndt-text-primary);
      }

      .drop-zone__hint {
        font-size: 11px;
        color: var(--ndt-text-muted);
      }

      .divider {
        display: flex;
        align-items: center;
        gap: var(--ndt-spacing-sm);
        color: var(--ndt-text-muted);
        font-size: 10px;

        &::before,
        &::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--ndt-border-primary);
        }
      }

      .json-textarea {
        width: 100%;
        min-height: 80px;
        padding: var(--ndt-spacing-xs);
        border: 1px solid var(--ndt-border-primary);
        border-radius: var(--ndt-border-radius-small);
        background: var(--ndt-background-secondary);
        color: var(--ndt-text-primary);
        font-family: monospace;
        font-size: 11px;
        resize: vertical;

        &:focus {
          outline: none;
          border-color: rgb(99, 102, 241);
        }

        &::placeholder {
          color: var(--ndt-text-muted);
        }
      }

      /* Apply View */
      .apply-description {
        margin: 0;
        font-size: 11px;
        color: var(--ndt-text-secondary);
      }

      .apply-categories {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-xs);
      }

      .apply-category {
        background: var(--ndt-background-secondary);
        border-radius: var(--ndt-border-radius-small);
        overflow: hidden;
        transition: opacity 150ms ease-out;
      }

      .apply-category--disabled {
        opacity: 0.5;
      }

      .apply-category__header {
        display: flex;
        align-items: center;
        gap: var(--ndt-spacing-xs);
        padding: 6px var(--ndt-spacing-sm);
        cursor: pointer;
        font-size: var(--ndt-font-size-sm);
        color: var(--ndt-text-primary);
        font-weight: 500;

        input[type='checkbox'] {
          cursor: pointer;
          width: 14px;
          height: 14px;
          accent-color: rgb(99, 102, 241);
        }
      }

      .apply-diff {
        padding: 0 var(--ndt-spacing-sm) 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .diff-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        padding: 3px 6px;
        background: var(--ndt-background-primary);
        border-radius: 3px;
      }

      .diff-item__name {
        flex: 1;
        color: var(--ndt-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .diff-item__arrow {
        color: var(--ndt-text-muted);
        font-size: 10px;
      }

      .diff-item__value {
        font-weight: 600;
        padding: 1px 4px;
        border-radius: 3px;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .diff-item__value--on {
        background: rgba(var(--ndt-success-rgb), 0.15);
        color: var(--ndt-success);
      }

      .diff-item__value--off {
        background: rgba(var(--ndt-danger-rgb), 0.15);
        color: var(--ndt-danger);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarPresetsToolComponent {
  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuId.set(null);
  }

  // Injects
  private readonly presetsService = inject(ToolbarInternalPresetsService);
  private readonly featureFlagsService = inject(
    ToolbarInternalFeatureFlagService
  );
  private readonly permissionsService = inject(
    ToolbarInternalPermissionsService
  );
  private readonly appFeaturesService = inject(
    ToolbarInternalAppFeaturesService
  );
  protected readonly state = inject(ToolbarStateService);

  // View state signals
  protected readonly viewMode = signal<ViewMode>('list');
  protected readonly searchQuery = signal<string>('');
  protected readonly expandedPresetId = signal<string | null>(null);
  protected readonly openMenuId = signal<string | null>(null);

  // Create form signals
  protected readonly presetName = signal<string>('');
  protected readonly presetDescription = signal<string>('');
  protected readonly includeFeatureFlags = signal<boolean>(true);
  protected readonly includePermissions = signal<boolean>(true);
  protected readonly includeAppFeatures = signal<boolean>(true);
  protected readonly selectedFlagIds = signal<Set<string>>(new Set());
  protected readonly selectedPermissionIds = signal<Set<string>>(new Set());
  protected readonly selectedFeatureIds = signal<Set<string>>(new Set());

  // Edit mode signals
  protected readonly editingPresetId = signal<string | null>(null);
  protected readonly editName = signal<string>('');
  protected readonly editDescription = signal<string>('');

  // Import mode signals
  protected readonly importJson = signal<string>('');
  protected readonly importError = signal<string | null>(null);
  protected readonly isDragOver = signal<boolean>(false);

  // Apply mode signals
  protected readonly applyingPresetId = signal<string | null>(null);
  protected readonly applyFeatureFlags = signal<boolean>(true);
  protected readonly applyPermissions = signal<boolean>(true);
  protected readonly applyAppFeatures = signal<boolean>(true);
  // Delete confirmation signals
  protected readonly deletePresetId = signal<string | null>(null);

  // Toast signals
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly toastType = signal<ToastType>('success');

  // Validation signals
  protected readonly nameError = signal<string | null>(null);

  // Auto-dismiss toast effect
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const message = this.toastMessage();
      if (message) {
        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
        }
        this.toastTimeout = setTimeout(() => {
          this.toastMessage.set(null);
        }, 3000);
      }
    });
  }

  // Computed values
  protected readonly presets = this.presetsService.presets;

  protected readonly filteredPresets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.presets().filter(
      (preset) =>
        preset.name.toLowerCase().includes(query) ||
        preset.description?.toLowerCase().includes(query)
    );
  });

  protected readonly sortedPresets = computed(() => {
    const presets = this.filteredPresets();
    return [...presets].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  });

  protected readonly hasNoPresets = computed(
    () => this.presets().length === 0
  );

  protected readonly hasNoFilteredPresets = computed(
    () => this.filteredPresets().length === 0
  );

  protected readonly editingPreset = computed(() => {
    const id = this.editingPresetId();
    if (!id) return null;
    return this.presets().find((p) => p.id === id) || null;
  });

  protected readonly applyingPreset = computed(() => {
    const id = this.applyingPresetId();
    if (!id) return null;
    return this.presets().find((p) => p.id === id) || null;
  });

  protected readonly deletePresetName = computed(() => {
    const id = this.deletePresetId();
    if (!id) return '';
    const preset = this.presets().find((p) => p.id === id);
    return preset?.name || '';
  });

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
  protected readonly options: ToolbarWindowOptions = {
    title: 'Presets',
    description: 'Save and load toolbar configurations',
    isClosable: true,
    size: 'tall',
    id: 'ndt-presets',
  };

  // Toast helper
  private showToast(message: string, type: ToastType = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
  }

  // View mode switching
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onToggleExpand(presetId: string): void {
    this.expandedPresetId.update((current) =>
      current === presetId ? null : presetId
    );
  }

  onToggleMenu(presetId: string): void {
    this.openMenuId.update((current) =>
      current === presetId ? null : presetId
    );
  }

  onSwitchToListMode(): void {
    this.viewMode.set('list');
    this.nameError.set(null);
    this.importError.set(null);
    this.deletePresetId.set(null);
  }

  onSwitchToCreateMode(): void {
    this.viewMode.set('create');
    this.presetName.set('');
    this.presetDescription.set('');
    this.nameError.set(null);
    // Reset checkboxes - only enable categories that have forced items
    this.includeFeatureFlags.set(this.getCurrentFlagsCount() > 0);
    this.includePermissions.set(this.getCurrentPermissionsCount() > 0);
    this.includeAppFeatures.set(this.getCurrentAppFeaturesCount() > 0);

    // Initialize selected items - select all by default
    this.selectedFlagIds.set(new Set(this.forcedFlags().map((f) => f.id)));
    this.selectedPermissionIds.set(
      new Set(this.forcedPermissions().map((p) => p.id))
    );
    this.selectedFeatureIds.set(
      new Set(this.forcedAppFeatures().map((f) => f.id))
    );
  }

  onSwitchToImportMode(): void {
    this.viewMode.set('import');
    this.importJson.set('');
    this.importError.set(null);
    this.isDragOver.set(false);
  }

  // Create preset
  onPresetNameChange(value: string): void {
    this.presetName.set(value);
    if (value.trim()) {
      this.nameError.set(null);
    }
  }

  onSavePreset(event: Event): void {
    event.preventDefault();
    const name = this.presetName().trim();

    if (!name) {
      this.nameError.set('Name is required');
      return;
    }

    // Check for duplicate names
    const existingPreset = this.presets().find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (existingPreset) {
      this.nameError.set('A preset with this name already exists');
      return;
    }

    this.presetsService.saveCurrentAsPreset(
      name,
      this.presetDescription(),
      {
        includeFeatureFlags: this.includeFeatureFlags(),
        includePermissions: this.includePermissions(),
        includeAppFeatures: this.includeAppFeatures(),
        selectedFlagIds: Array.from(this.selectedFlagIds()),
        selectedPermissionIds: Array.from(this.selectedPermissionIds()),
        selectedFeatureIds: Array.from(this.selectedFeatureIds()),
      }
    );

    this.showToast('Preset created successfully');
    this.onSwitchToListMode();
  }

  // Edit preset
  onStartEdit(presetId: string): void {
    const preset = this.presets().find((p) => p.id === presetId);
    if (!preset) return;

    this.editingPresetId.set(presetId);
    this.editName.set(preset.name);
    this.editDescription.set(preset.description || '');
    this.nameError.set(null);
    this.viewMode.set('edit');
  }

  onEditNameChange(value: string): void {
    this.editName.set(value);
    if (value.trim()) {
      this.nameError.set(null);
    }
  }

  onSaveEdit(event: Event): void {
    event.preventDefault();
    const name = this.editName().trim();
    const presetId = this.editingPresetId();

    if (!name) {
      this.nameError.set('Name is required');
      return;
    }

    if (!presetId) return;

    // Check for duplicate names (excluding current preset)
    const existingPreset = this.presets().find(
      (p) => p.id !== presetId && p.name.toLowerCase() === name.toLowerCase()
    );
    if (existingPreset) {
      this.nameError.set('A preset with this name already exists');
      return;
    }

    this.presetsService.updatePresetMetadata(
      presetId,
      name,
      this.editDescription()
    );

    this.showToast('Preset updated successfully');
    this.onSwitchToListMode();
  }

  onReplaceConfig(): void {
    const presetId = this.editingPresetId();
    if (!presetId) return;

    this.presetsService.updatePreset(presetId);
    this.showToast('Configuration replaced with current state');
  }

  // Import preset
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!file.name.endsWith('.json')) {
      this.importError.set('Please select a .json file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.importJson.set(content);
      this.importError.set(null);
    };
    reader.onerror = () => {
      this.importError.set('Failed to read file');
    };
    reader.readAsText(file);
  }

  onImportJsonChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.importJson.set(textarea.value);
    this.importError.set(null);
  }

  onImportPreset(): void {
    const json = this.importJson().trim();

    if (!json) {
      this.importError.set('Please provide JSON content');
      return;
    }

    try {
      const parsed = JSON.parse(json) as ToolbarPreset;

      // Validate required fields
      if (!parsed.name) {
        this.importError.set('Preset must have a name');
        return;
      }
      if (!parsed.config) {
        this.importError.set('Preset must have a config object');
        return;
      }

      this.presetsService.addPreset(parsed);
      this.showToast('Preset imported successfully');
      this.onSwitchToListMode();
    } catch {
      this.importError.set('Invalid JSON format');
    }
  }

  // Apply preset (partial)
  onStartApply(presetId: string): void {
    this.applyingPresetId.set(presetId);
    this.applyFeatureFlags.set(true);
    this.applyPermissions.set(true);
    this.applyAppFeatures.set(true);
    this.viewMode.set('apply');
  }

  onConfirmPartialApply(): void {
    const presetId = this.applyingPresetId();
    if (!presetId) return;

    this.presetsService.partialApplyPreset(presetId, {
      applyFeatureFlags: this.applyFeatureFlags(),
      applyPermissions: this.applyPermissions(),
      applyAppFeatures: this.applyAppFeatures(),
    });

    this.showToast('Preset applied successfully');
    this.onSwitchToListMode();
  }

  // Update preset (with current state)
  onUpdatePreset(presetId: string): void {
    this.presetsService.updatePreset(presetId);
    this.showToast('Preset updated with current state');
  }

  // Export preset
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

    this.showToast('Preset exported');
  }

  // Delete preset
  onDeletePreset(presetId: string): void {
    this.deletePresetId.set(presetId);
    this.viewMode.set('delete');
  }

  onConfirmDelete(): void {
    const presetId = this.deletePresetId();
    if (presetId) {
      this.presetsService.deletePreset(presetId);
      this.showToast('Preset deleted');
    }
    this.deletePresetId.set(null);
    this.viewMode.set('list');
  }

  // Favorites
  onToggleFavorite(presetId: string): void {
    this.presetsService.toggleFavorite(presetId);
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

  protected formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString();
  }

  protected getPresetTooltip(preset: ToolbarPreset): string {
    const lines: string[] = [];

    // Feature Flags
    const flagsEnabled = preset.config.featureFlags.enabled;
    const flagsDisabled = preset.config.featureFlags.disabled;
    if (flagsEnabled.length > 0 || flagsDisabled.length > 0) {
      lines.push('Feature Flags:');
      flagsEnabled.forEach(id => lines.push(`  ✓ ${id}: ON`));
      flagsDisabled.forEach(id => lines.push(`  ✗ ${id}: OFF`));
    }

    // Permissions
    const permsGranted = preset.config.permissions.granted;
    const permsDenied = preset.config.permissions.denied;
    if (permsGranted.length > 0 || permsDenied.length > 0) {
      if (lines.length > 0) lines.push('');
      lines.push('Permissions:');
      permsGranted.forEach(id => lines.push(`  ✓ ${id}: GRANTED`));
      permsDenied.forEach(id => lines.push(`  ✗ ${id}: DENIED`));
    }

    // App Features
    const featuresEnabled = preset.config.appFeatures.enabled;
    const featuresDisabled = preset.config.appFeatures.disabled;
    if (featuresEnabled.length > 0 || featuresDisabled.length > 0) {
      if (lines.length > 0) lines.push('');
      lines.push('App Features:');
      featuresEnabled.forEach(id => lines.push(`  ✓ ${id}: ON`));
      featuresDisabled.forEach(id => lines.push(`  ✗ ${id}: OFF`));
    }

    return lines.length > 0 ? lines.join('\n') : 'No configuration';
  }

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

  protected isItemSelected(selectedSet: Set<string>, itemId: string): boolean {
    return selectedSet.has(itemId);
  }
}
