# Spec 008: números do processo no modal do rodapé

Estado: rascunho com P1 a P4 respondidas pelo responsável em 11/11/2026; falta a aprovação do texto.

## Pedido literal

> Seria legal colocar uma contagem de tokens ou uso de IA na página, o que me diz?

Depois da conversa (a contagem de tokens mede gasto, não qualidade, e envelhece), o responsável fechou o pedido assim:

> Pode escrever a spec 008 da linha no modal sendo puxada automaticamente quando se abre a página.

## Problema

O modal "Como este site foi feito" (`<dialog class="modal" id="sobre-site">`, aberto pelo botão `#claude-btn` "Feito com o Claude Code") descreve o processo de trabalho com agentes, mas só com texto. Não há nenhum número que mostre o processo em uso: quantas specs foram aprovadas, quantos PRs passaram pela revisão, quantos achados foram corrigidos antes do merge. O responsável quer uma linha com esses números, atualizada sozinha a cada publicação do site, sem ninguém editar o HTML.

## Fatos

- F1. O site é HTML, CSS e JavaScript sem framework, em `site/` (PT em `site/index.html`, EN em `site/en/index.html`). O workflow `.github/workflows/pages.yml` publica `site/` como está, sem passo de build, a cada push em `main` que toca `site/**`.
- F2. O workflow `.github/workflows/ci.yml` roda em cada pull request: `node --test 'scripts/**/*.test.mjs'` (hoje a saída termina com "ℹ tests 96 / ℹ pass 96 / ℹ fail 0 / ℹ skipped 0") e o gerador do PDF do currículo. Node 24.
- F3. Os scripts de aceite no navegador (`scripts/site/*.e2e.mjs`, Playwright) rodam fora do CI.
- F4. Os workflows de CI e deploy são área sensível do projeto: só a sessão principal edita, com o ok do responsável. O `worker` não toca `.github/workflows/`.
- F5. Repositório público `github.com/gomesbeduardo/gomesbeduardo.github.io`. Fluxo: PR de feature entra em `staging`; `staging` entra em `main` por um PR próprio (por exemplo o PR #6, "staging" para `main`). Hoje existem os PRs #1 a #14; vários mesclados.
- F6. Os rótulos `revisado-por-opus` e `revisado-por-fable` marcam PR revisado por agente; `revisado-por-humano` é do responsável.
- F7. As specs ficam em `docs/specs/NNN-nome.md`. Em `staging` hoje: 002 a 006, mais a 007 no PR #12 (aberto). A 002 é rascunho nunca aprovado. A linha de estado varia: `Estado: aprovada pelo responsável em ...` (005, 006) ou `**Status:** rascunho ...` (002).
- F8. No corpo dos PRs mesclados, a seção de revisão tem a linha `- PR reviewer (Opus): **aprovado com ajustes**` (ou `(Fable)`) seguida de uma tabela em markdown. Há dois cabeçalhos: `| Gravidade | Eixo | Arquivo:linha | Problema | O que foi feito |` (PRs #1, #2, #5) e `| # | Gravidade | Eixo | Arquivo:linha | Problema | O que foi feito |` (PRs #13, #14). A gravidade aparece em minúscula ou com inicial maiúscula (crítico/Crítico, alto, médio/Médio, baixo). A coluna "O que foi feito" traz textos como "Corrigido em `21efe0e`: ...", "Corrigido em `site/tema.js`, com o teste ...", "Recomendação", e, nos PRs #13 e #14, texto livre com "Corrigido em `abc1234`" no meio da frase. O PR #5 tem uma linha "baixo" também corrigida. PR só de doc traz `PR reviewer: **dispensado**` e nenhuma tabela.
- F9. O CI lê os PRs do próprio repositório com o `GITHUB_TOKEN` padrão (permissões `contents: read` e `pull-requests: read`).
- F10. Regra de privacidade do projeto: nenhum dado pessoal em arquivo versionado.
- F11. A migração para Astro (spec 001, ainda não escrita; `.github/workflows/publicar.yml` deve assumir o deploy) está prevista. O JSON desta spec precisa ser legível por qualquer gerador, no build ou no navegador.

## Decisões do responsável (11/11/2026)

- D1. Fonte dos números: um JSON gerado pelo CI a cada deploy, publicado junto com o site em `site/dados/processo.json`. A página busca esse arquivo ao abrir. Nenhuma chamada à API do GitHub a partir do navegador.
- D2. Os números: specs aprovadas, PRs mesclados, testes automatizados, revisões de agente e achados de revisão corrigidos antes do merge. O responsável escolheu contar os achados a partir do corpo dos PRs, ciente de que o formato pode mudar; por isso a regra de contagem abaixo é exata, tem teste, e diz o que acontece quando um corpo não segue o formato.
- D3. Contagem de tokens fica fora.

## Comportamento

### O arquivo `site/dados/processo.json`

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
- C2. O arquivo não é versionado: entra no `.gitignore` e só existe no artefato publicado. Localmente, sem o arquivo, a página se comporta como em C17.

### Regras de contagem

Todas as contagens olham o repositório no momento do deploy: o checkout de `main` para specs e testes, e a lista de PRs do repositório pela API REST do GitHub (`GET /repos/{owner}/{repo}/pulls?state=closed&per_page=100`, com paginação até o fim) para o resto.

- C3. Conjunto base de PRs ("PRs contados"): os PRs com `merged_at` preenchido, excluindo os que têm `head.ref` igual a `staging` ou `main` (PRs de integração, como o #6). PR fechado sem merge não entra. (P1 respondida: os PRs de integração não contam.)
- C4. `specsAprovadas`: número de arquivos `docs/specs/NNN-*.md` (NNN com três dígitos) em que alguma das 10 primeiras linhas, sem o `**` de negrito e sem espaços nas pontas, começa com `Estado: aprovada` ou `Status: aprovada`, sem distinguir maiúsculas. Arquivo sem essa linha (rascunho, como a 002) não conta. `README.md` e outros arquivos sem o prefixo numérico não contam. (P2 respondida: rascunho não conta. Na mesma decisão o responsável aprovou a 003, que estava como rascunho no arquivo e já foi implementada; a linha de estado dela muda no mesmo PR desta spec.)
- C5. `prsMesclados`: tamanho do conjunto de C3.
- C6. `testesAutomatizados`: o número N da linha `tests N` que o reporter padrão do `node --test 'scripts/**/*.test.mjs'` imprime no resumo, rodado no checkout de `main` durante o deploy (hoje 96). Os scripts `*.e2e.mjs` não entram: rodam fora do CI e dependem de navegador (F3), então a contagem não seria reproduzível no deploy. Se a execução termina com `fail` maior que zero ou sem a linha `tests N`, o campo fica `null` (C14).
- C7. `revisoesDeAgente`: soma, sobre os PRs contados (C3), de 1 para cada rótulo `revisado-por-opus` e 1 para cada rótulo `revisado-por-fable` presente no PR. PR com os dois rótulos soma 2 (foi revisado duas vezes). O rótulo `revisado-por-humano` não entra.
- C8. `achadosCorrigidos`: soma, sobre os PRs contados (C3), das linhas de tabela do corpo do PR que satisfazem tudo isto:
  1. Pertencem a uma tabela markdown cujo cabeçalho (primeira linha começando com `|`) tem, entre as células aparadas e sem distinguir maiúsculas, uma célula `Gravidade` e uma célula `O que foi feito`. Uma coluna `#` antes de `Gravidade` é aceita e ignorada; qualquer outra ordem de colunas também, porque o índice da coluna vem do cabeçalho.
  2. A linha seguinte ao cabeçalho é o separador (células só de `-` e `:`); ela não conta.
  3. A linha de dado começa com `|`, e o número de células é igual ao do cabeçalho. As células são o texto entre os `|`, aparado. Um `|` dentro de crase também separa célula; a linha fica com células a mais e cai em C9.
  4. A célula da coluna "O que foi feito" contém a palavra `Corrigido` (sem distinguir maiúsculas, em qualquer posição do texto).
  A gravidade não entra na regra: linha `baixo` com "Corrigido" conta, porque o número mede quanto foi corrigido antes do merge. Linha cuja célula é "Recomendação" ou não tem "Corrigido" não conta. A tabela termina na primeira linha que não começa com `|`.
- C9. Corpo que não segue o formato não é erro: corpo vazio, corpo com `PR reviewer: **dispensado**`, corpo sem tabela ou com tabela sem as duas colunas contribui 0. Linha de dado com número de células diferente do cabeçalho é ignorada, e o gerador imprime uma linha de aviso no log do deploy com o número do PR e o texto da linha. O gerador nunca falha por causa do corpo de um PR.
- C10. Conta de hoje (11/11/2026), conferida pela sessão principal na API e nos arquivos: achados corrigidos: PR #1 tem 1 linha com "Corrigido", #5 tem 4 (incluindo a "baixo"), #13 tem 2; os demais mesclados têm 0 (dispensado ou "Recomendação"). Total 7; com o #14 (2 linhas), 9. Revisões de agente: rótulo `revisado-por-opus` nos PRs #1, #2, #11 e #13 e `revisado-por-fable` no #5, total 5; com o #14, 6. Specs aprovadas em `staging`: 003, 004, 005, 006 e 007, total 5 (a 003 depois da aprovação registrada em C4; a 002 fica fora); com a 008, 6. Testes: 96. PRs contados e testes o worker confere no repositório antes de fixar o teste da conta.

### Onde e quando o JSON é gerado

- C11. O gerador é um script Node em `scripts/`, sem dependência fora do Node 24 (`fetch` nativo), com as funções de contagem separadas da leitura de API e de arquivo, para que os testes rodem sobre textos e objetos de exemplo. Recebe o token pela variável de ambiente `GITHUB_TOKEN`, o repositório por `GITHUB_REPOSITORY` e o SHA por `GITHUB_SHA`, as três que o Actions já fornece. Grava `site/dados/processo.json`.
- C12. O gerador roda no job de deploy de `.github/workflows/pages.yml`, depois do checkout e antes do upload de `site/`, com `permissions` de `contents: read` e `pull-requests: read`. Antes dele, o job roda `node --test 'scripts/**/*.test.mjs'` para obter C6. Essa mudança no workflow é da sessão principal, com o ok do responsável (F4); o worker entrega o script e os testes e escreve no PR o trecho de workflow proposto. O gatilho de `push` em `main` passa a incluir `docs/specs/**` e `scripts/**` além de `site/**`, e mantém o `workflow_dispatch` para disparo manual (P4 respondida), para que um merge só de spec ou de script também refaça os números.
- C13. O CI de PR (`ci.yml`) já roda `scripts/**/*.test.mjs`, então os testes unitários do gerador (T1 a T8) passam em todo PR. O CI de PR não chama a API do GitHub nem gera o JSON.
- C14. Falha parcial: se a chamada à API falha (rede, limite de uso, resposta não 200) ou a execução dos testes não produz `tests N`, as contagens que dependem daquela fonte ficam `null` e o gerador ainda grava o arquivo com as demais. Falha total (não consegue gravar o arquivo): o gerador sai com código diferente de zero e o passo no workflow tem `continue-on-error: true`, para o site publicar mesmo sem o JSON (suposição desta spec: publicar o site vale mais que a linha; a sessão principal confirma ao editar o workflow).

### A linha no modal

- C15. Lugar: no `#sobre-site` (PT e EN), um parágrafo logo antes do link final "Ver as specs e os PRs no GitHub" ("See the specs and PRs on GitHub"). O parágrafo existe no HTML com o atributo `hidden` e um `id` fixo; o JavaScript preenche o texto e tira o `hidden`. É texto comum dentro do `<dialog>`: sem `aria-live`, sem região própria. A data vai num `<time datetime="...">` com o valor de `coletadoEm`.
- C16. Texto, com os números de C1 como exemplo:
  - PT: "Números do processo, coletados em 11/11/2026: 4 specs aprovadas, 9 PRs mesclados, 96 testes automatizados, 5 revisões de agente e 7 achados de revisão corrigidos antes do merge."
  - EN: "Process numbers, collected on Nov 11, 2026: 4 approved specs, 9 merged PRs, 96 automated tests, 5 agent reviews and 7 review findings fixed before merge."
  - Número formatado com `Intl.NumberFormat` (`pt-BR` na página PT, `en-US` na EN); data com `Intl.DateTimeFormat` no fuso `America/Sao_Paulo`, formato `dd/mm/aaaa` em PT e `Mon d, yyyy` em EN.
  - Valor 1 usa o singular ("1 spec aprovada", "1 PR mesclado", "1 teste automatizado", "1 revisão de agente", "1 achado de revisão corrigido"; EN "1 approved spec", "1 merged PR", "1 automated test", "1 agent review", "1 review finding fixed"). Zero usa o plural.
  - Campo `null` em `numeros`: o trecho daquele número sai da frase e os outros se ligam por vírgula, com "e" ("and") antes do último. Se os cinco são `null`, vale C17.
- C17. Falha: resposta não 200, corpo que não é JSON, `versao` diferente de 1, `numeros` ausente ou que não é objeto, ou erro de rede: o parágrafo continua `hidden`, nada é escrito no console (nem `console.error`, nem `console.warn`) e não há nova tentativa. A página inteira continua igual; nada muda de lugar, porque o modal está fechado e o parágrafo oculto não ocupa espaço.
- C18. Momento: a busca começa no carregamento da página (`fetch('/dados/processo.json')` relativo à raiz do site, com `cache: 'no-cache'`); abrir o modal não dispara busca nenhuma. Se o modal abre antes da resposta, o parágrafo fica oculto até a resposta chegar e então aparece; não há texto de carregamento (P3 respondida).
- C19. A página EN usa o mesmo arquivo, no mesmo caminho absoluto `/dados/processo.json`.

## Critérios de aceite

Testes unitários em `scripts/`, no padrão `*.test.mjs` já coberto pelo CI; aceite no navegador em `scripts/site/*.e2e.mjs`, com um servidor estático local servindo `site/` e um JSON de exemplo colocado em `site/dados/processo.json` só durante o teste.

- A1. Dado o corpo de um PR no formato de cinco colunas (F8, como o #5) com 4 linhas "Corrigido" (uma delas `baixo`) e 1 linha "Recomendação", quando se conta C8, então o resultado é 4 (unitário, liga C8).
- A2. Dado o corpo no formato de seis colunas com `#` (como o #13), com "Corrigido em `62388ca`" no meio da célula, quando se conta C8, então o resultado é 2 (unitário, C8).
- A3. Dado o corpo com `PR reviewer: **dispensado**` e sem tabela, e dado um corpo vazio, então C8 devolve 0 e nenhum erro (unitário, C9).
- A4. Dado um corpo com uma tabela cujo cabeçalho não tem "O que foi feito", e outra tabela válida com 1 linha "Corrigido" e 1 linha com uma célula a mais (um `|` dentro de crase), então o resultado é 1 e o aviso cita o PR e a linha ignorada (unitário, C8 e C9).
- A5. Dada uma lista de PRs de exemplo com: um mesclado com `head.ref` `feat/x` e rótulos `revisado-por-opus` e `revisado-por-fable`; um mesclado com `head.ref` `staging`; um fechado sem merge com `revisado-por-opus`; um mesclado com `revisado-por-humano` só; então `prsMesclados` é 2 e `revisoesDeAgente` é 2 (unitário, C3, C5, C7).
- A6. Dados arquivos de exemplo com `Estado: aprovada pelo responsável em 11/11/2026`, `**Status:** rascunho`, `Estado: aprovada` só na linha 12, e um `README.md` com "aprovada" na linha 1, então `specsAprovadas` é 1 (unitário, C4).
- A7. Dada a saída do reporter com `ℹ tests 96` e `ℹ fail 0`, então C6 devolve 96; com `ℹ fail 1`, devolve `null`; sem a linha, devolve `null` (unitário, C6 e C14).
- A8. Dado o gerador com a API respondendo 500, então o arquivo é gravado com `prsMesclados`, `revisoesDeAgente` e `achadosCorrigidos` em `null`, os outros campos preenchidos, `versao` 1 e `coletadoEm` em ISO com `Z` (unitário, com `fetch` substituído, C1, C11 e C14).
- A9. Dado `site/dados/processo.json` com os valores de C1, quando a página PT carrega e o modal abre, então o parágrafo antes do link do GitHub está visível com o texto exato de C16 em PT, e o `<time>` tem `datetime` igual a `coletadoEm`; o mesmo em EN com o texto EN (Playwright, C15, C16, C18, C19).
- A10. Dado o JSON com `testesAutomatizados: null` e `specsAprovadas: 1`, então a frase PT começa com "1 spec aprovada, 9 PRs mesclados, 5 revisões de agente e 7 achados de revisão corrigidos antes do merge." sem o trecho dos testes (Playwright, C16).
- A11. Dado o site sem `site/dados/processo.json` (resposta 404) e, em outro caso, com um arquivo que não é JSON, quando a página carrega e o modal abre, então o parágrafo continua com `hidden` e o console não recebe nenhuma mensagem de erro ou aviso (Playwright, C17).
- A12. Dado o site em 390 px e 1280 px, nos dois temas, quando a página carrega com e sem o JSON, então a posição do rodapé e do botão `#claude-btn` é a mesma nos dois casos, e com o modal aberto nada passa da largura da tela (Playwright e print, C17).
- A13. Dado o repositório, então `.gitignore` contém `site/dados/processo.json` e `site/index.html` e `site/en/index.html` têm o parágrafo com `hidden` imediatamente antes do link do GitHub no `#sobre-site` (teste estático, C2 e C15).
- A14. Dado o checkout de `main` com `GITHUB_TOKEN` válido, quando o gerador roda no job de deploy, então o arquivo publicado em `https://gomesbeduardo.github.io/dados/processo.json` tem a forma de C1 e os valores batem com a conta de C10 feita à mão no mesmo dia (conferência da sessão principal depois do primeiro deploy, C12).

## Fora do escopo

- Contagem de tokens, custo ou tempo de uso de IA (D3).
- Chamada à API do GitHub a partir do navegador, ou token no cliente.
- Migração para Astro e o workflow `publicar.yml`; o JSON fica neutro para que o Astro o leia no build (F11).
- Contar os scripts `*.e2e.mjs` ou os testes do PDF.
- Outras métricas (commits, linhas, issues) e qualquer gráfico.
- Mostrar os números fora do modal.
- Mudar o restante do texto do modal.

## Perguntas respondidas (11/11/2026)

- P1. Os PRs de integração `staging` para `main` (como o #6) contam em `prsMesclados`? Exemplo: hoje o #6 é um deles; contá-lo soma 1 sem nenhuma mudança de produto por trás. Resposta do responsável, igual à recomendação: não contar (C3 como está), porque esses PRs só repetem o que os PRs de feature já contaram.
- P2. Spec em rascunho conta em `specsAprovadas`? Exemplo: a 002 (rascunho nunca aprovado) entraria e o número passaria de 4 para 5. Resposta do responsável, igual à recomendação: não contar, porque o nome do número diz "aprovadas" e a 002 pode nunca ser aprovada.
- P3. O que a linha mostra enquanto o JSON ainda não chegou e o modal já está aberto? Exemplo: conexão lenta, o visitante clica no botão em menos de 1 s. Resposta do responsável, igual à recomendação: nada (fica oculta e aparece ao chegar, C18); a busca começa no carregamento e termina antes do primeiro clique na quase totalidade dos casos, e um texto "carregando" criaria um estado a mais para testar.
- P4. O deploy roda só quando um push em `main` toca `site/**` (F1); um merge só de spec ou de script não refaz o JSON, e os números ficam parados até a próxima mudança no site. Exemplo: a 007 aprovada e mesclada em `main` sem tocar `site/` só aparece no número quando outro PR mudar o site. Resposta do responsável, igual à recomendação: a sessão principal, ao editar o workflow (C12), acrescenta `docs/specs/**` e `scripts/**` aos caminhos do gatilho e o `workflow_dispatch` para disparo manual. A data na linha (C16) deixa a defasagem visível em qualquer caso.
