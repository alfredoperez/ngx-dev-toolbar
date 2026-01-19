import { Provider } from '@angular/core';
import {
  DEV_TOOLBAR_APP_FEATURES,
  DEV_TOOLBAR_FEATURE_FLAGS,
  DEV_TOOLBAR_LANGUAGE,
  DEV_TOOLBAR_PERMISSIONS,
} from './tokens';
import { DevToolbarFeatureFlagService } from './tools/feature-flags-tool/feature-flags.service';
import { DevToolbarPermissionsService } from './tools/permissions-tool/permissions.service';
import { DevToolbarLanguageService } from './tools/language-tool/language.service';
import { DevToolbarAppFeaturesService } from './tools/app-features-tool/app-features.service';

/**
 * Provides all ngx-dev-toolbar services using InjectionTokens.
 *
 * Use this function for tree-shakeable toolbar integration. When combined with
 * dynamic imports, the toolbar code is completely excluded from production builds.
 *
 * ## Basic Usage (Development Only)
 *
 * ```typescript
 * // main.ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { AppComponent } from './app/app.component';
 * import { environment } from './environments/environment';
 *
 * async function bootstrap() {
 *   const providers = [];
 *
 *   // Only import toolbar in development - completely tree-shaken in prod
 *   if (!environment.production) {
 *     const { provideDevToolbar } = await import('ngx-dev-toolbar');
 *     providers.push(...provideDevToolbar());
 *   }
 *
 *   bootstrapApplication(AppComponent, { providers });
 * }
 *
 * bootstrap();
 * ```
 *
 * ## Using Services with Tokens
 *
 * ```typescript
 * import { inject } from '@angular/core';
 * import { DEV_TOOLBAR_FEATURE_FLAGS } from 'ngx-dev-toolbar';
 * import type { DevToolsService, DevToolbarFlag } from 'ngx-dev-toolbar';
 *
 * @Injectable({ providedIn: 'root' })
 * export class FeatureFlagsService {
 *   // Optional injection - null in production
 *   private devToolbar = inject<DevToolsService<DevToolbarFlag>>(
 *     DEV_TOOLBAR_FEATURE_FLAGS,
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
 * ## Production Bundle Impact
 *
 * | What's Included | Production | Development |
 * |-----------------|------------|-------------|
 * | InjectionTokens | ~500 bytes | ~500 bytes |
 * | Type interfaces | 0 (types only) | 0 (types only) |
 * | Service implementations | 0 | ~15KB |
 * | UI Components | 0 | ~30KB |
 * | Total | **~500 bytes** | ~45KB |
 *
 * @returns Array of Angular providers for all toolbar services
 */
export function provideDevToolbar(): Provider[] {
  return [
    { provide: DEV_TOOLBAR_FEATURE_FLAGS, useClass: DevToolbarFeatureFlagService },
    { provide: DEV_TOOLBAR_PERMISSIONS, useClass: DevToolbarPermissionsService },
    { provide: DEV_TOOLBAR_LANGUAGE, useClass: DevToolbarLanguageService },
    { provide: DEV_TOOLBAR_APP_FEATURES, useClass: DevToolbarAppFeaturesService },
  ];
}
