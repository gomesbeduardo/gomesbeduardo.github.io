// Aceite no navegador do contato e do rodapé (spec 006): A2, A3, A4, A6, A7, C6, C12 e o Esc com o verso da foto aberto.
// Fora do glob do `node --test` (nome sem .test.mjs). Sem dependência no repo: usa o Playwright do cache do npx.
// Rodar (fora do sandbox, o Chromium não abre dentro dele):
//   node scripts/site/contato.e2e.mjs [--raiz dist]
// Os prints do A7 vão para $TMPDIR/contato-e2e (fora do repo).
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const { chromium } = await carregarPlaywright();

const { url, fechar } = await servir(resolve(fileURLToPath(new URL('../../', import.meta.url)), argumento('raiz', 'dist')));

const MAIL = 'eduardobgomes100@gmail.com';
const prints = join(process.env.TMPDIR || tmpdir(), 'contato-e2e');
await mkdir(prints, { recursive: true });
const caminhos = [];

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
async function abrir(largura, altura, opts = {}, { clip = 'ok', caminho = '' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, permissions: ['clipboard-read', 'clipboard-write'], ...opts });
  if (clip === 'falha') await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('negado')) }, configurable: true }); });
  const page = await ctx.newPage();
  await page.goto(url + caminho, { waitUntil: 'load' });
  await page.waitForSelector('#contato');
  await espera(2500); // intro e animações do topo
  return { ctx, page };
}
const estado = (page) => page.evaluate(() => {
  const c = document.querySelector('.aviso-caixa'), cs = getComputedStyle(c);
  return { on: document.querySelector('.aviso').classList.contains('on'), vis: cs.visibility, op: parseFloat(cs.opacity), tr: cs.transform, falha: document.querySelector('.aviso').classList.contains('falha') };
});
const foco = (page) => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.className || a.tagName) : ''; });

