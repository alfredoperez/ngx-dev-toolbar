import { InjectionToken } from '@angular/core';
import { ToolbarConfig } from './models/toolbar-config.interface';
import { ToolbarService } from './models/toolbar.interface';
import { ToolbarAppFeature } from './tools/app-features-tool/app-features.models';
import { ToolbarFlag } from './tools/feature-flags-tool/feature-flags.models';
import { Language } from './tools/language-tool/language.models';
import { ToolbarPermission } from './tools/permissions-tool/permissions.models';

/**
 * InjectionToken for the Toolbar configuration.
 *
 * Provided automatically by `provideToolbar(config)`.
 * Can be injected to access the toolbar configuration at runtime.
 */
export const TOOLBAR_CONFIG = new InjectionToken<ToolbarConfig>(
  'TOOLBAR_CONFIG'
);

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
 * private devToolbar = inject(TOOLBAR_FEATURE_FLAGS, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(flags);
 * ```
 */
export const TOOLBAR_FEATURE_FLAGS = new InjectionToken<
  ToolbarService<ToolbarFlag>
>('TOOLBAR_FEATURE_FLAGS');

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
 * private devToolbar = inject(TOOLBAR_PERMISSIONS, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(permissions);
 * ```
 */
export const TOOLBAR_PERMISSIONS = new InjectionToken<
  ToolbarService<ToolbarPermission>
>('TOOLBAR_PERMISSIONS');

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
 * private devToolbar = inject(TOOLBAR_LANGUAGE, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(languages);
 * ```
 */
export const TOOLBAR_LANGUAGE = new InjectionToken<
  ToolbarService<Language>
>('TOOLBAR_LANGUAGE');

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
 * private devToolbar = inject(TOOLBAR_APP_FEATURES, { optional: true });
 *
 * // Safe to call - no-op if toolbar is not provided
 * this.devToolbar?.setAvailableOptions(features);
 * ```
 */
export const TOOLBAR_APP_FEATURES = new InjectionToken<
  ToolbarService<ToolbarAppFeature>
>('TOOLBAR_APP_FEATURES');
