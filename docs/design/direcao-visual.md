# Direção visual do portfólio

Data: 09/11/2026. Para o worker de front (Opus). Base: e-book "Como TIRAR essa CARA de IA" (Rafaela Maxwell Maicá de Machado e Gustavo Henrique Florêncio, 89 páginas, citado por página), o piso de qualidade do impeccable (`craft-floor.md`), o contrato de direção em `.impeccable/surfaces/prototipo-index-html.md`, o PRODUCT.md e o feedback do Eduardo (`feedback-prototipo.md`).

Evidência: screenshots em `docs/design/auditoria/` (1440 x 900 e 390 x 844, claro e escuro, movimento reduzido; `index-*-movimento-*` com movimento ligado) e medidas em px tiradas com `getBoundingClientRect` no Chromium 1.63 do Playwright, fontes e libs carregadas.

## 1. Princípios do e-book que valem aqui

- **Três perguntas em 5 segundos (p. 5):** sobre o que é o site, onde o visitante clicaria primeiro, para quem é. O hero responde às três (nome, linha de cargo, "Ver projetos"); as outras seções precisam responder "o que eu olho primeiro".
- **Bouba/Kiki (p. 8 a 18):** o site é Bouba moderado: pílulas, raio 14 px, grafite frio. Uma escala de raio só (8, 14, 999 px) e transições de 300 a 400 ms com ease-out (prompt da p. 17). Nada quadrado solto no meio.
- **Alinhamento (p. 21 a 25):** "Nenhum elemento deve ser colocado de forma aleatória" (p. 24). Toda borda esquerda cai numa coluna da grade.
- **Margens (p. 26 a 31):** o vazio é obrigatório e protege o conteúdo (p. 31). Nada encosta na borda da tela; a margem cresce com o viewport.
- **Proximidade (p. 32 a 36):** "A IA costuma espalhar elementos para preencher espaço vazio" (p. 35). O que é do mesmo grupo fica perto; grupos diferentes ficam longe.
- **Proporção (p. 37 a 41):** elementos do mesmo tipo com o mesmo tamanho (os dois prints de projeto hoje não têm).
- **Tipografia (p. 42 a 45):** três decisões: uma família, tamanho e peso (título 3x o parágrafo, subtítulo 2x), espaçamento.
- **Cores (p. 46 a 49):** 60/30/10 (p. 49): 60 fundo, 30 grafite de texto e superfícies, 10 acento. Azul comunica confiança (p. 48), o que sustenta o cobalto.
- **Contraste e hierarquia (p. 50 a 57):** "A IA tende a deixar tudo com o mesmo peso" (p. 52). Em cada seção, um elemento manda.
- **Movimento do olhar (p. 58 a 65):** leitura em F (p. 62) e em Z (p. 64). O título à esquerda, o conteúdo desce, a ação fecha à direita ou embaixo.
- **Repetição, ritmo, equilíbrio, unidade (p. 66 a 83):** mesma moldura para todo print, ritmo alternado entre seção densa e seção arejada (p. 73), peso visual distribuído (p. 77).
- **Sintomas de cara de IA (p. 84 e 85):** falta de intenção, tudo com o mesmo peso, excesso de elementos, pouco espaço vazio, neon, falta de identidade. A tabela da p. 86 (IA sem/com direção humana) é o critério de aceite final: cada seção tem de passar para a coluna "com direção".

## 2. Tokens e grade (base de todas as ações)

Definir em `style.css` (e depois nos tokens do Astro):

