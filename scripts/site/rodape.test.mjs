// Spec 006: e-mail que copia com aviso e rodapé completo (testes estáticos: HTML lê dist/, JS lê public/; as regras de CSS são medidas em contato.e2e.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => readFileSync(join(raiz, rel), 'utf8');
const js = ler('public/main.js');
const HOMES = { pt: 'dist/index.html', en: 'dist/en/index.html' };
const PROJETOS = ['lms', 'infohub', 'leadgate'].flatMap((p) => [
  ['pt', `dist/projeto-${p}.html`], ['en', `dist/en/projeto-${p}.html`],
]);
const T = {
  pt: { mail: 'E-mail', aria: 'Copiar e-mail', nav: 'Navegação', contato: 'Contato', topo: 'Voltar ao topo', sobre: 'Sobre este site', cod: 'Código do site', lugar: 'Santa Maria, RS',
    frase: 'Feito com Astro e Tailwind CSS, com GSAP e Lenis nas animações. Fontes Funnel Display, Funnel Sans e Reddit Mono. Publicado no GitHub Pages pelo GitHub Actions.' },
  en: { mail: 'Email', aria: 'Copy email', nav: 'Navigation', contato: 'Contact', topo: 'Back to top', sobre: 'About this site', cod: 'Site source', lugar: 'Santa Maria, Brazil',
    frase: 'Built with Astro and Tailwind CSS, with GSAP and Lenis for the animations. Funnel Display, Funnel Sans and Reddit Mono fonts. Published on GitHub Pages through GitHub Actions.' },
};
const REPO = 'https://github.com/gomesbeduardo/gomesbeduardo.github.io';
const secao = (h, id) => { const i = h.indexOf(`<section id="${id}"`); return h.slice(i, h.indexOf('</section>', i)); };
const rodape = (h) => { const i = h.indexOf('<footer'); return h.slice(i, h.indexOf('</footer>', i)); };

for (const [lang, f] of Object.entries(HOMES)) {
  const t = T[lang];
  test(`A1 (${lang}). contato sem endereço por extenso; lista começa pelo botão de e-mail`, () => {
    const h = ler(f), c = secao(h, 'contato');
    assert.doesNotMatch(h, /class="mail"/);
    assert.doesNotMatch(h, /id="copy-email"/);
    assert.doesNotMatch(c, /eduardobgomes100/);
    assert.match(c, /<ul class="links">\s*<li[^>]*><button[^>]*data-copiar-email[^>]*>/);
    assert.match(c, new RegExp(`aria-label="${t.aria}"`));
    assert.match(c, new RegExp(`<span class="lbl">${t.mail}</span>`));
    assert.ok(c.indexOf('<button') < c.indexOf('linkedin.com'));
    assert.ok(c.indexOf(t.lugar) >= 0 && c.indexOf(t.lugar) < c.indexOf('<ul class="links">'));
  });

  test(`A5 (${lang}). rodapé com colunas, sobre o site e linha final`, () => {
    const r = rodape(ler(f));
    assert.ok(r.includes(`>${t.nav}</h2>`) && r.includes(`>${t.contato}</h2>`));
    for (const id of ['sobre', 'trajetoria', 'experiencia', 'projetos', 'numeros', 'contato']) {
      assert.ok(r.includes(`href="#${id}"`), `âncora #${id}`);
    }
    assert.match(r, /data-copiar-email/);
    assert.ok(r.includes('https://www.linkedin.com/in/eduardo-gomes-pb/'));
    assert.ok(r.includes('https://github.com/gomesbeduardo"'));
    assert.match(r, /curriculo\/curriculo-eduardo-gomes-(pt|en)\.pdf/);
    for (const k of ['id="claude-btn"', 'class="foot-claude"', 'class="foot-spec"', 'class="sp-cola"', 'data-c="c6"', 'data-c="c9"']) assert.ok(r.includes(k), k);
    assert.ok(r.includes(t.sobre) && r.includes(t.cod));
    assert.ok(r.includes(t.frase));
    assert.ok(r.includes(`href="${REPO}"`));
    assert.match(r, /class="foot-fim"/);
    assert.ok(r.includes(`© <span data-ano>2026</span> Eduardo Bergoli Gomes · ${t.lugar}`));
    assert.match(r, lang === 'pt' ? /href="\.\/"[^>]*>PT<\/a>[\s\S]*href="en\/"[^>]*>EN<\/a>/ : /href="\.\.\/"[^>]*>PT<\/a>[\s\S]*href="\.\/"[^>]*>EN<\/a>/);
    assert.ok(r.includes(`${t.topo} ↑`) && /data-topo/.test(r));
    assert.doesNotMatch(r, /<small>Eduardo Bergoli Gomes\.<\/small>/);
  });
}

for (const [lang, f] of PROJETOS) {
  test(`A8. linha final em ${f}`, () => {
    const t = T[lang], r = rodape(ler(f));
    assert.ok(r.indexOf('class="back"') >= 0 && r.indexOf('class="foot-fim"') > r.indexOf('class="back"'));
    assert.ok(r.includes(`${t.topo} ↑`) && /data-topo/.test(r));
    assert.ok(r.includes('© <span data-ano>2026</span> Eduardo Bergoli Gomes'));
    assert.ok(r.includes(t.lugar));
    assert.match(r, />PT<\/a>/); assert.match(r, />EN<\/a>/);
  });
}

test('JS: um só tratador copia exatamente o endereço e tem caminho de falha', () => {
  assert.match(js, /\[data-copiar-email\]/);
  assert.match(js, /writeText\('eduardobgomes100@gmail\.com'\)/);
  assert.doesNotMatch(js, /#copy-email/);
  const i = js.indexOf('writeText(');
  const trecho = js.slice(i, i + 400);
  assert.match(trecho, /\.then\(/);
  assert.match(trecho, /\.catch\(/);
  assert.match(js, /!navigator\.clipboard/);
  assert.match(js, /Não deu para copiar\. Copie à mão:/);
  assert.match(js, /Couldn't copy\. Copy it by hand:/);
  assert.match(js, /E-mail copiado/); assert.match(js, /Email copied/);
  assert.match(js, /Abrir no app de e-mail/); assert.match(js, /Open in your email app/);
  assert.match(js, /mailto:eduardobgomes100@gmail\.com/);
  assert.match(js, /Escape/);
  assert.match(js, /2500/);
});

test('JS: o sucesso só é mostrado depois da cópia, nunca antes do writeText', () => {
  const i = js.indexOf('writeText(');
  assert.ok(i > 0);
  assert.doesNotMatch(js.slice(i - 300, i), /mostrarOk|E-mail copiado/);
});

test('aviso: role=status e aria-live=polite', () => {
  assert.match(js, /setAttribute\('role', 'status'\)/);
  assert.match(js, /setAttribute\('aria-live', 'polite'\)/);
});

test('JS: voltar ao topo usa a rolagem suave e leva o foco ao início; ano pelo JS', () => {
  assert.match(js, /\[data-topo\]/);
  assert.match(js, /data-ano/);
  const i = js.indexOf('[data-topo]');
  const t = js.slice(i, i + 1200);
  assert.match(t, /scrollTo\(0/);
  assert.match(t, /focus\(\{ ?preventScroll: true/);
});
