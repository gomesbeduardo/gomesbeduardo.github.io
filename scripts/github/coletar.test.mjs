// Testes do coletor de números do GitHub (spec 002). Sem rede: fetch injetado e fixtures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  calcularJanela,
  converterDia,
  calcularLinguagens,
  transformar,
  validarContrato,
  executar,
} from './lib.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(aqui, 'fixtures', 'graphql-amostra.json');
const AGORA = '2026-11-09T09:00:00Z';
const lerFixture = () => JSON.parse(readFileSync(FIXTURE, 'utf8'));
const pastaTemp = () => mkdtempSync(join(tmpdir(), 'coletar-'));

// Resposta falsa de fetch: lista de respostas, uma por chamada.
function fetchFalso(respostas) {
  const chamadas = [];
  const fn = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    const r = respostas[Math.min(chamadas.length - 1, respostas.length - 1)];
    return {
      ok: r.status === 200,
      status: r.status,
      json: async () => r.corpo,
      text: async () => JSON.stringify(r.corpo),
    };
  };
  fn.chamadas = chamadas;
  return fn;
}

const silencioso = { log() {}, warn() {}, error() {} };
function logColetor() {
  const linhas = [];
  return { linhas, log: (m) => linhas.push(String(m)), warn: (m) => linhas.push(String(m)), error: (m) => linhas.push(String(m)) };
}

// T1 / C1
test('calcularJanela: 365 dias inclusivos terminando na data da coleta', () => {
  assert.deepEqual(calcularJanela(AGORA), {
    de: '2025-11-10',
    ate: '2026-11-09',
    deIso: '2025-11-10T00:00:00Z',
    ateIso: '2026-11-09T23:59:59Z',
  });
});

// T6 / C5
test('converterDia: campos renomeados e nivel de 0 a 4', () => {
  assert.deepEqual(
    converterDia({ date: '2026-03-02', contributionCount: 7, contributionLevel: 'THIRD_QUARTILE', weekday: 1 }),
    { data: '2026-03-02', contagem: 7, nivel: 3, diaSemana: 1 },
  );
  const niveis = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
  assert.deepEqual(
    niveis.map((n) => converterDia({ date: '2026-01-01', contributionCount: 0, contributionLevel: n, weekday: 4 }).nivel),
    [0, 1, 2, 3, 4],
  );
});

// T3 / C3: exemplo de R4
const repoA = { name: 'A', languages: { edges: [
  { size: 60000, node: { name: 'TypeScript', color: '#3178c6' } },
  { size: 10000, node: { name: 'CSS', color: '#663399' } },
] } };
const repoB = { name: 'B', languages: { edges: [
  { size: 20000, node: { name: 'TypeScript', color: '#3178c6' } },
  { size: 8000, node: { name: 'Python', color: '#3572A5' } },
  { size: 2000, node: { name: 'Shell', color: '#89e051' } },
] } };

test('calcularLinguagens: soma bytes por linguagem e percentual com uma casa', () => {
  assert.deepEqual(calcularLinguagens([repoA, repoB]), [
    { nome: 'TypeScript', bytes: 80000, percentual: 80.0, cor: '#3178c6' },
    { nome: 'CSS', bytes: 10000, percentual: 10.0, cor: '#663399' },
    { nome: 'Python', bytes: 8000, percentual: 8.0, cor: '#3572A5' },
    { nome: 'Shell', bytes: 2000, percentual: 2.0, cor: '#89e051' },
  ]);
});

// T4 / C4
test('calcularLinguagens: no maximo 5 linguagens', () => {
  const edges = [7000, 6000, 5000, 4000, 3000, 2000, 1000].map((size, i) => ({ size, node: { name: `L${i}`, color: null } }));
  const saida = calcularLinguagens([{ name: 'X', languages: { edges } }]);
  assert.equal(saida.length, 5);
  assert.equal(saida.at(-1).bytes, 3000);
  assert.equal(saida.at(-1).cor, null);
});

// T5 / C4
test('calcularLinguagens: sem repositorios devolve lista vazia', () => {
  assert.deepEqual(calcularLinguagens([]), []);
});

