// Testes estáticos da spec 005: virada da foto do topo em carta de duas faces.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => readFileSync(join(raiz, rel), 'utf8');
const js = ler('site/surpresas.js');
const css = ler('site/surpresas.css');
const estilo = ler('site/style.css');
const main = ler('site/main.js');

// Retorna o corpo de um bloco `@media (...) { ... }` pela chave de abertura.
const bloco = (src, inicio) => {
  const i = src.indexOf(inicio);
  assert.ok(i >= 0, `bloco não encontrado: ${inicio}`);
  let d = 0, j = src.indexOf('{', i);
  const ini = j;
  for (; j < src.length; j++) { if (src[j] === '{') d++; if (src[j] === '}' && --d === 0) break; }
  return src.slice(ini + 1, j);
};


test('verso: rótulos da ficha em mono e c10 inalterada', () => {
  assert.match(js, /Sou cofundador do YourMentor desde outubro de 2025, quando ele ainda se chamava Mentor\.Me\./);
  assert.match(js, /I have been a co-founder of YourMentor since October 2025, back when it was called Mentor\.Me\./);
  assert.match(css, /\.sp-ficha dt\{[^}]*var\(--f-mono\)/);
});

test('C4: .photo.virado não fixa largura nem proporção própria no desktop', () => {
  const todo = css + estilo;
  const regras = [...todo.matchAll(/(^|\})\s*([^{}@]*\.photo\.virado[^{}]*)\{([^}]*)\}/g)];
  for (const [, , sel, corpo] of regras) {
    assert.doesNotMatch(corpo, /(^|;)\s*width\s*:/, `largura fixa em ${sel.trim()}`);
    assert.doesNotMatch(corpo, /aspect-ratio\s*:\s*auto/, `aspect-ratio auto em ${sel.trim()}`);
  }
  assert.doesNotMatch(css, /\.photo[^{]*\{[^}]*min\(320px/);
});

test('C1/C2: as duas faces usam backface-visibility e o giro usa --ease', () => {
  assert.match(css, /\.photo-card[^{]*\{[^}]*transform-style:\s*preserve-3d/);
  assert.match(css, /\.photo[^{]*\.sp-verso[^{]*\{[^}]*backface-visibility:\s*hidden/);
  assert.match(css, /\.photo[^{]*\.photo-btn[^{]*\{[^}]*backface-visibility:\s*hidden/);
  assert.match(css, /\.photo-card\{[^}]*transition:\s*transform\s+\.5s\s+var\(--ease\)/);
  assert.match(css, /rotateY\(180deg\)/);
  assert.match(css, /\.photo-card\{[^}]*perspective\(/); // perspectiva na própria transformação: não muda a caixa
});

test('C3: o bloco ocre fica no .photo, que não gira nem é ocultado', () => {
  assert.match(estilo, /\.photo::before\{[^}]*var\(--accent\)/);
  assert.doesNotMatch(estilo, /\.photo \.photo-btn::before/);
  assert.doesNotMatch(estilo, /\.photo\.virado \.photo-btn\{display:none/);
  assert.doesNotMatch(css, /\.photo\.virado\s*\{[^}]*display:\s*none/);
});

test('C8: movimento reduzido sem rotação e com fade de até 150ms', () => {
  const r = bloco(css, '@media (prefers-reduced-motion:reduce){');
  assert.match(r, /\.photo-card\{[^}]*transform:\s*none/);
  assert.match(r, /\.photo[^{]*\.sp-verso[^{]*\{[^}]*transform:\s*none/);
  const tempos = [...r.matchAll(/\.photo[^{]*\{[^}]*?(?:transition|animation)[^;}]*?(\.\d+|\d+)(ms|s)/g)];
  assert.ok(tempos.length > 0, 'sem fade para a foto');
  for (const [, n, u] of tempos) assert.ok(parseFloat(n) * (u === 's' ? 1000 : 1) <= 150, 'fade passa de 150ms');
});

test('C5: a inclinação do mouse respeita o estado virado/girando', () => {
  assert.match(main, /photo[\s\S]{0,400}(virado|girando)/);
});

test('C10: a face de costas fica inert (e a da frente quando virado)', () => {
  assert.match(js, /inert/);
  assert.match(js, /setAttribute\('aria-hidden'/);
});

test('C6: no celular não há troca de tamanho (sem .grande) e o verso esconde rótulo e ficha', () => {
  assert.doesNotMatch(css, /grande/);
  assert.doesNotMatch(js, /grande/);
  const m = bloco(css, '@media (max-width:860px){');
  assert.match(m, /\.sp-verso \.sec-label[^{]*\{[^}]*display:\s*none/);
  assert.match(m, /\.sp-ficha[^{]*\{[^}]*display:\s*none/);
});

test('legibilidade: .sp-ficha dd nunca abaixo de .8125rem', () => {
  const m = css.match(/\.sp-ficha dd\{[^}]*font-size:([^;}]+)/);
  assert.ok(m, 'regra de .sp-ficha dd sem font-size');
  const mins = [...m[1].matchAll(/([\d.]+)rem/g)].map((x) => parseFloat(x[1]));
  assert.ok(mins.length > 0 && Math.min(...mins) >= 0.8125, `font-size: ${m[1]}`);
});

test('C1a: a borda de 1px é da própria face (botão e verso), não só da img', () => {
  assert.match(css, /\.photo \.photo-btn\{[^}]*border:\s*1px solid var\(--line-strong\)/);
  assert.match(css, /\.photo \.sp-verso\{[^}]*border:\s*1px solid var\(--line-strong\)/);
  assert.doesNotMatch(estilo, /\.photo \.photo-btn img\{[^}]*border:\s*1px/);
  const r = bloco(css, '@media (prefers-reduced-motion:reduce){');
  assert.match(r, /\.photo-card\{[^}]*border:\s*1px solid var\(--line-strong\)/); // no fade, a borda fica no card
});

test('F4: traj-card e .sp-mais seguem o caminho genérico', () => {
  assert.match(js, /closest\('\[data-flip\], \.traj-card, \.sp-mais'\)/);
  assert.match(js, /function animar\(/);
});

for (const [lang, arq] of [['PT', 'site/index.html'], ['EN', 'site/en/index.html']]) {
  test(`marcação (${lang}): #sp-foto dentro de .photo-card dentro de .photo[data-flip]`, () => {
    assert.match(ler(arq), /<div class="photo" data-flip><div class="photo-card"><button[^>]*id="sp-foto"/);
  });
}
