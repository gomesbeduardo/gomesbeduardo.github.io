// Testes estáticos do menu do celular (JS em public/main.js). As regras de CSS são medidas em menu.e2e.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const publico = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');
const js = readFileSync(join(publico, 'main.js'), 'utf8');
const menuJs = js.slice(js.indexOf('function setupMenu'), js.indexOf('// ---------- Trajetória'));

test('itens entram escalonados', () => {
  assert.match(menuJs, /--i/);
});

test('movimento reduzido: o JS esconde na hora', () => {
  assert.match(menuJs, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
});

test('menu fechando fica inerte (sem toque, foco nem leitor de tela) e volta a responder ao abrir', () => {
  assert.match(menuJs, /menu\.inert\s*=\s*!open/);
});

test('hidden só é aplicado depois da animação de fechar', () => {
  assert.doesNotMatch(menuJs, /menu\.hidden\s*=\s*!open/);
  assert.match(menuJs, /transitionend/);
  assert.match(menuJs, /setTimeout/);
  assert.match(menuJs, /menu\.hidden\s*=\s*true/);
});

test('hooks de acessibilidade e comportamento preservados', () => {
  assert.match(menuJs, /aria-expanded/);
  assert.match(menuJs, /f\.focus\(\)/);
  assert.match(menuJs, /Escape/);
  assert.match(menuJs, /btn\.focus\(\)/);
  assert.match(menuJs, /closest\('a'\)/);
  assert.match(menuJs, /contains\(e\.target\)/);
});
