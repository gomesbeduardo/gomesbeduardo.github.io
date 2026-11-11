# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro estático no GitHub Pages, com deploy pelo GitHub Actions. Endereço `https://gomesbeduardo.github.io`, sem domínio próprio por enquanto. Animação com GSAP (ScrollTrigger) e Lenis; transição entre páginas com View Transitions nativas entre documentos.

## Users

Recrutador ou tech lead avaliando a contratação de um desenvolvedor. Chega pelo LinkedIn, pelo README do GitHub ou pelo currículo, olha a página inicial por pouco tempo, abre um projeto e decide se chama para conversa.

## Product Purpose

Portfólio pessoal de Eduardo Bergoli Gomes, desenvolvedor full stack. Mostra quem ele é, como trabalha e o que já entregou, em PT e EN. Sucesso é qualquer ação que traga a pessoa até ele: contato pelo LinkedIn ou e-mail, ou o currículo baixado.

## Positioning

Processo e resultado juntos. Ele trabalha com spec antes do código, TDD, PR revisado com CI e avaliação com conjunto reservado em recursos com IA, e isso aparece em sistemas rodando: LMS em validação com colaboradores na CentralEng, leadgate com 570 testes, 1º lugar no Ideathon de SI da AMF, campeão do Coderace 2026.

## Operating Context

O visitante lê em desktop no horário de trabalho ou no celular entre uma coisa e outra. Compara com outros candidatos, então os fatos precisam aparecer sem esforço. Os números do GitHub são coletados no build pelo Actions, com a data da coleta visível.

## Capabilities and Constraints

- Seções: Sobre (com o processo de trabalho), Experiência e formação, Stack, Projetos, Números do GitHub, Contato, currículo para baixar.
- Projetos: só leadgate e InfoHub InovAMF, nessa ordem. Card com print, uma frase, números e stack, que abre página própria do projeto (problema, o que fez, resultados, galeria).
- PT em `/` e EN em `/en/`, escolhido pelo idioma do navegador; troca manual discreta no topo direito, salva.
- Tema claro e escuro pelo sistema, com botão para trocar. Desde 10/11 o fundo muda de tom entre seções durante a rolagem, dentro da paleta P1 Ocre (modo em teste na prancha `prototipo/lab/fundo.html`), com grão leve e brilho suave atrás do nome.
- Contato: LinkedIn, GitHub e e-mail visível com botão de copiar. Sem formulário.
- Movimento pedido pelo responsável: rolagem suave curta, revelação na rolagem, parallax, cards que inclinam, botões magnéticos, faixa da stack, barra de progresso, digitação com erro no título do hero, contadores e transição em círculo até a página do projeto. Nada lento a ponto de atrapalhar o uso.
- Fora: cores fora da paleta P1 Ocre com um destaque, manchas de cor que se movem, intro lenta, cursor próprio, seção horizontal presa na rolagem, scramble de texto, formulário de contato, widget de terceiro.

## Brand Commitments

- Voz: fatos, números e o que roda onde. Sem frase de efeito, slogan, contraste retórico nem travessão.
- Paleta P1 Ocre, escolhida em 11/11/2026 na prancha `prototipo/lab/paletas.html`: preto terroso com destaque açafrão no escuro, areia com destaque ocre no claro, um destaque só. Tokens e contraste em `docs/design/paletas-pesquisa.md`. Substitui o grafite dos cinzas do GitHub.
- Referência de estrutura e de acabamento: `danmachado3105.github.io`. Em 09/11 o responsável escolheu seguir essa linha de portfólio (nome grande, foto, seções empilhadas, movimento de rolagem), mais bem trabalhada, em vez de uma metáfora visual própria. Não copiar dela fontes (Bricolage Grotesque, DM Sans, DM Mono) nem paleta (`#100d0b`, `#ff6b3d`). Em 10/11 ele pediu os efeitos dela sem exagerar nas cores: fundo que muda entre seções, grão, brilho atrás do nome, cards de vidro, texto que acende na rolagem, foto com selo, carrossel de projetos.
- Foto: a do avatar do GitHub (460 px), no topo, à direita do nome, em moldura 4:5 com cantos `var(--r-md)`, borda `var(--line-strong)` e bloco de destaque deslocado atrás (spec 004, 11/11).
- Citação possível no rodapé, a decidir: "In the face of ambiguity, refuse the temptation to guess." (Tim Peters, The Zen of Python).

## Evidence on Hand

- leadgate: repo público `gomesbeduardo/leadgate`, triagem de leads com IA, 570 testes (conferir no merge), prévia social em imagem.
- InfoHub InovAMF: repo público `gomesbeduardo/infohub-inovamf`, prints de landing, login e 3 painéis.
- Experiência: CentralEng (Full Stack e Analista de TI, LMS em validação com colaboradores, sistema de PMOC), estágio na Asten AVMB (time de Inovação), Sistemas de Informação na AMF, YourMentor (co-founder desde jun/2026), JET (passado).
- Não há depoimentos, clientes nem métricas de negócio. Não inventar.

## Product Principles

1. O fato vem antes do efeito: todo número e todo resultado aparece sem depender de animação.
2. Cada projeto se prova pelo que roda e pelo processo que o produziu.
3. Movimento rápido e com propósito; quem prefere menos movimento recebe a página inteira parada.
4. Um caminho curto até o contato ou o currículo, de qualquer ponto da página.

## Accessibility & Inclusion

`prefers-reduced-motion` desliga todas as animações e a faixa da stack vira lista parada. Texto animado tem a versão final no DOM para leitor de tela. Nenhum efeito remove o foco visível; Tab e Shift+Tab funcionam com a rolagem suave.
