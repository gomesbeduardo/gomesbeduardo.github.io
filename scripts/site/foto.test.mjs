// Testes estáticos da spec 005: virada da foto do topo em carta de duas faces.
// As regras de CSS (ficha em mono, C1/C2/C3/C4/C6/C8, C1a, A9, legibilidade) são medidas no navegador em foto.e2e.mjs (spec 001a R8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => readFileSync(join(raiz, rel), 'utf8');
const js = ler('public/surpresas.js');
const main = ler('public/main.js');

test('verso: c10 da spec 007 (texto do YourMentor em PT e EN)', () => {
  assert.match(js, /Sou cofundador do YourMentor desde outubro de 2025, quando ele ainda se chamava Mentor\.Me\./);
  assert.match(js, /I have been a co-founder of YourMentor since October 2025, back when it was called Mentor\.Me\./);
});

test('C5: a inclinação do mouse respeita o estado virado/girando', () => {
  assert.match(main, /photo[\s\S]{0,400}(virado|girando)/);
});

test('C10: a face de costas fica inert (e a da frente quando virado)', () => {
  assert.match(js, /inert/);
  assert.match(js, /setAttribute\('aria-hidden'/);
});

test('C6: no celular não há troca de tamanho (sem .grande)', () => {
  assert.doesNotMatch(js, /grande/);
});

test('F4: traj-card e .sp-mais seguem o caminho genérico', () => {
  assert.match(js, /closest\('\[data-flip\], \.traj-card, \.sp-mais'\)/);
  assert.match(js, /function animar\(/);
});

for (const [lang, arq] of [['PT', 'dist/index.html'], ['EN', 'dist/en/index.html']]) {
  test(`marcação (${lang}): #sp-foto dentro de .photo-card dentro de .photo[data-flip]`, () => {
    assert.match(ler(arq), /<div class="photo" data-flip><div class="photo-card"><button[^>]*id="sp-foto"/);
  });
}
