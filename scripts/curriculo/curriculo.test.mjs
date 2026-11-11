// Testes do currículo (spec 003): estrutura, privacidade, estilo, HTML e PDFs gerados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  verificarEstrutura,
  verificarPrivacidade,
  verificarEstilo,
  textoCompleto,
  renderizarHtml,
  contarPaginas,
  acharChrome,
} from './lib.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '..', '..');
const DADOS = join(raiz, 'src', 'data', 'curriculo.json');
const PASTA_PDF = join(raiz, 'public', 'curriculo');
const lerDados = () => JSON.parse(readFileSync(DADOS, 'utf8'));
const temComando = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;

// T1 / C1
test('verificarEstrutura: pt e en com as mesmas chaves e o mesmo numero de itens', () => {
  const dados = lerDados();
  assert.deepEqual(verificarEstrutura(dados), []);
  dados.en.experiencia.pop();
  const erros = verificarEstrutura(dados);
  assert.equal(erros.length, 1);
  assert.match(erros[0], /experiencia/);
});

test('verificarEstrutura: chave faltando em um idioma', () => {
  const dados = lerDados();
  delete dados.en.rotulos.premios;
  assert.ok(verificarEstrutura(dados).some((e) => e.includes('rotulos.premios')));
});

// T2 / C2
test('verificarPrivacidade: cidade, estado e telefone', () => {
  const ocorrencias = verificarPrivacidade('Florianópolis, SC · +55 (11) 91234-5678');
  assert.deepEqual(ocorrencias.map((o) => o.tipo).sort(), ['cidade', 'estado', 'telefone']);
});

// Lista local opcional de cidades (fora do git)
test('verificarPrivacidade: lista local de cidades, presente e ausente', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'priv-'));
  const arq = join(pasta, 'local.json');
  writeFileSync(arq, JSON.stringify({ cidades: ['Cidade Teste'] }));
  const o = verificarPrivacidade('Mora em Cidade Teste', { arquivoLocal: arq });
  assert.deepEqual(o.map((x) => x.tipo), ['cidade']);
  assert.deepEqual(verificarPrivacidade('Mora em Cidade Teste', { arquivoLocal: join(pasta, 'nao-existe.json') }), []);
});

// T3 / C2
test('verificarPrivacidade: contato permitido e datas passam', () => {
  assert.deepEqual(
    verificarPrivacidade('Brasil · eduardobgomes100@gmail.com · linkedin.com/in/eduardo-gomes-pb · github.com/gomesbeduardo · fev/2024 – dez/2028 · https://gomesbeduardo.github.io · 20 colaboradores · 570 testes'),
    [],
  );
});

// T4 / C2
test('verificarPrivacidade: CPF, endereco, CEP e nascimento', () => {
  for (const texto of ['CPF 123.456.789-00', 'Rua das Flores, 120', 'CEP 97000-000', 'nascido em 12/03/2004', 'Avenida Brasil 1500', 'Florianópolis', 'salário R$ 5.000']) {
    assert.ok(verificarPrivacidade(texto).length >= 1, `deveria acusar: ${texto}`);
  }
});

// T5 / C3
test('verificarEstilo: travessao e contraste retorico', () => {
  const ocorrencias = verificarEstilo('Não é um LMS, é uma plataforma — completa');
  assert.deepEqual(ocorrencias.map((o) => o.tipo).sort(), ['contraste', 'travessao']);
  assert.deepEqual(verificarEstilo('LMS em produção, usado por 20 colaboradores.'), []);
  assert.ok(verificarEstilo("It isn't a tool, it's a platform").length >= 1);
  assert.ok(verificarEstilo('not a tool, but a platform').length >= 1);
});

// T6 / C4
test('curriculo.json inteiro passa na privacidade e no estilo', () => {
  const dados = lerDados();
  const texto = textoCompleto(dados);
  assert.ok(texto.includes('Eduardo Bergoli Gomes'));
  assert.deepEqual(verificarPrivacidade(texto), []);
  assert.deepEqual(verificarEstilo(texto), []);
});

