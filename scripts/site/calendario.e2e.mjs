// Aceite no navegador do calendário do GitHub (spec 002b): T6 (sem JS, C7 + 001b C4) e T7 parte dos eixos (C8, contraste AA).
// Fatia 3: T1 a T4 (tooltip, toque, teclado, bordas), T7 do tooltip (contraste) e movimento reduzido, num site de fixture.
// Fora do glob do `node --test` (nome sem .test.mjs). Rodar depois de `npm run build`:
//   node scripts/site/calendario.e2e.mjs [--raiz dist]
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const base = fileURLToPath(new URL('../../', import.meta.url));
const { chromium } = await carregarPlaywright();
const { url, fechar } = await servir(resolve(base, argumento('raiz', 'dist')));
const totalDias = JSON.parse(readFileSync(resolve(base, 'src/data/github.json'), 'utf8')).calendario.totalDias;

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const browser = await chromium.launch();

// Visível = caixa com largura e altura > 0, opacity 1 e visibility visible.
const visivel = (sel, todos = false) => (page) => page.evaluate(([s, t]) => {
  const els = [...document.querySelectorAll(s)];
  if (!els.length) return false;
  return (t ? els : els.slice(0, 1)).every((el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.opacity === '1' && cs.visibility === 'visible';
  });
}, [sel, todos]);

// T6: sem JS, a grade, os meses, os dias da semana e a legenda aparecem.
async function t6() {
  for (const caminho of ['', 'en/']) for (const [w, h] of [[390, 844], [1280, 800]]) {
    const rot = `T6 sem JS /${caminho} ${w}px`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(url + caminho, { waitUntil: 'load' });
    // sem JS o scrollIntoView não existe: a seção só precisa estar renderizada no documento
    const checks = [['.cal-tabela', false], ['.cal-meses span', true], ['.cal-ds:not(:empty)', true], ['.cal-legenda', false]];
    for (const [sel, todos] of checks) ok(`${rot}: ${sel} visível`, await visivel(sel, todos)(page));
    const dias = await page.locator('.cal-dia').count();
    ok(`${rot}: 365 ou 371 dias e igual a calendario.totalDias`, (dias === 365 || dias === 371) && dias === totalDias, `dias=${dias} totalDias=${totalDias}`);
    ok(`${rot}: três rótulos de dia da semana`, (await page.locator('.cal-ds:not(:empty)').count()) === 3);
    if (w === 390) {
      const r = await page.evaluate(() => {
        const sc = document.querySelector('.cal-scroll'), ds = document.querySelector('.cal-ds:not(:empty)');
        const antes = ds.getBoundingClientRect().left;
        const rola = sc.scrollWidth > sc.clientWidth;
        sc.scrollLeft = sc.scrollWidth;
        return { rola, antes, depois: ds.getBoundingClientRect().left, left: sc.scrollLeft };
      });
      ok(`${rot}: a grade rola na horizontal`, r.rola && r.left > 0, JSON.stringify(r));
      ok(`${rot}: coluna dos dias fica parada (sticky)`, Math.abs(r.antes - r.depois) < 0.5, `antes=${r.antes} depois=${r.depois}`);
    }
    await ctx.close();
  }
}

// T7 (eixos): contraste AA do texto dos eixos e da legenda, nos dois temas.
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
async function t7() {
  for (const tema of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: tema });
    await ctx.addInitScript((t) => { try { localStorage.setItem('tema', t); } catch {} }, tema);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    const medidas = await page.evaluate(() => {
      // converte qualquer cor computada em rgba via canvas
      const c = document.createElement('canvas').getContext('2d');
      const rgba = (v) => { c.clearRect(0, 0, 1, 1); c.fillStyle = '#000'; c.fillStyle = v; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const fundo = (el) => { for (let e = el; e; e = e.parentElement) { const v = rgba(getComputedStyle(e).backgroundColor); if (v[3] > 0) return v.slice(0, 3); } return [255, 255, 255]; };
      return ['.cal-meses span', '.cal-ds:not(:empty)', '.cal-legenda span'].map((s) => {
        const el = document.querySelector(s);
        return { s, cor: rgba(getComputedStyle(el).color).slice(0, 3), fundo: fundo(el) };
      });
    });
    for (const m of medidas) { const r = contraste(m.cor, m.fundo); ok(`T7 ${tema}: contraste de ${m.s} >= 4,5`, r >= 4.5, r.toFixed(2)); }
    await ctx.close();
  }
}

