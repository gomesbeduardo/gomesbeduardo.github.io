# Spec 001d: troca de língua sem perder o ponto de leitura

Estado: aprovada pelo responsável em 11/11/2026.
Parte 5 de 5 da spec 001. Entra na etapa 1, como a última fatia, depois que a paridade de 001a passar. Vale também nas etapas 2 e 3.

## Pedido literal

> "Ah, uma alteração pra ser feita, quando trocar lingua, ter uma transição suave, hoje ele corta e "reseta" a página, coloca junto nessas próximas specs" (11/11/2026)

## Problema

A troca de língua é um link comum para a página equivalente na outra língua (`./` e `en/` na home, `projeto-x.html` e `en/projeto-x.html` nos projetos). A página nova abre no topo e repete as animações de entrada: a digitação do nome, a revelação das seções e os contadores. Quem estava lendo Projetos em PT e troca para EN volta ao topo e assiste à abertura de novo. O esmaecimento de 250 ms entre páginas (`transicoes.css`) é o único efeito que se mantém.

## Decisões do responsável (11/11/2026)

- D1. A troca continua indo para a outra URL, com o mesmo esmaecimento de 250 ms entre páginas. O texto não troca no lugar.
- D2. A página nova abre no mesmo ponto de leitura, sem repetir as animações de entrada.
- D3. "Mesmo ponto" é medido por âncora: o bloco que está no topo da janela é o mesmo bloco na outra língua e fica exatamente na mesma distância em px do topo da janela, com tolerância de 0 px.
  - Alteração de 12/11/2026, aprovada pelo responsável: o Chromium rola em pixels inteiros (com densidade de tela 1 e 2), e o layout tem frações de pixel, então "0 px" quer dizer diferença de até 0,5 px, o menor passo possível da rolagem. A implementação mira a posição fracionária, e o máximo medido na etapa 1 foi 0,42 px.
  - A distância é a do bloco em repouso: se o bloco ou um ancestral está no meio da animação de revelação no momento do clique, o deslocamento passageiro (`translateY`) não entra na conta.
- D4. Vale na home e nas três páginas de projeto, nas duas direções (PT para EN e EN para PT). A 404 não tem troca de língua e fica como está.
- D5. Entra na etapa 1, como a última fatia, depois da paridade.

## Regras

### R1. Blocos âncora

- Todo bloco de leitura da home e das páginas de projeto ganha `data-ancora` com um id igual nas duas línguas: título de seção, parágrafo do Sobre, item da Trajetória, item da Experiência, faixa e tabela da Stack, card de projeto, bloco dos Números do GitHub, Contato e, nas páginas de projeto, cada seção (problema, o que foi feito, resultados, galeria) e cada parágrafo dentro delas. Exemplos: `sobre-1`, `traj-yourmentor`, `proj-infohub`, `leadgate-resultados-2`.
- O id não depende do texto: é o mesmo em PT e EN, e a ordem dos ids na página é a mesma nas duas línguas.
- `data-ancora` não muda estilo nem layout.

### R2. Clique na troca de língua

- O link continua com o `href` de hoje, e sem JS a troca funciona como hoje: abre a página no topo.
- Com JS, no clique (mouse, toque ou Enter) do link da outra língua no cabeçalho ou no rodapé, o script acha o bloco âncora: o primeiro elemento com `data-ancora`, na ordem do documento, cujo `getBoundingClientRect().bottom` é maior que 0 (o primeiro que ainda aparece na janela, contando de cima). Grava em `sessionStorage`, na chave `troca-lingua`: o caminho de destino, o id da âncora, o `top` dela em px (pode ser negativo, se o bloco começa acima da janela) e o horário. Depois deixa a navegação seguir pelo `href`.

### R3. Chegada na página nova

- Antes do primeiro quadro da página nova (evento `pagereveal`, ou `DOMContentLoaded` onde `pagereveal` não existe), o script lê `troca-lingua`. A entrada vale se o caminho gravado é o da página atual e se tem menos de 5 s. Entrada válida ou não, ela é apagada na leitura.
- Com entrada válida, a página rola sem animação (Lenis com `immediate: true`, ou `window.scrollTo` sem Lenis) até que o elemento com o mesmo `data-ancora` fique com `getBoundingClientRect().top` igual ao valor gravado, com 0 px de diferença. A posição é aplicada depois que as fontes carregam (`document.fonts.ready`) e conferida de novo no quadro seguinte, porque a troca de fonte muda a altura do texto.
- Se o id não existir na página nova, vale o título da seção que contém o bloco; se nem esse existir, a página abre no topo.
- A rolagem não pode passar do fim da página. Perto do fim, quando o bloco não consegue chegar à mesma distância, a página fica rolada até o fim, e o teste aceita essa diferença (T3).

### R4. Sem repetir a abertura

- Com entrada válida (R3), a raiz ganha `data-troca-lingua` antes do primeiro quadro. Com ela: o nome aparece já escrito, sem a digitação; os elementos de revelação acima e dentro da janela aparecem no estado final; os contadores mostram o valor final; o parallax começa na posição que a rolagem pede, sem salto.
- O que está abaixo da janela continua se revelando normalmente quando o visitante rola.
- O atributo sai depois do primeiro quadro, e o resto do comportamento da página segue igual.
- Navegação que não vem da troca de língua (link de projeto, voltar, recarregar, endereço digitado) abre como hoje, com a abertura completa.

