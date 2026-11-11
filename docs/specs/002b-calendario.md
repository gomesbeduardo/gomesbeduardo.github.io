# Spec 002b: calendário de contribuições com eixos e dica por dia

Estado: aprovada pelo responsável em 11/11/2026.
Parte de tela da spec 002 (números do GitHub). Implementada junto da coleta da 002, depois da etapa 1 da spec 001, com o calendário já gerado no HTML do build (001b R4). Não muda o contrato de `src/data/github.json`.

## Pedido literal

> "Na parte do github, seria ideal pode ver a qtd de interações em cada bloco, como é no github em si e separar por data. É possível?" (11/11/2026)

## Problema

O calendário da seção "Números do GitHub" é uma grade de 53 colunas por 7 linhas, com a cor de cada dia por nível de 0 a 4. A contagem de cada dia só aparece no `title` nativo do quadrado, que surge depois de um atraso no hover do mouse, não aparece no toque nem no foco do teclado, e o leitor de tela lê a grade inteira como uma imagem só. Não há nome de mês, dia da semana nem legenda, então não dá para achar uma data sem contar quadrados.

## Decisões do responsável (11/11/2026)

- D1. Cada dia mostra a contagem e a data numa dica própria, no estilo do site, que abre no hover, no toque e no foco do teclado. Sai o `title` nativo.
- D2. A grade ganha os nomes dos meses em cima, os dias da semana do lado e a legenda "menos" a "mais".
- D3. Fica só o período que a 002 já coleta, os últimos 12 meses. Sem seletor de ano (descartado, junto com a coleta por ano).
- D4. Sem JS, o calendário continua legível pelo HTML do build (001b R4); a dica é um acréscimo do JS.

## Regras

### R1. Dados

- Tudo sai de `calendario.semanas[].dias[]` de `src/data/github.json` (`data`, `contagem`, `nivel`, `diaSemana`), no build. Nada é buscado no navegador.

### R2. Eixos e legenda

- Meses: acima da coluna da primeira semana em que o mês aparece, o nome curto do mês (PT: "jan", "fev", ... "dez"; EN: "Jan", "Feb", ... "Dec"). Se duas etiquetas ficariam a menos de 3 colunas uma da outra (o mês parcial do começo da janela), a primeira não aparece, como no GitHub.
- Dias da semana: à esquerda, só "seg", "qua" e "sex" (EN: "Mon", "Wed", "Fri"), nas linhas 1, 3 e 5 (a linha 0 é domingo, como o `diaSemana` da 002).
- Legenda abaixo da grade, à direita: "menos", os cinco quadrados dos níveis 0 a 4 e "mais" (EN: "Less" e "More").
- No celular, a grade continua rolando na horizontal dentro de `.cal-scroll`, e a coluna dos dias da semana fica parada (`position: sticky`) à esquerda.
- Texto dos eixos e da legenda em `--f-mono`, tamanho `--t-label`, cor `--muted`; nada de valor literal onde há token.

### R3. Dica por dia

- Texto: PT "7 contribuições em 2 de mar. de 2026", com "1 contribuição" no singular e "Nenhuma contribuição em ..." para zero; EN "7 contributions on Mar 2, 2026", "1 contribution", "No contributions on ...". A data vem de `data`, formatada sem fuso (é um dia civil, não um instante).
- Abre no hover do mouse (sem atraso perceptível, até 100 ms), no foco do teclado e no toque. Fecha ao sair do quadrado, ao perder o foco, ao tocar fora, ao rolar e com Esc. Uma dica por vez.
- Fica acima do quadrado, centrada nele, e nunca sai da janela nem da `.cal-scroll` visível: perto da borda, desloca para dentro.
- Estilo de superfície do site (`--raised`, borda `--line`, `--shadow`, raio `--r-sm`, texto `--fg`), nos dois temas, com contraste AA.
- Com `prefers-reduced-motion: reduce`, aparece e some sem animação; sem ela, esmaece em até 120 ms.

### R4. Teclado e leitor de tela

