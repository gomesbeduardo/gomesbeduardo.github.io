# Spec 001: migração do portfólio para Astro e Tailwind v4

Estado: aprovada pelo responsável em 11/11/2026.
Parte 1 de 5. Ordem de leitura: `001-astro.md` (esta: pedido, decisões, etapas, regras transversais, dependências, perguntas abertas), `001a-paridade.md` (etapa 1), `001b-seo-geo.md` (etapa 2), `001c-desempenho.md` (etapa 3), `001d-troca-de-lingua.md` (troca de língua, última fatia da etapa 1). Cada parte tem os próprios critérios (C) e testes (T); as pendências (P) estão só aqui e as partes as citam pelo número.

## Pedido literal

> "Pode seguir com a 001 já com tailwind e todo o resto, spec grande com fable, mas em nova sessão." (11/11/2026)

Pedidos anteriores, em `docs/design/feedback-prototipo.md`, seção "Para a spec 001": "lembre de focar no GEO e SEO com o astro"; "o tempo de resposta também deve ser cuidado com o astro"; "Se quiser use tailwind e shadcn"; "pode levar pra spec do Astro".

## Problema

O site publicado em `https://gomesbeduardo.github.io` é HTML, CSS e JS escritos à mão em `site/`, em duas cópias (PT e EN), publicados como estão pelo `pages.yml`. Cada texto existe duas vezes, os números do GitHub (spec 002) e do processo (spec 008) precisam de um build para entrar no HTML, não há mapa do site, dados estruturados nem `hreflang`, e todo o JS e as três bibliotecas de animação carregam em toda página. A migração para o Astro resolve isso em três etapas, e a primeira precisa provar que nada do que as specs 003 a 008 entregaram mudou.

Quem usa: o visitante (recrutador, tech lead) e os buscadores e assistentes de IA que o trazem; o responsável, que mantém um site só com os dados em `src/data/`.

## Decisões já tomadas pelo responsável (não reabrir)

- D1. Site estático no Astro, no GitHub Pages, deploy pelo GitHub Actions; PT em `/`, EN em `/en/`.
- D2. Tailwind v4 entra agora, na migração. Os tokens de `site/style.css` (cores P1 Ocre nos dois temas, espaços `--s1` a `--s11`, raios, escala de tipo, fontes Funnel Display, Funnel Sans e Reddit Mono) viram o tema do Tailwind. `shadcn` só se alguma ilha virar React, o que não se espera.
- D3. "Todo o resto" são os três blocos do feedback: SEO e GEO (001b), tempo de resposta com metas medidas e teste no CI (001c), JS só nas ilhas que animam, GSAP e Lenis sob demanda, fontes locais com subset e preload, imagens pelo Astro (001c).
- D4. Três etapas, um PR cada: etapa 1 Astro e Tailwind com paridade visual e de comportamento; etapa 2 SEO e GEO; etapa 3 metas de desempenho e teste no CI.
- D5. Critério de paridade: comparação de capturas por página (PT e EN: home, três projetos, 404) a 390 px e 1280 px, nos dois temas, rígida até o limite (0 pixels diferentes fora do anti-aliasing do texto, animações congeladas, mesmo Chromium, fontes carregadas), mais todos os e2e existentes passando contra o build. Detalhe em 001a R7.
- D6. Os testes que leem `site/*.html` e `site/*.css` por regex passam a ler `dist/`; o que não faz sentido sob Tailwind vira e2e ou sai, com justificativa por arquivo (001a R8).
- D7. A spec 002 (números do GitHub) está aprovada e é implementada depois da etapa 1, não dentro da 001. A 001 define como o Astro lê `src/data/github.json` no build e o aviso de "dados de exemplo" (001a R5); o calendário sem JS entra na etapa 2 (001b R4).
- D8. Fundo com nuances, grão e brilho fica fora da 001; vira spec de UI própria depois da etapa 3.
- D9. Troca de deploy: o PR da etapa 1 desliga o `pages.yml` e liga o `publicar.yml`; `site/` fica no repositório até o fim da etapa 3 como referência; reversão é reverter o merge na `main` (001a R10). CI e deploy são área sensível: só a sessão principal edita workflows, com o ok do responsável.
- D10. Branches de feature saem da `staging`, PR para `staging`, depois `staging` para `main`.
- D11. A troca de língua abre a outra página no mesmo ponto de leitura, sem repetir a abertura, como última fatia da etapa 1 (001d, decisão de 11/11/2026).

