---
name: tirar-cara-de-ia
description: Revisão rápida de uma tela, landing page ou site contra o e-book "Como TIRAR essa CARA de IA" (Rafaela Maxwell Maicá de Machado e Gustavo Henrique Florêncio), com citação de página. Use quando alguém disser que a interface "está com cara de IA", "ficou genérica", "parece template", pedir "tira a cara de IA", ou ao auditar screenshots antes de aprovar um protótipo. Complementa a skill lp-design-principles (que tem os 13 princípios e o brief); esta só acrescenta os checks que ela não tem, com números.
---

# Tirar a cara de IA

Para o que fazer com os 13 princípios (brief, Bouba/Kiki completo, anti-padrões, modo de revisão), use `lp-design-principles`. Esta skill acrescenta o que falta lá: a página do e-book para cada regra, os números que tornam cada check binário, e a tabela de aceite final.

## 1. Teste de 5 segundos (p. 5)

Abra o screenshot do primeiro viewport (1280 e 360) e responda sem rolar:
1. Sobre o que é o site?
2. Onde o visitante clicaria primeiro?
3. Para quem é?
Falha se qualquer resposta precisar de rolagem ou de mais de um elemento para ser lida.

## 2. Perfil Bouba ou Kiki com números (p. 8 a 18)

Decida o perfil antes de tocar em CSS e verifique que tudo obedece.

| | Bouba (p. 12, 13, 17) | Kiki (p. 14, 15, 18) |
|---|---|---|
| Raio | 3 valores: 8, 14 a 24, pílula (999) | 0 ou 2 px, um valor só |
| Movimento | 300 a 400 ms, ease-out | até 100 ms ou nenhum |
| Grade | respiro, colunas largas | rígida, aproveita cada pixel |
| Tom (p. 16) | próximo, frases curtas | direto, técnico |

Falha se houver mistura (botão pílula com card quadrado, ou tom amigável em tela rígida): o e-book chama isso de incongruência cognitiva (p. 16).

## 3. Checks numéricos por princípio

- **Alinhamento (p. 21 a 25):** no console, `[...document.querySelectorAll('h1,h2,h3,p,img')].map(e=>Math.round(e.getBoundingClientRect().left))`; o conjunto de valores distintos tem de caber nas linhas da grade (gutter e colunas). Mais de 3 bordas esquerdas numa seção é falha ("Nenhum elemento deve ser colocado de forma aleatória", p. 24).
- **Margens (p. 26 a 31):** gutter ≥ 20 px a 360 px de largura e ≥ 40 px a 1280; nada toca a borda; `scrollWidth === innerWidth`.
- **Proximidade (p. 32 a 36):** distância entre elementos do mesmo grupo ≤ metade da distância entre grupos. Espaço entre seções ≥ 2x o espaço entre título e conteúdo.
- **Proporção (p. 37 a 41):** elementos do mesmo tipo (cards, prints, avatares) com a mesma largura e a mesma razão de aspecto; medir `width` e `aspect-ratio`.
- **Tipografia (p. 42 a 45):** uma família (duas no máximo); título principal ≈ 3x o corpo, subtítulo ≈ 2x (p. 44); corpo de 16 a 18 px com `line-height` 1,5 a 1,7; parágrafo entre 60 e 75ch.
- **Cor 60/30/10 (p. 49):** fundo 60, neutro de texto e superfícies 30, acento 10. Contar as cores visíveis num viewport: um acento só; acento em até 10 % da área. Contraste ≥ 4,5:1 em texto abaixo de 20 px e ≥ 3:1 acima (p. 48 e piso WCAG).
- **Contraste e hierarquia (p. 50 a 57):** em cada seção, um elemento com peso claramente maior (tamanho ≥ 2x ou cor de acento). Falha se três ou mais elementos disputam ("A IA tende a deixar tudo com o mesmo peso", p. 52).
- **Movimento do olhar (p. 58 a 65):** título à esquerda no alto, ação principal no fim do F (p. 62) ou do Z (p. 64); nada importante só no canto inferior esquerdo.
- **Repetição e unidade (p. 66 a 70, 79 a 83):** mesma moldura para toda imagem (raio, fio, sombra), mesma distância título-conteúdo em toda seção (medir `margin-bottom` do h2).
- **Ritmo (p. 71 a 74):** alternar seção densa e seção arejada; duas seções seguidas com a mesma estrutura (título + 3 cards) é falha.
- **Equilíbrio (p. 75 a 78):** nenhum viewport com mais da metade da área vazia de um lado enquanto o outro está cheio, salvo decisão registrada.

## 4. Sintomas de cara de IA (p. 84 e 85)

Marque os que aparecem: falta de intenção, tudo com o mesmo peso, falta de hierarquia, excesso de elementos, poucos espaços vazios, excesso de neon ou gradiente, falta de identidade. Dois ou mais sintomas numa seção: a seção volta.

## 5. Tabela de aceite (p. 86)

Para cada seção, uma linha:

| Seção | Sem direção (o que a IA faria) | Com direção (o que está na tela) | Evidência |
|---|---|---|---|

A entrega só fecha quando toda linha tem a coluna "com direção" preenchida com algo medido (px, razão, contagem) e um screenshot. Evidência vai para `docs/design/auditoria/` com nome `tela-largura-tema.png`.

## 6. O que entregar

1. Resultado do teste de 5 segundos.
2. Perfil Bouba ou Kiki e as quebras encontradas.
3. Lista de falhas por princípio com a página do e-book, a medida e a correção exata (valor de token, coluna da grade, tamanho).
4. Tabela da seção 5.
Sem travessão, sem adjetivo de efeito; cada achado com número e caminho do screenshot.
