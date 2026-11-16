import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GH_JSON_TESTE e PUBLIC_DIR_TESTE existem só para o scripts/site/build.test.mjs (fixtures fora dos arquivos versionados).
const ghJsonTeste = process.env.GH_JSON_TESTE;
const trocaGithubJson = {
  name: 'github-json-teste',
  enforce: 'pre',
  resolveId: (id) => (/\/data\/github\.json$/.test(id) ? ghJsonTeste : null),
};

export default defineConfig({
  site: 'https://gomesbeduardo.github.io',
  output: 'static',
  build: { format: 'preserve', inlineStylesheets: 'never' },
  compressHTML: false,
  trailingSlash: 'ignore',
  i18n: { defaultLocale: 'pt', locales: ['pt', 'en'], routing: { prefixDefaultLocale: false } },
  ...(process.env.PUBLIC_DIR_TESTE && { publicDir: process.env.PUBLIC_DIR_TESTE }),
  vite: { plugins: [tailwindcss(), ...(ghJsonTeste ? [trocaGithubJson] : [])] },
});
