import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

import {
  ToolbarAppFeaturesService,
  ToolbarLanguageService,
} from 'ngx-dev-toolbar';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AnalyticsService } from './services/analytics.service';
import { AppFeaturesConfigService } from './services/app-features-config.service';
import { FeatureFlagsService } from './services/feature-flags.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
  ],
  template: `
    <div class="demo-app">
      <app-sidebar />
      <main class="demo-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .demo-app {
      display: grid;
      grid-template-columns: 200px 1fr;
      min-height: 100vh;
    }

    .demo-content {
      background: var(--demo-bg, #f8fafc);
      padding: 1.5rem 2rem;
      overflow-y: auto;
      max-height: 100vh;
    }

    @media (max-width: 768px) {
      .demo-app {
        grid-template-columns: 1fr;
      }

      .demo-content {
        padding: 1rem;
        max-height: none;
      }
    }
  `],
})
export class AppComponent {
  private readonly languageToolbarService = inject(ToolbarLanguageService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly translocoService = inject(TranslocoService);
  private readonly featureFlagsService = inject(FeatureFlagsService);
  private readonly toolbarAppFeaturesService = inject(ToolbarAppFeaturesService);
  public readonly appFeaturesConfig = inject(AppFeaturesConfigService);

  originalLang = this.translocoService.getActiveLang();

  constructor() {
    // Track app load
    this.analyticsService.trackEvent('Loaded Application', '--', '--');

    // Configure available languages
    this.languageToolbarService.setAvailableOptions([
      { id: 'en', name: 'English' },
      { id: 'es', name: 'Spanish' },
    ]);

    // Handle language changes from the dev toolbar
    this.languageToolbarService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(([language]) => {
        if (language) {
          this.translocoService.setActiveLang(language.id);
        } else {
          this.translocoService.setActiveLang(this.originalLang);
        }
      });

    // Set up app features integration
    // Get all features across all tiers for the toolbar
    const features = this.appFeaturesConfig.getAllFeatures();
    this.toolbarAppFeaturesService.setAvailableOptions(features);

    // Subscribe to forced feature overrides from the toolbar
    this.toolbarAppFeaturesService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe((forcedFeatures) => {
        // Clear all forced features first
        this.appFeaturesConfig.clearAllForcedFeatures();

        // Apply forced states from toolbar
        forcedFeatures.forEach((feature) => {
          this.appFeaturesConfig.forceFeature(feature.id, feature.isEnabled);
        });
      });
  }
}
