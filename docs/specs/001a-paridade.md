# Spec 001a: etapa 1, Astro e Tailwind com paridade do site atual

Estado: rascunho, aguardando aprovação do responsável.
Parte 2 de 4 da spec 001. Ordem: `001-astro.md` (índice, decisões, regras transversais), `001a-paridade.md` (esta), `001b-seo-geo.md`, `001c-desempenho.md`. As decisões P1 a P9 e a pendência P3b estão no índice.

## Objetivo da etapa

O site publicado em `site/` (HTML, CSS e JS sem framework) passa a ser gerado pelo Astro, com os tokens do `site/style.css` no tema do Tailwind v4, e o resultado em `dist/` fica igual ao `site/` em pixel e em comportamento. Um PR só, de `feat/astro-paridade` para `staging`.

## Referência de paridade

- F1. A referência é `site/` na `staging` no momento em que a etapa 1 começa, não o `site/` de hoje. Hoje (11/11/2026) a `staging` ainda não tem a spec 006 (contato e rodapé, branch `feat/contato-rodape`), a correção do menu animado (#14, `fix/menu-animado`), a spec 007 (correções CodeRace e YourMentor) nem a spec 008 (números do processo). A etapa 1 só começa depois que essa fila entra na `staging`, e o worker lê a referência de lá.
- F2. `site/` fica no repositório, sem mudança, até o fim da etapa 3 (001c). Toda comparação desta spec captura `site/` e `dist/` na mesma execução, com o mesmo Chromium; nenhum PNG de base é versionado.
- F3. Páginas da referência (9): `index.html`, `projeto-leadgate.html`, `projeto-infohub.html`, `projeto-lms.html`, `404.html` e, em `en/`, as mesmas quatro primeiras. Mais `favicon.svg`, `.nojekyll`, `img/` (3 imagens), `curriculo/` (2 PDFs), `vendor/` (gsap, ScrollTrigger, lenis), `style.css`, `surpresas.css`, `transicoes.css`, `inicio.js`, `tema.js`, `main.js`, `surpresas.js`, `rodape.js`. Depois da fila de F1 entram os arquivos das specs 006 a 008 (o que elas acrescentarem em `site/`, inclusive `site/dados/processo.json` gerado no deploy).
- F4. Carga de JS hoje: `inicio.js` no `head` como script clássico com `blocking="render"`; `gsap.min.js`, `lenis.min.js` e `tema.js` com `defer` no `head`; `main.js`, `surpresas.js` e `rodape.js` com `defer` no fim do `body`; `ScrollTrigger.min.js` só com `preload` e injetado por `inicio.js`. Nenhum `type="module"`. As páginas de projeto não carregam `surpresas.*` nem `rodape.js`; a 404 carrega `/style.css` e `/inicio.js` por caminho absoluto.
- F5. Tema: `inicio.js` grava `html[data-theme]` só quando há tema salvo em `localStorage.tema` e sempre grava `html[data-mode]`. O CSS escuro existe em dois blocos: `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` e `:root[data-theme="dark"]`.
- F6. Testes atuais: `scripts/site/cabecalho.test.mjs`, `celular.test.mjs`, `conteudo.test.mjs`, `foto.test.mjs`, `tema.test.mjs` (todos `node:test`, sem dependência, lendo `site/*` por regex, menos `tema.test.mjs`, que roda `inicio.js` e `tema.js` num `node:vm`); `scripts/site/foto.e2e.mjs` (Playwright, serve `site/` por `node:http` em `127.0.0.1:<porta>`, fora do glob do `node --test`). A fila de F1 acrescenta ao menos um e2e do menu do celular (`fix/menu-animado`) e os testes das specs 006 e 008.
- F7. Não existe `package.json`; `ci.yml` e `publicar.yml` já chamam `npm ci` e `npm run build` e já gravam os PDFs em `public/curriculo/` (`.gitignore` ignora `public/curriculo/*.pdf`, `dist/` e `.astro/`).

## Regras

### R1. Estrutura do projeto Astro

Recomendação técnica (o worker pode mudar nomes internos; URLs e comportamento não mudam):

- `astro.config.mjs`: `site: 'https://gomesbeduardo.github.io'`, `output: 'static'`, `build.format: 'file'`, `trailingSlash: 'ignore'`, `i18n: { defaultLocale: 'pt', locales: ['pt', 'en'], routing: { prefixDefaultLocale: false } }`, plugin `@tailwindcss/vite` em `vite.plugins`.
- `src/pages/index.astro`, `projeto-leadgate.astro`, `projeto-infohub.astro`, `projeto-lms.astro`, `404.astro`; `src/pages/en/` com as quatro primeiras. Com `build.format: 'file'` as saídas são `dist/index.html`, `dist/projeto-leadgate.html`, `dist/en/index.html`, `dist/en/projeto-leadgate.html`, `dist/404.html`, e as URLs públicas ficam as de hoje (R2).
- `src/layouts/Base.astro`: `head`, cabeçalho, rodapé, carga de CSS e JS. `src/components/`: uma pasta por seção (`Topo`, `Sobre`, `Trajetoria`, `Experiencia`, `Stack`, `Projetos`, `NumerosGithub`, `Contato`, `Rodape`, `ModalSobreSite`).
- Textos em `src/i18n/pt.ts` e `src/i18n/en.ts` (um objeto por língua, mesmas chaves); cada componente recebe `lang` e lê o dicionário. Suposição de baixo impacto: as páginas PT e EN de hoje têm a mesma estrutura e só mudam os textos; onde a estrutura diferir, o componente recebe a diferença por prop, sem duplicar a página.
- `public/`: `favicon.svg`, `.nojekyll`, `img/`, `vendor/`, `inicio.js`, `tema.js`, `main.js`, `surpresas.js`, `rodape.js`, `dados/` (008) e `curriculo/` (gerado, R6). Na etapa 1 os JS ficam byte a byte iguais aos de `site/`, servidos nos mesmos caminhos (R4).
- `src/styles/global.css`: `@import "tailwindcss/theme"` e `@import "tailwindcss/utilities"`, o bloco `@theme` (R3), e o conteúdo de `style.css`, `surpresas.css` e `transicoes.css`, nessa ordem, em `@layer components`. O Astro gera um CSS só em `dist/_astro/*.css`, carregado no `head` no lugar dos três `<link>` de hoje.

### R2. URLs idênticas

| Hoje | Depois | Como |
|---|---|---|
| `/` e `/index.html` | iguais | `src/pages/index.astro` |
| `/en/` e `/en/index.html` | iguais | `src/pages/en/index.astro` |
| `/projeto-leadgate.html` (e infohub, lms, PT e EN) | iguais | `build.format: 'file'` |
| `/404.html` | igual; o Pages serve na URL inexistente | `src/pages/404.astro` |
| `/favicon.svg`, `/.nojekyll`, `/img/*`, `/vendor/*`, `/*.js`, `/curriculo/*.pdf`, `/dados/processo.json` | iguais | `public/` |
| `/style.css`, `/surpresas.css`, `/transicoes.css` | saem; vira `/_astro/<nome>.<hash>.css` | import no layout |

Nenhum redirecionamento é criado. Link interno nas páginas continua apontando para `.html` como hoje.

### R3. Tokens no tema do Tailwind v4

- O bloco `@theme` declara os tokens de `site/style.css` `:root` com os nomes do Tailwind: cores (`--color-bg: var(--bg)`, `--color-bg-2`, `--color-raised`, `--color-fg`, `--color-muted`, `--color-muted-2`, `--color-line`, `--color-line-strong`, `--color-accent`, `--color-on-accent`, `--color-card`, `--color-hi`, `--color-edge`), espaços (`--spacing-s1: 4px` a `--spacing-s11: 160px`, mais `section`, `after-h2`, `gutter`, `col-gap`, `wrap`), raios (`--radius-sm: 8px`, `--radius-md: 14px`, `--radius-pill: 999px`), tipos (`--text-body`, `small`, `h3`, `h2`, `display`, `label`, `data`), fontes (`--font-display`, `--font-sans`, `--font-mono` com as mesmas pilhas de fallback) e `--ease: cubic-bezier(.16,1,.3,1)`.
- Os valores vêm da paleta P1 Ocre, já em `site/style.css` e em `docs/design/paletas-pesquisa.md`: claro `#e9e1d2`, `#e0d6c4`, `#f1ebdf`, `#241d14`, `#5c503d`, `#c9bda6`, `#a89c86`, acento `#8a4f00` sobre `#fff8ec`; escuro `#15120e`, `#1b1712`, `#221d17`, `#f1e9dc`, `#b0a592`, `#3a3228`, `#5d5548`, acento `#e4a843` sobre `#17110a`. Nenhum valor novo.
- Os nomes antigos (`--bg`, `--s4`, `--r-md`, `--t-h2`, `--f-mono`, `--ease` etc.) continuam definidos em `:root`, porque o CSS herdado e os JS de `public/` os usam. As cores que mudam com o tema ficam nas variáveis antigas, com os dois blocos escuros de F5 mantidos; o `@theme` só aponta para elas. Assim `bg-bg`, `text-fg` e os demais utilitários trocam de tema sem CSS extra.
- A variante `dark:` do Tailwind é redefinida com `@custom-variant dark` para casar exatamente os dois seletores de F5. A variante não é obrigatória na etapa 1, porque as cores já trocam pelas variáveis.
- O Preflight (reset do Tailwind) fica fora na etapa 1: ele muda margens, `line-height`, `box-sizing` de elementos e quebraria a paridade; o reset é o que já existe em `style.css`. Ele entra na etapa 3 (P1, 001c R9).
- Conversão de regras para utilitários: permitida por componente, desde que o resultado passe em C1 a C4; não é exigida. Markup novo usa utilitário e token, nunca valor literal quando há token. Nenhum `<select>`, `<button>` ou `<input>` nativo ganha estilo à mão fora do que `style.css` já faz.

### R4. JavaScript sem mudança de comportamento

- Os cinco JS e os três `vendor/` são copiados para `public/` sem alteração e carregados pelo layout com `<script is:inline>` nas mesmas posições, atributos e ordem de F4 (`blocking="render"` em `inicio.js`, `defer` nos outros, `preload` do ScrollTrigger). O Astro não empacota nem adia esses scripts.
- `index.html` tem um `<script type="application/json" id="cal-dados">` com o calendário que `main.js` desenha. No Astro esse JSON é gerado no build a partir de `src/data/github.json` (R5), com a mesma forma que `main.js` lê hoje.
- Os ids, classes e atributos `data-*` que os JS e os testes usam (`#theme-toggle`, `#copy-email`, `#claude-btn`, `#sobre-site`, `.photo[data-flip]`, `#sp-foto`, `.photo-card`, `.top`, `.traj-card`, `.sp-mais`, `.links`, os da fila de F1) ficam iguais no HTML gerado.
- Mover os JS para `src/` como ilhas, empacotar, e carregar GSAP e Lenis sob demanda é etapa 3 (001c), não etapa 1.

### R5. Dados lidos no build

- `src/data/github.json` (contrato da spec 002, `versao: 1`): o componente `NumerosGithub` importa o JSON no build. Se `versao !== 1`, o build falha com a mensagem `github.json: versão X desconhecida; esperada 1`. Se `amostra === true`, a seção mostra, logo abaixo do título, o aviso em mono no estilo `.sec-label`: PT "Dados de exemplo: a coleta real entra com a spec 002." e EN "Sample data: real numbers arrive with spec 002." (texto inferido, baixo impacto). Com `amostra === false`, sem aviso. A data da coleta aparece como `dd/mm/aaaa` no fuso `America/Sao_Paulo`, como a 002 pede. A seção fica onde está hoje, entre Projetos e Contato (h2 "Números do GitHub"). O que mais a 002 delega (calendário sem JS) fica para a implementação da 002, depois desta etapa.
- Os números de `site/index.html` hoje são fixos no HTML. Antes de capturar a base, um commit pequeno em `site/` alinha os números e o `#cal-dados` com `src/data/github.json`, e a base e o build usam o mesmo JSON, sem nova coleta entre os dois (P2). Em 11/11 os números já coincidiam (2897 e 12); o calendário não foi conferido.
- `src/data/curriculo.json`: na etapa 1 não alimenta o HTML (o HTML de hoje é escrito à mão); só o gerador de PDF o lê (R6). Passa a alimentar o texto na etapa 2 (001b R5).
- `public/dados/processo.json` (spec 008): gerado no CI antes do `astro build`, pelo gerador que a 008 define, com `--saida public/dados/processo.json` (ou o caminho que a 008 fixar); o Astro só copia para `dist/dados/processo.json`. A página continua buscando `/dados/processo.json` em tempo de execução, como a 008 manda; nada é lido no build. Em `dev` e em build local sem o arquivo, a página fica como a 008 descreve para 404 (parágrafo `hidden`).

### R6. PDFs do currículo (specs 003 e 004)

`node scripts/curriculo/gerar.mjs` continua rodando antes do `astro build` (já é assim em `ci.yml` e `publicar.yml`) e grava em `public/curriculo/`; o Astro copia para `dist/curriculo/`. Os links "Baixar currículo" apontam para `/curriculo/curriculo-eduardo-gomes-pt.pdf` e `-en.pdf`, como hoje. Os PDFs versionados em `site/curriculo/` ficam como referência até a etapa 3, sem link do novo site para eles. Suposição: `gerar.mjs` não depende de `site/`; se depender (imagem da foto), o caminho passa a `public/img/` sem mudar a saída.

### R7. Comparação de capturas

Script `scripts/site/paridade.e2e.mjs` (Playwright, mesma forma de carregar o `playwright` de `foto.e2e.mjs`):

1. Sobe dois servidores `node:http` em `127.0.0.1`, um servindo `site/` e outro `dist/`, com o mesmo mapa de content-type.
2. Para cada combinação de página (9 de F3), largura (390 px e 1280 px; altura 844 e 800) e tema (claro e escuro): abre um `browser.newContext` com `viewport`, `deviceScaleFactor: 1`, `reducedMotion: 'reduce'`, `colorScheme` igual ao tema, e um `addInitScript` que grava `localStorage.tema` com o tema (assim `data-theme` e `data-mode` ficam fixos). Carrega a página, espera `document.fonts.ready`, `networkidle` e mais 2500 ms (a intro, como em `foto.e2e.mjs`), injeta `*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }`, rola até o fim e volta ao topo (para o que depende de rolagem ter rodado), e captura `fullPage: true` em PNG.
3. Faz o mesmo na outra origem, no mesmo contexto de opções, e compara as duas imagens com `pixelmatch` (`threshold: 0.1`, `includeAA: false`).
4. Falha se as dimensões diferem ou se o número de pixels diferentes é maior que 0. Em falha, grava `site.png`, `dist.png` e `diff.png` em `scripts/site/paridade/saida/<pagina>-<lang>-<largura>-<tema>/` (pasta no `.gitignore`), e o CI sobe a pasta como artefato.

Tolerância, definida uma vez: um pixel "difere" quando a distância de cor no espaço YIQ do `pixelmatch` passa de 0,1 (10% da distância máxima) e o pixel não é classificado como anti-aliasing (vizinhança com o gradiente de borda de glifo). Por que isso e não zero absoluto: no mesmo Chromium, o mesmo HTML e CSS produzem bytes idênticos; a única fonte de ruído legítima é o sub-pixel do texto quando a posição de uma caixa muda por fração de pixel por causa de arredondamento do CSS gerado (o Tailwind grava `0.25rem` onde havia `4px`, por exemplo). O limiar de 0,1 absorve diferença de composição de cor com alfa (`--card`, `--hi`, `--edge` usam `/.6`, `/.7`); `includeAA: false` absorve o sub-pixel; qualquer diferença de posição, tamanho, cor sólida ou conteúdo fica acima do limiar e conta. Nenhuma tolerância de contagem: 0 pixels.

Determinismo: `reducedMotion: 'reduce'` desliga o giro, o reveal, a frase digitada e a faixa da stack (PRODUCT.md, acessibilidade: a página inteira fica parada e o texto animado mostra a versão final). O ano do rodapé e as datas vêm do mesmo relógio nas duas capturas. As duas origens carregam as mesmas fontes do Google Fonts; `document.fonts.ready` garante que o texto não é capturado em fallback. O Chromium é o do `playwright` fixado no `package-lock.json`; o script imprime `browser.version()` no início.

### R8. Testes existentes contra `dist/`

Cada e2e aceita o diretório a servir por `--raiz <dir>` (padrão `dist`) e é chamado por `npm run e2e`, que roda todos os `scripts/site/*.e2e.mjs` contra `dist/` depois de `npm run build`. Destino de cada teste estático:

| Arquivo | O que confere hoje | Destino |
|---|---|---|
| `scripts/site/conteudo.test.mjs` | textos PT e EN, modal, foto, Trajetória, privacidade, Stack, ficha do verso (005 A6 lê `surpresas.js`) | lê `dist/index.html`, `dist/en/index.html` e `public/surpresas.js`; roda depois do build (`npm test` faz `astro build` antes) |
| `scripts/site/celular.test.mjs` | alvos de 44 px e larguras por regex no CSS; `nbsp` por regex no HTML | parte do HTML lê `dist/`; parte do CSS vira `scripts/site/celular.e2e.mjs`, que mede `getBoundingClientRect` dos alvos de toque a 390 px (altura e largura ≥ 44) e `scrollWidth <= clientWidth` do `html`. Justificativa: sob Tailwind a regra pode virar utilitário e a regex não a acha; a medida no navegador confere o resultado, não o texto do CSS |
| `scripts/site/cabecalho.test.mjs` | classes de estado do `.top` escopadas em `.top` no CSS | removido. Justificativa: é uma regra de higiene do CSS escrito à mão; com utilitários não há seletor de estado solto para escapar. O comportamento que ela protegia (estado do cabeçalho não vaza para outro elemento) é coberto pelo e2e do menu (`fix/menu-animado`) e por C4 |
| `scripts/site/foto.test.mjs` | marcação da foto no HTML, `backface-visibility`, `--ease`, reduced-motion e `inert` por regex em CSS e JS | parte do HTML lê `dist/`; parte do JS lê `public/surpresas.js`; as regras de CSS viram asserções em `foto.e2e.mjs` (`getComputedStyle(...).backfaceVisibility === 'hidden'`; sem `transform` de rotação sob reduced-motion, já em 005 A4) |
| `scripts/site/tema.test.mjs` | `inicio.js` e `tema.js` em `node:vm` | mantido, apontando para `public/inicio.js` e `public/tema.js` |
| `scripts/curriculo/curriculo.test.mjs`, `scripts/github/coletar.test.mjs` | currículo e coletor | sem mudança |
| testes que a fila de F1 trouxer | specs 006, 008 e menu | mesma regra: HTML lê `dist/`; CSS por regex vira e2e; JS lê `public/` |

`package.json` ganha `"test": "astro build && node --test 'scripts/**/*.test.mjs'"` e `"e2e": "node scripts/site/paridade.e2e.mjs && for f in scripts/site/*.e2e.mjs; ..."` (um runner `scripts/site/e2e.mjs` que chama cada arquivo em sequência e para no primeiro erro). O CI instala o Chromium do Playwright (`npx playwright install --with-deps chromium`) antes do `e2e`.

### R9. Sem JavaScript

Com JS desligado, o HTML gerado mostra o mesmo texto que `site/` mostra sem JS hoje. A etapa 1 não melhora nem piora isso; a regra de "todo texto legível sem JS" é critério da etapa 2 (001b R4).

### R10. Troca de deploy e reversão

- No PR da etapa 1, `pages.yml` passa a disparar só por `workflow_dispatch` (deixa de publicar `site/` no push), e `publicar.yml` volta a disparar em `push` na `main` e `workflow_dispatch`. O `schedule` semanal (segunda, 06:00 UTC) também liga nesta etapa (P7): o responsável cria o secret `GH_TOKEN_LEITURA` antes do merge, o run agendado roda o coletor com `--estrito` e faz o commit semanal de `src/data/github.json` na `main` (002 R8). No push, o job `coletar` roda sem `--estrito`: se a coleta falhar, ele avisa e mantém o `github.json` existente (002 R6), e o build segue.
- `ci.yml` ganha, depois dos testes e dos PDFs: `npm ci`, `npm run build`, instalação do Chromium e `npm run e2e`; sobe `scripts/site/paridade/saida/` como artefato quando existir.
- Reversão: reverter o commit de merge na `main` devolve `pages.yml` ao push e republica `site/`, que não mudou. Nenhum outro passo.
- Quem edita os workflows é a sessão principal com o ok do responsável; o worker entrega o diff proposto no PR sem aplicá-lo.

## Critérios de aceite

- C1. Dado `npm run build` com `src/data/github.json` atual e os PDFs gerados, quando `scripts/site/paridade.e2e.mjs` roda, então as 36 comparações (9 páginas × 2 larguras × 2 temas) terminam com 0 pixels diferentes e dimensões iguais (R7).
- C2. Dado `dist/`, então existem exatamente os arquivos de R2 nos caminhos de hoje, `dist/.nojekyll` existe, `dist/404.html` existe, e `dist/_astro/` tem um único `.css` (teste `scripts/site/build.test.mjs`).
- C3. Dado `dist/`, então nenhum HTML referencia `style.css`, `surpresas.css` ou `transicoes.css`, e cada HTML carrega os scripts de F4 com os mesmos atributos e na mesma ordem relativa que o HTML equivalente em `site/` (teste `build.test.mjs` comparando a lista de `<script>` extraída dos dois).
- C4. Dado `dist/` servido, quando todos os `scripts/site/*.e2e.mjs` rodam com `--raiz dist`, então todos passam, inclusive os da fila de F1.
- C5. Dado `npm test`, então todos os testes estáticos de R8 passam lendo `dist/` e `public/`, e nenhum lê `site/`.
- C6. Dado `src/data/github.json` com `versao: 2`, quando `npm run build` roda, então falha com a mensagem de R5. Dado `amostra: true`, então `dist/index.html` e `dist/en/index.html` têm o aviso de R5; dado `amostra: false`, não têm (teste `build.test.mjs` com fixture).
- C7. Dado `public/dados/processo.json` presente antes do build, então `dist/dados/processo.json` é idêntico; ausente, o build passa e `dist/dados/` não existe.
- C8. Dado `npm run build` depois de `node scripts/curriculo/gerar.mjs`, então `dist/curriculo/curriculo-eduardo-gomes-pt.pdf` e `-en.pdf` existem e os links "Baixar currículo" do HTML apontam para eles.
- C9. Dado `src/styles/global.css`, então o `@theme` tem todos os tokens de R3 com os valores de `site/style.css`, sem valor de cor, espaço ou raio fora dessa lista; `:root` mantém os nomes antigos; não há `@import "tailwindcss"` nem `@import "tailwindcss/preflight"` (teste `scripts/site/tema-tailwind.test.mjs`, regex no CSS fonte).
- C10. Dado o PR da etapa 1, então `pages.yml` tem só `workflow_dispatch` em `on`, `publicar.yml` tem `push` em `main`, `workflow_dispatch` e o `schedule` da 002, o secret `GH_TOKEN_LEITURA` existe no repositório, `ci.yml` roda `npm run build` e `npm run e2e`, e todo `uses:` segue fixado por SHA de 40 hexadecimais (leitura manual do YAML, registrada no PR).
- C11. Dado o merge na `main` e o run do `publicar.yml`, então `https://gomesbeduardo.github.io/`, `/en/`, `/projeto-leadgate.html`, `/en/projeto-lms.html`, `/curriculo/curriculo-eduardo-gomes-pt.pdf` e `/dados/processo.json` respondem 200 e uma URL inexistente responde 404 com a página 404 do site (conferência manual do responsável, registrada no PR).

## Testes de aceite

| # | Critério | Dado | Ação | Resultado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1 | `site/` e `dist/` servidos | `node scripts/site/paridade.e2e.mjs` | 36 linhas `ok <pagina> <lang> <largura> <tema> 0 px`, saída 0 | e2e, `paridade.e2e.mjs` |
| T2 | C1 | `dist/index.html` com um `padding` alterado em 1 px no `.top` | mesmo comando | falha em `index pt 1280 claro` com `diff.png` gravado; conta > 0 | e2e, caso de rejeição rodado à mão uma vez e registrado no PR |
| T3 | C2, C3 | `dist/` | `node --test scripts/site/build.test.mjs` | lista de arquivos igual à de R2; scripts e atributos iguais aos de `site/` | unidade |
| T4 | C4 | `dist/` | `npm run e2e` | todos os `*.e2e.mjs` passam | e2e |
| T5 | C5 | repositório | `grep -rn "site/" scripts/site/*.test.mjs` | nenhuma ocorrência fora de comentário | manual |
| T6 | C6 | fixture `versao: 2` | `astro build` | código 1 e a mensagem de R5 | integração, `build.test.mjs` |
| T7 | C6 | fixture `amostra: true` | `astro build` | o aviso PT e EN de R5 no HTML; com `amostra: false`, ausente | integração |
| T8 | C7, C8 | `public/dados/processo.json` e `public/curriculo/*.pdf` presentes | `astro build` | os três arquivos em `dist/` byte a byte iguais | unidade |
| T9 | C9 | `src/styles/global.css` | `node --test scripts/site/tema-tailwind.test.mjs` | tokens e valores batem; sem preflight | unidade |
| T10 | C10 | os três YAML | leitura e `grep -n "uses:"` | conforme C10 | manual, no PR |
| T11 | C11 | site publicado | `curl -o /dev/null -w "%{http_code}"` nas URLs de C11 | 200; URL inexistente 404 | manual, no PR |

## Fora do escopo da etapa 1

- Qualquer melhoria de SEO, GEO ou desempenho (001b e 001c).
- Empacotar ou adiar JS, ilhas, fontes locais, imagens otimizadas (001c).
- Preflight do Tailwind (etapa 3) e conversão total do CSS para utilitários.
- Implementar a spec 002 (coleta, calendário sem JS) e a 008 (gerador); a etapa 1 só lê os JSON.
- Remover `site/` e `pages.yml` (fim da etapa 3).
