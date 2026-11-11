# Spec 004: currículo completo no site, no PDF e no README

Estado: aprovada pelo responsável em 11/11/2026, com a moldura da foto e o rodapé.

## Pedido literal

> use esse currículo como base, tem detalhes que ficaram de fora.
>
> Em tudo, mas não cite [a empresa da vaga] nem nada, apenas some experiência e afins onde for possível.
>
> Pôr cidade, sem telefone.
>
> E não deixe a imagem apenas no círculo, preencha a parte direita com alguma moldura legal.
>
> E no rodapé, avise que a página foi feita pelo claude, descrevendo nosso fluxo, skills e afins. Mostre que usei IA e que sei usar da forma ideal e correta.
>
> Coloca logo do claude e um ícone que faça alguém clicar, aí abre um modal ou algo que possa ser lido. E não descreva apenas passo a passo, descreva a teoria e metodologia por trás, SDD e TDD, mais a minha análise de perfil de uso de IA. Tu tem total liberdade nessa, faça como quiser.

## Problema

O currículo que o responsável mandou como base (versão de 11/2026, escrita para uma vaga e guardada fora do repositório) tem fatos que o site, o `src/data/curriculo.json` e o README não têm. Faltam o ToPark, o 2º lugar no Ideathon 2026, a promoção na CentralEng, a integração RPA na Asten, os detalhes do JET, o voluntariado, as certificações e parte da stack. Em três pontos as datas e os números discordam do site. O recrutador que compara o PDF com o LinkedIn encontra versões diferentes.

## Fatos

- F1. Fonte: o PDF que o responsável mandou, lido em 11/11/2026. A spec não cita a empresa da vaga, e nenhum arquivo versionado vai citar.
- F2. Os textos do currículo vivem em `src/data/curriculo.json` (spec 003, R1). Os PDFs publicados pela v1 ficam em `site/curriculo/`, copiados do que o `scripts/curriculo/gerar.mjs` grava em `public/curriculo/`.
- F3. Os textos do site estão escritos à mão em `site/index.html` (PT) e `site/en/index.html` (EN), nas seções Sobre, Trajetória, Experiência e formação, e Stack, e na linha abaixo dos botões do topo da página.
- F4. A spec 003, R2, proíbe cidade e estado em qualquer texto do currículo. O teste `verificarPrivacidade` reprova os dois. O responsável decidiu em 11/11/2026 pôr a cidade e manter o telefone fora.

## Decisões já tomadas

- D1. As mudanças entram no JSON e nos PDFs do currículo, no site em PT e EN e no README.
- D2. Nenhum texto cita a vaga nem a empresa para a qual o PDF base foi escrito. A frase sobre disponibilidade para mudança de cidade fica fora. A spec 003 cita essa empresa na seção Problema, e essa citação sai na mesma entrega.
- D3. A cidade entra como "Santa Maria, RS" (em inglês, "Santa Maria, Brazil"). O telefone continua proibido.
- D4. A foto que o responsável mandou em 11/11/2026 (a mesma do avatar do GitHub, que tem 460 px; o LinkedIn exige login) entra no site, no lugar do círculo "EG" do topo da página (moldura já prevista no `PRODUCT.md`), e no PDF do currículo, no cabeçalho. Isso altera a spec 003, R4, que pedia "sem imagem". O texto do PDF continua selecionável e legível por ATS: a foto não substitui nenhum texto.
- D5. A moldura da foto e o rodapé entram nesta mesma entrega (responsável, 11/11/2026).

## Mudança na geração do PDF (altera a spec 003, R4)

O HTML de cada idioma ganha a foto no cabeçalho, circular, com cerca de 28 mm, e `alt` com o nome. O arquivo da foto fica versionado em `site/img/eduardo-gomes.jpg`, com 460 px de lado (o tamanho do avatar), e o site e o gerador usam o mesmo arquivo. O PDF continua com 1 ou 2 páginas, e o teste de ATS (spec 003, R6) continua valendo.

