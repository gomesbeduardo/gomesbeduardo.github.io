# Spec 009: design system com movimento obrigatório em todo elemento interativo

Estado: rascunho, aguardando aprovação do responsável.
Issue: #29. Implementação depois da etapa 3 da migração para o Astro (spec 001c), ver D1 e P1.

## Pedido

Da issue #29 (13/11/2026): "Criar um design system fixo, pensado para Astro e Tailwind, que todo componente novo ou alterado use obrigatoriamente. A regra central: tudo que é clicável ou usável tem animação (hover, foco, pressionar, abrir e fechar)." O caso que motivou a issue: o botão "Feito com o Claude Code", no rodapé, abre o `<dialog>` "sobre o site" sem animação, e o painel aparece de uma vez.

## Problema

- Não há token de duração nem de distância. O `@theme` de `src/styles/global.css` tem só `--ease: cubic-bezier(.16,1,.3,1)`. As durações e curvas estão escritas à mão em cerca de 70 linhas: 28 em `src/styles/legado/style.css`, 18 em `surpresas.css`, 3 em `transicoes.css`, 18 em `public/main.js`, 1 em `surpresas.js` e 1 em `tema.js`. Os valores variam entre `.15s`, `.2s`, `.25s`, `.3s`, `.35s`, `.45s` e `.5s`, com `ease`, `ease-in`, `ease-out`, `var(--ease)` e dois `cubic-bezier` próprios.
- O `dialog.modal` (`ModalSobreSite.astro`, `style.css`, `public/rodape.js`) abre com `showModal()` e fecha com `close()`, sem transição, `@starting-style` nem keyframes.
- Elementos clicáveis sem transição em algum estado: `.foot-lang a` do rodapé, `.sp-word` e `.sp-x` (`surpresas.css`), `.link-codigo` e links de texto (`p a:hover`), o link "Ir para o conteúdo" (`.skip`) e o anel de foco global (`:focus-visible`), que aparece de uma vez.
- Com `prefers-reduced-motion: reduce`, o bloco global de `style.css` zera toda transição (`*{transition-duration:0s!important}`), enquanto a virada da foto já esmaece em 150 ms (spec 005 C8). Não há regra única.
- Não existem componentes de interface reutilizáveis. `.btn`, `.icon-btn` e `.links a` são classes CSS usadas direto no markup das seções (`src/components/*.astro`).

## Decisões

- D1. O código desta spec entra só depois da etapa 3 (decisão do responsável de 16/11/2026). Até lá, o teste (a2) de `scripts/site/build.test.mjs` exige que `src/styles/legado/*` e `public/{tema,main,surpresas,rodape}.js` sejam iguais byte a byte aos de `site/`, e a etapa 3 (001c R1, R7) leva os JS para `src/scripts/` e apaga `site/`. O diálogo segue sem animação até esta spec ser implementada.
- D2. Componentes Astro são criados nesta entrega e adotados aos poucos (decisão de 16/11/2026): cada componente substitui o markup em pelo menos um lugar real (C6), e as outras ocorrências migram quando a seção for alterada por outra spec. O teste de C8 vale para a página inteira desde já, com ou sem componente.
- D3. O diálogo abre e fecha com a mesma sensação do menu do celular, que já usa uma mola com leve passagem do ponto (`cubic-bezier(.34,1.4,.64,1)`), no estilo do iOS. O responsável aceitou também um fade simples (16/11/2026); a spec fixa a mola, por coerência com o menu, e C4 descreve os valores.
- D4. Com `prefers-reduced-motion: reduce`, tudo que se desloca, escala ou gira deixa de se mover, e as mudanças de opacidade e cor continuam, em 150 ms (decisão de 16/11/2026, a mesma da spec 005 C8).
- D5. Tokens em `@theme` do Tailwind, como manda a 001 R4. O token `--ease` existente passa a se chamar `--ease-saida`, e o teste `scripts/site/tema-tailwind.test.mjs`, que compara `--ease` com o legado, é atualizado junto.

## Regras

### R1. Tokens de movimento

Definidos uma vez, no `@theme` de `src/styles/global.css`, com estes nomes e valores:

