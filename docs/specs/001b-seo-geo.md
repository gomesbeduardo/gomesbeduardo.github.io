# Spec 001b: etapa 2, SEO e GEO

Estado: aprovada pelo responsável em 11/11/2026. Alteração de 12/11/2026 (favicon com a marca pessoal em R8, C10, T13 e T14; fundo da imagem OG em R2 e P10) aprovada pelo responsável em 12/11/2026.
Parte 3 de 5 da spec 001. Ordem: `001-astro.md`, `001a-paridade.md`, `001b-seo-geo.md` (esta), `001c-desempenho.md`. Decisões P1 a P9 e P3b no índice.

## Objetivo da etapa

O site gerado pelo Astro passa a ser indexável e legível por buscadores e por assistentes de IA (GEO): mapa do site, `robots.txt`, dados estruturados, `hreflang`, canonical, Open Graph com imagem por página, `llms.txt`, título e descrição únicos por página, todo texto no HTML do build, e fatos iguais entre site, currículo e LinkedIn. Um PR só, de `feat/astro-seo` para `staging`, depois da etapa 1 entrar na `staging`.

A paridade de 001a (C1 e C4) continua valendo no fim desta etapa: tudo aqui entra no `head`, em arquivos novos ou em texto já visível; onde o texto muda (R5), a diferença é declarada no PR e a base (`site/`) recebe o mesmo texto antes da captura.

## Fatos

- F1. Endereço: `https://gomesbeduardo.github.io`, sem domínio próprio (PRODUCT.md). PT em `/`, EN em `/en/`.
- F2. Perfis: GitHub `gomesbeduardo`, LinkedIn em `src/data/curriculo.json` (`comum.linkedin`), e-mail `comum.email`. Projetos públicos: `gomesbeduardo/leadgate` e `gomesbeduardo/infohub-inovamf` (PRODUCT.md); o LMS tem página (`projeto-lms.html`) e fica "em validação" na CentralEng, sem repositório público citado.
- F3. Hoje `site/` não tem `robots.txt`, `sitemap`, JSON-LD, `hreflang` nem `llms.txt` (inventário de 11/11/2026). Suposição: existem `<title>` e `<meta name="description">` em cada página de hoje; se não existirem, a etapa cria.
- F4. `src/data/curriculo.json` é a fonte do currículo e dos PDFs (specs 003 e 004), com `pt` e `en` de mesmas chaves (`resumo`, `experiencia`, `projetos`, `premios`, `formacao`, `stack` etc.).
- F5. A seção "Números do GitHub" desenha o calendário por JS em `main.js` a partir do JSON inline `#cal-dados` (001a R4); os números de contagem ficam como texto no HTML.

## Regras

### R1. Arquivos de indexação

- `robots.txt` em `public/`, conteúdo exato:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://gomesbeduardo.github.io/sitemap-index.xml
  ```
  Nenhum bloqueio de agente de IA (GPTBot, ClaudeBot, PerplexityBot etc.): o objetivo GEO é ser lido.
- `sitemap-index.xml` e `sitemap-0.xml` gerados por `@astrojs/sitemap` com `i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR', en: 'en' } }`, de modo que cada URL traz `xhtml:link` para a outra língua. Filtro: fora `404.html` e qualquer rota `og/` ou de teste. Sem `lastmod` (não há fonte confiável por página).
- `llms.txt` em `dist/`, gerado no build por `src/pages/llms.txt.ts` a partir de `curriculo.json` e dos dados dos projetos. Formato (llmstxt.org): `# Eduardo Bergoli Gomes`, uma linha de resumo (`pt.resumo`), seção `## Perfil` com local, formação, experiência atual (empresa, cargo, desde), seção `## Projetos` com uma linha por projeto (`- [nome](URL da página): frase, stack, número`), seção `## Links` (GitHub, LinkedIn, currículo PDF PT e EN, `/en/`). Em PT, com a versão EN depois de `## English`. Só fatos que já estão no site; nada novo.

### R2. `head` de cada página

