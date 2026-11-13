// Paridade de capturas (spec 001a R7): compara duas pastas que servem o mesmo site, página a página, com 0 pixel de diferença
// e com as mesmas cores computadas em cada elemento renderizado (o limiar do pixelmatch deixa passar um cinza sólido que muda uns 26 níveis).
//   node scripts/site/paridade.e2e.mjs [--a site] [--b dist] [--limiar 0.03]
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { carregarPlaywright, servir, argumento } from './lib-e2e.mjs';
import { fontesDoGoogle } from './fontes-google.mjs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const saida = fileURLToPath(new URL('./paridade/saida/', import.meta.url));
const pt = ['index', 'projeto-leadgate', 'projeto-infohub', 'projeto-lms', '404'];
const paginas = [...pt.map((p) => ({ p, lang: 'pt', caminho: `${p}.html` })), ...pt.slice(0, 4).map((p) => ({ p, lang: 'en', caminho: `en/${p}.html` }))];
const larguras = [[390, 844], [1280, 800]];
const temas = [['claro', 'light'], ['escuro', 'dark']];
const LIMIAR = Number(argumento('limiar', '0.03'));
const PROPS = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'fill', 'stroke'];
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
const fonte = fontesDoGoogle(() => browser.close().catch(() => {}));

async function capturar(url, [w, h], [, tema]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: tema });
  try {
    await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, fonte.servir);
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
    const cores = await page.evaluate(coletarCores, PROPS);
    for (let i = 0; i < 6; i++) {
      const x = await page.screenshot({ fullPage: true });
      if (x.equals(await page.screenshot({ fullPage: true }))) return { png: PNG.sync.read(x), cores };
      await assentar(page);
    }
    throw new Error('a página não estabilizou');
  } finally { await ctx.close(); }
}

// Cor computada de todos os elementos renderizados, em ordem de documento (display:none fica de fora).
function coletarCores(props) {
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((c) => '.' + c).join('') : '';
    const pai = el.parentElement;
    const nth = pai ? [...pai.children].indexOf(el) + 1 : 1;
    out.push({ tag: el.localName, caminho: `${el.localName}${el.id ? '#' + el.id : ''}${cls}:nth-child(${nth})`, v: props.map((p) => cs.getPropertyValue(p)) });
  }
  return out;
}

// Troca `color(srgb r g b / a)` e `rgb[a](...)` por "r,g,b,a" em 0-255; o que não for reconhecido fica como veio.
function normalizarCor(v) {
  const m = /^(rgba?|color)\(\s*(srgb\s+)?([^)]*)\)$/.exec(v.trim());
  if (!m) return v.trim();
  const [cor, alfa] = m[3].split('/');
  const n = cor.trim().split(/[\s,]+/).filter(Boolean);
  if (m[1] === 'color' && !m[2]) return v.trim();
  if (n.length < 3) return v.trim();
  const escala = m[1] === 'color' ? 255 : 1;
  const a = alfa !== undefined ? alfa.trim() : (n[3] ?? '1');
  const al = a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a);
  const c = n.slice(0, 3).map((x) => Math.round(parseFloat(x) * escala * 1000) / 1000);
  return `${c.join(',')},${Math.round(al * 1000) / 1000}`;
}

// Devolve as diferenças de cor entre as duas listas; lista de tamanho ou ordem diferente é falha própria, nunca comparação desalinhada.
function compararCores(la, lb) {
  if (la.length !== lb.length) return [`listas desalinhadas: ${la.length} elementos renderizados em A e ${lb.length} em B`];
  const dif = [];
  for (let i = 0; i < la.length; i++) {
    if (la[i].tag !== lb[i].tag) return [...dif, `listas desalinhadas no elemento ${i}: <${la[i].tag}> (${la[i].caminho}) em A e <${lb[i].tag}> (${lb[i].caminho}) em B`];
    PROPS.forEach((p, k) => {
      if (normalizarCor(la[i].v[k]) !== normalizarCor(lb[i].v[k])) dif.push(`${la[i].caminho} ${p}: A=${la[i].v[k]} B=${lb[i].v[k]}`);
    });
  }
  return dif;
}

let falhas = 0;
try {
  for (const { p, lang, caminho } of paginas) for (const larg of larguras) for (const tema of temas) {
    const rot = `${p} ${lang} ${larg[0]} ${tema[0]}`;
    let linha, ia, ib, diff;
    try {
      const ca = await capturar(A.url + caminho, larg, tema);
      const cb = await capturar(B.url + caminho, larg, tema);
      ia = ca.png; ib = cb.png;
      const difCores = compararCores(ca.cores, cb.cores);
      if (difCores.length) {
        console.log(`  cor computada: ${difCores.length} diferença(s); primeiras ${Math.min(10, difCores.length)}:`);
        difCores.slice(0, 10).forEach((d) => console.log(`    ${d}`));
      }
      let n = 0;
      if (ia.width !== ib.width || ia.height !== ib.height) linha = `FALHA ${rot} dimensões ${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`;
      else {
        diff = new PNG({ width: ia.width, height: ia.height });
        n = pixelmatch(ia.data, ib.data, diff.data, ia.width, ia.height, { threshold: LIMIAR, includeAA: false });
      }
      if (!linha) linha = n === 0 && !difCores.length ? `ok ${rot} 0 px, cores iguais` : `FALHA ${rot} ${n} px, ${difCores.length} diferença(s) de cor`;
    } catch (e) { if (fonte.estado.erro) throw e; linha = `FALHA ${rot} erro: ${e.message.split('\n')[0]}`; }
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
} catch (e) {
  if (!fonte.estado.erro) throw e; // com as fontes inacessíveis a falha já foi dita; o resto é o navegador fechado
  falhas++;
} finally {
  await browser.close().catch(() => {});
  await A.fechar();
  await B.fechar();
}
if (!fonte.estado.erro) console.log(falhas ? `${falhas} de ${paginas.length * 4} combinações com diferença` : `${paginas.length * 4} combinações iguais`);
process.exit(falhas ? 1 : 0);