## Etapas

| Etapa | Branch | Entrega | Critérios |
|---|---|---|---|
| 1 | `feat/astro-paridade` | scaffold do Astro, Tailwind com os tokens, páginas e componentes, JS e vendor sem mudança, leitura de `github.json` e `processo.json`, PDFs no build, testes contra `dist/`, troca de deploy; por último, a troca de língua no mesmo ponto | 001a C1 a C11 e 001d C1 a C8 |
| 2 | `feat/astro-seo` | `robots.txt`, sitemap, `llms.txt`, `head` por página, JSON-LD, texto sem JS, fatos de `curriculo.json` | 001b C1 a C9 |
| 3 | `feat/astro-desempenho` | módulos por componente, GSAP e Lenis sob demanda, fontes locais, imagens otimizadas, teste de desempenho no CI, saída de `site/` e `pages.yml` | 001c C1 a C10 |

Pré-condição da etapa 1: a implementação da spec 007 entrar na `staging`. A spec 006 e a correção do menu (#14) entraram em 11/11. A spec 008 é implementada depois da etapa 1, direto no Astro, sem passar por `site/` (decisão do responsável em 11/11/2026). A referência de paridade é o `site/` da `staging` quando a etapa 1 começa (001a F1).

## Regras transversais

- R1. Nada do que as specs 003 a 007 entregaram muda de comportamento, e a 008, implementada depois da etapa 1, segue o mesmo contrato a partir do PR dela: surpresas (`surpresas.js` e `.css`), virada da foto com ficha no verso (005), menu animado (#14), contato e rodapé com aviso de cópia (006), modal "Feito com o Claude Code" com a linha dos números do processo (008), PDFs em `/curriculo/`, tema (`tema.js`, `inicio.js`), transições (`transicoes.css`), correções de texto (007). O contrato é o conjunto dos `scripts/site/*.e2e.mjs` mais a paridade de capturas.
- R2. A paridade (001a C1 e C4) vale no fim de cada etapa, com as únicas exceções declaradas em 001b R5 (texto que passa a vir de `curriculo.json`, listado no PR) e 001c R6 (máscara de imagem e fontes locais).
- R3. Área sensível: dependências (R5 abaixo), `.github/workflows/*`, secrets. O worker propõe o diff no PR; a sessão principal aplica com o ok do responsável.
- R4. Tailwind: tokens em `@theme` apontando para as variáveis atuais, sem Preflight nas etapas 1 e 2 e com Preflight na etapa 3 (P1, 001c R9), sem valor literal onde há token, conversão para utilitário permitida por componente desde que a paridade passe (001a R3).
- R5. Dependências, lista fechada, aprovada em 11/11 (P9). Versões: a última estável no dia do scaffold, fixadas no `package-lock.json`; Node 24 (já nos workflows).
  - Etapa 1, produção: `astro`, `tailwindcss`, `@tailwindcss/vite`. Desenvolvimento: `playwright` (e2e e paridade; o Chromium dele entra no CI por `npx playwright install --with-deps chromium`), `pixelmatch`, `pngjs`.
  - Etapa 2: `@astrojs/sitemap`. As imagens OG usam o `playwright` da etapa 1 (P3b); o `publicar.yml` passa a instalar o Chromium dele no job de build.
  - Etapa 3, produção: `gsap`, `lenis` (substituem `public/vendor/`), `sharp` (otimizador de imagem do Astro), os pacotes de fonte da P8. Desenvolvimento: `lighthouse`.
  - Fora: React, Preact, `shadcn`, `@astrojs/tailwind` (substituído pelo plugin Vite no Tailwind v4), qualquer action de terceiro nova nos workflows.
- R6. Scripts do `package.json`: `dev` (`astro dev`), `build` (`astro build`; a partir da etapa 2, `astro build && node scripts/site/og.mjs`), `test` (`astro build && node --test 'scripts/**/*.test.mjs'`), `e2e` (001a R8), `desempenho` (001c R5). Os scripts de `scripts/curriculo/` e `scripts/github/` não mudam.
- R7. Texto do site e dos commits em português, sem travessão, sem frase de efeito (PRODUCT.md). Strings de interface novas (aviso de dados de exemplo, descrições, `llms.txt`) seguem a mesma voz.

## Dados lidos no build

| Arquivo | Quem gera | Como o Astro lê | Onde |
|---|---|---|---|
| `src/data/github.json` | `scripts/github/coletar.mjs` (spec 002), versionado | `import` no componente `NumerosGithub`; `versao` ≠ 1 falha o build; `amostra: true` mostra o aviso | 001a R5 |
| `src/data/curriculo.json` | o responsável, versionado | etapa 1: só o gerador de PDF; etapa 2: experiência, formação, prêmios, projetos, JSON-LD e `llms.txt` | 001b R5, R6 |
| `public/dados/processo.json` | gerador da spec 008, no CI, antes do `astro build`, não versionado | não lê; copia para `dist/dados/`; a página busca em tempo de execução, como a 008 manda | 001a R5 |
| `public/curriculo/*.pdf` | `scripts/curriculo/gerar.mjs`, no CI, antes do `astro build`, não versionado | copia para `dist/curriculo/` | 001a R6 |

## Fora do escopo da 001

- Implementar as specs 002 e 008 (calendário sem JS, gerador da 008). O `schedule` do `publicar.yml` e o coletor que já existe em `scripts/github/` passam a rodar na etapa 1 (P7).
- Fundo com nuances, grão e brilho (D8), redesenho de qualquer seção, pirâmide de projetos ou outra mudança visual do feedback que ainda não esteja em `site/`.
- Domínio próprio, analytics, formulário de contato, blog, RSS.
- React, `shadcn`, service worker, CDN.

## Perguntas abertas

Respostas do responsável em 11/11/2026, já aplicadas nas partes:

- P1. Preflight do Tailwind: fora nas etapas 1 e 2; entra na etapa 3, com as regras afetadas reescritas até a paridade voltar a 0 pixels (001c R9).
- P2. Números do GitHub na base de paridade: antes de capturar a base, um commit pequeno em `site/` alinha os números e o `#cal-dados` com `src/data/github.json`, e a base e o build usam o mesmo JSON (001a R5). Em 11/11 os números já coincidiam (2897 contribuições, 12 repositórios); o calendário não foi conferido.
- P3. Imagens Open Graph: geradas no build, não versionadas (001b R2).
- P4. Fontes das 11 marcas da Stack: continuam no Google Fonts com `text=` e `media="print"`; só as três fontes do site viram locais (001c R3).
- P5. Variação do runner: mediana de 5 execuções do Lighthouse e de 5 interações, falha acima da meta sem nova tentativa; se o job falhar duas vezes em duas semanas com o `dist/` sem mudança, a meta de CI ganha 10% (INP 220 ms, quadro 22 ms) e a meta de produto fica a mesma (001c R5).
- P6. `backdrop-filter` e `scrub` na Trajetória: medir primeiro; se as metas fecharem, nada muda; se não, o responsável escolhe, com nova base de paridade aprovada (001c R2, R6).
- P7. `schedule` semanal no `publicar.yml`: ligado já na etapa 1. O responsável cria o secret `GH_TOKEN_LEITURA` antes do merge da etapa 1; o run agendado roda com `--estrito` e faz o commit semanal da 002 R8 (001a R10).
- P8. Fontes locais: pacotes `@fontsource-variable/funnel-display`, `@fontsource-variable/funnel-sans` e `@fontsource/reddit-mono` (ou os equivalentes que existirem no dia; o worker confere antes de instalar), só o subset `latin`, com `preload` escrito à mão (001c R3).
- P9. Dependências de R5 e Node 24: aprovadas como estão, sem React nem `shadcn`. Qualquer pacote novo volta ao responsável.

- P3b. Ferramenta das imagens OG: Playwright, já na lista de R5, com o mesmo Chromium da paridade. Escolhido em 11/11 entre o Chrome do runner, Playwright, `satori` com `@resvg/resvg-js`, `astro-og-canvas`, `@vercel/og`, `sharp` com SVG e `astro-opengraph-images`, porque reaproveita o Tailwind e as fontes do site, espera `document.fonts.ready` antes da captura e não traz dependência nova (001b R2).

## Suposições de baixo impacto

Marcadas no texto como suposição: páginas PT e EN com a mesma estrutura (001a R1); `gerar.mjs` sem dependência de `site/` (001a R6); `<title>` e `description` existentes hoje (001b F3); texto do aviso de dados de exemplo (001a R5); nomes de módulos e componentes (001a R1, 001c R1), que o worker pode renomear sem mudar URL nem comportamento.