Por página e por língua, gerado por `src/components/Seo.astro`, com props `title`, `description`, `path`, `lang`, `ogImage`, `jsonLd`:

- `<title>` e `<meta name="description">` únicos (R3).
- `<link rel="canonical" href="https://gomesbeduardo.github.io{path}">`, com `path` `/` para a home PT, `/en/` para a EN, `/projeto-leadgate.html` e `/en/projeto-leadgate.html` para projetos. Sem parâmetro, sem `index.html`.
- `<link rel="alternate" hreflang="pt-BR" href=...>`, `hreflang="en"` e `hreflang="x-default"` (aponta para a PT), nas duas línguas, sempre os três.
- `<html lang="pt-BR">` na PT e `lang="en"` na EN.
- Open Graph: `og:type` (`profile` na home, `article` nos projetos), `og:title`, `og:description`, `og:url` (= canonical), `og:locale` (`pt_BR` / `en_US`), `og:locale:alternate`, `og:site_name` "Eduardo Bergoli Gomes", `og:image` com URL absoluta, `og:image:width` 1200, `og:image:height` 630, `og:image:alt`. Twitter: `twitter:card summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- Imagens OG: uma por página e língua, 1200×630 px, PNG, geradas no build em `dist/og/<pagina>-<lang>.png` e não versionadas (P3) (`home-pt.png`, `home-en.png`, `leadgate-pt.png` … 8 arquivos; a 404 usa a da home). Conteúdo: nome, uma linha (home: cargo e cidade; projeto: nome do projeto e a frase do card), na paleta P1 Ocre escura e nas fontes do site, sobre um fundo gerado por IA (P10) guardado em `src/assets/og/fundo.png` e versionado, com a marca pessoal (R8) no canto. Geração (P3b): o Astro gera uma página de modelo por imagem em `dist/og/<pagina>-<lang>.html`, com o Tailwind, as fontes e a paleta do site; depois do `astro build`, `scripts/site/og.mjs` serve `dist/`, abre cada modelo no Chromium do Playwright em viewport 1200×630 com `deviceScaleFactor: 1`, espera `document.fonts.ready`, grava o PNG ao lado e apaga o HTML do modelo. O script falha com código 1 se faltar uma das 8 imagens ou se alguma não tiver 1200×630. Os modelos ficam fora do sitemap. O `publicar.yml` instala o Chromium do Playwright antes do build.
- 404: `<meta name="robots" content="noindex">`; sem OG nem JSON-LD; mantém canonical.

### R3. Títulos e descrições

| Página | PT `<title>` | PT `description` (até 155 caracteres) |
|---|---|---|
| home | `Eduardo Bergoli Gomes, desenvolvedor full stack` | resumo de `curriculo.json` `pt.resumo`, cortado na primeira frase que caiba em 155 caracteres |
| leadgate | `leadgate: triagem de leads com IA · Eduardo Bergoli Gomes` | a frase do card do projeto |
| InfoHub | `InfoHub InovAMF · Eduardo Bergoli Gomes` | idem |
| LMS | `LMS da CentralEng · Eduardo Bergoli Gomes` | idem |
| 404 | `Página não encontrada · Eduardo Bergoli Gomes` | `A página que você procurou não existe.` |

EN com os mesmos padrões em inglês (`full stack developer`, `Page not found`). Os títulos dos projetos vêm do nome que a página já mostra no `h1`; a tabela mostra a forma, não o texto final, que o worker tira do HTML de hoje. Nenhum título ou descrição se repete entre páginas da mesma língua.

### R4. Texto no HTML, sem JS

Toda informação que a página mostra existe no HTML de `dist/` como texto: nome, cargo, resumo, Trajetória, experiência e formação, stack, projetos com números, contato (e-mail como texto, não só no botão), rodapé, os números do GitHub e a data da coleta. Com JS desligado:

- nenhum elemento com texto fica com `opacity: 0`, `visibility: hidden`, `display: none` ou fora da tela por `transform` esperando animação; o estado inicial de reveal é visível e o JS é que esconde e revela;
- os contadores mostram o valor final (`1234`, não `0` ou `data-v`);
- o calendário de contribuições existe como HTML gerado no build (um elemento por dia com o nível de 0 a 4 e o texto do dia em `sr-only`, sem `title`, conforme a spec 002b R5), e `main.js` deixa de desenhá-lo; o JSON `#cal-dados` sai. Isso cumpre a exigência "sem JS para isso" da spec 002 e vale mesmo que a 002 ainda não tenha coleta real;
- a frase digitada do hero existe no HTML com o texto final (o JS a apaga e redigita);
- o menu do celular: os links existem no HTML; abrir sem JS não é exigido (comportamento de hoje).

