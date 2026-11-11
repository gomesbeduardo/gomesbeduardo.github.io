// Coletor de números do GitHub (spec 002). Funções puras + executar(), sem dependência.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const VERSAO_CONTRATO = 1;
export const USUARIO_PADRAO = 'gomesbeduardo';
export const NOME_SECRET = 'GH_TOKEN_LEITURA';
// Repositorios que nao entram na soma de linguagens (ex.: virtualenv versionado inflando Python). So afeta `linguagens`.
export const REPOS_IGNORADOS = ['centralEng_AI_Chatbot'];
export const URL_GRAPHQL = 'https://api.github.com/graphql';
const DIAS_JANELA = 364; // 365 dias inclusivos, dentro do teto de um ano (R1)
const MAX_LINGUAGENS = 5;

export const CONSULTA = `
query Numeros($login: String!, $de: DateTime!, $ate: DateTime!, $cursor: String) {
  user(login: $login) {
    login
    contributionsCollection(from: $de, to: $ate) {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel weekday } }
      }
    }
    repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false,
                 orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

const NIVEIS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

const dataIso = (ms) => new Date(ms).toISOString().slice(0, 10);

// R1: janela de 365 dias inclusivos terminando no dia da coleta (UTC).
export function calcularJanela(agoraIso) {
  const agora = new Date(agoraIso);
  if (Number.isNaN(agora.getTime())) throw new Error(`data invalida: ${agoraIso}`);
  const ateMs = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
  const deMs = ateMs - DIAS_JANELA * 86400000;
  const de = dataIso(deMs);
  const ate = dataIso(ateMs);
  return { de, ate, deIso: `${de}T00:00:00Z`, ateIso: `${ate}T23:59:59Z` };
}

// R5: um dia do GraphQL vira um dia do contrato.
export function converterDia(dia) {
  const nivel = NIVEIS[dia.contributionLevel];
  if (nivel === undefined) throw new Error(`contributionLevel desconhecido: ${dia.contributionLevel}`);
  return { data: dia.date, contagem: dia.contributionCount, nivel, diaSemana: dia.weekday };
}

// R4: bytes por linguagem somados em todos os repositórios, top 5, percentual sobre o total.
export function calcularLinguagens(repos, ignorar = []) {
  const soma = new Map();
  for (const repo of repos) {
    if (ignorar.includes(repo?.name)) continue;
    for (const aresta of repo?.languages?.edges ?? []) {
      const nome = aresta.node.name;
      const atual = soma.get(nome) ?? { nome, bytes: 0, cor: aresta.node.color ?? null };
      atual.bytes += aresta.size;
      soma.set(nome, atual);
    }
  }
  const total = [...soma.values()].reduce((a, l) => a + l.bytes, 0);
  if (total === 0) return [];
  return [...soma.values()]
    .sort((a, b) => b.bytes - a.bytes || a.nome.localeCompare(b.nome))
    .slice(0, MAX_LINGUAGENS)
    .map((l) => ({ nome: l.nome, bytes: l.bytes, percentual: Math.round((l.bytes / total) * 1000) / 10, cor: l.cor }));
}

// Valida o corpo de uma resposta GraphQL e devolve data.user. Lança Error em falha (R6).
export function validarResposta(corpo, { primeira = true } = {}) {
  if (!corpo || typeof corpo !== 'object') throw new Error('resposta sem corpo JSON');
  if (Array.isArray(corpo.errors) && corpo.errors.length > 0) {
    throw new Error(`GraphQL devolveu errors: ${corpo.errors.map((e) => e.message).join('; ')}`);
  }
  const usuario = corpo.data?.user;
  if (!usuario) throw new Error('resposta sem data.user');
  if (!usuario.repositories?.nodes || !usuario.repositories.pageInfo) throw new Error('resposta sem repositories');
  if (primeira) {
    const col = usuario.contributionsCollection;
    const cal = col?.contributionCalendar;
    if (!col || !cal) throw new Error('resposta sem contributionsCollection.contributionCalendar');
    if (!Array.isArray(cal.weeks) || cal.weeks.length === 0) throw new Error('calendario sem weeks');
    if (!Number.isInteger(cal.totalContributions) || cal.totalContributions < 0) throw new Error('totalContributions invalido');
  }
  return usuario;
}

// R2, R3, R4, R5: monta o JSON do contrato a partir das páginas (data.user) já validadas.
export function transformar({ paginas, agora, amostra, usuario, ignorar = [] }) {
  const ignorados = [...REPOS_IGNORADOS, ...ignorar.filter((r) => !REPOS_IGNORADOS.includes(r))];
  const primeira = paginas[0];
  const col = primeira.contributionsCollection;
  const cal = col.contributionCalendar;
  const semanas = cal.weeks.map((s) => ({ dias: s.contributionDays.map(converterDia) }));
  const todosDias = semanas.flatMap((s) => s.dias);
  const repos = paginas.flatMap((p) => p.repositories.nodes);
  return {
    versao: VERSAO_CONTRATO,
    amostra: Boolean(amostra),
    usuario,
    coletadoEm: new Date(agora).toISOString(),
    janela: (({ de, ate }) => ({ de, ate }))(calcularJanela(agora)),
    contribuicoes: {
      total: cal.totalContributions,
      commits: col.totalCommitContributions,
      pullRequests: col.totalPullRequestContributions,
      issues: col.totalIssueContributions,
      revisoes: col.totalPullRequestReviewContributions,
      restritas: col.restrictedContributionsCount,
    },
    reposPublicos: primeira.repositories.totalCount,
    linguagens: calcularLinguagens(repos, ignorados),
    linguagensIgnoram: ignorados,
    calendario: {
      totalDias: todosDias.length,
      maximoDia: todosDias.reduce((m, d) => Math.max(m, d.contagem), 0),
      semanas,
    },
  };
}

// Contrato de src/data/github.json. Devolve a lista de erros (vazia quando válido).
export function validarContrato(json) {
  const erros = [];
  const inteiro = (v, nome, min = 0, max = Infinity) => {
    if (!Number.isInteger(v) || v < min || v > max) erros.push(`${nome} deve ser inteiro entre ${min} e ${max}, veio ${JSON.stringify(v)}`);
  };
  const texto = (v, nome, re) => {
    if (typeof v !== 'string' || (re && !re.test(v))) erros.push(`${nome} invalido: ${JSON.stringify(v)}`);
  };
  if (!json || typeof json !== 'object') return ['json ausente'];
  if (json.versao !== VERSAO_CONTRATO) erros.push(`versao deve ser ${VERSAO_CONTRATO}`);
  if (typeof json.amostra !== 'boolean') erros.push('amostra deve ser booleano');
  texto(json.usuario, 'usuario', /^[\w-]+$/);
  texto(json.coletadoEm, 'coletadoEm', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
  const dataRe = /^\d{4}-\d{2}-\d{2}$/;
  texto(json.janela?.de, 'janela.de', dataRe);
  texto(json.janela?.ate, 'janela.ate', dataRe);
  const c = json.contribuicoes ?? {};
  for (const k of ['total', 'commits', 'pullRequests', 'issues', 'revisoes', 'restritas']) inteiro(c[k], `contribuicoes.${k}`);
  inteiro(json.reposPublicos, 'reposPublicos');
  if (json.linguagensIgnoram !== undefined && !(Array.isArray(json.linguagensIgnoram) && json.linguagensIgnoram.every((r) => typeof r === 'string'))) erros.push('linguagensIgnoram deve ser lista de textos');
  if (!Array.isArray(json.linguagens)) erros.push('linguagens deve ser lista');
  else {
    if (json.linguagens.length > MAX_LINGUAGENS) erros.push(`linguagens tem mais de ${MAX_LINGUAGENS}`);
    json.linguagens.forEach((l, i) => {
      texto(l.nome, `linguagens[${i}].nome`);
      inteiro(l.bytes, `linguagens[${i}].bytes`);
      if (typeof l.percentual !== 'number' || l.percentual < 0 || l.percentual > 100 || Math.round(l.percentual * 10) !== l.percentual * 10) {
        erros.push(`linguagens[${i}].percentual deve ter uma casa decimal entre 0 e 100`);
      }
      if (l.cor !== null && !(typeof l.cor === 'string' && /^#[0-9a-fA-F]{6}$/.test(l.cor))) erros.push(`linguagens[${i}].cor invalida`);
    });
  }
  const cal = json.calendario;
  if (!cal || !Array.isArray(cal.semanas)) erros.push('calendario.semanas deve ser lista');
  else {
    if (cal.semanas.length < 52 || cal.semanas.length > 54) erros.push(`calendario.semanas deve ter 52 a 54 itens, tem ${cal.semanas.length}`);
    let dias = 0;
    let maximo = 0;
    cal.semanas.forEach((s, i) => {
      if (!Array.isArray(s.dias) || s.dias.length < 1 || s.dias.length > 7) { erros.push(`semanas[${i}].dias deve ter 1 a 7 dias`); return; }
      s.dias.forEach((d, j) => {
        texto(d.data, `semanas[${i}].dias[${j}].data`, dataRe);
        inteiro(d.contagem, `semanas[${i}].dias[${j}].contagem`);
        inteiro(d.nivel, `semanas[${i}].dias[${j}].nivel`, 0, 4);
        inteiro(d.diaSemana, `semanas[${i}].dias[${j}].diaSemana`, 0, 6);
        dias += 1;
        maximo = Math.max(maximo, d.contagem ?? 0);
      });
    });
    inteiro(cal.totalDias, 'calendario.totalDias');
    inteiro(cal.maximoDia, 'calendario.maximoDia');
    if (cal.totalDias !== dias) erros.push(`calendario.totalDias (${cal.totalDias}) difere da soma dos dias (${dias})`);
    if (cal.maximoDia !== maximo) erros.push(`calendario.maximoDia (${cal.maximoDia}) difere do maior dia (${maximo})`);
  }
  return erros;
}

async function consultar({ fetch, token, login, janela }) {
  const paginas = [];
  let cursor = null;
  for (let i = 0; i < 20; i++) {
    const resposta = await fetch(URL_GRAPHQL, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'gomesbeduardo.github.io/coletor',
      },
      body: JSON.stringify({ query: CONSULTA, variables: { login, de: janela.deIso, ate: janela.ateIso, cursor } }),
    });
    if (resposta.status !== 200) throw new Error(`HTTP ${resposta.status} da API GraphQL`);
    const corpo = await resposta.json();
    const usuario = validarResposta(corpo, { primeira: i === 0 });
    paginas.push(usuario);
    const info = usuario.repositories.pageInfo;
    if (!info.hasNextPage) break;
    cursor = info.endCursor;
  }
  return paginas;
}

// Ponto de entrada do CLI, com dependências injetáveis. Devolve o código de saída (R6, R7).
export async function executar({ env = process.env, fetch = globalThis.fetch, saida, fixture, agora = new Date().toISOString(), estrito = false, usuario = USUARIO_PADRAO, ignorar = [], log = console } = {}) {
  if (!saida) throw new Error('saida obrigatoria');
  const existente = existsSync(saida);
  const falhar = (motivo) => {
    if (existente && !estrito) {
      log.warn(`::warning::coleta do GitHub falhou (${motivo}); mantendo ${saida} anterior`);
      return 0;
    }
    log.error(`::error::coleta do GitHub falhou (${motivo}) e nao ha dado anterior utilizavel`);
    return 1;
  };

  let json;
  try {
    if (fixture) {
      const corpo = JSON.parse(readFileSync(fixture, 'utf8'));
      const usuarioGraphQL = validarResposta(corpo);
      json = transformar({ paginas: [usuarioGraphQL], agora, amostra: true, usuario, ignorar });
    } else {
      const token = env[NOME_SECRET];
      if (!token) return falhar(`secret ${NOME_SECRET} ausente`);
      const paginas = await consultar({ fetch, token, login: usuario, janela: calcularJanela(agora) });
      json = transformar({ paginas, agora, amostra: false, usuario, ignorar });
    }
    const erros = validarContrato(json);
    if (erros.length > 0) throw new Error(`contrato invalido: ${erros.join('; ')}`);
  } catch (erro) {
    return falhar(erro.message);
  }

  mkdirSync(dirname(saida), { recursive: true });
  writeFileSync(saida, JSON.stringify(json, null, 2) + '\n');
  log.log(`gravado ${saida}: ${json.contribuicoes.total} contribuicoes, ${json.reposPublicos} repos, ${json.linguagens.length} linguagens, amostra=${json.amostra}`);
  return 0;
}