- A grade vira `role="grid"`, com uma linha por dia da semana (`role="row"`) e um `role="gridcell"` por dia, com o texto da dica como nome acessível (`aria-label` ou texto `sr-only`). Os dias de preenchimento antes da janela ficam fora da árvore de acessibilidade.
- Um só ponto de Tab na grade (o dia mais recente). Setas movem entre dias (direita e esquerda: semana seguinte e anterior; cima e baixo: dia anterior e seguinte), Home e End vão ao primeiro e ao último dia da semana corrente da linha. O foco visível usa o anel de foco do site.
- O resumo atual ("Calendário de contribuições por dia, incluindo privadas, com 2.897 no total") continua como rótulo da grade.

### R5. Sem JS

- O HTML do build traz a grade completa, os eixos, a legenda e, em cada dia, o texto da dica num elemento `sr-only` (assim o texto existe sem JS e o leitor de tela o lê). Sem JS não há dica visual, mas a grade, os meses e a legenda aparecem.
- Isto substitui o `title` de 001b R4: o dia não tem mais `title`.

## Critérios de aceite

- C1. Dado `github.json` com o dia `2026-03-02` com `contagem: 7`, quando o mouse passa sobre esse quadrado em `/`, então a dica "7 contribuições em 2 de mar. de 2026" aparece em até 100 ms acima dele; em `/en/`, "7 contributions on Mar 2, 2026".
- C2. Dado um dia com `contagem: 1` e outro com `0`, então as dicas dizem "1 contribuição em ..." e "Nenhuma contribuição em ..." (EN: "1 contribution on ...", "No contributions on ...").
- C3. Dado o celular (390 px, toque), quando se toca num quadrado, então a dica dele abre; tocar fora ou rolar fecha.
- C4. Dado o foco no calendário pelo Tab, então o foco cai no dia mais recente e a dica dele abre; as setas movem foco e dica conforme R4; Esc fecha a dica e mantém o foco.
- C5. Dado o quadrado da primeira e da última coluna, a 390 e a 1280 px, então a dica fica inteira dentro da janela.
- C6. Dado `dist/index.html`, então a grade tem os nomes dos meses na ordem da janela, "seg", "qua" e "sex", a legenda com cinco níveis, nenhum `title` nos dias, e cada dia da janela tem o texto da dica em `sr-only` (contagem de dias = `calendario.totalDias`).
- C7. Dado o site com JS desligado, então a grade, os meses, os dias da semana e a legenda aparecem.
- C8. Dado o tema claro e o escuro, então o texto da dica, dos eixos e da legenda passa em AA.

## Testes de aceite

| # | Critério | Dado | Ação | Resultado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1, C2 | fixture de `github.json` com `2026-03-02` = 7, `2026-03-03` = 1, `2026-03-04` = 0 | build; hover nos três quadrados, PT e EN | os textos exatos de C1 e C2; dica visível em até 100 ms | e2e, `scripts/site/calendario.e2e.mjs` |
| T2 | C3 | 390 px, `hasTouch` | `tap` num quadrado; `tap` fora; rolar | abre; fecha; fecha | e2e |
| T3 | C4 | 1280 px | Tab até a grade; `ArrowLeft`, `ArrowUp`, `End`; Esc | foco no último dia; move conforme R4; Esc fecha a dica e o foco fica | e2e |
| T4 | C5 | 390 e 1280 px | hover no primeiro e no último quadrado | `getBoundingClientRect` da dica dentro de `0..innerWidth` | e2e |
| T5 | C6 | `dist/` | ler o HTML | meses em ordem, eixos, legenda, nenhum `title`, `sr-only` por dia igual a `totalDias` | unidade, `scripts/site/calendario.test.mjs` |
| T6 | C7 | `javaScriptEnabled: false` | abrir `/` e rolar até a seção | grade, meses, dias e legenda visíveis | e2e |
| T7 | C8 | claro e escuro | medir as cores computadas | contraste ≥ 4,5:1 no texto | e2e |

## Fora do escopo

- Seletor de ano e coleta por ano (D3).
- Números por mês, lista de atividade e qualquer dado novo no `github.json`.
- Mudar as cores dos níveis 0 a 4.
