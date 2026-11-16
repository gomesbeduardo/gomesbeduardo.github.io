// Aceite no navegador do calendário do GitHub (spec 002b): T6 (sem JS, C7 + 001b C4) e T7 parte dos eixos (C8, contraste AA).
// A fatia 3 acrescenta os testes de tooltip e teclado a esta mesma lista de checagens.
// Fora do glob do `node --test` (nome sem .test.mjs). Rodar depois de `npm run build`:
//   node scripts/site/calendario.e2e.mjs [--raiz dist]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const base = fileURLToPath(new URL('../../', import.meta.url));
const { chromium } = await carregarPlaywright();
const { url, fechar } = await servir(resolve(base, argumento('raiz', 'dist')));
const totalDias = JSON.parse(readFileSync(resolve(base, 'src/data/github.json'), 'utf8')).calendario.totalDias;

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const browser = await chromium.launch();

// Visível = caixa com largura e altura > 0, opacity 1 e visibility visible.
const visivel = (sel, todos = false) => (page) => page.evaluate(([s, t]) => {
  const els = [...document.querySelectorAll(s)];
  if (!els.length) return false;
  return (t ? els : els.slice(0, 1)).every((el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.opacity === '1' && cs.visibility === 'visible';
  });
}, [sel, todos]);

// T6: sem JS, a grade, os meses, os dias da semana e a legenda aparecem.
async function t6() {
  for (const caminho of ['', 'en/']) for (const [w, h] of [[390, 844], [1280, 800]]) {
    const rot = `T6 sem JS /${caminho} ${w}px`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(url + caminho, { waitUntil: 'load' });
    // sem JS o scrollIntoView não existe: a seção só precisa estar renderizada no documento
    const checks = [['.cal-tabela', false], ['.cal-meses span', true], ['.cal-ds:not(:empty)', true], ['.cal-legenda', false]];
    for (const [sel, todos] of checks) ok(`${rot}: ${sel} visível`, await visivel(sel, todos)(page));
    const dias = await page.locator('.cal-dia').count();
    ok(`${rot}: 365 ou 371 dias e igual a calendario.totalDias`, (dias === 365 || dias === 371) && dias === totalDias, `dias=${dias} totalDias=${totalDias}`);
    ok(`${rot}: três rótulos de dia da semana`, (await page.locator('.cal-ds:not(:empty)').count()) === 3);
    if (w === 390) {
      const r = await page.evaluate(() => {
        const sc = document.querySelector('.cal-scroll'), ds = document.querySelector('.cal-ds:not(:empty)');
        const antes = ds.getBoundingClientRect().left;
        const rola = sc.scrollWidth > sc.clientWidth;
        sc.scrollLeft = sc.scrollWidth;
        return { rola, antes, depois: ds.getBoundingClientRect().left, left: sc.scrollLeft };
      });
      ok(`${rot}: a grade rola na horizontal`, r.rola && r.left > 0, JSON.stringify(r));
      ok(`${rot}: coluna dos dias fica parada (sticky)`, Math.abs(r.antes - r.depois) < 0.5, `antes=${r.antes} depois=${r.depois}`);
    }
    await ctx.close();
  }
}

// T7 (eixos): contraste AA do texto dos eixos e da legenda, nos dois temas.
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
async function t7() {
  for (const tema of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: tema });
    await ctx.addInitScript((t) => { try { localStorage.setItem('tema', t); } catch {} }, tema);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    const medidas = await page.evaluate(() => {
      // converte qualquer cor computada em rgba via canvas
      const c = document.createElement('canvas').getContext('2d');
      const rgba = (v) => { c.clearRect(0, 0, 1, 1); c.fillStyle = '#000'; c.fillStyle = v; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const fundo = (el) => { for (let e = el; e; e = e.parentElement) { const v = rgba(getComputedStyle(e).backgroundColor); if (v[3] > 0) return v.slice(0, 3); } return [255, 255, 255]; };
      return ['.cal-meses span', '.cal-ds:not(:empty)', '.cal-legenda span'].map((s) => {
        const el = document.querySelector(s);
        return { s, cor: rgba(getComputedStyle(el).color).slice(0, 3), fundo: fundo(el) };
      });
    });
    for (const m of medidas) { const r = contraste(m.cor, m.fundo); ok(`T7 ${tema}: contraste de ${m.s} >= 4,5`, r >= 4.5, r.toFixed(2)); }
    await ctx.close();
  }
}

try { await t6(); await t7(); } finally { await browser.close(); await fechar(); }
console.log(falhas ? `\n${falhas} falha(s)` : '\ntodos passaram');
process.exit(falhas ? 1 : 0);
