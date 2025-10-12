import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'feature-flags',
    loadComponent: () =>
      import('./features/feature-flags/feature-flags.component').then(
        (m) => m.FeatureFlagsComponent
      ),
  },
  {
    path: 'languages',
    loadComponent: () =>
      import('./features/languages/languages.component').then(
        (m) => m.LanguagesComponent
      ),
  },
  {
    path: 'app-features',
    loadComponent: () =>
      import('./pages/app-features-demo/app-features-demo.component').then(
        (m) => m.AppFeaturesDemoComponent
      ),
  },
];