// ---- Fatia 3: tooltip por dia e navegação por teclado (spec 002b R3, R4) ----
// Site de fixture: github.json com 2026-03-02 = 7, 03-03 = 1, 03-04 = 0, construído em .astro/ (mesmo mecanismo do build.test.mjs).
mkdirSync(resolve(base, '.astro'), { recursive: true });
const tmpFix = mkdtempSync(join(resolve(base, '.astro'), 'teste-cal-dica-'));
const fix = JSON.parse(readFileSync(resolve(base, 'src/data/github.json'), 'utf8'));
for (const [data, c, n] of [['2026-03-02', 7, 4], ['2026-03-03', 1, 1], ['2026-03-04', 0, 0]]) {
  for (const sem of fix.calendario.semanas) for (const d of sem.dias) if (d.data === data) { d.contagem = c; d.nivel = n; }
}
writeFileSync(join(tmpFix, 'github.json'), JSON.stringify(fix, null, 2) + '\n');
const saida = join(tmpFix, 'dist');
execFileSync('npx', ['astro', 'build', '--outDir', saida], { cwd: base, stdio: 'pipe', env: { ...process.env, GH_JSON_TESTE: join(tmpFix, 'github.json') } });
const srvFix = await servir(saida);
const urlF = srvFix.url;

const esperado = {
  '': { '2026-03-02': '7 contribuições em 2 de mar. de 2026', '2026-03-03': '1 contribuição em 3 de mar. de 2026', '2026-03-04': 'Nenhuma contribuição em 4 de mar. de 2026' },
  'en/': { '2026-03-02': '7 contributions on Mar 2, 2026', '2026-03-03': '1 contribution on Mar 3, 2026', '2026-03-04': 'No contributions on Mar 4, 2026' },
};
const dicaAberta = (page) => page.evaluate(() => {
  const d = document.querySelector('.cal-dica');
  if (!d) return null;
  const r = d.getBoundingClientRect(), cs = getComputedStyle(d);
  const ok = r.width > 0 && r.height > 0 && cs.visibility === 'visible' && Number(cs.opacity) > 0;
  return ok ? { texto: d.textContent.trim(), top: r.top, bottom: r.bottom, left: r.left, right: r.right } : null;
});
const retDia = (page, data) => page.evaluate((d) => { const r = document.querySelector(`.cal-dia[data-data="${d}"]`).getBoundingClientRect(); return { top: r.top, left: r.left, right: r.right, cx: (r.left + r.right) / 2 }; }, data);
const aguardaDica = (page, aberta = true) => page.waitForFunction((a) => {
  const d = document.querySelector('.cal-dica');
  if (!d) return !a;
  const r = d.getBoundingClientRect(), cs = getComputedStyle(d);
  const v = r.width > 0 && r.height > 0 && cs.visibility === 'visible' && Number(cs.opacity) > 0;
  return v === a;
}, aberta, { timeout: 1500 }).then(() => true, () => false);
const visorScroll = (page) => page.evaluate(() => { const r = document.querySelector('.cal-scroll').getBoundingClientRect(); return { l: Math.max(0, r.left), r: Math.min(innerWidth, r.right) }; });

