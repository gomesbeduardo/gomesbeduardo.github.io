// Calendário do GitHub gerado no build (spec 002b R1-R5; 001b T9).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const gh = JSON.parse(readFileSync('src/data/github.json', 'utf8'));
const dias = gh.calendario.semanas.flatMap((w) => w.dias);

const rotulos = {
  'index.html': { meses: ['nov', 'dez', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov'], ds: ['seg', 'qua', 'sex'], leg: ['menos', 'mais'] },
  'en/index.html': { meses: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], ds: ['Mon', 'Wed', 'Fri'], leg: ['Less', 'More'] },
};

const grade = (h) => h.match(/<div class="cal-tabela"[\s\S]*?<div class="cal-legenda"[\s\S]*?<\/div>/)?.[0] ?? '';
const textos = (h) => [...h.matchAll(/<i class="cal-dia"[^>]*data-data="([^"]+)"[^>]*><span class="sr-only">([^<]*)<\/span><\/i>/g)].map((m) => [m[1], m[2]]);

for (const [arq, r] of Object.entries(rotulos)) {
  test(`(T5) C6: ${arq} traz a grade, os eixos, a legenda e o texto por dia no HTML do build`, () => {
    const h = readFileSync(`dist/${arq}`, 'utf8');
    const g = grade(h);
    assert.ok(g, 'sem .cal-tabela e .cal-legenda');
    const meses = [...g.matchAll(/<span style="grid-column:\d+">([^<]*)<\/span>/g)].map((m) => m[1]);
    assert.deepEqual(meses, r.meses);
    const eixo = [...g.matchAll(/<span class="cal-ds" aria-hidden="true">([^<]*)<\/span>/g)].map((m) => m[1]).filter(Boolean);
    assert.deepEqual(eixo, r.ds);
    const leg = g.match(/<div class="cal-legenda"[\s\S]*$/)[0];
    assert.deepEqual([...leg.matchAll(/<span>([^<]*)<\/span>/g)].map((m) => m[1]), r.leg);
    assert.equal((leg.match(/<i data-l="[0-4]" aria-hidden="true">/g) ?? []).length, 5);
    assert.ok(!/<i[^>]*\stitle=/.test(g), 'dia com title');
    const t = textos(h);
    assert.equal(t.length, gh.calendario.totalDias);
    assert.ok(t.every(([, x]) => x.trim().length > 0), 'dia sem texto');
    // Ordem do contrato: por linha (dia da semana) e, dentro dela, por semana.
    const ordem = [0, 1, 2, 3, 4, 5, 6].flatMap((r) => gh.calendario.semanas.flatMap((w) => w.dias.filter((d) => d.diaSemana === r).map((d) => d.data)));
    assert.deepEqual(t.map(([d]) => d), ordem);
    const zero = g.match(/tabindex="0"/g) ?? [];
    assert.equal(zero.length, 1);
    assert.ok(g.includes(`data-data="${dias.at(-1).data}" tabindex="0"`), 'tabindex 0 fora do último dia');
  });
}

test('(T9) C7: sem #cal-dados no main.js nem no HTML do build', () => {
  assert.ok(!readFileSync('public/main.js', 'utf8').includes('cal-dados'));
  assert.ok(!readFileSync('dist/index.html', 'utf8').includes('cal-dados'));
});

test('(T5b) C6: texto do dia com 7, 1 e 0 contribuições, em PT e EN', () => {
  mkdirSync('.astro', { recursive: true });
  const tmp = mkdtempSync(join('.astro', 'teste-cal-'));
  try {
    const d = JSON.parse(readFileSync('src/data/github.json', 'utf8'));
    const alvo = { '2026-03-02': 7, '2026-03-03': 1, '2026-03-04': 0 };
    for (const w of d.calendario.semanas) for (const x of w.dias) if (x.data in alvo) x.contagem = alvo[x.data];
    const fixture = join(process.cwd(), tmp, 'github.json');
    writeFileSync(fixture, JSON.stringify(d, null, 2) + '\n');
    execFileSync('npx', ['astro', 'build', '--outDir', join(tmp, 'o')], { stdio: 'pipe', env: { ...process.env, GH_JSON_TESTE: fixture } });
    const pega = (arq) => Object.fromEntries(textos(readFileSync(join(tmp, 'o', arq), 'utf8')));
    const pt = pega('index.html');
    assert.equal(pt['2026-03-02'], '7 contribuições em 2 de mar. de 2026');
    assert.equal(pt['2026-03-03'], '1 contribuição em 3 de mar. de 2026');
    assert.equal(pt['2026-03-04'], 'Nenhuma contribuição em 4 de mar. de 2026');
    const en = pega('en/index.html');
    assert.equal(en['2026-03-02'], '7 contributions on Mar 2, 2026');
    assert.equal(en['2026-03-03'], '1 contribution on Mar 3, 2026');
    assert.equal(en['2026-03-04'], 'No contributions on Mar 4, 2026');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
