# Spec 000: portfólio pessoal

Estado: registro retroativo, aprovado pelo responsável em 11/11/2026.

Esta é a spec que deu início ao portfólio. Ela foi planejada em 09/11/2026 como `001-portfolio.md`, mas não chegou a ser escrita antes do site subir (PR #1, v1 em PT e EN no GitHub Pages, 11/11/2026). O número 001 ficou depois com a migração para o Astro. Esta versão foi escrita em 11/11/2026 a partir de três fontes: o grilling de 09/11 (feito na sessão do leadgate e passado para este repositório num handoff privado, que não vai para o git), o `PRODUCT.md` e o site da `staging`. Ela registra o que foi decidido e o que o site entregou, para as specs 001 a 008 terem uma base escrita.

## Pedido literal

> "vamos começar o portfólio em nova sessão, seguindo o do cara como base, mas sem muita firula como o dele e com minha linguagem." (09/11/2026)

Sobre o movimento, no mesmo grilling:

> "Faça transições como a dele, mas sem a troca da cor do fundo... E não deixe tão lento a ponto de atrapalhar a usabilidade, trabalhe com a brincadeira do scroll e do cursor do mouse. Mexa bastante com o movimento da página de forma suave, escritas pode ter animação também para destaque."

> "Faça um efeito de expansão em círculo quando se abre o link, como se ele expandisse e pegasse a tela, a transição entre página deve ser seamless. Se não for possível avise e vamos testando o que for possível e 'inovador' e legal. É um portfolio afinal..."

"O cara" é o portfólio `danmachado3105.github.io` (HTML, CSS e JS puro, GSAP com ScrollTrigger e Lenis, licença MIT).

## Problema

Quem chega ao perfil do Eduardo pelo LinkedIn, pelo README do GitHub ou pelo currículo não tinha uma página que mostrasse, num lugar só, quem ele é, como trabalha e o que já entregou. O visitante é um recrutador ou tech lead que olha a página inicial por pouco tempo, abre um projeto e decide se chama para conversa. Sucesso é contato pelo LinkedIn ou e-mail, ou o currículo baixado.

## Decisões do grilling de 09/11

| Tema | Decisão em 09/11 | No site hoje (`staging`, 11/11) |
|---|---|---|
| Repositório | `gomesbeduardo/gomesbeduardo.github.io`, público, site na raiz `https://gomesbeduardo.github.io`. O repositório privado `portfolio` é outra coisa e não se mexe nele. | igual |
| Stack | Astro estático no GitHub Pages, deploy pelo Actions. | o v1 subiu em HTML, CSS e JS escritos à mão em `site/`, publicados pelo `pages.yml`; o Astro é a spec 001 |
| Idioma | PT em `/` e EN em `/en/`. Navegador `pt-*` abre a PT, qualquer outro a EN. Troca discreta no topo direito; a escolha manual fica salva e vale por cima do navegador. | PT em `/` e EN em `/en/`, com a troca no topo e no rodapé; não há redirecionamento pela língua do navegador nem escolha salva (não implementados no v1) |
| Tema | Claro e escuro pelo sistema, com botão para trocar. Paleta dos cinzas do perfil do GitHub e um destaque só. Fundo sem troca de cor por seção. | paleta P1 Ocre desde 11/11 (`docs/design/paletas-pesquisa.md`); fundo que muda por seção ficou fora da 001 e vira spec própria |
| Seções | Sobre (com o processo de trabalho), Experiência e formação, Stack, Projetos, Números do GitHub, Contato. Currículo para baixar. | as mesmas, mais Trajetória entre Sobre e Experiência |
| Projetos | Só dois, nesta ordem: leadgate e InfoHub InovAMF. Projetos menores não aparecem. | três: leadgate em destaque, InfoHub InovAMF e LMS da CentralEng (spec 004) |
| Card de projeto | Print, uma frase, números e stack; abre página própria do projeto (problema, o que ele fez, resultados, galeria), uma URL por projeto e por idioma. | igual (`projeto-leadgate.html`, `projeto-infohub.html`, `projeto-lms.html` e as versões em `/en/`) |
| Números do GitHub | Contribuições dos últimos 12 meses (com as privadas), repositórios públicos, linguagens mais usadas e calendário no tema do site; coletados no build com token só de leitura e rebuild semanal, com a data da coleta visível. | detalhado e aprovado na spec 002; o site mostra os números de `src/data/github.json` |
| Contato | LinkedIn, GitHub e o e-mail visível com botão de copiar. Sem formulário. | igual, com o aviso de cópia da spec 006 |
| Currículo | PDF geral em PT e EN, gerado a partir dos textos aprovados. | gerado de `src/data/curriculo.json` (specs 003 e 004), em `/curriculo/` |
| Foto | A do LinkedIn, pequena, ao lado do nome. | a do avatar do GitHub, em moldura 4:5 (spec 004), que vira e mostra uma ficha no verso (spec 005) |
| Localização | "Brasil", sem cidade. | "Santa Maria, RS" desde a spec 004 (D3) |
| Domínio | Sem domínio próprio por agora. | igual |
| Rodapé | Citação "In the face of ambiguity, refuse the temptation to guess." (Tim Peters, The Zen of Python) a decidir. | a citação está no rodapé |

## Movimento

Entraram em 09/11, com o limite de não atrapalhar o uso:

- Rolagem suave com Lenis, curta (cerca de 0,8 s), desligada no toque e com `prefers-reduced-motion`.
- Revelação na rolagem (GSAP ScrollTrigger) de títulos, cards e números, até 0,5 s cada.
- Parallax na foto e nos prints; cards que inclinam de leve sob o mouse, só com `(hover: hover) and (pointer: fine)`.
- Botões magnéticos nos botões e links principais, só com mouse.
- Faixa da stack rolando, que para no hover e no foco; com movimento reduzido vira lista parada.
- Barra de progresso de leitura no topo, com `aria-hidden`.
- Digitação com erro no título do topo, uma vez ao abrir, em até cerca de 2,5 s: escreve com erros, apaga e escreve a frase certa. Três variantes de erro sorteadas a cada visita; a frase final é sempre a mesma.
- Números que contam do zero até o valor, em até 1 s, ao entrar na tela.
- Transição em círculo ao abrir a página de um projeto, a partir do ponto do clique.

Mudou depois, no protótipo:

- A transição em círculo e a expansão do card foram testadas e saíram. Em 11/11 o responsável escolheu navegação entre páginas com esmaecimento de 250 ms ("ficou pior, ou refazemos ou usamos páginas mesmo"). O site usa `@view-transition` com esse esmaecimento (`site/transicoes.css`).
- A troca de tema ganhou uma transição própria, em que o tema novo desce do topo atrás de uma máscara.
- O carrossel de projetos saiu ("Carrossel ficou ruim de ver"): o leadgate fica em largura total no topo e os outros abaixo.
- As surpresas (curiosidades escondidas no texto) entraram depois, com o modal "Feito com o Claude Code" no rodapé.

Ficaram fora: troca de cor de fundo por seção (revista em 10/11 e adiada para depois da 001), manchas de cor desfocadas, intro lenta, cursor próprio no lugar do cursor do sistema, seção horizontal presa na rolagem, scramble de texto.

## Voz

Fatos, números e o que roda onde. Sem frase de efeito, slogan, contraste retórico nem travessão. Foco no desenvolvedor, na forma de trabalho (spec antes do código, TDD, PR revisado com CI, avaliação com conjunto reservado em recursos com IA) e nos resultados. Não inventar depoimento, cliente nem métrica de negócio.

## Specs que partem desta

- 001: migração do site para Astro e Tailwind v4, com SEO, GEO e metas de desempenho.
- 002: números do GitHub coletados no build.
- 003 e 004: currículo gerado do JSON, em PDF e no site.
- 005: virada da foto do topo, com a ficha no verso.
- 006: e-mail que copia com aviso e rodapé completo.
- 007: correções do CodeRace e do YourMentor.
- 008: números do processo no modal do rodapé (rascunho; implementada depois da etapa 1 da 001).

## Critérios de aceite

Valem para o site da `staging` em 11/11/2026 e continuam valendo depois da migração da 001.

- C1. Dado o site em `/`, então ele tem as seções Sobre, Trajetória, Experiência e formação, Stack, Projetos, Números do GitHub e Contato, nessa ordem, e o mesmo em `/en/`.
- C2. Dada qualquer página com troca de língua (home e projetos), quando o link da outra língua é clicado, então abre a página equivalente na outra língua (`/` e `/en/`, `projeto-x.html` e `en/projeto-x.html`).
- C3. Dado o sistema em tema escuro sem escolha salva, quando a página abre, então ela abre no escuro sem piscar o claro; o botão de tema troca e a escolha fica salva.
- C4. Dado `prefers-reduced-motion: reduce`, então nenhuma animação roda, a faixa da stack fica parada e todo texto e todo número aparecem no valor final.
- C5. Dado o card de um projeto, quando é clicado, então abre a página do projeto na mesma língua, com problema, o que foi feito, resultados e galeria.
- C6. Dado o Contato, então LinkedIn, GitHub e o e-mail aparecem, e o botão copia o e-mail.
- C7. Dado o link "Baixar currículo", então ele baixa o PDF da língua da página.

## Testes de aceite

| # | Critério | Como conferir |
|---|---|---|
| T1 | C1 | `grep -o '<h2 class="reveal">[^<]*' site/index.html site/en/index.html`: sete títulos, na ordem de C1 |
| T2 | C2 | `grep -n 'hreflang' site/index.html site/projeto-leadgate.html`: links para a página equivalente da outra língua |
| T2b | C3 | `node --test scripts/site/tema.test.mjs` (roda `inicio.js` e `tema.js`) |
| T3 | C4 | no Chrome, DevTools com "Emulate CSS prefers-reduced-motion: reduce": página parada, números no valor final |
| T4 | C5 | `node --test scripts/site/conteudo.test.mjs` e clique em cada card, PT e EN |
| T5 | C6 | `NODE_PATH=$HOME/.npm/_npx/e41f203b7505f1fb/node_modules node scripts/site/contato.e2e.mjs` (spec 006) |
| T6 | C7 | `curl -sI https://gomesbeduardo.github.io/curriculo/curriculo-eduardo-gomes-pt.pdf`: 200 e `application/pdf`; o mesmo para `-en.pdf` |

## Fora do escopo

- Mudar qualquer coisa no site: esta spec registra o que existe.
- Os detalhes de cada spec derivada, que ficam nelas.

## Perguntas abertas

Nenhuma. O redirecionamento pela língua do navegador e a escolha de língua salva, decididos em 09/11 e não implementados no v1, ficaram fora por ora (responsável, 11/11/2026); se voltarem, viram spec própria. As outras perguntas abertas do grilling de 09/11 foram fechadas no caminho: paleta (P1 Ocre, 11/11), tipografia (Funnel Display, Funnel Sans e Reddit Mono, `docs/design/stack-fontes.md`), textos do topo (no site), o que o protótipo aprovou (`docs/design/feedback-prototipo.md`), citação do Zen of Python (no rodapé) e o cron semanal vivo (spec 002, P1).
