# Spec 006: e-mail que copia com aviso e rodapé completo

Estado: aprovada pelo responsável em 11/11/2026, com a P1 respondida pela recomendação (manter C9 e C13).

## Pedido literal

> E para o email no footer, apenas a escrita de email, que ao clicar copia e avisa ao usuário com um popup bonito e animado. Ele por extenso fica muito grande e feio. Preencha o footer com outras informações também, que é normal de se encontrar em sites e portfólios.

## Problema

A seção Contato mostra o endereço `eduardobgomes100@gmail.com` por extenso, na fonte de display em até 3rem, ao lado de um botão "Copiar e-mail". No celular o endereço quebra no meio. O rodapé tem só a frase do Zen of Python, o botão "Feito com o Claude Code", a linha da spec e o nome.

## Fatos

- F1. A seção Contato (`site/index.html` e `site/en/index.html`, `#contato`) tem `.mail-row` (o endereço em `a.mail` e o botão `#copy-email`), a linha "Santa Maria, RS" e a lista `.links` (LinkedIn, GitHub, Baixar currículo).
- F2. O botão `#copy-email` (`site/main.js`, perto da linha 198) chama `navigator.clipboard.writeText` e sempre troca o texto para "Copiado", mesmo quando a cópia falha (recomendação baixa pendente do PR #1).
- F3. O site é HTML, CSS e JavaScript sem framework, com GSAP e Lenis em `site/vendor/`, fontes Funnel Display, Funnel Sans e Reddit Mono, publicado no GitHub Pages a partir de um repositório público.
- F4. As páginas de projeto têm um rodapé só com "Voltar aos projetos".

## Decisões do responsável (11/11/2026)

- D1. No Contato, o endereço por extenso sai. Entra um item "E-mail" ("Email" no EN) na lista `.links`, com a mesma fonte e o mesmo tamanho de LinkedIn e GitHub. O botão "Copiar e-mail" separado sai.
- D2. Clicar em "E-mail" copia o endereço e mostra um aviso animado.
- D3. Se a cópia falhar, o aviso mostra o endereço para copiar à mão e um link para abrir no app de e-mail.
- D4. O rodapé ganha navegação, redes, a linha final com ano e local, "Voltar ao topo" e outras informações comuns em portfólios.

## Comportamento

### Item "E-mail" no Contato

- C1. A lista `.links` fica: E-mail, LinkedIn, GitHub, Baixar currículo. O item E-mail é um `<button>` com o mesmo visual dos links, o rótulo "E-mail" e um ícone de copiar no lugar da seta. O nome acessível é "Copiar e-mail" ("Copy email").
- C2. A linha "Santa Maria, RS" continua acima da lista.

### Aviso de cópia

- C3. Ao copiar, aparece um aviso no centro, embaixo da tela, acima da área segura do celular (`env(safe-area-inset-bottom)`): pílula com fundo `--raised`, borda `--line-strong`, sombra `--shadow`, um ícone de confirmação em `--accent`, o texto "E-mail copiado" ("Email copied") e, abaixo, o endereço em `--f-mono` no tamanho `--t-data`.
- C4. Entrada: sobe 16 px e aparece (opacidade de 0 a 1) com um leve aumento de escala, de 0,96 a 1, em cerca de 300 ms com a curva `--ease`. O ícone faz um traço de confirmação logo depois. Saída: desce e some em cerca de 200 ms. O aviso fica 2,5 s na tela; clicar de novo reinicia o tempo, sem empilhar avisos.
- C5. O aviso é anunciado ao leitor de tela (`role="status"`, `aria-live="polite"`) e não tira o foco do item E-mail.
- C6. Com movimento reduzido, o aviso só aparece e some por esmaecer, sem deslocamento nem escala.
- C7. Falha na cópia (sem `navigator.clipboard` ou com a promessa rejeitada): o aviso diz "Não deu para copiar. Copie à mão:" ("Couldn't copy. Copy it by hand:"), mostra o endereço em texto selecionável, um link "Abrir no app de e-mail" ("Open in your email app", `mailto:`) e um botão de fechar. Ele não some sozinho; o foco vai para o link; Esc ou o botão fecham e devolvem o foco ao item E-mail.

### Rodapé (página inicial, PT e EN)

- C8. Em telas largas, o rodapé usa a grade de 12 colunas:
  - colunas 1 a 6: a frase do Zen of Python, o autor, o botão "Feito com o Claude Code" e a linha da spec, como hoje;
  - colunas 8 a 9: "Navegação" ("Navigation"), com Sobre, Trajetória, Experiência, Projetos, Números e Contato, as mesmas âncoras do cabeçalho;
  - colunas 10 a 12: "Contato" ("Contact"), com E-mail (copia, com o mesmo aviso), LinkedIn, GitHub e Baixar currículo.
- C9. Abaixo, uma linha sobre o site ("Sobre este site" / "About this site"): "Escrito em HTML, CSS e JavaScript, sem framework, com GSAP e Lenis. Fontes Funnel Display, Funnel Sans e Reddit Mono. Publicado no GitHub Pages." e o link "Código do site" ("Site source") para o repositório público.
- C10. Linha final, separada por um filete `--line`: à esquerda "© 2026 Eduardo Bergoli Gomes · Santa Maria, RS" ("Santa Maria, Brazil" no EN), com o ano preenchido pelo JavaScript e "2026" no HTML como reserva; no meio o seletor PT · EN; à direita "Voltar ao topo ↑" ("Back to top ↑"), que sobe com a mesma rolagem suave do cabeçalho e leva o foco ao início da página. A linha "Eduardo Bergoli Gomes." que existe hoje sai.
- C11. Títulos das colunas em `--f-mono`, no estilo do `.sec-label`; links no tamanho `--t-small`, cor `--muted`, e `--fg` no hover, com o mesmo sublinhado do site.
- C12. No celular (até 860 px), tudo empilha: frase e botão do Claude Code, depois Navegação e Contato lado a lado em duas colunas, depois a linha sobre o site e a linha final, que quebra em duas. Todos os alvos de toque têm 44 px.

### Páginas de projeto

- C13. As páginas de projeto ganham só a linha final (C10), abaixo do "Voltar aos projetos". O "Voltar ao topo" sobe na própria página de projeto.

## Critérios de aceite

- A1. Dado o Contato em PT e EN, então não há `a.mail`, `#copy-email` nem o endereço por extenso visível; a lista `.links` começa com o botão "E-mail"/"Email" e o nome acessível é "Copiar e-mail"/"Copy email" (teste estático).
- A2. Dado um clique em E-mail com a área de transferência disponível, então o texto copiado é exatamente `eduardobgomes100@gmail.com`, o aviso aparece com "E-mail copiado" e o endereço, some em cerca de 2,5 s e o foco continua no item (Playwright, com permissão de área de transferência).
- A3. Dado `navigator.clipboard.writeText` rejeitando, quando se clica em E-mail, então o aviso de falha aparece, não some sozinho, o foco vai para "Abrir no app de e-mail", e Esc fecha e devolve o foco ao item (Playwright).
- A4. Dado `prefers-reduced-motion: reduce`, então o aviso não usa `transform` na entrada nem na saída (Playwright).
- A5. Dado o rodapé em PT e EN, então existem as colunas Navegação e Contato com os itens de C8, a linha sobre o site com o link do repositório, e a linha final com "©", o local, o seletor PT · EN e "Voltar ao topo" (teste estático).
- A6. Dado "Voltar ao topo", quando se clica, então a página vai ao topo e o foco fica no início do conteúdo (Playwright).
- A7. Dado o site em 320, 390 e 1280 px, nos dois temas, então nada passa da largura da tela, o rodapé segue C8 e C12, e os alvos de toque do rodapé e do Contato medem pelo menos 44 px no celular (Playwright e print).
- A8. Dadas as três páginas de projeto em PT e EN, então a linha final aparece abaixo de "Voltar aos projetos" (teste estático).

## Fora do escopo

- Mudar o modal do Claude Code, a frase do Zen of Python ou a surpresa c6.
- Status de disponibilidade ("aberto a vagas"), que o responsável não escolheu.
- Data de "última atualização", que exigiria um passo de build.

## Perguntas abertas

Nenhuma. A P1 (linha sobre o site e linha final nas páginas de projeto) foi aprovada com a spec, como recomendado.
