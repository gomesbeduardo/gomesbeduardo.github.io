// Aceites A2, A4, A1a, A5 (320 a 414 px, PT e EN) e A8 da spec 005 no navegador. Complementa foto.e2e.mjs (arquivo separado de propósito).
// Fora do glob do `node --test` (nome sem .test.mjs). Sem dependência no repo: usa o Playwright do cache do npx.
// Rodar (fora do sandbox, o Chromium não abre dentro dele):
//   node scripts/site/foto-aceites.e2e.mjs [--raiz dist]
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argumento, carregarPlaywright, servir } from './lib-e2e.mjs';

const { chromium } = await carregarPlaywright();

const { url, fechar } = await servir(resolve(fileURLToPath(new URL('../../', import.meta.url)), argumento('raiz', 'dist')));

let falhas = 0;
const ok = (nome, cond, info = '') => { if (!cond) falhas++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${nome}${info ? '  ' + info : ''}`); };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const tmp = process.env.TMPDIR || '/tmp';
const browser = await chromium.launch();
async function abrir(largura, altura, opts = {}, tema, rota = '') {
  const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, ...opts });
  if (tema) await ctx.addInitScript((t) => { try { localStorage.setItem('tema', t); } catch {} }, tema);
  const page = await ctx.newPage();
  await page.goto(url + rota, { waitUntil: 'load' });
  await page.waitForSelector('#sp-foto');
  await espera(2500); // intro e animações do topo
  return { ctx, page };
}
const cinco = (page) => page.evaluate(() => { for (let i = 0; i < 5; i++) document.querySelector('#sp-foto').click(); });
const caixa = (page) => page.evaluate(() => {
  const r = document.querySelector('.photo').getBoundingClientRect(), h = document.querySelector('.hero h1').getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, h1: h.top };
});
const igual = (a, b, tol = 1) => ['x', 'y', 'w', 'h', 'h1'].every((k) => Math.abs(a[k] - b[k]) <= tol);
// cos do giro: o card usa perspective(1200px) rotateY(a), então m11 = cos(a); sem giro o transform é "none"
const COS = `(() => { const t = getComputedStyle(document.querySelector('.photo-card')).transform; if (t === 'none') return 1; const m = t.match(/matrix(3d)?\\(([^)]+)\\)/); return m ? parseFloat(m[2].split(',')[0]) : NaN; })()`;

try {
  // ---- A2: bloco ocre parado e verso completo, a 1280 px, nos dois temas ----
  for (const tema of ['light', 'dark']) {
    const { ctx, page } = await abrir(1280, 800, { colorScheme: tema }, tema);
    const modo = await page.evaluate(() => document.documentElement.dataset.mode);
    const ocre = () => page.evaluate(() => { const c = getComputedStyle(document.querySelector('.photo'), '::before'); return { t: c.transform, bg: c.backgroundColor, v: c.visibility, o: c.opacity }; });
    const faixa = async () => { const b = await caixa(page); return page.screenshot({ clip: { x: b.x + b.w + 3, y: b.y + b.h - 40, width: 8, height: 40 } }); };
    const antes = await caixa(page), o0 = await ocre(), f0 = await faixa();
    await page.screenshot({ path: `${tmp}/a2-${tema}-frente.png` });
    await cinco(page); await espera(900);
    const depois = await caixa(page), o1 = await ocre(), f1 = await faixa();
    await page.screenshot({ path: `${tmp}/a2-${tema}-verso.png` });
    ok(`A2 ${tema}: tema aplicado (${modo})`, modo === tema);
    ok(`A2 ${tema}: card virado`, await page.locator('.photo.virado').count() === 1);
    ok(`A2 ${tema}: bloco ocre na mesma posição`, igual(antes, depois) && o0.t === o1.t && o0.bg === o1.bg && o1.v === 'visible' && o1.o === '1', `${o0.t} ${o0.bg}`);
    ok(`A2 ${tema}: pixels da faixa ocre iguais antes e depois`, f0.equals(f1));
    const v = await page.evaluate(() => {
      const ph = document.querySelector('.photo').getBoundingClientRect(), root = document.querySelector('.photo .sp-verso');
      const campos = [...root.querySelectorAll('.sp-ficha dt, .sp-ficha dd')];
      const dentro = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility === 'visible' && s.display !== 'none' && r.left >= ph.left - 1 && r.right <= ph.right + 1 && r.top >= ph.top - 1 && r.bottom <= ph.bottom + 1 && e.textContent.trim().length > 0; };
      const um = (s) => { const e = root.querySelector(s); return !!e && dentro(e); };
      return { rotulo: um('.sec-label'), destaque: um('.sp-txt'), campos: campos.length, camposOk: campos.every(dentro), cont: um('.sp-cont') && /\d/.test(root.querySelector('.sp-cont').textContent), botao: um('.sp-volta') && /virar de volta/.test(root.querySelector('.sp-volta').textContent) };
    });
    ok(`A2 ${tema}: verso com rótulo, destaque, contagem e botão`, v.rotulo && v.destaque && v.cont && v.botao, JSON.stringify(v));
    ok(`A2 ${tema}: três campos da ficha (dt e dd) visíveis dentro do .photo`, v.campos === 6 && v.camposOk, `${v.campos} elementos`);
    await ctx.close();
  }

  // ---- A4: reduced motion, sem rotação em nenhuma face e esmaecer de 150 ms (C8) ----
  {
    const { ctx, page } = await abrir(1280, 800, { reducedMotion: 'reduce' });
    const r = await page.evaluate(() => new Promise((fim) => {
      const card = document.querySelector('.photo-card'), btn = document.querySelector('.photo-btn'), v = () => document.querySelector('.photo .sp-verso');
      const amostras = []; let t0 = null;
      const tick = () => {
        const vv = v();
        amostras.push({ t: t0 === null ? -1 : performance.now() - t0, tr: [card, btn, vv].map((e) => (e ? getComputedStyle(e).transform : 'none')), bt: parseFloat(getComputedStyle(btn).opacity), vo: vv ? parseFloat(getComputedStyle(vv).opacity) : 0 });
        if (t0 === null || performance.now() - t0 < 600) requestAnimationFrame(tick); else fim(amostras);
      };
      requestAnimationFrame(tick);
      setTimeout(() => { t0 = performance.now(); for (let i = 0; i < 5; i++) document.querySelector('#sp-foto').click(); }, 100);
    }));
    const depois = r.filter((a) => a.t >= 0);
    const gira = (t) => t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)';
    const rot = depois.filter((a) => a.tr.some(gira));
    ok('A4: nenhum transform de rotação em .photo-card, no verso nem no botão da frente', depois.length > 10 && rot.length === 0, `${depois.length} amostras; ex.: ${rot[0] ? rot[0].tr.join(' | ') : 'todas none'}`);
    const fim = depois.find((a) => a.vo >= 0.99 && a.bt <= 0.01);
    ok('A4: troca completa (verso opaco, frente apagada) em até 150 ms + 1 quadro (167 ms)', !!fim && fim.t <= 167, fim ? `${fim.t.toFixed(0)} ms` : 'não completou');
    const meio = depois.filter((a) => a.vo > 0.05 && a.vo < 0.95);
    ok('A4: há esmaecer de verdade (opacidade do verso entre 0,05 e 0,95 em algum quadro)', meio.length >= 1, `${meio.length} quadros intermediários; opacidades ${depois.filter((a) => a.vo > 0 && a.vo < 1).map((a) => a.vo.toFixed(2)).join(' ') || 'nenhuma'}`);
    const dur = await page.evaluate(() => ['.photo .sp-verso', '.photo .photo-btn'].map((s) => { const c = getComputedStyle(document.querySelector(s)); return `${c.transitionProperty}/${c.transitionDuration}`; }));
    ok('A4: transição de opacidade de 0.15s nas duas faces', dur.every((d) => d === 'opacity/0.15s'), dur.join(' ; '));
    const topo = await page.evaluate(() => { const t = document.querySelector('.photo .sp-verso .sp-txt').getBoundingClientRect(), e = document.elementFromPoint(t.left + t.width / 2, t.top + t.height / 2); return !!e && !!e.closest('.photo .sp-verso'); });
    ok('A4: o verso está de fato na tela (elementFromPoint no texto do verso cai dentro dele)', topo);
    ok('A4: virou de fato', await page.locator('.photo.virado').count() === 1);
    await ctx.close();
  }

  // ---- A1a: borda em todas as amostras de 40 ms (frente, de lado, costas), na ida e na volta ----
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    const { ctx, page } = await abrir(w, h);
    const alvo = await page.evaluate(() => { const p = document.createElement('i'); p.style.cssText = 'border:1px solid var(--line-strong)'; document.body.appendChild(p); const c = getComputedStyle(p).borderTopColor; p.remove(); return c; });
    const amostrar = (acao) => page.evaluate(([acao, cosSrc]) => new Promise((fim) => {
      const out = [], card = document.querySelector('.photo-card');
      const lado = (e) => { if (!e) return null; const s = getComputedStyle(e); return { w: ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(s['border' + k + 'Width'])), c: s.borderTopColor, st: s.borderTopStyle }; };
      const medir = () => out.push({ cos: eval(cosSrc), front: lado(document.querySelector('.photo-btn')), back: lado(document.querySelector('.photo .sp-verso')) });
      medir(); const iv = setInterval(medir, 40);
      setTimeout(acao === 'virar' ? () => { for (let i = 0; i < 5; i++) document.querySelector('#sp-foto').click(); } : () => document.querySelector('.photo .sp-volta').click(), 80);
      setTimeout(() => { clearInterval(iv); fim(out); }, 1200);
    }), [acao, COS]);
    for (const acao of ['virar', 'desvirar']) {
      const amostras = await amostrar(acao);
      const faces = (a) => [a.front, a.back].filter(Boolean);
      const ruins = amostras.filter((a) => faces(a).some((f) => !(f.w.every((x) => x === 1) && f.c === alvo && f.st === 'solid')));
      const cos = amostras.map((a) => a.cos);
      const lados = cos.some((c) => Math.abs(c) < 0.5);
      const frente = cos.some((c) => c > 0.99), costas = cos.some((c) => c < -0.99);
      ok(`A1a ${w}px ${acao}: borda de 1 px --line-strong em todas as ${amostras.length} amostras (estilo calculado)`, amostras.length >= 20 && ruins.length === 0, ruins[0] ? JSON.stringify(ruins[0]) : alvo);
      ok(`A1a ${w}px ${acao}: amostras pegam frente, lado e costas`, lados && frente && costas, `cos entre ${Math.min(...cos).toFixed(2)} e ${Math.max(...cos).toFixed(2)}`);
      if (acao === 'virar') ok(`A1a ${w}px: verso com borda parado nas costas`, amostras.at(-1).back && amostras.at(-1).back.w.every((x) => x === 1));
      await espera(300);
    }
    // pixels: com a animação a 1/5 da velocidade (CDP), tira um recorte da linha da borda de cima do card a cada amostra e compara a cor com --line-strong
    const cdp = await ctx.newCDPSession(page); await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.2 });
    const rgb = alvo.match(/\d+/g).slice(0, 3).map(Number);
    for (const acao of ['virar', 'desvirar']) {
      const cx = await page.evaluate(() => { const r = document.querySelector('.photo').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2) - 12, y: Math.round(r.top) - 3 }; });
      await page.evaluate((a) => { if (a === 'virar') for (let i = 0; i < 5; i++) document.querySelector('#sp-foto').click(); else document.querySelector('.photo .sp-volta').click(); }, acao);
      const colh = []; const fimT = Date.now() + 3200;
      while (Date.now() < fimT) {
        const est = await page.evaluate((cosSrc) => { const f = (e) => { if (!e) return { o: 0, v: 'ausente' }; const s = getComputedStyle(e); return { o: parseFloat(s.opacity), v: s.visibility }; }; return { cos: eval(cosSrc), front: f(document.querySelector('.photo-btn')), back: f(document.querySelector('.photo .sp-verso')) }; }, COS);
        colh.push({ est, png: (await page.screenshot({ clip: { x: cx.x, y: cx.y, width: 24, height: 7 } })).toString('base64') });
      }
      const dist = await page.evaluate(async ([lista, alvoRgb]) => {
        const out = [];
        for (const b64 of lista) {
          const bmp = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
          const c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d'); g.drawImage(bmp, 0, 0);
          const d = g.getImageData(0, 0, bmp.width, bmp.height).data; let min = 1e9;
          for (let i = 0; i < d.length; i += 4) min = Math.min(min, Math.max(Math.abs(d[i] - alvoRgb[0]), Math.abs(d[i + 1] - alvoRgb[1]), Math.abs(d[i + 2] - alvoRgb[2])));
          out.push(min);
        }
        return out;
      }, [colh.map((c) => c.png), rgb]);
      const lista = colh.map((c, i) => ({ ...c.est, d: dist[i] }));
      const visiveis = lista.filter((a) => Math.abs(a.cos) >= 0.5);
      const semBorda = visiveis.filter((a) => a.d > 12);
      const pintada = visiveis.filter((a) => { const f = a.cos > 0 ? a.front : a.back; return f.o !== 1 || f.v !== 'visible'; });
      const cos = lista.map((a) => a.cos);
      ok(`A1a ${w}px ${acao}: pixel da borda na cor --line-strong (${rgb.join(',')}) em ${visiveis.length} recortes de frente e de costas`, visiveis.length >= 15 && semBorda.length === 0, semBorda[0] ? `cos ${semBorda[0].cos.toFixed(2)} distância ${semBorda[0].d}` : `cos entre ${Math.min(...cos).toFixed(2)} e ${Math.max(...cos).toFixed(2)}`);
      ok(`A1a ${w}px ${acao}: face voltada para quem vê está pintada (opacity 1, visible)`, visiveis.length > 0 && pintada.length === 0, pintada[0] ? JSON.stringify(pintada[0]) : '');
      ok(`A1a ${w}px ${acao}: recortes pegam frente, lado e costas`, cos.some((c) => c > 0.99) && cos.some((c) => c < -0.99) && cos.some((c) => Math.abs(c) < 0.5), `${lista.length} recortes`);
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 }); await espera(300); await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.2 });
    }
    await ctx.close();
  }

  // ---- A5 em 320, 360, 390 e 414 px: caixa fixa, verso sem rolagem, sem ficha, sem estouro lateral ----
  for (const [lang, rota] of [['PT', ''], ['EN', 'en/']]) for (const w of [320, 360, 390, 414]) {
    const { ctx, page } = await abrir(w, 800, {}, undefined, rota);
    const antes = await caixa(page);
    const amostras = await page.evaluate(() => new Promise((fim) => {
      const out = [], m = () => { const r = document.querySelector('.photo').getBoundingClientRect(); out.push({ x: r.x, y: r.y, w: r.width, h: r.height, h1: document.querySelector('.hero h1').getBoundingClientRect().top }); };
      m(); const iv = setInterval(m, 40);
      setTimeout(() => { for (let i = 0; i < 5; i++) document.querySelector('#sp-foto').click(); }, 80);
      setTimeout(() => { clearInterval(iv); fim(out); }, 1000);
    }));
    const depois = await caixa(page);
    ok(`A5 ${lang} ${w}px: .photo e topo do h1 iguais antes, durante (${amostras.length} amostras) e depois`, amostras.every((a) => igual(a, antes)) && igual(depois, antes), JSON.stringify(depois));
    const v = await page.evaluate(() => {
      const verso = document.querySelector('.photo .sp-verso'), ficha = document.querySelector('.photo .sp-ficha');
      return { virado: document.querySelector('.photo').classList.contains('virado'), sh: verso.scrollHeight, ch: verso.clientHeight, sw: verso.scrollWidth, cw: verso.clientWidth, ficha: !!ficha && ficha.offsetParent !== null, estouro: document.documentElement.scrollWidth - innerWidth };
    });
    ok(`A5 ${lang} ${w}px: verso sem rolagem nem corte (scrollHeight = clientHeight)`, v.virado && v.sh === v.ch && v.sw <= v.cw, JSON.stringify(v));
    ok(`A5 ${lang} ${w}px: ficha oculta e nada passa da largura da tela`, !v.ficha && v.estouro <= 0, `estouro ${v.estouro}`);
    await page.screenshot({ path: `${tmp}/a5-${lang}-${w}.png` });
    await ctx.close();
  }

  // ---- A8: cartão da Trajetória e .sp-mais continuam virando ----
  {
    const { ctx, page } = await abrir(1280, 800);
    // o c10 não está ligado a nenhuma palavra hoje; usa a palavra do CS50 com o modo virar (o clique lê data-modo na hora)
    await page.evaluate(() => { document.querySelector('.traj-card .sp-word').dataset.modo = 'virar'; });
    await page.locator('.traj-card .sp-word').first().click();
    await espera(1200);
    const t = await page.evaluate(() => { const c = document.querySelector('.traj-card.virado'), v = c && c.querySelector('.sp-verso'); return { virado: !!c, txt: v ? v.querySelector('.sp-txt').textContent.length : 0, cont: v ? /\d/.test(v.querySelector('.sp-cont').textContent) : false, volta: !!(v && v.querySelector('.sp-volta')), frente: c ? [...c.children].filter((x) => !x.classList.contains('sp-verso') && getComputedStyle(x).display !== 'none').length : -1 }; });
    ok('A8: cartão da Trajetória vira e mostra o verso (texto, contagem, botão) sem a frente', t.virado && t.txt > 0 && t.cont && t.volta && t.frente === 0, JSON.stringify(t));
    await page.locator('.traj-card.virado .sp-volta').click(); await espera(1200);
    ok('A8: cartão da Trajetória desvira e a frente volta', await page.locator('.traj-card.virado').count() === 0 && await page.locator('.traj-card .sp-verso').count() === 0);
    await ctx.close();
  }
  {
    // com c1 a c9 já achadas, a primeira curiosidade do baralho é a c10 (modo virar), que cai no .sp-mais
    const { ctx, page } = await abrir(1280, 800);
    await page.evaluate(() => localStorage.setItem('achados', JSON.stringify(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'])));
    await page.reload({ waitUntil: 'load' }); await page.waitForSelector('#sp-curio'); await espera(2500);
    await page.locator('#sp-curio').click(); await espera(1200);
    const m = await page.evaluate(() => { const c = document.querySelector('.sp-mais.virado'), v = c && c.querySelector('.sp-verso'); return { virado: !!c, txt: v ? v.querySelector('.sp-txt').textContent.length : 0, volta: !!(v && v.querySelector('.sp-volta')), botao: c ? getComputedStyle(c.querySelector('#sp-curio')).display : '' }; });
    ok('A8: .sp-mais vira e mostra o verso, sem o botão da frente', m.virado && m.txt > 0 && m.volta && m.botao === 'none', JSON.stringify(m));
    await page.locator('.sp-mais.virado .sp-volta').click(); await espera(1200);
    ok('A8: .sp-mais desvira e o botão volta', await page.locator('.sp-mais.virado').count() === 0 && await page.locator('#sp-curio').isVisible());
    await ctx.close();
  }
} catch (e) {
  falhas++; console.log('FAIL  erro no teste:', e.message);
} finally {
  await browser.close(); await fechar();
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