## Mudança na regra de privacidade (altera a spec 003, R2)

R2 passa a permitir um único local, o valor de `comum.local` no JSON, exatamente "Santa Maria, RS" (e "Santa Maria, Brazil" no EN). Qualquer outra cidade ou estado continua reprovando. Telefone, CPF, RG, CEP, endereço, data de nascimento, salário e estado civil continuam proibidos. A lista local `docs/privado/privacidade-local.json` continua valendo para as outras cidades. Quem mantém esse arquivo precisa tirar "Santa Maria" dele, ou a verificação vai reprovar o próprio `comum.local`.

## Correção: o LMS está em validação

O LMS da CentralEng está em validação com colaboradores e não está em produção (responsável, 11/11/2026). O texto não dá número de colaboradores. Todo texto que diz "20 colaboradores", "em produção", "roda na CentralEng" ou "usado por" sobre o LMS passa a dizer que ele está em validação com colaboradores ("in validation with employees" no EN), sem número. Isso vale para o JSON, o site (`site/index.html`, `site/en/index.html`, `site/projeto-lms.html`, `site/en/projeto-lms.html`, inclusive a meta description e a tabela de Stack), o README e o `PRODUCT.md`. O painel da Asten continua "em produção".

## O que entra

| Item | JSON e PDF | Site (PT e EN) | README |
|---|---|---|---|
| Foto | cabeçalho do PDF | topo da página, no lugar do "EG" | não |
| Cidade "Santa Maria, RS" | `comum.local` | linha do topo da página, no lugar de "Brasil"; Contato | não |
| Título "Desenvolvedor full stack, IA aplicada e automação" | `titulo` | subtítulo do topo e `<title>` | primeira frase |
| CentralEng, desenvolvedor full stack e analista de TI, de mai/2026 até hoje, sob demanda | Experiência, com "sob demanda" na data | Experiência e Trajetória; o Sobre diz que segue atendendo a CentralEng sob demanda; a linha do topo troca "Full stack na CentralEng" por "Estágio na Asten AVMB" | não |
| CentralEng: LMS feito sozinho, da arquitetura aos testes, com PRD (20 requisitos), ADRs e backlog de 36 itens, em validação com colaboradores; levantamento e modelagem do PMOC; CI com lint e build a cada push | Experiência | Experiência | não |
| Promoção de auxiliar administrativo a desenvolvedor em 7 meses, depois de automatizar rotinas do setor | Experiência (auxiliar) | Trajetória | não |
| Asten: dash-asten com KPIs por situação, SLA vencido e chamados abertos há 60 dias ou mais, exibido em TV; desenvolvimento por specs com agentes de IA e aprovação humana antes do merge; PRD com mais de 100 decisões | Experiência | Experiência | não |
| Integração RPA: recebe dados em JSON de um sistema externo e envia notificações por WhatsApp e e-mail, com scripts de validação em Python (RestrictedPython, em sandbox). Sem citar a Asten, o cliente nem o setor | Stack, grupo "Automação e integrações" | tabela de Stack, linha de Python, com "integração RPA" na coluna de onde usei | não |
| YourMentor: back-end em Python, FastAPI e PostgreSQL; arquitetura, modelo de dados e monetização | Experiência | Trajetória | não |
| ToPark, fundador, abr/2024 a out/2025: startup de reserva antecipada de vagas de estacionamento, selecionada para a primeira turma da incubadora InovAMF; back-end em Python, modelo de negócio e captação de estacionamentos parceiros | Projetos | Trajetória | não |
| JET até out/2026: Python, HTML, CSS, Arduino e uso responsável de IA para mais de 100 alunos de 4 escolas públicas; 2 escolas a mais depois do primeiro semestre, por indicação da coordenação; workshop de 80 minutos sobre IA para professores da AMF | Experiência | Trajetória | não |
| 2º lugar no Ideathon de SI da AMF, 2026, sem mês nem equipe | Prêmios | Trajetória | lista de destaques |
| Voluntariado: vice-presidente do Diretório Acadêmico de SI (secretário desde mar/2025); assistente financeiro da organização do Code Race 2026, desde mar/2026, só nas finanças e sem papel na avaliação das equipes; comissão organizadora do IX Code Race (28 h, 2025) e da Semana Acadêmica de SI (40 h, 2025) | seção nova `voluntariado` | Trajetória, os 4 itens (passa de 9 para 13 marcos) | não |
| Certificações: Fundamentos de Python, O Básico de Git e GitHub e NLW Pocket JavaScript (Rocketseat); Cria Summit 2025 (8 h) | seção nova `certificacoes` | não | não |
| Stack: Python, FastAPI, Vite, shadcn/ui, Recharts, Vercel Functions, Neon, SheetJS, Portainer, GitLab, Codex | Stack | faixa e tabela de Stack | não |

