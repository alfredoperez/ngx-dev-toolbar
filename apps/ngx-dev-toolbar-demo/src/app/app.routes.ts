import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'feature-flags',
    pathMatch: 'full',
  },
  {
    path: 'feature-flags',
    loadComponent: () =>
      import('./components/feature-flags-demo/feature-flags-demo.component').then(
        (m) => m.FeatureFlagsDemoComponent
      ),
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import('./components/permission-demo/permission-demo.component').then(
        (m) => m.PermissionDemoComponent
      ),
  },
  {
    path: 'app-features',
    loadComponent: () =>
      import('./components/app-features-demo/app-features-demo.component').then(
        (m) => m.AppFeaturesDemoComponent
      ),
  },
];
