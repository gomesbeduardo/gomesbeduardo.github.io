// Aceite no navegador do menu do celular (390 px), com e sem movimento reduzido:
// abrir, Esc, toque e Tab durante o fechamento, hidden no prazo, foco no botão, toggle rápido.
// As regras de CSS (CSS-*) são medidas com getComputedStyle (spec 001a R8).
// Fora do glob do `node --test` (nome sem .test.mjs). Usa o Playwright do node_modules (lib-e2e.mjs).
// Rodar depois de `npm run build` (ou `npm run e2e`, que roda todos):
//   node scripts/site/menu.e2e.mjs [--raiz dist]
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const { chromium } = await carregarPlaywright();

const { url, fechar } = await servir(resolve(fileURLToPath(new URL('../../', import.meta.url)), argumento('raiz', 'dist')));

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
try {
  for (const reduzido of [false, true]) {
    const rot = reduzido ? 'movimento reduzido' : 'movimento normal';
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: reduzido ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForSelector('#menu-btn');
    await espera(2500); // intro do topo
    const estado = () => page.evaluate(() => {
      const m = document.querySelector('#menu'), b = document.querySelector('#menu-btn');
      return { hidden: m.hidden, aberto: m.classList.contains('is-open'), inert: m.inert, exp: b.getAttribute('aria-expanded') };
    });

    // ---- abrir ----
    await page.click('#menu-btn');
    await espera(600);
    let s = await estado();
    ok(`[${rot}] abre pelo botão`, !s.hidden && s.aberto && s.exp === 'true' && !s.inert, JSON.stringify(s));
    const alvo = await page.evaluate(() => { const r = document.querySelectorAll('#menu a')[2].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });

    // ---- Esc: janela de fechamento ----
    await page.evaluate(() => {
      const m = document.querySelector('#menu');
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.__t0 = performance.now(); }, true);
      new MutationObserver(() => { if (m.hidden && window.__th == null) window.__th = performance.now(); }).observe(m, { attributes: true, attributeFilter: ['hidden'] });
    });
    await page.keyboard.press('Escape');
    const foco = await page.evaluate(() => document.activeElement && document.activeElement.id);
    ok(`[${rot}] Esc devolve o foco ao botão`, foco === 'menu-btn', foco);
    s = await estado();
    ok(`[${rot}] aria-expanded=false após Esc`, s.exp === 'false', JSON.stringify(s));
    await espera(50);
    const topo = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); const a = e && e.closest('#menu a'); return a ? a.textContent.trim() : null; }, alvo);
    ok(`[${rot}] toque a ~50 ms após Esc não cai num link do menu`, topo === null, String(topo));
    await page.keyboard.press('Tab');
    const noMenu = await page.evaluate(() => { const a = document.activeElement; return a && a.closest('#menu') ? a.textContent.trim() : null; });
    ok(`[${rot}] Tab logo após Esc não entra no menu`, noMenu === null, String(noMenu));
    await espera(500);
    const dt = await page.evaluate(() => (window.__th == null ? null : window.__th - window.__t0));
    const lim = reduzido ? 150 : 250;
    s = await estado();
    ok(`[${rot}] hidden aplicado em até ${lim} ms`, s.hidden && dt !== null && dt <= lim, `dt=${dt === null ? 'nunca' : dt.toFixed(0) + ' ms'}`);

    // ---- toggle rápido (3x) ----
    for (const [esperado, aria] of [[true, 'true'], [false, 'false']]) {
      for (let i = 0; i < 3; i++) { await page.click('#menu-btn', { delay: 0 }); await espera(40); }
      await espera(700);
      s = await estado();
      const coerente = esperado ? (!s.hidden && s.aberto && !s.inert) : (s.hidden && !s.aberto);
      ok(`[${rot}] 3 toques rápidos terminam ${esperado ? 'aberto' : 'fechado'} e coerentes`, coerente && s.exp === aria, JSON.stringify(s));
    }
    await ctx.close();
  }
  // ---- Regras de CSS medidas no navegador (spec 001a R8) ----
  const css = (page) => page.evaluate(() => {
    const m = document.querySelector('#menu'), c = getComputedStyle(m);
    // com hidden o transform computado vira none (sem caixa): desoculta só para medir, sem transição a partir de display:none
    const oculto = m.hidden;
    if (oculto) { m.hidden = false; c.transform; }
    const escala = (t) => { const x = t.match(/^matrix\(([^,]+),[^,]+,[^,]+,([^,]+),/); return x ? [parseFloat(x[1]), parseFloat(x[2])] : null; };
    const ms = (v) => (v.trim().endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000);
    const r = {
      opacity: c.opacity, transform: c.transform, escala: escala(c.transform), prop: c.transitionProperty,
      curva: c.transitionTimingFunction, duracoes: c.transitionDuration.split(',').map(ms), display: c.display,
      origem: c.transformOrigin.split(' ').map(parseFloat), w: m.offsetWidth, h: m.offsetHeight,
      atrasos: [...m.querySelectorAll('a')].map((a) => ms(getComputedStyle(a).transitionDelay.split(',')[0])),
    };
    if (oculto) m.hidden = true;
    return r;
  });
  const perto = (v, alvo) => Math.abs(v - alvo) <= 0.005;
  const abrirCss = async (largura, opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: largura, height: 800 }, ...opts });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForSelector('#menu-btn', { state: 'attached' });
    await espera(2500);
    return { ctx, page };
  };
  {
    const { ctx, page } = await abrirCss(390);
    const f = await css(page);
    await page.click('#menu-btn');
    await espera(700);
    const a = await css(page);
    ok('CSS-origem: o menu cresce do canto superior direito', a.origem[0] > a.w / 2 && a.origem[1] < a.h / 2, `origem=${a.origem.join(' ')} caixa=${a.w}x${a.h}`);
    ok('CSS-estados: fechado fica a 0,92 e transparente', f.opacity === '0' && f.escala && perto(f.escala[0], 0.92) && perto(f.escala[1], 0.92), `${f.opacity} ${f.transform}`);
    ok('CSS-estados: aberto volta a 1 e opaco', a.opacity === '1' && (a.transform === 'none' || (a.escala && perto(a.escala[0], 1) && perto(a.escala[1], 1))), `${a.opacity} ${a.transform}`);
    for (const [rot, e] of [['fechado', f], ['aberto', a]]) {
      ok(`CSS-transicao: ${rot} transiciona transform e opacity, nunca all`, !/\ball\b/.test(e.prop) && /transform/.test(e.prop) && /opacity/.test(e.prop), e.prop);
    }
    ok('CSS-mola: aberto usa a curva com overshoot', a.curva.includes('cubic-bezier(0.34, 1.4, 0.64, 1)'), a.curva);
    ok('CSS-escalonado: atraso dos itens cresce na ordem do DOM', a.atrasos.length >= 2 && a.atrasos.every((v, i, l) => i === 0 || v >= l[i - 1]) && a.atrasos.at(-1) > a.atrasos[0], a.atrasos.join(' '));
    await ctx.close();
  }
  {
    const { ctx, page } = await abrirCss(390, { reducedMotion: 'reduce' });
    const f = await css(page);
    await page.click('#menu-btn');
    await espera(300);
    const a = await css(page);
    ok('CSS-reduzido: sem transform, fechado e aberto', f.transform === 'none' && a.transform === 'none', `${f.transform} | ${a.transform}`);
    ok('CSS-reduzido: transições zeradas (até 10 ms)', [...f.duracoes, ...a.duracoes].every((d) => d <= 10), `${f.duracoes} | ${a.duracoes}`);
    await ctx.close();
  }
  for (const largura of [900, 1280]) {
    const { ctx, page } = await abrirCss(largura);
    await page.evaluate(() => { const m = document.querySelector('#menu'); m.hidden = false; m.classList.add('is-open'); });
    const d = (await css(page)).display;
    ok(`CSS-desktop: menu some a ${largura} px mesmo aberto`, d === 'none', d);
    await ctx.close();
  }
} finally {
  await browser.close();
  await fechar();
}
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTudo passou');
process.exit(falhas ? 1 : 0);
