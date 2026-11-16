// Confere o dist/ gerado pelo `astro build` contra public/ e contra site/ (referência de paridade).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, statSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ler = (p) => readFileSync(p);

// Estado dos insumos versionados no carregamento do arquivo; o último teste confere que as fixtures não os tocaram.
const mtimeGithubJson = statSync('src/data/github.json').mtimeMs;
const existiaPublicDados = existsSync('public/dados');

// Reduz um HTML a uma lista ordenada de tags (com atributos) e textos, sem os CSS legados nem o CSS do Astro.
export function normalizarHtml(html) {
  const semLinksCss = html
    .replace(/<link\b[^>]*rel="stylesheet"[^>]*href="[^"]*\/?(?:style|surpresas|transicoes)\.css"[^>]*>/gi, '')
    .replace(/<link\b[^>]*href="\/_astro\/[^"]*\.css"[^>]*>/gi, '')
    // Exceção aprovada (spec 001d R6): o dist carrega lingua.js, que o site/ legado não tem.
    .replace(/<script\b[^>]*\bsrc="(?:\.\.\/)?lingua\.js"[^>]*><\/script>/gi, '')
    // Spec 002b R6: o dist carrega calendario.js (dica e teclado do calendário), que o site/ legado não tem.
    .replace(/<script\b[^>]*\bsrc="(?:\.\.\/)?calendario\.js"[^>]*><\/script>/gi, '')
    .replace(/<i id="lingua-pronta" hidden><\/i>/gi, "") // alvo do <link rel="expect"> que o inicio.js põe na troca de língua
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

// Exceção aprovada (spec 002b R6): o calendário é outro markup em dist/; fica só o h3 de dentro de .cal.
function semCalendario(html) {
  const ini = html.indexOf('<div class="cal reveal">');
  if (ini < 0) return html;
  const h3 = html.indexOf('</h3>', ini) + 5;
  let fim = html.indexOf('</div></section>', ini);
  if (fim < 0) fim = html.indexOf('</div>\n</div></section>', ini);
  return html.slice(0, h3) + html.slice(fim);
}

export function htmlEquivalente(arquivoA, arquivoB) {
  return [normalizarHtml(semCalendario(readFileSync(arquivoA, 'utf8'))), normalizarHtml(semCalendario(readFileSync(arquivoB, 'utf8')))];
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
// Exceção aprovada (spec 001d R6): o dist carrega lingua.js (troca de língua no mesmo ponto), que o site/ legado não tem.
const scripts = (arquivo) => [...readFileSync(arquivo, 'utf8').matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1].replace(/\s+/g, ' ').trim()).filter((s) => !/\bsrc="(\.\.\/)?lingua\.js"/.test(s));

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

test('(f2) home PT e EN: tags <script> iguais, sem o #cal-dados do site/ (spec 002b R6)', () => {
  for (const f of homes) {
    assert.ok(readFileSync(`site/${f}`, 'utf8').includes('id="cal-dados"'), `site/${f} sem cal-dados`);
    // R6: o dist carrega calendario.js (dica e teclado do calendário), que o site/ legado não tem.
    const semCalendario = scripts(`dist/${f}`).filter((s) => !/\bsrc="(\.\.\/)?calendario\.js"/.test(s));
    assert.deepEqual(semCalendario, scripts(`site/${f}`).filter((s) => !/\bid="cal-dados"/.test(s)), f);
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
  try {
    const presente = join(process.cwd(), tmp, 'public-presente');
    const ausente = join(process.cwd(), tmp, 'public-ausente');
    for (const d of [presente, ausente]) cpSync('public', d, { recursive: true, filter: (o) => !/(^|\/)public\/dados$/.test(o) });
    mkdirSync(join(presente, 'dados'), { recursive: true });
    const arq = join(presente, 'dados/processo.json');
    writeFileSync(arq, '{"versao":1,"teste":true}\n');
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'c7-presente')], { stdio: 'pipe', env: { ...process.env, PUBLIC_DIR_TESTE: presente } });
    assert.deepEqual(readFileSync(join(tmp, 'c7-presente/dados/processo.json')), readFileSync(arq));
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'c7-ausente')], { stdio: 'pipe', env: { ...process.env, PUBLIC_DIR_TESTE: ausente } });
    assert.ok(!existsSync(join(tmp, 'c7-ausente/dados')), 'dist/dados/ não deveria existir');
  } finally {
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
  try {
    const d = JSON.parse(readFileSync(JSON_GH, 'utf8'));
    alterar(d);
    const fixture = join(process.cwd(), tmp, 'github.json');
    writeFileSync(fixture, JSON.stringify(d, null, 2) + '\n');
    fn(tmp, { ...process.env, GH_JSON_TESTE: fixture });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

test('(T6) C6: versao desconhecida em github.json derruba o build com a mensagem da spec', () => {
  comFixture('c6-versao', (d) => { d.versao = 2; }, (tmp, env) => {
    let saida = '';
    let codigo = 0;
    try {
      execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'o')], { stdio: 'pipe', env });
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
  comFixture('c6-amostra', (d) => { d.amostra = true; }, (tmp, env) => {
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'o')], { stdio: 'pipe', env });
    assert.ok(readFileSync(join(tmp, 'o/index.html'), 'utf8').includes(pt));
    assert.ok(readFileSync(join(tmp, 'o/en/index.html'), 'utf8').includes(en));
  });
});

