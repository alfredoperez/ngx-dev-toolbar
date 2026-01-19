import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';

async function bootstrap() {
  // Add toolbar providers for service injection
  let providers = [...(appConfig.providers || [])];

  if (isDevMode()) {
    const { provideDevToolbar } = await import('ngx-dev-toolbar');
    providers = [...providers, ...provideDevToolbar()];
  }

  const appRef = await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers,
  });

  // Initialize toolbar UI
  if (isDevMode()) {
    const { initDevToolbar } = await import('ngx-dev-toolbar');
    initDevToolbar(appRef, {
      config: {
        showLanguageTool: true,
        showFeatureFlagsTool: true,
        showAppFeaturesTool: true,
        showPermissionsTool: true,
        showPresetsTool: true,
      },
    });
  }
}

bootstrap().catch((err) => console.error(err));
