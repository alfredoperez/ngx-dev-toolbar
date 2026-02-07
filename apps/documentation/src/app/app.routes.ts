import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/layout/docs-layout.component').then(m => m.DocsLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/docs/home/home-docs.component').then(m => m.HomeDocsComponent)
      },
      {
        path: 'feature-flags',
        loadComponent: () => import('./pages/docs/feature-flags/feature-flags-docs.component').then(m => m.FeatureFlagsDocsComponent)
      },
      {
        path: 'language',
        loadComponent: () => import('./pages/docs/language/language-docs.component').then(m => m.LanguageDocsComponent)
      },
      {
        path: 'permissions',
        loadComponent: () => import('./pages/docs/permissions/permissions-docs.component').then(m => m.PermissionsDocsComponent)
      },
      {
        path: 'app-features',
        loadComponent: () => import('./pages/docs/app-features/app-features-docs.component').then(m => m.AppFeaturesDocsComponent)
      },
      {
        path: 'presets',
        loadComponent: () => import('./pages/docs/presets/presets-docs.component').then(m => m.PresetsDocsComponent)
      },
      {
        path: 'guides/custom-tool',
        loadComponent: () => import('./pages/docs/guides/custom-tool/custom-tool-guide.component').then(m => m.CustomToolGuideComponent)
      }
    ]
  },
];
