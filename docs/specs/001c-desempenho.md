# Spec 001c: etapa 3, tempo de resposta e teste de desempenho no CI

Estado: aprovada pelo responsável em 11/11/2026.
Parte 4 de 4 da spec 001. Ordem: `001-astro.md`, `001a-paridade.md`, `001b-seo-geo.md`, `001c-desempenho.md` (esta). Decisões P1 a P9 e P3b no índice.

## Objetivo da etapa

O site responde dentro de metas medidas: INP abaixo de 200 ms em menu, botões, cards e troca de tema; rolagem com p95 de quadro até 20 ms; LCP abaixo de 2,5 s; CLS abaixo de 0,1; tudo com CPU 4x mais lenta. Os caminhos: JS só onde anima, GSAP e Lenis carregados sob demanda, fontes locais com subset e preload, imagens otimizadas pelo Astro. Um teste de desempenho no CI falha acima das metas. Um PR só, de `feat/astro-desempenho` para `staging`, depois da etapa 2. No fim desta etapa `site/` e `pages.yml` saem do repositório.

## Fatos

- F1. Pedido de 11/11 (feedback-prototipo.md): no protótipo o clique e a rolagem pareceram lentos; suspeitos medidos lá: `backdrop-filter` e `scrub` na Trajetória.
- F2. Hoje: GSAP 70,7 KB, ScrollTrigger 43,1 KB e Lenis 16,4 KB em `vendor/`, carregados em toda página com `defer`; `main.js` 23,7 KB e `surpresas.js` 24,6 KB; fontes do Google Fonts (Funnel Display 700 a 800, Funnel Sans 400 a 600, Reddit Mono 500) e um segundo `<link>` do Google Fonts com 11 famílias das marcas da Stack, com `text=` (poucos KB cada); imagens `eduardo-gomes.jpg` 33,8 KB, `infohub.jpg` 51,6 KB, `leadgate.png` 38,2 KB, sem `srcset`.
- F3. O runner `ubuntu-latest` tem 2 vCPU e Chrome instalado; o Chromium do Playwright entra em 001a.
- F4. A medição no Chrome do responsável é manual (painel Performance, CPU 4x) e entra no PR como registro, não como teste.
- F5. A paridade de 001a continua valendo nesta etapa, com duas exceções declaradas em R6.

## Metas (requisito de produto)

| Métrica | Meta | Onde | Como se mede |
|---|---|---|---|
| INP | < 200 ms por interação | abrir e fechar o menu do celular; clicar nos botões "Baixar currículo", "copiar e-mail", "Feito com o Claude Code" (abrir e fechar o modal); passar o mouse e clicar num card de projeto; trocar o tema | R5 |
| Quadro na rolagem | p95 ≤ 20 ms | rolagem da home do topo ao fim | R5 |
| LCP | < 2,5 s | home PT e EN, uma página de projeto | R5 |
| CLS | < 0,1 | as mesmas páginas | R5 |

Tudo com `Emulation.setCPUThrottlingRate(4)` e a rede do perfil "mobile" do Lighthouse (4G simulado); viewport 390×844 para celular e 1280×800 para computador; as duas larguras precisam passar.

## Regras

### R1. JavaScript só onde anima

- Os JS de `public/` (001a R4) saem; o código vai para `src/scripts/` como módulos ES empacotados pelo Astro, um por responsabilidade: `inicio` (tema inicial, continua inline e clássico no `head` com `blocking="render"`, porque evita o flash de tema), `tema` (botão e máscara), `menu`, `topo` (nome, frase digitada, foto e inclinação), `revelar` (reveal, parallax, contadores, barra de progresso), `stack` (faixa), `surpresas`, `contato` (copiar e-mail), `rodape` (modal e, da 008, a busca de `/dados/processo.json`).
- Cada componente `.astro` carrega só o módulo que ele usa, com `<script>` do Astro (módulo, adiado, deduplicado por página). Uma página de projeto não baixa `surpresas`, `stack` nem `contato`.
- O comportamento observável de cada módulo é o de hoje: os e2e de 001a C4 são o contrato. Onde o código antigo dependia de ordem de carga (`window.libsReady`, `window.pageShown`), o módulo espera a mesma condição por `Promise`, não por evento global solto.
- Sem React, Preact ou outro framework de ilha; `shadcn` só entraria com React, e não há ilha que precise. Se uma ilha precisar de framework, vira pergunta ao responsável antes de adicionar dependência.

