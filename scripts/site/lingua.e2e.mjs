// Aceite no navegador da troca de língua no mesmo ponto de leitura (spec 001d R2, R3, R5; C1, C2, C5, C6).
// Fora do glob do `node --test` (nome sem .test.mjs). Usa o Playwright do node_modules (lib-e2e.mjs).
// Rodar depois de `npm run build`:
//   node scripts/site/lingua.e2e.mjs [--raiz dist]
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const { chromium } = await carregarPlaywright();
const { url, fechar } = await servir(resolve(fileURLToPath(new URL('../../', import.meta.url)), argumento('raiz', 'dist')));

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const SO = argumento('so', '').split(',').filter(Boolean);
const quero = (t) => SO.length === 0 || SO.includes(t);
const log = (m) => console.log(`INFO  ${m}`);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// Abre a página e espera o Lenis (ou 3 s) para o script de entrada terminar.
async function abrir(page, caminho) {
  await page.goto(url + caminho, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__lenis, null, { timeout: 3000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
  await espera(400);
}
const topo = (page, id) => page.evaluate((i) => { const e = document.querySelector(`[data-ancora="${i}"]`); return e ? e.getBoundingClientRect().top : null; }, id);
const fim = (page) => page.evaluate(() => ({ y: window.scrollY, max: document.documentElement.scrollHeight - window.innerHeight }));
// Rola (sem animação) até o bloco ficar a `alvo` px do topo da janela.
async function colocar(page, id, alvo) {
  await page.evaluate(({ i, alvo }) => {
    const e = document.querySelector(`[data-ancora="${i}"]`);
    const y = window.scrollY + e.getBoundingClientRect().top - alvo;
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
  }, { i: id, alvo });
  await espera(150);
  // Espera as animações de entrada (gsap e CSS) terminarem: o top medido na origem é o de repouso.
  await page.waitForFunction(() => !(window.gsap && gsap.globalTimeline.getChildren(true, true, false).some((t) => t.isActive())) && document.getAnimations().every((a) => a.playState !== 'running'), null, { timeout: 5000 }).catch(() => {});
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}
const clicarOutra = (page) => page.evaluate(() => document.querySelector('.lang a[hreflang]:not([aria-current]), .foot-lang a[hreflang]:not([aria-current])').click());
// Espera a navegação terminar e a página nova ficar estável.
async function trocar(page) {
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), clicarOutra(page)]);
  await page.waitForFunction(() => !!window.__lenis, null, { timeout: 3000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
  await espera(1000);
}

const browser = await chromium.launch();
try {
  const ctx0 = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });

  // ---- T4 e T5 (C3, C4; spec 001d R4): sem repetir a abertura na troca de língua ----
  const PRIMEIRO_QUADRO = () => {
    const tira = () => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
      const fim = (e) => (e.querySelector('.sr-only') || e).textContent.trim();
      return {
        chars: [...document.querySelectorAll('.hero h1 .fill .ch')].map((c) => ({ op: +getComputedStyle(c).opacity, an: getComputedStyle(c).animationName })),
        nums: [...document.querySelectorAll('.num')].filter(vis).map((e) => ({ txt: e.querySelector('[aria-hidden]').textContent.trim(), fim: fim(e) })),
        reveals: [...document.querySelectorAll('.reveal, .stag, .project')].filter(vis).map((e) => ({ c: e.className, op: +getComputedStyle(e).opacity })),
        marca: !!document.querySelector('.hero h1[data-sem-abertura]'),
        troca: document.documentElement.hasAttribute('data-troca-lingua'),
      };
    };
    window.__tira = tira;
    const marca = () => requestAnimationFrame(() => { window.__primeiroQuadro = tira(); });
    if ('onpagereveal' in window) addEventListener('pagereveal', marca); else addEventListener('DOMContentLoaded', marca);
  };
  const tiraAgora = (page) => page.evaluate(() => window.__tira());
  const errosAbertura = (t) => {
    const e = [];
    if (t.chars.some((c) => c.op !== 1)) e.push('nome com opacidade != 1');
    t.nums.filter((n) => n.txt !== n.fim).forEach((n) => e.push(`contador ${n.txt} != ${n.fim}`));
    t.reveals.filter((r) => r.op < 0.99).forEach((r) => e.push(`reveal oculto ${r.c} op=${r.op}`));
    return e;
  };
  async function trocarDe(page, caminho, ancora, alvo) {
    await abrir(page, caminho);
    await colocar(page, ancora, alvo);
    await trocar(page);
  }

  if (quero('T4')) {
    // T4a: de Projetos (1280)
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
      const page = await ctx.newPage();
      await page.addInitScript(PRIMEIRO_QUADRO);
      await trocarDe(page, '', 'projetos-titulo', 80);
      const q = await page.evaluate(() => window.__primeiroQuadro);
      const e0 = q ? errosAbertura(q) : ['sem snapshot do primeiro quadro'];
      ok('T4a primeiro quadro: nome escrito, contadores finais, nada visível oculto', e0.length === 0 && q.nums.length + q.reveals.length > 0, `${e0.slice(0, 4).join('; ')} nums=${q && q.nums.length} reveals=${q && q.reveals.length}`);
      for (const ms of [300, 1500]) {
        await espera(ms === 300 ? 0 : 1200);
        const t = await tiraAgora(page);
        const e = errosAbertura(t);
        ok(`T4a depois (~${ms} ms): contadores e reveals visíveis seguem no estado final`, e.length === 0, e.slice(0, 4).join('; '));
      }
      await ctx.close();
    }
    // T4b: do topo (390)
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
      const page = await ctx.newPage();
      await page.addInitScript(PRIMEIRO_QUADRO);
      await trocarDe(page, '', 'hero', 0);
      const q = await page.evaluate(() => window.__primeiroQuadro);
      ok('T4b primeiro quadro: nome com opacidade 1 e sem animação', !!q && q.chars.length > 0 && q.chars.every((c) => c.op === 1 && c.an === 'none'), JSON.stringify(q && q.chars.slice(0, 2)));
      const t = await tiraAgora(page);
      ok('T4b +1,5 s: nome sem name-fill e com data-sem-abertura', t.chars.length > 0 && t.chars.every((c) => c.op === 1 && c.an === 'none') && t.marca, JSON.stringify({ marca: t.marca, c: t.chars.slice(0, 2) }));
      await ctx.close();
    }
    // T4d: de Números (contadores dentro da janela na chegada)
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
      const page = await ctx.newPage();
      await page.addInitScript(PRIMEIRO_QUADRO);
      await trocarDe(page, '', 'numeros', 300);
      const q = await page.evaluate(() => window.__primeiroQuadro);
      const e0 = q ? errosAbertura(q) : ['sem snapshot do primeiro quadro'];
      ok('T4d primeiro quadro: contadores visíveis no valor final', e0.length === 0 && q.nums.length > 0, `${e0.slice(0, 4).join('; ')} nums=${q && q.nums.length}`);
      for (const ms of [0, 1200]) {
        await espera(ms);
        const t = await tiraAgora(page);
        const e = errosAbertura(t);
        ok(`T4d +${ms} ms: contadores seguem no valor final (nunca 0 nem intermediário)`, e.length === 0 && t.nums.length > 0, e.slice(0, 4).join('; '));
      }
      await ctx.close();
    }
    // T4c: contador abaixo da janela ainda conta ao rolar
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
      const page = await ctx.newPage();
      await page.addInitScript(PRIMEIRO_QUADRO);
      await trocarDe(page, '', 'sobre-titulo', 80);
      const abaixo = await page.evaluate(() => [...document.querySelectorAll('.num')].map((e, i) => ({ i, top: e.getBoundingClientRect().top })).filter((n) => n.top > innerHeight).length);
      const antes = await page.evaluate(() => [...document.querySelectorAll('.num')].map((e) => e.querySelector('[aria-hidden]').textContent.trim()));
      await page.evaluate(() => { const e = document.querySelector('.counters'); const y = scrollY + e.getBoundingClientRect().top - 300; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); });
      const vistos = [];
      for (let i = 0; i < 24; i++) { vistos.push(await page.evaluate(() => [...document.querySelectorAll('.num [aria-hidden]')].map((e) => e.textContent.trim()))); await espera(50); }
      const finais = await page.evaluate(() => [...document.querySelectorAll('.num')].map((e) => e.querySelector('.sr-only').textContent.trim()));
      const num = (x) => +String(x).replace(/\D/g, '');
      const contou = finais.every((f, k) => vistos.some((v) => num(v[k]) < num(f)) && vistos[vistos.length - 1][k] === f);
      ok('T4c contador abaixo da janela conta ao entrar e termina no valor final', abaixo > 0 && contou, `abaixo=${abaixo} antes=${antes} finais=${finais} ultimo=${vistos[vistos.length - 1]}`);
      await ctx.close();
    }
  }

  if (quero('T5')) {
    const normal = async (page, rot) => {
      await page.waitForFunction(() => document.querySelector('.hero h1.run'), null, { timeout: 5000 }).catch(() => {});
      const r = await page.evaluate(() => { const h = document.querySelector('.hero h1'); return { run: h.classList.contains('run'), marca: h.hasAttribute('data-sem-abertura'), an: getComputedStyle(h.querySelector('.fill .ch')).animationName }; });
      ok(`T5 ${rot}: abertura completa (run, sem data-sem-abertura, name-fill)`, r.run && !r.marca && r.an !== 'none', JSON.stringify(r));
    };
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
    let page = await ctx.newPage();
    await page.goto(url + 'en/', { waitUntil: 'load' });
    await normal(page, '(a) /en/ pelo endereço');
    await page.reload({ waitUntil: 'load' });
    await normal(page, '(c) recarregar /en/');
    await page.close();
    page = await ctx.newPage();
    await page.goto(url + 'en/', { waitUntil: 'load' });
    await page.evaluate(() => sessionStorage.setItem('troca-lingua', JSON.stringify({ caminho: '/en/', ancora: 'proj-infohub', top: 120, quando: Date.now() - 6000 })));
    await page.goto(url + 'en/', { waitUntil: 'load' });
    await normal(page, '(d) entrada de 6 s atrás');
    await page.close();
    page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await Promise.all([page.waitForURL('**/projeto-*.html'), page.evaluate(() => document.querySelector('a[data-card]').click())]);
    const tl = await page.evaluate(() => document.documentElement.hasAttribute('data-troca-lingua'));
    ok('T5 (b) clique em card de projeto: sem data-troca-lingua', !tl, page.url());
    await ctx.close();
  }
  if (SO.length === 0) {

  // ---- T1 (C1): InfoHub a 120 px, PT->EN em 1280 e 390; EN->PT em 1280 ----
  for (const [larg, alt, de, para, rot, dpr] of [[1280, 800, '', 'en/', 'PT->EN 1280'], [390, 844, '', 'en/', 'PT->EN 390'], [1280, 800, 'en/', '', 'EN->PT 1280'], [390, 844, '', 'en/', 'PT->EN 390 DPR2', 2]]) {
    const ctx = await browser.newContext({ viewport: { width: larg, height: alt }, deviceScaleFactor: dpr || 1, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.addInitScript(() => { addEventListener('pagereveal', () => requestAnimationFrame(() => { window.__primeiro = window.scrollY; })); });
    await abrir(page, de);
    await colocar(page, 'proj-infohub', 120);
    const antes = await topo(page, 'proj-infohub');
    if (larg === 1280 && await page.locator('header .lang a[hreflang]:not([aria-current])').isVisible()) {
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('header .lang a[hreflang]:not([aria-current])')]);
      await page.waitForFunction(() => !!window.__lenis, null, { timeout: 3000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
      await espera(1000);
    } else await trocar(page);
    const depois = await topo(page, 'proj-infohub');
    ok(`T1 ${rot}: InfoHub a 120 px na página nova, igual à origem`, Math.abs(antes - 120) < 1 && Math.abs(depois - antes) <= 0.5, `antes=${antes} depois=${depois} dif=${depois - antes} url=${page.url().slice(url.length)}`);
    if (rot === 'PT->EN 1280') {
      const f = await fim(page);
      const primeiro = await page.evaluate(() => window.__primeiro);
      log(`R5 scrollY no 1o frame (pagereveal+rAF)=${primeiro} final=${f.y}`);
    }
    await ctx.close();
  }

  // ---- T2 (C2): todas as âncoras, home e 3 projetos, PT<->EN, 390 e 1280 ----
  const paginas = ['', 'projeto-leadgate.html', 'projeto-infohub.html', 'projeto-lms.html'];
  const resumo = { testadas: 0, fimDePagina: 0, falhas: [], maxDif: 0 };
  async function varrer(larg, alt, pg, dir) {
    const ctx = await browser.newContext({ viewport: { width: larg, height: alt }, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    const origem = dir === 'PT->EN' ? pg : 'en/' + pg;
    await abrir(page, origem);
    const ids = await page.evaluate(() => [...document.querySelectorAll('[data-ancora]')].map((e) => e.dataset.ancora));
    for (const id of ids) {
      await abrir(page, origem);
      try { await colocar(page, id, 80); } catch (e) { resumo.falhas.push(`${dir} ${larg} ${origem} ${id}: erro ${String(e.message).split('\n')[0]} url=${page.url()}`); continue; }
      // O R2 guarda o primeiro bloco com bottom > 0, que pode ser um anterior ao `id` colocado em 80 px
      // (parágrafo alto que ainda passa sob o cabeçalho). É esse bloco que tem de ficar no mesmo ponto.
      const alvo = await page.evaluate(() => [...document.querySelectorAll('[data-ancora]')].find((e) => e.getBoundingClientRect().bottom > 0)?.dataset.ancora);
      const antes = await topo(page, alvo);
      const m0 = await fim(page);
      await trocar(page);
      const depois = await topo(page, alvo);
      const m1 = await fim(page);
      resumo.testadas++;
      const dif = depois === null ? null : depois - antes;
      if (dif !== null && Math.abs(dif) <= 0.5) { resumo.maxDif = Math.max(resumo.maxDif, Math.abs(dif)); continue; }
      const nofim = m1.y >= m1.max - 1 || m0.y >= m0.max - 1;
      if (nofim) { resumo.fimDePagina++; log(`T2 ${dir} ${larg} ${origem}#${id}: fim de página, dif=${dif}`); continue; }
      resumo.falhas.push(`${dir} ${larg} ${origem} ${id}: antes=${antes} depois=${depois}`);
    }
    await ctx.close();
  }
  const tarefas = [];
  for (const [larg, alt] of [[390, 844], [1280, 800]]) for (const pg of paginas) for (const dir of ['PT->EN', 'EN->PT']) tarefas.push(() => varrer(larg, alt, pg, dir));
  for (let i = 0; i < tarefas.length; i += 4) await Promise.all(tarefas.slice(i, i + 4).map((f) => f()));
  ok(`T2 âncoras testadas=${resumo.testadas} (fim de página aceitos=${resumo.fimDePagina}) com diferença <= 0.5 px (máx ${resumo.maxDif.toFixed(3)})`, resumo.falhas.length === 0, resumo.falhas.slice(0, 15).join(' | '));

  // ---- T3: fim da página ----
  {
    const page = await ctx0.newPage();
    await abrir(page, '');
    await page.evaluate(() => { const y = document.documentElement.scrollHeight; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); });
    await espera(300);
    const a = await fim(page);
    await trocar(page);
    const b = await fim(page);
    log(`T3 origem y=${a.y}/${a.max} destino y=${b.y}/${b.max} dif=${b.y - b.max}`);
    ok('T3 fim da página PT -> EN fica no fim', a.y >= a.max - 1 && b.y >= b.max - 1, `destino y=${b.y} max=${b.max}`);
    await page.close();
  }

  // ---- T6 (C5): entrada velha ou de outro caminho é ignorada e apagada ----
  for (const [rot, entrada] of [['(a) 6 s atrás', { caminho: '/en/', ancora: 'proj-infohub', top: 120, quando: Date.now() - 6000 }], ['(b) outro caminho', { caminho: '/projeto-lms.html', ancora: 'proj-infohub', top: 120, quando: Date.now() }]]) {
    const page = await ctx0.newPage();
    await page.goto(url + 'en/', { waitUntil: 'load' });
    await page.evaluate((e) => sessionStorage.setItem('troca-lingua', JSON.stringify(e)), entrada);
    await page.goto(url + 'en/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
    await espera(500);
    const r = await page.evaluate(() => ({ y: window.scrollY, chave: sessionStorage.getItem('troca-lingua') }));
    ok(`T6 ${rot}: abre no topo e apaga a chave`, r.y === 0 && r.chave === null, JSON.stringify(r));
    await page.close();
  }

  // ---- T7 (C6): sem JS a troca abre a outra página no topo ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.mouse.wheel(0, 2000);
    await espera(300);
    await Promise.all([page.waitForURL('**/en/'), page.click('header .lang a[hreflang]:not([aria-current])')]);
    await espera(300);
    let y = 'n/d';
    try { y = await page.evaluate(() => window.scrollY); } catch {}
    ok('T7 sem JS: abre /en/ no topo', page.url().endsWith('/en/') && (y === 0 || y === 'n/d'), `url=${page.url()} scrollY=${y}`);
    await ctx.close();
  }

  }
  await ctx0.close();
} finally {
  await browser.close();
  await fechar();
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