### R5. Fonte única de fatos

- Experiência, formação, prêmios e projetos do site passam a ser renderizados de `src/data/curriculo.json` (`pt` e `en`), o mesmo arquivo dos PDFs, em vez de texto escrito à mão nos `.astro`. Onde o site mostra menos que o currículo (frase mais curta, menos itens), o componente escolhe campos e corta; nunca escreve um fato que não esteja no JSON. Onde o site de hoje mostra algo que o JSON não tem (texto de Sobre, as curiosidades, a Trajetória com 13 marcos), o texto fica no dicionário `src/i18n/` e a diferença é listada no PR.
- Sobre o LinkedIn: não há leitura automática. O PR desta etapa traz uma tabela "site × currículo × LinkedIn" com cargo atual, empresa, período de cada experiência, formação e cidade, preenchida pelo responsável a partir do perfil; divergência é corrigida no JSON (e vira regeração dos PDFs) ou no LinkedIn, nunca no `.astro`.
- `datePublished`/`dateModified` não entram no JSON-LD (sem fonte).

### R6. Dados estruturados (JSON-LD)

Um `<script type="application/ld+json">` por página, no `head`, gerado no build de `curriculo.json` e dos dados dos projetos. Campos:

- Home (PT e EN): `@graph` com
  - `Person`: `@id` `https://gomesbeduardo.github.io/#eduardo`, `name` "Eduardo Bergoli Gomes", `givenName`, `familyName`, `jobTitle` (cargo atual do JSON), `url` (canonical da home), `image` (URL absoluta de `/img/eduardo-gomes.jpg`), `email` (`mailto:` do JSON), `address` `{ @type: PostalAddress, addressLocality: "Santa Maria", addressRegion: "RS", addressCountry: "BR" }`, `sameAs` `[GitHub, LinkedIn]`, `alumniOf` (AMF, do JSON), `worksFor` `{ @type: Organization, name: <empresa atual> }`, `knowsAbout` (lista da stack do JSON, até 15 itens), `knowsLanguage` `["pt-BR", "en"]`.
  - `ProfilePage`: `@id` canonical, `mainEntity` `{ @id: #eduardo }`, `inLanguage`, `name` = título da página.
  - `WebSite`: `url` raiz, `name`, `inLanguage`.
- Projeto (PT e EN): `SoftwareSourceCode` com `name`, `description` (a frase do card), `url` (canonical da página), `codeRepository` (`https://github.com/gomesbeduardo/leadgate` ou `.../infohub-inovamf`; o LMS fica sem `codeRepository`), `programmingLanguage` (lista da stack do projeto), `author` `{ @id: #eduardo }`, `image` (print do projeto), `inLanguage`. Mais `BreadcrumbList` com dois itens (home e projeto).
- Nenhum campo com valor inventado (`aggregateRating`, `review`, `award` fora dos prêmios do JSON). Sem `sameAs` para rede que o JSON não tenha.

### R7. Dependências desta etapa

`@astrojs/sitemap` (dev). Nada mais. A lista completa está no índice, para aprovação do responsável.

### R8. Favicon e marca pessoal

A marca é a de `docs/design/marca.md`: "eg" em Funnel Display 800 com um ponto ocre, num quadrado de cantos arredondados, com uma versão para cada tema. O favicon de hoje (`public/favicon.svg`, um "G" em Arial) sai.