### R2. GSAP, ScrollTrigger e Lenis sob demanda

- As três bibliotecas vêm do npm (`gsap`, `lenis`) e saem de `public/vendor/`. São importadas por `import()` dinâmico num chunk separado, pedido depois do primeiro pintar (`requestIdleCallback`, com `setTimeout(…, 200)` de reserva) e nunca antes do LCP.
- Com `prefers-reduced-motion: reduce`, o `import()` não acontece: nada de GSAP nem Lenis é baixado, e a página fica parada como hoje.
- O reveal e os contadores têm estado inicial visível no HTML (001b R4); o JS esconde e revela quando o GSAP chega. Entre o primeiro pintar e a chegada do GSAP, a página é legível e sem salto (CLS).
- Sem `scrub` ligado a `backdrop-filter`: se um efeito da Trajetória precisar dos dois ao mesmo tempo e a meta de quadro não fechar, é a P6, decisão do responsável, porque muda o visual e a paridade.

### R3. Fontes locais com subset e preload

- Funnel Display (700 e 800), Funnel Sans (400 a 600) e Reddit Mono (500) passam a ser servidas do próprio site, em WOFF2, subset `latin` (o que o site usa: PT e EN com acentos), com `font-display: swap` e `<link rel="preload" as="font" type="font/woff2" crossorigin>` só dos arquivos usados acima da dobra (display 800 e sans 400). Os `preconnect` ao Google Fonts saem. Os arquivos vêm dos pacotes `@fontsource-variable/*` e `@fontsource/*`, que já trazem os subsets por `unicode-range` (P8).
- As 11 famílias das marcas da Stack continuam no Google Fonts com `text=` (cada uma com poucos KB), carregadas pelo `<link>` de hoje, mas com `media="print" onload="this.media='all'"` para não bloquear o render. Ficam no Google Fonts por decisão (P4).
- Paridade: com os mesmos arquivos de fonte (mesma família, mesmos pesos), os glifos são iguais; a captura de 001a R7 espera `document.fonts.ready` nas duas origens.

### R4. Imagens pelo Astro

- `eduardo-gomes.jpg`, `leadgate.png` e `infohub.jpg` passam para `src/assets/` e são renderizadas por `<Image>`/`<Picture>` do Astro com `widths` para 390 e 1280 (e 2x), formato `avif` com `webp` de reserva, `loading="eager"` e `fetchpriority="high"` só na foto do topo (candidata a LCP), `loading="lazy"` nas outras, `width` e `height` sempre preenchidos (CLS). Os prints OG (001b) e o favicon não passam pelo otimizador.
- Paridade: a compressão muda pixels dentro da imagem. A captura de 001a R7 ganha `mask: [page.locator('img')]` nas duas origens, com cor de máscara fixa; a caixa da imagem (tamanho e posição) continua comparada, porque a máscara cobre só o retângulo do `<img>`.

### R5. Método de medição

Script `scripts/site/desempenho.e2e.mjs` (Playwright, Chromium do `playwright`, CDP), chamado por `npm run desempenho` contra `dist/` servido em `127.0.0.1`:

