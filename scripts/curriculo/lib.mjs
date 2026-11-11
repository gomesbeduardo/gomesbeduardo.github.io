// Currículo (spec 003): verificações puras e renderização do HTML. Sem dependência.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const IDIOMAS = ['pt', 'en'];

// R2: padrões de dado pessoal que não podem aparecer. Cada ocorrência: { tipo, trecho }.
const PADROES_PRIVACIDADE = [
  ['telefone', /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2}\)|\b\d{2})[\s.-]?\d{4,5}[\s.-]?\d{4}\b/g],
  ['telefone', /\b\d{8,11}\b/g],
  ['cpf', /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\bCPF\b|\bRG\b/g],
  ['cep', /\bCEP\b|\b\d{5}-\d{3}\b/g],
  ['endereco', /\b(?:Rua|Av\.|Avenida|Travessa|Alameda|Rodovia|Street|Avenue|Apt\.?|apto\.?|n[º°]\s?\d+|n\.\s?\d+)\b/gi],
  ['cidade', /\b(?:Rio Branco|Macei[óo]|Macap[áa]|Manaus|Salvador|Fortaleza|Bras[íi]lia|Vit[óo]ria|Goi[âa]nia|S[ãa]o Lu[íi]s|Cuiab[áa]|Campo Grande|Belo Horizonte|Bel[ée]m|Jo[ãa]o Pessoa|Curitiba|Recife|Teresina|Rio de Janeiro|Natal|Porto Alegre|Porto Velho|Boa Vista|Florian[óo]polis|S[ãa]o Paulo|Aracaju|Palmas)\b/gi],
  ['estado', /\b(?:RS|SC|SP|RJ|MG)\b|\bRio Grande do Sul\b|\bSanta Catarina\b/g],
  ['nascimento', /nascid|nascimento|date of birth|born on|\bDOB\b|anos de idade|years old/gi],
  ['salario', /sal[áa]rio|salary|R\$|pretens[ãa]o/gi],
  ['estado_civil', /estado civil|marital|casad[oa]\b|solteir[oa]\b/gi],
];

// R3: travessão e contraste retórico.
const PADROES_ESTILO = [
  ['travessao', /—/g],
  ['contraste', /n[ãa]o [ée] [^.]{0,60}, [ée] /gi],
  ['contraste', /n[ãa]o [^.]{0,60}, mas sim /gi],
  ['contraste', /isn't [^.]{0,60}, it's /gi],
  ['contraste', /it's not [^.]{0,60}[.,] it's /gi],
  ['contraste', /\bnot (?:a |an |the )?[^.]{0,60}, but /gi],
];

function procurar(texto, padroes) {
  const ocorrencias = [];
  for (const [tipo, re] of padroes) {
    for (const m of String(texto).matchAll(re)) ocorrencias.push({ tipo, trecho: m[0] });
  }
  return ocorrencias;
}

const LISTA_LOCAL = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'privado', 'privacidade-local.json');

// Cidades ligadas ao responsável ficam fora do git; arquivo opcional.
function padraoLocal(arquivo) {
  if (!existsSync(arquivo)) return [];
  const cidades = (JSON.parse(readFileSync(arquivo, 'utf8')).cidades ?? []).filter(Boolean);
  if (!cidades.length) return [];
  const alt = cidades.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return [['cidade', new RegExp(`(?<![\\p{L}])(?:${alt})(?![\\p{L}])`, 'giu')]];
}

// R2 (alterada pela spec 004): o valor exato de comum.local (por idioma) e o unico local permitido.
export const locaisPermitidos = (dados) => [dados?.comum?.local, dados?.comum?.localEn].filter(Boolean);

export function verificarPrivacidade(texto, { arquivoLocal = LISTA_LOCAL, locaisPermitidos: permitidos = [] } = {}) {
  let t = String(texto);
  for (const local of [...permitidos].sort((a, b) => b.length - a.length)) t = t.split(local).join(' ');
  return procurar(t, [...PADROES_PRIVACIDADE, ...padraoLocal(arquivoLocal)]);
}
export const verificarEstilo = (texto) => procurar(texto, PADROES_ESTILO);

// Todas as strings do JSON, em uma só, para as verificações.
export function textoCompleto(valor) {
  if (typeof valor === 'string') return valor;
  if (Array.isArray(valor)) return valor.map(textoCompleto).join('\n');
  if (valor && typeof valor === 'object') return Object.values(valor).map(textoCompleto).join('\n');
  return '';
}