- Arquivos em `public/`, versionados:
  - `icon.svg`: a marca com as letras em `path` (sem `<text>` nem fonte externa) e um `<style>` com `@media (prefers-color-scheme: dark)` que troca as cores para a versão do tema escuro.
  - `favicon.ico`: só 32×32.
  - `apple-touch-icon.png`: 180×180, fundo sólido, marca com cerca de 140 px.
  - `icon-192.png` e `icon-512.png`.
  - `icon-mask.png`: 512×512, marca dentro do círculo central de 409 px (área segura de ícone `maskable`).
  - `manifest.webmanifest`: `name` "Eduardo Bergoli Gomes", `short_name` "Eduardo Gomes", `icons` com 192, 512 e o `maskable`, `theme_color` e `background_color` `#15120e`.
- Os PNG e o ICO são gerados de `icon.svg` por `scripts/site/icones.mjs`, que abre o SVG no Chromium do Playwright em cada tamanho e grava os arquivos; roda à mão quando a marca muda, não no build. Sem dependência nova.
- No `head` de todas as páginas, inclusive a 404, por `Seo.astro`: `<link rel="icon" href="/favicon.ico" sizes="32x32">`, `<link rel="icon" href="/icon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<link rel="manifest" href="/manifest.webmanifest">` e `<meta name="theme-color">` com `#e9e1d2` para `prefers-color-scheme: light` e `#15120e` para `dark`. Caminhos absolutos a partir da raiz, iguais em PT e EN.
- O Safari pode ignorar o `prefers-color-scheme` dentro do SVG e usar o ICO; isso é aceito.

## Critérios de aceite

- C1. Dado `dist/`, então existem `robots.txt` com o conteúdo exato de R1, `sitemap-index.xml` e `sitemap-0.xml` com as 8 URLs de página (sem 404), cada uma com `xhtml:link` para `pt-BR`, `en` e `x-default`, e `llms.txt` com as seções de R1 (teste `scripts/site/seo.test.mjs`).
- C2. Dado cada um dos 9 HTML de `dist/`, então `<title>` e `description` existem, batem com R3 e não se repetem na mesma língua; `canonical`, os três `hreflang`, `html lang`, as tags OG e Twitter de R2 existem com URL absoluta; a imagem OG referenciada existe em `dist/og/` com 1200×630, e `dist/og/` não tem `.html` de modelo nem entra no sitemap (teste `seo.test.mjs`, lendo o cabeçalho PNG).
- C10. Dado `dist/`, então existem os 7 arquivos de R8 com as dimensões de R8, `icon.svg` não tem `<text>` e tem `prefers-color-scheme`, o manifest é JSON válido com os ícones de 192, 512 e um com `purpose` `maskable`, e cada um dos 9 HTML tem as 4 tags `link` e as 2 `meta theme-color` de R8 (teste `seo.test.mjs`). O favicon em 16 e 32 px, numa aba clara e numa escura, vai em captura no PR para o responsável (manual).
- C9. Dado um modelo de imagem OG removido (fixture), quando `node scripts/site/og.mjs` roda, então sai com código 1 e nomeia a imagem que falta (caso rejeitado).
- C3. Dado o JSON-LD de cada página, então é JSON válido, tem os tipos e campos de R6, `sameAs` tem exatamente o GitHub e o LinkedIn de `curriculo.json`, nenhum campo vazio, e o `@id` do `Person` é o mesmo em todas as páginas (teste `seo.test.mjs`). Validação externa: o responsável cola a home no Rich Results Test do Google e no validator.schema.org e registra "sem erro" no PR (manual).
- C4. Dado o site servido com `javaScriptEnabled: false` no Playwright, a 390 px e 1280 px, então cada `h2` e cada parágrafo das seções está visível (`opacity` computada 1, dentro da viewport depois de rolar até ele), os contadores mostram o valor final igual ao do `github.json`, o calendário tem 365 ou 371 dias em HTML, e o e-mail aparece como texto (teste `scripts/site/sem-js.e2e.mjs`).
- C5. Dado `src/data/curriculo.json`, então cada experiência (`empresa`, `cargo`, `periodo`), formação e prêmio da chave `pt` aparece em `dist/index.html`, e os de `en` em `dist/en/index.html`; nenhum nome de empresa, cargo ou período no HTML está ausente do JSON (teste `seo.test.mjs`, comparando por string).
- C6. Dado o PR da etapa, então a tabela de R5 (site × currículo × LinkedIn) está no corpo do PR, sem linha divergente (manual do responsável).
- C7. Dado `main.js` em `public/`, então não contém mais o desenho do calendário (nenhuma referência a `cal-dados`), e `dist/index.html` não tem `#cal-dados` (teste `seo.test.mjs`).
- C8. Dado `npm run e2e` no fim da etapa, então a paridade de 001a C1 passa, com `site/` atualizado conforme a lista de diferenças de texto do PR (R5), e todos os e2e passam (001a C4).