1. Para cada página e viewport: `Emulation.setCPUThrottlingRate(4)` e `Network.emulateNetworkConditions` com o perfil 4G do Lighthouse (latência 150 ms, 1,6 Mb/s de descida, 750 kb/s de subida). Cache de rede limpo por contexto.
2. LCP e CLS: `lighthouse` (pacote npm) em modo navegação, `--throttling.cpuSlowdownMultiplier=4`, preset `mobile` para 390 px e `desktop` com CPU 4x para 1280 px, 5 execuções; a métrica é a mediana. Falha se mediana de LCP ≥ 2500 ms ou de CLS ≥ 0,1.
3. INP: na página carregada e com o GSAP já importado (espera o chunk pela `Promise` de R1), injeta um `PerformanceObserver` de `event` com `durationThreshold: 16`. Executa cada interação da tabela de metas 6 vezes (a primeira é aquecimento e é descartada), com 500 ms entre elas, por `page.mouse` e `page.keyboard` (clique real, como o e2e da foto). Por interação, a medida é a mediana de `duration` das 5 execuções; falha se qualquer mediana ≥ 200 ms. O relatório lista as cinco medidas de cada interação.
4. Quadro na rolagem: na home, injeta um laço de `requestAnimationFrame` que grava o intervalo entre quadros, rola do topo ao fim com `page.mouse.wheel(0, 120)` a cada 16 ms até `scrollY` parar de crescer, calcula o p95 dos intervalos. Falha se p95 > 20 ms. 3 execuções; vale a mediana dos p95.
5. Saída: JSON em `scripts/site/desempenho/saida/relatorio.json` (pasta no `.gitignore`) e tabela no stdout; o CI sobe o JSON como artefato.

Variação do runner: o `ubuntu-latest` com 2 vCPU e CPU 4x pode oscilar. A regra é a mediana de execuções repetidas, não "repete até passar". Se o job falhar duas vezes em duas semanas com o `dist/` sem mudança, a meta de CI ganha 10% (INP 220 ms, quadro 22 ms); a meta de produto fica a mesma, medida no Chrome do responsável (P5).

No Chrome do responsável (F4): painel Performance, CPU 4x, mesmas interações; o PR registra INP e o maior quadro de rolagem vistos; a meta é a mesma. Divergência grande entre o CI e o Chrome dele (uma passa, a outra falha) é anotada no PR e não bloqueia o merge sozinha.

### R6. Paridade no fim da etapa

001a C1 continua obrigatório, com duas exceções declaradas e mecânicas: a máscara de `<img>` (R4) e os arquivos de fonte locais no lugar dos do Google (R3; glifos iguais). Nenhuma outra diferença: `backdrop-filter`, sombras, vidro e posições ficam. Se a meta não fechar sem mudar o visual, P6.

### R7. Fim de `site/` e de `pages.yml`

No PR desta etapa, depois de C1 a C7 passarem: `site/` sai do repositório, `pages.yml` sai, `scripts/site/paridade.e2e.mjs` sai (não há mais referência), e `ci.yml` e `publicar.yml` perdem os passos que citam `site/`. Os `.e2e.mjs` seguem contra `dist/`. Quem edita os workflows é a sessão principal com ok do responsável. A reversão depois disso é reverter o merge desta etapa (o site da etapa 2 volta), não mais voltar ao `site/` estático.

### R9. Preflight do Tailwind

O Preflight entra nesta etapa (P1): `global.css` passa a importar o Tailwind completo, com o reset dele. As regras de `style.css` que mudam por causa do reset (margens de título, `line-height`, `box-sizing`, listas, botões) são reescritas até a paridade de 001a C1 voltar a 0 pixels fora das exceções de R6. O reset antigo de `style.css` sai no que o Preflight cobre. Se uma diferença não fechar, é decisão do responsável com nova base aprovada, como em R6.

### R8. CI

`ci.yml` ganha o job `desempenho` (depois do `build`, com `npm run desempenho`), que falha o PR acima das metas. `publicar.yml` não roda o desempenho (o deploy publica o que o PR já aprovou). Tempo estimado do job: 5 execuções do Lighthouse × 3 páginas × 2 viewports e as interações, em torno de 10 minutos; `timeout-minutes: 20`.

## Critérios de aceite

