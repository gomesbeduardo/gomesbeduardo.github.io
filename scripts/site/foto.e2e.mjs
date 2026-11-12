// Aceite no navegador da virada da foto (spec 005): C5/C9 (clique real), A1, A3, A5, A7.  Verso sem estouro em PT/EN de 861 a 1280 px (inclui 1101).
// Fora do glob do `node --test` (nome sem .test.mjs). Sem dependência no repo: usa o Playwright do cache do npx.
// Rodar (fora do sandbox, o Chromium não abre dentro dele):
//   node scripts/site/foto.e2e.mjs [--raiz dist]
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const { chromium } = await carregarPlaywright();

const { url, fechar } = await servir(resolve(fileURLToPath(new URL('../../', import.meta.url)), argumento('raiz', 'dist')));

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
async function abrir(largura, altura, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, ...opts });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('#sp-foto');
  await espera(2500); // intro e animações do topo
  return { ctx, page };
}
const caixa = (page) => page.evaluate(() => {
  const r = document.querySelector('.photo').getBoundingClientRect(), h = document.querySelector('.hero h1').getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, h1: h.top };
});
const igual = (a, b, tol = 1) => ['x', 'y', 'w', 'h', 'h1'].every((k) => Math.abs(a[k] - b[k]) <= tol);

