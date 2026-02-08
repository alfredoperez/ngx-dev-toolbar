import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
  site: 'https://alfredoperez.github.io',
  base: '/ngx-dev-toolbar',
  output: 'static',
  outDir: '../../dist/apps/docs',
  integrations: [
    starlight({
      title: 'Angular Toolbar',
      pagefind: false,
      plugins: [starlightLinksValidator({ exclude: ['/ngx-dev-toolbar/demo/'] })],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/alfredoperez/ngx-dev-toolbar',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [{ label: 'Introduction', slug: 'getting-started' }],
        },
        {
          label: 'Tools',
          items: [
            { label: 'Feature Flags', slug: 'feature-flags' },
            { label: 'Language', slug: 'language' },
            { label: 'Permissions', slug: 'permissions' },
            { label: 'App Features', slug: 'app-features' },
            { label: 'Presets', slug: 'presets' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Create a Custom Tool', slug: 'guides/custom-tool' },
          ],
        },
      ],
      customCss: [
        './src/styles/custom.css',
        '@fontsource/plus-jakarta-sans/400.css',
        '@fontsource/plus-jakarta-sans/600.css',
        '@fontsource/plus-jakarta-sans/700.css',
        '@fontsource/plus-jakarta-sans/800.css',
        '@fontsource/jetbrains-mono/400.css',
      ],
      expressiveCode: {
        themes: ['houston'],
        defaultProps: {
          wrap: true,
        },
      },
    }),
  ],
});