// R1: pt e en com as mesmas chaves e o mesmo número de itens em cada lista.
export function verificarEstrutura(dados) {
  const erros = [];
  for (const campo of ['nome', 'local', 'localEn', 'email', 'linkedin', 'github', 'site']) {
    if (typeof dados?.comum?.[campo] !== 'string' || dados.comum[campo] === '') erros.push(`comum.${campo} ausente`);
  }
  const forma = (v) => (Array.isArray(v) ? 'lista' : v === null ? 'nulo' : typeof v);
  const comparar = (a, b, caminho) => {
    const chaves = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
    for (const k of chaves) {
      const p = `${caminho}${k}`;
      if (!(k in (a ?? {})) || !(k in (b ?? {}))) { erros.push(`${p} existe em um idioma só`); continue; }
      if (forma(a[k]) !== forma(b[k]) && !(a[k] === null || b[k] === null)) { erros.push(`${p} tem tipos diferentes`); continue; }
      if (Array.isArray(a[k])) {
        if (a[k].length !== b[k].length) { erros.push(`${p} tem ${a[k].length} itens em pt e ${b[k].length} em en`); continue; }
        a[k].forEach((item, i) => { if (item && typeof item === 'object') comparar(item, b[k][i], `${p}[${i}].`); });
      } else if (a[k] && typeof a[k] === 'object') comparar(a[k], b[k], `${p}.`);
    }
  };
  if (!dados?.pt || !dados?.en) return [...erros, 'faltam pt e/ou en'];
  comparar(dados.pt, dados.en, '');
  return erros;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const semProtocolo = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const CSS = `
@page { size: A4; margin: 11mm 13mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: "Liberation Sans", Arial, Helvetica, sans-serif; font-size: 9.6pt; line-height: 1.28; color: #111; }
a { color: inherit; text-decoration: none; }
header { border-bottom: 1.5px solid #111; padding-bottom: 5pt; margin-bottom: 9pt; }
header { display: flex; align-items: center; gap: 12pt; }
header .foto { width: 28mm; height: 28mm; border-radius: 50%; object-fit: cover; flex: none; order: 2; }
header .texto { flex: 1; }
h1 { font-size: 19pt; margin: 0 0 1pt; letter-spacing: 0.2pt; }
.titulo { font-size: 11.5pt; margin: 0 0 3pt; color: #333; }
.contato { margin: 0; font-size: 9.4pt; color: #333; }
.contato span + span::before { content: " · "; color: #888; }
h2 { font-size: 10.4pt; text-transform: uppercase; letter-spacing: 0.8pt; margin: 9pt 0 3pt; padding-bottom: 1.5pt; border-bottom: 0.6pt solid #999; }
p { margin: 0 0 3pt; }
.item { margin-bottom: 5pt; break-inside: avoid; }
.linha { display: flex; justify-content: space-between; gap: 8pt; }
.cargo { font-weight: 700; }
.org { color: #333; }
.quando { color: #444; white-space: nowrap; font-size: 9.4pt; }
ul { margin: 1.5pt 0 0; padding-left: 12pt; }
li { margin: 0 0 1pt; }
.meta { color: #444; font-size: 9.4pt; }
.stack p { margin: 0 0 1.5pt; }
footer { margin-top: 10pt; font-size: 8.4pt; color: #666; }
`;

// Monta o HTML de um idioma. Texto real, uma coluna, sem tabela; a foto e so decoracao do cabecalho (spec 004, R4 alterada).
const FOTO_PADRAO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'site', 'img', 'eduardo-gomes.jpg');

