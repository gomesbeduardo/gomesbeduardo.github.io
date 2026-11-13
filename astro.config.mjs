import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gomesbeduardo.github.io',
  output: 'static',
  build: { format: 'preserve', inlineStylesheets: 'never' },
  compressHTML: false,
  trailingSlash: 'ignore',
  i18n: { defaultLocale: 'pt', locales: ['pt', 'en'], routing: { prefixDefaultLocale: false } },
  vite: { plugins: [tailwindcss()] },
});
