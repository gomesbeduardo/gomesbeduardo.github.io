// Ajustes de leitura e toque no celular (QA a 320/360/390/414 px).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => readFileSync(join(raiz, rel), 'utf8');
const css = ler('site/style.css');
const HOMES = ['site/index.html', 'site/en/index.html'];
const PROJETOS = ['lms', 'infohub', 'leadgate'].flatMap((p) => [`site/projeto-${p}.html`, `site/en/projeto-${p}.html`]);
// Corpo do bloco @media que começa na condição dada.
const bloco = (cond) => {
  const i = css.indexOf(cond);
  assert.ok(i >= 0, `@media ${cond} ausente`);
  let d = 0, j = css.indexOf('{', i);
  const ini = j;
  for (; j < css.length; j++) { if (css[j] === '{') d++; else if (css[j] === '}' && --d === 0) break; }
  return css.slice(ini + 1, j);
};

test('1. texto das páginas de projeto ocupa a largura toda até 860px', () => {
  const b = bloco('@media (max-width:860px){.proj section p');
  assert.match(b, /\.proj section p\s*\{[^}]*max-width:\s*none/);
});

test('2. e-mail quebra só depois do @', () => {
  assert.match(css, /\.mail\{[^}]*overflow-wrap:\s*break-word/);
  assert.doesNotMatch(css, /\.mail\{[^}]*overflow-wrap:\s*anywhere/);
  for (const f of HOMES) {
    assert.match(ler(f), /<a class="mail"[^>]*>eduardobgomes100@<wbr>gmail\.com<\/a>/, f);
  }
  assert.match(ler('site/main.js'), /writeText\('eduardobgomes100@gmail\.com'\)/);
});

test('3. links de código no GitHub têm alvo de toque de 44px', () => {
  assert.match(css, /\.link-codigo\{[^}]*display:\s*inline-flex[^}]*min-height:\s*44px/);
  for (const f of PROJETOS) {
    assert.match(ler(f), /<a class="link-codigo" href="https:\/\/github\.com\/[^"]+"/, f);
  }
});

test('4. .lang a tem largura mínima de 44px no bloco de toque', () => {
  const b = bloco('@media (pointer:coarse)');
  assert.match(b, /\.lang a\{[^}]*min-width:\s*44px/);
  assert.match(b, /\.lang a\{[^}]*(justify-content|text-align):\s*center/);
});

test('5. button.sp-word tem largura mínima de 44px no bloco de toque', () => {
  const b = bloco('@media (pointer:coarse)');
  assert.match(b, /button\.sp-word\{[^}]*min-width:\s*44px/);
});

test('6. pontuação depois de palavra-surpresa fica colada em wrapper nowrap', () => {
  assert.match(ler('site/surpresas.css'), /\.sp-cola\{[^}]*white-space:\s*nowrap/);
  for (const f of HOMES) {
    const h = ler(f);
    for (const m of h.matchAll(/<span class="sp"[^>]*>[^<]*<\/span>[.,;:!?]/g)) {
      const antes = h.slice(Math.max(0, m.index - 22), m.index);
      assert.ok(antes.endsWith('<span class="sp-cola">'), `${f}: pontuação solta em ${m[0]}`);
    }
    assert.ok((h.match(/<span class="sp-cola"><span class="sp"[^>]*>[^<]*<\/span>[.,;:!?]<\/span>/g) || []).length >= 2, f);
  }
});

test('7. "(NN h)" usa espaço sem quebra', () => {
  for (const f of HOMES) {
    const h = ler(f);
    assert.doesNotMatch(h, /\(\d+ h\)/, f);
    assert.match(h, /\(28&nbsp;h\)/, f);
    assert.match(h, /\(40&nbsp;h\)/, f);
  }
});
