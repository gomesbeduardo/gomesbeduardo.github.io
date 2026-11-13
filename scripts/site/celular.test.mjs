// Partes estáticas dos ajustes de leitura e toque no celular (HTML de dist/ e JS de public/).
// As regras de CSS (largura, alvo de toque, nowrap, overflow) são medidas no navegador em celular.e2e.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => readFileSync(join(raiz, rel), 'utf8');
const HOMES = ['dist/index.html', 'dist/en/index.html'];
const PROJETOS = ['lms', 'infohub', 'leadgate'].flatMap((p) => [`dist/projeto-${p}.html`, `dist/en/projeto-${p}.html`]);

test('2. e-mail por extenso saiu das páginas; o aviso quebra o endereço sem estourar a tela (spec 006)', () => {
  // Antes: .mail com <wbr> depois do @. A spec 006 removeu o endereço do Contato; ele só aparece no aviso de cópia.
  for (const f of HOMES) {
    assert.doesNotMatch(ler(f), /class="mail"|<wbr>/, f);
  }
  assert.match(ler('public/main.js'), /writeText\('eduardobgomes100@gmail\.com'\)/);
});

test('3. links de código no GitHub têm alvo de toque de 44px', () => {
  for (const f of PROJETOS) {
    assert.match(ler(f), /<a class="link-codigo" href="https:\/\/github\.com\/[^"]+"/, f);
  }
});

test('6. pontuação depois de palavra-surpresa fica colada em wrapper nowrap', () => {
  for (const f of HOMES) {
    const h = ler(f);
    for (const m of h.matchAll(/<span class="sp"[^>]*>[^<]*<\/span>[.,;:!?]/g)) {
      const antes = h.slice(Math.max(0, m.index - 22), m.index);
      assert.ok(antes.endsWith('<span class="sp-cola">'), `${f}: pontuação solta em ${m[0]}`);
    }
    assert.ok((h.match(/<span class="sp-cola"><span class="sp"[^>]*>[^<]*<\/span>[.,;:!?]<\/span>/g) || []).length >= 2, f);
  }
});

test('7. "(NN h)" usa espaço sem quebra', () => {
  for (const f of HOMES) {
    const h = ler(f);
    assert.doesNotMatch(h, /\(\d+ h\)/, f);
    assert.match(h, /\(28&nbsp;h\)/, f);
    assert.match(h, /\(40&nbsp;h\)/, f);
  }
});