export function renderizarHtml(dados, idioma, { foto = FOTO_PADRAO } = {}) {
  if (!IDIOMAS.includes(idioma)) throw new Error(`idioma desconhecido: ${idioma}`);
  const c = dados.comum;
  const d = dados[idioma];
  const r = d.rotulos;
  const fotoUri = `data:image/jpeg;base64,${readFileSync(foto).toString('base64')}`;
  const local = idioma === 'en' && c.localEn ? c.localEn : c.local;
  const periodo = (inicio, fim) => `${esc(inicio)} – ${fim === null ? esc(r.atual) : esc(fim)}`;
  const link = (url) => `<a href="${esc(url)}">${esc(semProtocolo(url))}</a>`;

  const experiencia = d.experiencia.map((e) => `
      <div class="item">
        <div class="linha"><span><span class="cargo">${esc(e.cargo)}</span>, <span class="org">${esc(e.organizacao)}</span></span><span class="quando">${periodo(e.inicio, e.fim)}</span></div>
        <ul>${e.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      </div>`).join('');

  const projetos = d.projetos.map((p) => `
      <div class="item">
        <div class="linha"><span><span class="cargo">${esc(p.nome)}</span>${p.link ? ` <span class="meta">${link(p.link)}</span>` : ''}</span></div>
        <p>${esc(p.descricao)} <span class="meta">${esc(p.stack)}.</span></p>
      </div>`).join('');

  const premios = d.premios.map((p) => `
      <div class="item">
        <div class="linha"><span class="cargo">${esc(p.titulo)}</span><span class="quando">${esc(p.quando)}</span></div>
        ${p.detalhe ? `<p>${esc(p.detalhe)}</p>` : ''}
      </div>`).join('');

  const formacao = d.formacao.map((f) => `
      <div class="item">
        <div class="linha"><span><span class="cargo">${esc(f.curso)}</span>, <span class="org">${esc(f.instituicao)}</span></span><span class="quando">${esc(f.inicio)} – ${esc(f.fim)}</span></div>
      </div>`).join('');

  const voluntariado = d.voluntariado.map((v) => `
      <div class="item">
        <div class="linha"><span><span class="cargo">${esc(v.titulo)}.</span> ${esc(v.detalhe)}</span><span class="quando">${esc(v.quando)}</span></div>
      </div>`).join('');

  const certificacoes = `<p>${d.certificacoes.map((x) => `${esc(x.nome)}${x.detalhe ? ` (${esc(x.detalhe)})` : ''}`).join(' · ')}</p>`;

  const stack = d.stack.map((s) => `<p><span class="cargo">${esc(s.grupo)}:</span> ${esc(s.itens)}</p>`).join('');
  const idiomas = d.idiomas.map((i) => `${esc(i.idioma)} (${esc(i.nivel)})`).join(' · ');

  return `<!doctype html>
<html lang="${esc(d.idioma)}">
<head>
<meta charset="utf-8">
<title>${esc(c.nome)} · ${esc(d.titulo)}</title>
<meta name="author" content="${esc(c.nome)}">
<style>${CSS}</style>
</head>
<body>
<header>
  <img class="foto" src="${fotoUri}" alt="Eduardo Gomes">
  <div class="texto">
  <h1>${esc(c.nome)}</h1>
  <p class="titulo">${esc(d.titulo)}</p>
  <p class="contato"><span>${esc(local)}</span><span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></span><span>${link(c.linkedin)}</span><span>${link(c.github)}</span><span>${link(c.site)}</span></p>
  </div>
</header>
<main>
  <section><h2>${esc(r.resumo)}</h2><p>${esc(d.resumo)}</p></section>
  <section><h2>${esc(r.comoTrabalho)}</h2><p>${esc(d.comoTrabalho)}</p></section>
  <section><h2>${esc(r.experiencia)}</h2>${experiencia}</section>
  <section><h2>${esc(r.projetos)}</h2>${projetos}</section>
  <section><h2>${esc(r.premios)}</h2>${premios}</section>
  <section><h2>${esc(r.voluntariado)}</h2>${voluntariado}</section>
  <section><h2>${esc(r.formacao)}</h2>${formacao}</section>
  <section><h2>${esc(r.certificacoes)}</h2>${certificacoes}</section>
  <section class="stack"><h2>${esc(r.stack)}</h2>${stack}</section>
  <section><h2>${esc(r.idiomas)}</h2><p>${idiomas}</p></section>
</main>
<footer>${esc(r.geradoEm)}</footer>
</body>
</html>
`;
}

// Conta páginas num PDF do Chrome (objetos /Type /Page, sem object streams).
export function contarPaginas(buffer) {
  const texto = buffer.toString('latin1');
  return (texto.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

// Binário do Chrome: --chrome, CHROME_BIN, a lista de nomes no PATH e, por último,
// o chrome-headless-shell que o Playwright instala em ~/.cache/ms-playwright (R4).
export function acharChrome(preferido, env = process.env) {
  const candidatos = [preferido, env.CHROME_BIN, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome-headless-shell'].filter(Boolean);
  const pastas = (env.PATH ?? '').split(':').filter(Boolean);
  for (const c of candidatos) {
    if (c.includes('/')) { if (existsSync(c)) return c; continue; }
    for (const p of pastas) { const caminho = join(p, c); if (existsSync(caminho)) return caminho; }
  }
  const cachePlaywright = join(env.HOME ?? '', '.cache', 'ms-playwright');
  if (existsSync(cachePlaywright)) {
    const versoes = readdirSync(cachePlaywright).filter((n) => n.startsWith('chromium_headless_shell-')).sort().reverse();
    for (const v of versoes) {
      const caminho = join(cachePlaywright, v, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
      if (existsSync(caminho)) return caminho;
    }
  }
  return null;
}