// T2 / C2 e contrato
test('transformar: contribuicoes, repos, calendario e contrato valido', () => {
  const fx = lerFixture();
  const json = transformar({ paginas: [fx.data.user], agora: AGORA, amostra: true, usuario: 'gomesbeduardo' });
  assert.deepEqual(json.contribuicoes, { total: 1234, commits: 900, pullRequests: 200, issues: 34, revisoes: 100, restritas: 15 });
  assert.equal(json.reposPublicos, 12);
  assert.equal(json.versao, 1);
  assert.equal(json.amostra, true);
  assert.equal(json.coletadoEm, '2026-11-09T09:00:00.000Z');
  assert.deepEqual(json.janela, { de: '2025-11-10', ate: '2026-11-09' });
  assert.equal(json.calendario.totalDias, 365);
  assert.equal(json.calendario.semanas.length, 53);
  assert.equal(json.calendario.maximoDia, 18);
  assert.equal(json.linguagens[0].nome, 'TypeScript');
  assert.deepEqual(validarContrato(json), []);
});

test('validarContrato: aponta campo errado', () => {
  const fx = lerFixture();
  const json = transformar({ paginas: [fx.data.user], agora: AGORA, amostra: false, usuario: 'gomesbeduardo' });
  json.calendario.semanas[0].dias[0].nivel = 9;
  json.contribuicoes.total = -1;
  const erros = validarContrato(json);
  assert.ok(erros.some((e) => e.includes('nivel')), erros.join('; '));
  assert.ok(erros.some((e) => e.includes('contribuicoes.total')), erros.join('; '));
});

// T7 / C6
test('executar: sem token e com arquivo existente, mantem o arquivo, avisa e devolve 0', async () => {
  const saida = join(pastaTemp(), 'github.json');
  writeFileSync(saida, 'X');
  const log = logColetor();
  const codigo = await executar({ env: {}, fetch: fetchFalso([]), saida, agora: AGORA, log });
  assert.equal(codigo, 0);
  assert.equal(readFileSync(saida, 'utf8'), 'X');
  assert.ok(log.linhas.some((l) => l.startsWith('::warning::')), log.linhas.join('\n'));
});

// T8 / C6
test('executar: HTTP 401 mantem o arquivo; estrito devolve 1', async () => {
  const saida = join(pastaTemp(), 'github.json');
  writeFileSync(saida, 'X');
  const env = { GH_TOKEN_LEITURA: 'token-de-teste' };
  const r1 = await executar({ env, fetch: fetchFalso([{ status: 401, corpo: { message: 'Bad credentials' } }]), saida, agora: AGORA, log: silencioso });
  assert.equal(r1, 0);
  assert.equal(readFileSync(saida, 'utf8'), 'X');
  const r2 = await executar({ env, fetch: fetchFalso([{ status: 401, corpo: {} }]), saida, agora: AGORA, estrito: true, log: silencioso });
  assert.equal(r2, 1);
  assert.equal(readFileSync(saida, 'utf8'), 'X');
});

// T9 / C6
test('executar: corpo com errors mantem o arquivo', async () => {
  const saida = join(pastaTemp(), 'github.json');
  writeFileSync(saida, 'X');
  const codigo = await executar({
    env: { GH_TOKEN_LEITURA: 't' },
    fetch: fetchFalso([{ status: 200, corpo: { errors: [{ message: 'Bad credentials' }] } }]),
    saida, agora: AGORA, log: silencioso,
  });
  assert.equal(codigo, 0);
  assert.equal(readFileSync(saida, 'utf8'), 'X');
});

// T10 / C6
test('executar: resposta sem weeks mantem o arquivo', async () => {
  const saida = join(pastaTemp(), 'github.json');
  writeFileSync(saida, 'X');
  const fx = lerFixture();
  delete fx.data.user.contributionsCollection.contributionCalendar.weeks;
  const codigo = await executar({ env: { GH_TOKEN_LEITURA: 't' }, fetch: fetchFalso([{ status: 200, corpo: fx }]), saida, agora: AGORA, log: silencioso });
  assert.equal(codigo, 0);
  assert.equal(readFileSync(saida, 'utf8'), 'X');
});

