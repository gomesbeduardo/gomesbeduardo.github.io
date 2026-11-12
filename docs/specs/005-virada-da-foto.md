# Spec 005: virada da foto do topo

Estado: aprovada pelo responsável em 11/11/2026; comportamento no celular e borda da foto alterados e reaprovados no mesmo dia (D3, C1a, C6 e A5).

## Pedido literal

> a animação de virada do card da foto ficou ruim, e pode adicionar mais escrita lá, já que ganhou bastante espaço

## Problema

Cinco cliques seguidos na foto do topo viram o card e mostram a curiosidade c10 ("Sou cofundador do YourMentor desde junho de 2026."). A virada foi feita para o disco redondo antigo e não acompanhou a moldura 4:5 da spec 004. Medido no site publicado em 1280 px (11/11/2026):

- O card começa em 345×432 px, chega a 515 px de altura no meio do giro e termina em 320×155 px.
- O bloco ocre some, porque está no botão da foto, que fica oculto quando o card vira.
- O topo inteiro sobe cerca de 210 px: o nome, o subtítulo e os botões mudam de lugar.
- O verso tem uma frase só e deixa vazio o espaço da moldura.

## Fatos

- F1. A virada mora em `site/surpresas.js` (`MODOS.virar`, `animar`, `desvirar`) e `site/surpresas.css` (seções "carta virada" e "foto"); a moldura, em `site/style.css` (`.photo`, `.photo-btn`, `::before` ocre).
- F2. A inclinação da foto com o mouse está em `site/main.js` (GSAP em `.photo-btn`) e é desligada com movimento reduzido.
- F3. As curiosidades c1 a c9 já usam o CS50 (c1) e o Coderace (c4). Repetir esses fatos no verso tiraria a graça de achar as outras.
- F4. O mesmo `MODOS.virar` serve os cartões da Trajetória (`.traj-card`) e o `.sp-mais`. Esta spec não muda esses dois.

## Decisões do responsável (11/11/2026)

- D1. A foto vira como uma carta de duas faces, no mesmo tamanho do início ao fim, com o bloco ocre atrás o tempo todo.
- D2. O verso traz uma ficha com fatos que já estão no site.
- D3. No celular, o card vira no mesmo tamanho da foto (160×200 px) e nada abaixo dele se mexe. O verso mostra a frase da c10, a contagem e o botão; a ficha aparece só no computador. Substitui a decisão anterior (o verso crescia até 360 px), que o responsável achou grande demais ao ver no celular.

## Comportamento

### Computador (largura acima de 860 px)

- C1. A frente é a foto atual. O verso é uma face do mesmo tamanho da moldura (a largura das colunas 9 a 12 e a proporção 4:5), com fundo `--raised`, borda `--line-strong` e canto `--r-md`.
- C1a. A borda de 1 px (`--line-strong`) aparece em volta da foto e do verso o tempo todo: antes do giro, em cada quadro do giro, com o card virado e depois de desvirar. Nenhum quadro mostra a foto sem a borda nem a borda chegando atrasada (pedido do responsável, 11/11/2026).
- C2. O giro é no eixo vertical, de 0° a 180°, em cerca de 500 ms, com a curva `--ease` do site. Desvirar faz o caminho de volta. As duas faces não aparecem espelhadas em nenhum momento.
- C3. O bloco ocre fica parado no lugar, atrás do card, durante e depois do giro.
- C4. Nada no topo muda de lugar: a caixa da `.photo` e a posição do nome ficam iguais, com tolerância de 1 px, antes, durante e depois do giro.
- C5. Enquanto o card está virado ou girando, a inclinação com o mouse fica desligada; ao desvirar, volta a funcionar.

### Celular (até 860 px)

- C6. O card gira no tamanho da foto (160×200 px), como no computador, sem troca de tamanho. O verso mostra a frase da c10, a contagem e o botão "virar de volta", sem o rótulo e sem a ficha, e o texto cabe sem corte nem rolagem de 320 px a 860 px. O botão mantém o alvo de toque de 44 px.
- C7. Nada passa da largura da tela em 390 px, virado ou não.

### Movimento reduzido

- C8. Sem giro nem inclinação: o verso aparece e some com um esmaecer de até 150 ms, como as outras surpresas do site.

### Acessibilidade