try {
  // ---- Clique real do mouse a 1280 px (C5, C9) ----
  {
    const { ctx, page } = await abrir(1280, 800);
    const b = await page.locator('#sp-foto').boundingBox();
    // eventos reais do mouse: onde o navegador de fato entrega (elementFromPoint não vê o problema da inclinação em 3D)
    await page.evaluate(() => { window.__alvos = []; for (const t of ['mousemove', 'click']) document.addEventListener(t, (e) => window.__alvos.push([t, !!e.target.closest('#sp-foto'), e.target.className || e.target.tagName]), true); });
    const pts = [[0.9, 0.1], [0.1, 0.9], [0.5, 0.5], [0.9, 0.9], [0.1, 0.1]].map(([fx, fy]) => [b.x + b.width * fx, b.y + b.height * fy]);
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5);
    for (let volta = 0; volta < 2; volta++) for (const [x, y] of pts) { await page.mouse.move(x, y, { steps: 6 }); await espera(120); }
    const movs = await page.evaluate(() => window.__alvos.filter((a) => a[0] === 'mousemove'));
    const fora = movs.filter((a) => !a[1]);
    ok('mousemove sobre a foto chega ao #sp-foto (inclinação e cursor)', movs.length > 0 && fora.length === 0, `${fora.length}/${movs.length} fora: ${[...new Set(fora.map((a) => a[2]))].join(',')}`);
    const cursor = await page.evaluate(() => getComputedStyle(document.querySelector('#sp-foto')).cursor);
    ok('cursor segue pointer sobre a foto', cursor === 'pointer', cursor);
    for (const [x, y] of pts) await page.mouse.click(x, y);
    const cl = await page.evaluate(() => window.__alvos.filter((a) => a[0] === 'click'));
    ok('os 5 cliques chegam ao #sp-foto', cl.length === 5 && cl.every((a) => a[1]), JSON.stringify(cl.map((a) => a[2])));
    await espera(900);
    ok('5 cliques reais viram o card (C5/C9)', await page.locator('.photo.virado').count() === 1);
    ok('um só .sp-verso', await page.locator('.photo .sp-verso').count() === 1);
    await ctx.close();
  }

  // ---- A1, A3, A7 a 1280 px (gatilho por .click() para isolar a medida da inclinação) ----
  {
    const { ctx, page } = await abrir(1280, 800);
    const antes = await caixa(page);
    await page.evaluate(() => { const f = document.querySelector('#sp-foto'); for (let i = 0; i < 5; i++) f.click(); });
    let max = true;
    for (let i = 0; i < 16; i++) { await espera(40); max = max && igual(antes, await caixa(page), 1); }
    await espera(300);
    ok('A1: caixa da .photo e topo do h1 estáveis durante o giro', max && igual(antes, await caixa(page), 1));
    ok('A3: virado, botão da foto com inert e aria-hidden', await page.evaluate(() => { const b = document.querySelector('#sp-foto'); return b.inert && b.getAttribute('aria-hidden') === 'true'; }));
    // A7: mouse sobre o card virado, movendo, não inclina
    const r = await page.locator('.photo').boundingBox();
    await page.mouse.move(r.x + r.width * 0.3, r.y + r.height * 0.3); await page.mouse.move(r.x + r.width * 0.8, r.y + r.height * 0.8, { steps: 6 }); await espera(600);
    const tr = await page.evaluate(() => [getComputedStyle(document.querySelector('.photo')).transform, getComputedStyle(document.querySelector('#sp-foto')).transform]);
    ok('A7: virado e com o mouse se movendo, nada inclina', tr.every((t) => t === 'none' || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(t) || /^matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\)$/.test(t)), JSON.stringify(tr));
    await page.keyboard.press('Escape'); await espera(900);
    ok('A3: Esc devolve o foco ao #sp-foto', await page.evaluate(() => document.activeElement && document.activeElement.id === 'sp-foto'));
    ok('A3: desvirado, o verso some e o botão volta ao normal', await page.evaluate(() => !document.querySelector('.photo.virado') && !document.querySelector('.sp-verso') && !document.querySelector('#sp-foto').inert));
    // reentrância: Esc no meio do giro + 5 cliques enquanto desvira
    await page.evaluate(() => { const f = document.querySelector('#sp-foto'); for (let i = 0; i < 5; i++) f.click(); });
    await espera(150); await page.keyboard.press('Escape');
    await page.evaluate(() => { const f = document.querySelector('#sp-foto'); for (let i = 0; i < 5; i++) f.click(); });
    await espera(1200);
    ok('reentrância: termina com um só .sp-verso', await page.locator('.photo .sp-verso').count() === 1);
    await ctx.close();
  }

  // ---- A5 a 390 px ----
  {
    const { ctx, page } = await abrir(390, 844, { hasTouch: false });
    const antes = await page.locator('.photo').boundingBox();
    await page.evaluate(() => { const f = document.querySelector('#sp-foto'); for (let i = 0; i < 5; i++) f.click(); });
    await espera(900);
    const m = await page.evaluate(() => { const r = document.querySelector('.photo').getBoundingClientRect(), v = document.querySelector('.photo .sp-verso'); return { w: r.width, right: r.right, vw: innerWidth, sw: document.documentElement.scrollWidth, vs: v.scrollHeight, vc: v.clientHeight }; });
    ok('A5: virado a 390 px, largura <= 360, sem estouro horizontal, verso sem rolagem', m.w <= 360 && m.right <= m.vw && m.sw <= m.vw && m.vs <= m.vc + 1, JSON.stringify(m));
    await page.keyboard.press('Escape'); await espera(900);
    const depois = await page.locator('.photo').boundingBox();
    ok('A5: ao desvirar volta a 160 px', Math.abs(depois.width - 160) <= 1 && Math.abs(antes.width - 160) <= 1, `antes ${antes.width} depois ${depois.width}`);
    await ctx.close();
  }
  // ---- Verso sem estouro logo acima do ponto de quebra de 860 px (spec 007, c10 nova) ----
  for (const [lang, rota] of [['PT', ''], ['EN', 'en/']]) for (const w of [861, 880, 899, 1101, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(url + rota, { waitUntil: 'load' });
    await page.waitForSelector('#sp-foto');
    await espera(2500);
    await page.evaluate(() => { const f = document.querySelector('#sp-foto'); for (let i = 0; i < 5; i++) f.click(); });
    await espera(900);
    const m = await page.evaluate(() => {
      const v = document.querySelector('.photo .sp-verso'), p = document.querySelector('.photo').getBoundingClientRect(), b = v.querySelector('.sp-volta').getBoundingClientRect();
      return { vs: v.scrollHeight, vc: v.clientHeight, bb: Math.round(b.bottom), pb: Math.round(p.bottom) };
    });
    ok(`verso ${lang} a ${w} px: sem rolagem e botão "virar de volta" dentro da foto`, m.vs <= m.vc && m.bb <= m.pb, JSON.stringify(m));
    await ctx.close();
  }
} finally {
  await browser.close();
  await fechar();
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