// T11 / C6
test('executar: sem token e sem arquivo devolve 1 e nao cria nada', async () => {
  const pasta = pastaTemp();
  const saida = join(pasta, 'github.json');
  const codigo = await executar({ env: {}, fetch: fetchFalso([]), saida, agora: AGORA, log: silencioso });
  assert.equal(codigo, 1);
  assert.equal(existsSync(saida), false);
});

// T13 / C2
test('executar: coleta real escreve amostra=false e manda o token no header', async () => {
  const saida = join(pastaTemp(), 'github.json');
  const fetch = fetchFalso([{ status: 200, corpo: lerFixture() }]);
  const codigo = await executar({ env: { GH_TOKEN_LEITURA: 'token-de-teste' }, fetch, saida, agora: AGORA, log: silencioso });
  assert.equal(codigo, 0);
  const json = JSON.parse(readFileSync(saida, 'utf8'));
  assert.equal(json.amostra, false);
  assert.equal(json.contribuicoes.total, 1234);
  assert.equal(fetch.chamadas.length, 1);
  assert.equal(fetch.chamadas[0].url, 'https://api.github.com/graphql');
  assert.equal(fetch.chamadas[0].opcoes.headers.Authorization, 'bearer token-de-teste');
  const corpo = JSON.parse(fetch.chamadas[0].opcoes.body);
  assert.equal(corpo.variables.login, 'gomesbeduardo');
  assert.equal(corpo.variables.de, '2025-11-10T00:00:00Z');
  assert.equal(corpo.variables.ate, '2026-11-09T23:59:59Z');
  assert.deepEqual(validarContrato(json), []);
});

// T14 / C4
test('executar: pagina repositorios quando hasNextPage', async () => {
  const saida = join(pastaTemp(), 'github.json');
  const p1 = lerFixture();
  p1.data.user.repositories.pageInfo = { hasNextPage: true, endCursor: 'c1' };
  const p2 = { data: { user: { repositories: {
    totalCount: 12,
    pageInfo: { hasNextPage: false, endCursor: 'c2' },
    nodes: [{ name: 'c', languages: { edges: [{ size: 100000, node: { name: 'Go', color: '#00ADD8' } }] } }],
  } } } };
  const fetch = fetchFalso([{ status: 200, corpo: p1 }, { status: 200, corpo: p2 }]);
  const codigo = await executar({ env: { GH_TOKEN_LEITURA: 't' }, fetch, saida, agora: AGORA, log: silencioso });
  assert.equal(codigo, 0);
  assert.equal(fetch.chamadas.length, 2);
  assert.equal(JSON.parse(fetch.chamadas[1].opcoes.body).variables.cursor, 'c1');
  const json = JSON.parse(readFileSync(saida, 'utf8'));
  assert.equal(json.linguagens[0].nome, 'Go');
  assert.equal(json.linguagens[0].bytes, 100000);
  assert.equal(json.linguagens[0].percentual, 50.0);
});

// T12 / C7: CLI com fixture, sem rede
test('CLI --fixture gera arquivo com amostra=true que passa no contrato', () => {
  const saida = join(pastaTemp(), 'github.json');
  const r = spawnSync(process.execPath, [join(aqui, 'coletar.mjs'), '--fixture', FIXTURE, '--saida', saida, '--agora', AGORA], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const json = JSON.parse(readFileSync(saida, 'utf8'));
  assert.equal(json.amostra, true);
  assert.equal(json.versao, 1);
  assert.deepEqual(validarContrato(json), []);
});

test('src/data/github.json versionado bate com o contrato e com a fixture', () => {
  const caminho = join(aqui, '..', '..', 'src', 'data', 'github.json');
  assert.ok(existsSync(caminho), 'rode: node scripts/github/coletar.mjs --fixture scripts/github/fixtures/graphql-amostra.json');
  const json = JSON.parse(readFileSync(caminho, 'utf8'));
  assert.deepEqual(validarContrato(json), []);
  assert.equal(json.amostra, true);
  assert.equal(json.contribuicoes.total, 1234);
});