| Token | Valor | Uso |
|---|---|---|
| `--duration-rapida` | `150ms` | hover, pressionar, cor, foco, fechar o que é pequeno |
| `--duration-media` | `250ms` | abrir e fechar painel (menu, diálogo, aviso), opacidade de entrada |
| `--duration-mola` | `350ms` | deslocamento e escala com `--ease-mola` |
| `--duration-lenta` | `500ms` | virada da foto, troca de tema |
| `--duration-reduzida` | `150ms` | toda transição com movimento reduzido (D4) |
| `--ease-saida` | `cubic-bezier(.16,1,.3,1)` | padrão: entrada e hover (o `--ease` de hoje, D5) |
| `--ease-mola` | `cubic-bezier(.34,1.4,.64,1)` | abrir menu e diálogo, soltar o pressionado |
| `--ease-entrada` | `cubic-bezier(.4,0,1,1)` | fechar menu e diálogo |
| `--distancia-curta` | `3px` | ícone que anda no hover (seta do botão, ícone do card) |
| `--distancia-media` | `8px` | rótulo que desliza no contato, entrada de painel |
| `--escala-pressionado` | `.97` | botão e cartão enquanto pressionados |
| `--escala-entrada` | `.96` | painel antes de abrir |
| `--atraso-escalonado` | `30ms` | atraso entre itens do menu (hoje `calc(var(--i)*30ms + 60ms)`) |

- Animação contínua que já existe (o ponto pulsante do botão "Feito com o Claude Code", 2,4 s; a faixa da Stack) ganha um token próprio no mesmo `@theme`, com o prefixo `--duration-` e uma linha no documento de R5. Token novo só entra assim: no `@theme` e no documento, no mesmo commit.
- A troca de valor de hoje para o token mais próximo é aceita: `.2s` vira `--duration-rapida`, `.3s` e `.25s` viram `--duration-media`, `.45s` e `.5s` viram `--duration-lenta`. Isso muda alguns tempos em até 50 ms, e é intencional.

### R2. Valores literais proibidos

Fora do `@theme` de `global.css`, nenhum arquivo de `src/styles/`, `<style>` de `src/components/` ou `src/pages/`, nem `src/scripts/` (o JS depois da 001c R1) contém duração, atraso, curva ou distância de movimento escritos à mão. Na prática:

- CSS: em `transition*`, `animation*` e nos `transform` de estado (hover, active, aberto, fechado), só `var(--…)` dos tokens de R1, `0s` e `calc()` sobre tokens. Palavras `ease`, `ease-in`, `ease-out`, `ease-in-out` e `cubic-bezier(` não aparecem. `linear` é aceito só em animação contínua (faixa da Stack).
- JS: tempo de interação (o `setTimeout` de reserva do menu, hoje 320 ms; atrasos do aviso de cópia) vem dos tokens, lidos por `getComputedStyle(document.documentElement)`. As animações de rolagem do GSAP seguem P3.

### R3. Estados de cada elemento interativo

Elemento interativo: `a[href]`, `button`, `summary`, `[role="button"]`, `[tabindex]` diferente de `-1`, `input`, `select`, `textarea` e `dialog`, nas páginas publicadas (home PT e EN, páginas de projeto).

| Estado | O que acontece | Tokens |
|---|---|---|
| Hover (só com `@media (hover:hover)`) | muda cor ou fundo, e pode deslocar um ícone ou rótulo | cor em `--duration-rapida` + `--ease-saida`; deslocamento em `--duration-mola` + `--ease-saida`, com `--distancia-curta` ou `--distancia-media` |
| Foco visível | o anel `2px solid var(--accent)` aparece com `outline-offset` indo de `6px` a `2px` | `--duration-rapida` + `--ease-saida` |
| Pressionado (`:active`) | botão e cartão escalam para `--escala-pressionado`; links de texto mudam opacidade ou fundo, como hoje; ao soltar, voltam com a mola | descer em `--duration-rapida` + `--ease-saida`; voltar em `--duration-mola` + `--ease-mola` (pendente P2 para a escala) |
| Abrir (menu, diálogo, aviso) | ver R4 e o menu atual | `--duration-media`, `--duration-mola`, `--ease-mola` |
| Fechar | caminho inverso, mais curto | `--duration-rapida` ou `--duration-media`, `--ease-entrada` |

O que já anima hoje mantém o desenho e só troca os valores pelos tokens: menu do celular, virada da foto (005), aviso de cópia (006), indicador do menu do topo, cards de projeto, contato e rodapé. Os elementos da lista de "Problema" ganham o que falta pela tabela.

