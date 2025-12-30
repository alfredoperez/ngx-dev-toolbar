import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

import {
  DevToolbarAppFeaturesService,
  DevToolbarComponent,
  DevToolbarConfig,
  DevToolbarFeatureFlagService,
  DevToolbarFlag,
  DevToolbarLanguageService,
  DevToolbarToolComponent,
  DevToolbarWindowOptions,
} from 'ngx-dev-toolbar';
import { firstValueFrom, map } from 'rxjs';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { ToolbarStatusSummaryComponent } from './components/toolbar-status-summary/toolbar-status-summary.component';
import { PermissionDemoComponent } from './components/permission-demo/permission-demo.component';
import { FeatureFlagsDemoComponent } from './components/feature-flags-demo/feature-flags-demo.component';
import { AppFeaturesDemoComponent } from './components/app-features-demo/app-features-demo.component';
import { AnalyticsService } from './services/analytics.service';
import { AppFeaturesConfigService } from './services/app-features-config.service';
import { FeatureFlagsService } from './services/feature-flags.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavBarComponent,
    ToolbarStatusSummaryComponent,
    PermissionDemoComponent,
    FeatureFlagsDemoComponent,
    AppFeaturesDemoComponent,
    DevToolbarComponent,
    DevToolbarToolComponent,
  ],
  template: `
    @if (useNewLayout() ) {
    <!-- New Modern Layout -->
    <div class="modern-layout">
      <app-nav-bar />
      <main class="modern-content">
        <div class="detailed-demos">
          <app-feature-flags-demo />
          <app-permission-demo />
          <app-features-demo />
        </div>
        <app-toolbar-status-summary />
        <router-outlet />
      </main>
    </div>
    } @else {
    <div class="original-layout">
      <app-nav-bar />
      <main class="content">
        <div class="detailed-demos">
          <app-feature-flags-demo />
          <app-permission-demo />
          <app-features-demo />
        </div>
        <app-toolbar-status-summary />
        <router-outlet />
      </main>
    </div>
    }
    <ndt-toolbar [config]="toolbarConfig">
      <ndt-toolbar-tool
        [options]="options"
        [icon]="'bolt'"
        [title]="'Settings'"
      >
        <p>This is a custom tool</p>
      </ndt-toolbar-tool>
    </ndt-toolbar>
  `,
  styles: [
    `
      .modern-layout {
        min-height: 100vh;
        background: #f0f2f5;
      }
      .modern-content {
        max-width: 1600px;
        margin: 0 auto;
        padding: 0;
      }

      .detailed-demos {
        margin-top: 2rem;
        padding: 0 2rem 2rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 3rem;
      }

      .detailed-demos > * {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .original-layout {
        background: #f0f2f5;
        min-height: 100vh;
      }

      .original-layout .content {
        max-width: 1600px;
        margin: 0 auto;
        padding: 0;
      }

      .original-layout .detailed-demos {
        margin-top: 2rem;
        padding: 0 1rem 1rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .original-layout .detailed-demos > * {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      @media (max-width: 768px) {
        .detailed-demos {
          padding: 0 1rem 1rem 1rem;
          gap: 1.5rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private readonly languageToolbarService = inject(DevToolbarLanguageService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly translocoService = inject(TranslocoService);
  private readonly devToolbarFeatureFlagsService = inject(
    DevToolbarFeatureFlagService
  );
  private readonly featureFlagsService = inject(FeatureFlagsService);
  private readonly devToolbarAppFeaturesService = inject(
    DevToolbarAppFeaturesService
  );
  public readonly appFeaturesConfig = inject(AppFeaturesConfigService);

  originalLang = this.translocoService.getActiveLang();

  public options = {
    title: 'Test',
    description: 'Test',
    isClosable: true,
    size: 'medium',
    id: 'test',
    isBeta: true,
  } as DevToolbarWindowOptions;

  public toolbarConfig: DevToolbarConfig = {
    showLanguageTool: true,
    showFeatureFlagsTool: true,
    showAppFeaturesTool: true,
    showPermissionsTool: true,
    showPresetsTool: true,
  };

  useNewLayout = toSignal(
    this.featureFlagsService.select('newDemoApplicationLayout')
  );

  ngOnInit(): void {
    this.loadFlags();
    this.analyticsService.trackEvent('Loaded Application', '--', '--');
  }

  private async loadFlags(): Promise<void> {
    // Gets the flags from the application and sets them in the dev toolbar
    const flags: DevToolbarFlag[] = await firstValueFrom(
      this.featureFlagsService.flags$.pipe(
        map((flags) =>
          flags.map(
            (flag) =>
              ({
                id: flag.name,
                name: flag.name,
                description: flag.description,
                isEnabled: flag.enabled,
              } as DevToolbarFlag)
          )
        )
      )
    );
    this.devToolbarFeatureFlagsService.setAvailableOptions(flags);
  }

  constructor() {
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
    // Get all features across all tiers for the dev toolbar
    const features = this.appFeaturesConfig.getAllFeatures();
    this.devToolbarAppFeaturesService.setAvailableOptions(features);

    // Subscribe to forced feature overrides from the dev toolbar
    this.devToolbarAppFeaturesService
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
