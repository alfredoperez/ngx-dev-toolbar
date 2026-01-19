import { Provider } from '@angular/core';
import {
  TOOLBAR_APP_FEATURES,
  TOOLBAR_FEATURE_FLAGS,
  TOOLBAR_LANGUAGE,
  TOOLBAR_PERMISSIONS,
} from './tokens';
import { ToolbarFeatureFlagService } from './tools/feature-flags-tool/feature-flags.service';
import { ToolbarPermissionsService } from './tools/permissions-tool/permissions.service';
import { ToolbarLanguageService } from './tools/language-tool/language.service';
import { ToolbarAppFeaturesService } from './tools/app-features-tool/app-features.service';

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
 *     const { provideToolbar } = await import('ngx-dev-toolbar');
 *     providers.push(...provideToolbar());
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
export function provideToolbar(): Provider[] {
  return [
    { provide: TOOLBAR_FEATURE_FLAGS, useClass: ToolbarFeatureFlagService },
    { provide: TOOLBAR_PERMISSIONS, useClass: ToolbarPermissionsService },
    { provide: TOOLBAR_LANGUAGE, useClass: ToolbarLanguageService },
    { provide: TOOLBAR_APP_FEATURES, useClass: ToolbarAppFeaturesService },
  ];
}
