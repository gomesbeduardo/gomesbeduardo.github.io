// Helpers compartilhados pelos scripts e2e: Playwright do node_modules, servidor estático e argumentos da linha de comando.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };

export async function carregarPlaywright() {
  const { chromium } = await import('playwright');
  return { chromium };
}

export async function servir(raiz) {
  const base = resolve(raiz);
  const srv = createServer(async (req, res) => {
    try {
      let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
      if (p.endsWith('/')) p += 'index.html';
      const buf = await readFile(join(base, p));
      res.writeHead(200, { 'content-type': tipos[extname(p)] || 'application/octet-stream' });
      res.end(buf);
    } catch {
      let corpo = 'nao achei';
      try { corpo = await readFile(join(base, '404.html')); } catch {}
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(corpo);
    }
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${srv.address().port}/`, fechar: () => new Promise((ok) => { srv.closeAllConnections?.(); srv.close(ok); }) };
}

export function argumento(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : padrao;
}