### R4. Diálogo "sobre o site"

- Abrir: o painel começa com `opacity:0` e `transform: translateY(var(--distancia-media)) scale(var(--escala-entrada))` e chega a `opacity:1` e `transform:none`. Opacidade em `--duration-media` + `--ease-saida`; transformação em `--duration-mola` + `--ease-mola`. O `::backdrop` vai de transparente ao valor de hoje (`rgb(var(--shadow-rgb) / .6)`) em `--duration-media` + `--ease-saida`.
- Fechar, por qualquer caminho (botão de fechar, Esc, clique fora se a spec 004 já previr): caminho inverso em `--duration-rapida` + `--ease-entrada`, painel e fundo juntos. O diálogo só sai da camada do topo (`top layer`) e devolve o foco ao botão "Feito com o Claude Code" depois da animação.
- Recomendação técnica, não decisão de produto: CSS com `@starting-style` e `transition-behavior: allow-discrete` sobre `display` e `overlay`, sem mudar a lógica do módulo `rodape`. Onde o navegador não anima o fechamento (Firefox sem suporte a `overlay` na data desta spec), o diálogo fecha de uma vez e isso é aceito (S1).
- O que a spec 004 e a 008 definem no diálogo não muda: conteúdo, `html.modal-aberto` com `overflow:hidden`, foco preso dentro, Esc fecha, linha dos números do processo.

### R5. Documento do design system

`docs/design/design-system.md`, em português, com:

1. O que é fixo: a tabela de tokens de R1, a regra de R2 e a tabela de estados de R3, copiadas daqui na versão implementada.
2. Os componentes de R6, cada um com as props, um exemplo de uso em `.astro` e onde já está em uso.
3. A lista do que ainda usa classe solta (`.btn`, `.icon-btn`, `.links a` etc.), por arquivo, para a migração aos poucos de D2.
4. Como acrescentar um token ou um componente: o que muda junto (o `@theme`, este documento, o teste de C8 quando o elemento é novo).
5. Movimento reduzido: a regra de D4 e como testá-la (C7).

### R6. Componentes

Em `src/components/ui/`, cada um com o markup e o CSS do próprio estado, só com os tokens de R1:

| Componente | Renderiza | Variantes | Primeiro uso real (D2) |
|---|---|---|---|
| `Botao.astro` | `<a>` com `href`, senão `<button type="button">` | `padrao`, `primario`, `icone` (o `.icon-btn` de hoje) | botão "Feito com o Claude Code" no rodapé |
| `Link.astro` | `<a>` de texto, com `externo` opcional (`rel="noopener"`, ícone de seta) | `texto`, `rodape` | links do rodapé (`.foot-col a`, `.foot-sobre a`) |
| `Dialogo.astro` | `<dialog>` com título, botão de fechar (um `Botao` variante `icone`) e `<slot>` | nenhuma | `ModalSobreSite.astro` |
| `TrocaLingua.astro` | os links PT · EN com `aria-current` | `topo`, `rodape` | `Topo.astro` e `.foot-lang` do `Rodape.astro` |
| `Cartao.astro` | `<a>` com imagem, título e ícone | nenhuma | cards de `Projetos.astro` |

- O HTML gerado onde o componente substitui o markup antigo tem os mesmos atributos de acessibilidade e o mesmo texto (C6). Classes podem mudar.
- Nenhum componente usa `<select>`, `<input>` ou `<button>` estilizado fora dele: quem precisa de botão usa `Botao`.

## Critérios de aceite

