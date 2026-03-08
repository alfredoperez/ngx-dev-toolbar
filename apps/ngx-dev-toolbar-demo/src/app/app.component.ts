import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { TranslateService } from '@ngx-translate/core';

import {
  ToolbarAppFeaturesService,
  ToolbarI18nService,
  ToolbarPresetsService,
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
  private readonly i18nService = inject(ToolbarI18nService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly translocoService = inject(TranslocoService);
  private readonly translateService = inject(TranslateService);
  private readonly featureFlagsService = inject(FeatureFlagsService);
  private readonly toolbarAppFeaturesService = inject(ToolbarAppFeaturesService);
  private readonly presetsService = inject(ToolbarPresetsService);
  public readonly appFeaturesConfig = inject(AppFeaturesConfigService);

  originalLang = this.translocoService.getActiveLang();

  constructor() {
    // Track app load
    this.analyticsService.trackEvent('Loaded Application', '--', '--');

    // Trigger initial ngx-translate load
    this.translateService.use('en');

    // Configure i18n tool with a small set of locales, timezones, and currencies
    this.i18nService.setAvailableOptions([
      { id: 'en-US', name: 'English (US)', code: 'en-US' },
      { id: 'es-ES', name: 'Spanish (Spain)', code: 'es-ES' },
      { id: 'ja-JP', name: 'Japanese', code: 'ja-JP' },
    ]);

    this.i18nService.setAvailableTimezones([
      { id: 'America/New_York', name: 'New York', offset: '-05:00' },
      { id: 'Europe/Madrid', name: 'Madrid', offset: '+01:00' },
      { id: 'Asia/Tokyo', name: 'Tokyo', offset: '+09:00' },
    ]);

    this.i18nService.setAvailableCurrencies([
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    ]);

    // Bridge i18n tool locale changes → Transloco + ngx-translate
    // Only switch language when the short code maps to an available translation file.
    // For locales without translations (ja-JP, de-DE, etc.), keep the default language
    // so Transloco doesn't try to fetch a non-existent JSON file.
    const availableLangs = ['en', 'es'];
    this.i18nService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe((locales) => {
        if (locales.length > 0) {
          // Map locale code (e.g. "es-ES") to short lang code (e.g. "es")
          const langCode = locales[0].code.split('-')[0];
          const targetLang = availableLangs.includes(langCode) ? langCode : this.originalLang;
          this.translocoService.setActiveLang(targetLang);
          this.translateService.use(availableLangs.includes(langCode) ? langCode : 'en');
        } else {
          this.translocoService.setActiveLang(this.originalLang);
          this.translateService.use('en');
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

    // Initialize sample presets for demo
    this.presetsService.initializePresets([
      {
        name: 'Admin User',
        description: 'Full admin access with all features enabled',
        config: {
          featureFlags: {
            enabled: ['new-dashboard', 'dark-mode', 'beta-features', 'new-notifications'],
            disabled: [],
          },
          permissions: {
            granted: ['can-add-users', 'can-add-permissions', 'can-manage-comments', 'can-view-dashboard', 'can-admin'],
            denied: [],
          },
          appFeatures: {
            enabled: ['analytics', 'bulk-export', 'white-label', 'notifications', 'api-access'],
            disabled: [],
          },
          i18n: { locale: 'en' },
        },
      },
      {
        name: 'Basic Viewer',
        description: 'Read-only access with minimal features',
        config: {
          featureFlags: {
            enabled: [],
            disabled: ['beta-features', 'new-notifications'],
          },
          permissions: {
            granted: ['can-view-dashboard', 'can-manage-comments'],
            denied: ['can-add-users', 'can-add-permissions', 'can-admin'],
          },
          appFeatures: {
            enabled: ['analytics'],
            disabled: ['bulk-export', 'white-label', 'api-access'],
          },
          i18n: { locale: null },
        },
      },
    ]);
  }
}