```css
:root{
  --gutter: clamp(20px, 5vw, 40px);        /* hoje 16 px no 390: p. 26 a 31 */
  --wrap: 1180px;                          /* mantém */
  --col-gap: clamp(16px, 2.5vw, 32px);
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px;
  --s7:48px; --s8:64px; --s9:96px; --s10:128px; --s11:160px;
  --section: clamp(var(--s9), 12vw, var(--s11));   /* entre seções */
  --after-h2: clamp(var(--s6), 4vw, var(--s7));    /* h2 -> conteúdo, igual em toda seção */
  --t-body: 1.0625rem;                      /* 17 px, lh 1.6 */
  --t-small: .9375rem;                      /* 15 px, só legendas e tags */
  --t-h3: clamp(1.5rem, 2.4vw, 2rem);       /* 24 a 32 px: ~2x o corpo (p. 44) */
  --t-h2: clamp(2.5rem, 5.2vw, 3.5rem);     /* 40 a 56 px: ~3x o corpo (p. 44); hoje 32 px no 390 */
  --t-display: min(6rem, 19.5vw);           /* nome */
  --r-sm:8px; --r-md:14px; --r-pill:999px;
}
.wrap{max-width:var(--wrap);padding-inline:var(--gutter);margin-inline:auto}
.grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--col-gap)}
```

Regra: toda borda esquerda de texto cai em `--gutter` da `.wrap` (170 px no 1440) ou numa linha de coluna da grade de 12. Nenhum `max-width` em px fora de `--wrap`; largura de texto é `ch` (60 a 68ch, piso do craft floor 65 a 75ch para corpo longo). Verificação: no console, `[...document.querySelectorAll('h2,h3,p,.shot')].map(e=>Math.round(e.getBoundingClientRect().left))` devolve só valores da grade.

## 3. Ações, por prioridade

Cada ação: problema com evidência, princípio, mudança exata, como verificar.

### Ação 1. Encaixes e margens: grade de 12 colunas e ritmo igual em toda seção

Evidência: `recorte-1440-projetos.png`: print 1 com 617 x 308 px (x 170) e print 2 com 411 x 206 px (x 859); topo do print 1 em y 5632 e do texto em 5653 (21 px de diferença); print 2 em 6023 e texto em 6006 (17 px). `recorte-1440-trajetoria.png`: três bordas esquerdas (h2 em 170, card em 226, texto em 254). `recorte-1440-experiencia-stack.png`: a stack em movimento reduzido começa em x 40 enquanto tudo começa em 170. Distância h2 -> conteúdo: 33,6 px em Sobre, Trajetória, Stack, mas 81 px em Projetos (margem do h2 mais `padding-top: 56px` do primeiro `.project`). No 390: gutter 16 px, `.cal-grid` com 560 px dentro de 358 px.
Princípios: alinhamento (p. 21 a 25), proporção (p. 37 a 41), ritmo (p. 71 a 74).
Mudança: aplicar os tokens da seção 2. `section{padding-block:var(--section) 0}`; `h2{margin:0 0 var(--after-h2)}`; zerar `padding-top` do primeiro filho de cada seção (`.project:first-of-type{padding-top:0}`). `.about`, `.project`, `.timeline li` viram `.grid`: Sobre texto em `grid-column:1/8`, passos em `9/13`; Projeto print em `1/8` (617 px) e texto em `9/13` nas duas linhas, alternando só o lado (`:nth-child(even) .shot{grid-column:6/13}` e texto `1/5`), `align-items:start`, print e texto começam no mesmo y. Calendário do GitHub: `grid-template-columns:repeat(53,minmax(0,1fr))` para caber em 358 px, ou mostrar 26 semanas abaixo de 600 px.
Verificar: screenshot 1440 e 390; medir `left` dos h2, `.shot` e `p` (só 170 ou linhas da grade); `getComputedStyle(h2).marginBottom` igual em todas as seções; prints de projeto com a mesma largura nas duas linhas; `document.scrollingElement.scrollWidth === innerWidth` no 390.

### Ação 2. Uma página por projeto, com o print certo

