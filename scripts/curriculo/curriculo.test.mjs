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

// spec 004, C2: so "Santa Maria, RS" / "Santa Maria, Brazil" (constantes fixas) sao permitidos
test('verificarPrivacidade: so os dois locais fixos passam; outra cidade e telefone nao', () => {
  assert.equal(lerDados().comum.local, 'Santa Maria, RS');
  assert.deepEqual(verificarPrivacidade('Santa Maria, RS'), []);
  assert.deepEqual(verificarPrivacidade('Santa Maria, Brazil'), []);
  assert.ok(verificarPrivacidade('Porto Alegre, RS').length >= 1);
  assert.ok(verificarPrivacidade('Florianópolis, SC').length >= 1);
  assert.ok(verificarPrivacidade('+55 (55) 91234-5678').length >= 1);
  assert.ok(verificarPrivacidade('Santa Maria, RS · +55 (55) 91234-5678').length >= 1);
  assert.ok(verificarPrivacidade('Santa Maria, RS · CPF 123.456.789-00').length >= 1);
});

test('verificarPrivacidade: o local so e retirado como token inteiro (telefone nao se esconde dentro dele)', () => {
  const tipos = (t) => verificarPrivacidade(t).map((o) => o.tipo);
  assert.ok(tipos('(55) 9Santa Maria, RS1234-5678').includes('telefone'));
  assert.ok(tipos('+55 55 9Santa Maria, RS1234 5678').includes('telefone'));
})

test('verificarEstrutura: comum.local e comum.localEn precisam ser os valores fixos', () => {
  const ok = lerDados();
  assert.deepEqual(verificarEstrutura(ok), []);
  for (const [campo, valor] of [['local', 'Santa Maria, RS · +55 (55) 91234-5678'], ['local', 'Florianópolis, SC'], ['localEn', 'Santa Maria, Brazil · CPF 123.456.789-00']]) {
    const dados = lerDados();
    dados.comum[campo] = valor;
    assert.ok(verificarEstrutura(dados).some((e) => e.includes(campo)), `${campo}=${valor} deveria falhar`);
  }
});

// spec 004, C1
test('curriculo.json: pt e en com as mesmas chaves, inclusive voluntariado e certificacoes', () => {
  const dados = lerDados();
  assert.deepEqual(verificarEstrutura(dados), []);
  for (const idioma of ['pt', 'en']) {
    assert.equal(dados[idioma].voluntariado.length, 4, `${idioma}: voluntariado`);
    assert.ok(dados[idioma].certificacoes.length >= 4, `${idioma}: certificacoes`);
    assert.ok(dados[idioma].rotulos.voluntariado && dados[idioma].rotulos.certificacoes);
  }
  dados.en.voluntariado.pop();
  assert.ok(verificarEstrutura(dados).some((e) => e.includes('voluntariado')));
});

