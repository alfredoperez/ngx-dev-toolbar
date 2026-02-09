import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideToolbar, initToolbar } from 'ngx-dev-toolbar';

/**
 * Demo build entry point - always shows the toolbar regardless of build mode.
 * Used for the deployed demo at https://alfredoperez.github.io/ngx-dev-toolbar/demo/
 */
async function bootstrap() {
  const providers = [...(appConfig.providers || []), ...provideToolbar()];

  const appRef = await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers,
  });

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

bootstrap().catch((err) => console.error(err));