// T7 / C5
test('renderizarHtml: nome, contato, rotulos, lang, sem img nem table', () => {
  const dados = lerDados();
  for (const idioma of ['pt', 'en']) {
    const html = renderizarHtml(dados, idioma);
    assert.ok(html.includes('Eduardo Bergoli Gomes'));
    assert.ok(html.includes('Brasil'));
    assert.ok(html.includes('eduardobgomes100@gmail.com'));
    assert.ok(html.includes('linkedin.com/in/eduardo-gomes-pb'));
    assert.ok(html.includes('github.com/gomesbeduardo'));
    assert.ok(html.includes('gomesbeduardo.github.io'));
    for (const rotulo of Object.values(dados[idioma].rotulos)) assert.ok(html.includes(rotulo), `rotulo ausente: ${rotulo}`);
    assert.ok(html.includes(`<html lang="${dados[idioma].idioma}">`));
    assert.doesNotMatch(html, /<img\b/);
    assert.doesNotMatch(html, /<table\b/);
    assert.deepEqual(verificarPrivacidade(html.replace(/<[^>]+>/g, ' ')), []);
  }
});

test('renderizarHtml: escapa HTML vindo dos dados', () => {
  const dados = lerDados();
  dados.pt.resumo = 'a <script>alert(1)</script> & b';
  const html = renderizarHtml(dados, 'pt');
  assert.ok(html.includes('a &lt;script&gt;alert(1)&lt;/script&gt; &amp; b'));
  assert.doesNotMatch(html, /<script>alert/);
});

test('contarPaginas: conta objetos /Type /Page', () => {
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Pages /Kids [2 0 R 3 0 R] >> endobj\n2 0 obj << /Type /Page /Parent 1 0 R >> endobj\n3 0 obj<</Type/Page/Parent 1 0 R>>endobj\n%%EOF');
  assert.equal(contarPaginas(pdf), 2);
});

// T9 / C7
test('gerar.mjs: dado com telefone nao gera PDF e sai com 1', { skip: acharChrome() ? false : 'sem Chrome' }, () => {
  const dados = lerDados();
  dados.comum.local = 'Brasil · +55 (11) 91234-5678';
  const pasta = mkdtempSync(join(tmpdir(), 'curriculo-'));
  const arquivo = join(pasta, 'dados.json');
  writeFileSync(arquivo, JSON.stringify(dados));
  const saida = join(pasta, 'saida');
  const r = spawnSync(process.execPath, [join(aqui, 'gerar.mjs'), '--dados', arquivo, '--saida', saida], { encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr + r.stdout, /telefone/);
  assert.ok(!existsSync(saida) || readdirSync(saida).filter((f) => f.endsWith('.pdf')).length === 0);
});

// T8 / C6: PDFs já gerados em public/curriculo (pulado quando faltam)
test('PDFs gerados: 1 a 2 paginas, texto extraivel, sem dado privado', (t) => {
  const dados = lerDados();
  const faltando = ['pt', 'en'].filter((i) => !existsSync(join(PASTA_PDF, dados[i].arquivo)));
  if (faltando.length > 0) return t.skip(`PDF ausente (${faltando.join(', ')}); rode node scripts/curriculo/gerar.mjs`);
  if (!temComando('pdftotext')) return t.skip('sem pdftotext');
  for (const idioma of ['pt', 'en']) {
    const caminho = join(PASTA_PDF, dados[idioma].arquivo);
    const paginas = contarPaginas(readFileSync(caminho));
    assert.ok(paginas >= 1 && paginas <= 2, `${idioma}: ${paginas} paginas`);
    const texto = spawnSync('pdftotext', ['-layout', caminho, '-'], { encoding: 'utf8' }).stdout;
    assert.ok(texto.includes('Eduardo Bergoli Gomes'), `${idioma}: nome nao extraido`);
    // os títulos saem em maiúsculas no PDF (text-transform: uppercase), então a comparação ignora caixa
    for (const rotulo of ['experiencia', 'projetos', 'formacao']) assert.ok(texto.toUpperCase().includes(dados[idioma].rotulos[rotulo].toUpperCase()), `${idioma}: falta ${rotulo}`);
    assert.deepEqual(verificarPrivacidade(texto), [], `${idioma}: dado privado no PDF`);
    assert.deepEqual(verificarEstilo(texto), [], `${idioma}: estilo no PDF`);
  }
});
