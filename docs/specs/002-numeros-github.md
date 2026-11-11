# 002. Números do GitHub coletados no build

**Status:** rascunho (provisória até o responsável aprovar)
**Pedido (literal, do responsável):** "Números do GitHub: Contribuições nos últimos 12 meses (inclui privadas), repos públicos, linguagens mais usadas e calendário de contribuições desenhado no tema do site. Buscados no build pelo Actions (GraphQL com token pessoal só de leitura, guardado como secret), com rebuild semanal e data da coleta visível. Sem JS para isso e sem widget de terceiro."
**Decisões ligadas:** handoff de 09/11 (site Astro estático no GitHub Pages, deploy pelo Actions, PT em `/` e EN em `/en/`); spec 001 (portfólio, que desenha a seção "Números do GitHub" a partir do JSON desta spec).

## Problema

O protótipo mostra números fixos (`data-v="1234"`). O site publicado precisa mostrar os números reais do usuário `gomesbeduardo`, sem JavaScript no navegador e sem widget externo. A única fonte do calendário de contribuições é a API GraphQL do GitHub (`contributionsCollection`), que exige token; a REST sem token tem limite de 60 requisições por hora por IP e não entrega o calendário. Logo a coleta acontece no build, no GitHub Actions, e o resultado vira um arquivo JSON que o Astro lê em tempo de build.

Quem usa: o front end (spec 001) lê o JSON; o visitante vê os números e a data da coleta; o responsável mantém um secret e recebe aviso quando a coleta falha.

## Fatos confirmados

- F1. A REST do GitHub sem token tem 60 requisições por hora por IP; o calendário só sai pelo GraphQL com token (handoff, com fonte em docs.github.com).
- F2. O `GITHUB_TOKEN` do Actions só enxerga o próprio repositório; contribuições em outros repositórios pedem um token pessoal (PAT) (handoff).
- F3. O cron do Actions é desativado depois de 60 dias sem atividade no repositório público (docs.github.com, evento `schedule`).
- F4. Um `push` feito com o `GITHUB_TOKEN` não dispara outros workflows (docs.github.com, "Triggering a workflow from a workflow").
- F5. O runner `ubuntu-latest` traz Node e Google Chrome instalados (README do runner-images). Esta spec usa o Node; o Chrome entra na spec 003.
- F6. Login do GitHub: `gomesbeduardo`. Hoje tem 12 repositórios públicos (REST pública em 09/11/2026).
- F7. O campo `contributionLevel` do GraphQL tem cinco valores: `NONE`, `FIRST_QUARTILE`, `SECOND_QUARTILE`, `THIRD_QUARTILE`, `FOURTH_QUARTILE`; `weekday` vai de 0 (domingo) a 6 (docs.github.com/en/graphql/reference/users).
- F8. Fine-grained PATs chamam a API GraphQL desde 27/04/2023 (github.blog/changelog), e toda fine-grained PAT lê repositórios públicos sem permissão extra (docs.github.com, "Forming calls with GraphQL").

## Suposições

- S1. Com o token do próprio usuário, `contributionCalendar.totalContributions` inclui as contribuições em repositórios privados. Baixo impacto se errar: o número fica menor, e o primeiro run real confere com o perfil (P2). Aparece em C2 e no campo `contribuicoes.total`.
- S2. Um commit feito pelo bot do Actions conta como atividade do repositório para a regra dos 60 dias (F3). É o que a comunidade observa; a documentação fala em "atividade do repositório" sem listar atores. Aparece em C8.
- S3. Para o GraphQL incluir as contribuições privadas, a fine-grained PAT precisa de "Contents: Read-only" e "Metadata: Read-only" em todos os repositórios do usuário. A documentação diz só que "o dado pedido dita as permissões". Se o primeiro run real devolver erro de autorização ou número menor, a alternativa é um PAT clássico com escopos `read:user` e `repo` (P3).
- S4. O GraphQL rejeita janela maior que um ano entre `from` e `to`. A documentação só diz que o padrão é um ano; o limite vem de relatos da comunidade. A janela de R1 fica dentro do limite nos dois casos.

## Regras

