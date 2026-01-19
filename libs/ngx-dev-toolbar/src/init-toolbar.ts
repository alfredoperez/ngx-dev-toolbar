import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { ToolbarComponent } from './toolbar.component';
import { ToolbarConfig } from './models/toolbar-config.interface';
import { provideToolbar } from './provide-toolbar';

/**
 * Options for initializing the toolbar dynamically.
 */
export interface InitToolbarOptions {
  /**
   * Configuration for the toolbar behavior.
   * Controls which tools are visible and whether the toolbar is enabled.
   */
  config?: ToolbarConfig;
}

/**
 * Result of initializing the toolbar.
 */
export interface InitToolbarResult {
  /**
   * Removes the toolbar from the DOM and cleans up resources.
   * Call this when you want to completely remove the toolbar.
   */
  destroy: () => void;
}

/**
 * Dynamically attaches the Angular Toolbar to the DOM without template changes.
 *
 * This function creates and attaches the toolbar component directly to the document body,
 * eliminating the need to add `<ngt-toolbar>` to your component templates. Combined with
 * dynamic imports, this provides true zero production bundle impact.
 *
 * ## Basic Usage
 *
 * ```typescript
 * // main.ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { AppComponent } from './app/app.component';
 * import { environment } from './environments/environment';
 *
 * async function bootstrap() {
 *   const appRef = await bootstrapApplication(AppComponent);
 *
 *   // Only import and initialize toolbar in development
 *   if (!environment.production) {
 *     const { initToolbar } = await import('ngx-dev-toolbar');
 *     initToolbar(appRef);
 *   }
 * }
 *
 * bootstrap();
 * ```
 *
 * ## With Configuration
 *
 * ```typescript
 * if (!environment.production) {
 *   const { initToolbar } = await import('ngx-dev-toolbar');
 *   initToolbar(appRef, {
 *     config: {
 *       enabled: true,
 *       showFeatureFlagsTool: true,
 *       showPermissionsTool: true,
 *       showLanguageTool: false,
 *     }
 *   });
 * }
 * ```
 *
 * ## Cleanup
 *
 * ```typescript
 * const { destroy } = initToolbar(appRef);
 *
 * // Later, to remove the toolbar
 * destroy();
 * ```
 *
 * ## Benefits
 *
 * 1. **Zero template changes** - No `<ngt-toolbar>` needed in any component
 * 2. **Complete isolation** - Toolbar exists outside the app's component tree
 * 3. **Easy to add/remove** - Single line in main.ts
 * 4. **True tree-shaking** - Dynamic import means it's completely excluded from prod
 *
 * ## Production Bundle Impact
 *
 * When using dynamic imports with `initToolbar()`:
 * - Production bundle: 0 bytes from toolbar
 * - Development only: ~45KB (services + UI components)
 *
 * @param appRef - The ApplicationRef from bootstrapApplication()
 * @param options - Optional configuration for the toolbar
 * @returns Object with destroy() method for cleanup
 */
export function initToolbar(
  appRef: ApplicationRef,
  options?: InitToolbarOptions
): InitToolbarResult {
  const injector = appRef.injector.get(EnvironmentInjector);

  // Create the toolbar component dynamically
  const componentRef = createComponent(ToolbarComponent, {
    environmentInjector: injector,
  });

  // Apply config if provided
  if (options?.config) {
    componentRef.setInput('config', options.config);
  }

  // Append to document body
  document.body.appendChild(componentRef.location.nativeElement);

  // Register for change detection
  appRef.attachView(componentRef.hostView);

  return {
    destroy: () => {
      appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      componentRef.location.nativeElement.remove();
    },
  };
}

/**
 * Convenience function that combines provideToolbar() and initToolbar().
 *
 * Use this when you want to set up both the service providers and the UI in one call.
 * This is the recommended approach for most applications.
 *
 * ## Usage
 *
 * ```typescript
 * // main.ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { AppComponent } from './app/app.component';
 * import { environment } from './environments/environment';
 *
 * async function bootstrap() {
 *   let providers = [];
 *
 *   // Set up toolbar providers before bootstrap
 *   if (!environment.production) {
 *     const { provideToolbar } = await import('ngx-dev-toolbar');
 *     providers = provideToolbar();
 *   }
 *
 *   const appRef = await bootstrapApplication(AppComponent, { providers });
 *
 *   // Initialize toolbar UI after bootstrap
 *   if (!environment.production) {
 *     const { initToolbar } = await import('ngx-dev-toolbar');
 *     initToolbar(appRef, {
 *       config: {
 *         showFeatureFlagsTool: true,
 *         showPermissionsTool: true,
 *       }
 *     });
 *   }
 * }
 *
 * bootstrap();
 * ```
 *
 * ## Complete Setup in One Place
 *
 * ```typescript
 * // main.ts - Complete setup
 * async function bootstrap() {
 *   const providers = [];
 *
 *   if (!environment.production) {
 *     const toolbar = await import('ngx-dev-toolbar');
 *     providers.push(...toolbar.provideToolbar());
 *   }
 *
 *   const appRef = await bootstrapApplication(AppComponent, { providers });
 *
 *   if (!environment.production) {
 *     const toolbar = await import('ngx-dev-toolbar');
 *     toolbar.initToolbar(appRef, {
 *       config: {
 *         showFeatureFlagsTool: true,
 *         showPermissionsTool: true,
 *       }
 *     });
 *   }
 * }
 * ```
 */
// Re-export provideToolbar for convenience
export { provideToolbar };