test('(T8) C6: números e calendário vêm do github.json', () => {
  let nivel, primeiroDia;
  comFixture('c6-dados', (d) => {
    d.contribuicoes.total = 3001;
    d.calendario.semanas[0].dias[0].contagem = 9;
    nivel = d.calendario.semanas[0].dias[0].nivel;
    primeiroDia = d.calendario.semanas[0].dias[0].data;
  }, (tmp, env) => {
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'o')], { stdio: 'pipe', env });
    const h = readFileSync(join(tmp, 'o/index.html'), 'utf8');
    assert.ok(h.includes('data-v="3001"'));
    // Spec 002b R6: o dia da fixture com contagem 9 traz o número no texto sr-only (não há mais #cal-dados).
    assert.ok(new RegExp(`data-data="${primeiroDia}"[^>]*><span class="sr-only">9 contribuições em `).test(h), primeiroDia);
  });
});

test('(a2) C1/R4: JS e CSS herdados são byte a byte iguais aos de site/ (exceto inicio.js e lingua.js, spec 001d R6)', () => {
  const iguais = ['tema.js', 'main.js', 'surpresas.js', 'rodape.js', ...readdirSync('site/vendor').map((f) => `vendor/${f}`)];
  for (const f of iguais.filter((f) => f !== 'main.js')) assert.ok(ler(`public/${f}`).equals(ler(`site/${f}`)), `public/${f} igual a site/${f}`);
  // main.js: igual ao de site/ sem a função buildCalendar e sem a chamada (spec 002b R6).
  const ini = '  // ---------- Calendário (dados reais, ver #cal-dados no HTML) ----------\n  function buildCalendar() {';
  const fimFn = '    cal.innerHTML = h;\n  }\n\n';
  const orig = readFileSync('site/main.js', 'utf8');
  const a = orig.indexOf(ini);
  const b = orig.indexOf(fimFn, a) + fimFn.length;
  assert.ok(a > 0 && b > a, 'buildCalendar não achada em site/main.js');
  const semCal = (orig.slice(0, a) + orig.slice(b)).replace('buildCalendar(); setupMenu();', 'setupMenu();');
  assert.equal(readFileSync('public/main.js', 'utf8'), semCal, 'public/main.js = site/main.js sem buildCalendar');
  for (const f of readdirSync('src/styles/legado')) assert.ok(ler(`src/styles/legado/${f}`).equals(ler(`site/${f}`)), `src/styles/legado/${f} igual a site/${f}`);
  // inicio.js: a única diferença é a linha da troca de língua (spec 001d R6).
  const linhas = readFileSync('public/inicio.js', 'utf8').split('\n');
  const trocas = linhas.filter((l) => l.includes("getItem('troca-lingua')"));
  assert.equal(trocas.length, 1, 'uma linha de troca-lingua em public/inicio.js');
  const semTroca = linhas.filter((l) => l !== trocas[0]).join('\n');
  assert.equal(semTroca, readFileSync('site/inicio.js', 'utf8'));
});

test('(e3) R1: home PT e EN não duplicam a página', () => {
  for (const [arq, lang] of [['src/pages/index.astro', 'pt'], ['src/pages/en/index.astro', 'en']]) {
    const src = readFileSync(arq, 'utf8');
    for (const proibido of ['<title', '<meta', '<link', 'Ir para o conteúdo', 'Skip to content']) assert.ok(!src.includes(proibido), `${arq} não contém ${proibido}`);
    assert.ok(src.includes(`<Home lang="${lang}" />`), `${arq} renderiza <Home lang="${lang}" />`);
  }
});

test('(z) as fixtures não gravam em src/data/github.json nem em public/dados', () => {
  assert.equal(statSync('src/data/github.json').mtimeMs, mtimeGithubJson, 'src/data/github.json foi regravado');
  assert.equal(existsSync('public/dados'), existiaPublicDados, 'public/dados foi criado ou removido');
});