Evidência: `prototipo/index.html` tem dois `a.project` com `href="projeto.html"`; o InfoHub abre o leadgate. `recorte-projeto-1440-capa.png`: a capa é o banner social do GitHub (1280 x 640) em caixa de 1100 x 640 com `object-fit:cover`, cortando "EDUARDO BERGOLI GOMES" para "ARDO BERGOLI GOMES" e a URL. `recorte-projeto-1440-galeria.png`: o mesmo banner em 356 x 640 mostra "eadgat"; dois tiles "Captura pendente" tracejados.
Princípios: proporção (p. 37 a 41), unidade (p. 79 a 83); "fato antes do efeito" do PRODUCT.md.
Mudança: rotas. Astro: `src/pages/projetos/[slug].astro` lendo uma coleção `src/content/projetos/{leadgate,infohub-inovamf}.md` (campos: titulo, resumo, numeros[], stack[], capa, galeria[], repo). URLs PT `/projetos/leadgate/` e `/projetos/infohub-inovamf/`; EN depois em `/en/projects/leadgate/` e `/en/projects/infohub-inovamf/`, mesmo slug. No protótipo: `projeto-leadgate.html` e `projeto-infohub.html`, cada card com o `href` certo e `view-transition-name` próprio (`cover-leadgate`, `cover-infohub`), e `vtNav.card` guardando o slug. Capa: `aspect-ratio:16/10`, `width:100%`, `height:auto`, sem `height` fixo; o banner do GitHub só pode aparecer em 2:1 inteiro, sem corte, e mesmo assim só até existir um print do chat. Galeria: tiles 16/10 iguais, 2 colunas acima de 900 px e 1 abaixo; sem tile "pendente" (só o que existe). Cabeçalho da página: `h1` e lede em `grid-column:1/8`, `.figs` em `9/13`, alinhados pelo topo.
Verificar: clicar em cada card abre a URL do próprio projeto (Playwright: `page.url()` contém o slug); nenhum texto da capa cortado (comparar o print original com o render); `img.naturalWidth/naturalHeight` igual à razão da caixa, ou a caixa com `height:auto`.

### Ação 3. A abertura do projeto tem de rodar sempre

Evidência: relato "não roda também, corta muito ou nem acontece". Lab (`prototipo/lab/NOTES.md` e relatório do agente do lab, 09/11): antes, p95 de 33,3 ms e 8 quadros acima de 25 ms na ida; depois do anel animado por `transform: scale` e do recuo por `opacity` (em vez de `filter: brightness`), p95 16,8 ms, maior quadro 50,1 ms (ida) e 33,5 ms (volta), 900 ms, `cubic-bezier(.7,0,.2,1)`. Resta o atraso do primeiro quadro da página nova (80 a 590 ms sob CPU 4x), percebido como "nem acontece". O teste de rolagem com movimento ligado (`index-1440-movimento-projetos.png`) não deixou nenhum `.reveal` preso em opacidade 0, então o problema está na transição, não no reveal.
Princípios: movimento (p. 58 a 65) e o craft floor: um momento de movimento autoral, ease-out exponencial.
Mudança: portar `prototipo/lab/vt.js` e as regras `.vt-ring`/`::view-transition-*` do `lab.css` para `prototipo/vt.js` e `style.css`. Na home, `<link rel="preload" as="image">` das duas capas e `<link rel="preload" as="style">` da fonte; `gsap`, `ScrollTrigger`, `lenis` e `main.js` com `defer` na página do projeto para nada rodar antes do `pagereveal`. Se `document.startViewTransition` não existir ou o `pagereveal` vier sem `viewTransition` (Firefox, bfcache), navegar seco, sem meia animação. Reveal: trocar `gsap.set('.stag',{opacity:0})` por `gsap.from` com ScrollTrigger (conteúdo nunca fica oculto se o trigger falhar) e chamar `ScrollTrigger.refresh()` em `document.fonts.ready` e no `load`.
Verificar: Playwright com `Emulation.setCPUThrottlingRate {rate:4}`, 3 idas e 3 voltas: a transição acontece 3 de 3 (`pagereveal` com `viewTransition` não nulo), p95 ≤ 20 ms, nenhum quadro > 50 ms, primeiro quadro da página nova em menos de 150 ms; `prototipo/lab/medir.mjs` já faz a medição.