## Testes de aceite

| # | Critério | Dado | Ação | Resultado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1 | `dist/` | `node --test scripts/site/seo.test.mjs` | `robots.txt` igual a R1; 8 `<url>` no sitemap; `llms.txt` com `# Eduardo Bergoli Gomes`, `## Perfil`, `## Projetos`, `## Links`, `## English` | unidade |
| T2 | C2 | os 9 HTML | idem | 9 títulos únicos por língua; canonical sem `index.html`; `x-default` aponta para a PT; PNG 1200×630 | unidade |
| T3 | C2 | `dist/404.html` | idem | `robots noindex`; sem `og:`; sem `ld+json` | unidade |
| T4 | C3 | `dist/index.html` | idem | `@graph` com `Person`, `ProfilePage`, `WebSite`; `sameAs` = 2 URLs do JSON | unidade |
| T5 | C3 | `dist/projeto-lms.html` | idem | `SoftwareSourceCode` sem `codeRepository`; `BreadcrumbList` com 2 itens | unidade |
| T6 | C3 | JSON-LD com `sameAs` vazio (fixture) | função `montarJsonLd` | lança erro `sameAs vazio` (caso rejeitado) | unidade |
| T7 | C4 | `dist/` servido, JS desligado, 390 e 1280 | `node scripts/site/sem-js.e2e.mjs --raiz dist` | todos os `h2` e `p` visíveis; contadores = `github.json`; e-mail em texto | e2e |
| T8 | C5 | `curriculo.json` | `seo.test.mjs` | cada empresa e cargo do JSON está no HTML; HTML não tem empresa fora do JSON | unidade |
| T9 | C7 | `public/main.js`, `dist/index.html` | `grep -c "cal-dados"` | 0 nos dois | unidade |
| T10 | C8 | `site/` e `dist/` | `npm run e2e` | paridade 0 px nas 36 comparações; e2e todos verdes | e2e |
| T11 | C3, C6 | site publicado | Rich Results Test, schema.org validator, tabela do LinkedIn | sem erro; sem divergência | manual, no PR |
| T13 | C10 | `dist/` | `seo.test.mjs` | 7 arquivos; ICO 32×32; PNG 180, 192, 512, 512; SVG sem `<text>`; manifest com `maskable`; 4 `link` e 2 `theme-color` nos 9 HTML | unidade |
| T14 | C10 | site servido | captura da aba com o favicon em 16 e 32 px, temas claro e escuro | marca reconhecível; o responsável registra no PR | manual, no PR |
| T12 | C9 | `dist/` sem `og/leadgate-en.html` | `node scripts/site/og.mjs` | código 1, mensagem cita `leadgate-en.png` | unidade, `og.test.mjs` |

## Fora do escopo da etapa 2

- Domínio próprio, Google Search Console, analytics de qualquer tipo.
- Blog, feed RSS, páginas novas.
- Metas de desempenho e fontes locais (001c).
- Bloquear ou liberar agentes de IA por nome no `robots.txt` além de R1.