### R5. Transição

- O esmaecimento de 250 ms entre páginas (`transicoes.css`) continua o mesmo. A página nova aparece no esmaecimento já na posição de R3, sem pular depois de visível.
- Com `prefers-reduced-motion: reduce`, sem esmaecimento (como hoje) e com a mesma posição.
- A troca de tema (`html[data-tx]`) não muda.

### R6. JS nesta etapa

- A regra de 001a R4 (JS copiados de `site/` sem alteração) ganha uma exceção só para esta fatia: o código de R2 a R4 entra num arquivo novo `public/lingua.js`, carregado com `defer` em todas as páginas que têm troca de língua, mais a leitura de `troca-lingua` em `inicio.js`, que roda no `head` com `blocking="render"`. Nenhuma outra linha dos JS herdados muda.
- Na etapa 3, `lingua.js` vira o módulo `lingua` de 001c R1, com o mesmo comportamento, coberto pelos testes desta parte.
- A paridade de 001a C1 não muda: as capturas abrem cada página do zero, sem `troca-lingua`.

## Critérios de aceite

- C1. Dada a home PT a 1280 px, rolada até o card do InfoHub ficar a 120 px do topo da janela, quando o link "EN" é clicado, então `/en/` abre com o card do InfoHub (`data-ancora="proj-infohub"`) a 120 px do topo, 0 px de diferença. O mesmo a 390 px e no sentido EN para PT.
- C2. Dada qualquer âncora de qualquer página com troca de língua (home e três projetos), PT e EN, 390 e 1280 px, quando a troca acontece com aquela âncora no topo da janela, então a diferença de `top` é 0 px, exceto perto do fim da página (R3).
- C3. Dada a troca de língua, então no primeiro quadro da página nova o nome já está escrito por inteiro, os contadores visíveis mostram o valor final e nenhum elemento visível está no estado escondido da revelação.
- C4. Dada uma navegação comum (abrir `/en/` pelo endereço, clicar num card de projeto, recarregar), então a abertura completa acontece como hoje.
- C5. Dada uma entrada `troca-lingua` com mais de 5 s, ou de outro caminho, então ela é ignorada e apagada, e a página abre como hoje.
- C6. Dado o JS desligado, então o link troca de língua e abre a outra página no topo.
- C7. Dado `dist/`, então cada página com troca de língua tem os mesmos ids de `data-ancora` na mesma ordem em PT e EN, sem id repetido na mesma página.
- C8. Dada a paridade de 001a C1 e os e2e de 001a C4, então tudo segue passando com esta fatia.

## Testes de aceite

| # | Critério | Dado | Ação | Resultado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1 | `dist/` servido, 1280 e 390 px | rolar até `proj-infohub` a 120 px; clicar "EN"; ler `top` do mesmo id | 120 px, diferença 0 | e2e, `scripts/site/lingua.e2e.mjs` |
| T2 | C2 | todas as âncoras da home e dos 3 projetos, PT e EN, 390 e 1280 | para cada âncora: rolar até ela ficar a 80 px do topo, esperar as animações terminarem, trocar e medir o bloco que a R2 escolheu (o primeiro ainda visível, que pode ser o anterior, se ele passa por baixo do cabeçalho) | diferença de até 0,5 px (D3); nas âncoras em que a página chegou ao fim, a rolagem é a máxima | e2e, `lingua.e2e.mjs` |
| T3 | C2 | home PT rolada até o fim | trocar | `/en/` rolada até o fim; teste registra a diferença e passa | e2e, `lingua.e2e.mjs` |
| T4 | C3 | troca a partir de Projetos | capturar o primeiro quadro (`requestAnimationFrame` no `pagereveal`) | nome completo, contadores no valor final, nada visível escondido | e2e, `lingua.e2e.mjs` |
| T5 | C4 | abrir `/en/` direto; clicar num card | observar o nome | a digitação acontece | e2e, `lingua.e2e.mjs` |
| T6 | C5 | `troca-lingua` gravada com horário de 6 s atrás; outra com caminho `/projeto-lms.html` ao abrir `/en/` | abrir a página | abre no topo, com a abertura; a chave não existe mais | e2e, `lingua.e2e.mjs` |
| T7 | C6 | `javaScriptEnabled: false` | clicar "EN" no meio da home | `/en/` no topo | e2e, `lingua.e2e.mjs` |
| T8 | C7 | `dist/` | ler os `data-ancora` de cada par PT e EN | listas iguais, sem repetição | unidade, `scripts/site/lingua.test.mjs` |
| T9 | C8 | `site/` e `dist/` | `npm run e2e` | paridade 0 px e e2e verdes | e2e |

## Fora do escopo

- Trocar o texto no lugar, sem navegar.
- Redirecionamento pela língua do navegador e escolha de língua salva, decididos em 09/11 e não implementados no v1 (fora por ora, decisão de 11/11/2026; spec 000).
- Troca de língua na 404.