async function t1() {
  for (const caminho of ['', 'en/']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(urlF + caminho, { waitUntil: 'load' });
    for (const [data, texto] of Object.entries(esperado[caminho])) {
      const sel = `.cal-dia[data-data="${data}"]`;
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      // espera a rolagem (Lenis) assentar: scrollY e scrollLeft iguais por ~2 quadros
      await page.evaluate(() => new Promise((res) => { const pos = () => [scrollY, document.querySelector('.cal-scroll').scrollLeft].join(); let ult = pos(), n = 0; const f = () => { const p = pos(); n = p === ult ? n + 1 : 0; ult = p; n >= 2 ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); }));
      const cx = await retDia(page, data);
      const t0 = Date.now();
      await page.mouse.move(cx.cx, cx.top + 4);
      const abriu = await aguardaDica(page);
      const dt = Date.now() - t0;
      const d = await dicaAberta(page), q = await retDia(page, data);
      const rot = `T1 /${caminho} ${data}`;
      ok(`${rot}: dica com o texto exato`, !!d && d.texto === texto, JSON.stringify(d && d.texto));
      ok(`${rot}: abre em até 100 ms do hover (hover incluso)`, abriu && dt <= 100 + 150, `${dt} ms`);
      ok(`${rot}: acima do quadrado e centrada`, !!d && d.bottom <= q.top + 0.5 && Math.abs((d.left + d.right) / 2 - q.cx) < 1.5, JSON.stringify({ d, q }));
    }
    await ctx.close();
  }
}

async function t2() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(urlF, { waitUntil: 'load' });
  const sel = '.cal-dia[data-data="2026-03-03"]';
  await page.locator(sel).scrollIntoViewIfNeeded();
  await page.locator(sel).tap();
  ok('T2 toque no quadrado abre a dica', await aguardaDica(page));
  await page.locator('h1').first().tap({ force: true });
  ok('T2 toque fora fecha a dica', await aguardaDica(page, false));
  await page.locator(sel).tap();
  const reabriu = await aguardaDica(page);
  await page.evaluate(() => window.scrollBy(0, 200));
  ok('T2 rolar a página fecha a dica', reabriu && await aguardaDica(page, false));
  await ctx.close();
}

