import { InjectionToken } from '@angular/core';
import { DevToolsService } from './models/dev-tools.interface';
import { DevToolbarAppFeature } from './tools/app-features-tool/app-features.models';
import { DevToolbarFlag } from './tools/feature-flags-tool/feature-flags.models';
import { Language } from './tools/language-tool/language.models';
import { DevToolbarPermission } from './tools/permissions-tool/permissions.models';

/**
 * InjectionToken for the Feature Flags service.
 *
 * Use this token for tree-shakeable injection of the feature flags service.
 * When using dynamic imports, this token enables complete tree-shaking of
 * the toolbar in production builds.
 *
 * @example
 * ```typescript
 * // In your service
 * private devToolbar = inject(DEV_TOOLBAR_FEATURE_FLAGS, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(flags);
 * ```
 */
export const DEV_TOOLBAR_FEATURE_FLAGS = new InjectionToken<
  DevToolsService<DevToolbarFlag>
>('DEV_TOOLBAR_FEATURE_FLAGS');

/**
 * InjectionToken for the Permissions service.
 *
 * Use this token for tree-shakeable injection of the permissions service.
 * When using dynamic imports, this token enables complete tree-shaking of
 * the toolbar in production builds.
 *
 * @example
 * ```typescript
 * // In your service
 * private devToolbar = inject(DEV_TOOLBAR_PERMISSIONS, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(permissions);
 * ```
 */
export const DEV_TOOLBAR_PERMISSIONS = new InjectionToken<
  DevToolsService<DevToolbarPermission>
>('DEV_TOOLBAR_PERMISSIONS');

/**
 * InjectionToken for the Language service.
 *
 * Use this token for tree-shakeable injection of the language service.
 * When using dynamic imports, this token enables complete tree-shaking of
 * the toolbar in production builds.
 *
 * @example
 * ```typescript
 * // In your service
 * private devToolbar = inject(DEV_TOOLBAR_LANGUAGE, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(languages);
 * ```
 */
export const DEV_TOOLBAR_LANGUAGE = new InjectionToken<
  DevToolsService<Language>
>('DEV_TOOLBAR_LANGUAGE');

/**
 * InjectionToken for the App Features service.
 *
 * Use this token for tree-shakeable injection of the app features service.
 * When using dynamic imports, this token enables complete tree-shaking of
 * the toolbar in production builds.
 *
 * @example
 * ```typescript
 * // In your service
 * private devToolbar = inject(DEV_TOOLBAR_APP_FEATURES, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(features);
 * ```
 */
export const DEV_TOOLBAR_APP_FEATURES = new InjectionToken<
  DevToolsService<DevToolbarAppFeature>
>('DEV_TOOLBAR_APP_FEATURES');