### R1. Janela de 12 meses

`ate` = data da coleta em UTC; `de` = `ate` menos 364 dias. A janela tem 365 dias inclusivos e nunca passa de um ano (S4). Exemplo: coleta em 2026-11-09 → `de` = 2025-11-10, `ate` = 2026-11-09.

### R2. Contribuições

`contribuicoes.total` = `contributionCalendar.totalContributions` da janela R1. Os quatro componentes vêm dos campos `totalCommitContributions`, `totalPullRequestContributions`, `totalIssueContributions` e `totalPullRequestReviewContributions`; `restritas` = `restrictedContributionsCount`. O total não é recalculado: é o número do GitHub.

### R3. Repositórios públicos

`reposPublicos` = `totalCount` de `repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false)`. Forks não contam, porque não são código do autor. Repositórios arquivados contam.

### R4. Linguagens mais usadas

Entrada: os repositórios de R3, paginados de 100 em 100, cada um com `languages(first: 10, orderBy: {field: SIZE, direction: DESC})`, que dá bytes por linguagem segundo o Linguist (sem vendored e sem gerado).

Conta: soma os bytes de cada linguagem em todos os repositórios; `total` = soma de tudo; ordena por bytes decrescente, desempate por nome; fica com as 5 primeiras; `percentual` = `Math.round(bytes / total * 1000) / 10` (uma casa decimal). Os percentuais são sobre o total de todas as linguagens, então a soma das 5 pode ficar abaixo de 100.

Exemplo: repo A tem TypeScript 60 000 e CSS 10 000; repo B tem TypeScript 20 000, Python 8 000 e Shell 2 000. Total = 100 000. TypeScript 80 000 → 80,0; CSS 10 000 → 10,0; Python 8 000 → 8,0; Shell 2 000 → 2,0. Saída: `[TypeScript 80.0, CSS 10.0, Python 8.0, Shell 2.0]` (4 linguagens, porque só há 4). Com 7 linguagens, saem as 5 maiores.

Sem repositório ou sem bytes: `linguagens` = `[]`, sem erro.

Repositórios ignorados (decisão do responsável em 11/11/2026): `centralEng_AI_Chatbot` fica fora da soma de linguagens, porque tem cerca de 18 MB de ambiente virtual Python commitado (com ele a barra dava Python 89% e Cython 1,7%). A lista fica em `REPOS_IGNORADOS` (`scripts/github/lib.mjs`), aceita `--ignorar <repo>` no coletor e é gravada no JSON como `linguagensIgnoram`. Contribuições e `reposPublicos` não mudam.

### R5. Calendário

Cada `contributionDays` do GraphQL vira um dia `{ data, contagem, nivel, diaSemana }`. `nivel` mapeia F7 para 0 a 4 na ordem dada (`NONE` → 0 … `FOURTH_QUARTILE` → 4); os quartis são os do GitHub, não recalculados, para o desenho bater com o perfil. `maximoDia` = maior `contagem` da janela. As semanas ficam na ordem do GitHub (domingo a sábado, `diaSemana` 0 a 6).

### R6. Falha na coleta e dado anterior

A coleta falha quando: o secret não existe ou está vazio; a resposta HTTP não é 200; o corpo traz `errors`; faltam `data.user.contributionsCollection` ou `contributionCalendar.weeks`; ou `totalContributions` não é inteiro ≥ 0.

Em falha, o coletor não escreve nada. Se `src/data/github.json` já existe, ele fica byte a byte igual, e o coletor sai com código 0 e imprime `::warning::` com o motivo (o site publica com a data da coleta anterior, visível). Se o arquivo não existe, sai com código 1 e o build para. Com `--estrito`, sai com código 1 em qualquer falha; o workflow usa `--estrito` só no run agendado, para o responsável receber o e-mail de falha do Actions.

Validação do dado coletado antes de escrever: as regras acima mais `weeks` não vazio. Dado que não passa é falha.

### R7. Dado de amostra

