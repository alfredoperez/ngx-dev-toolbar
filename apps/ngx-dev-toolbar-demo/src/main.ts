import { bootstrapApplication } from '@angular/platform-browser';
import { isDevMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideToolbar, initToolbar } from 'ngx-dev-toolbar';

async function bootstrap() {
  // Add toolbar providers for service injection
  let providers = [...(appConfig.providers || [])];

  if (isDevMode()) {
    providers = [...providers, ...provideToolbar()];
  }

  const appRef = await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers,
  });

  // Initialize toolbar UI
  if (isDevMode()) {
    initToolbar(appRef, {
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
