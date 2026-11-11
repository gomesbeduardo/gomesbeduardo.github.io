#!/usr/bin/env node
// Gera os PDFs do currículo (spec 003, R4) a partir de src/data/curriculo.json com o Chrome do sistema.
//
// Uso: node scripts/curriculo/gerar.mjs [--dados src/data/curriculo.json] [--saida public/curriculo] [--chrome /caminho/do/chrome]
// Código 1 quando: estrutura pt/en difere, dado pessoal ou estilo proibido no texto, Chrome ausente,
// PDF fora de 1 a 2 páginas, ou dado pessoal no texto extraído (quando há pdftotext).
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { IDIOMAS, verificarEstrutura, verificarPrivacidade, verificarEstilo, textoCompleto, renderizarHtml, contarPaginas, acharChrome } from './lib.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function lerArgs(argv) {
  const o = { dados: join(raiz, 'src/data/curriculo.json'), saida: join(raiz, 'public/curriculo') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const valor = () => { const v = argv[++i]; if (v === undefined) throw new Error(`faltou valor para ${a}`); return v; };
    if (a === '--dados') o.dados = resolve(valor());
    else if (a === '--saida') o.saida = resolve(valor());
    else if (a === '--chrome') o.chrome = valor();
    else throw new Error(`opcao desconhecida: ${a}`);
  }
  return o;
}

const falhar = (msg) => { console.error(`::error::${msg}`); process.exit(1); };
const listar = (ocorrencias) => ocorrencias.map((o) => `${o.tipo} ("${o.trecho}")`).join(', ');
const temComando = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' }).status === 0;

const opcoes = lerArgs(process.argv.slice(2));
const dados = JSON.parse(readFileSync(opcoes.dados, 'utf8'));

const errosEstrutura = verificarEstrutura(dados);
if (errosEstrutura.length > 0) falhar(`estrutura pt/en diferente: ${errosEstrutura.join('; ')}`);

const texto = textoCompleto(dados);
const privado = verificarPrivacidade(texto);
if (privado.length > 0) falhar(`dado pessoal no curriculo.json: ${listar(privado)}`);
const estilo = verificarEstilo(texto);
if (estilo.length > 0) falhar(`estilo proibido no curriculo.json: ${listar(estilo)}`);

const chrome = acharChrome(opcoes.chrome);
if (!chrome) falhar('Chrome nao encontrado: use --chrome, CHROME_BIN ou instale google-chrome/chromium');

const temp = mkdtempSync(join(tmpdir(), 'curriculo-'));
const gerados = [];
try {
  for (const idioma of IDIOMAS) {
    const html = renderizarHtml(dados, idioma);
    const htmlPath = join(temp, `${idioma}.html`);
    const pdfPath = join(temp, dados[idioma].arquivo);
    writeFileSync(htmlPath, html);
    const r = spawnSync(chrome, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
      '--hide-scrollbars', '--no-pdf-header-footer', '--virtual-time-budget=3000',
      `--user-data-dir=${join(temp, 'perfil')}`,
      `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href,
    ], { encoding: 'utf8', timeout: 120_000 });
    if (r.status !== 0 || !existsSync(pdfPath)) falhar(`Chrome falhou para ${idioma} (status ${r.status}): ${(r.stderr || '').trim().slice(-800)}`);

    const pdf = readFileSync(pdfPath);
    const paginas = contarPaginas(pdf);
    if (paginas < 1 || paginas > 2) falhar(`${dados[idioma].arquivo} tem ${paginas} paginas; o limite e 2`);

    if (temComando('pdftotext')) {
      const extraido = spawnSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }).stdout;
      if (!extraido.includes(dados.comum.nome)) falhar(`${dados[idioma].arquivo}: texto nao extraivel (nome ausente)`);
      const p = verificarPrivacidade(extraido);
      if (p.length > 0) falhar(`${dados[idioma].arquivo}: dado pessoal no texto extraido: ${listar(p)}`);
    } else {
      console.warn('::warning::pdftotext ausente; conferencia do texto extraido pulada');
    }
    gerados.push({ idioma, pdfPath, paginas, bytes: pdf.length });
  }

  mkdirSync(opcoes.saida, { recursive: true });
  for (const g of gerados) {
    const destino = join(opcoes.saida, dados[g.idioma].arquivo);
    copyFileSync(g.pdfPath, destino);
    console.log(`gravado ${destino}: ${g.paginas} pagina(s), ${g.bytes} bytes`);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
