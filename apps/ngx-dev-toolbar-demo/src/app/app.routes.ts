import { Routes } from '@angular/router';

export const routes: Routes = [
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
];
