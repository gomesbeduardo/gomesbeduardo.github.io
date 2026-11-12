// T9/C9: tokens do @theme em src/styles/global.css apontam para as variáveis antigas de legado/style.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const global = readFileSync('src/styles/global.css', 'utf8');
const legado = readFileSync('src/styles/legado/style.css', 'utf8');

const tema = (global.match(/@theme inline\s*\{([\s\S]*?)\n\}/) || [])[1] ?? '';
const decls = (txt) => Object.fromEntries([...txt.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const token = decls(tema);
const raiz = decls((legado.match(/:root\{([\s\S]*?)\n\}/) || [])[1] ?? '');

const cores = { bg: 'bg', 'bg-2': 'bg-2', raised: 'raised', fg: 'fg', muted: 'muted', 'muted-2': 'muted2', line: 'line', 'line-strong': 'line-strong', accent: 'accent', 'on-accent': 'on-accent', card: 'card', hi: 'hi', edge: 'edge' };
const espacos = { ...Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`s${i + 1}`, `s${i + 1}`])), section: 'section', 'after-h2': 'after-h2', gutter: 'gutter', 'col-gap': 'col-gap', wrap: 'wrap' };
const raios = { sm: 'r-sm', md: 'r-md', pill: 'r-pill' };
const textos = Object.fromEntries(['body', 'small', 'h3', 'h2', 'display', 'label', 'data'].map((n) => [n, `t-${n}`]));
const fontes = { display: 'f-display', sans: 'f-sans', mono: 'f-mono' };

test('@theme inline existe', () => assert.ok(tema.length > 0));

test('cores apontam para var(--antiga) definida em :root', () => {
  for (const [novo, antigo] of Object.entries(cores)) {
    assert.equal(token[`--color-${novo}`], `var(--${antigo})`, `--color-${novo}`);
    assert.ok(`--${antigo}` in raiz, `--${antigo} em :root`);
  }
});

test('espaço, raio, texto e fonte têm o valor da variável antiga', () => {
  const grupos = [['spacing', espacos], ['radius', raios], ['text', textos], ['font', fontes]];
  for (const [ns, mapa] of grupos) {
    for (const [novo, antigo] of Object.entries(mapa)) {
      assert.ok(`--${antigo}` in raiz, `--${antigo} em :root`);
      assert.equal(token[`--${ns}-${novo}`], raiz[`--${antigo}`], `--${ns}-${novo}`);
    }
  }
  assert.equal(token['--ease'], raiz['--ease']);
});

test('hex da paleta Ocre: claro em :root, escuro nos dois blocos escuros', () => {
  const raizTxt = (legado.match(/:root\{[\s\S]*?\n\}/) || [''])[0];
  for (const h of ['#e9e1d2', '#e0d6c4', '#f1ebdf', '#241d14', '#5c503d', '#c9bda6', '#a89c86', '#8a4f00', '#fff8ec']) assert.ok(raizTxt.includes(h), h);
  const blocoMedia = (legado.match(/@media \(prefers-color-scheme:dark\)\{[\s\S]*?\n\}/) || [''])[0];
  const blocoAttr = (legado.match(/:root\[data-theme="dark"\]\{[\s\S]*?color-scheme:dark\}/) || [''])[0];
  assert.ok(blocoMedia && blocoAttr, 'blocos escuros encontrados');
  for (const h of ['#15120e', '#1b1712', '#221d17', '#f1e9dc', '#b0a592', '#3a3228', '#5d5548']) {
    assert.ok(blocoMedia.includes(h), `media ${h}`);
    assert.ok(blocoAttr.includes(h), `attr ${h}`);
  }
  // acento escuro e seu "on" ficam em --acc-d/--onacc-d de :root; os blocos escuros os referenciam.
  for (const h of ['#e4a843', '#17110a']) assert.ok(raizTxt.includes(h), h);
  for (const bloco of [blocoMedia, blocoAttr]) assert.ok(bloco.includes('--accent:var(--acc-d)') && bloco.includes('--on-accent:var(--onacc-d)'));
});

test('sem Preflight nem @import "tailwindcss"', () => {
  assert.doesNotMatch(global, /@import\s+["']tailwindcss["']/);
  assert.doesNotMatch(global, /preflight/i);
});
