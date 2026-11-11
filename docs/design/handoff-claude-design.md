# Handoff para o Claude Design: design system do portfólio (11/11/2026)

Pedido do responsável: "Segue o sistema e vamos criar um DS bem feito que encaixe tanto no claro, quanto escuro." Este arquivo é o brief para montar o design system no Claude Design. Tudo o que está aqui já foi decidido por ele; o que está em aberto aparece no fim.

## 1. Produto

Portfólio pessoal de Eduardo Bergoli Gomes, desenvolvedor. Site estático, uma página com seções empilhadas (Sobre, Trajetória, Experiência, Stack, Projetos, Números do GitHub, Contato) e uma página por projeto (leadgate, InfoHub InovAMF, LMS de treinamento técnico). Público: recrutadores e times técnicos. PT em `/`, EN em `/en/`. Vai ser construído em Astro, provavelmente com Tailwind v4 usando os tokens deste DS.

Voz: fatos, números e o que roda onde. Sem frase de efeito, slogan, contraste retórico nem travessão.

Referência de estrutura e acabamento: danmachado3105.github.io (nome grande, foto, seções empilhadas, movimento na rolagem, fundo que muda de tom entre seções, grão, brilho atrás do nome, cards de vidro). Não copiar a paleta dela (preto quente e laranja) nem as fontes.

## 2. Tema

Claro e escuro, seguindo o sistema da pessoa, com botão para trocar. O DS precisa de um conjunto de tokens para cada tema, com a mesma hierarquia nos dois. O escuro é o favorito dele; o claro não pode ficar "branco demais" (comentário dele sobre as paletas claras).

## 3. Cor

Atualização de 11/11/2026: a paleta escolhida passou a ser a P1 Ocre (tokens dos dois temas e contraste em `docs/design/paletas-pesquisa.md`). Os neutros grafite, o cobalto e a tabela abaixo ficam como histórico da paleta anterior.

- Neutros: grafite frio, partindo dos cinzas do perfil do GitHub (`#111827`, `#4b5563`, `#6b7280`).
- Um destaque só: cobalto (`#1d4ed8` no claro, `#8fb0ff` no escuro). Usado em botão principal, links, foco, nós e linha da trajetória, cursor da digitação, brilho atrás do nome.
- Fundo que muda de tom entre seções durante a rolagem, só em nuances (nunca vira de claro para escuro no meio da página). Configuração preferida dele no laboratório: paleta "B0", tema escuro.

| Token | Claro hoje | Escuro hoje |
|---|---|---|
| fundo base | `#f6f7f9` | `#0b0f17` |
| fundo seção 2 | `#e8ecf2` | `#111a29` |
| fundo seção 3 | `#ebebeb` | `#15161a` |
| superfície elevada | `#ffffff` | `#111827` |
| texto | `#111827` | `#e6e8ec` |
| texto secundário | `#4b5563` | `#a1a8b5` |
| texto terciário | `#6b7280` | `#8b93a1` |
| fio | `#dfe2e7` | `#1f2633` |
| fio forte | `#c9ced6` | `#2d3544` |

Pedido para o DS: refinar o claro para não ficar tão branco (as tentativas L1 Aço, `#e4e8ed` / `#d8dfe6` / `#cbd4dd`, ficaram melhores que o branco) e fechar o ritmo de tons por seção nos dois temas. Contraste mínimo: corpo 4,5:1, títulos 3:1, destaque 4,5:1 em todo tom, inclusive no meio das trocas.

## 4. Tipografia (decidida)

- Funnel Display, pesos 700 a 800: nome, títulos, números grandes.
- Funnel Sans, 400 a 600: texto, botões, navegação.
- Reddit Mono 500: rótulos e dados (datas, unidades, tags, numeração, rótulo de seção).
- Rótulo de seção: Reddit Mono em caixa alta, numerado, acima do título em caixa normal ("02 / TRAJETÓRIA" sobre "Trajetória").
- Nome no hero: grande, mas ele achou exagerado a 193 px em 1440; alvo entre 128 e 144 px. Segunda linha ("Gomes") em contorno que se preenche letra por letra na abertura.
- Escala atual: corpo 17 px (1.6), pequeno 15 px, h3 24 a 32 px, h2 40 a 56 px, rótulo 12 px, dado 13 px.

## 5. Forma, espaço e efeitos

- Raios: 8, 14 e pílula. Fios de 1 px. Numerais tabulares.
- Espaço: escala 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160 px; entre seções 96 a 160 px; margem lateral 20 a 40 px; largura máxima 1180 px; grade de 12 colunas.
- Grão leve em toda a página (opacidade 4 a 7%), brilho difuso em cobalto atrás do nome, cards de vidro (fundo translúcido, desfoque de 16 px, fio de 1 px com realce interno).

## 6. Componentes que o DS precisa cobrir

1. Header: barra no topo da página e pílula de vidro depois de rolar, com navegação, PT/EN e tema sempre visíveis; menu abaixo de 900 px; indicador da seção ativa.
2. Botões: principal (cobalto), contorno, ícone redondo.
3. Linha digitada do hero e linha de fatos em mono.
4. Rótulo de seção + título.
5. Card da trajetória (vidro), com linha vertical e nós que se preenchem na rolagem, data em mono.
6. Pílulas da stack em duas fileiras de borda a borda, em sentidos opostos, com ícone e nome na fonte da marca.
7. Tabela da stack principal: número, tecnologia, onde usou, como, etiqueta.
8. Card de projeto para carrossel arrastável: print, título, frase, números, tags.
9. Cabeçalho da página de projeto e galeria.
10. Números do GitHub: valor, unidade, gráfico de linha pequeno.
11. Contato: e-mail grande com botão de copiar, links.
12. Tags e etiquetas.

## 7. Movimento (regras que valem para o DS)

Rápido e com propósito; quem pede menos movimento recebe a página parada. Transição entre páginas: o card clicado cresce até virar a página (sem círculo). Rolagem suave curta, revelação na rolagem, parallax leve, texto do Sobre que acende palavra por palavra. Fora: intro lenta, cursor próprio, manchas de cor que se movem, scramble de texto.

## 8. Princípios (e-book "Como tirar a cara de IA", resumo em `docs/design/direcao-visual.md`, seção 1)

Alinhamento de toda borda a uma coluna, vazio como proteção, proximidade por grupo, proporção igual entre elementos iguais, 60/30/10 nas cores, um elemento manda em cada seção, ritmo alternado entre seção densa e arejada.

## 9. Material para anexar no Claude Design

- Screenshots do protótipo: `docs/design/auditoria/c1-*.png`, `d1-*.png` (quando o lote D terminar) e `b2-header-*.png`.
- Prancha de fundo: `docs/design/auditoria/fundo2-B0-*.png` e `fundo3-L1-*.png`.
- Fontes: `docs/design/auditoria/fontes-1440-claro.png` (card 12).
- Este arquivo, `PRODUCT.md` e `docs/design/feedback-prototipo.md`.

## 10. Em aberto

- Tons finais do claro (não tão branco) e o ritmo por seção nos dois temas.
- Se o destaque escurece um pouco no claro mais fechado (com L1, `#1e40af` passou no contraste e `#1d4ed8` ficou em 4,39:1 no tom mais fundo).
- Variantes de densidade do card de projeto no carrossel em 390 px.