- C1. Dado `dist/` servido, quando `npm run desempenho` roda, então o relatório mostra INP mediana < 200 ms em cada interação da tabela de metas, p95 de quadro ≤ 20 ms, LCP < 2,5 s e CLS < 0,1 nas 3 páginas × 2 viewports, e o comando sai com 0.
- C2. Dado um `dist/` com um `while` de 300 ms injetado no clique do tema (fixture), quando o script roda, então falha nomeando a interação `tema` com a mediana medida (caso rejeitado).
- C3. Dado `dist/`, então nenhum HTML referencia `/vendor/`, `/main.js`, `/surpresas.js`, `/tema.js` ou `/rodape.js`; `public/vendor/` não existe; os chunks de GSAP e Lenis existem em `dist/_astro/` como arquivos separados do código do site (teste `scripts/site/build.test.mjs`).
- C4. Dado o site servido com `reducedMotion: 'reduce'`, quando a home carrega e rola até o fim, então nenhuma requisição de rede pede um chunk com `gsap` ou `lenis` no nome (e2e `scripts/site/sob-demanda.e2e.mjs`). Dado movimento normal, então os chunks são pedidos depois do evento `load` e a página de projeto não pede `surpresas`.
- C5. Dado `dist/index.html`, então não há `<link>` para `fonts.googleapis.com` das três fontes do site; existem `preload` dos WOFF2 de display 800 e sans 400 com `crossorigin`; os arquivos estão em `dist/_astro/` ou `dist/fontes/`; o `<link>` das fontes das marcas tem `media="print"` (teste `build.test.mjs`).
- C6. Dado `dist/`, então cada `<img>` das três imagens tem `width`, `height`, `srcset` com ao menos duas larguras, e a foto do topo tem `fetchpriority="high"`; as outras `loading="lazy"` (teste `build.test.mjs`).
- C7. Dado `npm run e2e` com a máscara de R4, então a paridade de 001a C1 passa (0 px fora da máscara, dimensões iguais) e todos os e2e passam.
- C8. Dado o PR da etapa 3 mesclado, então `site/`, `pages.yml` e `paridade.e2e.mjs` não existem mais, `ci.yml` tem o job `desempenho`, e `https://gomesbeduardo.github.io/` responde 200 com o build novo (manual no PR).
- C9. Dado o Chrome do responsável com CPU 4x, então as interações da tabela ficam abaixo de 200 ms e o pior quadro de rolagem registrado fica abaixo de 20 ms (manual, registro no PR).
- C10. Dado `src/styles/global.css` da etapa 3, então ele importa o Preflight do Tailwind, e a paridade de C7 passa com ele ligado (teste `scripts/site/tema-tailwind.test.mjs` atualizado e `npm run e2e`).

## Testes de aceite

| # | Critério | Dado | Ação | Resultado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1 | `dist/` | `npm run desempenho` | tabela com todas as linhas `ok`; `relatorio.json`; saída 0 | e2e, `desempenho.e2e.mjs` |
| T2 | C2 | fixture com bloqueio de 300 ms no tema | mesmo comando | linha `tema 390 INP <n> ms FALHA`, saída 1 | e2e, rodado à mão uma vez e registrado no PR |
| T3 | C3, C5, C6 | `dist/` | `node --test scripts/site/build.test.mjs` | sem `/vendor/` nem JS clássico; chunks separados; preload das fontes; `srcset` e atributos das imagens | unidade |
| T4 | C4 | `dist/` servido, reduced-motion | `node scripts/site/sob-demanda.e2e.mjs --raiz dist` | 0 requisições com `gsap` ou `lenis`; com movimento normal, pedidas depois de `load`; projeto sem `surpresas` | e2e |
| T5 | C7 | `site/` e `dist/` | `npm run e2e` | paridade 0 px com máscara; e2e verdes | e2e |
| T6 | C1 | `dist/` no CI | job `desempenho` do `ci.yml` | verde, artefato `relatorio.json` | CI, no PR |
| T7 | C8, C9 | PR e site publicado | leitura do repositório; `curl`; painel Performance | arquivos ausentes; 200; números registrados | manual, no PR |
| T8 | C10 | `global.css` e `dist/` | `node --test scripts/site/tema-tailwind.test.mjs` e `npm run e2e` | Preflight importado; paridade 0 px | unidade e e2e |

## Fora do escopo da etapa 3

- Fundo com nuances, grão e brilho (spec própria de UI, depois desta).
- Reduzir `backdrop-filter` ou `scrub` (só por P6, com reaprovação).
- Service worker, cache offline, CDN, domínio próprio.
- Medição em campo (RUM) ou analytics.
- Framework de ilha (React) e `shadcn`.
