// Testes do tema (public/inicio.js + public/tema.js): data-mode acompanha o sistema quando não há tema salvo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');
const fonte = (n) => readFileSync(join(site, n), 'utf8');

// Sandbox mínimo: carrega inicio.js e tema.js de verdade, com matchMedia controlável.
function montar({ salvo = null, escuro = false } = {}) {
  const dark = { matches: escuro, ls: [] };
  const mq = {
    get matches() { return dark.matches; },
    addEventListener: (t, f) => { if (t === 'change') dark.ls.push(f); },
  };
  const botao = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
  const root = { dataset: {}, lang: 'pt-BR' };
  const janela = {};
  const sandbox = {
    document: {
      documentElement: root,
      getElementById: (id) => (id === 'theme-toggle' ? botao : null),
      querySelector: (s) => (s === '#theme-toggle' ? botao : null),
      addEventListener() {},
    },
    localStorage: { getItem: () => salvo, setItem() {} },
    matchMedia: (q) => (q.includes('prefers-color-scheme') ? mq : { matches: false }),
    addEventListener: (t, f) => { (janela[t] ||= []).push(f); },
    location: { href: 'http://x/' },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fonte('inicio.js'), sandbox);
  vm.runInContext(fonte('tema.js'), sandbox);
  return {
    root, botao,
    trocar(v) { dark.matches = v; dark.ls.forEach((f) => f({ matches: v })); },
    mudarCongelado(v) { dark.matches = v; },
    pageshow(persisted) { (janela.pageshow || []).forEach((f) => f({ persisted })); },
  };
}

test('sem tema salvo, data-mode e aria-label seguem a troca do sistema', () => {
  const t = montar({ escuro: false });
  assert.equal(t.root.dataset.mode, 'light');
  t.trocar(true);
  assert.equal(t.root.dataset.mode, 'dark');
  assert.equal(t.botao.attrs['aria-label'], 'Usar tema claro');
  t.trocar(false);
  assert.equal(t.root.dataset.mode, 'light');
  assert.equal(t.botao.attrs['aria-label'], 'Usar tema escuro');
});

test('com tema salvo, a troca do sistema não mexe no data-mode', () => {
  const t = montar({ salvo: 'light', escuro: false });
  t.trocar(true);
  assert.equal(t.root.dataset.mode, 'light');
});

test('pageshow persistido ressincroniza o data-mode', () => {
  const t = montar({ escuro: false });
  t.mudarCongelado(true);
  t.pageshow(true);
  assert.equal(t.root.dataset.mode, 'dark');
  assert.equal(t.botao.attrs['aria-label'], 'Usar tema claro');
});