### Ação 4. Trajetória mais longa e com ar

Evidência: `recorte-1440-trajetoria.png`: 9 cards de 760 px a 24 px um do outro, 284 px vazios à direita, h3 de 25,6 px (1,5x o corpo); textos de 1 frase ("Foi ali que comecei a programar."). No 390 (`recorte-390-trajetoria.png`), cards de 318 px com gap 16 px, texto a 76 px da borda. O contrato de direção diz "Texto não mora em card".
Princípios: proximidade (p. 32 a 36), margens (p. 26 a 31), hierarquia (p. 55 a 57), ritmo progressivo (p. 73).
Mudança: tirar a caixa (`background`, `box-shadow`, `padding`) dos `.traj-card`. Cada marco vira `li.grid` com o ano em `grid-column:1/3` (tabular, `--t-h3`, cor `--muted`, "2018", "2020", "2024"), linha e nó na coluna 3, conteúdo em `4/10` (até 60ch): `h3` em `--t-h3` com peso 700, subtítulo em `--t-body`, parágrafo de 2 ou 3 frases em `--muted`. Espaço entre marcos `var(--s8)` (64 px) no desktop e `var(--s7)` no 390; o ano só aparece quando muda. A linha continua preenchendo por scrub (já existe). No 390, ano acima do título, conteúdo a 40 px do nó. Os textos novos são do Eduardo (pergunta aberta); até lá, usar os do `docs/privado/handoff-2026-11-09.md`.
Verificar: altura da seção no 1440 entre 2 800 e 3 600 px (hoje 1 968 px de lista); `gap` medido ≥ 64 px entre o fim de um marco e o começo do próximo; nenhum `box-shadow` em `.traj li`; bordas esquerdas em 170 (ano) e na coluna 4.

### Ação 5. Experiência sem repetir a Trajetória

Evidência: `recorte-1440-experiencia-stack.png`: 7 linhas repetem CentralEng, Asten, AMF, YourMentor, Ideathon, Coderace e JET, que já estão na Trajetória, com o mesmo texto encurtado.
Princípios: excesso de elementos (p. 85), hierarquia (p. 55 a 57).
Mudança: Experiência vira a ficha factual, sem narrativa: `grid` com período em `1/3` (tabular, "fev/2024 - atual"), empresa e cargo em `3/8`, uma linha de resultado em `8/13` só quando houver número (ex.: "LMS com 20 colaboradores"). Remover a terceira coluna onde está vazia. Trajetória fica com a história; Experiência com cargo, lugar e data.
Verificar: nenhuma frase igual nas duas seções (`grep` dos textos); linhas da tabela com altura ≤ 72 px.

### Ação 6. Stack em duas fileiras com logos

Evidência: `recorte-1440-experiencia-stack.png`: uma fileira de nomes em cinza (`--muted2`, 41,6 px), sem logo; pedido: "2 linhas cada uma indo pra lado oposto com logos".
Princípios: repetição e unidade (p. 66 a 70, 79 a 83), ritmo alternado (p. 73).
Mudança: duas `.marquee` dentro do `.wrap` (não full-bleed), `--speed:60px/s`, a segunda com `animation-direction:reverse`, pausa no hover; cada item = logo 40 px + nome em `--t-h3` peso 600. Logos do Simple Icons (CC0) em SVG, copiados para `public/icons/` no build (sem dependência em tempo de execução, regra do PRODUCT.md), `fill:currentColor`, `color:var(--muted)`. URLs conferidas em 09/11 (todas 200): `https://cdn.jsdelivr.net/npm/simple-icons@15.22.0/icons/{typescript,react,nextdotjs,nodedotjs,postgresql,prisma,docker,vitest,n8n,astro,tailwindcss,python,git,github,vercel,gsap}.svg`. `playwright.svg` dá 404: desenhar à mão ou deixar fora. Fileira 1: TypeScript, React, Next.js, Node.js, PostgreSQL, Prisma, Docker, Vitest. Fileira 2: n8n, Astro, Python, Git, GitHub, Tailwind, Vercel, GSAP (ajustar à lista real do currículo). Movimento reduzido: duas fileiras estáticas com `flex-wrap`, dentro do `.wrap`.
Verificar: 16 `<svg>` renderizados, cor igual a `--muted` nos dois temas; `animation-direction` diferente entre as fileiras; no 390 nada sai do `.wrap` (`scrollWidth === innerWidth`).