- C9. Continua como hoje: cinco cliques viram; o foco vai para "virar de volta"; Esc e "virar de volta" desviram e devolvem o foco ao botão da foto; o verso é um grupo com `aria-live="polite"`.
- C10. A face que está de costas fica fora do leitor de tela e do Tab (`inert` ou `aria-hidden` com `tabindex` removido).
- C11. O contraste do texto do verso passa em AA nos dois temas.
- C12. O botão da foto tem `touch-action: manipulation`: no toque, os cinco toques rápidos viram cliques e o toque duplo não dá zoom quando começa na foto. O zoom de pinça continua funcionando. (Acrescentado com o ok do responsável em 11/11/2026, junto da spec 007.)

## Conteúdo do verso

Ordem de cima para baixo: o rótulo em mono, a frase da c10 em destaque (fonte de display), a ficha, a contagem de achados e o botão "virar de volta". Os textos da ficha vêm da Trajetória do site, encurtados.

| Campo | PT | EN |
|---|---|---|
| Rótulo | Curiosidade | Curiosity |
| Destaque | Sou cofundador do YourMentor desde junho de 2026. | I have been a co-founder of YourMentor since June 2026. |
| No YourMentor | Back-end em Python, FastAPI e PostgreSQL; arquitetura, modelo de dados e monetização. | Back end in Python, FastAPI and PostgreSQL; architecture, data model and monetization. |
| Antes | ToPark, de abr/2024 a out/2025: startup de reserva de vagas de estacionamento, na primeira turma da incubadora InovAMF. | ToPark, Apr 2024 to Oct 2025: a startup for booking parking spaces, in the first cohort of the InovAMF incubator. |
| Base | Santa Maria, RS | Santa Maria, Brazil |
| Contagem | N de 10 achados (como hoje) | N of 10 found (as today) |

Os rótulos da ficha ("No YourMentor", "Antes", "Base"; EN "At YourMentor", "Before", "Based in") ficam em mono, no estilo do `.sec-label`. A frase da c10 continua igual, porque também aparece nos outros modos de surpresa.

## Critérios de aceite

- A1. Dado o site em 1280 px, quando se clica 5 vezes na foto, então a caixa da `.photo` e o topo do `h1` medem o mesmo antes, a cada 40 ms do giro e depois, com tolerância de 1 px (medida no Playwright).
- A2. Dado o card virado em 1280 px, então o bloco ocre está visível na mesma posição de antes do giro, e o verso mostra o rótulo, o destaque, os três campos da ficha, a contagem e o botão (print nos temas claro e escuro).
- A3. Dado o card virado, quando se aperta Esc, então o card desvira e o foco volta ao botão da foto; a face de costas não recebe foco pelo Tab em nenhum dos dois estados (Playwright).
- A4. Dado `prefers-reduced-motion: reduce`, quando se vira o card, então nenhum `transform` de rotação é aplicado e a troca dura até 150 ms (Playwright).
- A1a. Dado o site em 1280 px e em 390 px, quando se vira e se desvira o card, então a borda aparece em todos os prints tirados a cada 40 ms, com o card de frente, de lado e de costas (Playwright).
- A5. Dado o site em 320, 360, 390 e 414 px, quando se vira o card, então a caixa da `.photo` e o topo do `h1` medem o mesmo antes, durante e depois (tolerância de 1 px), o verso não tem rolagem nem texto cortado (`scrollHeight` igual a `clientHeight`), a ficha não aparece e nada passa da largura da tela (Playwright e print).
- A6. Dado `site/surpresas.js`, então os textos da ficha existem em PT e EN, iguais à tabela acima, e o verso não cita CS50 nem Coderace (teste em `scripts/site/conteudo.test.mjs`).
- A7. Dado o card virado com o mouse sobre ele, quando o mouse se move, então o card não inclina (Playwright).
- A8. Os cartões da Trajetória e o `.sp-mais` continuam virando como hoje (Playwright: virar um cartão da Trajetória e conferir o verso). Nota de 11/11/2026: hoje nenhuma palavra do site liga uma curiosidade ao modo "virar" num cartão da Trajetória (já era assim antes desta spec); o teste cobre o mecanismo trocando o `data-modo` de uma palavra, com o ok do responsável.
- A9. Dado `site/style.css`, então a regra de `.photo .photo-btn` tem `touch-action: manipulation` (teste estático em `scripts/site/foto.test.mjs`).

## Fora do escopo

- Mudar a virada dos cartões da Trajetória e do `.sp-mais`.
- Mudar o gatilho de cinco cliques ou as outras nove curiosidades.
- Fato novo que ainda não esteja no site.

## Perguntas abertas

Nenhuma. O CS50 saiu da ficha, embora estivesse entre os exemplos da pergunta, porque já é a curiosidade c1 (F3).