- C1. Dado `src/styles/global.css`, então o `@theme` tem os 13 tokens de R1 com os valores da tabela, e não tem mais `--ease` (teste `scripts/site/tema-tailwind.test.mjs` atualizado).
- C2. Dado o repositório, quando o teste de literais roda, então nenhum arquivo de `src/styles/`, `src/components/`, `src/pages/` e `src/scripts/` tem duração, atraso, curva ou distância de movimento fora dos tokens, conforme R2. Dado um CSS de fixture com `transition: color .2s ease`, então o teste falha e nomeia o arquivo e a linha (caso rejeitado). Teste `scripts/site/movimento.test.mjs`.
- C3. Dado qualquer elemento interativo de R3 numa página publicada, quando ele recebe hover, foco por teclado e clique, então cada estado que muda a aparência tem `transition-duration` ou `animation-duration` maior que zero no próprio elemento, num descendente ou num pseudo-elemento (e2e de C8).
- C4. Dado o diálogo fechado, quando o botão "Feito com o Claude Code" é clicado, então, a 0 ms do clique, o painel tem `opacity` menor que 0,1 e escala entre 0,95 e 0,97; a 400 ms, `opacity` 1 e `transform` `none`; o fundo vai de transparente a `rgb(var(--shadow-rgb) / .6)` no mesmo intervalo. Quando Esc é pressionado, então o diálogo ainda está aberto e com `opacity` abaixo de 1 a 50 ms, fecha até 250 ms e o foco volta ao botão.
- C5. Dado o diálogo aberto, então o conteúdo, a linha dos números do processo (008), o foco preso, o Esc e o `html.modal-aberto` funcionam como hoje (os e2e de `rodape` e da 008 passam sem mudança de asserção).
- C6. Dado `dist/`, então cada componente de R6 aparece no seu primeiro uso real; o botão "Feito com o Claude Code", o diálogo, os links do rodapé, a troca de língua e os cards de projeto têm o mesmo texto, `href`, `aria-*` e `id` de antes (teste `scripts/site/build.test.mjs`).
- C7. Dado o site com `reducedMotion: 'reduce'`, quando hover, foco, pressionar e abrir o diálogo acontecem, então nenhum elemento muda `transform` (nem translação, nem escala), e as mudanças de opacidade e cor têm `transition-duration` de 150 ms. O bloco global `*{transition-duration:0s!important}` de hoje deixa de existir.
- C8. Dado o e2e `scripts/site/movimento.e2e.mjs` sobre `dist/` servido, home PT, home EN e uma página de projeto, em 1280×800 e 390×844, então ele percorre todos os elementos interativos de R3 e passa. Dado um `dist/` de fixture com um `<button>` novo sem transição em nenhum estado, então ele falha e nomeia o seletor e a página (caso rejeitado).
- C9. Dado `docs/design/design-system.md`, então ele tem as cinco seções de R5, e cada token de R1 e cada componente de R6 aparece nele (teste `movimento.test.mjs` confere os nomes).
- C10. Dado o PR desta spec, então `npm test` e `npm run e2e` passam, e a meta de INP da 001c (abrir e fechar o diálogo abaixo de 200 ms com CPU 4x) segue atendida (`npm run desempenho`).

## Testes de aceite