### Ação 7. Fim do ímã (e do tilt)

Evidência: "o efeito de ímã ficou feio"; `main.js` move `.mag` em 10 px e inclina `.shot` em 6°. O craft floor pede um momento autoral só (o círculo).
Princípios: movimento (p. 58 a 65); sintoma "falta de intenção" (p. 84).
Mudança: remover o bloco do ímã e o do tilt em `main.js` e a classe `.mag`. Hover de botão: `background` 8 % mais escuro e o ícone de seta com `translate(2px,-2px)`, 150 ms ease-out. Parallax fica (ele gostou).
Verificar: nenhum listener `mousemove` em botões ou `.shot`; hover do botão muda só cor e ícone.

### Ação 8. Página do projeto com cabeçalho e galeria na grade

Evidência: `recorte-projeto-1440-capa.png`: capa de 640 px seguida de h1 de 96 px, lede e números todos na coluna da esquerda; seções com `padding-top:72px` enquanto a home usa 160 px; `recorte-projeto-1440-galeria.png`: tiles de 356 x 640, 356 x 267 e 356 x 267.
Princípios: unidade (p. 79 a 83), hierarquia (p. 55 a 57).
Mudança: `h1` em `--t-display` cai para `clamp(2.5rem,6vw,4.5rem)` (a capa já é o elemento dominante); cabeçalho em grade (ação 2); seções com `--section` e `--after-h2` da home; galeria com tiles 16/10 iguais, legenda em `--t-small` abaixo de cada um; rodapé "Voltar aos projetos" alinhado ao `--gutter`.
Verificar: screenshot 1440 e 390; `getComputedStyle(section).paddingTop` igual ao da home; tiles com a mesma `aspect-ratio`.

### Ação 9. Apelo visual dentro das regras

Evidência: `recorte-1440-hero.png`: metade direita vazia (nada depois de x 712 até 1270), 222 px vazios entre os botões (y 605) e a linha de fatos (y 827), foto é o placeholder "EG" tracejado. Acento aparece em datas, nós, botão, calendário e links, sem hierarquia clara entre eles.
Princípios: 60/30/10 (p. 49), contraste (p. 50 a 54), equilíbrio (p. 75 a 78), identidade (p. 10 e 11, 85).
Mudança, nesta ordem: (a) foto real (LinkedIn, decisão do handoff) em 120 a 160 px, borda sólida de 1 px, sem tracejado; (b) hero em grade: nome e linha digitada em `1/8`, foto em `9/11` alinhada ao topo do nome, fatos no pé do viewport como hoje, botões logo abaixo da linha digitada (`--s6`), sem o vazio de 222 px; (c) acento reservado para: botão primário, linha da trajetória e nós, anel da transição, calendário do GitHub e links. Datas e numerais ficam em `--fg` com numerais tabulares. Meta 60/30/10 medida por área aproximada: acento ≤ 10 % do viewport em qualquer ponto; (d) prints sempre na mesma moldura: raio 14 px, fio 1 px `--line`, sombra com deslocamento (`0 12px 32px -12px`); (e) seções alternam densidade: Sobre (texto), Trajetória (ar), Experiência (tabela densa), Stack (movimento), Projetos (ar), Números (denso), Contato (ar). Fora de cobertura, por PRODUCT.md: blobs, fundo mudando por seção, cursor custom, intro lenta, texto gradiente.
Verificar: screenshot do hero sem área vazia maior que 160 px entre blocos; contagem de cores de acento visíveis por viewport; a tabela da p. 86 preenchida por seção, todas na coluna "com direção".

