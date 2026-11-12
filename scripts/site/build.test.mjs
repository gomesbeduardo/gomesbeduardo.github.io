// Confere o dist/ gerado pelo `astro build` contra public/ e contra site/ (referência de paridade).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const ler = (p) => readFileSync(p);

// Reduz um HTML a uma lista ordenada de tags (com atributos) e textos, sem os CSS legados nem o CSS do Astro.
export function normalizarHtml(html) {
  const semLinksCss = html
    .replace(/<link\b[^>]*rel="stylesheet"[^>]*href="[^"]*\/?(?:style|surpresas|transicoes)\.css"[^>]*>/gi, '')
    .replace(/<link\b[^>]*href="\/_astro\/[^"]*\.css"[^>]*>/gi, '')
    .replace(/^\s*<!doctype html>/i, '<!doctype html>');
  const itens = [];
  for (const m of semLinksCss.matchAll(/<(!doctype[^>]*|\/?[a-zA-Z][^\s>/]*(?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)/g)) {
    if (m[2] !== undefined) {
      const t = m[2].replace(/\s+/g, ' ').trim();
      if (t) itens.push(t);
    } else {
      const tag = m[1].replace(/\s+/g, ' ').replace(/\s*\/$/, '').trim();
      itens.push(`<${tag.startsWith('!') ? tag.toLowerCase() : tag}>`);
    }
  }
  return itens;
}

export function htmlEquivalente(arquivoA, arquivoB) {
  return [normalizarHtml(readFileSync(arquivoA, 'utf8')), normalizarHtml(readFileSync(arquivoB, 'utf8'))];
}

test('(a) estáticos do dist/ são cópias byte a byte de public/', () => {
  const arquivos = ['favicon.svg', '.nojekyll', 'inicio.js', 'main.js', 'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/lenis.min.js', ...readdirSync('public/img').map((f) => `img/${f}`)];
  for (const f of arquivos) {
    assert.ok(existsSync(`dist/${f}`), `dist/${f} existe`);
    assert.ok(ler(`dist/${f}`).equals(ler(`public/${f}`)), `dist/${f} igual a public/${f}`);
  }
  assert.ok(existsSync('dist/404.html'));
});

const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'));

test('(b) dist/_astro tem um único .css', () => assert.equal(css.length, 1, css.join(',')));

test('(c) o CSS traz view-transition, as três @font-face e os dois seletores escuros', () => {
  const c = readFileSync(`dist/_astro/${css[0]}`, 'utf8');
  assert.match(c, /@view-transition/);
  for (const f of ['Funnel Sans Fallback', 'Funnel Display Fallback', 'Reddit Mono Fallback']) assert.match(c, new RegExp(`@font-face\\s*\\{[^}]*${f}`));
  assert.match(c, /prefers-color-scheme:\s*dark/);
  assert.match(c, /:root:not\(\[data-theme=["']?light["']?\]\)/);
  assert.match(c, /:root\[data-theme=["']?dark["']?\]/);
});

test('(d) 404: dist equivale a site', () => {
  const [site, dist] = htmlEquivalente('site/404.html', 'dist/404.html');
  assert.deepEqual(dist, site);
});

const projetos = ['projeto-leadgate', 'projeto-infohub', 'projeto-lms'];
const paginasProjeto = [...projetos.map((p) => `${p}.html`), ...projetos.map((p) => `en/${p}.html`)];

test('(e) páginas de projeto: dist equivale a site', () => {
  for (const f of paginasProjeto) {
    const [site, dist] = htmlEquivalente(`site/${f}`, `dist/${f}`);
    assert.deepEqual(dist, site, f);
  }
});

// Lista ordenada das tags <script> (src e demais atributos) de um HTML.
const scripts = (arquivo) => [...readFileSync(arquivo, 'utf8').matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1].replace(/\s+/g, ' ').trim());

test('(f) 404 e projetos: tags <script> iguais em site e dist, na mesma ordem', () => {
  for (const f of ['404.html', ...paginasProjeto]) {
    assert.deepEqual(scripts(`dist/${f}`), scripts(`site/${f}`), f);
  }
});
