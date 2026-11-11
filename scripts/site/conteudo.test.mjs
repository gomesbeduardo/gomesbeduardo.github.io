// Testes de conteúdo do site (spec 004): estilo do modal, LMS em validação, RPA sem a Asten,
// foto dentro do #sp-foto e botão do Claude sem desenho de marca.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verificarEstilo } from '../curriculo/lib.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => readFileSync(join(raiz, rel), 'utf8');

const HOMES = [
  { id: 'pt', arquivo: 'site/index.html', foto: 'img/eduardo-gomes.jpg', validacao: /em validação com colaboradores/ },
  { id: 'en', arquivo: 'site/en/index.html', foto: '../img/eduardo-gomes.jpg', validacao: /in validation with employees/ },
];
const ARQUIVOS_LMS = [
  ...HOMES.map((h) => ({ ...h, rotulo: h.arquivo })),
  { id: 'pt', arquivo: 'site/projeto-lms.html', rotulo: 'site/projeto-lms.html', validacao: /em validação com colaboradores/ },
  { id: 'en', arquivo: 'site/en/projeto-lms.html', rotulo: 'site/en/projeto-lms.html', validacao: /in validation with employees/ },
  { id: 'pt', arquivo: 'PRODUCT.md', rotulo: 'PRODUCT.md', validacao: /valida[çc][ãa]o/ },
];

const modalDe = (html) => html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? '';
const textoDe = (html) =>
  html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
// Trechos curtos: cada tag vira separador e cada frase vira um trecho.
const trechos = (html) =>
  html.replace(/<(script|style|symbol)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, '|').split(/[|.;\n]+/).map((s) => s.trim()).filter(Boolean);