`node scripts/github/coletar.mjs --fixture <arquivo>` lê um JSON com o formato da resposta GraphQL, sem rede, e grava a saída com `"amostra": true`. A coleta real grava `"amostra": false`. O front end (spec 001) decide o que mostrar quando `amostra` é `true`; a recomendação é um aviso "dados de exemplo".

### R8. Manter o cron vivo

O run agendado grava `src/data/github.json` e faz commit na `main` com o `GITHUB_TOKEN` (`permissions: contents: write`), mensagem `chore(dados): números do GitHub de AAAA-MM-DD`. Como `coletadoEm` muda a cada run, toda coleta bem-sucedida gera um commit, e o repositório tem atividade semanal (S2). O push do bot não dispara outro workflow (F4), então o mesmo workflow segue para build e deploy depois do commit. Se a coleta falhar por 60 dias seguidos, o cron para, e o responsável já terá recebido os e-mails de falha (R6) e reativa pelo botão "Enable workflow" ou por `workflow_dispatch`.

## Critérios de aceite

- C1. Dada a data de coleta `2026-11-09T09:00:00Z`, quando o coletor monta a janela, então `janela.de` = `2025-11-10` e `janela.ate` = `2026-11-09` (teste unitário).
- C2. Dada uma resposta GraphQL com `totalContributions: 1234` e componentes 900/200/34/100 e `restrictedContributionsCount: 15`, então `contribuicoes` = `{ total: 1234, commits: 900, pullRequests: 200, issues: 34, revisoes: 100, restritas: 15 }` (teste unitário).
- C3. Dada a fixture com 2 repositórios e os bytes do exemplo de R4, então `linguagens` é a lista do exemplo, na ordem, com os percentuais exatos (teste unitário).
- C4. Dados 7 linguagens, então saem 5 (teste unitário). Dado zero repositórios, então `linguagens` = `[]` e o coletor não falha.
- C5. Dado um dia `{ date: "2026-03-02", contributionCount: 7, contributionLevel: "THIRD_QUARTILE", weekday: 1 }`, então o dia de saída é `{ data: "2026-03-02", contagem: 7, nivel: 3, diaSemana: 1 }`; os cinco valores de F7 viram 0 a 4 (teste unitário).
- C6. Dada uma resposta sem token, com HTTP 401, com `errors` ou sem `weeks`, e um `github.json` já existente, quando o coletor roda sem `--estrito`, então o arquivo fica idêntico, a saída traz `::warning::` e o código é 0. Com `--estrito`, o código é 1. Sem arquivo existente, o código é 1 (teste de integração com `fetch` injetado; sem rede).
- C7. Dado `--fixture scripts/github/fixtures/graphql-amostra.json`, quando o coletor roda, então `src/data/github.json` tem `amostra: true`, `versao: 1` e todos os campos do contrato com os tipos descritos (teste que valida o arquivo gerado contra uma função de validação do contrato).
- C8. O workflow `.github/workflows/publicar.yml` tem `schedule` semanal, `workflow_dispatch` e `push` em `main`; o job de coleta lê `secrets.GH_TOKEN_LEITURA`, faz commit só em `schedule` ou `workflow_dispatch` e só quando o arquivo mudou; o build roda depois; todas as actions estão fixadas por SHA de commit (leitura do YAML com PyYAML e `grep`).
- C9. Nenhum token aparece em arquivo do repositório; o coletor só lê `process.env.GH_TOKEN_LEITURA` (`grep -rn "ghp_\|github_pat_" .` sem resultado fora de teste de regex).

## Testes de aceite

