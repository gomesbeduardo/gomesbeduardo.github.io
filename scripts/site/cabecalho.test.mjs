// Testes do cabeçalho (site/main.js + site/*.css): as classes de estado do `.top` não podem colidir
// com seletores de outros componentes (ex.: `.bar` das linguagens do GitHub cortava o botão de tema).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');
const fonte = (n) => readFileSync(join(site, n), 'utf8');

const classesDoEstado = [...new Set(
  [...fonte('main.js').matchAll(/top\.classList\.toggle\('([\w-]+)'/g)].map((m) => m[1]),
)];

const seletores = (css) =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{/g)]
    .map((m) => m[1].trim())
    .filter((s) => !s.startsWith('@'))
    .flatMap((s) => s.split(','))
    .map((s) => s.trim());

test('o cabeçalho alterna classes de estado', () => {
  assert.ok(classesDoEstado.length > 0);
});

for (const css of readdirSync(site).filter((f) => f.endsWith('.css'))) {
  for (const nome of classesDoEstado) {
    test(`${css}: .${nome} só aparece escopada ao .top`, () => {
      const solto = seletores(fonte(css)).filter((s) => {
        const re = new RegExp(`\\.${nome}(?![\\w-])`);
        return re.test(s) && !new RegExp(`\\.top[^\\s>+~]*\\.${nome}(?![\\w-])|\\.top\\b.*\\.${nome}(?![\\w-])`).test(s);
      });
      assert.deepEqual(solto, [], `seletor sem .top colide com a classe de estado do cabeçalho: ${solto.join(' | ')}`);
    });
  }
}
