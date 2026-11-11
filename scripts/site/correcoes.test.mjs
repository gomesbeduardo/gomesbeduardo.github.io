// Aceite da spec 007: correções de fatos do CodeRace e do YourMentor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => readFileSync(join(raiz, rel), 'utf8');
const F = ['src/data/curriculo.json', 'site/index.html', 'site/en/index.html', 'site/surpresas.js', 'README.md', 'PRODUCT.md'];
const HTMLS = ['site/index.html', 'site/en/index.html'];

test('A1: sem numeral romano ou ordinal no CodeRace', () => {
  for (const f of F) {
    const t = ler(f);
    assert.doesNotMatch(t, /IX Code/i, f);
    assert.doesNotMatch(t, /IX CodeRace/i, f);
    assert.doesNotMatch(t, /9th Code/i, f);
  }
});

test('A2: assistente financeiro do CodeRace 2026 sem "atual" nem início em março', () => {
  const j = JSON.parse(ler('src/data/curriculo.json'));
  for (const lang of ['pt', 'en']) {
    const d = j[lang] || j.idiomas?.[lang] || j;
    const vols = JSON.stringify(d).includes('voluntariado') ? d.voluntariado : null;
    assert.ok(vols, `voluntariado ${lang}`);
  }
  const todos = [];
  (function achar(o) {
    if (Array.isArray(o)) o.forEach(achar);
    else if (o && typeof o === 'object') {
      if (Array.isArray(o.voluntariado)) todos.push(...o.voluntariado);
      Object.values(o).forEach(achar);
    }
  })(j);
  const fin = todos.filter((v) => /financ/i.test(v.titulo) && /CodeRace/.test(v.titulo));
  assert.equal(fin.length, 2);
  for (const v of fin) {
    assert.equal(v.quando, '2026');
    assert.doesNotMatch(JSON.stringify(v), /atual|present|mar\/2026|since Mar/i);
  }
  for (const f of HTMLS) {
    const t = ler(f);
    const lis = t.split('\n').filter((l) => /financ/i.test(l) && /CodeRace/.test(l));
    assert.ok(lis.length >= 2, f);
    for (const l of lis) assert.doesNotMatch(l, /atual|to present|since Mar 2026|mar\/2026|Mar 2026/i, f);
  }
  assert.match(ler('site/index.html'), /Atuei só nas finanças, durante a organização e o evento, sem papel na avaliação das equipes\./);
  assert.match(ler('site/en/index.html'), /I worked only on the finances, during the organization and the event, with no role in judging the teams\./);
  const jt = JSON.stringify(j);
  assert.match(jt, /Atuei só nas finanças, durante a organização e o evento, sem papel na avaliação das equipes\./);
  assert.match(jt, /I worked only on the finances, during the organization and the event, with no role in judging the teams\./);
  assert.match(jt, /Comissão organizadora do CodeRace 2025/);
  assert.match(jt, /CodeRace 2025 organizing committee/);
});

test('A3: YourMentor começa em out/2025 e cita Mentor.Me e a mudança de jun/2026', () => {
  const t = ler('src/data/curriculo.json');
  const j = JSON.parse(t);
  const ym = [];
  (function achar(o) {
    if (Array.isArray(o)) o.forEach(achar);
    else if (o && typeof o === 'object') {
      if (o.organizacao === 'YourMentor') ym.push(o);
      Object.values(o).forEach(achar);
    }
  })(j);
  assert.equal(ym.length, 2);
  assert.deepEqual(ym.map((x) => x.inicio).sort(), ['Oct/2025', 'out/2025']);
  for (const x of ym) assert.match(JSON.stringify(x), /Mentor\.Me/);
  assert.match(t, /que virou YourMentor em jun\/2026, com novo nome e novo foco/);
  assert.match(t, /which became YourMentor in Jun 2026, with a new name and a new focus/);
  const pt = ler('site/index.html');
  const en = ler('site/en/index.html');
  assert.match(pt, /desde out\/2025/);
  assert.match(pt, /out\/2025 – atual/);
  assert.match(pt, /Cofundei a Mentor\.Me, campeã do 1º Ideathon de SI da AMF, que virou YourMentor em jun\/2026, com novo nome e novo foco\./);
  assert.match(en, /since Oct 2025/);
  assert.match(en, /Oct 2025 to present/);
  assert.match(en, /I co-founded Mentor\.Me, winner of the 1st AMF IS Ideathon, which became YourMentor in Jun 2026, with a new name and a new focus\./);
  assert.doesNotMatch(pt, /desde jun\/2026|jun\/2026 – atual/);
  assert.doesNotMatch(en, /since Jun 2026|Jun 2026 to present/);
});

test('A3b: na Trajetória o YourMentor vem logo depois do Ideathon (out/2025)', () => {
  for (const [f, ym] of [['site/index.html', '<h3>YourMentor</h3>'], ['site/en/index.html', '<h3>YourMentor</h3>']]) {
    const lis = ler(f).split('\n').filter((l) => l.includes('traj-card'));
    const i = lis.findIndex((l) => /<h3>[^<]*Ideathon/.test(l));
    assert.ok(i >= 0, f);
    assert.ok(lis[i + 1].includes(ym), f);
  }
});

test('A4: c10 com o texto novo', () => {
  const js = ler('site/surpresas.js');
  assert.ok(js.includes('Sou cofundador do YourMentor desde outubro de 2025, quando ele ainda se chamava Mentor.Me.'));
  assert.ok(js.includes('I have been a co-founder of YourMentor since October 2025, back when it was called Mentor.Me.'));
});

test('A7: grafia CodeRace', () => {
  for (const f of F) {
    const t = ler(f);
    assert.doesNotMatch(t, /code race/i, f);
    assert.doesNotMatch(t, /Coderace/, f);
    assert.match(t, /CodeRace/, f);
  }
});
