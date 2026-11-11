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

const FICHA = {
  PT: [
    'No YourMentor', 'Back-end em Python, FastAPI e PostgreSQL; arquitetura, modelo de dados e monetização.',
    'Antes', 'ToPark, de abr/2024 a out/2025: startup de reserva de vagas de estacionamento, na primeira turma da incubadora InovAMF.',
    'Base', 'Santa Maria, RS',
  ],
  EN: [
    'At YourMentor', 'Back end in Python, FastAPI and PostgreSQL; architecture, data model and monetization.',
    'Before', 'ToPark, Apr 2024 to Oct 2025: a startup for booking parking spaces, in the first cohort of the InovAMF incubator.',
    'Based in', 'Santa Maria, Brazil',
  ],
};

for (const [lang, textos] of Object.entries(FICHA)) {
  test(`A6 (${lang}): textos da ficha iguais à tabela da spec`, () => {
    for (const t of textos) assert.ok(js.includes(t), `faltou no surpresas.js: ${t}`);
  });
}

test('A6: a ficha não cita CS50 nem Coderace', () => {
  const m = js.match(/FICHA\s*=[\s\S]*?\n {2}\];/);
  assert.ok(m, 'objeto FICHA não encontrado');
  assert.doesNotMatch(m[0], /CS50|Coderace/i);
});

test('verso: rótulos da ficha em mono e c10 inalterada', () => {
  assert.match(js, /Sou cofundador do YourMentor desde junho de 2026\./);
  assert.match(js, /I have been a co-founder of YourMentor since June 2026\./);
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

test('C6: celular troca de tamanho no meio do giro, com largura até 360px', () => {
  assert.match(css, /@media \(max-width:860px\)\{[\s\S]*?\.photo\.grande[\s\S]*?min\(360px,100%\)/);
  assert.match(js, /grande/);
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
