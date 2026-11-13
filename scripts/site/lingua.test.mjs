// Confere os data-ancora do dist/: mesmos ids, na mesma ordem, em PT e EN (spec 001d R1, C7, T8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const lerHtml = (p) => readFileSync(`dist/${p}`, 'utf8');
const ancoras = (html) => [...html.matchAll(/\sdata-ancora="([^"]*)"/g)].map((m) => m[1]);

const PARES = [
  ['index.html', 'en/index.html'],
  ['projeto-leadgate.html', 'en/projeto-leadgate.html'],
  ['projeto-infohub.html', 'en/projeto-infohub.html'],
  ['projeto-lms.html', 'en/projeto-lms.html'],
];
const TODAS = PARES.flat();

for (const [pt, en] of PARES) {
  test(`T8-a: ${pt} e ${en} têm a mesma lista de data-ancora, na mesma ordem`, () => {
    const a = ancoras(lerHtml(pt));
    const b = ancoras(lerHtml(en));
    assert.ok(a.length > 0, `${pt} tem data-ancora`);
    assert.deepEqual(b, a);
  });
}

for (const arq of TODAS) {
  test(`T8-b: ${arq} não repete id`, () => {
    const ids = ancoras(lerHtml(arq));
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(repetidos, []);
  });
  test(`T8-c: ${arq} só tem ids em kebab-case ASCII`, () => {
    for (const id of ancoras(lerHtml(arq))) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `id "${id}"`);
  });
}

for (const arq of ['index.html', 'en/index.html']) {
  test(`cobertura da home: ${arq}`, () => {
    const html = lerHtml(arq);
    const ids = ancoras(html);
    for (const id of ['hero', 'sobre-titulo', 'trajetoria-titulo', 'experiencia-titulo', 'stack-titulo', 'projetos-titulo', 'numeros-titulo', 'contato-titulo', 'numeros', 'contato', 'traj-yourmentor', 'traj-ideathon', 'proj-infohub', 'proj-leadgate', 'proj-lms']) {
      assert.ok(ids.includes(id), `tem ${id}`);
    }
    assert.ok(ids.some((i) => /^sobre-\d+$/.test(i)), 'tem sobre-N');
    assert.ok(ids.some((i) => i.startsWith('exp-')), 'tem exp-…');
    assert.ok(ids.some((i) => i.startsWith('stack-faixa')), 'tem stack-faixa…');
    assert.ok(ids.some((i) => i.startsWith('stack-tabela')), 'tem stack-tabela…');
    const h2 = [...html.matchAll(/<h2\b[^>]*>/g)].map((m) => m[0]);
    assert.ok(h2.length > 0);
    for (const tag of h2) assert.match(tag, /data-ancora="/, `h2 sem data-ancora: ${tag}`);
    const trajeto = html.match(/<section id="trajetoria">[\s\S]*?<\/section>/)[0];
    const itens = (trajeto.match(/<li\b/g) || []).length;
    assert.equal(ids.filter((i) => i.startsWith('traj-')).length, itens, 'um traj- por item da Trajetória');
  });
}

for (const arq of TODAS.filter((a) => a.includes('projeto-'))) {
  test(`cobertura da página de projeto: ${arq}`, () => {
    const html = lerHtml(arq);
    const p = arq.match(/projeto-(\w+)\.html/)[1];
    assert.ok(ancoras(html).includes(`${p}-capa`), `tem ${p}-capa`);
    const main = html.match(/<main\b[\s\S]*?<\/main>/)[0];
    const secoes = [...main.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map((m) => m[0]);
    assert.ok(secoes.length > 0);
    for (const s of secoes) {
      assert.match(s.match(/<h2\b[^>]*>/)[0], /data-ancora="/, 'h2 da section com data-ancora');
      for (const tag of s.match(/<p\b[^>]*>/g) || []) assert.match(tag, /data-ancora="/, `p sem data-ancora: ${tag}`);
    }
  });
}

// Lista os pares (ancestral, descendente) em que um data-ancora contém outro, com um tokenizador de pilha de tags.
const VAZIOS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'use', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'stop']);
function aninhados(html) {
  const limpo = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '<$1></$1>');
  const pilha = [];
  const achados = [];
  for (const m of limpo.matchAll(/<(\/?)([a-zA-Z][^\s>/]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g)) {
    const [, fecha, nomeBruto, resto] = m;
    const nome = nomeBruto.toLowerCase();
    if (fecha) {
      const i = pilha.map((e) => e.nome).lastIndexOf(nome);
      if (i >= 0) pilha.length = i;
      continue;
    }
    const id = resto.match(/\sdata-ancora="([^"]*)"/)?.[1];
    if (id !== undefined) {
      const pai = [...pilha].reverse().find((e) => e.id !== undefined);
      if (pai) achados.push(`${pai.id} contém ${id}`);
    }
    if (!VAZIOS.has(nome) && !/\/\s*$/.test(resto)) pilha.push({ nome, id });
  }
  return achados;
}

for (const arq of TODAS) {
  test(`T8-d: ${arq} não tem data-ancora dentro de data-ancora`, () => {
    assert.deepEqual(aninhados(lerHtml(arq)), []);
  });
}
