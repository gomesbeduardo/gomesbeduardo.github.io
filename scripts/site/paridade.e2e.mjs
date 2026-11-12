// Paridade de capturas (spec 001a R7): compara duas pastas que servem o mesmo site, página a página, com 0 pixel de diferença.
//   node scripts/site/paridade.e2e.mjs [--a site] [--b dist]
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { carregarPlaywright, servir, argumento } from './lib-e2e.mjs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const saida = fileURLToPath(new URL('./paridade/saida/', import.meta.url));
const pt = ['index', 'projeto-leadgate', 'projeto-infohub', 'projeto-lms', '404'];
const paginas = [...pt.map((p) => ({ p, lang: 'pt', caminho: `${p}.html` })), ...pt.slice(0, 4).map((p) => ({ p, lang: 'en', caminho: `en/${p}.html` }))];
const larguras = [[390, 844], [1280, 800]];
const temas = [['claro', 'light'], ['escuro', 'dark']];
const CSS = '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }';

const { chromium } = await carregarPlaywright();
const A = await servir(resolve(raiz, argumento('a', 'site')));
const B = await servir(resolve(raiz, argumento('b', 'dist')));
const browser = await chromium.launch();
console.log(`Chromium ${browser.version()}`);

async function capturar(url, [w, h], [, tema]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: tema });
  try {
    await ctx.addInitScript((t) => { try { localStorage.setItem('tema', t); } catch {} }, tema);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await page.addStyleTag({ content: CSS });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    return PNG.sync.read(await page.screenshot({ fullPage: true }));
  } finally { await ctx.close(); }
}

let falhas = 0;
try {
  for (const { p, lang, caminho } of paginas) for (const larg of larguras) for (const tema of temas) {
    const rot = `${p} ${lang} ${larg[0]} ${tema[0]}`;
    let linha, ia, ib, diff;
    try {
      [ia, ib] = await Promise.all([capturar(A.url + caminho, larg, tema), capturar(B.url + caminho, larg, tema)]);
      if (ia.width !== ib.width || ia.height !== ib.height) linha = `FALHA ${rot} dimensões ${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`;
      else {
        diff = new PNG({ width: ia.width, height: ia.height });
        const n = pixelmatch(ia.data, ib.data, diff.data, ia.width, ia.height, { threshold: 0.1, includeAA: false });
        linha = n === 0 ? `ok ${rot} 0 px` : `FALHA ${rot} ${n} px`;
      }
    } catch (e) { linha = `FALHA ${rot} erro: ${e.message.split('\n')[0]}`; }
    console.log(linha);
    if (linha.startsWith('FALHA')) {
      falhas++;
      if (ia && ib) {
        const dir = `${saida}${p}-${lang}-${larg[0]}-${tema[0]}/`;
        mkdirSync(dir, { recursive: true });
        writeFileSync(`${dir}site.png`, PNG.sync.write(ia));
        writeFileSync(`${dir}dist.png`, PNG.sync.write(ib));
        if (diff) writeFileSync(`${dir}diff.png`, PNG.sync.write(diff));
      }
    }
  }
} finally {
  await browser.close();
  await A.fechar();
  await B.fechar();
}
console.log(falhas ? `${falhas} de ${paginas.length * 4} combinações com diferença` : `${paginas.length * 4} combinações iguais`);
process.exit(falhas ? 1 : 0);