### Ação 10. Tipografia: escala e contraste de texto secundário

Evidência: h2 de 32 px no 390 (1,9x o corpo); h3 da trajetória 25,6 px (1,5x). `--muted2` #6b7280 sobre #f6f7f9 dá 4,51:1, no limite do piso 4,5:1; sobre `--raised` #fff dá 4,83:1. Borda das tags #c9ced6 dá 1,47:1 (decorativa, aceitável).
Princípios: tipografia (p. 42 a 45), contraste (p. 50 a 54).
Mudança: `--t-h2` e `--t-h3` da seção 2; parágrafos secundários em `--muted` (#4b5563, 7,05:1); `--muted2` só a partir de 20 px ou peso 600. `p{max-width:68ch}` continua; `.lede` em 1.25rem e 60ch.
Verificar: razões h2/corpo ≥ 2,3 no 390 e ≥ 3 no 1440; contraste de todo texto abaixo de 20 px ≥ 4,5:1 nos dois temas (axe ou cálculo WCAG).

### Ação 11. Troca de tema T2

Portar a máscara SVG descendo com borda ondulada do `lab` para a home e a página de projeto, 900 ms, com `prefers-reduced-motion` trocando seco. Verificar: p95 ≤ 20 ms no mesmo script do lab; cor de fundo final igual a `--bg` do tema.

## 4. Mona Sans: manter

O detector do impeccable mede frequência de uso, não adequação. O e-book pede uma família só com três decisões (p. 42 a 45) e identidade consistente (p. 10, 11 e 79 a 83). Mona Sans variável dá o eixo de largura: nome em 122 % e peso 830, corpo em 100 % e 400, numerais tabulares. Essa combinação já é a cara aprovada em duas rodadas. Trocar a fonte agora reabre a identidade sem resolver nenhum achado desta auditoria. Alternativa, se o Eduardo quiser se afastar do detector: manter Mona Sans no corpo e usar a mesma família em largura 125 % só no nome e nos h2, o que já a distingue dos sites que a usam em largura normal.

## 5. Ordem de execução sugerida

1 (tokens e grade) -> 2 (páginas por projeto) -> 3 (transição) -> 7 (ímã) -> 4 e 5 (trajetória e experiência) -> 6 (stack) -> 8 (página do projeto) -> 9 (apelo) -> 10 (tipo) -> 11 (tema). Cada ação fecha com o screenshot correspondente refeito em `docs/design/auditoria/` com o mesmo nome e sufixo `-v2`.

## Ajustes do responsável depois desta análise (09/11/2026)

Estas decisões valem por cima das ações acima quando houver conflito.

- Trajetória: continua com cards, no formato da referência, como ele pediu ("pode copiar mais ou menos o que o de ref fez"). A ação que tira as caixas não vale. O que vale da ação: mais respiro entre marcos, coluna de ano alinhada ao grid e 2 ou 3 frases por marco, rascunhadas pela sessão principal com fatos conhecidos e aprovadas por ele.
- Inclinação dos prints ao passar o mouse: fica. Sai só o ímã.
- Stack: além das 16 tecnologias, entram as IAs e os SaaS que ele usa e outras que façam sentido. A lista final passa por ele antes de entrar.
- Prancha "Tensegrity Column of Carbon Rods and Red Cord" (sorteio do impeccable): "mais puxado pro 1, mas não totalmente ele" e "não saia tanto do que já temos". Entram como tempero: linhas de anotação técnica em poucos pontos, títulos de seção em caixa alta condensada e uma mono só para rótulos e dados, leituras de dado com valor, unidade e gráfico de linha pequeno nos Números do GitHub, e uma estrutura desenhada em linha no hero que respira com a rolagem. Não entram: a paleta concreto e carbono, o vermelho, os botões com canto e traço, a grade com mira.
- Foto: a do LinkedIn, pequena, ao lado do nome.