async function t3() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(urlF, { waitUntil: 'load' });
  const ultimo = await page.evaluate(() => { const t = [...document.querySelectorAll('.cal-dia')].filter((e) => e.getAttribute('tabindex') === '0'); return t.length === 1 ? t[0].dataset.data : null; });
  const datas = await page.evaluate(() => [...document.querySelectorAll('.cal-dia')].map((e) => e.dataset.data));
  ok('T3 um único Tab stop e é o dia mais recente', ultimo === datas.reduce((m, d) => (d > m ? d : m)), String(ultimo));
  for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); if (await page.evaluate(() => document.activeElement.classList.contains('cal-dia'))) break; }
  const foco = () => page.evaluate(() => document.activeElement.dataset ? document.activeElement.dataset.data : null);
  const soma = (data, n) => { const d = new Date(data + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  ok('T3 Tab chega ao dia mais recente', (await foco()) === ultimo, String(await foco()));
  ok('T3 dica abre com o foco', await aguardaDica(page));
  await page.keyboard.press('ArrowLeft');
  const a = soma(ultimo, -7);
  ok('T3 ArrowLeft: dia 7 dias antes', (await foco()) === a, `${await foco()} esperado ${a}`);
  await page.keyboard.press('ArrowUp');
  const b = soma(a, -1);
  ok('T3 ArrowUp: dia anterior', (await foco()) === b, `${await foco()} esperado ${b}`);
  ok('T3 dica acompanha o foco', await page.waitForFunction((t) => document.querySelector('.cal-dica')?.textContent.trim() === document.activeElement.querySelector('.sr-only').textContent.trim() && !!t, 1, { timeout: 1000 }).then(() => true, () => false));
  await page.keyboard.press('End');
  const fim = await page.evaluate(() => { const f = document.activeElement; const linha = f.closest('.cal-linha'); const dias = [...linha.querySelectorAll('.cal-dia')]; return { f: f.dataset.data, ultimo: dias[dias.length - 1].dataset.data, linha: [...f.closest('.cal-tabela').querySelectorAll('.cal-linha')].indexOf(linha) }; });
  const diaSemana = new Date(b + 'T00:00:00Z').getUTCDay();
  ok('T3 End: último dia da linha (mesmo dia da semana)', fim.f === fim.ultimo && fim.linha === diaSemana, JSON.stringify(fim));
  await page.keyboard.press('Home');
  const ini = await page.evaluate(() => { const f = document.activeElement; const dias = [...f.closest('.cal-linha').querySelectorAll('.cal-dia')]; return { f: f.dataset.data, primeiro: dias[0].dataset.data }; });
  ok('T3 Home: primeiro dia da linha', ini.f === ini.primeiro, JSON.stringify(ini));
  await page.keyboard.press('ArrowLeft');
  ok('T3 na borda a seta não faz nada', (await foco()) === ini.f);
  await page.keyboard.press('End');
  const antesEsc = await foco();
  await page.keyboard.press('Escape');
  ok('T3 Esc fecha a dica', await aguardaDica(page, false));
  ok('T3 Esc mantém o foco na célula', (await foco()) === antesEsc);
  const tabs = await page.evaluate(() => [...document.querySelectorAll('.cal-dia')].filter((e) => e.getAttribute('tabindex') === '0').map((e) => e.dataset.data));
  ok('T3 só uma célula com tabindex=0 e é a focada', tabs.length === 1 && tabs[0] === antesEsc, JSON.stringify(tabs));
  await ctx.close();
}

async function t4() {
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(urlF, { waitUntil: 'load' });
    const datas = await page.evaluate(() => { const l = [...document.querySelectorAll('.cal-dia')].map((e) => e.dataset.data); return [l[0], l[l.length - 1]]; });
    for (const data of datas) {
      const sel = `.cal-dia[data-data="${data}"]`;
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.locator(sel).focus();
      await aguardaDica(page);
      const d = await dicaAberta(page), v = await visorScroll(page);
      ok(`T4 ${w}px ${data}: dica dentro da janela e do .cal-scroll`, !!d && d.left >= 0 && d.right <= w && d.left >= v.l - 0.5 && d.right <= v.r + 0.5, JSON.stringify({ d, v }));
    }
    await ctx.close();
  }
}

async function t7dica() {
  for (const tema of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: tema });
    await ctx.addInitScript((t) => { try { localStorage.setItem('tema', t); } catch {} }, tema);
    const page = await ctx.newPage();
    await page.goto(urlF, { waitUntil: 'load' });
    await page.locator('.cal-dia[data-data="2026-03-02"]').hover();
    await aguardaDica(page);
    const m = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      const rgba = (v) => { c.clearRect(0, 0, 1, 1); c.fillStyle = '#000'; c.fillStyle = v; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const el = document.querySelector('.cal-dica'), cs = getComputedStyle(el);
      return { cor: rgba(cs.color).slice(0, 3), fundo: rgba(cs.backgroundColor).slice(0, 3), alfa: rgba(cs.backgroundColor)[3] };
    });
    ok(`T7 ${tema}: fundo da dica opaco`, m.alfa === 1, String(m.alfa));
    const r = contraste(m.cor, m.fundo);
    ok(`T7 ${tema}: contraste do texto da dica >= 4,5`, r >= 4.5, r.toFixed(2));
    await ctx.close();
  }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(urlF, { waitUntil: 'load' });
  const td = await page.evaluate(() => { const d = document.querySelector('.cal-dica'); return d ? getComputedStyle(d).transitionDuration : null; });
  ok('movimento reduzido: .cal-dica sem transição', td === '0s', String(td));
  await ctx.close();
}

try { await t6(); await t7(); await t1(); await t2(); await t3(); await t4(); await t7dica(); } finally { await browser.close(); await fechar(); await srvFix.fechar(); rmSync(tmpFix, { recursive: true, force: true }); }
console.log(falhas ? `\n${falhas} falha(s)` : '\ntodos passaram');
process.exit(falhas ? 1 : 0);
