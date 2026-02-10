import {
  ApplicationRef,
  createComponent,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import { ToolbarComponent } from './toolbar.component';
import { ToolbarConfig } from './models/toolbar-config.interface';
import {
  TOOLBAR_APP_FEATURES,
  TOOLBAR_CONFIG,
  TOOLBAR_FEATURE_FLAGS,
  TOOLBAR_LANGUAGE,
  TOOLBAR_PERMISSIONS,
} from './tokens';
import { ToolbarFeatureFlagService } from './tools/feature-flags-tool/feature-flags.service';
import { ToolbarPermissionsService } from './tools/permissions-tool/permissions.service';
import { ToolbarLanguageService } from './tools/language-tool/language.service';
import { ToolbarAppFeaturesService } from './tools/app-features-tool/app-features.service';

/**
 * Provides all ngx-dev-toolbar services and automatically attaches the toolbar to the DOM.
 *
 * This is the recommended way to set up the toolbar. Add it to your `app.config.ts`
 * alongside other providers like `provideRouter()` and `provideHttpClient()`.
 *
 * ## Basic Usage
 *
 * ```typescript
 * // app.config.ts
 * import { ApplicationConfig, isDevMode } from '@angular/core';
 * import { provideToolbar } from 'ngx-dev-toolbar';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideRouter(appRoutes),
 *     provideToolbar({
 *       enabled: isDevMode(),
 *       showFeatureFlagsTool: true,
 *       showPermissionsTool: true,
 *     }),
 *   ],
 * };
 * ```
 *
 * ```typescript
 * // main.ts
 * bootstrapApplication(AppComponent, appConfig);
 * ```
 *
 * ## Using Services with Tokens
 *
 * ```typescript
 * import { inject } from '@angular/core';
 * import { TOOLBAR_FEATURE_FLAGS } from 'ngx-dev-toolbar';
 * import type { ToolbarService, ToolbarFlag } from 'ngx-dev-toolbar';
 *
 * @Injectable({ providedIn: 'root' })
 * export class FeatureFlagsService {
 *   // Optional injection - null in production
 *   private devToolbar = inject<ToolbarService<ToolbarFlag>>(
 *     TOOLBAR_FEATURE_FLAGS,
 *     { optional: true }
 *   );
 *
 *   constructor() {
 *     // Safe to call - no-op if devToolbar is null
 *     this.devToolbar?.setAvailableOptions(this.flags);
 *
 *     // Subscribe to forced values only if toolbar exists
 *     this.devToolbar?.getForcedValues().subscribe(forced => {
 *       // Merge forced values
 *     });
 *   }
 * }
 * ```
 *
 * @param config - Optional configuration for toolbar behavior and tool visibility
 * @returns Angular EnvironmentProviders for all toolbar services
 */
export function provideToolbar(config?: ToolbarConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TOOLBAR_FEATURE_FLAGS, useClass: ToolbarFeatureFlagService },
    { provide: TOOLBAR_PERMISSIONS, useClass: ToolbarPermissionsService },
    { provide: TOOLBAR_LANGUAGE, useClass: ToolbarLanguageService },
    { provide: TOOLBAR_APP_FEATURES, useClass: ToolbarAppFeaturesService },
    { provide: TOOLBAR_CONFIG, useValue: config ?? {} },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const appRef = inject(ApplicationRef);
        const injector = inject(EnvironmentInjector);
        const toolbarConfig = inject(TOOLBAR_CONFIG);

        const componentRef = createComponent(ToolbarComponent, {
          environmentInjector: injector,
        });
        componentRef.setInput('config', toolbarConfig);
        document.body.appendChild(componentRef.location.nativeElement);
        appRef.attachView(componentRef.hostView);
      },
    },
  ]);
}
