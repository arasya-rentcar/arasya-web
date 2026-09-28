import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://arasyarentcar.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    sanity({
      projectId: 'w5eya3q9',
      dataset: 'production',
      apiVersion: '2025-01-01',
      useCdn: false,
      studioBasePath: '/studio',
    }),
    react(),
  ],
});
