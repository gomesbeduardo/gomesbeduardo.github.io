# Textos novos do portfólio (rascunho para aprovação, 10/11/2026)

Fonte dos fatos: `src/data/curriculo.json`, `PRODUCT.md` e os textos já aprovados em `docs/design/feedback-prototipo.md`. Nada aqui entra no protótipo antes da aprovação do responsável. Onde falta fato, a pergunta está marcada com **P**.

## 1. Sobre

Decisão de 11/11: sem frase de efeito; o Sobre é uma história breve, o que ele faz hoje e uma parte pessoal. O primeiro parágrafo é o que acende palavra por palavra na rolagem.

1. Comecei a programar em 2018 com o CS50, o curso de introdução à computação de Harvard, escrevendo um hello, world em C. Na pandemia passei a abrir o código de mods de Minecraft para mudar e ver o resultado no jogo. Em 2024 entrei em Sistemas de Informação na AMF, com formatura prevista para dez/2028.
2. Hoje sou desenvolvedor na CentralEng, empresa de engenharia de climatização. Fiz o LMS de treinamento técnico que 20 colaboradores usam, lidero o sistema de gestão de PMOC e integro os sistemas internos. Desde outubro faço estágio no time de Inovação da Asten AVMB, onde o painel de chamados que desenvolvi é usado nas reuniões da direção.
3. Fora do código, gosto de automobilismo em geral, e a Fórmula 1 é a que mais acompanho. Quero continuar me desenvolvendo e ver até onde a curiosidade me leva.

## 2. Stack principal em tabela

As demais tecnologias ficam só nas fileiras de logos. Colunas: número, tecnologia, onde usei, como, etiqueta.

| # | Tecnologia | Onde usei | Como | Etiqueta |
|---|---|---|---|---|
| 01 | TypeScript | leadgate, LMS, InfoHub, painel da Asten | Linguagem dos quatro projetos, no front e no back. | todo dia |
| 02 | React e Next.js | LMS, InfoHub (Next.js); painel da Asten (React com Vite) | Telas de curso, progresso e certificado em PDF no LMS; painéis de indicadores na Asten. | em produção |
| 03 | Node.js | leadgate | Serviço que conversa com o cliente e só segue quando a resposta do modelo passa na validação. | projeto |
| 04 | PostgreSQL e Prisma | LMS, InfoHub, painel da Asten | Progresso e avaliações por colaborador no LMS; cargas mensais com versão na Asten. | em produção |
| 05 | Zod | leadgate | Confere cada resposta do modelo, junto com regras fixas, antes de mandar o JSON para vendas. | projeto |
| 06 | Vitest e Playwright | painel da Asten | Testes de unidade e de ponta a ponta. | todo dia |
| 07 | Docker | leadgate, LMS | Ambiente igual na máquina e no servidor. | em produção |
| 08 | GitHub Actions | leadgate | Testes, checagem de tipos e build em cada PR. | todo dia |

Respostas de 11/11 (conferidas no repo `gomesbeduardo/leadgate`: `"test": "vitest run"`; README, seção Arquitetura):

- Linha 06 passa a ser "leadgate, painel da Asten": cerca de 570 testes em Vitest no leadgate; unidade e ponta a ponta com Vitest e Playwright na Asten.
- Nova linha 09, n8n, leadgate: orquestra o fluxo, recebe a mensagem por webhook e chama o serviço Node que prepara o prompt e valida a resposta. Etiqueta: projeto.
- Nova linha 10, Claude, leadgate: o modelo que conversa com o cliente; o código confere cada resposta e pede nova geração até 2 vezes quando ela reprova. Etiqueta: projeto. As demais IAs ficam só nas fileiras de logos.

## 3. Projetos (carrossel)

- Decisão de 11/11: o LMS de treinamento técnico entra como terceiro card, com página própria (repo `gomesbeduardo/plataforma-LMS-corp`).

Textos dos cards:

- leadgate: "Triagem de leads com IA para uma empresa de climatização. Conversa com o cliente até ter os dados de que vendas precisa e entrega um JSON validado." Números: 570 testes, 6 de 6 no conjunto reservado, 9 de 9 na regressão.
- InfoHub InovAMF: "A jornada do empreendedor do InfoHub, da AMF, até o InovAMF. Projeto da disciplina de Arquitetura de Sistemas, feito em dupla."
- LMS (se entrar): "Plataforma de cursos com progresso por colaborador, avaliações e certificado em PDF. A versão privada roda na CentralEng com 20 colaboradores."

## 4. Página de cada projeto

Seções: Problema, O que fiz, Resultado. Para o leadgate, com o que já está no currículo:

- Problema: o atendimento de uma empresa de climatização recebe leads pelo chat e vendas precisa de dados completos e no mesmo formato.
- O que fiz: um assistente que conversa com o cliente, pergunta o que falta e só fecha quando tem tudo. O código confere cada resposta do modelo com Zod e regras fixas antes de seguir.
- Resultado: protótipo em fase de teste, com a CentralEng como piloto fictício; 570 testes automatizados e um conjunto de avaliação reservado, rodado uma vez.

- **P6.** Para o InfoHub, o que você fez na dupla e o que o sistema entrega (as telas de login e os 3 painéis)? Com isso escrevo as três seções.

## 5. Selo da foto

Texto que gira em volta da foto. Opções:

- A: "aberto a conversar · desenvolvedor ·"
- B: "TypeScript · React · Node.js ·"
- C: "Eduardo Gomes · desenvolvedor ·"

- **P7.** Qual opção, ou outro texto?
