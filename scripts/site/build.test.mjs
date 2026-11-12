// Confere o dist/ gerado pelo `astro build` contra public/ e contra site/ (referência de paridade).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ler = (p) => readFileSync(p);

// Reduz um HTML a uma lista ordenada de tags (com atributos) e textos, sem os CSS legados nem o CSS do Astro.
export function normalizarHtml(html) {
  const semLinksCss = html
    .replace(/<link\b[^>]*rel="stylesheet"[^>]*href="[^"]*\/?(?:style|surpresas|transicoes)\.css"[^>]*>/gi, '')
    .replace(/<link\b[^>]*href="\/_astro\/[^"]*\.css"[^>]*>/gi, '')
    .replace(/^\s*<!doctype html>/i, '<!doctype html>');
  const itens = [];
  for (const m of semLinksCss.matchAll(/<(!doctype[^>]*|\/?[a-zA-Z][^\s>/]*(?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)/g)) {
    if (m[2] !== undefined) {
      const t = m[2].replace(/\s+/g, ' ').trim();
      if (t) itens.push(t);
    } else {
      // data-ancora é novo em relação a site/ e não muda estilo nem layout (spec 001d R1).
      const tag = m[1].replace(/\sdata-ancora="[^"]*"/g, '').replace(/\s+/g, ' ').replace(/\s*\/$/, '').trim();
      itens.push(`<${tag.startsWith('!') ? tag.toLowerCase() : tag}>`);
    }
  }
  return itens;
}

export function htmlEquivalente(arquivoA, arquivoB) {
  return [normalizarHtml(readFileSync(arquivoA, 'utf8')), normalizarHtml(readFileSync(arquivoB, 'utf8'))];
}

test('(a) estáticos do dist/ são cópias byte a byte de public/', () => {
  const arquivos = ['favicon.svg', '.nojekyll', 'inicio.js', 'main.js', 'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/lenis.min.js', ...readdirSync('public/img').map((f) => `img/${f}`)];
  for (const f of arquivos) {
    assert.ok(existsSync(`dist/${f}`), `dist/${f} existe`);
    assert.ok(ler(`dist/${f}`).equals(ler(`public/${f}`)), `dist/${f} igual a public/${f}`);
  }
  assert.ok(existsSync('dist/404.html'));
});

const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'));

test('(b) dist/_astro tem um único .css', () => assert.equal(css.length, 1, css.join(',')));

test('(c) o CSS traz view-transition, as três @font-face e os dois seletores escuros', () => {
  const c = readFileSync(`dist/_astro/${css[0]}`, 'utf8');
  assert.match(c, /@view-transition/);
  for (const f of ['Funnel Sans Fallback', 'Funnel Display Fallback', 'Reddit Mono Fallback']) assert.match(c, new RegExp(`@font-face\\s*\\{[^}]*${f}`));
  assert.match(c, /prefers-color-scheme:\s*dark/);
  assert.match(c, /:root:not\(\[data-theme=["']?light["']?\]\)/);
  assert.match(c, /:root\[data-theme=["']?dark["']?\]/);
});

test('(d) 404: dist equivale a site', () => {
  const [site, dist] = htmlEquivalente('site/404.html', 'dist/404.html');
  assert.deepEqual(dist, site);
});

const projetos = ['projeto-leadgate', 'projeto-infohub', 'projeto-lms'];
const paginasProjeto = [...projetos.map((p) => `${p}.html`), ...projetos.map((p) => `en/${p}.html`)];

test('(e) páginas de projeto: dist equivale a site', () => {
  for (const f of paginasProjeto) {
    const [site, dist] = htmlEquivalente(`site/${f}`, `dist/${f}`);
    assert.deepEqual(dist, site, f);
  }
});

// Lista ordenada das tags <script> (src e demais atributos) de um HTML.
const scripts = (arquivo) => [...readFileSync(arquivo, 'utf8').matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1].replace(/\s+/g, ' ').trim());

test('(f) 404 e projetos: tags <script> iguais em site e dist, na mesma ordem', () => {
  for (const f of ['404.html', ...paginasProjeto]) {
    assert.deepEqual(scripts(`dist/${f}`), scripts(`site/${f}`), f);
  }
});

// Home PT e EN: mesmo conteúdo e mesmos <script>, incluindo o texto exato do JSON do calendário.
const homes = ['index.html', 'en/index.html'];

test('(e2) home PT e EN: dist equivale a site', () => {
  for (const f of homes) {
    const [site, dist] = htmlEquivalente(`site/${f}`, `dist/${f}`);
    assert.deepEqual(dist, site, f);
  }
});

test('(f2) home PT e EN: tags <script> iguais e JSON do calendário idêntico', () => {
  const json = (a) => readFileSync(a, 'utf8').match(/<script[^>]*id="cal-dados"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  for (const f of homes) {
    assert.deepEqual(scripts(`dist/${f}`), scripts(`site/${f}`), f);
    assert.ok(json(`site/${f}`), `site/${f} sem cal-dados`);
    assert.equal(json(`dist/${f}`), json(`site/${f}`), `${f}: cal-dados`);
  }
});

// Lista recursiva de arquivos de uma pasta, com caminhos relativos e "/".
const listar = (base, rel = '') =>
  readdirSync(`${base}/${rel}`, { withFileTypes: true }).flatMap((e) => {
    const r = rel ? `${rel}/${e.name}` : e.name;
    return e.isDirectory() ? listar(base, r) : [r];
  });

test('(g) C2: dist tem exatamente as páginas, os arquivos de public/ e um .css; sem CSS legado', () => {
  const paginas = ['index.html', 'en/index.html', '404.html', ...paginasProjeto];
  const esperado = [...paginas, ...listar('public'), ...css.map((f) => `_astro/${f}`)].sort();
  const atual = listar('dist').sort();
  assert.deepEqual(atual, esperado);
  assert.ok(existsSync('dist/.nojekyll'), 'dist/.nojekyll');
  for (const f of atual.filter((x) => x.endsWith('.html'))) {
    assert.doesNotMatch(readFileSync(`dist/${f}`, 'utf8'), /(?:style|surpresas|transicoes)\.css/, f);
  }
  for (const legado of ['style.css', 'surpresas.css', 'transicoes.css']) assert.ok(!existsSync(`dist/${legado}`), legado);
});

test('(h) C7: dados/processo.json é copiado quando existe e dist/dados/ não existe quando falta', () => {
  mkdirSync('.astro', { recursive: true });
  const tmp = mkdtempSync(join('.astro', 'teste-c7-'));
  const criouPasta = !existsSync('public/dados');
  const arq = 'public/dados/processo.json';
  const antes = existsSync(arq) ? readFileSync(arq) : null;
  try {
    mkdirSync('public/dados', { recursive: true });
    writeFileSync(arq, '{"versao":1,"teste":true}\n');
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'c7-presente')], { stdio: 'pipe' });
    assert.deepEqual(readFileSync(join(tmp, 'c7-presente/dados/processo.json')), readFileSync(arq));
    rmSync(arq, { force: true });
    if (criouPasta) rmSync('public/dados', { recursive: true, force: true });
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'c7-ausente')], { stdio: 'pipe' });
    assert.ok(!existsSync(join(tmp, 'c7-ausente/dados')), 'dist/dados/ não deveria existir');
  } finally {
    rmSync(arq, { force: true });
    if (criouPasta) rmSync('public/dados', { recursive: true, force: true });
    else if (antes) writeFileSync(arq, antes);
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('(i) C8: PDFs do currículo em dist/ e links da home iguais aos de site/', () => {
  const pdfs = ['curriculo-eduardo-gomes-pt.pdf', 'curriculo-eduardo-gomes-en.pdf'];
  for (const p of pdfs) assert.ok(existsSync(`public/curriculo/${p}`), 'rode node scripts/curriculo/gerar.mjs antes');
  for (const p of pdfs) assert.deepEqual(ler(`dist/curriculo/${p}`), ler(`public/curriculo/${p}`), p);
  const hrefs = (a) => [...readFileSync(a, 'utf8').matchAll(/href="([^"]*curriculo-eduardo-gomes-[^"]*\.pdf)"/g)].map((m) => m[1]);
  assert.ok(hrefs('dist/index.html').includes('curriculo/curriculo-eduardo-gomes-pt.pdf'));
  assert.ok(hrefs('dist/en/index.html').includes('../curriculo/curriculo-eduardo-gomes-en.pdf'));
  for (const f of homes) assert.deepEqual(hrefs(`dist/${f}`), hrefs(`site/${f}`), f);
});

// ---- C6: contrato do src/data/github.json (spec 001a R5) ----
const JSON_GH = 'src/data/github.json';
function comFixture(prefixo, alterar, fn) {
  mkdirSync('.astro', { recursive: true });
  const tmp = mkdtempSync(join('.astro', `teste-${prefixo}-`));
  const original = readFileSync(JSON_GH);
  try {
    const d = JSON.parse(original.toString('utf8'));
    alterar(d);
    writeFileSync(JSON_GH, JSON.stringify(d, null, 2) + '\n');
    fn(tmp);
  } finally {
    writeFileSync(JSON_GH, original);
    rmSync(tmp, { recursive: true, force: true });
  }
  assert.deepEqual(readFileSync(JSON_GH), original);
}

test('(T6) C6: versao desconhecida em github.json derruba o build com a mensagem da spec', () => {
  comFixture('c6-versao', (d) => { d.versao = 2; }, (tmp) => {
    let saida = '';
    let codigo = 0;
    try {
      execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'o')], { stdio: 'pipe' });
    } catch (e) {
      codigo = e.status;
      saida = `${e.stdout}${e.stderr}`;
    }
    assert.notEqual(codigo, 0, 'o build deveria falhar');
    assert.ok(saida.includes('github.json: versão 2 desconhecida; esperada 1'), saida.slice(-600));
  });
});

test('(T7) C6: aviso de dados de exemplo só aparece com amostra true', () => {
  const pt = 'Dados de exemplo: a coleta real entra com a spec 002.';
  const en = 'Sample data: real numbers arrive with spec 002.';
  for (const f of homes) {
    const h = readFileSync(`dist/${f}`, 'utf8');
    assert.ok(!h.includes(pt) && !h.includes(en), `${f} não deveria ter aviso com amostra false`);
  }
  comFixture('c6-amostra', (d) => { d.amostra = true; }, (tmp) => {
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'o')], { stdio: 'pipe' });
    assert.ok(readFileSync(join(tmp, 'o/index.html'), 'utf8').includes(pt));
    assert.ok(readFileSync(join(tmp, 'o/en/index.html'), 'utf8').includes(en));
  });
});

test('(T8) C6: números e calendário vêm do github.json', () => {
  let nivel;
  comFixture('c6-dados', (d) => {
    d.contribuicoes.total = 3001;
    d.calendario.semanas[0].dias[0].contagem = 9;
    nivel = d.calendario.semanas[0].dias[0].nivel;
  }, (tmp) => {
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'o')], { stdio: 'pipe' });
    const h = readFileSync(join(tmp, 'o/index.html'), 'utf8');
    assert.ok(h.includes('data-v="3001"'));
    const cal = h.match(/id="cal-dados">([^<]*)</)[1];
    assert.ok(cal.includes(`["2025-11-12",${nivel},9]`), cal.slice(0, 80));
  });
});
