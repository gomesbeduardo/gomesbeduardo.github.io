#!/usr/bin/env node
// Coleta os números do GitHub (spec 002) e grava src/data/github.json.
//
// Uso:
//   node scripts/github/coletar.mjs                      # coleta real; lê GH_TOKEN_LEITURA do ambiente
//   node scripts/github/coletar.mjs --estrito            # falha (código 1) em qualquer erro; usado no run agendado
//   node scripts/github/coletar.mjs --fixture <arquivo>  # sem rede; grava dados de amostra (amostra: true)
//   opções: --saida <arquivo> (padrão src/data/github.json), --agora <ISO>, --usuario <login>
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { executar, USUARIO_PADRAO } from './lib.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function lerArgs(argv) {
  const opcoes = { saida: resolve(raiz, 'src/data/github.json'), usuario: USUARIO_PADRAO, estrito: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const valor = () => { const v = argv[++i]; if (v === undefined) throw new Error(`faltou valor para ${a}`); return v; };
    if (a === '--fixture') opcoes.fixture = resolve(valor());
    else if (a === '--saida') opcoes.saida = resolve(valor());
    else if (a === '--agora') opcoes.agora = valor();
    else if (a === '--usuario') opcoes.usuario = valor();
    else if (a === '--estrito') opcoes.estrito = true;
    else throw new Error(`opcao desconhecida: ${a}`);
  }
  return opcoes;
}

const codigo = await executar(lerArgs(process.argv.slice(2)));
process.exit(codigo);
