// Testes estáticos do menu do celular: animação de abrir/fechar e hooks de acessibilidade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');
const css = readFileSync(join(site, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const js = readFileSync(join(site, 'main.js'), 'utf8');
const menuJs = js.slice(js.indexOf('function setupMenu'), js.indexOf('// ---------- Trajetória'));
const regras = (re) => [...css.matchAll(re)].map((m) => m[0]);

test('menu cresce a partir do botão (transform-origin no canto superior direito)', () => {
  assert.ok(regras(/\.menu\{[^}]*transform-origin:[^}]*\}/g).length > 0);
});

test('menu fechado fica escalado e transparente; aberto volta ao normal', () => {
  const base = regras(/\.menu\{[^}]*\}/g).join('');
  assert.match(base, /transform:[^;}]*scale\(\.92\)/);
  assert.match(base, /opacity:0/);
  assert.ok(regras(/\.menu\.is-open\{[^}]*opacity:1[^}]*\}/g).length > 0);
});

test('transições só de transform e opacity, nunca all', () => {
  const trechos = regras(/\.menu[^{}]*\{[^}]*\}/g).join('\n');
  assert.doesNotMatch(trechos, /transition:\s*all/);
  assert.match(trechos, /transition:[^;}]*transform/);
  assert.match(trechos, /transition:[^;}]*opacity/);
});

test('mola na abertura usa curva com overshoot', () => {
  assert.match(regras(/\.menu\.is-open\{[^}]*\}/g).join(''), /cubic-bezier\(\.34,1\.4,\.64,1\)/);
});

test('itens entram escalonados', () => {
  assert.match(css, /\.menu\.is-open a\{[^}]*transition-delay/);
  assert.match(menuJs, /--i/);
});

test('prefers-reduced-motion: só opacidade, sem transform, até 150ms', () => {
  const i = css.indexOf('@media (prefers-reduced-motion:reduce){.menu');
  assert.ok(i >= 0, 'regra de movimento reduzido para o menu');
  const bloco = css.slice(i, css.indexOf('\n', i));
  assert.match(bloco, /\.menu[^{]*\{[^}]*transform:none/);
  assert.match(bloco, /transition:opacity \.1s/);
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
  assert.match(css, /@media \(min-width:900px\)\{\.menu\{display:none!important\}\}/);
});
