import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideToolbar } from 'ngx-dev-toolbar';
import { appRoutes } from './app.routes';
import { TranslocoHttpLoader } from './services/transloco-http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { allowEmpty: true },
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslateService({
      fallbackLang: 'en',
    }),
    provideTranslateHttpLoader({
      prefix: './assets/i18n-ngx-translate/',
    }),
    provideToolbar({
      showI18nTool: true,
      showFeatureFlagsTool: true,
      showAppFeaturesTool: true,
      showPermissionsTool: true,
      showPresetsTool: true,
    }),
  ],
};
