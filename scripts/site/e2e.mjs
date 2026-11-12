// Roda a paridade e depois cada *.e2e.mjs contra dist/, parando no primeiro que falhar.
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const aqui = fileURLToPath(new URL('./', import.meta.url));
if (!existsSync(`${raiz}dist/index.html`)) {
  console.error('dist/ não existe: rode o build do Astro (npm run build) antes de npm run e2e.');
  process.exit(1);
}
const outros = readdirSync(aqui).filter((f) => f.endsWith('.e2e.mjs') && f !== 'e2e.mjs' && f !== 'paridade.e2e.mjs').sort();
for (const f of ['paridade.e2e.mjs', ...outros]) {
  console.log(`\n== ${f}`);
  const r = spawnSync(process.execPath, [`${aqui}${f}`, '--raiz', 'dist'], { stdio: 'inherit', cwd: raiz });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