| # | Critério | Dado (entrada exata) | Ação | Resultado esperado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1 | `agora = "2026-11-09T09:00:00Z"` | `calcularJanela(agora)` | `{ de: "2025-11-10", ate: "2026-11-09", deIso: "2025-11-10T00:00:00Z", ateIso: "2026-11-09T23:59:59Z" }` | unidade, `scripts/github/coletar.test.mjs` |
| T2 | C2 | fixture `graphql-amostra.json` | `transformar(fixture, agora)` | `contribuicoes` = `{ total: 1234, commits: 900, pullRequests: 200, issues: 34, revisoes: 100, restritas: 15 }` | unidade |
| T3 | C3 | repos A e B de R4 | `calcularLinguagens(repos)` | 4 itens: TypeScript 80000/80.0, CSS 10000/10.0, Python 8000/8.0, Shell 2000/2.0 | unidade |
| T4 | C4 | 7 linguagens de 7000 a 1000 bytes | `calcularLinguagens` | 5 itens, a menor com 3000 bytes | unidade |
| T5 | C4 | `[]` | `calcularLinguagens([])` | `[]` | unidade |
| T6 | C5 | o dia de C5 e os 5 valores de F7 | `converterDia` | `{ data, contagem: 7, nivel: 3, diaSemana: 1 }`; níveis 0,1,2,3,4 | unidade |
| T7 | C6 | sem `GH_TOKEN_LEITURA`, arquivo existente com conteúdo `X` | `executar({ env: {}, fetch, saida })` | arquivo = `X`, stdout contém `::warning::`, retorno 0 | integração, `fetch` falso |
| T8 | C6 | token presente, `fetch` devolve HTTP 401 | `executar` | arquivo intacto, retorno 0; com `estrito: true`, retorno 1 | integração |
| T9 | C6 | resposta 200 com `{ errors: [{ message: "Bad credentials" }] }` | `executar` | arquivo intacto, retorno 0 | integração |
| T10 | C6 | resposta 200 sem `weeks` | `executar` | arquivo intacto, retorno 0 | integração |
| T11 | C6 | sem token e sem arquivo | `executar` | retorno 1, nenhum arquivo criado | integração |
| T12 | C7 | `--fixture graphql-amostra.json` | `node scripts/github/coletar.mjs --fixture … --saida tmp` | arquivo com `amostra: true`; `validarContrato(json)` sem erros | integração |
| T13 | C2 | `fetch` falso que devolve a fixture com 200 | `executar` com token | arquivo escrito com `amostra: false` e `contribuicoes.total` 1234; o `fetch` recebeu `Authorization: bearer <token>` | integração |
| T14 | C4 | fixture com `repositories.pageInfo.hasNextPage: true` na 1ª página | `executar` | o `fetch` falso é chamado 2 vezes e as linguagens somam as duas páginas | integração |
| T15 | C8 | `.github/workflows/publicar.yml` | `python3 -c 'import yaml…'` e `grep -n "uses:"` | YAML válido; todo `uses:` tem `@` seguido de 40 hexadecimais; `cron` presente; `GH_TOKEN_LEITURA` presente | manual, registrado no relatório |
| T16 | C9 | o repositório, fora de `.git` e `prototipo/` | `grep -rnE "ghp_|github_pat_"` | nenhuma ocorrência; o coletor lê só `process.env.GH_TOKEN_LEITURA` | manual, registrado no relatório |

## Contrato do arquivo `src/data/github.json`

Decisão desta spec (o front end lê este formato). Datas no formato `AAAA-MM-DD`; instantes em ISO 8601 UTC com sufixo `Z`. O front end mostra a data da coleta no fuso `America/Sao_Paulo`, como `dd/mm/aaaa`.

```json
{
  "versao": 1,
  "amostra": true,
  "usuario": "gomesbeduardo",
  "coletadoEm": "2026-11-09T09:00:00.000Z",
  "janela": { "de": "2025-11-10", "ate": "2026-11-09" },
  "contribuicoes": { "total": 1234, "commits": 900, "pullRequests": 200, "issues": 34, "revisoes": 100, "restritas": 15 },
  "reposPublicos": 12,
  "linguagens": [ { "nome": "TypeScript", "bytes": 80000, "percentual": 80.0, "cor": "#3178c6" } ],
  "calendario": {
    "totalDias": 365,
    "maximoDia": 23,
    "semanas": [ { "dias": [ { "data": "2025-11-09", "contagem": 0, "nivel": 0, "diaSemana": 0 } ] } ]
  }
}
```

