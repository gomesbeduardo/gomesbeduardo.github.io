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
// Rasterização igual a cada contexto (cada um abre um renderizador novo): sem GPU, sem LCD, sem hinting e com perfil de cor fixo.
// Medido com 20 contextos da mesma página: sem as flags saem 2 a 4 imagens diferentes; com as quatro, uma só.
const browser = await chromium.launch({ args: ['--disable-gpu', '--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
console.log(`Chromium ${browser.version()}`);

// Espera o que se decide fora do tempo fixo: imagens decodificadas, fontes prontas, rolagem parada em um valor e dois quadros.
async function assentar(page) {
  await page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((i) => { i.loading = 'eager'; });
    await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
    await document.fonts.ready;
    const quadro = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    let y = -1;
    for (let n = 0; n < 50 && (y !== window.scrollY || n < 2); n++) { y = window.scrollY; await quadro(); }
  });
}

// As fontes vêm do Google: a primeira resposta de cada URL fica guardada e serve todos os contextos, nas duas origens.
const fontes = new Map();
async function servirFonte(route) {
  const url = route.request().url();
  if (!fontes.has(url)) {
    const r = await route.fetch();
    if (!r.ok()) return route.abort();
    fontes.set(url, { status: r.status(), headers: r.headers(), body: await r.body() });
  }
  return route.fulfill(fontes.get(url));
}

async function capturar(url, [w, h], [, tema]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: tema });
  try {
    await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, servirFonte);
    await ctx.addInitScript((t) => { try { localStorage.setItem('tema', t); } catch {} }, tema);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await page.addStyleTag({ content: CSS });
    await assentar(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    await assentar(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await assentar(page);
    // Só vale a captura que se repete: duas fotos seguidas iguais, ou a página ainda estava se ajeitando.
    for (let i = 0; i < 6; i++) {
      const x = await page.screenshot({ fullPage: true });
      if (x.equals(await page.screenshot({ fullPage: true }))) return PNG.sync.read(x);
      await assentar(page);
    }
    throw new Error('a página não estabilizou');
  } finally { await ctx.close(); }
}

let falhas = 0;
try {
  for (const { p, lang, caminho } of paginas) for (const larg of larguras) for (const tema of temas) {
    const rot = `${p} ${lang} ${larg[0]} ${tema[0]}`;
    let linha, ia, ib, diff;
    try {
      ia = await capturar(A.url + caminho, larg, tema);
      ib = await capturar(B.url + caminho, larg, tema);
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
