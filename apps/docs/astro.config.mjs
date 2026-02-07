import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://alfredoperez.github.io',
  base: '/ngx-dev-toolbar',
  output: 'static',
  outDir: '../../dist/apps/docs',
  integrations: [
    tailwind(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'night-owl',
      wrap: true,
    },
  },
});