Tipos: `versao` inteiro (1); `amostra` booleano; `usuario` string; `coletadoEm` string ISO UTC; `janela.de`/`ate` strings `AAAA-MM-DD`; todos os inteiros ≥ 0; `percentual` número arredondado a uma casa decimal (JSON grava `80` para 80,0); `cor` string `#rrggbb` ou `null` quando o GitHub não informa; `nivel` inteiro 0 a 4; `diaSemana` inteiro 0 a 6; `semanas` com 52 ou 53 itens, cada um com 1 a 7 dias. `totalDias` = soma dos dias de todas as semanas.

Compatibilidade: campo novo entra sem mudar `versao`; campo renomeado ou removido sobe `versao`, e o front end rejeita versão desconhecida no build.

## Workflow e secret

- Secret: `GH_TOKEN_LEITURA`, fine-grained PAT do usuário `gomesbeduardo`, só leitura, criado pelo responsável em Settings → Developer settings → Fine-grained tokens, com "All repositories" e permissões de repositório "Contents: Read-only" e "Metadata: Read-only" (S3). Expiração: 1 ano; a renovação é um lembrete do responsável. Nunca entra em arquivo.
- `.github/workflows/publicar.yml`: `on: push (main)`, `schedule: cron "0 6 * * 1"` (segunda, 06:00 UTC, 03:00 em Brasília) e `workflow_dispatch`. Jobs: `testes` (`node --test 'scripts/**/*.test.mjs'`), `coletar` (R6, R8, com commit em schedule/dispatch; o JSON coletado segue para o build como artefato do run, para o build em `push` usar o dado novo sem commit), `build` (`download-artifact` em `src/data`, geração dos PDFs da spec 003, `npm ci`, `npm run build`, `upload-pages-artifact`), `deploy` (`deploy-pages`). `concurrency: pages`, um run por vez, sem cancelar o que está no ar.
- Se a `main` ganhar proteção que exija PR, o `git push` do bot falha e o run agendado para no job `coletar`; nesse caso o responsável libera o ator `github-actions[bot]` na regra ou troca R8 por commit numa branch `dados-github` (P6).
- `.github/workflows/ci.yml`: em `pull_request`, roda `node --test` e a geração dos PDFs sem deploy.
- Versões fixadas por SHA de commit, com a tag em comentário. `npm ci` e `npm run build` dependem do scaffold do Astro (outro agente): até ele existir, o job `build` falha no `npm ci`, e isso é esperado.

## Fora do escopo

- Desenhar o calendário, os cartões e o aviso de "dados de exemplo" (spec 001).
- Estrelas, seguidores, streak e qualquer número fora do pedido.
- Contribuições de organizações que o usuário não pode ver.
- Histórico das coletas (o git guarda os commits semanais; nada além disso).
- Scaffold do Astro, `package.json` e dependências.

## Perguntas abertas

- P1. Como manter o cron vivo depois de 60 dias sem commit. Opções: (a) commit semanal do JSON pelo próprio workflow (R8); (b) um segundo workflow ou cron externo que chama `gh workflow enable`; (c) action de terceiro de keep-alive. Recomendação e implementado: (a), porque resolve também o "dado anterior" de R6 sem cache externo e não usa terceiro. Custo: um commit de bot por semana na `main`.
- P2. Se o `contribuicoes.total` do primeiro run real ficar abaixo do número do perfil, ligar "Include private contributions on my profile" nas configurações do perfil e rodar `workflow_dispatch` de novo (S1). Recomendação: conferir no primeiro run.
- P3. Se a fine-grained PAT falhar no GraphQL com erro de autorização (S3), trocar por PAT clássico com `read:user` e `repo`, mantendo o mesmo nome de secret. Recomendação: começar com a fine-grained.
- P4. Repositórios públicos: contar forks ou não (R3 não conta). O perfil do GitHub conta. Recomendação: manter sem forks, que é código próprio.
- P5. Em dado de amostra (`amostra: true`), publicar os números com aviso ou esconder a seção. Recomendação: publicar com o aviso, para o layout ser visto antes do secret existir. Decisão do front end (spec 001).
- P6. Proteção da `main`: hoje não há regra; se o responsável criar uma que exija PR, o commit semanal do bot (R8) precisa de exceção ou de outra branch. Recomendação: sem proteção que bloqueie o bot, ou exceção para `github-actions[bot]`.
