# Pesquisa de paletas (11/11/2026)

Pedido do responsável: "vamos pensar em outra paleta de cores também, pesquise alguns portfólios por aí e use o que mandei há tempos como ideia também". Pesquisa feita por agente com Playwright, lendo as variáveis CSS e os estilos computados de cada página nos temas claro e escuro. Contraste pela fórmula WCAG 2.x.

## Referências observadas

| Site | Escuro (fundo / texto / destaque) | Claro (fundo / texto / destaque) | Nota |
|---|---|---|---|
| danmachado3105.github.io | `#100d0b` / `#f5efe6` / `#ff6b3d` | não tem | Referência dada pelo responsável. Texto secundário `#a8a097`, brilho atrás do nome `rgb(139 94 60 / .25)`. |
| samuelkraft.com | `#161615` / `#fff` / `#e38356` | `#fdfdfc` / `#000` / `#e38356` | Off-white quente e um terracota nos dois temas. |
| leerob.com | `#1b1a19` / `#e8e5df` / sem destaque | `#fff` / `#282828` | Cinza quente no escuro. |
| brittanychiang.com | `#0f172a` / `#94a3b8` | não troca | Slate, perto do grafite atual. |
| joshwcomeau.com | `#111b27` / `#e3e6e8` / `#80aaff` | `#fff`, hero `#a0d4ee` | Hero claro colorido. |
| paco.me, rauchg.com, ryo.lu, jhey.dev, jakeprins.com | pretos e cinzas neutros | `#fff` a `#fafafa` | Sem destaque de cor. |
| emilkowal.ski, delba.dev | não troca | `#fdfdfc`, `#fafaf9` | Off-white quente. |
| lynnandtonic.com | `#111` / `#ff3b3b` | `#e4e2d7` / `#000` | Único claro que não é branco (papel, L* perto de 89). |
| cassie.codes | `#000` / `#aaa` / `#ffdfa7` | não troca | Preto com creme. |
| impeccable.style | não tem | `#f7f7f7` / texto `oklch(22% 0 0)` | Destaques em verde-azulado e dourado. |

Dos 11 sites com tema claro, 9 usam de `#fff` a `#fdfdfc`. Um claro com luminosidade entre 86 e 92 já diferencia o portfólio.

## Quatro paletas propostas

Todas passam AA (4,5:1) em texto, texto secundário e destaque nos dois temas. `--line` é decorativa (perto de 1,4:1); borda com significado usa `--muted`.

### P1 Ocre (quente, a partir da ideia do danmachado)
Preto terroso com açafrão no lugar do laranja-avermelhado, e claro cor de areia.
- Escuro: bg `#15120e`, bg-2 `#1b1712`, surface `#221d17`, line `#3a3228`, text `#f1e9dc`, muted `#b0a592`, accent `#e4a843`, accent-ink `#17110a`.
- Claro (L* 89,8): bg `#e9e1d2`, bg-2 `#e0d6c4`, surface `#f1ebdf`, line `#c9bda6`, text `#241d14`, muted `#5c503d`, accent `#8a4f00`, accent-ink `#fff8ec`.
- Contraste escuro: texto 15,5; secundário 7,68; destaque 8,87. Claro: texto 12,8; secundário 6,05; destaque 5,05 (4,56 sobre bg-2).

### P2 Grafite Cobalto (evolução da atual)
O mesmo grafite com cobalto, escuro mais azulado e claro cinza-névoa.
- Escuro: bg `#0e1116`, bg-2 `#13171e`, surface `#1a1f28`, line `#2b3240`, text `#e7eaf0`, muted `#a3abb9`, accent `#8aa8ff`, accent-ink `#0a1020`.
- Claro (L* 91,9): bg `#e5e8ed`, bg-2 `#dbdfe6`, surface `#eef0f4`, line `#c3c9d3`, text `#141a24`, muted `#4a5466`, accent `#1f3fb8`, accent-ink `#ffffff`.
- Contraste escuro: texto 15,7; secundário 8,18; destaque 8,22. Claro: texto 14,2; secundário 6,21; destaque 6,95.

### P3 Musgo (verde, calma)
Preto esverdeado com destaque menta, claro sálvia.
- Escuro: bg `#0f1411`, bg-2 `#141b17`, surface `#1b231e`, line `#2d3a32`, text `#e8eee8`, muted `#a2b0a6`, accent `#72d6a3`, accent-ink `#08150e`.
- Claro (L* 91,5): bg `#e4e8de`, bg-2 `#dae0d3`, surface `#edf0e7`, line `#c0c9b8`, text `#141c16`, muted `#49574d`, accent `#17653f`, accent-ink `#f6fff9`.
- Contraste escuro: texto 15,8; secundário 8,24; destaque 10,51. Claro: texto 14,0; secundário 6,14; destaque 5,69.

### P4 Petróleo (verde-azulado profundo)
Preto azul-esverdeado com destaque água, claro cinza mineral.
- Escuro: bg `#0b1417`, bg-2 `#101c20`, surface `#16252a`, line `#26393f`, text `#e4eef0`, muted `#9db3b8`, accent `#4fd0c8`, accent-ink `#04171a`.
- Claro (L* 91,4): bg `#e0e8e8`, bg-2 `#d5dfdf`, surface `#eaf0f0`, line `#b9c8c9`, text `#10191b`, muted `#445659`, accent `#0b6a6e`, accent-ink `#f2ffff`.
- Contraste escuro: texto 15,8; secundário 8,50; destaque 9,93. Claro: texto 14,3; secundário 6,20; destaque 5,11 (4,68 sobre bg-2).

## Recomendação do agente
P1 Ocre: mantém o preto quente que o responsável gostou na referência, com açafrão e claro cor de areia, sem branco. Se a escolha for ficar no frio, P2 é a evolução segura da atual.

Pendente: decisão do responsável depois de ver as quatro aplicadas ao site na prancha `prototipo/lab/paletas.html`.