// spec 004, C3, C4, C5 sobre o JSON
test('curriculo.json: sem a empresa da vaga, sem Florianopolis, sem Asten junto da RPA, LMS em validacao', () => {
  const dados = lerDados();
  const texto = textoCompleto(dados);
  assert.doesNotMatch(texto, new RegExp(['soft', 'plan'].join(''), 'i'));
  assert.doesNotMatch(texto, /Florian[óo]polis/i);
  assert.doesNotMatch(texto, /operadora|guias|6º semestre|6th semester/i);
  const folhas = [];
  const colher = (v) => { if (typeof v === 'string') folhas.push(v); else if (Array.isArray(v)) v.forEach(colher); else if (v && typeof v === 'object') Object.values(v).forEach(colher); };
  colher(dados);
  for (const f of folhas) {
    if (/RPA|WhatsApp/i.test(f)) assert.doesNotMatch(f, /Asten/i, `Asten junto de RPA/WhatsApp: ${f}`);
  }
  assert.ok(folhas.some((f) => /RPA/.test(f)), 'integracao RPA ausente');
  assert.doesNotMatch(texto, /20 colaboradores|20 employees|\d+ (?:colaboradores|employees)/i);
  assert.doesNotMatch(texto, /usado por|used by|roda na CentralEng|runs at CentralEng|LMS[^.]{0,80}(?:em produção|in production)|(?:em produção|in production)[^.]{0,80}LMS/i);
  for (const idioma of ['pt', 'en']) {
    const t = textoCompleto(dados[idioma]);
    assert.match(t, idioma === 'pt' ? /validação/ : /validation/);
    assert.match(t, idioma === 'pt' ? /sob demanda/ : /on demand/);
  }
  assert.match(textoCompleto(dados.pt), /Ideathon[^"]*/);
  assert.ok(dados.pt.premios.some((p) => /2º lugar/.test(p.titulo) && p.quando === '2026'));
  assert.ok(dados.pt.projetos.some((p) => p.nome === 'ToPark'));
  assert.ok(dados.pt.stack.some((g) => g.grupo === 'IA aplicada') && dados.en.stack.some((g) => g.grupo === 'Applied AI'));
  assert.equal(dados.pt.titulo, 'Desenvolvedor full stack, IA aplicada e automação');
  assert.equal(dados.en.titulo, 'Full-stack developer, applied AI and automation');
});

// T7 / C5
test('renderizarHtml: nome, contato, rotulos, lang, foto, sem table', () => {
  const dados = lerDados();
  for (const idioma of ['pt', 'en']) {
    const html = renderizarHtml(dados, idioma);
    assert.ok(html.includes('Eduardo Bergoli Gomes'));
    assert.ok(html.includes(idioma === 'pt' ? 'Santa Maria, RS' : 'Santa Maria, Brazil'));
    assert.match(html, /<img\b[^>]*alt="Eduardo Gomes"/);
    assert.match(html, /<img\b[^>]*src="data:image\/jpeg;base64,/);
    assert.ok(html.includes('eduardobgomes100@gmail.com'));
    assert.ok(html.includes('linkedin.com/in/eduardo-gomes-pb'));
    assert.ok(html.includes('github.com/gomesbeduardo'));
    assert.ok(html.includes('gomesbeduardo.github.io'));
    for (const rotulo of Object.values(dados[idioma].rotulos)) assert.ok(html.includes(rotulo), `rotulo ausente: ${rotulo}`);
    assert.ok(html.includes(`<html lang="${dados[idioma].idioma}">`));
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

// T9 / C7: o portao de privacidade roda antes de procurar o Chrome
function rodarGerarCom(alterar) {
  const dados = lerDados();
  alterar(dados);
  const pasta = mkdtempSync(join(tmpdir(), 'curriculo-'));
  const arquivo = join(pasta, 'dados.json');
  writeFileSync(arquivo, JSON.stringify(dados));
  const saida = join(pasta, 'saida');
  const r = spawnSync(process.execPath, [join(aqui, 'gerar.mjs'), '--dados', arquivo, '--saida', saida], { encoding: 'utf8' });
  return { r, semPdf: !existsSync(saida) || readdirSync(saida).filter((f) => f.endsWith('.pdf')).length === 0 };
}

test('gerar.mjs: telefone em comum.local nao gera PDF e sai com 1', () => {
  const { r, semPdf } = rodarGerarCom((d) => { d.comum.local += ' · +55 (55) 91234-5678'; });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /comum\.local/);
  assert.doesNotMatch(r.stderr, /Chrome/, 'o portao de privacidade deve barrar antes do Chrome');
  assert.ok(semPdf);
});

test('gerar.mjs: outra cidade em comum.local nao gera PDF e sai com 1', () => {
  const { r, semPdf } = rodarGerarCom((d) => { d.comum.local = 'Florianópolis, SC'; });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /comum\.local/);
  assert.doesNotMatch(r.stderr, /Chrome/, 'o portao de privacidade deve barrar antes do Chrome');
  assert.ok(semPdf);
});

test('gerar.mjs: dado com telefone no resumo nao gera PDF e sai com 1', () => {
  const { r, semPdf } = rodarGerarCom((d) => { d.pt.resumo += ' Contato: +55 (11) 91234-5678'; });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr + r.stdout, /telefone/);
  assert.ok(semPdf);
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
    for (const trecho of ['ToPark', 'Ideathon', '2026', idioma === 'pt' ? 'Santa Maria, RS' : 'Santa Maria, Brazil']) assert.ok(texto.includes(trecho), `${idioma}: falta ${trecho}`);
    assert.match(readFileSync(caminho).toString('latin1'), /\/Subtype\s*\/Image/, `${idioma}: sem foto`);
    assert.deepEqual(verificarEstilo(texto), [], `${idioma}: estilo no PDF`);
  }
});
