// Aceite no navegador das regras de leitura e toque no celular (390 px; QA a 320/360/390/414 px).
// Mede o resultado calculado (getComputedStyle, getBoundingClientRect, scrollWidth), não o texto do CSS.
// Fora do glob do `node --test` (nome sem .test.mjs). Usa o Playwright do node_modules (lib-e2e.mjs).
// Rodar depois de `npm run build` (ou `npm run e2e`, que roda todos):
//   node scripts/site/celular.e2e.mjs [--raiz dist]
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const { chromium } = await carregarPlaywright();

const { url, fechar } = await servir(resolve(fileURLToPath(new URL('../../', import.meta.url)), argumento('raiz', 'dist')));

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const HOMES = ['/', '/en/'];
const PROJETOS = ['lms', 'infohub', 'leadgate'].flatMap((p) => [`/projeto-${p}.html`, `/en/projeto-${p}.html`]);

const browser = await chromium.launch();
// Abre a página num contexto de celular (toque, pointer: coarse) na largura dada.
async function abrir(caminho, largura = 390, { home = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: 800 }, isMobile: true, hasTouch: true, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  await page.goto(url + caminho.replace(/^\//, ''), { waitUntil: 'load' });
  if (home) await espera(2500); // intro do topo
  return { ctx, page };
}

try {
  // E2E-1: texto das páginas de projeto ocupa a largura toda até 860 px
  for (const p of PROJETOS) for (const w of [390, 860]) {
    const { ctx, page } = await abrir(p, w);
    const r = await page.evaluate(() => [...document.querySelectorAll('.proj section p')].map((e) => getComputedStyle(e).maxWidth));
    ok(`E2E-1: ${p} a ${w}px: .proj section p com max-width none`, r.length > 0 && r.every((m) => m === 'none'), `${r.length} parágrafos, ${[...new Set(r)].join(',')}`);
    await ctx.close();
  }

  // E2E-2: links de código no GitHub têm alvo de toque de 44 px
  for (const p of PROJETOS) {
    const { ctx, page } = await abrir(p);
    const r = await page.evaluate(() => [...document.querySelectorAll('a.link-codigo')].map((e) => ({ d: getComputedStyle(e).display, h: e.getBoundingClientRect().height })));
    ok(`E2E-2: ${p}: a.link-codigo inline-flex e altura >= 44`, r.length > 0 && r.every((x) => x.d === 'inline-flex' && x.h >= 44), JSON.stringify(r));
    await ctx.close();
  }

  for (const h of HOMES) {
    const { ctx, page } = await abrir(h, 390, { home: true });
    // E2E-3: .lang a com largura mínima de 44 px e texto centralizado
    const lang = await page.evaluate(() => [...document.querySelectorAll('.lang a')].map((e) => { const c = getComputedStyle(e); return { w: e.getBoundingClientRect().width, ta: c.textAlign, jc: c.justifyContent }; }));
    ok(`E2E-3: ${h}: .lang a largura >= 44 e centralizado`, lang.length > 0 && lang.every((x) => x.w >= 44 && (x.ta === 'center' || x.jc === 'center')), JSON.stringify(lang));
    // E2E-4: button.sp-word com largura mínima de 44 px
    const sp = await page.evaluate(() => [...document.querySelectorAll('button.sp-word')].map((e) => e.getBoundingClientRect().width));
    ok(`E2E-4: ${h}: button.sp-word largura >= 44`, sp.length > 0 && sp.every((w) => w >= 44), `${sp.length} botões, menor ${Math.min(...sp)}`);
    // E2E-5: pontuação colada à palavra-surpresa em wrapper nowrap
    const cola = await page.evaluate(() => [...document.querySelectorAll('.sp-cola')].map((e) => getComputedStyle(e).whiteSpace));
    ok(`E2E-5: ${h}: .sp-cola com white-space nowrap`, cola.length >= 2 && cola.every((w) => w === 'nowrap'), `${cola.length} wrappers, ${[...new Set(cola)].join(',')}`);
    await ctx.close();
  }

  // E2E-6: sem .mail no DOM; o aviso de cópia quebra o endereço sem estourar a tela (spec 006)
  {
    const { ctx, page } = await abrir('/', 390, { home: true });
    ok('E2E-6: nenhum elemento .mail na home', await page.evaluate(() => document.querySelector('.mail') === null));
    const btn = page.locator('[data-copiar-email]').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await espera(400);
    const ow = await page.evaluate(() => { const a = document.querySelector('.aviso-end'); return a ? getComputedStyle(a).overflowWrap : null; });
    ok('E2E-6: .aviso-end existe e tem overflow-wrap anywhere', ow === 'anywhere', String(ow));
    await ctx.close();
  }

  // E2E-7: sem rolagem horizontal a 390 px
  for (const p of ['/', '/en/', '/projeto-lms.html']) {
    const { ctx, page } = await abrir(p, 390, { home: p !== '/projeto-lms.html' });
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok(`E2E-7: ${p}: html sem rolagem horizontal`, m.sw <= m.cw, JSON.stringify(m));
    await ctx.close();
  }
} finally {
  await browser.close();
  await fechar();
}
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTudo passou');
process.exit(falhas ? 1 : 0);