O "6º semestre" fica fora; a formação mantém a previsão de conclusão em dez/2028.

## Moldura da foto (tela)

- A foto deixa o círculo de 120 a 160 px e ocupa a parte direita do topo da página, a partir de 861 px de largura: colunas 9 a 12 da grade, alinhada ao topo do nome, proporção 4:5, cantos `var(--r-md)` e borda de 1 px em `var(--line-strong)`, a mesma dos prints dos projetos.
- Atrás da foto, um bloco do mesmo tamanho e raio, na cor `var(--accent)`, deslocado 12 px para a direita e 12 px para baixo. Nos dois temas o bloco usa o token, sem cor literal.
- Com o mouse sobre a foto, o conjunto inclina até 2°, com o mesmo efeito dos cards de projeto. Com `prefers-reduced-motion: reduce`, não inclina.
- Até 860 px, a foto fica acima do nome, com 160 px de largura, e o bloco desloca 8 px.
- O recorte 4:5 sai da foto quadrada de 460 px com `object-fit: cover` e `object-position` no rosto. A foto continua dentro do `#sp-foto`, e os 5 cliques seguidos abrem a curiosidade como hoje. O `alt` é "Eduardo Gomes".

## Rodapé: feito com o Claude (tela)

- No rodapé, abaixo da citação, entra um botão com o logo do Claude, o texto "Feito com o Claude Code" e um ícone de abrir. O botão usa as classes de botão e os tokens que o site já tem. Um ponto na cor de destaque pulsa ao lado do ícone, devagar, e para com `prefers-reduced-motion: reduce`.
- O logo: antes de implementar, o `researcher` confere na página de marca da Anthropic se um site pessoal pode usar o logo do Claude numa menção "feito com". Se puder, entra o arquivo oficial em SVG. Se não puder, ou se a regra não for clara, entra só a palavra "Claude" em texto, sem desenho que imite a marca.
- O clique abre um `<dialog>` modal (`showModal()`): Esc e o botão de fechar fecham; o foco começa no título e volta ao botão do rodapé ao fechar; a rolagem da página fica parada enquanto ele está aberto; o conteúdo rola dentro dele, com `overscroll-behavior: contain`. Em 390 px ele ocupa a tela com 16 px de margem.
- O texto em PT está abaixo. O EN é tradução fiel, com as mesmas regras de escrita (spec 003, R3). O modal termina com um link para o repositório no GitHub.

### Texto do modal (PT)

**Como este site foi feito**

Eu decidi o que o site mostra e aprovei cada mudança. O Claude Code, da Anthropic, escreveu a maior parte do código, das specs e dos testes, dentro de um fluxo que montei para trabalhar com agentes de IA. As specs, os PRs e as revisões estão públicos no repositório.

**Spec antes do código (SDD)**

