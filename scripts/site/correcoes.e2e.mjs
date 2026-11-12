// Aceite no navegador da spec 007: Trajetória (YourMentor logo depois do Ideathon) e sem rolagem horizontal.
// Fora do glob do `node --test`. Rodar fora do sandbox (o Chromium não abre dentro dele):
//   node scripts/site/correcoes.e2e.mjs [--raiz dist]
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const { chromium } = await carregarPlaywright();

const { url, fechar } = await servir(resolve(fileURLToPath(new URL('../../', import.meta.url)), argumento('raiz', 'dist')));

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };

const browser = await chromium.launch();
try {
  for (const [lang, caminho] of [['pt', ''], ['en', 'en/']]) {
    for (const largura of [390, 1280]) {
      const ctx = await browser.newContext({ viewport: { width: largura, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(url + caminho, { waitUntil: 'load' });
      const r = await page.evaluate(() => {
        const hs = [...document.querySelectorAll('.traj li h3')].map((h) => h.textContent.trim());
        return { hs, sw: document.documentElement.scrollWidth, iw: window.innerWidth };
      });
      const i = r.hs.findIndex((t) => /Ideathon/.test(t));
      ok(`${lang} ${largura}px: YourMentor logo depois do Ideathon`, i >= 0 && r.hs[i + 1] === 'YourMentor', r.hs.join(' | '));
      ok(`${lang} ${largura}px: sem rolagem horizontal`, r.sw <= r.iw, `${r.sw} <= ${r.iw}`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  await fechar();
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
