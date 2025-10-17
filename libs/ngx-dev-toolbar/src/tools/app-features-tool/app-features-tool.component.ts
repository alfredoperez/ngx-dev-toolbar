import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarIconComponent } from '../../components/icons/icon.component';
import { DevToolbarInputComponent } from '../../components/input/input.component';
import { DevToolbarSelectComponent } from '../../components/select/select.component';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { DevToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { DevToolbarInternalAppFeaturesService } from './app-features-internal.service';
import { AppFeatureFilter, DevToolbarAppFeature } from './app-features.models';

/**
 * Component for managing app features in the dev toolbar.
 *
 * Provides UI for:
 * - Searching features by name and description
 * - Filtering features by state (all/forced/enabled/disabled)
 * - Forcing features to enabled/disabled state via 3-state dropdown
 * - Viewing feature descriptions and current state
 *
 * @example
 * ```html
 * <ndt-app-features-tool />
 * ```
 */
@Component({
  selector: 'ndt-app-features-tool',
  standalone: true,
  imports: [
    FormsModule,
    DevToolbarToolComponent,
    DevToolbarInputComponent,
    DevToolbarSelectComponent,
    DevToolbarIconComponent,
  ],
  template: `
    <ndt-toolbar-tool
      [options]="options"
      title="App Features"
      icon="puzzle"
    >
      <div class="container">
        <div class="header">
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search features..."
          />
          <div class="filter-wrapper">
            <ndt-icon name="filter" class="filter-icon" />
            <ndt-select
              [value]="activeFilter()"
              [options]="filterOptions"
              [size]="'medium'"
              (valueChange)="onFilterChange($event)"
            />
          </div>
        </div>

        @if (hasNoFeatures()) {
        <div class="empty">
          <p>No app features found</p>
          <small>Call setAvailableOptions() to configure features</small>
        </div>
        } @else if (hasNoFilteredFeatures()) {
        <div class="empty">
          <p>No features match your filter</p>
        </div>
        } @else {
        <div class="feature-list">
          @for (feature of filteredFeatures(); track feature.id) {
          <div class="feature">
            <div class="info">
              <h3>{{ feature.name }}</h3>
              @if (feature.description) {
              <p>{{ feature.description }}</p>
              }
            </div>

            <ndt-select
              [value]="getFeatureValue(feature)"
              [options]="featureValueOptions"
              [ariaLabel]="'Set value for ' + feature.name"
              (valueChange)="onFeatureChange(feature.id, $event ?? '')"
              size="small"
            />
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

        .filter-wrapper {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: var(--ndt-spacing-md);

          .filter-icon {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            opacity: 0.6;
          }

          ndt-select {
            flex: 0 0 auto;
            min-width: 180px;
          }
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
        border: 1px solid var(--ndt-warning-border);
        border-radius: var(--ndt-border-radius-medium);
        padding: var(--ndt-spacing-md);
        background: var(--ndt-warning-background);
        color: var(--ndt-text-muted);

        p {
          margin: 0;
          font-size: var(--ndt-font-size-md);
        }

        small {
          font-size: var(--ndt-font-size-xs);
          opacity: 0.8;
        }
      }

      .feature-list {
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

      .feature {
        display: flex;
        flex-direction: row;
        gap: var(--ndt-spacing-sm);
        background: var(--ndt-background-secondary);
        padding: var(--ndt-spacing-md);
        border-radius: var(--ndt-border-radius-medium);

        .info {
          flex: 0 0 65%;

          h3 {
            margin: 0;
            font-size: var(--ndt-font-size-md);
            color: var(--ndt-text-primary);
          }

          p {
            margin: var(--ndt-spacing-xs) 0 0 0;
            font-size: var(--ndt-font-size-xs);
            color: var(--ndt-text-muted);
          }
        }

        ndt-select {
          flex: 0 0 35%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarAppFeaturesToolComponent {
  // Injects
  private readonly appFeaturesService = inject(DevToolbarInternalAppFeaturesService);

  // Signals
  protected readonly activeFilter = signal<AppFeatureFilter>('all');
  protected readonly searchQuery = signal<string>('');

  protected readonly features = this.appFeaturesService.features;
  protected readonly hasNoFeatures = computed(() => this.features().length === 0);
  protected readonly filteredFeatures = computed(() => {
    return this.features().filter((feature) => {
      const searchTerm = this.searchQuery().toLowerCase();
      const featureName = feature.name.toLowerCase();
      const featureDescription = feature.description?.toLowerCase() ?? '';

      const matchesSearch =
        !this.searchQuery() ||
        featureName.includes(searchTerm) ||
        featureDescription.includes(searchTerm);

      const matchesFilter =
        this.activeFilter() === 'all' ||
        (this.activeFilter() === 'forced' && feature.isForced) ||
        (this.activeFilter() === 'enabled' && feature.isEnabled) ||
        (this.activeFilter() === 'disabled' && !feature.isEnabled);

      return matchesSearch && matchesFilter;
    });
  });
  protected readonly hasNoFilteredFeatures = computed(
    () => this.filteredFeatures().length === 0
  );

  // Other properties
  protected readonly options = {
    title: 'App Features',
    description: 'Override product features to test different tiers and configurations',
    isClosable: true,
    size: 'tall',
    id: 'ndt-app-features',
  } as DevToolbarWindowOptions;

  protected readonly filterOptions = [
    { value: 'all', label: 'All Features' },
    { value: 'forced', label: 'Forced' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly featureValueOptions = [
    { value: '', label: 'Not Forced' },
    { value: 'off', label: 'Disabled' },
    { value: 'on', label: 'Enabled' },
  ];

  // Public methods
  /**
   * Handle filter dropdown change.
   * Updates the active filter to show all/forced/enabled/disabled features.
   */
  onFilterChange(value: string | undefined): void {
    const filter = this.filterOptions.find((f) => f.value === value);
    if (filter) {
      this.activeFilter.set(filter.value as AppFeatureFilter);
    }
  }

  /**
   * Handle feature value change from 3-state dropdown.
   * - 'not-forced' (empty string): Remove forced override
   * - 'on': Force feature to enabled
   * - 'off': Force feature to disabled
   */
  onFeatureChange(featureId: string, value: string): void {
    switch (value) {
      case '':
        this.appFeaturesService.removeFeatureOverride(featureId);
        break;
      case 'on':
        this.appFeaturesService.setFeature(featureId, true);
        break;
      case 'off':
        this.appFeaturesService.setFeature(featureId, false);
        break;
    }
  }

  /**
   * Handle search input change.
   * Updates the search query to filter features by name/description.
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  // Protected methods
  /**
   * Get the dropdown value for a feature's current state.
   * - Returns empty string if not forced (natural state)
   * - Returns 'on' if forced to enabled
   * - Returns 'off' if forced to disabled
   */
  protected getFeatureValue(feature: DevToolbarAppFeature): string {
    if (!feature.isForced) return '';
    return feature.isEnabled ? 'on' : 'off';
  }
}
