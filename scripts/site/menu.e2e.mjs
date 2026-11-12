// Aceite no navegador do menu do celular (390 px), com e sem movimento reduzido:
// abrir, Esc, toque e Tab durante o fechamento, hidden no prazo, foco no botão, toggle rápido.
// Fora do glob do `node --test` (nome sem .test.mjs). Sem dependência no repo: usa o Playwright do cache do npx.
// Rodar (fora do sandbox, o Chromium não abre dentro dele):
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
} finally {
  await browser.close();
  await fechar();
}
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTudo passou');
process.exit(falhas ? 1 : 0);