No desenvolvimento guiado por especificação, a spec é o contrato. Antes de qualquer linha de código, uma spec curta fixa o pedido literal, o problema, os critérios de aceite em Given/When/Then e o que fica fora. O agente que implementa trabalha contra esse contrato, e o revisor confere a entrega contra ele. Se a spec muda no caminho, eu aprovo de novo. Na spec 004 deste site, respondi 18 perguntas, uma decisão por vez, antes de o primeiro arquivo mudar.

**Teste antes da implementação (TDD)**

No TDD, o teste vem primeiro e precisa falhar pelo motivo certo. Só depois entra o código que o faz passar. Com agentes, isso resolve um problema específico: um modelo consegue escrever um teste que passa sem provar nada. Ver o teste falhar antes da correção mostra que ele mede o comportamento pedido. Um exemplo daqui: o cabeçalho cortava o botão de tema no topo da página porque duas regras de CSS usavam a mesma classe. O teste que impede essa colisão falhou antes da correção e passou depois.

**Um agente, uma função**

Cada agente faz uma coisa. Uma sessão principal coordena e decide. Agentes menores leem o código, escrevem o código com TDD ou pesquisam documentação externa. Quem escreve o código não revisa o próprio trabalho. O modelo mais capaz, e mais caro, entra só em regra de negócio, cálculo, dado ou área sensível.

**Revisão e aprovação**

Cada entrega passa por no máximo duas revisões de agente. Cada achado chega com o cenário de falha e a prova no código. Achado crítico, alto ou médio é corrigido com um teste novo. O merge na branch principal espera a minha aprovação.

**Travas**

Hooks do Claude Code bloqueiam o que um agente não deve fazer sozinho: push direto na branch principal, PR sem as seções e o veredito da revisão, merge sem a minha aprovação e servidor local sem tempo limite. Quando uma trava nega, o agente ajusta o pedido e segue a regra. Neste site, a trava negou o push da branch principal, e eu mesmo publiquei.

**Meu perfil de uso de IA**

O Claude analisou a minha configuração e o histórico deste repositório. Esta é a leitura dele:

- Eduardo usa a IA como uma equipe com papéis e regras escritas. As regras ficam em arquivos de instrução e em skills, e valem para toda sessão.
- Ele guarda para si as decisões de produto e de regra de negócio. Quando falta informação, o agente pergunta com um exemplo concreto e uma recomendação.
- Ele mede o custo. Uma skill compara o gasto de tokens de cada semana com uma linha de base, e cada sessão tem um teto de contexto antes de passar o trabalho adiante.
- Ele revisa o texto. Tudo o que alguém vai ler passa por uma checagem de padrões de escrita de IA, como frase de efeito e travessão.
- O método custa tempo: uma mudança de comportamento passa por spec, teste e revisão antes do merge. Correção de texto e ajuste pequeno seguem só com critérios de aceite.