try {
  // ---- A2: cópia com sucesso (1280 px, botão da seção Contato) ----
  {
    const { ctx, page } = await abrir(1280, 800);
    const btn = page.locator('#contato [data-copiar-email]');
    await btn.scrollIntoViewIfNeeded();
    const t0 = Date.now();
    await btn.click();
    await espera(400);
    ok('A2: a área de transferência recebe exatamente o e-mail', await page.evaluate(() => navigator.clipboard.readText()) === MAIL);
    const txt = await page.evaluate(() => document.querySelector('.aviso').textContent.replace(/\s+/g, ' '));
    const e1 = await estado(page);
    ok('A2: aviso visível com "E-mail copiado" e o endereço', e1.on && e1.vis === 'visible' && txt.includes('E-mail copiado') && txt.includes(MAIL), `${txt} / ${JSON.stringify(e1)}`);
    ok('A2: o foco continua no item', await page.evaluate(() => document.activeElement === document.querySelector('#contato [data-copiar-email]')), await foco(page));
    await espera(Math.max(0, 2000 - (Date.now() - t0))); // ~2 s desde o clique: ainda na tela
    ok('A2: aos ~2 s o aviso ainda está na tela', (await estado(page)).on);
    await espera(Math.max(0, 3300 - (Date.now() - t0))); // ~3,3 s: já saiu
    const e2 = await estado(page);
    ok('A2: aos ~3,3 s o aviso sumiu (cerca de 2,5 s)', !e2.on && e2.vis === 'hidden', JSON.stringify(e2));
    ok('A2: o foco segue no item depois que o aviso some', await page.evaluate(() => document.activeElement === document.querySelector('#contato [data-copiar-email]')));

    // segundo clique de sucesso: o texto do role=status é limpo e reposto (leitor de tela anuncia de novo)
    await btn.click(); await espera(200);
    await page.evaluate(() => { window.__tx = []; const t = document.querySelector('.aviso-t'); new MutationObserver(() => window.__tx.push(t.textContent)).observe(t, { childList: true, characterData: true, subtree: true }); });
    await btn.click(); await espera(300);
    const tx = await page.evaluate(() => window.__tx);
    ok('baixo: segundo sucesso limpa e repõe o texto do role=status', tx.includes('') && tx[tx.length - 1] === 'E-mail copiado', JSON.stringify(tx));
    await ctx.close();
  }

  // ---- A3: falha na cópia (1280 px, botão do rodapé) ----
  {
    const { ctx, page } = await abrir(1280, 800, {}, { clip: 'falha' });
    const btn = page.locator('footer [data-copiar-email]');
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await espera(400);
    const e1 = await estado(page);
    const txt = await page.evaluate(() => document.querySelector('.aviso').textContent.replace(/\s+/g, ' '));
    ok('A3: aviso de falha aparece', e1.on && e1.falha && e1.vis === 'visible' && txt.includes('Não deu para copiar'), txt);
    ok('A3: o foco vai para "Abrir no app de e-mail"', await page.evaluate(() => document.activeElement === document.querySelector('.aviso-app')) && await page.evaluate(() => document.querySelector('.aviso-app').textContent) === 'Abrir no app de e-mail');
    await espera(3500);
    ok('A3: o aviso de falha não some sozinho', (await estado(page)).on);
    await page.keyboard.press('Escape'); await espera(400);
    ok('A3: Esc fecha o aviso', !(await estado(page)).on);
    ok('A3: Esc devolve o foco ao item', await page.evaluate(() => document.activeElement === document.querySelector('footer [data-copiar-email]')));
    await ctx.close();
  }

  // ---- A4 e C6: movimento reduzido, só opacidade, esmaece ao entrar e ao sair ----
  {
    const { ctx, page } = await abrir(1280, 800, { reducedMotion: 'reduce' });
    const btn = page.locator('#contato [data-copiar-email]');
    await btn.scrollIntoViewIfNeeded();
    const trs = [];
    const amostrar = async (n, ms) => { for (let i = 0; i < n; i++) { trs.push((await estado(page)).tr); await espera(ms); } };
    await btn.click();
    const entrada = []; for (let i = 0; i < 8; i++) { entrada.push(await estado(page)); await espera(25); }
    trs.push(...entrada.map((e) => e.tr));
    await espera(300);
    ok('C6: entrada por esmaecer (opacidade intermediária com o aviso visível)', entrada.some((e) => e.vis === 'visible' && e.op > 0 && e.op < 1), JSON.stringify(entrada.map((e) => e.op)));
    // saída: tira .on e amostra
    await page.evaluate(() => document.querySelector('.aviso').classList.remove('on'));
    const saida = []; for (let i = 0; i < 12; i++) { saida.push(await estado(page)); await espera(20); }
    trs.push(...saida.map((e) => e.tr));
    await espera(400);
    const fim = await estado(page);
    ok('C6: saída esmaece (visível com opacidade entre 0 e 1 durante a transição)', saida.some((e) => e.vis === 'visible' && e.op > 0 && e.op < 1), JSON.stringify(saida.map((e) => `${e.vis[0]}${e.op.toFixed(2)}`)));
    ok('C6: depois da transição fica oculto com opacidade 0', fim.vis === 'hidden' && fim.op === 0, JSON.stringify(fim));
    ok('A4: sem transform na entrada nem na saída', trs.every((t) => t === 'none'), [...new Set(trs)].join(' | '));
    await ctx.close();
  }

  // ---- A6: Voltar ao topo (Lenis normal e movimento reduzido) ----
  for (const reduzido of [false, true]) {
    const { ctx, page } = await abrir(1280, 800, reduzido ? { reducedMotion: 'reduce' } : {});
    await page.evaluate(() => window.scrollTo(0, 2500)); await espera(600);
    const antes = await page.evaluate(() => scrollY);
    await page.locator('footer [data-topo]').click();
    await espera(2200);
    const r = await page.evaluate(() => ({ y: scrollY, foco: document.activeElement && document.activeElement.id }));
    ok(`A6${reduzido ? ' (movimento reduzido)' : ''}: clique leva ao topo (de ${Math.round(antes)}) com o foco no início do conteúdo`, antes > 1000 && r.y === 0 && r.foco === 'conteudo', JSON.stringify(r));
    await ctx.close();
  }

  // ---- Esc com o verso da foto (spec 005) aberto e o aviso de falha aberto ----
  {
    const { ctx, page } = await abrir(1280, 800, {}, { clip: 'falha' });
    await page.evaluate(() => { const f = document.querySelector('#sp-foto'); for (let i = 0; i < 5; i++) f.click(); });
    await espera(900);
    ok('Esc: verso da foto aberto', await page.locator('.photo.virado').count() === 1);
    await page.locator('footer [data-copiar-email]').click({ force: true });
    await espera(400);
    ok('Esc: aviso de falha aberto junto com o verso', (await estado(page)).on && await page.locator('.photo.virado').count() === 1);
    await page.keyboard.press('Escape'); await espera(900);
    const a = await estado(page), virado = await page.locator('.photo.virado').count();
    ok('Esc: um Esc fecha só o de cima (o aviso, fixo com z-index 250); o verso continua', !a.on && virado === 1, `aviso aberto=${a.on}, verso aberto=${virado === 1}`);
    await page.keyboard.press('Escape'); await espera(900);
    ok('Esc: o segundo Esc fecha o verso', await page.locator('.photo.virado').count() === 0);
    await ctx.close();
  }

  // ---- A7 (+ C8, C12, alvos de 44 px): 320, 390 e 1280 px nos dois temas ----
  const alvos = (page) => page.evaluate(() => {
    const med = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 18), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, x: r.x, y: r.y }; });
    return { foot: med('.foot-col a, .foot-col button'), lang: med('.foot-fim .foot-lang a'), fim: med('.foot-fim > a'), sobre: med('.foot-sobre a'), links: med('#contato .links a, #contato .links button') };
  });
  for (const [larg, alt] of [[320, 640], [390, 844], [1280, 800]]) {
    for (const tema of ['light', 'dark']) {
      const { ctx, page } = await abrir(larg, alt, { colorScheme: tema }, { clip: 'falha' });
      const rot = `${larg}px ${tema}`;
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth }));
      ok(`A7 ${rot}: nada passa da largura da tela`, m.sw <= m.vw, JSON.stringify(m));
      const est = await page.evaluate(() => {
        const q = (s) => document.querySelector(s), t = (s) => (q(s) ? q(s).textContent.replace(/\s+/g, ' ').trim() : '');
        const r = (s) => { const b = q(s).getBoundingClientRect(); return { x: b.x, y: b.y, r: b.right, b: b.bottom }; };
        return {
          nav: [...document.querySelectorAll('.foot-nav a')].map((a) => a.textContent.trim()), cont: [...document.querySelectorAll('.foot-contato a, .foot-contato button')].map((a) => a.textContent.trim()),
          fim: t('.foot-fim'), sobre: t('.foot-sobre'), repo: !!q('.foot-sobre a[href*="gomesbeduardo.github.io"]'), lang: !!q('.foot-lang a[aria-current]'), topo: !!q('.foot-fim [data-topo]'),
          rn: r('.foot-nav'), rc: r('.foot-contato'), rq: r('.foot-quote'), rs: r('.foot-sobre'), rf: r('.foot-fim'),
        };
      });
      ok(`A7 ${rot}: rodapé segue C8 (colunas, sobre o site, linha final)`, est.nav.join() === 'Sobre,Trajetória,Experiência,Projetos,Números,Contato' && est.cont.join() === 'E-mail,LinkedIn,GitHub,Baixar currículo' && est.repo && est.lang && est.topo && /©.*Eduardo.*Santa Maria/.test(est.fim) && /Voltar ao topo/.test(est.fim), JSON.stringify({ n: est.nav, c: est.cont }));
      if (larg <= 860) {
        const lado = Math.abs(est.rn.y - est.rc.y) < 2 && est.rn.r <= est.rc.x + 1 && est.rq.b <= est.rn.y + 1 && est.rc.b <= est.rs.y && est.rs.b <= est.rf.y;
        ok(`A7 ${rot}: C12 frase em cima, Navegação e Contato lado a lado, depois sobre o site e linha final`, lado, JSON.stringify({ nav: est.rn, cont: est.rc }));
        const a = await alvos(page);
        const peq = [...a.foot, ...a.lang].filter((e) => e.w < 44 || e.h < 44);
        ok(`A7 ${rot}: Navegação, Contato e PT · EN do rodapé com 44 x 44 px ou mais`, peq.length === 0, peq.map((e) => `${e.t} ${e.w}x${e.h}`).join('; '));
        const peqH = [...a.fim, ...a.sobre, ...a.links].filter((e) => e.h < 44);
        ok(`A7 ${rot}: demais alvos do rodapé e da seção Contato com 44 px de altura`, peqH.length === 0, peqH.map((e) => `${e.t} ${e.w}x${e.h}`).join('; '));
        const [pt, en] = a.lang; const espaco = en.x - (pt.x + pt.w);
        ok(`A7 ${rot}: PT e EN não se tocam (alvos sem sobreposição)`, espaco >= 0, `folga ${espaco}`);
      } else {
        ok(`A7 ${rot}: desktop, Navegação e Contato em colunas ao lado da frase`, Math.abs(est.rn.y - est.rc.y) < 2 && est.rq.r <= est.rn.x + 1, JSON.stringify({ q: est.rq, n: est.rn }));
      }
      // aviso de falha aberto também não estoura a largura
      await page.locator('footer [data-copiar-email]').click(); await espera(400);
      const m2 = await page.evaluate(() => { const b = document.querySelector('.aviso-caixa').getBoundingClientRect(); return { sw: document.documentElement.scrollWidth, vw: innerWidth, l: b.left, r: b.right }; });
      ok(`A7 ${rot}: com o aviso de falha aberto, nada passa da largura`, m2.sw <= m2.vw && m2.l >= 0 && m2.r <= m2.vw, JSON.stringify(m2));
      await page.keyboard.press('Escape'); await espera(400);
      for (const [nome, sel] of [['contato', '#contato'], ['rodape', 'footer']]) {
        const f = join(prints, `${nome}-${larg}-${tema}.png`);
        await page.locator(sel).screenshot({ path: f }); caminhos.push(f);
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  await fechar();
}
console.log('\nPrints do A7:\n' + caminhos.join('\n'));
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
