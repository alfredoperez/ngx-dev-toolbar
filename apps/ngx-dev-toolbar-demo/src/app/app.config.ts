import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideToolbar } from 'ngx-dev-toolbar';
import { appRoutes } from './app.routes';
import { TranslocoHttpLoader } from './services/transloco-http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideToolbar({
      showLanguageTool: true,
      showFeatureFlagsTool: true,
      showAppFeaturesTool: true,
      showPermissionsTool: true,
      showPresetsTool: true,
    }),
  ],
};
