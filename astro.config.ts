import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/config/site';

export default defineConfig({
  site: process.env.SITE_URL || SITE.url,
  base: process.env.BASE_PATH || '/',
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
