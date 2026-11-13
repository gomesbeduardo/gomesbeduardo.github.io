// Aceite no navegador da virada da foto (spec 005): C5/C9 (clique real), A1, A3, A5, A7.  Verso sem estouro em PT/EN de 861 a 1280 px (inclui 1101).  As regras de CSS (CSS-*) são medidas com getComputedStyle (spec 001a R8).
// Fora do glob do `node --test` (nome sem .test.mjs). Usa o Playwright do node_modules (lib-e2e.mjs).
// Rodar depois de `npm run build` (ou `npm run e2e`, que roda todos):
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
  // ---- Regras de CSS medidas no navegador (spec 001a R8). Valores de token são comparados com uma sonda criada na página. ----
  const sonda = (page, css, prop) => page.evaluate(([c, p]) => { const e = document.createElement('div'); e.style.cssText = c; document.body.append(e); const v = getComputedStyle(e)[p]; e.remove(); return v; }, [css, prop]);
  const virar = async (page) => { await page.evaluate(() => { const f = document.querySelector('#sp-foto'); for (let i = 0; i < 5; i++) f.click(); }); await espera(1000); };
  const est = (page, sel, props, pseudo = null) => page.evaluate(([s, ps, pe]) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e, pe); return Object.fromEntries(ps.map((p) => [p, c[p]])); }, [sel, props, pseudo]);
  const ms = (lista) => lista.split(',').map((t) => { t = t.trim(); return parseFloat(t) * (t.endsWith('ms') ? 1 : 1000); });

  // desktop: tudo que depende só do estado em repouso e virado
  {
    const { ctx, page } = await abrir(1280, 800);
    const card0 = await est(page, '.photo-card', ['transformStyle', 'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'transform']);
    const btn0 = await est(page, '.photo .photo-btn', ['backfaceVisibility', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'touchAction']);
    const img0 = await est(page, '.photo .photo-btn img', ['borderTopWidth']);
    const antes = await est(page, '.photo', ['aspectRatio']);
    const ease = await sonda(page, 'transition-timing-function: var(--ease)', 'transitionTimingFunction');
    const linha = await sonda(page, 'border-top-color: var(--line-strong)', 'borderTopColor');
    const ocre = await sonda(page, 'background-color: var(--accent)', 'backgroundColor');
    const mono = await sonda(page, 'font-family: var(--f-mono)', 'fontFamily');
    const bloco = await est(page, '.photo', ['backgroundColor', 'content'], '::before');
    const btnAntes = await est(page, '.photo .photo-btn', ['content'], '::before');
    ok('CSS-C1/C2: .photo-card com preserve-3d', card0.transformStyle === 'preserve-3d', card0.transformStyle);
    ok('CSS-C1/C2: .photo-btn com backface-visibility hidden', btn0.backfaceVisibility === 'hidden', btn0.backfaceVisibility);
    ok('CSS-C1/C2: giro em .5s com --ease sobre transform', /transform|all/.test(card0.transitionProperty) && card0.transitionDuration === '0.5s' && card0.transitionTimingFunction === ease, JSON.stringify([card0.transitionProperty, card0.transitionDuration, card0.transitionTimingFunction, ease]));
    const m0 = card0.transform.match(/^matrix3d\((.*)\)$/);
    const n0 = m0 && m0[1].split(',').map(parseFloat);
    ok('CSS-C1/C2: perspectiva na própria transformação (matrix3d com termo de perspectiva)', !!n0 && n0[11] !== 0, card0.transform);
    ok('CSS-C1a: .photo-btn com borda de 1px sólida --line-strong; a img sem borda', btn0.borderTopWidth === '1px' && btn0.borderTopStyle === 'solid' && btn0.borderTopColor === linha && img0.borderTopWidth === '0px', JSON.stringify([btn0, img0, linha]));
    ok('CSS-A9: .photo-btn com touch-action manipulation', btn0.touchAction === 'manipulation', btn0.touchAction);
    ok('CSS-C3: bloco ocre no .photo::before (background --accent); o botão não tem ::before', bloco.backgroundColor === ocre && btnAntes.content === 'none', JSON.stringify([bloco.backgroundColor, ocre, btnAntes.content]));
    const caixa0 = await caixa(page);
    await virar(page);
    const caixa1 = await caixa(page);
    const depois = await est(page, '.photo', ['aspectRatio', 'display']);
    const verso = await est(page, '.photo .sp-verso', ['backfaceVisibility', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'transform']);
    const card1 = await est(page, '.photo-card', ['transform']);
    const btn1 = await est(page, '.photo .photo-btn', ['display']);
    const dts = await page.evaluate(() => [...document.querySelectorAll('.sp-ficha dt')].map((e) => getComputedStyle(e).fontFamily));
    ok('CSS-ficha: rótulos .sp-ficha dt em --f-mono', dts.length >= 1 && dts.every((f) => f === mono), JSON.stringify([dts, mono]));
    ok('CSS-C4: 1280 px, a caixa da .photo e o aspect-ratio não mudam ao virar', Math.abs(caixa0.w - caixa1.w) <= 1 && Math.abs(caixa0.h - caixa1.h) <= 1 && antes.aspectRatio === depois.aspectRatio, JSON.stringify([caixa0, caixa1, antes, depois]));
    ok('CSS-C1/C2: .sp-verso com backface-visibility hidden', verso.backfaceVisibility === 'hidden', verso.backfaceVisibility);
    ok('CSS-C1a: .sp-verso com borda de 1px sólida --line-strong', verso.borderTopWidth === '1px' && verso.borderTopStyle === 'solid' && verso.borderTopColor === linha, JSON.stringify(verso));
    const m1 = card1.transform.match(/^matrix3d\((.*)\)$/);
    const n1 = m1 && m1[1].split(',').map(parseFloat);
    ok('CSS-C1/C2: virado, o card gira 180deg em Y (matrix3d com primeiro valor ~ -1)', !!n1 && Math.abs(n1[0] + 1) < 0.01, card1.transform);
    ok('CSS-C3: virado, .photo e .photo-btn não são ocultados', depois.display !== 'none' && btn1.display !== 'none', JSON.stringify([depois.display, btn1.display]));
    await ctx.close();
  }
  // C4 a 1101 px
  {
    const { ctx, page } = await abrir(1101, 800);
    const a0 = await caixa(page), r0 = await est(page, '.photo', ['aspectRatio']);
    await virar(page);
    const a1 = await caixa(page), r1 = await est(page, '.photo', ['aspectRatio']);
    ok('CSS-C4: 1101 px, a caixa da .photo e o aspect-ratio não mudam ao virar', Math.abs(a0.w - a1.w) <= 1 && Math.abs(a0.h - a1.h) <= 1 && r0.aspectRatio === r1.aspectRatio, JSON.stringify([a0, a1, r0, r1]));
    await ctx.close();
  }
  // C8 e C1a com movimento reduzido
  {
    const { ctx, page } = await abrir(1280, 800, { reducedMotion: 'reduce' });
    const linha = await sonda(page, 'border-top-color: var(--line-strong)', 'borderTopColor');
    const repouso = await est(page, '.photo-card', ['transform']);
    await virar(page);
    const card = await est(page, '.photo-card', ['transform', 'borderTopWidth', 'borderTopStyle', 'borderTopColor']);
    const verso = await est(page, '.photo .sp-verso', ['transform']);
    ok('CSS-C8: sem rotação, .photo-card sem transform em repouso e virado; verso sem transform', repouso.transform === 'none' && card.transform === 'none' && verso.transform === 'none', JSON.stringify([repouso, card, verso]));
    const tempos = await page.evaluate(() => ['.photo-card', '.photo .photo-btn', '.photo .sp-verso'].flatMap((s) => { const c = getComputedStyle(document.querySelector(s)); return [c.transitionDuration, c.animationDuration]; }));
    const todos = tempos.flatMap(ms);
    ok('CSS-C8: fade de até 150ms (algum tempo > 0, nenhum acima de 150ms)', todos.some((t) => t > 0) && todos.every((t) => t <= 150), JSON.stringify(tempos));
    ok('CSS-C1a: com movimento reduzido a borda de 1px --line-strong fica no .photo-card', card.borderTopWidth === '1px' && card.borderTopStyle === 'solid' && card.borderTopColor === linha, JSON.stringify([card, linha]));
    await ctx.close();
  }
  // C6 a 390 px
  {
    const { ctx, page } = await abrir(390, 800);
    await virar(page);
    const m = await page.evaluate(() => { const r = document.querySelector('.sp-verso .sec-label'), f = document.querySelector('.sp-ficha'); return { rotulo: r && getComputedStyle(r).display, ficha: f && getComputedStyle(f).display, grande: document.querySelector('.grande') }; });
    ok('CSS-C6: a 390 px o verso esconde rótulo e ficha, e não há .grande', m.rotulo === 'none' && m.ficha === 'none' && m.grande === null, JSON.stringify(m));
    await ctx.close();
  }
  // legibilidade da ficha de 861 a 1280 px
  for (const [lang, rota] of [['PT', ''], ['EN', 'en/']]) for (const w of [861, 1101, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(url + rota, { waitUntil: 'load' });
    await page.waitForSelector('#sp-foto');
    await espera(2500);
    await virar(page);
    const tam = await page.evaluate(() => [...document.querySelectorAll('.sp-ficha dd')].map((e) => parseFloat(getComputedStyle(e).fontSize)));
    ok(`CSS-legibilidade: ${lang} a ${w} px, .sp-ficha dd >= 13px`, tam.length > 0 && tam.every((t) => t >= 13), JSON.stringify(tam));
    await ctx.close();
  }
} finally {
  await browser.close();
  await fechar();
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
