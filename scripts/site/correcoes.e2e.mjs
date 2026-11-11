// Aceite no navegador da spec 007: Trajetória (YourMentor logo depois do Ideathon) e sem rolagem horizontal.
// Fora do glob do `node --test`. Rodar fora do sandbox (o Chromium não abre dentro dele):
//   NODE_PATH=$HOME/.npm/_npx/e41f203b7505f1fb/node_modules node scripts/site/correcoes.e2e.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const base = process.env.NODE_PATH || join(process.env.HOME, '.npm/_npx/e41f203b7505f1fb/node_modules');
const { chromium } = require(join(base, 'playwright'));

const raiz = fileURLToPath(new URL('../../site/', import.meta.url));
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    if (p.endsWith('/')) p += 'index.html';
    const buf = await readFile(join(raiz, p));
    res.writeHead(200, { 'content-type': tipos[extname(p)] || 'application/octet-stream' }); res.end(buf);
  } catch { res.writeHead(404); res.end('nao achei'); }
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${srv.address().port}/`;

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
  srv.close();
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
