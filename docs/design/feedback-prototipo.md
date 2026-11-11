# Feedback do protótipo, item por item

Data: 09/11/2026. Fonte: mensagens do Eduardo sobre `prototipo/` (index.html, projeto.html, lab/). Cada item traz a fala dele entre aspas, a decisão tomada e o estado. Estados: feito, em andamento, pendente, aberto (depende dele).

## Rodada 1

| O que ele disse | Decisão | Estado |
|---|---|---|
| "Esse ficou muito cru." | Direção via impeccable (contrato em `.impeccable/surfaces/prototipo-index-html.md`): grafite do perfil dele no GitHub, um acento só (cobalto), Mona Sans variável, fios de 1 px, prints com raio 14 px. | feito |
| "algo nessa linha [danmachado3105.github.io], mais bem trabalhado" | Usar do site de referência só a estrutura da trajetória. Fontes (Bricolage Grotesque, DM Sans, DM Mono), paleta (#100d0b, #ff6b3d) e efeitos ficam de fora. | feito |

## Rodada 2

| O que ele disse | Decisão | Estado |
|---|---|---|
| "Gostei." | Manter a direção. | feito |
| Remover a barra de progresso de leitura. | Removida. | feito |
| Header "fica em pílula com glass effect ou outro mais bonito" | Header em pílula com fundo translúcido (`backdrop-filter`). | feito |
| "A pílula do header não precisa de nome, mas se for manter, pelo menos alinhe e deixe tudo responsivo. Hoje não está." | Nome removido. Pílula centralizada no desktop; abaixo de 900 px vira botão "Menu". | feito |
| Trajetória começa em 2018 com o CS50 ("ali tive interesse pela programação"); mods de jogos "principalmente minecraft" "na pandemia" (2020); seção separada de Experiência; "pode copiar mais ou menos o que o de ref fez" | Seção `#trajetoria` com linha vertical, 9 marcos (CS50 2018, mods 2020, AMF 2024, Ideathon out/2025, JET, CentralEng, Coderace 2026, YourMentor, Asten AVMB) e botão "Me conta uma curiosidade". Experiência continua como lista à parte. | feito (rodada 3 pede mais extensão e ar) |

## Transição de página (círculo)

| O que ele disse | Decisão | Estado |
|---|---|---|
| O círculo tem de preencher a tela inteira; a página nova aparece dentro do círculo que cresce do ponto do clique; voltar faz a página do projeto encolher até o card. | View Transitions entre documentos (`@view-transition{navigation:auto}`, `pageswap`/`pagereveal`), ponto do clique guardado em `sessionStorage`. | feito no lab |
| Problemas vistos: círculo invisível (mesma cor de fundo), rápido demais (0,6 s), o print "voando" brigava com o círculo, uma vez não aconteceu nada. | Laboratório `prototipo/lab/` com 4 variantes (P1 a P4). Ele escolheu **P3**: círculo com anel de 3 px na cor de acento, a home recua (escala 94 %, escurece) e 900 ms. O print não voa mais. | escolhido |
| "engasga no meio" (travadinhas) | Medido no Chrome 156 com GPU, CPU 4x, 3 execuções por direção. Antes: p95 33,3 ms e 8 quadros acima de 25 ms na ida. Depois (anel animado por escala, recuo por opacidade em vez de `filter`): p95 16,8 ms, maior quadro 50,1 ms na ida e 33,5 ms na volta. Resta um atraso para começar (primeiro quadro da página nova, 80 a 590 ms sob CPU 4x), que a direção visual trata como requisito (pré-carregar capa e fonte, scripts com `defer`). | feito no lab; falta portar para o protótipo |

## Troca de tema

| O que ele disse | Decisão | Estado |
|---|---|---|
| "A mudança de modos deve ser suave também, descendo pela página como tinta ou com a ideia do círculo ainda." | Lab com 4 variantes (T1 a T4). Ele escolheu **T2**: tinta descendo com borda ondulada (máscara SVG, 900 ms). Medido: p95 16,8 ms. | escolhido; falta portar |

## Elementos surpresa (easter eggs)

| O que ele disse | Decisão | Estado |
|---|---|---|
| "elementos surpresas com toggle, botões e alguns easter eggs na página mostrando curiosidades sobre mim e minha trajetória como dev" | 10 curiosidades aprovadas por ele. Mecânicas aprovadas: palavras clicáveis, 5 cliques na foto, mensagem no console, botão "Me conta uma curiosidade", toggles estilo iOS dentro de frases que abrem uma faixa abaixo, toggle "Bastidores" no header, contador de achados. Apresentação: "Todos, varie entre eles" (card no canto, terminal, card que vira). | parte 1 em andamento (`surpresas.js`); parte 2 depois |

## Rodada 3 (mais recente)

| O que ele disse | Decisão | Estado |
|---|---|---|
| Animação de abertura dos projetos "não roda também, corta muito ou nem acontece" | Portar a correção do lab (P3) e tratar como requisito com teste automatizado: a transição roda 3 de 3 vezes, p95 ≤ 20 ms, nenhum quadro > 50 ms. Ver `direcao-visual.md`, ação 3. | pendente |
| Clicar no InfoHub abre a página do leadgate | Uma página por projeto: `/projetos/leadgate/` e `/projetos/infohub-inovamf/` (EN depois em `/en/projects/...`). No protótipo, `projeto-leadgate.html` e `projeto-infohub.html`. Ação 2. | pendente |
| "os encaixes na página também muito feios, desalinhados, margem também mal feita" | Auditoria com medidas em `docs/design/auditoria/`. Achados principais: prints de tamanhos diferentes nas duas linhas de projeto (617 x 308 e 411 x 206 px) e topos desalinhados em 17 a 21 px; três bordas esquerdas diferentes na trajetória (170, 226 e 254 px); marquee da stack começa em 40 px enquanto tudo começa em 170 px; capa do projeto cortando texto do banner. Grade de 12 colunas e escala de espaçamento. Ações 1, 2 e 8. | pendente |
| "o efeito de ímã ficou feio" | Remover o ímã dos botões. Hover simples: fundo escurece e a seta anda 2 px, 150 ms. Ação 7. | pendente |
| "parallax é legal" | Manter o parallax do hero e dos prints (scrub). | mantido |
| Trajetória "ficou legal, mas muito curta e tudo muito junto" | Texto sai dos cards (o contrato de direção diz "Texto não mora em card"), coluna de ano à esquerda, separação de 64 a 96 px entre marcos, cada marco com 2 ou 3 frases. Ação 4. Os textos novos são dele (pergunta aberta). | pendente |
| Stack "poderia ter 2 linhas cada uma indo pra lado oposto com logos ao invés de apenas nomes" | Duas fileiras em sentidos opostos, logo + nome, logos do Simple Icons (URLs conferidas, 200 OK) copiados para o repositório no build e pintados na cor do tema. Ação 6. | pendente |
| "falta mais apelo visual" | Dentro das regras do PRODUCT.md (um acento, fundo que não muda por seção, sem blobs, sem cursor custom, sem intro lenta): foto real no hero, prints reais em moldura igual, acento com intenção (60/30/10), ritmo alternado entre seções densas e arejadas, logos na stack. Ação 9. | pendente |
| Usar o e-book "Como TIRAR essa CARA de IA" como base das decisões | Lido inteiro (89 páginas). Princípios aplicados com citação de página em `direcao-visual.md`. | feito |

## Aberto (depende do Eduardo)

| Assunto | Recomendação |
|---|---|
| Mona Sans: o detector do impeccable a marcou como fonte muito usada. | Manter. Razões no fim de `direcao-visual.md`: uma família só com eixo de largura resolve as 3 decisões de tipografia do e-book (p. 42 a 45) e já é a identidade das duas rodadas aprovadas. |
| Textos novos da trajetória (2 ou 3 frases por marco). | Ele escreve ou dita; a sessão principal só organiza. |
| Tilt dos prints (6°). | Remover junto com o ímã; o círculo é o momento de movimento da casa. |
| Prints reais do leadgate (o atual é o banner do GitHub) e mais duas capturas do InfoHub. | Ele fornece; até lá a galeria mostra só o que existe, sem "Captura pendente". |

## Textos da trajetória (aprovados pelo responsável em 09/11/2026)

O cargo de auxiliar administrativo (out/2025 a abr/2026) não entra na trajetória.

- 2018, CS50: "Comecei o CS50, o curso de introdução à computação de Harvard, online. O primeiro exercício é um hello, world em C, e foi ali que comecei a me interessar por programação."
- 2020, mods de jogos: "Na pandemia, passei a mexer em mods de jogos, principalmente Minecraft. Foi o primeiro código de outra pessoa que abri para mudar e ver o resultado no jogo."
- fev/2024, AMF: "Entrei em Sistemas de Informação na AMF, com formatura prevista para dez/2028. Na faculdade fiz o InfoHub InovAMF na disciplina de Arquitetura de Sistemas."
- out/2025, 1º Ideathon de SI da AMF: "1º lugar no 1º Ideathon de Sistemas de Informação da AMF, com a equipe Mentor.Me, na primeira edição do evento."
- fev/2026 a set/2026, JET: "Professor bolsista no JET, de fevereiro a setembro. Dei aulas de tecnologia para 100 alunos de 4 escolas públicas." (números corrigidos pelo responsável em 11/11: "foram 100 alunos e 4 escolas")
- mai/2026, CentralEng: "Desenvolvedor full stack e analista de TI numa empresa de engenharia de climatização. Coloquei em produção um LMS usado por 20 colaboradores e lidero o sistema de gestão de PMOC."
- jun/2026, Coderace 2026: "Campeão do Coderace 2026 da AMF com o AgroPlanner."
- jun/2026, YourMentor: "Cofundei o YourMentor em junho."
- out/2026, Asten AVMB: "Estágio de desenvolvimento no time de Inovação."

## Stack (aprovada pelo responsável em 09/11/2026)

"Coloca todas na stack, menos Jira e Confluence." Logos do Simple Icons 15.22.0 (slugs conferidos com HTTP 200 no jsDelivr), em `currentColor`, duas fileiras em sentidos opostos.

- Desenvolvimento: TypeScript (`typescript`), React (`react`), Next.js (`nextdotjs`), Node.js (`nodedotjs`), PostgreSQL (`postgresql`), Prisma (`prisma`), Zod (`zod`), Docker (`docker`), Vitest (`vitest`), Playwright (sem ícone no Simple Icons: entra só o nome), n8n (`n8n`), Astro (`astro`), Tailwind CSS (`tailwindcss`), Python (`python`), GSAP (`gsap`), Git (`git`), GitHub (`github`), GitHub Actions (`githubactions`), Vercel (`vercel`), Linux (`linux`).
- IA: Claude e Claude Code (`claude`), ChatGPT (`openai`), Gemini (`googlegemini`), Cursor (`cursor`), GitHub Copilot (`githubcopilot`).
- SaaS: Supabase (`supabase`), Notion (`notion`), Figma (`figma`), Google Workspace (sem ícone próprio: `google`).

## Decisões de 09/11/2026 (noite)

- Anel da transição P3: sem brilho. Sai o `box-shadow` de 24 px na cor de destaque e fica só o traço fino, o que também tira o achado `dark-glow` do detector.
- Hero: altura do conteúdo. O nome sobe para perto do topo e a linha de fatos vem logo depois do conteúdo, em vez de ficar presa no pé da dobra.
- Cursor da digitação: continua na cor de destaque.
- Fonte: trocar a Mona Sans por uma "diferentona" que encaixe no DS. Prancha com 15 opções em `prototipo/lab/fontes.html`, com a Mona Sans como referência.
- Frase digitada do hero: sai "full stack que escreve a spec antes do código". Fica "Desenvolvedor." fixo e o fim é digitado, apagado e trocado em ciclo, sem erro de digitação: "Sistemas de Informação na AMF.", "Inovação na Asten AVMB.", "TypeScript, React e Node.js.". Nas palavras dele: "sou Dev, não importa área, eu resolvo".
- Atalhos do header e do menu: "a transição deve ser mais suave, hoje é muito rápido e sem muito estilo". Rolagem com duração proporcional à distância (1,0 a 1,8 s, easing suave) e um indicador da seção ativa que desliza na pílula do header.
- Fonte, rodada 1 (`prototipo/lab/fontes.html`): favorita a opção 12, Funnel Display no nome e nos títulos, Funnel Sans no texto e Reddit Mono nos rótulos e dados. "Gostei da 12, deixe ela salva e vamos ver mais algumas." Rodada 2 em `prototipo/lab/fontes-2.html`, com a 12 ao lado de 15 opções novas, todas com a Reddit Mono.
- Transição em círculo (P3): "o que deve expandir em círculo é o card clicado, não o lugar onde o cursor clicou". A forma de revelação nasce exatamente no retângulo do card (mesmo raio de canto), arredonda até virar círculo e cresce até cobrir a tela; na volta, faz o caminho inverso até o card. O anel acompanha a borda da forma.
- Frase digitada do hero, ajuste: voltam os erros de digitação ("era legal"). Cada fim do ciclo é digitado com um erro realista, apagado e corrigido.
- Fonte final: opção 12. Funnel Display no nome, títulos e números grandes; Funnel Sans no texto; Reddit Mono em rótulos e dados, já agora. A página se alinha à fonte sem sair do que já existe.
- Títulos de seção: rótulo pequeno em Reddit Mono caixa alta e numerado ("02 / TRAJETÓRIA") acima do título em caixa normal.
- Nome no hero: "Pode deixar maior e pode cobrir mais área."

## Rodada 4: decoração e animação na linha da referência (10/11/2026)

Pedido: "mais detalhes de animação e decoração no background, nos cards, efeito de vidro, transição entre cores, mas sem exagerar", seguindo danmachado3105.github.io "sem exagerar nas cores", e "pode adicionar mais texto". Isso revoga a regra do PRODUCT.md de fundo único por seção e sem brilho no fundo.

- Fundo entre seções: em dúvida entre alternar claro e grafite e só nuances de tons frios. Prancha de teste em `prototipo/lab/fundo.html`.
- Entram: grão leve e brilho atrás do nome; texto do Sobre que acende palavra por palavra; cards de vidro; foto com selo girando; carrossel de projetos.
- Stack: "as stacks principais com destaque em tabela, como qual projeto usou aquilo e como. O resto só onde já estão" (nas fileiras de logos).
- Nome: "Gomes" em contorno que se preenche "enquanto o resto vai aparecendo junto, vamos pensar em como ele enche só". Quatro variantes na mesma prancha.
- Textos novos: a sessão rascunha com fatos conhecidos e ele aprova antes de entrar.
- Fundo: escolhido "só nuances", com seções maiores e cores melhores. Três paletas novas em `prototipo/lab/fundo.html` (B1 Frio, B2 Papel, B3 Cobalto leve), seções com 92vh.
- Bug: "Só roda a primeira transição, depois dela, nenhuma roda." Em correção no lab e no protótipo.
- Sobre: "Sem frase de efeito, o sobre deve ser uma breve história minha e o que faço", com parte pessoal (automobilismo, Fórmula 1). Texto em `docs/design/textos-rascunho.md`.
- Stack em tabela ganha n8n e Claude (leadgate); Vitest confirmado no leadgate. LMS entra como terceiro projeto.
- Stack em fila dupla: cada item mantém o ícone e o nome, mas o nome vai escrito na fonte da própria marca. Quem não tem ícone (Playwright) fica só com o nome, também na fonte da marca. Fonte proprietária usa a alternativa livre mais próxima.

## Decisões de 11/11/2026

- Fontes: a opção 12 no site todo; nas fileiras da stack, cada nome na fonte original da marca quando ela é livre (lista em `docs/design/stack-fontes.md`), o resto em Funnel Sans.
- Stack: "gostei mais da parte de Stack do LAB, o atual é feio e não vai até a borda, pode alterar um pelo outro de forma exata. Mas mantendo as animações e a reação ao mouse." Pílulas de borda a borda, como em `lab/fundo.html`, com ícone e nome na fonte da marca.
- Paleta: "foque em cores boas pra tema claro que não fiquem tão brancas, ou descarte ele por completo e refazemos o dark." Nova rodada na prancha de fundo: três claros mais fechados (L1 a L3) e dois só escuro (D1, D2).
- Sem selo na foto.
- InfoHub: "planejei e executei toda parte de dev, a arquitetura foi pensada em conjunto."
- Transições: no Chrome dele, mesmo com o cache limpo, não rodam o círculo ao abrir o projeto nem a volta para a home. No Chrome controlado pela sessão, as duas rodam. Causa em investigação.
- Header em pílula: "Na pílula, a seleção de tema e língua some, a animação não está tão suave na transição e demora pra rodar quando se volta para o topo." Correção no lote D.
- Transição dos cards: "vamos fazer algo mais simples ou trabalhar com a expansão do card em si, sem focar em um ponto e crescer em círculo. Abandone a ideia de círculo para animação." O círculo, o anel e a P5 saem; entra o próprio card crescendo até virar a página, com os cantos indo a zero, e encolhendo de volta na volta.

## Para a spec 001 (migração para Astro)

- SEO e GEO como foco da migração (pedido de 11/11: "lembre de focar no GEO e SEO com o astro"; o Tailwind entra junto com o Astro). A spec 001 deve cobrir: `sitemap.xml` e `robots.txt`; dados estruturados JSON-LD (`Person` e `ProfilePage` na home, `CreativeWork` ou `SoftwareSourceCode` por projeto, com `sameAs` para GitHub e LinkedIn); `hreflang`, canonical e Open Graph com imagem por página nas duas línguas; `llms.txt` com o resumo do perfil e dos projetos para buscadores de IA; todo o texto no HTML gerado no build, legível sem JS; títulos e descrições únicos; fatos consistentes entre site, currículo e LinkedIn; meta de Core Web Vitals verdes.
- Tailwind e shadcn (pedido de 11/11: "Se quiser use tailwind e shadcn"; "pode levar pra spec do Astro"). Recomendação da sessão: Tailwind v4 no Astro, com os tokens atuais de `prototipo/style.css` (cores, espaçamento, raios, tipografia) virando o tema dele; shadcn só se alguma ilha virar React, e o carrossel de projetos é o único candidato. No protótipo continua CSS puro.
- Configuração favorita no lab de fundo: B só nuances, paleta B0, tema escuro, grão, brilho, vidro, nome F3 letra a letra.
- Tema: "Segue o sistema e vamos criar um DS bem feito que encaixe tanto no claro, quanto escuro. Passe handoff que vou usar o claude design." Brief em `docs/design/handoff-claude-design.md`.
- Retorno de 11/11 sobre o lote D e a transição nova:
  - Pílula do header: "mostra língua e tema por um segundo e some, mas permanecem clicáveis" (o bug continua; os controles ficam invisíveis, não somem do clique).
  - Transição do card: "teve boa intenção, mas corta e é muito brusca".
  - Projetos: "deixe eles listados em pirâmide invertida" (sai o carrossel: "Carrossel ficou ruim de ver"). A interpretar no próximo passo: lista empilhada do card mais largo e destacado para os menores, ou o mais importante primeiro e maior.
  - "E o nome animado não entrou": o preenchimento do "Gomes" (escolha dele: F3 letra a letra, da prancha `lab/fundo.html`) ainda não foi levado ao protótipo.
- Retorno de 11/11 sobre o lote E0 (worker Sonnet):
  - Transição do card: "ficou pior, ou refazemos ou usamos páginas mesmo". Decisão: navegação entre páginas com esmaecimento curto (cerca de 250 ms); sai a expansão do card, o `vt.js` e a opção "Transição do card" do painel.
  - Stack: a fileira de cima das pílulas aparece cortada no topo a 1920 px; o cabeçalho da tabela não alinha com as colunas. Correção no lote E1.
  - Projetos: leadgate em largura total no topo, InfoHub e LMS abaixo ("Vai de leadgate em cima e os outros abaixo").
- Decisões de 11/11 depois da auditoria E2 (`docs/design/auditoria/auditoria-e2.md`) e da pesquisa de paletas (`docs/design/paletas-pesquisa.md`, prancha `prototipo/lab/paletas.html`):
  - Sobre: palavras ainda apagadas sobem para cerca de 3:1 de contraste e o texto termina de acender mais cedo; o efeito fica.
  - Faixa da stack e frase digitada: sem botão de pausa. A faixa para no hover, no foco do teclado e no toque; a frase digitada para depois de 3 ciclos.
  - Capa do LMS: capa gráfica no estilo da do leadgate, sem print do sistema.
  - Rolagem dos atalhos limitada a 1,2 s (princípio "movimento rápido e com propósito"); hover dos projetos sem ampliar a imagem dentro da moldura.
- Paleta: "vou de P1 Ocre" (11/11), escolhida na prancha `prototipo/lab/paletas.html`. Tokens em `docs/design/paletas-pesquisa.md`. Entra no protótipo depois do lote E3.