[Ver as specs e os PRs no GitHub](https://github.com/gomesbeduardo/gomesbeduardo.github.io)

## Critérios de aceite

- C1. Dado o `curriculo.json` atualizado, quando os testes rodam, então `pt` e `en` têm as mesmas chaves e o mesmo número de itens, inclusive em `voluntariado` e `certificacoes` (teste unitário).
- C2. Dado "Santa Maria, RS" como `comum.local`, quando `verificarPrivacidade` roda, então devolve `[]`. Dado "Porto Alegre, RS" ou "+55 (55) 91234-5678", então devolve ao menos uma ocorrência (teste unitário).
- C3. Dado o repositório depois da entrega, quando se procura o nome da empresa da vaga em todos os arquivos versionados, então não há ocorrência; e "Florianópolis" não aparece no JSON, em `site/` nem no README (teste unitário sobre o JSON; `git grep` manual no resto, porque a spec 003 usa "Florianópolis" como exemplo de teste).
- C4. Dado o JSON, o site e o README, quando se procura "Asten" ou "operadora" junto de "RPA", "WhatsApp" ou "guias", então não há ocorrência (teste unitário sobre o JSON; `grep` manual no resto).
- C5. Dado o JSON, o site, o README e o `PRODUCT.md`, quando se procura "20 colaboradores", "20 employees" e frases que digam que o LMS está em produção, então não há ocorrência, nenhum número de colaboradores aparece junto do LMS, e "validação" ou "validation" aparece (teste unitário sobre o JSON; `grep` manual no resto).
- C6. Dado o Chrome instalado, quando `gerar.mjs` roda, então cada PDF tem 1 ou 2 páginas, traz a foto e o texto extraído contém "ToPark", "Ideathon" com "2026" e "Santa Maria" (teste de integração). Os PDFs gerados são copiados para `site/curriculo/`.
- C7. Dado o site servido localmente em 390 px e 1280 px, nos temas claro e escuro, quando se abre `/` e `/en/`, então a foto aparece no lugar do "EG", com `alt` "Eduardo Gomes" e sem distorção; Trajetória, Experiência e Stack mostram os itens da tabela acima; e nada passa da largura da tela (conferência visual com print e medida do Playwright).
- C8. Dado o README, quando se lê, então a lista de destaques traz o 2º lugar no Ideathon 2026, o LMS aparece em validação e nenhuma frase cita a vaga (leitura).
- C10. Dado o site em 1280 px, quando se abre `/` no topo, então a foto começa depois da metade da largura útil, o bloco de destaque aparece deslocado atrás dela, e nada passa da largura da tela; em 390 px, a foto tem 160 px e fica acima do nome (medida do Playwright e print nos dois temas).
- C11. Dado o rodapé em `/` e `/en/`, quando se clica no botão do Claude, então o `<dialog>` abre com o título focado; Esc fecha e o foco volta ao botão; Tab não sai do modal; o texto da spec está lá, em PT ou EN conforme a página (teste com o Playwright, roteiro manual registrado no PR).
- C12. Dado `prefers-reduced-motion: reduce`, quando se abre a página, então a foto não inclina e o ponto do rodapé não pulsa (medida do Playwright).
- C13. Dado o texto do modal nas duas línguas, quando `verificarEstilo` (spec 003, R3) roda sobre ele, então devolve `[]` (teste unitário que lê o HTML).
- C9. `node --test 'scripts/**/*.test.mjs'` passa inteiro.

## Fora do escopo

- Página de projeto para o ToPark ou para o YourMentor.
- Telefone, data de nascimento e qualquer dado de contato além de e-mail, LinkedIn, GitHub, site e cidade.
- Mudança de layout ou de design do site, além da moldura da foto e do botão e do modal no rodapé.
- A migração para Astro (spec 001).

## Respostas do responsável (11/11/2026)

- CentralEng: continua, em meio período e sob demanda.
- JET: termina em out/2026.
- LMS: em validação com colaboradores, sem número e sem "produção" (a resposta "30" foi trocada por esta na aprovação).
- Título: "Desenvolvedor full stack, IA aplicada e automação".
- Ideathon 2026: só o ano.
- Code Race 2026: o mesmo evento; ele ficou só nas finanças da organização, sem interferir no resultado.
- Integração RPA: entra sem nada que remeta à Asten ou ao cliente.
- ToPark: primeira turma da incubadora InovAMF.
- "6º semestre": fora.
- Voluntariado: os 4 itens entram na Trajetória.
- Foto: a do avatar do GitHub, a mesma da conversa, porque o LinkedIn exige login.

## Suposições

- S1. "Sem papel na avaliação das equipes" descreve a frase do responsável "fiquei só no financeiro, então não interfere no resultado". Se a frase não puder aparecer assim, o voluntariado diz só "assistente financeiro da organização".
- S2. A integração RPA entra na Stack, e não na experiência da Asten, porque citar o cargo já remeteria à empresa.
