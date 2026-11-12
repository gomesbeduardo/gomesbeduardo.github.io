# Spec 008: números do processo no modal do rodapé

Estado: aprovada pelo responsável em 12/11/2026, com P1 a P7 respondidas (P1 a P4 em 11/11/2026, P5 a P7 em 12/11/2026). Implementação depois da etapa 1 da spec 001.

## Pedido literal

> Seria legal colocar uma contagem de tokens ou uso de IA na página, o que me diz?

Depois da conversa (a contagem de tokens mede gasto, não qualidade, e envelhece), o responsável fechou o pedido assim:

> Pode escrever a spec 008 da linha no modal sendo puxada automaticamente quando se abre a página.

## Problema

O modal "Como este site foi feito" (`<dialog class="modal" id="sobre-site">`, aberto pelo botão `#claude-btn` "Feito com o Claude Code") descreve o processo com agentes só em texto, sem nenhum número: specs aprovadas, PRs revisados, achados corrigidos antes do merge. O responsável quer uma linha com esses números, atualizada sozinha a cada publicação do site, sem ninguém editar o HTML.

## Fatos

- F1. Esta spec é implementada depois da etapa 1 da spec 001 (migração para Astro, aprovada em `staging`) estar mesclada, direto no Astro, sem passar por `site/` (spec 001, linha 40, decisão do responsável em 11/11/2026). Depois da etapa 1: páginas em `src/pages/index.astro` (PT) e `src/pages/en/index.astro` (EN), layout `src/layouts/Base.astro`, um componente por seção em `src/components/` (o modal é `ModalSobreSite`), textos em `src/i18n/pt.ts` e `src/i18n/en.ts` (mesmas chaves; o componente recebe `lang`). Os scripts do cliente ficam em `public/` (`rodape.js` é o que abre o modal, pelos ids `#claude-btn` e `#sobre-site`, que não mudam), byte a byte iguais aos de `site/`; `public/dados/` é desta spec. `astro build` gera `dist/`. A etapa 3 (spec 001c) move os scripts para módulos em `src/scripts/`; o código desta spec acompanha o `rodape` onde ele estiver.
- F2. `.github/workflows/ci.yml` roda em cada pull request: `npm run build`, `npm run e2e` e `node --test 'scripts/**/*.test.mjs'` (001a R10, regra do CI de PR). Na etapa 1, `package.json` ganha `"test": "astro build && node --test 'scripts/**/*.test.mjs'"`. Hoje em `staging`, antes do Astro, a saída do `node --test` termina com "ℹ tests 137 / ℹ pass 136 / ℹ fail 0"; muda com a etapa 1 e o worker confere. Node 24.
- F3. Os scripts de aceite no navegador (`scripts/site/*.e2e.mjs`, Playwright) rodam contra `dist/`. Regra da 001a para teste novo: "HTML lê `dist/`; CSS por regex vira e2e; JS lê `public/`".
- F4. Os workflows de CI e deploy são área sensível do projeto (001 R3, 001a R10): só a sessão principal edita, com o ok do responsável. O `worker` não toca `.github/workflows/`; ele escreve no PR o diff de workflow proposto.
- F5. Repositório público `github.com/gomesbeduardo/gomesbeduardo.github.io`. Fluxo: PR de feature entra em `staging`; `staging` entra em `main` por um PR próprio. Hoje existem os PRs #1 a #27, todos mesclados (27); os de integração `staging` para `main` são o #6 e o #25.
- F6. Os rótulos `revisado-por-opus` e `revisado-por-fable` marcam PR revisado por agente; `revisado-por-humano` é do responsável.
- F7. Specs em `docs/specs/`. Em `staging` hoje: 000, 001, 001a a 001d, 002, 002b, 003 (rascunho em `staging`; o PR desta spec muda a linha de estado dela para aprovada) e 004 a 007. O nome pode ter letra depois dos dígitos (`001a-paridade.md`). A linha de estado varia: `Estado: aprovada pelo responsável em ...` (005), `**Status:** aprovada ...` (002), `Estado: registro retroativo, aprovado pelo responsável em 11/11/2026.` (000).
- F8. No corpo dos PRs mesclados, a seção de revisão tem a linha `- PR reviewer (Opus): **aprovado com ajustes**` (ou `(Fable)`) e uma tabela markdown com um de dois cabeçalhos: `| Gravidade | Eixo | Arquivo:linha | Problema | O que foi feito |` (#1, #2, #5, #21, #23, #24) ou `| # | Gravidade | Eixo | Arquivo:linha | Problema | O que foi feito |` (#13, #14, #16). A grafia da gravidade varia (Média, médio). A célula "O que foi feito" traz "Corrigido em `<sha>`" (#1, #5, #13, #14, #16), "Recomendação" (#1, #2) ou, nos PRs #21, #23 e #24, a correção descrita sem a palavra "Corrigido" (exemplo em A15). O #5 tem uma linha "baixo" corrigida. O #2 tem uma segunda tabela, de larguras, sem relação com a revisão. PR só de doc traz `PR reviewer: **dispensado**` e nenhuma tabela.
- F9. O CI lê os PRs do próprio repositório com o `secrets.GITHUB_TOKEN` padrão do Actions (permissões `contents: read` e `pull-requests: read` no job que o usa).
- F10. Regra de privacidade do projeto: nenhum dado pessoal em arquivo versionado.
- F11. Deploy: a partir do PR da etapa 1, `pages.yml` fica só com `workflow_dispatch` e `.github/workflows/publicar.yml` roda em `push` para `main`, `workflow_dispatch` e `schedule` semanal (segunda, 06:00 UTC) (001a R10). Jobs: `testes` (`node --test 'scripts/**/*.test.mjs'`; depois da etapa 1, `npm test`), `coletar` (gera `github.json` e sobe o artefato `github-json`), `build` (baixa `github-json`, roda `node scripts/curriculo/gerar.mjs`, `npm ci`, `npm run build` e sobe `dist`), `deploy`. `permissions: contents: read` no topo. Pela 001a R5 e C7, o gerador desta spec grava `public/dados/processo.json` antes do `astro build`, o Astro só copia o arquivo para `dist/dados/`, e sem ele o build passa e `dist/dados/` não existe.
- F12. A 001 R1 (contrato da paridade) diz que a linha desta spec no modal "Feito com o Claude Code" faz parte do contrato a partir do PR dela, coberta por e2e.

## Decisões do responsável (11/11/2026)

- D1. Fonte dos números: um JSON gerado pelo CI a cada deploy, gravado em `public/dados/processo.json` e publicado com o site em `/dados/processo.json`. A página busca esse arquivo ao abrir. Nenhuma chamada à API do GitHub a partir do navegador.
- D2. Os números: specs aprovadas, PRs mesclados, testes automatizados, revisões de agente e achados de revisão corrigidos antes do merge. O responsável escolheu contar os achados a partir do corpo dos PRs, ciente de que o formato pode mudar; por isso a regra de contagem abaixo é exata, tem teste, e diz o que acontece quando um corpo não segue o formato.
- D3. Contagem de tokens fica fora.

## Comportamento

### O arquivo `public/dados/processo.json`

- C1. O arquivo é um objeto JSON com esta forma, e só ela:

```json
{
  "versao": 1,
  "coletadoEm": "2026-11-11T17:42:08Z",
  "commit": "e09b2c7",
  "numeros": {
    "specsAprovadas": 4,
    "prsMesclados": 9,
    "testesAutomatizados": 96,
    "revisoesDeAgente": 5,
    "achadosCorrigidos": 7
  }
}
```

  - `versao`: inteiro, sempre `1` nesta spec. Muda quando a forma mudar.
  - `coletadoEm`: data e hora da coleta em UTC, ISO 8601 com segundos e `Z`.
  - `commit`: os 7 primeiros caracteres do SHA do commit de `main` publicado.
  - `numeros`: as cinco chaves acima, cada uma inteiro maior ou igual a zero, ou `null` quando aquela contagem falhou (C14).
  - Nenhum outro campo. Nenhum nome, e-mail, título de PR ou texto de corpo (F10).
- C2. O arquivo não é versionado: `.gitignore` ganha a linha `public/dados/processo.json`, e o arquivo só existe no `public/` do job de deploy e no artefato publicado (`dist/dados/processo.json`, cópia feita pelo Astro, F11). Em `dev` e em build local sem o arquivo, a página se comporta como em C17.

### Regras de contagem

Todas as contagens olham o repositório no momento do deploy: o checkout de `main` para specs, a saída dos testes do mesmo workflow para `testesAutomatizados` (C6, C12), e a lista de PRs do repositório pela API REST do GitHub (`GET /repos/{owner}/{repo}/pulls?state=closed&per_page=100`, com paginação até o fim) para o resto.

- C3. Conjunto base de PRs ("PRs contados"): os PRs com `merged_at` preenchido, excluindo os que têm `head.ref` igual a `staging` ou `main` (PRs de integração, como o #6 e o #25). PR fechado sem merge não entra. (P1 respondida: os PRs de integração não contam.)
- C4. `specsAprovadas`: número de arquivos em `docs/specs/` cujo nome casa com `^\d{3}[a-z]?-.+\.md$` (`000-portfolio.md`, `001a-paridade.md` e `002b-calendario.md` casam; `README.md` não) em que a primeira das 10 primeiras linhas que, sem o `**` de negrito e sem espaços nas pontas, começa com `Estado:` ou `Status:` (sem distinguir maiúsculas) contém `aprovad` e não contém `rascunho` (as duas sem distinguir maiúsculas). Só essa primeira linha de estado decide. Exemplos: a 000 ("Estado: registro retroativo, aprovado pelo responsável em 11/11/2026.") conta; a 008 antes da aprovação ("Estado: rascunho com P1 a P7 respondidas ...") não contava, porque continha "rascunho"; arquivo sem linha de estado nas 10 primeiras linhas não conta. (P2 e P6 respondidas. Na P2 o responsável aprovou a 003, já implementada; a linha de estado dela muda no PR desta spec.)
- C5. `prsMesclados`: tamanho do conjunto de C3.
- C6. `testesAutomatizados`: o número N da linha `tests N` que o reporter padrão do `node --test 'scripts/**/*.test.mjs'` imprime no resumo. O gerador não roda os testes: lê a saída completa do reporter gravada em arquivo pelo job `testes` do mesmo workflow (depois da etapa 1, a execução do `npm test`) e recebida pela opção `--testes <arquivo>` (C11, C12; P7 respondida). Os scripts `*.e2e.mjs` não entram: dependem de navegador e rodam em outro passo (F3). Se o arquivo não existe, não tem a linha `tests N` ou tem `fail` maior que zero, o campo fica `null` (C14).
- C7. `revisoesDeAgente`: soma, sobre os PRs contados (C3), de 1 para cada rótulo `revisado-por-opus` e 1 para cada rótulo `revisado-por-fable` presente no PR. PR com os dois rótulos soma 2 (foi revisado duas vezes). O rótulo `revisado-por-humano` não entra.
- C8. `achadosCorrigidos`: soma, sobre os PRs contados (C3), das linhas de tabela do corpo do PR que satisfazem tudo isto:
  1. Pertencem a uma tabela markdown cujo cabeçalho (primeira linha começando com `|`) tem, entre as células aparadas e sem distinguir maiúsculas, uma célula `Gravidade` e uma célula `O que foi feito`. Uma coluna `#` antes de `Gravidade` é aceita e ignorada; qualquer outra ordem de colunas também, porque o índice da coluna vem do cabeçalho.
  2. A linha seguinte ao cabeçalho é o separador (células só de `-` e `:`); ela não conta.
  3. A linha de dado começa com `|`, e o número de células é igual ao do cabeçalho. As células são o texto entre os `|`, aparado. Um `|` dentro de crase também separa célula; a linha fica com células a mais e cai em C9.
  4. A célula da coluna "O que foi feito", aparada, não está vazia, não é só `-` nem só o travessão (U+2014), e não começa com `Recomenda` (sem distinguir maiúsculas; cobre "Recomendação" e "Recomendado"). A palavra "Corrigido" não é exigida. (P5 respondida.)
  A gravidade não entra na regra: linha `baixo` com correção descrita conta, porque o número mede quanto foi corrigido antes do merge. Razão da regra: o processo corrige todo achado crítico, alto ou médio e transforma o baixo em recomendação, então linha que não é recomendação é correção, com ou sem a palavra "Corrigido" (F8, PRs #21, #23 e #24). A tabela termina na primeira linha que não começa com `|`. Tabela sem as duas colunas, como a de larguras do PR #2, não entra.
- C9. Corpo que não segue o formato não é erro: corpo vazio, corpo com `PR reviewer: **dispensado**`, corpo sem tabela ou com tabela sem as duas colunas contribui 0. Linha de dado com número de células diferente do cabeçalho é ignorada, e o gerador imprime uma linha de aviso no log do deploy com o número do PR e o texto da linha. O gerador nunca falha por causa do corpo de um PR.
- C10. Conta de hoje (12/11/2026), conferida pela sessão principal na API do GitHub e nos arquivos de `origin/staging`: PRs contados 25 (27 mesclados menos #6 e #25). `revisoesDeAgente` 10 (`revisado-por-opus` em #1, #2, #11, #13, #14, #16, #21, #23 e #24; `revisado-por-fable` em #5). `achadosCorrigidos`, pela regra de P5, 18: #1 1, #5 4, #13 2, #14 2, #16 3, #21 2, #23 3, #24 1; os demais 0 (o #2 tem 2 "Recomendação"; PRs de doc são "dispensado"); pela regra antiga, que exigia "Corrigido", seriam 12. `specsAprovadas`, pela regra de P6, 12 em `staging` (000, 001, 001a a 001d, 002, 002b, 004 a 007); 13 com a 003 (aprovada pelo PR desta spec); 14 quando a 008 for aprovada. `testesAutomatizados` 137 hoje, antes do Astro. PRs contados e testes o worker confere no repositório antes de fixar o teste da conta.

### Onde e quando o JSON é gerado

- C11. O gerador é um script Node em `scripts/processo/gerar.mjs` (nome sugerido; o responsável pode renomear), sem dependência fora do Node 24 (`fetch` nativo), com as funções de contagem separadas da leitura de API e de arquivo, para que os testes rodem sobre textos e objetos de exemplo. Opções: `--saida <caminho>` (padrão `public/dados/processo.json`) e `--testes <arquivo>` (saída do reporter, C6). Lê as variáveis de ambiente `GITHUB_TOKEN`, `GITHUB_REPOSITORY` e `GITHUB_SHA`, que o Actions já fornece. Cria a pasta de saída se não existir.
- C12. O gerador roda em `.github/workflows/publicar.yml` (F11): o job `testes` grava a saída completa do reporter da execução que já condiciona o deploy em um arquivo e o sobe como artefato (mesmo padrão do `github-json`); o job `build` baixa esse artefato e, antes do `npm run build`, roda o gerador com `--testes <arquivo>` e `--saida public/dados/processo.json`. Os testes rodam uma vez por workflow. O job `build` ganha `permissions` de `contents: read` e `pull-requests: read`, e o gerador usa `secrets.GITHUB_TOKEN` (não `GH_TOKEN_LEITURA`). A mudança no workflow é da sessão principal, com o ok do responsável (F4); o worker entrega script e testes e escreve no PR o trecho proposto. O gatilho já cobre merge só de spec ou de script (P4; 001a R10).
- C13. O CI de PR (`ci.yml`) já roda `scripts/**/*.test.mjs`, então os testes unitários do gerador (A1 a A8 e A15 a A18) passam em todo PR. O CI de PR não chama a API do GitHub nem gera o JSON.
- C14. Falha parcial: se a chamada à API falha (rede, limite de uso, resposta não 200) ou o arquivo de `--testes` não serve (C6), as contagens daquela fonte ficam `null` e o gerador grava o arquivo com as demais. Falha total (não grava o arquivo): o gerador sai com código diferente de zero e o passo no workflow tem `continue-on-error: true`, para o site publicar sem o JSON (suposição desta spec: publicar vale mais que a linha; a sessão principal confirma ao editar o workflow). Sem o arquivo, o build passa e `dist/dados/` não existe (F11).

### A linha no modal

- C15. Lugar: no componente `src/components/ModalSobreSite` (renderizado em PT e EN conforme `lang`), um parágrafo logo antes do link final "Ver as specs e os PRs no GitHub" ("See the specs and PRs on GitHub"). O parágrafo existe no HTML gerado com o atributo `hidden` e um `id` fixo; `public/rodape.js` (o mesmo script que abre o modal, F1) busca o JSON, preenche o texto e tira o `hidden`. É texto comum dentro do `<dialog>`: sem `aria-live`, sem região própria. A data vai num `<time datetime="...">` com o valor de `coletadoEm`. Textos: os fragmentos da frase (prefixo com a data, singular e plural de cada número, a conjunção "e"/"and") ficam em `src/i18n/pt.ts` e `src/i18n/en.ts`, com as mesmas chaves, e chegam ao script por atributos do parágrafo preenchidos pelo componente: `data-locale` (`pt-BR` ou `en-US`) e `data-textos` (o objeto de fragmentos em JSON). `rodape.js` não tem texto de idioma embutido. Decisão desta spec, de baixo impacto: o worker pode renomear atributos e chaves, desde que o script não carregue texto.
- C16. Texto, com os números de C1 como exemplo:
  - PT: "Números do processo, coletados em 11/11/2026: 4 specs aprovadas, 9 PRs mesclados, 96 testes automatizados, 5 revisões de agente e 7 achados de revisão corrigidos antes do merge."
  - EN: "Process numbers, collected on Nov 11, 2026: 4 approved specs, 9 merged PRs, 96 automated tests, 5 agent reviews and 7 review findings fixed before merge."
  - Número formatado com `Intl.NumberFormat` (`pt-BR` na página PT, `en-US` na EN); data com `Intl.DateTimeFormat` no fuso `America/Sao_Paulo`, formato `dd/mm/aaaa` em PT e `Mon d, yyyy` em EN.
  - Valor 1 usa o singular ("1 spec aprovada", "1 PR mesclado", "1 teste automatizado", "1 revisão de agente", "1 achado de revisão corrigido"; EN "1 approved spec", "1 merged PR", "1 automated test", "1 agent review", "1 review finding fixed"). Zero usa o plural.
  - Campo `null` em `numeros`: o trecho daquele número sai da frase e os outros se ligam por vírgula, com "e" ("and") antes do último. Se os cinco são `null`, vale C17.
- C17. Falha: resposta não 200, corpo que não é JSON, `versao` diferente de 1, `numeros` ausente ou que não é objeto, ou erro de rede: o parágrafo continua `hidden`, nada é escrito no console (nem `console.error`, nem `console.warn`) e não há nova tentativa. Nada muda de lugar na página, porque o parágrafo oculto não ocupa espaço.
- C18. Momento: a busca começa no carregamento da página (`fetch('/dados/processo.json')` relativo à raiz do site, com `cache: 'no-cache'`); abrir o modal não dispara busca nenhuma. Se o modal abre antes da resposta, o parágrafo fica oculto até a resposta chegar e então aparece; não há texto de carregamento (P3 respondida).
- C19. A página EN usa o mesmo arquivo, no mesmo caminho absoluto `/dados/processo.json`.

## Critérios de aceite

Testes unitários em `scripts/`, no padrão `*.test.mjs` já coberto pelo CI; aceite no navegador em `scripts/site/*.e2e.mjs`, depois de `astro build`, com um servidor estático local servindo `dist/` e um JSON de exemplo copiado para `dist/dados/processo.json` só durante o teste (F3).

- A1. Dado o corpo de um PR no formato de cinco colunas (F8, como o #5) com 4 linhas "Corrigido" (uma delas `baixo`) e 1 linha "Recomendação", quando se conta C8, então o resultado é 4 (unitário, liga C8).
- A2. Dado o corpo no formato de seis colunas com `#` (como o #13), com "Corrigido em `62388ca`" no meio da célula, quando se conta C8, então o resultado é 2 (unitário, C8).
- A3. Dado o corpo com `PR reviewer: **dispensado**` e sem tabela, e dado um corpo vazio, então C8 devolve 0 e nenhum erro (unitário, C9).
- A4. Dado um corpo com uma tabela cujo cabeçalho não tem "O que foi feito", e outra tabela válida com 1 linha "Corrigido" e 1 linha com uma célula a mais (um `|` dentro de crase), então o resultado é 1 e o aviso cita o PR e a linha ignorada (unitário, C8 e C9).
- A5. Dada uma lista de PRs de exemplo com: um mesclado com `head.ref` `feat/x` e rótulos `revisado-por-opus` e `revisado-por-fable`; um mesclado com `head.ref` `staging`; um fechado sem merge com `revisado-por-opus`; um mesclado com `revisado-por-humano` só; então `prsMesclados` é 2 e `revisoesDeAgente` é 2 (unitário, C3, C5, C7).
- A6. Dada uma pasta de exemplo com `000-portfolio.md` ("Estado: registro retroativo, aprovado pelo responsável em 11/11/2026."), `001a-paridade.md` ("Estado: aprovada pelo responsável em 11/11/2026."), `002-x.md` ("**Status:** aprovada em 11/11/2026"), `008-x.md` ("Estado: rascunho com P1 a P7 respondidas pelo responsável; falta a aprovação do texto."), `009-x.md` ("Estado: rascunho, aprovado em parte"), `010-x.md` com "Estado: aprovada" só na linha 12 e `README.md` com "aprovada" na linha 1, então `specsAprovadas` é 3 (000, 001a e 002; unitário, C4).
- A7. Dada a saída do reporter com `ℹ tests 96` e `ℹ fail 0`, então C6 devolve 96; com `ℹ fail 1`, devolve `null`; sem a linha, devolve `null` (unitário, C6 e C14).
- A8. Dado o gerador com a API respondendo 500, então o arquivo é gravado no caminho de `--saida` com `prsMesclados`, `revisoesDeAgente` e `achadosCorrigidos` em `null`, os outros campos preenchidos, `versao` 1 e `coletadoEm` em ISO com `Z` (unitário, com `fetch` substituído, C1, C11 e C14).
- A9. Dado `dist/dados/processo.json` com os valores de C1, quando a página PT carrega e o modal abre, então o parágrafo antes do link do GitHub está visível com o texto exato de C16 em PT, e o `<time>` tem `datetime` igual a `coletadoEm`; o mesmo em EN com o texto EN (Playwright, C15, C16, C18, C19).
- A10. Dado o JSON com `testesAutomatizados: null` e `specsAprovadas: 1`, então a frase PT começa com "1 spec aprovada, 9 PRs mesclados, 5 revisões de agente e 7 achados de revisão corrigidos antes do merge." sem o trecho dos testes (Playwright, C16).
- A11. Dado `dist/` sem `dados/processo.json` (resposta 404) e, em outro caso, com um arquivo que não é JSON, quando a página carrega e o modal abre, então o parágrafo continua com `hidden` e o console não recebe nenhuma mensagem de erro ou aviso (Playwright, C17).
- A12. Dado o site em 390 px e 1280 px, nos dois temas, quando a página carrega com e sem o JSON, então a posição do rodapé e do botão `#claude-btn` é a mesma nos dois casos, e com o modal aberto nada passa da largura da tela (Playwright e print, C17).
- A13. Dado o repositório depois de `astro build`, então `.gitignore` contém a linha `public/dados/processo.json`, e `dist/index.html` e `dist/en/index.html` têm o parágrafo com `hidden`, com os atributos `data-locale` e `data-textos` de C15, imediatamente antes do link do GitHub no `#sobre-site` (teste estático, C2 e C15).
- A14. Dado o checkout de `main` com `secrets.GITHUB_TOKEN`, quando `publicar.yml` roda com o gerador no job `build`, então o arquivo publicado em `https://gomesbeduardo.github.io/dados/processo.json` tem a forma de C1 e os valores batem com a conta de C10 refeita à mão no mesmo dia (conferência da sessão principal depois do primeiro deploy, C12).
- A15. Dado o corpo de um PR no formato de cinco colunas (como o #24) com 1 linha cuja célula "O que foi feito" é "A5 em PT e EN; 1101 px na checagem de 861 a 1280." (sem "Corrigido" e sem "Recomendação"), então C8 devolve 1 (unitário, C8).
- A16. Dada uma tabela válida com 3 linhas cujas células "O que foi feito" são "Corrigido em `abc1234`.", "Recomendação" e "-", então C8 devolve 1 (unitário, C8).
- A17. Dado um corpo com uma tabela `| Largura | Antes (site no ar) | Depois (esta branch) |` com 3 linhas de dado e uma tabela de revisão válida com 2 linhas "Recomendação" (como o PR #2), então C8 devolve 0 (unitário, C8 e C9).
- A18. Dado o gerador rodando com `--testes` apontando para um arquivo que não existe e a API respondendo com a lista de A5, então o arquivo gravado tem `testesAutomatizados: null` e os outros quatro números preenchidos (unitário, com `fetch` substituído, C6, C11 e C14).

## Fora do escopo

- Contagem de tokens, custo ou tempo de uso de IA (D3).
- Chamada à API do GitHub a partir do navegador, ou token no cliente.
- `site/` e `pages.yml`: esta spec entra depois da etapa 1 da spec 001 mesclada e não toca nenhum dos dois (F1).
- Contar os scripts `*.e2e.mjs` ou os testes do PDF.
- Outras métricas (commits, linhas, issues) e qualquer gráfico.
- Mostrar os números fora do modal.
- Mudar o restante do texto do modal.

## Perguntas respondidas

Respondidas em 11/11/2026:

- P1. Os PRs de integração `staging` para `main` (como o #6) contam em `prsMesclados`? Exemplo: contar o #6 soma 1 sem mudança de produto por trás. Resposta do responsável, igual à recomendação: não contar (C3), porque esses PRs só repetem o que os PRs de feature já contaram.
- P2. Spec em rascunho conta em `specsAprovadas`? Exemplo: a 002 (rascunho na época) entraria e o número passaria de 4 para 5. Resposta do responsável, igual à recomendação: não contar, porque o nome do número diz "aprovadas" e um rascunho pode nunca ser aprovado.
- P3. O que a linha mostra enquanto o JSON não chegou e o modal já está aberto? Exemplo: conexão lenta, clique em menos de 1 s. Resposta do responsável, igual à recomendação: nada (fica oculta e aparece ao chegar, C18); um texto "carregando" criaria um estado a mais para testar.
- P4. O deploy antigo (`pages.yml`) só rodava quando um push em `main` tocava `site/**`; um merge só de spec ou de script não refazia o JSON. Exemplo: a 007 mesclada sem tocar `site/` só apareceria no número quando outro PR mudasse o site. Resposta do responsável, igual à recomendação: o gatilho passa a cobrir spec e script. A 001a R10 já cobre (`publicar.yml` roda em todo `push` para `main`), então C12 não muda gatilho. A data na linha (C16) deixa qualquer defasagem visível.

Respondidas em 12/11/2026:

- P5. Linha de revisão que descreve a correção sem a palavra "Corrigido" conta em `achadosCorrigidos`? Exemplo: no PR #24 a célula é "A5 em PT e EN; 1101 px na checagem de 861 a 1280. ..."; pela regra antiga o PR contava 0 e o total de hoje seria 12 em vez de 18. Resposta do responsável, igual à recomendação: conta toda linha cuja célula "O que foi feito", aparada, não está vazia, não é só `-` ou travessão e não começa com "Recomenda" (C8 item 4), porque o processo corrige todo achado crítico, alto ou médio e transforma o baixo em recomendação.
- P6. Quais arquivos e linhas de estado contam em `specsAprovadas`? Exemplo: `001a-paridade.md` tem letra no nome; a 000 diz "Estado: registro retroativo, aprovado pelo responsável em 11/11/2026."; pela regra antiga nenhuma das duas contava. Resposta do responsável, igual à recomendação: nome `^\d{3}[a-z]?-.+\.md$`; conta quando a primeira linha de estado (`Estado:` ou `Status:`, nas 10 primeiras linhas, sem `**`) contém `aprovad` e não contém `rascunho` (C4).
- P7. De onde o gerador tira `testesAutomatizados` em `publicar.yml`, se os testes já rodam no job `testes`? Exemplo: rodar `node --test` de novo no job `build` dobraria o tempo e, depois da etapa 1, exigiria dois `astro build`. Resposta do responsável, igual à recomendação: o job `testes` grava a saída do reporter em arquivo e sobe como artefato, como o `github-json`; o job `build` baixa e roda o gerador com `--testes <arquivo>` e `--saida public/dados/processo.json` antes do `npm run build`. Os testes rodam uma vez por workflow; arquivo ausente, sem `tests N` ou com `fail` maior que zero dá `null` (C6, C12, C14).