| ID | Critério | Dado | Ação | Resultado esperado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1 | `global.css` | ler o bloco `@theme` | 13 tokens com os valores de R1; `--ease` ausente | unidade, `tema-tailwind.test.mjs` |
| T2 | C2 | fixture `a.css` com `.x{transition:color .2s ease}` | rodar a verificação sobre a fixture | falha com `a.css:1` e o trecho `.2s ease` | unidade, `movimento.test.mjs` |
| T3 | C2 | fixture com `.x{transition:color var(--duration-rapida) var(--ease-saida)}` | rodar a verificação | passa | unidade, `movimento.test.mjs` |
| T4 | C2 | fixture JS com `setTimeout(fechar, 320)` em `src/scripts/` | rodar a verificação | falha com o arquivo e a linha | unidade, `movimento.test.mjs` |
| T5 | C2 | o repositório | rodar a verificação | passa | unidade, `movimento.test.mjs` |
| T6 | C3, C8 | `dist/` servido, home PT, 1280×800 | percorrer `a[href]`, `button`, `summary`, `[role=button]`, `[tabindex]:not([tabindex="-1"])`, `dialog`; para cada um, hover, Tab e `mousedown` | todo estado que muda alguma propriedade computada tem duração maior que zero; 0 falhas | e2e, `movimento.e2e.mjs` |
| T7 | C8 | como T6, home EN e `/projetos/<primeiro>/`, nas duas larguras | igual a T6 | 0 falhas | e2e, `movimento.e2e.mjs` |
| T8 | C8 | fixture: `dist/` com `<button class="sem-mov">x</button>` e `.sem-mov:hover{color:red}` sem transição | rodar o e2e | falha com `button.sem-mov` e a página | e2e, `movimento.e2e.mjs` |
| T9 | C4 | home PT, diálogo fechado | clicar em "Feito com o Claude Code"; medir `opacity` e `transform` computados do `dialog` a 0 ms e a 400 ms | 0 ms: `opacity` < 0,1 e escala entre 0,95 e 0,97; 400 ms: `opacity` 1, `transform` `none` | e2e, `movimento.e2e.mjs` |
| T10 | C4 | diálogo aberto há 500 ms | pressionar Esc; medir a 50 ms e a 250 ms | 50 ms: `dialog[open]` com `opacity` < 1; 250 ms: sem `open`; `document.activeElement` é `#claude-btn` | e2e, `movimento.e2e.mjs` |
| T11 | C5 | os e2e de rodapé e da 008 | `npm run e2e` | passam sem mudança de asserção | e2e existentes |
| T12 | C6 | `dist/index.html` antes e depois | comparar texto, `href`, `aria-*` e `id` dos elementos de R6 | iguais | unidade, `build.test.mjs` |
| T13 | C7 | home PT, `reducedMotion: 'reduce'` | hover num `.btn`, Tab até um link, `mousedown` num card, abrir o diálogo | `transform` computado `none` em todos os quadros medidos; `transition-duration` de opacidade e cor = `0.15s` | e2e, `movimento.e2e.mjs` |
| T14 | C7 | `src/styles/` | buscar `transition-duration:0s!important` | 0 ocorrências | unidade, `movimento.test.mjs` |
| T15 | C9 | `docs/design/design-system.md` | buscar os 13 tokens e os 5 componentes | todos presentes, e as 5 seções de R5 | unidade, `movimento.test.mjs` |
| T16 | C10 | `dist/` com CPU 4x | `npm run desempenho` | INP do diálogo < 200 ms | desempenho, 001c R5 |

## Suposições

- S1. Onde o navegador não anima o fechamento do `<dialog>` (Firefox, na data desta spec), ele fecha de uma vez. Os e2e rodam no Chromium do Playwright (001 R5). Aparece em R4.
- S2. O anel de foco animado (`outline-offset` de 6px a 2px) é extensão da regra da issue a um caso que ela cita ("foco") mas não descreve. Aparece em R3.
- S3. As medições de tempo de T9 e T10 usam `page.clock` do Playwright ou leitura em quadros com tolerância de 1 quadro (16 ms). Aparece em T9 e T10.

## Fora do escopo

- Redesenho visual das páginas (cores, tipografia, layout), como diz a issue.
- Animações de entrada na rolagem, parallax, contadores e frase digitada, exceto o que P3 decidir.
- Migrar todas as seções para os componentes (D2): só os primeiros usos de R6.
- A frase "O design system ainda espera a spec", do painel "Como este site foi feito" (branch `feat/texto-painel`, ainda sem push). Ela muda na entrega daquela branch ou numa emenda dela, não aqui.
- Fundo com nuances, grão e brilho (001 D8), que tem spec própria.

## Perguntas abertas

- P1. Onde entra o código: num PR próprio, `feat/design-system` para `staging`, logo depois do merge da etapa 3; ou dentro do PR da etapa 3. Exemplo: a etapa 3 já reescreve os JS em `src/scripts/` e liga o Preflight, e juntar o design system ali deixa a revisão e a paridade de 001c C7 mais difíceis de ler. Recomendação: PR próprio, logo depois da etapa 3.
- P2. Escala ao pressionar: hoje `.btn:active` só escurece o fundo. Com a mola (D3), botão e cartão também encolhem para 0,97 enquanto pressionados. Alternativa: manter só a cor e animar a transição dela. Recomendação: escala 0,97, porque é o que dá a sensação do iOS que o menu já tem.
- P3. As animações de rolagem do GSAP (reveal, parallax, contadores, frase digitada em `main.js`, que vira `src/scripts/revelar` e `topo` na 001c R1) também passam a usar os tokens? Exemplo: em `main.js` há durações de 0,4 s, 0,5 s, 0,65 s, 0,8 s e 1 s com `expo.out` e `none`, além de `S.reveal.dur` e `S.count.dur`, valores que não cabem nos tokens de R1. Recomendação: não nesta spec; R2 vale só para o que é interativo, e a rolagem fica como está, citada no documento de R5 como exceção.