for (const h of HOMES) {
  const html = ler(h.arquivo);

  test(`C13 (${h.id}): o texto do modal existe e passa no verificarEstilo`, () => {
    const modal = modalDe(html);
    assert.ok(modal, 'dialog do modal não encontrado');
    const texto = textoDe(modal);
    assert.ok(texto.length > 1500, `texto do modal curto demais (${texto.length})`);
    assert.deepEqual(verificarEstilo(texto), []);
  });

  test(`(e) (${h.id}): nenhum travessão no markup do modal`, () => {
    const modal = modalDe(html);
    assert.ok(modal, 'dialog do modal não encontrado');
    assert.ok(!modal.includes('—'));
  });

  test(`modal (${h.id}): título, fechar, link do repositório`, () => {
    const modal = modalDe(html);
    assert.match(modal, /<dialog[^>]*aria-labelledby="/);
    assert.match(modal, /<h2[^>]*tabindex="-1"/);
    assert.match(modal, /<button[^>]*data-fechar/);
    assert.match(modal, /href="https:\/\/github\.com\/gomesbeduardo\/gomesbeduardo\.github\.io"/);
  });

  test(`(d) (${h.id}): a foto fica dentro do #sp-foto, com alt e src certos`, () => {
    const botao = html.match(/<button[^>]*id="sp-foto"[^>]*>([\s\S]*?)<\/button>/);
    assert.ok(botao, '#sp-foto não encontrado');
    const img = botao[1].match(/<img\b[^>]*>/);
    assert.ok(img, 'sem <img> dentro do #sp-foto');
    assert.match(img[0], /alt="Eduardo Gomes"/);
    assert.ok(img[0].includes(`src="${h.foto}"`), `src esperado ${h.foto}`);
    assert.doesNotMatch(botao[1], />\s*EG\s*</);
  });

  test(`(f) (${h.id}): o botão do Claude traz só texto e o ícone genérico do site`, () => {
    const rodape = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
    const botao = rodape.match(/<button[^>]*id="claude-btn"[^>]*>[\s\S]*?<\/button>/)?.[0];
    assert.ok(botao, 'botão #claude-btn não está no rodapé');
    assert.doesNotMatch(botao, /<(path|circle|polygon|rect|image|img)\b/);
    const usos = [...botao.matchAll(/<use[^>]*href="#([^"]+)"/g)].map((m) => m[1]);
    assert.ok(usos.length >= 1);
    for (const u of usos) assert.match(u, /^i-/, `símbolo ${u} não é do conjunto genérico i-*`);
    assert.match(textoDe(botao), /Claude/);
  });

  test(`topo (${h.id}): linha de fatos com a Asten e a cidade, sem Brasil solto`, () => {
    const facts = html.match(/<p class="facts">[\s\S]*?<\/p>/)?.[0] ?? '';
    assert.match(textoDe(facts), h.id === 'pt' ? /Estágio na Asten AVMB/ : /Internship at Asten AVMB/);
    assert.match(textoDe(facts), h.id === 'pt' ? /Santa Maria, RS/ : /Santa Maria, Brazil/);
  });

  test(`Trajetória (${h.id}): 13 marcos com ToPark e Ideathon 2026`, () => {
    const traj = html.match(/<div class="traj">[\s\S]*?<\/ol>/)[0];
    assert.equal((traj.match(/<li><span class="node"/g) || []).length, 13);
    assert.match(traj, /ToPark/);
    assert.match(traj, /Ideathon[^<]*2026|2026[^<]*Ideathon/);
  });

  test(`(c) C4 (${h.id}): a integração RPA não remete à Asten, ao cliente ou à saúde`, () => {
    const comRpa = trechos(html).filter((t) => /\bRPA\b/.test(t));
    assert.ok(comRpa.length >= 1, 'sem menção a RPA');
    for (const t of comRpa) assert.doesNotMatch(t, /Asten|operadora|guias|sa[úu]de|health|cliente|client\b/i, t);
    // a linha da tabela de Stack que cita RPA também não pode citá-los
    const linha = (html.match(/<li><span class="n">[\s\S]*?<\/li>/g) ?? []).find((li) => /\bRPA\b/.test(li)) ?? '';
    assert.ok(linha, 'sem linha de Stack com RPA');
    assert.doesNotMatch(textoDe(linha), /Asten|operadora|guias|sa[úu]de|health/i);
  });

  test(`privacidade (${h.id}): sem telefone nem Florianópolis`, () => {
    assert.doesNotMatch(html, /Florian[óo]polis/);
    assert.doesNotMatch(textoDe(html), /\+?55\s*\(?\d{2}\)?\s*9?\d{4}-?\d{4}/);
  });
}

for (const a of ARQUIVOS_LMS) {
  test(`C5 (${a.rotulo}): LMS em validação, sem número e sem alegar produção`, () => {
    const bruto = ler(a.arquivo);
    assert.doesNotMatch(bruto, /20 colaboradores|20 employees/i);
    assert.match(bruto, a.validacao);
    const lista = a.arquivo.endsWith('.html') ? trechos(bruto) : bruto.split(/\n|(?<=\.)\s/);
    for (const t of lista.filter((x) => /\bLMS\b/.test(x))) {
      assert.doesNotMatch(t, /produ[çc][ãa]o|in production|\broda na\b|runs at|usados? por|used by|colaboradores usam|employees use/i, t);
    }
    // meta description também
    const meta = bruto.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (meta && /LMS/.test(meta)) assert.match(meta, /valida/i);
    // nenhuma linha da tabela de Stack que cite o LMS (com ou sem outros projetos) leva a etiqueta de produção
    for (const li of bruto.match(/<li><span class="n">[\s\S]*?<\/li>/g) ?? []) {
      if (/\bLMS\b/.test(li)) assert.doesNotMatch(li, /em produção|in production/);
    }
  });
}

for (const h of HOMES) {
  const linhasStack = () => ler(h.arquivo).match(/<li><span class="n">[\s\S]*?<\/li>/g) ?? [];
  const producao = /em produção|in production/;

  test(`Stack (${h.id}): linhas numeradas 01..N em sequência`, () => {
    const nums = linhasStack().map((li) => li.match(/<span class="n">(\d+)<\/span>/)?.[1]);
    assert.ok(nums.length > 0);
    assert.deepEqual(nums, nums.map((_, i) => String(i + 1).padStart(2, '0')));
  });

  test(`Stack (${h.id}): linha com LMS ou InfoHub nunca leva etiqueta de produção`, () => {
    const alvo = linhasStack().filter((li) => /\bLMS\b|InfoHub/.test(li));
    assert.ok(alvo.length >= 3);
    for (const li of alvo) assert.doesNotMatch(li, producao, li);
  });

  test(`Stack (${h.id}): exatamente 2 linhas cujo local é só o painel da Asten, ambas em produção`, () => {
    const alvo = linhasStack().filter((li) => {
      const where = li.match(/<span class="where">([\s\S]*?)<\/span>/)?.[1] ?? '';
      return /^(painel da Asten|Asten dashboard)\b/.test(where);
    });
    assert.equal(alvo.length, 2);
    for (const li of alvo) assert.match(li, producao, li);
  });
}

test('marca: nenhum elemento referencia o símbolo #si-claude', () => {
  for (const f of ['site/index.html', 'site/en/index.html']) {
    assert.doesNotMatch(ler(f), /si-claude/, f);
  }
});

test('foto: o arquivo existe no site', () => {
  assert.ok(existsSync(join(raiz, 'site/img/eduardo-gomes.jpg')));
});
